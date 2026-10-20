import React, { useState } from 'react';
import { Announcement, EmergencyAlert, LiveBroadcastState, StudentRecord, PortalType } from '../types';
import { Menu, X, Sparkles, AlertTriangle, ShieldCheck, User, LogIn, Lock, GraduationCap } from 'lucide-react';

interface HeaderProps {
  activePortal: PortalType;
  onPortalChange: (portal: PortalType) => void;
  publicTab: string;
  onPublicTabChange: (tab: string) => void;
  announcement: Announcement;
  emergencyAlert: EmergencyAlert;
  liveBroadcast: LiveBroadcastState;
  student: StudentRecord | null;
  isTeacherLoggedIn: boolean;
  isOwnerLoggedIn: boolean;
  pendingCount: number;
  onOpenAuthModal: (defaultTab?: 'student' | 'teacher' | 'owner') => void;
  onLogout: () => void;
  onDismissEmergency: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePortal,
  onPortalChange,
  publicTab,
  onPublicTabChange,
  announcement,
  emergencyAlert,
  liveBroadcast,
  student,
  isTeacherLoggedIn,
  isOwnerLoggedIn,
  pendingCount,
  onOpenAuthModal,
  onLogout,
  onDismissEmergency
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* 1. Global Announcement Ticker */}
      {announcement.isEnabled && announcement.text && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-4 py-2 text-center text-xs font-black text-slate-950 tracking-wide border-b border-amber-300 shadow-sm flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{announcement.text}</span>
        </div>
      )}

      {/* 2. Directorate Emergency Alert Banner */}
      {emergencyAlert.isActive && emergencyAlert.message && (
        <div className="bg-red-950 border-b-2 border-red-500 px-4 py-2.5 text-xs text-red-100 flex items-center justify-between shadow-2xl animate-pulse">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <strong className="text-white block font-black uppercase tracking-wider">
                {emergencyAlert.title || 'DIRECTORATE URGENT NOTICE'}
              </strong>
              <span>{emergencyAlert.message}</span>
            </div>
          </div>
          <button
            onClick={onDismissEmergency}
            className="text-xs bg-red-900/60 hover:bg-red-800 text-red-200 px-2.5 py-1 rounded-lg border border-red-700 font-bold ml-3"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* 3. Sticky Academy Header */}
      <header className="sticky top-0 z-40 bg-[#070d1d]/95 backdrop-blur-xl border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          
          {/* Academy Brand Logo */}
          <div
            onClick={() => {
              if (activePortal !== 'public') {
                onPortalChange('public');
              } else {
                onPublicTabChange('home');
              }
            }}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-rose-500 flex items-center justify-center font-black text-2xl text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              ∑
            </div>
            <div>
              <h1 className="font-heading text-2xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-sky-400 to-rose-400 bg-clip-text text-transparent">
                SANJU MATH
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                CBSE Math & Physics Academy &bull; <span className="text-amber-400 font-bold">Bhimsingh Thakur (M.Sc.)</span>
              </p>
            </div>
          </div>

          {/* Navigation Items (Context-Aware for Public / Student / Teacher / Owner) */}
          <nav className="hidden md:flex items-center gap-2">
            
            {/* PUBLIC NAVIGATION */}
            {activePortal === 'public' && (
              <>
                <button
                  onClick={() => onPublicTabChange('home')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    publicTab === 'home'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  🏠 Academy Home
                </button>

                <button
                  onClick={() => onPublicTabChange('curriculum')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    publicTab === 'curriculum'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  📚 CBSE Syllabus (6-10)
                </button>

                <button
                  onClick={() => onPublicTabChange('courses')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    publicTab === 'courses'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  💳 Course Batches
                </button>

                {/* If student is logged in, show direct portal button */}
                {student ? (
                  <button
                    onClick={() => onPortalChange('student')}
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>My Student Portal ({student.name})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenAuthModal('student')}
                    className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md shadow-amber-500/25 flex items-center gap-1.5"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Student Login / Sign Up</span>
                  </button>
                )}

                {/* If Teacher or Owner is logged in, show their portal button */}
                {isTeacherLoggedIn && (
                  <button
                    onClick={() => onPortalChange('teacher')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded-xl"
                  >
                    👨‍🏫 Faculty Desk
                  </button>
                )}

                {isOwnerLoggedIn && (
                  <button
                    onClick={() => onPortalChange('owner')}
                    className="bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>👑 Owner Console</span>
                    {pendingCount > 0 && (
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Discreet Portal Access Link */}
                {!isTeacherLoggedIn && !isOwnerLoggedIn && (
                  <button
                    onClick={() => onOpenAuthModal('teacher')}
                    className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-transparent hover:border-slate-800 transition-colors"
                    title="Faculty & Director Access"
                  >
                    Portal Access &rarr;
                  </button>
                )}
              </>
            )}

            {/* DEDICATED STUDENT PORTAL NAVBAR (No Owner or Faculty Desk visible!) */}
            {activePortal === 'student' && student && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-900 border border-sky-400/60 rounded-full px-3 py-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 flex items-center justify-center font-black text-xs text-white">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-bold text-white text-[11px] leading-tight">
                      {student.name}
                    </p>
                    <span className="text-[9px] text-sky-400 font-mono">
                      Class {student.grade} &bull; {student.roll}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onPortalChange('public')}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold px-3 py-2 rounded-xl"
                >
                  🏠 Academy Home
                </button>

                <button
                  onClick={onLogout}
                  className="bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-bold px-3 py-2 rounded-xl"
                >
                  Log Out
                </button>
              </div>
            )}

            {/* DEDICATED TEACHER PORTAL NAVBAR (No Owner Desk visible!) */}
            {activePortal === 'teacher' && (
              <div className="flex items-center gap-3">
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                  👨‍🏫 Bhimsingh Sir Studio
                </span>

                <button
                  onClick={() => onPortalChange('public')}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold px-3 py-2 rounded-xl"
                >
                  🏠 Academy Home
                </button>

                <button
                  onClick={onLogout}
                  className="bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-bold px-3 py-2 rounded-xl"
                >
                  Log Out Faculty
                </button>
              </div>
            )}

            {/* DEDICATED OWNER DIRECTORATE NAVBAR */}
            {activePortal === 'owner' && (
              <div className="flex items-center gap-3">
                <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full font-black flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>Directorate Console</span>
                </span>

                <button
                  onClick={() => onPortalChange('public')}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold px-3 py-2 rounded-xl"
                >
                  🏠 Academy Home
                </button>

                <button
                  onClick={onLogout}
                  className="bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-bold px-3 py-2 rounded-xl"
                >
                  Log Out Director
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 bg-white/5 border border-white/10 rounded-xl text-slate-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 py-3 bg-[#0a1226] border-t border-slate-800 space-y-2">
            <button
              onClick={() => { onPortalChange('public'); onPublicTabChange('home'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 bg-white/5"
            >
              🏠 Academy Home
            </button>
            <button
              onClick={() => { onPortalChange('public'); onPublicTabChange('curriculum'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 bg-white/5"
            >
              📚 CBSE Syllabus (6-10)
            </button>
            <button
              onClick={() => { onPortalChange('public'); onPublicTabChange('courses'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 bg-white/5"
            >
              💳 Course Batches
            </button>

            {student ? (
              <button
                onClick={() => { onPortalChange('student'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-sky-300 bg-sky-950/50 border border-sky-500/30"
              >
                🎓 My Student Portal ({student.name})
              </button>
            ) : (
              <button
                onClick={() => { onOpenAuthModal('student'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-950/50 border border-amber-500/30"
              >
                🎓 Student Login / Sign Up
              </button>
            )}

            <button
              onClick={() => { onOpenAuthModal('teacher'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-400 bg-white/5"
            >
              Staff & Directorate Portal Login &rarr;
            </button>
          </div>
        )}
      </header>

      {/* 4. Live Broadcast Alert Bar */}
      {liveBroadcast.isLive && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="bg-rose-950/60 border border-rose-500/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-rose-950/50">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <div>
                <p className="text-xs font-black text-rose-200 uppercase tracking-wider font-mono">
                  🔴 BHIMSINGH SIR IS BROADCASTING LIVE ON SMARTBOARD!
                </p>
                <p className="text-[11px] text-slate-300">
                  Topic: <strong>{liveBroadcast.topic}</strong> (Class {liveBroadcast.grade} {liveBroadcast.subject})
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (student) {
                  onPortalChange('student');
                } else {
                  onOpenAuthModal('student');
                }
              }}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md shadow-amber-500/30"
            >
              Join Live Classroom Now →
            </button>
          </div>
        </div>
      )}
    </>
  );
};
