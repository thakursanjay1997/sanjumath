import React, { useState, useEffect, useCallback } from 'react';
import {
  PendingPayment,
  StudentRecord,
  Coupon,
  CoursePrices,
  PaymentSettings,
  Announcement,
  EmergencyAlert,
  LectureRecording,
  AuditLog,
  FacultyRecord
} from '../types';
import { api } from '../api';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Users,
  Tag,
  DollarSign,
  Radio,
  Video,
  CreditCard,
  FileText,
  Download,
  Upload,
  Search,
  Trash2,
  Printer,
  Sparkles,
  Zap,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Home,
  UserCheck,
  Key,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Ban,
  Check
} from 'lucide-react';

interface OwnerPortalProps {
  pendingPayments: PendingPayment[];
  coursePrices: CoursePrices;
  paymentSettings: PaymentSettings;
  announcement: Announcement;
  emergencyAlert: EmergencyAlert;
  recordings: LectureRecording[];
  auditLogs: AuditLog[];
  onApprovePayment: (paymentId: string) => void;
  onBatchApproveAll: () => void;
  onRejectPayment: (paymentId: string) => void;
  onGodModeEnroll: (data: { name: string; email?: string; phone?: string; grade: number; courseName: string; feeType: string }) => void;
  onRevokeStudent: (roll: string) => void;
  onSaveCoupon: (coupon: { code: string; type: 'percent' | 'flat'; value: number; desc: string }) => void;
  onDeleteCoupon: (id: string) => void;
  onSavePricing: (prices: CoursePrices) => void;
  onSavePaymentSettings: (settings: PaymentSettings) => void;
  onSaveAnnouncement: (ann: Announcement) => void;
  onSendEmergencyAlert: (title: string, message: string, isActive: boolean) => void;
  onSaveRecording: (rec: { title: string; subject: string; grade: number; duration: string }) => void;
  onDeleteRecording: (id: string) => void;
  onClearAuditLogs: () => void;
  onPrintReceipt: (student: StudentRecord) => void;
  onRestoreDatabase: (data: any) => void;
  onReturnToHome: () => void;
  onLogout: () => void;
  onShowToast: (msg: string) => void;
}

