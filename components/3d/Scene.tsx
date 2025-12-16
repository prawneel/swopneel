import React, { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, Environment, Float } from '@react-three/drei';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import IronManSuit from './IronManSuit';
import { MathUtils } from 'three';

gsap.registerPlugin(ScrollTrigger);

// --- WARP STARS EFFECT ---
const WarpStars = () => {
  const starsRef = useRef<any>(null);
  useFrame(() => {
    if (starsRef.current) {
      const scrollVel = ScrollTrigger.getById('main-scroll')?.getVelocity() || 0;
      starsRef.current.rotation.z += 0.0005 + (scrollVel * 0.00005);
    }
  });
  return <group ref={starsRef}><Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1} /></group>;
};

// --- CINEMATIC CONTROLLER ---
const CinematicController = () => {
  const { camera } = useThree();
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    camera.position.set(0, 0, 4.5);
    const ctx = gsap.context(() => {
      tl.current = gsap.timeline({
        id: 'main-scroll',
        scrollTrigger: {
          trigger: '#content', 
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2, 
        },
      });
      // Scan Phase
      tl.current.to(camera.position, { z: 5, y: -0.5, duration: 2 }, 0);
      
      // Mid Section (Was Combat, now Namaste) - Dynamic angle
      tl.current.to(camera.rotation, { z: -0.05, duration: 1 }, 1.5);
      tl.current.to(camera.position, { x: 0, z: 5.5, duration: 1 }, 1.5);

      // Project Phase (Stabilize)
      tl.current.to(camera.rotation, { z: 0, duration: 1 }, 3.5);
      tl.current.to(camera.position, { x: 0, z: 5, duration: 1 }, 3.5);
    });
    return () => ctx.revert();
  }, [camera]);
  return null;
};

// Spinning Tech Rings (Parallax)
const DataRing = ({ radius, speed, color, rotation }: { radius: number, speed: number, color: string, rotation: [number, number, number] }) => {
  const ringRef = useRef<any>(null);
  useFrame((state, delta) => {
    if (ringRef.current) ringRef.current.rotation.z += delta * speed;
  });
  return (
    <mesh ref={ringRef} rotation={rotation}>
        <torusGeometry args={[radius, 0.02, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} wireframe />
    </mesh>
  );
};

const Experience: React.FC = () => {
  return (
    <Canvas 
      dpr={[1, 1.5]} 
      camera={{ fov: 50, position: [0,0,5] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      className="!fixed top-0 left-0 w-full h-full z-0"
    >
      <CinematicController />
      
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} color="#ffffff" />
      <spotLight position={[5, 5, 5]} angle={0.5} penumbra={1} intensity={2} color="#FFD700" castShadow />
      <spotLight position={[-5, 2, -2]} angle={0.5} penumbra={1} intensity={3} color="#00E5FF" />
      <pointLight position={[0, -5, 2]} intensity={0.5} color="#C8102E" />

      {/* Environment */}
      <Environment preset="city" />
      <WarpStars />
      <Sparkles count={100} scale={15} size={2} speed={0.4} opacity={0.5} color="#00E5FF" />
      
      {/* Parallax Tech Background */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
         <group position={[0, 0, -5]}>
            <DataRing radius={6} speed={0.05} color="#00E5FF" rotation={[0.5, 0, 0]} />
            <DataRing radius={8} speed={-0.03} color="#C8102E" rotation={[0.2, 0.5, 0]} />
         </group>
      </Float>

      {/* The Hero Model */}
      <IronManSuit position={[0, -0.5, 0]} scale={0.9} />
    </Canvas>
  );
};

export default Experience;
