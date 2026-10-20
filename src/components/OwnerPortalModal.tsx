import React, { useState } from 'react';
import {
  PendingPayment,
  StudentRecord,
  Coupon,
  CoursePrices,
  PaymentSettings,
  Announcement,
  EmergencyAlert,
  LectureRecording,
  AuditLog
} from '../types';
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
  RefreshCw,
  Search,
  Trash2,
  Lock,
  Printer,
  Sparkles,
  Zap,
  AlertTriangle
} from 'lucide-react';

interface OwnerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingPayments: PendingPayment[];
  students: StudentRecord[];
  coupons: Coupon[];
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
  onShowToast: (msg: string) => void;
}

export const OwnerPortalModal: React.FC<OwnerPortalModalProps> = ({
  isOpen,
  onClose,
  pendingPayments,
  students,
  coupons,
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
  onShowToast
}) => {
  // Passcode gate state: strictly checking owner email and passcode
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [enteredEmail, setEnteredEmail] = useState('');
  const [enteredPasscode, setEnteredPasscode] = useState('');

  // Active Directorate Sub Tab
  const [activeTab, setActiveTab] = useState<
    'approvals' | 'roster' | 'coupons' | 'pricing' | 'broadcast' | 'content' | 'upi' | 'backup'
  >('approvals');

  // God-Mode Form State
  const [showGodModeForm, setShowGodModeForm] = useState(false);
  const [godName, setGodName] = useState('');
  const [godEmail, setGodEmail] = useState('');
  const [godPhone, setGodPhone] = useState('');
  const [godGrade, setGodGrade] = useState<number>(10);
  const [godCourse, setGodCourse] = useState('Math + Physics Combo Super-Batch');
  const [godFeeType, setGodFeeType] = useState('PAID_CASH');

  // Roster Filter State
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterGradeFilter, setRosterGradeFilter] = useState('ALL');

  // Coupon Form State
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [cpnCode, setCpnCode] = useState('');
  const [cpnType, setCpnType] = useState<'percent' | 'flat'>('percent');
  const [cpnValue, setCpnValue] = useState<number>(15);
  const [cpnDesc, setCpnDesc] = useState('');

  // Local Pricing state for edits
  const [localPricing, setLocalPricing] = useState<CoursePrices>(coursePrices);

  // Local UPI state for edits
  const [localPhone, setLocalPhone] = useState(paymentSettings.phone);
  const [localUpi, setLocalUpi] = useState(paymentSettings.upi);

  // Local Announcement state for edits
  const [localTickerText, setLocalTickerText] = useState(announcement.text);
  const [localTickerEnabled, setLocalTickerEnabled] = useState(announcement.isEnabled);

  // Local Emergency Alert state
  const [emergencyTitle, setEmergencyTitle] = useState('DIRECTORATE URGENT NOTICE');
  const [emergencyMsg, setEmergencyMsg] = useState(
    'Special Sunday Theorem Solving Session begins today at 6:00 PM IST!'
  );

  // New Recording form state
  const [showRecForm, setShowRecForm] = useState(false);
  const [recTitle, setRecTitle] = useState('');
  const [recSubject, setRecSubject] = useState('Mathematics');
  const [recGrade, setRecGrade] = useState<number>(10);
  const [recDuration, setRecDuration] = useState('50 mins');

  if (!isOpen) return null;

  const handleUnlockGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      enteredEmail.trim().toLowerCase() === 'thakursanjay1997@gmail.com' &&
      enteredPasscode.trim().toLowerCase() === 'sanjaymath@1997'
    ) {
      setIsUnlocked(true);
      onShowToast('🔓 Directorate Console Unlocked. Welcome Bhimsingh Sir!');
    } else {
      onShowToast('❌ Access Denied: Invalid email or master passcode.');
    }
  };

  const handleExecuteGodMode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!godName.trim()) {
      onShowToast('Please enter student name.');
      return;
    }
    onGodModeEnroll({
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
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpnCode.trim()) {
      onShowToast('Enter coupon code.');
      return;
    }
    onSaveCoupon({
      code: cpnCode.trim().toUpperCase(),
      type: cpnType,
      value: cpnValue,
      desc: cpnDesc.trim() || 'Promotional Discount'
    });
    setCpnCode('');
    setShowCouponForm(false);
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

  const handleExportRosterCsv = () => {
    let csv = 'Roll,Student Name,Grade,Course,Fee Paid,Reference,Joined Date\n';
    students.forEach((s) => {
      csv += `"${s.roll}","${s.name}","Class ${s.grade}","${s.courseName}","${s.feePaid}","${s.utr}","${s.joinedDate}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sanju_Math_Students_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    onShowToast('Master student roster exported to CSV!');
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
    if (!emergencyMsg.trim()) {
      onShowToast('Please enter emergency flash message.');
      return;
    }
    onSendEmergencyAlert(emergencyTitle.trim(), emergencyMsg.trim(), true);
  };

  const handleClearEmergency = () => {
    onSendEmergencyAlert('', '', false);
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

  const handleDownloadBackup = () => {
    window.location.href = '/api/system/backup';
    onShowToast('Full system JSON backup downloaded!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        onRestoreDatabase(data);
      } catch (err) {
        onShowToast('❌ Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const filteredStudents = students.filter((s) => {
    const term = rosterSearch.toLowerCase().trim();
    const matchesTerm =
      s.name.toLowerCase().includes(term) ||
      s.roll.toLowerCase().includes(term) ||
      s.utr.toLowerCase().includes(term);
    const matchesGrade = rosterGradeFilter === 'ALL' || s.grade.toString() === rosterGradeFilter;
    return matchesTerm && matchesGrade;
  });

  const totalRevenue = students.reduce((acc, s) => acc + (s.feePaid || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-gradient-to-br from-[#090e1f] via-[#121936] to-[#080d1e] border-2 border-amber-400 rounded-3xl p-6 lg:p-8 max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-6 relative">
        
        {/* Top Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👑</span>
            <div>
              <h3 className="font-heading text-xl sm:text-2xl font-black text-amber-400">
                SANJU MATH &bull; Owner Executive Directorate Desk
              </h3>
              <p className="text-xs text-slate-400">
                Direct Administrative Controls &bull; Strictly for <strong className="text-white">thakursanjay1997@gmail.com</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && (
              <button
                onClick={() => setIsUnlocked(false)}
                className="bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Desk</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold px-3 py-1.5 rounded-xl"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Security Gate */}
        {!isUnlocked ? (
          <div className="text-center py-10 space-y-4 max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-950 to-amber-950 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-2xl">
              🔐
            </div>
            <h4 className="font-heading text-2xl font-black text-white">Director Security Verification</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Authorized only for Founder <strong className="text-amber-400">Bhimsingh Thakur</strong>. Enter your registered email ID and master passcode to unlock real-time administrative superpowers.
            </p>

            <form onSubmit={handleUnlockGate} className="space-y-3 pt-2 text-left">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Director Email ID</label>
                <input
                  type="email"
                  value={enteredEmail}
                  onChange={(e) => setEnteredEmail(e.target.value)}
                  placeholder="thakursanjay1997@gmail.com"
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Master Passcode</label>
                <input
                  type="password"
                  value={enteredPasscode}
                  onChange={(e) => setEnteredPasscode(e.target.value)}
                  placeholder="Enter Master Passcode"
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-white text-center font-mono font-bold tracking-wider rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-amber-500/25 transition-transform hover:-translate-y-0.5 mt-2"
              >
                Unlock Executive Directorate Desk 🔓
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Directorate Sub-Navigation Pills */}
            <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-700/80">
              <button
                onClick={() => setActiveTab('approvals')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'approvals' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white/5 text-slate-300'
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
                onClick={() => setActiveTab('roster')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'roster' ? 'bg-sky-400 text-slate-950 font-black' : 'bg-white/5 text-slate-300'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>👨‍🎓 Student Directory & God-Mode</span>
              </button>

              <button
                onClick={() => setActiveTab('coupons')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'coupons' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white/5 text-slate-300'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>🎟️ Promo Coupons</span>
              </button>

              <button
                onClick={() => setActiveTab('pricing')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'pricing' ? 'bg-sky-400 text-slate-950 font-black' : 'bg-white/5 text-slate-300'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>💰 Pricing Matrix</span>
              </button>

              <button
                onClick={() => setActiveTab('broadcast')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'broadcast' ? 'bg-rose-500 text-white font-black' : 'bg-white/5 text-slate-300'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>📢 Emergency Push</span>
              </button>

              <button
                onClick={() => setActiveTab('content')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'content' ? 'bg-purple-400 text-slate-950 font-black' : 'bg-white/5 text-slate-300'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>📼 Vault Content</span>
              </button>

              <button
                onClick={() => setActiveTab('upi')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'upi' ? 'bg-emerald-400 text-slate-950 font-black' : 'bg-white/5 text-slate-300'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>📱 UPI Gateway</span>
              </button>

              <button
                onClick={() => setActiveTab('backup')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'backup' ? 'bg-slate-300 text-slate-950 font-black' : 'bg-white/5 text-slate-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>📊 Audit & Backup</span>
              </button>
            </div>

            {/* TAB 1: FEE APPROVALS */}
            {activeTab === 'approvals' && (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h4 className="font-heading text-lg font-black text-amber-400">
                      Incoming Student Fee Verifications
                    </h4>
                    <p className="text-xs text-slate-400">
                      Review real-time payment submissions, check transaction UTR records, and unlock live class access.
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
                    <p className="text-xs text-slate-400">All submitted student payments are verified and enrolled!</p>
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
                            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-black border border-amber-400/30">
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
                            UTR / Ref: <strong className="text-sky-300">{p.utr}</strong> &bull; Contact: {p.studentPhone} &bull; Submitted: {p.date}
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

            {/* TAB 2: STUDENT DIRECTORY & GOD MODE */}
            {activeTab === 'roster' && (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h4 className="font-heading text-lg font-black text-sky-400">
                      Master Student Directory & God-Mode Console
                    </h4>
                    <p className="text-xs text-slate-400">
                      Total Enrolled: <strong className="text-white">{students.length} Students</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowGodModeForm(!showGodModeForm)}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>⚡ Quick Direct Admission (God-Mode)</span>
                    </button>
                    <button
                      onClick={handleExportRosterCsv}
                      className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download CSV</span>
                    </button>
                  </div>
                </div>

                {/* God-Mode Instant Enroller Box */}
                {showGodModeForm && (
                  <form
                    onSubmit={handleExecuteGodMode}
                    className="p-5 bg-slate-950 rounded-2xl border-2 border-amber-400/60 space-y-3 shadow-xl animate-fadeIn"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-heading font-black text-amber-300 text-sm">
                        ⚡ God-Mode: Instant Direct Admission (Bypasses Checkout)
                      </span>
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-black">
                        DIRECTOR OVERRIDE
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Student Name *</label>
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
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Course Package</label>
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
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Admission Fee Type</label>
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
                        ✓ Instantly Enroll & Unlock Student Access
                      </button>
                    </div>
                  </form>
                )}

                {/* Filter and Search */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={rosterSearch}
                      onChange={(e) => setRosterSearch(e.target.value)}
                      placeholder="Search by name, roll, or UTR..."
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <select
                      value={rosterGradeFilter}
                      onChange={(e) => setRosterGradeFilter(e.target.value)}
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
                  <div className="flex items-center justify-end text-xs text-slate-400">
                    <span>Showing: <strong className="text-sky-400">{filteredStudents.length}</strong> matches</span>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto max-h-72 rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-slate-200">
                      <tr>
                        <th className="p-3">Roll</th>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Batch</th>
                        <th className="p-3">Course Enrolled</th>
                        <th className="p-3">Fee Paid</th>
                        <th className="p-3">Reference / UTR</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredStudents.map((s) => (
                        <tr key={s.roll} className="hover:bg-slate-900/60">
                          <td className="p-3 font-mono font-bold text-amber-400">{s.roll}</td>
                          <td className="p-3 font-bold text-white">{s.name}</td>
                          <td className="p-3 text-sky-400">Class {s.grade}</td>
                          <td className="p-3 text-slate-300 text-[11px]">{s.courseName}</td>
                          <td className="p-3 text-emerald-400 font-bold">₹{s.feePaid.toLocaleString()}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-400">{s.utr}</td>
                          <td className="p-3 text-right space-x-1.5">
                            <button
                              onClick={() => onPrintReceipt(s)}
                              className="text-sky-400 hover:text-sky-300 bg-sky-950/40 border border-sky-800/40 text-[11px] px-2 py-0.5 rounded font-bold"
                            >
                              Receipt
                            </button>
                            <button
                              onClick={() => onRevokeStudent(s.roll)}
                              className="text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/40 text-[11px] px-2 py-0.5 rounded font-bold"
                            >
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: PROMO COUPONS & DISCOUNTS */}
            {activeTab === 'coupons' && (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h4 className="font-heading text-lg font-black text-amber-400">
                      🎟️ Promo Coupons & Fee Discounts Engine
                    </h4>
                    <p className="text-xs text-slate-400">
                      Create promotional codes for merit scholars and test applicants.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCouponForm(!showCouponForm)}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    <span>+ Create New Coupon</span>
                  </button>
                </div>

                {showCouponForm && (
                  <form
                    onSubmit={handleCreateCoupon}
                    className="p-4 bg-slate-950 rounded-2xl border border-amber-400/40 space-y-3 animate-fadeIn text-xs"
                  >
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
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-black ${
                                c.active
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-slate-700 text-slate-400'
                              }`}
                            >
                              {c.active ? 'ACTIVE' : 'DISABLED'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-sky-400">{c.usageCount || 0} used</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => onDeleteCoupon(c.id)}
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

            {/* TAB 4: PRICING MATRIX & BULK ADJUSTERS */}
            {activeTab === 'pricing' && (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
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

            {/* TAB 5: EMERGENCY BROADCAST & TICKER */}
            {activeTab === 'broadcast' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Emergency Push Alert */}
                <div className="p-5 bg-red-950/40 border border-red-500/40 rounded-2xl space-y-3 text-xs">
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
                        onClick={handleClearEmergency}
                        className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs px-3 py-2 rounded-xl"
                      >
                        Dismiss Alert
                      </button>
                    )}
                  </div>
                </div>

                {/* Persistent Website Ticker */}
                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 text-xs">
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

            {/* TAB 6: CONTENT & VAULT MANAGER */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
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
                  <form
                    onSubmit={handleSaveRecordingSubmit}
                    className="p-4 bg-slate-950 rounded-2xl border border-purple-400/40 space-y-3 animate-fadeIn text-xs"
                  >
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

            {/* TAB 7: UPI ROUTING */}
            {activeTab === 'upi' && (
              <div className="space-y-4 max-w-xl">
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

            {/* TAB 8: AUDIT LOGS, STATS & BACKUP */}
            {activeTab === 'backup' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-heading text-lg font-black text-slate-200">
                    Academy Analytics & Live Activity Log
                  </h4>
                  <p className="text-xs text-slate-400">Audit trail of all directorate actions and database backups.</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-bold block">TOTAL REVENUE (EST.)</span>
                    <p className="font-heading text-2xl font-black text-emerald-400 mt-1">
                      ₹{totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-bold block">ACTIVE ENROLLED STUDENTS</span>
                    <p className="font-heading text-2xl font-black text-sky-400 mt-1">{students.length}</p>
                  </div>
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-bold block">PENDING APPROVALS</span>
                    <p className="font-heading text-2xl font-black text-amber-400 mt-1">
                      {pendingPayments.length}
                    </p>
                  </div>
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
                  <div className="h-32 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
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
                      onClick={handleDownloadBackup}
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
        )}
      </div>
    </div>
  );
};
