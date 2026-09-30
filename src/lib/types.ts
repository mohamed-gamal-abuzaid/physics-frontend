// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'student' | 'parent';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── Student Profile ──────────────────────────────────────────────────────────

export type StudentStatus =
  | 'ACTIVE'
  | 'ON_LEAVE'
  | 'TRIAL'
  | 'WAITING_FOR_ACTIVATION'
  | 'DISABLED';

export interface StudentProfile {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  studentPhone?: string;
  studentPhoneNumber?: string;
  parentPhoneNumber?: string;
  avatar?: string;
  gradeLevel?: string;
  cohort?: string;
  enrolledCourse?: string;
  assignedTeacherId?: number;
  assignedTeacherName?: string;
  meetingLink?: string;
  remainingPrivateCredits: number;
  remainingGroupCredits: number;
  totalPrivateCredits?: number;
  totalGroupCredits?: number;
  attendanceRate?: number;
  averageScore?: number;
  status: StudentStatus;
  joinedDate?: string;
  notes?: string;
  schoolName?: string;
  academicYear?: string;
  examBoard?: string;
  year?: string;
  board?: string;
  examSession?: string;
  hardestTopic?: string;
  registeredVia?: string;
  isAccountGranted?: boolean;
  sessionsCount?: number;
  sessions?: BookingSession[];
}

export const YEAR_OPTIONS = [
  { value: 'Y9', label: 'Y9' },
  { value: 'Y10', label: 'Y10' },
  { value: 'Y11', label: 'Y11' },
  { value: 'Y12', label: 'Y12' },
  { value: 'ELSE', label: 'Else' },
] as const;

export const BOARD_OPTIONS = [
  { value: 'NIES', label: 'NIES (Nile International Education System)' },
  { value: 'OL_CAMBRIDGE', label: 'OL Cambridge' },
  { value: 'AQA_PHYSICS', label: 'AQA Physics' },
  { value: 'OL_EDXECEL_LINEAR', label: 'OL Edexcel Linear' },
  { value: 'OL_EDXECEL_MODULAR_UNIT_1', label: 'OL Edexcel Modular Unit 1' },
  { value: 'OL_EDXECEL_MODULAR_UNIT_2', label: 'OL Edexcel Modular Unit 2' },
  { value: 'AS_CAMBRIDGE', label: 'AS Cambridge' },
  { value: 'AL_EDXECEL_MODULAR_UNIT_1', label: 'AL Edexcel Modular Unit 1' },
  { value: 'AL_EDXECEL_MODULAR_UNIT_2', label: 'AL Edexcel Modular Unit 2' },
  { value: 'AL_EDXECEL_MODULAR_UNIT_3', label: 'AL Edexcel Modular Unit 3' },
  { value: 'AL_EDXECEL_MODULAR_UNIT_4', label: 'AL Edexcel Modular Unit 4' },
  { value: 'AL_EDXECEL_MODULAR_UNIT_5', label: 'AL Edexcel Modular Unit 5' },
  { value: 'AL_EDXECEL_MODULAR_UNIT_6', label: 'AL Edexcel Modular Unit 6' },
  { value: 'ELSE', label: 'Else' },
] as const;

export type YearValue = (typeof YEAR_OPTIONS)[number]['value'];
export type BoardValue = (typeof BOARD_OPTIONS)[number]['value'];

// ─── Sessions / Bookings ─────────────────────────────────────────────────────

export type SessionStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELED' | 'NO_SHOW';
export type SessionFormat = 'PRIVATE' | 'GROUP';
export type SessionLocation = 'ONLINE' | 'LAB_ROOM_A' | 'QUANTUM_HALL_B';

export interface SessionNoteData {
  title: string;
  summaryNotes: string;
  keyConcepts?: string[];
  pdfFileName?: string;
  pdfFileSize?: string;
  pdfFileDataUrl?: string;
  whiteboardSnapshotUrl?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface BookingSession {
  id: number;
  studentId: number;
  studentName: string;
  studentAvatar?: string;
  teacherId: number;
  teacherName: string;
  courseName: string;
  topic: string;
  sessionFormat: SessionFormat;
  date: string;
  time: string;
  durationMinutes: number;
  status: SessionStatus;
  notes?: string;
  meetingLink?: string;
  location: SessionLocation;
  creditDeducted: boolean;
  creditTypeDeducted?: '1-to-1' | 'group';
  sessionNotes?: SessionNoteData;
  assignedHomeworkId?: number;
  assignedHomeworkTitle?: string;
  assignedHomeworkDueDate?: string;
  assignedHomeworkPoints?: number;
  isArchived?: boolean;
  createdAt?: string;
}

// ─── Assignments & Submissions ────────────────────────────────────────────────

export type HomeworkStatus = 'PENDING' | 'SUBMITTED' | 'GRADED' | 'RESUBMIT_REQUESTED';

export interface HomeworkAssignment {
  id: number;
  title: string;
  course: string;
  module: string;
  dueDate: string;
  totalPoints: number;
  maxPoints?: number;
  description: string;
  attachments?: { name: string; size: string; type: string; fileUrl?: string }[];
  studentId?: number;
  assignedStudentIds?: number[];
  createdAt?: string;
}

export interface HomeworkSubmission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  studentId: number;
  studentName: string;
  studentAvatar?: string;
  submittedAt: string;
  fileName: string;
  fileSize?: string;
  fileUrl?: string;
  status: HomeworkStatus;
  score?: number;
  letterGrade?: string;
  feedbackNotes?: string;
  gradedBy?: string;
  gradedAt?: string;
  rubricScores?: { criterion: string; max: number; awarded: number }[];
}

