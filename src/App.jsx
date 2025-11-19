import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import ChatArea from './components/ChatArea';
import ProfileSettings from './components/ProfileSettings';

import TasksPage from './components/TasksPage';
import CalendarPage from './components/CalendarPage';
import CallsPage from './components/CallsPage';
import MeetingsPage from './components/MeetingsPage';

function App() {
  const [activeView, setActiveView] = useState('welcome');
  
  const [user, setUser] = useState({
    name: "Alex Johnson",
    handle: "@alexjohnson",
    job: "Product Designer"
  });

  const [theme, setTheme] = useState('default');

  const getBackground = () => {
    if (theme === 'ocean') return "bg-gradient-to-br from-[#0f172a] via-[#0e7490] to-[#164e63]";
    if (theme === 'sunset') return "bg-gradient-to-br from-[#2e1065] via-[#be185d] to-[#881337]";
    return "bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#172554]"; 
  };

  const renderContent = () => {
    switch(activeView) {
      case 'ai_chat':
        return <ChatArea key="ai" chatName="AI Assistant" isAi={true} currentUser={user} />;
      case 'chat_maxim':
        return <ChatArea key="maxim" chatName="Maxim" isAi={false} currentUser={user} />;
      case 'profile':
        return <ProfileSettings currentUser={user} updateProfile={(newData) => {
          setUser(newData);
          setActiveView('welcome'); 
        }} />;
      case 'tasks':
        return <TasksPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'calls':
        return <CallsPage />;
      case 'meetings':
        return <MeetingsPage />;
      default:
        return (
          <div className="relative h-full flex flex-col">
             <div className="absolute top-5 right-5 flex gap-2 z-50">
                <div onClick={() => setTheme('default')} className="w-6 h-6 rounded-full bg-blue-900 cursor-pointer border border-white/50 hover:scale-110 transition"></div>
                <div onClick={() => setTheme('ocean')} className="w-6 h-6 rounded-full bg-cyan-700 cursor-pointer border border-white/50 hover:scale-110 transition"></div>
                <div onClick={() => setTheme('sunset')} className="w-6 h-6 rounded-full bg-pink-700 cursor-pointer border border-white/50 hover:scale-110 transition"></div>
             </div>
             <WelcomeScreen onNavigate={setActiveView} /> 
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black">
      <Sidebar onNavigate={setActiveView} currentUser={user} />
      
      <div className={`flex-1 ${getBackground()} transition-all duration-1000 ease-in-out relative`}>
        {renderContent()}
      </div>
    </div>
  );
}

export default App;