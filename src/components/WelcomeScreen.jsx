import React, { useState, useEffect } from 'react';
import { ListTodo, Calendar, PhoneCall, Video, Zap, ArrowUpRight, Sparkles } from 'lucide-react'; 

// НОВИЙ ФОН: "Aurora Grid" (Північне сяйво + Сітка)
const WorkspaceBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#05060f]">
      
      {/* 1. Повільне "Північне сяйво" (Aurora) - фірмові кольори */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#6d28d9] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#3b82f6] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" style={{ animationDuration: '12s' }}></div>
      <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-[#a19bfe] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse" style={{ animationDuration: '10s' }}></div>

      {/* 2. Технічна сітка (Grid) */}
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
        `}
      </style>
      <div className="absolute inset-0 tech-grid"></div>
    </div>
  );
};

const WelcomeScreen = ({ onNavigate, currentUser }) => {
  
  // Отримуємо поточну дату
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const firstName = currentUser?.name?.split(' ')[0] || 'Team';

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full w-full text-white relative z-10 overflow-hidden p-6 md:p-12"> 
      
      <WorkspaceBackground />

      {/* Bento Сітка */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl relative z-10">
        
        {/* ВЕЛИКА КАРТКА ПРИВІТАННЯ */}
        <div className="md:col-span-2 bg-[#0a0f1e]/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-backwards shadow-2xl">
          {/* Внутрішній відблиск */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-[#6d28d9]/30 to-[#3b82f6]/30 rounded-full blur-[80px] group-hover:blur-[100px] transition-all duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[#a19bfe] font-medium mb-6">
              <Sparkles size={18} />
              <span>{dateString}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              Welcome back, <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a19bfe] to-[#3b82f6]">{firstName}!</span>
            </h1>
            <p className="text-gray-400 max-w-md text-lg leading-relaxed">
              Your secure FastLine workspace is ready. What would you like to focus on today?
            </p>
          </div>

          <div className="mt-10 relative z-10">
             <div className="inline-flex items-center gap-3 bg-[#030408]/60 border border-white/5 px-5 py-3 rounded-2xl shadow-inner">
                <Zap size={20} className="text-[#3b82f6]" />
                <span className="text-sm font-bold text-gray-300">All systems operational</span>
             </div>
          </div>
        </div>

        {/* ВІДЖЕТ ЗАВДАНЬ */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="md:col-span-1 bg-[#0a0f1e]/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 flex flex-col justify-between cursor-pointer group hover:bg-[#12182b]/60 hover:-translate-y-2 hover:border-[#a19bfe]/50 hover:shadow-[0_10px_40px_-10px_rgba(161,155,254,0.2)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-backwards"
        >
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 bg-[#030408]/80 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 group-hover:border-[#a19bfe]/30 transition-all duration-300">
              <ListTodo size={28} className="text-[#a19bfe]" />
            </div>
            <ArrowUpRight size={24} className="text-gray-600 group-hover:text-white transition-colors" />
          </div>
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-white mb-2">Tasks</h3>
            <p className="text-gray-400 text-sm font-medium">Manage your workflow & to-do lists</p>
          </div>
        </div>

        {/* ВІДЖЕТ КАЛЕНДАРЯ */}
        <div 
          onClick={() => onNavigate('calendar')}
          className="md:col-span-1 bg-[#0a0f1e]/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 flex flex-col justify-between cursor-pointer group hover:bg-[#12182b]/60 hover:-translate-y-2 hover:border-[#3b82f6]/50 hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.2)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-[450ms] fill-mode-backwards"
        >
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 bg-[#030408]/80 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 group-hover:border-[#3b82f6]/30 transition-all duration-300">
              <Calendar size={28} className="text-[#3b82f6]" />
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-1">Calendar</h3>
            <p className="text-gray-400 text-sm">View your schedule</p>
          </div>
        </div>

        {/* ВІДЖЕТ ДЗВІНКІВ */}
        <div 
          onClick={() => onNavigate('calls')}
          className="md:col-span-1 bg-[#0a0f1e]/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 flex flex-col justify-between cursor-pointer group hover:bg-[#12182b]/60 hover:-translate-y-2 hover:border-[#ec4899]/50 hover:shadow-[0_10px_40px_-10px_rgba(236,72,153,0.2)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-[600ms] fill-mode-backwards"
        >
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 bg-[#030408]/80 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 group-hover:border-[#ec4899]/30 transition-all duration-300">
              <PhoneCall size={28} className="text-[#ec4899]" />
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-1">Calls</h3>
            <p className="text-gray-400 text-sm">Upcoming syncs</p>
          </div>
        </div>

        {/* ВІДЖЕТ ЗУСТРІЧЕЙ */}
        <div 
          onClick={() => onNavigate('meetings')}
          className="md:col-span-1 bg-[#0a0f1e]/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 flex flex-col justify-between cursor-pointer group hover:bg-[#12182b]/60 hover:-translate-y-2 hover:border-[#10b981]/50 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.2)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-[750ms] fill-mode-backwards"
        >
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 bg-[#030408]/80 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 group-hover:border-[#10b981]/30 transition-all duration-300">
              <Video size={28} className="text-[#10b981]" />
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-1">Meetings</h3>
            <p className="text-gray-400 text-sm">Saved recordings</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WelcomeScreen;