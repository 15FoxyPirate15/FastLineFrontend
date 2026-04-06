import React, { useState, useEffect } from 'react';
import { initSocket, getSocket } from './socket';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import ChatArea from './components/ChatArea';
import EditProfile from './components/EditProfile';
import GroupChatArea from './components/GroupChatArea';
import QuickNav from './components/QuickNav';

import TasksPage from './components/TasksPage';
import CalendarPage from './components/CalendarPage';
import CallsPage from './components/CallsPage';
import MeetingsPage from './components/MeetingsPage';

import Login from './components/Login';
import './components/Login.css'; 

// --- ЗАПОБІЖНИК ВІД СИНІХ ЕКРАНІВ ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 p-10 bg-black text-red-500 overflow-auto h-full z-50">
          <h1 className="text-2xl font-bold mb-4">Ой, React впав! 💥</h1>
          <p className="mb-4">Замість синього екрану, ось причина помилки:</p>
          <pre className="bg-gray-900 p-4 rounded-xl text-sm whitespace-pre-wrap">
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-white text-black rounded-xl">Перезавантажити</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [activeView, setActiveView] = useState('welcome');
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('default');
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("https://backendfastline.onrender.com/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
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

        const newSocket = initSocket(token);
        setSocket(newSocket);

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
      if (getSocket()) getSocket().disconnect();
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
        return <ChatArea key="ai" chatName="AI Assistant" isAi={true} currentUser={user} socket={socket} roomId="ai_room" onBack={() => setActiveView('welcome')} />;
      case 'chat_direct':
        return <ChatArea 
            key={`chat_${selectedChatUser?.roomId || selectedChatUser?.id || 'temp'}`} 
            chatName={selectedChatUser?.displayName || selectedChatUser?.name || "User"} 
            isAi={false} 
            currentUser={user} 
            socket={socket} 
            // ВИПРАВЛЕНО: передаємо реальний roomId з бекенду
            roomId={selectedChatUser?.roomId || `temp_room_${selectedChatUser?.id || Date.now()}`} 
            onBack={() => setActiveView('welcome')} 
        />;
      case 'group_chat':
        return <GroupChatArea groupName="Frontend Team" currentUser={user} socket={socket} roomId="room_frontend_team" onBack={() => setActiveView('welcome')} />;
      case 'edit_profile':
        return <EditProfile 
            currentUser={user} 
            onBack={() => setActiveView('welcome')} 
            onSave={(newData) => {
                setUser(prev => ({ ...prev, ...newData }));
                setActiveView('welcome');
            }}
        />;
      case 'tasks': return <TasksPage onNavigate={setActiveView} />;
      case 'calendar': return <CalendarPage onNavigate={setActiveView} />;
      case 'calls': return <CallsPage onNavigate={setActiveView} />;
      case 'meetings': return <MeetingsPage onNavigate={setActiveView} />;
      default:
        return (
          <div className="relative h-full flex flex-col">
             <WelcomeScreen onNavigate={setActiveView} /> 
          </div>
        );
    }
  };

  if (!isAuthenticated) return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black">
      <style>
        {`
          @keyframes pageFadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
          .animate-page { animation: pageFadeIn 0.35s ease-out forwards; }
        `}
      </style>

    <Sidebar 
    onNavigate={setActiveView} 
        currentUser={user} 
        onProfileClick={() => setActiveView('edit_profile')}
        onLogout={handleLogout}
        refreshTrigger={refreshSidebar} // ДОДАНО
        onStartChat={async (targetUser) => {
            if (!targetUser) return;
            const token = localStorage.getItem('token');
            let finalRoomId = `temp_room_${targetUser.id || Date.now()}`;
            
            try {
                const response = await fetch('https://backendfastline.onrender.com/chats/private', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        u1: user?.email,     
                        u2: targetUser?.email || targetUser?.tag
                    })
                });

                if (response.ok) {
                    const chatData = await response.json();
                    finalRoomId = chatData?.id || finalRoomId; 
                }
            } catch (err) {
                console.warn("Бекенд не створив чат:", err);
            }

            setSelectedChatUser({ ...targetUser, roomId: finalRoomId });
            setActiveView('chat_direct');
            setRefreshSidebar(prev => prev + 1); // ДОДАНО: Змушуємо сайдбар оновитись!
        }}
      />
      
      <div className={`flex-1 ${getBackground()} transition-all duration-1000 ease-in-out relative overflow-hidden`}>
        <QuickNav activeView={activeView} onNavigate={setActiveView} />

        <div key={activeView} className="h-full animate-page">
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default App;