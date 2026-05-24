import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Trash2, Loader2, Edit2, Save, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageMembersModal = ({ isOpen, onClose, roomId, groupName, participants, currentUser, refreshParticipants, onLeaveGroup }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editName, setEditName] = useState(groupName || "");
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => { setEditName(groupName); }, [groupName]);

  useEffect(() => {
    if (!isOpen || !searchQuery.trim()) { setSearchResults([]); return; }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://backendfastline.onrender.com/users/search?q=${encodeURIComponent(searchQuery)}`, { headers: { 'Authorization': `Bearer ${token}` }});
        if (res.ok) {
          const data = await res.json();
          const filtered = (Array.isArray(data) ? data : []).filter(u => !participants.some(p => p.email === u.email));
          setSearchResults(filtered);
        }
      } catch (err) {} finally { setIsSearching(false); }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, isOpen, participants]);

  const handleAddUser = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://backendfastline.onrender.com/chats/${roomId}/members`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: user.email }) 
      });
      if (response.ok) {
        toast.success(`${user.displayName || user.name || user.email} added to group!`, { style: { background: '#1e1b2e', color: '#fff' }});
        setSearchQuery(''); refreshParticipants(); 
      } else { toast.error("Failed to add user", { style: { background: '#1e1b2e', color: '#fff' }}); }
    } catch (error) { toast.error("Connection error", { style: { background: '#1e1b2e', color: '#fff' }}); }
  };

  const handleRemoveUser = async (userEmail) => {
    if (userEmail === currentUser.email) return toast.error("Use 'Leave Group' instead", { style: { background: '#1e1b2e', color: '#fff' }});
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://backendfastline.onrender.com/chats/${roomId}/members`, { 
        method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: userEmail }) 
      });
      if (response.ok) {
        toast.success(`${userEmail} removed.`, { style: { background: '#1e1b2e', color: '#fff' }});
        refreshParticipants(); 
      } else { toast.error("Failed to remove user", { style: { background: '#1e1b2e', color: '#fff' }}); }
    } catch (error) { toast.error("Connection error", { style: { background: '#1e1b2e', color: '#fff' }}); }
  };

  const handleSaveGroupInfo = async () => {
    if (!editName.trim()) return;
    setIsSavingInfo(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://backendfastline.onrender.com/chats/${roomId}`, { 
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: editName }) 
      });
      if(response.ok) { toast.success("Group info updated!", { style: { background: '#1e1b2e', color: '#fff' }}); } 
      else { toast.error("Endpoint not ready (Needs PATCH /chats/:id)", { style: { background: '#1e1b2e', color: '#fff' }}); }
    } catch (error) { toast.error("Connection error", { style: { background: '#1e1b2e', color: '#fff' }}); } 
    finally { setIsSavingInfo(false); }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    setIsLeaving(true);
    try {
      const token = localStorage.getItem('token');
      // NOTE FOR BACKEND: Needs endpoint DELETE /chats/:id/leave
      const response = await fetch(`https://backendfastline.onrender.com/chats/${roomId}/leave`, { 
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
         toast.success("You left the group.", { style: { background: '#1e1b2e', color: '#fff' }});
         onClose();
         if (onLeaveGroup) onLeaveGroup();
      } else {
         toast.error("Failed to leave group", { style: { background: '#1e1b2e', color: '#fff' }});
      }
    } catch (error) {
      toast.error("Connection error", { style: { background: '#1e1b2e', color: '#fff' }});
    } finally {
      setIsLeaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#1a1d36] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#131627]">
          <h2 className="text-white font-bold text-lg">Group Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto custom-settings-scroll">
          {/* GROUP INFO */}
          <div className="space-y-3">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Group Info</h3>
             <div className="flex items-center gap-3">
                <div className="relative group cursor-pointer shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-white font-bold text-xl shadow-md overflow-hidden">
                    {editName[0]?.toUpperCase() || 'G'}
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 size={16} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                   <input 
                      type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#131627] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#6d28d9]"
                   />
                   {editName !== groupName && (
                       <button onClick={handleSaveGroupInfo} disabled={isSavingInfo} className="self-end flex items-center gap-1.5 bg-[#6d28d9] hover:bg-[#5b21b6] text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                           {isSavingInfo ? <Loader2 size={12} className="animate-spin"/> : <Save size={12}/>} Save
                       </button>
                   )}
                </div>
             </div>
          </div>

          <div className="h-px bg-white/5 w-full"></div>

          {/* SEARCH */}
          <div className="space-y-3 relative">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Add Members</h3>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Invite people..."
                className="w-full bg-[#131627] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-[#6d28d9]"
              />
              {isSearching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a19bfe] animate-spin" />}
            </div>
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1d1a4a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-10">
                {searchResults.map(u => (
                  <div key={u.email} onClick={() => handleAddUser(u)} className="flex items-center justify-between px-4 py-3 hover:bg-[#8b5cf6]/20 cursor-pointer border-b border-white/5">
                    <span className="text-sm text-gray-200">{u.displayName || u.name || u.email}</span>
                    <UserPlus size={16} className="text-[#a19bfe]"/>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CURRENT MEMBERS */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">In Group ({participants.length})</h3>
            <div className="space-y-2">
              {participants.map(p => (
                <div key={p.email} className="flex items-center justify-between bg-[#131627] p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                       {p.avatarUrl && p.avatarUrl !== 'none' ? <img src={p.avatarUrl} className="w-full h-full object-cover"/> : p.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{p.displayName || p.name || "User"} {p.email === currentUser.email && "(You)"}</span>
                        <span className="text-[10px] text-gray-500">{p.email}</span>
                    </div>
                  </div>
                  {p.email !== currentUser.email && (
                    <button onClick={() => handleRemoveUser(p.email)} className="text-gray-500 hover:text-red-400 p-1.5 hover:bg-red-400/10 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER LEAVE GROUP */}
        <div className="p-4 border-t border-white/5 bg-[#131627] flex justify-between items-center">
            <button 
               onClick={handleLeaveGroup} 
               disabled={isLeaving}
               className="flex items-center gap-2 text-red-400 hover:text-white hover:bg-red-500/20 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            >
               {isLeaving ? <Loader2 size={16} className="animate-spin"/> : <LogOut size={16}/>} 
               Leave Group
            </button>
            <button onClick={onClose} className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-colors">
               Done
            </button>
        </div>

      </div>
    </div>
  );
};
export default ManageMembersModal;