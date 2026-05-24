import React, { useState, useEffect } from 'react';
import { FolderKanban, Search, Plus, Home, MoreVertical, Clock, Users, CheckCircle2, Shield, Code2, BookOpen, BarChart3, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ProjectsPage = ({ onNavigate, currentUser }) => {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Стани для модалки створення проєкту
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // 1. ОТРИМАННЯ ПРОЄКТІВ
  const fetchProjects = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userId = currentUser.id || currentUser.email; 
      
      // Зверніть увагу: використовуємо Query-параметр ?userId=...
      const response = await fetch(`https://backendfastline.onrender.com/projects?userId=${encodeURIComponent(userId)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Мапимо дані бекенду на наш дизайн.
        // Оскільки бекенд поки не зберігає іконки/кольори, підставляємо їх динамічно.
        const icons = [<Shield size={24}/>, <Code2 size={24}/>, <BookOpen size={24}/>, <BarChart3 size={24}/>];
        const colors = ["from-blue-600 to-indigo-600", "from-purple-600 to-pink-600", "from-emerald-600 to-teal-600", "from-orange-500 to-red-600"];

        const enrichedProjects = data.map((p, idx) => ({
            id: p.id,
            title: p.name,
            description: "A collaborative workspace project.",
            progress: p.progress || 0,
            status: p.status === 'active' ? "In Progress" : p.status,
            deadline: p.deadline || "TBD",
            icon: React.cloneElement(icons[idx % icons.length], { className: "text-white" }),
            color: colors[idx % colors.length],
            tags: ["project", p.visibility || "private"],
            teamCount: p.members?.length || 1,
            raw: p
        }));

        setProjects(enrichedProjects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentUser]);

  // 2. СТВОРЕННЯ ПРОЄКТУ
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const userId = currentUser.id || currentUser.email;

      const response = await fetch('https://backendfastline.onrender.com/projects', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
            name: newProjectName, 
            ownerId: userId 
        })
      });

      if (response.ok) {
        toast.success("Project created successfully!");
        setNewProjectName('');
        setIsCreating(false);
        fetchProjects(); // Оновлюємо список
      } else {
        toast.error("Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Network error");
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar relative z-10">
      <Toaster position="top-center" />

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
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-purple-900/20 text-sm font-bold active:scale-95 hover:opacity-90"
          >
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
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center text-[#a19bfe] font-bold animate-pulse">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-[#101426]/30 backdrop-blur-sm rounded-[2.5rem] border border-dashed border-white/10 animate-in fade-in duration-700">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-600"><FolderKanban size={32} /></div>
            <p className="text-gray-500 font-bold">No active projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
          {filteredProjects.map((project, idx) => (
            <div 
              key={project.id} 
              onClick={() => {
                // Передаємо ID обраного проєкту для сторінки ProjectDetailsPage
                onNavigate('project_details', project.id);
              }} 
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

              {/* Footer Data */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                    {project.status === 'Completed' ? <CheckCircle2 size={14} className="text-emerald-500"/> : <Clock size={14} />}
                    <span className={project.status === 'Completed' ? 'text-emerald-500' : ''}>{project.status}</span>
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
      )}

      {/* --- MODAL: CREATE PROJECT --- */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsCreating(false)}></div>
          
          <div className="bg-[#101426] border border-white/10 rounded-[2.5rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-[#6d28d9]/10 to-transparent shrink-0">
              <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">New Project</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Create a new workspace</p>
                </div>
                <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={20} /></button>
              </div>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Project Name *</label>
                    <input 
                      type="text" required 
                      placeholder="e.g. FastLine Redesign" 
                      className="w-full bg-[#060813]/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-[#6d28d9] transition-all shadow-inner" 
                      value={newProjectName} 
                      onChange={e => setNewProjectName(e.target.value)} 
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setIsCreating(false)} className="flex-1 px-5 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                      Cancel
                    </button>
                    <button type="submit" className="flex-[2] bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] text-white px-5 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:opacity-90 active:scale-[0.98] transition-all">
                      Create Project
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectsPage;