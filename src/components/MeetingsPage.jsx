import React from 'react';
<<<<<<< HEAD
import { Video, Home, Play, Clock, HardDrive, Download, Calendar } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const WorkspaceBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#05060f]">
    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#6d28d9] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse" style={{ animationDuration: '8s' }}></div>
    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#3b82f6] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" style={{ animationDuration: '12s' }}></div>
    <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-[#a19bfe] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse" style={{ animationDuration: '10s' }}></div>
    <style>{`.tech-grid { background-size: 40px 40px; background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px); mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%); -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%); }`}</style>
    <div className="absolute inset-0 tech-grid"></div>
  </div>
);

const MeetingsPage = ({ onNavigate }) => {
  const mockRecordings = [
    { id: 1, title: "Architecture & Firebase Structure Sync", duration: "48:12", date: "May 15, 2026", size: "240 MB" },
    { id: 2, title: "Marketing & BCG Matrix Calculations Workflow", duration: "25:40", date: "May 12, 2026", size: "115 MB" }
  ];

  return (
    <div className="flex-1 flex flex-col h-full w-full text-white relative z-10 overflow-y-auto custom-scrollbar p-6 md:p-12">
      <Toaster position="top-center" />
      <WorkspaceBackground />

      <div className="w-full max-w-5xl mx-auto relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Cloud Records</h1>
            <p className="text-gray-400 text-base mt-2">Access secure recordings and summaries from previous conferences.</p>
          </div>
          <button onClick={() => onNavigate('welcome')} className="flex items-center gap-2 bg-[#0a0f1e]/60 backdrop-blur-xl border border-white/10 hover:border-white/30 text-gray-300 hover:text-white px-5 py-3 rounded-2xl transition-all font-bold shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <Home size={18} /> Home
          </button>
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-backwards">
          <h2 className="text-sm font-black text-[#10b981] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 pl-2">
             <Video size={16}/> Recordings History
          </h2>
          
          {mockRecordings.map((rec) => (
            <div key={rec.id} className="bg-[#0a0f1e]/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group transition-all hover:-translate-y-1 hover:border-[#10b981]/50 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.2)]">
              <div className="flex items-center gap-6 min-w-0">
                <div className="w-16 h-16 rounded-2xl bg-[#030408]/80 border border-white/5 text-[#10b981] flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 group-hover:border-[#10b981]/30 transition-all duration-300">
                  <Video size={28} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-xl truncate group-hover:text-[#a19bfe] transition-colors">{rec.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400 mt-2 font-medium">
                    <span className="flex items-center gap-2"><Calendar size={14}/> {rec.date}</span>
                    <span className="flex items-center gap-2"><Clock size={14}/> {rec.duration}</span>
                    <span className="flex items-center gap-2"><HardDrive size={14}/> {rec.size}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <button onClick={() => toast.success("Streaming video sequence...")} className="bg-white/5 hover:bg-white text-gray-300 hover:text-black rounded-xl transition-all border border-white/10 shadow-md flex items-center gap-2 font-bold text-sm px-6 py-3.5 active:scale-95">
                  <Play size={16} /> Playback
                </button>
                <button onClick={() => toast.success("Downloading mp4 file stream")} className="bg-[#030408]/60 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all border border-white/5 p-3.5 active:scale-95" title="Download Record">
                  <Download size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

=======
import { Video } from 'lucide-react';

const MeetingsPage = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-white text-center animate-message">
    <Video size={64} className="text-red-400 mb-6" />
    <h2 className="text-3xl font-bold mb-3">Saved Meetings</h2>
    <p className="text-gray-400 max-w-md">Access recordings and summaries of your meetings.</p>
  </div>
);
>>>>>>> 6177455093f7fec61a5cef28758f30915ee7d335
export default MeetingsPage;