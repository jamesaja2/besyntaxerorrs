// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  classIds: string[];
  classes?: Array<{
    id: string;
    name: string;
    gradeLevel?: number | null;
    academicYear?: string | null;
  }>;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'guest';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

// Admin Types
export interface Admin extends User {
  role: 'admin';
  permissions: AdminPermission[];
  systemAccess: SystemAccess;
}

export type AdminPermission = 
  | 'user_management'
  | 'system_settings'
  | 'backup_restore'
  | 'analytics_full'
  | 'financial_reports'
  | 'security_logs';

export interface SystemAccess {
  fullControl: boolean;
  canModifyUsers: boolean;
  canViewLogs: boolean;
  canManageBackups: boolean;
}

// Teacher Types
export interface Teacher extends User {
  role: 'teacher';
  employeeId: string;
  subjects: Subject[];
  classes: Class[];
  department: string;
  ssoProvider: 'google' | 'microsoft' | 'local';
}

// Student Types
export interface Student extends User {
  role: 'student';
  studentId: string;
  class: Class;
  parentIds: string[];
  academicYear: string;
  enrollmentDate: Date;
  gpa?: number;
}

// Parent Types
export interface Parent extends User {
  role: 'parent';
  childrenIds: string[];
  phone: string;
  emergencyContact?: EmergencyContact;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

// Academic Types
export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  department: string;
  prerequisite?: string[];
}

export interface Class {
  id: string;
  name: string;
  grade: number;
  academicYear: string;
  teacherId: string;
  students: string[];
  schedule: ClassSchedule[];
}

export interface ClassSchedule {
  day: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  subject: Subject;
  room: string;
}

// LMS Types
export interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  subjectId: string;
  classIds: string[];
  materials: CourseMaterial[];
  assignments: Assignment[];
  announcements: Announcement[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseMaterial {
  id: string;
  title: string;
  type: MaterialType;
  content?: string;
  fileUrl?: string;
  videoUrl?: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
}

export type MaterialType = 'document' | 'video' | 'audio' | 'image' | 'link' | 'text';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  dueDate: Date;
  maxScore: number;
  attachments?: string[];
  submissions: AssignmentSubmission[];
  isPublished: boolean;
  allowLateSubmission: boolean;
  createdAt: Date;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  content?: string;
  attachments?: string[];
  submittedAt: Date;
  score?: number;
  feedback?: string;
  isLate: boolean;
  status: SubmissionStatus;
}

export type SubmissionStatus = 'draft' | 'submitted' | 'graded' | 'returned';

// Communication Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  targetAudience: UserRole[];
  isUrgent: boolean;
  attachments?: string[];
  publishDate: Date;
  expiryDate?: Date;
  readBy: string[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  attachments?: string[];
  isRead: boolean;
  sentAt: Date;
  threadId?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalAssignments: number;
  pendingSubmissions: number;
  systemHealth: SystemHealth;
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  storage: number;
  uptime: number;
  status: 'healthy' | 'warning' | 'critical';
}

// Financial Types
export interface PaymentRecord {
  id: string;
  studentId: string;
  amount: number;
  description: string;
  dueDate: Date;
  paidDate?: Date;
  status: PaymentStatus;
  method?: PaymentMethod;
  transactionId?: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'ewallet';

// Attendance Types
export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
  recordedBy: string;
  recordedAt: Date;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

// Library Types
export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description?: string;
  coverUrl?: string;
  totalCopies: number;
  availableCopies: number;
  isDigital: boolean;
  fileUrl?: string;
}

export interface BookBorrow {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: BorrowStatus;
  renewalCount: number;
}

export type BorrowStatus = 'active' | 'returned' | 'overdue' | 'lost';

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export type NotificationType = 
  | 'assignment'
  | 'announcement'
  | 'payment'
  | 'attendance'
  | 'message'
  | 'system'
  | 'academic';

// Document Types
export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  version: number;
  isPublic: boolean;
  permissions: DocumentPermission[];
}

export type DocumentType = 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx' | 'image' | 'video' | 'audio';

export interface DocumentPermission {
  userId: string;
  permission: 'view' | 'edit' | 'delete' | 'share';
}

// AI Assistant Types
export interface AIChat {
  id: string;
  userId: string;
  messages: AIChatMessage[];
  topic: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    suggestedActions?: string[];
    relatedResources?: string[];
  };
}

// Analytics Types
export interface Analytics {
  userId?: string;
  event: AnalyticsEvent;
  data: Record<string, any>;
  timestamp: Date;
  sessionId: string;
}

export type AnalyticsEvent = 
  | 'login'
  | 'logout'
  | 'page_view'
  | 'assignment_submit'
  | 'course_view'
  | 'document_download'
  | 'message_sent'
  | 'search_query';
