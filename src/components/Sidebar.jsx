import React from 'react';
import { Search, MoreHorizontal, ChevronDown, Settings, Bot, MessageSquare } from 'lucide-react';

const Sidebar = ({ onNavigate, currentUser }) => {
  return (
    <div className="w-80 bg-[#0f111a] text-gray-400 flex flex-col h-screen border-r border-gray-800">
      
      {/* Header */}
      <div className="p-5 flex justify-between items-center cursor-pointer" onClick={() => onNavigate('welcome')}>
        <h1 className="text-white text-xl font-bold tracking-wide text-purple-400">FastLine</h1>
        <MoreHorizontal className="hover:text-white" />
      </div>

      {/* AI Button */}
      <div className="px-5 mb-4">
        <button 
          onClick={() => onNavigate('ai_chat')}
          className="w-full flex items-center gap-3 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 p-3 rounded-xl text-white hover:border-purple-400 transition group"
        >
          <div className="bg-purple-500 p-1.5 rounded-lg text-white shadow-lg shadow-purple-500/50">
             <Bot size={18} />
          </div>
          <span className="font-medium text-sm group-hover:translate-x-1 transition">Ask AI Assistant</span>
        </button>
      </div>

      {/* Standard Lists */}
      <div className="flex-1 overflow-y-auto px-5 space-y-6">
        <div>
          <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider mb-3">
            <span>Direct Messages</span>
          </div>
          
          {/* Example Contact Clickable */}
          <div onClick={() => onNavigate('chat_maxim')} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-md transition">
             <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs">M</div>
             <div>
               <div className="text-white text-sm">Maxim</div>
               <div className="text-xs">Let's meet...</div>
             </div>
          </div>
        </div>
      </div>

      {/* Profile Footer */}
      <div className="p-4 bg-[#151923] border-t border-gray-800">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {currentUser.name[0]}
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="text-white text-sm font-medium truncate">{currentUser.name}</div>
                <div className="text-[10px] text-purple-400 uppercase truncate">{currentUser.job}</div>
            </div>
            
            <div 
                onClick={() => onNavigate('profile')}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 cursor-pointer text-gray-400 hover:text-white transition"
            >
                <Settings size={16} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;