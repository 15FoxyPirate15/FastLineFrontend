import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Phone, MoreHorizontal, 
  Image as ImageIcon, Mic, Paperclip, ArrowLeft, ArrowRight, Users, X, Activity,
  Pin, Reply, Smile, CheckCheck
} from 'lucide-react';

const GroupChatArea = ({ groupName, currentUser, onBack }) => { 
  
  const [participants] = useState([
    { id: 'me', name: currentUser?.name || 'You', avatar: currentUser?.avatar, role: 'admin', online: true },
    { id: 'user2', name: 'Orest', avatar: null, role: 'admin', online: true, color: 'bg-orange-500' },
    { id: 'user3', name: 'Katya', avatar: null, role: 'member', online: false, color: 'bg-pink-500' },
    { id: 'user4', name: 'Maxim', avatar: null, role: 'member', online: true, color: 'bg-blue-500' }
  ]);

  const [activeTasks] = useState([
    { userId: 'user2', name: 'Orest', color: 'bg-orange-500', task: 'Fixing Login Bug' },
    { userId: 'user4', name: 'Maxim', color: 'bg-blue-500', task: 'Design Group UI' }
  ]);

  const [showParticipants, setShowParticipants] = useState(false);
  
  const [pinnedMessage, setPinnedMessage] = useState({ id: 2, senderName: 'Orest', text: 'Hey team! Are we ready for the deploy?', timestamp: "10:05" });
  const [replyingTo, setReplyingTo] = useState(null);
  const [isTyping, setIsTyping] = useState(true);

  const [messages, setMessages] = useState([
    { id: 1, type: 'system', text: "Orest created the group 'Frontend Team'", timestamp: "10:00" },
    { 
        id: 2, type: 'text', text: "Hey team! Are we ready for the deploy?", senderId: 'user2', timestamp: "10:05",
        reactions: [{ emoji: '🔥', count: 2, reacted: true }, { emoji: '👀', count: 1, reacted: false }],
        readBy: ['user3', 'user4', 'me'] 
    },
    { 
        id: 3, type: 'text', text: "I'm fixing the last bug right now.", senderId: 'user3', timestamp: "10:12",
        replyTo: { senderName: 'Orest', text: 'Hey team! Are we ready for the deploy?' },
        readBy: ['user2', 'user4', 'me']
    },
    { id: 4, type: 'text', text: "Let me know when you need the backend ready.", senderId: 'me', timestamp: "10:15", readBy: ['user2'] },
    { id: 5, type: 'system', text: "Maxim joined via invite link", timestamp: "11:30" }
  ]);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const uiMessage = {
        id: Date.now(),
        type: 'text',
        text: input,
        senderId: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        replyTo: replyingTo ? { senderName: replyingTo.senderName, text: replyingTo.text } : null,
        readBy: []
    };
    
    setMessages(prev => [...prev, uiMessage]);
    setInput("");
    setReplyingTo(null);

    setIsTyping(false);
    setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, type: 'text', text: "Awesome, pushing to main branch now!", senderId: 'user4',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                readBy: []
            }]);
            setIsTyping(false);
        }, 1500);
    }, 1000);
  };

  const getSender = (id) => participants.find(p => p.id === id);

  const toggleReaction = (msgId, emojiStr) => {
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
            return { ...m, reactions: newReactions };
        }
        return m;
    }));
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-r from-[#373185] to-[#171d40] text-white relative">
      
      {/* ЛОКАЛЬНІ СТИЛІ ДЛЯ СКРОЛБАРУ */}
      <style>
        {`
          .chat-custom-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .chat-custom-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .chat-custom-scroll::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.15);
            border-radius: 10px;
          }
          .chat-custom-scroll::-webkit-scrollbar-thumb:hover {
            background-color: rgba(255, 255, 255, 0.3);
          }
        `}
      </style>

      {/* HEADER: Фон змінено на #131933/95 для єдності із Pinned Message */}
      <div className="h-[72px] px-6 border-b border-white/5 flex items-center justify-between bg-[#131933]/95 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        
        <div className="flex items-center gap-3 shrink-0">
            <button onClick={onBack} className="text-[#a19bfe] hover:text-white bg-white/5 hover:bg-white/10 active:scale-90 p-2 rounded-full transition-all border border-transparent hover:border-white/10">
                <ArrowLeft size={18} />
            </button>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-white text-xl shadow-lg shadow-pink-500/20 border border-white/10">
                🚀
            </div>
            <div className="flex flex-col ml-1">
                <h2 className="font-bold text-base text-white leading-tight tracking-wide">{groupName || "Frontend Team"}</h2>
                <p className="text-[11px] text-[#a19bfe] font-medium">Team Workspace</p>
            </div>
        </div>

        <div className="hidden lg:flex flex-1 items-center justify-start px-8 overflow-hidden fade-edges">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-gray-500 mr-2">
                    <Activity size={14} className="animate-pulse text-green-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Live Tasks:</span>
                </div>
                {activeTasks.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/5 border-t-white/10 rounded-full pr-4 p-1 transition-all cursor-pointer group active:scale-95 shadow-sm">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm ${task.color}`}>{task.name[0]}</div>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-400 font-medium leading-tight group-hover:text-gray-300 transition-colors">{task.name} is on</span>
                            <span className="text-[11px] text-white font-semibold leading-tight truncate max-w-[120px]">{task.task}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => setShowParticipants(!showParticipants)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all text-xs font-bold border active:scale-95 ${showParticipants ? 'bg-[#6d28d9] border-[#a19bfe]/50 shadow-lg text-white' : 'bg-[#1e1b2e] hover:bg-white/10 border-white/10 text-gray-300'}`}>
                <Users size={14} /><span>{participants.length}</span>
            </button>
            <button className="hidden md:flex items-center gap-2 bg-[#6d28d9] hover:bg-[#5b21b6] active:scale-95 text-white px-4 py-2 rounded-xl transition-all text-xs font-bold border border-white/10 shadow-lg">
                <Phone size={14} /> <span>Call</span>
            </button>
            <button className="p-2 text-gray-300 hover:text-white bg-[#1e1b2e] hover:bg-white/10 border border-white/10 active:scale-95 transition-all rounded-xl">
                <MoreHorizontal size={18} />
            </button>
        </div>

        {showParticipants && (
            <div className="absolute top-20 right-6 w-72 bg-[#1d1a4a]/95 backdrop-blur-xl border border-white/10 border-t-white/20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center mb-4 px-1 border-b border-white/5 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2"><Users size={16} className="text-[#a19bfe]"/> Members</h3>
                    <button onClick={() => setShowParticipants(false)} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-all"><X size={16}/></button>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto chat-custom-scroll">
                    {participants.map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-xl cursor-pointer group active:scale-98">
                            <div className="relative">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${p.color || 'bg-purple-500'}`}>{p.avatar ? <img src={p.avatar} alt="ava" className="w-full h-full rounded-full object-cover"/> : p.name[0]}</div>
                                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-[2.5px] border-[#1d1a4a] ${p.online ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-200 truncate">{p.name}</span>
                                    {p.role === 'admin' && <span className="text-[9px] font-bold uppercase bg-[#6d28d9]/20 text-[#a19bfe] px-1.5 py-0.5 rounded-md">Admin</span>}
                                </div>
                                <span className="text-[10px] text-gray-500">{p.online ? 'Online' : 'Offline'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {pinnedMessage && (
          <div className="bg-[#131933]/95 backdrop-blur-xl border-b border-white/5 px-6 py-2.5 flex items-center justify-between sticky top-[72px] z-30 shadow-sm animate-in slide-in-from-top-1">
              <div className="flex items-center gap-3 overflow-hidden">
                  <Pin size={14} className="text-[#a19bfe] shrink-0" />
                  <div className="flex flex-col truncate cursor-pointer hover:opacity-80 transition-opacity">
                      <span className="text-[10px] font-bold text-[#a19bfe] uppercase tracking-wider">Pinned Message</span>
                      <span className="text-xs text-gray-300 truncate"><span className="text-white font-medium">{pinnedMessage.senderName}:</span> {pinnedMessage.text}</span>
                  </div>
              </div>
              <button onClick={() => setPinnedMessage(null)} className="text-gray-500 hover:text-white p-1 rounded transition-colors"><X size={14}/></button>
          </div>
      )}

      {/* Клас chat-custom-scroll додано сюди замість старого скролбару */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 chat-custom-scroll relative z-10">
        {messages.map((msg) => {
           if (msg.type === 'system') {
               return (
                   <div key={msg.id} className="flex justify-center my-4">
                       <div className="bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] font-medium text-gray-400 border border-white/5">
                           {msg.text}
                       </div>
                   </div>
               )
           }

           const isMe = msg.senderId === 'me';
           const sender = getSender(msg.senderId);
           
           return (
             <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group animate-message`}>
                <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} relative`}>
                    
                    <div className="flex-shrink-0 mt-auto mb-1"> 
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md border border-white/10 ${sender?.color || 'bg-blue-600'}`}>
                             {sender?.avatar ? <img src={sender.avatar} className="w-full h-full rounded-full object-cover" alt="ava"/> : sender?.name?.[0] || 'U'}
                        </div>
                    </div>

                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1 min-w-[120px]`}>
                        {!isMe && <span className="text-[11px] text-[#a19bfe] font-semibold ml-1">{sender?.name}</span>}
                        
                        <div className={`
                            px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm relative group/bubble
                            ${isMe ? 'bg-[#6d28d9] text-white rounded-br-sm border border-purple-500/30' : 'bg-[#1e1b2e]/90 backdrop-blur-md text-gray-100 rounded-bl-sm border border-white/5'}
                        `}>
                            {/* ОНОВЛЕНИЙ БЛОК ЦИТАТИ: Контрастні кольори */}
                            {msg.replyTo && (
                                <div className={`mb-2.5 pl-3 border-l-[3px] text-[11px] rounded-r-lg p-2 cursor-pointer transition-colors ${isMe ? 'border-white/40 bg-black/20 hover:bg-black/30' : 'border-[#a19bfe] bg-black/20 hover:bg-black/30'}`}>
                                    <div className="font-bold text-white mb-0.5">{msg.replyTo.senderName}</div>
                                    <div className="truncate max-w-[200px] text-white/80">{msg.replyTo.text}</div>
                                </div>
                            )}

                            {msg.text}

                            <div className={`absolute top-0 ${isMe ? '-left-20' : '-right-20'} opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center gap-1 bg-[#131933] border border-white/10 rounded-lg p-1 shadow-lg`}>
                                <button onClick={() => toggleReaction(msg.id, '👍')} className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-white/10 rounded-md transition-colors"><Smile size={14}/></button>
                                <button onClick={() => setReplyingTo({ senderName: sender?.name, text: msg.text })} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"><Reply size={14}/></button>
                            </div>
                        </div>

                        <div className={`flex flex-wrap items-center gap-2 mt-0.5 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className="text-[10px] text-gray-500 font-medium">
                                {msg.timestamp}
                            </span>
                            
                            {isMe && msg.readBy?.length > 0 && (
                                <div className="flex items-center mr-1">
                                    <CheckCheck size={12} className="text-[#a19bfe] mr-1 opacity-80"/>
                                    <div className="flex -space-x-1">
                                        {msg.readBy.map((userId, i) => {
                                            const rSender = getSender(userId);
                                            return (
                                                <div key={i} className={`w-3.5 h-3.5 rounded-full border border-[#171d40] flex items-center justify-center text-[6px] font-bold text-white shadow-sm ${rSender?.color || 'bg-gray-500'}`}>
                                                    {rSender?.name[0]}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {msg.reactions?.length > 0 && (
                                <div className={`flex flex-wrap gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    {msg.reactions.map((r, i) => (
                                        <button key={i} onClick={() => toggleReaction(msg.id, r.emoji)} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors active:scale-90 ${r.reacted ? 'bg-[#6d28d9]/30 border-[#6d28d9]/50 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                                            <span>{r.emoji}</span> <span>{r.count}</span>
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
            <div className="flex items-end gap-3 justify-start animate-in fade-in slide-in-from-bottom-2">
                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center bg-[#1e1b2e] shadow-sm"><Users size={14} className="text-gray-500"/></div>
                <div className="bg-[#1e1b2e]/90 backdrop-blur-md border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      <div className="bg-[#131933]/95 backdrop-blur-xl border-t border-white/5 flex flex-col z-20 relative">
        
        {replyingTo && (
            <div className="px-6 pt-3 pb-1 flex items-center justify-between animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 overflow-hidden border-l-[3px] border-[#a19bfe] pl-3 text-sm">
                    <Reply size={14} className="text-[#a19bfe] shrink-0" />
                    <div className="flex flex-col truncate">
                        <span className="text-[#a19bfe] font-bold text-[11px] leading-none mb-0.5">Replying to {replyingTo.senderName}</span>
                        <span className="text-gray-300 truncate text-[12px]">{replyingTo.text}</span>
                    </div>
                </div>
                <button onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"><X size={16}/></button>
            </div>
        )}

        <div className="p-4 pt-3">
            <div className="max-w-5xl mx-auto bg-[#1e1b2e] rounded-2xl p-1.5 flex items-center gap-2 border border-white/10 shadow-inner">
                <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 active:scale-90 rounded-xl transition-all">
                    <ImageIcon size={20} />
                </button>

                <input 
                    className="flex-1 bg-transparent outline-none text-white text-sm px-3 py-2 placeholder-gray-500 font-medium h-10"
                    placeholder="Message Frontend Team..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />

                <div className="flex items-center gap-1.5 pr-1">
                    {input.trim() ? (
                        <button onClick={handleSend} className="p-2.5 bg-[#6d28d9] text-white rounded-xl hover:bg-[#5b21b6] active:scale-90 transition-all shadow-lg shadow-purple-900/30">
                            <ArrowRight size={20} />
                        </button>
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

export default GroupChatArea;