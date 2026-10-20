import React, { useState, useEffect, useMemo } from 'react';
import {
  StudentRecord,
  PendingPayment,
  LectureRecording,
  Quiz,
  ScheduledClass,
  StudentProgress
} from '../types';
import { api } from '../api';
import { CourseProgressTracker } from './CourseProgressTracker';
import {
  detailedCurriculum,
  matchRecordingToChapter,
  matchQuizToChapter,
  ChapterDetail
} from '../data/curriculumData';
import {
  GraduationCap,
  Lock,
  CheckCircle,
  Video,
  FileText,
  Search,
  Copy,
  Printer,
  Sparkles,
  Flame,
  MessageSquare,
  Clock,
  RotateCw,
  LogOut,
  Send,
  Radio,
  Award,
  TrendingUp,
  CheckCircle2,
  Target,
  PlayCircle
} from 'lucide-react';

interface StudentPortalProps {
  student: StudentRecord | null;
  pendingPayments: PendingPayment[];
  recordings: LectureRecording[];
  quizzes: Quiz[];
  scheduledClasses: ScheduledClass[];
  isLiveBroadcasting: boolean;
  onLogin: (name: string, email: string, grade: number) => void;
  onRegister: (name: string, email: string, phone: string, grade: number) => void;
  onLogout: () => void;
  onRefreshStatus: () => void;
  onOpenCourses: () => void;
  onOpenCurriculum: () => void;
  onEnterLiveStudio: () => void;
  onViewNotes: (recording: LectureRecording) => void;
  onSubmitDoubt: (text: string) => void;
  onPrintReceipt: (student: StudentRecord) => void;
  onReturnToHome?: () => void;
  onShowToast: (msg: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  pendingPayments,
  recordings,
  quizzes,
  scheduledClasses,
  isLiveBroadcasting,
  onLogin,
  onRegister,
  onLogout,
  onRefreshStatus,
  onOpenCourses,
  onOpenCurriculum,
  onEnterLiveStudio,
  onViewNotes,
  onSubmitDoubt,
  onPrintReceipt,
  onReturnToHome,
  onShowToast
}) => {
  // Auth Form State
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [loginId, setLoginId] = useState('aarav.sharma@gmail.com');
  const [loginGrade, setLoginGrade] = useState<number>(10);
  const [loginPassword, setLoginPassword] = useState('1234');

  // Sign up state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regGrade, setRegGrade] = useState<number>(10);
  const [regPassword, setRegPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');

  // Sub tabs state: Includes dynamic course completion progress tracker
  const [activeSubTab, setActiveSubTab] = useState<'live' | 'progress' | 'recordings' | 'quizzes' | 'formula' | 'reports'>('live');

  // Doubt input
  const [doubtText, setDoubtText] = useState('');

  // Formula vault search
  const [formulaSearch, setFormulaSearch] = useState('');

  // Course Progress State with local persistence & backend sync
  const [studentProgress, setStudentProgress] = useState<StudentProgress>(() => {
    if (!student) {
      return {
        studentRoll: '',
        viewedRecordingIds: [],
        quizResults: {},
        completedTopics: [],
        completedChapters: [],
        lastUpdated: new Date().toISOString()
      };
    }
    try {
      const saved = localStorage.getItem(`sanju_progress_${student.roll || student.email}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      studentRoll: student.roll || student.email,
      viewedRecordingIds: [],
      quizResults: {},
      completedTopics: [],
      completedChapters: [],
      lastUpdated: new Date().toISOString()
    };
  });

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<number, number>>>({});
  const [quizResults, setQuizResults] = useState<Record<string, { score: number; total: number; percentage: number }>>({});

  // NCERT Formula Database
  const ncertFormulas = [
    { subject: 'Math', grade: 10, title: 'Quadratic Formula', formula: 'x = (-b ± √(b² - 4ac)) / (2a)', note: 'Valid when discriminant D = b² - 4ac ≥ 0.' },
    { subject: 'Math', grade: 10, title: 'Arithmetic Progression nth Term', formula: 'aₙ = a + (n - 1)d', note: 'a = first term, d = common difference.' },
    { subject: 'Math', grade: 10, title: 'AP Sum of n Terms', formula: 'Sₙ = (n / 2) [2a + (n - 1)d]', note: 'Also expressed as Sₙ = (n / 2)(a + l).' },
    { subject: 'Math', grade: 9, title: 'Heron\'s Area of Triangle', formula: 'Area = √[s(s - a)(s - b)(s - c)]', note: 'Where semi-perimeter s = (a + b + c) / 2.' },
    { subject: 'Math', grade: 8, title: 'Total Surface Area of Cylinder', formula: 'TSA = 2πr(r + h)', note: 'Curved Surface Area = 2πrh.' },
    { subject: 'Physics', grade: 10, title: 'Ohm\'s Law', formula: 'V = I × R', note: 'Current is directly proportional to potential difference at constant temp.' },
    { subject: 'Physics', grade: 10, title: 'Snell\'s Law of Refraction', formula: 'sin i / sin r = constant (n₂₁)', note: 'Ratio of sines of angle of incidence to refraction.' },
    { subject: 'Physics', grade: 9, title: 'Newton\'s Second Law', formula: 'Force F = m × a', note: 'Rate of change of momentum is proportional to applied force.' },
    { subject: 'Physics', grade: 9, title: 'Universal Gravitation Law', formula: 'F = G (m₁ × m₂) / d²', note: 'G = 6.674 × 10⁻¹¹ N m²/kg².' }
  ];

  const handleSendOtp = () => {
    if (!regPhone && !regEmail) {
      onShowToast('Please provide mobile number or email for OTP verification.');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(code);
    setOtpSent(true);
    onShowToast(`Verification OTP dispatched: ${code}`);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      onShowToast('Please enter your full name.');
      return;
    }
    if (simulatedOtp && enteredOtp.trim() !== simulatedOtp) {
      onShowToast('❌ Invalid OTP. Please verify the 6-digit code.');
      return;
    }
    onRegister(regName.trim(), regEmail.trim() || `${regPhone}@student.sanjumath.com`, regPhone.trim(), regGrade);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) {
      onShowToast('Please enter your registered mobile or email.');
      return;
    }
    const name = loginId.includes('@') ? loginId.split('@')[0] : 'Student';
    onLogin(name, loginId.trim(), loginGrade);
  };

  const handleSelectQuizOption = (quizId: string, qIdx: number, optIdx: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [quizId]: {
        ...(prev[quizId] || {}),
        [qIdx]: optIdx
      }
    }));
  };

  // Sync student progress from backend
  useEffect(() => {
    if (!student) return;
    const loadProgress = async () => {
      try {
        const res = await api.getStudentProgress(student.roll, student.email);
        if (res && res.progress) {
          setStudentProgress((prev) => {
            const merged: StudentProgress = {
              studentRoll: student.roll,
              viewedRecordingIds: Array.from(
                new Set([...(prev.viewedRecordingIds || []), ...(res.progress.viewedRecordingIds || [])])
              ),
              quizResults: { ...(prev.quizResults || {}), ...(res.progress.quizResults || {}) },
              completedTopics: Array.from(
                new Set([...(prev.completedTopics || []), ...(res.progress.completedTopics || [])])
              ),
              completedChapters: Array.from(
                new Set([...(prev.completedChapters || []), ...(res.progress.completedChapters || [])])
              ),
              lastUpdated: res.progress.lastUpdated || new Date().toISOString()
            };
            localStorage.setItem(`sanju_progress_${student.roll || student.email}`, JSON.stringify(merged));
            return merged;
          });
        }
      } catch {
        // Fallback to local storage
      }
    };
    loadProgress();
  }, [student?.roll, student?.email]);

  // Mark recording viewed and update progress
  const handleMarkRecordingViewed = async (recId: string, notify = true) => {
    if (!student) return;
    setStudentProgress((prev) => {
      if (prev.viewedRecordingIds.includes(recId)) return prev;
      const next: StudentProgress = {
        ...prev,
        viewedRecordingIds: [...prev.viewedRecordingIds, recId],
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(`sanju_progress_${student.roll || student.email}`, JSON.stringify(next));
      return next;
    });

    try {
      await api.recordLectureView(student.roll, recId, student.email);
      if (notify) {
        onShowToast('✓ Lecture completed & added to Course Progress!');
      }
    } catch {
      // Background sync warning
    }
  };

  const handleViewRecordingWithProgress = (rec: LectureRecording) => {
    handleMarkRecordingViewed(rec.id, false);
    onViewNotes(rec);
  };

  // Toggle specific topic checklist item
  const handleToggleTopic = async (topicId: string) => {
    if (!student) return;
    const isCompleted = studentProgress.completedTopics.includes(topicId);
    const nextCompleted = !isCompleted;

    setStudentProgress((prev) => {
      const updatedTopics = nextCompleted
        ? [...prev.completedTopics, topicId]
        : prev.completedTopics.filter((t) => t !== topicId);
      const next: StudentProgress = {
        ...prev,
        completedTopics: updatedTopics,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(`sanju_progress_${student.roll || student.email}`, JSON.stringify(next));
      return next;
    });

    try {
      await api.toggleTopicCompletion(student.roll, topicId, nextCompleted, student.email);
      onShowToast(nextCompleted ? '✓ Topic marked as mastered!' : 'Topic marked for review.');
    } catch {
      // Background sync
    }
  };

  // Mark chapter fully mastered
  const handleMarkChapterMastered = async (chapter: ChapterDetail) => {
    if (!student) return;
    const isMastered = studentProgress.completedChapters.includes(chapter.id);
    const nextMastered = !isMastered;
    const topicIds = chapter.topics.map((t) => t.id);
    const matchingRecs = recordings.filter(
      (r) => r.grade === student.grade && matchRecordingToChapter(r.title, [chapter])
    );

    setStudentProgress((prev) => {
      let newChapters = [...prev.completedChapters];
      let newTopics = [...prev.completedTopics];
      let newRecs = [...prev.viewedRecordingIds];

      if (nextMastered) {
        if (!newChapters.includes(chapter.id)) newChapters.push(chapter.id);
        topicIds.forEach((id) => {
          if (!newTopics.includes(id)) newTopics.push(id);
        });
        matchingRecs.forEach((r) => {
          if (!newRecs.includes(r.id)) newRecs.push(r.id);
        });
      } else {
        newChapters = newChapters.filter((id) => id !== chapter.id);
        newTopics = newTopics.filter((id) => !topicIds.includes(id));
      }

      const next: StudentProgress = {
        ...prev,
        completedChapters: newChapters,
        completedTopics: newTopics,
        viewedRecordingIds: newRecs,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(`sanju_progress_${student.roll || student.email}`, JSON.stringify(next));
      return next;
    });

    try {
      await api.saveStudentProgress({
        studentRoll: student.roll,
        studentEmail: student.email,
        completedChapters: nextMastered
          ? Array.from(new Set([...studentProgress.completedChapters, chapter.id]))
          : studentProgress.completedChapters.filter((id) => id !== chapter.id),
        completedTopics: nextMastered
          ? Array.from(new Set([...studentProgress.completedTopics, ...topicIds]))
          : studentProgress.completedTopics.filter((id) => !topicIds.includes(id))
      });
      onShowToast(nextMastered ? `🏆 Chapter "${chapter.name}" 100% Mastered!` : `Chapter progress reset to active.`);
    } catch {
      // Background sync
    }
  };

  const handleGradeQuiz = async (quiz: Quiz) => {
    const answers = quizAnswers[quiz.id] || {};
    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) {
        score++;
      }
    });
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const resultObj = {
      score,
      total: quiz.questions.length,
      percentage,
      passed: percentage >= 50,
      completedAt: new Date().toLocaleDateString()
    };

    setQuizResults((prev) => ({
      ...prev,
      [quiz.id]: { score, total: quiz.questions.length, percentage }
    }));

    if (student) {
      setStudentProgress((prev) => {
        const next: StudentProgress = {
          ...prev,
          quizResults: {
            ...prev.quizResults,
            [quiz.id]: resultObj
          },
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(`sanju_progress_${student.roll || student.email}`, JSON.stringify(next));
        return next;
      });

      try {
        await api.recordQuizResult(
          student.roll,
          quiz.id,
          { score, total: quiz.questions.length, percentage },
          student.email
        );
      } catch {
        // Sync warning
      }
    }

    onShowToast(`Quiz evaluated! Score: ${score}/${quiz.questions.length} (${percentage}%). Course Progress Updated!`);
  };

  // Quick Stats for Top Overview Widget & Report
  const studentChapters: ChapterDetail[] = useMemo(() => {
    if (!student) return [];
    return detailedCurriculum[student.grade] || detailedCurriculum[10] || [];
  }, [student?.grade]);

  const quickStats = useMemo(() => {
    if (!student || studentChapters.length === 0) return { totalChapters: 0, completedChapters: 0, overallPct: 0 };
    const totalChapters = studentChapters.length;
    let completedCount = 0;
    let totalScore = 0;

    studentChapters.forEach((ch) => {
      const isExplicit = studentProgress.completedChapters.includes(ch.id);
      const chTopics = ch.topics.length;
      const completedTopics = ch.topics.filter((t) => studentProgress.completedTopics.includes(t.id)).length;
      const chRecs = recordings.filter(
        (r) => r.grade === student.grade && r.subject === ch.subject && matchRecordingToChapter(r.title, [ch])
      );
      const viewedRecs = chRecs.filter((r) => studentProgress.viewedRecordingIds.includes(r.id)).length;
      const chQuizzes = quizzes.filter(
        (q) => q.grade === student.grade && q.subject === ch.subject && matchQuizToChapter(q.title, [ch])
      );
      const passedQuizzes = chQuizzes.filter(
        (q) => (studentProgress.quizResults[q.id]?.percentage || 0) >= 50
      ).length;

      let pct = 0;
      if (isExplicit) {
        pct = 100;
      } else {
        const parts: number[] = [];
        if (chTopics > 0) parts.push(completedTopics / chTopics);
        if (chRecs.length > 0) parts.push(viewedRecs / chRecs.length);
        if (chQuizzes.length > 0) parts.push(passedQuizzes / chQuizzes.length);
        if (parts.length > 0) {
          pct = Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100);
        }
      }
      if (pct === 100) completedCount++;
      totalScore += pct;
    });

    const overallPct = Math.round(totalScore / totalChapters);
    return {
      totalChapters,
      completedChapters: completedCount,
      overallPct
    };
  }, [student, studentChapters, studentProgress, recordings, quizzes]);

  const handleSendDoubtTicket = () => {
    if (!doubtText.trim()) return;
    onSubmitDoubt(doubtText.trim());
    setDoubtText('');
  };

  // If not authenticated, show modern sign-in / sign-up card
  if (!student) {
    return (
      <div className="max-w-md mx-auto my-8 animate-fadeIn">
        <div className="bg-[#0c1427]/95 border-2 border-sky-400/60 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Tabs */}
          <div className="flex border-b border-slate-700/80 mb-6">
            <button
              onClick={() => setAuthMode('signin')}
              className={`w-1/2 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-colors ${
                authMode === 'signin' ? 'text-sky-400 border-sky-400' : 'text-slate-400 border-transparent'
              }`}
            >
              🔑 Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`w-1/2 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-colors ${
                authMode === 'signup' ? 'text-amber-400 border-amber-400' : 'text-slate-400 border-transparent'
              }`}
            >
              ✍️ New Student Sign Up
            </button>
          </div>

          {authMode === 'signin' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center space-y-1 mb-4">
                <h3 className="font-heading text-2xl font-black text-white">Student Portal Login</h3>
                <p className="text-xs text-slate-400">Access registered CBSE batches, live smartboard studio & test vault.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Mobile Number or Email</label>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. 9822011223 or aarav@gmail.com"
                  className="w-full bg-slate-950/90 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Target Grade / Class</label>
                <select
                  value={loginGrade}
                  onChange={(e) => setLoginGrade(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950/90 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sky-400"
                >
                  <option value={6}>Class 6</option>
                  <option value={7}>Class 7</option>
                  <option value={8}>Class 8</option>
                  <option value={9}>Class 9</option>
                  <option value={10}>Class 10</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Account Password (Default: 1234)</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950/90 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sky-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs py-3 rounded-xl shadow-lg shadow-sky-600/30 transition-transform hover:-translate-y-0.5 mt-2"
              >
                Enter Student Workspace →
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="text-center space-y-1 mb-4">
                <h3 className="font-heading text-2xl font-black text-amber-400">Student Registration</h3>
                <p className="text-xs text-slate-400">Create your verified SANJU MATH account with instant mobile verification.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Student Full Name *</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  required
                  className="w-full bg-slate-950/90 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    required
                    className="w-full bg-slate-950/90 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Target Grade *</label>
                  <select
                    value={regGrade}
                    onChange={(e) => setRegGrade(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950/90 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value={6}>Class 6</option>
                    <option value={7}>Class 7</option>
                    <option value={8}>Class 8</option>
                    <option value={9}>Class 9</option>
                    <option value={10}>Class 10</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="student@gmail.com"
                  className="w-full bg-slate-950/90 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Create Account Password *</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Choose password"
                  required
                  className="w-full bg-slate-950/90 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-3 py-1.5 rounded-lg shadow-sm"
                >
                  📲 Send Verification OTP
                </button>
              </div>

              {otpSent && (
                <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/40 space-y-1">
                  <label className="text-[11px] font-bold text-amber-300 block">Enter 6-digit OTP received:</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="• • • • • •"
                    className="w-full bg-slate-950 border border-slate-700 text-center font-mono text-base tracking-widest text-amber-400 py-1 rounded-lg"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Dispatched code: <strong className="text-amber-300 font-mono">{simulatedOtp}</strong>
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-amber-500/25 transition-transform hover:-translate-y-0.5 mt-2"
              >
                ✓ Verify & Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const isBatchApproved = student.enrolledGrades.includes(student.grade);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Student Profile Header Card */}
      <div className="bg-gradient-to-br from-[#0c1427]/95 via-[#131d38]/90 to-[#090e1f]/95 border-2 border-sky-400/30 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 border-2 border-sky-400 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-sky-500/30">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-2xl font-black text-white">{student.name}</h2>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    isBatchApproved
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {isBatchApproved ? `✓ Class ${student.grade} Unlocked` : 'Batch Locked (Pending Verification)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Roll: <strong className="text-amber-400">{student.roll}</strong> &bull; Email: {student.email} &bull; Target Batch: Class {student.grade}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isBatchApproved && (
              <button
                onClick={() => onPrintReceipt(student)}
                className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-sky-600/20"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Admission Receipt</span>
              </button>
            )}
            <button
              onClick={onRefreshStatus}
              className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
              title="Re-verify enrollment status with backend"
            >
              <RotateCw className="w-3.5 h-3.5 text-sky-400" />
              <span>Refresh Status</span>
            </button>
            {onReturnToHome && (
              <button
                onClick={onReturnToHome}
                className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold px-3 py-2 rounded-xl"
              >
                🏠 Academy Home
              </button>
            )}
            <button
              onClick={onLogout}
              className="bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Enrolled Courses Pill Strip */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400">Active Batches:</span>
            {student.enrolledGrades.length > 0 ? (
              student.enrolledGrades.map((g) => (
                <span
                  key={g}
                  className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Class {g} Comprehensive Batch</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-amber-300 bg-amber-950/50 border border-amber-500/40 px-3 py-1 rounded-lg">
                No active unlocked batches. Enroll below and await Owner fee confirmation.
              </span>
            )}
          </div>
        </div>

        {/* Sub Navigation Strip (Only when approved) */}
        {isBatchApproved && (
          <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-700/60">
            <button
              onClick={() => setActiveSubTab('live')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'live' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white/5 text-slate-300'
              }`}
            >
              🔴 1. Live Classroom
            </button>
            <button
              onClick={() => setActiveSubTab('recordings')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'recordings' ? 'bg-sky-400 text-slate-950 font-black' : 'bg-white/5 text-slate-300'
              }`}
            >
              📼 2. Recordings Vault
            </button>
            <button
              onClick={() => setActiveSubTab('quizzes')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'quizzes' ? 'bg-emerald-400 text-slate-950 font-black' : 'bg-white/5 text-slate-300'
              }`}
            >
              📝 3. Quizzes & Tests
            </button>
            <button
              onClick={() => setActiveSubTab('formula')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'formula' ? 'bg-purple-400 text-slate-950 font-black' : 'bg-white/5 text-slate-300'
              }`}
            >
              📖 4. NCERT Formula Vault
            </button>
            <button
              onClick={() => setActiveSubTab('reports')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'reports' ? 'bg-rose-400 text-slate-950 font-black' : 'bg-white/5 text-slate-300'
              }`}
            >
              📊 5. Academic Report
            </button>
          </div>
        )}
      </div>

      {/* 2. Locked Notice Card if NOT approved */}
      {!isBatchApproved && (
        <div className="bg-[#0c1427]/90 border-2 border-dashed border-amber-400/80 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-400/10 border-2 border-amber-400 flex items-center justify-center text-3xl">
            🔒
          </div>
          <h3 className="font-heading text-2xl font-black text-amber-300">
            Batch Access Locked: Awaiting Enrollment & Owner Verification
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            You are logged in for <strong className="text-white">Class {student.grade}</strong>. You can freely explore the CBSE Syllabus and course details. Full access to the live smartboard studio, recordings vault, and diagnostic tests unlocks <strong>only after completing course payment and receiving verified approval from Bhimsingh Thakur (Owner)</strong>.
          </p>
          <div className="flex justify-center gap-3 flex-wrap pt-2">
            <button
              onClick={onOpenCourses}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20"
            >
              💳 Browse & Buy Class {student.grade} Batch
            </button>
            <button
              onClick={onOpenCurriculum}
              className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold px-4 py-3 rounded-xl"
            >
              📚 Explore CBSE Syllabus
            </button>
            <button
              onClick={onRefreshStatus}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-black px-4 py-3 rounded-xl flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Check Owner Approval Status</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Approved Student Workspace */}
      {isBatchApproved && (
        <div className="space-y-6">
          {/* Study Streak Card */}
          <div className="bg-slate-900/80 border border-amber-500/25 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔥</span>
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-white text-sm font-heading font-black">5-Day CBSE Conceptual Study Streak</strong>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-black">
                    TOP 5% IN BATCH
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Keep solving daily exemplars to maintain your conceptual pace with Bhimsingh Sir.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-emerald-500" />
                <span>Live Lecture</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-emerald-500" />
                <span>5 NCERT Exemplars</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="accent-emerald-500" />
                <span>Topic Drill</span>
              </label>
            </div>
          </div>

          {/* Sub Tab 1: Live Classroom */}
          {activeSubTab === 'live' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#0c1427]/95 to-[#131b34]/90 border-2 border-sky-400/40 rounded-3xl p-6 lg:p-8 shadow-xl flex flex-wrap justify-between items-center gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${
                        isLiveBroadcasting ? 'bg-rose-500 animate-ping' : 'bg-amber-400'
                      }`}
                    />
                    <span
                      className={`text-xs font-black uppercase tracking-wider font-mono ${
                        isLiveBroadcasting ? 'text-rose-400 animate-pulse' : 'text-amber-400'
                      }`}
                    >
                      {isLiveBroadcasting
                        ? '🔴 BHIMSINGH SIR IS BROADCASTING LIVE ON SMARTBOARD!'
                        : 'FACULTY STANDBY • WAITING FOR BHIMSINGH SIR'}
                    </span>
                  </div>
                  <h3 className="font-heading text-2xl font-black text-white">
                    Class {student.grade} Pure Mathematics & Physics Live Batch
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl">
                    Interactive smartboard lectures, whiteboard derivations, and problem-solving sessions streamed directly from Sir's studio.
                  </p>
                </div>

                <button
                  onClick={onEnterLiveStudio}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-amber-500/25 flex items-center gap-2 transition-transform hover:-translate-y-0.5"
                >
                  <Radio className="w-4 h-4 text-slate-950" />
                  <span>Enter Virtual Classroom Studio →</span>
                </button>
              </div>

              {/* Schedule Quick View */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-1">UPCOMING TOPIC:</span>
                  <strong className="text-sky-300 text-sm font-black">
                    {scheduledClasses[0]?.topic || 'Quadratic Equations & Roots Derivation'}
                  </strong>
                </div>
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-1">BATCH TIMING:</span>
                  <strong className="text-amber-400 text-sm font-black">
                    {scheduledClasses[0]?.time || 'Mon–Fri at 6:00 PM IST'}
                  </strong>
                </div>
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-1">STUDIO CONNECTION:</span>
                  <strong className="text-emerald-400 text-sm font-black">✓ Audio & Whiteboard Ready</strong>
                </div>
              </div>

              {/* Ask Sir Doubt Submission Card */}
              <div className="bg-[#0c1427]/80 border border-sky-500/25 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-sky-400 font-heading">
                    💬 Have a Doubt in Today's Topic? Ask Bhimsingh Sir
                  </h4>
                  <span className="text-[10px] text-slate-400">Directly syncs to Faculty Desk</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={doubtText}
                    onChange={(e) => setDoubtText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendDoubtTicket()}
                    placeholder="Type theorem or step query (e.g. Sir, how to determine root sign when b < 0?)..."
                    className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sky-400"
                  />
                  <button
                    onClick={handleSendDoubtTicket}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Doubt</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab 2: Recordings Vault */}
          {activeSubTab === 'recordings' && (
            <div className="bg-[#0c1427]/90 border border-amber-500/20 rounded-3xl p-6 lg:p-8 space-y-4 shadow-xl">
              <div className="space-y-1 pb-3 border-b border-slate-700/60">
                <h3 className="font-heading text-xl font-black text-amber-400">
                  📼 Recorded Lecture Archives & Smartboard Notes
                </h3>
                <p className="text-xs text-slate-300">
                  Access step-by-step whiteboard derivations and replay problem sets anytime.
                </p>
              </div>

              <div className="space-y-3">
                {recordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-3 hover:border-amber-500/30 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2.5 py-0.5 rounded font-black">
                          {rec.subject} &bull; Class {rec.grade}
                        </span>
                        <span className="text-[10px] text-slate-400">{rec.duration}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{rec.title}</h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">Recorded: {rec.date}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewNotes(rec)}
                        className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>View Notes</span>
                      </button>
                      <button
                        onClick={() => onViewNotes(rec)}
                        className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Replay</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub Tab 3: Quizzes & Practice Tests */}
          {activeSubTab === 'quizzes' && (
            <div className="bg-[#0c1427]/90 border border-sky-500/20 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
              <div className="space-y-1 pb-3 border-b border-slate-700/60">
                <h3 className="font-heading text-xl font-black text-sky-400">
                  📝 Practice Quizzes & Diagnostic Topic Tests
                </h3>
                <p className="text-xs text-slate-300">
                  Published directly by Bhimsingh Sir for board exam conceptual sharpness.
                </p>
              </div>

              <div className="space-y-6">
                {quizzes.map((quiz) => {
                  const result = quizResults[quiz.id];
                  return (
                    <div
                      key={quiz.id}
                      className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-heading text-base font-black text-amber-400">{quiz.title}</h4>
                          <span className="text-[10px] text-slate-400">Class {quiz.grade} &bull; {quiz.subject}</span>
                        </div>
                        {result && (
                          <span className="text-xs font-black text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                            Score: {result.score} / {result.total} ({result.percentage}%)
                          </span>
                        )}
                      </div>

                      <div className="space-y-3">
                        {quiz.questions.map((q, qIdx) => {
                          const selectedOpt = quizAnswers[quiz.id]?.[qIdx];
                          const isEvaluated = !!result;
                          return (
                            <div
                              key={qIdx}
                              className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-xs"
                            >
                              <p className="font-bold text-white">
                                {qIdx + 1}. {q.q}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((opt, optIdx) => {
                                  const isSelected = selectedOpt === optIdx;
                                  return (
                                    <label
                                      key={optIdx}
                                      onClick={() => handleSelectQuizOption(quiz.id, qIdx, optIdx)}
                                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                        isSelected
                                          ? 'bg-amber-400/15 border-amber-400 text-amber-200'
                                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`q_${quiz.id}_${qIdx}`}
                                        checked={isSelected}
                                        onChange={() => {}}
                                        className="accent-amber-400"
                                      />
                                      <span>{opt}</span>
                                    </label>
                                  );
                                })}
                              </div>

                              {isEvaluated && (
                                <div
                                  className={`p-2 rounded-lg text-[11px] font-bold ${
                                    selectedOpt === q.correct
                                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                                      : 'bg-rose-950/70 text-rose-300 border border-rose-500/40'
                                  }`}
                                >
                                  {selectedOpt === q.correct
                                    ? `✓ Correct! ${q.explanation}`
                                    : `✗ Incorrect. Correct: ${q.options[q.correct]}. ${q.explanation}`}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          onClick={() => handleGradeQuiz(quiz)}
                          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-amber-400/20"
                        >
                          Submit Test & Evaluate
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub Tab 4: NCERT Formula Vault */}
          {activeSubTab === 'formula' && (
            <div className="bg-[#0c1427]/90 border border-purple-500/20 rounded-3xl p-6 lg:p-8 space-y-4 shadow-xl">
              <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-slate-700/60">
                <div>
                  <h3 className="font-heading text-xl font-black text-purple-400">
                    📖 NCERT Pure Math & Physics Pocket Formula Vault
                  </h3>
                  <p className="text-xs text-slate-300">
                    Quick formula lookups, theorem statements, and derivations at your fingertips.
                  </p>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={formulaSearch}
                    onChange={(e) => setFormulaSearch(e.target.value)}
                    placeholder="Search formula (e.g. Pythagoras, AP, Ohm)..."
                    className="bg-slate-950 border border-slate-700 text-white rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {ncertFormulas
                  .filter(
                    (f) =>
                      f.title.toLowerCase().includes(formulaSearch.toLowerCase()) ||
                      f.formula.toLowerCase().includes(formulaSearch.toLowerCase()) ||
                      f.subject.toLowerCase().includes(formulaSearch.toLowerCase())
                  )
                  .map((f, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-2 hover:border-purple-400/30 transition-colors"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] bg-slate-800 text-purple-300 px-2 py-0.5 rounded font-black">
                            {f.subject} &bull; Class {f.grade}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(f.formula);
                              onShowToast('Formula copied to clipboard!');
                            }}
                            className="text-slate-400 hover:text-white p-1"
                            title="Copy Formula"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <strong className="text-white text-sm font-bold">{f.title}</strong>
                        <p className="font-mono text-amber-300 font-black text-xs bg-slate-950 p-2.5 rounded-xl mt-2 border border-slate-800/80">
                          {f.formula}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-400">{f.note}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Sub Tab 5: Academic Report */}
          {activeSubTab === 'reports' && (
            <div className="bg-[#0c1427]/90 border border-rose-500/20 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
              <div className="space-y-1 pb-3 border-b border-slate-700/60">
                <h3 className="font-heading text-xl font-black text-rose-400">
                  📊 Student Diagnostic Academic Report
                </h3>
                <p className="text-xs text-slate-300">Continuous evaluation based on live attendance and test drills.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border-l-4 border-sky-400 border border-white/5 rounded-2xl p-4">
                  <span className="text-[11px] text-slate-400 font-bold block">LIVE ATTENDANCE</span>
                  <p className="font-heading text-2xl font-black text-white mt-1">94.2%</p>
                </div>
                <div className="bg-slate-900/80 border-l-4 border-amber-400 border border-white/5 rounded-2xl p-4">
                  <span className="text-[11px] text-slate-400 font-bold block">TESTS COMPLETED</span>
                  <p className="font-heading text-2xl font-black text-white mt-1">
                    {Object.keys(quizResults).length} Completed
                  </p>
                </div>
                <div className="bg-slate-900/80 border-l-4 border-emerald-400 border border-white/5 rounded-2xl p-4">
                  <span className="text-[11px] text-slate-400 font-bold block">ACCURACY RATE</span>
                  <p className="font-heading text-2xl font-black text-emerald-400 mt-1">
                    {Object.values(quizResults).length > 0
                      ? `${Math.round(
                          Object.values(quizResults).reduce((a, b) => a + b.percentage, 0) /
                            Object.values(quizResults).length
                        )}%`
                      : '92%'}
                  </p>
                </div>
                <div className="bg-slate-900/80 border-l-4 border-rose-400 border border-white/5 rounded-2xl p-4">
                  <span className="text-[11px] text-slate-400 font-bold block">BATCH RANK</span>
                  <p className="font-heading text-2xl font-black text-rose-400 mt-1">Top 5%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
