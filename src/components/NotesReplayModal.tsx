import React from 'react';
import { LectureRecording } from '../types';
import { X, Download, FileText } from 'lucide-react';

interface NotesReplayModalProps {
  recording: LectureRecording | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const NotesReplayModal: React.FC<NotesReplayModalProps> = ({
  recording,
  onClose,
  onShowToast
}) => {
  if (!recording) return null;

  // Generate clean mathematical whiteboard canvas image if no notesUrl was uploaded
  const getNotesImageUrl = () => {
    if (recording.notesUrl) return recording.notesUrl;

    const cvs = document.createElement('canvas');
    cvs.width = 960;
    cvs.height = 540;
    const ctx = cvs.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 26px Space Grotesk, sans-serif';
    ctx.fillText('SANJU MATH - BHIMSINGH THAKUR (M.Sc.)', 40, 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Plus Jakarta Sans, sans-serif';
    ctx.fillText(`${recording.title}`, 40, 100);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(320, 300, 110, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 22px JetBrains Mono, monospace';
    ctx.fillText('x = (-b ± √(b² - 4ac)) / (2a)', 500, 260);
    ctx.fillText('Discriminant D = b² - 4ac', 500, 310);
    ctx.fillText('Real & Distinct Roots if D > 0', 500, 360);

    return cvs.toDataURL();
  };

  const notesUrl = getNotesImageUrl();

  const handleDownloadNotes = () => {
    const a = document.createElement('a');
    a.href = notesUrl;
    a.download = `Sanju_Math_Notes_${recording.title.replace(/\s+/g, '_')}.png`;
    a.click();
    onShowToast('Whiteboard derivation notes downloaded!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-gradient-to-br from-[#090e1f] to-[#121936] border-2 border-amber-400 rounded-3xl p-6 max-w-4xl w-full shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-700/80">
          <div>
            <h4 className="font-heading text-lg font-black text-white">{recording.title}</h4>
            <span className="text-xs text-amber-400">
              {recording.subject} &bull; Class {recording.grade} &bull; Recorded: {recording.date}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden border-2 border-slate-800 bg-[#020617] flex items-center justify-center p-2 min-h-[380px]">
          <img
            src={notesUrl}
            alt="Lecture Derivation Notes"
            className="max-w-full max-h-[500px] object-contain rounded-xl"
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-400">
            Official step-by-step whiteboard derivations rendered by Bhimsingh Sir.
          </span>
          <button
            onClick={handleDownloadNotes}
            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>💾 Download Notes (PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
