import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
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
import { fetchAdminSettings, updateAdminSettings } from '@/api/settings';
import { fetchTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, type TeamMemberPayload } from '@/api/teams';
import {
  fetchHeritageValues,
  fetchHistoryTimeline,
  fetchStructureEntries,
  fetchWawasanSections,
  updateWawasanSection,
  createHistoryTimelineEntry,
  updateHistoryTimelineEntry,
  deleteHistoryTimelineEntry,
  createHeritageValue,
  updateHeritageValue,
  deleteHeritageValue,
  createStructureEntry,
  updateStructureEntry,
  deleteStructureEntry
} from '@/api/wawasan';
import { analyzeDomainWithAI } from '@/api/aiValidator';
import { sendSeoChat } from '@/api/seoCoach';
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
  SubjectSummary,
  AdminSettings,
  AdminSettingsPayload,
  AiDomainAnalysis,
  SeoChatMessage,
  SeoChatPayload,
  SeoChatResponse,
  SeoTopic,
  WawasanKey,
  WawasanSection,
  WawasanSectionPayload,
  WawasanTimelineItem,
  WawasanTimelinePayload,
  WawasanHeritageValue,
  WawasanHeritagePayload,
  WawasanStructureEntry,
  WawasanStructurePayload,
  TeamMember
} from '@/types/api';
import { sejarahFallback, sejarahMeta } from '@/data/sejarah';
import { visiMisiFallback, visiMisiMeta } from '@/data/visimisi';
import { strukturFallback, strukturMeta } from '@/data/struktur';
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
  X,
  Settings as SettingsIcon,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Globe,
  Info,
  Bot,
  RefreshCw,
  Send,
  BookOpen
} from 'lucide-react';

const DAY_OPTIONS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const SEO_TOPICS: Array<{ value: SeoTopic; label: string; description: string }> = [
  {
    value: 'landing',
    label: 'Landing Page',
    description: 'Optimalkan hero, highlight, dan meta tag beranda.'
  },
  {
    value: 'announcements',
    label: 'Pengumuman',
    description: 'Pastikan SERP pengumuman menonjol dan mudah ditemukan.'
  },
  {
    value: 'gallery',
    label: 'Galeri',
    description: 'Tingkatkan visibilitas gambar dan kata kunci pendukung.'
  },
  {
    value: 'faq',
    label: 'FAQ',
    description: 'Optimalkan konten tanya jawab untuk rich snippets.'
  }
];

const MAX_SEO_HISTORY = 8;

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sanitizeSectionContent(key: WawasanKey, content: unknown): Record<string, unknown> {
  if (!content || typeof content !== 'object') {
    return {};
  }

  const clone = deepClone(content as Record<string, unknown>);

  if (key === 'sejarah') {
    if ('timeline' in clone) {
      delete (clone as Record<string, unknown> & { timeline?: unknown }).timeline;
    }

    const heritageValue = clone.heritage;
    if (heritageValue && typeof heritageValue === 'object') {
      const heritageClone = deepClone(heritageValue as Record<string, unknown>);
      if ('values' in heritageClone) {
        delete (heritageClone as Record<string, unknown> & { values?: unknown }).values;
      }
      clone.heritage = heritageClone;
    }
  }

  if (key === 'struktur' && 'entries' in clone) {
    delete (clone as Record<string, unknown> & { entries?: unknown }).entries;
  }

  return clone;
}

const DEFAULT_WAWASAN_CONTENT: Record<WawasanKey, { title: string; mediaUrl?: string | null; content: string }> = {
  sejarah: {
    title: sejarahMeta.title,
    mediaUrl: sejarahMeta.mediaUrl,
    content: JSON.stringify(sanitizeSectionContent('sejarah', sejarahFallback), null, 2)
  },
  'visi-misi': {
    title: visiMisiMeta.title,
    mediaUrl: visiMisiMeta.mediaUrl,
    content: JSON.stringify(visiMisiFallback, null, 2)
  },
  struktur: {
    title: strukturMeta.title,
    mediaUrl: strukturMeta.mediaUrl,
    content: JSON.stringify(sanitizeSectionContent('struktur', strukturFallback), null, 2)
  },
  'our-teams': {
    title: 'Tim Pengajar & Staff',
    mediaUrl: '/images/history/teachers-team.jpg',
    content: JSON.stringify(
      {
        introTitle: 'Tim Kami',
        introDescription:
          'Para pendidik dan staff berpengalaman yang berdedikasi mengembangkan potensi setiap siswa dengan nilai-nilai Vinsensian.',
        cta: {
          title: 'Bergabung dengan Komunitas Pendidik',
          description: 'Hubungi kami untuk kolaborasi atau informasi rekrutmen tenaga pendidik.',
          primary: { label: 'Hubungi Humas', href: 'mailto:humas@smakstlouis1sby.sch.id' },
          secondary: { label: 'Lihat PCPDB', href: '/pcpdb' }
        }
      },
      null,
      2
    )
  }
};

const WAWASAN_KEYS: WawasanKey[] = ['sejarah', 'visi-misi', 'struktur', 'our-teams'];

const WAWASAN_LABELS: Record<WawasanKey, string> = {
  sejarah: 'Sejarah',
  'visi-misi': 'Visi & Misi',
  struktur: 'Struktur Organisasi',
  'our-teams': 'Tim Pengajar & Staff'
};

const TEAM_CATEGORY_OPTIONS: Array<{ value: TeamMember['category']; label: string }> = [
  { value: 'leadership', label: 'Kepala Sekolah & Wakil' },
  { value: 'coordinators', label: 'Koordinator Bidang' },
  { value: 'teachers', label: 'Guru' },
  { value: 'staff', label: 'Staf Administrasi' },
  { value: 'support', label: 'Tenaga Pendukung' }
];

interface WawasanFormState {
  id?: string;
  key: WawasanKey;
  title: string;
  mediaUrl: string;
  content: string;
}

interface AdminDashboardViewProps {
  section: AdminSection | null;
}

function createSeoWelcomeMessage(topic: SeoTopic): SeoChatMessage {
  const topicLabel = SEO_TOPICS.find((item) => item.value === topic)?.label ?? 'Landing Page';

  return {
    role: 'assistant',
    content: `Halo! Saya asisten SEO AI. Kita akan fokus pada ${topicLabel}. Tanyakan apa pun seputar optimasi meta tag, struktur konten, atau strategi kata kunci untuk meningkatkan performa pencarian.`,
    recommendations: [
      'Mintalah audit cepat untuk melihat kelebihan dan kekurangan konten saat ini.',
      'Tanyakan rekomendasi kata kunci tambahan untuk menjangkau calon siswa dan orang tua.'
    ],
    followUpQuestions: [
      'Bagaimana cara meningkatkan CTR untuk halaman ini?',
      'Konten mana yang sebaiknya dipromosikan minggu ini?'
    ]
  };
}

type AdminSection =
  | 'overview'
  | 'landing'
  | 'wawasan'
  | 'documents'
  | 'validator'
  | 'validator-ai'
  | 'seo'
  | 'schedules'
  | 'settings';

const ADMIN_SECTION_META: Record<AdminSection, { title: string; description: string }> = {
  overview: {
    title: 'Dasbor Admin',
    description: 'Pantau ringkasan aktivitas portal dan akses cepat ke modul manajemen.'
  },
  landing: {
    title: 'Kelola Konten Landing',
    description: 'Perbarui pengumuman, FAQ, dan galeri yang tampil di halaman utama sekolah.'
  },
  wawasan: {
    title: 'Kelola Konten Wawasan',
    description: 'Atur Sejarah, Visi Misi, Struktur Organisasi, dan konten tim agar selalu terbaru.'
  },
  documents: {
    title: 'Manajemen Dokumen Resmi',
    description: 'Unggah, arsipkan, dan distribusikan dokumen resmi untuk seluruh komunitas sekolah.'
  },
  validator: {
    title: 'Validator Domain',
    description: 'Awasi keamanan tautan eksternal dan simpan riwayat pemeriksaan otomatis.'
  },
  'validator-ai': {
    title: 'Analisa Domain dengan AI',
    description: 'Gunakan Gemini AI untuk menilai apakah sebuah domain mengarah ke situs judi online.'
  },
  seo: {
    title: 'Asisten SEO AI',
    description: 'Diskusikan strategi SEO untuk konten sekolah dan dapatkan rekomendasi optimasi.'
  },
  schedules: {
    title: 'Jadwal Pelajaran',
    description: 'Susun jadwal belajar dan distribusikan ke kelas, guru, maupun siswa.'
  },
  settings: {
    title: 'Integrasi & Domain',
    description: 'Atur DSN Sentry, API key eksternal, serta origin yang diizinkan mengakses backend.'
  }
};

const ADMIN_QUICK_LINKS: Array<{ key: AdminSection; label: string; description: string; icon: typeof FileText }> = [
  {
    key: 'landing',
    label: 'Konten Landing',
    description: 'Kelola pengumuman, FAQ, dan galeri beranda secara terpusat.',
    icon: FileText
  },
  {
    key: 'wawasan',
    label: 'Konten Wawasan',
    description: 'Perbarui Sejarah, Visi Misi, struktur organisasi, dan tim sekolah.',
    icon: BookOpen
  },
  {
    key: 'documents',
    label: 'Dokumen Resmi',
    description: 'Unggah dokumen baru dan tinjau aktivitas unduhan terakhir.',
    icon: Upload
  },
  {
    key: 'validator',
    label: 'Validator Domain',
    description: 'Periksa tautan eksternal untuk memastikan keamanan komunitas.',
    icon: ShieldCheck
  },
  {
    key: 'validator-ai',
    label: 'AI Analyst',
    description: 'Analisa domain menggunakan Gemini AI untuk mendeteksi situs judi.',
    icon: Sparkles
  },
  {
    key: 'schedules',
    label: 'Jadwal Pelajaran',
    description: 'Atur jadwal per kelas, guru, dan ruang belajar.',
    icon: CalendarRange
  },
  {
    key: 'settings',
    label: 'Integrasi & Domain',
    description: 'Perbarui DSN Sentry, API key, serta daftar origin backend.',
    icon: SettingsIcon
  }
];

const AI_VERDICT_META: Record<AiDomainAnalysis['verdict'], { label: string; description: string; badgeClass: string }> = {
  gambling: {
    label: 'Diduga Situs Judi',
    description: 'Model menemukan indikator kuat bahwa domain terkait aktivitas perjudian daring.',
    badgeClass: 'bg-red-100 text-red-700 border border-red-200'
  },
  suspicious: {
    label: 'Indikasi Mencurigakan',
    description: 'Ada sinyal relevan terkait perjudian, tetapi bukti belum cukup kuat.',
    badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200'
  },
  safe: {
    label: 'Tidak Ada Indikasi Judi',
    description: 'Tidak ditemukan sinyal yang mengarah ke konten perjudian pada domain ini.',
    badgeClass: 'bg-green-100 text-green-700 border border-green-200'
  },
  unknown: {
    label: 'Data Tidak Cukup',
    description: 'Informasi yang tersedia tidak cukup untuk menarik kesimpulan.',
    badgeClass: 'bg-gray-100 text-gray-700 border border-gray-200'
  }
};

