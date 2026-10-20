import React, { useRef, useState, useEffect } from 'react';
import { Doubt } from '../types';
import {
  X,
  PenTool,
  Square,
  Circle,
  Triangle,
  Grid,
  Trash2,
  Save,
  Monitor,
  Camera,
  MessageSquare,
  Users,
  Mic,
  MicOff,
  Send,
  Share2,
  Clock
} from 'lucide-react';

interface LiveClassroomStudioProps {
  isOpen: boolean;
  onClose: () => void;
  doubts: Doubt[];
  onSendDoubt: (text: string) => void;
  onSaveBoardNotes: (notesDataUrl: string) => void;
  onShowToast: (msg: string) => void;
}

export const LiveClassroomStudio: React.FC<LiveClassroomStudioProps> = ({
  isOpen,
  onClose,
  doubts,
  onSendDoubt,
  onSaveBoardNotes,
  onShowToast
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const camVideoRef = useRef<HTMLVideoElement | null>(null);

  // Tools state
  const [currentTool, setCurrentTool] = useState<
    'pen' | 'highlighter' | 'eraser' | 'line' | 'arrow' | 'rect' | 'circle' | 'triangle' | 'parabola'
  >('pen');
  const [currentColor, setCurrentColor] = useState('#fbbf24');
  const [boardTheme, setBoardTheme] = useState<'dark' | 'chalk' | 'graph' | 'white'>('dark');

  // Drawing state
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const snapshot = useRef<ImageData | null>(null);

  // Media Streams
  const screenStreamRef = useRef<MediaStream | null>(null);
  const camStreamRef = useRef<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCamActive, setIsCamActive] = useState(false);

  // Timer
  const [seconds, setSeconds] = useState(0);

  // Live Chat input
  const [chatInput, setChatInput] = useState('');

  // Mock participants
  const [participants] = useState([
    { id: '1', name: 'Aarav Sharma', isMuted: false, hand: false },
    { id: '2', name: 'Priya Patel', isMuted: true, hand: false },
    { id: '3', name: 'Rohan Verma', isMuted: false, hand: true },
    { id: '4', name: 'Ananya Iyer', isMuted: false, hand: false }
  ]);

  // Timer effect
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Setup Canvas on open
  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => {
      initCanvas();
    }, 100);
    return () => clearTimeout(timeout);
  }, [isOpen, boardTheme]);

  // Clean up media on unmount
  useEffect(() => {
    return () => {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (camStreamRef.current) {
        camStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const fillBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: string) => {
    if (theme === 'chalk') ctx.fillStyle = '#064e3b';
    else if (theme === 'graph') ctx.fillStyle = '#0f172a';
    else if (theme === 'white') ctx.fillStyle = '#ffffff';
    else ctx.fillStyle = '#090e1f';
    ctx.fillRect(0, 0, width, height);

    if (theme === 'graph') {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    canvas.width = parent.clientWidth || 960;
    canvas.height = parent.clientHeight || 600;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    fillBackground(ctx, canvas.width, canvas.height, boardTheme);
  };

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    const mouseEvent = e as React.MouseEvent<HTMLCanvasElement>;
    return {
      x: mouseEvent.clientX - rect.left,
      y: mouseEvent.clientY - rect.top
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawing.current = true;
    const pos = getCanvasPos(e);
    startPos.current = pos;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getCanvasPos(e);
    const x = pos.x;
    const y = pos.y;
    const sx = startPos.current.x;
    const sy = startPos.current.y;

    if (currentTool === 'pen') {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === 'highlighter') {
      ctx.strokeStyle = currentColor;
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 16;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    } else if (currentTool === 'eraser') {
      ctx.strokeStyle = boardTheme === 'white' ? '#ffffff' : '#090e1f';
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === 'line' || currentTool === 'arrow') {
      if (snapshot.current) ctx.putImageData(snapshot.current, 0, 0);
      ctx.beginPath();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 2;
      ctx.moveTo(sx, sy);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === 'rect') {
      if (snapshot.current) ctx.putImageData(snapshot.current, 0, 0);
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(sx, sy, x - sx, y - sy);
    } else if (currentTool === 'circle') {
      if (snapshot.current) ctx.putImageData(snapshot.current, 0, 0);
      const radius = Math.hypot(x - sx, y - sy);
      ctx.beginPath();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 2;
      ctx.arc(sx, sy, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (currentTool === 'triangle') {
      if (snapshot.current) ctx.putImageData(snapshot.current, 0, 0);
      ctx.beginPath();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 2;
      ctx.moveTo(sx, sy);
      ctx.lineTo(x, y);
      ctx.lineTo(sx, y);
      ctx.closePath();
      ctx.stroke();
    } else if (currentTool === 'parabola') {
      if (snapshot.current) ctx.putImageData(snapshot.current, 0, 0);
      ctx.beginPath();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 2;
      ctx.moveTo(sx - 70, sy + 70);
      ctx.quadraticCurveTo(sx, sy - 50, sx + 70, sy + 70);
      ctx.stroke();
    }
  };

  const stopDraw = () => {
    isDrawing.current = false;
  };

  const handleClearBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    fillBackground(ctx, canvas.width, canvas.height, boardTheme);
    onShowToast('Smartboard cleared.');
  };

  const handlePlotCartesian = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const midX = Math.floor(canvas.width / 2);
    const midY = Math.floor(canvas.height / 2);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 35) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(midX, 0);
    ctx.lineTo(midX, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(canvas.width, midY);
    ctx.stroke();

    onShowToast('📊 Cartesian X-Y Grid Plotted on Stage!');
  };

  const handleSaveNotes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    onSaveBoardNotes(dataUrl);
    onShowToast('💾 Whiteboard notes saved to student vault!');
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
          screenVideoRef.current.play();
        }
        setIsScreenSharing(true);
        stream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
        onShowToast('🖥️ Screen / Window sharing live!');
      } catch (err) {
        onShowToast('Screen sharing canceled or unsupported.');
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    onShowToast('Screen share stopped. Whiteboard restored.');
  };

  const toggleWebcam = async () => {
    if (!isCamActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        camStreamRef.current = stream;
        if (camVideoRef.current) {
          camVideoRef.current.srcObject = stream;
          camVideoRef.current.play();
        }
        setIsCamActive(true);
        onShowToast('📷 Faculty camera live!');
      } catch (err) {
        onShowToast('Camera access unavailable.');
      }
    } else {
      if (camStreamRef.current) {
        camStreamRef.current.getTracks().forEach((t) => t.stop());
        camStreamRef.current = null;
      }
      setIsCamActive(false);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendDoubt(chatInput.trim());
    setChatInput('');
  };

  const handleWhatsAppShare = () => {
    const msg = encodeURIComponent(
      '🚨 Bhimsingh Sir is LIVE on SANJU MATH Smartboard Studio! Join the live problem-solving batch now: https://sanjumath.com'
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  if (!isOpen) return null;

  const formatTimer = (s: number) => {
    const hrs = String(Math.floor(s / 3600)).padStart(2, '0');
    const mins = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const secs = String(s % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#030712] flex flex-col overflow-hidden animate-fadeIn select-none">
      
      {/* Top Studio Bar */}
      <div className="h-14 bg-[#0b0f19] border-b border-slate-800 px-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <h2 className="text-xs sm:text-sm font-black text-white font-heading truncate">
            Class 10 Live Smartboard Studio &bull; Bhimsingh Thakur (M.Sc.)
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="font-mono text-xs font-black bg-slate-900 border border-slate-700 text-amber-400 px-3 py-1 rounded-lg">
            {formatTimer(seconds)}
          </span>

          <button
            onClick={toggleScreenShare}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm ${
              isScreenSharing
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-sky-600 hover:bg-sky-500 text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isScreenSharing ? 'Stop Screen' : 'Share Screen'}</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm hidden sm:flex"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Invite</span>
          </button>

          <button
            onClick={onClose}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm"
          >
            Exit Studio
          </button>
        </div>
      </div>

      {/* Main Studio Body: Stage (Left) + Conference Sidebar (Right) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left: Presentation Stage */}
        <div className="flex-1 flex flex-col p-2.5 bg-[#020617] relative overflow-hidden">
          
          {/* Tools Ribbon */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-2 mb-2 flex flex-wrap items-center justify-between gap-2 shadow-lg">
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => setCurrentTool('pen')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  currentTool === 'pen' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                ✏️ Pen
              </button>
              <button
                onClick={() => setCurrentTool('highlighter')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  currentTool === 'highlighter' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                🖍️ Highlight
              </button>
              <button
                onClick={() => setCurrentTool('eraser')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  currentTool === 'eraser' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                🧽 Eraser
              </button>
              <button
                onClick={() => setCurrentTool('line')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  currentTool === 'line' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                📏 Line
              </button>
              <button
                onClick={() => setCurrentTool('rect')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  currentTool === 'rect' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                ◻️ Box
              </button>
              <button
                onClick={() => setCurrentTool('circle')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  currentTool === 'circle' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                ⭕ Circle
              </button>
              <button
                onClick={() => setCurrentTool('triangle')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  currentTool === 'triangle' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                📐 Triangle
              </button>
              <button
                onClick={() => setCurrentTool('parabola')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  currentTool === 'parabola' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                ⌒ Parabola
              </button>
              <button
                onClick={handlePlotCartesian}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-950 text-sky-300 border border-sky-800/60"
              >
                📊 X-Y Grid
              </button>
              <button
                onClick={handleClearBoard}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800/60"
              >
                🗑️ Clear
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-sm"
              >
                💾 Save Notes
              </button>
            </div>

            {/* Colors and Themes */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {['#ffffff', '#fbbf24', '#38bdf8', '#34d399', '#f43f5e'].map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setCurrentColor(color);
                      setCurrentTool('pen');
                    }}
                    style={{ backgroundColor: color }}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${
                      currentColor === color ? 'scale-125 border-white' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
              <select
                value={boardTheme}
                onChange={(e) => setBoardTheme(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="dark">Midnight Dark</option>
                <option value="chalk">Emerald Chalkboard</option>
                <option value="graph">Graph Grid Paper</option>
                <option value="white">Clean Whiteboard</option>
              </select>
            </div>
          </div>

          {/* Canvas & Screen Share Stage Container */}
          <div className="flex-1 w-full rounded-2xl overflow-hidden border-2 border-slate-800 bg-[#090e1f] relative">
            <canvas
              ref={canvasRef}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
              className="w-full h-full block cursor-crosshair"
            />
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              className={`absolute inset-0 w-full h-full object-contain bg-black ${
                isScreenSharing ? 'block' : 'hidden'
              }`}
            />
          </div>
        </div>

        {/* Right: Faculty Cam, Connected Students, and Doubts Feed */}
        <div className="w-80 bg-[#090e1f] border-l border-slate-800 flex flex-col gap-3 p-3 overflow-y-auto shrink-0">
          
          {/* Faculty Webcam */}
          <div className="bg-[#020617] border-2 border-amber-400/60 rounded-2xl p-2.5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-heading font-black text-amber-400">FACULTY CAM</span>
              <button
                onClick={toggleWebcam}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"
              >
                <Camera className="w-3 h-3" />
                <span>{isCamActive ? 'Off' : 'On'}</span>
              </button>
            </div>
            <div className="h-28 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center relative">
              <video
                ref={camVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCamActive ? 'block' : 'hidden'}`}
              />
              {!isCamActive && (
                <div className="text-center space-y-0.5">
                  <div className="text-2xl">👨‍🏫</div>
                  <strong className="text-white text-xs block">Bhimsingh Thakur</strong>
                  <span className="text-[10px] text-amber-400 font-mono">M.Sc. Mathematics</span>
                </div>
              )}
            </div>
          </div>

          {/* Connected Students List */}
          <div className="bg-[#020617] border border-slate-800 rounded-2xl p-3 flex flex-col space-y-2">
            <div className="flex justify-between items-center pb-1 border-b border-slate-800 text-xs">
              <span className="font-bold text-slate-300">Connected Students ({participants.length})</span>
              <span className="text-[10px] text-emerald-400 font-mono">Live Sync</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="p-1.5 bg-slate-900 rounded-lg flex items-center justify-between border border-slate-800/80"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{p.hand ? '✋' : '👤'}</span>
                    <strong className="text-white text-[11px]">{p.name}</strong>
                  </div>
                  <span className={`text-[10px] font-bold ${p.isMuted ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {p.isMuted ? 'Muted' : 'Mic Live'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Questions & Doubts Feed */}
          <div className="bg-[#020617] border border-slate-800 rounded-2xl p-3 flex-1 flex flex-col space-y-2 min-h-[180px]">
            <span className="font-heading font-black text-xs text-sky-400">
              Live Questions & Doubts
            </span>
            <div className="flex-1 overflow-y-auto font-sans text-xs space-y-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800/80 max-h-48">
              {doubts.map((d) => (
                <div key={d.id} className="leading-snug">
                  <strong
                    className={d.role === 'teacher' ? 'text-amber-400 font-bold' : 'text-sky-300 font-bold'}
                  >
                    {d.sender}:
                  </strong>{' '}
                  <span className="text-slate-300 text-[11px]">{d.text}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask or reply to class..."
                className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-sm"
              >
                Send
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
