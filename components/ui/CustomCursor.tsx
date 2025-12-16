import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = 'none';

    const onMouseMove = (e: MouseEvent) => {
      // Main dot follows instantly
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: 'power2.out'
        });
      }
      // Follower ring has delay/inertia
      if (followerRef.current) {
        gsap.to(followerRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.4,
          ease: 'power2.out'
        });
      }

      // Check hover state for interactive elements
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.tagName === 'INPUT' ||
        target.closest('button') || 
        target.closest('a') || 
        target.closest('.cursor-pointer') ||
        target.getAttribute('role') === 'button';
      
      setIsHovering(!!isInteractive);
    };

    const onScroll = () => {
      setIsScrolling(true);
      clearTimeout((window as any).scrollTimeout);
      (window as any).scrollTimeout = setTimeout(() => setIsScrolling(false), 150);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <>
      <style>{`
        body, a, button, input, textarea, select { cursor: none !important; }
      `}</style>
      
      {/* Center Dot */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-cyan-500 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#00E5FF]"
      />
      
      {/* Follower Ring */}
      <div 
        ref={followerRef} 
        className={`fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 flex items-center justify-center
          ${isHovering ? 'w-12 h-12 border-2 border-cyan-400 bg-cyan-900/20' : 'w-8 h-8 border border-cyan-500/50'}
          ${isScrolling ? 'w-10 h-10 border-dashed border-cyan-300 animate-spin-slow' : 'rounded-full'}
        `}
        style={{ borderRadius: isScrolling ? '40%' : '50%' }}
      >
        {/* Decorative markers on the ring */}
        <div className={`absolute w-1 h-1 bg-cyan-500 rounded-full top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity ${isHovering || isScrolling ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className={`absolute w-1 h-1 bg-cyan-500 rounded-full bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 transition-opacity ${isHovering || isScrolling ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </>
  );
};

export default CustomCursor;
