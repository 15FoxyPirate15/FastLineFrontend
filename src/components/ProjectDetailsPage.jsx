import React from 'react';
import { ArrowLeft, Settings, Users, Clock, CheckCircle2, Shield, Plus, FileText, MessageSquare, Activity, Calendar, GitCommit } from 'lucide-react';

const ProjectDetailsPage = ({ onNavigate, projectId }) => {
  // Тестові дані конкретного проєкту
  const project = {
    title: "Secure Auth Service",
    description: "Implementing OAuth2, JWT tokens, and role-based access control (RBAC) for the university portal. Ensuring end-to-end encryption for all auth endpoints.",
    progress: 65,
    status: "In Progress",
    deadline: "2026-06-15",
    team: [
      { name: "Maxim", role: "Backend Lead", color: "from-blue-500 to-indigo-600", initial: "M" },
      { name: "Orest", role: "Security Eng.", color: "from-purple-500 to-pink-600", initial: "O" },
      { name: "Stanislav", role: "Frontend Dev", color: "from-emerald-400 to-teal-500", initial: "S" }
    ],
    tasks: [
      { id: 1, title: "Setup JWT generation", status: "done", priority: "high" },
      { id: 2, title: "Create login UI mockup", status: "in_progress", priority: "medium" },
      { id: 3, title: "Write tests for auth endpoints", status: "todo", priority: "low" }
    ],
    recentActivity: [
      { id: 1, user: "Maxim", action: "pushed code to", target: "main branch", time: "2 hours ago" },
      { id: 2, user: "Orest", action: "completed task", target: "JWT setup", time: "Yesterday" },
      { id: 3, user: "Stanislav", action: "uploaded file", target: "ui_v2.fig", time: "2 days ago" }
    ]
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar relative z-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 sticky top-0 bg-[#05060f]/80 backdrop-blur-md z-20 py-2 -mx-2 px-2 rounded-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('projects')} 
            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all border border-white/5 active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                {project.title}
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                  {project.status}
                </span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all border border-white/5">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        
        {/* ЛІВА КОЛОНКА (Ширша) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Опис та Прогрес */}
          <div className="bg-[#101426]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-[11px] font-black text-[#a19bfe] uppercase tracking-[0.2em] mb-3">Overview</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 bg-[#060813]/50 p-4 rounded-2xl border border-white/5 shadow-inner">
              {project.description}
            </p>

            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2"><Activity size={14} className="text-[#3b82f6]"/> Project Progress</span>
              <span className="text-sm font-black text-[#3b82f6]">{project.progress}%</span>
            </div>
            <div className="w-full bg-[#1e2336] rounded-full h-2.5 overflow-hidden border border-white/5 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${project.progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
            <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
          </div>

          {/* Віджет Тасок */}
          <div className="bg-[#101426]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[11px] font-black text-[#a19bfe] uppercase tracking-[0.2em]">Current Tasks</h3>
              <button className="text-xs font-bold text-[#3b82f6] hover:text-white transition-colors bg-[#3b82f6]/10 px-3 py-1.5 rounded-lg">View All Board</button>
            </div>
            
            <div className="space-y-3">
              {project.tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between bg-[#161b33] p-4 rounded-2xl border border-white/5 hover:border-[#6d28d9]/30 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3">
                    {task.status === 'done' ? (
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    ) : task.status === 'in_progress' ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#3b82f6] border-t-transparent animate-spin"></div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-600 group-hover:border-white transition-colors"></div>
                    )}
                    <span className={`text-sm font-semibold ${task.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-200 group-hover:text-white'}`}>
                      {task.title}
                    </span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${
                    task.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                    task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                    'bg-green-500/10 text-green-400 border-green-500/20'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ПРАВА КОЛОНКА (Вужча) */}
        <div className="flex flex-col gap-6">
          
          {/* Інформація */}
          <div className="bg-[#101426]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex items-center gap-3 mb-6 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-[#1d1a4a] flex items-center justify-center text-[#a19bfe]"><Calendar size={18} /></div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Deadline</p>
                <p className="text-white font-bold text-sm">{project.deadline}</p>
              </div>
            </div>

            <h3 className="text-[11px] font-black text-[#a19bfe] uppercase tracking-[0.2em] mb-4">Team Members</h3>
            <div className="space-y-3">
              {project.team.map((member, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${member.color} flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/10`}>
                    {member.initial}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{member.name}</div>
                    <div className="text-[11px] text-gray-500">{member.role}</div>
                  </div>
                </div>
              ))}
              <button className="w-full mt-2 py-3 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-dashed border-gray-600 hover:border-gray-400">
                <Plus size={14} /> Add Member
              </button>
            </div>
          </div>

          {/* Віджет активності */}
          <div className="bg-[#101426]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <h3 className="text-[11px] font-black text-[#a19bfe] uppercase tracking-[0.2em] mb-4">Recent Activity</h3>
            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {project.recentActivity.map((activity, idx) => (
                <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-[#101426] bg-[#6d28d9] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <GitCommit size={12} />
                  </div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-white/5 bg-[#161b33] shadow-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 font-medium">{activity.time}</span>
                      <p className="text-xs text-gray-300">
                        <span className="font-bold text-white">{activity.user}</span> {activity.action} <span className="font-medium text-[#a19bfe]">{activity.target}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;