import React from 'react';
import { CoursePrices, PaymentSettings } from '../types';
import { Check, ShieldCheck, Zap, Copy, CreditCard } from 'lucide-react';

interface CoursesSectionProps {
  coursePrices: CoursePrices;
  paymentSettings: PaymentSettings;
  enrolledGrades: number[];
  onOpenCheckout: (grade: number, packageType: 'math' | 'physics' | 'combo', fee: number) => void;
  onCopyText: (text: string, label: string) => void;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({
  coursePrices,
  paymentSettings,
  enrolledGrades,
  onOpenCheckout,
  onCopyText
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="bg-amber-500/15 text-amber-300 border border-amber-400 text-xs font-black px-4 py-1.5 rounded-full inline-block">
          ADMISSIONS OPEN &bull; ACADEMIC YEAR 2026–27
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-black text-white">
          Select Your Grade & Enroll in Live Batches
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          Daily interactive live smartboard lectures with <strong className="text-white">Bhimsingh Thakur (M.Sc.)</strong>. Instant UPI payment via PhonePe, Google Pay, or Paytm followed by verified owner approval.
        </p>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[6, 7, 8, 9, 10].map((grade) => {
          const prices = coursePrices[grade] || { math: 4000, physics: 4000, combo: 7500 };
          const isEnrolled = enrolledGrades.includes(grade);

          return (
            <div
              key={grade}
              className={`rounded-3xl p-6 flex flex-col justify-between transition-all border-2 bg-gradient-to-b from-[#0c1427]/95 to-[#090e1f]/95 shadow-xl backdrop-blur-md hover:border-amber-500/40 ${
                isEnrolled ? 'border-emerald-500/80 shadow-emerald-950/40' : 'border-white/10'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-heading text-2xl font-black text-white">
                    Class {grade} CBSE
                  </h3>
                  {isEnrolled ? (
                    <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full shadow-md">
                      ✓ ENROLLED
                    </span>
                  ) : (
                    <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-400/40">
                      LIVE BATCH
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 mb-5 leading-relaxed">
                  Complete NCERT syllabus mastery &bull; Step-by-step smartboard derivations &bull; Weekly test series.
                </p>

                {/* Pricing Breakdown */}
                <div className="space-y-2.5 mb-6 text-xs">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Pure Math (Only):</span>
                    <strong className="text-amber-400 font-mono text-sm font-black">
                      ₹{prices.math.toLocaleString()} / mo
                    </strong>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Applied Physics (Only):</span>
                    <strong className="text-sky-400 font-mono text-sm font-black">
                      ₹{prices.physics.toLocaleString()} / mo
                    </strong>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <strong className="text-emerald-300 font-bold">Math + Physics Combo:</strong>
                    </div>
                    <strong className="text-emerald-400 font-mono text-base font-black">
                      ₹{prices.combo.toLocaleString()} / mo
                    </strong>
                  </div>
                </div>

                {/* Features List */}
                <ul className="text-xs text-slate-400 space-y-1.5 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Daily live interactive audio-visual classroom</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Whiteboard derivations saved directly to your vault</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Direct doubt ticketing to Bhimsingh Sir</span>
                  </li>
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onOpenCheckout(grade, 'combo', prices.combo)}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-amber-500/25 transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>Enroll in Class {grade} Combo Batch →</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Verified Direct Payment Gateway Credentials Card */}
      <div className="bg-black/40 border border-white/10 rounded-3xl p-6 lg:p-8 flex flex-wrap justify-between items-center gap-6 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h4 className="font-heading text-lg font-black text-amber-400">
              Verified Direct Payment Channels:
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            Account Holder: <strong className="text-white">{paymentSettings.accountHolder}</strong>
          </p>
          <p className="text-xs sm:text-sm text-slate-400">
            PhonePe / Google Pay / Paytm: <strong className="text-white font-mono font-bold">+91 {paymentSettings.phone}</strong> &bull; UPI ID: <strong className="text-sky-400 font-mono font-bold">{paymentSettings.upi}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onCopyText(paymentSettings.phone, 'PhonePe Mobile Number')}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            <span>Copy Number</span>
          </button>
          <button
            onClick={() => onCopyText(paymentSettings.upi, 'UPI ID')}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-sky-400" />
            <span>Copy UPI ID</span>
          </button>
        </div>
      </div>
    </div>
  );
};
