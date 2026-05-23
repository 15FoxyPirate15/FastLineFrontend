import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, X, Reply, Smile, CheckCheck, Check, MoreVertical, Edit2, Trash2, Copy, Phone, Video as VideoIcon, Pin, Image as ImageIcon, Paperclip, Mic, BellOff, Settings, MoreHorizontal, Link as LinkIcon, Search, Clock, UserX, FileText, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const isImageUrl = (text) => {
  if (!text || typeof text !== 'string') return false;
  return text.startsWith('http') && (text.match(/\.(jpeg|jpg|gif|png|webp)/i) || text.includes('cloudinary'));
};

const ChatArea = ({ chatName = "User", currentUser, onBack, socket, roomId }) => { 
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('media');
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const messagesEndRef = useRef(null);

  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleGlobalClick = () => { if (activeMenu) setActiveMenu(null); };
    document.addEventListener('mousedown', handleGlobalClick);
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, [activeMenu]);

  // --- 1. POLLING (Синхронізація з базою) ---
  useEffect(() => {
    if (!roomId) return;

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://backendfastline.onrender.com/messages/${roomId}`, { 
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) return;
            
            const history = await res.json();
            
            if (Array.isArray(history)) {
                const formattedMessages = history.filter(Boolean).map(m => {
                    const backendSender = String(m.from || m.senderId || m.userId || m.senderEmail || m.sender || "unknown");
                    const myId = String(currentUser?.id || currentUser?.uid || "unknown");
                    const myEmail = String(currentUser?.email || "unknown");
                    
                    const isMyMessage = (backendSender !== "undefined" && backendSender !== "unknown" && backendSender !== "null") && 
                                        (backendSender === myId || backendSender === myEmail);
                    
                    let timeString = "now";
                    if (m.createdAt) {
                         const dateObj = m.createdAt._seconds ? new Date(m.createdAt._seconds * 1000) : new Date(m.createdAt);
                         timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }
                    
                    return {
                        id: m.id || Math.random().toString(), 
                        text: m.text || m.message || m.content || m.body || "Empty",
                        senderId: backendSender, 
                        isMe: isMyMessage, 
                        timestamp: timeString,
                        read: m.read || false, 
                        replyTo: m.replyTo || null, 
                        reactions: Array.isArray(m.reactions) ? m.reactions : [], 
                        isEdited: m.isEdited || false,
                        isSystem: m.type === 'system' || m.isSystem
                    }
                });

                // Розумне оновлення стейту, щоб уникнути блимання
                setMessages(prev => {
                    if (prev.length !== formattedMessages.length) return formattedMessages;
                    const lastPrev = prev[prev.length - 1];
                    const lastNew = formattedMessages[formattedMessages.length - 1];
                    if (lastPrev && lastNew && (lastPrev.text !== lastNew.text || lastPrev.id !== lastNew.id)) {
                        return formattedMessages;
                    }
                    return prev;
                });
            }
        } catch (err) {
            console.error("Polling error:", err);
        }
    };

    fetchHistory();
    const pollingInterval = setInterval(fetchHistory, 3000);
    return () => clearInterval(pollingInterval);
  }, [roomId, currentUser]);

  // --- 2. SOCKET (Реалтайм) ---
  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit('join_room', { roomId: roomId });
    
    const handleNewMessage = (backendMessage) => {
      if (backendMessage.roomId !== roomId) return;
      
      setMessages(prev => {
        // Якщо бекенд надіслав повідомлення з ID, і ми його вже маємо - ігноруємо
        const msgId = backendMessage.id || backendMessage._id;
        if (msgId && prev.some(m => m.id === msgId)) return prev;

        // Жорстка перевірка автора, щоб не було багу "всі повідомлення мої"
        const backendSender = String(backendMessage.senderId || backendMessage.from || backendMessage.userId || "unknown");
        const myId = String(currentUser?.id || currentUser?.uid || "unknown");
        const myEmail = String(currentUser?.email || "unknown");
        
        const isMe = (backendSender !== "undefined" && backendSender !== "unknown" && backendSender !== "null") && 
                     (backendSender === myId || backendSender === myEmail);
        
        // Дедуплікація: Якщо це моє повідомлення і воно вже є на екрані (tempMsg) - ігноруємо копію з сокету
        if (isMe && prev.some(m => m.isMe && m.text === backendMessage.text)) {
            return prev;
        }

        const safeId = msgId || Math.random().toString();
        let timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return [...prev, { ...backendMessage, id: safeId, isMe, read: false, timestamp: timeString }];
      });
    };

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [socket, roomId, currentUser]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !roomId) return;
    
    if (editingMessage) {
        if(socket) socket.emit('edit_message', { roomId, messageId: editingMessage.id, newText: input });
        setEditingMessage(null);
        setInput("");
        return;
    }

    const textToSend = input;
    setInput(""); 
    setReplyingTo(null);

    const senderId = currentUser?.id || currentUser?.uid || currentUser?.email || "unknown";
    const senderName = currentUser?.name || currentUser?.email?.split('@')[0] || "User";
    
    const messageData = { 
        roomId: roomId, 
        text: textToSend, 
        senderId: senderId,
        senderName: senderName, 
        replyTo: replyingTo ? { senderName: replyingTo.senderName || chatName, text: replyingTo.text } : null 
    };

    // Одразу малюємо локально
    const tempMsg = {
        id: `temp_${Date.now()}`,
        text: textToSend,
        senderId: senderId,
        isMe: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, tempMsg]);

    if (socket) socket.emit('send_message', messageData);

    try {
        const token = localStorage.getItem('token');
        await fetch(`https://backendfastline.onrender.com/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(messageData)
        });
    } catch (err) {
        console.error("Failed to POST message", err);
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
          const response = await fetch('https://backendfastline.onrender.com/storage/upload', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
              body: formData
          });

          if (response.ok) {
              const data = await response.json();
              const senderId = currentUser?.id || currentUser?.uid || currentUser?.email || "unknown";
              
              const messageData = { 
                  roomId: roomId, 
                  text: data.url, 
                  senderId: senderId,
                  senderName: currentUser?.name || currentUser?.email?.split('@')[0]
              };
              
              setMessages(prev => [...prev, { id: `temp_${Date.now()}`, text: data.url, senderId, isMe: true, timestamp: "now" }]);

              if(socket) socket.emit('send_message', messageData);

              await fetch(`https://backendfastline.onrender.com/messages`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify(messageData)
              });

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

  const handleDelete = (messageId) => { if(socket) socket.emit('delete_message', { roomId, messageId }); };
  const handlePin = (msg) => {
      if (socket) socket.emit('pin_message', { roomId, message: msg });
      setPinnedMessage(msg);
      setActiveMenu(null);
      toast.success('Message pinned', { style: { background: '#1e1b2e', color: '#fff' }});
  };

  const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      toast.success('Copied', { style: { background: '#1e1b2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
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
            } else { newReactions.push({ emoji: emojiStr, count: 1, reacted: true }); }
            
            updatedReactions = newReactions;
            return { ...m, reactions: newReactions };
        }
        return m;
    }));
    if (socket && roomId) socket.emit('add_reaction', { roomId, messageId: msgId, reactions: updatedReactions });
  };

  const mockMedia = [1,2,3,4,5,6];
  const mockFiles = [
      { name: "Project_Requirements_v2.pdf", size: "2.4 MB", type: "pdf" },
      { name: "Database_Schema.sql", size: "12 KB", type: "code" }
  ];

  return (
    <div key={roomId} className="flex flex-col h-full bg-[#05060f] text-white relative">
      <Toaster position="top-center" />
      
      <style>{`
          .chat-custom-scroll::-webkit-scrollbar { width: 5px; }
          .chat-custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .chat-custom-scroll::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 10px; }
          .chat-custom-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.2); }
          .msg-enter { animation: messagePopIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.1) forwards; opacity: 0; transform-origin: bottom center; }
          @keyframes messagePopIn { 0% { opacity: 0; transform: translateY(10px) scale(0.98); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
          .custom-file-input::-webkit-file-upload-button { display: none; }
      `}</style>

      {/* --- USER PROFILE MODAL --- */}
      {isUserProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsUserProfileOpen(false)}></div>
            <div className="bg-[#101426] border border-white/10 rounded-[2rem] w-full max-w-md shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                
                <div className="relative h-48 bg-gradient-to-br from-[#6d28d9]/80 to-[#3b82f6]/80 flex flex-col justify-end p-6 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <button onClick={() => setIsUserProfileOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-md transition-colors z-10"><X size={20} /></button>
                    
                    <div className="relative z-10 flex gap-4 items-end">
                        <div className="w-20 h-20 rounded-full border-4 border-[#101426] bg-[#1e2336] flex items-center justify-center text-3xl font-black shadow-xl shrink-0">
                            {chatName[0]?.toUpperCase()}
                        </div>
                        <div className="mb-1">
                            <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">{chatName}</h2>
                            <p className="text-sm text-white/80 font-medium">last seen recently</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-around items-center p-4 border-b border-white/5 bg-[#161b33]">
                    <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#6d28d9] transition-colors"><Search size={18} className="text-[#a19bfe] group-hover:text-white" /></div>
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300 uppercase">Search</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#3b82f6] transition-colors"><BellOff size={18} className="text-[#a19bfe] group-hover:text-white" /></div>
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300 uppercase">Mute</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#ec4899] transition-colors"><Clock size={18} className="text-[#a19bfe] group-hover:text-white" /></div>
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300 uppercase">Timer</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-500 transition-colors"><MoreHorizontal size={18} className="text-[#a19bfe] group-hover:text-white" /></div>
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300 uppercase">More</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <div className="p-6 border-b border-white/5 space-y-4">
                        <div>
                            <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Username</div>
                            <div className="text-sm font-medium text-white">@{chatName.toLowerCase().replace(/\s/g, '_')}</div>
                        </div>
                        <div>
                            <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Bio</div>
                            <div className="text-sm text-gray-300">Software Engineer. Tech enthusiast. FastLine user. ⚡💻</div>
                        </div>
                    </div>

                    <div className="flex px-6 border-b border-white/5 sticky top-0 bg-[#101426] z-10 pt-2">
                        <button onClick={() => setActiveTab('media')} className={`pb-3 text-sm font-bold transition-all px-4 ${activeTab === 'media' ? 'text-[#a19bfe] border-b-2 border-[#6d28d9]' : 'text-gray-500 hover:text-gray-300'}`}>Media</button>
                        <button onClick={() => setActiveTab('files')} className={`pb-3 text-sm font-bold transition-all px-4 ${activeTab === 'files' ? 'text-[#a19bfe] border-b-2 border-[#6d28d9]' : 'text-gray-500 hover:text-gray-300'}`}>Files</button>
                    </div>

                    <div className="p-4 flex-1">
                        {activeTab === 'media' && (
                            <div className="grid grid-cols-3 gap-2">
                                {mockMedia.map(i => (
                                    <div key={i} className="aspect-square bg-gradient-to-br from-[#161b33] to-[#1e2336] rounded-xl flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity border border-white/5">
                                        <ImageIcon size={24} className="text-white/20" />
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'files' && (
                            <div className="space-y-2">
                                {mockFiles.map((file, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                                            <FileText size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-200 truncate">{file.name}</div>
                                            <div className="text-[11px] text-gray-500">{file.size}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- HEADER ЧАТУ --- */}
      <div className="h-[72px] px-6 border-b border-white/5 flex items-center justify-between bg-[#0a0f1e]/80 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4 shrink-0">
            <button onClick={onBack} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 active:scale-90 p-2 rounded-full transition-all"><ArrowLeft size={18} /></button>
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsUserProfileOpen(true)}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden shadow-lg bg-gradient-to-tr from-[#1e2336] to-[#0a0b1e] border border-white/10 group-hover:scale-105 transition-transform">
                    {chatName[0]?.toUpperCase()}
                </div>
                <div className="flex flex-col">
                    <h2 className="font-bold text-base text-white leading-tight tracking-wide group-hover:text-[#a19bfe] transition-colors">{chatName}</h2>
                    <p className="text-[11px] text-[#3b82f6] font-medium mt-0.5">Online</p>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => toast("Call feature coming soon!", {icon: '📞'})} className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 px-3 py-2 rounded-xl transition-all"><Phone size={18} /></button>
            <button onClick={() => toast("Video feature coming soon!", {icon: '🎥'})} className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 px-3 py-2 rounded-xl transition-all"><VideoIcon size={18} /></button>
            <div className="w-px h-6 bg-white/10 mx-1 hidden md:block"></div>
            <button onClick={() => setIsUserProfileOpen(true)} className="flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 w-10 h-10 rounded-xl transition-all"><MoreVertical size={18} /></button>
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
            <button onClick={() => { setPinnedMessage(null); if (socket) socket.emit('unpin_message', { roomId }); }} className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"><X size={14}/></button>
        </div>
      )}

      {/* --- MESSAGES AREA --- */}
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
           const isSequential = index > 0 && messages[index - 1].senderId === msg.senderId && !messages[index - 1].isSystem;

           return (
             <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group msg-enter ${isSequential ? 'mt-1' : 'mt-5'}`}>
                <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 relative`}>
                    
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
                                    <img 
                                      src={msg.text} 
                                      alt="Chat Attachment" 
                                      className="max-w-full max-h-64 rounded-xl mt-1 object-cover border border-white/10 shadow-md cursor-pointer hover:opacity-95 transition-opacity"
                                      onClick={() => window.open(msg.text, '_blank')} 
                                    />
                                ) : msg.text?.startsWith('http') ? (
                                    <a href={msg.text} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#060813]/60 hover:bg-[#060813]/90 border border-white/5 p-3 rounded-xl mt-1 transition-all text-[#a19bfe] hover:text-white group/file">
                                        <div className="w-8 h-8 rounded-lg bg-[#a19bfe]/10 flex items-center justify-center text-[#a19bfe] group-hover/file:bg-[#a19bfe]/20 shrink-0"><FileText size={16}/></div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-gray-300 truncate">Shared Document</p>
                                            <p className="text-[10px] text-gray-500 truncate">Click to open or download</p>
                                        </div>
                                    </a>
                                ) : (
                                    msg.text
                                )}
                            </span>
                            
                            {/* HOVER MENU */}
                            <div 
                                onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}
                                className={`absolute top-0 ${isMe ? '-left-36' : '-right-36'} ${activeMenu === msg.id ? 'opacity-100 visible' : 'opacity-0 invisible group-hover/bubble:opacity-100 group-hover/bubble:visible'} transition-all flex items-center gap-1 bg-[#101426]/95 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-xl z-40`}
                            >
                                <button onClick={() => toggleReaction(msg.id, '👍')} className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-white/10 rounded-lg transition-colors"><Smile size={16}/></button>
                                <button onClick={() => setReplyingTo({ senderName: isMe ? "You" : chatName, text: msg.text })} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><Reply size={16}/></button>
                                <button onClick={() => handlePin(msg)} className="p-1.5 text-gray-400 hover:text-[#a19bfe] hover:bg-white/10 rounded-lg transition-colors"><Pin size={16}/></button>
                                <div className="relative">
                                    <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === msg.id ? null : msg.id); }} className={`p-1.5 rounded-lg transition-colors ${activeMenu === msg.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
                                        <MoreVertical size={16}/>
                                    </button>
                                    {activeMenu === msg.id && (
                                        <div className={`absolute top-full ${isMe ? 'right-0' : 'left-0'} mt-2 w-36 bg-[#161b33] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95`}>
                                            <button onClick={(e) => { e.stopPropagation(); copyToClipboard(msg.text); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"><Copy size={14}/> Copy</button>
                                            {isMe && (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); setInput(msg.text); setEditingMessage(msg); setActiveMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-[#a19bfe] transition-colors"><Edit2 size={14}/> Edit</button>
                                                    <div className="h-[1px] bg-white/5 w-full my-1"></div>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); setActiveMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-400/10 transition-colors"><Trash2 size={14}/> Delete</button>
                                                </>
                                            )}
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
                                <div className={`flex flex-wrap gap-1 ml-2`}>
                                    {msg.reactions.map((r, i) => (
                                        <button key={i} onClick={() => toggleReaction(msg.id, r.emoji)} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border transition-all active:scale-90 ${r.reacted ? 'bg-[#6d28d9]/30 border-[#6d28d9]/50 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}><span>{r.emoji}</span> <span>{r.count}</span></button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
             </div>
           );
        })}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* --- INPUT AREA --- */}
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
                <button onClick={() => { setReplyingTo(null); setEditingMessage(null); setInput(""); }} className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"><X size={14}/></button>
            </div>
        )}

        <div className="max-w-4xl mx-auto w-full">
            <div className="bg-[#101426] rounded-2xl flex items-center px-2 py-1.5 border border-white/5 shadow-inner focus-within:border-[#6d28d9]/50 focus-within:ring-2 focus-within:ring-[#6d28d9]/20 transition-all">
                
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden custom-file-input" />
                
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isUploadingFile}
                  className="p-2.5 text-gray-500 hover:text-[#a19bfe] transition-colors rounded-xl hover:bg-white/5 disabled:opacity-40"
                >
                    {isUploadingFile ? <Loader2 className="animate-spin text-[#a19bfe]" size={20} /> : <ImageIcon size={20} />}
                </button>

                <input 
                    className="flex-1 bg-transparent outline-none text-white text-[15px] px-2 py-2.5 h-12 placeholder-gray-500 min-w-0" 
                    placeholder={isUploadingFile ? "Uploading media..." : editingMessage ? "Edit message..." : `Message ${chatName}...`} 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    autoFocus={!!editingMessage}
                    disabled={isUploadingFile}
                />
                
                <div className="flex items-center gap-1 pr-1">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={isUploadingFile}
                      className="p-2.5 text-gray-500 hover:text-[#a19bfe] transition-colors rounded-xl hover:bg-white/5 disabled:opacity-40"
                    >
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