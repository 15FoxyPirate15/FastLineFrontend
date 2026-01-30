import React from 'react';
import { Search, Settings, LogOut, FolderKanban, MessageSquare } from 'lucide-react';

const Sidebar = ({ onNavigate, currentUser }) => {
  
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

  return (
    <div className="w-80 bg-gradient-to-b from-[#181732] via-[#0f111a] to-[#1a193a] text-gray-400 flex flex-col h-screen border-r border-white/5 font-sans">
      
      <div className="px-6 pt-6 pb-4 cursor-pointer" onClick={() => onNavigate('welcome')}>
        <h1 className="text-white text-2xl font-semibold tracking-tight">
          Fast<span className="text-[#8b5cf6]">Line</span>
        </h1>
      </div>

      <div className="px-6 pb-4">
        <div className="bg-[#1c244b]/80 flex items-center px-3 py-2.5 rounded-xl border border-white/5 focus-within:border-purple-500/50 transition-colors shadow-inner">
          <Search size={18} className="text-[#a19bfe] mr-3" />
          <input 
            type="text" 
            placeholder="Search Workspace" 
            className="bg-transparent border-none outline-none text-sm text-gray-300 w-full placeholder-gray-600" 
          />
        </div>
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
                    <div className="text-[11px] text-gray-500 truncate group-hover:text-gray-400 transition">{proj.subtitle}</div>
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
                    <div className="text-[11px] text-gray-500 truncate group-hover:text-gray-400 transition">{msg.subtitle}</div>
                 </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="mt-auto pt-4">
         
         <div className="h-[1px] bg-white/5 w-full mb-4 shadow-[0_-1px_0_0_rgba(0,0,0,0.2)]"></div>
         
         <div className="px-4 pb-4">
            <div className="bg-[#1d1a4a] border border-white/5 rounded-2xl p-3 flex items-center gap-3 shadow-lg group hover:border-purple-500/20 transition-all">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold border-[2px] border-white shadow-sm">
                    {currentUser.name[0]}
                </div>
                
                <div className="flex-1 overflow-hidden">
                    <div className="text-white text-sm font-semibold truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-[#8b5cf6] font-medium truncate">@{currentUser.handle.replace('@','')}</div>
                    <div className="text-[10px] text-gray-500 truncate">{currentUser.job}</div>
                </div>

                <div className="flex flex-col gap-1 text-gray-500">
                    <Settings size={16} className="hover:text-white cursor-pointer transition" />
                    <LogOut size={16} className="hover:text-red-400 cursor-pointer transition" />
                </div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default Sidebar;