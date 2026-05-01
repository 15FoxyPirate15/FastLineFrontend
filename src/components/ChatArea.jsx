import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, Phone, Video, MoreHorizontal, 
  Image as ImageIcon, Mic, Paperclip, ArrowLeft, ArrowRight, X,
  Reply, Smile, CheckCheck, Check, Users, MessageSquare, 
  MoreVertical, Edit2, Trash2, Copy
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ChatArea = ({ chatName, isAi, currentUser, onBack, socket, roomId }) => { 
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatPartner, setChatPartner] = useState(null);
  const messagesEndRef = useRef(null);

  // ДОДАНО: Глобальний слухач кліків для закриття меню
  useEffect(() => {
    const handleGlobalClick = () => {
      if (activeMenu) setActiveMenu(null);
    };
    // Використовуємо mousedown, щоб реагувати швидше і точніше
    document.addEventListener('mousedown', handleGlobalClick);
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, [activeMenu]);

  useEffect(() => {
    if (!roomId) return;
    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://backendfastline.onrender.com/messages/${roomId}`, { headers: { 'Authorization': `Bearer ${token}` }});
            if (!res.ok) return;
            const history = await res.json();
            if (Array.isArray(history)) {
                const formattedMessages = history.filter(Boolean).map(m => {
                    const backendSender = String(m.from || m.senderId || m.userId || m.senderEmail || m.sender);
                    const myId = String(currentUser?.id);
                    const myEmail = String(currentUser?.email);
                    const isMyMessage = (backendSender === myId || backendSender === myEmail);
                    let timeString = "now";
                    if (m.createdAt) {
                         const dateObj = m.createdAt._seconds ? new Date(m.createdAt._seconds * 1000) : new Date(m.createdAt);
                         timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }
                    return {
                        id: m.id || Math.random().toString(),
                        text: m.text || m.message || m.content || m.body || "Empty",
                        senderId: isMyMessage ? 'me' : 'them',
                        timestamp: timeString,
                        read: m.read || false,
                        replyTo: m.replyTo || null,
                        reactions: m.reactions || [],
                        isEdited: m.isEdited || false
                    }
                });
                setMessages(formattedMessages);
            }
        } catch (err) { console.error("History fetch error:", err); }
    };
    fetchHistory();
  }, [roomId, currentUser]);

  useEffect(() => {
    if (!roomId || isAi) return;
    const fetchParticipants = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://backendfastline.onrender.com/chats/${roomId}/participants`, { headers: { 'Authorization': `Bearer ${token}` }});
            if (res.ok) {
                const participants = await res.json();
                const partner = participants.find(p => p.email !== currentUser?.email && p.id !== currentUser?.id);
                if (partner) setChatPartner(partner);
            }
        } catch (err) { console.error("Participants fetch error:", err); }
    };
    fetchParticipants();
  }, [roomId, currentUser, isAi]);

  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit('join_room', { roomId: roomId });

    const handleNewMessage = (backendMessage) => {
        if (!backendMessage) return; 
        const backendSender = String(backendMessage.from || backendMessage.senderId || backendMessage.userId || backendMessage.senderEmail || backendMessage.sender);
        const myId = String(currentUser?.id);
        const myEmail = String(currentUser?.email);
        const isMyMessage = (backendSender === myId || backendSender === myEmail);
        const uiMessage = {
            id: backendMessage.id || Date.now().toString(),
            text: backendMessage.text || backendMessage.message || backendMessage.content || "Empty",
            senderId: isMyMessage ? 'me' : 'them',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false,
            replyTo: backendMessage.replyTo || null,
            reactions: backendMessage.reactions || [],
            isEdited: false
        };
        setMessages(prev => [...prev, uiMessage]);
    };

    const handleReaction = ({ messageId, reactions }) => {
        setMessages(msgs => msgs.map(m => m.id === messageId ? { ...m, reactions: reactions } : m));
    };

    const handleMessageEdited = ({ messageId, newText, isEdited }) => {
        setMessages(msgs => msgs.map(m => m.id === messageId ? { ...m, text: newText, isEdited } : m));
    };

    const handleMessageDeleted = ({ messageId }) => {
        setMessages(msgs => msgs.filter(m => m.id !== messageId));
    };

    socket.on('new_message', handleNewMessage);
    socket.on('reaction_added', handleReaction);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);

    return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('reaction_added', handleReaction);
        socket.off('message_edited', handleMessageEdited);
        socket.off('message_deleted', handleMessageDeleted);
    };
  }, [socket, roomId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || !socket || !roomId) return;
    
    if (editingMessage) {
        socket.emit('edit_message', { roomId, messageId: editingMessage.id, newText: input });
        setEditingMessage(null);
        setInput("");
        toast.success('Edited', { style: { background: '#1e1b2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
        return;
    }

    const messageData = { 
        roomId: roomId, 
        text: input,
        replyTo: replyingTo ? { senderName: replyingTo.senderName, text: replyingTo.text } : null 
    };

    socket.emit('send_message', messageData);
    setInput("");
    setReplyingTo(null);
  };

  const handleDelete = (messageId) => {
      socket.emit('delete_message', { roomId, messageId });
      toast.success('Message deleted', { icon: '🗑️', style: { background: '#1e1b2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
  };

  const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      toast.success('Copied', { style: { background: '#1e1b2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
      setActiveMenu(null);
  }

  const toggleReaction = (msgId, emojiStr) => {
    let updatedReactions = [];
    setMessages(msgs => msgs.map(m => {
        if (m.id === msgId) {
            const existing = m.reactions?.find(r => r.emoji === emojiStr);
            let newReactions = m.reactions ? [...m.reactions] : [];
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

  const displayChatName = isAi ? "AI Assistant" : (chatPartner?.displayName || chatPartner?.name || chatName || chatPartner?.email?.split('@')[0] || "User");

  return (
    <div key={roomId} className="flex flex-col h-full bg-gradient-to-r from-[#2a245e] to-[#12162b] text-white relative animate-in fade-in slide-in-from-right-8 duration-500 ease-out">
      <Toaster position="top-center" />

      <style>
        {`
          .chat-custom-scroll::-webkit-scrollbar { width: 5px; }
          .chat-custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .chat-custom-scroll::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 10px; }
          .chat-custom-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.2); }
        `}
      </style>

      {/* HEADER */}
      <div className="h-[72px] px-6 border-b border-white/5 flex items-center justify-between bg-[#131933]/80 backdrop-blur-xl sticky top-0 z-40 shadow-[0_4_30px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-3 shrink-0">
            <button onClick={onBack} className="text-[#a19bfe] hover:text-white bg-white/5 hover:bg-white/10 active:scale-90 p-2 rounded-full transition-all border border-transparent hover:border-white/10">
                <ArrowLeft size={18} />
            </button>
            <div className="relative"> 
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border border-white/10 ${isAi ? 'bg-gradient-to-br from-purple-600 to-indigo-600' : 'bg-[#2a2a3d]'}`}>
                    {isAi ? <Bot size={22}/> : (
                         chatPartner?.avatarUrl && chatPartner.avatarUrl !== 'none' ? 
                         <img src={chatPartner.avatarUrl} alt="User" className="w-full h-full object-cover"/> :
                         <span className="font-bold text-lg">{displayChatName[0]?.toUpperCase()}</span>
                    )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-[2.5px] border-[#131933]"></div>
            </div>
            <div className="flex flex-col ml-1">
                <h2 className="font-bold text-base text-white leading-tight tracking-wide">{displayChatName}</h2>
                <p className="text-[11px] text-[#a19bfe] font-medium">{isAi ? "AI Assistant" : "Online"}</p>
            </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
            <button className="hidden md:flex items-center gap-2 bg-gradient-to-r from-[#6d28d9] to-[#5b21b6] hover:opacity-90 active:scale-95 text-white px-4 py-2 rounded-xl transition-all text-xs font-bold border border-white/10 shadow-[0_0_15px_rgba(109,40,217,0.3)]"><Phone size={14} /><span>Call</span></button>
            <button className="hidden md:flex items-center gap-2 bg-[#1e1b2e] hover:bg-white/10 active:scale-95 text-white px-4 py-2 rounded-xl transition-all text-xs font-bold border border-white/10"><Video size={14} /><span>Video</span></button>
            <button className="p-2 text-gray-300 hover:text-white bg-[#1e1b2e] hover:bg-white/10 border border-white/10 active:scale-95 transition-all rounded-xl"><MoreHorizontal size={18} /></button>
        </div>
      </div>

      {/* MESSAGES LIST */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 chat-custom-scroll relative z-10">
        
        {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-in fade-in duration-700">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8b5cf6]/10 to-[#3b82f6]/10 flex items-center justify-center mb-5 border border-white/5 shadow-[0_0_40px_rgba(139,92,246,0.15)] relative">
                    <MessageSquare size={40} className="text-[#a19bfe]/60" />
                    <div className="absolute top-2 right-2 w-3 h-3 bg-[#6d28d9] rounded-full animate-ping"></div>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">It's quiet here...</h3>
                <p className="text-gray-400 text-sm max-w-[250px] leading-relaxed">Send a message to start chatting with <span className="text-[#a19bfe] font-medium">{displayChatName}</span></p>
            </div>
        )}

        {(messages || []).map((msg) => {
           const isMe = msg.senderId === 'me';
           return (
             <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} relative`}>
                    <div className="flex-shrink-0 mt-auto mb-1"> 
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md border border-white/10 overflow-hidden ${isMe ? 'bg-gradient-to-tr from-blue-500 to-[#6d28d9]' : (isAi ? 'bg-purple-600' : 'bg-[#2a2a3d]')}`}>
                             {isMe ? (currentUser?.name?.[0]?.toUpperCase() || 'U') : (isAi ? <Bot size={16}/> : 
                                (chatPartner?.avatarUrl && chatPartner.avatarUrl !== 'none' ? 
                                <img src={chatPartner.avatarUrl} alt="Them" className="w-full h-full object-cover"/> :
                                <span>{displayChatName[0]?.toUpperCase()}</span>)
                             )}
                        </div>
                    </div>

                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1 min-w-[120px]`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm relative group/bubble transition-all ${isMe ? 'bg-gradient-to-br from-[#6d28d9] to-[#5b21b6] text-white rounded-br-sm border border-white/10 shadow-[0_2px_15px_rgba(109,40,217,0.2)]' : 'bg-[#1e1b2e]/90 backdrop-blur-md text-gray-100 rounded-bl-sm border border-white/5 shadow-lg'}`}>
                            
                            {msg.replyTo && (
                                <div className={`mb-2.5 pl-3 border-l-[3px] text-[11px] rounded-r-lg p-2 cursor-pointer transition-colors ${isMe ? 'border-white/40 bg-black/20 hover:bg-black/30' : 'border-[#a19bfe] bg-black/20 hover:bg-black/30'}`}>
                                    <div className="font-bold text-white mb-0.5">{msg.replyTo.senderName}</div>
                                    <div className="truncate max-w-[200px] text-white/80">{msg.replyTo.text}</div>
                                </div>
                            )}
                            
                            <span className="break-words">{msg.text}</span>
                            
                            {/* ДОДАНО: onMouseDown та onClick stopPropagation для блоку з кнопками */}
                            <div 
                                onMouseDown={(e) => e.stopPropagation()} 
                                onClick={(e) => e.stopPropagation()}
                                className={`absolute top-0 ${isMe ? '-left-28' : '-right-28'} ${activeMenu === msg.id ? 'opacity-100' : 'opacity-0 group-hover/bubble:opacity-100'} transition-opacity flex items-center gap-1 bg-[#131933]/95 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-2xl z-40`}
                            >
                                <button onClick={() => toggleReaction(msg.id, '👍')} className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-white/10 rounded-lg transition-colors"><Smile size={14}/></button>
                                <button onClick={() => setReplyingTo({ senderName: isMe ? "You" : displayChatName, text: msg.text })} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><Reply size={14}/></button>
                                <div className="relative">
                                    <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === msg.id ? null : msg.id); }} className={`p-1.5 rounded-lg transition-colors ${activeMenu === msg.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
                                        <MoreVertical size={14}/>
                                    </button>
                                    
                                    {activeMenu === msg.id && (
                                        <div className={`absolute top-full ${isMe ? 'right-0' : 'left-0'} mt-2 w-36 bg-[#1e1b2e] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] py-1.5 z-50 animate-in fade-in zoom-in-95`}>
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

                        <div className={`flex flex-wrap items-center gap-2 mt-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className="text-[10px] text-gray-500 font-medium">{msg.timestamp}</span>
                            {msg.isEdited && <span className="text-[9px] text-gray-500 italic">edited</span>}
                            {isMe && (
                                <div className="flex items-center mr-1">
                                    {msg.read ? <CheckCheck size={14} className="text-[#a19bfe]" /> : <Check size={14} className="text-gray-500" />}
                                </div>
                            )}
                            {msg.reactions?.length > 0 && (
                                <div className={`flex flex-wrap gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    {msg.reactions.map((r, i) => (
                                        <button key={i} onClick={() => toggleReaction(msg.id, r.emoji)} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border transition-all active:scale-90 ${r.reacted ? 'bg-[#6d28d9]/30 border-[#6d28d9]/50 text-white shadow-[0_0_10px_rgba(109,40,217,0.2)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}><span>{r.emoji}</span> <span>{r.count}</span></button>
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

      {/* INPUT AREA */}
      <div className="bg-[#131933]/90 backdrop-blur-2xl border-t border-white/5 flex flex-col z-20 relative p-4 pt-3">
        
        {/* Reply/Edit Indicators */}
        {(replyingTo || editingMessage) && (
            <div className="max-w-5xl mx-auto w-full mb-3 px-4 py-2.5 bg-[#1e1b2e]/80 border border-white/10 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2 fade-in">
                <div className="flex items-center gap-3 overflow-hidden text-sm">
                    {editingMessage ? <Edit2 size={16} className="text-[#a19bfe] shrink-0" /> : <Reply size={16} className="text-[#a19bfe] shrink-0" />}
                    <div className="flex flex-col truncate">
                        <span className="text-[#a19bfe] font-bold text-[11px] leading-none mb-1 uppercase tracking-wider">
                            {editingMessage ? "Editing" : `Replying to ${replyingTo.senderName}`}
                        </span>
                        <span className="text-gray-300 truncate text-[12px]">{editingMessage ? editingMessage.text : replyingTo.text}</span>
                    </div>
                </div>
                <button onClick={() => { setReplyingTo(null); setEditingMessage(null); setInput(""); }} className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors bg-white/5"><X size={14}/></button>
            </div>
        )}

        <div className="max-w-5xl mx-auto w-full">
            <div className="bg-[#1e1b2e] rounded-2xl p-1.5 flex items-center gap-2 border border-white/10 shadow-inner focus-within:ring-2 focus-within:ring-[#6d28d9]/50 focus-within:border-[#6d28d9]/50 focus-within:bg-[#1e1b2e]/90 transition-all duration-300">
                <button className="p-2.5 text-gray-400 hover:text-[#a19bfe] hover:bg-[#8b5cf6]/10 active:scale-90 rounded-xl transition-all"><ImageIcon size={20} /></button>
                <input 
                    className="flex-1 bg-transparent outline-none text-white text-sm px-3 py-2 placeholder-gray-500 font-medium h-10" 
                    placeholder={editingMessage ? "Edit message..." : `Message ${displayChatName}...`} 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    autoFocus={!!editingMessage}
                />
                <div className="flex items-center gap-1.5 pr-1">
                    {input.trim() ? (
                        <button onClick={handleSend} className="p-2.5 bg-gradient-to-br from-[#6d28d9] to-[#5b21b6] text-white rounded-xl hover:opacity-90 active:scale-90 transition-all shadow-[0_0_15px_rgba(109,40,217,0.4)]">
                            {editingMessage ? <Check size={20} /> : <ArrowRight size={20} />}
                        </button>
                    ) : (
                        <>
                            <button className="p-2.5 text-gray-400 hover:text-[#a19bfe] hover:bg-[#8b5cf6]/10 active:scale-90 rounded-xl transition-all"><Paperclip size={20} /></button>
                            <button className="p-2.5 text-gray-400 hover:text-[#a19bfe] hover:bg-[#8b5cf6]/10 active:scale-90 rounded-xl transition-all"><Mic size={20} /></button>
                        </>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;