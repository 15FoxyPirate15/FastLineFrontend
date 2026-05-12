import React, { useState, useEffect } from 'react';
import { User, Mail, MessageSquare, Phone, Search, UserPlus, Home, MoreVertical } from 'lucide-react';

const ContactsPage = ({ onNavigate, onStartChat }) => {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Отримання списку всіх юзерів для контактів
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('token');
        // Припускаємо, що у бека є роут для отримання всіх юзерів. Якщо ні - використовуємо пошук з порожнім запитом.
        const response = await fetch('https://backendfastline.onrender.com/users/search?q=', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setContacts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar relative z-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-black text-white tracking-tight">Contacts</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Manage your professional network and teammates.</p>
        </div>

        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
          <button 
            onClick={() => onNavigate('welcome')} 
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2.5 rounded-2xl transition-all border border-white/5 shadow-inner"
          >
            <Home size={18} /> <span className="text-sm font-bold">Home</span>
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-purple-900/20 text-sm font-bold active:scale-95">
            <UserPlus size={18} /> Add Contact
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150 fill-mode-backwards">
        <div className="max-w-md bg-[#101426]/60 backdrop-blur-xl border border-white/10 flex items-center px-4 py-3.5 rounded-2xl focus-within:border-[#6d28d9]/50 transition-all shadow-inner focus-within:ring-4 focus-within:ring-[#6d28d9]/10">
          <Search size={20} className="text-[#a19bfe] mr-3" />
          <input 
            type="text" 
            placeholder="Filter contacts..." 
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-600 font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* CONTACTS GRID */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-[#a19bfe] font-bold animate-pulse">Scanning network...</div>
      ) : filteredContacts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-[#101426]/30 backdrop-blur-sm rounded-[2.5rem] border border-dashed border-white/10 animate-in fade-in duration-700">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-600">
                <User size={32} />
            </div>
            <p className="text-gray-500 font-bold">No contacts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredContacts.map((contact, idx) => (
            <div 
              key={contact.id || idx}
              className="bg-[#101426]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 hover:bg-[#161b33]/80 hover:border-[#6d28d9]/50 transition-all duration-300 group hover:-translate-y-1 shadow-lg animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex justify-between items-start mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1e2336] to-[#0a0b1e] border border-white/10 flex items-center justify-center text-white text-2xl font-black shadow-lg group-hover:shadow-[0_0_20px_rgba(109,40,217,0.3)] transition-all">
                    {contact.avatarUrl && contact.avatarUrl !== 'none' ? (
                      <img src={contact.avatarUrl} className="w-full h-full rounded-2xl object-cover" />
                    ) : (contact.name?.[0]?.toUpperCase() || '?')}
                  </div>
                  <button className="p-2 text-gray-600 hover:text-white transition-colors bg-white/5 rounded-full opacity-0 group-hover:opacity-100">
                      <MoreVertical size={16} />
                  </button>
              </div>

              <div className="mb-6">
                  <h3 className="text-white font-bold text-lg truncate group-hover:text-[#a19bfe] transition-colors">{contact.name || "Unknown"}</h3>
                  <div className="flex items-center gap-2 text-gray-500 text-xs mt-1.5 font-medium">
                      <Mail size={12} className="text-[#6d28d9]" />
                      <span className="truncate">{contact.email}</span>
                  </div>
              </div>

              <div className="flex gap-3">
                  <button 
                      onClick={() => onStartChat(contact)}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#6d28d9]/10 hover:bg-[#6d28d9] text-[#a19bfe] hover:text-white py-3 rounded-xl border border-[#6d28d9]/20 transition-all text-xs font-bold"
                  >
                      <MessageSquare size={14} /> Message
                  </button>
                  <button className="w-12 flex items-center justify-center bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white py-3 rounded-xl border border-white/5 transition-all">
                      <Phone size={14} />
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactsPage;