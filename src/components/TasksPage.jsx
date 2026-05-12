import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, Play, UserPlus, Trash2, X, Plus, User, RotateCcw, Home, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const TasksPage = ({ onNavigate }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://backendfastline.onrender.com/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  // Додали пріоритет за замовчуванням
  const [newTaskForm, setNewTaskForm] = useState({ title: '', description: '', assignee: '', deadline: '', priority: 'medium' });

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
    } catch (error) {
      toast.error("Failed to update status");
      fetchTasks(); 
    }
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
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://backendfastline.onrender.com/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title: newTaskForm.title,
          description: newTaskForm.description,
          assignee: newTaskForm.assignee || "Unassigned",
          deadline: newTaskForm.deadline,
          priority: newTaskForm.priority // Відправляємо пріоритет
        })
      });
      
      if (response.ok) {
        toast.success("Task created!");
        fetchTasks();
      }
    } catch (error) {
      toast.error("Failed to create task");
    }

    setIsCreatingTask(false);
    setNewTaskForm({ title: '', description: '', assignee: '', deadline: '', priority: 'medium' });
  };

  const TaskCard = ({ task }) => (
    <div onClick={() => setSelectedTask(task)} className="bg-[#101426]/60 backdrop-blur-lg border border-white/5 hover:border-purple-500/50 rounded-[1.5rem] p-5 cursor-pointer transition-all shadow-lg group relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.priority?.toLowerCase() === 'high' ? 'bg-red-500' : task.priority?.toLowerCase() === 'low' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
      <div className="flex justify-between items-start mb-3 pl-2">
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${getPriorityStyle(task.priority)}`}>
          {(task.priority || 'MEDIUM').toUpperCase()}
        </span>
      </div>
      <h3 className="text-white font-bold text-base mb-1 pl-2 group-hover:text-[#a19bfe] transition-colors line-clamp-1">{task.title}</h3>
      <p className="text-gray-400 text-sm mb-5 pl-2 line-clamp-2">{task.description}</p>
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 pl-2">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
          <Calendar size={14} />
          <span>{task.dueDate || task.deadline || 'No deadline'}</span>
        </div>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#3b82f6] flex items-center justify-center text-[10px] font-bold text-white shadow-sm" title={`Assigned to ${task.assignee}`}>
          {task.assignee === 'Unassigned' || !task.assignee ? <User size={12} /> : task.assignee[0].toUpperCase()}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col p-6 bg-transparent overflow-y-auto custom-scrollbar relative z-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tasks Workspace</h1>
          <p className="text-gray-400 text-sm mt-1">Manage, assign, and track your team's progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('welcome')} className="flex items-center gap-2 bg-[#131933] border border-white/10 hover:border-white/20 text-gray-300 hover:text-white px-4 py-2.5 rounded-2xl transition-colors text-sm font-medium shadow-inner">
            <Home size={18} /> Home
          </button>
          <button onClick={() => setIsCreatingTask(true)} className="flex items-center gap-2 bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] hover:opacity-90 text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-purple-900/20 text-sm font-bold">
            <Plus size={18} /> New Task
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40 text-gray-400">Loading tasks...</div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2 bg-[#101426] py-3 px-4 rounded-2xl border border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div><h2 className="text-white font-bold">To Do</h2>
              <span className="bg-white/10 text-gray-400 text-xs font-bold px-2.5 py-1 rounded-full ml-auto">{tasks.filter(t => t.status === 'todo').length}</span>
            </div>
            <div className="space-y-4">{tasks.filter(t => t.status === 'todo').map(task => <TaskCard key={task.id} task={task} />)}</div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2 bg-[#101426] py-3 px-4 rounded-2xl border border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div><h2 className="text-white font-bold">In Progress</h2>
              <span className="bg-white/10 text-gray-400 text-xs font-bold px-2.5 py-1 rounded-full ml-auto">{tasks.filter(t => t.status === 'in_progress').length}</span>
            </div>
            <div className="space-y-4">{tasks.filter(t => t.status === 'in_progress').map(task => <TaskCard key={task.id} task={task} />)}</div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2 bg-[#101426] py-3 px-4 rounded-2xl border border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div><h2 className="text-white font-bold">Done</h2>
              <span className="bg-white/10 text-gray-400 text-xs font-bold px-2.5 py-1 rounded-full ml-auto">{tasks.filter(t => t.status === 'done').length}</span>
            </div>
            <div className="space-y-4">{tasks.filter(t => t.status === 'done').map(task => <TaskCard key={task.id} task={task} />)}</div>
          </div>
        </div>
      )}

      {/* ОНОВЛЕНЕ ВІКНО СТВОРЕННЯ ТАСКИ */}
      {isCreatingTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#030408]/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsCreatingTask(false)}></div>
          
          <div className="bg-[#101426] border border-white/10 rounded-[2.5rem] w-full max-w-lg shadow-[0_0_80px_rgba(0,0,0,0.6)] relative z-10 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            
            <div className="p-8 border-b border-white/5 bg-gradient-to-r from-[#6d28d9]/10 to-transparent">
              <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">New Task</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Assign a new task to your team</p>
                </div>
                <button onClick={() => setIsCreatingTask(false)} className="text-gray-500 hover:text-white bg-white/5 p-2 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Task Title</label>
                <input 
                  type="text" required
                  placeholder="What needs to be done?"
                  className="w-full bg-[#060813]/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-[#6d28d9] transition-all shadow-inner"
                  value={newTaskForm.title}
                  onChange={e => setNewTaskForm({...newTaskForm, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  rows="3"
                  placeholder="Provide some context..."
                  className="w-full bg-[#060813]/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-[#6d28d9] transition-all resize-none shadow-inner"
                  value={newTaskForm.description}
                  onChange={e => setNewTaskForm({...newTaskForm, description: e.target.value})}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Priority</label>
                    <div className="relative">
                        <select 
                            className="w-full bg-[#060813]/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-[#6d28d9] appearance-none cursor-pointer shadow-inner"
                            value={newTaskForm.priority}
                            onChange={e => setNewTaskForm({...newTaskForm, priority: e.target.value})}
                        >
                            <option value="low">Low (Green)</option>
                            <option value="medium">Medium (Yellow)</option>
                            <option value="high">High (Red)</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Deadline</label>
                    <input 
                        type="date" 
                        className="w-full bg-[#060813]/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-[#6d28d9] transition-all shadow-inner"
                        value={newTaskForm.deadline}
                        onChange={e => setNewTaskForm({...newTaskForm, deadline: e.target.value})}
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#a19bfe] uppercase tracking-widest ml-1">Assignee</label>
                <div className="relative">
                    <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text"
                      placeholder="Username..."
                      className="w-full bg-[#060813]/50 border border-white/10 rounded-2xl px-12 py-4 text-white text-sm outline-none focus:border-[#6d28d9] transition-all shadow-inner"
                      value={newTaskForm.assignee}
                      onChange={e => setNewTaskForm({...newTaskForm, assignee: e.target.value})}
                    />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setIsCreatingTask(false)} className="flex-1 px-5 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-[2] bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] text-white px-5 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:opacity-90 active:scale-[0.98] transition-all">
                  Launch Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модалка перегляду таски */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0" onClick={() => setSelectedTask(null)}></div>
          <div className="bg-[#101426] border border-white/10 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start p-8 border-b border-white/5 bg-white/5">
              <span className={`text-xs font-bold px-4 py-1.5 rounded-full border ${getPriorityStyle(selectedTask.priority)}`}>{(selectedTask.priority || 'MEDIUM').toUpperCase()} PRIORITY</span>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8">
              <h2 className="text-3xl font-black text-white mb-6">{selectedTask.title}</h2>
              <div className="bg-[#060813]/50 border border-white/5 rounded-2xl p-6 mb-8 shadow-inner">
                <h4 className="text-[11px] text-[#a19bfe] font-black uppercase tracking-widest mb-3">Description</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{selectedTask.description}</p>
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
    </div>
  );
};

export default TasksPage;