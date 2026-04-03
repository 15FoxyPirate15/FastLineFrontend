import React, { useState } from 'react';
import { Home } from 'lucide-react';
import { 
  Calendar, Clock, AlertCircle, CheckCircle2, 
  Play, UserPlus, Trash2, X, ChevronDown, Plus, User, RotateCcw 
} from 'lucide-react';

const TasksPage = () => {
  const groups = ['All Groups', 'Frontend Team', 'Backend Team', 'Design Team'];
  const [selectedGroup, setSelectedGroup] = useState('All Groups');
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Fix login page",
      description: "Users can't sign in smtimes.",
      group: "Frontend Team",
      deadline: "2026-03-15",
      priority: "high", 
      status: "todo", 
      assignee: null
    },
    {
      id: 2,
      title: "Design Group Chat UI",
      description: "Create a mockup.",
      group: "Design Team",
      deadline: "2026-03-18",
      priority: "medium",
      status: "in_progress",
      assignee: "Orest"
    },
    {
      id: 3,
      title: "Setup DB",
      description: "just setup db.",
      group: "Backend Team",
      deadline: "2026-03-20",
      priority: "low",
      status: "done",
      assignee: "You"
    }
  ]);

  const [selectedTask, setSelectedTask] = useState(null);
  
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    group: 'Frontend Team',
    priority: 'medium',
    deadline: ''
  });

  const filteredTasks = tasks.filter(task => 
    selectedGroup === 'All Groups' ? true : task.group === selectedGroup
  );

  const getPriorityStyle = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return priority;
    }
  };

  const handleTakeTask = () => {
    setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, assignee: 'You' } : t));
    setSelectedTask({ ...selectedTask, assignee: 'You' });
  };

  const handleStartTask = () => {
    setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status: 'in_progress' } : t));
    setSelectedTask({ ...selectedTask, status: 'in_progress' });
  };

  const handleCompleteTask = () => {
    setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status: 'done' } : t));
    setSelectedTask({ ...selectedTask, status: 'done' });
  };

  const handleDeleteTask = () => {
    setTasks(tasks.filter(t => t.id !== selectedTask.id));
    setSelectedTask(null);
  };

  const handleAssignToOther = () => {
    const mockUser = prompt("Enter username to assign:");
    if (mockUser) {
      setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, assignee: mockUser } : t));
      setSelectedTask({ ...selectedTask, assignee: mockUser });
    }
  };

  const handleRevertToTodo = () => {
    setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status: 'todo' } : t));
    setSelectedTask({ ...selectedTask, status: 'todo' });
  };

  const handleRevertToInProgress = () => {
    setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status: 'in_progress' } : t));
    setSelectedTask({ ...selectedTask, status: 'in_progress' });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;

    const newTask = {
      id: Date.now(),
      title: newTaskForm.title,
      description: newTaskForm.description,
      group: newTaskForm.group,
      priority: newTaskForm.priority,
      deadline: newTaskForm.deadline || "No deadline",
      status: "todo",
      assignee: null
    };

    setTasks([...tasks, newTask]);
    setIsCreatingTask(false);
    setNewTaskForm({ title: '', description: '', group: 'Frontend Team', priority: 'medium', deadline: '' });
  };

  const TaskCard = ({ task }) => (
    <div 
      onClick={() => setSelectedTask(task)}
      className="bg-[#1d1a4a] border border-white/5 hover:border-purple-500/50 rounded-xl p-4 cursor-pointer transition-all shadow-lg group relative overflow-hidden"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
      
      <div className="flex justify-between items-start mb-2 pl-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityStyle(task.priority)}`}>
          {task.priority.toUpperCase()}
        </span>
        <span className="text-[10px] text-gray-500 font-medium">{task.group}</span>
      </div>
      
      <h3 className="text-white font-semibold text-sm mb-1 pl-2 group-hover:text-[#a19bfe] transition-colors line-clamp-1">{task.title}</h3>
      <p className="text-gray-400 text-xs mb-4 pl-2 line-clamp-2">{task.description}</p>
      
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5 pl-2">
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Calendar size={12} className={task.priority === 'high' ? 'text-red-400' : ''}/>
          <span className={task.priority === 'high' ? 'text-red-400 font-medium' : ''}>{task.deadline}</span>
        </div>
        
        {task.assignee ? (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm" title={`Assigned to ${task.assignee}`}>
            {task.assignee === 'You' ? 'Y' : task.assignee[0].toUpperCase()}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border border-dashed border-gray-500 flex items-center justify-center text-gray-500" title="Unassigned">
            <User size={10} />
          </div>
        )}
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
          <div className="relative">
            <button 
              onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
              className="flex items-center gap-2 bg-[#131933] border border-white/10 hover:border-purple-500/50 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium shadow-inner"
            >
              {selectedGroup}
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${isGroupDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isGroupDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#1d1a4a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                {groups.map((group, idx) => (
                  <div 
                    key={idx} 
                    className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm text-gray-200 transition-colors"
                    onClick={() => {
                      setSelectedGroup(group);
                      setIsGroupDropdownOpen(false);
                    }}
                  >
                    {group}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsCreatingTask(true)}
            className="flex items-center gap-2 bg-[#6d28d9] hover:bg-[#5b21b6] text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-purple-900/20 text-sm font-medium"
          >
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* COLUMNS */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TO DO COLUMN */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <h2 className="text-white font-semibold">To Do</h2>
            <span className="bg-white/10 text-gray-400 text-xs px-2 py-0.5 rounded-full ml-auto">
              {filteredTasks.filter(t => t.status === 'todo').length}
            </span>
          </div>
          <div className="space-y-3">
            {filteredTasks.filter(t => t.status === 'todo').map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        </div>

        {/* IN PROGRESS COLUMN */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            <h2 className="text-white font-semibold">In Progress</h2>
            <span className="bg-white/10 text-gray-400 text-xs px-2 py-0.5 rounded-full ml-auto">
              {filteredTasks.filter(t => t.status === 'in_progress').length}
            </span>
          </div>
          <div className="space-y-3">
            {filteredTasks.filter(t => t.status === 'in_progress').map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        </div>

        {/* DONE COLUMN */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <h2 className="text-white font-semibold">Done</h2>
            <span className="bg-white/10 text-gray-400 text-xs px-2 py-0.5 rounded-full ml-auto">
              {filteredTasks.filter(t => t.status === 'done').length}
            </span>
          </div>
          <div className="space-y-3">
            {filteredTasks.filter(t => t.status === 'done').map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        </div>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a193a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-start p-6 border-b border-white/5 bg-[#1d1a4a]/50">
              <div className="flex gap-3 items-center">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getPriorityStyle(selectedTask.priority)}`}>
                  {getPriorityLabel(selectedTask.priority)}
                </span>
                <span className="bg-white/5 text-gray-300 text-xs px-3 py-1 rounded-full border border-white/5">
                  {selectedTask.group}
                </span>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">{selectedTask.title}</h2>
              
              <div className="bg-[#131933] border border-white/5 rounded-xl p-4 mb-6">
                <h4 className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">Description</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-[#1d1a4a] flex items-center justify-center text-purple-400">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Deadline</p>
                    <p className="text-white text-sm font-medium">{selectedTask.deadline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-[#1d1a4a] flex items-center justify-center text-blue-400">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Assignee</p>
                    <p className="text-white text-sm font-medium">{selectedTask.assignee || "Unassigned"}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
                
                {selectedTask.status === 'todo' && (
                  <button onClick={handleStartTask} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    <Play size={16} /> Start Doing
                  </button>
                )}

                {selectedTask.status === 'in_progress' && (
                  <>
                    <button onClick={handleCompleteTask} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                      <CheckCircle2 size={16} /> Mark Completed
                    </button>
                    {/* КНОПКА UNDO (In Progress -> To Do) */}
                    <button onClick={handleRevertToTodo} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                      <RotateCcw size={16} /> Move to To Do
                    </button>
                  </>
                )}

                {selectedTask.status === 'done' && (
                  <>
                    {/* КНОПКА UNDO (Done -> In Progress) */}
                    <button onClick={handleRevertToInProgress} className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                      <RotateCcw size={16} /> Return to Progress
                    </button>
                  </>
                )}

                <button onClick={handleAssignToOther} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                  <UserPlus size={16} /> Assign to...
                </button>

                {selectedTask.assignee !== 'You' && (
                  <button onClick={handleTakeTask} className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    <User size={16} /> Take Task
                  </button>
                )}

                <button onClick={handleDeleteTask} className="flex items-center gap-2 ml-auto text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                  <Trash2 size={16} /> Delete
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- МОДАЛЬНЕ ВІКНО: СТВОРЕННЯ НОВОЇ ЗАДАЧІ --- */}
      {isCreatingTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a193a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#1d1a4a]/50">
              <h2 className="text-xl font-bold text-white">Create New Task</h2>
              <button onClick={() => setIsCreatingTask(false)} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 flex flex-col gap-4">
              
              {/* Title */}
              <div>
                <label className="block text-[11px] text-gray-400 font-bold uppercase mb-1">Task Title *</label>
                <input 
                  type="text" required
                  placeholder="e.g. Design new logo"
                  className="w-full bg-[#131933] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500 transition-colors"
                  value={newTaskForm.title}
                  onChange={e => setNewTaskForm({...newTaskForm, title: e.target.value})}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] text-gray-400 font-bold uppercase mb-1">Description</label>
                <textarea 
                  rows="3"
                  placeholder="Details about the task..."
                  className="w-full bg-[#131933] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500 transition-colors resize-none"
                  value={newTaskForm.description}
                  onChange={e => setNewTaskForm({...newTaskForm, description: e.target.value})}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Group Select */}
                <div>
                  <label className="block text-[11px] text-gray-400 font-bold uppercase mb-1">Assign to Group</label>
                  <select 
                    className="w-full bg-[#131933] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-purple-500 transition-colors cursor-pointer appearance-none"
                    value={newTaskForm.group}
                    onChange={e => setNewTaskForm({...newTaskForm, group: e.target.value})}
                  >
                    {groups.filter(g => g !== 'All Groups').map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Priority Select */}
                <div>
                  <label className="block text-[11px] text-gray-400 font-bold uppercase mb-1">Priority</label>
                  <select 
                    className="w-full bg-[#131933] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-purple-500 transition-colors cursor-pointer appearance-none"
                    value={newTaskForm.priority}
                    onChange={e => setNewTaskForm({...newTaskForm, priority: e.target.value})}
                  >
                    <option value="low">Low (Green)</option>
                    <option value="medium">Medium (Yellow)</option>
                    <option value="high">High (Red)</option>
                  </select>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-[11px] text-gray-400 font-bold uppercase mb-1">Deadline</label>
                <input 
                  type="date" 
                  className="w-full bg-[#131933] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500 transition-colors cursor-pointer style-date-input"
                  value={newTaskForm.deadline}
                  onChange={e => setNewTaskForm({...newTaskForm, deadline: e.target.value})}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setIsCreatingTask(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-purple-900/20 transition-all">
                  Create Task
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default TasksPage;