import React, { useState, useEffect } from 'react';
import { Video, Home, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const MeetingsPage = ({ onNavigate }) => {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://backendfastline.onrender.com/meetings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setMeetings(data);
        }
      } catch (error) {
        console.error("Error fetching meetings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar relative z-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Saved Meetings & Notes</h1>
          <p className="text-gray-400 text-sm mt-1">Access your recorded meeting notes.</p>
        </div>
        <button onClick={() => onNavigate('welcome')} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl transition-all border border-white/5">
          <Home size={16} /> <span className="text-sm font-medium">Home</span>
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-gray-400 text-center py-10">Loading meetings...</div>
        ) : meetings.length === 0 ? (
          <div className="text-gray-500 text-center py-10 border border-dashed border-white/10 rounded-2xl">No meetings found.</div>
        ) : (
          meetings.map(rec => (
            <div key={rec.id} className="flex flex-col md:flex-row items-start md:items-center justify-between bg-[#1d1a4a] border border-white/5 rounded-2xl p-5 hover:border-purple-500/30 transition-all shadow-md gap-4 group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-1">
                  <Video size={24} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{rec.title}</h3>
                  <div className="flex gap-3 text-xs text-gray-500 mt-1 mb-3">
                    <span className="bg-white/5 px-2 py-1 rounded border border-white/5">{rec.displayDate}</span>
                  </div>
                  <div className="text-sm text-gray-300 bg-[#131933] p-3 rounded-xl border border-white/5 flex items-start gap-2">
                    <FileText size={16} className="text-gray-500 mt-0.5 shrink-0" />
                    <p className="leading-relaxed">{rec.notes}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MeetingsPage;