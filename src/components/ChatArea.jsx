import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, X, Reply, Smile, CheckCheck, Check, MoreVertical, Edit2, Trash2, Copy, Phone, Video as VideoIcon, Pin, Image as ImageIcon, Paperclip, Mic, BellOff, Settings, MoreHorizontal, Link as LinkIcon, Search, Clock, UserX, FileText, Loader2, Users, ExternalLink } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = 'https://backendfastline.onrender.com';

const isImageUrl = (text) => {
  if (!text || typeof text !== 'string') return false;
  return text.startsWith('http') && (text.match(/\.(jpeg|jpg|gif|png|webp)/i) || text.includes('cloudinary'));
};

const getSenderId = (m) => {
  if (!m) return "unknown";
  const raw = m.senderId || m.from || m.userId || m.senderEmail || m.sender
            || m.author || m.uid || m.createdBy || m.owner || m.userID || m.user_id;
  if (typeof raw === 'object' && raw !== null) {
    return String(raw._id || raw.id || raw.uid || raw.email || raw.name || "unknown");
  }
  return String(raw || "unknown");
};

const checkIsMe = (senderStr, currentUser) => {
  if (!senderStr || senderStr === "undefined" || senderStr === "unknown" || senderStr === "null") return false;
  if (!currentUser) return false;
  const s = String(senderStr).toLowerCase().trim();
  const candidates = [
    currentUser?.id, currentUser?.uid, currentUser?._id,
    currentUser?.email, currentUser?.name, currentUser?.full_name,
  ];
  return candidates.some(c => c && String(c).toLowerCase().trim() === s);
};

const normalizeMessage = (m, currentUser) => {
  const backendSender = getSenderId(m);
  const isMyMessage = checkIsMe(backendSender, currentUser);
  let timeString = "now";
  if (m.createdAt) {
    const dateObj = m.createdAt._seconds
      ? new Date(m.createdAt._seconds * 1000)
      : new Date(m.createdAt);
    timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return {
    id: String(m.id || m._id || Math.random()),
    text: m.text || m.message || m.content || m.body || "Empty",
    senderId: backendSender,
    isMe: isMyMessage,
    timestamp: timeString,
    read: m.read || false,
    replyTo: m.replyTo || null,
    reactions: Array.isArray(m.reactions) ? m.reactions : [],
    isEdited: m.isEdited || false,
    isSystem: m.type === 'system' || m.isSystem || false,
  };
};

const UserProfileDrawer = ({ chatName, currentUser, roomId, socket, onClose, onMuteToggle }) => {
  const [activeTab, setActiveTab] = useState('media');
  const [targetUser, setTargetUser]     = useState(null);
  const [isMuted, setIsMuted]           = useState(false);
  const [commonGroups, setCommonGroups] = useState([]);
  const [sharedMedia, setSharedMedia]   = useState({ images: [], files: [], links: [] });
  const [isLoading, setIsLoading]       = useState(true);
  const [searchQuery, setSearchQuery]   = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl]   = useState(null);

  useEffect(() => {
    if (!currentUser || !chatName || !roomId) return;
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    const currentEmail = currentUser?.email;

    const run = async () => {
      setIsLoading(true);
      try {
        const searchRes = await fetch(`${API_BASE}/users/search?q=${encodeURIComponent(chatName)}`, { headers });
        let foundUser = null;
        if (searchRes.ok) {
          const users = await searchRes.json();
          foundUser = Array.isArray(users)
            ? users.find(u =>
                u.username?.toLowerCase() === chatName.toLowerCase() ||
                u.displayName?.toLowerCase() === chatName.toLowerCase() ||
                u.tag?.toLowerCase().replace('@','') === chatName.toLowerCase()
              ) || users[0]
            : null;
          setTargetUser(foundUser || null);
        }

        const targetEmail = foundUser?.email;

        const [chatsRes, commonRes, msgsRes] = await Promise.all([
          fetch(`${API_BASE}/chats/user/${encodeURIComponent(currentEmail)}`, { headers }),
          targetEmail
            ? fetch(`${API_BASE}/chats/common?u1=${encodeURIComponent(currentEmail)}&u2=${encodeURIComponent(targetEmail)}`, { headers })
            : Promise.resolve(null),
          fetch(`${API_BASE}/messages/${roomId}`, { headers }),
        ]);

        if (chatsRes.ok) {
          const chats = await chatsRes.json();
          const thisChat = Array.isArray(chats) ? chats.find(c => c.id === roomId) : null;
          if (thisChat) {
            const mutedBy = thisChat.settings?.mutedBy || [];
            setIsMuted(mutedBy.includes(currentEmail));
          }
        }

        if (commonRes && commonRes.ok) {
          const groups = await commonRes.json();
          setCommonGroups(Array.isArray(groups) ? groups.map(g => ({ id: g.id, name: g.name })) : []);
        }

        if (msgsRes && msgsRes.ok) {
          const msgs = await msgsRes.json();
          if (Array.isArray(msgs)) {
            const images = [], files = [], links = [];
            msgs.forEach(m => {
              const text = m.text || m.message || m.content || '';
              if (!text) return;
              if (isImageUrl(text)) {
                images.push({ id: m.id || m._id, url: text });
              } else if (text.startsWith('http') && !text.match(/\.(jpeg|jpg|gif|png|webp)/i)) {
                const isFile = text.match(/\.(pdf|doc|docx|xls|xlsx|zip|rar|txt|csv|pptx)/i);
                if (isFile) {
                  const parts = text.split('/');
                  files.push({ id: m.id || m._id, url: text, name: decodeURIComponent(parts[parts.length - 1] || 'File') });
                } else {
                  links.push({ id: m.id || m._id, url: text, title: text });
                }
              }
            });
            setSharedMedia({ images, files, links });
          }
        }
      } catch (e) {
        console.error('Drawer fetch error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [chatName, currentUser, roomId]);

  const handleMuteToggle = async () => {
    if (!roomId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/chats/${roomId}/mute`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: currentUser?.email })
      });
      if (res.ok) {
        const data = await res.json();
        setIsMuted(data.isMuted);
        toast.success(data.isMuted ? 'Chat muted' : 'Chat unmuted', {
          style: { background: '#1e1b2e', color: '#fff' }
        });
        if (onMuteToggle) onMuteToggle(data.isMuted);
      }
    } catch (e) {
      toast.error('Failed to toggle mute');
    }
  };

  const filteredMedia = sharedMedia.images.filter(img =>
    !searchQuery || img.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFiles = sharedMedia.files.filter(f =>
    !searchQuery || f.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredLinks = sharedMedia.links.filter(l =>
    !searchQuery || l.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayName = targetUser?.displayName || targetUser?.username || chatName;
  const username    = targetUser?.username || targetUser?.tag?.replace('@','') || chatName.toLowerCase().replace(/\s/g,'_');
  const bio         = targetUser?.bio || '';
  const status      = targetUser?.status || 'last seen recently';
  const isOnline    = targetUser?.isOnline || false;
  const avatarUrl   = targetUser?.avatarUrl || targetUser?.photoURL || '';

  return (
    <>
      {lightboxUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="Media" className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain shadow-2xl" />
          <button className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/40 p-2 rounded-full" onClick={() => setLightboxUrl(null)}>
            <X size={22} />
          </button>
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="bg-[#101426] border border-white/10 rounded-[2rem] w-full max-w-md shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">

          <div className="relative h-52 bg-gradient-to-br from-[#6d28d9]/80 to-[#3b82f6]/80 flex flex-col justify-end p-6 overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-md transition-colors z-10">
              <X size={20} />
            </button>
            <div className="relative z-10 flex gap-4 items-end">
              <div className="w-20 h-20 rounded-full border-4 border-[#101426] bg-[#1e2336] flex items-center justify-center text-3xl font-black shadow-xl shrink-0 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  displayName[0]?.toUpperCase()
                )}
              </div>
              <div className="mb-1">
                <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">{displayName}</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isOnline && <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>}
                  <p className="text-sm text-white/80 font-medium">{isOnline ? 'Online' : status}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-around items-center p-4 border-b border-white/5 bg-[#161b33] shrink-0">
            {[
              { icon: Search, label: 'Search', color: '#6d28d9', action: () => setIsSearchOpen(v => !v) },
              { icon: isMuted ? BellOff : BellOff, label: isMuted ? 'Unmute' : 'Mute', color: isMuted ? '#ec4899' : '#3b82f6', action: handleMuteToggle, active: isMuted },
              { icon: Clock, label: 'Timer', color: '#ec4899', action: () => toast('Self-destruct timer coming soon!', { icon: '⏱️' }) },
              { icon: MoreHorizontal, label: 'More', color: 'rgb(239,68,68)', action: () => toast('More options coming soon!') },
            ].map(({ icon: Icon, label, color, action, active }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={action}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: active ? color + '33' : 'rgba(255,255,255,0.05)' }}
                >
                  <Icon size={18} style={{ color: active ? color : '#a19bfe' }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: active ? color : '#6b7280' }}>{label}</span>
              </div>
            ))}
          </div>

          {isSearchOpen && (
            <div className="px-4 pt-3 pb-0 bg-[#101426] shrink-0 animate-in slide-in-from-top-2 fade-in">
              <div className="flex items-center gap-2 bg-[#161b33] border border-white/5 rounded-xl px-3 py-2">
                <Search size={14} className="text-gray-500 shrink-0" />
                <input
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                  placeholder="Search media & files..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-gray-500 hover:text-white">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto flex flex-col min-h-0 chat-custom-scroll">
            <div className="p-6 border-b border-white/5 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 size={20} className="animate-spin text-[#a19bfe]" />
                  <span className="ml-2 text-sm text-gray-500">Loading profile...</span>
                </div>
              ) : (
                <>
                  <div>
                    <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Username</div>
                    <div className="text-sm font-medium text-white">@{username}</div>
                  </div>
                  {bio && (
                    <div>
                      <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Bio</div>
                      <div className="text-sm text-gray-300">{bio}</div>
                    </div>
                  )}
                  {targetUser?.email && (
                    <div>
                      <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Email</div>
                      <div className="text-sm text-gray-300">{targetUser.email}</div>
                    </div>
                  )}
                </>
              )}
            </div>

            {!isLoading && commonGroups.length > 0 && (
              <div className="px-6 py-4 border-b border-white/5">
                <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">
                  Common Groups ({commonGroups.length})
                </div>
                <div className="space-y-2">
                  {commonGroups.map(group => (
                    <div key={group.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6d28d9]/60 to-[#3b82f6]/60 flex items-center justify-center shrink-0">
                        <Users size={16} className="text-white/70" />
                      </div>
                      <div className="text-sm font-medium text-gray-200 truncate">{group.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex px-6 border-b border-white/5 sticky top-0 bg-[#101426] z-10 pt-2 shrink-0">
              {['media', 'files', 'links'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-bold transition-all px-4 capitalize ${activeTab === tab ? 'text-[#a19bfe] border-b-2 border-[#6d28d9]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {tab}
                  {tab === 'media' && filteredMedia.length > 0 && <span className="ml-1.5 text-[10px] bg-[#6d28d9]/40 text-[#a19bfe] px-1.5 py-0.5 rounded-full">{filteredMedia.length}</span>}
                  {tab === 'files' && filteredFiles.length > 0 && <span className="ml-1.5 text-[10px] bg-[#6d28d9]/40 text-[#a19bfe] px-1.5 py-0.5 rounded-full">{filteredFiles.length}</span>}
                  {tab === 'links' && filteredLinks.length > 0 && <span className="ml-1.5 text-[10px] bg-[#6d28d9]/40 text-[#a19bfe] px-1.5 py-0.5 rounded-full">{filteredLinks.length}</span>}
                </button>
              ))}
            </div>

            <div className="p-4 flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-[#a19bfe]" />
                </div>
              ) : (
                <>
                  {activeTab === 'media' && (
                    filteredMedia.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <ImageIcon size={32} className="text-white/10 mb-3" />
                        <p className="text-sm text-gray-600">No shared media</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {filteredMedia.map((img, i) => (
                          <div
                            key={img.id || i}
                            className="aspect-square bg-[#161b33] rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-white/5 relative group"
                            onClick={() => setLightboxUrl(img.url)}
                          >
                            <img src={img.url} alt="shared media" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ExternalLink size={18} className="text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {activeTab === 'files' && (
                    filteredFiles.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileText size={32} className="text-white/10 mb-3" />
                        <p className="text-sm text-gray-600">No shared files</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredFiles.map((file, i) => (
                          <a
                            key={file.id || i}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5"
                          >
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                              <FileText size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-200 truncate">{file.name || 'Document'}</div>
                              <div className="text-[11px] text-gray-500">{file.size ? `${Math.round(file.size / 1024)} KB` : ''}</div>
                            </div>
                            <ExternalLink size={14} className="text-gray-600 shrink-0" />
                          </a>
                        ))}
                      </div>
                    )
                  )}

                  {activeTab === 'links' && (
                    filteredLinks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <LinkIcon size={32} className="text-white/10 mb-3" />
                        <p className="text-sm text-gray-600">No shared links</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredLinks.map((link, i) => (
                          <a
                            key={link.id || i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5"
                          >
                            <div className="w-10 h-10 rounded-lg bg-[#a19bfe]/10 text-[#a19bfe] flex items-center justify-center shrink-0">
                              <LinkIcon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-200 truncate">{link.title || link.url}</div>
                              <div className="text-[11px] text-gray-500 truncate">{link.url}</div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ChatArea = ({ chatName = "User", currentUser, onBack, socket, roomId }) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  
  // Стейт для статусів через сокети
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeoutRef = useRef(null);
  
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [isChatMuted, setIsChatMuted] = useState(false);
  const messagesEndRef = useRef(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const currentUserId = currentUser?.id || currentUser?.uid || currentUser?._id || currentUser?.email || null;

  useEffect(() => {
    const handleGlobalClick = () => { if (activeMenu) setActiveMenu(null); };
    document.addEventListener('mousedown', handleGlobalClick);
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, [activeMenu]);

  // --- POLLING ---
  useEffect(() => {
    if (!roomId || !currentUserId) return;
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/messages/${roomId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        const history = await res.json();
        if (!Array.isArray(history)) return;
        
        const formattedMessages = history.filter(Boolean).map(m => normalizeMessage(m, currentUser));
        setMessages(prev => {
          const dbTexts = new Set(formattedMessages.map(m => m.text));
          const pendingTemp = prev.filter(m => String(m.id).startsWith('temp_') && !dbTexts.has(m.text));
          const result = [...formattedMessages, ...pendingTemp];
          if (prev.length === result.length) {
            const lastPrev = prev[prev.length - 1];
            const lastNew = result[result.length - 1];
            if (lastPrev?.id === lastNew?.id && lastPrev?.text === lastNew?.text) return prev;
          }
          return result;
        });
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    fetchHistory();
    const pollingInterval = setInterval(fetchHistory, 3000);
    return () => clearInterval(pollingInterval);
  }, [roomId, currentUserId]);

  // --- SOCKET ---
  useEffect(() => {
    if (!socket || !roomId) return;
    
    socket.emit('join_room', { roomId });

    const handleNewMessage = (backendMessage) => {
      if (backendMessage.roomId !== roomId) return;
      setMessages(prev => {
        const msgId = String(backendMessage.id || backendMessage._id || '');
        if (msgId && prev.some(m => String(m.id) === msgId)) return prev;
        const filteredPrev = prev.filter(m =>
          !(String(m.id).startsWith('temp_') && m.text === backendMessage.text)
        );
        const normalized = normalizeMessage(
          { ...backendMessage, id: msgId || Math.random().toString() },
          currentUser
        );
        return [...filteredPrev, normalized];
      });

      // Прибираємо статус "друкує", якщо юзер відправив повідомлення
      const senderIdStr = String(getSenderId(backendMessage));
      setTypingUsers(prev => {
        if (!prev[senderIdStr]) return prev;
        const next = { ...prev };
        delete next[senderIdStr];
        return next;
      });
    };

    const handleReaction = ({ messageId, reactions }) =>
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
    const handleMessageEdited = ({ messageId, newText, isEdited }) =>
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: newText, isEdited } : m));
    const handleMessageDeleted = ({ messageId }) =>
      setMessages(prev => prev.filter(m => m.id !== messageId));
    const handleMessagePinned = (msg) => setPinnedMessage(msg);
    const handleMessageUnpinned = () => setPinnedMessage(null);
    const handleMessagesRead = ({ userId }) => {
      if (!checkIsMe(userId, currentUser)) {
        setMessages(prevMessages => prevMessages.map(msg => msg.isMe ? { ...msg, read: true } : msg));
      }
    };

    // Обробники статусів
    const handleTypingStart = ({ userId, userName }) => {
      if (checkIsMe(userId, currentUser)) return;
      setTypingUsers(prev => ({ ...prev, [userId]: userName || chatName }));
    };

    const handleTypingEnd = ({ userId }) => {
      setTypingUsers(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('reaction_added', handleReaction);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('message_pinned', handleMessagePinned);
    socket.on('message_unpinned', handleMessageUnpinned);
    socket.on('messages_read', handleMessagesRead);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_end', handleTypingEnd);

    // Очищення при виході з кімнати
    return () => {
      socket.emit('leave_room', { roomId });
      setMessages([]);
      setTypingUsers({});
      
      socket.off('new_message', handleNewMessage);
      socket.off('reaction_added', handleReaction);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('message_pinned', handleMessagePinned);
      socket.off('message_unpinned', handleMessageUnpinned);
      socket.off('messages_read', handleMessagesRead);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_end', handleTypingEnd);
    };
  }, [socket, roomId, currentUserId, chatName, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // --- ВІДПРАВКА СТАТУСУ ДРУКУВАННЯ ---
  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    if (socket && roomId) {
      socket.emit('typing_start', { 
        roomId, 
        userId: currentUserId, 
        userName: currentUser?.name || currentUser?.email?.split('@')[0] || "User" 
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_end', { roomId, userId: currentUserId });
      }, 2000);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !roomId) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (socket) socket.emit('typing_end', { roomId, userId: currentUserId });

    if (editingMessage) {
      if (socket) socket.emit('edit_message', { roomId, messageId: editingMessage.id, newText: input });
      setEditingMessage(null);
      setInput("");
      return;
    }

    const textToSend = input;
    setInput("");
    setReplyingTo(null);

    const senderId = currentUser?.id || currentUser?.uid || currentUser?.email || "unknown";

    const messageData = {
      roomId: roomId,
      senderId: senderId,
      text: textToSend,
      replyTo: replyingTo ? { senderName: replyingTo.senderName || chatName, text: replyingTo.text } : null,
      mentions: [],
      file: null
    };

    const tempId = `temp_${Date.now()}`;
    const tempMsg = {
      id: tempId, text: textToSend, senderId: senderId, isMe: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [], replyTo: messageData.replyTo,
    };
    
    setMessages(prev => [...prev, tempMsg]);

    if (socket) {
      socket.emit('send_message', messageData);
    } else {
      toast.error("Socket disconnected!");
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploadingFile(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', `private_chat_${roomId}`);

    try {
      const response = await fetch(`${API_BASE}/storage/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const senderId = currentUser?.id || currentUser?.uid || currentUser?.email || "unknown";
        const tempId = `temp_${Date.now()}`;

        const messageData = {
          roomId: roomId,
          senderId: senderId,
          text: data.url,
          replyTo: null,
          mentions: [],
          file: {
             url: data.url,
             name: file.name,
             type: file.type,
             size: file.size
          }
        };

        setMessages(prev => [...prev, { id: tempId, text: data.url, senderId, isMe: true, timestamp: "now", reactions: [] }]);
        
        if (socket) socket.emit('send_message', messageData);
        toast.success("File attached!");
      } else {
        toast.error("Failed to upload attachment.");
      }
    } catch (err) {
      toast.error("Upload network error.");
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = (messageId) => {
    if (socket) socket.emit('delete_message', { roomId, messageId });
  };

  const handlePin = (msg) => {
    if (socket) socket.emit('pin_message', { roomId, message: msg });
    setPinnedMessage(msg);
    setActiveMenu(null);
    toast.success('Message pinned', { style: { background: '#1e1b2e', color: '#fff' } });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied', { style: { background: '#1e1b2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } });
    setActiveMenu(null);
  };

  const toggleReaction = (msgId, emojiStr) => {
    let updatedReactions = [];
    setMessages(msgs => msgs.map(m => {
      if (m.id === msgId) {
        const safeReactions = Array.isArray(m.reactions) ? m.reactions : [];
        const existing = safeReactions.find(r => r.emoji === emojiStr);
        let newReactions = [...safeReactions];
        if (existing) {
          if (existing.reacted) { existing.count -= 1; existing.reacted = false; }
          else { existing.count += 1; existing.reacted = true; }
          newReactions = newReactions.filter(r => r.count > 0);
        } else {
          newReactions.push({ emoji: emojiStr, count: 1, reacted: true });
        }
        updatedReactions = newReactions;
        return { ...m, reactions: newReactions };
      }
      return m;
    }));
    if (socket && roomId) socket.emit('add_reaction', { roomId, messageId: msgId, reactions: updatedReactions });
  };

  const isTyping = Object.keys(typingUsers).length > 0;

  return (
    <div key={roomId} className="flex flex-col h-full bg-[#05060f] text-white relative">
      <Toaster position="top-center" />

      <style>{`
        .chat-custom-scroll::-webkit-scrollbar { width: 5px; }
        .chat-custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-custom-scroll::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 10px; }
        .chat-custom-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.2); }
        .msg-enter { animation: messagePopIn 0.35s cubic-bezier(0.175,0.885,0.32,1.1) forwards; opacity:0; transform-origin:bottom center; }
        @keyframes messagePopIn { 0%{opacity:0;transform:translateY(10px) scale(0.98)} 100%{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>

      {/* USER PROFILE MODAL */}
      {isUserProfileOpen && (
        <UserProfileDrawer
          chatName={chatName}
          currentUser={currentUser}
          roomId={roomId}
          socket={socket}
          onClose={() => setIsUserProfileOpen(false)}
          onMuteToggle={(muted) => setIsChatMuted(muted)}
        />
      )}

      {/* HEADER */}
      <div className="h-[72px] px-6 border-b border-white/5 flex items-center justify-between bg-[#0a0f1e]/80 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4 shrink-0">
          <button onClick={onBack} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 active:scale-90 p-2 rounded-full transition-all">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsUserProfileOpen(true)}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden shadow-lg bg-gradient-to-tr from-[#1e2336] to-[#0a0b1e] border border-white/10 group-hover:scale-105 transition-transform">
              {chatName[0]?.toUpperCase()}
            </div>
            <div className="flex flex-col">
              <h2 className="font-bold text-base text-white leading-tight tracking-wide group-hover:text-[#a19bfe] transition-colors">
                {chatName}
                {isChatMuted && <BellOff size={12} className="inline ml-1.5 text-gray-500" />}
              </h2>
              <p className={`text-[11px] font-medium mt-0.5 transition-colors duration-300 ${isTyping ? 'text-[#3b82f6] animate-pulse' : 'text-[#3b82f6]'}`}>
                {isTyping ? 'typing...' : 'Online'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => toast("Call feature coming soon!", { icon: '📞' })} className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 px-3 py-2 rounded-xl transition-all">
            <Phone size={18} />
          </button>
          <button onClick={() => toast("Video feature coming soon!", { icon: '🎥' })} className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 px-3 py-2 rounded-xl transition-all">
            <VideoIcon size={18} />
          </button>
          <div className="w-px h-6 bg-white/10 mx-1 hidden md:block"></div>
          <button onClick={() => setIsUserProfileOpen(true)} className="flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 w-10 h-10 rounded-xl transition-all">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {pinnedMessage && (
        <div className="bg-[#101426]/95 backdrop-blur-md border-b border-white/5 px-6 py-2.5 flex items-center justify-between z-30 sticky top-[72px] shadow-sm animate-in slide-in-from-top-2 fade-in">
          <div className="flex items-center gap-3 overflow-hidden text-sm">
            <Pin size={16} className="text-[#a19bfe] shrink-0" />
            <div className="flex flex-col truncate border-l-2 border-[#6d28d9] pl-3">
              <span className="text-[#a19bfe] font-bold text-[10px] leading-none mb-1 uppercase tracking-widest">Pinned Message</span>
              <span className="text-gray-200 truncate text-xs">{pinnedMessage.text}</span>
            </div>
          </div>
          <button onClick={() => { setPinnedMessage(null); if (socket) socket.emit('unpin_message', { roomId }); }} className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 chat-custom-scroll relative z-10 flex flex-col">
        {(messages || []).map((msg, index) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="flex justify-center w-full my-4 msg-enter">
                <span className="bg-[#101426]/80 border border-white/5 px-4 py-1.5 rounded-full text-[11px] text-gray-400 font-medium shadow-sm backdrop-blur-sm">{msg.text}</span>
              </div>
            );
          }

          const isMe = msg.isMe;
          const isSequential = index > 0
            && messages[index - 1].senderId === msg.senderId
            && !messages[index - 1].isSystem;

          return (
            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group msg-enter ${isSequential ? 'mt-1' : 'mt-5'}`}>
              <div className="flex max-w-[85%] md:max-w-[70%] gap-3 relative">
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} min-w-[60px]`}>
                  <div className={`px-5 py-3 text-[15px] leading-relaxed relative group/bubble transition-all ${isMe ? 'bg-gradient-to-br from-[#6d28d9] to-[#5b21b6] text-white rounded-2xl rounded-tr-sm shadow-md' : 'bg-[#161b33] text-gray-100 rounded-2xl rounded-tl-sm border border-white/5 shadow-sm'}`}>
                    {msg.replyTo && (
                      <div className={`mb-2.5 pl-3 border-l-[3px] text-[12px] rounded-r-lg py-1.5 cursor-pointer transition-colors ${isMe ? 'border-white/50 bg-black/10 text-white' : 'border-[#a19bfe] bg-black/20 text-gray-300'}`}>
                        <div className="font-bold mb-0.5">{msg.replyTo.senderName === currentUser?.name ? "You" : chatName}</div>
                        <div className="truncate max-w-[200px] opacity-80">{msg.replyTo.text}</div>
                      </div>
                    )}
                    <span className="break-words block">
                      {isImageUrl(msg.text) ? (
                        <img src={msg.text} alt="Chat Attachment" className="max-w-full max-h-64 rounded-xl mt-1 object-cover border border-white/10 shadow-md cursor-pointer hover:opacity-95 transition-opacity" onClick={() => window.open(msg.text, '_blank')} />
                      ) : msg.text?.startsWith('http') ? (
                        <a href={msg.text} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#060813]/60 hover:bg-[#060813]/90 border border-white/5 p-3 rounded-xl mt-1 transition-all text-[#a19bfe] hover:text-white group/file">
                          <div className="w-8 h-8 rounded-lg bg-[#a19bfe]/10 flex items-center justify-center text-[#a19bfe] group-hover/file:bg-[#a19bfe]/20 shrink-0"><FileText size={16} /></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-300 truncate">Shared Document</p>
                            <p className="text-[10px] text-gray-500 truncate">Click to open or download</p>
                          </div>
                        </a>
                      ) : msg.text}
                    </span>

                    {/* HOVER MENU */}
                    <div
                      onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}
                      className={`absolute top-0 ${isMe ? '-left-36' : '-right-36'} ${activeMenu === msg.id ? 'opacity-100 visible' : 'opacity-0 invisible group-hover/bubble:opacity-100 group-hover/bubble:visible'} transition-all flex items-center gap-1 bg-[#101426]/95 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-xl z-40`}
                    >
                      <button onClick={() => toggleReaction(msg.id, '👍')} className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-white/10 rounded-lg transition-colors"><Smile size={16} /></button>
                      <button onClick={() => setReplyingTo({ senderName: isMe ? "You" : chatName, text: msg.text })} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><Reply size={16} /></button>
                      <button onClick={() => handlePin(msg)} className="p-1.5 text-gray-400 hover:text-[#a19bfe] hover:bg-white/10 rounded-lg transition-colors"><Pin size={16} /></button>
                      <div className="relative">
                        <button onClick={e => { e.stopPropagation(); setActiveMenu(activeMenu === msg.id ? null : msg.id); }} className={`p-1.5 rounded-lg transition-colors ${activeMenu === msg.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
                          <MoreVertical size={16} />
                        </button>
                        {activeMenu === msg.id && (
                          <div className={`absolute top-full ${isMe ? 'right-0' : 'left-0'} mt-2 w-36 bg-[#161b33] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95`}>
                            <button onClick={e => { e.stopPropagation(); copyToClipboard(msg.text); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"><Copy size={14} /> Copy</button>
                            {isMe && (<>
                              <button onClick={e => { e.stopPropagation(); setInput(msg.text); setEditingMessage(msg); setActiveMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-[#a19bfe] transition-colors"><Edit2 size={14} /> Edit</button>
                              <div className="h-[1px] bg-white/5 w-full my-1"></div>
                              <button onClick={e => { e.stopPropagation(); handleDelete(msg.id); setActiveMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-400/10 transition-colors"><Trash2 size={14} /> Delete</button>
                            </>)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`flex flex-wrap items-center gap-1.5 mt-1 px-1 w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-gray-500 font-medium">{msg.timestamp}</span>
                    {msg.isEdited && <span className="text-[9px] text-gray-500 italic">edited</span>}
                    {isMe && (
                      <div className="flex items-center opacity-80">
                        {msg.read ? <CheckCheck size={14} className="text-[#3b82f6]" /> : <Check size={14} className="text-gray-500" />}
                      </div>
                    )}
                    {msg.reactions?.length > 0 && (
                      <div className="flex flex-wrap gap-1 ml-2">
                        {msg.reactions.map((r, i) => (
                          <button key={i} onClick={() => toggleReaction(msg.id, r.emoji)} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border transition-all active:scale-90 ${r.reacted ? 'bg-[#6d28d9]/30 border-[#6d28d9]/50 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                            <span>{r.emoji}</span><span>{r.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex items-center gap-2 p-2 w-max rounded-full bg-[#101426]/80 border border-white/5 mb-2 animate-in fade-in slide-in-from-bottom-2">
             <div className="flex gap-1 pl-1">
                <span className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
             </div>
             <span className="text-[10px] font-medium text-gray-400 pr-2">{chatName} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* INPUT AREA */}
      <div className="bg-[#0a0f1e]/90 backdrop-blur-2xl border-t border-white/5 p-4 z-20 relative shrink-0 w-full">
        {(replyingTo || editingMessage) && (
          <div className="max-w-4xl mx-auto w-full mb-3 px-4 py-2.5 bg-[#161b33] border border-white/5 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2 fade-in">
            <div className="flex items-center gap-3 overflow-hidden text-sm">
              {editingMessage ? <Edit2 size={16} className="text-[#a19bfe] shrink-0" /> : <Reply size={16} className="text-[#a19bfe] shrink-0" />}
              <div className="flex flex-col truncate border-l-2 border-[#6d28d9] pl-3">
                <span className="text-[#a19bfe] font-bold text-[11px] leading-none mb-1 uppercase tracking-wider">
                  {editingMessage ? "Editing Message" : `Replying to ${replyingTo.senderName}`}
                </span>
                <span className="text-gray-300 truncate text-[12px]">{editingMessage ? editingMessage.text : replyingTo.text}</span>
              </div>
            </div>
            <button onClick={() => { setReplyingTo(null); setEditingMessage(null); setInput(""); }} className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"><X size={14} /></button>
          </div>
        )}
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-[#101426] rounded-2xl flex items-center px-2 py-1.5 border border-white/5 shadow-inner focus-within:border-[#6d28d9]/50 focus-within:ring-2 focus-within:ring-[#6d28d9]/20 transition-all">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingFile} className="p-2.5 text-gray-500 hover:text-[#a19bfe] transition-colors rounded-xl hover:bg-white/5 disabled:opacity-40">
              {isUploadingFile ? <Loader2 className="animate-spin text-[#a19bfe]" size={20} /> : <ImageIcon size={20} />}
            </button>
            <input
              className="flex-1 bg-transparent outline-none text-white text-[15px] px-2 py-2.5 h-12 placeholder-gray-500 min-w-0"
              placeholder={isUploadingFile ? "Uploading media..." : editingMessage ? "Edit message..." : `Message ${chatName}...`}
              value={input}
              onChange={handleInputChange}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              autoFocus={!!editingMessage}
              disabled={isUploadingFile}
            />
            <div className="flex items-center gap-1 pr-1">
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingFile} className="p-2.5 text-gray-500 hover:text-[#a19bfe] transition-colors rounded-xl hover:bg-white/5 disabled:opacity-40">
                <Paperclip size={20} />
              </button>
              {input.trim() || editingMessage ? (
                <button onClick={handleSend} disabled={isUploadingFile} className="p-2.5 bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] text-white rounded-xl shadow-[0_0_15px_rgba(109,40,217,0.4)] active:scale-95 transition-all animate-in zoom-in duration-200">
                  {editingMessage ? <Check size={18} /> : <ArrowRight size={18} />}
                </button>
              ) : (
                <button type="button" className="p-2.5 text-gray-500 hover:text-[#a19bfe] transition-colors rounded-xl hover:bg-white/5 animate-in zoom-in duration-200">
                  <Mic size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;