import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAnnouncement, deleteAnnouncement, fetchAnnouncements, updateAnnouncement } from '@/api/announcements';
import { fetchArticles } from '@/api/articles';
import { fetchExtracurriculars } from '@/api/extracurriculars';
import { fetchDocuments, uploadDocument, deleteDocument, downloadDocumentFile } from '@/api/documents';
import { fetchValidatorHistory, submitDomainCheck } from '@/api/validator';
import { createSchedule, deleteSchedule, fetchSchedules, updateSchedule } from '@/api/schedules';
import { fetchFaqItems, createFaqItem, updateFaqItem, deleteFaqItem } from '@/api/faq';
import { fetchGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem } from '@/api/gallery';
import { fetchClasses } from '@/api/classes';
import { fetchSubjects } from '@/api/subjects';
import { fetchUsers } from '@/api/users';
import type {
  Announcement,
  AnnouncementPayload,
  DocumentRecord,
  FAQItem,
  FAQPayload,
  GalleryItem,
  GalleryPayload,
  ScheduleItem,
  SchedulePayload,
  ValidatorHistory,
  BasicUserSummary,
  SchoolClassSummary,
  SubjectSummary
} from '@/types/api';
import { withAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Upload,
  Trash2,
  Download,
  ShieldCheck,
  Loader2,
  CalendarRange,
  ExternalLink,
  Edit,
  Save,
  X
} from 'lucide-react';

const DAY_OPTIONS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

function toDateInputValue(iso: string | undefined) {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function toDateTimeLocalValue(iso: string | undefined) {
  if (!iso) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toTimeInputValue(iso: string | undefined) {
  if (!iso) return '';
  const date = new Date(iso);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function toIsoTimeValue(time: string) {
  if (!time) {
    return new Date(Date.UTC(1970, 0, 1, 7, 0)).toISOString();
  }
  const [hours, minutes] = time.split(':').map((part) => Number.parseInt(part, 10));
  return new Date(Date.UTC(1970, 0, 1, hours || 0, minutes || 0)).toISOString();
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (size >= 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${size} B`;
}

function AdminDashboard() {
  const queryClient = useQueryClient();
  const [uploadForm, setUploadForm] = useState({
    title: '',
    issuedFor: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentMessage, setDocumentMessage] = useState<string | null>(null);
  const [validatorUrl, setValidatorUrl] = useState('');
  const [validatorMessage, setValidatorMessage] = useState<string | null>(null);
  const [validatorResult, setValidatorResult] = useState<ValidatorHistory | null>(null);

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    summary: '',
    content: '',
    date: toDateInputValue(new Date().toISOString()),
    category: '',
    pinned: false,
    imageUrl: ''
  });
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [announcementMessage, setAnnouncementMessage] = useState<string | null>(null);

  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: ''
  });
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqMessage, setFaqMessage] = useState<string | null>(null);

  const [galleryForm, setGalleryForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    tags: '',
    publishedAt: toDateTimeLocalValue(undefined)
  });
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [galleryMessage, setGalleryMessage] = useState<string | null>(null);

  const [scheduleForm, setScheduleForm] = useState({
    classId: '',
    subjectId: '',
    teacherId: '',
    dayOfWeek: DAY_OPTIONS[0],
    startTime: '07:00',
    endTime: '08:00',
    location: '',
    notes: ''
  });
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [scheduleMessage, setScheduleMessage] = useState<string | null>(null);

  const resetAnnouncementForm = () => {
    setAnnouncementForm({
      title: '',
      summary: '',
      content: '',
      date: toDateInputValue(new Date().toISOString()),
      category: '',
      pinned: false,
      imageUrl: ''
    });
    setEditingAnnouncementId(null);
  };

  const resetFaqForm = () => {
    setFaqForm({ question: '', answer: '', category: '' });
    setEditingFaqId(null);
  };

  const resetGalleryForm = () => {
    setGalleryForm({
      title: '',
      description: '',
      imageUrl: '',
      tags: '',
      publishedAt: toDateTimeLocalValue(undefined)
    });
    setEditingGalleryId(null);
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      classId: '',
      subjectId: '',
      teacherId: '',
      dayOfWeek: DAY_OPTIONS[0],
      startTime: '07:00',
      endTime: '08:00',
      location: '',
      notes: ''
    });
    setEditingScheduleId(null);
  };

  const {
    data: announcements = [],
    isLoading: announcementsLoading
  } = useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: fetchAnnouncements
  });

  const { data: articles = [] } = useQuery({
    queryKey: ['articles'],
    queryFn: fetchArticles
  });

  const { data: extracurriculars = [] } = useQuery({
    queryKey: ['extracurriculars'],
    queryFn: fetchExtracurriculars
  });

  const { data: faqItems = [], isLoading: faqLoading } = useQuery<FAQItem[]>({
    queryKey: ['faq', 'admin'],
    queryFn: fetchFaqItems
  });

  const { data: galleryItems = [], isLoading: galleryLoading } = useQuery<GalleryItem[]>({
    queryKey: ['gallery', 'admin'],
    queryFn: fetchGallery
  });

  const {
    data: documents = [],
    isLoading: documentsLoading,
    isError: documentsError
  } = useQuery({
    queryKey: ['documents', 'admin'],
    queryFn: () => fetchDocuments()
  });

  const {
    data: validatorHistory = [],
    isLoading: validatorLoading
  } = useQuery<ValidatorHistory[]>({
    queryKey: ['validator-history'],
    queryFn: fetchValidatorHistory
  });

  const {
    data: schedules = [],
    isLoading: schedulesLoading
  } = useQuery<ScheduleItem[]>({
    queryKey: ['schedules', 'admin'],
    queryFn: () => fetchSchedules()
  });

  const { data: classes = [], isLoading: classesLoading } = useQuery<SchoolClassSummary[]>({
    queryKey: ['classes', 'admin'],
    queryFn: fetchClasses
  });

  const { data: subjects = [], isLoading: subjectsLoading } = useQuery<SubjectSummary[]>({
    queryKey: ['subjects', 'admin'],
    queryFn: fetchSubjects
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<BasicUserSummary[]>({
    queryKey: ['users', 'admin'],
    queryFn: fetchUsers
  });

  const teachers = useMemo(
    () => users.filter((user) => user.role === 'teacher'),
    [users]
  );

  const uploadMutation = useMutation({
    mutationFn: (payload: FormData) => uploadDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', 'admin'] });
      setDocumentMessage('Dokumen berhasil diunggah.');
      setUploadForm({ title: '', issuedFor: '', description: '' });
      setSelectedFile(null);
    },
    onError: () => {
      setDocumentMessage('Gagal mengunggah dokumen, periksa kembali berkas PDF.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', 'admin'] });
      setDocumentMessage('Dokumen berhasil dihapus.');
    },
    onError: () => {
      setDocumentMessage('Gagal menghapus dokumen.');
    }
  });

  const validatorMutation = useMutation({
    mutationFn: (url: string) => submitDomainCheck(url),
    onSuccess: (result) => {
      setValidatorResult(result);
      setValidatorMessage('Pemeriksaan selesai. Hasil terbaru ditambahkan ke riwayat.');
      queryClient.invalidateQueries({ queryKey: ['validator-history'] });
    },
    onError: () => {
      setValidatorMessage('Gagal memeriksa domain. Pastikan URL valid.');
    }
  });

  const announcementSaveMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: AnnouncementPayload }) =>
      id ? updateAnnouncement(id, payload) : createAnnouncement(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setAnnouncementMessage(
        variables.id ? 'Pengumuman berhasil diperbarui.' : 'Pengumuman baru berhasil ditambahkan.'
      );
      resetAnnouncementForm();
    },
    onError: () => {
      setAnnouncementMessage('Gagal menyimpan pengumuman. Periksa kembali formulir.');
    }
  });

  const announcementDeleteMutation = useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      if (editingAnnouncementId === id) {
        resetAnnouncementForm();
      }
      setAnnouncementMessage('Pengumuman berhasil dihapus.');
    },
    onError: () => {
      setAnnouncementMessage('Gagal menghapus pengumuman.');
    }
  });

  const faqSaveMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: FAQPayload }) =>
      id ? updateFaqItem(id, payload) : createFaqItem(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['faq', 'admin'] });
      setFaqMessage(variables.id ? 'FAQ berhasil diperbarui.' : 'FAQ baru berhasil ditambahkan.');
      resetFaqForm();
    },
    onError: () => {
      setFaqMessage('Gagal menyimpan FAQ.');
    }
  });

  const faqDeleteMutation = useMutation({
    mutationFn: (id: string) => deleteFaqItem(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['faq', 'admin'] });
      if (editingFaqId === id) {
        resetFaqForm();
      }
      setFaqMessage('FAQ berhasil dihapus.');
    },
    onError: () => {
      setFaqMessage('Gagal menghapus FAQ.');
    }
  });

  const gallerySaveMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: GalleryPayload }) =>
      id ? updateGalleryItem(id, payload) : createGalleryItem(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gallery', 'admin'] });
      setGalleryMessage(variables.id ? 'Galeri berhasil diperbarui.' : 'Galeri baru berhasil ditambahkan.');
      resetGalleryForm();
    },
    onError: () => {
      setGalleryMessage('Gagal menyimpan item galeri.');
    }
  });

  const galleryDeleteMutation = useMutation({
    mutationFn: (id: string) => deleteGalleryItem(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['gallery', 'admin'] });
      if (editingGalleryId === id) {
        resetGalleryForm();
      }
      setGalleryMessage('Item galeri berhasil dihapus.');
    },
    onError: () => {
      setGalleryMessage('Gagal menghapus item galeri.');
    }
  });

  const scheduleSaveMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: SchedulePayload }) =>
      id ? updateSchedule(id, payload) : createSchedule(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schedules', 'admin'] });
      setScheduleMessage(variables.id ? 'Jadwal berhasil diperbarui.' : 'Jadwal baru berhasil ditambahkan.');
      resetScheduleForm();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Gagal menyimpan jadwal.';
      setScheduleMessage(message.startsWith('End time') ? message : 'Gagal menyimpan jadwal.');
    }
  });

  const scheduleDeleteMutation = useMutation({
    mutationFn: (id: string) => deleteSchedule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['schedules', 'admin'] });
      if (editingScheduleId === id) {
        resetScheduleForm();
      }
      setScheduleMessage('Jadwal berhasil dihapus.');
    },
    onError: () => {
      setScheduleMessage('Gagal menghapus jadwal.');
    }
  });

  const handleAnnouncementSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAnnouncementMessage(null);
    const payload: AnnouncementPayload = {
      title: announcementForm.title.trim(),
      summary: announcementForm.summary.trim(),
      content: announcementForm.content.trim(),
      date: announcementForm.date,
      category: announcementForm.category.trim(),
      pinned: announcementForm.pinned,
      imageUrl: announcementForm.imageUrl.trim() || undefined
    };
    announcementSaveMutation.mutate({ id: editingAnnouncementId ?? undefined, payload });
  };

  const handleAnnouncementEdit = (item: Announcement) => {
    setAnnouncementForm({
      title: item.title,
      summary: item.summary,
      content: item.content,
      date: toDateInputValue(item.date),
      category: item.category,
      pinned: Boolean(item.pinned),
      imageUrl: item.imageUrl ?? ''
    });
    setEditingAnnouncementId(item.id);
    setAnnouncementMessage(null);
  };

  const handleFaqSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFaqMessage(null);
    const payload: FAQPayload = {
      question: faqForm.question.trim(),
      answer: faqForm.answer.trim(),
      category: faqForm.category.trim() || 'Umum'
    };
    faqSaveMutation.mutate({ id: editingFaqId ?? undefined, payload });
  };

  const handleFaqEdit = (item: FAQItem) => {
    setFaqForm({
      question: item.question,
      answer: item.answer,
      category: item.category
    });
    setEditingFaqId(item.id);
    setFaqMessage(null);
  };

  const handleGallerySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGalleryMessage(null);
    const payload: GalleryPayload = {
      title: galleryForm.title.trim(),
      description: galleryForm.description.trim(),
      imageUrl: galleryForm.imageUrl.trim(),
      tags: galleryForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      publishedAt: galleryForm.publishedAt ? new Date(galleryForm.publishedAt).toISOString() : new Date().toISOString()
    };
    gallerySaveMutation.mutate({ id: editingGalleryId ?? undefined, payload });
  };

  const handleGalleryEdit = (item: GalleryItem) => {
    setGalleryForm({
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      tags: item.tags.join(', '),
      publishedAt: toDateTimeLocalValue(item.publishedAt)
    });
    setEditingGalleryId(item.id);
    setGalleryMessage(null);
  };

  const handleScheduleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setScheduleMessage(null);
    if (!scheduleForm.classId || !scheduleForm.subjectId || !scheduleForm.teacherId) {
      setScheduleMessage('Pilih kelas, mata pelajaran, dan guru terlebih dahulu.');
      return;
    }

    const payload: SchedulePayload = {
      classId: scheduleForm.classId,
      subjectId: scheduleForm.subjectId,
      teacherId: scheduleForm.teacherId,
      dayOfWeek: scheduleForm.dayOfWeek,
      startTime: toIsoTimeValue(scheduleForm.startTime),
      endTime: toIsoTimeValue(scheduleForm.endTime),
      location: scheduleForm.location.trim() || undefined,
      notes: scheduleForm.notes.trim() || undefined
    };
    scheduleSaveMutation.mutate({ id: editingScheduleId ?? undefined, payload });
  };

  const handleScheduleEdit = (item: ScheduleItem) => {
    setScheduleForm({
      classId: item.class.id,
      subjectId: item.subject.id,
      teacherId: item.teacher.id,
      dayOfWeek: item.dayOfWeek,
      startTime: toTimeInputValue(item.startTime),
      endTime: toTimeInputValue(item.endTime),
      location: item.location ?? '',
      notes: item.notes ?? ''
    });
    setEditingScheduleId(item.id);
    setScheduleMessage(null);
  };

  const landingSummary = useMemo(() => [
    {
      label: 'Pengumuman',
      value: announcements.length,
      href: '/pengumuman'
    },
    {
      label: 'Artikel',
      value: articles.length,
      href: '/wawasan'
    },
    {
      label: 'Ekstrakurikuler',
      value: extracurriculars.length,
      href: '/ekstrakulikuler'
    }
  ], [announcements.length, articles.length, extracurriculars.length]);

  const handleUploadSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setDocumentMessage('Pilih berkas PDF sebelum mengunggah.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (uploadForm.title) formData.append('title', uploadForm.title);
    if (uploadForm.description) formData.append('description', uploadForm.description);
    if (uploadForm.issuedFor) formData.append('issuedFor', uploadForm.issuedFor);
    formData.append('status', 'active');

    uploadMutation.mutate(formData);
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

  const recentValidator = validatorHistory.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-school-admin to-school-accent-dark rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Dasbor Admin</h1>
        <p className="text-blue-100">Kendalikan konten landing, dokumen resmi, dan jadwal akademik dari satu tempat.</p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-labelledby="landing-summary">
        <h2 id="landing-summary" className="sr-only">Ringkasan konten landing</h2>
        {landingSummary.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="bg-white rounded-xl p-5 shadow-sm border border-school-border hover:shadow-md transition-shadow"
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-school-text-muted">{item.label}</p>
                <p className="text-2xl font-semibold text-school-text">{item.value}</p>
              </div>
              <ExternalLink className="text-school-accent" size={20} />
            </div>
            <p className="text-xs text-school-text-muted mt-3">Klik untuk membuka halaman terkait di tab baru.</p>
          </a>
        ))}
      </section>

      <section className="bg-white rounded-xl border border-school-border p-6 space-y-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-school-text">Kelola Konten Landing</h2>
            <p className="text-sm text-school-text-muted">Perbarui pengumuman, FAQ, dan galeri yang muncul di halaman utama.</p>
          </div>
        </div>

        <Tabs defaultValue="announcements">
          <TabsList className="grid w-full grid-cols-3 bg-school-surface text-school-text">
            <TabsTrigger value="announcements">Pengumuman</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="gallery">Galeri</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="mt-4">
            <div className="grid gap-6 lg:grid-cols-[1fr,1.4fr]">
              <form onSubmit={handleAnnouncementSubmit} className="space-y-4 rounded-xl border border-school-border bg-school-surface p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-school-text">{editingAnnouncementId ? 'Edit Pengumuman' : 'Tambah Pengumuman'}</h3>
                    <p className="text-sm text-school-text-muted">Isi detail pengumuman yang akan tampil di halaman landing.</p>
                  </div>
                  {editingAnnouncementId && (
                    <button
                      type="button"
                      onClick={() => { resetAnnouncementForm(); setAnnouncementMessage(null); }}
                      className="inline-flex items-center gap-1 rounded-lg border border-school-border px-3 py-1 text-xs font-medium text-school-text hover:bg-white"
                    >
                      <X size={14} /> Batal
                    </button>
                  )}
                </div>

                <div className="grid gap-3">
                  <label className="space-y-1 text-sm text-school-text">
                    <span>Judul</span>
                    <input
                      type="text"
                      value={announcementForm.title}
                      onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, title: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-school-text">
                    <span>Tanggal</span>
                    <input
                      type="date"
                      value={announcementForm.date}
                      onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, date: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-school-text">
                    <span>Kategori</span>
                    <input
                      type="text"
                      value={announcementForm.category}
                      onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, category: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                      placeholder="Contoh: Akademik"
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-school-text">
                    <span>Ringkasan</span>
                    <textarea
                      value={announcementForm.summary}
                      onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, summary: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                      rows={3}
                      placeholder="Tuliskan ringkasan singkat"
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-school-text">
                    <span>Konten Lengkap</span>
                    <textarea
                      value={announcementForm.content}
                      onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, content: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                      rows={5}
                      placeholder="Tuliskan isi pengumuman"
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-school-text">
                    <span>URL Gambar (opsional)</span>
                    <input
                      type="url"
                      value={announcementForm.imageUrl}
                      onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                      placeholder="https://..."
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex items-center gap-2 text-sm text-school-text">
                    <input
                      type="checkbox"
                      checked={announcementForm.pinned}
                      onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, pinned: event.target.checked }))}
                      className="h-4 w-4 rounded border-school-border text-school-accent focus:ring-school-accent"
                    />
                    Tandai sebagai penting
                  </label>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-school-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-school-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={announcementSaveMutation.isPending}
                  >
                    {announcementSaveMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {editingAnnouncementId ? 'Simpan Perubahan' : 'Tambah Pengumuman'}
                  </button>
                </div>

                {announcementMessage && (
                  <p className="text-sm text-school-text-muted">{announcementMessage}</p>
                )}
              </form>

              <div className="space-y-3">
                {announcementsLoading && (
                  <div className="flex items-center gap-2 text-sm text-school-text-muted">
                    <Loader2 size={16} className="animate-spin" /> Memuat pengumuman...
                  </div>
                )}

                {!announcementsLoading && announcements.length === 0 && (
                  <p className="text-sm text-school-text-muted">Belum ada pengumuman yang tersimpan.</p>
                )}

                {!announcementsLoading && announcements.length > 0 && (
                  <div className="space-y-3">
                    {announcements.slice(0, 8).map((item) => (
                      <article key={item.id} className="rounded-xl border border-school-border p-4 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 text-xs text-school-text-muted">
                              <span className="rounded-full bg-school-accent/10 px-2 py-0.5 font-semibold text-school-accent">{item.category}</span>
                              <span>{new Date(item.date).toLocaleDateString('id-ID')}</span>
                              {item.pinned && <span className="rounded-full bg-school-accent-dark/10 px-2 py-0.5 text-school-accent-dark">Penting</span>}
                            </div>
                            <h4 className="mt-2 text-base font-semibold text-school-text">{item.title}</h4>
                            <p className="mt-1 text-sm text-school-text-muted line-clamp-2">{item.summary}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAnnouncementEdit(item)}
                              className="inline-flex items-center gap-1 rounded-lg border border-school-border px-3 py-1 text-xs font-medium text-school-text hover:bg-white"
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Hapus pengumuman ini?')) {
                                  announcementDeleteMutation.mutate(item.id);
                                }
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed"
                              disabled={announcementDeleteMutation.isPending}
                            >
                              <Trash2 size={14} /> Hapus
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="faq" className="mt-4">
            <div className="grid gap-6 lg:grid-cols-[1fr,1.4fr]">
              <form onSubmit={handleFaqSubmit} className="space-y-4 rounded-xl border border-school-border bg-school-surface p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-school-text">{editingFaqId ? 'Edit FAQ' : 'Tambah FAQ'}</h3>
                    <p className="text-sm text-school-text-muted">Pertanyaan yang akan muncul di halaman tanya jawab.</p>
                  </div>
                  {editingFaqId && (
                    <button
                      type="button"
                      onClick={() => { resetFaqForm(); setFaqMessage(null); }}
                      className="inline-flex items-center gap-1 rounded-lg border border-school-border px-3 py-1 text-xs font-medium text-school-text hover:bg-white"
                    >
                      <X size={14} /> Batal
                    </button>
                  )}
                </div>

                <label className="grid gap-1 text-sm text-school-text">
                  <span>Pertanyaan</span>
                  <input
                    type="text"
                    value={faqForm.question}
                    onChange={(event) => setFaqForm((prev) => ({ ...prev, question: event.target.value }))}
                    className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                    required
                  />
                </label>

                <label className="grid gap-1 text-sm text-school-text">
                  <span>Jawaban</span>
                  <textarea
                    value={faqForm.answer}
                    onChange={(event) => setFaqForm((prev) => ({ ...prev, answer: event.target.value }))}
                    className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                    rows={4}
                    required
                  />
                </label>

                <label className="grid gap-1 text-sm text-school-text">
                  <span>Kategori</span>
                  <input
                    type="text"
                    value={faqForm.category}
                    onChange={(event) => setFaqForm((prev) => ({ ...prev, category: event.target.value }))}
                    className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                    placeholder="Contoh: Pendaftaran"
                  />
                </label>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-school-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-school-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={faqSaveMutation.isPending}
                  >
                    {faqSaveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {editingFaqId ? 'Simpan Perubahan' : 'Tambah FAQ'}
                  </button>
                </div>

                {faqMessage && <p className="text-sm text-school-text-muted">{faqMessage}</p>}
              </form>

              <div className="space-y-3">
                {faqLoading && (
                  <div className="flex items-center gap-2 text-sm text-school-text-muted">
                    <Loader2 size={16} className="animate-spin" /> Memuat FAQ...
                  </div>
                )}

                {!faqLoading && faqItems.length === 0 && (
                  <p className="text-sm text-school-text-muted">Belum ada data FAQ.</p>
                )}

                {!faqLoading && faqItems.length > 0 && (
                  <div className="space-y-3">
                    {faqItems.slice(0, 10).map((item) => (
                      <article key={item.id} className="rounded-xl border border-school-border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="inline-block rounded-full bg-school-accent/10 px-2 py-0.5 text-xs font-medium text-school-accent">
                              {item.category || 'Umum'}
                            </span>
                            <h4 className="mt-2 text-base font-semibold text-school-text">{item.question}</h4>
                            <p className="mt-1 text-sm text-school-text-muted line-clamp-3">{item.answer}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleFaqEdit(item)}
                              className="inline-flex items-center gap-1 rounded-lg border border-school-border px-3 py-1 text-xs font-medium text-school-text hover:bg-white"
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Hapus FAQ ini?')) {
                                  faqDeleteMutation.mutate(item.id);
                                }
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                            >
                              <Trash2 size={14} /> Hapus
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="mt-4">
            <div className="grid gap-6 lg:grid-cols-[1fr,1.4fr]">
              <form onSubmit={handleGallerySubmit} className="space-y-4 rounded-xl border border-school-border bg-school-surface p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-school-text">{editingGalleryId ? 'Edit Item Galeri' : 'Tambah Item Galeri'}</h3>
                    <p className="text-sm text-school-text-muted">Perbarui galeri foto yang tampil untuk publik.</p>
                  </div>
                  {editingGalleryId && (
                    <button
                      type="button"
                      onClick={() => { resetGalleryForm(); setGalleryMessage(null); }}
                      className="inline-flex items-center gap-1 rounded-lg border border-school-border px-3 py-1 text-xs font-medium text-school-text hover:bg-white"
                    >
                      <X size={14} /> Batal
                    </button>
                  )}
                </div>

                <label className="grid gap-1 text-sm text-school-text">
                  <span>Judul</span>
                  <input
                    type="text"
                    value={galleryForm.title}
                    onChange={(event) => setGalleryForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                    required
                  />
                </label>

                <label className="grid gap-1 text-sm text-school-text">
                  <span>Deskripsi</span>
                  <textarea
                    value={galleryForm.description}
                    onChange={(event) => setGalleryForm((prev) => ({ ...prev, description: event.target.value }))}
                    className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                    rows={4}
                    required
                  />
                </label>

                <label className="grid gap-1 text-sm text-school-text">
                  <span>URL Gambar</span>
                  <input
                    type="url"
                    value={galleryForm.imageUrl}
                    onChange={(event) => setGalleryForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                    className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                    placeholder="https://..."
                    required
                  />
                </label>

                <label className="grid gap-1 text-sm text-school-text">
                  <span>Tag (pisahkan dengan koma)</span>
                  <input
                    type="text"
                    value={galleryForm.tags}
                    onChange={(event) => setGalleryForm((prev) => ({ ...prev, tags: event.target.value }))}
                    className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                    placeholder="Prestasi, Kegiatan"
                  />
                </label>

                <label className="grid gap-1 text-sm text-school-text">
                  <span>Waktu Publikasi</span>
                  <input
                    type="datetime-local"
                    value={galleryForm.publishedAt}
                    onChange={(event) => setGalleryForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
                    className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                    required
                  />
                </label>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-school-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-school-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={gallerySaveMutation.isPending}
                  >
                    {gallerySaveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {editingGalleryId ? 'Simpan Perubahan' : 'Tambah Item Galeri'}
                  </button>
                </div>

                {galleryMessage && <p className="text-sm text-school-text-muted">{galleryMessage}</p>}
              </form>

              <div className="space-y-3">
                {galleryLoading && (
                  <div className="flex items-center gap-2 text-sm text-school-text-muted">
                    <Loader2 size={16} className="animate-spin" /> Memuat galeri...
                  </div>
                )}

                {!galleryLoading && galleryItems.length === 0 && (
                  <p className="text-sm text-school-text-muted">Belum ada foto galeri.</p>
                )}

                {!galleryLoading && galleryItems.length > 0 && (
                  <div className="space-y-3">
                    {galleryItems.slice(0, 8).map((item) => (
                      <article key={item.id} className="rounded-xl border border-school-border p-4 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-school-text">{item.title}</h4>
                            <p className="mt-1 text-sm text-school-text-muted line-clamp-2">{item.description}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-school-text-muted">
                              <span className="rounded-full bg-school-accent/10 px-2 py-0.5 text-school-accent">
                                {new Date(item.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              {item.tags.map((tag) => (
                                <span key={tag} className="rounded-full bg-school-surface px-2 py-0.5 text-school-text">#{tag}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={item.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-school-border px-3 py-1 text-xs font-medium text-school-text hover:bg-white"
                            >
                              <ExternalLink size={14} /> Lihat
                            </a>
                            <button
                              type="button"
                              onClick={() => handleGalleryEdit(item)}
                              className="inline-flex items-center gap-1 rounded-lg border border-school-border px-3 py-1 text-xs font-medium text-school-text hover:bg-white"
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Hapus item galeri ini?')) {
                                  galleryDeleteMutation.mutate(item.id);
                                }
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                            >
                              <Trash2 size={14} /> Hapus
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <section id="documents-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-school-text flex items-center gap-2">
            <FileText size={20} />
            Manajemen Dokumen Resmi
          </h2>
        </div>

        <div className="bg-white rounded-xl border border-school-border p-6 space-y-6">
          <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-school-text mb-2" htmlFor="document-file">
                Berkas PDF
              </label>
              <input
                id="document-file"
                type="file"
                accept="application/pdf"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="block w-full text-sm text-school-text border border-school-border rounded-lg cursor-pointer bg-school-surface focus:outline-none focus:ring-2 focus:ring-school-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-school-text mb-2" htmlFor="document-title">
                Judul Dokumen
              </label>
              <input
                id="document-title"
                type="text"
                value={uploadForm.title}
                onChange={(event) => setUploadForm((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full border border-school-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                placeholder="Contoh: Surat Keterangan Siswa Aktif"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-school-text mb-2" htmlFor="document-issued-for">
                Diterbitkan Untuk
              </label>
              <input
                id="document-issued-for"
                type="text"
                value={uploadForm.issuedFor}
                onChange={(event) => setUploadForm((prev) => ({ ...prev, issuedFor: event.target.value }))}
                className="w-full border border-school-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                placeholder="Nama penerima / unit"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-school-text mb-2" htmlFor="document-description">
                Deskripsi Singkat
              </label>
              <textarea
                id="document-description"
                value={uploadForm.description}
                onChange={(event) => setUploadForm((prev) => ({ ...prev, description: event.target.value }))}
                className="w-full border border-school-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                rows={3}
                placeholder="Informasi tambahan mengenai dokumen"
              />
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

          {documentMessage && (
            <p className="text-sm text-school-text-muted">{documentMessage}</p>
          )}

          <div className="border-t border-school-border pt-4">
            {documentsLoading && (
              <div className="flex items-center gap-2 text-sm text-school-text-muted">
                <Loader2 size={16} className="animate-spin" /> Memuat daftar dokumen...
              </div>
            )}
            {documentsError && (
              <p className="text-sm text-red-600">Gagal memuat dokumen. Coba muat ulang halaman.</p>
            )}
            {!documentsLoading && !documentsError && documents.length === 0 && (
              <p className="text-sm text-school-text-muted">Belum ada dokumen yang diunggah.</p>
            )}
            {!documentsLoading && !documentsError && documents.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-school-text-muted">
                    <tr>
                      <th className="py-2 pr-4">Nama</th>
                      <th className="py-2 pr-4">Diterbitkan</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Diunduh</th>
                      <th className="py-2 pr-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-school-border">
                    {documents.slice(0, 8).map((doc) => (
                      <tr key={doc.id}>
                        <td className="py-2 pr-4">
                          <p className="font-medium text-school-text">{doc.title ?? doc.originalFileName}</p>
                          <p className="text-xs text-school-text-muted">{formatFileSize(doc.fileSize)}</p>
                        </td>
                        <td className="py-2 pr-4">
                          <p className="text-school-text text-sm">{doc.issuedFor ?? '-'}</p>
                          <p className="text-xs text-school-text-muted">{formatDateTime(doc.issuedAt)}</p>
                        </td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            doc.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : doc.status === 'inactive'
                              ? 'bg-school-accent/10 text-school-accent-dark'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-sm text-school-text">{doc.downloads}</td>
                        <td className="py-2 pr-0 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownload(doc)}
                            className="inline-flex items-center justify-center bg-school-surface border border-school-border rounded-lg px-3 py-1.5 text-xs font-medium text-school-text hover:bg-school-sidebar-hover"
                          >
                            <Download size={14} className="mr-1" /> Unduh
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMutation.mutate(doc.id)}
                            className="inline-flex items-center justify-center bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-100"
                          >
                            <Trash2 size={14} className="mr-1" /> Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="validator-section" className="bg-white rounded-xl border border-school-border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-school-text flex items-center gap-2">
            <ShieldCheck size={20} />
            Validator Domain & Log Aktivitas
          </h2>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!validatorUrl.trim()) {
              setValidatorMessage('Masukkan URL yang ingin diperiksa.');
              return;
            }
            validatorMutation.mutate(validatorUrl.trim());
          }}
          className="flex flex-col md:flex-row gap-3"
        >
          <input
            type="url"
            value={validatorUrl}
            onChange={(event) => setValidatorUrl(event.target.value)}
            placeholder="https://contoh-domain.com"
            className="flex-1 border border-school-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 bg-school-accent text-white px-4 py-2 rounded-lg hover:bg-school-accent-dark transition-colors disabled:opacity-60"
            disabled={validatorMutation.isPending}
          >
            {validatorMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            Periksa Domain
          </button>
        </form>

        {validatorMessage && <p className="text-sm text-school-text-muted">{validatorMessage}</p>}
        {validatorResult && (
          <div className="bg-school-surface rounded-lg p-4 text-sm text-school-text">
            <p className="font-medium">{validatorResult.url}</p>
            <p className="text-school-text-muted">Verdict: {validatorResult.verdict}</p>
            <p className="text-school-text-muted">Terakhir diperiksa: {formatDateTime(validatorResult.scannedAt)}</p>
          </div>
        )}

        <div className="border-t border-school-border pt-4">
          {validatorLoading && (
            <div className="flex items-center gap-2 text-sm text-school-text-muted">
              <Loader2 size={16} className="animate-spin" /> Memuat riwayat...
            </div>
          )}
          {!validatorLoading && validatorHistory.length === 0 && (
            <p className="text-sm text-school-text-muted">Belum ada riwayat pemeriksaan.</p>
          )}
          {!validatorLoading && validatorHistory.length > 0 && (
            <div className="space-y-3 text-sm">
              {recentValidator.map((entry) => (
                <div key={entry.id} className="flex items-start justify-between gap-3 border border-school-border rounded-lg p-3">
                  <div>
                    <p className="font-medium text-school-text">{entry.url}</p>
                    <p className="text-xs text-school-text-muted">{formatDateTime(entry.scannedAt)}</p>
                    <p className="text-xs text-school-text-muted capitalize">Verdict: {entry.verdict}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    entry.verdict === 'safe'
                      ? 'bg-green-100 text-green-700'
                      : entry.verdict === 'suspicious'
                      ? 'bg-school-accent/10 text-school-accent-dark'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {entry.verdict}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="schedules-section" className="space-y-6 rounded-xl border border-school-border bg-white p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-school-text flex items-center gap-2">
            <CalendarRange size={20} />
            Manajemen Jadwal Pelajaran
          </h2>
          <p className="text-sm text-school-text-muted">Tambahkan jadwal baru atau perbarui pertemuan yang sudah ada.</p>
        </div>

        <form onSubmit={handleScheduleSubmit} className="space-y-4 rounded-xl border border-school-border bg-school-surface p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="grid gap-1 text-sm text-school-text">
              <span>Kelas</span>
              <select
                value={scheduleForm.classId}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, classId: event.target.value }))}
                className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                disabled={classesLoading}
                required
              >
                <option value="">Pilih Kelas</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} • {item.academicYear}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm text-school-text">
              <span>Mata Pelajaran</span>
              <select
                value={scheduleForm.subjectId}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, subjectId: event.target.value }))}
                className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                disabled={subjectsLoading}
                required
              >
                <option value="">Pilih Mata Pelajaran</option>
                {subjects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.code})
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm text-school-text">
              <span>Guru Pengajar</span>
              <select
                value={scheduleForm.teacherId}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, teacherId: event.target.value }))}
                className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                disabled={usersLoading}
                required
              >
                <option value="">Pilih Guru</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} - {teacher.email}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm text-school-text">
              <span>Hari</span>
              <select
                value={scheduleForm.dayOfWeek}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, dayOfWeek: event.target.value }))}
                className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                required
              >
                {DAY_OPTIONS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm text-school-text">
              <span>Mulai</span>
              <input
                type="time"
                value={scheduleForm.startTime}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, startTime: event.target.value }))}
                className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                required
              />
            </label>

            <label className="grid gap-1 text-sm text-school-text">
              <span>Selesai</span>
              <input
                type="time"
                value={scheduleForm.endTime}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, endTime: event.target.value }))}
                className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                required
              />
            </label>

            <label className="grid gap-1 text-sm text-school-text">
              <span>Lokasi (opsional)</span>
              <input
                type="text"
                value={scheduleForm.location}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, location: event.target.value }))}
                className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                placeholder="Ruang kelas / lab"
              />
            </label>

            <label className="grid gap-1 text-sm text-school-text lg:col-span-2">
              <span>Catatan (opsional)</span>
              <input
                type="text"
                value={scheduleForm.notes}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, notes: event.target.value }))}
                className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                placeholder="Topik khusus atau perlengkapan"
              />
            </label>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {editingScheduleId && (
              <button
                type="button"
                onClick={() => { resetScheduleForm(); setScheduleMessage(null); }}
                className="inline-flex items-center gap-2 rounded-lg border border-school-border px-4 py-2 text-sm font-medium text-school-text hover:bg-white"
              >
                <X size={16} /> Batal
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-school-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-school-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={scheduleSaveMutation.isPending}
            >
              {scheduleSaveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingScheduleId ? 'Simpan Perubahan' : 'Tambah Jadwal'}
            </button>
          </div>

          {scheduleMessage && <p className="text-sm text-school-text-muted">{scheduleMessage}</p>}
        </form>

        <div className="overflow-x-auto">
          {schedulesLoading ? (
            <div className="flex items-center gap-2 text-sm text-school-text-muted">
              <Loader2 size={16} className="animate-spin" /> Memuat jadwal...
            </div>
          ) : schedules.length === 0 ? (
            <p className="text-sm text-school-text-muted">Belum ada jadwal yang tercatat.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="text-left text-school-text-muted">
                <tr>
                  <th className="py-2 pr-4">Kelas</th>
                  <th className="py-2 pr-4">Mata Pelajaran</th>
                  <th className="py-2 pr-4">Guru</th>
                  <th className="py-2 pr-4">Hari</th>
                  <th className="py-2 pr-4">Waktu</th>
                  <th className="py-2 pr-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-school-border">
                {schedules.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 pr-4 text-school-text">{item.class.name}</td>
                    <td className="py-2 pr-4 text-school-text">
                      <p className="font-medium">{item.subject.name}</p>
                      <p className="text-xs text-school-text-muted">Kode: {item.subject.code}</p>
                    </td>
                    <td className="py-2 pr-4 text-school-text">{item.teacher.name}</td>
                    <td className="py-2 pr-4 text-school-text">{item.dayOfWeek}</td>
                    <td className="py-2 pr-4 text-school-text">
                      {new Date(item.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(item.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleScheduleEdit(item)}
                          className="inline-flex items-center gap-1 rounded-lg border border-school-border px-3 py-1 text-xs font-medium text-school-text hover:bg-white"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Hapus jadwal ini?')) {
                              scheduleDeleteMutation.mutate(item.id);
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={14} /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export default withAuth(AdminDashboard, ['admin']);
