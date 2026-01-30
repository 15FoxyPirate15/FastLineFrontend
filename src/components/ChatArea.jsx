import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';

const ChatArea = ({ chatName, isAi, currentUser }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: isAi ? "Привіт! Я твій AI асистент. Чим допомогти?" : "Привіт! Як справи з проектом?", sender: 'them' }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg = { id: Date.now(), text: input, sender: 'me' };
    setMessages(prev => [...prev, newMsg]);
    setInput("");

    setTimeout(() => {
      const reply = { 
        id: Date.now() + 1, 
        text: isAi ? `Я проаналізував: "${input}". Ось звіт...` : "Ок, зрозумів, гляну пізніше.", 
        sender: 'them' 
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full text-white">
      <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAi ? 'bg-purple-600' : 'bg-blue-600'}`}>
           {isAi ? <Bot size={20}/> : <User size={20}/>}
        </div>
        <div>
          <h2 className="font-bold">{chatName}</h2>
          <p className="text-xs text-gray-400">{isAi ? "Always online" : "Last seen recently"}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-message`}>
             <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
               msg.sender === 'me' 
                 ? 'bg-blue-600 text-white rounded-br-none' 
                 : 'bg-white/10 text-gray-200 rounded-bl-none'
             }`}>
               {msg.text}
             </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2 bg-black/30 rounded-xl p-2 border border-white/10">
          <input 
            className="flex-1 bg-transparent outline-none text-sm px-2 placeholder-gray-500"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="p-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;