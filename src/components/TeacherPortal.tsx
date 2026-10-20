import React, { useState } from 'react';
import { ScheduledClass, Doubt, Quiz, StudentRecord } from '../types';
import {
  Radio,
  Calendar,
  Sparkles,
  Users,
  MessageSquare,
  Mic,
  MicOff,
  Trash2,
  Send,
  Plus,
  LogOut,
  Video,
  Home
} from 'lucide-react';

interface TeacherPortalProps {
  currentFaculty?: {
    facultyName?: string;
    facultyId?: string;
    subject?: string;
    grades?: number[];
    activeBatch?: string;
  } | null;
  scheduledClasses: ScheduledClass[];
  doubts: Doubt[];
  students: StudentRecord[];
  isLiveBroadcasting: boolean;
  onToggleBroadcast: (isLive: boolean, topic?: string, subject?: string, grade?: number) => void;
  onAddSchedule: (grade: number, subject: string, topic: string, time: string) => void;
  onDeleteSchedule: (id: string) => void;
  onPublishQuiz: (quiz: { title: string; grade: number; subject: string; questions: Quiz['questions'] }) => void;
  onSendReply: (text: string) => void;
  onEnterStudio: () => void;
  onReturnToHome: () => void;
  onLogout: () => void;
  onShowToast: (msg: string) => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  currentFaculty,
  scheduledClasses,
  doubts,
  students,
  isLiveBroadcasting,
  onToggleBroadcast,
  onAddSchedule,
  onDeleteSchedule,
  onPublishQuiz,
  onSendReply,
  onEnterStudio,
  onReturnToHome,
  onLogout,
  onShowToast
}) => {
  // Timetable form state
  const [schedGrade, setSchedGrade] = useState<number>(10);
  const [schedSubject, setSchedSubject] = useState('Mathematics');
  const [schedTime, setSchedTime] = useState('');
  const [schedTopic, setSchedTopic] = useState('');

  // AI Quiz Generator form state
  const [quizGrade, setQuizGrade] = useState<number>(10);
  const [quizSubject, setQuizSubject] = useState('Mathematics');
  const [quizTopic, setQuizTopic] = useState('Quadratic Equations & Roots');
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);

  // Doubt reply state
  const [replyText, setReplyText] = useState('');

  // Real roster audio state
  const [mutedStudents, setMutedStudents] = useState<Record<string, boolean>>({});

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedTopic.trim() || !schedTime.trim()) {
      onShowToast('Please fill in topic and schedule time.');
      return;
    }
    onAddSchedule(schedGrade, schedSubject, schedTopic.trim(), schedTime.trim());
    setSchedTopic('');
    setSchedTime('');
  };

  const handleGenerateAiQuiz = () => {
    const newQuiz: Quiz = {
      id: 'quiz_' + Date.now(),
      title: `Class ${quizGrade} ${quizSubject}: ${quizTopic}`,
      grade: quizGrade,
      subject: quizSubject,
      questions: [
        {
          q: `In ${quizTopic}, what is the mandatory mathematical condition for two distinct real roots?`,
          options: ['Discriminant D > 0', 'Discriminant D < 0', 'Discriminant D = 0', 'Coefficient a = 0'],
          correct: 0,
          explanation: 'D > 0 produces two distinct real solutions on the number line.'
        },
        {
          q: `Which fundamental NCERT theorem directly underpins derivations in ${quizTopic}?`,
          options: ['Fundamental Theorem of Arithmetic', 'Remainder Theorem', 'Thales Theorem', 'Pythagorean Triplet Axiom'],
          correct: 0,
          explanation: 'Standard foundational theorem for CBSE board curriculum.'
        }
      ]
    };
    setGeneratedQuiz(newQuiz);
    onShowToast('✨ AI Quiz synthesized successfully!');
  };

  const handleBroadcastQuiz = () => {
    if (!generatedQuiz) return;
    onPublishQuiz({
      title: generatedQuiz.title,
      grade: generatedQuiz.grade,
      subject: generatedQuiz.subject,
      questions: generatedQuiz.questions
    });
    setGeneratedQuiz(null);
    onShowToast('🚀 Quiz published live to student dashboards!');
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSendReply(replyText.trim());
    setReplyText('');
  };

  const toggleMute = (roll: string) => {
    setMutedStudents((prev) => ({
      ...prev,
      [roll]: !prev[roll]
    }));
  };

  const muteAll = () => {
    const all: Record<string, boolean> = {};
    students.forEach((s) => {
      all[s.roll] = true;
    });
    setMutedStudents(all);
    onShowToast('All student microphones muted by Faculty.');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Top Faculty Control Header */}
      <div className="bg-gradient-to-br from-[#0c1427]/95 via-[#1a1740]/90 to-[#090e1f]/95 border-2 border-amber-400 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur-xl flex flex-wrap justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-900 to-emerald-900 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/20">
            👨‍🏫
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded font-black border border-amber-400/30">
                FACULTY COMMAND CENTER
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                ID: {currentFaculty?.facultyId || 'BHIMSINGH-THAKUR'}
              </span>
            </div>
            <h2 className="font-heading text-2xl font-black text-white mt-1">
              {currentFaculty?.facultyName || 'Bhimsingh Thakur (M.Sc. Mathematics)'}
            </h2>
            <p className="text-xs text-slate-300">
              {currentFaculty?.subject ? `Subject: ${currentFaculty.subject}` : 'Lead CBSE Educator'} &bull;{' '}
              {currentFaculty?.activeBatch || 'Active Batch: Classes 6 to 10 Pure Mathematics & Physics'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Main Action: Launch Live Studio */}
          <button
            onClick={() => {
              onToggleBroadcast(!isLiveBroadcasting);
              if (!isLiveBroadcasting) onEnterStudio();
            }}
            className={`font-black text-xs px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 transition-transform hover:-translate-y-0.5 ${
              isLiveBroadcasting
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/25'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{isLiveBroadcasting ? '🛑 Stop Live Broadcast' : '🔴 Launch Live Smartboard Studio'}</span>
          </button>

          {isLiveBroadcasting && (
            <button
              onClick={onEnterStudio}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-3 rounded-2xl flex items-center gap-1.5 shadow-md"
            >
              <Video className="w-4 h-4" />
              <span>Open Studio Stage</span>
            </button>
          )}

          <button
            onClick={onReturnToHome}
            className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold px-3.5 py-3 rounded-2xl flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Academy Home</span>
          </button>

          <button
            onClick={onLogout}
            className="bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-bold px-3.5 py-3 rounded-2xl flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Faculty</span>
          </button>
        </div>
      </div>

      {/* 2. Three-Column Executive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Timetable & AI Quiz Synthesizer (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Schedule Manager Card */}
          <div className="bg-[#0c1427]/90 border border-sky-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <h4 className="font-heading text-base font-black text-white">Live Class Timetable & Planner</h4>
              </div>
              <span className="text-xs text-sky-400 font-mono">Syncs to Student Portals</span>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Grade</label>
                  <select
                    value={schedGrade}
                    onChange={(e) => setSchedGrade(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-sky-400"
                  >
                    <option value={6}>Class 6</option>
                    <option value={7}>Class 7</option>
                    <option value={8}>Class 8</option>
                    <option value={9}>Class 9</option>
                    <option value={10}>Class 10</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Subject</label>
                  <select
                    value={schedSubject}
                    onChange={(e) => setSchedSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-sky-400"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Time</label>
                  <input
                    type="text"
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    placeholder="e.g. Today 6:00 PM"
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Topic</label>
                  <input
                    type="text"
                    value={schedTopic}
                    onChange={(e) => setSchedTopic(e.target.value)}
                    placeholder="e.g. Quadratic Roots"
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish Schedule</span>
                </button>
              </div>
            </form>

            <div className="overflow-x-auto max-h-48">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-200">
                  <tr>
                    <th className="p-2.5">Batch</th>
                    <th className="p-2.5">Subject</th>
                    <th className="p-2.5">Topic</th>
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {scheduledClasses.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/60">
                      <td className="p-2.5 font-bold text-amber-400">Class {s.grade}</td>
                      <td className="p-2.5 text-sky-400">{s.subject}</td>
                      <td className="p-2.5 text-white">{s.topic}</td>
                      <td className="p-2.5 text-slate-400">{s.time}</td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => onDeleteSchedule(s.id)}
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

          {/* AI Quiz Synthesizer Card */}
          <div className="bg-[#0c1427]/90 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="font-heading text-base font-black text-amber-400">
                  ⚡ AI Question & Quiz Synthesizer
                </h4>
              </div>
              <span className="text-xs text-amber-400 font-mono">Instant Grading</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Grade</label>
                <select
                  value={quizGrade}
                  onChange={(e) => setQuizGrade(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value={6}>Class 6</option>
                  <option value={7}>Class 7</option>
                  <option value={8}>Class 8</option>
                  <option value={9}>Class 9</option>
                  <option value={10}>Class 10</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Subject</label>
                <select
                  value={quizSubject}
                  onChange={(e) => setQuizSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Topic Title</label>
                <input
                  type="text"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateAiQuiz}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>✨ Synthesize AI Test</span>
            </button>

            {generatedQuiz && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-3 animate-fadeIn">
                <h5 className="text-xs font-black text-amber-300">{generatedQuiz.title}</h5>
                <div className="space-y-2 text-xs">
                  {generatedQuiz.questions.map((q, i) => (
                    <div key={i} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                      <strong className="text-white">Q{i + 1}. {q.q}</strong>
                      <p className="text-slate-400 text-[11px]">Options: {q.options.join(' | ')}</p>
                      <span className="text-[10px] text-emerald-400 font-bold block">
                        Correct: Option {q.correct + 1} ({q.options[q.correct]})
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleBroadcastQuiz}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  <span>🚀 Broadcast Quiz to Enrolled Students</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Students Roster & Live Doubts Stream (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Students & Mic Audio Control (Real Database Students) */}
          <div className="bg-[#0c1427]/90 border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700/60">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-heading text-base font-black text-white">Registered Batch Students</h4>
                </div>
                <p className="text-xs text-slate-400">Total Enrolled: <strong className="text-emerald-400">{students.length}</strong></p>
              </div>
              {students.length > 0 && (
                <button
                  onClick={muteAll}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1"
                >
                  <MicOff className="w-3 h-3 text-rose-400" />
                  <span>Mute All</span>
                </button>
              )}
            </div>

            {students.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs bg-slate-950/60 rounded-2xl border border-slate-800 p-4">
                No students registered yet. Real students will appear here as soon as they sign up on the portal!
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {students.map((s) => {
                  const isMuted = mutedStudents[s.roll] || false;
                  return (
                    <div
                      key={s.roll}
                      className="flex justify-between items-center text-xs p-2.5 bg-slate-900/80 rounded-xl border border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span>👤</span>
                        <div>
                          <strong className="text-white block">{s.name}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">Class {s.grade} &bull; {s.roll}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleMute(s.roll)}
                        className="text-xs p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <MicOff className="w-3 h-3 text-rose-400" /> : <Mic className="w-3 h-3 text-emerald-400" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Real-time Doubts & Queries Feed */}
          <div className="bg-[#0c1427]/90 border border-sky-500/20 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <h4 className="font-heading text-base font-black text-sky-400">Student Live Doubts Feed</h4>
              </div>
              <span className="text-xs text-slate-400 font-mono">Real-time</span>
            </div>

            <div className="h-44 overflow-y-auto text-xs space-y-2 p-3 bg-slate-950 rounded-2xl border border-slate-800">
              {doubts.length === 0 ? (
                <div className="text-slate-500 text-center py-6">No doubts asked yet in this session.</div>
              ) : (
                doubts.map((d) => (
                  <div key={d.id} className="leading-relaxed">
                    <span
                      className={`font-bold ${
                        d.role === 'teacher' ? 'text-amber-400 font-heading' : 'text-sky-300'
                      }`}
                    >
                      {d.sender}:
                    </span>{' '}
                    <span className="text-slate-200">{d.text}</span>
                    <span className="text-[10px] text-slate-500 block font-mono">{d.time}</span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleReplySubmit} className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Reply to class..."
                className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-1.5 rounded-xl shadow-md flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Reply</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
