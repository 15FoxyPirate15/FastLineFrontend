import React from 'react';
import { MoreHorizontal, ListTodo, Calendar, PhoneCall, Video } from 'lucide-react'; 

const WelcomeScreen = ({ onNavigate }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden h-full w-full text-white"> 
      
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Center Content */}
      <div className="relative z-10 text-center max-w-2xl">
        
        {/* Big Icon */}
        <div className="mx-auto w-24 h-24 bg-[#2e1065] rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-purple-900/50 border border-white/10">
            <MoreHorizontal size={48} className="text-purple-400" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to <span className="text-purple-400">FastLine</span>
        </h1>
        <p className="text-gray-400 text-lg mb-12 px-8">
          Your secure workspace for team collaboration, project management, and professional communication.
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
            <FeatureCard icon={<ListTodo />} title="Tasks" subtitle="Manage tasks" onClick={() => onNavigate('tasks')} />
            <FeatureCard icon={<Calendar />} title="Calendar" subtitle="View schedule" onClick={() => onNavigate('calendar')} />
            <FeatureCard icon={<PhoneCall />} title="Scheduled Calls" subtitle="Upcoming calls" onClick={() => onNavigate('calls')} />
            <FeatureCard icon={<Video />} title="Saved Meetings" subtitle="Meeting history" onClick={() => onNavigate('meetings')} />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, subtitle, onClick }) => (
    <div 
        className="bg-[#1e293b]/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:bg-[#1e293b]/80 cursor-pointer transition flex flex-col items-center gap-3 group"
        onClick={onClick}
    >
        <div className="p-3 bg-[#2e1065]/50 rounded-xl group-hover:scale-110 transition text-purple-300">
            {icon}
        </div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
);

export default WelcomeScreen;