import React, { useState } from 'react';
import { playClickSound, toggleMute, isSystemMuted } from '../../services/audioService';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(isSystemMuted());

  const scrollTo = (id: string) => {
    playClickSound();
    setIsOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleMenu = () => {
    playClickSound();
    setIsOpen(!isOpen);
  };

  const handleMuteToggle = () => {
    const muted = toggleMute();
    setIsMuted(muted);
    if (!muted) playClickSound();
  };

  const navItems = ['About', 'Skills', 'Projects', 'Contact'];

  return (
    <>
    <nav className="fixed top-0 left-0 w-full z-40 px-6 py-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-black/40 backdrop-blur-md border border-cyan-500/30 px-6 py-3 rounded-full pointer-events-auto shadow-[0_0_20px_rgba(0,229,255,0.1)] relative z-50">
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_#00E5FF]"></div>
           <span className="text-white font-mono-tech tracking-widest text-lg font-bold">SWOPNIL<span className="text-cyan-500">.06</span></span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          {navItems.map((item) => (
            <button 
              key={item}
              onClick={() => scrollTo(item.toLowerCase())}
              className="text-cyan-100/70 hover:text-cyan-400 font-mono-tech uppercase text-sm tracking-wider transition-all hover:drop-shadow-[0_0_5px_#00E5FF]"
            >
              {item}
            </button>
          ))}
          
          <div className="h-4 w-[1px] bg-cyan-900/50 mx-2"></div>

          <button 
            onClick={handleMuteToggle}
            className="text-cyan-500/60 hover:text-cyan-400 font-mono-tech text-xs border border-cyan-500/30 px-2 py-1 rounded transition-all hover:bg-cyan-500/20"
          >
            {isMuted ? 'AUDIO: OFF' : 'AUDIO: ON'}
          </button>

          <div 
              onClick={() => window.location.hash = 'admin'}
              className="text-xs font-mono-tech text-cyan-500/60 border border-cyan-500/30 px-2 py-1 rounded cursor-pointer hover:bg-cyan-500/20 hover:text-cyan-400 transition-all"
              title="Access Admin Panel"
          >
            SYS.V.85
          </div>
        </div>

        {/* Mobile Menu Button (Hamburger) */}
        <button 
          onClick={toggleMenu}
          className="md:hidden text-cyan-500 flex flex-col gap-1.5 w-8 items-end group"
        >
          <div className={`h-0.5 bg-cyan-500 transition-all duration-300 ${isOpen ? 'w-8 rotate-45 translate-y-2' : 'w-8'}`}></div>
          <div className={`h-0.5 bg-cyan-500 transition-all duration-300 ${isOpen ? 'opacity-0' : 'w-6'}`}></div>
          <div className={`h-0.5 bg-cyan-500 transition-all duration-300 ${isOpen ? 'w-8 -rotate-45 -translate-y-2' : 'w-4'}`}></div>
        </button>
      </div>
    </nav>

    {/* Mobile Overlay Menu */}
    <div className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-30 transition-all duration-500 flex flex-col items-center justify-center pointer-events-auto md:hidden ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
       {/* Tech Grid Background */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
       
       <div className="flex flex-col gap-8 text-center relative z-10">
          {navItems.map((item, idx) => (
             <button 
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="text-3xl text-white font-mono-tech uppercase tracking-widest hover:text-cyan-400 transition-all transform hover:scale-110"
                style={{ transitionDelay: `${idx * 0.1}s` }}
             >
                {item}
             </button>
          ))}
          
          <button 
            onClick={handleMuteToggle}
            className="text-xl text-cyan-500/80 font-mono-tech uppercase tracking-widest mt-4 border border-cyan-500/30 px-4 py-2"
          >
            {isMuted ? 'UNMUTE SYSTEM' : 'MUTE SYSTEM'}
          </button>

          {/* Mobile Admin Link */}
          <button 
             onClick={() => window.location.hash = 'admin'}
             className="text-xs text-cyan-900 border border-cyan-900/50 px-4 py-2 mt-4 rounded hover:text-cyan-500 hover:border-cyan-500 transition-colors font-mono-tech"
          >
             ADMIN_ACCESS
          </button>
       </div>
       <div className="absolute bottom-10 text-cyan-800 font-mono-tech text-xs">
          SYSTEM NAVIGATION // ONLINE
       </div>
    </div>
    </>
  );
};

export default Navbar;