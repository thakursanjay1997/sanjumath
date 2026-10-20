import React, { useState, useMemo } from 'react';
import {
  StudentRecord,
  StudentProgress,
  LectureRecording,
  Quiz
} from '../types';
import {
  detailedCurriculum,
  matchRecordingToChapter,
  matchQuizToChapter,
  ChapterDetail
} from '../data/curriculumData';
import {
  Award,
  CheckCircle2,
  Circle,
  Video,
  FileText,
  Search,
  Printer,
  Sparkles,
  BookOpen,
  TrendingUp,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  PlayCircle,
  GraduationCap,
  X,
  Target
} from 'lucide-react';

interface CourseProgressTrackerProps {
  student: StudentRecord;
  studentProgress: StudentProgress;
  recordings: LectureRecording[];
  quizzes: Quiz[];
  onViewRecording: (rec: LectureRecording) => void;
  onTakeQuiz: (quiz: Quiz) => void;
  onToggleTopic: (topicId: string, chapterId?: string) => void;
  onMarkRecordingViewed: (recId: string) => void;
  onMarkChapterMastered: (chapter: ChapterDetail) => void;
  onShowToast: (msg: string) => void;
}

export const CourseProgressTracker: React.FC<CourseProgressTrackerProps> = ({
  student,
  studentProgress,
  recordings,
  quizzes,
  onViewRecording,
  onTakeQuiz,
  onToggleTopic,
  onMarkRecordingViewed,
  onMarkChapterMastered,
  onShowToast
}) => {
  // Filters & State
  const [subjectFilter, setSubjectFilter] = useState<'ALL' | 'Mathematics' | 'Physics'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  // Curriculum for student's current grade (fallback to Class 10 if not present)
  const chapters: ChapterDetail[] = useMemo(() => {
    return detailedCurriculum[student.grade] || detailedCurriculum[10] || [];
  }, [student.grade]);

  // Compute metrics per chapter
  const chaptersWithProgress = useMemo(() => {
    return chapters.map((chapter) => {
      // Find associated recordings for this chapter
      const chapterRecs = recordings.filter(
        (r) => r.grade === student.grade && r.subject === chapter.subject && matchRecordingToChapter(r.title, [chapter])
      );
      // Find associated quizzes for this chapter
      const chapterQuizzes = quizzes.filter(
        (q) => q.grade === student.grade && q.subject === chapter.subject && matchQuizToChapter(q.title, [chapter])
      );

      const totalTopics = chapter.topics.length;
      const completedTopicsCount = chapter.topics.filter((t) =>
        studentProgress.completedTopics.includes(t.id)
      ).length;

      const viewedRecsCount = chapterRecs.filter((r) =>
        studentProgress.viewedRecordingIds.includes(r.id)
      ).length;

      const passedQuizzesCount = chapterQuizzes.filter((q) => {
        const res = studentProgress.quizResults[q.id];
        return res && res.percentage >= 50;
      }).length;

      const isExplicitlyMastered = studentProgress.completedChapters.includes(chapter.id);

      // Weighted calculation:
      // If chapter has topics, recordings, quizzes:
      // Weight: topics (40%), recordings (30%), quizzes (30%)
      let percentage = 0;
      if (isExplicitlyMastered) {
        percentage = 100;
      } else {
        const parts: number[] = [];
        if (totalTopics > 0) {
          parts.push(completedTopicsCount / totalTopics);
        }
        if (chapterRecs.length > 0) {
          parts.push(viewedRecsCount / chapterRecs.length);
        }
        if (chapterQuizzes.length > 0) {
          parts.push(passedQuizzesCount / chapterQuizzes.length);
        }

        if (parts.length > 0) {
          const sum = parts.reduce((a, b) => a + b, 0);
          percentage = Math.round((sum / parts.length) * 100);
        }
      }

      let status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' = 'NOT_STARTED';
      if (percentage === 100) {
        status = 'COMPLETED';
      } else if (percentage > 0) {
        status = 'IN_PROGRESS';
      }

      return {
        ...chapter,
        chapterRecs,
        chapterQuizzes,
        totalTopics,
        completedTopicsCount,
        viewedRecsCount,
        passedQuizzesCount,
        percentage,
        status,
        isExplicitlyMastered
      };
    });
  }, [chapters, recordings, quizzes, student.grade, studentProgress]);

  // Overall Statistics
  const overallStats = useMemo(() => {
    const totalChapters = chaptersWithProgress.length;
    const completedChapters = chaptersWithProgress.filter((c) => c.status === 'COMPLETED').length;
    const inProgressChapters = chaptersWithProgress.filter((c) => c.status === 'IN_PROGRESS').length;

    const mathChapters = chaptersWithProgress.filter((c) => c.subject === 'Mathematics');
    const physChapters = chaptersWithProgress.filter((c) => c.subject === 'Physics');

    const mathAvgPct =
      mathChapters.length > 0
        ? Math.round(mathChapters.reduce((acc, c) => acc + c.percentage, 0) / mathChapters.length)
        : 0;

    const physAvgPct =
      physChapters.length > 0
        ? Math.round(physChapters.reduce((acc, c) => acc + c.percentage, 0) / physChapters.length)
        : 0;

    const totalPct =
      totalChapters > 0
        ? Math.round(chaptersWithProgress.reduce((acc, c) => acc + c.percentage, 0) / totalChapters)
        : 0;

    const totalTopicsMastered = studentProgress.completedTopics.length;
    const totalRecordingsWatched = studentProgress.viewedRecordingIds.length;
    const totalQuizzesPassed = Object.values(studentProgress.quizResults).filter((q) => q.percentage >= 50).length;

    // Board Readiness Projection
    let readinessText = 'Foundation Stage • Starting Syllabus';
    let readinessScore = '70-75%';
    let readinessColor = 'text-sky-400';

    if (totalPct >= 85) {
      readinessText = 'CBSE Topper League • On Track for 95-100% Merit';
      readinessScore = '95%+';
      readinessColor = 'text-emerald-400';
    } else if (totalPct >= 60) {
      readinessText = 'Distinction Level • On Track for 85-94%';
      readinessScore = '88%';
      readinessColor = 'text-amber-300';
    } else if (totalPct >= 30) {
      readinessText = 'Intermediate Mastery • On Track for 75-84%';
      readinessScore = '78%';
      readinessColor = 'text-sky-300';
    }

    return {
      totalChapters,
      completedChapters,
      inProgressChapters,
      totalPct,
      mathAvgPct,
      physAvgPct,
      totalTopicsMastered,
      totalRecordingsWatched,
      totalQuizzesPassed,
      readinessText,
      readinessScore,
      readinessColor
    };
  }, [chaptersWithProgress, studentProgress]);

  // Filtered chapters list
  const filteredChapters = useMemo(() => {
    return chaptersWithProgress.filter((ch) => {
      if (subjectFilter !== 'ALL' && ch.subject !== subjectFilter) return false;
      if (statusFilter !== 'ALL' && ch.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = ch.name.toLowerCase().includes(q);
        const matchesTopic = ch.topics.some((t) => t.name.toLowerCase().includes(q));
        const matchesFormula = (ch.keyFormulas || []).some((f) => f.toLowerCase().includes(q));
        if (!matchesName && !matchesTopic && !matchesFormula) return false;
      }
      return true;
    });
  }, [chaptersWithProgress, subjectFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Main Course Completion HUD Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0c1427]/95 via-[#101b38]/95 to-[#080d1d]/95 border-2 border-amber-400/30 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur-xl">
        {/* Glow ambient accent */}
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap justify-between items-start gap-6 pb-6 border-b border-slate-700/60">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-sky-500/20 border border-amber-400/40 text-amber-300 text-xs font-black px-3.5 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>DYNAMIC NCERT SYLLABUS TRACKER</span>
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl font-black text-white flex items-center gap-2 flex-wrap">
              <span>CBSE Class {student.grade} Course Completion Progress</span>
              <span className="text-sm font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-0.5 rounded-xl">
                Batch 2026–27
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time mastery metric dynamically computed from your watched whiteboard lectures, evaluated diagnostic test drills, and NCERT self-study topic checklists.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCertificateModalOpen(true)}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-400/20 flex items-center gap-2 transition-transform hover:-translate-y-0.5"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>📜 Course Certificate</span>
            </button>
          </div>
        </div>

        {/* Big Metrics Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Metric 1: Overall Progress Ring / Bar */}
          <div className="bg-slate-900/80 border border-amber-500/25 rounded-2xl p-4 flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="#1e293b"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="url(#progressGrad)"
                  strokeWidth="6"
                  strokeDasharray={163.36}
                  strokeDashoffset={163.36 - (163.36 * overallStats.totalPct) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute font-heading font-black text-sm text-white">
                {overallStats.totalPct}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                OVERALL SYLLABUS
              </span>
              <strong className="text-white text-base font-black font-heading block">
                {overallStats.completedChapters} / {overallStats.totalChapters} Chapters
              </strong>
              <span className="text-[11px] text-amber-300 font-medium">
                {overallStats.inProgressChapters} in active progress
              </span>
            </div>
          </div>

          {/* Metric 2: Subject Breakdown */}
          <div className="bg-slate-900/80 border border-sky-500/25 rounded-2xl p-4 space-y-2 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">SUBJECT SPLIT</span>
              <span className="text-sky-300 font-mono text-[11px]">Class {student.grade}</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-0.5">
                  <span className="text-amber-300">📐 Pure Mathematics</span>
                  <span className="text-white font-mono">{overallStats.mathAvgPct}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${overallStats.mathAvgPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold mb-0.5">
                  <span className="text-sky-300">⚡ Applied Physics</span>
                  <span className="text-white font-mono">{overallStats.physAvgPct}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${overallStats.physAvgPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Metric 3: Activity Breakdown */}
          <div className="bg-slate-900/80 border border-purple-500/25 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              STUDY ACTIVITY LOGGED
            </span>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
                <span className="text-base font-black text-sky-400 font-mono block">
                  {overallStats.totalRecordingsWatched}
                </span>
                <span className="text-[9px] text-slate-400">Lectures</span>
              </div>
              <div className="bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
                <span className="text-base font-black text-emerald-400 font-mono block">
                  {overallStats.totalQuizzesPassed}
                </span>
                <span className="text-[9px] text-slate-400">Quizzes</span>
              </div>
              <div className="bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
                <span className="text-base font-black text-amber-400 font-mono block">
                  {overallStats.totalTopicsMastered}
                </span>
                <span className="text-[9px] text-slate-400">Topics</span>
              </div>
            </div>
          </div>

          {/* Metric 4: Board Exam Readiness */}
          <div className="bg-slate-900/80 border border-emerald-500/25 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                CBSE BOARD PROJECTION
              </span>
              <span className={`text-base font-black font-mono ${overallStats.readinessColor}`}>
                {overallStats.readinessScore}
              </span>
            </div>
            <p className="text-xs text-white font-bold leading-snug mt-1">
              {overallStats.readinessText}
            </p>
            <span className="text-[10px] text-slate-400 mt-1">
              Based on NCERT exemplars & tests with Bhimsingh Sir.
            </span>
          </div>
        </div>

        {/* Milestone Badges Strip */}
        <div className="relative z-10 mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Milestone Badges:</span>
          </span>

          <span
            className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 font-bold ${
              overallStats.totalRecordingsWatched > 0
                ? 'bg-sky-500/15 border-sky-400/50 text-sky-300'
                : 'bg-slate-950 border-slate-800 text-slate-600'
            }`}
          >
            <span>🎥</span>
            <span>First Lecture Watched</span>
          </span>

          <span
            className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 font-bold ${
              overallStats.totalQuizzesPassed > 0
                ? 'bg-amber-500/15 border-amber-400/50 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-600'
            }`}
          >
            <span>📝</span>
            <span>Diagnostic Breaker</span>
          </span>

          <span
            className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 font-bold ${
              overallStats.completedChapters > 0
                ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-600'
            }`}
          >
            <span>🏆</span>
            <span>Chapter Champion</span>
          </span>

          <span
            className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 font-bold ${
              overallStats.totalPct >= 50
                ? 'bg-purple-500/15 border-purple-400/50 text-purple-300'
                : 'bg-slate-950 border-slate-800 text-slate-600'
            }`}
          >
            <span>🌟</span>
            <span>50% Halfway Hero</span>
          </span>

          <span
            className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 font-bold ${
              overallStats.totalPct === 100
                ? 'bg-rose-500/15 border-rose-400/50 text-rose-300'
                : 'bg-slate-950 border-slate-800 text-slate-600'
            }`}
          >
            <span>👑</span>
            <span>CBSE Board Sovereign</span>
          </span>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="bg-[#0c1427]/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        {/* Subject Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-1">Subject:</span>
          <button
            onClick={() => setSubjectFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subjectFilter === 'ALL'
                ? 'bg-white/20 text-white border border-white/30'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            All Subjects ({chaptersWithProgress.length})
          </button>
          <button
            onClick={() => setSubjectFilter('Mathematics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subjectFilter === 'Mathematics'
                ? 'bg-amber-400 text-slate-950 font-black'
                : 'bg-white/5 text-amber-300/80 hover:text-amber-300'
            }`}
          >
            📐 Mathematics ({chaptersWithProgress.filter((c) => c.subject === 'Mathematics').length})
          </button>
          <button
            onClick={() => setSubjectFilter('Physics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subjectFilter === 'Physics'
                ? 'bg-sky-400 text-slate-950 font-black'
                : 'bg-white/5 text-sky-300/80 hover:text-sky-300'
            }`}
          >
            ⚡ Physics ({chaptersWithProgress.filter((c) => c.subject === 'Physics').length})
          </button>
        </div>

        {/* Status & Search Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">✓ Completed</option>
              <option value="IN_PROGRESS">⚡ In Progress</option>
              <option value="NOT_STARTED">⏳ Not Started</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapter, theorem..."
              className="bg-slate-950 border border-slate-700 text-white rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-amber-400 w-44 sm:w-56"
            >
            </input>
          </div>
        </div>
      </div>

      {/* 3. Detailed Chapters Breakdown Cards */}
      <div className="space-y-4">
        {filteredChapters.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-2">
            <p className="text-slate-400 text-sm">No chapters match your selected filters.</p>
            <button
              onClick={() => {
                setSubjectFilter('ALL');
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-amber-400 underline font-bold"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredChapters.map((chapter) => {
            const isExpanded = expandedChapterId === chapter.id;
            return (
              <div
                key={chapter.id}
                className={`bg-[#0c1427]/90 rounded-2xl border transition-all ${
                  chapter.status === 'COMPLETED'
                    ? 'border-emerald-500/40 hover:border-emerald-500/60'
                    : chapter.status === 'IN_PROGRESS'
                    ? 'border-amber-500/40 hover:border-amber-500/60'
                    : 'border-slate-800 hover:border-slate-700'
                } p-5 space-y-4 shadow-xl`}
              >
                {/* Chapter Header Row */}
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          chapter.subject === 'Mathematics'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
                        }`}
                      >
                        {chapter.subject === 'Mathematics' ? '📐 Pure Math' : '⚡ Applied Physics'} &bull; Ch {chapter.chapterNumber}
                      </span>

                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded font-mono">
                        Weightage: {chapter.boardWeightage}
                      </span>

                      {chapter.status === 'COMPLETED' ? (
                        <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>100% Mastered</span>
                        </span>
                      ) : chapter.status === 'IN_PROGRESS' ? (
                        <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <span>In Progress ({chapter.percentage}%)</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full">
                          Not Started
                        </span>
                      )}
                    </div>

                    <h4 className="font-heading text-lg font-black text-white">{chapter.name}</h4>
                  </div>

                  {/* Actions & Progress Summary */}
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-black font-mono text-white block">
                        {chapter.percentage}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {chapter.completedTopicsCount}/{chapter.totalTopics} Topics Done
                      </span>
                    </div>

                    {/* Quick Chapter Toggle */}
                    <button
                      onClick={() => onMarkChapterMastered(chapter)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
                        chapter.status === 'COMPLETED'
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:border-amber-400'
                      }`}
                      title={chapter.status === 'COMPLETED' ? 'Mark for review' : 'Quick mark all topics as completed'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{chapter.status === 'COMPLETED' ? 'Mastered' : 'Mark Complete'}</span>
                    </button>

                    {/* Expand/Collapse Checklist */}
                    <button
                      onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                      className="bg-white/5 hover:bg-white/10 text-slate-300 p-2 rounded-xl border border-white/10"
                      title={isExpanded ? 'Collapse' : 'Expand Topics & Quizzes'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Chapter Progress Bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        chapter.percentage === 100
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : chapter.percentage > 0
                          ? 'bg-gradient-to-r from-sky-500 via-amber-400 to-emerald-400'
                          : 'bg-slate-800'
                      }`}
                      style={{ width: `${chapter.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Always-Visible Quick Stats Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  {/* Lecture Tag */}
                  {chapter.chapterRecs.length > 0 ? (
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                        chapter.viewedRecsCount === chapter.chapterRecs.length
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-sky-300'
                      }`}
                    >
                      <Video className="w-3 h-3" />
                      <span>
                        {chapter.viewedRecsCount}/{chapter.chapterRecs.length} Lectures Watched
                      </span>
                    </span>
                  ) : (
                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/60 text-slate-500 border border-slate-800">
                      Live batch lectures scheduled soon
                    </span>
                  )}

                  {/* Quiz Tag */}
                  {chapter.chapterQuizzes.length > 0 ? (
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                        chapter.passedQuizzesCount === chapter.chapterQuizzes.length
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-amber-300'
                      }`}
                    >
                      <Award className="w-3 h-3" />
                      <span>
                        {chapter.passedQuizzesCount}/{chapter.chapterQuizzes.length} Quizzes Cleared
                      </span>
                    </span>
                  ) : (
                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/60 text-slate-500 border border-slate-800">
                      Practice quiz published weekly
                    </span>
                  )}

                  {/* Key Formulas Pill */}
                  {chapter.keyFormulas && chapter.keyFormulas.length > 0 && (
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-950/90 border border-slate-800 px-2.5 py-1 rounded-lg ml-auto hidden md:inline-block">
                      Core: {chapter.keyFormulas[0]}
                    </span>
                  )}
                </div>

                {/* Collapsible Expanded Details (Checklist, Recordings, Quizzes) */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-800/80 space-y-4 animate-fadeIn">
                    {/* 1. Topics Checklist */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        NCERT Core Topics & Derivation Checklist:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {chapter.topics.map((topic) => {
                          const isTopicDone = studentProgress.completedTopics.includes(topic.id);
                          return (
                            <div
                              key={topic.id}
                              onClick={() => onToggleTopic(topic.id, chapter.id)}
                              className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-colors ${
                                isTopicDone
                                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              {isTopicDone ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-500 shrink-0" />
                              )}
                              <span className="text-xs font-medium select-none">{topic.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Direct Lecture Recordings Integration */}
                    {chapter.chapterRecs.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                          Whiteboard Lecture Recordings for this Chapter:
                        </span>
                        <div className="space-y-2">
                          {chapter.chapterRecs.map((rec) => {
                            const isWatched = studentProgress.viewedRecordingIds.includes(rec.id);
                            return (
                              <div
                                key={rec.id}
                                className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-3"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                        isWatched
                                          ? 'bg-emerald-500/20 text-emerald-300'
                                          : 'bg-amber-500/20 text-amber-300'
                                      }`}
                                    >
                                      {isWatched ? '✓ Watched' : '⏳ Pending'}
                                    </span>
                                    <span className="text-[10px] text-slate-400">{rec.duration}</span>
                                  </div>
                                  <p className="text-xs font-bold text-white">{rec.title}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => onMarkRecordingViewed(rec.id)}
                                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-bold flex items-center gap-1 ${
                                      isWatched
                                        ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300'
                                        : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                                    }`}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{isWatched ? 'Watched' : 'Mark Watched'}</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      onMarkRecordingViewed(rec.id);
                                      onViewRecording(rec);
                                    }}
                                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                                  >
                                    <PlayCircle className="w-3.5 h-3.5" />
                                    <span>Watch / Replay</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 3. Direct Quizzes Integration */}
                    {chapter.chapterQuizzes.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                          Diagnostic Chapter Quizzes:
                        </span>
                        <div className="space-y-2">
                          {chapter.chapterQuizzes.map((quiz) => {
                            const res = studentProgress.quizResults[quiz.id];
                            return (
                              <div
                                key={quiz.id}
                                className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-3"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    {res ? (
                                      <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                          res.passed
                                            ? 'bg-emerald-500/20 text-emerald-300'
                                            : 'bg-rose-500/20 text-rose-300'
                                        }`}
                                      >
                                        Score: {res.score}/{res.total} ({res.percentage}%)
                                      </span>
                                    ) : (
                                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                                        Not attempted yet
                                      </span>
                                    )}
                                    <span className="text-[10px] text-slate-400">
                                      {quiz.questions.length} Diagnostic Questions
                                    </span>
                                  </div>
                                  <p className="text-xs font-bold text-white">{quiz.title}</p>
                                </div>

                                <button
                                  onClick={() => onTakeQuiz(quiz)}
                                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                  <span>{res ? 'Retake Test' : 'Take Test Drill'}</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 4. NCERT Formulas Summary */}
                    {chapter.keyFormulas && chapter.keyFormulas.length > 0 && (
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                          NCERT Theorem Formulas to Memorize:
                        </span>
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          {chapter.keyFormulas.map((f, fIdx) => (
                            <span
                              key={fIdx}
                              className="text-xs font-mono text-amber-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 font-bold"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Certificate Modal */}
      {isCertificateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className="bg-gradient-to-br from-[#0c1427] to-[#121c38] border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 relative">
            <button
              onClick={() => setIsCertificateModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Certificate Frame */}
            <div
              id="printableCertificate"
              className="bg-[#050914] border-4 border-amber-400/80 rounded-2xl p-6 sm:p-8 text-center space-y-5 relative overflow-hidden shadow-inner"
            >
              {/* Corner Accents */}
              <div className="absolute top-2 left-2 text-amber-400 text-lg font-serif">⚜</div>
              <div className="absolute top-2 right-2 text-amber-400 text-lg font-serif">⚜</div>
              <div className="absolute bottom-2 left-2 text-amber-400 text-lg font-serif">⚜</div>
              <div className="absolute bottom-2 right-2 text-amber-400 text-lg font-serif">⚜</div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase block font-bold">
                  SANJU MATH ACADEMY &bull; CBSE PREMIER COHORTS
                </span>
                <h3 className="font-heading text-2xl sm:text-3xl font-black text-white">
                  CERTIFICATE OF ACADEMIC PROGRESS
                </h3>
                <p className="text-xs text-slate-400">NCERT Curriculum Mastery & Continuous Diagnostic Evaluation</p>
              </div>

              <div className="py-2">
                <p className="text-xs text-slate-400">This certifies that verified student</p>
                <h4 className="font-heading text-2xl font-black text-amber-300 mt-1">
                  {student.name}
                </h4>
                <p className="text-xs font-mono text-slate-300 mt-0.5">
                  Roll ID: <strong className="text-white">{student.roll}</strong> &bull; Class {student.grade} Batch
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">SYLLABUS PROGRESS</span>
                  <strong className="text-base font-black text-amber-400 font-mono">
                    {overallStats.totalPct}%
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">CHAPTERS MASTERED</span>
                  <strong className="text-base font-black text-emerald-400 font-mono">
                    {overallStats.completedChapters} / {overallStats.totalChapters}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">BOARD READINESS</span>
                  <strong className="text-base font-black text-sky-400 font-mono">
                    {overallStats.readinessScore}
                  </strong>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-end border-t border-slate-800 text-left">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Date: {new Date().toLocaleDateString()}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold block">
                    ✓ Verified Digital Directorate Record
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-serif italic text-amber-300 text-sm block font-bold">
                    Bhimsingh Thakur
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Bhimsingh Thakur (M.Sc.) &bull; Director
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-400">
                Official progress verified by Sanju Math Academy Directorate.
              </span>
              <button
                onClick={() => {
                  window.print();
                  onShowToast('Preparing certificate document for print/PDF save...');
                }}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-slate-950" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
