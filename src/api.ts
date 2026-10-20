import {
  PlatformInfo,
  CoursePrices,
  PaymentSettings,
  Announcement,
  PendingPayment,
  StudentRecord,
  Coupon,
  ScheduledClass,
  LectureRecording,
  Quiz,
  Doubt,
  AuditLog,
  FacultyRecord,
  StudentProgress
} from './types';

const API_BASE = '/api';

export const api = {
  // Platform Info
  async getPlatformInfo(): Promise<PlatformInfo> {
    const res = await fetch(`${API_BASE}/platform/info`);
    if (!res.ok) throw new Error('Failed to fetch platform info');
    return res.json();
  },

  // Authentication: Student Sign Up & Login
  async studentSignUp(payload: {
    name: string;
    email?: string;
    phone: string;
    grade: number;
    password?: string;
  }): Promise<{ success: boolean; message: string; student: StudentRecord }> {
    const res = await fetch(`${API_BASE}/auth/student/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to sign up');
    return res.json();
  },

  async studentLogin(payload: {
    loginId: string;
    grade?: number;
    password?: string;
  }): Promise<{ success: boolean; student: StudentRecord; isApproved: boolean }> {
    const res = await fetch(`${API_BASE}/auth/student/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to login');
    return res.json();
  },

  // Authentication: Faculty
  async teacherLogin(payload: { teacherId: string; password?: string }): Promise<{
    success: boolean;
    role: string;
    facultyName: string;
    facultyId: string;
    subject?: string;
    grades?: number[];
    activeBatch?: string;
  }> {
    const res = await fetch(`${API_BASE}/auth/teacher/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Invalid teacher credentials');
    return res.json();
  },

  // Authentication: Owner (Strictly thakursanjay1997@gmail.com)
  async ownerLogin(payload: { email: string; passcode: string }) {
    const res = await fetch(`${API_BASE}/auth/owner/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Owner authentication failed');
    return res.json();
  },

  // Settings & Pricing
  async updateSettings(payload: {
    paymentSettings?: Partial<PaymentSettings>;
    announcement?: Partial<Announcement>;
    adminPasscode: string;
    requesterEmail: string;
  }) {
    const res = await fetch(`${API_BASE}/platform/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to update settings');
    return res.json();
  },

  async updatePricing(payload: {
    prices: CoursePrices;
    adminPasscode: string;
    requesterEmail: string;
  }) {
    const res = await fetch(`${API_BASE}/courses/pricing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to update pricing');
    return res.json();
  },

  // Student Payment & Status
  async submitPayment(payload: {
    studentName: string;
    studentEmail?: string;
    studentPhone?: string;
    grade: number;
    courseName: string;
    fee: number;
    utr: string;
    couponCode?: string;
  }): Promise<{ success: boolean; payment: PendingPayment; message: string }> {
    const res = await fetch(`${API_BASE}/payment/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to submit payment');
    return res.json();
  },

  async checkStudentStatus(email?: string, name?: string): Promise<{
    isApproved: boolean;
    student: StudentRecord | null;
    enrolledGrades: number[];
    pendingPayments: PendingPayment[];
  }> {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (name) params.append('name', name);
    const res = await fetch(`${API_BASE}/payment/student-status?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to check student status');
    return res.json();
  },

  // Owner Payment Approvals
  async getPendingPayments(): Promise<{ pendingPayments: PendingPayment[]; count: number }> {
    const res = await fetch(`${API_BASE}/owner/pending-payments`);
    if (!res.ok) throw new Error('Failed to get pending payments');
    return res.json();
  },

  async approvePayment(paymentId: string, adminPasscode: string, requesterEmail: string) {
    const res = await fetch(`${API_BASE}/owner/approve-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, adminPasscode, requesterEmail })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to approve payment');
    return res.json();
  },

  async batchApproveAll(adminPasscode: string) {
    const res = await fetch(`${API_BASE}/owner/batch-approve-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPasscode })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to batch approve');
    return res.json();
  },

  async rejectPayment(paymentId: string, adminPasscode: string) {
    const res = await fetch(`${API_BASE}/owner/reject-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, adminPasscode })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to reject payment');
    return res.json();
  },

  // Scalable Student Directory (Supporting 1000+ Students)
  async getStudents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    grade?: string;
  }): Promise<{
    students: StudentRecord[];
    total: number;
    page: number;
    totalPages: number;
    count: number;
  }> {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', params.page.toString());
    if (params?.limit) q.append('limit', params.limit.toString());
    if (params?.search) q.append('search', params.search);
    if (params?.grade) q.append('grade', params.grade);
    const res = await fetch(`${API_BASE}/students?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to get students');
    return res.json();
  },

  async godModeEnroll(payload: {
    name: string;
    email?: string;
    phone?: string;
    grade: number;
    courseName: string;
    feeType: string;
    adminPasscode: string;
  }) {
    const res = await fetch(`${API_BASE}/owner/god-mode-enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to execute God Mode enroll');
    return res.json();
  },

  async revokeStudent(roll: string) {
    const res = await fetch(`${API_BASE}/owner/student/${roll}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to revoke student');
    return res.json();
  },

  async generateScaleStudents(count: number, adminPasscode: string) {
    const res = await fetch(`${API_BASE}/owner/generate-scale-students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count, adminPasscode })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to generate test batch');
    return res.json();
  },

  async wipeSimulatedStudents(adminPasscode: string) {
    const res = await fetch(`${API_BASE}/owner/wipe-simulated-students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPasscode })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to wipe simulated batch');
    return res.json();
  },

  // Coupons
  async getCoupons(): Promise<{ coupons: Coupon[] }> {
    const res = await fetch(`${API_BASE}/coupons`);
    if (!res.ok) throw new Error('Failed to fetch coupons');
    return res.json();
  },

  async applyCoupon(code: string, originalFee: number) {
    const res = await fetch(`${API_BASE}/coupons/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, originalFee })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Invalid coupon code');
    return res.json();
  },

  async saveCoupon(coupon: {
    code: string;
    type: 'percent' | 'flat';
    value: number;
    desc: string;
    adminPasscode: string;
  }) {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coupon)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to save coupon');
    return res.json();
  },

  async deleteCoupon(id: string) {
    const res = await fetch(`${API_BASE}/coupons/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete coupon');
    return res.json();
  },

  // Live Classroom & Doubts
  async getLiveStatus() {
    const res = await fetch(`${API_BASE}/live`);
    if (!res.ok) throw new Error('Failed to get live status');
    return res.json();
  },

  async toggleLive(payload: {
    isLive: boolean;
    topic?: string;
    subject?: string;
    grade?: number;
    teacherPassword: string;
  }) {
    const res = await fetch(`${API_BASE}/live/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to toggle live state');
    return res.json();
  },

  async sendDoubt(payload: { sender: string; text: string; role: 'student' | 'teacher' }): Promise<{
    success: boolean;
    doubt: Doubt;
    doubts: Doubt[];
  }> {
    const res = await fetch(`${API_BASE}/doubts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to send doubt');
    return res.json();
  },

  // Timetable Schedule
  async getSchedule(): Promise<{ scheduledClasses: ScheduledClass[] }> {
    const res = await fetch(`${API_BASE}/schedule`);
    if (!res.ok) throw new Error('Failed to get schedule');
    return res.json();
  },

  async addSchedule(payload: { grade: number; subject: string; topic: string; time: string }) {
    const res = await fetch(`${API_BASE}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to add schedule');
    return res.json();
  },

  async deleteSchedule(id: string) {
    const res = await fetch(`${API_BASE}/schedule/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete schedule');
    return res.json();
  },

  // Quizzes
  async getQuizzes(grade?: number): Promise<{ quizzes: Quiz[] }> {
    const url = grade ? `${API_BASE}/quizzes?grade=${grade}` : `${API_BASE}/quizzes`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to get quizzes');
    return res.json();
  },

  async publishQuiz(quiz: { title: string; grade: number; subject: string; questions: Quiz['questions'] }) {
    const res = await fetch(`${API_BASE}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quiz)
    });
    if (!res.ok) throw new Error('Failed to publish quiz');
    return res.json();
  },

  // Recordings & Notes
  async getRecordings(): Promise<{ recordings: LectureRecording[] }> {
    const res = await fetch(`${API_BASE}/recordings`);
    if (!res.ok) throw new Error('Failed to get recordings');
    return res.json();
  },

  async saveRecording(rec: { title: string; subject: string; grade: number; duration: string; notesUrl?: string }) {
    const res = await fetch(`${API_BASE}/recordings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rec)
    });
    if (!res.ok) throw new Error('Failed to save recording');
    return res.json();
  },

  async deleteRecording(id: string) {
    const res = await fetch(`${API_BASE}/recordings/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete recording');
    return res.json();
  },

  // Emergency Flash Alert
  async sendEmergencyAlert(payload: {
    title: string;
    message: string;
    isActive: boolean;
    adminPasscode: string;
  }) {
    const res = await fetch(`${API_BASE}/owner/emergency-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to trigger emergency alert');
    return res.json();
  },

  // Audit Logs & Backup
  async getAuditLogs(): Promise<{ auditLogs: AuditLog[] }> {
    const res = await fetch(`${API_BASE}/owner/audit-logs`);
    if (!res.ok) throw new Error('Failed to get audit logs');
    return res.json();
  },

  async clearAuditLogs() {
    const res = await fetch(`${API_BASE}/owner/audit-logs`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear audit logs');
    return res.json();
  },

  async restoreDatabase(backupData: any, adminPasscode: string) {
    const res = await fetch(`${API_BASE}/system/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backupData, adminPasscode })
    });
    if (!res.ok) throw new Error('Failed to restore database');
    return res.json();
  },

  // 8B. Director Authority: Faculty Management, ID/Password Issuance, Approval, Discontinuance & Denial
  async getFaculties(): Promise<{ faculties: FacultyRecord[] }> {
    const res = await fetch(`${API_BASE}/owner/faculties`);
    if (!res.ok) throw new Error('Failed to get faculties');
    return res.json();
  },

  async createFaculty(data: {
    facultyId: string;
    name: string;
    password: string;
    subject: string;
    grades: number[];
    phone?: string;
    email?: string;
    notes?: string;
    adminPasscode: string;
  }): Promise<{ success: boolean; faculty: FacultyRecord; faculties: FacultyRecord[] }> {
    const res = await fetch(`${API_BASE}/owner/faculties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to create faculty');
    return res.json();
  },

  async updateFacultyStatus(
    id: string,
    status: 'ACTIVE' | 'PENDING_APPROVAL' | 'DISCONTINUED' | 'DENIED',
    adminPasscode: string
  ): Promise<{ success: boolean; faculty: FacultyRecord; faculties: FacultyRecord[] }> {
    const res = await fetch(`${API_BASE}/owner/faculties/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminPasscode })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to update faculty status');
    return res.json();
  },

  async updateFacultyCredentials(
    id: string,
    data: {
      password?: string;
      subject?: string;
      grades?: number[];
      name?: string;
      adminPasscode: string;
    }
  ): Promise<{ success: boolean; faculty: FacultyRecord; faculties: FacultyRecord[] }> {
    const res = await fetch(`${API_BASE}/owner/faculties/${encodeURIComponent(id)}/credentials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to update faculty credentials');
    return res.json();
  },

  async deleteFaculty(id: string, adminPasscode: string): Promise<{ success: boolean; faculties: FacultyRecord[] }> {
    const res = await fetch(`${API_BASE}/owner/faculties/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPasscode })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete faculty');
    return res.json();
  },

  // Student Course Completion Progress
  async getStudentProgress(roll?: string, email?: string): Promise<{ success: boolean; progress: StudentProgress }> {
    const params = new URLSearchParams();
    if (roll) params.append('roll', roll);
    if (email) params.append('email', email);
    const res = await fetch(`${API_BASE}/student/progress?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch student progress');
    return res.json();
  },

  async saveStudentProgress(payload: {
    studentRoll: string;
    studentEmail?: string;
    viewedRecordingIds?: string[];
    quizResults?: Record<string, any>;
    completedTopics?: string[];
    completedChapters?: string[];
  }): Promise<{ success: boolean; progress: StudentProgress }> {
    const res = await fetch(`${API_BASE}/student/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to save student progress');
    return res.json();
  },

  async recordLectureView(studentRoll: string, recordingId: string, studentEmail?: string): Promise<{ success: boolean; progress: StudentProgress }> {
    const res = await fetch(`${API_BASE}/student/progress/view-recording`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentRoll, recordingId, studentEmail })
    });
    if (!res.ok) throw new Error('Failed to record lecture view');
    return res.json();
  },

  async recordQuizResult(
    studentRoll: string,
    quizId: string,
    result: { score: number; total: number; percentage: number },
    studentEmail?: string
  ): Promise<{ success: boolean; progress: StudentProgress }> {
    const res = await fetch(`${API_BASE}/student/progress/record-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentRoll, quizId, studentEmail, ...result })
    });
    if (!res.ok) throw new Error('Failed to record quiz result');
    return res.json();
  },

  async toggleTopicCompletion(
    studentRoll: string,
    topicId: string,
    completed?: boolean,
    studentEmail?: string
  ): Promise<{ success: boolean; progress: StudentProgress }> {
    const res = await fetch(`${API_BASE}/student/progress/toggle-topic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentRoll, topicId, completed, studentEmail })
    });
    if (!res.ok) throw new Error('Failed to toggle topic completion');
    return res.json();
  }
};
