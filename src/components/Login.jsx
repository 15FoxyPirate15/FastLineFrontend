import React, { useState, useEffect } from 'react';
import Loader from './Loader'; 
import { ShieldCheck, Users, Kanban, Zap } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const getFriendlyErrorMessage = (errorMsg) => {
  if (!errorMsg) return "Something went wrong. Please try again.";
  const msg = errorMsg.toUpperCase();
  
  if (msg.includes('INVALID_LOGIN_CREDENTIALS') || msg.includes('WRONG-PASSWORD') || msg.includes('USER-NOT-FOUND')) {
    return "Invalid email or password. Please try again.";
  }
  if (msg.includes('EMAIL-ALREADY-IN-USE') || msg.includes('EXISTS')) {
    return "This email is already registered. Please sign in.";
  }
  if (msg.includes('WEAK-PASSWORD')) {
    return "Password is too weak. Use at least 6 characters.";
  }
  if (msg.includes('INVALID-EMAIL')) {
    return "Please enter a valid email address.";
  }
  
  return "Authentication failed. Please try again.";
};

const AnimatedLinesBackground = () => {
  const [lines, setLines] = useState([]);
  
  useEffect(() => {
    const generatedLines = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${3 + Math.random() * 4}s`,
      opacity: 0.1 + Math.random() * 0.5,
      width: `${50 + Math.random() * 150}px`
    }));
    setLines(generatedLines);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1e1b4b] via-[#080a14] to-[#030408]">
      <style>
        {`
          .fast-line {
            position: absolute;
            background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.8), #fff);
            height: 1px;
            border-radius: 999px;
            filter: drop-shadow(0 0 8px rgba(139, 92, 246, 1));
            animation: shoot linear infinite;
            left: -200px;
          }
          @keyframes shoot {
            0% { transform: translateX(-10vw); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateX(110vw); opacity: 0; }
          }
        `}
      </style>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen"></div>
      {lines.map((line) => (
        <div key={line.id} className="fast-line" style={{ top: line.top, width: line.width, opacity: line.opacity, animationDuration: line.duration, animationDelay: line.delay }} />
      ))}
    </div>
  );
};

const DefinitionSide = () => (
  <div className="flex flex-col gap-10 text-white animate-in fade-in slide-in-from-left-8 duration-1000 ease-out z-10 relative">
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6d28d9] to-[#3b82f6] flex items-center justify-center shadow-[0_0_20px_rgba(109,40,217,0.4)]">
          <Zap size={24} className="text-white" />
        </div>
        <h1 className="text-4xl font-black tracking-tight">FastLine</h1>
      </div>
      <p className="text-[#a19bfe] text-lg max-w-md leading-relaxed font-medium">
        Your secure workspace for team collaboration, project management, and professional communication.
      </p>
    </div>

    <div className="space-y-8 mt-4">
      <div className="flex gap-4 group">
        <div className="mt-1"><ShieldCheck size={26} className="text-[#a19bfe] group-hover:scale-110 group-hover:text-white transition-all" /></div>
        <div>
          <h3 className="text-lg font-bold text-gray-100 group-hover:text-white transition-colors">End-to-end encryption</h3>
          <p className="text-gray-400 text-sm mt-1 leading-relaxed">Your messages are secure with military-grade encryption.</p>
        </div>
      </div>
      <div className="flex gap-4 group">
        <div className="mt-1"><Users size={26} className="text-[#3b82f6] group-hover:scale-110 group-hover:text-white transition-all" /></div>
        <div>
          <h3 className="text-lg font-bold text-gray-100 group-hover:text-white transition-colors">Real-time collaboration</h3>
          <p className="text-gray-400 text-sm mt-1 leading-relaxed">Work together seamlessly with your team in real-time.</p>
        </div>
      </div>
      <div className="flex gap-4 group">
        <div className="mt-1"><Kanban size={26} className="text-[#ec4899] group-hover:scale-110 group-hover:text-white transition-all" /></div>
        <div>
          <h3 className="text-lg font-bold text-gray-100 group-hover:text-white transition-colors">Project management tools</h3>
          <p className="text-gray-400 text-sm mt-1 leading-relaxed">Organize tasks, schedule meetings, and track progress.</p>
        </div>
      </div>
    </div>
  </div>
);

export default function Login({ onLoginSuccess }) {
  const [view, setView] = useState('login'); 
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData, setRegData] = useState({ full_name: '', email: '', password: '' });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('https://backendfastline.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user)); 
        setTimeout(() => {
          setIsLoading(false);
          if (onLoginSuccess) onLoginSuccess(data.user); 
        }, 1000);
      } else {
        setIsLoading(false);
        toast.error(getFriendlyErrorMessage(data.message), { style: { background: '#1e1b2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("Server connection error. Please try again.", { style: { background: '#1e1b2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('https://backendfastline.onrender.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });
      
      let data = {};
      try { data = await response.json(); } catch (e) {}

      if (response.ok) {
        setTimeout(() => {
          setIsLoading(false);
          toast.success("Account created successfully! Please sign in.", { style: { background: '#1e1b2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
          setView('login'); 
        }, 1000);
      } else {
        setIsLoading(false);
        toast.error(getFriendlyErrorMessage(data.message || "Registration error"), { style: { background: '#1e1b2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
      }
    } catch (err) {
      setIsLoading(false);
      toast.error("Server connection error. Please try again.", { style: { background: '#1e1b2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }});
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#030408]">
      
      <Toaster position="top-center" />
      {isLoading && <Loader title={view === 'login' ? "Signing in..." : "Creating account..."} subtitle="Connecting to your secure workspace." />}

      <AnimatedLinesBackground />

      <div className="max-w-[1100px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center z-10 relative py-12">
        
        <DefinitionSide />
        
        <div className="flex justify-center lg:justify-end animate-in fade-in slide-in-from-bottom-12 zoom-in-95 duration-1000 ease-out">
          
          <div className="w-full max-w-[420px] bg-[#101426]/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            
            {/* TOGGLE */}
            <div className="flex bg-[#060813] p-1.5 rounded-xl mb-8 border border-white/5 shadow-inner relative z-10">
              <button 
                type="button"
                onClick={() => setView('login')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${view === 'login' ? 'bg-[#6d28d9] text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => setView('register')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${view === 'register' ? 'bg-[#6d28d9] text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Register
              </button>
            </div>

            <div key={view} className="animate-in fade-in slide-in-from-left-2 duration-300 relative z-10">
              
              {view === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email" placeholder="name@company.com" required
                      className="w-full bg-[#060813]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#6d28d9] focus:ring-1 focus:ring-[#6d28d9] transition-all shadow-inner"
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                    <input 
                      type="password" placeholder="••••••••" required
                      className="w-full bg-[#060813]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#6d28d9] focus:ring-1 focus:ring-[#6d28d9] transition-all shadow-inner"
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <a href="#" className="text-xs font-bold text-[#a19bfe] hover:text-white transition-colors">Forgot password?</a>
                  </div>

                  <button type="submit" className="w-full bg-gradient-to-r from-[#6d28d9] to-[#5b21b6] text-white font-bold text-sm py-3.5 rounded-xl shadow-[0_4px_15px_rgba(109,40,217,0.3)] hover:shadow-[0_6px_20px_rgba(109,40,217,0.5)] transition-all active:scale-[0.98] mt-2">
                    Login securely
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" placeholder="Enter your full name" required
                      className="w-full bg-[#060813]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#6d28d9] focus:ring-1 focus:ring-[#6d28d9] transition-all shadow-inner"
                      onChange={(e) => setRegData({...regData, full_name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email" placeholder="name@company.com" required
                      className="w-full bg-[#060813]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#6d28d9] focus:ring-1 focus:ring-[#6d28d9] transition-all shadow-inner"
                      onChange={(e) => setRegData({...regData, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                    <input 
                      type="password" placeholder="Create a strong password" required
                      className="w-full bg-[#060813]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#6d28d9] focus:ring-1 focus:ring-[#6d28d9] transition-all shadow-inner"
                      onChange={(e) => setRegData({...regData, password: e.target.value})}
                    />
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <input type="checkbox" id="terms" className="mt-1 w-4 h-4 rounded bg-[#060813] border-gray-600 text-[#6d28d9] focus:ring-[#6d28d9] cursor-pointer" required/>
                    <label htmlFor="terms" className="text-xs text-gray-400 leading-relaxed cursor-pointer relative z-20">
                      I agree to the <a href="#" className="text-[#a19bfe] font-bold hover:text-white transition-colors relative z-30">Terms of Service</a> and <a href="#" className="text-[#a19bfe] font-bold hover:text-white transition-colors relative z-30">Privacy Policy</a>
                    </label>
                  </div>

                  <button type="submit" className="w-full bg-gradient-to-r from-[#6d28d9] to-[#5b21b6] text-white font-bold text-sm py-3.5 rounded-xl shadow-[0_4px_15px_rgba(109,40,217,0.3)] hover:shadow-[0_6px_20px_rgba(109,40,217,0.5)] transition-all active:scale-[0.98] mt-2 relative z-20">
                    Create Account
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}