import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Phone, Video, MoreHorizontal, 
  Image as ImageIcon, Mic, Paperclip, ArrowLeft, ArrowRight, Users, X
} from 'lucide-react';

const GroupChatArea = ({ groupName, currentUser, onBack }) => { 
  
  const [participants] = useState([
    { id: 'me', name: currentUser?.name || 'You', avatar: currentUser?.avatar, role: 'admin', online: true },
    { id: 'user2', name: 'Orest', avatar: null, role: 'admin', online: true, color: 'bg-orange-500' },
    { id: 'user3', name: 'Katya', avatar: null, role: 'member', online: false, color: 'bg-pink-500' },
    { id: 'user4', name: 'Maxim', avatar: null, role: 'member', online: true, color: 'bg-blue-500' }
  ]);

  const [showParticipants, setShowParticipants] = useState(false);

  const [messages, setMessages] = useState([
    { id: 1, type: 'system', text: "Orest created the group 'Frontend Team'", timestamp: "10:00" },
    { id: 2, type: 'text', text: "Hey team! Are we ready for the deploy?", senderId: 'user2', timestamp: "10:05" },
    { id: 3, type: 'text', text: "I'm fixing the last bug right now.", senderId: 'user3', timestamp: "10:12" },
    { id: 4, type: 'text', text: "Let me know when you need the backend ready.", senderId: 'me', timestamp: "10:15" },
    { id: 5, type: 'system', text: "Maxim joined via invite link", timestamp: "11:30" }
  ]);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const uiMessage = {
        id: Date.now(),
        type: 'text',
        text: input,
        senderId: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, uiMessage]);
    setInput("");

    setTimeout(() => {
        setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            type: 'text',
            text: "Got it!", 
            senderId: 'user4',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    }, 2000);
  };

  const getSender = (id) => participants.find(p => p.id === id);

  return (
    <div className="flex flex-col h-full bg-gradient-to-tl from-[#181e41] from-[10%] via-[#383286] via-[30%] to-[#181e41] text-white relative">
      
      {/* HEADER */}
      <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-[gradient-to-b from-[#25244d] to-[#1a193a]] backdrop-blur-md sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-[#a19bfe] hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors">
                <ArrowLeft size={20} />
            </button>

            {/* Аватар Групи */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-white text-xl shadow-md">
                🚀
            </div>
            
            <div className="flex flex-col ml-1">
                <h2 className="font-bold text-base text-white leading-tight">{groupName || "Frontend Team"}</h2>
                <p className="text-[11px] text-[#a19bfe] font-medium">Team Workspace</p>
            </div>
        </div>

        <div className="flex items-center gap-3">
            {/* КНОПКА УЧАСНИКІВ */}
            <button 
                onClick={() => setShowParticipants(!showParticipants)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-medium border ${showParticipants ? 'bg-[#6d28d9] border-[#a19bfe]' : 'bg-[#2d346a] hover:bg-[#3d4585] border-white/10'}`}
            >
                <Users size={14} />
                <span>{participants.length}</span>
            </button>

            <button className="hidden md:flex items-center gap-2 bg-[#5a379a] hover:bg-[#6d28d9] text-white px-3 py-1.5 rounded-full transition-all text-xs font-medium border border-white/5">
                <Phone size={14} /> <span>Call</span>
            </button>
            <button className="p-2 text-white bg-[#573693] hover:bg-[#6d28d9] transition rounded-[0.7rem]">
                <MoreHorizontal size={20} />
            </button>
        </div>

        {/* МОДАЛЬНЕ ВІКНО / DROPDOWN УЧАСНИКІВ */}
        {showParticipants && (
            <div className="absolute top-16 right-6 w-64 bg-[#1d1a4a] border border-white/10 rounded-2xl shadow-2xl p-3 z-50">
                <div className="flex justify-between items-center mb-3 px-1">
                    <h3 className="text-sm font-bold text-white">Members ({participants.length})</h3>
                    <button onClick={() => setShowParticipants(false)} className="text-gray-400 hover:text-white"><X size={16}/></button>
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                    {participants.map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer">
                            <div className="relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${p.color || 'bg-purple-500'}`}>
                                    {p.avatar ? <img src={p.avatar} alt="ava" className="w-full h-full rounded-full object-cover"/> : p.name[0]}
                                </div>
                                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#1d1a4a] ${p.online ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-200 truncate">{p.name} {p.id === 'me' && '(You)'}</span>
                                    {p.role === 'admin' && <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">Admin</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* MESSAGES LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => {
           if (msg.type === 'system') {
               return (
                   <div key={msg.id} className="flex justify-center my-2">
                       <div className="bg-white/5 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] text-gray-400 font-medium border border-white/5">
                           {msg.text}
                       </div>
                   </div>
               )
           }

           const isMe = msg.senderId === 'me';
           const sender = getSender(msg.senderId);
           
           return (
             <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group animate-message`}>
                <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar */}
                    <div className="flex-shrink-0 mt-auto"> 
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ${sender?.color || 'bg-blue-600'}`}>
                             {sender?.avatar ? <img src={sender.avatar} className="w-full h-full rounded-full object-cover" alt="ava"/> : sender?.name?.[0] || 'U'}
                        </div>
                    </div>

                    {/* Bubble */}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}>
                        {!isMe && <span className="text-[11px] text-[#a19bfe] font-medium ml-1">{sender?.name}</span>}
                        
                        <div className={`
                            px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm
                            ${isMe 
                                ? 'bg-[#1d5a70] text-white rounded-br-none'
                                : 'bg-[#483490] backdrop-blur-sm text-gray-100 rounded-bl-none border border-white/5'
                            }
                        `}>
                            {msg.text}
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">
                            {msg.timestamp}
                        </span>
                    </div>
                </div>
             </div>
           );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-3 bg-gradient-to-b from-[#25244d] to-[#1a193a] border-t border-white/5">
        <div className="max-w-4xl mx-auto bg-[#2d346a] rounded-full px-1 py-1 flex items-center gap-1 border border-white/5 shadow-lg">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition">
                <ImageIcon size={18} />
            </button>

            <input 
                className="flex-1 bg-transparent outline-none text-white text-sm px-2 py-1 placeholder-gray-500 font-medium h-8"
                placeholder="Message group..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />

            <div className="flex items-center gap-1 pr-1">
                {input.trim() ? (
                    <button onClick={handleSend} className="p-2 bg-[#6d28d9] text-white rounded-full hover:bg-[#5b21b6] transition shadow-md">
                        <ArrowRight size={18} />
                    </button>
                ) : (
                    <>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition"><Paperclip size={18} /></button>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition"><Mic size={18} /></button>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatArea;