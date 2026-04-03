import React, { useState } from 'react';
import { Menu, Home, CheckSquare, Calendar, Phone, Video, X } from 'lucide-react';

const QuickNav = ({ activeView, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'welcome', icon: Home, label: 'Home Workspace' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'calls', icon: Phone, label: 'Scheduled Calls' },
    { id: 'meetings', icon: Video, label: 'Saved Meetings' },
  ];

  return (
    // Змінено позицію: тепер внизу справа (bottom-8 right-8)
    <div className="fixed right-8 bottom-8 z-[100] flex flex-col items-end gap-3">
      
      {/* Виїзне меню (тепер виїжджає вгору) */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out origin-bottom-right ${isOpen ? 'scale-100 opacity-100 mb-2' : 'scale-90 opacity-0 pointer-events-none absolute bottom-full'}`}>
        <div className="bg-[#1d1a4a]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-2 flex flex-col gap-1 w-48">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setIsOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive ? 'bg-[#6d28d9] text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Кнопка-тригер */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#6d28d9] hover:bg-[#5b21b6] border border-white/20 rounded-full shadow-[0_0_20px_rgba(109,40,217,0.4)] flex items-center justify-center text-white transition-all transform hover:scale-105"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

    </div>
  );
};

export default QuickNav;