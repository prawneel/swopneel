import React from 'react';
import { playHoverSound } from '../../services/audioService';

interface HologramCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  onClick?: () => void;
  isInteractive?: boolean;
}

const HologramCard: React.FC<HologramCardProps> = ({ children, title, className = '', onClick, isInteractive = false }) => {
  
  const handleMouseEnter = () => {
    if (isInteractive) playHoverSound();
  };

  return (
    <div 
      className={`relative group ${className} ${isInteractive ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
    >
      {/* Holographic Border Effects */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-100 group-hover:blur-md transition duration-500"></div>
      
      <div className={`relative bg-[#0a0a0a]/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 overflow-hidden transition-all duration-300 ${isInteractive ? 'group-hover:scale-[1.02] group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]' : ''}`}>
        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,6px_100%] opacity-50"></div>
        
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 opacity-70 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 opacity-70 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 opacity-70 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 opacity-70 group-hover:opacity-100 transition-opacity"></div>

        {title && (
          <h3 className="text-cyan-400 font-mono-tech text-xl mb-4 uppercase tracking-widest relative z-10 drop-shadow-[0_0_5px_rgba(0,229,255,0.5)] group-hover:text-cyan-300 transition-colors">
            {title}
          </h3>
        )}
        
        <div className="relative z-10 text-gray-300 group-hover:text-white transition-colors">
          {children}
        </div>
      </div>
    </div>
  );
};

export default HologramCard;
