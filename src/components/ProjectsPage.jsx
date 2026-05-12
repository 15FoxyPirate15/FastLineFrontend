import React, { useState } from 'react';
import { FolderKanban, Search, Plus, Home, MoreVertical, Clock, Users, CheckCircle2, ChevronRight, Code2, BookOpen, BarChart3, Shield } from 'lucide-react';

const ProjectsPage = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Тестові дані для проєктів
  const mockProjects = [
    {
      id: 1,
      title: "Secure Auth Service",
      description: "Implementing OAuth2 and role-based access for the university portal.",
      progress: 65,
      status: "In Progress",
      deadline: "2026-06-15",
      icon: <Shield size={24} className="text-white" />,
      color: "from-blue-600 to-indigo-600",
      tags: ["cybersecurity", "backend"],
      teamCount: 4
    },
    {
      id: 2,
      title: "C++ Stack Implementation",
      description: "Custom template class for a stack data structure with strict memory management and recursion.",
      progress: 90,
      status: "Review",
      deadline: "2026-05-20",
      icon: <Code2 size={24} className="text-white" />,
      color: "from-purple-600 to-pink-600",
      tags: ["cpp", "algorithms"],
      teamCount: 2
    },
    {
      id: 3,
      title: "Kyivan Rus' History",
      description: "Academic documentation work covering cultural history and Slavic mythology.",
      progress: 30,
      status: "Planning",
      deadline: "2026-06-01",
      icon: <BookOpen size={24} className="text-white" />,
      color: "from-emerald-600 to-teal-600",
      tags: ["documentation", "research"],
      teamCount: 1
    },
    {
      id: 4,
      title: "Hospitality Marketing",
      description: "Porter's model and BCG matrix analysis for the local tourism sector.",
      progress: 100,
      status: "Completed",
      deadline: "2026-05-10",
      icon: <BarChart3 size={24} className="text-white" />,
      color: "from-orange-500 to-red-600",
      tags: ["marketing", "analysis"],
      teamCount: 3
    }
  ];

  const filteredProjects = mockProjects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar relative z-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-black text-white tracking-tight">Active Projects</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Manage your team's ongoing initiatives and tracking.</p>
        </div>

        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
          <button 
            onClick={() => onNavigate('welcome')} 
            className="flex items-center gap-2 bg-[#101426] hover:bg-[#1a1f3c] text-gray-300 hover:text-white px-4 py-2.5 rounded-2xl transition-all border border-white/5 shadow-inner"
          >
            <Home size={18} /> <span className="text-sm font-bold">Home</span>
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-purple-900/20 text-sm font-bold active:scale-95 hover:opacity-90">
            <Plus size={18} /> Create Project
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150 fill-mode-backwards">
        <div className="max-w-md bg-[#101426]/60 backdrop-blur-xl border border-white/5 flex items-center px-4 py-3.5 rounded-2xl focus-within:border-[#6d28d9]/50 transition-all shadow-inner">
          <Search size={20} className="text-[#a19bfe] mr-3" />
          <input 
            type="text" 
            placeholder="Search projects or tags..." 
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-600 font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* PROJECTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
        {filteredProjects.map((project, idx) => (
          <div 
            key={project.id} 
            onClick={() => onNavigate('project_details')} // ДОДАНО ЦЕЙ РЯДОК
            className="bg-[#101426]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 hover:bg-[#161b33]/80 hover:border-[#6d28d9]/40 hover:-translate-y-1 transition-all duration-300 group shadow-lg flex flex-col animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards cursor-pointer"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex justify-between items-start mb-5">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${project.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                {project.icon}
              </div>
              <button className="p-2 text-gray-600 hover:text-white transition-colors bg-white/5 rounded-full opacity-0 group-hover:opacity-100">
                <MoreVertical size={16} />
              </button>
            </div>

            <div className="mb-4 flex-1">
              <h3 className="text-white font-bold text-xl mb-2 group-hover:text-[#a19bfe] transition-colors line-clamp-1">{project.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{project.description}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map(tag => (
                <span key={tag} className="text-[10px] font-bold text-[#a19bfe] bg-[#6d28d9]/10 px-2 py-1 rounded-lg border border-[#6d28d9]/20 uppercase tracking-wider">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mb-6 bg-[#060813]/50 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-gray-300">Progress</span>
                <span className="text-xs font-bold text-[#a19bfe]">{project.progress}%</span>
              </div>
              <div className="w-full bg-[#1e2336] rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${project.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Footer Data */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                  {project.status === 'Completed' ? <CheckCircle2 size={14} className="text-emerald-500"/> : <Clock size={14} />}
                  <span className={project.status === 'Completed' ? 'text-emerald-500' : ''}>{project.deadline}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-gray-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-xs font-bold group-hover:bg-white/10 transition-colors">
                <Users size={14} />
                <span>{project.teamCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ProjectsPage;