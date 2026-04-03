import React from 'react';
import { PhoneCall, Calendar as CalendarIcon, Clock, Users, Plus, Home } from 'lucide-react';

const CallsPage = ({ onNavigate }) => {
  const calls = [
    { id: 1, title: "Daily Standup", time: "10:00 AM", date: "Today", participants: 5, type: "recurring" },
    { id: 2, title: "Client Demo: FastLine", time: "14:30 PM", date: "Today", participants: 3, type: "external" },
    { id: 3, title: "Cyber Hygiene Presentation Prep", time: "11:00 AM", date: "Tomorrow", participants: 2, type: "internal" }
  ];

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar relative z-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Scheduled Calls</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your upcoming audio and video calls.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onNavigate('welcome')} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl transition-all border border-white/5">
            <Home size={16} /> <span className="text-sm font-medium">Home</span>
          </button>
          <button className="flex items-center gap-2 bg-[#6d28d9] hover:bg-[#5b21b6] text-white px-4 py-2 rounded-xl transition-all shadow-lg text-sm font-medium">
            <Plus size={16} /> Schedule Call
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {calls.map(call => (
          <div key={call.id} className="bg-[#1d1a4a] border border-white/5 rounded-2xl p-5 hover:border-purple-500/50 transition-all shadow-lg group">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <PhoneCall size={20} />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">{call.title}</h3>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CalendarIcon size={14} /> <span>{call.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock size={14} /> <span>{call.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users size={14} /> <span>{call.participants} Participants</span>
              </div>
            </div>
            <button className="w-full py-2 bg-white/5 hover:bg-purple-600 hover:text-white text-gray-300 rounded-xl transition-colors text-sm font-medium">
              Join Call
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CallsPage;