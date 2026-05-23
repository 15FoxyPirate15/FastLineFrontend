import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Shield, Mail, Tag, Home, Plus, Loader2, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const WorkspaceBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#05060f]">
    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#6d28d9] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse" style={{ animationDuration: '8s' }}></div>
    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#3b82f6] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" style={{ animationDuration: '12s' }}></div>
    <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-[#a19bfe] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse" style={{ animationDuration: '10s' }}></div>
    <style>{`.tech-grid { background-size: 40px 40px; background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px); mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%); -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%); }`}</style>
    <div className="absolute inset-0 tech-grid"></div>
  </div>
);

const ContactsPage = ({ onNavigate, onStartChat, currentUser }) => {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingUser, setIsAddingUser] = useState(false);

  // 1. ОТРИМАННЯ ЗБЕРЕЖЕНИХ КОНТАКТІВ (За новим ТЗ)
  const fetchContacts = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userId = currentUser.id || currentUser.uid || currentUser.email;
      const res = await fetch(`https://backendfastline.onrender.com/contacts/${encodeURIComponent(userId)}`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) {
          const data = await res.json();
          setContacts(Array.isArray(data) ? data : []);
      }
    } catch (err) { console.error("Failed to load contacts"); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchContacts();
  }, [currentUser]);

  // 2. ДОДАВАННЯ НОВОГО КОНТАКТУ ЧЕРЕЗ ГЛОБАЛЬНИЙ ПОШУК
  const handleAddContact = async () => {
    if (!searchQuery.trim()) return toast.error("Enter a tag or email");
    setIsAddingUser(true);
    try {
        const token = localStorage.getItem('token');
        const userId = currentUser.id || currentUser.uid || currentUser.email;
        const res = await fetch('https://backendfastline.onrender.com/contacts/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ userId: userId, targetIdentifier: searchQuery })
        });

        if (res.ok) {
            toast.success("Contact added successfully!");
            setSearchQuery('');
            fetchContacts(); // Оновлюємо список
        } else {
            const err = await res.json();
            toast.error(err.message || "Failed to add contact");
        }
    } catch (err) {
        toast.error("Network error");
    } finally {
        setIsAddingUser(false);
    }
  };

  // 3. ВИДАЛЕННЯ З КОНТАКТІВ
  const handleRemoveContact = async (contactId, e) => {
    e.stopPropagation();
    if (!window.confirm("Remove this user from contacts?")) return;
    
    try {
        const token = localStorage.getItem('token');
        const userId = currentUser.id || currentUser.uid || currentUser.email;
        const res = await fetch(`https://backendfastline.onrender.com/contacts/${encodeURIComponent(userId)}/${encodeURIComponent(contactId)}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            setContacts(contacts.filter(c => c.id !== contactId));
            toast.success("Contact removed");
        }
    } catch (err) { toast.error("Failed to remove"); }
  };

  // Фільтрація локального списку контактів під час набору тексту
  const filteredContacts = contacts.filter(c => {
    const name = c.displayName || c.name || '';
    const email = c.email || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col h-full w-full text-white relative z-10 overflow-y-auto custom-scrollbar p-6 md:p-12">
      <Toaster position="top-center" />
      <WorkspaceBackground />

      <div className="w-full max-w-6xl mx-auto relative z-10 flex flex-col h-full">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Contacts Directory</h1>
            <p className="text-gray-400 text-base mt-2">Connect instantly with your global team collaborators.</p>
          </div>
          <button onClick={() => onNavigate('welcome')} className="flex items-center gap-2 bg-[#0a0f1e]/60 backdrop-blur-xl border border-white/10 hover:border-white/30 text-gray-300 hover:text-white px-5 py-3 rounded-2xl transition-all font-bold shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <Home size={18} /> Home
          </button>
        </div>

        {/* НОВИЙ SEARCH BAR (Додавання + Локальний пошук) */}
        <div className="bg-[#0a0f1e]/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-3 pl-6 mb-8 flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <div className="flex items-center flex-1">
              <Search size={24} className="text-[#a19bfe] mr-4 shrink-0" />
              <input 
                type="text" 
                placeholder="Find in contacts or enter @tag / email to add new..." 
                className="bg-transparent border-none outline-none text-base text-white w-full placeholder-gray-500 font-medium"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
          </div>
          
          {searchQuery.trim().length > 2 && filteredContacts.length === 0 && (
              <button 
                onClick={handleAddContact} 
                disabled={isAddingUser}
                className="bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                  {isAddingUser ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Add User
              </button>
          )}
        </div>

        {/* CONTACTS GRID */}
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center text-[#a19bfe] font-bold animate-pulse">Syncing team directory...</div>
        ) : contacts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-[#0a0f1e]/20 backdrop-blur-xl rounded-[2rem] border border-dashed border-white/10 p-10">
              <p className="italic mb-2">You don't have any contacts yet.</p>
              <p className="text-sm text-gray-600">Type a user's @tag or email in the search bar above to add them.</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 italic bg-[#0a0f1e]/20 backdrop-blur-xl rounded-[2rem] border border-dashed border-white/10">No contacts found matching your query.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 pb-10">
            {filteredContacts.map((c) => {
              const name = c.displayName || c.name || c.email?.split('@')[0] || "User";
              const initial = name[0]?.toUpperCase() || "?";
              return (
                <div key={c.uid || c.id} className="bg-[#0a0f1e]/40 backdrop-blur-3xl border border-white/10 hover:bg-[#12182b]/60 hover:-translate-y-2 hover:border-[#6d28d9]/50 hover:shadow-[0_10px_40px_-10px_rgba(109,40,217,0.2)] rounded-[2rem] p-8 flex flex-col justify-between transition-all duration-300 group relative overflow-hidden">
                  
                  {/* КНОПКА ВИДАЛЕННЯ З КОНТАКТІВ */}
                  <button onClick={(e) => handleRemoveContact(c.id || c.uid, e)} className="absolute top-4 right-4 text-white/10 hover:text-red-400 bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"><X size={16} /></button>

                  <div className="flex items-start gap-5 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#030408]/80 flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 group-hover:border-[#6d28d9]/30 transition-all duration-300 shrink-0 text-2xl font-black text-white overflow-hidden">
                      {c.avatarUrl && c.avatarUrl !== 'none' && c.photoURL !== 'none' ? <img src={c.avatarUrl || c.photoURL} alt="avatar" className="w-full h-full object-cover" /> : initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-bold text-lg truncate group-hover:text-[#a19bfe] transition-colors flex items-center gap-2">
                        {name} {c.role === 'admin' && <Shield size={14} className="text-blue-400" />}
                      </h3>
                      <p className="text-xs text-gray-400 truncate flex items-center gap-1.5 mt-1.5"><Mail size={12}/> {c.email}</p>
                      <p className="text-xs text-[#3b82f6] font-bold tracking-wide flex items-center gap-1.5 mt-1.5"><Tag size={12}/> @{c.tag || c.username || "no_tag"}</p>
                    </div>
                  </div>
                  
                  <button onClick={() => onStartChat({ email: c.email, name: name, id: c.uid || c.id })} className="w-full bg-white/5 hover:bg-gradient-to-r hover:from-[#6d28d9] hover:to-[#3b82f6] text-gray-300 hover:text-white px-4 py-3.5 rounded-xl transition-all font-bold text-sm flex items-center justify-center gap-2 border border-white/5 hover:border-transparent shadow-md">
                    <MessageSquare size={16} /> Send Message
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsPage;