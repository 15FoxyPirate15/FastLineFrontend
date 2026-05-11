import React, { useState, useEffect } from 'react';
import { PhoneCall, Calendar as CalendarIcon, Link as LinkIcon, Plus, Home } from 'lucide-react';
import toast from 'react-hot-toast';

const CallsPage = ({ onNavigate }) => {
  const [calls, setCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCalls = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://backendfastline.onrender.com/calls', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCalls(data);
      }
    } catch (error) {
      console.error("Error fetching calls:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const handleScheduleCall = async () => {
    const title = prompt("Enter call title:");
    if (!title) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://backendfastline.onrender.com/calls', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ title, date: new Date().toLocaleDateString() })
      });
      if (response.ok) {
        toast.success("Call scheduled!");
        fetchCalls(); // Оновлюємо список
      }
    } catch (error) {
      toast.error("Failed to schedule call");
    }
  };

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
          <button onClick={handleScheduleCall} className="flex items-center gap-2 bg-[#6d28d9] hover:bg-[#5b21b6] text-white px-4 py-2 rounded-xl transition-all shadow-lg text-sm font-medium">
            <Plus size={16} /> Schedule Call
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-gray-400 text-center py-10">Loading calls...</div>
      ) : calls.length === 0 ? (
        <div className="text-gray-500 text-center py-10 border border-dashed border-gray-600 rounded-2xl">No calls scheduled yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {calls.map(call => (
            <div key={call.id} className="bg-[#1d1a4a] border border-white/5 rounded-2xl p-5 hover:border-purple-500/50 transition-all shadow-lg group flex flex-col">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <PhoneCall size={20} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{call.title}</h3>
              <div className="space-y-2 mb-6 flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <CalendarIcon size={14} /> <span>{call.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="capitalize">{call.status}</span>
                </div>
              </div>
              <a 
                href={call.roomLink} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-2.5 flex items-center justify-center gap-2 bg-[#6d28d9] hover:bg-[#5b21b6] text-white rounded-xl transition-colors text-sm font-medium"
              >
                <LinkIcon size={16} /> Join Call
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CallsPage;