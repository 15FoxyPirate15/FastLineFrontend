import React, { useState, useEffect, useRef } from 'react';
import { Search, Settings, LogOut, FolderKanban, MessageSquare, Plus, Users, Hash, Contact, UserPlus, Zap } from 'lucide-react';

const Sidebar = ({ onNavigate, currentUser, onProfileClick, onLogout, onStartChat, onStartGroupChat, refreshTrigger, onCreateGroupClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false); 
  
  const [directChats, setDirectChats] = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [projects, setProjects] = useState([]); 

  const sidebarRef = useRef(null);

  // Функція закриття пошуку
  const cancelSearch = () => {
    setIsSearchMode(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Обертка для навігації, щоб закривати пошук при переході на іншу сторінку
  const handleNavigation = (path) => {
    cancelSearch();
    onNavigate(path);
  };

  useEffect(() => {
    // Слухач для кліків за межами сайдбару
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        cancelSearch();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      setIsSearching(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://backendfastline.onrender.com/users/search?q=${encodeURIComponent(query)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSearchResults(Array.isArray(data) ? data : []); 
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        setSearchResults([]);
      } finally {
        setTimeout(() => setIsSearching(false), 400); 
      }
    } else {
      setSearchResults([]);
    }
  };

  useEffect(() => {
    if (!currentUser?.email) return;
    const fetchMyChats = async () => {
        setIsLoadingChats(true);
        try {
            const res = await fetch(`https://backendfastline.onrender.com/chats/user/${currentUser.email}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!res.ok) return;
            
            const data = await res.json();
            
            if (Array.isArray(data)) {
                const dChats = [];
                const gChats = [];

                data.forEach(chat => {
                    let timeString = "";
                    const timeSource = chat.lastMessage?.sentAt || chat.createdAt;
                    if (timeSource) {
                        const dateObj = timeSource._seconds ? new Date(timeSource._seconds * 1000) : new Date(timeSource);
                        timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }

                    if (chat.type === 'group' || chat.type === 'project') {
                        gChats.push({ id: chat.id, name: chat.name || "Unnamed Group", subtitle: chat.lastMessage?.text || "No messages yet", time: timeString });
                    } else {
                        let otherUserEmail = "Unknown User";
                        if (chat.participants && Array.isArray(chat.participants)) {
                            otherUserEmail = chat.participants.find(email => email !== currentUser.email) || chat.participants[0];
                        }
                        
                        const chatName = chat.name || chat.full_name || otherUserEmail.split('@')[0];
                        
                        dChats.push({ 
                            id: chat.id, 
                            name: chatName, 
                            email: otherUserEmail, 
                            subtitle: chat.lastMessage?.text || "No messages yet", 
                            time: timeString 
                        });
                    }
                });
                
                setDirectChats(dChats);
                setGroupChats(gChats);
            }
        } catch (err) {
            console.error("Chat loading error:", err);
        } finally {
            setIsLoadingChats(false);
        }
    };

    fetchMyChats();
  }, [currentUser, refreshTrigger]);

  const ChatSkeleton = () => (
    <div className="flex items-center gap-3 p-3 rounded-2xl animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-white/5 shrink-0 border border-white/5"></div>
      <div className="flex-1 space-y-2.5">
        <div className="flex justify-between">
            <div className="h-3 bg-white/10 rounded w-1/2"></div>
        </div>
        <div className="h-2 bg-white/5 rounded w-3/4"></div>
      </div>
    </div>
  );

  return (
    <div ref={sidebarRef} className="w-[320px] bg-[#05060f]/95 backdrop-blur-3xl flex flex-col h-screen border-r border-white/5 font-sans relative z-20 shadow-[10px_0_40px_rgba(0,0,0,0.5)]">
      
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(139, 92, 246, 0.5); }
        `}
      </style>

      {/* HEADER */}
      <div className="px-6 pt-8 pb-6 flex justify-between items-center relative z-30">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleNavigation('welcome')}>
            <div className="w-8 h-8 bg-gradient-to-tr from-[#6d28d9] to-[#3b82f6] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(109,40,217,0.5)] group-hover:scale-110 transition-transform">
                <Zap size={18} className="text-white" />
            </div>
            <h1 className="text-white text-2xl font-black tracking-tighter">Fast<span className="text-[#a19bfe]">Line</span></h1>
        </div>
        
        <button 
          onClick={() => handleNavigation('contacts')} 
          className="p-2.5 bg-[#101426] hover:bg-[#1a1f3c] border border-white/5 hover:border-[#6d28d9]/50 rounded-xl text-[#a19bfe] hover:text-white transition-all shadow-inner group"
          title="Contacts"
        >
          <Contact size={18} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* SEARCH BAR (Кнопку Cancel видалено) */}
      <div className="px-6 pb-6 flex gap-3 items-center relative z-30">
        <div className="flex-1 bg-[#101426] flex items-center px-4 py-3.5 rounded-2xl border border-white/5 focus-within:border-[#6d28d9]/50 focus-within:ring-4 focus-within:ring-[#6d28d9]/10 transition-all duration-300 shadow-inner">
          <Search size={18} className="text-[#a19bfe] mr-3 shrink-0" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setIsSearchMode(true)}
            className="bg-transparent border-none outline-none text-sm text-gray-200 w-full placeholder-gray-600 font-medium" 
          />
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 relative overflow-hidden">
        
        {isSearchMode ? (
          /* РЕЖИМ ПОШУКУ */
          <div 
            key="search-view" 
            className="absolute inset-0 overflow-y-auto custom-scrollbar px-6 animate-in fade-in slide-in-from-right-8 duration-300 cursor-default"
            onClick={cancelSearch} /* Клік по порожньому місцю закриває пошук */
          >
            <div className="text-[10px] font-black text-[#a19bfe] uppercase tracking-[0.2em] mb-4 opacity-60">Global Search</div>
            
            {isSearching ? (
               <div className="p-6 flex justify-center"><div className="w-6 h-6 border-2 border-[#6d28d9] border-t-transparent rounded-full animate-spin"></div></div>
            ) : searchResults.length > 0 ? (
               <div className="space-y-2">
                 {searchResults.map((user, idx) => {
                   const displayName = user.full_name || user.displayName || user.name || user.email?.split('@')[0] || "Unknown User";
                   const avatarImage = user.avatarUrl || user.photoURL || user.avatar;

                   return (
                     <div 
                       key={user.id || idx} 
                       className="flex items-center gap-3 p-3 bg-[#101426]/50 hover:bg-[#6d28d9]/20 rounded-2xl border border-white/5 hover:border-[#6d28d9]/30 cursor-pointer transition-all group" 
                       onClick={(e) => { 
                          e.stopPropagation(); // Зупиняємо клік, щоб не спрацював onClick на батьківському div
                          cancelSearch(); 
                          onStartChat({...user, name: displayName}); 
                       }}
                     >
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#3b82f6] flex items-center justify-center text-white font-bold shadow-md overflow-hidden shrink-0">
                         {avatarImage && avatarImage !== 'none' ? (
                            <img src={avatarImage} className="w-full h-full object-cover" alt="avatar" />
                         ) : (
                            displayName[0]?.toUpperCase()
                         )}
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="text-sm font-bold text-white group-hover:text-[#a19bfe] transition-colors truncate">
                            {displayName}
                         </div>
                         <div className="text-[11px] text-gray-400 truncate">
                            {user.email || "No email"}
                         </div>
                       </div>
                       <UserPlus size={16} className="text-gray-500 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                     </div>
                   );
                 })}
               </div>
            ) : searchQuery.length > 0 ? (
               <div className="p-8 text-center text-gray-500 text-sm italic border border-dashed border-white/5 rounded-2xl">No users found</div>
            ) : (
               <div className="p-8 text-center text-gray-500 text-sm italic">Type to start searching...</div>
            )}
          </div>
        ) : (
          
          /* СТАНДАРТНИЙ САЙДБАР */
          <div key="normal-view" className="absolute inset-0 overflow-y-auto custom-scrollbar px-6 space-y-8 animate-in fade-in slide-in-from-left-8 duration-300">
            
            {/* PROJECTS */}
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black text-[#a19bfe] uppercase tracking-[0.2em] mb-3 opacity-60">
                <FolderKanban size={12} /> <span>Active Projects</span>
              </div>
              <div className="space-y-1">
                {projects.length === 0 ? (
                    <div className="py-2 text-[11px] text-gray-500 italic">
                        No active projects yet.
                    </div>
                ) : (
                    projects.map((proj, idx) => ( <div key={idx} /> ))
                )}
              </div>
            </div>

            {/* GROUPS */}
            <div>
              <div className="flex items-center justify-between text-[10px] text-[#a19bfe] font-black uppercase tracking-[0.2em] mb-3 opacity-60">
                <div className="flex items-center gap-2"><Users size={12} /> <span>Groups</span></div>
                <Plus onClick={onCreateGroupClick} size={14} className="cursor-pointer hover:text-white transition-colors" />
              </div>
              <div className="space-y-1">
                {isLoadingChats ? ( <ChatSkeleton /> ) : (
                  groupChats.map((group) => (
                    <div key={group.id} onClick={() => onStartGroupChat(group)} className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-[#1e2336] flex items-center justify-center text-[#a19bfe] border border-white/5 group-hover:border-[#6d28d9]/50 transition-all shrink-0">
                          <Hash size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <span className="text-gray-200 text-sm font-bold truncate group-hover:text-white pr-2">{group.name}</span>
                          <span className="text-[10px] text-gray-600 shrink-0">{group.time}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 truncate group-hover:text-gray-400 transition">{group.subtitle}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* DIRECT MESSAGES */}
            <div>
              <div className="flex items-center gap-2 text-[10px] text-[#a19bfe] font-black uppercase tracking-[0.2em] mb-3 opacity-60">
                <MessageSquare size={12} /> <span>Messages</span>
              </div>
              <div className="space-y-1">
                {isLoadingChats ? ( <><ChatSkeleton /><ChatSkeleton /></> ) : (
                  directChats.map((msg) => {
                    const initial = msg.name?.[0]?.toUpperCase() || msg.email?.[0]?.toUpperCase() || '?';
                    return (
                      <div key={msg.id} onClick={() => onStartChat({ email: msg.email, name: msg.name, id: msg.id })} className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1e2336] to-[#0a0b1e] border border-white/10 flex items-center justify-center text-white text-xs font-bold group-hover:shadow-[0_0_15px_rgba(109,40,217,0.3)] transition-all shrink-0">
                          {msg.img || initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <span className="text-gray-200 text-sm font-bold truncate group-hover:text-white pr-2">{msg.name}</span>
                            <span className="text-[10px] text-gray-600 shrink-0">{msg.time}</span>
                          </div>
                          <div className="text-[11px] text-gray-500 truncate group-hover:text-gray-400 transition">{msg.subtitle}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-6 pt-4 relative z-30">
          <div className="bg-[#101426] border border-white/5 rounded-[2rem] p-3 flex items-center gap-3 shadow-2xl hover:border-[#6d28d9]/30 transition-colors">
            <div className="relative" onClick={onProfileClick}>
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#6d28d9]/50 cursor-pointer hover:scale-105 transition-transform bg-[#1e2336] shrink-0">
                {currentUser?.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gradient-to-br from-[#6d28d9] to-[#3b82f6] flex items-center justify-center text-white font-bold">{currentUser?.name?.[0]?.toUpperCase() || currentUser?.full_name?.[0]?.toUpperCase() || '?'}</div>}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#101426] bg-green-500 shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-bold truncate">{currentUser?.name || currentUser?.full_name || currentUser?.email?.split('@')[0]}</div>
              <div className="text-[10px] text-[#a19bfe] font-medium truncate opacity-70">{currentUser?.handle || currentUser?.email}</div>
            </div>
            <LogOut onClick={onLogout} size={18} className="text-gray-500 hover:text-red-400 cursor-pointer transition-colors mr-2 shrink-0" />
          </div>
      </div>
    </div>
  );
};

export default Sidebar;