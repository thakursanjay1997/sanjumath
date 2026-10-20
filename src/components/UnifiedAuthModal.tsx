import React, { useState } from 'react';
import { api } from '../api';
import { StudentRecord } from '../types';
import { X, GraduationCap, UserCheck, ShieldCheck, Sparkles, Lock, ArrowRight } from 'lucide-react';

interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'student' | 'teacher' | 'owner';
  onStudentSuccess: (student: StudentRecord) => void;
  onTeacherSuccess: (facultyData?: {
    facultyName: string;
    facultyId: string;
    subject?: string;
    grades?: number[];
    activeBatch?: string;
  }) => void;
  onOwnerSuccess: () => void;
  onShowToast: (msg: string) => void;
}

export const UnifiedAuthModal: React.FC<UnifiedAuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'student',
  onStudentSuccess,
  onTeacherSuccess,
  onOwnerSuccess,
  onShowToast
}) => {
  const [activeRole, setActiveRole] = useState<'student' | 'teacher' | 'owner'>(initialRole);

  // Student Form State
  const [studentMode, setStudentMode] = useState<'signin' | 'signup'>('signin');
  const [loginId, setLoginId] = useState('');
  const [loginGrade, setLoginGrade] = useState<number>(10);
  const [loginPass, setLoginPass] = useState('');

  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regGrade, setRegGrade] = useState<number>(10);
  const [regPass, setRegPass] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');

  // Faculty State (Issued exclusively by Director)
  const [teacherId, setTeacherId] = useState('');
  const [teacherPass, setTeacherPass] = useState('');

  // Owner State (Strictly confidential - NEVER prefilled or exposed)
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPasscode, setOwnerPasscode] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    setActiveRole(initialRole);
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  // Student Sign In
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) {
      onShowToast('Please enter your registered mobile number or email.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.studentLogin({
        loginId: loginId.trim(),
        grade: loginGrade,
        password: loginPass
      });
      onStudentSuccess(res.student);
      onShowToast(`Welcome back, ${res.student.name}!`);
      onClose();
    } catch (err: any) {
      onShowToast(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Student Registration
  const handleSendOtp = () => {
    if (!regMobile.trim() && !regEmail.trim()) {
      onShowToast('Please provide a mobile number or email.');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(code);
    setOtpSent(true);
    onShowToast(`Verification OTP dispatched: ${code}`);
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      onShowToast('Please enter student full name.');
      return;
    }
    if (!regMobile.trim()) {
      onShowToast('Please enter mobile number.');
      return;
    }
    if (simulatedOtp && enteredOtp.trim() !== simulatedOtp) {
      onShowToast('❌ Invalid OTP. Please verify the 6-digit code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.studentSignUp({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regMobile.trim(),
        grade: regGrade,
        password: regPass || '1234'
      });
      onStudentSuccess(res.student);
      onShowToast(`Account created! Welcome, ${res.student.name}.`);
      onClose();
    } catch (err: any) {
      onShowToast(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Faculty Login
  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId.trim() || !teacherPass.trim()) {
      onShowToast('Please enter both Faculty ID and Password.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.teacherLogin({ teacherId: teacherId.trim(), password: teacherPass.trim() });
      onTeacherSuccess(res);
      onShowToast(`Welcome to Faculty Command Portal, ${res.facultyName || 'Faculty Member'}!`);
      onClose();
    } catch (err: any) {
      onShowToast(err.message || 'Invalid Faculty Credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Owner Login (Strictly confidential - Email typed manually by Director)
  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerEmail.trim() || !ownerPasscode.trim()) {
      onShowToast('Please enter your Registered Director Email and Master Passcode.');
      return;
    }
    if (ownerEmail.trim().toLowerCase() !== 'thakursanjay1997@gmail.com') {
      onShowToast('❌ Access Denied: Unauthorized Directorate credentials.');
      return;
    }
    setIsLoading(true);
    try {
      await api.ownerLogin({ email: ownerEmail.trim(), passcode: ownerPasscode.trim() });
      onOwnerSuccess();
      onShowToast('🔓 Directorate Console Unlocked. Welcome Bhimsingh Sir!');
      onClose();
    } catch (err: any) {
      onShowToast(err.message || 'Director verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-gradient-to-br from-[#090e1f] via-[#121936] to-[#080d1e] border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl relative space-y-5">
        
        {/* Top Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-700/80">
          <span className="font-heading font-black text-xs text-amber-400 uppercase tracking-wider">
            SANJU MATH ACADEMY &bull; PORTAL ACCESS
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveRole('student')}
            className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeRole === 'student'
                ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>

          <button
            onClick={() => setActiveRole('teacher')}
            className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeRole === 'teacher'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Faculty</span>
          </button>

          <button
            onClick={() => setActiveRole('owner')}
            className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeRole === 'owner'
                ? 'bg-rose-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Director</span>
          </button>
        </div>

        {/* 1. STUDENT AUTHENTICATION */}
        {activeRole === 'student' && (
          <div className="space-y-4">
            <div className="flex border-b border-slate-700/80 mb-2">
              <button
                onClick={() => setStudentMode('signin')}
                className={`w-1/2 py-2 font-bold text-xs border-b-2 transition-colors ${
                  studentMode === 'signin' ? 'text-sky-400 border-sky-400' : 'text-slate-400 border-transparent'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setStudentMode('signup')}
                className={`w-1/2 py-2 font-bold text-xs border-b-2 transition-colors ${
                  studentMode === 'signup' ? 'text-amber-400 border-amber-400' : 'text-slate-400 border-transparent'
                }`}
              >
                New Student Register
              </button>
            </div>

            {studentMode === 'signin' ? (
              <form onSubmit={handleStudentLogin} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Mobile Number or Email</label>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="e.g. 9822011223 or your email"
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Target Class / Grade</label>
                  <select
                    value={loginGrade}
                    onChange={(e) => setLoginGrade(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-400"
                  >
                    <option value={6}>Class 6</option>
                    <option value={7}>Class 7</option>
                    <option value={8}>Class 8</option>
                    <option value={9}>Class 9</option>
                    <option value={10}>Class 10</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Password (Default: 1234)</label>
                  <input
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs py-3 rounded-xl shadow-lg shadow-sky-600/30 transition-transform hover:-translate-y-0.5 mt-2 flex items-center justify-center gap-1.5"
                >
                  <span>Enter Student Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleStudentRegister} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value)}
                      placeholder="10-digit mobile"
                      required
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Target Grade *</label>
                    <select
                      value={regGrade}
                      onChange={(e) => setRegGrade(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400"
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
                  <label className="text-slate-300 font-bold block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Create Password *</label>
                  <input
                    type="password"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="Choose account password"
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400"
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
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-amber-500/25 transition-transform hover:-translate-y-0.5 mt-2 flex items-center justify-center gap-1.5"
                >
                  <span>✓ Complete Registration & Open Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* 2. FACULTY AUTHENTICATION */}
        {activeRole === 'teacher' && (
          <form onSubmit={handleTeacherLogin} className="space-y-3.5 text-xs">
            <div className="text-center space-y-1 mb-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-950 border border-emerald-500 flex items-center justify-center text-2xl">
                👨‍🏫
              </div>
              <h4 className="font-heading font-black text-white text-base">Faculty Studio Sign In</h4>
              <p className="text-slate-400 text-[11px]">
                Faculty accounts & credentials are created and issued solely by the Director.
              </p>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Director-Issued Faculty ID</label>
              <input
                type="text"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                placeholder="Enter your Faculty ID"
                required
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400 font-mono tracking-wider"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Faculty Password</label>
              <input
                type="password"
                value={teacherPass}
                onChange={(e) => setTeacherPass(e.target.value)}
                placeholder="Enter your Faculty Password"
                required
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-300/90 leading-relaxed">
              🛡️ <strong>Faculty Policy:</strong> All teacher accounts, subjects, and grade allocations are governed directly by Director Bhimsingh Thakur.
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5 mt-2"
            >
              Enter Faculty Studio Desk →
            </button>
          </form>
        )}

        {/* 3. OWNER / DIRECTOR AUTHENTICATION (STRICTLY SIGN IN ONLY - NO SIGN UP) */}
        {activeRole === 'owner' && (
          <form onSubmit={handleOwnerLogin} className="space-y-3.5 text-xs">
            <div className="text-center space-y-1 mb-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-rose-950 border border-rose-500 flex items-center justify-center text-2xl">
                👑
              </div>
              <h4 className="font-heading font-black text-white text-base">Directorate Sign In</h4>
              <p className="text-slate-400 text-[11px]">
                Authorized Director & Founder Access. Enter your private credentials to unlock.
              </p>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Director Registered Email</label>
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="Enter your director email"
                required
                autoComplete="off"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Master Security Passcode</label>
              <input
                type="password"
                value={ownerPasscode}
                onChange={(e) => setOwnerPasscode(e.target.value)}
                placeholder="Enter master passcode"
                required
                autoComplete="off"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono text-center tracking-widest text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-xs py-3 rounded-xl shadow-lg shadow-rose-900/40 transition-transform hover:-translate-y-0.5 mt-2"
            >
              Unlock Directorate Console 🔓
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
