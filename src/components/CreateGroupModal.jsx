import React, { useState, useEffect } from 'react';
import { X, Search, Users, Check, Loader2, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateGroupModal = ({ isOpen, onClose, currentUser, onSuccess }) => {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://backendfastline.onrender.com/users/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const filtered = (Array.isArray(data) ? data : []).filter(u => 
            u.email !== currentUser?.email && !selectedUsers.some(selected => selected.email === u.email)
          );
          setSearchResults(filtered);
        }
      } catch (err) { console.error("Search error:", err); } 
      finally { setIsSearching(false); }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentUser, selectedUsers]);

  const toggleUser = (user) => {
    if (selectedUsers.find(u => u.email === user.email)) {
      setSelectedUsers(prev => prev.filter(u => u.email !== user.email));
    } else {
      setSelectedUsers(prev => [...prev, user]);
      setSearchQuery(''); setSearchResults([]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return toast.error("Please enter a group name");

    setIsCreating(true);
    try {
      const token = localStorage.getItem('token');
      // Якщо selectedUsers порожній, масив members теж буде порожнім (лише email творця додаємо за потреби, або порожній масив, як вимагає бек)
      const members = selectedUsers.map(u => u.email); 

      const res = await fetch('https://backendfastline.onrender.com/chats/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: groupName,
          ownerEmail: currentUser.email, // За новим ТЗ бекендера
          members: members, // Тепер можна передавати порожній масив []
          type: 'group'
        })
      });

      if (res.ok) {
        const newGroup = await res.json();
        toast.success("Group created successfully!");
        onSuccess(newGroup);
        onClose();
        setGroupName('');
        setSelectedUsers([]);
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Failed to create group");
      }
    } catch (err) { toast.error("Server error"); } 
    finally { setIsCreating(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#1a1d36] border border-white/5 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-[#131627]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6d28d9] to-blue-600 flex items-center justify-center text-white shadow-lg"><Users size={18} /></div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Create New Group</h2>
              <p className="text-[#a19bfe] text-[11px] font-medium">Team Workspace</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all active:scale-95"><X size={20} /></button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex justify-center custom-settings-scroll">
          <div className="w-full space-y-8">
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-widest ml-1 opacity-80 flex items-center gap-2"><Hash size={14}/> Group Name</label>
              <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. Frontend Team" className="w-full bg-[#131627] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#6d28d9] transition-all" autoFocus />
            </div>

            {selectedUsers.length > 0 && (
              <div className="space-y-2.5 animate-in fade-in">
                <label className="text-sm font-bold text-[#a19bfe] uppercase tracking-widest ml-1 opacity-80 flex items-center gap-2"><Check size={14}/> Added Members ({selectedUsers.length})</label>
                <div className="flex flex-wrap gap-2.5 p-3.5 bg-[#1a1d36]/50 border border-white/5 rounded-xl">
                  {selectedUsers.map(u => (
                    <div key={u.email} className="flex items-center gap-2.5 bg-[#6d28d9]/20 border border-[#6d28d9]/40 text-white py-1.5 pl-2.5 pr-1.5 rounded-lg">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[9px] font-bold overflow-hidden">
                         {u.avatarUrl && u.avatarUrl !== 'none' ? <img src={u.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : (u.displayName?.[0]?.toUpperCase() || '?')}
                      </div>
                      <span className="text-xs font-medium">{u.displayName || u.email.split('@')[0]}</span>
                      <button onClick={() => toggleUser(u)} className="hover:bg-black/30 p-0.5 rounded-md transition-colors ml-1"><X size={12} className="text-gray-300 hover:text-white" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 relative">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-widest ml-1 opacity-80 flex items-center gap-2"><Search size={14}/> Invite People (Optional)</label>
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or email..." className="w-full bg-[#131627] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#6d28d9]" />
                {isSearching && <Loader2 size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a19bfe] animate-spin" />}
              </div>

              {searchResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-5 animate-in slide-in-from-bottom-2 fade-in">
                  {searchResults.map(user => (
                    <div key={user.email} onClick={() => toggleUser(user)} className="flex items-center gap-3.5 bg-[#1a1d36] border border-white/5 p-3.5 rounded-xl hover:bg-[#8b5cf6]/10 hover:border-[#8b5cf6]/30 cursor-pointer transition-all group shadow-sm hover:shadow-md">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 border border-white/10 overflow-hidden">
                        {user.avatarUrl && user.avatarUrl !== 'none' ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : (user.displayName?.[0]?.toUpperCase() || '?')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-200 truncate group-hover:text-white">{user.displayName || "User"}</div>
                        <div className="text-[11px] text-[#a19bfe] truncate">{user.email}</div>
                      </div>
                      <div className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#6d28d9] group-hover:border-[#6d28d9] transition-colors"><Users size={12} className="text-gray-500 group-hover:text-white"/></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-white/5 bg-[#131627] flex justify-end gap-3.5 shadow-sm">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors active:scale-95">Cancel</button>
          
          {/* ЗМІНЕНО: Кнопка активна навіть якщо selectedUsers.length === 0 */}
          <button onClick={handleCreateGroup} disabled={!groupName.trim() || isCreating} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#6d28d9] to-[#5b21b6] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(109,40,217,0.3)] active:scale-95">
            {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;