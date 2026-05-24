import React, { useState, useEffect } from 'react';
import { initSocket, getSocket } from './socket';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import ChatArea from './components/ChatArea';
import EditProfile from './components/EditProfile';
import GroupChatArea from './components/GroupChatArea';
import QuickNav from './components/QuickNav';
import ProjectsPage from './components/ProjectsPage';
import CreateGroupModal from './components/CreateGroupModal';
import Loader from './components/Loader';
import ProjectChatArea from './components/ProjectChatArea';
import ContactsPage from './components/ContactsPage';
import ProjectDetailsPage from './components/ProjectDetailsPage';
import { setupNotifications } from './firebase/fcm';

import TasksPage from './components/TasksPage';
import CalendarPage from './components/CalendarPage';
import CallsPage from './components/CallsPage';
import MeetingsPage from './components/MeetingsPage';

import Login from './components/Login';
import './components/Login.css'; 

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
          <h1 className="text-2xl font-bold mb-4">React down! 💥</h1>
          <p className="mb-4">err:</p>
          <pre className="bg-gray-900 p-4 rounded-xl text-sm whitespace-pre-wrap">
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-white text-black rounded-xl">reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  // --- 1. СТАНИ (STATES) ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [selectedGroupChat, setSelectedGroupChat] = useState(null);
  const [activeView, setActiveView] = useState('welcome');
  const [activeProjectId, setActiveProjectId] = useState(null); // НОВИЙ СТАН ДЛЯ ID ПРОЄКТУ
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('default');
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [refreshSidebar, setRefreshSidebar] = useState(0);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // РОЗУМНА ФУНКЦІЯ НАВІГАЦІЇ
  const handleNavigate = (view, id = null) => {
    setActiveView(view);
    if (id) {
      setActiveProjectId(id);
    }
  };

  // --- 2. ПЕРЕВІРКА ТОКЕНА ПРИ ЗАВАНТАЖЕННІ ---
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    
    setTimeout(() => {
      setIsAuthChecking(false);
    }, 1200); 
  }, []);

  // --- 3. ЗАВАНТАЖЕННЯ ДАНИХ ЮЗЕРА ТА СОКЕТІВ ---
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

  // --- 4. ДОПОМІЖНІ ФУНКЦІЇ ---
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
      return <div className="flex-1 flex items-center justify-center text-white"><Loader title="Loading profile..." /></div>;
    }

    switch(activeView) {
      case 'ai_chat': return <ChatArea key="ai" chatName="AI Assistant" isAi={true} currentUser={user} socket={socket} roomId="ai_room" onBack={() => handleNavigate('welcome')} />;
      case 'chat_direct': return <ChatArea key={`chat_${selectedChatUser?.roomId || selectedChatUser?.id || 'temp'}`} chatName={selectedChatUser?.displayName || selectedChatUser?.name || "User"} isAi={false} currentUser={user} socket={socket} roomId={selectedChatUser?.roomId || `temp_room_${selectedChatUser?.id || Date.now()}`} onBack={() => handleNavigate('welcome')} />;
      case 'group_chat': return <GroupChatArea key={`group_${selectedGroupChat?.id || 'temp'}`} groupName={selectedGroupChat?.name || "Team Group"} currentUser={user} socket={socket} roomId={selectedGroupChat?.id} onBack={() => handleNavigate('welcome')} />;
      case 'edit_profile': return <EditProfile currentUser={user} onBack={() => handleNavigate('welcome')} onSave={(newData) => { setUser(prev => ({ ...prev, ...newData })); handleNavigate('welcome'); }} />;
      case 'calendar': return <CalendarPage onNavigate={handleNavigate} />;
      case 'calls': return <CallsPage onNavigate={handleNavigate} />;
      case 'tasks': return <TasksPage onNavigate={handleNavigate} currentUser={user} />;
      case 'contacts': return <ContactsPage onNavigate={handleNavigate} onStartChat={(targetUser) => { setSelectedChatUser(targetUser); handleNavigate('chat_direct'); }} />;
      case 'meetings': return <MeetingsPage onNavigate={handleNavigate} />;
      case 'projects': return <ProjectsPage onNavigate={handleNavigate} currentUser={user} />;
      case 'project_chat':
        return (
          <ProjectChatArea 
            projectId={activeProjectId} // ЗМІНЕНО ТУТ
            projectName="Project Team" 
            currentUser={user} 
            onBack={() => handleNavigate('projects')} 
            onNavigateToDashboard={() => handleNavigate('project_details', activeProjectId)} // І ЗМІНЕНО ТУТ
            socket={socket} 
          />
        );
      case 'project_details': return <ProjectDetailsPage onNavigate={handleNavigate} projectId={activeProjectId} currentUser={user} socket={socket} />;
      default: return <div className="relative h-full flex flex-col"><WelcomeScreen onNavigate={handleNavigate} currentUser={user} /></div>;
    }
  };

  // --- 5. ГОЛОВНИЙ РЕНДЕР ---
  if (isAuthChecking) {
    return (
      <div className="min-h-screen w-full bg-[#030408] flex items-center justify-center">
        <Loader title="Starting FastLine..." subtitle="Establishing secure end-to-end connection." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={(userData) => { setUser(userData); setIsAuthenticated(true); }} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black relative">
      <style>
        {`
          @keyframes pageFadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
          .animate-page { animation: pageFadeIn 0.35s ease-out forwards; }
        `}
      </style>

      <Sidebar 
        onNavigate={handleNavigate} 
        currentUser={user} 
        onProfileClick={() => handleNavigate('edit_profile')}
        onLogout={handleLogout}
        refreshTrigger={refreshSidebar}
        onCreateGroupClick={() => setIsGroupModalOpen(true)}
        onStartGroupChat={(groupData) => {
            setSelectedGroupChat(groupData);
            handleNavigate('group_chat');
        }}
        onStartChat={async (targetUser) => { 
            if (!targetUser) return;
            const token = localStorage.getItem('token');
            let finalRoomId = `temp_room_${targetUser.id || Date.now()}`;
            
            try {
                const response = await fetch('https://backendfastline.onrender.com/chats/private', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ u1: user?.email, u2: targetUser?.email || targetUser?.tag })
                });
                if (response.ok) {
                    const chatData = await response.json();
                    finalRoomId = chatData?.id || finalRoomId; 
                }
            } catch (err) { console.warn("Бекенд не створив чат:", err); }

            setSelectedChatUser({ ...targetUser, roomId: finalRoomId });
            handleNavigate('chat_direct');
            setRefreshSidebar(prev => prev + 1); 
        }}
      />
      
      <div className={`flex-1 ${getBackground()} transition-all duration-1000 ease-in-out relative overflow-hidden`}>
        <QuickNav activeView={activeView} onNavigate={handleNavigate} />

        <div key={activeView} className="h-full animate-page">
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </div>
      </div>

      <CreateGroupModal 
        isOpen={isGroupModalOpen} 
        onClose={() => setIsGroupModalOpen(false)} 
        currentUser={user}
        onSuccess={() => { setRefreshSidebar(prev => prev + 1); }}
      />
    </div>
  );
}

export default App;