<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { PhoneCall, Calendar as CalendarIcon, Link as LinkIcon, Plus, Home, Copy, Clock, Users, Shield, Timer, FolderKanban, X, Video } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// ФОН: "Aurora Grid" (Північне сяйво + Сітка)
const WorkspaceBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#05060f]">
    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#6d28d9] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse" style={{ animationDuration: '8s' }}></div>
    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#3b82f6] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" style={{ animationDuration: '12s' }}></div>
    <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-[#a19bfe] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse" style={{ animationDuration: '10s' }}></div>
    <style>
      {`
        .tech-grid {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
        }
        .custom-date-input::-webkit-calendar-picker-indicator {
          background: transparent; bottom: 0; color: transparent; cursor: pointer; height: auto; left: 0; position: absolute; right: 0; top: 0; width: auto; z-index: 10;
        }
      `}
    </style>
    <div className="absolute inset-0 tech-grid"></div>
  </div>
);

const CallsPage = ({ onNavigate }) => {
  const [calls, setCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);

  // Форма для нового дзвінка
  const [newCallForm, setNewCallForm] = useState({
    title: '', project: '', agenda: '', date: '', time: '', duration: '30m', priority: 'Routine'
  });

  const fetchCalls = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://backendfastline.onrender.com/calls', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        
        // ТИМЧАСОВЕ РІШЕННЯ: Доповнюємо дані бекенду фейковими деталями для дизайну
        const enrichedCalls = data.map((call, idx) => ({
            ...call,
            project: call.project || (idx % 2 === 0 ? "FastLine Backend" : "Messenger UI"),
            agenda: call.agenda || "Sync about recent updates, API integration, and next sprint tasks.",
            time: call.time || "14:30",
            duration: call.duration || "45 min",
            priority: call.priority || (idx === 0 ? "Urgent" : "Weekly Sync"),
            participants: call.participants || [
                { name: "Maxim", color: "from-blue-500 to-indigo-600", initial: "M" },
                { name: "Katya", color: "from-pink-500 to-rose-600", initial: "K" },
                { name: "Orest", color: "from-emerald-400 to-teal-500", initial: "O" }
            ],
            // Імітація таймеру для першого дзвінка
            startsIn: idx === 0 ? "in 15 mins" : null 
        }));

        setCalls(enrichedCalls);
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

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newCallForm.title.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://backendfastline.onrender.com/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
            title: newCallForm.title, 
            date: newCallForm.date || new Date().toLocaleDateString() 
        })
      });
      if (response.ok) {
        toast.success("Call scheduled successfully!");
        fetchCalls(); 
        setIsScheduling(false);
        setNewCallForm({title: '', project: '', agenda: '', date: '', time: '', duration: '30m', priority: 'Routine'});
      }
    } catch (error) {
      toast.error("Failed to schedule call");
    }
  };

  const getPriorityStyle = (priority) => {
    if (priority === 'Urgent') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (priority === 'Weekly Sync') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    return 'bg-[#a19bfe]/10 text-[#a19bfe] border-[#a19bfe]/20';
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full text-white relative z-10 overflow-y-auto custom-scrollbar p-6 md:p-12">
      <Toaster position="top-center" />
      <WorkspaceBackground />
      
      <div className="w-full max-w-6xl mx-auto relative z-10 flex flex-col h-full">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Meetings & Calls</h1>
            <p className="text-gray-400 text-base mt-2">Schedule and join encrypted video conferences.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('welcome')} className="flex items-center gap-2 bg-[#0a0f1e]/60 backdrop-blur-xl border border-white/10 hover:border-white/30 text-gray-300 hover:text-white px-5 py-3 rounded-2xl transition-all font-bold shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <Home size={18} /> Home
            </button>
            <button onClick={() => setIsScheduling(true)} className="flex items-center gap-2 bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] text-white px-6 py-3 rounded-2xl transition-all shadow-[0_0_20px_rgba(109,40,217,0.4)] text-sm font-bold active:scale-95 hover:opacity-90">
              <Video size={18} /> Schedule Call
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex justify-center items-center text-[#a19bfe] font-bold animate-pulse">Loading schedule...</div>
        ) : calls.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 bg-[#0a0f1e]/40 backdrop-blur-3xl rounded-[2.5rem] border border-dashed border-white/10 animate-in fade-in duration-700">
              <div className="w-16 h-16 bg-[#1e2336] rounded-full flex items-center justify-center mb-4 text-gray-500 shadow-inner"><PhoneCall size={32} /></div>
              <p className="text-gray-400 font-bold">No calls scheduled yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
            {calls.map((call, idx) => (
              <div 
                  key={call.id} 
                  className="bg-[#0a0f1e]/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 hover:bg-[#12182b]/60 hover:-translate-y-1 hover:border-[#6d28d9]/50 hover:shadow-[0_10px_40px_-10px_rgba(109,40,217,0.2)] transition-all duration-300 group shadow-xl flex flex-col animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards"
                  style={{ animationDelay: `${idx * 150}ms` }}
              >
                
                {/* TOP ROW: Project Badge & Priority */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#030408]/60 border border-white/5 shadow-inner">
                      <FolderKanban size={14} className="text-[#a19bfe]" />
                      <span className="text-[11px] font-bold text-gray-300 tracking-wider uppercase">{call.project}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getPriorityStyle(call.priority)}`}>
                      {call.priority}
                  </div>
                </div>

                {/* TITLE & AGENDA */}
                <div className="mb-8 flex-1">
                  <h3 className="text-white font-black text-2xl mb-3 group-hover:text-[#a19bfe] transition-colors">{call.title}</h3>
                  <div className="text-gray-400 text-sm leading-relaxed line-clamp-2 bg-[#030408]/40 p-4 rounded-xl border border-white/5 shadow-inner">
                      <span className="font-bold text-gray-500 uppercase text-[10px] block mb-1.5 tracking-wider">Agenda</span>
                      {call.agenda}
                  </div>
                </div>

                {/* TIME & PARTICIPANTS ROW */}
                <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2 text-gray-300 font-medium text-sm">
                            <CalendarIcon size={16} className="text-[#6d28d9]" /> {call.date}
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 font-medium text-sm">
                            <Clock size={16} className="text-[#3b82f6]" /> {call.time}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 font-medium text-sm">
                            <Timer size={16} /> {call.duration}
                        </div>
                    </div>

                    {/* OVERLAPPING AVATARS */}
                    <div className="flex items-center">
                        <div className="flex -space-x-3">
                            {call.participants.map((p, i) => (
                                <div key={i} className={`w-9 h-9 rounded-full border-2 border-[#101426] bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-xs font-bold shadow-md relative z-${30-i}`}>
                                    {p.initial}
                                </div>
                            ))}
                        </div>
                        <span className="ml-3 text-[11px] font-bold text-gray-500">{call.participants.length} Invited</span>
                    </div>
                </div>

                {/* ACTION BUTTONS & COUNTDOWN */}
                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                  {call.startsIn ? (
                      <a href={call.roomLink} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] text-sm font-black active:scale-95 animate-pulse">
                          <Video size={18} /> Join Now
                      </a>
                  ) : (
                      <a href={call.roomLink} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white py-4 rounded-xl border border-white/10 transition-all text-sm font-bold active:scale-95 shadow-sm">
                          <LinkIcon size={18} /> Enter Room
                      </a>
                  )}
                  
                  <button 
                    onClick={() => { navigator.clipboard.writeText(call.roomLink); toast.success("Link copied!"); }}
                    className="p-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors border border-white/10 shadow-sm" title="Copy Link"
                  >
                    <Copy size={20} />
                  </button>
                  
                  {call.startsIn && (
                      <div className="px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-bold text-xs flex items-center gap-2 shadow-inner">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                          Starts {call.startsIn}
                      </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- SCHEDULE CALL MODAL --- */}
        {isScheduling && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsScheduling(false)}></div>
            
            <div className="bg-[#0a0f1e]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] w-full max-w-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]">
              
              <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-[#6d28d9]/10 to-transparent shrink-0">
                <div className="flex justify-between items-center">
                  <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">Schedule Meeting</h2>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Set up a secure video room</p>
                  </div>
                  <button onClick={() => setIsScheduling(false)} className="text-gray-500 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={20} /></button>
                </div>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                  <form id="scheduleForm" onSubmit={handleScheduleSubmit} className="space-y-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Meeting Title *</label>
                              <input type="text" required placeholder="e.g. Weekly Sync" className="w-full bg-[#030408]/60 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-[#6d28d9] transition-all shadow-inner" value={newCallForm.title} onChange={e => setNewCallForm({...newCallForm, title: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Project Link</label>
                              <input type="text" placeholder="e.g. FastLine Backend" className="w-full bg-[#030408]/60 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-[#6d28d9] transition-all shadow-inner" value={newCallForm.project} onChange={e => setNewCallForm({...newCallForm, project: e.target.value})} />
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Agenda / Description</label>
                          <textarea rows="2" placeholder="What will be discussed?" className="w-full bg-[#030408]/60 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-[#6d28d9] transition-all resize-none shadow-inner" value={newCallForm.agenda} onChange={e => setNewCallForm({...newCallForm, agenda: e.target.value})}></textarea>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2 col-span-2 md:col-span-1">
                              <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Date *</label>
                              <div className="relative">
                                  <CalendarIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a19bfe] pointer-events-none z-10" />
                                  <input type="date" required className="custom-date-input w-full bg-[#030408]/60 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white text-sm outline-none focus:border-[#6d28d9] transition-all shadow-inner" value={newCallForm.date} onChange={e => setNewCallForm({...newCallForm, date: e.target.value})} />
                              </div>
                          </div>
                          <div className="space-y-2 col-span-2 md:col-span-1">
                              <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Time *</label>
                              <div className="relative">
                                  <Clock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a19bfe] pointer-events-none z-10" />
                                  <input type="time" required className="custom-date-input w-full bg-[#030408]/60 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white text-sm outline-none focus:border-[#6d28d9] transition-all shadow-inner" value={newCallForm.time} onChange={e => setNewCallForm({...newCallForm, time: e.target.value})} />
                              </div>
                          </div>
                          <div className="space-y-2 col-span-2 md:col-span-1">
                              <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Duration</label>
                              <select className="w-full bg-[#030408]/60 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#6d28d9] transition-all shadow-inner appearance-none cursor-pointer" value={newCallForm.duration} onChange={e => setNewCallForm({...newCallForm, duration: e.target.value})}>
                                  <option value="15m" className="bg-[#101426]">15 min</option>
                                  <option value="30m" className="bg-[#101426]">30 min</option>
                                  <option value="45m" className="bg-[#101426]">45 min</option>
                                  <option value="1h" className="bg-[#101426]">1 hour</option>
                              </select>
                          </div>
                          <div className="space-y-2 col-span-2 md:col-span-1">
                              <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Priority</label>
                              <select className="w-full bg-[#030408]/60 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#6d28d9] transition-all shadow-inner appearance-none cursor-pointer" value={newCallForm.priority} onChange={e => setNewCallForm({...newCallForm, priority: e.target.value})}>
                                  <option value="Routine" className="bg-[#101426]">Routine</option>
                                  <option value="Weekly Sync" className="bg-[#101426]">Weekly Sync</option>
                                  <option value="Urgent" className="bg-[#101426]">Urgent</option>
                              </select>
                          </div>
                      </div>
                  </form>
              </div>

              <div className="p-6 md:p-8 border-t border-white/5 flex gap-4 shrink-0 bg-[#0a0f1e]/80">
                  <button type="button" onClick={() => setIsScheduling(false)} className="flex-1 px-5 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10 shadow-inner">
                    Cancel
                  </button>
                  <button type="submit" form="scheduleForm" className="flex-[2] bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] text-white px-5 py-4 rounded-2xl text-sm font-bold shadow-[0_0_20px_rgba(109,40,217,0.4)] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Video size={18} /> Create Room
                  </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

=======
import React from 'react';
import { PhoneCall } from 'lucide-react';

const CallsPage = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-white text-center animate-message">
    <PhoneCall size={64} className="text-green-400 mb-6" />
    <h2 className="text-3xl font-bold mb-3">Scheduled Calls</h2>
    <p className="text-gray-400 max-w-md">Review upcoming and past voice/video calls.</p>
  </div>
);
>>>>>>> 6177455093f7fec61a5cef28758f30915ee7d335
export default CallsPage;