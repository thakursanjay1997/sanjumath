export interface PaymentSettings {
  phone: string;
  upi: string;
  accountHolder: string;
}

export interface CoursePrice {
  math: number;
  physics: number;
  combo: number;
}

export type CoursePrices = Record<number, CoursePrice>;

export interface Announcement {
  text: string;
  isEnabled: boolean;
}

export interface EmergencyAlert {
  title: string;
  message: string;
  isActive: boolean;
  timestamp?: string;
}

export interface LiveBroadcastState {
  isLive: boolean;
  topic: string;
  subject: string;
  grade: number;
  startedAt: string | null;
}

export interface StudentRecord {
  roll: string;
  name: string;
  email: string;
  phone: string;
  grade: number;
  password?: string;
  courseName: string;
  feePaid: number;
  utr: string;
  joinedDate: string;
  enrolledGrades: number[];
  isSimulated?: boolean;
}

export interface FacultyRecord {
  id: string;
  facultyId: string;
  name: string;
  password?: string;
  subject: string;
  grades: number[];
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'DISCONTINUED' | 'DENIED';
  createdAt: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface PendingPayment {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  grade: number;
  courseName: string;
  fee: number;
  utr: string;
  couponCode?: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'flat';
  value: number;
  desc: string;
  active: boolean;
  usageCount: number;
}

export interface ScheduledClass {
  id: string;
  grade: number;
  subject: string;
  topic: string;
  time: string;
}

export interface LectureRecording {
  id: string;
  title: string;
  subject: string;
  grade: number;
  duration: string;
  date: string;
  notesUrl?: string;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  grade: number;
  subject: string;
  questions: QuizQuestion[];
}

export interface Doubt {
  id: string;
  sender: string;
  text: string;
  role: 'student' | 'teacher';
  time: string;
}

export interface AuditLog {
  id: string;
  time: string;
  text: string;
}

export interface PlatformInfo {
  ownerEmail: string;
  paymentSettings: PaymentSettings;
  coursePrices: CoursePrices;
  announcement: Announcement;
  emergencyAlert: EmergencyAlert;
  liveBroadcast: LiveBroadcastState;
  stats: {
    totalStudents: number;
    pendingApprovals: number;
    totalRevenue: number;
  };
}

export type PortalType = 'public' | 'student' | 'teacher' | 'owner' | 'auth';

export interface StudentQuizResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
}

export interface StudentProgress {
  studentRoll: string;
  viewedRecordingIds: string[];
  quizResults: Record<string, StudentQuizResult>;
  completedTopics: string[];
  completedChapters: string[];
  lastUpdated?: string;
}

export interface ChapterMeta {
  id: string;
  name: string;
  subject: 'Mathematics' | 'Physics';
  grade: number;
  weightage?: string;
  topics: string[];
}
