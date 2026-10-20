import React from 'react';
import { PaymentSettings } from '../types';
import { X, MessageCircle, Phone, Mail } from 'lucide-react';

interface ParentCounselingModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentSettings: PaymentSettings;
}

export const ParentCounselingModal: React.FC<ParentCounselingModalProps> = ({
  isOpen,
  onClose,
  paymentSettings
}) => {
  if (!isOpen) return null;

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      'Hello Bhimsingh Sir, I am inquiring about CBSE Pure Mathematics and Applied Physics batch admissions.'
    );
    window.open(`https://api.whatsapp.com/send?phone=91${paymentSettings.phone}&text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-[#090e1f] to-[#121936] border-2 border-amber-400 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-700/80">
          <h4 className="font-heading text-lg font-black text-white">
            Direct Academic Inquiry with Bhimsingh Sir
          </h4>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Have questions regarding CBSE syllabus pacing, batch timings, board test blueprints, or student enrollment? Connect directly with Founder & Lead Faculty <strong className="text-amber-400">Bhimsingh Thakur (M.Sc.)</strong>.
        </p>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-base">👨‍🏫</span>
            <span>
              Faculty: <strong className="text-white">Bhimsingh Thakur (M.Sc. Mathematics)</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Direct Phone / WhatsApp: <strong className="text-white font-mono">+91 {paymentSettings.phone}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-sky-400" />
            <span>
              Official Desk: <strong className="text-sky-300 font-mono">admissions@sanjumath.com</strong>
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleWhatsApp}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </button>
          <button
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold px-4 py-3 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
