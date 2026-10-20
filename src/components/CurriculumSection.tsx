import React, { useState } from 'react';
import { BookOpen, CheckCircle, ChevronRight, Layers } from 'lucide-react';
import { cbseSyllabusData } from '../data/curriculumData';

export const CurriculumSection: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<number>(10);

  const currentData = cbseSyllabusData[selectedGrade];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-[#0c1427]/90 border border-amber-500/30 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-4 border-b border-slate-700/60">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-400 text-amber-300 text-xs font-black px-3.5 py-1 rounded-full mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>OFFICIAL NCERT CURRICULUM</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-white">
              Official CBSE NCERT Syllabus (Classes 6 to 10)
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Verified chapter coverage directly matching the National Curriculum Framework for 2026–27.
            </p>
          </div>

          {/* Grade Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {[6, 7, 8, 9, 10].map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  selectedGrade === grade
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                Class {grade}
              </button>
            ))}
          </div>
        </div>

        {/* Math & Physics 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Mathematics Column */}
          <div className="bg-amber-500/5 border-2 border-amber-400/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-amber-500/20">
              <h3 className="font-heading text-lg font-black text-amber-400">
                Class {selectedGrade}: Pure Mathematics (NCERT)
              </h3>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2.5 py-1 rounded-full font-black border border-amber-400/30">
                PURE MATH
              </span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-200">
              {currentData.math.map((chapter, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 p-2 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-colors"
                >
                  <span className="font-mono text-amber-400 font-bold shrink-0">
                    Ch {idx + 1}:
                  </span>
                  <strong className="text-white font-medium">{chapter}</strong>
                </li>
              ))}
            </ul>
          </div>

          {/* Applied Physics Column */}
          <div className="bg-sky-500/5 border-2 border-sky-400/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-sky-500/20">
              <h3 className="font-heading text-lg font-black text-sky-400">
                Class {selectedGrade}: Applied Physics / Science (NCERT)
              </h3>
              <span className="text-[10px] bg-sky-400/20 text-sky-300 px-2.5 py-1 rounded-full font-black border border-sky-400/30">
                APPLIED PHYSICS
              </span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-200">
              {currentData.physics.map((unit, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 p-2 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-sky-500/40 transition-colors"
                >
                  <span className="font-mono text-sky-400 font-bold shrink-0">
                    Unit {idx + 1}:
                  </span>
                  <strong className="text-white font-medium">{unit}</strong>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};
