import React, { useState } from 'react';
import { Sparkles, Award, BookOpen, CheckCircle, ArrowRight, Zap, Calculator, Activity, HelpCircle } from 'lucide-react';

interface HomeSectionProps {
  onExploreCourses: () => void;
  onExploreCurriculum: () => void;
  onOpenCounseling: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  onExploreCourses,
  onExploreCurriculum,
  onOpenCounseling
}) => {
  // Sandbox State
  const [sandboxTab, setSandboxTab] = useState<'math' | 'physics'>('math');

  // Math Quadratic Sandbox
  const [coeffA, setCoeffA] = useState<number>(1);
  const [coeffB, setCoeffB] = useState<number>(-5);
  const [coeffC, setCoeffC] = useState<number>(6);

  // Physics Ohm's Sandbox
  const [voltage, setVoltage] = useState<number>(12);
  const [resistance, setResistance] = useState<number>(6);

  // Math calculations
  const discriminant = coeffB * coeffB - 4 * coeffA * coeffC;
  let rootsNature = '';
  let root1 = '';
  let root2 = '';

  if (discriminant > 0) {
    rootsNature = 'Two Real & Distinct Roots (D > 0)';
    const r1 = (-coeffB + Math.sqrt(discriminant)) / (2 * coeffA);
    const r2 = (-coeffB - Math.sqrt(discriminant)) / (2 * coeffA);
    root1 = `Root α = ${r1.toFixed(2)}`;
    root2 = `Root β = ${r2.toFixed(2)}`;
  } else if (discriminant === 0) {
    rootsNature = 'Two Real & Equal Roots (D = 0)';
    const r = -coeffB / (2 * coeffA);
    root1 = `Root α = ${r.toFixed(2)}`;
    root2 = `Root β = ${r.toFixed(2)} (Coincident)`;
  } else {
    rootsNature = 'No Real Roots (D < 0, Complex / Imaginary)';
    const realPart = (-coeffB / (2 * coeffA)).toFixed(2);
    const imagPart = (Math.sqrt(Math.abs(discriminant)) / (2 * coeffA)).toFixed(2);
    root1 = `Root α = ${realPart} + ${imagPart}i`;
    root2 = `Root β = ${realPart} - ${imagPart}i`;
  }

  // Physics calculations
  const currentVal = resistance > 0 ? voltage / resistance : 0;
  const powerVal = voltage * currentVal;
  const flowPct = Math.min(100, Math.max(10, Math.round((currentVal / 10) * 100)));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Hero Showcase Card */}
      <div className="relative rounded-3xl p-8 lg:p-12 overflow-hidden border border-amber-500/30 bg-gradient-to-br from-[#0c1427]/95 via-[#131d38]/90 to-[#090e1e]/95 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-400 text-amber-300 text-xs font-black px-4 py-1.5 rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PREMIER CBSE ACADEMY FOR CLASSES 6 TO 10</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
              Conceptual Mastery in <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-300 via-sky-300 to-rose-400 bg-clip-text text-transparent">
                Pure Mathematics & Physics
              </span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Mentored directly by <strong className="text-white">Bhimsingh Thakur (M.Sc. Mathematics)</strong>. Eliminating rote memorization through step-by-step smartboard visual derivations, rigorous NCERT textbook mastery, and real-time conceptual dialogue.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={onExploreCourses}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-amber-500/25 flex items-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <span>Explore Batches & Enroll</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreCurriculum}
                className="bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-sky-600/25 flex items-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>View CBSE Syllabus (6-10)</span>
              </button>

              <button
                onClick={onOpenCounseling}
                className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-sm px-5 py-3.5 rounded-2xl transition-all"
              >
                💬 Inquire for Batch Admission
              </button>
            </div>
          </div>

          {/* Faculty Crest */}
          <div className="lg:col-span-4 bg-white/5 border-2 border-amber-500/30 rounded-3xl p-6 text-center shadow-xl backdrop-blur-md space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-900 to-emerald-900 border-4 border-amber-400 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/20">
              👨‍🏫
            </div>
            <div>
              <h3 className="font-heading text-xl font-black text-white">Bhimsingh Thakur</h3>
              <p className="text-amber-400 font-extrabold text-sm">M.Sc. in Mathematics</p>
              <p className="text-slate-400 text-xs mt-0.5">Founder & Lead Faculty, SANJU MATH</p>
            </div>
            <div className="text-xs text-slate-300 italic bg-black/40 p-3.5 rounded-xl border-l-4 border-amber-400 text-left leading-relaxed">
              "Mathematics is the poetry of pure logic. When visual geometry and algebraic structure align, every student succeeds."
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Academic Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0c1427]/80 border-t-4 border-amber-400 border border-white/5 rounded-2xl p-5 text-center shadow-lg">
          <span className="text-[11px] text-slate-400 font-black tracking-wider block">TOTAL STUDENTS MENTORED</span>
          <p className="font-heading text-3xl font-black text-white mt-1">850+</p>
          <span className="text-xs text-amber-400 font-semibold">CBSE Classes 6 to 10</span>
        </div>
        <div className="bg-[#0c1427]/80 border-t-4 border-sky-400 border border-white/5 rounded-2xl p-5 text-center shadow-lg">
          <span className="text-[11px] text-slate-400 font-black tracking-wider block">TOP BOARD SCORE RECORD</span>
          <p className="font-heading text-3xl font-black text-sky-400 mt-1">98.4%</p>
          <span className="text-xs text-sky-300 font-semibold">Class 10 CBSE Boards</span>
        </div>
        <div className="bg-[#0c1427]/80 border-t-4 border-emerald-400 border border-white/5 rounded-2xl p-5 text-center shadow-lg">
          <span className="text-[11px] text-slate-400 font-black tracking-wider block">NCERT CHAPTER COVERAGE</span>
          <p className="font-heading text-3xl font-black text-emerald-400 mt-1">100%</p>
          <span className="text-xs text-emerald-300 font-semibold">All Theorems & Exemplars</span>
        </div>
        <div className="bg-[#0c1427]/80 border-t-4 border-rose-400 border border-white/5 rounded-2xl p-5 text-center shadow-lg">
          <span className="text-[11px] text-slate-400 font-black tracking-wider block">PARENT SATISFACTION</span>
          <p className="font-heading text-3xl font-black text-rose-400 mt-1">4.9 / 5</p>
          <span className="text-xs text-rose-300 font-semibold">Consistent Positive Reviews</span>
        </div>
      </div>

      {/* 3. Interactive Experimental Concept Sandbox */}
      <div className="rounded-3xl p-6 sm:p-8 border-2 border-sky-500/30 bg-gradient-to-br from-[#080f1e]/95 to-[#131b34]/90 shadow-2xl space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-slate-700/60">
          <div>
            <div className="inline-flex items-center gap-2 bg-sky-500/15 text-sky-300 border border-sky-500/30 text-xs font-black px-3 py-1 rounded-full">
              <Zap className="w-3.5 h-3.5" />
              <span>🧪 INTERACTIVE EXPERIMENTAL SANDBOX</span>
            </div>
            <h3 className="font-heading text-2xl font-black text-white mt-2">
              Try Bhimsingh Sir's Visual Concept Teaching
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Test pure mathematical derivations and applied physics formulas in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSandboxTab('math')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                sandboxTab === 'math'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                  : 'bg-slate-900 text-slate-300 border border-slate-700'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>📐 Quadratic Roots Visualizer</span>
            </button>
            <button
              onClick={() => setSandboxTab('physics')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                sandboxTab === 'physics'
                  ? 'bg-sky-400 text-slate-950 shadow-md shadow-sky-400/30'
                  : 'bg-slate-900 text-slate-300 border border-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>⚡ Ohm's Law Simulator</span>
            </button>
          </div>
        </div>

        {/* Math Quadratic Simulator */}
        {sandboxTab === 'math' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6 space-y-4">
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-amber-400 font-bold block mb-1">Standard Quadratic Equation:</span>
                <p className="font-mono text-lg font-black text-white">
                  {coeffA}x² {coeffB >= 0 ? `+ ${coeffB}` : `- ${Math.abs(coeffB)}`}x {coeffC >= 0 ? `+ ${coeffC}` : `- ${Math.abs(coeffC)}`} = 0
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Coefficient a:</span>
                  <span className="text-amber-400 font-mono font-black">{coeffA}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={coeffA}
                  onChange={(e) => setCoeffA(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Coefficient b:</span>
                  <span className="text-sky-400 font-mono font-black">{coeffB}</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="1"
                  value={coeffB}
                  onChange={(e) => setCoeffB(parseInt(e.target.value, 10))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Constant c:</span>
                  <span className="text-emerald-400 font-mono font-black">{coeffC}</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="1"
                  value={coeffC}
                  onChange={(e) => setCoeffC(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="md:col-span-6 p-5 bg-slate-950/90 rounded-2xl border border-slate-800 flex flex-col justify-center space-y-3.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400 font-bold">DISCRIMINANT (D = b² - 4ac):</span>
                <strong className="text-amber-400 font-mono text-lg font-black">{discriminant}</strong>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400 font-bold">NATURE OF ROOTS:</span>
                <span className={`font-black ${discriminant >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {rootsNature}
                </span>
              </div>
              <div className="p-3.5 bg-slate-900 rounded-xl border border-amber-500/20 text-xs space-y-1 font-mono">
                <span className="text-slate-400 font-sans font-bold block mb-1">Calculated Roots (NCERT Formula):</span>
                <p className="text-sky-300 font-black">{root1}</p>
                <p className="text-sky-300 font-black">{root2}</p>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                "Understanding the discriminant graphically avoids rote calculation errors in CBSE board exams."
              </p>
            </div>
          </div>
        )}

        {/* Physics Ohm's Law Simulator */}
        {sandboxTab === 'physics' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6 space-y-4">
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-sky-400 font-bold block mb-1">Ohm's Law Relationship:</span>
                <p className="font-mono text-base font-black text-white">V = I &times; R &harr; I = V / R</p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Applied Potential Difference (V):</span>
                  <span className="text-amber-400 font-mono font-black">{voltage} Volts</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={voltage}
                  onChange={(e) => setVoltage(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Conductor Resistance (R):</span>
                  <span className="text-sky-400 font-mono font-black">{resistance} Ohms (Ω)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={resistance}
                  onChange={(e) => setResistance(parseFloat(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="md:col-span-6 p-5 bg-slate-950/90 rounded-2xl border border-slate-800 flex flex-col justify-center space-y-3.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400 font-bold">RESULTING CURRENT (I):</span>
                <strong className="text-emerald-400 font-mono text-xl font-black">{currentVal.toFixed(2)} Amperes</strong>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400 font-bold">POWER DISSIPATED (P = V &times; I):</span>
                <strong className="text-amber-400 font-mono text-base font-black">{powerVal.toFixed(2)} Watts (W)</strong>
              </div>
              <div className="p-3.5 bg-slate-900 rounded-xl border border-sky-500/20 text-xs">
                <span className="text-sky-300 font-bold block mb-1.5">Conductor Electron Flow Visual:</span>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${flowPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1.5">
                  Current varies directly with voltage and inversely with conductor resistance.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bhimsingh Sir's 100/100 Board Scoring Blueprint */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-[#0c1427]/80 border border-slate-800 shadow-lg space-y-2">
          <div className="text-3xl mb-1">✍️</div>
          <h4 className="text-white font-heading font-black text-base">Step Marking Layout</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Write 'Given', 'To Prove', and 'Formula Used' in distinct boxes to secure all methodology marks in CBSE examinations.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0c1427]/80 border border-slate-800 shadow-lg space-y-2">
          <div className="text-3xl mb-1">📐</div>
          <h4 className="text-white font-heading font-black text-base">LHS = RHS Theorem Proofs</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Always justify every geometric step with official NCERT axiom names (e.g., BPT Thales Theorem, Angle Sum Property).
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0c1427]/80 border border-slate-800 shadow-lg space-y-2">
          <div className="text-3xl mb-1">⚡</div>
          <h4 className="text-white font-heading font-black text-base">SI Units & Sign Conventions</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cartesian signs for lens focal length and proper unit conversions (mA to A, cm to m) prevent common exam deduction traps.
          </p>
        </div>
      </div>
    </div>
  );
};
