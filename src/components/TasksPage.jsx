<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, Play, Trash2, X, Plus, User, RotateCcw, Home, ChevronDown, FolderKanban, Flag } from 'lucide-react';
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

const TasksPage = ({ onNavigate, currentUser }) => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null); 

  useEffect(() => {
    const handleDocClick = () => setActiveDropdown(null);
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

  const toggleDropdown = (e, name) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const fetchTasks = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userId = currentUser.uid || currentUser.id || currentUser.email; 
      const response = await fetch(`https://backendfastline.onrender.com/tasks?userId=${encodeURIComponent(userId)}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data)) setTasks(data);
      else if (data && Array.isArray(data.data)) setTasks(data.data);
      else if (data && Array.isArray(data.tasks)) setTasks(data.tasks);
      else if (data && typeof data === 'object' && data.id) setTasks([data]);
      else setTasks([]);
    } catch (error) { console.error("Error fetching tasks:", error); } 
    finally { setIsLoading(false); }
  };

  const fetchProjectsForDropdown = async () => {
    if (!currentUser) return;
    try {
      const token = localStorage.getItem('token');
      const userId = currentUser.id || currentUser.uid || currentUser.email;
      const res = await fetch(`https://backendfastline.onrender.com/projects?userId=${encodeURIComponent(userId)}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setProjects(await res.json());
    } catch (err) { console.error("Failed to load projects"); }
  };

  useEffect(() => {
    fetchTasks();
    fetchProjectsForDropdown();
  }, [currentUser]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  
  const [newTaskForm, setNewTaskForm] = useState({ title: '', description: '', assignee: '', deadline: '', priority: 'medium', projectId: '' });
  const selectedProjectObj = projects.find(p => p.id === newTaskForm.projectId);

  const getDisplayName = (uid) => {
    if (!uid || uid === 'Unassigned') return "Unassigned";
    if (uid === currentUser?.id || uid === currentUser?.uid) return currentUser?.name || currentUser?.full_name || "You";
    if (uid.length > 20) return `Member_${uid.substring(0, 4)}`;
    return uid;
  };

  const priorities = [
      { id: 'low', label: 'Low', color: 'text-green-400', bg: 'bg-green-500/20' },
      { id: 'medium', label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
      { id: 'high', label: 'High', color: 'text-red-400', bg: 'bg-red-500/20' }
  ];

  const getPriorityStyle = (priority) => {
    const p = priorities.find(x => x.id === priority?.toLowerCase()) || priorities[1];
    return `${p.bg} ${p.color} border-${p.color.split('-')[1]}-500/30`;
  };

  // --- ЛОГІКА РОЛЕЙ БЕКЕНДУ ---
  const myId = currentUser?.id || currentUser?.uid;
  const myEmail = currentUser?.email;
  
  // Фільтруємо ТІЛЬКИ ті проекти, де я є 'owner' або 'admin'
  const editableProjects = projects.filter(p => {
      const me = p.members?.find(m => m.uid === myId || m.email === myEmail);
      return me && (me.role === 'owner' || me.role === 'admin');
  });
  
  const canCreateTask = editableProjects.length > 0;

  // Функція перевірки прав для видалення конкретної таски
  const canDeleteTask = (task) => {
      const project = projects.find(p => p.id === task.projectId);
      if (!project) return false;
      const member = project.members?.find(m => m.uid === myId || m.email === myEmail);
      return member && (member.role === 'owner' || member.role === 'admin');
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://backendfastline.onrender.com/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      toast.success(`Task moved to ${newStatus}`);
    } catch (error) { toast.error("Failed to update status"); fetchTasks(); }
  };

  const handleStartTask = () => updateTaskStatus(selectedTask.id, 'in_progress');
  const handleCompleteTask = () => updateTaskStatus(selectedTask.id, 'done');
  const handleRevertToTodo = () => updateTaskStatus(selectedTask.id, 'todo');
  const handleRevertToInProgress = () => updateTaskStatus(selectedTask.id, 'in_progress');

  const handleDeleteTask = async () => {
    const taskId = selectedTask.id;
    setTasks(tasks.filter(t => t.id !== taskId));
    setSelectedTask(null);
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://backendfastline.onrender.com/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success("Task deleted");
    } catch (error) { toast.error("Failed to delete task"); fetchTasks(); }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;
    
    if (!newTaskForm.projectId) { 
        toast.error("Please assign this task to a Project (Required)", { style: { background: '#1e1b2e', color: '#fff' }}); 
        return; 
    }
    
    if (!newTaskForm.assignee) { 
        toast.error("Please select an assignee from the project members", { style: { background: '#1e1b2e', color: '#fff' }}); 
        return; 
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://backendfastline.onrender.com/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title: newTaskForm.title, 
          description: newTaskForm.description, 
          assignee: newTaskForm.assignee,
          deadline: newTaskForm.deadline, 
          priority: newTaskForm.priority, 
          projectId: newTaskForm.projectId, 
          userId: myId || myEmail 
        })
      });
      
      if (response.ok) {
        toast.success("Task created!");
        fetchTasks();
        setIsCreatingTask(false);
        setNewTaskForm({ title: '', description: '', assignee: '', deadline: '', priority: 'medium', projectId: '' });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create task");
      }
    } catch (error) { toast.error("Network error while creating task"); }
  };

  const TaskCard = ({ task }) => (
    <div onClick={() => setSelectedTask(task)} className="bg-[#0a0f1e]/60 backdrop-blur-xl border border-white/10 hover:border-[#a19bfe]/50 rounded-[1.5rem] p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-lg group relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${task.priority?.toLowerCase() === 'high' ? 'bg-red-500' : task.priority?.toLowerCase() === 'low' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
      <div className="flex justify-between items-start mb-4 pl-3">
        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${getPriorityStyle(task.priority)} uppercase tracking-wider`}>
          {task.priority || 'MEDIUM'}
        </span>
      </div>
      <h3 className="text-white font-bold text-lg mb-2 pl-3 group-hover:text-[#a19bfe] transition-colors line-clamp-1">{task.title}</h3>
      <p className="text-gray-400 text-xs mb-6 pl-3 line-clamp-2 leading-relaxed">{task.description}</p>
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10 pl-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
          <Calendar size={14} className="text-[#a19bfe]" /><span>{task.dueDate || task.deadline || 'No deadline'}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500 truncate max-w-[80px]">{getDisplayName(task.assignee)}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#3b82f6] flex items-center justify-center text-xs font-bold text-white shadow-md border border-white/10">
            {task.assignee === 'Unassigned' || !task.assignee ? <User size={14} /> : getDisplayName(task.assignee)[0].toUpperCase()}
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full w-full text-white relative z-10 overflow-y-auto custom-scrollbar p-6 md:p-12">
      <Toaster position="top-center" />
      <WorkspaceBackground />
      <style>{`.custom-date-input::-webkit-calendar-picker-indicator { background: transparent; bottom: 0; color: transparent; cursor: pointer; height: auto; left: 0; position: absolute; right: 0; top: 0; width: auto; z-index: 10; }`}</style>
      
      <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col h-full">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Tasks Workspace</h1>
            <p className="text-gray-400 text-base mt-2">Manage, assign, and track your team's progress.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('welcome')} className="flex items-center gap-2 bg-[#0a0f1e]/60 backdrop-blur-xl border border-white/10 hover:border-white/30 text-gray-300 hover:text-white px-5 py-3 rounded-2xl transition-all font-bold shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <Home size={18} /> Home
            </button>
            
            <div className="relative group/tooltip">
                <button 
                    onClick={() => canCreateTask && setIsCreatingTask(true)} 
                    disabled={!canCreateTask}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all text-sm font-bold shadow-[0_0_20px_rgba(109,40,217,0.4)] ${canCreateTask ? 'bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] text-white hover:opacity-90 active:scale-95' : 'bg-[#101426] text-gray-500 cursor-not-allowed border border-white/5 shadow-none'}`}
                >
                  <Plus size={18} /> New Task
                </button>
                {!canCreateTask && (
                    <div className="absolute top-full mt-2 right-0 w-48 p-2 bg-[#161b33] border border-white/10 rounded-lg shadow-xl text-[10px] text-center text-gray-300 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                        Create a project first, or ask your project owner for admin rights.
                    </div>
                )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex justify-center items-center text-[#a19bfe] font-bold animate-pulse">Loading tasks...</div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-backwards pb-10">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 mb-2 bg-[#0a0f1e]/60 backdrop-blur-md py-4 px-6 rounded-[1.5rem] border border-white/10 shadow-lg">
                <div className="w-3 h-3 rounded-full bg-gray-400 shadow-[0_0_10px_rgba(156,163,175,0.5)]"></div>
                <h2 className="text-white font-bold text-lg">To Do</h2>
                <span className="bg-white/10 text-gray-300 text-xs font-bold px-3 py-1 rounded-full ml-auto">{tasks.filter(t => t.status === 'todo').length}</span>
              </div>
              <div className="space-y-5">{tasks.filter(t => t.status === 'todo').map(task => <TaskCard key={task.id} task={task} />)}</div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 mb-2 bg-[#0a0f1e]/60 backdrop-blur-md py-4 px-6 rounded-[1.5rem] border border-white/10 shadow-lg">
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse shadow-[0_0_15px_rgba(96,165,250,0.8)]"></div>
                <h2 className="text-white font-bold text-lg">In Progress</h2>
                <span className="bg-white/10 text-gray-300 text-xs font-bold px-3 py-1 rounded-full ml-auto">{tasks.filter(t => t.status === 'in_progress').length}</span>
              </div>
              <div className="space-y-5">{tasks.filter(t => t.status === 'in_progress').map(task => <TaskCard key={task.id} task={task} />)}</div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 mb-2 bg-[#0a0f1e]/60 backdrop-blur-md py-4 px-6 rounded-[1.5rem] border border-white/10 shadow-lg">
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]"></div>
                <h2 className="text-white font-bold text-lg">Done</h2>
                <span className="bg-white/10 text-gray-300 text-xs font-bold px-3 py-1 rounded-full ml-auto">{tasks.filter(t => t.status === 'done').length}</span>
              </div>
              <div className="space-y-5">{tasks.filter(t => t.status === 'done').map(task => <TaskCard key={task.id} task={task} />)}</div>
            </div>
          </div>
        )}

        {/* МОДАЛКА СТВОРЕННЯ */}
        {isCreatingTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsCreatingTask(false)}></div>
            <div className="bg-[#0a0f1e]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] w-full max-w-xl shadow-[0_0_80px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
              <div className="p-8 border-b border-white/5 bg-gradient-to-r from-[#6d28d9]/10 to-transparent">
                <div className="flex justify-between items-center">
                  <div>
                      <h2 className="text-3xl font-black text-white tracking-tight">New Task</h2>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Assign a new task to your team</p>
                  </div>
                  <button onClick={() => setIsCreatingTask(false)} className="text-gray-500 hover:text-white bg-white/5 p-3 rounded-full transition-colors"><X size={20} /></button>
                </div>
              </div>
              <form onSubmit={handleCreateSubmit} className="p-8 space-y-6">
                
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Assign to Project (Required)</label>
                    <div className="relative">
                        <div onClick={(e) => toggleDropdown(e, 'project')} className={`w-full bg-[#030408]/60 border ${activeDropdown === 'project' ? 'border-[#6d28d9]' : 'border-white/10'} rounded-2xl px-5 py-4 flex items-center justify-between cursor-pointer transition-all shadow-inner`}>
                            <div className="flex items-center gap-3">
                                <FolderKanban size={18} className={newTaskForm.projectId ? "text-[#a19bfe]" : "text-gray-500"} />
                                <span className={newTaskForm.projectId ? "text-white text-base" : "text-gray-500 text-base font-medium italic"}>
                                    {selectedProjectObj ? selectedProjectObj.name : "Select a project..."}
                                </span>
                            </div>
                            <ChevronDown size={20} className={`text-gray-500 transition-transform ${activeDropdown === 'project' ? 'rotate-180' : ''}`} />
                        </div>
                        {activeDropdown === 'project' && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#161b33] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 max-h-48 overflow-y-auto custom-scrollbar">
                                {editableProjects.map(p => (
                                    <div key={p.id} onClick={() => { setNewTaskForm({...newTaskForm, projectId: p.id, assignee: ''}); setActiveDropdown(null); }} className="px-5 py-4 hover:bg-white/5 cursor-pointer flex items-center gap-3 text-base text-white transition-colors border-b border-white/5 last:border-0">
                                        <div className="w-8 h-8 rounded-xl bg-[#6d28d9]/20 text-[#a19bfe] flex items-center justify-center shrink-0"><FolderKanban size={14}/></div>
                                        {p.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Task Title</label>
                  <input type="text" required placeholder="What needs to be done?" className="w-full bg-[#030408]/60 border border-white/10 rounded-2xl px-5 py-4 text-white text-base outline-none focus:border-[#6d28d9] transition-all shadow-inner" value={newTaskForm.title} onChange={e => setNewTaskForm({...newTaskForm, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Description</label>
                  <textarea rows="3" placeholder="Provide some context..." className="w-full bg-[#030408]/60 border border-white/10 rounded-2xl px-5 py-4 text-white text-base outline-none focus:border-[#6d28d9] transition-all resize-none shadow-inner" value={newTaskForm.description} onChange={e => setNewTaskForm({...newTaskForm, description: e.target.value})}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2 relative">
                      <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Priority</label>
                      <div onClick={(e) => toggleDropdown(e, 'priority')} className={`w-full bg-[#030408]/60 border ${activeDropdown === 'priority' ? 'border-[#6d28d9]' : 'border-white/10'} rounded-2xl px-5 py-4 flex items-center justify-between cursor-pointer transition-all shadow-inner`}>
                          <div className="flex items-center gap-3">
                              <Flag size={18} className={priorities.find(p => p.id === newTaskForm.priority)?.color} />
                              <span className="text-white text-base font-medium">{priorities.find(p => p.id === newTaskForm.priority)?.label || 'Medium'}</span>
                          </div>
                          <ChevronDown size={20} className={`text-gray-500 transition-transform ${activeDropdown === 'priority' ? 'rotate-180' : ''}`} />
                      </div>
                      {activeDropdown === 'priority' && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-[#161b33] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                              {priorities.map(p => (
                                  <div key={p.id} onClick={() => { setNewTaskForm({...newTaskForm, priority: p.id}); setActiveDropdown(null); }} className="px-5 py-4 hover:bg-white/5 cursor-pointer flex items-center gap-3 text-base text-white transition-colors">
                                      <div className={`w-3 h-3 rounded-full bg-current ${p.color}`}></div> {p.label}
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Deadline</label>
                      <div className="relative">
                          <Calendar size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a19bfe] pointer-events-none z-10" />
                          <input type="date" className="custom-date-input w-full bg-[#030408]/60 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-base outline-none focus:border-[#6d28d9] transition-all shadow-inner" value={newTaskForm.deadline} onChange={e => setNewTaskForm({...newTaskForm, deadline: e.target.value})} />
                      </div>
                  </div>
                </div>
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Assignee</label>
                  {selectedProjectObj ? (
                      <div>
                          <div onClick={(e) => toggleDropdown(e, 'assignee')} className={`w-full bg-[#030408]/60 border ${activeDropdown === 'assignee' ? 'border-[#6d28d9]' : 'border-white/10'} rounded-2xl px-5 py-4 flex items-center justify-between cursor-pointer transition-all shadow-inner`}>
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#1e2336] flex items-center justify-center border border-white/10">
                                      {newTaskForm.assignee ? <span className="text-xs font-bold text-white">{getDisplayName(newTaskForm.assignee)[0].toUpperCase()}</span> : <User size={16} className="text-gray-500" />}
                                  </div>
                                  <span className={newTaskForm.assignee ? "text-white text-base font-bold" : "text-gray-500 text-base italic"}>
                                      {newTaskForm.assignee ? getDisplayName(newTaskForm.assignee) : "Select a team member..."}
                                  </span>
                              </div>
                              <ChevronDown size={20} className={`text-gray-500 transition-transform ${activeDropdown === 'assignee' ? 'rotate-180' : ''}`} />
                          </div>
                          {activeDropdown === 'assignee' && (
                              <div className="absolute bottom-full mb-2 left-0 right-0 bg-[#161b33] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 max-h-48 overflow-y-auto custom-scrollbar">
                                  {selectedProjectObj.members?.map(m => (
                                      <div key={m.uid} onClick={() => { setNewTaskForm({...newTaskForm, assignee: m.uid}); setActiveDropdown(null); }} className="px-5 py-4 hover:bg-white/5 cursor-pointer flex items-center justify-between text-base transition-colors border-b border-white/5 last:border-0">
                                          <div className="flex items-center gap-4">
                                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                                                  {getDisplayName(m.uid)[0].toUpperCase()}
                                              </div>
                                              <span className="text-white font-bold">{getDisplayName(m.uid)}</span>
                                          </div>
                                          <span className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-md border ${m.role === 'owner' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>{m.role}</span>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  ) : (
                      <div className="relative">
                          <User size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                          <input type="text" disabled placeholder="Select a project first..." className="w-full bg-[#030408]/30 border border-white/5 rounded-2xl px-14 py-4 text-gray-500 text-base outline-none cursor-not-allowed shadow-inner" value="" />
                      </div>
                  )}
                </div>
                <div className="flex gap-4 pt-6 border-t border-white/5">
                  <button type="button" onClick={() => setIsCreatingTask(false)} className="flex-1 px-5 py-4 rounded-xl text-base font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all shadow-inner border border-transparent hover:border-white/10">Cancel</button>
                  <button 
                      type="submit" 
                      disabled={!newTaskForm.projectId || !newTaskForm.title.trim()}
                      className="flex-[2] bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] disabled:opacity-50 disabled:from-gray-700 disabled:to-gray-800 text-white px-5 py-4 rounded-xl text-base font-bold shadow-[0_0_20px_rgba(109,40,217,0.4)] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                      <Play size={20} /> Launch Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* МОДАЛКА ПЕРЕГЛЯДУ ТАСКИ */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[120] p-4">
            <div className="absolute inset-0" onClick={() => setSelectedTask(null)}></div>
            <div className="bg-[#0a0f1e]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] w-full max-w-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between items-start p-8 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
                <div className="flex gap-3 items-center">
                  <span className={`text-xs font-black px-4 py-2 rounded-xl border ${getPriorityStyle(selectedTask.priority)} tracking-wider`}>{(selectedTask.priority || 'MEDIUM').toUpperCase()} PRIORITY</span>
                  {selectedTask.projectId && <span className="text-[10px] font-bold px-4 py-2 rounded-xl bg-white/10 text-gray-300 flex items-center gap-1.5 tracking-wider"><FolderKanban size={14}/> PROJECT TASK</span>}
                </div>
                <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-white bg-white/5 p-3 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="p-8 md:p-10">
                <h2 className="text-4xl font-black text-white mb-8 tracking-tight leading-tight">{selectedTask.title}</h2>
                <div className="bg-[#030408]/40 border border-white/5 rounded-2xl p-6 mb-8 shadow-inner">
                  <h4 className="text-[11px] text-[#a19bfe] font-black uppercase tracking-widest mb-3">Description</h4>
                  <p className="text-gray-300 text-base leading-relaxed">{selectedTask.description || "No description provided."}</p>
                </div>
                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="flex items-center gap-5 bg-white/5 p-5 rounded-2xl border border-white/5 shadow-sm">
                    <div className="w-14 h-14 rounded-xl bg-[#1d1a4a] flex items-center justify-center text-[#a19bfe] shadow-inner shrink-0"><Clock size={24} /></div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Deadline</p>
                        <p className="text-white font-bold text-lg truncate">{selectedTask.dueDate || selectedTask.deadline || 'None'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 bg-white/5 p-5 rounded-2xl border border-white/5 shadow-sm">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[#3b82f6] to-[#2563eb] flex items-center justify-center text-white font-bold text-lg shadow-inner shrink-0">{getDisplayName(selectedTask.assignee)[0].toUpperCase()}</div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Assignee</p>
                        <p className="text-white font-bold text-lg truncate">{getDisplayName(selectedTask.assignee)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 pt-8 border-t border-white/5">
                  {selectedTask.status === 'todo' && <button onClick={handleStartTask} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white px-6 py-4 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95"><Play size={20} /> Start Doing</button>}
                  {selectedTask.status === 'in_progress' && (
                    <>
                      <button onClick={handleCompleteTask} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white px-6 py-4 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95"><CheckCircle2 size={20} /> Mark Completed</button>
                      <button onClick={handleRevertToTodo} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-6 py-4 rounded-xl text-sm font-bold transition-colors border border-white/5 active:scale-95"><RotateCcw size={20} /> Move to To Do</button>
                    </>
                  )}
                  {selectedTask.status === 'done' && <button onClick={handleRevertToInProgress} className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 px-6 py-4 rounded-xl text-sm font-bold transition-colors active:scale-95"><RotateCcw size={20} /> Return to Progress</button>}
                  
                  {/* Застосовано canDeleteTask */}
                  {canDeleteTask(selectedTask) && (
                      <button onClick={handleDeleteTask} className="flex items-center gap-2 ml-auto text-red-400 hover:text-white hover:bg-red-500 px-6 py-4 rounded-xl text-sm font-bold transition-all active:scale-95 border border-transparent hover:border-red-400"><Trash2 size={20} /> Delete Task</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

=======
import React from 'react';
import { ListTodo } from 'lucide-react';

const TasksPage = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-white text-center animate-message">
    <ListTodo size={64} className="text-purple-400 mb-6" />
    <h2 className="text-3xl font-bold mb-3">Tasks Manager</h2>
    <p className="text-gray-400 max-w-md">Manage your project tasks efficiently. Coming soon!</p>
  </div>
);
>>>>>>> 6177455093f7fec61a5cef28758f30915ee7d335
export default TasksPage;