function isAdminSection(value: string): value is AdminSection {
  return value in ADMIN_SECTION_META;
}

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

function AdminDashboardView({ section }: AdminDashboardViewProps) {
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
  const [aiDomainUrl, setAiDomainUrl] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<AiDomainAnalysis | null>(null);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);
  const [activeSeoTopic, setActiveSeoTopic] = useState<SeoTopic>('landing');
  const [seoSessions, setSeoSessions] = useState<Record<SeoTopic, SeoChatMessage[]>>(() => {
    return SEO_TOPICS.reduce((accumulator, topic) => {
      accumulator[topic.value] = [createSeoWelcomeMessage(topic.value)];
      return accumulator;
    }, {} as Record<SeoTopic, SeoChatMessage[]>);
  });
  const [seoInput, setSeoInput] = useState('');
  const [seoError, setSeoError] = useState<string | null>(null);

  const [selectedWawasanKey, setSelectedWawasanKey] = useState<WawasanKey>('sejarah');
  const [wawasanForm, setWawasanForm] = useState<WawasanFormState>({
    key: 'sejarah',
    title: DEFAULT_WAWASAN_CONTENT.sejarah.title,
    mediaUrl: DEFAULT_WAWASAN_CONTENT.sejarah.mediaUrl ?? '',
    content: DEFAULT_WAWASAN_CONTENT.sejarah.content
  });
  const [wawasanMessage, setWawasanMessage] = useState<string | null>(null);
  const [wawasanErrorMessage, setWawasanErrorMessage] = useState<string | null>(null);

  const [timelineForm, setTimelineForm] = useState<WawasanTimelinePayload & { id?: string }>({
    period: '',
    description: '',
    order: undefined
  });
  const [timelineMessage, setTimelineMessage] = useState<string | null>(null);
  const [timelineErrorMessage, setTimelineErrorMessage] = useState<string | null>(null);

  const [heritageForm, setHeritageForm] = useState<WawasanHeritagePayload & { id?: string }>({
    value: '',
    order: undefined
  });
  const [heritageMessage, setHeritageMessage] = useState<string | null>(null);
  const [heritageErrorMessage, setHeritageErrorMessage] = useState<string | null>(null);

  const [structureForm, setStructureForm] = useState<WawasanStructurePayload & { id?: string }>({
    position: '',
    name: '',
    department: '',
    parentId: undefined,
    order: undefined
  });
  const [structureMessage, setStructureMessage] = useState<string | null>(null);
  const [structureErrorMessage, setStructureErrorMessage] = useState<string | null>(null);

  const [teamForm, setTeamForm] = useState<(TeamMemberPayload & { id?: string })>({
    name: '',
    role: '',
    category: 'teachers',
    department: '',
    email: '',
    education: '',
    experience: '',
    specialization: [],
    photo: '',
    order: undefined
  });
  const [teamMessage, setTeamMessage] = useState<string | null>(null);
  const [teamErrorMessage, setTeamErrorMessage] = useState<string | null>(null);

  const resetTimelineForm = () => {
    setTimelineForm({ period: '', description: '', order: undefined });
  };

  const resetHeritageForm = () => {
    setHeritageForm({ value: '', order: undefined });
  };

  const resetStructureForm = () => {
    setStructureForm({ position: '', name: '', department: '', parentId: undefined, order: undefined });
  };

  const resetTeamForm = () => {
    setTeamForm({
      id: undefined,
      name: '',
      role: '',
      category: 'teachers',
      department: '',
      email: '',
      education: '',
      experience: '',
      specialization: [],
      photo: '',
      order: undefined
    });
  };

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
  const [settingsForm, setSettingsForm] = useState({
    sentryDsn: '',
    virusTotalApiKey: '',
    googleSafeBrowsingKey: '',
    geminiApiKey: '',
    allowedOrigins: ''
  });
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);

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
    data: wawasanContents = [],
    isLoading: wawasanLoading,
    isError: wawasanError
  } = useQuery<WawasanSection<Record<string, unknown>>[]>({
    queryKey: ['wawasan', 'admin', 'list'],
    queryFn: fetchWawasanSections
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

  const {
    data: adminSettings,
    isLoading: settingsLoading
  } = useQuery<AdminSettings>({
    queryKey: ['admin-settings'],
    queryFn: fetchAdminSettings
  });

  const teachers = useMemo(
    () => users.filter((user) => user.role === 'teacher'),
    [users]
  );

  const activeSeoTopicMeta = useMemo(
    () => SEO_TOPICS.find((item) => item.value === activeSeoTopic) ?? SEO_TOPICS[0],
    [activeSeoTopic]
  );

  const seoMessages = useMemo(
    () => seoSessions[activeSeoTopic] ?? [createSeoWelcomeMessage(activeSeoTopic)],
    [activeSeoTopic, seoSessions]
  );

  const latestSeoAssistantMessage = useMemo(
    () => [...seoMessages].reverse().find((message) => message.role === 'assistant') ?? null,
    [seoMessages]
  );

  const selectedWawasanEntry = useMemo(
    () => wawasanContents.find((item) => item.key === selectedWawasanKey),
    [wawasanContents, selectedWawasanKey]
  );

  const wawasanMap = useMemo(() => {
    return wawasanContents.reduce<Record<WawasanKey, WawasanSection<Record<string, unknown>> | undefined>>(
      (accumulator, item) => {
        const key = item.key as WawasanKey;
        accumulator[key] = item;
        return accumulator;
      },
      {} as Record<WawasanKey, WawasanSection<Record<string, unknown>> | undefined>
    );
  }, [wawasanContents]);

  const wawasanLastUpdated = selectedWawasanEntry?.updatedAt
    ? new Date(selectedWawasanEntry.updatedAt)
    : null;

  const wawasanUsingFallback = !selectedWawasanEntry;

  const {
    data: timelineEntries = [],
    isLoading: timelineLoading
  } = useQuery<WawasanTimelineItem[]>({
    queryKey: ['wawasan', 'admin', 'timeline'],
    queryFn: fetchHistoryTimeline,
    enabled: selectedWawasanKey === 'sejarah'
  });

  const {
    data: heritageValues = [],
    isLoading: heritageLoading
  } = useQuery<WawasanHeritageValue[]>({
    queryKey: ['wawasan', 'admin', 'heritage'],
    queryFn: fetchHeritageValues,
    enabled: selectedWawasanKey === 'sejarah'
  });

  const {
    data: structureEntries = [],
    isLoading: structureLoading
  } = useQuery<WawasanStructureEntry[]>({
    queryKey: ['wawasan', 'admin', 'structure'],
    queryFn: fetchStructureEntries,
    enabled: selectedWawasanKey === 'struktur'
  });

  const {
    data: teamMembers = [],
    isLoading: teamLoading
  } = useQuery<TeamMember[]>({
    queryKey: ['teams', 'admin', 'wawasan'],
    queryFn: fetchTeamMembers,
    enabled: selectedWawasanKey === 'our-teams'
  });

  const sortedTimelineEntries = useMemo(() => {
    return [...timelineEntries].sort((a, b) => a.order - b.order);
  }, [timelineEntries]);

  const sortedHeritageValues = useMemo(() => {
    return [...heritageValues].sort((a, b) => a.order - b.order);
  }, [heritageValues]);

  const sortedStructureEntries = useMemo(() => {
    return [...structureEntries].sort((a, b) => a.order - b.order);
  }, [structureEntries]);

  const structureParentLookup = useMemo(() => {
    return structureEntries.reduce<Record<string, WawasanStructureEntry>>((accumulator, entry) => {
      accumulator[entry.id] = entry;
      return accumulator;
    }, {});
  }, [structureEntries]);

  const sortedTeamMembers = useMemo(() => {
    return [...teamMembers].sort((a, b) => {
      const categoryCompare = a.category.localeCompare(b.category);
      if (categoryCompare !== 0) {
        return categoryCompare;
      }
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.name.localeCompare(b.name);
    });
  }, [teamMembers]);

  useEffect(() => {
    if (!adminSettings) {
      return;
    }

    setSettingsForm((previous) => {
      const nextState = {
        sentryDsn: adminSettings.sentryDsn ?? '',
        virusTotalApiKey: adminSettings.virusTotalApiKey ?? '',
        googleSafeBrowsingKey: adminSettings.googleSafeBrowsingKey ?? '',
        geminiApiKey: adminSettings.geminiApiKey ?? '',
        allowedOrigins: adminSettings.allowedOrigins.join('\n')
      };

      if (
        previous.sentryDsn === nextState.sentryDsn &&
        previous.virusTotalApiKey === nextState.virusTotalApiKey &&
        previous.googleSafeBrowsingKey === nextState.googleSafeBrowsingKey &&
        previous.geminiApiKey === nextState.geminiApiKey &&
        previous.allowedOrigins === nextState.allowedOrigins
      ) {
        return previous;
      }

      return nextState;
    });
  }, [adminSettings]);

  useEffect(() => {
    const entry = wawasanContents.find((item) => item.key === selectedWawasanKey);
    const defaults = DEFAULT_WAWASAN_CONTENT[selectedWawasanKey];
    const resolvedTitle = entry?.title ?? defaults.title;
    const resolvedMedia = entry?.mediaUrl ?? defaults.mediaUrl ?? '';
    const formattedContent = entry
      ? JSON.stringify(sanitizeSectionContent(selectedWawasanKey, entry.content), null, 2)
      : defaults.content;

    setWawasanForm((previous) => {
      const nextState: WawasanFormState = {
        id: entry?.id,
        key: selectedWawasanKey,
        title: resolvedTitle,
        mediaUrl: resolvedMedia ?? '',
        content: formattedContent
      };

      if (
        previous.id === nextState.id &&
        previous.key === nextState.key &&
        previous.title === nextState.title &&
        previous.mediaUrl === nextState.mediaUrl &&
        previous.content === nextState.content
      ) {
        return previous;
      }

      return nextState;
    });
  }, [selectedWawasanKey, wawasanContents]);

  useEffect(() => {
    setWawasanMessage(null);
    setWawasanErrorMessage(null);
  }, [selectedWawasanKey]);

  useEffect(() => {
    if (selectedWawasanKey !== 'sejarah') {
      resetTimelineForm();
      resetHeritageForm();
      setTimelineMessage(null);
      setTimelineErrorMessage(null);
      setHeritageMessage(null);
      setHeritageErrorMessage(null);
    }

    if (selectedWawasanKey !== 'struktur') {
      resetStructureForm();
      setStructureMessage(null);
      setStructureErrorMessage(null);
    }

    if (selectedWawasanKey !== 'our-teams') {
      resetTeamForm();
      setTeamMessage(null);
      setTeamErrorMessage(null);
    }
  }, [selectedWawasanKey]);

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

  const aiValidatorMutation = useMutation<AiDomainAnalysis, unknown, string>({
    mutationFn: (url) => analyzeDomainWithAI(url),
    onSuccess: (data) => {
      setAiAnalysis(data);
      setAiAnalysisError(null);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal menganalisa domain dengan AI.';
      setAiAnalysisError(message);
    }
  });

  const seoChatMutation = useMutation<SeoChatResponse, unknown, SeoChatPayload>({
    mutationFn: (payload) => sendSeoChat(payload),
    onSuccess: (data, variables) => {
      const assistantMessage: SeoChatMessage = {
        role: 'assistant',
        content: data.reply,
        keywords: data.keywords,
        recommendations: data.recommendations,
        suggestedTitle: data.suggestedTitle,
        suggestedDescription: data.suggestedDescription,
        followUpQuestions: data.followUpQuestions
      };

      setSeoError(null);
      setSeoSessions((prev) => {
        const existingHistory = prev[variables.topic] ?? [createSeoWelcomeMessage(variables.topic)];
        const updatedHistory = [...existingHistory, assistantMessage].slice(-MAX_SEO_HISTORY);
        return {
          ...prev,
          [variables.topic]: updatedHistory
        };
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal menghubungi asisten SEO AI.';
      setSeoError(message);
    }
  });

  const wawasanSaveMutation = useMutation<
    WawasanSection<Record<string, unknown>>,
    unknown,
    { key: WawasanKey; payload: WawasanSectionPayload<Record<string, unknown>> }
  >({
    mutationFn: ({ key, payload }) => updateWawasanSection<Record<string, unknown>>(key, payload),
    onSuccess: (saved, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wawasan', 'admin', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['wawasan', 'admin', variables.key] });
      setWawasanMessage('Konten wawasan berhasil disimpan.');
      setWawasanErrorMessage(null);

      const normalizedContent = JSON.stringify(
        sanitizeSectionContent(saved.key as WawasanKey, saved.content),
        null,
        2
      );

      setWawasanForm({
        id: saved.id,
        key: saved.key as WawasanKey,
        title: saved.title,
        mediaUrl: saved.mediaUrl ?? '',
        content: normalizedContent
      });
      setSelectedWawasanKey(saved.key as WawasanKey);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal menyimpan konten wawasan.';
      setWawasanErrorMessage(message);
      setWawasanMessage(null);
    }
  });

  const createTimelineMutation = useMutation<WawasanTimelineItem, unknown, WawasanTimelinePayload>({
    mutationFn: (payload) => createHistoryTimelineEntry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wawasan', 'admin', 'timeline'] });
      setTimelineMessage('Peristiwa baru ditambahkan ke timeline.');
      setTimelineErrorMessage(null);
      resetTimelineForm();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal menambahkan peristiwa timeline.';
      setTimelineErrorMessage(message);
      setTimelineMessage(null);
    }
  });

  const updateTimelineMutation = useMutation<
    WawasanTimelineItem,
    unknown,
    { id: string; payload: WawasanTimelinePayload }
  >({
    mutationFn: ({ id, payload }) => updateHistoryTimelineEntry(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wawasan', 'admin', 'timeline'] });
      setTimelineMessage('Peristiwa timeline berhasil diperbarui.');
      setTimelineErrorMessage(null);
      resetTimelineForm();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui peristiwa timeline.';
      setTimelineErrorMessage(message);
      setTimelineMessage(null);
    }
  });

  const deleteTimelineMutation = useMutation<void, unknown, string>({
    mutationFn: (id) => deleteHistoryTimelineEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wawasan', 'admin', 'timeline'] });
      setTimelineMessage('Peristiwa timeline dihapus.');
      setTimelineErrorMessage(null);
      resetTimelineForm();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal menghapus peristiwa timeline.';
      setTimelineErrorMessage(message);
      setTimelineMessage(null);
    }
  });

  const createHeritageMutation = useMutation<WawasanHeritageValue, unknown, WawasanHeritagePayload>({
    mutationFn: (payload) => createHeritageValue(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wawasan', 'admin', 'heritage'] });
      setHeritageMessage('Nilai warisan berhasil ditambahkan.');
      setHeritageErrorMessage(null);
      resetHeritageForm();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal menambahkan nilai warisan.';
      setHeritageErrorMessage(message);
      setHeritageMessage(null);
    }
  });

  const updateHeritageMutation = useMutation<
    WawasanHeritageValue,
    unknown,
    { id: string; payload: WawasanHeritagePayload }
  >({
    mutationFn: ({ id, payload }) => updateHeritageValue(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wawasan', 'admin', 'heritage'] });
      setHeritageMessage('Nilai warisan berhasil diperbarui.');
      setHeritageErrorMessage(null);
      resetHeritageForm();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui nilai warisan.';
      setHeritageErrorMessage(message);
      setHeritageMessage(null);
    }
  });

  const deleteHeritageMutation = useMutation<void, unknown, string>({
    mutationFn: (id) => deleteHeritageValue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wawasan', 'admin', 'heritage'] });
      setHeritageMessage('Nilai warisan dihapus.');
      setHeritageErrorMessage(null);
      resetHeritageForm();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal menghapus nilai warisan.';
      setHeritageErrorMessage(message);
      setHeritageMessage(null);
    }
  });

  const createStructureMutation = useMutation<WawasanStructureEntry, unknown, WawasanStructurePayload>({
    mutationFn: (payload) => createStructureEntry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wawasan', 'admin', 'structure'] });
      setStructureMessage('Struktur organisasi ditambahkan.');
      setStructureErrorMessage(null);
      resetStructureForm();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal menambahkan struktur organisasi.';
      setStructureErrorMessage(message);
      setStructureMessage(null);
    }
  });

  const updateStructureMutation = useMutation<
    WawasanStructureEntry,
    unknown,
    { id: string; payload: WawasanStructurePayload }
  >({
    mutationFn: ({ id, payload }) => updateStructureEntry(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wawasan', 'admin', 'structure'] });
      setStructureMessage('Struktur organisasi diperbarui.');
      setStructureErrorMessage(null);
      resetStructureForm();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui struktur organisasi.';
      setStructureErrorMessage(message);
      setStructureMessage(null);
    }
  });

  const deleteStructureMutation = useMutation<void, unknown, string>({
    mutationFn: (id) => deleteStructureEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wawasan', 'admin', 'structure'] });
      setStructureMessage('Struktur organisasi dihapus.');
      setStructureErrorMessage(null);
      resetStructureForm();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal menghapus struktur organisasi.';
      setStructureErrorMessage(message);
      setStructureMessage(null);
    }
  });

  const createTeamMutation = useMutation<TeamMember, unknown, TeamMemberPayload>({
    mutationFn: (payload) => createTeamMember(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'admin', 'wawasan'] });
      setTeamMessage('Anggota tim berhasil ditambahkan.');
      setTeamErrorMessage(null);
      resetTeamForm();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal menambahkan anggota tim.';
      setTeamErrorMessage(message);
      setTeamMessage(null);
    }
  });

  const updateTeamMutation = useMutation<
    TeamMember,
    unknown,
    { id: string; payload: TeamMemberPayload }
  >({
    mutationFn: ({ id, payload }) => updateTeamMember(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'admin', 'wawasan'] });
      setTeamMessage('Data anggota tim diperbarui.');
      setTeamErrorMessage(null);
      resetTeamForm();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui anggota tim.';
      setTeamErrorMessage(message);
      setTeamMessage(null);
    }
  });

  const deleteTeamMutation = useMutation<void, unknown, string>({
    mutationFn: (id) => deleteTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'admin', 'wawasan'] });
      setTeamMessage('Anggota tim dihapus.');
      setTeamErrorMessage(null);
      resetTeamForm();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Gagal menghapus anggota tim.';
      setTeamErrorMessage(message);
      setTeamMessage(null);
    }
  });

  const timelineSubmitting = createTimelineMutation.isPending || updateTimelineMutation.isPending;
  const heritageSubmitting = createHeritageMutation.isPending || updateHeritageMutation.isPending;
  const structureSubmitting = createStructureMutation.isPending || updateStructureMutation.isPending;
  const teamSubmitting = createTeamMutation.isPending || updateTeamMutation.isPending;

  const handleSeoTopicSelect = (topic: SeoTopic) => {
    setActiveSeoTopic(topic);
    setSeoInput('');
    setSeoError(null);
    setSeoSessions((prev) => {
      if (prev[topic]) {
        return prev;
      }
      return {
        ...prev,
        [topic]: [createSeoWelcomeMessage(topic)]
      };
    });
  };

  const handleSeoReset = (topic: SeoTopic = activeSeoTopic) => {
    setSeoSessions((prev) => ({
      ...prev,
      [topic]: [createSeoWelcomeMessage(topic)]
    }));
    setSeoInput('');
    setSeoError(null);
  };

  const sendSeoQuestion = (question: string, topic: SeoTopic = activeSeoTopic) => {
    const trimmed = question.trim();
    if (!trimmed || seoChatMutation.isPending) {
      return;
    }

    setSeoError(null);

    const existingHistory = seoSessions[topic] ?? [createSeoWelcomeMessage(topic)];
    const newMessage: SeoChatMessage = { role: 'user', content: trimmed };
    const updatedHistory = [...existingHistory, newMessage].slice(-MAX_SEO_HISTORY);

    setSeoSessions((prev) => ({
      ...prev,
      [topic]: updatedHistory
    }));

    setSeoInput('');

    seoChatMutation.mutate({
      topic,
      messages: updatedHistory.map((historyItem) => ({ role: historyItem.role, content: historyItem.content }))
    });
  };

  const handleSeoSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendSeoQuestion(seoInput, activeSeoTopic);
  };

  const handleSeoFollowUp = (question: string) => {
    sendSeoQuestion(question, activeSeoTopic);
  };

  const handleWawasanSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWawasanMessage(null);
    setWawasanErrorMessage(null);

    const trimmedTitle = wawasanForm.title.trim();
    const trimmedMedia = wawasanForm.mediaUrl.trim();
    const rawContent = wawasanForm.content.trim();

    if (!trimmedTitle) {
      setWawasanErrorMessage('Judul tidak boleh kosong.');
      return;
    }

    if (!rawContent) {
      setWawasanErrorMessage('Konten tidak boleh kosong.');
      return;
    }

    let parsedContent: unknown;
    try {
      parsedContent = JSON.parse(rawContent);
    } catch {
      setWawasanErrorMessage('Konten harus berupa JSON valid. Periksa kembali struktur data.');
      return;
    }

    const sanitizedContent = sanitizeSectionContent(selectedWawasanKey, parsedContent);

    const payload: WawasanSectionPayload<Record<string, unknown>> = {
      title: trimmedTitle,
      mediaUrl: trimmedMedia ? trimmedMedia : null,
      content: sanitizedContent
    };

    wawasanSaveMutation.mutate({ key: wawasanForm.key, payload });
  };

  const handleWawasanReset = () => {
    const defaults = DEFAULT_WAWASAN_CONTENT[selectedWawasanKey];
    setWawasanForm((prev) => ({
      id: prev.id,
      key: selectedWawasanKey,
      title: defaults.title,
      mediaUrl: defaults.mediaUrl ?? '',
      content: defaults.content
    }));
    setWawasanMessage(null);
    setWawasanErrorMessage(null);
  };

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

  const settingsSaveMutation = useMutation({
    mutationFn: (payload: AdminSettingsPayload) => updateAdminSettings(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin-settings'], updated);
      setSettingsMessage('Pengaturan berhasil disimpan.');
      setSettingsForm({
        sentryDsn: updated.sentryDsn ?? '',
        virusTotalApiKey: updated.virusTotalApiKey ?? '',
        googleSafeBrowsingKey: updated.googleSafeBrowsingKey ?? '',
        geminiApiKey: updated.geminiApiKey ?? '',
        allowedOrigins: updated.allowedOrigins.join('\n')
      });
    },
    onError: () => {
      setSettingsMessage('Gagal menyimpan pengaturan.');
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

  const handleTimelineSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedWawasanKey !== 'sejarah') {
      return;
    }
    setTimelineMessage(null);
    setTimelineErrorMessage(null);

    const period = timelineForm.period.trim();
    const description = timelineForm.description.trim();
    if (!period || !description) {
      setTimelineErrorMessage('Periode dan deskripsi peristiwa wajib diisi.');
      return;
    }

    const payload: WawasanTimelinePayload = {
      period,
      description,
      order: typeof timelineForm.order === 'number' ? timelineForm.order : undefined
    };

    if (timelineForm.id) {
      updateTimelineMutation.mutate({ id: timelineForm.id, payload });
    } else {
      createTimelineMutation.mutate(payload);
    }
  };

  const handleTimelineEdit = (item: WawasanTimelineItem) => {
    setTimelineForm({ id: item.id, period: item.period, description: item.description, order: item.order });
    setTimelineMessage(null);
    setTimelineErrorMessage(null);
  };

  const handleTimelineDelete = (id: string) => {
    if (!confirm('Hapus peristiwa dari timeline sejarah?')) {
      return;
    }
    deleteTimelineMutation.mutate(id);
  };

  const handleHeritageSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedWawasanKey !== 'sejarah') {
      return;
    }
    setHeritageMessage(null);
    setHeritageErrorMessage(null);

    const value = heritageForm.value.trim();
    if (!value) {
      setHeritageErrorMessage('Isi nilai warisan terlebih dahulu.');
      return;
    }

    const payload: WawasanHeritagePayload = {
      value,
      order: typeof heritageForm.order === 'number' ? heritageForm.order : undefined
    };

    if (heritageForm.id) {
      updateHeritageMutation.mutate({ id: heritageForm.id, payload });
    } else {
      createHeritageMutation.mutate(payload);
    }
  };

  const handleHeritageEdit = (item: WawasanHeritageValue) => {
    setHeritageForm({ id: item.id, value: item.value, order: item.order });
    setHeritageMessage(null);
    setHeritageErrorMessage(null);
  };

  const handleHeritageDelete = (id: string) => {
    if (!confirm('Hapus nilai warisan ini?')) {
      return;
    }
    deleteHeritageMutation.mutate(id);
  };

  const handleStructureSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedWawasanKey !== 'struktur') {
      return;
    }
    setStructureMessage(null);
    setStructureErrorMessage(null);

    const position = structureForm.position.trim();
    const name = structureForm.name.trim();
    if (!position || !name) {
      setStructureErrorMessage('Isi jabatan dan nama terlebih dahulu.');
      return;
    }

    const payload: WawasanStructurePayload = {
      position,
      name,
      department: structureForm.department?.trim() ? structureForm.department.trim() : undefined,
      parentId: structureForm.parentId ?? null,
      order: typeof structureForm.order === 'number' ? structureForm.order : undefined
    };

    if (structureForm.id) {
      updateStructureMutation.mutate({ id: structureForm.id, payload });
    } else {
      createStructureMutation.mutate(payload);
    }
  };

  const handleStructureEdit = (entry: WawasanStructureEntry) => {
    setStructureForm({
      id: entry.id,
      position: entry.position,
      name: entry.name,
      department: entry.department ?? '',
      parentId: entry.parentId ?? undefined,
      order: entry.order
    });
    setStructureMessage(null);
    setStructureErrorMessage(null);
  };

  const handleStructureDelete = (id: string) => {
    if (!confirm('Hapus entri struktur organisasi ini?')) {
      return;
    }
    deleteStructureMutation.mutate(id);
  };

  const handleTeamSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedWawasanKey !== 'our-teams') {
      return;
    }
    setTeamMessage(null);
    setTeamErrorMessage(null);

    const name = teamForm.name.trim();
    const role = teamForm.role.trim();
    if (!name || !role) {
      setTeamErrorMessage('Nama dan peran anggota tim wajib diisi.');
      return;
    }

    const specialization = (teamForm.specialization ?? []).map((item) => item.trim()).filter(Boolean);

    const payload: TeamMemberPayload = {
      name,
      role,
      category: teamForm.category,
      department: teamForm.department?.trim() ? teamForm.department.trim() : undefined,
      email: teamForm.email?.trim() ? teamForm.email.trim() : undefined,
      education: teamForm.education?.trim() ? teamForm.education.trim() : undefined,
      experience: teamForm.experience?.trim() ? teamForm.experience.trim() : undefined,
      specialization: specialization.length > 0 ? specialization : undefined,
      photo: teamForm.photo?.trim() ? teamForm.photo.trim() : undefined,
      order: typeof teamForm.order === 'number' ? teamForm.order : undefined
    };

    if (teamForm.id) {
      updateTeamMutation.mutate({ id: teamForm.id, payload });
    } else {
      createTeamMutation.mutate(payload);
    }
  };

  const handleTeamEdit = (member: TeamMember) => {
    setTeamForm({
      id: member.id,
      name: member.name,
      role: member.role,
      category: member.category,
      department: member.department ?? '',
      email: member.email ?? '',
      education: member.education ?? '',
      experience: member.experience ?? '',
      specialization: member.specialization ?? [],
      photo: member.photo ?? '',
      order: member.order
    });
    setTeamMessage(null);
    setTeamErrorMessage(null);
  };

  const handleTeamDelete = (id: string) => {
    if (!confirm('Hapus anggota tim ini?')) {
      return;
    }
    deleteTeamMutation.mutate(id);
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

  const handleAiAnalysisSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = aiDomainUrl.trim();
    if (!trimmed) {
      setAiAnalysisError('Masukkan URL atau nama domain terlebih dahulu.');
      return;
    }
    setAiAnalysisError(null);
    setAiAnalysis(null);
    aiValidatorMutation.mutate(trimmed);
  };

  const handleSettingsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettingsMessage(null);

    const allowedOrigins = settingsForm.allowedOrigins
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);

    const payload: AdminSettingsPayload = {
      sentryDsn: settingsForm.sentryDsn.trim() ? settingsForm.sentryDsn.trim() : null,
      virusTotalApiKey: settingsForm.virusTotalApiKey.trim() ? settingsForm.virusTotalApiKey.trim() : null,
      googleSafeBrowsingKey: settingsForm.googleSafeBrowsingKey.trim() ? settingsForm.googleSafeBrowsingKey.trim() : null,
      geminiApiKey: settingsForm.geminiApiKey.trim() ? settingsForm.geminiApiKey.trim() : null,
      allowedOrigins: allowedOrigins.length ? allowedOrigins : []
    };

    settingsSaveMutation.mutate(payload);
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
  const upcomingSchedules = schedules.slice(0, 5);
  const documentPreview = documents.slice(0, 5);
  const recentAnnouncements = announcements.slice(0, 4);
  const aiVerdictMeta = aiAnalysis ? AI_VERDICT_META[aiAnalysis.verdict] : null;
  const aiConfidencePercent = aiAnalysis?.confidence != null ? Math.round(aiAnalysis.confidence * 100) : null;
  const aiHeaderEntries = aiAnalysis ? Object.entries(aiAnalysis.headers ?? {}) : [];

  if (!section) {
    return <Navigate to="/dashboard/admin/overview" replace />;
  }

  const sectionMeta = ADMIN_SECTION_META[section];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-school-admin to-school-accent-dark rounded-2xl p-6 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{sectionMeta.title}</h1>
            <p className="text-blue-100 max-w-2xl">{sectionMeta.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ADMIN_QUICK_LINKS.filter((item) => item.key !== section).map((item) => (
              <Link
                key={item.key}
                to={`/dashboard/admin/${item.key}`}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition"
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {section === 'overview' && (
        <>
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

          <section className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
            <div className="rounded-xl border border-school-border bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-school-text">Pengumuman Terbaru</h2>
                <Link to="/dashboard/admin/landing" className="text-sm text-school-accent hover:underline">
                  Kelola
                </Link>
              </div>
              {announcementsLoading ? (
                <div className="flex items-center gap-2 text-sm text-school-text-muted">
                  <Loader2 size={16} className="animate-spin" /> Memuat pengumuman...
                </div>
              ) : recentAnnouncements.length === 0 ? (
                <p className="text-sm text-school-text-muted">Belum ada pengumuman yang tersimpan.</p>
              ) : (
                <div className="space-y-3">
                  {recentAnnouncements.map((item) => (
                    <article key={item.id} className="rounded-lg border border-school-border p-4">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-school-text-muted">
                        <span className="rounded-full bg-school-accent/10 px-2 py-0.5 font-semibold text-school-accent">{item.category}</span>
                        <span>{new Date(item.date).toLocaleDateString('id-ID')}</span>
                        {item.pinned && (
                          <span className="rounded-full bg-school-accent-dark/10 px-2 py-0.5 text-school-accent-dark">Penting</span>
                        )}
                      </div>
                      <h3 className="mt-2 text-sm font-semibold text-school-text">{item.title}</h3>
                      <p className="mt-1 text-sm text-school-text-muted line-clamp-2">{item.summary}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-school-border bg-white p-6 space-y-4">
              <h2 className="text-lg font-semibold text-school-text">Navigasi Cepat</h2>
              <p className="text-sm text-school-text-muted">Lompat ke modul administrasi lainnya.</p>
              <div className="space-y-3">
                {ADMIN_QUICK_LINKS.map((item) => (
                  <Link
                    key={item.key}
                    to={`/dashboard/admin/${item.key}`}
                    className={`flex items-center justify-between gap-3 rounded-lg border border-school-border px-3 py-2 text-sm transition hover:bg-school-surface ${
                      item.key === section ? 'bg-school-surface' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-school-surface p-2 text-school-accent">
                        <item.icon size={18} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-school-text">{item.label}</p>
                        <p className="text-xs text-school-text-muted">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-school-text-muted" />
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
            <div className="rounded-xl border border-school-border bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-school-text">Dokumen Terbaru</h2>
                <Link to="/dashboard/admin/documents" className="text-sm text-school-accent hover:underline">
                  Kelola
                </Link>
              </div>
              {documentsLoading ? (
                <div className="flex items-center gap-2 text-sm text-school-text-muted">
                  <Loader2 size={16} className="animate-spin" /> Memuat dokumen...
                </div>
              ) : documentsError ? (
                <p className="text-sm text-red-600">Gagal memuat dokumen.</p>
              ) : documentPreview.length === 0 ? (
                <p className="text-sm text-school-text-muted">Belum ada dokumen yang diunggah.</p>
              ) : (
                <ul className="space-y-3 text-sm text-school-text">
                  {documentPreview.map((doc) => (
                    <li key={doc.id} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{doc.title ?? doc.originalFileName}</p>
                        <p className="text-xs text-school-text-muted">{formatDateTime(doc.issuedAt)}</p>
                      </div>
                      <span className="text-xs text-school-text-muted">{formatFileSize(doc.fileSize)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-school-border bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-school-text">Riwayat Validasi Terbaru</h2>
                <Link to="/dashboard/admin/validator" className="text-sm text-school-accent hover:underline">
                  Lihat semua
                </Link>
              </div>
              {validatorLoading ? (
                <div className="flex items-center gap-2 text-sm text-school-text-muted">
                  <Loader2 size={16} className="animate-spin" /> Memuat riwayat...
                </div>
              ) : recentValidator.length === 0 ? (
                <p className="text-sm text-school-text-muted">Belum ada riwayat pemeriksaan.</p>
              ) : (
                <div className="space-y-3 text-sm">
                  {recentValidator.map((entry) => (
                    <div key={entry.id} className="flex items-start justify-between gap-3 rounded-lg border border-school-border px-3 py-2">
                      <div>
                        <p className="font-medium text-school-text">{entry.url}</p>
                        <p className="text-xs text-school-text-muted">{formatDateTime(entry.scannedAt)}</p>
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

          <section className="rounded-xl border border-school-border bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-school-text">Jadwal Mendatang</h2>
              <Link to="/dashboard/admin/schedules" className="text-sm text-school-accent hover:underline">
                Kelola
              </Link>
            </div>
            {schedulesLoading ? (
              <div className="flex items-center gap-2 text-sm text-school-text-muted">
                <Loader2 size={16} className="animate-spin" /> Memuat jadwal...
              </div>
            ) : upcomingSchedules.length === 0 ? (
              <p className="text-sm text-school-text-muted">Belum ada jadwal yang tercatat.</p>
            ) : (
              <div className="space-y-3">
                {upcomingSchedules.map((scheduleItem) => (
                  <div key={scheduleItem.id} className="flex flex-col gap-1 rounded-lg border border-school-border px-4 py-3 text-sm text-school-text">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">{scheduleItem.subject.name}</span>
                      <span className="text-xs text-school-text-muted">{scheduleItem.class.name}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-school-text-muted">
                      <span>{scheduleItem.dayOfWeek}</span>
                      <span>
                        {new Date(scheduleItem.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(scheduleItem.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>{scheduleItem.teacher.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {section === 'settings' && (
        <section className="space-y-6 rounded-xl border border-school-border bg-white p-6">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-school-text flex items-center gap-2">
            <SettingsIcon size={20} />
            Pengaturan Integrasi & Domain
          </h2>
          <p className="text-sm text-school-text-muted max-w-2xl">
            Perbarui kredensial layanan pihak ketiga serta daftar origin yang diizinkan mengakses backend tanpa perlu mengubah file environment.
          </p>
        </div>

        <form onSubmit={handleSettingsSubmit} className="grid gap-4 rounded-xl border border-school-border bg-school-surface p-4">
          <div className="grid gap-1 text-sm text-school-text">
            <span>Sentry DSN</span>
            <input
              type="text"
              value={settingsForm.sentryDsn}
              onChange={(event) => setSettingsForm((prev) => ({ ...prev, sentryDsn: event.target.value }))}
              className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
              placeholder="https://public@o0.ingest.sentry.io/0"
              autoComplete="off"
              disabled={settingsLoading || settingsSaveMutation.isPending}
            />
            <p className="text-xs text-school-text-muted">Kosongkan jika ingin menonaktifkan pelaporan error ke Sentry.</p>
          </div>

          <div className="grid gap-1 text-sm text-school-text">
            <span>VirusTotal API Key</span>
            <input
              type="text"
              value={settingsForm.virusTotalApiKey}
              onChange={(event) => setSettingsForm((prev) => ({ ...prev, virusTotalApiKey: event.target.value }))}
              className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
              placeholder="vt_api_key_123"
              autoComplete="off"
              disabled={settingsLoading || settingsSaveMutation.isPending}
            />
            <p className="text-xs text-school-text-muted">Digunakan untuk validasi domain melalui layanan VirusTotal.</p>
          </div>

          <div className="grid gap-1 text-sm text-school-text">
            <span>Google Safe Browsing API Key</span>
            <input
              type="text"
              value={settingsForm.googleSafeBrowsingKey}
              onChange={(event) => setSettingsForm((prev) => ({ ...prev, googleSafeBrowsingKey: event.target.value }))}
              className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
              placeholder="AIzaSy..."
              autoComplete="off"
              disabled={settingsLoading || settingsSaveMutation.isPending}
            />
            <p className="text-xs text-school-text-muted">Opsional — aktifkan bila ingin menambah lapisan pemeriksaan ke Google Safe Browsing.</p>
          </div>

          <div className="grid gap-1 text-sm text-school-text">
            <span>Gemini AI Studio API Key</span>
            <input
              type="text"
              value={settingsForm.geminiApiKey}
              onChange={(event) => setSettingsForm((prev) => ({ ...prev, geminiApiKey: event.target.value }))}
              className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
              placeholder="AIza..."
              autoComplete="off"
              disabled={settingsLoading || settingsSaveMutation.isPending}
            />
            <p className="text-xs text-school-text-muted">Diperlukan untuk analisa domain berbasis Gemini AI.</p>
          </div>

          <div className="grid gap-1 text-sm text-school-text">
            <span>Allowed Origins</span>
            <textarea
              value={settingsForm.allowedOrigins}
              onChange={(event) => setSettingsForm((prev) => ({ ...prev, allowedOrigins: event.target.value }))}
              className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
              rows={4}
              placeholder={['https://admin.domainkamu.com', 'https://portal.domainkamu.com'].join('\n')}
              disabled={settingsLoading || settingsSaveMutation.isPending}
            />
            <p className="text-xs text-school-text-muted">Masukkan satu origin per baris. Gunakan <code>*</code> untuk mengizinkan semua origin (tidak direkomendasikan).</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-school-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-school-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={settingsLoading || settingsSaveMutation.isPending}
            >
              {settingsSaveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Simpan Pengaturan
            </button>
          </div>

          {settingsMessage && <p className="text-sm text-school-text-muted">{settingsMessage}</p>}
          {settingsLoading && !settingsSaveMutation.isPending && !adminSettings && (
            <p className="text-sm text-school-text-muted">Memuat pengaturan terkini...</p>
          )}
        </form>
        </section>
      )}

      {section === 'landing' && (
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
      )}

      {section === 'wawasan' && (
        <section className="space-y-6 rounded-xl border border-school-border bg-white p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-school-text flex items-center gap-2">
                <BookOpen size={20} />
                Kelola Konten Wawasan
              </h2>
              <p className="text-sm text-school-text-muted">
                Perbarui Sejarah, Visi Misi, struktur organisasi, dan konten tim yang tampil di halaman Wawasan.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
            <aside className="space-y-4">
              <div className="space-y-3 rounded-xl border border-school-border bg-school-surface p-4">
                <div className="flex items-center justify-between text-sm text-school-text">
                  <span className="font-semibold">Bagian Wawasan</span>
                  {wawasanLoading && (
                    <span className="inline-flex items-center gap-1 text-xs text-school-text-muted">
                      <Loader2 size={14} className="animate-spin" /> Memuat
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {WAWASAN_KEYS.map((key) => {
                    const entry = wawasanMap[key];
                    const isActive = key === selectedWawasanKey;
                    const statusClass = entry ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';
                    const statusLabel = entry ? 'Tersimpan' : 'Cadangan';
                    const timestamp = entry?.updatedAt ?? entry?.createdAt;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedWawasanKey(key)}
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                          isActive
                            ? 'border-school-accent bg-white text-school-text shadow-sm'
                            : 'border-school-border bg-white text-school-text-muted hover:bg-school-sidebar-hover'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">{WAWASAN_LABELS[key]}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </div>
                        {timestamp && (
                          <p className="mt-1 text-[11px] text-school-text-muted">
                            {new Date(timestamp).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-school-border bg-school-surface p-4 text-xs text-school-text-muted">
                <p>
                  Konten disimpan sebagai JSON terstruktur. Gunakan tombol <span className="font-semibold">Simpan</span> setelah melakukan perubahan.
                </p>
                <p>
                  Tombol <span className="font-semibold">Reset ke Default</span> akan memuat ulang konten cadangan bawaan.
                </p>
              </div>
            </aside>

            <div className="space-y-4 rounded-xl border border-school-border bg-school-surface p-5">
              <form onSubmit={handleWawasanSubmit} className="space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-school-text">
                      {WAWASAN_LABELS[selectedWawasanKey]}
                    </h3>
                    <p className="text-sm text-school-text-muted">
                      {DEFAULT_WAWASAN_CONTENT[selectedWawasanKey].title}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-school-text-muted">
                    {wawasanUsingFallback ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700">
                        <AlertTriangle size={12} />
                        Menggunakan data cadangan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700">
                        <ShieldCheck size={12} />
                        Data tersimpan
                      </span>
                    )}
                    {wawasanLastUpdated && (
                      <span>
                        Terakhir diperbarui{' '}
                        {wawasanLastUpdated.toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 text-sm">
                  <label className="grid gap-1 text-school-text">
                    <span>Judul</span>
                    <input
                      type="text"
                      value={wawasanForm.title}
                      onChange={(event) => setWawasanForm((prev) => ({ ...prev, title: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-school-text">
                    <span>Media URL (opsional)</span>
                    <input
                      type="url"
                      value={wawasanForm.mediaUrl}
                      onChange={(event) => setWawasanForm((prev) => ({ ...prev, mediaUrl: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                      placeholder="https://..."
                    />
                  </label>
                  <label className="grid gap-1 text-school-text">
                    <span>Konten JSON</span>
                    <textarea
                      value={wawasanForm.content}
                      onChange={(event) => setWawasanForm((prev) => ({ ...prev, content: event.target.value }))}
                      className="min-h-[320px] w-full rounded-lg border border-school-border px-3 py-2 font-mono text-xs leading-5 focus:outline-none focus:ring-2 focus:ring-school-accent"
                      spellCheck={false}
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handleWawasanReset}
                    className="inline-flex items-center gap-2 rounded-lg border border-school-border px-4 py-2 text-sm font-medium text-school-text hover:bg-white"
                    disabled={wawasanSaveMutation.isPending}
                  >
                    <RefreshCw size={16} />
                    Reset ke Default
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-school-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-school-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={wawasanSaveMutation.isPending}
                  >
                    {wawasanSaveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Simpan Konten
                  </button>
                </div>
              </form>
              {wawasanMessage && <p className="text-sm text-school-text-muted">{wawasanMessage}</p>}
              {wawasanErrorMessage && <p className="text-sm text-red-500">{wawasanErrorMessage}</p>}
              {wawasanError && (
                <p className="text-sm text-red-500">
                  Gagal memuat data dari server. Konten yang ditampilkan berasal dari cadangan lokal.
                </p>
              )}
            </div>
          </div>

          {selectedWawasanKey === 'sejarah' && (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4 rounded-xl border border-school-border bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-school-text">Kelola Timeline Sejarah</h3>
                      <p className="text-sm text-school-text-muted">
                        Tambahkan tonggak perjalanan sekolah secara kronologis.
                      </p>
                    </div>
                    {timelineForm.id && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-school-accent/10 px-3 py-1 text-xs font-semibold text-school-accent">
                        Mengedit entri
                      </span>
                    )}
                  </div>
                  <form onSubmit={handleTimelineSubmit} className="space-y-3">
                    <label className="grid gap-1 text-sm text-school-text">
                      <span>Periode</span>
                      <input
                        type="text"
                        value={timelineForm.period}
                        onChange={(event) => setTimelineForm((prev) => ({ ...prev, period: event.target.value }))}
                        className="w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                        placeholder="Contoh: 1956 - 1970"
                        required
                      />
                    </label>
                    <label className="grid gap-1 text-sm text-school-text">
                      <span>Deskripsi Singkat</span>
                      <textarea
                        value={timelineForm.description}
                        onChange={(event) => setTimelineForm((prev) => ({ ...prev, description: event.target.value }))}
                        className="min-h-[120px] w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                        placeholder="Jelaskan peristiwa penting pada periode ini."
                        required
                      />
                    </label>
                    <label className="grid gap-1 text-sm text-school-text">
                      <span>Urutan (opsional)</span>
                      <input
                        type="number"
                        value={timelineForm.order ?? ''}
                        onChange={(event) => {
                          const raw = event.target.value;
                          const parsed = Number.parseInt(raw, 10);
                          setTimelineForm((prev) => ({
                            ...prev,
                            order: raw === '' ? undefined : Number.isNaN(parsed) ? prev.order : parsed
                          }));
                        }}
                        className="w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                        placeholder="Contoh: 1"
                        min={0}
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {timelineForm.id && (
                        <button
                          type="button"
                          onClick={() => {
                            resetTimelineForm();
                            setTimelineMessage(null);
                            setTimelineErrorMessage(null);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-school-border px-4 py-2 text-sm font-medium text-school-text hover:bg-school-surface"
                          disabled={timelineSubmitting}
                        >
                          <X size={16} />
                          Batal Edit
                        </button>
                      )}
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-lg bg-school-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-school-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={timelineSubmitting}
                      >
                        {timelineSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {timelineForm.id ? 'Simpan Perubahan' : 'Tambah Peristiwa'}
                      </button>
                    </div>
                  </form>
                  {timelineMessage && <p className="text-sm text-school-text-muted">{timelineMessage}</p>}
                  {timelineErrorMessage && <p className="text-sm text-red-500">{timelineErrorMessage}</p>}
                </div>

                <div className="space-y-3 rounded-xl border border-school-border bg-white p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-school-text">Daftar Peristiwa</h3>
                    <span className="text-xs text-school-text-muted">Urut mengikuti nilai order</span>
                  </div>
                  {timelineLoading ? (
                    <div className="flex items-center gap-2 text-sm text-school-text-muted">
                      <Loader2 size={16} className="animate-spin" /> Memuat timeline...
                    </div>
                  ) : sortedTimelineEntries.length === 0 ? (
                    <p className="text-sm text-school-text-muted">Belum ada peristiwa pada timeline.</p>
                  ) : (
                    <div className="space-y-3">
                      {sortedTimelineEntries.map((item) => {
                        const displayOrder = typeof item.order === 'number' ? item.order : '—';
                        return (
                          <article key={item.id} className="rounded-lg border border-school-border p-4 shadow-sm">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-school-accent/10 px-2 py-0.5 text-xs font-semibold text-school-accent">
                                    #{displayOrder}
                                  </span>
                                  <span className="text-sm font-semibold text-school-text">{item.period}</span>
                                </div>
                                <p className="mt-2 text-sm text-school-text-muted whitespace-pre-line">{item.description}</p>
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleTimelineEdit(item)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-school-border px-3 py-1 text-xs font-medium text-school-text hover:bg-school-surface"
                                >
                                  <Edit size={14} /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleTimelineDelete(item.id)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed"
                                  disabled={deleteTimelineMutation.isPending}
                                >
                                  <Trash2 size={14} /> Hapus
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4 rounded-xl border border-school-border bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-school-text">Nilai Warisan Vinsensian</h3>
                      <p className="text-sm text-school-text-muted">
                        Susun daftar nilai yang menjadi karakter khas sekolah.
                      </p>
                    </div>
                    {heritageForm.id && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-school-accent/10 px-3 py-1 text-xs font-semibold text-school-accent">
                        Mengedit entri
                      </span>
                    )}
                  </div>
                  <form onSubmit={handleHeritageSubmit} className="space-y-3">
                    <label className="grid gap-1 text-sm text-school-text">
                      <span>Nilai Warisan</span>
                      <textarea
                        value={heritageForm.value}
                        onChange={(event) => setHeritageForm((prev) => ({ ...prev, value: event.target.value }))}
                        className="min-h-[100px] w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                        placeholder="Tuliskan nilai atau prinsip yang ingin disorot."
                        required
                      />
                    </label>
                    <label className="grid gap-1 text-sm text-school-text">
                      <span>Urutan (opsional)</span>
                      <input
                        type="number"
                        value={heritageForm.order ?? ''}
                        onChange={(event) => {
                          const raw = event.target.value;
                          const parsed = Number.parseInt(raw, 10);
                          setHeritageForm((prev) => ({
                            ...prev,
                            order: raw === '' ? undefined : Number.isNaN(parsed) ? prev.order : parsed
                          }));
                        }}
                        className="w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                        placeholder="Contoh: 1"
                        min={0}
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {heritageForm.id && (
                        <button
                          type="button"
                          onClick={() => {
                            resetHeritageForm();
                            setHeritageMessage(null);
                            setHeritageErrorMessage(null);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-school-border px-4 py-2 text-sm font-medium text-school-text hover:bg-school-surface"
                          disabled={heritageSubmitting}
                        >
                          <X size={16} />
                          Batal Edit
                        </button>
                      )}
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-lg bg-school-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-school-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={heritageSubmitting}
                      >
                        {heritageSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {heritageForm.id ? 'Simpan Perubahan' : 'Tambah Nilai'}
                      </button>
                    </div>
                  </form>
                  {heritageMessage && <p className="text-sm text-school-text-muted">{heritageMessage}</p>}
                  {heritageErrorMessage && <p className="text-sm text-red-500">{heritageErrorMessage}</p>}
                </div>

                <div className="space-y-3 rounded-xl border border-school-border bg-white p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-school-text">Daftar Nilai Warisan</h3>
                    <span className="text-xs text-school-text-muted">Urut sesuai prioritas</span>
                  </div>
                  {heritageLoading ? (
                    <div className="flex items-center gap-2 text-sm text-school-text-muted">
                      <Loader2 size={16} className="animate-spin" /> Memuat nilai warisan...
                    </div>
                  ) : sortedHeritageValues.length === 0 ? (
                    <p className="text-sm text-school-text-muted">Belum ada nilai warisan yang tersimpan.</p>
                  ) : (
                    <div className="space-y-3">
                      {sortedHeritageValues.map((item) => {
                        const displayOrder = typeof item.order === 'number' ? item.order : '—';
                        return (
                          <article key={item.id} className="rounded-lg border border-school-border p-4 shadow-sm">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="rounded-full bg-school-accent/10 px-2 py-0.5 text-xs font-semibold text-school-accent">
                                    #{displayOrder}
                                  </span>
                                  <span className="text-sm font-semibold text-school-text">Nilai Utama</span>
                                </div>
                                <p className="mt-2 text-sm text-school-text-muted whitespace-pre-line">{item.value}</p>
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleHeritageEdit(item)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-school-border px-3 py-1 text-xs font-medium text-school-text hover:bg-school-surface"
                                >
                                  <Edit size={14} /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleHeritageDelete(item.id)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed"
                                  disabled={deleteHeritageMutation.isPending}
                                >
                                  <Trash2 size={14} /> Hapus
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {selectedWawasanKey === 'struktur' && (
            <div className="space-y-6">
              <div className="space-y-4 rounded-xl border border-school-border bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-school-text">Struktur Organisasi</h3>
                    <p className="text-sm text-school-text-muted">
                      Lengkapi hierarki jabatan agar tampilan bagan selalu mutakhir.
                    </p>
                  </div>
                  {structureForm.id && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-school-accent/10 px-3 py-1 text-xs font-semibold text-school-accent">
                      Mengedit entri
                    </span>
                  )}
                </div>
                <form onSubmit={handleStructureSubmit} className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1 text-sm text-school-text">
                    <span>Jabatan</span>
                    <input
                      type="text"
                      value={structureForm.position}
                      onChange={(event) => setStructureForm((prev) => ({ ...prev, position: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                      placeholder="Contoh: Kepala Sekolah"
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-school-text">
                    <span>Nama</span>
                    <input
                      type="text"
                      value={structureForm.name}
                      onChange={(event) => setStructureForm((prev) => ({ ...prev, name: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                      placeholder="Nama pejabat"
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-school-text">
                    <span>Unit/Departemen (opsional)</span>
                    <input
                      type="text"
                      value={structureForm.department ?? ''}
                      onChange={(event) => setStructureForm((prev) => ({ ...prev, department: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                      placeholder="Contoh: Akademik"
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-school-text">
                    <span>Atasan Langsung</span>
                    <select
                      value={structureForm.parentId ?? ''}
                      onChange={(event) => {
                        const raw = event.target.value;
                        setStructureForm((prev) => ({ ...prev, parentId: raw ? raw : undefined }));
                      }}
                      className="w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                    >
                      <option value="">Tanpa atasan (root)</option>
                      {sortedStructureEntries
                        .filter((entry) => entry.id !== structureForm.id)
                        .map((entry) => (
                          <option key={entry.id} value={entry.id}>
                            {entry.position} — {entry.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm text-school-text">
                    <span>Urutan (opsional)</span>
                    <input
                      type="number"
                      value={structureForm.order ?? ''}
                      onChange={(event) => {
                        const raw = event.target.value;
                        const parsed = Number.parseInt(raw, 10);
                        setStructureForm((prev) => ({
                          ...prev,
                          order: raw === '' ? undefined : Number.isNaN(parsed) ? prev.order : parsed
                        }));
                      }}
                      className="w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                      placeholder="Contoh: 1"
                      min={0}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2 md:col-span-2">
                    {structureForm.id && (
                      <button
                        type="button"
                        onClick={() => {
                          resetStructureForm();
                          setStructureMessage(null);
                          setStructureErrorMessage(null);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-school-border px-4 py-2 text-sm font-medium text-school-text hover:bg-school-surface"
                        disabled={structureSubmitting}
                      >
                        <X size={16} />
                        Batal Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg bg-school-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-school-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={structureSubmitting}
                    >
                      {structureSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {structureForm.id ? 'Simpan Perubahan' : 'Tambah Entri'}
                    </button>
                  </div>
                </form>
                {structureMessage && <p className="text-sm text-school-text-muted">{structureMessage}</p>}
                {structureErrorMessage && <p className="text-sm text-red-500">{structureErrorMessage}</p>}
              </div>

              <div className="space-y-3 rounded-xl border border-school-border bg-white p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-school-text">Daftar Struktur</h3>
                  <span className="text-xs text-school-text-muted">Gunakan urutan untuk menyusun tampilan bagan</span>
                </div>
                {structureLoading ? (
                  <div className="flex items-center gap-2 text-sm text-school-text-muted">
                    <Loader2 size={16} className="animate-spin" /> Memuat struktur...
                  </div>
                ) : sortedStructureEntries.length === 0 ? (
                  <p className="text-sm text-school-text-muted">Belum ada entri struktur organisasi.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="border-b border-school-border text-xs uppercase text-school-text-muted">
                        <tr>
                          <th className="py-2 pr-3">Jabatan</th>
                          <th className="py-2 pr-3">Nama</th>
                          <th className="py-2 pr-3">Departemen</th>
                          <th className="py-2 pr-3">Atasan</th>
                          <th className="py-2 pr-3">Urutan</th>
                          <th className="py-2">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-school-border">
                        {sortedStructureEntries.map((entry) => {
                          const parent = entry.parentId ? structureParentLookup[entry.parentId] : null;
                          const parentLabel = parent ? parent.position : '—';
                          return (
                            <tr key={entry.id}>
                              <td className="py-2 pr-3 font-medium text-school-text">{entry.position}</td>
                              <td className="py-2 pr-3 text-school-text-muted">{entry.name}</td>
                              <td className="py-2 pr-3 text-school-text-muted">{entry.department || '—'}</td>
                              <td className="py-2 pr-3 text-school-text-muted">{parentLabel}</td>
                              <td className="py-2 pr-3 text-school-text-muted">{entry.order ?? '—'}</td>
                              <td className="py-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleStructureEdit(entry)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-school-border px-3 py-1 text-xs font-medium text-school-text hover:bg-school-surface"
                                  >
                                    <Edit size={14} /> Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleStructureDelete(entry.id)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed"
                                    disabled={deleteStructureMutation.isPending}
                                  >
                                    <Trash2 size={14} /> Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedWawasanKey === 'our-teams' && (
            <div className="space-y-6">
              <div className="space-y-4 rounded-xl border border-school-border bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-school-text">Tim Pengajar & Staff</h3>
                    <p className="text-sm text-school-text-muted">
                      Kelola profil pengajar, staf, dan tenaga pendukung yang tampil di halaman Wawasan.
                    </p>
                  </div>
                  {teamForm.id && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-school-accent/10 px-3 py-1 text-xs font-semibold text-school-accent">
                      Mengedit entri
                    </span>
                  )}
                </div>
                <form onSubmit={handleTeamSubmit} className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1 text-sm text-school-text">
                    <span>Nama Lengkap</span>
                    <input
                      type="text"
                      value={teamForm.name}
                      onChange={(event) => setTeamForm((prev) => ({ ...prev, name: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                      placeholder="Nama anggota"
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-school-text">
                    <span>Peran</span>
                    <input
                      type="text"
                      value={teamForm.role}
                      onChange={(event) => setTeamForm((prev) => ({ ...prev, role: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                      placeholder="Contoh: Guru Matematika"
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-school-text">
                    <span>Kategori</span>
                    <select
                      value={teamForm.category}
                      onChange={(event) => setTeamForm((prev) => ({ ...prev, category: event.target.value as TeamMember['category'] }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                    >
                      {TEAM_CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm text-school-text">
                    <span>Departemen (opsional)</span>
                    <input
                      type="text"
                      value={teamForm.department ?? ''}
                      onChange={(event) => setTeamForm((prev) => ({ ...prev, department: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                      placeholder="Contoh: IPA"
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-school-text">
                    <span>Email (opsional)</span>
                    <input
                      type="email"
                      value={teamForm.email ?? ''}
                      onChange={(event) => setTeamForm((prev) => ({ ...prev, email: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                      placeholder="nama@sekolah.sch.id"
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-school-text">
                    <span>Pendidikan (opsional)</span>
                    <input
                      type="text"
                      value={teamForm.education ?? ''}
                      onChange={(event) => setTeamForm((prev) => ({ ...prev, education: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                      placeholder="Contoh: S2 Pendidikan"
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-school-text md:col-span-2">
                    <span>Pengalaman (opsional)</span>
                    <textarea
                      value={teamForm.experience ?? ''}
                      onChange={(event) => setTeamForm((prev) => ({ ...prev, experience: event.target.value }))}
                      className="min-h-[80px] w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                      placeholder="Sorot pengalaman mengajar atau pencapaian penting."
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-school-text md:col-span-2">
                    <span>Spesialisasi (pisahkan dengan koma)</span>
                    <textarea
                      value={(teamForm.specialization ?? []).join(', ')}
                      onChange={(event) => {
                        const raw = event.target.value;
                        const values = raw
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean);
                        setTeamForm((prev) => ({ ...prev, specialization: values }));
                      }}
                      className="min-h-[80px] w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                      placeholder="Contoh: Kurikulum Merdeka, Pembelajaran Inovatif"
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-school-text">
                    <span>Foto (URL opsional)</span>
                    <input
                      type="url"
                      value={teamForm.photo ?? ''}
                      onChange={(event) => setTeamForm((prev) => ({ ...prev, photo: event.target.value }))}
                      className="w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                      placeholder="https://..."
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-school-text">
                    <span>Urutan (opsional)</span>
                    <input
                      type="number"
                      value={teamForm.order ?? ''}
                      onChange={(event) => {
                        const raw = event.target.value;
                        const parsed = Number.parseInt(raw, 10);
                        setTeamForm((prev) => ({
                          ...prev,
                          order: raw === '' ? undefined : Number.isNaN(parsed) ? prev.order : parsed
                        }));
                      }}
                      className="w-full rounded-lg border border-school-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-accent"
                      placeholder="Contoh: 1"
                      min={0}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2 md:col-span-2">
                    {teamForm.id && (
                      <button
                        type="button"
                        onClick={() => {
                          resetTeamForm();
                          setTeamMessage(null);
                          setTeamErrorMessage(null);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-school-border px-4 py-2 text-sm font-medium text-school-text hover:bg-school-surface"
                        disabled={teamSubmitting}
                      >
                        <X size={16} />
                        Batal Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg bg-school-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-school-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={teamSubmitting}
                    >
                      {teamSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {teamForm.id ? 'Simpan Perubahan' : 'Tambah Anggota'}
                    </button>
                  </div>
                </form>
                {teamMessage && <p className="text-sm text-school-text-muted">{teamMessage}</p>}
                {teamErrorMessage && <p className="text-sm text-red-500">{teamErrorMessage}</p>}
              </div>

              <div className="space-y-3 rounded-xl border border-school-border bg-white p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-school-text">Daftar Anggota</h3>
                  <span className="text-xs text-school-text-muted">Kelompokkan dengan kategori dan urutan</span>
                </div>
                {teamLoading ? (
                  <div className="flex items-center gap-2 text-sm text-school-text-muted">
                    <Loader2 size={16} className="animate-spin" /> Memuat anggota tim...
                  </div>
                ) : sortedTeamMembers.length === 0 ? (
                  <p className="text-sm text-school-text-muted">Belum ada anggota tim yang tersimpan.</p>
                ) : (
                  <div className="space-y-3">
                    {sortedTeamMembers.map((member) => {
                      const categoryLabel = TEAM_CATEGORY_OPTIONS.find((option) => option.value === member.category)?.label ?? member.category;
                      return (
                        <article key={member.id} className="rounded-lg border border-school-border p-4 shadow-sm">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-base font-semibold text-school-text">{member.name}</span>
                                <span className="rounded-full bg-school-accent/10 px-2 py-0.5 text-xs font-semibold text-school-accent">
                                  {categoryLabel}
                                </span>
                                {typeof member.order === 'number' && (
                                  <span className="rounded-full bg-school-surface px-2 py-0.5 text-xs text-school-text-muted">Urutan {member.order}</span>
                                )}
                              </div>
                              <p className="text-sm text-school-text-muted">{member.role}</p>
                              {member.department && (
                                <p className="text-sm text-school-text-muted">Departemen: {member.department}</p>
                              )}
                              <div className="flex flex-wrap gap-3 text-xs text-school-text-muted">
                                {member.email && <span>Email: {member.email}</span>}
                                {member.education && <span>Pendidikan: {member.education}</span>}
                              </div>
                              {member.experience && (
                                <p className="text-sm text-school-text-muted whitespace-pre-line">{member.experience}</p>
                              )}
                              {member.specialization && member.specialization.length > 0 && (
                                <div className="flex flex-wrap gap-2 text-xs text-school-text">
                                  {member.specialization.map((item) => (
                                    <span key={item} className="rounded-full bg-school-surface px-2 py-0.5">{item}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleTeamEdit(member)}
                                className="inline-flex items-center gap-1 rounded-lg border border-school-border px-3 py-1 text-xs font-medium text-school-text hover:bg-school-surface"
                              >
                                <Edit size={14} /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTeamDelete(member.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed"
                                disabled={deleteTeamMutation.isPending}
                              >
                                <Trash2 size={14} /> Hapus
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </section>
      )}

      {section === 'documents' && (
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
      )}

      {section === 'validator-ai' && (
        <section id="validator-ai-section" className="space-y-6 rounded-xl border border-school-border bg-white p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-school-text flex items-center gap-2">
                <Sparkles size={20} />
                Analisa Domain dengan AI
              </h2>
              <p className="text-sm text-school-text-muted">
                Minta Gemini AI menganalisa header dan cuplikan konten untuk menilai indikasi situs judi online.
              </p>
            </div>
          </div>

          <form onSubmit={handleAiAnalysisSubmit} className="space-y-4 rounded-xl border border-school-border bg-school-surface p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <label className="flex-1 text-sm text-school-text">
                <span className="mb-1 block">Domain atau URL</span>
                <input
                  type="text"
                  value={aiDomainUrl}
                  onChange={(event) => setAiDomainUrl(event.target.value)}
                  className="w-full rounded-lg border border-school-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-accent"
                  placeholder="https://contoh-domain.com"
                  disabled={aiValidatorMutation.isPending}
                />
              </label>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-school-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-school-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={aiValidatorMutation.isPending}
              >
                {aiValidatorMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Analisa Domain
              </button>
            </div>

            <p className="text-xs text-school-text-muted">
              Gunakan format lengkap (https://) untuk hasil terbaik. API key Gemini dapat diatur melalui menu pengaturan.
            </p>
          </form>

          {aiAnalysisError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {aiAnalysisError}
            </div>
          )}

          {aiValidatorMutation.isPending && (
            <div className="flex items-center gap-2 text-sm text-school-text-muted">
              <Loader2 size={16} className="animate-spin" /> Mengirim permintaan ke Gemini...
            </div>
          )}

          {aiAnalysis && aiVerdictMeta && (
            <div className="space-y-6">
              <div className="rounded-xl border border-school-border bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${aiVerdictMeta.badgeClass}`}>
                      <Sparkles size={14} />
                      {aiVerdictMeta.label}
                    </div>
                    <h3 className="text-lg font-semibold text-school-text">Ringkasan Analisa</h3>
                    <p className="text-sm text-school-text-muted">{aiVerdictMeta.description}</p>
                  </div>
                  <div className="text-sm text-school-text-muted md:text-right">
                    <p>Model: <span className="font-medium text-school-text">{aiAnalysis.model}</span></p>
                    <p>Provider: <span className="font-medium text-school-text">{aiAnalysis.provider}</span></p>
                    {aiConfidencePercent !== null && (
                      <p>Keyakinan model: <span className="font-medium text-school-text">{aiConfidencePercent}%</span></p>
                    )}
                  </div>
                </div>
                <p className="mt-4 text-sm text-school-text">{aiAnalysis.summary}</p>

                {aiAnalysis.signals.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-school-text-muted">Sinyal Utama</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {aiAnalysis.signals.map((signal) => (
                        <span key={signal} className="inline-flex items-center rounded-full bg-school-surface px-3 py-1 text-xs text-school-text">
                          {signal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-school-border bg-white p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-school-text">
                    <Globe size={16} />
                    Informasi Domain
                  </div>
                  <dl className="space-y-2 text-sm text-school-text">
                    <div className="flex justify-between gap-3">
                      <dt className="text-school-text-muted">Permintaan</dt>
                      <dd className="text-right break-all">{aiAnalysis.normalizedUrl}</dd>
                    </div>
                          {aiAnalysis.pageTitle && (
                            <div className="flex justify-between gap-3">
                              <dt className="text-school-text-muted">Judul Halaman</dt>
                              <dd className="text-right break-words text-school-text max-w-xs md:max-w-sm">{aiAnalysis.pageTitle}</dd>
                            </div>
                          )}
                          {aiAnalysis.pageDescription && (
                            <div className="flex justify-between gap-3">
                              <dt className="text-school-text-muted">Meta Description</dt>
                              <dd className="text-right break-words text-school-text max-w-xs md:max-w-sm">{aiAnalysis.pageDescription}</dd>
                            </div>
                          )}
                    {aiAnalysis.resolvedUrl && aiAnalysis.resolvedUrl !== aiAnalysis.normalizedUrl && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-school-text-muted">Dialihkan ke</dt>
                        <dd className="text-right break-all">{aiAnalysis.resolvedUrl}</dd>
                      </div>
                    )}
                    {aiAnalysis.statusCode !== null && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-school-text-muted">Status HTTP</dt>
                        <dd className="text-right">{aiAnalysis.statusCode}</dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-3">
                      <dt className="text-school-text-muted">Diambil</dt>
                      <dd className="text-right">{formatDateTime(aiAnalysis.fetchedAt)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="space-y-4">
                  {aiAnalysis.warnings.length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 space-y-2">
                      <div className="flex items-center gap-2 font-semibold">
                        <AlertTriangle size={16} />
                        Catatan Pengambilan Data
                      </div>
                      <ul className="list-disc pl-5 space-y-1">
                        {aiAnalysis.warnings.map((warning, index) => (
                          <li key={`${warning}-${index}`}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiHeaderEntries.length > 0 && (
                    <details className="rounded-lg border border-school-border bg-school-surface p-4 text-sm text-school-text">
                      <summary className="flex cursor-pointer items-center gap-2 font-semibold">
                        <Info size={16} /> Header HTTP ({aiHeaderEntries.length})
                      </summary>
                      <div className="mt-3 space-y-2 text-xs text-school-text-muted break-words">
                        {aiHeaderEntries.map(([key, value]) => (
                          <div key={key} className="border-b border-dashed border-school-border pb-2 last:border-b-0 last:pb-0">
                            <p className="font-medium text-school-text">{key}</p>
                            <p className="mt-1 text-school-text">{value}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  {aiAnalysis.contentSnippet && (
                    <details className="rounded-lg border border-school-border bg-school-surface p-4 text-sm text-school-text">
                      <summary className="flex cursor-pointer items-center gap-2 font-semibold">
                        <FileText size={16} /> Cuplikan Konten Halaman
                      </summary>
                      <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-school-border bg-white p-3 text-xs text-school-text">{aiAnalysis.contentSnippet}</pre>
                    </details>
                  )}

                  <details className="rounded-lg border border-school-border bg-school-surface p-4 text-sm text-school-text">
                    <summary className="flex cursor-pointer items-center gap-2 font-semibold">
                      <Sparkles size={16} /> Respons Mentah AI
                    </summary>
                    <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-school-border bg-white p-3 text-xs text-school-text">{aiAnalysis.rawModelResponse}</pre>
                  </details>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {section === 'seo' && (
        <section id="seo-section" className="space-y-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-school-text flex items-center gap-2">
                <Bot size={20} />
                Asisten SEO AI
              </h2>
              <p className="text-sm text-school-text-muted">
                Diskusikan strategi SEO untuk {activeSeoTopicMeta.label} dan dapatkan rekomendasi dari Gemini sesuai konten sekolah.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSeoReset()}
              className="inline-flex items-center gap-2 rounded-lg border border-school-border bg-white px-3 py-2 text-sm font-medium text-school-text hover:bg-school-surface disabled:opacity-60"
              disabled={seoChatMutation.isPending}
            >
              <RefreshCw size={16} />
              Reset percakapan
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
            <aside className="space-y-4">
              <div className="rounded-xl border border-school-border bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-school-text-muted">Fokus Topik</p>
                <div className="mt-3 flex flex-col gap-2">
                  {SEO_TOPICS.map((topic) => {
                    const isActive = topic.value === activeSeoTopic;
                    return (
                      <button
                        key={topic.value}
                        type="button"
                        onClick={() => handleSeoTopicSelect(topic.value)}
                        className={`flex w-full flex-col items-start gap-1 rounded-lg border px-3 py-3 text-left transition-colors ${
                          isActive
                            ? 'border-school-accent bg-school-accent/10 text-school-accent-dark'
                            : 'border-school-border bg-white hover:bg-school-surface'
                        }`}
                      >
                        <div className="flex w-full items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-school-text">{topic.label}</p>
                            <p className="text-xs text-school-text-muted">{topic.description}</p>
                          </div>
                          {isActive && <ChevronRight size={16} className="text-school-accent-dark" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-school-border bg-school-surface p-4 text-xs text-school-text-muted">
                Riwayat percakapan disimpan per topik dan dibatasi pada {MAX_SEO_HISTORY} pesan terakhir.
              </div>
            </aside>

            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-school-border bg-white p-4">
                <div className="max-h-[520px] space-y-4 overflow-y-auto pr-2">
                  {seoMessages.map((message, index) => {
                    if (message.role === 'assistant') {
                      return (
                        <div key={`assistant-${index}`} className="flex items-start gap-3">
                          <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-school-accent/10 text-school-accent">
                            <Bot size={16} />
                          </div>
                          <div className="flex-1 space-y-3 rounded-xl border border-school-border bg-white p-4 shadow-sm">
                            <p className="whitespace-pre-line text-sm text-school-text">{message.content}</p>
                            {(message.suggestedTitle || message.suggestedDescription) && (
                              <div className="rounded-lg border border-school-border bg-school-surface p-3 text-sm text-school-text">
                                {message.suggestedTitle && (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-school-text-muted">Judul Meta</p>
                                    <p className="mt-1 text-school-text">{message.suggestedTitle}</p>
                                  </div>
                                )}
                                {message.suggestedDescription && (
                                  <div className={message.suggestedTitle ? 'mt-3' : undefined}>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-school-text-muted">Deskripsi Meta</p>
                                    <p className="mt-1 text-school-text">{message.suggestedDescription}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            {message.recommendations && message.recommendations.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-school-text-muted">Rekomendasi</p>
                                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-school-text">
                                  {message.recommendations.map((recommendation, recommendationIndex) => (
                                    <li key={`recommendation-${index}-${recommendationIndex}`}>{recommendation}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {message.keywords && message.keywords.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-school-text-muted">Kata Kunci</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {message.keywords.map((keyword, keywordIndex) => (
                                    <span
                                      key={`keyword-${index}-${keywordIndex}`}
                                      className="inline-flex items-center rounded-full border border-school-border bg-school-surface px-3 py-1 text-xs font-medium text-school-text"
                                    >
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                              <div className="rounded-lg border border-dashed border-school-border bg-school-surface/60 p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-school-text-muted">Ide pertanyaan lanjutan</p>
                                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-school-text">
                                  {message.followUpQuestions.map((question, followIndex) => (
                                    <li key={`follow-${index}-${followIndex}`}>{question}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={`user-${index}`} className="flex justify-end">
                        <div className="max-w-md rounded-xl bg-school-accent px-4 py-3 text-sm text-white shadow">
                          {message.content}
                        </div>
                      </div>
                    );
                  })}

                  {seoChatMutation.isPending && (
                    <div className="flex items-center gap-2 text-sm text-school-text-muted">
                      <Loader2 size={16} className="animate-spin" />
                      Mengolah rekomendasi SEO...
                    </div>
                  )}
                </div>
              </div>

              {seoError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {seoError}
                </div>
              )}

              {latestSeoAssistantMessage && latestSeoAssistantMessage.followUpQuestions && latestSeoAssistantMessage.followUpQuestions.length > 0 && (
                <div className="rounded-xl border border-school-border bg-white p-4">
                  <p className="text-sm font-semibold text-school-text">Pertanyaan lanjutan</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {latestSeoAssistantMessage.followUpQuestions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => handleSeoFollowUp(question)}
                        className="rounded-full border border-school-border bg-school-surface px-3 py-1 text-xs font-medium text-school-text hover:bg-white disabled:opacity-60"
                        disabled={seoChatMutation.isPending}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSeoSubmit} className="space-y-3 rounded-xl border border-school-border bg-white p-4">
                <div>
                  <label htmlFor="seo-question" className="block text-sm font-medium text-school-text">
                    Ajukan pertanyaan
                  </label>
                  <textarea
                    id="seo-question"
                    value={seoInput}
                    onChange={(event) => setSeoInput(event.target.value)}
                    className="mt-2 min-h-[100px] w-full resize-y rounded-lg border border-school-border px-3 py-2 text-sm text-school-text focus:outline-none focus:ring-2 focus:ring-school-accent disabled:bg-school-surface"
                    placeholder="Contoh: Audit meta description halaman landing dan rekomendasikan kata kunci tambahan."
                    disabled={seoChatMutation.isPending}
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-school-text-muted">Topik aktif: {activeSeoTopicMeta.label}</p>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-school-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-school-accent-dark disabled:opacity-60"
                    disabled={seoChatMutation.isPending || !seoInput.trim()}
                  >
                    {seoChatMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Kirim
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}

      {section === 'validator' && (
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
      )}

      {section === 'schedules' && (
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
      )}
    </div>
  );
}

function AdminDashboardWrapper() {
  const location = useLocation();
  const { section: sectionParam } = useParams<{ section?: string }>();
  const normalizedSection = (sectionParam ?? 'overview').toLowerCase();
  const section = isAdminSection(normalizedSection) ? normalizedSection : null;

  return <AdminDashboardView key={location.pathname} section={section} />;
}

export default withAuth(AdminDashboardWrapper, ['admin']);
