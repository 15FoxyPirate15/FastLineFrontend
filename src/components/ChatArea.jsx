import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, Phone, Video, MoreHorizontal, 
  Image as ImageIcon, Mic, Paperclip, ArrowLeft, ArrowRight, X,
  Reply, Smile, CheckCheck, Check, Users
} from 'lucide-react';

const ChatArea = ({ chatName, isAi, currentUser, onBack, socket, roomId }) => { 
  const [replyingTo, setReplyingTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatPartner, setChatPartner] = useState(null); // Додано стейт для партнера
  const messagesEndRef = useRef(null);

  // 1. ЗАВАНТАЖЕННЯ ІСТОРІЇ ПОВІДОМЛЕНЬ
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
                    const backendSender = String(m.from || m.senderId || m.userId || m.senderEmail || m.sender);
                    const myId = String(currentUser?.id);
                    const myEmail = String(currentUser?.email);
                    const isMyMessage = (backendSender === myId || backendSender === myEmail);
                    
                    // Парсинг часу
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
                        reactions: m.reactions || []
                    }
                });
                setMessages(formattedMessages);
            }
        } catch (err) {
            console.error("Помилка завантаження історії:", err);
        }
    };

    fetchHistory();
  }, [roomId, currentUser]);

  // 1.5. ЗАВАНТАЖЕННЯ ДАНИХ СПІВРОЗМОВНИКА (Аватарки та Імена)
  useEffect(() => {
    if (!roomId || isAi) return;

    const fetchParticipants = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://backendfastline.onrender.com/chats/${roomId}/participants`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const participants = await res.json();
                // Шукаємо іншого користувача
                const partner = participants.find(p => p.email !== currentUser?.email && p.id !== currentUser?.id);
                if (partner) {
                    setChatPartner(partner);
                }
            }
        } catch (err) {
             console.error("Помилка завантаження учасників:", err);
        }
    };
    
    fetchParticipants();
  }, [roomId, currentUser, isAi]);

  // 2. СОКЕТИ (Отримання нових повідомлень та реакцій)
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
            reactions: backendMessage.reactions || []
        };
        
        setMessages(prev => [...prev, uiMessage]);
        setIsTyping(false);
    };

    const handleReaction = ({ messageId, reactions }) => {
        setMessages(msgs => msgs.map(m => 
            m.id === messageId ? { ...m, reactions: reactions } : m
        ));
    };

    socket.on('new_message', handleNewMessage);
    socket.on('reaction_added', handleReaction);

    return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('reaction_added', handleReaction);
    };
  }, [socket, roomId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || !socket || !roomId) return;
    
    const messageData = { 
        roomId: roomId, 
        text: input,
        // Додаємо replyTo до відправки
        replyTo: replyingTo ? { senderName: replyingTo.senderName, text: replyingTo.text } : null 
    };

    socket.emit('send_message', messageData);
    setInput("");
    setReplyingTo(null);
  };

  const toggleReaction = (msgId, emojiStr) => {
    // Оновлюємо локально
    let updatedReactions = [];
    setMessages(msgs => msgs.map(m => {
        if (m.id === msgId) {
            const existing = m.reactions?.find(r => r.emoji === emojiStr);
            let newReactions = m.reactions ? [...m.reactions] : [];
            if (existing) {
                if (existing.reacted) {
                    existing.count -= 1;
                    existing.reacted = false;
                } else {
                    existing.count += 1;
                    existing.reacted = true;
                }
                newReactions = newReactions.filter(r => r.count > 0);
            } else {
                newReactions.push({ emoji: emojiStr, count: 1, reacted: true });
            }
            updatedReactions = newReactions;
            return { ...m, reactions: newReactions };
        }
        return m;
    }));

    // Відправляємо на бекенд (бекендер має це обробити!)
    if (socket && roomId) {
         socket.emit('add_reaction', { roomId, messageId: msgId, reactions: updatedReactions });
    }
  };

  // Допоміжна функція для відображення імені в шапці
  const displayChatName = isAi ? "AI Assistant" : (chatPartner?.displayName || chatPartner?.name || chatName || chatPartner?.email?.split('@')[0] || "User");

  return (
    <div className="flex flex-col h-full bg-gradient-to-r from-[#373185] to-[#171d40] text-white relative">
      <style>
        {`
          .chat-custom-scroll::-webkit-scrollbar { width: 6px; }
          .chat-custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .chat-custom-scroll::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.15); border-radius: 10px; }
          .chat-custom-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.3); }
        `}
      </style>

      {/* HEADER */}
      <div className="h-[72px] px-6 border-b border-white/5 flex items-center justify-between bg-[#131933]/95 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3 shrink-0">
            <button onClick={onBack} className="text-[#a19bfe] hover:text-white bg-white/5 hover:bg-white/10 active:scale-90 p-2 rounded-full transition-all border border-transparent hover:border-white/10">
                <ArrowLeft size={18} />
            </button>
            <div className="relative"> 
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border border-white/10 ${isAi ? 'bg-gradient-to-br from-purple-600 to-indigo-600' : 'bg-[#2a2a3d]'}`}>
                    {isAi ? <Bot size={22}/> : (
                         chatPartner?.avatarUrl && chatPartner.avatarUrl !== 'none' ? 
                         <img src={chatPartner.avatarUrl} alt="User" className="w-full h-full object-cover"/> :
                         <span className="font-bold">{displayChatName[0]?.toUpperCase()}</span>
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
            <button className="hidden md:flex items-center gap-2 bg-[#6d28d9] hover:bg-[#5b21b6] active:scale-95 text-white px-4 py-2 rounded-xl transition-all text-xs font-bold border border-white/10 shadow-lg"><Phone size={14} /><span>Call</span></button>
            <button className="hidden md:flex items-center gap-2 bg-[#1e1b2e] hover:bg-white/10 active:scale-95 text-white px-4 py-2 rounded-xl transition-all text-xs font-bold border border-white/10 shadow-inner"><Video size={14} /><span>Video</span></button>
            <button className="p-2 text-gray-300 hover:text-white bg-[#1e1b2e] hover:bg-white/10 border border-white/10 active:scale-95 transition-all rounded-xl"><MoreHorizontal size={18} /></button>
        </div>
      </div>

      {/* MESSAGES LIST */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 chat-custom-scroll relative z-10">
        
        {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm font-medium">
                Немає повідомлень. Напишіть щось!
            </div>
        )}

        {(messages || []).map((msg) => {
           const isMe = msg.senderId === 'me';
           return (
             <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group animate-message`}>
                <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} relative`}>
                    <div className="flex-shrink-0 mt-auto mb-1"> 
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md border border-white/10 overflow-hidden ${isMe ? 'bg-gradient-to-tr from-blue-500 to-purple-500' : (isAi ? 'bg-purple-600' : 'bg-[#2a2a3d]')}`}>
                             {isMe ? (currentUser?.name?.[0]?.toUpperCase() || 'U') : (isAi ? <Bot size={16}/> : 
                                (chatPartner?.avatarUrl && chatPartner.avatarUrl !== 'none' ? 
                                <img src={chatPartner.avatarUrl} alt="Them" className="w-full h-full object-cover"/> :
                                <span>{displayChatName[0]?.toUpperCase()}</span>)
                             )}
                        </div>
                    </div>

                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1 min-w-[120px]`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm relative group/bubble ${isMe ? 'bg-[#6d28d9] text-white rounded-br-sm border border-purple-500/30' : 'bg-[#1e1b2e]/90 backdrop-blur-md text-gray-100 rounded-bl-sm border border-white/5'}`}>
                            {msg.replyTo && (
                                <div className={`mb-2.5 pl-3 border-l-[3px] text-[11px] rounded-r-lg p-2 cursor-pointer transition-colors ${isMe ? 'border-white/40 bg-black/20 hover:bg-black/30' : 'border-[#a19bfe] bg-black/20 hover:bg-black/30'}`}>
                                    <div className="font-bold text-white mb-0.5">{msg.replyTo.senderName}</div>
                                    <div className="truncate max-w-[200px] text-white/80">{msg.replyTo.text}</div>
                                </div>
                            )}
                            {msg.text}
                            <div className={`absolute top-0 ${isMe ? '-left-20' : '-right-20'} opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center gap-1 bg-[#131933] border border-white/10 rounded-lg p-1 shadow-lg`}>
                                <button onClick={() => toggleReaction(msg.id, '👍')} className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-white/10 rounded-md transition-colors"><Smile size={14}/></button>
                                <button onClick={() => setReplyingTo({ senderName: isMe ? "You" : displayChatName, text: msg.text })} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"><Reply size={14}/></button>
                            </div>
                        </div>

                        <div className={`flex flex-wrap items-center gap-2 mt-0.5 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className="text-[10px] text-gray-500 font-medium">{msg.timestamp}</span>
                            {isMe && (
                                <div className="flex items-center mr-1">
                                    {msg.read ? <CheckCheck size={14} className="text-[#a19bfe]" /> : <Check size={14} className="text-gray-500" />}
                                </div>
                            )}
                            {msg.reactions?.length > 0 && (
                                <div className={`flex flex-wrap gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    {msg.reactions.map((r, i) => (
                                        <button key={i} onClick={() => toggleReaction(msg.id, r.emoji)} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors active:scale-90 ${r.reacted ? 'bg-[#6d28d9]/30 border-[#6d28d9]/50 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}><span>{r.emoji}</span> <span>{r.count}</span></button>
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
            <div className="flex items-end gap-3 justify-start animate-in fade-in slide-in-from-bottom-2">
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center overflow-hidden bg-[#2a2a3d] shadow-sm">{isAi ? <Bot size={16}/> : 
                    (chatPartner?.avatarUrl && chatPartner.avatarUrl !== 'none' ? 
                     <img src={chatPartner.avatarUrl} alt="Them" className="w-full h-full object-cover"/> :
                     <span className="text-xs font-bold">{displayChatName[0]?.toUpperCase()}</span>)
                }</div>
                <div className="bg-[#1e1b2e]/90 backdrop-blur-md border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* INPUT AREA */}
      <div className="bg-[#131933]/95 backdrop-blur-xl border-t border-white/5 flex flex-col z-20 relative">
        {replyingTo && (
            <div className="px-6 pt-3 pb-1 flex items-center justify-between animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 overflow-hidden border-l-[3px] border-[#a19bfe] pl-3 text-sm">
                    <Reply size={14} className="text-[#a19bfe] shrink-0" />
                    <div className="flex flex-col truncate"><span className="text-[#a19bfe] font-bold text-[11px] leading-none mb-0.5">Replying to {replyingTo.senderName}</span><span className="text-gray-300 truncate text-[12px]">{replyingTo.text}</span></div>
                </div>
                <button onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"><X size={16}/></button>
            </div>
        )}
        <div className="p-4 pt-3">
            <div className="max-w-5xl mx-auto bg-[#1e1b2e] rounded-2xl p-1.5 flex items-center gap-2 border border-white/10 shadow-inner">
                <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 active:scale-90 rounded-xl transition-all"><ImageIcon size={20} /></button>
                <input className="flex-1 bg-transparent outline-none text-white text-sm px-3 py-2 placeholder-gray-500 font-medium h-10" placeholder={`Message ${displayChatName}...`} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}/>
                <div className="flex items-center gap-1.5 pr-1">
                    {input.trim() ? (
                        <button onClick={handleSend} className="p-2.5 bg-[#6d28d9] text-white rounded-xl hover:bg-[#5b21b6] active:scale-90 transition-all shadow-lg shadow-purple-900/30"><ArrowRight size={20} /></button>
                    ) : (
                        <>
                            <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 active:scale-90 rounded-xl transition-all"><Paperclip size={20} /></button>
                            <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 active:scale-90 rounded-xl transition-all"><Mic size={20} /></button>
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