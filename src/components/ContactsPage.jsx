import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Shield, Mail, Tag, Home, Plus, Loader2, X, UserPlus, Users } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const API = 'https://backendfastline.onrender.com';

const WorkspaceBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#05060f]">
    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#6d28d9] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse" style={{ animationDuration: '8s' }}></div>
    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#3b82f6] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" style={{ animationDuration: '12s' }}></div>
    <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-[#a19bfe] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse" style={{ animationDuration: '10s' }}></div>
    <style>{`.tech-grid { background-size: 40px 40px; background-image: linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px); mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%); -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%); }`}</style>
    <div className="absolute inset-0 tech-grid"></div>
  </div>
);

// Модальне вікно для додавання контакту
const AddContactModal = ({ onClose, onAdd, isLoading }) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (!value.trim()) return toast.error('Введіть @тег або email');
    onAdd(value.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#101426] border border-white/10 rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <button onClick={onClose} className="absolute top-5 right-5 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors">
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#6d28d9]/20 border border-[#6d28d9]/30 flex items-center justify-center">
            <UserPlus size={22} className="text-[#a19bfe]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Додати контакт</h2>
            <p className="text-sm text-gray-500">За @тегом або email-адресою</p>
          </div>
        </div>

        <div className="bg-[#0a0f1e]/60 border border-white/5 rounded-2xl flex items-center px-4 py-3 mb-4 focus-within:border-[#6d28d9]/50 focus-within:ring-1 focus-within:ring-[#6d28d9]/20 transition-all">
          <Tag size={16} className="text-[#a19bfe] mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="@username або user@email.com"
            className="bg-transparent outline-none text-white text-sm w-full placeholder-gray-600"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <p className="text-xs text-gray-600 mb-6 px-1">
          Шукаємо користувача по всій базі. Якщо знайдемо — одразу додамо до ваших контактів.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm font-bold transition-colors"
          >
            Скасувати
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !value.trim()}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Додати
          </button>
        </div>
      </div>
    </div>
  );
};

