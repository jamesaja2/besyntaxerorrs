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

export type WawasanKey = 'sejarah' | 'visi-misi' | 'struktur' | 'our-teams';

export interface WawasanTimelineItem {
  id: string;
  period: string;
  description: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WawasanHeritageValue {
  id: string;
  value: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WawasanStructureEntry {
  id: string;
  position: string;
  name: string;
  department?: string | null;
  parentId?: string | null;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WawasanSection<TContent = Record<string, unknown>> {
  id: string;
  key: WawasanKey;
  title: string;
  mediaUrl?: string | null;
  content: TContent;
  createdAt?: string;
  updatedAt?: string;
}

export interface WawasanSectionPayload<TContent = Record<string, unknown>> {
  title: string;
  mediaUrl?: string | null;
  content: TContent;
}

export interface WawasanTimelinePayload {
  period: string;
  description: string;
  order?: number;
}

export interface WawasanHeritagePayload {
  value: string;
  order?: number;
}

export interface WawasanStructurePayload {
  position: string;
  name: string;
  department?: string;
  parentId?: string | null;
  order?: number;
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

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'guest';
export type UserStatus = 'active' | 'inactive';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  avatarUrl: string | null;
  classIds: string[];
  classes: SchoolClassSummary[];
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  avatarUrl?: string;
  classIds?: string[];
  password: string;
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'password'>> & {
  password?: string;
  classIds?: string[];
};

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

export interface ClassMemberSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedAt: string;
}

export interface ClassTeacherAssignmentSummary {
  id: string;
  role: string | null;
  subject: SubjectSummary | null;
  teacher: BasicUserSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolClassRecord extends SchoolClassSummary {
  description: string | null;
  homeroomTeacher: BasicUserSummary | null;
  memberCount: number;
  members: ClassMemberSummary[];
  teacherAssignments: ClassTeacherAssignmentSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassPayload {
  name: string;
  gradeLevel: number;
  academicYear: string;
  description?: string | null;
  homeroomTeacherId?: string | null;
}

export type UpdateClassPayload = Partial<CreateClassPayload>;

export interface UpdateClassMembersPayload {
  memberIds?: string[];
}

export interface AdminSettings {
  sentryDsn: string | null;
  virusTotalApiKey: string | null;
  googleSafeBrowsingKey: string | null;
  geminiApiKey: string | null;
  allowedOrigins: string[];
}

export interface AdminSettingsPayload {
  sentryDsn?: string | null;
  virusTotalApiKey?: string | null;
  googleSafeBrowsingKey?: string | null;
  geminiApiKey?: string | null;
  allowedOrigins?: string[] | string;
}

export interface AiDomainAnalysis {
  url: string;
  normalizedUrl: string;
  resolvedUrl: string | null;
  statusCode: number | null;
  fetchedAt: string;
  headers: Record<string, string>;
  contentSnippet: string | null;
  pageTitle: string | null;
  pageDescription: string | null;
  verdict: 'safe' | 'gambling' | 'suspicious' | 'unknown';
  confidence: number | null;
  summary: string;
  signals: string[];
  model: string;
  provider: string;
  rawModelResponse: string;
  warnings: string[];
}

export type SeoTopic = 'landing' | 'announcements' | 'gallery' | 'faq';

export interface SeoChatMessage {
  role: 'user' | 'assistant';
  content: string;
  keywords?: string[];
  recommendations?: string[];
  suggestedTitle?: string | null;
  suggestedDescription?: string | null;
  followUpQuestions?: string[];
}

export interface SeoChatPayload {
  topic: SeoTopic;
  messages: Array<Pick<SeoChatMessage, 'role' | 'content'>>;
}

export interface SeoChatResponse {
  reply: string;
  keywords: string[];
  recommendations: string[];
  suggestedTitle: string | null;
  suggestedDescription: string | null;
  followUpQuestions: string[];
}
