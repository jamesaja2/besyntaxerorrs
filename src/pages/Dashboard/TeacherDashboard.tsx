import { FormEvent, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDocuments, uploadDocument, deleteDocument, downloadDocumentFile } from '@/api/documents';
import { fetchSchedules } from '@/api/schedules';
import { fetchClasses } from '@/api/classes';
import type { DocumentRecord, ScheduleItem, SchoolClassRecord } from '@/types/api';
import { useAuth, withAuth } from '@/contexts/AuthContext';
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Loader2,
  CalendarRange,
  Check,
  Link2
} from 'lucide-react';

function formatTimeRange(start: string, end: string) {
  const startTime = new Date(start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(end).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return `${startTime} - ${endTime}`;
}

function TeacherDashboard() {
  const { user } = useAuth();
  const teacherId = user?.id;
  const queryClient = useQueryClient();
  const createInitialDocumentFormState = () => ({
    title: '',
    issuedFor: '',
    description: '',
    audienceClassIds: [] as string[],
    generateShareLink: false,
    shareLinkExpiresAt: '',
    shareLinkMaxDownloads: ''
  });

  const [documentForm, setDocumentForm] = useState(createInitialDocumentFormState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentMessage, setDocumentMessage] = useState<string | null>(null);
  const [copiedShareTokenId, setCopiedShareTokenId] = useState<string | null>(null);

  const {
    data: documents = [],
    isLoading: documentsLoading,
    isError: documentsError
  } = useQuery({
    queryKey: ['documents', 'teacher', teacherId],
    queryFn: () => fetchDocuments(),
    enabled: Boolean(teacherId)
  });

  const {
    data: schedules = [],
    isLoading: scheduleLoading
  } = useQuery({
    queryKey: ['schedules', 'teacher', teacherId],
    queryFn: () => fetchSchedules({ teacherId: teacherId ?? '' }),
    enabled: Boolean(teacherId)
  });

  const {
    data: classes = [],
    isLoading: classesLoading
  } = useQuery({
    queryKey: ['classes', 'teacher', teacherId],
    queryFn: () => fetchClasses(),
    enabled: Boolean(teacherId)
  });

  const shareLinkBase = useMemo(() => {
    const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim() ?? 'http://localhost:4000/api';
    return apiBase.replace(/\/$/, '');
  }, []);

  const relevantClasses = useMemo<SchoolClassRecord[]>(() => {
    if (!teacherId) {
      return [];
    }
    return classes.filter((klass) =>
      klass.teacherAssignments.some((assignment) => assignment.teacher?.id === teacherId) ||
      klass.members.some((member) => member.id === teacherId)
    );
  }, [classes, teacherId]);

  const classOptions = relevantClasses.length ? relevantClasses : classes;

  const uploadMutation = useMutation({
    mutationFn: (payload: FormData) => uploadDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', 'teacher', teacherId] });
      setDocumentMessage('Dokumen berhasil diunggah.');
      setDocumentForm(createInitialDocumentFormState());
      setSelectedFile(null);
      setCopiedShareTokenId(null);
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        const data = error.response?.data as { message?: string } | undefined;
        setDocumentMessage(data?.message ?? 'Gagal mengunggah dokumen, pastikan format PDF dan ukuran sudah sesuai.');
        return;
      }
      setDocumentMessage('Gagal mengunggah dokumen, pastikan format PDF dan ukuran sudah sesuai.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', 'teacher', teacherId] });
      setDocumentMessage('Dokumen berhasil dihapus.');
    },
    onError: () => {
      setDocumentMessage('Gagal menghapus dokumen.');
    }
  });

  const handleUploadSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDocumentMessage(null);
    if (!selectedFile) {
      setDocumentMessage('Silakan pilih berkas sebelum mengunggah.');
      return;
    }

    if (!documentForm.audienceClassIds.length && !documentForm.generateShareLink) {
      setDocumentMessage('Pilih minimal satu kelas atau aktifkan tautan tamu.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (documentForm.title) formData.append('title', documentForm.title);
    if (documentForm.description) formData.append('description', documentForm.description);
    if (documentForm.issuedFor) formData.append('issuedFor', documentForm.issuedFor);
    documentForm.audienceClassIds.forEach((classId) => {
      formData.append('audienceClassIds', classId);
    });

    if (documentForm.generateShareLink) {
      formData.append('generateShareLink', 'true');
      if (documentForm.shareLinkExpiresAt) {
        const expiresAt = new Date(documentForm.shareLinkExpiresAt);
        if (Number.isNaN(expiresAt.getTime())) {
          setDocumentMessage('Tanggal kedaluwarsa tautan tamu tidak valid.');
          return;
        }
        formData.append('shareLinkExpiresAt', expiresAt.toISOString());
      }
      if (documentForm.shareLinkMaxDownloads) {
        formData.append('shareLinkMaxDownloads', documentForm.shareLinkMaxDownloads);
      }
    }
    formData.append('status', 'active');

    uploadMutation.mutate(formData);
  };

  const handleClassToggle = (classId: string) => {
    setDocumentMessage(null);
    setDocumentForm((prev) => {
      const exists = prev.audienceClassIds.includes(classId);
      return {
        ...prev,
        audienceClassIds: exists
          ? prev.audienceClassIds.filter((id) => id !== classId)
          : [...prev.audienceClassIds, classId]
      };
    });
  };

  const handleShareLinkToggle = (checked: boolean) => {
    setDocumentMessage(null);
    setDocumentForm((prev) => ({
      ...prev,
      generateShareLink: checked
    }));
  };

  const handleCopyShareLink = async (shareToken: { id: string; token: string }) => {
    const shareUrl = `${shareLinkBase}/documents/share/${shareToken.token}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShareTokenId(shareToken.id);
      setDocumentMessage('Tautan tamu berhasil disalin.');
      window.setTimeout(() => {
        setCopiedShareTokenId((current) => (current === shareToken.id ? null : current));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy share link', error);
      setDocumentMessage('Gagal menyalin tautan tamu.');
    }
  };

  const handleDownload = async (doc: DocumentRecord) => {
    try {
      const blob = await downloadDocumentFile(doc.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.originalFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download document', error);
      setDocumentMessage('Gagal mengunduh dokumen.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-school-teacher to-blue-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Dasbor Guru</h1>
        <p className="text-blue-100">Kelola materi resmi dan pantau jadwal mengajar Anda.</p>
      </div>

      <section id="documents-section" className="bg-white rounded-xl border border-school-border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-school-text flex items-center gap-2">
            <FileText size={20} /> Dokumen Saya
          </h2>
        </div>

        <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-school-text mb-2" htmlFor="teacher-document-file">
              Berkas PDF
            </label>
            <input
              id="teacher-document-file"
              type="file"
              accept="application/pdf"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className="block w-full text-sm text-school-text border border-school-border rounded-lg cursor-pointer bg-school-surface focus:outline-none focus:ring-2 focus:ring-school-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-school-text mb-2" htmlFor="teacher-document-title">
              Judul Dokumen
            </label>
            <input
              id="teacher-document-title"
              type="text"
              value={documentForm.title}
              onChange={(event) => setDocumentForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full border border-school-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
              placeholder="Contoh: Materi Matematika Bab 2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-school-text mb-2" htmlFor="teacher-document-issued-for">
              Ditujukan Untuk
            </label>
            <input
              id="teacher-document-issued-for"
              type="text"
              value={documentForm.issuedFor}
              onChange={(event) => setDocumentForm((prev) => ({ ...prev, issuedFor: event.target.value }))}
              className="w-full border border-school-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
              placeholder="Misal: Kelas XII IPA"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-school-text mb-2" htmlFor="teacher-document-description">
              Catatan Tambahan
            </label>
            <textarea
              id="teacher-document-description"
              value={documentForm.description}
              onChange={(event) => setDocumentForm((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full border border-school-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
              rows={3}
              placeholder="Informasi yang perlu diperhatikan siswa"
            />
          </div>
          <div className="md:col-span-2 space-y-4">
            <div>
              <p className="text-sm font-medium text-school-text mb-2">Bagikan ke Kelas</p>
              <div className="rounded-lg border border-school-border bg-school-surface/60 max-h-48 overflow-y-auto divide-y divide-school-border">
                {classesLoading ? (
                  <p className="px-3 py-2 text-xs text-school-text-muted">Memuat daftar kelas...</p>
                ) : classOptions.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-school-text-muted">Belum ada kelas yang terdaftar.</p>
                ) : (
                  classOptions.map((klass) => {
                    const isChecked = documentForm.audienceClassIds.includes(klass.id);
                    return (
                      <label key={klass.id} className="flex items-start gap-2 px-3 py-2 text-sm text-school-text cursor-pointer hover:bg-white">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded border-school-border text-school-accent focus:ring-school-accent"
                          checked={isChecked}
                          onChange={() => handleClassToggle(klass.id)}
                        />
                        <span>
                          <span className="font-medium block">{klass.name}</span>
                          <span className="text-xs text-school-text-muted block">Tingkat {klass.gradeLevel} · {klass.academicYear}</span>
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
              <p className="mt-2 text-xs text-school-text-muted">Dipilih: {documentForm.audienceClassIds.length} kelas</p>
            </div>
            <div className="rounded-lg border border-school-border bg-school-surface/60 p-4">
              <label className="flex items-start gap-3 text-sm text-school-text cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-school-border text-school-accent focus:ring-school-accent"
                  checked={documentForm.generateShareLink}
                  onChange={(event) => handleShareLinkToggle(event.target.checked)}
                />
                <span>
                  <span className="font-medium block">Aktifkan tautan tamu</span>
                  <span className="text-xs text-school-text-muted block">
                    Tamu tanpa akun dapat mengunduh dokumen menggunakan tautan khusus dengan watermark alamat IP.
                  </span>
                </span>
              </label>
              {documentForm.generateShareLink && (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="text-sm text-school-text">
                    <span className="mb-1 block">Kedaluwarsa (opsional)</span>
                    <input
                      type="datetime-local"
                      value={documentForm.shareLinkExpiresAt}
                      onChange={(event) => setDocumentForm((prev) => ({ ...prev, shareLinkExpiresAt: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                    />
                  </label>
                  <label className="text-sm text-school-text">
                    <span className="mb-1 block">Batas unduhan (opsional)</span>
                    <input
                      type="number"
                      min={1}
                      value={documentForm.shareLinkMaxDownloads}
                      onChange={(event) => setDocumentForm((prev) => ({ ...prev, shareLinkMaxDownloads: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                      placeholder="Tanpa batas bila dikosongkan"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="md:col-span-2 inline-flex items-center justify-center gap-2 bg-school-accent text-white px-4 py-2 rounded-lg hover:bg-school-accent-dark transition-colors disabled:opacity-60"
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            Unggah Dokumen
          </button>
        </form>

        {documentMessage && <p className="text-sm text-school-text-muted">{documentMessage}</p>}

        <div className="border-t border-school-border pt-4">
          {documentsLoading && (
            <div className="flex items-center gap-2 text-sm text-school-text-muted">
              <Loader2 size={16} className="animate-spin" /> Memuat dokumen...
            </div>
          )}
          {!documentsLoading && documentsError && (
            <p className="text-sm text-red-600">Gagal memuat dokumen. Coba muat ulang halaman.</p>
          )}
          {!documentsLoading && !documentsError && documents.length === 0 && (
            <p className="text-sm text-school-text-muted">Belum ada dokumen yang Anda unggah.</p>
          )}
          {!documentsLoading && !documentsError && documents.length > 0 && (
            <div className="space-y-3 text-sm">
              {documents.slice(0, 8).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-3 border border-school-border rounded-lg p-3">
                  <div className="flex-1">
                    <p className="font-medium text-school-text">{doc.title ?? doc.originalFileName}</p>
                    <p className="text-xs text-school-text-muted">{new Date(doc.createdAt).toLocaleString('id-ID')}</p>
                    {doc.audiences && doc.audiences.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {doc.audiences.map((audience) => {
                          const label = audience.type === 'CLASS'
                            ? `Kelas ${audience.class?.name ?? 'Tidak diketahui'}`
                            : audience.user?.name ?? 'Pengguna tidak tersedia';
                          return (
                            <span
                              key={audience.id}
                              className="inline-flex items-center rounded-full bg-school-surface px-2 py-0.5 text-[11px] text-school-text-muted"
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-2 text-[11px] text-school-text-muted">Tidak ada audiens khusus.</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {doc.shareTokens && doc.shareTokens.length > 0 ? (
                      doc.shareTokens.slice(0, 1).map((token) => (
                        <div key={token.id} className="flex flex-col items-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyShareLink(token)}
                            className="inline-flex items-center gap-2 rounded-lg border border-school-border px-3 py-1 text-xs font-medium text-school-text hover:bg-school-surface"
                          >
                            {copiedShareTokenId === token.id ? <Check size={14} /> : <Link2 size={14} />}
                            {copiedShareTokenId === token.id ? 'Tautan tersalin' : 'Salin tautan tamu'}
                          </button>
                          <p className="text-[11px] text-school-text-muted">
                            {token.expiresAt ? `Kedaluwarsa ${new Date(token.expiresAt).toLocaleString('id-ID')}` : 'Tanpa kedaluwarsa'}
                            {' · '}
                            {token.maxDownloads ? `${token.downloadCount}/${token.maxDownloads} unduhan` : `${token.downloadCount} unduhan`}
                          </p>
                          {doc.shareTokens.length > 1 && (
                            <p className="text-[10px] text-school-text-muted">+ {doc.shareTokens.length - 1} tautan tambahan</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-school-text-muted">Tautan tamu tidak aktif.</p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownload(doc)}
                        className="inline-flex items-center bg-school-surface border border-school-border rounded-lg px-3 py-1.5 text-xs font-medium text-school-text hover:bg-school-sidebar-hover"
                      >
                        <Download size={14} className="mr-1" /> Unduh
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(doc.id)}
                        className="inline-flex items-center bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-100"
                      >
                        <Trash2 size={14} className="mr-1" /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="schedule-section" className="bg-white rounded-xl border border-school-border p-6">
        <h2 className="text-xl font-semibold text-school-text mb-4 flex items-center gap-2">
          <CalendarRange size={20} /> Jadwal Mengajar
        </h2>

        {!teacherId && (
          <p className="text-sm text-school-text-muted">Informasi pengguna belum lengkap, hubungi admin untuk memperbarui data.</p>
        )}

        {teacherId && scheduleLoading && (
          <div className="flex items-center gap-2 text-sm text-school-text-muted">
            <Loader2 size={16} className="animate-spin" /> Memuat jadwal...
          </div>
        )}

        {teacherId && !scheduleLoading && schedules.length === 0 && (
          <p className="text-sm text-school-text-muted">Belum ada jadwal tercatat untuk Anda.</p>
        )}

        {teacherId && !scheduleLoading && schedules.length > 0 && (
          <div className="space-y-3 text-sm">
            {schedules.map((item: ScheduleItem) => (
              <div key={item.id} className="border border-school-border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-medium text-school-text">{item.class.name}</p>
                  <p className="text-school-text">{item.subject.name}</p>
                  <p className="text-xs text-school-text-muted">Kode: {item.subject.code}</p>
                </div>
                <div className="text-sm text-school-text">
                  <p className="font-medium">{item.dayOfWeek}</p>
                  <p className="text-school-text-muted">{formatTimeRange(item.startTime, item.endTime)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default withAuth(TeacherDashboard, ['teacher', 'admin']);
