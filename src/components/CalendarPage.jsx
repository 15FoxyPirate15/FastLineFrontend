import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Plus, Home, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
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

const CalendarPage = ({ onNavigate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://backendfastline.onrender.com/calendar', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    const title = prompt("Event title:");
    if (!title) return;
    const time = prompt("Event time (e.g. 14:00):", "12:00");
    
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://backendfastline.onrender.com/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, date: dateStr, time: time || "All day" })
      });
      if (response.ok) fetchEvents();
    } catch (error) {
      toast.error("Failed to create event");
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://backendfastline.onrender.com/calendar/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => {
    return day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth() && currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const dailyEvents = events.filter(e => e.date === selectedDateStr);

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-10 md:h-14"></div>);

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div 
          key={day} 
          onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
          className={`
            h-10 md:h-12 w-10 md:w-12 mx-auto flex items-center justify-center rounded-xl cursor-pointer transition-all duration-300 text-sm md:text-base font-bold relative z-10
            ${isSelected(day) ? 'bg-gradient-to-br from-[#6d28d9] to-[#3b82f6] text-white shadow-[0_0_20px_rgba(109,40,217,0.5)] scale-110 border border-white/20' : ''}
            ${isToday(day) && !isSelected(day) ? 'bg-white/10 text-white border border-white/20' : ''}
            ${!isSelected(day) && !isToday(day) ? 'text-gray-400 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10' : ''}
          `}
        >
          {day}
          {events.some(e => e.date === `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`) && (
            <div className="absolute -bottom-1 md:bottom-1 w-1.5 h-1.5 bg-[#a19bfe] rounded-full shadow-[0_0_5px_rgba(161,155,254,0.8)]"></div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full text-white relative z-10 overflow-y-auto custom-scrollbar p-6 md:p-12">
      <Toaster position="top-center" />
      <WorkspaceBackground />

      <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col h-full">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Calendar</h1>
            <p className="text-gray-400 text-base mt-2">Plan your schedule and keep track of events.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('welcome')} className="flex items-center gap-2 bg-[#0a0f1e]/60 backdrop-blur-xl border border-white/10 hover:border-white/30 text-gray-300 hover:text-white px-5 py-3 rounded-2xl transition-all font-bold shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <Home size={18} /> Home
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-backwards pb-10">
          
          {/* MAIN CALENDAR GRID */}
          <div className="flex-[2] bg-[#0a0f1e]/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col h-fit">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <CalendarIcon size={28} className="text-[#a19bfe]" />
                {monthNames[currentDate.getMonth()]} <span className="text-gray-600 font-medium">{currentDate.getFullYear()}</span>
              </h2>
              <div className="flex gap-3">
                <button onClick={handlePrevMonth} className="p-3 rounded-2xl bg-[#030408]/60 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-all shadow-inner"><ChevronLeft size={20} /></button>
                <button onClick={handleNextMonth} className="p-3 rounded-2xl bg-[#030408]/60 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-all shadow-inner"><ChevronRight size={20} /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-6 text-center">
              {daysOfWeek.map(day => <div key={day} className="text-gray-500 text-[11px] font-black uppercase tracking-widest">{day}</div>)}
            </div>

            <div className="grid grid-cols-7 place-items-center gap-y-4 gap-x-2">
              {renderCalendarDays()}
            </div>
          </div>

          {/* SIDE PANEL */}
          <div className="flex-1 flex flex-col gap-8 w-full lg:max-w-md">
            
            {/* GLOWING SELECTED DATE CARD */}
            <div className="bg-gradient-to-br from-[#6d28d9]/80 to-[#3b82f6]/80 backdrop-blur-2xl rounded-[2.5rem] p-8 text-white shadow-[0_0_40px_rgba(109,40,217,0.3)] border border-white/20 relative overflow-hidden group">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
               <div className="relative z-10">
                  <div className="text-xs font-black tracking-widest uppercase text-white/70 mb-2">{daysOfWeek[selectedDate.getDay()]}</div>
                  <div className="text-5xl font-black tracking-tight mb-8">{selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}</div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-white/20">
                      <span className="text-sm font-bold bg-black/20 px-4 py-2 rounded-xl backdrop-blur-md">
                        {dailyEvents.length} Events today
                      </span>
                      <button onClick={handleAddEvent} className="bg-white text-[#6d28d9] hover:bg-gray-100 p-3.5 rounded-2xl transition-all shadow-lg active:scale-95">
                        <Plus size={20} className="font-black" />
                      </button>
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/20 transition-colors duration-700"></div>
            </div>

            {/* DAILY EVENTS LIST */}
            <div className="flex-1 bg-[#0a0f1e]/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col h-fit max-h-[500px]">
              <h3 className="text-xs text-[#a19bfe] font-black uppercase tracking-widest mb-6">Schedule for {selectedDateStr}</h3>
              
              <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                {isLoading ? (
                  <div className="text-gray-500 text-sm italic">Loading events...</div>
                ) : dailyEvents.length === 0 ? (
                  <div className="text-gray-500 text-sm italic flex flex-col items-center justify-center py-10 bg-[#030408]/40 rounded-2xl border border-dashed border-white/10">
                    No events scheduled.
                  </div>
                ) : (
                  dailyEvents.map(event => (
                    <div key={event.id} className="group p-5 rounded-2xl bg-[#030408]/60 border border-white/5 hover:border-[#a19bfe]/40 transition-all shadow-md relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#6d28d9] to-[#3b82f6]"></div>
                      <div className="flex justify-between items-start mb-3 pl-3">
                        <h4 className="text-white text-base font-bold group-hover:text-[#a19bfe] transition-colors">{event.title}</h4>
                        <button onClick={() => handleDeleteEvent(event.id)} className="text-gray-500 hover:text-red-400 bg-white/5 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"><Trash2 size={16}/></button>
                      </div>
                      <div className="pl-3">
                        <div className="flex items-center text-[#3b82f6] text-xs font-bold bg-[#3b82f6]/10 w-fit px-3 py-1.5 rounded-lg"><Clock size={14} className="mr-2" />{event.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;