import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, Plus, Home, Calendar as CalendarIcon } from 'lucide-react';

const CalendarPage = ({ onNavigate }) => {
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
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
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

    // Порожні клітинки на початку місяця
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 md:h-14"></div>);
    }

    // Дні місяця
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div 
          key={day} 
          onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
          className={`
            h-10 md:h-12 w-10 md:w-12 mx-auto flex items-center justify-center rounded-xl cursor-pointer transition-all duration-200 text-sm md:text-base font-medium
            ${isSelected(day) ? 'bg-[#6d28d9] text-white shadow-lg shadow-purple-900/50 scale-105 border border-[#a19bfe]/50' : ''}
            ${isToday(day) && !isSelected(day) ? 'bg-white/10 text-white border border-white/20' : ''}
            ${!isSelected(day) && !isToday(day) ? 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10' : ''}
          `}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar relative z-10">
      
      {/* HEADER (У стилі інших сторінок) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Calendar</h1>
          <p className="text-gray-400 text-sm mt-1">Plan your schedule and keep track of events.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('welcome')} 
            className="flex items-center gap-2 bg-[#131933] hover:bg-white/10 text-gray-300 hover:text-white px-4 py-2 rounded-xl transition-all border border-white/10 shadow-inner"
          >
            <Home size={16} /> <span className="text-sm font-medium">Home</span>
          </button>
          <button className="flex items-center gap-2 bg-[#6d28d9] hover:bg-[#5b21b6] text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-purple-900/20 text-sm font-medium">
            <Plus size={16} /> Add Event
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6">
        
        {/* КАЛЕНДАР (Ліва частина) */}
        <div className="flex-1 bg-[#1d1a4a] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <CalendarIcon size={24} className="text-[#a19bfe]" />
              {monthNames[currentDate.getMonth()]} <span className="text-gray-500 font-normal">{currentDate.getFullYear()}</span>
            </h2>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-2 rounded-xl bg-[#131933] hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={handleNextMonth} className="p-2 rounded-xl bg-[#131933] hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-4 text-center">
            {daysOfWeek.map(day => (
              <div key={day} className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 place-items-center gap-y-3">
            {renderCalendarDays()}
          </div>
        </div>

        {/* ПАНЕЛЬ ПОДІЙ (Права частина) */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          
          {/* Вибрана дата */}
          <div className="bg-gradient-to-br from-[#4c1d95] to-[#3b0764] rounded-2xl p-6 text-white shadow-xl border border-purple-500/30 relative overflow-hidden group">
             <div className="relative z-10">
                <div className="text-sm font-bold tracking-widest uppercase text-purple-300 mb-1">{daysOfWeek[selectedDate.getDay()]}</div>
                <div className="text-4xl font-black tracking-tight">{selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}</div>
                <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                      {events.length} Events today
                    </span>
                    <button className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl transition-colors backdrop-blur-md border border-white/10">
                        <Plus size={18} />
                    </button>
                </div>
             </div>
             {/* Декоративні елементи */}
             <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-purple-400/30 transition-colors duration-500"></div>
          </div>

          {/* Список подій */}
          <div className="flex-1 bg-[#1d1a4a] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col h-fit max-h-[500px]">
            <h3 className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-4">Schedule</h3>
            
            <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
              {events.map(event => (
                <div key={event.id} className="group p-4 rounded-xl bg-[#131933] border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer shadow-sm relative overflow-hidden">
                  
                  {/* Кольоровий індикатор типу події */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${event.type === 'work' ? 'bg-blue-500' : 'bg-pink-500'}`}></div>

                  <div className="flex justify-between items-start mb-3 pl-2">
                    <h4 className="text-white text-sm font-semibold group-hover:text-[#a19bfe] transition-colors">{event.title}</h4>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${event.type === 'work' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-pink-500/10 text-pink-400 border-pink-500/20'}`}>
                        {event.type}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 pl-2">
                    <div className="flex items-center text-gray-400 text-xs font-medium">
                        <Clock size={12} className="mr-2 text-gray-500" />
                        {event.time}
                    </div>
                    <div className="flex items-center text-gray-400 text-xs font-medium">
                        <MapPin size={12} className="mr-2 text-gray-500" />
                        {event.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-4 w-full py-2.5 bg-[#131933] hover:bg-white/5 border border-white/5 rounded-xl text-[#a19bfe] hover:text-white text-sm font-medium transition-colors">
              View all week
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CalendarPage;