export const OwnerPortal: React.FC<OwnerPortalProps> = ({
  pendingPayments,
  coursePrices,
  paymentSettings,
  announcement,
  emergencyAlert,
  recordings,
  auditLogs,
  onApprovePayment,
  onBatchApproveAll,
  onRejectPayment,
  onGodModeEnroll,
  onRevokeStudent,
  onSaveCoupon,
  onDeleteCoupon,
  onSavePricing,
  onSavePaymentSettings,
  onSaveAnnouncement,
  onSendEmergencyAlert,
  onSaveRecording,
  onDeleteRecording,
  onClearAuditLogs,
  onPrintReceipt,
  onRestoreDatabase,
  onReturnToHome,
  onLogout,
  onShowToast
}) => {
  // Directorate Sub Tabs
  const [activeTab, setActiveTab] = useState<
    'approvals' | 'faculties' | 'roster' | 'coupons' | 'pricing' | 'broadcast' | 'content' | 'upi' | 'backup'
  >('approvals');

  // Faculty Directorate Authority State (Exclusive Director Superpower)
  const [facultiesList, setFacultiesList] = useState<FacultyRecord[]>([]);
  const [isFacultiesLoading, setIsFacultiesLoading] = useState(false);
  const [facultySearch, setFacultySearch] = useState('');
  const [facultyStatusFilter, setFacultyStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING_APPROVAL' | 'DISCONTINUED' | 'DENIED'>('ALL');
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState<{ facultyId: string; name: string; currentPass?: string } | null>(null);
  const [newFacultyPasswordVal, setNewFacultyPasswordVal] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // New Faculty Form State
  const [facId, setFacId] = useState('');
  const [facName, setFacName] = useState('');
  const [facPassword, setFacPassword] = useState('');
  const [facSubject, setFacSubject] = useState('Pure Mathematics');
  const [facGrades, setFacGrades] = useState<number[]>([6, 7, 8, 9, 10]);
  const [facPhone, setFacPhone] = useState('');
  const [facEmail, setFacEmail] = useState('');
  const [facNotes, setFacNotes] = useState('');
  const [showCreatedModal, setShowCreatedModal] = useState<{ facultyId: string; name: string; password: string; subject: string; grades: number[] } | null>(null);

  // Scalable Student Directory State (Capable of 1000+ Students)
  const [studentsList, setStudentsList] = useState<StudentRecord[]>([]);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterGradeFilter, setRosterGradeFilter] = useState('ALL');
  const [isRosterLoading, setIsRosterLoading] = useState(false);

  // God-Mode Form State
  const [showGodModeForm, setShowGodModeForm] = useState(false);
  const [godName, setGodName] = useState('');
  const [godEmail, setGodEmail] = useState('');
  const [godPhone, setGodPhone] = useState('');
  const [godGrade, setGodGrade] = useState<number>(10);
  const [godCourse, setGodCourse] = useState('Math + Physics Combo Super-Batch');
  const [godFeeType, setGodFeeType] = useState('PAID_CASH');

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [cpnCode, setCpnCode] = useState('');
  const [cpnType, setCpnType] = useState<'percent' | 'flat'>('percent');
  const [cpnValue, setCpnValue] = useState<number>(15);
  const [cpnDesc, setCpnDesc] = useState('');

  // Local Pricing state
  const [localPricing, setLocalPricing] = useState<CoursePrices>(coursePrices);

  // Local UPI state
  const [localPhone, setLocalPhone] = useState(paymentSettings.phone);
  const [localUpi, setLocalUpi] = useState(paymentSettings.upi);

  // Local Announcement state
  const [localTickerText, setLocalTickerText] = useState(announcement.text);
  const [localTickerEnabled, setLocalTickerEnabled] = useState(announcement.isEnabled);

  // Emergency Alert state
  const [emergencyTitle, setEmergencyTitle] = useState('DIRECTORATE URGENT NOTICE');
  const [emergencyMsg, setEmergencyMsg] = useState('Special Sunday Live Batch starts at 6:00 PM IST!');

  // New Recording Form
  const [showRecForm, setShowRecForm] = useState(false);
  const [recTitle, setRecTitle] = useState('');
  const [recSubject, setRecSubject] = useState('Mathematics');
  const [recGrade, setRecGrade] = useState<number>(10);
  const [recDuration, setRecDuration] = useState('50 mins');

  // Fetch paginated students list from backend
  const fetchStudents = useCallback(async () => {
    setIsRosterLoading(true);
    try {
      const res = await api.getStudents({
        page: currentPage,
        limit: pageSize,
        search: rosterSearch,
        grade: rosterGradeFilter
      });
      setStudentsList(res.students);
      setTotalStudentsCount(res.total);
      setTotalPages(res.totalPages);
    } catch {
      // fallback
    } finally {
      setIsRosterLoading(false);
    }
  }, [currentPage, pageSize, rosterSearch, rosterGradeFilter]);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await api.getCoupons();
      setCoupons(res.coupons);
    } catch {
      // fallback
    }
  }, []);

  const fetchFaculties = useCallback(async () => {
    setIsFacultiesLoading(true);
    try {
      const res = await api.getFaculties();
      setFacultiesList(res.faculties || []);
    } catch {
      // fallback
    } finally {
      setIsFacultiesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    fetchFaculties();
  }, [fetchFaculties]);

  // Faculty Authority Handlers
  const handleGenerateRandomFacultyId = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const subPrefix = facSubject.toLowerCase().includes('phys') ? 'PHY' : 'MATH';
    setFacId(`FAC-2026-${subPrefix}-${randomNum}`);
  };

  const handleGenerateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let p = 'Teach@';
    for (let i = 0; i < 4; i++) {
      p += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFacPassword(p);
  };

  const handleCreateFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facId.trim() || !facName.trim() || !facPassword.trim()) {
      onShowToast('Please fill in Faculty ID, Name, and Password.');
      return;
    }
    try {
      const res = await api.createFaculty({
        facultyId: facId.trim(),
        name: facName.trim(),
        password: facPassword.trim(),
        subject: facSubject.trim(),
        grades: facGrades,
        phone: facPhone.trim(),
        email: facEmail.trim(),
        notes: facNotes.trim(),
        adminPasscode: 'sanjaymath@1997'
      });
      setFacultiesList(res.faculties);
      setShowCreatedModal({
        facultyId: facId.trim().toUpperCase(),
        name: facName.trim(),
        password: facPassword.trim(),
        subject: facSubject.trim(),
        grades: facGrades
      });
      setShowAddFacultyModal(false);
      setFacId('');
      setFacName('');
      setFacPassword('');
      setFacPhone('');
      setFacEmail('');
      setFacNotes('');
      onShowToast(`✅ Issued Faculty ID ${res.faculty.facultyId} to ${res.faculty.name}!`);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to create faculty');
    }
  };

  const handleUpdateFacultyStatus = async (
    id: string,
    status: 'ACTIVE' | 'PENDING_APPROVAL' | 'DISCONTINUED' | 'DENIED'
  ) => {
    try {
      const res = await api.updateFacultyStatus(id, status, 'sanjaymath@1997');
      setFacultiesList(res.faculties);
      const actionLabels = {
        ACTIVE: 'Approved & Activated',
        PENDING_APPROVAL: 'Marked as Pending',
        DISCONTINUED: 'Discontinued / Access Revoked',
        DENIED: 'Appointment Denied'
      };
      onShowToast(`Faculty status: ${actionLabels[status]}.`);
    } catch (err: any) {
      onShowToast(err.message || 'Status update failed');
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPasswordChangeModal || !newFacultyPasswordVal.trim()) return;
    try {
      const res = await api.updateFacultyCredentials(showPasswordChangeModal.facultyId, {
        password: newFacultyPasswordVal.trim(),
        adminPasscode: 'sanjaymath@1997'
      });
      setFacultiesList(res.faculties);
      onShowToast(`Password updated for ${showPasswordChangeModal.name}!`);
      setShowPasswordChangeModal(null);
      setNewFacultyPasswordVal('');
    } catch (err: any) {
      onShowToast(err.message || 'Password update failed');
    }
  };

  const handleDeleteFaculty = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to completely remove Faculty account "${name}"?`)) return;
    try {
      const res = await api.deleteFaculty(id, 'sanjaymath@1997');
      setFacultiesList(res.faculties);
      onShowToast(`Faculty record for ${name} removed.`);
    } catch (err: any) {
      onShowToast(err.message || 'Delete failed');
    }
  };

  const handleCopyCredentials = (fac: FacultyRecord) => {
    const text = `∑ SANJU MATH ACADEMY - OFFICIAL FACULTY CREDENTIALS\nDirector: Bhimsingh Thakur (M.Sc.)\n------------------------------------------------\nFaculty Name: ${fac.name}\nFaculty ID: ${fac.facultyId}\nPassword: ${fac.password || '(Contact Director)'}\nSubject: ${fac.subject}\nAssigned Classes: CBSE Class ${fac.grades.join(', ')}\nPortal Status: ${fac.status}\nLogin Portal: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    onShowToast(`📋 Credentials for ${fac.name} copied to clipboard! Share via WhatsApp/Email.`);
  };

  // Handle God-Mode Enroll
  const handleExecuteGodMode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!godName.trim()) {
      onShowToast('Please enter student name.');
      return;
    }
    await onGodModeEnroll({
      name: godName.trim(),
      email: godEmail.trim(),
      phone: godPhone.trim(),
      grade: godGrade,
      courseName: godCourse,
      feeType: godFeeType
    });
    setGodName('');
    setGodEmail('');
    setGodPhone('');
    setShowGodModeForm(false);
    fetchStudents();
  };

  // 1000-Student Scale Simulation Test
  const handleGenerateScaleStudents = async () => {
    try {
      const res = await api.generateScaleStudents(1000, 'sanjaymath@1997');
      onShowToast(`⚡ Scale Test: ${res.added} verified students populated into database! Total: ${res.totalStudents}`);
      fetchStudents();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to simulate students');
    }
  };

  const handleWipeSimulatedStudents = async () => {
    try {
      const res = await api.wipeSimulatedStudents('sanjaymath@1997');
      onShowToast(`🗑️ Cleaned ${res.removed} test records. Real students remaining: ${res.remaining}`);
      fetchStudents();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to wipe simulated batch');
    }
  };

  const handleExportCsv = () => {
    let csv = 'Roll,Student Name,Grade,Course,Fee Paid,Reference,Joined Date\n';
    studentsList.forEach((s) => {
      csv += `"${s.roll}","${s.name}","Class ${s.grade}","${s.courseName}","${s.feePaid}","${s.utr}","${s.joinedDate}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sanju_Math_Students_Roster_${Date.now()}.csv`;
    a.click();
    onShowToast('Student roster CSV exported!');
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpnCode.trim()) return;
    onSaveCoupon({
      code: cpnCode.trim().toUpperCase(),
      type: cpnType,
      value: cpnValue,
      desc: cpnDesc.trim() || 'Promotional Discount'
    });
    setCpnCode('');
    setShowCouponForm(false);
    fetchCoupons();
  };

  const handleSavePricingChanges = () => {
    onSavePricing(localPricing);
    onShowToast('✅ Course pricing structure updated and deployed academy-wide!');
  };

  const applyBulkDiscount = (percent: number) => {
    const updated: CoursePrices = { ...localPricing };
    for (let g = 6; g <= 10; g++) {
      const current = updated[g] || { math: 4000, physics: 4000, combo: 7500 };
      const discountedCombo = Math.round((current.math + current.physics) * (1 - percent / 100));
      updated[g] = { ...current, combo: discountedCombo };
    }
    setLocalPricing(updated);
    onShowToast(`⚡ Applied ${percent}% savings on all combo batches! Click Save to deploy.`);
  };

  const handleSaveUpi = () => {
    onSavePaymentSettings({
      ...paymentSettings,
      phone: localPhone.trim(),
      upi: localUpi.trim()
    });
    onShowToast('✅ Official Gateway UPI & PhonePe credentials updated!');
  };

  const handleSaveAnnouncement = () => {
    onSaveAnnouncement({
      text: localTickerText.trim(),
      isEnabled: localTickerEnabled
    });
    onShowToast('✅ Website announcement banner deployed!');
  };

  const handleTriggerEmergency = () => {
    if (!emergencyMsg.trim()) return;
    onSendEmergencyAlert(emergencyTitle.trim(), emergencyMsg.trim(), true);
  };

  const handleSaveRecordingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recTitle.trim()) return;
    onSaveRecording({
      title: recTitle.trim(),
      subject: recSubject,
      grade: recGrade,
      duration: recDuration.trim()
    });
    setRecTitle('');
    setShowRecForm(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        onRestoreDatabase(data);
        fetchStudents();
      } catch {
        onShowToast('❌ Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Executive Top Banner */}
      <div className="bg-gradient-to-br from-[#0c1427]/95 via-[#1a1740]/90 to-[#090e1f]/95 border-2 border-amber-400 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur-xl flex flex-wrap justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-950 to-amber-900 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/20">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded font-black border border-rose-500/40">
                DIRECTORATE COMMAND CENTER
              </span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded font-mono font-bold">
                Director & Founder Session (Verified)
              </span>
            </div>
            <h2 className="font-heading text-2xl font-black text-white mt-1">
              Founder Bhimsingh Thakur (M.Sc. Mathematics)
            </h2>
            <p className="text-xs text-slate-300">
              Supreme Directorate Controls &bull; Scalable for 1,000+ CBSE Students
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onReturnToHome}
            className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Academy Home</span>
          </button>
          <button
            onClick={onLogout}
            className="bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out Directorate</span>
          </button>
        </div>
      </div>

      {/* 2. Directorate Sub-Tabs Bar */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-700/80">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'approvals' ? 'bg-amber-400 text-slate-950 font-black shadow-md' : 'bg-white/5 text-slate-300'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>⚡ Fee Approvals</span>
          {pendingPayments.length > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingPayments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab('faculties'); fetchFaculties(); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'faculties' ? 'bg-emerald-400 text-slate-950 font-black shadow-md' : 'bg-white/5 text-slate-300'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>👨‍🏫 Faculty Authority & IDs ({facultiesList.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('roster'); fetchStudents(); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'roster' ? 'bg-sky-400 text-slate-950 font-black shadow-md' : 'bg-white/5 text-slate-300'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>👨‍🎓 Student Directory ({totalStudentsCount})</span>
        </button>

        <button
          onClick={() => { setActiveTab('coupons'); fetchCoupons(); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'coupons' ? 'bg-amber-400 text-slate-950 font-black shadow-md' : 'bg-white/5 text-slate-300'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>🎟️ Promo Coupons</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'pricing' ? 'bg-sky-400 text-slate-950 font-black shadow-md' : 'bg-white/5 text-slate-300'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>💰 Course Pricing Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'broadcast' ? 'bg-rose-500 text-white font-black shadow-md' : 'bg-white/5 text-slate-300'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>📢 Emergency Broadcast</span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'content' ? 'bg-purple-400 text-slate-950 font-black shadow-md' : 'bg-white/5 text-slate-300'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>📼 Vault Manager</span>
        </button>

        <button
          onClick={() => setActiveTab('upi')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'upi' ? 'bg-emerald-400 text-slate-950 font-black shadow-md' : 'bg-white/5 text-slate-300'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>📱 Official UPI Gateway</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'backup' ? 'bg-slate-200 text-slate-950 font-black shadow-md' : 'bg-white/5 text-slate-300'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>📊 Analytics & Backup</span>
        </button>
      </div>

      {/* 3. TAB 1: REAL-TIME FEE APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="bg-[#0c1427]/90 border border-amber-500/30 rounded-3xl p-6 lg:p-8 shadow-xl space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4 pb-3 border-b border-slate-700/60">
            <div>
              <h4 className="font-heading text-lg font-black text-amber-400">
                Incoming Student Fee Verifications
              </h4>
              <p className="text-xs text-slate-400">
                Real-time queue of students who paid via PhonePe/GPay. Click "Approve" to unlock their batch instantly.
              </p>
            </div>
            {pendingPayments.length > 0 && (
              <button
                onClick={onBatchApproveAll}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>✓ Batch Approve All ({pendingPayments.length})</span>
              </button>
            )}
          </div>

          {pendingPayments.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-white text-sm">No pending fee approvals at this moment.</p>
              <p className="text-xs text-slate-400">
                When a student completes payment on the checkout modal, it appears here in real time!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((p) => (
                <div
                  key={p.id}
                  className="p-4 bg-slate-900/90 rounded-2xl border border-amber-500/30 flex flex-wrap justify-between items-center gap-4 hover:border-amber-400/60 transition-colors shadow-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-white text-sm font-bold">{p.studentName}</strong>
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded font-black border border-amber-400/30">
                        Class {p.grade}
                      </span>
                      {p.couponCode && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-black">
                          Coupon: {p.couponCode}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">
                      {p.courseName} &bull; Fee:{' '}
                      <strong className="text-amber-400 font-mono text-sm font-black">
                        ₹{p.fee.toLocaleString()}
                      </strong>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      UTR: <strong className="text-sky-300">{p.utr}</strong> &bull; Email: {p.studentEmail} &bull; Phone: {p.studentPhone} &bull; Submitted: {p.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApprovePayment(p.id)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>✓ Approve Access</span>
                    </button>
                    <button
                      onClick={() => onRejectPayment(p.id)}
                      className="bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3B. TAB: DIRECTORATE FACULTY AUTHORITY & PASSWORDS */}
      {activeTab === 'faculties' && (
        <div className="bg-[#0c1427]/90 border border-emerald-500/30 rounded-3xl p-6 lg:p-8 shadow-xl space-y-6">
          
          {/* Header & Quick Action */}
          <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-slate-700/60">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-heading text-xl font-black text-emerald-400">
                  Directorate Faculty Authority & ID/Password Desk
                </h4>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-black">
                  Director Superpower
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                As Director, you have exclusive authority to create faculty accounts, generate their unique Faculty IDs and passwords, assign CBSE subjects and grades, approve appointments, and instantly discontinue or deny access.
              </p>
            </div>

            <button
              onClick={() => {
                setShowAddFacultyModal(true);
                handleGenerateRandomFacultyId();
                handleGenerateStrongPassword();
              }}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Issue New Faculty ID & Password</span>
            </button>
          </div>

          {/* Directorate KPI Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <span className="text-slate-400 block text-[11px] font-bold">Total Appointed Faculty</span>
              <span className="font-heading text-2xl font-black text-white font-mono mt-1 block">
                {facultiesList.length}
              </span>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4">
              <span className="text-emerald-300 block text-[11px] font-bold">Active & Teaching</span>
              <span className="font-heading text-2xl font-black text-emerald-400 font-mono mt-1 block">
                {facultiesList.filter((f) => f.status === 'ACTIVE').length}
              </span>
            </div>

            <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4">
              <span className="text-amber-300 block text-[11px] font-bold">Pending Approval</span>
              <span className="font-heading text-2xl font-black text-amber-400 font-mono mt-1 block">
                {facultiesList.filter((f) => f.status === 'PENDING_APPROVAL').length}
              </span>
            </div>

            <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-4">
              <span className="text-rose-300 block text-[11px] font-bold">Discontinued / Denied</span>
              <span className="font-heading text-2xl font-black text-rose-400 font-mono mt-1 block">
                {facultiesList.filter((f) => f.status === 'DISCONTINUED' || f.status === 'DENIED').length}
              </span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/70 border border-slate-800 rounded-2xl">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
                placeholder="Search faculty by name, Faculty ID, or subject..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 text-[11px] font-bold">Status:</span>
              {(['ALL', 'ACTIVE', 'PENDING_APPROVAL', 'DISCONTINUED', 'DENIED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFacultyStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors ${
                    facultyStatusFilter === st
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  {st === 'ALL'
                    ? 'All'
                    : st === 'ACTIVE'
                    ? 'Active'
                    : st === 'PENDING_APPROVAL'
                    ? 'Pending'
                    : st === 'DISCONTINUED'
                    ? 'Discontinued'
                    : 'Denied'}
                </button>
              ))}
            </div>
          </div>

          {/* Faculty Members Roster List */}
          {isFacultiesLoading ? (
            <div className="text-center py-12 text-slate-400">Loading Directorate faculty records...</div>
          ) : facultiesList.filter((f) => {
              const matchesSearch =
                !facultySearch.trim() ||
                f.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
                f.facultyId.toLowerCase().includes(facultySearch.toLowerCase()) ||
                f.subject.toLowerCase().includes(facultySearch.toLowerCase());
              const matchesStatus = facultyStatusFilter === 'ALL' || f.status === facultyStatusFilter;
              return matchesSearch && matchesStatus;
            }).length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
              <UserCheck className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="font-bold text-white text-sm">No faculty members found matching your filter.</p>
              <p className="text-xs text-slate-400">
                Click "Issue New Faculty ID & Password" above to create credentials for a teacher.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facultiesList
                .filter((f) => {
                  const matchesSearch =
                    !facultySearch.trim() ||
                    f.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
                    f.facultyId.toLowerCase().includes(facultySearch.toLowerCase()) ||
                    f.subject.toLowerCase().includes(facultySearch.toLowerCase());
                  const matchesStatus = facultyStatusFilter === 'ALL' || f.status === facultyStatusFilter;
                  return matchesSearch && matchesStatus;
                })
                .map((f) => {
                  const isPassRevealed = !!revealedPasswords[f.id];
                  return (
                    <div
                      key={f.id}
                      className={`p-5 rounded-2xl border transition-all space-y-4 shadow-xl ${
                        f.status === 'ACTIVE'
                          ? 'bg-gradient-to-br from-slate-900/95 via-[#0a1826]/90 to-slate-900/95 border-emerald-500/40 hover:border-emerald-400'
                          : f.status === 'DISCONTINUED'
                          ? 'bg-gradient-to-br from-slate-900/95 via-rose-950/20 to-slate-900/95 border-rose-500/40 hover:border-rose-400'
                          : f.status === 'DENIED'
                          ? 'bg-slate-900/90 border-slate-700 opacity-75'
                          : 'bg-gradient-to-br from-slate-900/95 via-amber-950/20 to-slate-900/95 border-amber-500/40 hover:border-amber-400'
                      }`}
                    >
                      {/* Top Row: Name, Status Badge & ID */}
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-heading font-black text-white text-base">{f.name}</h5>
                            <span
                              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                                f.status === 'ACTIVE'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : f.status === 'DISCONTINUED'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : f.status === 'DENIED'
                                  ? 'bg-slate-700/60 text-slate-300 border-slate-600'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              }`}
                            >
                              {f.status === 'ACTIVE'
                                ? '✓ ACTIVE (Access Granted)'
                                : f.status === 'DISCONTINUED'
                                ? '⛔ DISCONTINUED (Access Revoked)'
                                : f.status === 'DENIED'
                                ? '✕ APPOINTMENT DENIED'
                                : '⏳ PENDING APPROVAL'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">
                            Subject: <strong className="text-white">{f.subject}</strong> &bull; Classes:{' '}
                            <strong className="text-amber-300 font-mono">
                              {f.grades && f.grades.length > 0 ? f.grades.map((g) => `Class ${g}`).join(', ') : 'All Batches'}
                            </strong>
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Faculty ID</span>
                          <span className="font-mono text-xs font-black text-amber-400 bg-slate-950 border border-slate-700 px-2 py-0.5 rounded-lg inline-block">
                            {f.facultyId}
                          </span>
                        </div>
                      </div>

                      {/* Password & Security Credentials Bar */}
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="text-slate-400 text-[11px]">Faculty Password:</span>
                          <span className="font-mono text-white font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                            {isPassRevealed ? f.password || '(Not Set)' : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setRevealedPasswords((prev) => ({
                                ...prev,
                                [f.id]: !prev[f.id]
                              }))
                            }
                            className="text-slate-400 hover:text-white p-1"
                            title={isPassRevealed ? 'Hide password' : 'View password'}
                          >
                            {isPassRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setShowPasswordChangeModal({
                                facultyId: f.id,
                                name: f.name,
                                currentPass: f.password
                              });
                              setNewFacultyPasswordVal('');
                            }}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 font-bold"
                          >
                            🔑 Change Password
                          </button>

                          <button
                            onClick={() => handleCopyCredentials(f)}
                            className="text-xs bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                            title="Copy credentials to share with faculty on WhatsApp or Email"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy for Faculty</span>
                          </button>
                        </div>
                      </div>

                      {/* Contact Info & Metadata */}
                      {(f.phone || f.email || f.notes) && (
                        <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 space-y-0.5">
                          {f.email && (
                            <div>
                              Email: <span className="text-slate-300 font-mono">{f.email}</span>
                            </div>
                          )}
                          {f.phone && (
                            <div>
                              Phone: <span className="text-slate-300 font-mono">{f.phone}</span>
                            </div>
                          )}
                          {f.notes && (
                            <div>
                              Director Note: <span className="text-amber-200/90 italic">{f.notes}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Directorate Authority Actions: Approve, Discontinue, Deny, Delete */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                        <div className="flex items-center gap-2 flex-wrap">
                          {f.status !== 'ACTIVE' && (
                            <button
                              onClick={() => handleUpdateFacultyStatus(f.id, 'ACTIVE')}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl shadow flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>✓ Approve & Activate</span>
                            </button>
                          )}

                          {f.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleUpdateFacultyStatus(f.id, 'DISCONTINUED')}
                              className="bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 text-xs font-black px-3 py-1.5 rounded-xl shadow flex items-center gap-1"
                              title="Instantly blocks login to faculty portal and live broadcasting"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>⛔ Discontinue / Suspend</span>
                            </button>
                          )}

                          {f.status !== 'DENIED' && f.status !== 'DISCONTINUED' && (
                            <button
                              onClick={() => handleUpdateFacultyStatus(f.id, 'DENIED')}
                              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl"
                            >
                              Deny Access
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteFaculty(f.id, f.name)}
                          className="text-slate-400 hover:text-rose-400 text-xs p-1.5 rounded-lg transition-colors flex items-center gap-1 ml-auto"
                          title="Delete Faculty Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Modal A: Issue New Faculty ID & Password */}
          {showAddFacultyModal && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
              <div className="bg-gradient-to-br from-[#0c1427] via-[#121c38] to-[#0a1020] border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👨‍🏫</span>
                    <h4 className="font-heading font-black text-white text-base">
                      Issue Faculty Account & Set Credentials
                    </h4>
                  </div>
                  <button onClick={() => setShowAddFacultyModal(false)} className="text-slate-400 hover:text-white p-1">
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  As Director, create the faculty's login ID and password. Once created, you can copy the credentials and send them directly to the educator.
                </p>

                <form onSubmit={handleCreateFacultySubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Faculty Full Name *</label>
                    <input
                      type="text"
                      value={facName}
                      onChange={(e) => setFacName(e.target.value)}
                      placeholder="e.g. Dr. Rajesh Kulkarni (M.Sc. Physics)"
                      required
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-300 font-bold">Faculty ID (Login Username) *</label>
                      <button
                        type="button"
                        onClick={handleGenerateRandomFacultyId}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                      >
                        ⚡ Auto-Generate ID
                      </button>
                    </div>
                    <input
                      type="text"
                      value={facId}
                      onChange={(e) => setFacId(e.target.value.toUpperCase())}
                      placeholder="e.g. FAC-2026-MATH-01"
                      required
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400 font-mono tracking-wider font-bold"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-300 font-bold">Faculty Password *</label>
                      <button
                        type="button"
                        onClick={handleGenerateStrongPassword}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                      >
                        🔑 Auto-Generate Strong Password
                      </button>
                    </div>
                    <input
                      type="text"
                      value={facPassword}
                      onChange={(e) => setFacPassword(e.target.value)}
                      placeholder="Enter strong password (or auto-generate)"
                      required
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400 font-mono tracking-wider font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Primary Subject *</label>
                      <select
                        value={facSubject}
                        onChange={(e) => setFacSubject(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
                      >
                        <option value="Pure Mathematics">Pure Mathematics</option>
                        <option value="Applied Physics">Applied Physics</option>
                        <option value="Math & Physics Combined">Math & Physics Combined</option>
                        <option value="General Science & Math">General Science & Math</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Assigned CBSE Grades *</label>
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {[6, 7, 8, 9, 10].map((g) => (
                          <label key={g} className="flex items-center gap-1 text-[11px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={facGrades.includes(g)}
                              onChange={(e) => {
                                if (e.target.checked) setFacGrades([...facGrades, g].sort());
                                else setFacGrades(facGrades.filter((item) => item !== g));
                              }}
                              className="accent-emerald-500 rounded"
                            />
                            <span>Cl {g}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Contact Phone (Optional)</label>
                      <input
                        type="tel"
                        value={facPhone}
                        onChange={(e) => setFacPhone(e.target.value)}
                        placeholder="e.g. 9822000000"
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Contact Email (Optional)</label>
                      <input
                        type="email"
                        value={facEmail}
                        onChange={(e) => setFacEmail(e.target.value)}
                        placeholder="teacher@sanjumath.com"
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Director Notes / Allocation</label>
                    <input
                      type="text"
                      value={facNotes}
                      onChange={(e) => setFacNotes(e.target.value)}
                      placeholder="e.g. Class 10 CBSE Board Preparation Specialist"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddFacultyModal(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black px-6 py-2.5 rounded-xl shadow-lg"
                    >
                      ✓ Save & Issue Faculty Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal B: Created Credentials Showcase (For immediate copy & paste) */}
          {showCreatedModal && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
              <div className="bg-gradient-to-br from-[#0a1826] via-[#10243e] to-[#071322] border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl">
                  🎉
                </div>

                <div>
                  <h4 className="font-heading font-black text-white text-lg">Faculty Account Successfully Created!</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Copy these credentials and send them to the faculty member via WhatsApp, SMS, or Email:
                  </p>
                </div>

                <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-4 text-left font-mono text-xs space-y-2 select-all">
                  <div className="text-amber-400 font-bold border-b border-slate-800 pb-1">
                    ∑ SANJU MATH ACADEMY &bull; FACULTY CREDENTIALS
                  </div>
                  <div>
                    Faculty Name: <strong className="text-white">{showCreatedModal.name}</strong>
                  </div>
                  <div>
                    Faculty ID: <strong className="text-emerald-400">{showCreatedModal.facultyId}</strong>
                  </div>
                  <div>
                    Password: <strong className="text-amber-300">{showCreatedModal.password}</strong>
                  </div>
                  <div>
                    Subject: <span className="text-slate-300">{showCreatedModal.subject}</span>
                  </div>
                  <div>
                    Classes: <span className="text-sky-300">CBSE Class {showCreatedModal.grades.join(', ')}</span>
                  </div>
                  <div>
                    Status: <span className="text-emerald-400 font-bold">ACTIVE & APPROVED</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      const text = `∑ SANJU MATH ACADEMY - FACULTY CREDENTIALS\nDirector: Bhimsingh Thakur (M.Sc.)\n---------------------------------\nFaculty Name: ${showCreatedModal.name}\nFaculty ID: ${showCreatedModal.facultyId}\nPassword: ${showCreatedModal.password}\nSubject: ${showCreatedModal.subject}\nClasses: CBSE Class ${showCreatedModal.grades.join(', ')}\nLogin Portal: ${window.location.origin}`;
                      navigator.clipboard.writeText(text);
                      onShowToast('📋 Faculty credentials copied to clipboard!');
                    }}
                    className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Credentials</span>
                  </button>

                  <button
                    onClick={() => setShowCreatedModal(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-5 py-3 rounded-xl"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal C: Change / Reset Password */}
          {showPasswordChangeModal && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
              <div className="bg-[#0c1427] border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                  <h4 className="font-heading font-black text-white text-base">Reset Faculty Password</h4>
                  <button onClick={() => setShowPasswordChangeModal(null)} className="text-slate-400 hover:text-white p-1">
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-300">
                  Resetting password for: <strong className="text-white">{showPasswordChangeModal.name}</strong>
                </p>

                <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-300 font-bold">New Password *</label>
                      <button
                        type="button"
                        onClick={() => {
                          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                          let p = 'Teach@';
                          for (let i = 0; i < 4; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
                          setNewFacultyPasswordVal(p);
                        }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-bold"
                      >
                        ⚡ Generate Strong
                      </button>
                    </div>
                    <input
                      type="text"
                      value={newFacultyPasswordVal}
                      onChange={(e) => setNewFacultyPasswordVal(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400 font-mono tracking-wider font-bold"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPasswordChangeModal(null)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 4. TAB 2: SCALABLE STUDENT DIRECTORY (1000+ Students) */}
      {activeTab === 'roster' && (
        <div className="bg-[#0c1427]/90 border border-sky-500/30 rounded-3xl p-6 lg:p-8 shadow-xl space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4 pb-3 border-b border-slate-700/60">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-heading text-lg font-black text-sky-400">
                  Master Student Enrollment Directory
                </h4>
                <span className="text-[10px] bg-sky-400/20 text-sky-300 px-2 py-0.5 rounded font-mono font-bold">
                  Scale: 1000+ Capable
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Total Enrolled Database Records: <strong className="text-white font-mono">{totalStudentsCount} Students</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowGodModeForm(!showGodModeForm)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ God-Mode Direct Admission</span>
              </button>

              <button
                onClick={handleGenerateScaleStudents}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5"
                title="Stress-test capability for 1,000 students"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate 1,000 Students</span>
              </button>

              {totalStudentsCount > 50 && (
                <button
                  onClick={handleWipeSimulatedStudents}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-2 rounded-xl"
                  title="Remove simulated records"
                >
                  Wipe Simulation
                </button>
              )}

              <button
                onClick={handleExportCsv}
                className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* God-Mode Direct Enroller Form */}
          {showGodModeForm && (
            <form
              onSubmit={handleExecuteGodMode}
              className="p-5 bg-slate-950 rounded-2xl border-2 border-amber-400/60 space-y-3 shadow-xl animate-fadeIn"
            >
              <div className="flex justify-between items-center">
                <span className="font-heading font-black text-amber-300 text-sm">
                  ⚡ God-Mode: Instant Direct Admission (Offline Cash / 100% Scholarship)
                </span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-black">
                  DIRECTOR OVERRIDE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    value={godName}
                    onChange={(e) => setGodName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Target Grade *</label>
                  <select
                    value={godGrade}
                    onChange={(e) => setGodGrade(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value={6}>Class 6</option>
                    <option value={7}>Class 7</option>
                    <option value={8}>Class 8</option>
                    <option value={9}>Class 9</option>
                    <option value={10}>Class 10</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Package</label>
                  <select
                    value={godCourse}
                    onChange={(e) => setGodCourse(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="Math + Physics Combo Super-Batch">Math + Physics Combo</option>
                    <option value="Pure Mathematics (Only)">Pure Mathematics (Only)</option>
                    <option value="Applied Physics (Only)">Applied Physics (Only)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Fee Classification</label>
                  <select
                    value={godFeeType}
                    onChange={(e) => setGodFeeType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="PAID_CASH">Paid via Cash (Direct)</option>
                    <option value="SCHOLARSHIP_100">100% Merit Scholarship</option>
                    <option value="DIRECTOR_WAIVER">Director Waiver</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowGodModeForm(false)}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs px-3 py-1.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-1.5 rounded-xl shadow-md"
                >
                  ✓ Instantly Enroll Student
                </button>
              </div>
            </form>
          )}

          {/* Search, Filter & Page Size */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="relative sm:col-span-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={rosterSearch}
                onChange={(e) => { setRosterSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search by student name, roll, mobile, email, or UTR..."
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <select
                value={rosterGradeFilter}
                onChange={(e) => { setRosterGradeFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-400"
              >
                <option value="ALL">All Grades (6-10)</option>
                <option value="6">Class 6 Only</option>
                <option value="7">Class 7 Only</option>
                <option value="8">Class 8 Only</option>
                <option value="9">Class 9 Only</option>
                <option value="10">Class 10 Only</option>
              </select>
            </div>
            <div>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setCurrentPage(1); }}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-400"
              >
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>

          {/* Directory Table */}
          <div className="overflow-x-auto max-h-96 rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Course Package</th>
                  <th className="p-3">Fee Verified</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Reference / UTR</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isRosterLoading ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400">Loading student directory...</td>
                  </tr>
                ) : studentsList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No student records found matching query. Use "God-Mode Direct Admission" or student registration!
                    </td>
                  </tr>
                ) : (
                  studentsList.map((s) => (
                    <tr key={s.roll} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-400">{s.roll}</td>
                      <td className="p-3 font-bold text-white">{s.name}</td>
                      <td className="p-3 text-sky-400 font-bold">Class {s.grade}</td>
                      <td className="p-3 text-slate-300 text-[11px]">{s.courseName}</td>
                      <td className="p-3 text-emerald-400 font-bold">₹{s.feePaid.toLocaleString()}</td>
                      <td className="p-3 text-slate-400 text-[11px] font-mono">{s.phone}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-400">{s.utr}</td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => onPrintReceipt(s)}
                          className="text-sky-400 hover:text-sky-300 bg-sky-950/40 border border-sky-800/40 text-[11px] px-2 py-0.5 rounded font-bold"
                        >
                          Receipt
                        </button>
                        <button
                          onClick={async () => {
                            await onRevokeStudent(s.roll);
                            fetchStudents();
                          }}
                          className="text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/40 text-[11px] px-2 py-0.5 rounded font-bold"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
              <span>
                Page {currentPage} of {totalPages} ({totalStudentsCount} total records)
              </span>
              <div className="flex gap-1.5">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 3: PROMO COUPONS */}
      {activeTab === 'coupons' && (
        <div className="bg-[#0c1427]/90 border border-amber-500/30 rounded-3xl p-6 lg:p-8 shadow-xl space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4 pb-3 border-b border-slate-700/60">
            <div>
              <h4 className="font-heading text-lg font-black text-amber-400">
                🎟️ Promo Coupons & Fee Discounts Engine
              </h4>
              <p className="text-xs text-slate-400">
                Create promotional discount codes for merit scholars and test applicants.
              </p>
            </div>
            <button
              onClick={() => setShowCouponForm(!showCouponForm)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-md"
            >
              + Create New Coupon
            </button>
          </div>

          {showCouponForm && (
            <form onSubmit={handleCreateCoupon} className="p-4 bg-slate-950 rounded-2xl border border-amber-400/40 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    value={cpnCode}
                    onChange={(e) => setCpnCode(e.target.value)}
                    placeholder="e.g. SANJU25"
                    required
                    className="w-full bg-slate-900 border border-slate-700 text-white uppercase font-mono tracking-wider rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Discount Type</label>
                  <select
                    value={cpnType}
                    onChange={(e) => setCpnType(e.target.value as 'percent' | 'flat')}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="percent">Percentage Discount (%)</option>
                    <option value="flat">Flat Amount Off (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={cpnValue}
                    onChange={(e) => setCpnValue(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-bold rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Description</label>
                  <input
                    type="text"
                    value={cpnDesc}
                    onChange={(e) => setCpnDesc(e.target.value)}
                    placeholder="e.g. Merit Topper Discount"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCouponForm(false)}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs px-3 py-1.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-1.5 rounded-xl shadow-md"
                >
                  ✓ Save & Activate Coupon
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto max-h-72 rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-200">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Discount Offer</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Redemptions</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/60">
                    <td className="p-3 font-mono font-bold text-amber-400">{c.code}</td>
                    <td className="p-3 font-bold text-emerald-400">
                      {c.type === 'percent' ? `${c.value}% OFF` : `₹${c.value.toLocaleString()} OFF`}
                    </td>
                    <td className="p-3 text-slate-300 text-[11px]">{c.desc}</td>
                    <td className="p-3">
                      <span className="text-[10px] px-2 py-0.5 rounded font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ACTIVE
                      </span>
                    </td>
                    <td className="p-3 font-mono text-sky-400">{c.usageCount || 0} used</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={async () => {
                          await onDeleteCoupon(c.id);
                          fetchCoupons();
                        }}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB 4: PRICING MATRIX */}
      {activeTab === 'pricing' && (
        <div className="bg-[#0c1427]/90 border border-sky-500/30 rounded-3xl p-6 lg:p-8 shadow-xl space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4 pb-3 border-b border-slate-700/60">
            <div>
              <h4 className="font-heading text-lg font-black text-sky-400">
                Academic Fee Structure Matrix (₹ / Month)
              </h4>
              <p className="text-xs text-slate-400">
                Updates reflect immediately on Course Cards, dynamic checkout QR codes & receipts.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => applyBulkDiscount(15)}
                className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold px-3 py-1.5 rounded-xl"
              >
                ⚡ 15% Combo Savings
              </button>
              <button
                onClick={() => applyBulkDiscount(10)}
                className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold px-3 py-1.5 rounded-xl"
              >
                🎉 10% Festive Off
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-12 gap-2 font-bold text-slate-400 px-3">
              <div className="col-span-3">Class Batch</div>
              <div className="col-span-3">Pure Math Fee (₹)</div>
              <div className="col-span-3">Physics Fee (₹)</div>
              <div className="col-span-3">Combo Package (₹)</div>
            </div>

            {[6, 7, 8, 9, 10].map((grade) => {
              const p = localPricing[grade] || { math: 4000, physics: 4000, combo: 7500 };
              return (
                <div
                  key={grade}
                  className="grid grid-cols-12 gap-2 items-center bg-slate-900/80 p-2.5 rounded-xl border border-slate-800"
                >
                  <div className="col-span-3 font-heading font-black text-white text-sm">
                    Class {grade}
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={p.math}
                      onChange={(e) =>
                        setLocalPricing({
                          ...localPricing,
                          [grade]: { ...p, math: parseInt(e.target.value, 10) || 0 }
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={p.physics}
                      onChange={(e) =>
                        setLocalPricing({
                          ...localPricing,
                          [grade]: { ...p, physics: parseInt(e.target.value, 10) || 0 }
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={p.combo}
                      onChange={(e) =>
                        setLocalPricing({
                          ...localPricing,
                          [grade]: { ...p, combo: parseInt(e.target.value, 10) || 0 }
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-bold rounded-lg px-2.5 py-1 text-xs"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSavePricingChanges}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-amber-500/25 mt-2"
          >
            💾 Save & Deploy Fee Structure
          </button>
        </div>
      )}

      {/* 7. TAB 5: EMERGENCY BROADCAST */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-red-950/40 border border-red-500/40 rounded-3xl space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h5 className="font-heading font-black text-red-300 text-sm">
                Emergency Flash Push (All Active Student Screens)
              </h5>
            </div>
            <p className="text-slate-400">
              Pushes a persistent high-priority notification bar to every student currently browsing the platform.
            </p>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Alert Title</label>
              <input
                type="text"
                value={emergencyTitle}
                onChange={(e) => setEmergencyTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Flash Message</label>
              <textarea
                rows={2}
                value={emergencyMsg}
                onChange={(e) => setEmergencyMsg(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-red-400"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleTriggerEmergency}
                className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>🚨 Dispatch Flash Alert Now</span>
              </button>
              {emergencyAlert.isActive && (
                <button
                  onClick={() => onSendEmergencyAlert('', '', false)}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs px-3 py-2 rounded-xl"
                >
                  Dismiss Alert
                </button>
              )}
            </div>
          </div>

          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3 text-xs">
            <h5 className="font-heading font-black text-amber-300 text-sm">
              Persistent Website Header Ticker
            </h5>
            <p className="text-slate-400">Controls the banner running across the top of the entire website.</p>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Announcement Text</label>
              <input
                type="text"
                value={localTickerText}
                onChange={(e) => setLocalTickerText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={localTickerEnabled}
                onChange={(e) => setLocalTickerEnabled(e.target.checked)}
                className="accent-amber-400"
              />
              <span className="text-slate-300 font-bold">Enable Announcement Bar on Website</span>
            </label>

            <button
              onClick={handleSaveAnnouncement}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md mt-2"
            >
              💾 Publish Announcement Ticker
            </button>
          </div>
        </div>
      )}

      {/* 8. TAB 6: VAULT MANAGER */}
      {activeTab === 'content' && (
        <div className="bg-[#0c1427]/90 border border-purple-500/30 rounded-3xl p-6 lg:p-8 shadow-xl space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4 pb-3 border-b border-slate-700/60">
            <div>
              <h4 className="font-heading text-lg font-black text-purple-400">
                Lecture Recordings & Whiteboard Vault Manager
              </h4>
              <p className="text-xs text-slate-400">
                Publish derivation notes and recorded sessions directly to enrolled students.
              </p>
            </div>
            <button
              onClick={() => setShowRecForm(!showRecForm)}
              className="bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-md"
            >
              + Upload Lecture Record
            </button>
          </div>

          {showRecForm && (
            <form onSubmit={handleSaveRecordingSubmit} className="p-4 bg-slate-950 rounded-2xl border border-purple-400/40 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Lecture Title *</label>
                  <input
                    type="text"
                    value={recTitle}
                    onChange={(e) => setRecTitle(e.target.value)}
                    placeholder="e.g. Class 10: Circle Theorems"
                    required
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Subject</label>
                  <select
                    value={recSubject}
                    onChange={(e) => setRecSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-400"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Grade</label>
                  <select
                    value={recGrade}
                    onChange={(e) => setRecGrade(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-400"
                  >
                    <option value={6}>Class 6</option>
                    <option value={7}>Class 7</option>
                    <option value={8}>Class 8</option>
                    <option value={9}>Class 9</option>
                    <option value={10}>Class 10</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Duration</label>
                  <input
                    type="text"
                    value={recDuration}
                    onChange={(e) => setRecDuration(e.target.value)}
                    placeholder="e.g. 50 mins"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRecForm(false)}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs px-3 py-1.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-xl shadow-md"
                >
                  ✓ Add to Student Vault
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto max-h-72 rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-200">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recordings.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/60">
                    <td className="p-3 font-bold text-white">{r.title}</td>
                    <td className="p-3 text-sky-400">{r.subject}</td>
                    <td className="p-3 text-amber-400">Class {r.grade}</td>
                    <td className="p-3 text-slate-400">{r.duration}</td>
                    <td className="p-3 text-slate-400">{r.date}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeleteRecording(r.id)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. TAB 7: OFFICIAL UPI ROUTING */}
      {activeTab === 'upi' && (
        <div className="bg-[#0c1427]/90 border border-emerald-500/30 rounded-3xl p-6 lg:p-8 shadow-xl space-y-4 max-w-xl">
          <div>
            <h4 className="font-heading text-lg font-black text-emerald-400">
              Official Gateway & Direct Payee Routing
            </h4>
            <p className="text-xs text-slate-400">
              Ensure incoming student payments route cleanly to Bhimsingh Sir's verified account.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                PhonePe / Google Pay / Paytm Mobile Number:
              </label>
              <input
                type="text"
                value={localPhone}
                onChange={(e) => setLocalPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Verified Direct UPI ID:
              </label>
              <input
                type="text"
                value={localUpi}
                onChange={(e) => setLocalUpi(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-sky-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-400 font-mono font-bold"
              />
            </div>
          </div>

          <button
            onClick={handleSaveUpi}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-md mt-2"
          >
            💾 Update Gateway Credentials
          </button>
        </div>
      )}

      {/* 10. TAB 8: AUDIT & BACKUP */}
      {activeTab === 'backup' && (
        <div className="bg-[#0c1427]/90 border border-slate-700/60 rounded-3xl p-6 lg:p-8 shadow-xl space-y-6">
          <div>
            <h4 className="font-heading text-lg font-black text-slate-200">
              Academy Analytics & Activity Audit Logs
            </h4>
            <p className="text-xs text-slate-400">Real-time audit trail and complete database snapshot management.</p>
          </div>

          {/* Activity Log Feed */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <h5 className="font-bold text-slate-300 text-xs">Live Directorate Activity Audit Log:</h5>
              <button
                onClick={onClearAuditLogs}
                className="text-[10px] text-slate-500 hover:text-slate-400 underline"
              >
                Clear Log
              </button>
            </div>
            <div className="h-40 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
              {auditLogs.map((log) => (
                <div key={log.id}>
                  <span className="text-slate-500">[{log.time}]</span>{' '}
                  <span className="text-slate-300">{log.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Database Backup & Restore */}
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3 text-xs">
            <h5 className="font-bold text-white">Full Academy Database Backup & Restore:</h5>
            <p className="text-slate-400">
              Export complete database snapshot or restore existing state anytime.
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { window.location.href = '/api/system/backup'; onShowToast('Database exported!'); }}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Full Academy Database (JSON)</span>
              </button>
              <label className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Restore Database from JSON</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
