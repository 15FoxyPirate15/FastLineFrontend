import React, { useState } from 'react';
import { Search, Settings, LogOut, FolderKanban, MessageSquare } from 'lucide-react';

const Sidebar = ({ onNavigate, currentUser, onProfileClick, onLogout }) => {
  // --- СТАНИ ДЛЯ ПОШУКУ ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
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

  // --- ФУНКЦІЯ ПОШУКУ КОРИСТУВАЧІВ ---
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      setShowDropdown(true);
      setIsSearching(true);
      
      try {
        const token = localStorage.getItem('token');
        // ВАЖЛИВО: Уточніть у бекендера правильний маршрут. Зараз тут стоїть /users/search?q=
        const response = await fetch(`https://backendfastline.onrender.com/users/search?q=${encodeURIComponent(query)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setSearchResults(data); 
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Помилка пошуку:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setShowDropdown(false);
      setSearchResults([]);
    }
  };

  return (
    <div className="w-80 bg-gradient-to-b from-[#25244d] to-[#1a193a] flex flex-col h-screen border-r border-white/5 font-sans">
      
      <div className="px-6 pt-6 pb-4 cursor-pointer" onClick={() => onNavigate('welcome')}>
        <h1 className="text-white text-2xl font-semibold tracking-tight">
          Fast<span className="text-[#8b5cf6]">Line</span>
        </h1>
      </div>

      {/* --- ОНОВЛЕНИЙ БЛОК ПОШУКУ З ВИПАДАЮЧИМ МЕНЮ --- */}
      <div className="px-6 pb-4 relative z-50">
        <div className="bg-[#131933] flex items-center px-3 py-2.5 rounded-xl border border-white/5 focus-within:border-purple-500/50 transition-colors shadow-inner">
          <Search size={18} className="text-[#a19bfe] mr-3" />
          <input 
            type="text" 
            placeholder="Search users (e.g. @foxy)..." 
            value={searchQuery}
            onChange={handleSearch}
            className="bg-transparent border-none outline-none text-sm text-gray-300 w-full placeholder-gray-600" 
          />
        </div>

        {/* ВИПАДАЮЧЕ МЕНЮ */}
        {showDropdown && (
          <div className="absolute left-6 right-6 top-full mt-2 bg-[#1d1a4a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
            {isSearching ? (
              <div className="p-4 text-center text-sm text-gray-400 animate-pulse">Шукаємо...</div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((user, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors" 
                    onClick={() => {
                      /* Тут виклик функції для відкриття чату з цим користувачем */
                      setShowDropdown(false);
                      setSearchQuery('');
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
                      <div className="text-sm font-medium text-gray-200 truncate">{user.displayName || user.name}</div>
                      <div className="text-[11px] text-[#8b5cf6] truncate">{user.tag || `@${user.email?.split('@')[0]}`}</div>
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

      <div className="h-[1px] bg-white/5 w-full mb-4 shadow-[0_1px_0_0_rgba(0,0,0,0.3)]"></div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8 custom-scrollbar">
        
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#a19bfe] uppercase tracking-widest mb-4 opacity-80">
            <FolderKanban size={12} /> 
            <span>Projects</span>
          </div>
          
          <div className="space-y-1">
            {projects.map((proj, idx) => (
              <div key={idx} className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition">
                <div className="w-10 h-10 rounded-full bg-[#1e2336] border border-white/10 flex items-center justify-center text-white font-medium text-sm">
                  {proj.img}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-200 text-sm font-medium truncate">{proj.name}</span>
                    <span className="text-[10px] text-gray-600">{proj.time}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 truncate group-hover:text-gray-400 transition">
                    {proj.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-[11px] text-[#cac7f4] font-bold uppercase tracking-widest mb-4 opacity-80">
            <MessageSquare size={12} /> 
            <span>Direct Messages</span>
          </div>

          <div className="space-y-1">
            {messages.map((msg, idx) => (
              <div key={idx} onClick={() => onNavigate('chat_maxim')} className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition">
                <div className={`w-10 h-10 rounded-full ${msg.color} flex items-center justify-center text-white text-xs font-bold border-2 border-transparent ring-2 ring-[#0f111a]`}>
                  {msg.img}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-200 text-sm font-medium truncate">{msg.name}</span>
                    <span className="text-[10px] text-gray-600">{msg.time}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 truncate group-hover:text-gray-400 transition">
                    {msg.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="mt-auto pt-4">
        <div className="h-[1px] bg-white/5 w-full mb-4 shadow-[0_-1px_0_0_rgba(0,0,0,0.2)]"></div>

        <div className="px-4 pb-4">
          {currentUser && (
            <div className="bg-[#1d1a4a] border border-white/5 rounded-2xl p-3 flex items-center gap-3 shadow-lg cursor-pointer hover:border-purple-500/20 transition-all group">
              
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-[2px] border-white shadow-sm">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                    {currentUser.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>

                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1d1a4a] ${
                    currentUser.status === "online"
                      ? "bg-green-500"
                      : currentUser.status === "away"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                />
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="text-white text-sm font-semibold truncate">
                  {currentUser.name || "Unknown User"}
                </div>
                <div className="text-[10px] text-[#8b5cf6] font-medium truncate">
                  {currentUser.handle || "@no_tag"}
                </div>
                {currentUser.job && (
                  <div className="text-[10px] text-gray-500 truncate">
                    {currentUser.job}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1 text-gray-500">
                <Settings onClick={onProfileClick} size={16} className="hover:text-white transition" />
                <LogOut onClick={onLogout} size={16} className="hover:text-red-400 transition" />
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;