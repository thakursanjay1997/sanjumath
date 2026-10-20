import React, { useState, useEffect, useCallback } from 'react';
import {
  PlatformInfo,
  CoursePrices,
  PaymentSettings,
  Announcement,
  EmergencyAlert,
  LiveBroadcastState,
  StudentRecord,
  PendingPayment,
  ScheduledClass,
  LectureRecording,
  Quiz,
  Doubt,
  AuditLog,
  PortalType
} from './types';
import { api } from './api';
import { Header } from './components/Header';
import { HomeSection } from './components/HomeSection';
import { CurriculumSection } from './components/CurriculumSection';
import { CoursesSection } from './components/CoursesSection';
import { StudentPortal } from './components/StudentPortal';
import { TeacherPortal } from './components/TeacherPortal';
import { OwnerPortal } from './components/OwnerPortal';
import { UnifiedAuthModal } from './components/UnifiedAuthModal';
import { PaymentModal } from './components/PaymentModal';
import { LiveClassroomStudio } from './components/LiveClassroomStudio';
import { NotesReplayModal } from './components/NotesReplayModal';
import { ParentCounselingModal } from './components/ParentCounselingModal';

export default function App() {
  // Independent Portal Routing: 'public' | 'student' | 'teacher' | 'owner'
  const [activePortal, setActivePortal] = useState<PortalType>('public');
  const [publicTab, setPublicTab] = useState<string>('home');

  // Platform state
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    phone: '7972453092',
    upi: 'thakursanjay1997@oksbi',
    accountHolder: 'Bhimsingh Thakur (M.Sc.)'
  });
  const [coursePrices, setCoursePrices] = useState<CoursePrices>({
    6: { math: 4000, physics: 4000, combo: 7500 },
    7: { math: 5000, physics: 5000, combo: 9500 },
    8: { math: 6000, physics: 6000, combo: 11500 },
    9: { math: 7000, physics: 7000, combo: 13000 },
    10: { math: 8000, physics: 8000, combo: 15000 }
  });
  const [announcement, setAnnouncement] = useState<Announcement>({
    text: '📢 Admissions Open for CBSE Academic Session 2026–27 • Pure Mathematics & Applied Physics Live Batches',
    isEnabled: true
  });
  const [emergencyAlert, setEmergencyAlert] = useState<EmergencyAlert>({
    title: '',
    message: '',
    isActive: false
  });
  const [liveBroadcast, setLiveBroadcast] = useState<LiveBroadcastState>({
    isLive: false,
    topic: 'Quadratic Equations & Roots Derivation',
    subject: 'Mathematics',
    grade: 10,
    startedAt: null
  });

  // Entities state
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [scheduledClasses, setScheduledClasses] = useState<ScheduledClass[]>([]);
  const [recordings, setRecordings] = useState<LectureRecording[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Authentication states
  const [student, setStudent] = useState<StudentRecord | null>(() => {
    try {
      const saved = localStorage.getItem('sanju_current_student');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('sanju_teacher_auth') === 'true';
  });
  const [currentFaculty, setCurrentFaculty] = useState<{
    facultyName?: string;
    facultyId?: string;
    subject?: string;
    grades?: number[];
    activeBatch?: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('sanju_faculty_info');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('sanju_owner_auth') === 'true';
  });

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalDefaultRole, setAuthModalDefaultRole] = useState<'student' | 'teacher' | 'owner'>('student');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [checkoutGrade, setCheckoutGrade] = useState<number>(10);
  const [checkoutPackage, setCheckoutPackage] = useState<'math' | 'physics' | 'combo'>('combo');
  const [checkoutFee, setCheckoutFee] = useState<number>(15000);

  const [isLiveStudioOpen, setIsLiveStudioOpen] = useState(false);
  const [notesModalRecording, setNotesModalRecording] = useState<LectureRecording | null>(null);
  const [isCounselingModalOpen, setIsCounselingModalOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Web Audio Chime Synthesizer
  const playAudioChime = useCallback((type: 'success' | 'alert' | 'emergency') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.36);
      } else if (type === 'alert') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.31);
      } else if (type === 'emergency') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.setValueAtTime(440, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.51);
      }
    } catch {
      // Audio fallback
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3800);
  }, []);

  // Sync real-time state from backend
  const refreshBackendData = useCallback(async () => {
    try {
      const info = await api.getPlatformInfo();
      setPaymentSettings(info.paymentSettings);
      setCoursePrices(info.coursePrices);
      setAnnouncement(info.announcement);
      setEmergencyAlert(info.emergencyAlert);
      setLiveBroadcast(info.liveBroadcast);

      const [pPay, stds, sched, recs, qzs, lv, logs] = await Promise.all([
        api.getPendingPayments(),
        api.getStudents(),
        api.getSchedule(),
        api.getRecordings(),
        api.getQuizzes(),
        api.getLiveStatus(),
        api.getAuditLogs()
      ]);

      setPendingPayments(pPay.pendingPayments);
      setStudents(stds.students);
      setScheduledClasses(sched.scheduledClasses);
      setRecordings(recs.recordings);
      setQuizzes(qzs.quizzes);
      setDoubts(lv.doubts || []);
      setAuditLogs(logs.auditLogs || []);

      // Real-time check if student approval status changed
      if (student) {
        const status = await api.checkStudentStatus(student.email, student.name);
        if (status.student) {
          const wasApproved = student.enrolledGrades.includes(student.grade);
          const isNowApproved = status.student.enrolledGrades.includes(student.grade);
          if (!wasApproved && isNowApproved) {
            playAudioChime('success');
            showToast(`✓ Great news! Class ${student.grade} batch verified and unlocked by Owner!`);
          }
          setStudent(status.student);
          localStorage.setItem('sanju_current_student', JSON.stringify(status.student));
        }
      }
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }
  }, [student, playAudioChime, showToast]);

  // Initial and recurring real-time poll
  useEffect(() => {
    refreshBackendData();
    const interval = setInterval(() => {
      refreshBackendData();
    }, 4000);
    return () => clearInterval(interval);
  }, [refreshBackendData]);

  // Open Checkout Modal
  const handleOpenCheckout = (grade: number, pkg: 'math' | 'physics' | 'combo', fee: number) => {
    setCheckoutGrade(grade);
    setCheckoutPackage(pkg);
    setCheckoutFee(fee);
    setIsPaymentModalOpen(true);
  };

  // Submit Payment
  const handleSubmitPayment = async (payload: {
    studentName: string;
    studentEmail: string;
    studentPhone: string;
    grade: number;
    courseName: string;
    fee: number;
    utr: string;
    couponCode?: string;
  }) => {
    await api.submitPayment(payload);
    playAudioChime('success');
    refreshBackendData();
  };

  // Student Authentication Success
  const handleStudentAuthSuccess = (newStudent: StudentRecord) => {
    setStudent(newStudent);
    localStorage.setItem('sanju_current_student', JSON.stringify(newStudent));
    setActivePortal('student');
    playAudioChime('success');
  };

  // Teacher Authentication Success
  const handleTeacherAuthSuccess = (facultyData?: {
    facultyName: string;
    facultyId: string;
    subject?: string;
    grades?: number[];
    activeBatch?: string;
  }) => {
    setIsTeacherLoggedIn(true);
    if (facultyData) {
      setCurrentFaculty(facultyData);
      localStorage.setItem('sanju_faculty_info', JSON.stringify(facultyData));
    }
    localStorage.setItem('sanju_teacher_auth', 'true');
    setActivePortal('teacher');
    playAudioChime('success');
  };

  // Owner Authentication Success (strictly thakursanjay1997@gmail.com)
  const handleOwnerAuthSuccess = () => {
    setIsOwnerLoggedIn(true);
    localStorage.setItem('sanju_owner_auth', 'true');
    setActivePortal('owner');
    playAudioChime('success');
  };

  // Logout Handlers
  const handleLogoutStudent = () => {
    setStudent(null);
    localStorage.removeItem('sanju_current_student');
    setActivePortal('public');
    showToast('Student logged out.');
  };

  const handleLogoutTeacher = () => {
    setIsTeacherLoggedIn(false);
    setCurrentFaculty(null);
    localStorage.removeItem('sanju_teacher_auth');
    localStorage.removeItem('sanju_faculty_info');
    setActivePortal('public');
    showToast('Faculty logged out.');
  };

  const handleLogoutOwner = () => {
    setIsOwnerLoggedIn(false);
    localStorage.removeItem('sanju_owner_auth');
    setActivePortal('public');
    showToast('Directorate desk locked.');
  };

  const handleOpenAuthModal = (defaultRole: 'student' | 'teacher' | 'owner' = 'student') => {
    setAuthModalDefaultRole(defaultRole);
    setIsAuthModalOpen(true);
  };

  // Printable Admission Receipt Generator
  const handlePrintAdmissionReceipt = (record: StudentRecord) => {
    const receiptWin = window.open('', '_blank');
    if (!receiptWin) return;
    receiptWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Official Admission Receipt - ${record.name}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .box { max-width: 680px; margin: 0 auto; border: 2px solid #0f172a; padding: 32px; border-radius: 14px; }
          .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 26px; font-weight: 900; color: #0f172a; }
          .sub { font-size: 13px; color: #64748b; font-weight: 600; }
          .badge { background: #10b981; color: #fff; padding: 4px 12px; border-radius: 999px; font-weight: 800; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin: 24px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          th { color: #64748b; width: 40%; font-weight: 600; }
          td { font-weight: 700; color: #0f172a; }
          .footer { border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
          .stamp { color: #b45309; font-weight: 800; border: 2px dashed #b45309; padding: 4px 12px; border-radius: 6px; display: inline-block; margin-bottom: 6px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="box">
          <div class="header">
            <div>
              <div class="title">∑ SANJU MATH ACADEMY</div>
              <div class="sub">CBSE Pure Mathematics & Applied Physics &bull; Classes 6–10</div>
            </div>
            <span class="badge">OFFICIAL VERIFIED RECEIPT</span>
          </div>

          <table>
            <tr><th>Roll Number:</th><td>${record.roll}</td></tr>
            <tr><th>Student Full Name:</th><td>${record.name}</td></tr>
            <tr><th>Enrolled CBSE Class:</th><td>Class ${record.grade}</td></tr>
            <tr><th>Course Enrolled:</th><td>${record.courseName}</td></tr>
            <tr><th>Transaction Reference / UTR:</th><td>${record.utr}</td></tr>
            <tr><th>Admission Date:</th><td>${record.joinedDate}</td></tr>
            <tr><th>Fee Verified:</th><td style="color:#059669; font-size:18px;">₹${record.feePaid.toLocaleString()} (Full Access Granted)</td></tr>
          </table>

          <div class="footer">
            <div>
              <p style="font-size:12px; color:#64748b; margin:0;">Account Verified &bull; Bhimsingh Thakur</p>
              <p style="font-size:11px; color:#94a3b8; margin:2px 0 0;">PhonePe / UPI: 7972453092 &bull; thakursanjay1997@oksbi</p>
            </div>
            <div style="text-align:right;">
              <div class="stamp">OFFICIALLY ENROLLED</div>
              <div style="font-weight:800; font-size:14px;">Bhimsingh Thakur (M.Sc.)</div>
              <div style="font-size:11px; color:#64748b;">Founder & Lead Faculty</div>
            </div>
          </div>

          <div class="no-print" style="margin-top:24px; text-align:center;">
            <button onclick="window.print()" style="background:#0284c7; color:#fff; border:none; padding:10px 24px; border-radius:8px; font-weight:700; cursor:pointer;">🖨️ Print / Save as PDF</button>
          </div>
        </div>
      </body>
      </html>
    `);
    receiptWin.document.close();
  };

  const enrolledGrades = student ? student.enrolledGrades : [];

  return (
    <div className="min-h-screen bg-[#030611] text-slate-100 flex flex-col font-sans relative selection:bg-amber-400 selection:text-slate-900">
      
      {/* 1. Header Navigation & Broadcast Alerts */}
      <Header
        activePortal={activePortal}
        onPortalChange={setActivePortal}
        publicTab={publicTab}
        onPublicTabChange={setPublicTab}
        announcement={announcement}
        emergencyAlert={emergencyAlert}
        liveBroadcast={liveBroadcast}
        student={student}
        isTeacherLoggedIn={isTeacherLoggedIn}
        isOwnerLoggedIn={isOwnerLoggedIn}
        pendingCount={pendingPayments.length}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={() => {
          if (activePortal === 'student') handleLogoutStudent();
          else if (activePortal === 'teacher') handleLogoutTeacher();
          else if (activePortal === 'owner') handleLogoutOwner();
        }}
        onDismissEmergency={() => setEmergencyAlert({ ...emergencyAlert, isActive: false })}
      />

      {/* 2. Main Page Container (Render Selected Portal) */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full relative z-10">
        
        {/* PORTAL A: PUBLIC ACADEMY HOMEPAGE */}
        {activePortal === 'public' && (
          <>
            {publicTab === 'home' && (
              <HomeSection
                onExploreCourses={() => setPublicTab('courses')}
                onExploreCurriculum={() => setPublicTab('curriculum')}
                onOpenCounseling={() => setIsCounselingModalOpen(true)}
              />
            )}

            {publicTab === 'curriculum' && <CurriculumSection />}

            {publicTab === 'courses' && (
              <CoursesSection
                coursePrices={coursePrices}
                paymentSettings={paymentSettings}
                enrolledGrades={enrolledGrades}
                onOpenCheckout={handleOpenCheckout}
                onCopyText={(text, label) => {
                  navigator.clipboard.writeText(text);
                  showToast(`${label} copied to clipboard!`);
                }}
              />
            )}
          </>
        )}

        {/* PORTAL B: DEDICATED STUDENT PORTAL */}
        {activePortal === 'student' && (
          <StudentPortal
            student={student}
            pendingPayments={pendingPayments}
            recordings={recordings}
            quizzes={quizzes}
            scheduledClasses={scheduledClasses}
            isLiveBroadcasting={liveBroadcast.isLive}
            onLogin={async (name, email, grade) => {
              const res = await api.studentLogin({ loginId: email || name, grade });
              setStudent(res.student);
              localStorage.setItem('sanju_current_student', JSON.stringify(res.student));
              showToast(`Welcome, ${res.student.name}!`);
            }}
            onRegister={async (name, email, phone, grade) => {
              const res = await api.studentSignUp({ name, email, phone, grade });
              setStudent(res.student);
              localStorage.setItem('sanju_current_student', JSON.stringify(res.student));
              showToast(`Account created! Welcome, ${res.student.name}.`);
            }}
            onLogout={handleLogoutStudent}
            onReturnToHome={() => setActivePortal('public')}
            onRefreshStatus={refreshBackendData}
            onOpenCourses={() => {
              setActivePortal('public');
              setPublicTab('courses');
            }}
            onOpenCurriculum={() => {
              setActivePortal('public');
              setPublicTab('curriculum');
            }}
            onEnterLiveStudio={() => setIsLiveStudioOpen(true)}
            onViewNotes={(rec) => setNotesModalRecording(rec)}
            onSubmitDoubt={async (text) => {
              const sender = student ? student.name : 'Student';
              const res = await api.sendDoubt({ sender, text, role: 'student' });
              setDoubts(res.doubts);
              playAudioChime('alert');
              showToast('Doubt submitted to Bhimsingh Sir!');
            }}
            onPrintReceipt={handlePrintAdmissionReceipt}
            onShowToast={showToast}
          />
        )}

        {/* PORTAL C: DEDICATED FACULTY DESK */}
        {activePortal === 'teacher' && (
          <TeacherPortal
            currentFaculty={currentFaculty}
            scheduledClasses={scheduledClasses}
            doubts={doubts}
            students={students}
            isLiveBroadcasting={liveBroadcast.isLive}
            onToggleBroadcast={async (isLive, topic, subject, grade) => {
              const res = await api.toggleLive({
                isLive,
                topic,
                subject,
                grade,
                teacherPassword: 'teach123'
              });
              setLiveBroadcast(res.liveBroadcast);
              if (isLive) {
                playAudioChime('alert');
                showToast('🔴 Live Classroom Studio Broadcast Launched!');
              } else {
                showToast('Broadcast concluded.');
              }
              refreshBackendData();
            }}
            onAddSchedule={async (grade, subject, topic, time) => {
              const res = await api.addSchedule({ grade, subject, topic, time });
              setScheduledClasses(res.scheduledClasses);
              playAudioChime('success');
              showToast('Class scheduled & published!');
            }}
            onDeleteSchedule={async (id) => {
              const res = await api.deleteSchedule(id);
              setScheduledClasses(res.scheduledClasses);
              showToast('Scheduled class removed.');
            }}
            onPublishQuiz={async (quiz) => {
              const res = await api.publishQuiz(quiz);
              setQuizzes(res.quizzes);
              playAudioChime('success');
              showToast('Test published to student portals!');
            }}
            onSendReply={async (text) => {
              const res = await api.sendDoubt({ sender: 'Bhimsingh Thakur (Faculty)', text, role: 'teacher' });
              setDoubts(res.doubts);
              playAudioChime('success');
              showToast('Reply broadcasted to class feed!');
            }}
            onEnterStudio={() => setIsLiveStudioOpen(true)}
            onReturnToHome={() => setActivePortal('public')}
            onLogout={handleLogoutTeacher}
            onShowToast={showToast}
          />
        )}

        {/* PORTAL D: DEDICATED OWNER DIRECTORATE (thakursanjay1997@gmail.com) */}
        {activePortal === 'owner' && (
          <OwnerPortal
            pendingPayments={pendingPayments}
            coursePrices={coursePrices}
            paymentSettings={paymentSettings}
            announcement={announcement}
            emergencyAlert={emergencyAlert}
            recordings={recordings}
            auditLogs={auditLogs}
            onApprovePayment={async (paymentId) => {
              try {
                const res = await api.approvePayment(paymentId, 'sanjaymath@1997', 'thakursanjay1997@gmail.com');
                playAudioChime('success');
                showToast(res.message || 'Payment approved!');
                refreshBackendData();
              } catch (err: any) {
                showToast(err.message || 'Approval failed');
              }
            }}
            onBatchApproveAll={async () => {
              try {
                const res = await api.batchApproveAll('sanjaymath@1997');
                playAudioChime('success');
                showToast(res.message || 'Batch approved all!');
                refreshBackendData();
              } catch (err: any) {
                showToast(err.message || 'Batch approval failed');
              }
            }}
            onRejectPayment={async (paymentId) => {
              try {
                await api.rejectPayment(paymentId, 'sanjaymath@1997');
                showToast('Payment rejected.');
                refreshBackendData();
              } catch (err: any) {
                showToast(err.message || 'Reject failed');
              }
            }}
            onGodModeEnroll={async (data) => {
              try {
                const res = await api.godModeEnroll({ ...data, adminPasscode: 'sanjaymath@1997' });
                playAudioChime('success');
                showToast(`⚡ Direct admission confirmed for ${data.name} (${res.student.roll})!`);
                refreshBackendData();
              } catch (err: any) {
                showToast(err.message || 'God-Mode enrollment failed');
              }
            }}
            onRevokeStudent={async (roll) => {
              try {
                await api.revokeStudent(roll);
                showToast(`Enrollment revoked for roll ${roll}.`);
                refreshBackendData();
              } catch (err: any) {
                showToast(err.message || 'Revoke failed');
              }
            }}
            onSaveCoupon={async (coupon) => {
              try {
                await api.saveCoupon({ ...coupon, adminPasscode: 'sanjaymath@1997' });
                playAudioChime('success');
                showToast(`🎟️ Coupon ${coupon.code} activated!`);
                refreshBackendData();
              } catch (err: any) {
                showToast(err.message || 'Failed to save coupon');
              }
            }}
            onDeleteCoupon={async (id) => {
              try {
                await api.deleteCoupon(id);
                showToast('Coupon deleted.');
                refreshBackendData();
              } catch (err: any) {
                showToast(err.message || 'Delete coupon failed');
              }
            }}
            onSavePricing={async (prices) => {
              try {
                await api.updatePricing({
                  prices,
                  adminPasscode: 'sanjaymath@1997',
                  requesterEmail: 'thakursanjay1997@gmail.com'
                });
                setCoursePrices(prices);
                refreshBackendData();
              } catch (err: any) {
                showToast(err.message || 'Failed to update pricing');
              }
            }}
            onSavePaymentSettings={async (settings) => {
              try {
                await api.updateSettings({
                  paymentSettings: settings,
                  adminPasscode: 'sanjaymath@1997',
                  requesterEmail: 'thakursanjay1997@gmail.com'
                });
                setPaymentSettings(settings);
                refreshBackendData();
              } catch (err: any) {
                showToast(err.message || 'Failed to update settings');
              }
            }}
            onSaveAnnouncement={async (ann) => {
              try {
                await api.updateSettings({
                  announcement: ann,
                  adminPasscode: 'sanjaymath@1997',
                  requesterEmail: 'thakursanjay1997@gmail.com'
                });
                setAnnouncement(ann);
                refreshBackendData();
              } catch (err: any) {
                showToast(err.message || 'Failed to update ticker');
              }
            }}
            onSendEmergencyAlert={async (title, message, isActive) => {
              try {
                await api.sendEmergencyAlert({ title, message, isActive, adminPasscode: 'sanjaymath@1997' });
                if (isActive) {
                  playAudioChime('emergency');
                  showToast('🚨 Emergency alert dispatched to all screens!');
                } else {
                  showToast('Emergency alert cleared.');
                }
                refreshBackendData();
              } catch (err: any) {
                showToast(err.message || 'Emergency alert failed');
              }
            }}
            onSaveRecording={async (rec) => {
              const res = await api.saveRecording(rec);
              setRecordings(res.recordings);
              showToast('Lecture recording added!');
            }}
            onDeleteRecording={async (id) => {
              const res = await api.deleteRecording(id);
              setRecordings(res.recordings);
              showToast('Recording deleted.');
            }}
            onClearAuditLogs={async () => {
              await api.clearAuditLogs();
              setAuditLogs([]);
              showToast('Audit logs cleared.');
            }}
            onPrintReceipt={handlePrintAdmissionReceipt}
            onRestoreDatabase={async (data) => {
              await api.restoreDatabase(data, 'sanjaymath@1997');
              showToast('Database restored!');
              refreshBackendData();
            }}
            onReturnToHome={() => setActivePortal('public')}
            onLogout={handleLogoutOwner}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* 3. Global Footer (Only displayed on public pages) */}
      {activePortal === 'public' && (
        <footer className="bg-[#050916] border-t border-slate-800/80 py-8 text-xs text-slate-400 mt-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
            <div className="space-y-1">
              <p className="font-heading font-black text-white text-sm">
                ∑ SANJU MATH &bull; Premier CBSE Pure Mathematics & Applied Physics Academy
              </p>
              <p>Founder & Lead Faculty: <strong>Bhimsingh Thakur (M.Sc. Mathematics)</strong></p>
              <p className="font-mono text-slate-400">
                Official Gateway UPI: <span className="text-amber-400">{paymentSettings.upi}</span> &bull; Direct Phone: +91 {paymentSettings.phone}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleOpenAuthModal('student')}
                className="text-amber-400 hover:text-amber-300 font-bold"
              >
                Student Sign In
              </button>
              <button
                onClick={() => handleOpenAuthModal('teacher')}
                className="text-slate-400 hover:text-slate-300"
              >
                Faculty Desk
              </button>
              <button
                onClick={() => handleOpenAuthModal('owner')}
                className="text-slate-500 hover:text-slate-300"
                title="Director Login"
              >
                Director Access
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* 4. Unified Authentication Modal */}
      <UnifiedAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole={authModalDefaultRole}
        onStudentSuccess={handleStudentAuthSuccess}
        onTeacherSuccess={handleTeacherAuthSuccess}
        onOwnerSuccess={handleOwnerAuthSuccess}
        onShowToast={showToast}
      />

      {/* 5. Payment Checkout Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        grade={checkoutGrade}
        packageType={checkoutPackage}
        baseFee={checkoutFee}
        paymentSettings={paymentSettings}
        defaultStudentName={student ? student.name : ''}
        defaultStudentEmail={student ? student.email : ''}
        defaultStudentPhone={student ? student.phone : ''}
        onApplyCoupon={(code, orig) => api.applyCoupon(code, orig)}
        onSubmitPayment={handleSubmitPayment}
        onShowToast={showToast}
      />

      {/* 6. Fullscreen Live Classroom Studio Modal */}
      <LiveClassroomStudio
        isOpen={isLiveStudioOpen}
        onClose={() => setIsLiveStudioOpen(false)}
        doubts={doubts}
        onSendDoubt={async (text) => {
          const sender = activePortal === 'teacher' ? 'Bhimsingh Thakur (Faculty)' : student ? student.name : 'Student';
          const role = activePortal === 'teacher' ? 'teacher' : 'student';
          const res = await api.sendDoubt({ sender, text, role });
          setDoubts(res.doubts);
          showToast('Message sent to Studio Feed!');
        }}
        onSaveBoardNotes={async (dataUrl) => {
          const res = await api.saveRecording({
            title: `Smartboard Live Derivations (${new Date().toLocaleDateString()})`,
            subject: 'Mathematics',
            grade: 10,
            duration: 'Live Class',
            notesUrl: dataUrl
          });
          setRecordings(res.recordings);
          showToast('Notes saved to vault!');
        }}
        onShowToast={showToast}
      />

      {/* 7. Lecture Notes Replay Modal */}
      <NotesReplayModal
        recording={notesModalRecording}
        onClose={() => setNotesModalRecording(null)}
        onShowToast={showToast}
      />

      {/* 8. Parent WhatsApp Counseling Modal */}
      <ParentCounselingModal
        isOpen={isCounselingModalOpen}
        onClose={() => setIsCounselingModalOpen(false)}
        paymentSettings={paymentSettings}
      />

      {/* 9. Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black text-xs px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-300 animate-slideUp flex items-center gap-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
