export interface Announcement {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: string;
  pinned?: boolean;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Extracurricular {
  id: string;
  name: string;
  description: string;
  category: string;
  schedule: string;
  mentor: string;
  achievements?: string[];
  isNew?: boolean;
  coverImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  summary: string;
  content: string;
  publishedAt: string;
  author: string;
  tags: string[];
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PCPDBEntry {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  submittedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ValidatorHistory {
  id: string;
  url: string;
  normalizedUrl: string;
  verdict: 'safe' | 'malicious' | 'suspicious';
  maliciousCount: number;
  suspiciousCount: number;
  undetectedCount: number;
  categories: Record<string, string>;
  provider: string;
  scannedAt: string;
  createdById?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface WawasanContent {
  id: string;
  key: 'sejarah' | 'visi-misi' | 'struktur' | 'our-teams';
  title: string;
  content: string;
  media?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardSummary {
  announcements: number;
  extracurriculars: number;
  pcpdbPending: number;
  latestAnnouncements: Announcement[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: 'leadership' | 'coordinators' | 'teachers' | 'staff' | 'support';
  department?: string;
  email?: string;
  education?: string;
  experience?: string;
  specialization?: string[];
  photo?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentRecord {
  id: string;
  title: string | null;
  description: string | null;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  storedFilePath: string;
  signedFilePath: string | null;
  fileHash: string;
  hashAlgorithm: string;
  verificationCode: string;
  barcodeValue: string | null;
  issuedFor: string | null;
  issuerId: string | null;
  issuedAt: string;
  status: 'active' | 'inactive' | 'revoked' | 'archived';
  downloads: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVerificationLog {
  id: string;
  documentId: string;
  verifier: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  verifierName: string | null;
  verifierRole: string | null;
  verifierEmail: string | null;
  submittedHash: string | null;
  matched: boolean;
  verifiedVia: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface DocumentVerificationResult {
  matched: boolean;
  status: DocumentRecord['status'] | 'unknown';
  hash: string | null;
  document: DocumentRecord | { id: string; status: DocumentRecord['status'] } | null;
  message?: string;
}

export interface ScheduleItem {
  id: string;
  class: {
    id: string;
    name: string;
  };
  subject: {
    id: string;
    name: string;
    code: string;
  };
  teacher: {
    id: string;
    name: string;
    email: string;
  };
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementPayload {
  title: string;
  summary: string;
  content: string;
  date: string;
  category: string;
  pinned?: boolean;
  imageUrl?: string | null;
}

export interface FAQPayload {
  question: string;
  answer: string;
  category: string;
}

export interface GalleryPayload {
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  publishedAt: string;
}

export interface SchedulePayload {
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location?: string | null;
  notes?: string | null;
}

export type ScheduleUpdatePayload = Partial<SchedulePayload>;

export interface BasicUserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
}

export interface SchoolClassSummary {
  id: string;
  name: string;
  gradeLevel: number;
  academicYear: string;
}

export interface SubjectSummary {
  id: string;
  name: string;
  code: string;
}
