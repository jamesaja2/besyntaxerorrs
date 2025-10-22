import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchDocuments, downloadDocumentFile } from "@/api/documents";
import { fetchSchedules } from "@/api/schedules";
import type { DocumentRecord, ScheduleItem } from "@/types/api";
import { useAuth, withAuth } from "@/contexts/AuthContext";
import {
  FileText,
  Download,
  Loader2,
  CalendarRange
} from "lucide-react";

function StudentDashboard() {
  const { user } = useAuth();
  const classOptions = useMemo(() => user?.classes ?? [], [user]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(() =>
    classOptions[0]?.id ?? null
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!classOptions.length) {
      setSelectedClassId(null);
      return;
    }

    setSelectedClassId((prev) => {
      if (prev && classOptions.some((item) => item.id === prev)) {
        return prev;
      }
      return classOptions[0]?.id ?? null;
    });
  }, [classOptions]);

  const {
    data: documents = [],
    isLoading: documentsLoading,
    isError: documentsError
  } = useQuery({
    queryKey: ["documents", "student"],
    queryFn: () => fetchDocuments()
  });

  const {
    data: schedules = [],
    isLoading: schedulesLoading
  } = useQuery({
    queryKey: ["schedules", "student", selectedClassId],
    queryFn: () => fetchSchedules({ classId: selectedClassId ?? "" }),
    enabled: Boolean(selectedClassId)
  });

  const downloadMutation = useMutation<Blob, unknown, DocumentRecord>({
    mutationFn: (doc) => downloadDocumentFile(doc.id),
    onSuccess: (blob, doc) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.originalFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setActionMessage(null);
    },
    onError: () => {
      setActionMessage("Gagal mengunduh dokumen.");
    }
  });

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-school-student to-green-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Dasbor Siswa</h1>
        <p className="text-green-100">Akses dokumen resmi dan pantau jadwal belajar Anda.</p>
      </div>

      <section id="documents-section" className="bg-white rounded-xl border border-school-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-school-text flex items-center gap-2">
            <FileText size={20} /> Daftar Dokumen
          </h2>
        </div>

        {documentsLoading && (
          <div className="flex items-center gap-2 text-sm text-school-text-muted">
            <Loader2 size={16} className="animate-spin" /> Memuat dokumen...
          </div>
        )}
        {!documentsLoading && documentsError && (
          <p className="text-sm text-red-600">Gagal memuat dokumen. Coba muat ulang.</p>
        )}
        {!documentsLoading && !documentsError && documents.length === 0 && (
          <p className="text-sm text-school-text-muted">Belum ada dokumen yang tersedia saat ini.</p>
        )}
        {!documentsLoading && !documentsError && documents.length > 0 && (
          <div className="space-y-3 text-sm">
            {documents.slice(0, 10).map((doc) => (
              <div key={doc.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-school-border rounded-lg p-3">
                <div>
                  <p className="font-medium text-school-text">{doc.title ?? doc.originalFileName}</p>
                  <p className="text-xs text-school-text-muted">Kode verifikasi: {doc.verificationCode}</p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadMutation.mutate(doc)}
                  className="inline-flex items-center bg-school-surface border border-school-border rounded-lg px-3 py-1.5 text-xs font-medium text-school-text hover:bg-school-sidebar-hover disabled:opacity-60"
                  disabled={downloadMutation.isPending}
                >
                  {downloadMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <Download size={14} className="mr-1" />}
                  Unduh
                </button>
              </div>
            ))}
          </div>
        )}

        {actionMessage && <p className="text-sm text-school-text-muted">{actionMessage}</p>}
      </section>

      <section id="schedule-section" className="bg-white rounded-xl border border-school-border p-6">
        <h2 className="text-xl font-semibold text-school-text mb-4 flex items-center gap-2">
          <CalendarRange size={20} /> Jadwal Belajar
        </h2>

        {classOptions.length === 0 && (
          <p className="text-sm text-school-text-muted">Data kelas belum tersedia. Hubungi admin untuk memperbarui informasi akun.</p>
        )}

        {classOptions.length > 1 && selectedClassId && (
          <div className="mb-4 flex flex-col gap-2 text-sm">
            <label className="font-medium text-school-text">Pilih kelas</label>
            <select
              className="w-full rounded-md border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-student"
              value={selectedClassId}
              onChange={(event) => setSelectedClassId(event.target.value)}
            >
              {classOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} • {item.academicYear}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedClassId && schedulesLoading && (
          <div className="flex items-center gap-2 text-sm text-school-text-muted">
            <Loader2 size={16} className="animate-spin" /> Memuat jadwal...
          </div>
        )}

        {selectedClassId && !schedulesLoading && schedules.length === 0 && (
          <p className="text-sm text-school-text-muted">Jadwal belum tersedia untuk kelas Anda.</p>
        )}

        {selectedClassId && !schedulesLoading && schedules.length > 0 && (
          <div className="space-y-3 text-sm">
            {schedules.map((item: ScheduleItem) => (
              <div key={item.id} className="border border-school-border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-medium text-school-text">{item.subject.name}</p>
                  <p className="text-xs text-school-text-muted">Pengajar: {item.teacher.name}</p>
                </div>
                <div className="text-sm text-school-text">
                  <p className="font-medium">{item.dayOfWeek}</p>
                  <p className="text-school-text-muted">
                    {new Date(item.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    {' - '}
                    {new Date(item.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default withAuth(StudentDashboard, ['student', 'admin']);
