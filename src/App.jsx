import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import ChatArea from './components/ChatArea';
import ProfileSettings from './components/ProfileSettings';

// Імпорт нових сторінок
import TasksPage from './components/TasksPage';
import CalendarPage from './components/CalendarPage';
import CallsPage from './components/CallsPage';
import MeetingsPage from './components/MeetingsPage';

// Імпорт сторінки авторизації та її стилів
import Login from './components/Login';
import './components/Login.css'; 

function App() {
  // 1. Стан авторизації (false = спочатку треба увійти)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [activeView, setActiveView] = useState('welcome');
  
  const [user, setUser] = useState({
    name: "EXNOEW",
    handle: "@exnoew",
    job: "Team Lead"
  });

  const [theme, setTheme] = useState('default');

  const getBackground = () => {
    if (theme === 'ocean') return "...";
    return "bg-gradient-to-br from-[#1e1b4b] via-[#172554] to-[#1e1b4b]"; 
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
             <WelcomeScreen onNavigate={setActiveView} /> 
          </div>
        );
    }
  };

  // 2. Логіка вибору екрану
  // Якщо НЕ авторизований — показуємо Login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Якщо авторизований — показуємо основний додаток
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