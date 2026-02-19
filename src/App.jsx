import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import ChatArea from './components/ChatArea';
import ProfileSettings from './components/ProfileSettings';
import EditProfile from './components/EditProfile';

import TasksPage from './components/TasksPage';
import CalendarPage from './components/CalendarPage';
import CallsPage from './components/CallsPage';
import MeetingsPage from './components/MeetingsPage';

import Login from './components/Login';
import './components/Login.css'; 

// 👇 Імпортуємо функцію сокета
import { createSocket } from './socket';

function App() {
  // Перевіряємо, чи є токен при завантаженні
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [activeView, setActiveView] = useState('welcome');
  const [socket, setSocket] = useState(null);
  
  const [user, setUser] = useState({
    name: "EXNOEW",
    handle: "@exnoew",
    job: "Team Lead"
  });

  const [theme, setTheme] = useState('default');

  // 👇 Ефект для підключення сокета, коли користувач авторизований
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      if (token) {
        const newSocket = createSocket(token);
        setSocket(newSocket);

        newSocket.on('connect', () => {
          console.log('🟢 Socket connected:', newSocket.id);
        });

        // Очистка при виході
        return () => newSocket.disconnect();
      }
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (socket) socket.disconnect();
    setIsAuthenticated(false);
    setActiveView('welcome');
  };

  const getBackground = () => {
    if (theme === 'ocean') return "...";
    return "bg-gradient-to-br from-[#1e1b4b] via-[#172554] to-[#1e1b4b]"; 
  };

  const renderContent = () => {
    switch(activeView) {
      case 'ai_chat':
        return <ChatArea key="ai" chatName="AI Assistant" isAi={true} currentUser={user} socket={socket} />;
      case 'chat_maxim':
        return <ChatArea key="maxim" chatName="Maxim" isAi={false} currentUser={user} socket={socket} />;
      case 'profile':
        return <ProfileSettings currentUser={user} updateProfile={(newData) => {
          setUser(newData);
          setActiveView('welcome'); 
        }} />;
      case 'edit_profile':
          return <EditProfile 
              currentUser={user} 
              onBack={() => setActiveView('welcome')} 
              onSave={(newData) => {
                  setUser(prev => ({ ...prev, ...newData }));
                  setActiveView('welcome');
              }}
          />;
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

  // 👇 Якщо не авторизований - показуємо Login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // 👇 Якщо авторизований - показуємо App
  return (
    <div className="flex h-screen w-full overflow-hidden bg-black">
      <Sidebar 
          onNavigate={setActiveView} 
          currentUser={user} 
          onProfileClick={() => setActiveView('edit_profile')}
          onLogout={handleLogout}
      />
      
      <div className={`flex-1 ${getBackground()} transition-all duration-1000 ease-in-out relative`}>
        {renderContent()}
      </div>
    </div>
  );
}

export default App;