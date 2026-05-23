import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Settings, Users, Clock, CheckCircle2, Shield, Activity, Calendar, GitCommit, UserPlus, X, Archive, MessageSquare, Send, Paperclip, Pin, Loader2, Save, UserMinus, AlertTriangle, FolderKanban, Play, RotateCcw, Trash2, User } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ProjectDetailsPage = ({ onNavigate, projectId, currentUser, socket }) => {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projectMessages, setProjectMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editProjectForm, setEditProjectForm] = useState({ name: '', description: '' });

  // --- НОВИЙ СТАН ДЛЯ ПЕРЕГЛЯДУ ТАСКИ ---
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchProjectData = async () => {
    if (!projectId) { setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [projRes, tasksRes, actRes] = await Promise.all([
        fetch(`https://backendfastline.onrender.com/projects/${projectId}`, { headers }),
        fetch(`https://backendfastline.onrender.com/projects/${projectId}/deadlines`, { headers }),
        fetch(`https://backendfastline.onrender.com/projects/${projectId}/activity`, { headers })
      ]);

      if (projRes.ok) {
          const pData = await projRes.json();
          setProject(pData);
          setEditProjectForm({ name: pData.name || '', description: pData.description || '' });
      }
      if (tasksRes.ok) setTasks(await tasksRes.json() || []);
      if (actRes.ok) setActivities(await actRes.json() || []);
    } catch (error) {
      toast.error("Failed to load project details");
    } finally { setIsLoading(false); }
  };

  const fetchProjectMessages = async () => {
      if (!projectId) return;
      setIsChatLoading(true);
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`https://backendfastline.onrender.com/project-messages/${projectId}`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (res.ok) setProjectMessages(await res.json());
      } catch (err) { console.error("Failed to load messages"); } 
      finally { setIsChatLoading(false); }
  };

  useEffect(() => { fetchProjectData(); fetchProjectMessages(); }, [projectId]);

  useEffect(() => {
      if (activeTab === 'chat') messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [projectMessages, activeTab]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://backendfastline.onrender.com/projects/${projectId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ invitedUserId: inviteEmail, invitedBy: currentUser?.id || currentUser?.email, role: 'member' })
      });
      if (response.ok) {
        toast.success("Invitation sent!");
        setInviteEmail('');
        setIsInviteModalOpen(false);
        fetchProjectData(); 
      } else { toast.error("Failed to send invite."); }
    } catch (error) { toast.error("Network error"); }
  };

  const handleArchive = async () => {
      if (!window.confirm("Are you sure you want to archive this project?")) return;
      try {
          const token = localStorage.getItem('token');
          await fetch(`https://backendfastline.onrender.com/projects/${projectId}/archive`, {
              method: 'PATCH',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          toast.success("Project archived");
          setIsSettingsModalOpen(false);
          onNavigate('projects'); 
      } catch (err) { toast.error("Failed to archive project"); }
  };

  const handleSendChatMessage = async () => {
      if (!chatInput.trim() || !projectId) return;
      const token = localStorage.getItem('token');
      const senderId = currentUser?.id || currentUser?.email || "Unknown";
      try {
          const tempMsg = { id: Date.now().toString(), text: chatInput, senderId, createdAt: new Date().toISOString() };
          setProjectMessages(prev => [...prev, tempMsg]);
          setChatInput('');
          await fetch(`https://backendfastline.onrender.com/project-messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ projectId, senderId, text: tempMsg.text })
          });
      } catch (err) { toast.error("Failed to send message"); }
  };

  const handleUpdateProjectDetails = (e) => {
      e.preventDefault();
      toast("Backend needs PATCH /projects/:id endpoint for this!", { icon: '🚧', style: { background: '#3b82f6', color: '#fff' } });
  };

  const handleRemoveMember = (uid) => {
      toast(`Backend needs DELETE endpoint to remove ${uid}!`, { icon: '🚧', style: { background: '#f59e0b', color: '#fff' } });
  };

  // --- ФУНКЦІЇ КЕРУВАННЯ ТАСКОЮ ---
  const getPriorityStyle = (priority) => {
    const p = priority?.toLowerCase() || 'medium';
    switch(p) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
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
    } catch (error) { toast.error("Failed to update status"); fetchProjectData(); }
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
    } catch (error) { toast.error("Failed to delete task"); }
  };

  if (isLoading) return <div className="h-full flex items-center justify-center text-[#a19bfe] font-bold animate-pulse">Loading workspace...</div>;
  if (!project || project.message === 'Project not found' || !projectId) return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-[#05060f]/60 backdrop-blur-md">
        <h2 className="text-white text-2xl font-bold mb-4">Workspace not found</h2>
        <button onClick={() => onNavigate('projects')} className="bg-[#101426] border border-white/10 px-6 py-2.5 rounded-xl text-[#a19bfe] hover:text-white transition-all shadow-lg active:scale-95">Return to Projects</button>
      </div>
  );

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const projectDate = project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Continuous';
  const activeTask = tasks.find(t => t.status === 'in_progress') || tasks.find(t => t.status !== 'done');
  
  const getMemberRole = (uid) => {
      const member = project.members?.find(m => m.uid === uid);
      return member ? member.role : 'Member';
  };
  
  const isCurrentUserOwner = getMemberRole(currentUser?.id || currentUser?.uid) === 'owner';

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden relative z-10">
      <Toaster position="top-center" />
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0 bg-[#05060f]/80 backdrop-blur-md z-20 py-2 -mx-2 px-2 rounded-2xl">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('projects')} className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all border border-white/5 active:scale-95">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                {project.name}
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                  {project.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>}
                  {project.status || 'Active'}
                </span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="flex bg-[#101426] p-1 rounded-xl border border-white/5 mr-4">
                <button className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all bg-[#6d28d9] text-white shadow-md">
                    Dashboard
                </button>
                {/* ЗМІНА ТУТ: тепер кнопка викликає onNavigate на окрему сторінку */}
                <button onClick={() => onNavigate('project_chat', projectId)} className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/5">
                    <MessageSquare size={14} /> Team Chat
                </button>
            </div>
          <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all border border-white/5" title="Project Settings">
              <Settings size={18} />
          </button>
        </div>
      </div>

      {/* ВМІСТ (Dashboard / Chat) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 relative">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* ЛІВА КОЛОНКА */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-[#101426]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-lg">
                    <h3 className="text-[11px] font-black text-[#a19bfe] uppercase tracking-[0.2em] mb-3">Overview</h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-6 bg-[#060813]/50 p-4 rounded-2xl border border-white/5 shadow-inner">
                        {project.description || `Collaborative workspace for ${project.name}. Created by ${project.ownerId}.`}
                    </p>

                    <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-2"><Activity size={14} className="text-[#3b82f6]"/> Project Progress ({completedTasks}/{totalTasks} Tasks)</span>
                    <span className="text-sm font-black text-[#3b82f6]">{progress}%</span>
                    </div>
                    <div className="w-full bg-[#1e2336] rounded-full h-2.5 overflow-hidden border border-white/5 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] rounded-full transition-all duration-1000 ease-out relative overflow-hidden" style={{ width: `${progress}%` }}>
                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                    </div>
                    <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
                </div>

                <div className="bg-[#101426]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[11px] font-black text-[#a19bfe] uppercase tracking-[0.2em]">Current Tasks</h3>
                    <button onClick={() => onNavigate('tasks')} className="text-xs font-bold text-[#3b82f6] hover:text-white transition-colors bg-[#3b82f6]/10 px-3 py-1.5 rounded-lg">View All Board</button>
                    </div>
                    
                    <div className="space-y-3">
                    {tasks.length === 0 ? (
                        <div className="text-gray-500 text-sm italic text-center p-4">No tasks assigned to this project yet.</div>
                    ) : (
                        tasks.map(task => (
                        <div key={task.id} onClick={() => setSelectedTask(task)} className="flex items-center justify-between bg-[#161b33] p-4 rounded-2xl border border-white/5 hover:border-[#6d28d9]/30 transition-colors group cursor-pointer">
                            <div className="flex items-center gap-3">
                            {task.status === 'done' ? (
                                <CheckCircle2 size={18} className="text-emerald-500" />
                            ) : task.status === 'in_progress' ? (
                                <div className="w-4 h-4 rounded-full border-2 border-[#3b82f6] border-t-transparent animate-spin"></div>
                            ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-600 group-hover:border-white transition-colors"></div>
                            )}
                            <div className="flex flex-col">
                                <span className={`text-sm font-semibold ${task.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-200 group-hover:text-white'}`}>{task.title}</span>
                                <span className="text-[10px] text-gray-500">Deadline: {task.deadline || 'No date'}</span>
                            </div>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${task.priority?.toLowerCase() === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' : task.priority?.toLowerCase() === 'low' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                            {task.priority || 'MEDIUM'}
                            </span>
                        </div>
                        ))
                    )}
                    </div>
                </div>
                </div>

                {/* ПРАВА КОЛОНКА */}
                <div className="flex flex-col gap-6">
                <div className="bg-[#101426]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-[#1d1a4a] flex items-center justify-center text-[#a19bfe]"><Calendar size={18} /></div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Created Date</p>
                        <p className="text-white font-bold text-sm">{projectDate}</p>
                    </div>
                    </div>

                    <h3 className="text-[11px] font-black text-[#a19bfe] uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                        Team Members <span className="bg-white/10 px-2 py-0.5 rounded text-white">{project.members?.length || 0}</span>
                    </h3>
                    
                    <div className="space-y-3">
                    {(project.members || []).map((member, idx) => {
                        const initial = member.uid ? member.uid[0].toUpperCase() : '?';
                        return (
                            <div key={idx} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/5 group">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr from-[#1e2336] to-[#0a0b1e] flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/10 group-hover:border-[#6d28d9]/50`}>{initial}</div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-white truncate">{member.uid}</div>
                                <div className={`text-[10px] uppercase font-bold tracking-wider ${member.role === 'owner' ? 'text-purple-400' : 'text-[#3b82f6]'}`}>{member.role}</div>
                            </div>
                            </div>
                        )
                    })}
                    <button onClick={() => setIsInviteModalOpen(true)} className="w-full mt-2 py-3 flex items-center justify-center gap-2 text-xs font-bold text-[#a19bfe] hover:text-white bg-[#6d28d9]/10 hover:bg-[#6d28d9]/20 rounded-xl transition-all border border-[#6d28d9]/30">
                        <UserPlus size={14} /> Invite Member
                    </button>
                    </div>
                </div>

                <div className="bg-[#101426]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-lg">
                    <h3 className="text-[11px] font-black text-[#a19bfe] uppercase tracking-[0.2em] mb-4">Activity Log</h3>
                    <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                    {activities.length === 0 ? (
                        <div className="text-gray-500 text-sm italic text-center pb-4">No activity yet.</div>
                    ) : (
                        activities.map((act) => {
                        const actDate = new Date(act.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                        return (
                            <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-[#101426] bg-[#6d28d9] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"><GitCommit size={12} /></div>
                            <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-white/5 bg-[#161b33] shadow-sm">
                                <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-500 font-medium">{actDate}</span>
                                <p className="text-xs text-gray-300 leading-snug">{act.message}</p>
                                </div>
                            </div>
                            </div>
                        )
                        })
                    )}
                    </div>
                </div>
                </div>
            </div>
          )}

          {/* TAB 2: TEAM CHAT */}
          {activeTab === 'chat' && (
              <div className="h-full flex flex-col bg-[#101426]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl">
                  <div className="bg-gradient-to-r from-[#161b33] to-[#1e2336] p-3 px-5 flex items-center justify-between border-b border-white/5 shrink-0">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/20 text-[#3b82f6] flex items-center justify-center"><Pin size={16}/></div>
                          <div>
                              <div className="text-[10px] font-bold text-[#a19bfe] uppercase tracking-widest">Active Task Overview</div>
                              <div className="text-sm font-medium text-white">{activeTask ? activeTask.title : "No active tasks in this project."}</div>
                          </div>
                      </div>
                      {activeTask && <div className="text-xs font-bold px-3 py-1 bg-white/5 rounded-lg text-gray-300">Deadline: {activeTask.deadline || "None"}</div>}
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 chat-custom-scroll flex flex-col space-y-4">
                      {isChatLoading ? (
                          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#6d28d9]" size={24} /></div>
                      ) : projectMessages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full opacity-50">
                              <MessageSquare size={48} className="mb-4 text-gray-500"/>
                              <p className="text-gray-400">Start the discussion for {project.name}</p>
                          </div>
                      ) : (
                          projectMessages.map((msg, idx) => {
                              const isMe = String(msg.senderId) === String(currentUser?.id) || String(msg.senderId) === String(currentUser?.email);
                              const senderName = msg.senderId?.split('@')[0] || "User";
                              const role = getMemberRole(msg.senderId);
                              let timeString = "now";
                              if (msg.createdAt) {
                                const d = typeof msg.createdAt === 'string' ? new Date(msg.createdAt) : new Date(msg.createdAt._seconds * 1000);
                                timeString = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                              }
                              return (
                                <div key={msg.id || idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                    <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} relative`}>
                                        {!isMe && (
                                            <div className="flex-shrink-0 w-10 mt-1"> 
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm overflow-hidden bg-gradient-to-tr from-[#1e2336] to-[#0a0b1e] border border-white/5">{senderName[0].toUpperCase()}</div>
                                            </div>
                                        )}
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} min-w-[120px]`}>
                                            <div className={`px-5 py-3 text-[14px] leading-relaxed relative transition-all ${isMe ? 'bg-gradient-to-br from-[#6d28d9] to-[#5b21b6] text-white rounded-2xl rounded-tr-sm shadow-md' : 'bg-[#161b33] text-gray-100 rounded-2xl rounded-tl-sm border border-white/5 shadow-sm pt-2.5'}`}>
                                                {!isMe && (
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[12px] font-bold text-white">{senderName}</span>
                                                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${role === 'owner' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>{role}</span>
                                                    </div>
                                                )}
                                                <span className="break-words">{msg.text}</span>
                                            </div>
                                            <span className="text-[10px] text-gray-500 font-medium mt-1 px-1">{timeString}</span>
                                        </div>
                                    </div>
                                </div>
                              );
                          })
                      )}
                      <div ref={messagesEndRef} className="h-2" />
                  </div>
                  <div className="p-4 bg-[#161b33] border-t border-white/5 shrink-0">
                      <div className="bg-[#0a0f1e] rounded-2xl flex items-center px-2 py-1.5 border border-white/5 focus-within:border-[#6d28d9]/50 transition-all">
                        <button className="p-2.5 text-gray-500 hover:text-[#a19bfe] transition-colors rounded-xl"><Paperclip size={18} /></button>
                        <input className="flex-1 bg-transparent outline-none text-white text-[14px] px-2 py-2 h-10 min-w-0" placeholder="Message project team..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()} />
                        <div className="pr-1"><button onClick={handleSendChatMessage} className={`p-2 rounded-xl transition-all ${chatInput.trim() ? 'bg-[#6d28d9] text-white active:scale-95' : 'bg-white/5 text-gray-500'}`}><Send size={18} /></button></div>
                      </div>
                  </div>
              </div>
          )}
      </div>

      {/* --- МОДАЛКА ПЕРЕГЛЯДУ ТАСКИ --- */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="absolute inset-0" onClick={() => setSelectedTask(null)}></div>
          <div className="bg-[#101426] border border-white/10 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start p-8 border-b border-white/5 bg-white/5">
              <div className="flex gap-2 items-center">
                <span className={`text-xs font-bold px-4 py-1.5 rounded-full border ${getPriorityStyle(selectedTask.priority)}`}>{(selectedTask.priority || 'MEDIUM').toUpperCase()} PRIORITY</span>
                <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-white/10 text-gray-300 flex items-center gap-1.5"><FolderKanban size={12}/> PROJECT TASK</span>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8">
              <h2 className="text-3xl font-black text-white mb-6">{selectedTask.title}</h2>
              <div className="bg-[#060813]/50 border border-white/5 rounded-2xl p-6 mb-8 shadow-inner">
                <h4 className="text-[11px] text-[#a19bfe] font-black uppercase tracking-widest mb-3">Description</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{selectedTask.description || "No description provided."}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-[#1d1a4a] flex items-center justify-center text-[#a19bfe]"><Clock size={20} /></div>
                  <div><p className="text-[10px] text-gray-500 font-bold uppercase">Deadline</p><p className="text-white font-bold">{selectedTask.dueDate || selectedTask.deadline || 'None'}</p></div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-[#1d1a4a] flex items-center justify-center text-[#3b82f6]"><User size={20} /></div>
                  <div><p className="text-[10px] text-gray-500 font-bold uppercase">Assignee</p><p className="text-white font-bold">{selectedTask.assignee || "Unassigned"}</p></div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-white/5">
                {selectedTask.status === 'todo' && <button onClick={handleStartTask} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-colors shadow-lg shadow-blue-900/20"><Play size={18} /> Start Doing</button>}
                {selectedTask.status === 'in_progress' && (
                  <>
                    <button onClick={handleCompleteTask} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-colors shadow-lg shadow-green-900/20"><CheckCircle2 size={18} /> Mark Completed</button>
                    <button onClick={handleRevertToTodo} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-5 py-3 rounded-2xl text-sm font-bold transition-colors"><RotateCcw size={18} /> Move to To Do</button>
                  </>
                )}
                {selectedTask.status === 'done' && <button onClick={handleRevertToInProgress} className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 px-5 py-3 rounded-2xl text-sm font-bold transition-colors"><RotateCcw size={18} /> Return to Progress</button>}
                <button onClick={handleDeleteTask} className="flex items-center gap-2 ml-auto text-red-400 hover:text-red-300 hover:bg-red-500/10 px-5 py-3 rounded-2xl text-sm font-bold transition-colors"><Trash2 size={18} /> Delete Task</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- МОДАЛКА: НАЛАШТУВАННЯ ПРОЄКТУ --- */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsSettingsModalOpen(false)}></div>
          
          <div className="bg-[#101426] border border-white/10 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-[#6d28d9]/10 to-transparent shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1e2336] flex items-center justify-center border border-white/5"><Settings size={24} className="text-[#a19bfe]"/></div>
                  <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">Project Settings</h2>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Manage workspace preferences</p>
                  </div>
                </div>
                <button onClick={() => setIsSettingsModalOpen(false)} className="text-gray-500 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={20} /></button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-10">
                
                {/* General Information */}
                <section>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FolderKanban size={14}/> General Information</h3>
                    <form onSubmit={handleUpdateProjectDetails} className="space-y-4 bg-[#161b33] p-5 rounded-2xl border border-white/5 shadow-inner">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest">Project Name</label>
                            <input type="text" className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#6d28d9] transition-all" value={editProjectForm.name} onChange={e => setEditProjectForm({...editProjectForm, name: e.target.value})} disabled={!isCurrentUserOwner} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest">Description</label>
                            <textarea rows="2" className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#6d28d9] transition-all resize-none" value={editProjectForm.description} onChange={e => setEditProjectForm({...editProjectForm, description: e.target.value})} disabled={!isCurrentUserOwner}></textarea>
                        </div>
                        {isCurrentUserOwner && (
                            <button type="submit" className="flex items-center gap-2 bg-[#6d28d9] hover:bg-[#5b21b6] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all ml-auto">
                                <Save size={16} /> Save Changes
                            </button>
                        )}
                    </form>
                </section>

                {/* Team Management */}
                <section>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Users size={14}/> Team Management</h3>
                    <div className="bg-[#161b33] rounded-2xl border border-white/5 shadow-inner overflow-hidden">
                        {(project.members || []).map((m) => (
                            <div key={m.uid} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1e2336] to-[#0a0b1e] flex items-center justify-center text-white font-bold border border-white/10">{m.uid[0].toUpperCase()}</div>
                                    <div>
                                        <div className="text-white text-sm font-bold">{m.uid}</div>
                                        <div className={`text-[10px] uppercase font-black tracking-wider ${m.role === 'owner' ? 'text-purple-400' : 'text-blue-400'}`}>{m.role}</div>
                                    </div>
                                </div>
                                {isCurrentUserOwner && m.uid !== (currentUser?.id || currentUser?.uid) && (
                                    <button onClick={() => handleRemoveMember(m.uid)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Remove Member">
                                        <UserMinus size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Danger Zone */}
                {isCurrentUserOwner && (
                    <section>
                        <h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2"><AlertTriangle size={14}/> Danger Zone</h3>
                        <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl flex items-center justify-between">
                            <div>
                                <div className="text-red-400 font-bold text-sm">Archive Project</div>
                                <div className="text-gray-500 text-xs mt-1">Hide this project from the active list. It can be restored later.</div>
                            </div>
                            <button onClick={handleArchive} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-900/20">Archive</button>
                        </div>
                    </section>
                )}
            </div>
          </div>
        </div>
      )}

      {/* --- МОДАЛКА ЗАПРОШЕННЯ (БЕЗ ЗМІН) --- */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsInviteModalOpen(false)}></div>
          <div className="bg-[#101426] border border-white/10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* ... ТА САМА ФОРМА ЗАПРОШЕННЯ ... */}
            <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-[#6d28d9]/10 to-transparent">
              <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Invite to Workspace</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Add a new collaborator</p>
                </div>
                <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-500 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={20} /></button>
              </div>
            </div>
            <form onSubmit={handleInvite} className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">User Identifier (Email or ID) *</label>
                    <input type="text" required placeholder="e.g. user@fastline.com" className="w-full bg-[#060813]/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-[#6d28d9] transition-all shadow-inner" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setIsInviteModalOpen(false)} className="flex-1 px-5 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
                    <button type="submit" className="flex-[2] bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] text-white px-5 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:opacity-90 active:scale-[0.98] transition-all">Send Invitation</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;