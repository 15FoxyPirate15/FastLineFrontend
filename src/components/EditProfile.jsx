import React, { useState } from 'react';
import { 
  Settings, Bell, Palette, Shield, 
  Lock, MonitorSmartphone, ChevronRight, 
  Layout, Archive, Users, Activity,
  Globe, Clock, Moon, Mail, Monitor
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const EditProfile = ({ onBack, currentUser }) => {
  const [activeTab, setActiveTab] = useState('general');
  
  const [prefs, setPrefs] = useState({
    darkMode: true,
    emailNotifs: false,
    desktopAlerts: false,
    twoFactor: true,
    autoArchive: true,
    guestAccess: false,
    activityFeed: true,
    pushNotifs: true,
    projectUpdates: true,
    taskAssignments: true
  });

  const togglePref = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    toast.success('Налаштування збережено!', { style: { background: '#1e1b2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
  };

  // ОНОВЛЕНО: Плавний перемикач (додано duration-300 та ease-in-out)
  const Toggle = ({ label, checked, onChange, subtitle, icon: Icon }) => (
    <div className="flex items-center justify-between py-3 group">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={18} className={`${checked ? 'text-[#a19bfe]' : 'text-gray-500'} transition-colors duration-300`} />}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-200">{label}</span>
          {subtitle && <span className="text-[11px] text-gray-500">{subtitle}</span>}
        </div>
      </div>
      <button
        onClick={onChange}
        className={`w-11 h-6 rounded-full transition-colors duration-300 relative border border-white/5 ${checked ? 'bg-[#6d28d9]' : 'bg-gray-600/50'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-md transition-transform duration-300 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="flex h-full w-full bg-[#0d101b] text-white overflow-hidden font-sans animate-in fade-in duration-300 relative z-20">
      <Toaster position="top-center" />
      
      {/* ОНОВЛЕНО: Сучасний скрол */}
      <style>
        {`
          .custom-settings-scroll::-webkit-scrollbar { width: 6px; }
          .custom-settings-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-settings-scroll::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 10px; }
          .custom-settings-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.2); }
        `}
      </style>
      
      {/* ЛІВИЙ САЙДБАР */}
      <div className="w-64 bg-[#131627] border-r border-white/5 p-6 flex flex-col gap-2 shrink-0">
        <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 text-sm transition-colors w-fit">
          ← Back to App
        </button>

        <div className="space-y-1">
          <button onClick={() => setActiveTab('general')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-[#6d28d9]/10 text-[#a19bfe] border border-[#6d28d9]/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
            <Settings size={18} /> General
          </button>
          <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'notifications' ? 'bg-[#6d28d9]/10 text-[#a19bfe] border border-[#6d28d9]/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
            <Bell size={18} /> Notifications
          </button>
          <button onClick={() => setActiveTab('appearance')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'appearance' ? 'bg-[#6d28d9]/10 text-[#a19bfe] border border-[#6d28d9]/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
            <Palette size={18} /> Appearance
          </button>
          <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'security' ? 'bg-[#6d28d9]/10 text-[#a19bfe] border border-[#6d28d9]/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
            <Shield size={18} /> Security & Privacy
          </button>
        </div>
      </div>

      {/* ГОЛОВНА ЗОНА */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-settings-scroll">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* HEADER */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 capitalize">{activeTab.replace('-', ' ')} Settings</h1>
              <p className="text-sm text-gray-400">Manage your {activeTab} preferences and configurations</p>
            </div>
            <button onClick={handleSave} className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white text-sm font-semibold py-2.5 px-6 rounded-xl transition-all shadow-[0_4px_15px_rgba(109,40,217,0.3)] active:scale-95">
              Save Changes
            </button>
          </div>

          {/* ВМІСТ В ЗАЛЕЖНОСТІ ВІД ВКАДКИ */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* --- ВКЛАДКА: GENERAL --- */}
            {activeTab === 'general' && (
              <div className="space-y-8">
                {/* Profile Card */}
                <div className="bg-[#1a1d36] border border-white/5 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-sm font-bold text-white mb-4">Profile</h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xl font-bold shadow-inner overflow-hidden border border-white/10">
                        {currentUser?.avatar ? <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover"/> : (currentUser?.name?.[0]?.toUpperCase() || 'U')}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{currentUser?.name || "User Name"}</div>
                        <div className="text-xs text-gray-400 flex gap-3 mt-0.5">
                          <span>{currentUser?.email || "user@example.com"}</span>
                          <span className="text-gray-600">|</span>
                          <span className="text-[#a19bfe]">{currentUser?.job || "Software Engineer"}</span>
                        </div>
                      </div>
                    </div>
                    <button className="bg-white/5 hover:bg-white/10 text-white text-sm font-medium py-2 px-5 rounded-lg border border-white/10 transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Preferences */}
                  <div className="bg-[#1a1d36] border border-white/5 rounded-2xl p-6 shadow-lg">
                    <h2 className="text-sm font-bold text-white mb-4">Regional & Language</h2>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between py-3 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <Globe size={18} className="text-gray-500"/>
                          <span className="text-sm font-medium text-gray-200">Language</span>
                        </div>
                        <select className="bg-[#131627] border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:border-[#6d28d9] transition-colors cursor-pointer">
                          <option>English</option>
                          <option>Ukrainian</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <Clock size={18} className="text-gray-500"/>
                          <span className="text-sm font-medium text-gray-200">Timezone</span>
                        </div>
                        <select className="bg-[#131627] border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:border-[#6d28d9] transition-colors cursor-pointer max-w-[150px] truncate">
                          <option>UTC +02:00 (Kyiv)</option>
                          <option>UTC +00:00 (London)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Workspace */}
                  <div className="bg-[#1a1d36] border border-white/5 rounded-2xl p-6 shadow-lg">
                    <h2 className="text-sm font-bold text-white mb-4">Workspace Defaults</h2>
                    <div className="flex items-center gap-3 mb-4">
                      <Layout size={18} className="text-gray-500"/>
                      <div className="flex-1 flex flex-col py-1">
                        <span className="text-sm font-medium text-gray-200 mb-2">Default Project View</span>
                        <select className="bg-[#131627] border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-[#6d28d9] transition-colors cursor-pointer w-full">
                          <option>Kanban</option>
                          <option>List</option>
                          <option>Calendar</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1 border-t border-white/5 pt-2">
                      <Toggle label="Auto Archive Projects" subtitle="30 days" checked={prefs.autoArchive} onChange={() => togglePref('autoArchive')} icon={Archive} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- ВКЛАДКА: NOTIFICATIONS --- */}
            {activeTab === 'notifications' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#1a1d36] border border-white/5 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-sm font-bold text-white mb-4">In-App Notifications</h2>
                  <div className="space-y-1">
                    <Toggle label="Push Notifications" checked={prefs.pushNotifs} onChange={() => togglePref('pushNotifs')} icon={Bell} />
                    <Toggle label="Project Updates" checked={prefs.projectUpdates} onChange={() => togglePref('projectUpdates')} icon={Activity} />
                    <Toggle label="Task Assignments" checked={prefs.taskAssignments} onChange={() => togglePref('taskAssignments')} icon={Check} />
                  </div>
                </div>

                <div className="bg-[#1a1d36] border border-white/5 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-sm font-bold text-white mb-4">External Alerts</h2>
                  <div className="space-y-1">
                    <Toggle label="Email Notifications" subtitle="Daily summaries and mentions" checked={prefs.emailNotifs} onChange={() => togglePref('emailNotifs')} icon={Mail} />
                    <Toggle label="Desktop Alerts" subtitle="Show OS level popups" checked={prefs.desktopAlerts} onChange={() => togglePref('desktopAlerts')} icon={Monitor} />
                  </div>
                </div>
              </div>
            )}

            {/* --- ВКЛАДКА: APPEARANCE --- */}
            {activeTab === 'appearance' && (
              <div className="max-w-xl">
                <div className="bg-[#1a1d36] border border-white/5 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-sm font-bold text-white mb-4">Theme & Display</h2>
                  <div className="space-y-1">
                    <Toggle label="Dark Mode" subtitle="Reduce eye strain" checked={prefs.darkMode} onChange={() => togglePref('darkMode')} icon={Moon} />
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-white/5">
                     <span className="text-sm font-medium text-gray-200 block mb-4">Accent Color</span>
                     <div className="flex gap-4">
                        <button className="w-8 h-8 rounded-full bg-[#6d28d9] ring-2 ring-offset-2 ring-offset-[#1a1d36] ring-[#6d28d9]"></button>
                        <button className="w-8 h-8 rounded-full bg-blue-500 hover:scale-110 transition-transform"></button>
                        <button className="w-8 h-8 rounded-full bg-pink-500 hover:scale-110 transition-transform"></button>
                        <button className="w-8 h-8 rounded-full bg-green-500 hover:scale-110 transition-transform"></button>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- ВКЛАДКА: SECURITY --- */}
            {activeTab === 'security' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#1a1d36] border border-white/5 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-sm font-bold text-white mb-4">Password & Auth</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-3 cursor-pointer group hover:bg-white/5 px-3 -mx-3 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <Lock size={18} className="text-gray-500 group-hover:text-[#a19bfe] transition-colors"/>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">Change Password</span>
                          <span className="text-[11px] text-gray-500">Last changed 3 months ago</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                    </div>

                    <div className="border-t border-white/5 py-2">
                      <Toggle label="Two-Factor Authentication" subtitle="Add extra security to your account" checked={prefs.twoFactor} onChange={() => togglePref('twoFactor')} icon={Shield} />
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1d36] border border-white/5 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-sm font-bold text-white mb-4">Access Control</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-3 cursor-pointer group hover:bg-white/5 px-3 -mx-3 rounded-xl transition-colors mb-2">
                      <div className="flex items-center gap-3">
                        <MonitorSmartphone size={18} className="text-gray-500 group-hover:text-[#a19bfe] transition-colors"/>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">Active Sessions</span>
                          <span className="text-[11px] text-gray-500">Manage devices and sessions</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                    
                    <div className="border-t border-white/5 pt-2">
                      <Toggle label="Allow Guest Access" subtitle="Permit external invites to workspace" checked={prefs.guestAccess} onChange={() => togglePref('guestAccess')} icon={Users} />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Check icon
const Check = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
);

export default EditProfile;