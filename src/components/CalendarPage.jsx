import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, Plus } from 'lucide-react';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const events = [
    { id: 1, title: "Team Weekly Sync", time: "10:00 - 11:30", type: "work", location: "Zoom Meeting" },
    { id: 2, title: "Lunch with Maxim", time: "13:00 - 14:00", type: "personal", location: "Gastro Family" },
    { id: 3, title: "Project Review", time: "15:00 - 16:30", type: "work", location: "Office, Room 303" },
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => {
    return day === selectedDate.getDate() && 
           currentDate.getMonth() === selectedDate.getMonth() && 
           currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 md:h-14"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div 
          key={day} 
          onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
          className={`
            h-10 md:h-14 w-10 md:w-14 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-200 text-sm md:text-base font-medium
            ${isSelected(day) ? 'bg-[#7c3aed] text-white shadow-lg shadow-purple-500/50 scale-110' : ''}
            ${isToday(day) && !isSelected(day) ? 'border border-[#7c3aed] text-[#a78bfa]' : ''}
            ${!isSelected(day) && !isToday(day) ? 'text-gray-400 hover:bg-white/5 hover:text-white' : ''}
          `}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="flex-1 p-4 md:p-8 h-full overflow-y-auto bg-gradient-to-br from-[#131520] via-[#0f111a] to-[#08090d]">
      
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 h-full">
        
        <div className="flex-1 bg-[#1e2336]/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
          
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {monthNames[currentDate.getMonth()]} <span className="text-[#7c3aed]">{currentDate.getFullYear()}</span>
            </h2>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition">
                <ChevronLeft size={20} />
              </button>
              <button onClick={handleNextMonth} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-4 text-center">
            {daysOfWeek.map(day => (
              <div key={day} className="text-[#a78bfa] text-xs md:text-sm font-semibold uppercase tracking-wider mb-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 place-items-center gap-y-2">
            {renderCalendarDays()}
          </div>
        </div>

        <div className="w-full lg:w-96 flex flex-col gap-6">
          
          <div className="bg-[#7c3aed] rounded-3xl p-6 text-white shadow-lg shadow-purple-900/40 relative overflow-hidden">
             <div className="relative z-10">
                <div className="text-lg font-medium opacity-90">{daysOfWeek[selectedDate.getDay()]}</div>
                <div className="text-4xl font-bold mt-1">{selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}</div>
                <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">3 Events</span>
                    <button className="bg-white text-purple-700 p-2 rounded-lg hover:scale-105 transition shadow-md">
                        <Plus size={20} />
                    </button>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          </div>

          <div className="flex-1 bg-[#1e2336]/30 border border-white/5 rounded-3xl p-6 overflow-y-auto">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">Upcoming Schedule</h3>
            
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className="group p-4 rounded-2xl bg-[#161822] border border-white/5 hover:border-[#7c3aed]/50 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-semibold">{event.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${event.type === 'work' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'}`}>
                        {event.type}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-500 text-xs">
                        <Clock size={14} className="mr-2 text-[#7c3aed]" />
                        {event.time}
                    </div>
                    <div className="flex items-center text-gray-500 text-xs">
                        <MapPin size={14} className="mr-2 text-[#7c3aed]" />
                        {event.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
                <button className="text-[#a78bfa] text-sm hover:text-white transition">View all tasks</button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CalendarPage;