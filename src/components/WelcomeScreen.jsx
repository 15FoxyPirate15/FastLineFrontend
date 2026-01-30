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
      </div>
    </div>
  );
};

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

export default WelcomeScreen;