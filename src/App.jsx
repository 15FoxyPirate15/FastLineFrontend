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
            // Підлаштовуємось під нове поле displayName з бекенду
            name: data.displayName || data.name || "Unknown", 
            // Беремо готовий тег. Якщо його ще немає - беремо email
            handle: data.tag || `@${data.email?.split('@')[0] || 'no_tag'}`, 
            email: data.email,
            avatar: data.avatarUrl !== "none" ? data.avatarUrl : null, // Обробляємо avatarUrl
            status: data.status || "online",
            job: data.job || "",
            role: data.role || "user"
          });
        }

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

  if (!isAuthenticated || !user) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

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