export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'guest';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  passwordHash: string;
  lastLogin?: string;
}

export interface Announcement extends BaseEntity {
  title: string;
  summary: string;
  content: string;
  date: string;
  category: string;
  pinned?: boolean;
  imageUrl?: string;
}

export interface Extracurricular extends BaseEntity {
  name: string;
  description: string;
  category: string;
  schedule: string;
  mentor: string;
  achievements?: string[];
  isNew?: boolean;
  coverImage?: string;
}

export interface GalleryItem extends BaseEntity {
  title: string;
  description: string;
  imageUrl: string;
  tags?: string[];
  publishedAt: string;
}

export interface Article extends BaseEntity {
  title: string;
  slug: string;
  coverImage?: string;
  summary: string;
  content: string;
  publishedAt: string;
  author: string;
  tags?: string[];
}

export interface FAQItem extends BaseEntity {
  question: string;
  answer: string;
  category: string;
}

export interface PCPDBEntry extends BaseEntity {
  applicantName: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  submittedAt: string;
}

export interface ValidatorHistory extends BaseEntity {
  url: string;
  verdict: 'safe' | 'malicious' | 'suspicious';
  maliciousCount: number;
  suspiciousCount: number;
  undetectedCount: number;
  categories: Record<string, string>;
  provider: 'virustotal' | 'google-safebrowsing' | 'mock';
  scannedAt: string;
}

export interface WawasanContent extends BaseEntity {
  key: 'sejarah' | 'visi-misi' | 'struktur' | 'our-teams';
  title: string;
  content: string;
  media?: string;
}

export interface TeamMember extends BaseEntity {
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
}