const ContactsPage = ({ onNavigate, onStartChat, currentUser }) => {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  // Відстежуємо який контакт зараз видаляється (щоб показати спіннер на конкретній картці)
  const [deletingId, setDeletingId] = useState(null);

  // Хелпер: стабільний userId
  const getUserId = () => currentUser?.id || currentUser?.uid || currentUser?.email;

  // ── FETCH ──────────────────────────────────────────────
  const fetchContacts = async () => {
    if (!currentUser) { setIsLoading(false); return; }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userId = getUserId();
      const res = await fetch(`${API}/contacts/${encodeURIComponent(userId)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        // Бекенд повертає масив напряму (contacts.service.ts → getContacts)
        if (Array.isArray(data)) setContacts(data);
        else if (data && Array.isArray(data.contacts)) setContacts(data.contacts);
        else setContacts([]);
      } else {
        setContacts([]);
      }
    } catch (err) {
      console.error('Failed to load contacts', err);
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, [currentUser]);

const handleAddContact = async (targetIdentifier) => {
  console.log('currentUser:', JSON.stringify(currentUser));
  if (!targetIdentifier) return toast.error('Введіть @тег або email');

  const userId = currentUser?.id || currentUser?.uid || currentUser?._id || currentUser?.email;

  if (!userId) {
    toast.error('Session error: Could not identify your user ID. Try re-logging.');
    return;
  }

  setIsAddingContact(true); // ← було isAddingUser (не існує)
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/contacts/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ userId, targetIdentifier }) // ← аргумент, не searchQuery
    });

    if (res.ok) {
      toast.success('Контакт додано!');
      setIsAddModalOpen(false); // ← закриваємо модалку
      fetchContacts();
    } else {
      const err = await res.json();
      toast.error(err.message || 'Не вдалося додати контакт');
    }
  } catch (err) {
    toast.error('Помилка мережі');
  } finally {
    setIsAddingContact(false); // ← було isAddingUser
  }
};
  // ── DELETE ─────────────────────────────────────────────
  // DELETE /contacts/:userId/:contactId
  const handleRemoveContact = async (contactId, e) => {
    e.stopPropagation();
    if (!window.confirm('Видалити цього користувача з контактів?')) return;

    setDeletingId(contactId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API}/contacts/${encodeURIComponent(getUserId())}/${encodeURIComponent(contactId)}`,
        { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (res.ok) {
        // Видаляємо з локального стейту одразу — не чекаємо рефетч
        setContacts(prev => prev.filter(c => (c.id || c.uid) !== contactId));
        toast.success('Контакт видалено');
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || 'Не вдалося видалити');
      }
    } catch (err) {
      toast.error('Помилка мережі');
    } finally {
      setDeletingId(null);
    }
  };

  // ── FILTER (лише пошук по завантажених) ───────────────
  const filteredContacts = contacts.filter(c => {
    const name = (c.displayName || c.name || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const username = (c.username || c.tag || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || email.includes(q) || username.includes(q);
  });

  return (
    <div className="flex-1 flex flex-col h-full w-full text-white relative z-10 overflow-y-auto p-6 md:p-12">
      <Toaster position="top-center" />
      <WorkspaceBackground />

      {isAddModalOpen && (
        <AddContactModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddContact}
          isLoading={isAddingContact}
        />
      )}

      <div className="w-full max-w-6xl mx-auto relative z-10 flex flex-col h-full">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Contacts Directory</h1>
            <p className="text-gray-400 text-base mt-2">
              {isLoading ? 'Syncing...' : `${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Кнопка додавання — завжди доступна */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-[0_0_20px_rgba(109,40,217,0.3)] hover:opacity-90 active:scale-95 transition-all"
            >
              <UserPlus size={18} /> Add Contact
            </button>
            <button
              onClick={() => onNavigate('welcome')}
              className="flex items-center gap-2 bg-[#0a0f1e]/60 backdrop-blur-xl border border-white/10 hover:border-white/30 text-gray-300 hover:text-white px-5 py-3 rounded-2xl transition-all font-bold shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            >
              <Home size={18} /> Home
            </button>
          </div>
        </div>

        {/* SEARCH — тільки для фільтрації завантажених контактів */}
        <div className="bg-[#0a0f1e]/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-3 pl-6 mb-8 flex items-center shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <Search size={20} className="text-[#a19bfe] mr-4 shrink-0" />
          <input
            type="text"
            placeholder="Search contacts by name, email or @tag..."
            className="bg-transparent border-none outline-none text-base text-white w-full placeholder-gray-500 font-medium"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-600 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors mr-1">
              <X size={16} />
            </button>
          )}
        </div>

        {/* CONTACTS GRID */}
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center text-[#a19bfe] font-bold animate-pulse">
            Syncing team directory...
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-[#0a0f1e]/20 backdrop-blur-xl rounded-[2rem] border border-dashed border-white/10 p-10 gap-4">
            <Users size={40} className="text-white/10" />
            <p className="italic">You don't have any contacts yet.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-[#6d28d9]/20 hover:bg-[#6d28d9]/30 border border-[#6d28d9]/30 text-[#a19bfe] px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              <UserPlus size={16} /> Add your first contact
            </button>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 italic bg-[#0a0f1e]/20 backdrop-blur-xl rounded-[2rem] border border-dashed border-white/10">
            No contacts match "{searchQuery}"
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 pb-10">
            {filteredContacts.map((c) => {
              const contactId = c.id || c.uid;
              const name = c.displayName || c.name || c.email?.split('@')[0] || 'User';
              const initial = name[0]?.toUpperCase() || '?';
              const isDeleting = deletingId === contactId;

              return (
                <div
                  key={contactId}
                  className={`bg-[#0a0f1e]/40 backdrop-blur-3xl border border-white/10 hover:bg-[#12182b]/60 hover:-translate-y-2 hover:border-[#6d28d9]/50 hover:shadow-[0_10px_40px_-10px_rgba(109,40,217,0.2)] rounded-[2rem] p-8 flex flex-col justify-between transition-all duration-300 group relative overflow-hidden ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  {/* Кнопка видалення */}
                  <button
                    onClick={(e) => handleRemoveContact(contactId, e)}
                    disabled={isDeleting}
                    className="absolute top-4 right-4 text-white/10 hover:text-red-400 bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Remove contact"
                  >
                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                  </button>

                  <div className="flex items-start gap-5 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#030408]/80 flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 group-hover:border-[#6d28d9]/30 transition-all duration-300 shrink-0 text-2xl font-black text-white overflow-hidden">
                      {(c.avatarUrl || c.photoURL) && (c.avatarUrl !== 'none') && (c.photoURL !== 'none')
                        ? <img src={c.avatarUrl || c.photoURL} alt="avatar" className="w-full h-full object-cover" />
                        : initial
                      }
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <h3 className="text-white font-bold text-lg truncate group-hover:text-[#a19bfe] transition-colors flex items-center gap-2">
                        {name}
                        {c.role === 'admin' && <Shield size={14} className="text-blue-400 shrink-0" />}
                      </h3>
                      <p className="text-xs text-gray-400 truncate flex items-center gap-1.5 mt-1.5">
                        <Mail size={12} /> {c.email}
                      </p>
                      <p className="text-xs text-[#3b82f6] font-bold tracking-wide flex items-center gap-1.5 mt-1.5">
                        <Tag size={12} /> @{(c.username || c.tag || 'no_tag').replace(/^@/, '')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onStartChat({ email: c.email, name, id: c.uid || c.id })}
                    className="w-full bg-white/5 hover:bg-gradient-to-r hover:from-[#6d28d9] hover:to-[#3b82f6] text-gray-300 hover:text-white px-4 py-3.5 rounded-xl transition-all font-bold text-sm flex items-center justify-center gap-2 border border-white/5 hover:border-transparent shadow-md"
                  >
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