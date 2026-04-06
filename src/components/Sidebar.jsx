import React, { useState, useEffect } from 'react';
import { Search, Settings, LogOut, FolderKanban, MessageSquare, Plus, Users } from 'lucide-react';

const Sidebar = ({ onNavigate, currentUser, onProfileClick, onLogout, onStartChat, refreshTrigger }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userChats, setUserChats] = useState([]);
  
  const projects = [
    { name: "Maxim Project", subtitle: "Orest: Max, go pit piva...", time: "13:45", img: "M" },
    { name: "Stanislav Project", subtitle: "Foxy Pirate: Kogda tu sdelaesh...", time: "just now", img: "S" }
  ];

  const messages = [
    { name: "Foxy Pirate", subtitle: "Yake homework z English...", time: "yesterday", img: "F", color: "bg-red-500" },
    { name: "Katya", subtitle: "You: Принеси пампухи...", time: "Monday", img: "K", color: "bg-yellow-500" },
    { name: "Sonya", subtitle: "Posmotri moi tiktoks", time: "09:12", img: "S", color: "bg-green-500" },
    { name: "Hot Pupsik", subtitle: "No messages yet", time: "", img: "H", color: "bg-orange-500" }
  ];

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      setShowDropdown(true);
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
        setTimeout(() => setIsSearching(false), 500);
      }
    } else {
      setShowDropdown(false);
      setSearchResults([]);
    }
  };

  // ОНОВЛЕНИЙ useEffect: правильний парсинг учасників та часу Firebase
  useEffect(() => {
    if (!currentUser?.email) return;

    const fetchMyChats = async () => {
        try {
            const res = await fetch(`https://backendfastline.onrender.com/chats/user/${currentUser.email}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!res.ok) return;
            const data = await res.json();
            
            if (Array.isArray(data)) {
                const mappedChats = data.map(chat => {
                    // Знаходимо email співрозмовника
                    let otherUserEmail = "Unknown User";
                    if (chat.participants && Array.isArray(chat.participants)) {
                        otherUserEmail = chat.participants.find(email => email !== currentUser.email) || chat.participants[0];
                    }

                    // Форматуємо час з урахуванням формату Firebase (_seconds)
                    let timeString = "";
                    const timeSource = chat.lastMessage?.sentAt || chat.createdAt;
                    if (timeSource) {
                        const dateObj = timeSource._seconds ? new Date(timeSource._seconds * 1000) : new Date(timeSource);
                        timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }

                    return {
                        id: chat.id,
                        name: chat.name || otherUserEmail.split('@')[0], // Якщо немає імені, беремо нік з пошти
                        email: otherUserEmail,
                        subtitle: chat.lastMessage?.text || "No messages yet",
                        time: timeString
                    };
                });
                
                setUserChats(mappedChats);
            }
        } catch (err) {
            console.error("Помилка завантаження списку чатів:", err);
        }
    };

    fetchMyChats();
  }, [currentUser, refreshTrigger]);

  const UserSkeleton = () => (
    <div className="flex items-center gap-3 px-4 py-2 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-white/10 shrink-0"></div>
      <div className="flex-1 space-y-2 min-w-0">
        <div className="h-3 bg-white/10 rounded w-3/4"></div>
        <div className="h-2 bg-purple-500/10 rounded w-1/2"></div>
      </div>
    </div>
  );

  // ЗАПОБІЖНИК: вирішуємо, який масив рендерити
  const chatListToRender = (Array.isArray(userChats) && userChats.length > 0) ? userChats : messages;

  return (
    <div className="w-80 bg-[#171635]/95 backdrop-blur-xl flex flex-col h-screen border-r border-white/5 border-t border-t-white/10 font-sans relative z-20">

      {/* ДОДАЙТЕ ЦЕЙ БЛОК СТИЛІВ ОСЬ ТУТ */}
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.2); }
        `}
      </style>
      
      <div className="px-6 pt-6 pb-4 cursor-pointer" onClick={() => onNavigate('welcome')}>
        <h1 className="text-white text-2xl font-semibold tracking-tight">Fast<span className="text-[#8b5cf6]">Line</span></h1>
      </div>

      <div className="px-6 pb-4 relative z-50">
        <div className="bg-[#0c1021] flex items-center px-3 py-2.5 rounded-xl border border-white/5 focus-within:border-purple-500/50 transition-colors shadow-inner">
          <Search size={18} className="text-[#a19bfe] mr-3" />
          <input 
            type="text" 
            placeholder="Search users (e.g. @foxy)..." 
            value={searchQuery}
            onChange={handleSearch}
            className="bg-transparent border-none outline-none text-sm text-gray-300 w-full placeholder-gray-600" 
          />
        </div>

        {showDropdown && (
          <div className="absolute left-6 right-6 top-full mt-2 bg-[#1d1a4a]/95 backdrop-blur-lg border border-white/10 border-t-white/20 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto custom-scrollbar z-50">
            {isSearching ? (
              <div className="py-2 space-y-1"><UserSkeleton /><UserSkeleton /></div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                {(searchResults || []).map((user, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 active:scale-98 cursor-pointer transition-all" 
                    onClick={() => {
                      setShowDropdown(false);
                      setSearchQuery('');
                      if (onStartChat) onStartChat(user);
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {user.avatarUrl && user.avatarUrl !== 'none' ? (
                        <img src={user.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.displayName?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || '?'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-200 truncate">{user.displayName || user.name || "User"}</div>
                      <div className="text-[11px] text-[#8b5cf6] truncate">{user.tag || `@${user.email?.split('@')[0] || 'user'}`}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">Користувачів не знайдено</div>
            )}
          </div>
        )}
      </div>

      <div className="h-[1px] bg-white/5 w-full mb-4"></div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8 custom-scrollbar pr-2">
        
        {/* PROJECTS */}
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#a19bfe] uppercase tracking-widest mb-4 opacity-80">
            <FolderKanban size={12} /> <span>Projects</span>
          </div>
          <div className="space-y-1">
            {projects.map((proj, idx) => (
              <div key={idx} className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 active:scale-95 cursor-pointer transition-all">
                <div className="w-10 h-10 rounded-full bg-[#1e2336] border border-white/10 flex items-center justify-center text-white font-medium text-sm">{proj.img}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-200 text-sm font-medium truncate group-hover:text-white transition-colors">{proj.name}</span>
                    <span className="text-[10px] text-gray-600">{proj.time}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 truncate group-hover:text-gray-400 transition">{proj.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GROUPS */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#cac7f4] font-bold uppercase tracking-widest mb-4 opacity-80">
            <div className="flex items-center gap-2"><Users size={12} /> <span>Groups</span></div>
            <button onClick={() => onNavigate('group_chat')} className="p-1 hover:bg-white/10 active:scale-90 rounded-md transition-all text-[#a19bfe] hover:text-white"><Plus size={14} /></button>
          </div>
          <div className="space-y-1">
             <div onClick={() => onNavigate('group_chat')} className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 active:scale-95 cursor-pointer transition-all">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-white text-xs font-bold border-2 border-transparent ring-2 ring-[#0f111a]">🚀</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-200 text-sm font-medium truncate group-hover:text-white transition-colors">Frontend Team</span>
                    <span className="text-[10px] text-gray-600">14:20</span>
                  </div>
                  <div className="text-[11px] text-[#a19bfe] truncate group-hover:text-purple-300 transition">Orest: Let's deploy!</div>
                </div>
              </div>
          </div>
        </div>

        {/* DIRECT MESSAGES */}
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[#cac7f4] font-bold uppercase tracking-widest mb-4 opacity-80">
            <MessageSquare size={12} /> <span>Direct Messages</span>
          </div>

          <div className="space-y-1">
            {chatListToRender.filter(Boolean).map((msg, idx) => (
              <div 
                key={msg.id || idx} 
                onClick={() => {
                   if (msg.id && onStartChat) {
                       onStartChat({ email: msg.email || msg.name, name: msg.name || "User", id: msg.id });
                   } else {
                       onNavigate('chat_maxim'); 
                   }
                }} 
                className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 active:scale-95 cursor-pointer transition-all"
              >
                <div className={`w-10 h-10 rounded-full ${msg.color || 'bg-[#1e2336]'} flex items-center justify-center text-white text-xs font-bold border-2 border-transparent ring-2 ring-[#0f111a]`}>
                  {msg.img || msg.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-200 text-sm font-medium truncate group-hover:text-white transition-colors">{msg.name || "User"}</span>
                    <span className="text-[10px] text-gray-600">{msg.time || "recent"}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 truncate group-hover:text-gray-400 transition">
                    {msg.subtitle || "Chat opened"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FOOTER: ПРОФІЛЬ */}
      <div className="mt-auto pt-4 pb-4 px-4">
        <div className="h-[1px] bg-white/5 w-full mb-4"></div>
          {currentUser && (
            <div className="bg-[#1d1a4a] border border-white/5 border-t-white/10 rounded-2xl p-3 flex items-center gap-3 shadow-lg cursor-pointer hover:border-purple-500/20 transition-all group">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-[2px] border-white shadow-sm">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name || "User"} className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                    {currentUser.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1d1a4a] ${currentUser.status === "online" ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}/>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-white text-sm font-semibold truncate group-hover:text-purple-300 transition-colors">{currentUser.name || "Unknown User"}</div>
                <div className="text-[10px] text-[#8b5cf6] font-medium truncate">{currentUser.handle || "@no_tag"}</div>
              </div>
              <div className="flex flex-col gap-1 text-gray-500">
                <Settings onClick={onProfileClick} size={16} className="hover:text-white active:scale-90 transition" />
                <LogOut onClick={onLogout} size={16} className="hover:text-red-400 active:scale-90 transition" />
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default Sidebar;