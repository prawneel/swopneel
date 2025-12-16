import React from 'react';
import { playClickSound, playThrusterSound } from '../../services/audioService';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    playClickSound();
    playThrusterSound();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="w-full py-8 bg-black/80 border-t border-cyan-900/50 backdrop-blur-sm relative z-20 mt-20 pointer-events-auto">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start">
          <h4 className="text-cyan-500 font-mono-tech tracking-widest uppercase font-bold text-lg">Stark Industries</h4>
          <p className="text-gray-500 text-xs font-mono-tech mt-1">Advanced Weaponry & Web Development</p>
        </div>

        <button 
          onClick={scrollToTop}
          className="group relative px-6 py-2 bg-transparent border border-cyan-500/30 text-cyan-500 font-mono-tech text-sm uppercase tracking-widest hover:bg-cyan-900/20 hover:border-cyan-400 hover:text-cyan-300 transition-all duration-300 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <span className="transform group-hover:-translate-y-1 transition-transform">▲</span>
            INITIATE ASCENT
          </span>
          <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>

        <div className="flex gap-6 items-center">
           <span className="text-gray-600 text-xs font-mono-tech">
             © 2025 ALL RIGHTS RESERVED
           </span>
           <div className="flex gap-2">
              {[1,2,3].map(i => (
                  <div key={i} className={`w-1 h-1 bg-cyan-500/50 rounded-full animate-pulse`} style={{animationDelay: `${i * 0.2}s`}}></div>
              ))}
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;