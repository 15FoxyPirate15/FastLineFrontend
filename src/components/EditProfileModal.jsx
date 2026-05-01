import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Save, User, Clock, Calendar, Info, AtSign, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const EditProfileModal = ({ isOpen, onClose, currentUser, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    status: 'online',
    bio: '',
    workStart: '09:00',
    workEnd: '18:00',
    dob: '',
    pronouns: ''
  });

  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const statusMenuRef = useRef(null);

  // Status Definitions
  const statusOptions = [
    { id: 'online', label: 'Online', color: 'bg-green-500' },
    { id: 'away', label: 'Away', color: 'bg-yellow-500' },
    { id: 'dnd', label: 'Do Not Disturb', color: 'bg-red-500' },
    { id: 'invisible', label: 'Invisible', color: 'bg-gray-500' }
  ];

  // Initialize data
  useEffect(() => {
    if (isOpen && currentUser) {
      setFormData({
        name: currentUser.name || '',
        handle: currentUser.handle?.replace('@', '') || '',
        status: currentUser.status || 'online',
        bio: currentUser.bio || '',
        workStart: currentUser.workStart || '09:00',
        workEnd: currentUser.workEnd || '18:00',
        dob: currentUser.dob || '',
        pronouns: currentUser.pronouns || ''
      });
    }
  }, [isOpen, currentUser]);

  // Close on Esc and outside click for Status Dropdown
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    const handleClickOutside = (e) => {
        if (statusMenuRef.current && !statusMenuRef.current.contains(e.target)) {
            setIsStatusMenuOpen(false);
        }
    };
    if (isOpen) {
        document.addEventListener('keydown', handleEsc);
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('keydown', handleEsc);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (statusId) => {
      setFormData(prev => ({ ...prev, status: statusId }));
      setIsStatusMenuOpen(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return toast.error("Name cannot be empty", { style: { background: '#1e1b2e', color: '#fff' }});
    
    onSave(formData);
    toast.success("Profile updated successfully!", { style: { background: '#1e1b2e', color: '#fff' }});
    onClose();
  };

  if (!isOpen) return null;

  const currentStatusObj = statusOptions.find(s => s.id === formData.status) || statusOptions[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      {/* Зроблено вікно ширшим: max-w-2xl замість max-w-lg */}
      <div className="w-full max-w-2xl bg-[#1a1d36] border border-white/5 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
        
        {/* HEADER */}
        <div className="h-16 px-8 border-b border-white/5 flex items-center justify-between bg-[#131627] shrink-0">
          <h2 className="text-white font-bold text-lg">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all active:scale-95 border border-transparent hover:border-white/10">
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 custom-settings-scroll space-y-10">
          
          {/* AVATAR & STATUS */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden border-[4px] border-[#131627]">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  formData.name?.[0]?.toUpperCase() || 'U'
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={28} className="text-white mb-1" />
                  <span className="text-[11px] text-white font-medium uppercase tracking-wider">Change</span>
                </div>
              </div>
              {/* Status Indicator */}
              <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-[#1a1d36] shadow-sm ${currentStatusObj.color}`}></div>
            </div>
            
            {/* СУЧАСНИЙ ВИПАДАЮЧИЙ СПИСОК СТАТУСУ */}
            <div className="mt-5 relative z-50" ref={statusMenuRef}>
              <button 
                onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                className="flex items-center gap-2.5 bg-[#131627] hover:bg-[#1e1b2e] border border-white/10 text-white text-sm font-medium rounded-xl px-4 py-2 transition-colors shadow-inner"
              >
                <div className={`w-2.5 h-2.5 rounded-full ${currentStatusObj.color} shadow-sm`}></div>
                {currentStatusObj.label}
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isStatusMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStatusMenuOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-[#131627] border border-white/10 rounded-xl shadow-2xl py-1.5 animate-in fade-in zoom-in-95">
                  {statusOptions.map(status => (
                    <button 
                      key={status.id}
                      onClick={() => handleStatusChange(status.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-sm text-gray-200 hover:text-white transition-colors"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${status.color}`}></div>
                      {status.label}
                      {formData.status === status.id && <Check size={14} className="ml-auto text-[#a19bfe]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* NAME & HANDLE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 opacity-80">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#131627] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm outline-none focus:border-[#6d28d9] focus:ring-1 focus:ring-[#6d28d9] transition-all shadow-inner" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 opacity-80">Handle (@)</label>
                <div className="relative">
                  <AtSign size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" name="handle" value={formData.handle} onChange={handleChange} className="w-full bg-[#131627] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm outline-none focus:border-[#6d28d9] focus:ring-1 focus:ring-[#6d28d9] transition-all shadow-inner" />
                </div>
              </div>
            </div>

            {/* BIO & PRONOUNS */}
            <div className="space-y-2 relative z-0">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 opacity-80">Bio</label>
                <input type="text" name="pronouns" value={formData.pronouns} onChange={handleChange} placeholder="Pronouns (e.g. he/him)" className="bg-transparent border-none text-[#a19bfe] text-xs font-medium text-right outline-none placeholder-[#a19bfe]/50 w-40" />
              </div>
              <div className="relative">
                <Info size={18} className="absolute left-3.5 top-3.5 text-gray-500" />
                <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="What do you do? What's interesting?" rows="3" className="w-full bg-[#131627] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm outline-none focus:border-[#6d28d9] focus:ring-1 focus:ring-[#6d28d9] transition-all resize-none custom-settings-scroll shadow-inner"></textarea>
              </div>
            </div>

            {/* WORKING HOURS & DOB */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-0">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 opacity-80">Working Hours</label>
                <div className="flex items-center gap-3 bg-[#131627] border border-white/10 rounded-xl px-4 py-3 shadow-inner">
                  <Clock size={18} className="text-gray-500 shrink-0" />
                  <input type="time" name="workStart" value={formData.workStart} onChange={handleChange} className="bg-transparent text-white text-sm outline-none w-full [color-scheme:dark] font-medium" />
                  <span className="text-gray-600 font-bold">-</span>
                  <input type="time" name="workEnd" value={formData.workEnd} onChange={handleChange} className="bg-transparent text-white text-sm outline-none w-full [color-scheme:dark] font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 opacity-80">Date of Birth</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-[#131627] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm outline-none focus:border-[#6d28d9] focus:ring-1 focus:ring-[#6d28d9] transition-all [color-scheme:dark] shadow-inner font-medium" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-white/5 bg-[#131627] shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-gray-500 font-medium">
              Account created: <span className="text-gray-400">March 14, 2024</span>
            </div>
            
            <div className="flex gap-3">
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors active:scale-95">
                Cancel
              </button>
              <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#6d28d9] to-[#5b21b6] text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(109,40,217,0.3)] hover:shadow-[0_0_20px_rgba(109,40,217,0.5)] active:scale-95">
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EditProfileModal;