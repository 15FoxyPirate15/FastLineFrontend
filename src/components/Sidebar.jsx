import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Settings, LogOut, FolderKanban, MessageSquare, Plus, Users, Hash, Contact, Zap, Shield, Code2, BookOpen, BarChart3, ChevronRight, X, ArrowRight, Bell, CheckCircle2, Trash2, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Sidebar = ({ onNavigate, currentUser, onProfileClick, onLogout, onStartChat, onStartGroupChat, refreshTrigger, onCreateGroupClick, socket }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false); 
  
  const [directChats, setDirectChats] = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [projects, setProjects] = useState([]); 
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  // --- СТАНИ ДЛЯ РЕАЛЬНИХ СПОВІЩЕНЬ ---
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsRef = useRef(null);

  const sidebarRef = useRef(null);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const isResizing = useRef(false);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none'; 
  }, []);

  const resize = useCallback((e) => {
    if (isResizing.current) {
      let newWidth = e.clientX;
      if (newWidth < 250) newWidth = 250; 
      if (newWidth > 500) newWidth = 500; 
      setSidebarWidth(newWidth);
    }
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const cancelSearch = () => { setIsSearchMode(false); setSearchQuery(''); setSearchResults([]); };
  const handleNavigation = (path, id = null) => { cancelSearch(); onNavigate(path, id); };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) cancelSearch();
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setIsNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 0) {
      setIsSearching(true);
      setIsSearchMode(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://backendfastline.onrender.com/users/search?q=${encodeURIComponent(query)}`, { headers: { 'Authorization': `Bearer ${token}` }});
        if (response.ok) {
          const data = await response.json();
          setSearchResults(Array.isArray(data) ? data : []); 
        } else { setSearchResults([]); }
      } catch (error) { setSearchResults([]); } 
      finally { setIsSearching(false); }
    } else { setSearchResults([]); }
  };

  // --- REST API: ОТРИМАННЯ СПОВІЩЕНЬ ПРИ ЗАВАНТАЖЕННІ ---
  const fetchNotificationsData = async () => {
      if (!currentUser) return;
      try {
          const token = localStorage.getItem('token');
          const notifRes = await fetch('https://backendfastline.onrender.com/notifications', { headers: { 'Authorization': `Bearer ${token}` } });
          if (notifRes.ok) setNotifications(await notifRes.json());

          const countRes = await fetch('https://backendfastline.onrender.com/notifications/unread-count', { headers: { 'Authorization': `Bearer ${token}` } });
          if (countRes.ok) {
              const countData = await countRes.json();
              setUnreadCount(countData.count || 0);
          }
      } catch (err) { console.error("Notifications fetch error", err); }
  };

  const fetchAllData = async () => {
    if (!currentUser) return;
    setIsLoadingChats(true);
    try {
        const token = localStorage.getItem('token');
        const userId = currentUser.id || currentUser.uid || currentUser.email;

        // Чати
        const chatsRes = await fetch(`https://backendfastline.onrender.com/chats/user/${currentUser.email}`, { headers: { 'Authorization': `Bearer ${token}` }});
        if (chatsRes.ok) {
            const data = await chatsRes.json();
            if (Array.isArray(data)) {
                const dChats = []; const gChats = [];
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
                        dChats.push({ id: chat.id, name: chatName, email: otherUserEmail, subtitle: chat.lastMessage?.text || "No messages yet", time: timeString });
                    }
                });
                setDirectChats(dChats); setGroupChats(gChats);
            }
        }

        // Проєкти
        const projRes = await fetch(`https://backendfastline.onrender.com/projects?userId=${encodeURIComponent(userId)}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (projRes.ok) setProjects(await projRes.json());

        // Завантажуємо сповіщення один раз при старті
        await fetchNotificationsData();

    } catch (err) { console.error("Data loading error:", err); } 
    finally { setIsLoadingChats(false); }
  };

  useEffect(() => { 
      fetchAllData(); 
      // Ми прибрали setInterval! Тепер покладаємося на WebSockets.
  }, [currentUser, refreshTrigger]);

  // --- WEBSOCKETS ДЛЯ РЕАЛТАЙМ СПОВІЩЕНЬ ---
  useEffect(() => {
      if (!socket || !currentUser) return;
      
      const handleNewNotification = (notification) => {
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
          toast.success(notification.title || "New notification!");
      };

      const handleUnreadCount = (data) => {
          if (data && data.count !== undefined) {
              setUnreadCount(data.count);
          }
      };

      socket.on('new_notification', handleNewNotification);
      socket.on('unread_notifications_count', handleUnreadCount);

      return () => {
          socket.off('new_notification', handleNewNotification);
          socket.off('unread_notifications_count', handleUnreadCount);
      };
  }, [socket, currentUser]);

  // --- ОБРОБКА КЛІКІВ СПОВІЩЕНЬ ---
  const handleMarkAsRead = async (notifId) => {
      try {
          const token = localStorage.getItem('token');
          await fetch(`https://backendfastline.onrender.com/notifications/${notifId}/read`, {
              method: 'PATCH',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
          setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) { console.error(err); }
  };

  const handleMarkAllAsRead = async () => {
      try {
          const token = localStorage.getItem('token');
          await fetch(`https://backendfastline.onrender.com/notifications/read-all`, {
              method: 'PATCH',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          setUnreadCount(0);
          toast.success("All caught up!", { icon: '✨' });
      } catch (err) { console.error(err); }
  };

  const handleDeleteNotification = async (notifId, e) => {
      e.stopPropagation();
      try {
          const token = localStorage.getItem('token');
          await fetch(`https://backendfastline.onrender.com/notifications/${notifId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          // Якщо видаляємо непрочитане, треба також зменшити лічильник
          const notifToDelete = notifications.find(n => n.id === notifId);
          if (notifToDelete && !notifToDelete.read) {
              setUnreadCount(prev => Math.max(0, prev - 1));
          }
          setNotifications(prev => prev.filter(n => n.id !== notifId));
      } catch (err) { console.error(err); }
  };

  const ChatSkeleton = () => (
    <div className="flex items-center gap-3 p-3 rounded-2xl animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-white/5 shrink-0 border border-white/5"></div>
      <div className="flex-1 space-y-2.5">
        <div className="flex justify-between"><div className="h-3 bg-white/10 rounded w-1/2"></div></div>
        <div className="h-2 bg-white/5 rounded w-3/4"></div>
      </div>
    </div>
  );

  const getProjectIcon = (idx) => {
      const icons = [<Shield size={16}/>, <Code2 size={16}/>, <BookOpen size={16}/>, <BarChart3 size={16}/>];
      const colors = ["text-blue-400 bg-blue-500/10", "text-purple-400 bg-purple-500/10", "text-emerald-400 bg-emerald-500/10", "text-orange-400 bg-orange-500/10"];
      return { icon: icons[idx % icons.length], colorClass: colors[idx % colors.length] };
  };

  // Вибір іконки залежно від типу сповіщення (на основі NotificationType з бекенду)
  const getNotificationIcon = (type) => {
      switch(type) {
          case 'private_message':
          case 'group_message': return <MessageSquare size={16} className="text-blue-400" />;
          case 'project_invite': return <Users size={16} className="text-purple-400" />;
          case 'task_assigned':
          case 'task_completed': return <CheckCircle2 size={16} className="text-emerald-400" />;
          case 'security_alert': return <Shield size={16} className="text-red-400" />;
          default: return <Bell size={16} className="text-[#a19bfe]" />;
      }
  };

  return (
    <div ref={sidebarRef} style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }} className="bg-[#05060f]/95 backdrop-blur-3xl border-r border-white/5 flex flex-col h-screen font-sans relative z-[60] shadow-[10px_0_40px_rgba(0,0,0,0.5)] shrink-0 transition-all duration-75 ease-linear">
      <div onMouseDown={startResizing} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-[#6d28d9]/50 transition-colors z-50 group">
        <div className="absolute top-1/2 right-[2px] -translate-y-1/2 w-0.5 h-8 bg-white/20 rounded-full group-hover:bg-white/60"></div>
      </div>
      
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(139, 92, 246, 0.5); }`}</style>

      {/* HEADER */}
      <div className="px-6 pt-8 pb-6 flex justify-between items-center relative z-40">
        <div className="flex items-center gap-3 cursor-pointer group flex-shrink-0" onClick={() => handleNavigation('welcome')}>
            <div className="w-8 h-8 bg-gradient-to-tr from-[#6d28d9] to-[#3b82f6] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(109,40,217,0.5)] group-hover:scale-110 transition-transform shrink-0"><Zap size={18} className="text-white" /></div>
            <h1 className="text-white text-2xl font-black tracking-tighter">Fast<span className="text-[#a19bfe]">Line</span></h1>
        </div>
        
        <div className="flex items-center gap-2">
            {/* NOTIFICATION BELL */}
            <div className="relative" ref={notificationsRef}>
                <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={`p-2.5 rounded-xl transition-all shadow-inner group shrink-0 relative ${isNotificationsOpen ? 'bg-[#6d28d9] text-white border-transparent' : 'bg-[#101426] hover:bg-[#1a1f3c] border border-white/5 hover:border-[#6d28d9]/50 text-[#a19bfe] hover:text-white'}`}>
                    <Bell size={18} className="group-hover:scale-110 transition-transform" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-[#101426] text-[8px] font-bold text-white items-center justify-center leading-none">{unreadCount}</span>
                        </span>
                    )}
                </button>

                {/* РЕАЛЬНІ СПОВІЩЕННЯ З БЕКЕНДУ */}
                {isNotificationsOpen && (
                    <div className="fixed top-20 right-5 w-80 max-w-[90vw] bg-[#161b33]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.5)] z-[999] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#6d28d9]/10 to-transparent">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={handleMarkAllAsRead} className="flex items-center gap-1 text-[#a19bfe] hover:text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-transparent hover:border-[#6d28d9]/30 transition-all bg-white/5">
                                    <CheckCheck size={12}/> Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-80 overflow-y-auto custom-scrollbar p-2">
                            {notifications.length === 0 ? (
                                <div className="text-center py-8 text-xs text-gray-500 italic">No new notifications.</div>
                            ) : (
                                notifications.map(notif => (
                                    <div 
                                      key={notif.id} 
                                      onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                                      className={`p-3 rounded-xl border transition-colors mb-2 last:mb-0 cursor-pointer group relative ${notif.read ? 'bg-[#0a0f1e]/40 border-white/5 hover:border-white/10 opacity-70' : 'bg-[#6d28d9]/10 border-[#6d28d9]/30 hover:bg-[#6d28d9]/20'}`}
                                    >
                                        <button onClick={(e) => handleDeleteNotification(notif.id, e)} className="absolute top-2 right-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-black/20 flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                                                {getNotificationIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-4">
                                                <p className="text-xs text-white font-bold mb-0.5 truncate">{notif.title}</p>
                                                <p className="text-[11px] text-gray-300 leading-snug line-clamp-2">{notif.body}</p>
                                                <span className="text-[9px] text-gray-500 font-bold mt-1.5 block">
                                                    {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'now'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <button onClick={() => handleNavigation('contacts')} className="p-2.5 bg-[#101426] hover:bg-[#1a1f3c] border border-white/5 hover:border-[#6d28d9]/50 rounded-xl text-[#a19bfe] hover:text-white transition-all shadow-inner group shrink-0" title="Contacts">
                <Contact size={18} className="group-hover:scale-110 transition-transform" />
            </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="px-6 pb-6 flex gap-3 items-center relative z-30">
        <div className="flex-1 bg-[#101426] flex items-center px-4 py-3.5 rounded-2xl border border-white/5 focus-within:border-[#6d28d9]/50 focus-within:ring-4 focus-within:ring-[#6d28d9]/10 transition-all duration-300 shadow-inner">
          <Search size={18} className="text-[#a19bfe] mr-3 shrink-0" />
          <input type="text" placeholder="Search users..." value={searchQuery} onChange={handleSearch} onFocus={() => setIsSearchMode(true)} className="bg-transparent border-none outline-none text-sm text-gray-200 w-full placeholder-gray-600 font-medium" />
          {isSearchMode && <X size={16} className="text-gray-500 hover:text-white cursor-pointer ml-2" onClick={cancelSearch} />}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 relative overflow-hidden">
        {isSearchMode ? (
          <div key="search-view" className="absolute inset-0 overflow-y-auto custom-scrollbar px-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="flex items-center justify-between text-[10px] text-[#a19bfe] font-black uppercase tracking-[0.2em] mb-4 opacity-60">
              <span>Search Results</span>
              <button onClick={cancelSearch} className="text-gray-500 hover:text-white lowercase text-xs font-normal">clear</button>
            </div>
            
            <div className="space-y-2">
              {isSearching ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 rounded-full border-2 border-t-[#6d28d9] border-r-[#6d28d9] border-b-transparent border-l-transparent animate-spin"></div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-10 text-xs text-gray-500 italic bg-white/5 rounded-2xl border border-dashed border-white/5 px-4">
                  {searchQuery ? `No global users found for "${searchQuery}"` : "Type to discover users..."}
                </div>
              ) : (
                searchResults.map((u) => {
                  const uName = u.displayName || u.name || u.email?.split('@')[0] || "User";
                  const uEmail = u.email || "";
                  const uId = u.uid || u.id;
                  const initial = uName[0]?.toUpperCase() || "?";
                  
                  if (uEmail === currentUser?.email) return null;

                  return (
                    <div 
                      key={uId} 
                      onClick={() => { onStartChat({ email: uEmail, name: uName, id: uId }); cancelSearch(); }} 
                      className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6d28d9]/20 to-[#3b82f6]/20 border border-white/10 flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0 overflow-hidden">
                        {u.avatarUrl && u.avatarUrl !== 'none' ? <img src={u.avatarUrl} className="w-full h-full object-cover"/> : initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-200 text-sm font-bold truncate group-hover:text-white">{uName}</div>
                        <div className="text-[11px] text-gray-500 truncate">@{u.tag || uEmail.split('@')[0]}</div>
                      </div>
                      <ArrowRight size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div key="normal-view" className="absolute inset-0 overflow-y-auto custom-scrollbar px-6 space-y-8 animate-in fade-in slide-in-from-left-8 duration-300 pb-10">
            
            {/* PROJECTS */}
            <div>
              <div onClick={() => handleNavigation('projects')} className="flex items-center gap-2 text-[10px] font-black text-[#a19bfe] uppercase tracking-[0.2em] mb-3 opacity-60 cursor-pointer hover:opacity-100 transition-opacity">
                <FolderKanban size={12} /> <span className="truncate">Active Projects</span>
              </div>
              <div className="space-y-1">
                {isLoadingChats ? (
                  <ChatSkeleton />
                ) : projects.length === 0 ? (
                  <div className="py-4 px-3 text-[11px] text-gray-500 italic text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                    No active projects.
                  </div>
                ) : (
                  <>
                    {projects.slice(0, 3).map((proj, idx) => {
                      const { icon, colorClass } = getProjectIcon(idx);
                      return (
                        <div key={proj.id} onClick={() => handleNavigation('project_details', proj.id)} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5 group">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-105 transition-transform ${colorClass}`}>
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-200 truncate group-hover:text-white">{proj.name}</div>
                            <div className="text-[10px] text-gray-500 truncate">{proj.status || 'Active'}</div>
                          </div>
                        </div>
                      );
                    })}
                    {projects.length > 3 && (
                      <button onClick={() => handleNavigation('projects')} className="w-full mt-2 py-2 flex items-center justify-center gap-1 text-[11px] font-bold text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5">
                        +{projects.length - 3} more projects <ChevronRight size={12} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* GROUPS */}
            <div>
              <div className="flex items-center justify-between text-[10px] text-[#a19bfe] font-black uppercase tracking-[0.2em] mb-3 opacity-60">
                <div className="flex items-center gap-2"><Users size={12} /> <span className="truncate">Groups</span></div>
                <Plus onClick={onCreateGroupClick} size={14} className="cursor-pointer hover:text-white transition-colors shrink-0" />
              </div>
              <div className="space-y-1">
                {isLoadingChats ? ( <ChatSkeleton /> ) : groupChats.length === 0 ? (
                  <div className="py-4 px-3 text-[11px] text-gray-500 italic text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                    No group chats yet.
                  </div>
                ) : (
                  groupChats.map((group) => (
                    <div key={group.id} onClick={() => onStartGroupChat(group)} className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-[#1e2336] flex items-center justify-center text-[#a19bfe] border border-white/5 group-hover:border-[#6d28d9]/50 transition-all shrink-0"><Hash size={20} /></div>
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
                <MessageSquare size={12} /> <span className="truncate">Messages</span>
              </div>
              <div className="space-y-1">
                {isLoadingChats ? ( <><ChatSkeleton /><ChatSkeleton /></> ) : directChats.length === 0 ? (
                  <div className="py-4 px-3 text-[11px] text-gray-500 italic text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                    No private messages yet.
                  </div>
                ) : (
                  directChats.map((msg) => {
                    const initial = msg.name?.[0]?.toUpperCase() || msg.email?.[0]?.toUpperCase() || '?';
                    return (
                      <div key={msg.id} onClick={() => onStartChat({ email: msg.email, name: msg.name, id: msg.id })} className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1e2336] to-[#0a0b1e] border border-white/10 flex items-center justify-center text-white text-xs font-bold group-hover:shadow-[0_0_15px_rgba(109,40,217,0.3)] transition-all shrink-0 overflow-hidden">
                           {initial}
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
            <div className="relative shrink-0" onClick={onProfileClick}>
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#6d28d9]/50 cursor-pointer hover:scale-105 transition-transform bg-[#1e2336]">
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