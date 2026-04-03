import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import ChatArea from './components/ChatArea';
import ProfileSettings from './components/ProfileSettings';
import EditProfile from './components/EditProfile';
import GroupChatArea from './components/GroupChatArea';
import QuickNav from './components/QuickNav';

import TasksPage from './components/TasksPage';
import CalendarPage from './components/CalendarPage';
import CallsPage from './components/CallsPage';
import MeetingsPage from './components/MeetingsPage';

import Login from './components/Login';
import './components/Login.css'; 

import { createSocket } from './socket';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [activeView, setActiveView] = useState('welcome');
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Завантаження даних профілю
        const res = await fetch("https://backendfastline.onrender.com/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();

        if (isMounted) {
          setUser({
            id: data.uid || data.id, 
            name: data.displayName || data.name || "Unknown", 
            handle: data.tag || `@${data.email?.split('@')[0] || 'no_tag'}`, 
            email: data.email,
            avatar: data.avatarUrl !== "none" ? data.avatarUrl : null,
            status: data.status || "online",
            job: data.job || "Team Lead",
            role: data.role || "user"
          });
        }

        // Ініціалізація сокета
        const newSocket = createSocket(token);
        setSocket(newSocket);

        newSocket.on('connect', () => {
          console.log('🟢 Socket connected:', newSocket.id);
        });

      } catch (err) {
        console.error("❌ Error fetching user:", err);
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    fetchCurrentUser();

    return () => {
      isMounted = false;
      if (socket) socket.disconnect();
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (socket) socket.disconnect();
    setUser(null);
    setIsAuthenticated(false);
    setActiveView('welcome');
  };

  const getBackground = () => {
    if (theme === 'ocean') return "bg-blue-900";
    return "bg-gradient-to-br from-[#1e1b4b] via-[#172554] to-[#1e1b4b]"; 
  };

  const renderContent = () => {
    if (!user && isAuthenticated) {
      return <div className="flex-1 flex items-center justify-center text-white">Loading...</div>;
    }

    switch(activeView) {
      case 'ai_chat':
        return <ChatArea key="ai" chatName="AI Assistant" isAi={true} currentUser={user} socket={socket} />;
      case 'chat_maxim':
          return <ChatArea key="maxim" chatName="Maxim" isAi={false} currentUser={user} socket={socket} onBack={() => setActiveView('welcome')} />;
      case 'group_chat':
          return <GroupChatArea groupName="Frontend Team" currentUser={user} onBack={() => setActiveView('welcome')} />;
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

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

return (
    <div className="flex h-screen w-full overflow-hidden bg-black">
      
      {/* 1. ДОДАЄМО СТИЛЬ АНІМАЦІЇ ПРЯМО СЮДИ */}
      <style>
        {`
          @keyframes pageFadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-page {
            animation: pageFadeIn 0.35s ease-out forwards;
          }
        `}
      </style>

      <Sidebar 
          onNavigate={setActiveView} 
          currentUser={user} 
          onProfileClick={() => setActiveView('edit_profile')}
          onLogout={handleLogout}
      />
      
      <div className={`flex-1 ${getBackground()} transition-all duration-1000 ease-in-out relative overflow-hidden`}>
        
        {/* QuickNav тепер тут */}
        <QuickNav activeView={activeView} onNavigate={setActiveView} />

        {/* 2. ЗАСТОСОВУЄМО КЛАС animate-page ТА key */}
        <div key={activeView} className="h-full animate-page">
          {renderContent()}
        </div>

      </div>
    </div>
  );
}

export default App;