import React, { useEffect, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import Scene from './components/3d/Scene';
import ContentOverlay from './components/ContentOverlay';
import JarvisWidget from './components/JarvisWidget';
import AdminPanel from './components/AdminPanel';
import CustomCursor from './components/ui/CustomCursor';

const App: React.FC = () => {
  const [scrolling, setScrolling] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Handle Routing (Hash-based to prevent reload errors)
  useEffect(() => {
    const checkHash = () => {
      setIsAdmin(window.location.hash === '#admin');
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Handle Scroll System (Only active when NOT in admin mode)
  useEffect(() => {
    if (isAdmin) return;

    // 1. Fine-Tuned Scroll Physics (Heavier, smoother feel)
    const lenis = new Lenis({
      duration: 2.0, // Increased duration for "weight"
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8, // Slower scroll for detail
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    // Track scrolling for visual effects
    lenis.on('scroll', (e: any) => {
        setScrolling(Math.abs(e.velocity) > 1);
    });

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, [isAdmin]);

  if (isAdmin) {
    return <AdminPanel />;
  }

  return (
    <main className={`relative w-full min-h-screen bg-[#050505] text-white overflow-hidden`}>
      
      <CustomCursor />

      {/* 3D Scene Background */}
      <div className={`fixed inset-0 z-0 w-full h-full pointer-events-auto transition-transform duration-200`}>
        <Scene />
      </div>

      {/* Tech Grid Overlay - Interactive Opacity based on Scroll */}
      <div 
        className={`fixed inset-0 z-[2] bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none transition-opacity duration-700 ${scrolling ? 'opacity-60' : 'opacity-20'}`}
      ></div>

      {/* Main Content */}
      <ContentOverlay />

      {/* AI Assistant */}
      <JarvisWidget />

      {/* Loading Screen */}
      <div className="fixed inset-0 bg-black z-[100] pointer-events-none animate-fadeOut flex items-center justify-center" style={{ animation: 'fadeOut 1.5s ease-in-out 0.5s forwards' }}>
        <div className="flex flex-col items-center gap-4">
             <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
             <div className="text-cyan-500 font-mono-tech animate-pulse tracking-widest">CALIBRATING MARK 85...</div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeOut {
          to { opacity: 0; pointer-events: none; }
        }
        .clip-path-slant {
          clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
        }
      `}</style>
    </main>
  );
};

export default App;