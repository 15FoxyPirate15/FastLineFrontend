import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, Phone, Video, MoreHorizontal, 
  Image as ImageIcon, Mic, Paperclip, ArrowLeft, ArrowRight, ChevronLeft 
} from 'lucide-react';

const ChatArea = ({ chatName, isAi, currentUser, onBack }) => { 
  
  const [messages, setMessages] = useState([
    { 
        id: 1, 
        text: "Happy New Year", 
        senderId: 'them', 
        timestamp: "12:19",
        avatar: null
    },
    { 
        id: 2, 
        text: "How are u?", 
        senderId: 'them', 
        timestamp: "12:19",
        avatar: null
    },
    { 
        id: 3, 
        text: "Hello Tony!", 
        senderId: 'me', 
        timestamp: "14:54",
        avatar: null 
    },
    { 
        id: 4, 
        text: "Thank you! I'm great, how about you?", 
        senderId: 'me', 
        timestamp: "14:54",
        avatar: null 
    },
    { 
        id: 5, 
        text: "Not yet. I hope we'll go this weekend.", 
        senderId: 'them', 
        timestamp: "20:35",
        avatar: null 
    }
  ]);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageToBackend = async (text) => {
    const uiMessage = {
        id: Date.now(),
        text: text,
        senderId: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: null
    };
    setMessages(prev => [...prev, uiMessage]);

    if (isAi || true) {
        setTimeout(() => {
            const reply = { 
                id: Date.now() + 1, 
                text: isAi ? "Analysis complete." : "Ok, sounds good!", 
                senderId: 'them',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                avatar: null
            };
            setMessages(prev => [...prev, reply]);
        }, 1500);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessageToBackend(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-r from-[#373185] to-[#171d40] text-white relative">
      
      {/* HEADER */}
      <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#373185] to-[#171d40] backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
            
            {/* 1. СТРІЛКА СПРАВА ВІД АВАТАРА (Для виходу) */}
            <button 
                onClick={onBack} 
                className="text-[#a19bfe] hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title="Back to main"
            >
                <ArrowLeft size={20} />
            </button>

            {/* Знайдіть у Header блок з аватаром і замініть на цей код: */}

            <div className="relative"> {/* 1. Додаємо обгортку relative */}
                
                {/* 2. Сам аватар (overflow-hidden залишається тут, щоб обрізати фото) */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${isAi ? 'bg-purple-600' : 'bg-[#2a2a3d]'}`}>
                    {isAi ? <Bot size={20}/> : <img src="/api/placeholder/40/40" alt="User" className="w-full h-full object-cover"/>}
                </div>

                {/* 3. Зелений індикатор (Винесений ЗА межі overflow-hidden, тому не обрізається) */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#11111e]"></div>

            </div>
            
            <div className="flex flex-col ml-1">
                <h2 className="font-bold text-base text-[#a19bfe] leading-tight">{chatName}</h2>
                <p className="text-[11px] text-gray-400 font-medium">
                    {isAi ? "AI Assistant" : "Last seen just now"}
                </p>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <button className="hidden md:flex items-center gap-2 bg-[#5a379a] hover:bg-[#6d28d9] text-white px-3 py-1.5 rounded-full transition-all text-xs font-medium border border-white/5">
                <Phone size={14} />
                <span>Call</span>
            </button>
            <button className="hidden md:flex items-center gap-2 bg-[#9041c4] hover:bg-[#6d28d9] text-white px-3 py-1.5 rounded-full transition-all text-xs font-medium border border-white/5">
                <Video size={14} />
                <span>Video</span>
            </button>
            <button className="p-2 text-white bg-[#573693] hover:bg-[#6d28d9] transition rounded-[0.7rem]">
                <MoreHorizontal size={20} />
            </button>
        </div>
      </div>

      {/* MESSAGES LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.map((msg) => {
           const isMe = msg.senderId === 'me';
           
           return (
             <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group animate-message`}>
                <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar */}
                    {/* 2. ПРИБРАНО opacity-0 (Аватар тепер видно завжди) */}
                    <div className="flex-shrink-0 mb-auto"> 
                        {/* 3. ЗБІЛЬШЕНО РОЗМІР (w-8 h-8 замість w-6 h-6 для кращого вигляду) */}
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 shadow-md border border-white/10">
                             {isMe ? (
                                <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
                                    {currentUser?.name?.[0] || 'U'}
                                </div>
                             ) : (
                                isAi ? <div className="w-full h-full bg-purple-600 p-1.5"><Bot className="w-full h-full"/></div> :
                                <img src="/api/placeholder/32/32" alt="Them" className="w-full h-full object-cover"/>
                             )}
                        </div>
                    </div>

                    {/* Bubble */}
                    <div className="flex flex-col gap-0.5">
                        <div className={`
                            px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm
                            ${isMe 
                                ? 'bg-[#452184] text-white rounded-br-none'
                                : 'bg-[#483490] backdrop-blur-sm text-gray-100 rounded-bl-none border border-white/5'
                            }
                        `}>
                            {msg.text}
                        </div>
                        <span className={`text-[10px] text-gray-400 font-medium ${isMe ? 'text-right' : 'text-left'}`}>
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
      <div className="p-3 bg-gradient-to-r from-[#373185] to-[#171d40] border-t border-white/5">
        <div className="max-w-4xl mx-auto bg-[#2d346a] rounded-full px-1 py-1 flex items-center gap-1 border border-white/5 shadow-lg">
            
            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition">
                <ImageIcon size={18} />
            </button>

            <input 
                className="flex-1 bg-transparent outline-none text-white text-sm px-2 py-1 placeholder-gray-500 font-medium h-8"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />

            <div className="flex items-center gap-1 pr-1">
                {input.trim() ? (
                    <button 
                        onClick={handleSend} 
                        className="p-2 bg-[#6d28d9] text-white rounded-full hover:bg-[#5b21b6] transition shadow-md"
                    >
                        <ArrowRight size={18} />
                    </button>
                ) : (
                    <>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition">
                            <Paperclip size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition">
                            <Mic size={18} />
                        </button>
                    </>
                )}
            </div>
        </div>
      </div>

    </div>
  );
};

export default ChatArea;