// ─── Resources ────────────────────────────────────────────────────────────────

export type ResourceCategory =
  | 'Lecture Notes'
  | 'Formula Sheet'
  | 'Lab Manual'
  | 'Exam Solutions'
  | 'Video Masterclass';

export type ResourceFormat = 'PDF' | 'DOCX' | 'MP4' | 'Interactive SIM';

export interface ResourceItem {
  id: number;
  title: string;
  category: ResourceCategory;
  course: string;
  topic: string;
  fileFormat: ResourceFormat;
  fileSize: string;
  downloadCount: number;
  author: string;
  uploadDate: string;
  description: string;
  previewUrl?: string;
  fileUrl?: string;
  badge?: string;
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'UNPAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  studentId: number;
  studentName: string;
  parentName?: string;
  packageName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentMethod?: string;
  paidAt?: string;
  referenceNote?: string;
  createdAt?: string;
}

// ─── Payment Proofs ───────────────────────────────────────────────────────────

export type PaymentProofStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PaymentMethodType =
  | 'InstaPay'
  | 'Vodafone Cash'
  | 'Bank Transfer / IBAN'
  | 'CIB Wire / SWIFT'
  | 'Other Direct Method';

export interface ManualPaymentProof {
  id: number;
  studentId: number;
  studentName: string;
  parentName?: string;
  studentAvatar?: string;
  packageName: string;
  sessionsCount: number;
  creditType?: '1-to-1' | 'group';
  amount: number;
  paymentMethod: PaymentMethodType;
  senderAccountOrPhone: string;
  transactionRef?: string;
  screenshotUrl: string;
  submittedAt: string;
  status: PaymentProofStatus;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

// ─── Support Tickets ─────────────────────────────────────────────────────────

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketCategory =
  | 'Academic Question'
  | 'Billing & Package'
  | 'Schedule Change'
  | 'Technical Issue';

export interface TicketMessage {
  id: number;
  ticketId: number;
  sender: string;
  role: string;
  text: string;
  timestamp: string;
  avatar?: string;
}

export interface SupportTicket {
  id: number;
  ticketNumber: string;
  studentId: number;
  studentName: string;
  requesterRole: 'student' | 'parent';
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

// ─── Email Campaigns & Outbox ────────────────────────────────────────────────

export type CampaignStatus = 'SENT' | 'SCHEDULED' | 'DRAFT';

export interface EmailCampaign {
  id: number;
  title: string;
  subject: string;
  targetAudience: 'All Students' | 'All Parents' | 'Trial Leads' | 'Everyone';
  sentAt?: string;
  recipientCount?: number;
  openRate?: number;
  clickRate?: number;
  status: CampaignStatus;
  previewSnippet?: string;
}

export interface OutboxEmail {
  id: number;
  studentId?: number;
  studentName?: string;
  recipientEmail: string;
  subject: string;
  body: string;
  sentAt: string;
  status: 'Simulated' | 'Delivered' | 'Failed' | 'Pending';
  provider: string;
  error?: string;
}

// ─── Hall of Fame ────────────────────────────────────────────────────────────

export interface YearbookStudent {
  id: number;
  studentName: string;
  avatar?: string;
  cohort: string;
  superlativeBadge: string;
  quote: string;
  admittedUniversity?: string;
  majorField: string;
  gradeOrScore?: string;
  curriculum?: string;
  mentorLetter: string;
  mentorName: string;
  graduationDate: string;
  honors: string[];
  certificateId: string;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: number;
  name: string;
  cohort: string;
  content: string;
  status: ReviewStatus;
  createdAt: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface AppNotification {
  id: number;
  userId?: number;
  title: string;
  message: string;
  time?: string;
  createdAt?: string;
  read: boolean;
  type?: string;
  linkTab?: string;
}

// ─── App Config / Settings ────────────────────────────────────────────────────

export interface SessionPricingConfig {
  oneToOneRate: number;
  groupRate7Plus: number;
  groupRateUnder7: number;
  currency?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface AppConfig {
  curriculaOptions: string[];
  examSessionOptions: string[];
  introVideoUrl: string;
  sessionPricing: SessionPricingConfig;
}

export interface PaymentChannel {
  id: string;
  method: PaymentMethodType;
  label: string;
  account: string;
  accountName?: string;
  bankName?: string;
  swiftCode?: string;
  iban?: string;
  instructions?: string;
}

export interface PackageTier {
  id: string;
  title: string;
  sessionsCount: number;
  price: number;
  pricePerSession: number;
  badge?: string;
  features: string[];
  popular?: boolean;
  creditType?: '1-to-1' | 'group';
}

// ─── Admin / CRM ─────────────────────────────────────────────────────────────

export interface AdminRecord {
  id: number;
  userId: number;
  username: string;
  name: string;
  avatar?: string;
  specialty?: string;
}

export interface CRMStudent extends StudentProfile {
  lastSessionDate?: string;
  totalSessions?: number;
}

// ─── Dashboard Data ───────────────────────────────────────────────────────────

export interface StudentDashboardData {
  student: StudentProfile;
  upcomingSessions: BookingSession[];
  recentSubmissions: HomeworkSubmission[];
  pendingAssignments: HomeworkAssignment[];
  notifications: AppNotification[];
  totalCredits: number;
  remainingCredits: number;
  attendanceRate: number;
  averageScore: number;
}

export interface AdminDashboardData {
  totalStudents: number;
  totalRevenue: number;
  pendingPaymentProofs: number;
  totalCredits: number;
  pendingBookings: BookingSession[];
  recentPaymentProofs: ManualPaymentProof[];
  ungradedSubmissions: HomeworkSubmission[];
  openTickets: SupportTicket[];
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
