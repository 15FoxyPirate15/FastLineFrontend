import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, Play, UserPlus, Trash2, X, Plus, User, RotateCcw, Home } from 'lucide-react';
import toast from 'react-hot-toast';

const TasksPage = ({ onNavigate }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Отримання тасок з беку
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
  const [newTaskForm, setNewTaskForm] = useState({ title: '', description: '', assignee: '', deadline: '' });

  const getPriorityStyle = (priority) => {
    const p = priority?.toLowerCase() || 'medium';
    switch(p) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  // Оновлення статусу (у бекендера є спеціальний ендпоінт PATCH /tasks/:id/status)
  const updateTaskStatus = async (taskId, newStatus) => {
    // Оновлюємо UI миттєво
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
      fetchTasks(); // Відкат у разі помилки
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
          deadline: newTaskForm.deadline // Бекенд збереже це як dueDate
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
    setNewTaskForm({ title: '', description: '', assignee: '', deadline: '' });
  };

  const TaskCard = ({ task }) => (
    <div onClick={() => setSelectedTask(task)} className="bg-[#1d1a4a] border border-white/5 hover:border-purple-500/50 rounded-xl p-4 cursor-pointer transition-all shadow-lg group relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.priority?.toLowerCase() === 'high' ? 'bg-red-500' : task.priority?.toLowerCase() === 'low' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
      <div className="flex justify-between items-start mb-2 pl-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityStyle(task.priority)}`}>
          {task.priority || 'MEDIUM'}
        </span>
      </div>
      <h3 className="text-white font-semibold text-sm mb-1 pl-2 group-hover:text-[#a19bfe] transition-colors line-clamp-1">{task.title}</h3>
      <p className="text-gray-400 text-xs mb-4 pl-2 line-clamp-2">{task.description}</p>
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5 pl-2">
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Calendar size={12} />
          <span>{task.dueDate || task.deadline || 'No deadline'}</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm" title={`Assigned to ${task.assignee}`}>
          {task.assignee === 'Unassigned' || !task.assignee ? <User size={10} /> : task.assignee[0].toUpperCase()}
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
          <button onClick={() => onNavigate('welcome')} className="flex items-center gap-2 bg-[#131933] border border-white/10 hover:border-white/20 text-gray-300 hover:text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium shadow-inner">
            <Home size={16} /> Home
          </button>
          <button onClick={() => setIsCreatingTask(true)} className="flex items-center gap-2 bg-[#6d28d9] hover:bg-[#5b21b6] text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-purple-900/20 text-sm font-medium">
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40 text-gray-400">Loading tasks...</div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div><h2 className="text-white font-semibold">To Do</h2>
              <span className="bg-white/10 text-gray-400 text-xs px-2 py-0.5 rounded-full ml-auto">{tasks.filter(t => t.status === 'todo').length}</span>
            </div>
            <div className="space-y-3">{tasks.filter(t => t.status === 'todo').map(task => <TaskCard key={task.id} task={task} />)}</div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div><h2 className="text-white font-semibold">In Progress</h2>
              <span className="bg-white/10 text-gray-400 text-xs px-2 py-0.5 rounded-full ml-auto">{tasks.filter(t => t.status === 'in_progress').length}</span>
            </div>
            <div className="space-y-3">{tasks.filter(t => t.status === 'in_progress').map(task => <TaskCard key={task.id} task={task} />)}</div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div><h2 className="text-white font-semibold">Done</h2>
              <span className="bg-white/10 text-gray-400 text-xs px-2 py-0.5 rounded-full ml-auto">{tasks.filter(t => t.status === 'done').length}</span>
            </div>
            <div className="space-y-3">{tasks.filter(t => t.status === 'done').map(task => <TaskCard key={task.id} task={task} />)}</div>
          </div>
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a193a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start p-6 border-b border-white/5 bg-[#1d1a4a]/50">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getPriorityStyle(selectedTask.priority)}`}>{selectedTask.priority || 'MEDIUM'}</span>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">{selectedTask.title}</h2>
              <div className="bg-[#131933] border border-white/5 rounded-xl p-4 mb-6">
                <h4 className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">Description</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{selectedTask.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-[#1d1a4a] flex items-center justify-center text-purple-400"><Clock size={18} /></div>
                  <div><p className="text-[10px] text-gray-500 font-bold uppercase">Deadline</p><p className="text-white text-sm font-medium">{selectedTask.dueDate || selectedTask.deadline || 'None'}</p></div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-[#1d1a4a] flex items-center justify-center text-blue-400"><User size={18} /></div>
                  <div><p className="text-[10px] text-gray-500 font-bold uppercase">Assignee</p><p className="text-white text-sm font-medium">{selectedTask.assignee || "Unassigned"}</p></div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
                {selectedTask.status === 'todo' && <button onClick={handleStartTask} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"><Play size={16} /> Start Doing</button>}
                {selectedTask.status === 'in_progress' && (
                  <>
                    <button onClick={handleCompleteTask} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"><CheckCircle2 size={16} /> Mark Completed</button>
                    <button onClick={handleRevertToTodo} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors"><RotateCcw size={16} /> Move to To Do</button>
                  </>
                )}
                {selectedTask.status === 'done' && <button onClick={handleRevertToInProgress} className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors"><RotateCcw size={16} /> Return to Progress</button>}
                <button onClick={handleDeleteTask} className="flex items-center gap-2 ml-auto text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-xl text-sm font-medium transition-colors"><Trash2 size={16} /> Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreatingTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a193a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#1d1a4a]/50">
              <h2 className="text-xl font-bold text-white">Create New Task</h2>
              <button onClick={() => setIsCreatingTask(false)} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 flex flex-col gap-4">
              <div><label className="block text-[11px] text-gray-400 font-bold uppercase mb-1">Task Title *</label><input type="text" required placeholder="e.g. Design new logo" className="w-full bg-[#131933] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500 transition-colors" value={newTaskForm.title} onChange={e => setNewTaskForm({...newTaskForm, title: e.target.value})}/></div>
              <div><label className="block text-[11px] text-gray-400 font-bold uppercase mb-1">Description</label><textarea rows="3" placeholder="Details about the task..." className="w-full bg-[#131933] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500 transition-colors resize-none" value={newTaskForm.description} onChange={e => setNewTaskForm({...newTaskForm, description: e.target.value})}></textarea></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[11px] text-gray-400 font-bold uppercase mb-1">Assign To</label><input type="text" placeholder="e.g. Orest" className="w-full bg-[#131933] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500 transition-colors" value={newTaskForm.assignee} onChange={e => setNewTaskForm({...newTaskForm, assignee: e.target.value})}/></div>
                <div><label className="block text-[11px] text-gray-400 font-bold uppercase mb-1">Deadline</label><input type="date" className="w-full bg-[#131933] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500 transition-colors cursor-pointer style-date-input" value={newTaskForm.deadline} onChange={e => setNewTaskForm({...newTaskForm, deadline: e.target.value})}/></div>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setIsCreatingTask(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-purple-900/20 transition-all">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;