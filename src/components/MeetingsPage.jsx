import React from 'react';
import { Video, Play, Download, Clock, Home } from 'lucide-react';

const MeetingsPage = ({ onNavigate }) => {
  const recordings = [
    { id: 1, title: "Sprint Planning", date: "March 15, 2026", duration: "45 min", size: "320 MB" },
    { id: 2, title: "Design Sync: Dark Theme", date: "March 12, 2026", duration: "1h 15m", size: "650 MB" },
    { id: 3, title: "Project Kickoff", date: "March 10, 2026", duration: "30 min", size: "180 MB" }
  ];

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar relative z-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Saved Meetings</h1>
          <p className="text-gray-400 text-sm mt-1">Access your recorded video conferences.</p>
        </div>
        <button onClick={() => onNavigate('welcome')} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl transition-all border border-white/5">
          <Home size={16} /> <span className="text-sm font-medium">Home</span>
        </button>
      </div>

      <div className="space-y-3">
        {recordings.map(rec => (
          <div key={rec.id} className="flex flex-col md:flex-row items-start md:items-center justify-between bg-[#1d1a4a] border border-white/5 rounded-2xl p-4 hover:bg-white/5 transition-all shadow-md gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Video size={24} />
              </div>
              <div>
                <h3 className="text-white font-semibold">{rec.title}</h3>
                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                  <span>{rec.date}</span>
                  <span className="flex items-center gap-1"><Clock size={10}/> {rec.duration}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#6d28d9] hover:bg-[#5b21b6] text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium">
                <Play size={16} /> Watch
              </button>
              <button className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors border border-white/5" title={`Download (${rec.size})`}>
                <Download size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingsPage;