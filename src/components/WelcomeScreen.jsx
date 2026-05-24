<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { ListTodo, Calendar, PhoneCall, Video, ArrowUpRight, Sparkles, Activity, CheckCircle2, UserPlus, FolderKanban, MessageSquare, Clock, ArrowRight } from 'lucide-react'; 

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
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Отримуємо поточну дату
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const firstName = currentUser?.name?.split(' ')[0] || currentUser?.full_name?.split(' ')[0] || 'Team';

  useEffect(() => {
    // Імітація завантаження з бекенду (GET /users/me/feed)
    setTimeout(() => {
      setActivities([
        { id: 1, type: 'task_completed', user: 'Maxim', text: 'completed task "JWT setup"', time: '10 mins ago', actionPath: 'tasks' },
        { id: 2, type: 'project_joined', user: 'Katya', text: 'joined "FastLine Redesign"', time: '2 hours ago', actionPath: 'projects' },
        { id: 3, type: 'mention', user: 'Orest', text: 'mentioned you in a comment', time: 'Yesterday', actionPath: 'projects' }
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const getIconForType = (type) => {
    switch(type) {
      case 'task_completed': return <CheckCircle2 size={14} className="text-emerald-400" />;
      case 'project_joined': return <UserPlus size={14} className="text-blue-400" />;
      case 'mention': return <MessageSquare size={14} className="text-pink-400" />;
      case 'new_project': return <FolderKanban size={14} className="text-purple-400" />;
      default: return <Activity size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full w-full text-white relative z-10 overflow-y-auto custom-scrollbar p-6 md:p-12"> 
      
      <WorkspaceBackground />

      {/* Bento Сітка */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl relative z-10 my-auto">
        
        {/* ВЕЛИКА КАРТКА ПРИВІТАННЯ + СТРІЧКА НОВИН */}
        <div className="md:col-span-2 bg-[#0a0f1e]/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-backwards shadow-2xl">
          {/* Внутрішній відблиск */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-[#6d28d9]/30 to-[#3b82f6]/30 rounded-full blur-[80px] group-hover:blur-[100px] transition-all duration-700 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div>
                <div className="flex items-center gap-2 text-[#a19bfe] font-medium mb-6">
                <Sparkles size={18} />
                <span>{dateString}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                Welcome back, <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a19bfe] to-[#3b82f6]">{firstName}!</span>
                </h1>
            </div>

            {/* Вбудована Стрічка Активності */}
            <div className="mt-2 flex-1 flex flex-col bg-[#030408]/60 border border-white/5 rounded-2xl p-5 shadow-inner">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity size={12} className="text-[#3b82f6]"/> Latest Updates
                </h3>
                
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500 text-sm animate-pulse min-h-[100px]">Loading updates...</div>
                ) : activities.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500 text-sm italic min-h-[100px]">No recent activity.</div>
                ) : (
                    <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar max-h-[160px]">
                        {activities.map((act) => (
                        <div key={act.id} onClick={() => onNavigate(act.actionPath)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer group/item">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-[#1e2336] flex items-center justify-center shrink-0 border border-white/5 shadow-sm">
                                    {getIconForType(act.type)}
                                </div>
                                <div className="truncate">
                                    <p className="text-sm text-gray-300 truncate">
                                        <span className="font-bold text-white mr-1">{act.user}</span>
                                        {act.text}
                                    </p>
                                    <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5"><Clock size={10}/> {act.time}</p>
                                </div>
                            </div>
                            <ArrowRight size={14} className="text-gray-600 opacity-0 group-hover/item:opacity-100 group-hover/item:text-white transition-all transform -translate-x-2 group-hover/item:translate-x-0 shrink-0 ml-2" />
                        </div>
                        ))}
                    </div>
                )}
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

=======
import React from 'react';
import { ListTodo, Calendar, PhoneCall, Video } from 'lucide-react'; 

const WelcomeScreen = ({ onNavigate }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full w-full text-white relative z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2d266f] to-[#0f0c29]"> 
      
      <div className="flex flex-col items-center max-w-5xl w-full px-4">
        
        <div className="w-32 h-32 bg-[#1e1b4b] border-[3px] border-[#b048dd] rounded-[1rem] flex items-center justify-center mb-10 shadow-[0_0_60px_-10px_rgba(176,72,221,0.4)]">
            
            <div className="flex gap-3"> 
                <div className="w-4 h-4 rounded-full bg-[#b048dd]"></div>
                <div className="w-4 h-4 rounded-full bg-[#b048dd]"></div>
                <div className="w-4 h-4 rounded-full bg-[#b048dd]"></div>
            </div>

        </div>

        <h1 className="text-5xl font-medium mb-4 tracking-tight text-center">
          Welcome to <span className="text-[#a78bfa]">FastLine</span>
        </h1>
        
        <p className="text-[#94a3b8] text-lg mb-20 text-center max-w-xl font-light leading-relaxed">
          Your secure workspace for team collaboration, project management, and professional communication.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl px-4">
            <FeatureCard icon={<ListTodo size={24} />} title="Tasks" subtitle="Manage tasks" onClick={() => onNavigate('tasks')} />
            <FeatureCard icon={<Calendar size={24} />} title="Calendar" subtitle="View schedule" onClick={() => onNavigate('calendar')} />
            <FeatureCard icon={<PhoneCall size={24} />} title="Scheduled Calls" subtitle="Upcoming calls" onClick={() => onNavigate('calls')} />
            <FeatureCard icon={<Video size={24} />} title="Saved Meetings" subtitle="Meeting history" onClick={() => onNavigate('meetings')} />
        </div>
>>>>>>> 6177455093f7fec61a5cef28758f30915ee7d335
      </div>
    </div>
  );
};

<<<<<<< HEAD
=======
const FeatureCard = ({ icon, title, subtitle, onClick }) => (
    <div 
        className="bg-[#0f172a]/40 backdrop-blur-sm border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center gap-4 cursor-pointer group hover:bg-[#1e293b]/60 transition-all duration-300"
        onClick={onClick}
    >
        <div className="w-12 h-12 bg-[#2f235f] rounded-xl flex items-center justify-center text-[#a78bfa] group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
        <div className="flex flex-col gap-1">
            <span className="text-white font-medium text-lg tracking-wide">{title}</span>
            <span className="text-gray-500 text-sm font-medium">{subtitle}</span>
        </div>
    </div>
);

>>>>>>> 6177455093f7fec61a5cef28758f30915ee7d335
export default WelcomeScreen;