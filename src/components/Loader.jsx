import React from 'react';
import { Zap } from 'lucide-react';

const Loader = ({ title = "Loading...", subtitle = "Please wait a moment." }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#030408]/80 backdrop-blur-md animate-in fade-in duration-300">
      
      <div className="flex flex-col items-center bg-[#101426] border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(109,40,217,0.15)] max-w-sm w-full mx-4 animate-in zoom-in-95 duration-500">
        
        <div className="relative mb-6">
           <div className="absolute inset-0 bg-[#6d28d9] blur-xl opacity-50 rounded-full animate-pulse"></div>
           <div className="w-16 h-16 bg-gradient-to-tr from-[#6d28d9] to-[#3b82f6] rounded-2xl flex items-center justify-center relative z-10 shadow-lg animate-bounce" style={{ animationDuration: '2s' }}>
              <Zap size={32} className="text-white" />
           </div>
        </div>

        <h3 className="text-white text-xl font-bold mb-2 tracking-tight">{title}</h3>
        <p className="text-[#a19bfe] text-sm text-center font-medium">{subtitle}</p>
        
        {/* FastLine ProgressBar */}
        <div className="w-full h-1 bg-white/5 rounded-full mt-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-[#8b5cf6] to-[#3b82f6] w-1/2 rounded-full fastline-loader"></div>
        </div>

      </div>

      <style>{`
        .fastline-loader {
          animation: loadingLine 1.5s ease-in-out infinite alternate;
        }
        @keyframes loadingLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default Loader;