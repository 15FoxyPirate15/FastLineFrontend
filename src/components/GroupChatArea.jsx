import React, { useState, useEffect, useRef } from 'react';
import { Users, ArrowLeft, ArrowRight, X, Reply, Smile, CheckCheck, Check, MoreVertical, Edit2, Trash2, Copy, Hash, Phone, Video, Pin } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import ManageMembersModal from './ManageMembersModal';

const GroupChatArea = ({ groupName = "Group Chat", currentUser, onBack, socket, roomId }) => { 
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState(null); // Стан для закріпленого повідомлення
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleGlobalClick = () => { if (activeMenu) setActiveMenu(null); };
    document.addEventListener('mousedown', handleGlobalClick);
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, [activeMenu]);

  const fetchParticipants = async () => {
    if (!roomId) return;
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://backendfastline.onrender.com/chats/${roomId}/participants`, { headers: { 'Authorization': `Bearer ${token}` }});
        if (res.ok) {
            const data = await res.json();
            setParticipants(Array.isArray(data) ? data : []);
        }
    } catch (err) { console.error("Participants fetch error:", err); }
  };

  useEffect(() => { fetchParticipants(); }, [roomId]);

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
                        id: m.id || Math.random().toString(), text: m.text || m.message || m.content || m.body || "Empty",
                        senderId: backendSender, isMe: isMyMessage, senderName: m.senderName || backendSender, timestamp: timeString,
                        read: m.read || false, replyTo: m.replyTo || null, reactions: Array.isArray(m.reactions) ? m.reactions : [], isEdited: m.isEdited || false,
                        isSystem: m.type === 'system' || m.isSystem // Перевірка на системне повідомлення
                    }
                });
                setMessages(formattedMessages);
            }
            
            // Якщо бекенд повертає інфу про закріплене повідомлення в історії (опціонально)
            // const chatInfoRes = await fetch(`/chats/${roomId}`);
            // ... setPinnedMessage(chatInfo.pinnedMessage)
        } catch (err) {}
    };
    fetchHistory();
  }, [roomId, currentUser]);

useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit('join_room', { roomId: roomId });
    
    const handleNewMessage = (backendMessage)
    const handleReaction = ({ messageId, reactions })
    const handleMessageEdited = ({ messageId, newText, isEdited })
    const handleMessageDeleted = ({ messageId })
    const handleMessagePinned = (msg) => setPinnedMessage(msg);
    const handleMessageUnpinned = () => setPinnedMessage(null);

    const handleMessagesRead = ({ roomId: eventRoomId, userId }) => {
        if (String(userId) !== String(currentUser?.id) && String(userId) !== String(currentUser?.email)) {
            setMessages(prevMessages => prevMessages.map(msg => 
                msg.isMe ? { ...msg, read: true } : msg
            ));
        }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('reaction_added', handleReaction);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('message_pinned', handleMessagePinned);
    socket.on('message_unpinned', handleMessageUnpinned);
    
    socket.on('messages_read', handleMessagesRead);

    return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('reaction_added', handleReaction);
        socket.off('message_edited', handleMessageEdited);
        socket.off('message_deleted', handleMessageDeleted);
        socket.off('message_pinned', handleMessagePinned);
        socket.off('message_unpinned', handleMessageUnpinned);
        
        // 3. ВИМИКАЄМО СЛУХАЧА ПРИ ВИХОДІ
        socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, roomId, currentUser]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socket || !roomId) return;
    
    if (editingMessage) {
        socket.emit('edit_message', { roomId, messageId: editingMessage.id, newText: input });
        setEditingMessage(null);
        setInput("");
        return;
    }

    const messageData = { roomId: roomId, text: input, senderName: currentUser?.name || currentUser?.email?.split('@')[0], replyTo: replyingTo ? { senderName: replyingTo.senderName, text: replyingTo.text } : null };
    socket.emit('send_message', messageData);
    setInput(""); setReplyingTo(null);
  };

  const handleDelete = (messageId) => { socket.emit('delete_message', { roomId, messageId }); };
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
  }

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

  const getParticipantData = (senderId, fallbackName) => {
      const p = participants.find(part => String(part.id) === String(senderId) || String(part.email) === String(senderId));
      if (p) return { name: p.displayName || p.name || p.email?.split('@')[0], avatar: p.avatarUrl !== 'none' ? p.avatarUrl : null };
      return { name: fallbackName?.split('@')[0] || "Member", avatar: null };
  };

  return (
    <div key={roomId} className="flex flex-col h-full bg-gradient-to-r from-[#2a245e] to-[#12162b] text-white relative">
      <Toaster position="top-center" />
      
      <style>
        {`
          .chat-custom-scroll::-webkit-scrollbar { width: 5px; }
          .chat-custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .chat-custom-scroll::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 10px; }
          .chat-custom-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.2); }
          .msg-enter { animation: messagePopIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.1) forwards; opacity: 0; transform-origin: bottom center; }
          @keyframes messagePopIn { 0% { opacity: 0; transform: translateY(15px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        `}
      </style>

      <ManageMembersModal 
        isOpen={isManageModalOpen} 
        onClose={() => setIsManageModalOpen(false)}
        roomId={roomId}
        groupName={groupName}
        participants={participants}
        currentUser={currentUser}
        refreshParticipants={fetchParticipants}
        onLeaveGroup={onBack} // Передаємо функцію виходу на головний екран
      />

      <div className="h-[72px] px-6 border-b border-white/5 flex items-center justify-between bg-[#131933]/80 backdrop-blur-xl sticky top-0 z-40 shadow-[0_4_30px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-3 shrink-0">
            <button onClick={onBack} className="text-[#a19bfe] hover:text-white bg-white/5 hover:bg-white/10 active:scale-90 p-2 rounded-full transition-all border border-transparent hover:border-white/10">
                <ArrowLeft size={18} />
            </button>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border border-white/10 bg-gradient-to-tr from-pink-500 to-orange-400">
                <Hash size={22} className="text-white"/>
            </div>
            <div className="flex flex-col ml-1">
                <h2 className="font-bold text-base text-white leading-tight tracking-wide">{groupName}</h2>
                <p className="text-[11px] text-[#a19bfe] font-medium">{participants.length > 0 ? `${participants.length} members` : 'Group chat'}</p>
            </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => toast("Call feature coming soon!", {icon: '📞'})} className="hidden md:flex items-center gap-2 bg-gradient-to-r from-[#6d28d9] to-[#5b21b6] hover:opacity-90 active:scale-95 text-white px-3 py-1.5 rounded-lg transition-all text-xs font-bold border border-white/10 shadow-[0_0_15px_rgba(109,40,217,0.3)]"><Phone size={14} /><span>Call</span></button>
            <button onClick={() => toast("Video feature coming soon!", {icon: '🎥'})} className="hidden md:flex items-center gap-2 bg-[#1e1b2e] hover:bg-white/10 active:scale-95 text-white px-3 py-1.5 rounded-lg transition-all text-xs font-bold border border-white/10"><Video size={14} /><span>Video</span></button>
            <div className="w-px h-6 bg-white/10 mx-1 hidden md:block"></div>
            <button onClick={() => setIsManageModalOpen(true)} className="hidden md:flex items-center gap-2 bg-[#1e1b2e] hover:bg-white/10 active:scale-95 text-white px-4 py-1.5 rounded-lg transition-all text-xs font-bold border border-white/10"><Users size={14} /><span>Settings & Members</span></button>
        </div>
      </div>

      {/* ЗАКРІПЛЕНЕ ПОВІДОМЛЕННЯ */}
      {pinnedMessage && (
        <div className="bg-[#1e1b2e]/95 backdrop-blur-md border-b border-white/5 px-6 py-2.5 flex items-center justify-between z-30 sticky top-[72px] animate-in slide-in-from-top-2 fade-in">
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

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 chat-custom-scroll relative z-10">
        {(messages || []).map((msg, index) => {
           // СИСТЕМНЕ ПОВІДОМЛЕННЯ
           if (msg.isSystem) {
             return (
               <div key={msg.id} className="flex justify-center w-full my-4 msg-enter">
                 <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[11px] text-gray-400 font-medium shadow-sm backdrop-blur-sm">
                   {msg.text}
                 </span>
               </div>
             );
           }

           // ЗВИЧАЙНЕ ПОВІДОМЛЕННЯ
           const isMe = msg.isMe;
           const sender = getParticipantData(msg.senderId, msg.senderName);
           const isSequential = index > 0 && messages[index - 1].senderId === msg.senderId && !messages[index - 1].isSystem;

           return (
             <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group msg-enter ${isSequential ? 'mt-2' : 'mt-6'}`}>
                <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} relative`}>
                    
                    {!isMe && (
                        <div className="flex-shrink-0 mt-auto w-8"> 
                            {!isSequential && (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md border border-white/10 overflow-hidden bg-[#1e1b2e]">
                                    {sender.avatar ? <img src={sender.avatar} alt="Avatar" className="w-full h-full object-cover"/> : sender.name?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                    )}

                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1 min-w-[120px]`}>
                        {!isMe && !isSequential && (
                            <span className="text-[11px] font-bold text-[#a19bfe] ml-1 mb-0.5">{sender.name}</span>
                        )}

                        <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm relative group/bubble transition-all ${isMe ? 'bg-[#6d28d9] text-white rounded-br-sm border border-white/10 shadow-[0_2px_15px_rgba(109,40,217,0.2)]' : 'bg-[#1e1b2e]/90 text-gray-100 rounded-bl-sm border border-white/5 shadow-lg'}`}>
                            
                            {msg.replyTo && (
                                <div className={`mb-2.5 pl-3 border-l-[3px] text-[11px] rounded-r-lg p-2 cursor-pointer transition-colors ${isMe ? 'border-white/40 bg-black/20' : 'border-[#a19bfe] bg-black/20'}`}>
                                    <div className="font-bold text-white mb-0.5">{msg.replyTo.senderName}</div>
                                    <div className="truncate max-w-[200px] text-white/80">{msg.replyTo.text}</div>
                                </div>
                            )}
                            
                            <span className="break-words">{msg.text}</span>
                            
                            {/* HOVER MENU */}
                            <div 
                                onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}
                                className={`absolute top-0 ${isMe ? '-left-36' : '-right-36'} ${activeMenu === msg.id ? 'opacity-100' : 'opacity-0 group-hover/bubble:opacity-100'} transition-opacity flex items-center gap-1 bg-[#131933]/95 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-2xl z-40`}
                            >
                                <button onClick={() => toggleReaction(msg.id, '👍')} className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-white/10 rounded-lg transition-colors"><Smile size={14}/></button>
                                <button onClick={() => setReplyingTo({ senderName: isMe ? "You" : sender.name, text: msg.text })} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><Reply size={14}/></button>
                                <button onClick={() => handlePin(msg)} className="p-1.5 text-gray-400 hover:text-[#a19bfe] hover:bg-white/10 rounded-lg transition-colors"><Pin size={14}/></button>
                                <div className="relative">
                                    <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === msg.id ? null : msg.id); }} className={`p-1.5 rounded-lg transition-colors ${activeMenu === msg.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
                                        <MoreVertical size={14}/>
                                    </button>
                                    
                                    {activeMenu === msg.id && (
                                        <div className={`absolute top-full ${isMe ? 'right-0' : 'left-0'} mt-2 w-36 bg-[#1e1b2e] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95`}>
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

                        {/* TIMESTAMPS & CHECKMARKS */}
                        <div className={`flex flex-wrap items-center gap-1.5 mt-1 px-1 ${isMe ? 'flex-row' : 'flex-row'}`}>
                            {isMe && (
                                <div className="flex items-center opacity-80">
                                    {msg.read ? <CheckCheck size={14} className="text-blue-400" /> : <Check size={14} className="text-gray-400" />}
                                </div>
                            )}
                            <span className="text-[10px] text-gray-500 font-medium">{msg.timestamp}</span>
                            {msg.isEdited && <span className="text-[9px] text-gray-500 italic">edited</span>}
                            
                            {/* REACTIONS */}
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

      <div className="bg-[#131933]/90 backdrop-blur-2xl border-t border-white/5 p-4 z-20 relative">
        {(replyingTo || editingMessage) && (
            <div className="max-w-5xl mx-auto w-full mb-3 px-4 py-2.5 bg-[#1e1b2e] border border-white/10 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2 fade-in">
                <div className="flex items-center gap-3 overflow-hidden text-sm">
                    {editingMessage ? <Edit2 size={16} className="text-[#a19bfe] shrink-0" /> : <Reply size={16} className="text-[#a19bfe] shrink-0" />}
                    <div className="flex flex-col truncate">
                        <span className="text-[#a19bfe] font-bold text-[11px] leading-none mb-1 uppercase tracking-wider">
                            {editingMessage ? "Editing Message" : `Replying to ${replyingTo.senderName}`}
                        </span>
                        <span className="text-gray-300 truncate text-[12px]">{editingMessage ? editingMessage.text : replyingTo.text}</span>
                    </div>
                </div>
                <button onClick={() => { setReplyingTo(null); setEditingMessage(null); setInput(""); }} className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10"><X size={14}/></button>
            </div>
        )}

        <div className="max-w-5xl mx-auto w-full">
            <div className="bg-[#1e1b2e] rounded-2xl p-1.5 flex items-center gap-2 border border-white/10 shadow-inner focus-within:ring-1 focus-within:ring-[#6d28d9]/50 transition-all">
                <input 
                    className="flex-1 bg-transparent outline-none text-white text-sm px-3 py-2 h-10 placeholder-gray-500" 
                    placeholder={editingMessage ? "Edit message..." : `Message ${groupName}...`} 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    autoFocus={!!editingMessage}
                />
                <div className="pr-1">
                    <button onClick={handleSend} className="p-2.5 bg-[#6d28d9] hover:bg-[#5b21b6] text-white rounded-xl active:scale-90 transition-all">
                        {editingMessage ? <Check size={20} /> : <ArrowRight size={20} />}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatArea;