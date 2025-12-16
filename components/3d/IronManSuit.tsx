import React, { useRef, useLayoutEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshStandardMaterial, MeshPhysicalMaterial, Group, MathUtils } from 'three';
import { Sparkles } from '@react-three/drei';
import gsap from 'gsap';

// --- SUB-COMPONENTS ---
const ThrusterPlume = ({ position, scale = 1 }: { position: [number, number, number], scale?: number }) => {
  const plumeRef = useRef<any>(null);
  
  // Create material once
  const thrusterMat = useMemo(() => new MeshStandardMaterial({
    color: "#FF4500",
    emissive: "#FF4500",
    emissiveIntensity: 3,
    transparent: true,
    opacity: 0.8,
    toneMapped: false
  }), []);

  useFrame(() => {
    if (plumeRef.current) {
      plumeRef.current.scale.y = (Math.random() * 0.2 + 0.9) * scale;
      plumeRef.current.intensity = Math.random() * 0.2 + 0.8;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, -0.2 * scale, 0]} rotation={[Math.PI, 0, 0]} ref={plumeRef}>
        <coneGeometry args={[0.08 * scale, 0.4 * scale, 8, 1, true]} />
        <primitive object={thrusterMat} attach="material" />
      </mesh>
      <Sparkles count={15} scale={0.6 * scale} size={4} speed={3} opacity={0.8} color="#00FFFF" position={[0, -0.4 * scale, 0]} />
    </group>
  );
};

// --- COMPONENT ---
const IronManSuit = (props: any) => {
  const group = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const torsoRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightForearmRef = useRef<Group>(null);
  const leftForearmRef = useRef<Group>(null);
  
  const [thrustersActive, setThrustersActive] = useState(true);
  
  // Create Materials - Pristine, High Gloss (No Scratches)
  const { armorRed, armorGold, armorSilver, reactorBlue } = useMemo(() => {
    const red = new MeshPhysicalMaterial({
      color: "#7A0019", // Slightly brighter deep red
      metalness: 0.8,
      roughness: 0.2, // Very shiny
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      emissive: "#200000",
      emissiveIntensity: 0.1
    });

    const gold = new MeshPhysicalMaterial({
      color: "#FFD700", // Pure Gold
      metalness: 0.9,
      roughness: 0.2, // Very shiny
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const silver = new MeshStandardMaterial({
      color: "#C0C0C0",
      metalness: 0.95,
      roughness: 0.3,
    });

    const blue = new MeshStandardMaterial({
        color: "#00FFFF",
        emissive: "#00FFFF",
        emissiveIntensity: 4,
        toneMapped: false
    });

    return { armorRed: red, armorGold: gold, armorSilver: silver, reactorBlue: blue };
  }, []);

  // Scroll Animations / Poses
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!group.current || !rightArmRef.current || !leftArmRef.current || !rightForearmRef.current || !leftForearmRef.current) return;

      // --- INITIAL POSE (Hello / Wave) ---
      // Positioned for Landing Page
      group.current.position.set(0, -1, 0); 
      
      // POSE: RIGHT Arm Wave (Viewer's Left)
      // Shoulder: Raised diagonally (~2.5 rad) - Outwards/Away from head
      rightArmRef.current.rotation.set(0, 0, 2.5);
      // Forearm: Straight for a big open wave
      rightForearmRef.current.rotation.set(0, 0, 0);
      
      // POSE: Relaxed Left Arm (Viewer's Right)
      leftArmRef.current.rotation.set(0, 0, -0.2); 

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#content',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2.0, 
        }
      });

      // 1. Landing -> About (Arms down, Scan/Hover)
      // Reset the waving arm (Right) to neutral (Slightly Outwards: 0.2)
      tl.to(rightArmRef.current.rotation, { z: 0.2, x: 0, y: 0, duration: 2 }, 0); 
      tl.to(rightForearmRef.current.rotation, { x: 0, z: 0, duration: 2 }, 0); 
      // Ensure left arm stays/moves to neutral (Slightly Outwards: -0.2)
      tl.to(leftArmRef.current.rotation, { z: -0.2, x: 0, y: 0, duration: 2 }, 0);

      tl.to(group.current.position, { y: -0.5, z: 1, duration: 2 }, 0);

      // 2. About -> Skills (Move to side)
      tl.to(group.current.position, { x: -1.5, y: -1, z: 0, duration: 3 });
      tl.to(group.current.rotation, { y: 0.5, duration: 3 }, "<");
      tl.to(rightArmRef.current.rotation, { z: -1, x: 0, duration: 3 }, "<");
      tl.to(leftArmRef.current.rotation, { z: 1, x: 0, duration: 3 }, "<");

      // 3. Skills -> NAMASTE POSE
      // Center position
      tl.to(group.current.position, { x: 0, y: -0.2, z: -1.5, duration: 2 }); 
      tl.to(group.current.rotation, { y: 0, duration: 2 }, "<");
      
      // NAMASTE ARMS
      // Rotate shoulders inward
      tl.to(rightArmRef.current.rotation, { x: -0.8, y: 0.5, z: -0.3, duration: 1 }, "<"); 
      tl.to(leftArmRef.current.rotation, { x: -0.8, y: -0.5, z: 0.3, duration: 1 }, "<");
      
      // Bend elbows UP to touch hands
      tl.to(rightForearmRef.current.rotation, { x: -1.9, duration: 1 }, "<");
      tl.to(leftForearmRef.current.rotation, { x: -1.9, duration: 1 }, "<");

      // Bow
      tl.to(torsoRef.current.rotation, { x: 0.3, duration: 1 }, "<");

      // Hold Pose
      tl.to(group.current.position, { z: -1.2, duration: 2 });

      // 4. Namaste -> Projects (Presenting)
      tl.to(group.current.position, { x: 1.5, y: -0.5, z: 0, duration: 3 });
      tl.to(group.current.rotation, { y: -0.5, duration: 3 }, "<");
      tl.to(torsoRef.current.rotation, { x: 0, duration: 1 }, "<"); // Unbow
      
      // Reset Arms to present
      tl.to(rightArmRef.current.rotation, { x: 0, z: 0.2, y: 0, duration: 2 }, "<");
      tl.to(leftArmRef.current.rotation, { x: 0, z: -0.2, y: 0, duration: 2 }, "<");
      // Unbend elbows
      tl.to(rightForearmRef.current.rotation, { x: 0, duration: 2 }, "<");
      tl.to(leftForearmRef.current.rotation, { x: 0, duration: 2 }, "<");

      // 5. Projects -> Contact (Fly Away)
      tl.to(group.current.position, { x: 0, y: 3, z: -6, duration: 4 });
      tl.to(group.current.rotation, { y: 0, x: 0.5, duration: 4 }, "<");
      tl.to(rightArmRef.current.rotation, { x: 0, z: 0, duration: 4 }, "<");
      
    });

    return () => ctx.revert();
  }, [armorRed, armorGold, armorSilver]);

  useFrame((state) => {
    if (!group.current || !headRef.current || !torsoRef.current || !rightArmRef.current || !leftArmRef.current) return;
    const t = state.clock.getElapsedTime();

    // Hover Movement
    group.current.position.y += Math.sin(t * 2) * 0.001;

    // --- LANDING PAGE "HELLO" WAVE ANIMATION ---
    // Only active when near top of scroll to prevent conflict with GSAP
    if (Math.abs(window.scrollY) < 50) {
        const waveSpeed = t * 3.5; 
        
        // SHOULDER WAVE (Right Arm / Viewer Left)
        if (rightArmRef.current) {
             // Base position 2.5 (Angled away from head on the right - Outwards)
             // Swaying +/- 0.3 radians
             rightArmRef.current.rotation.z = 2.5 + Math.sin(waveSpeed) * 0.3;
             
             // Minor forward/back sway for 3D depth
             rightArmRef.current.rotation.x = Math.sin(waveSpeed * 0.8) * 0.1;
        }

        // Forearm: Keep relatively straight
        if (rightForearmRef.current) {
            rightForearmRef.current.rotation.x = -0.2; // Slight bend
            rightForearmRef.current.rotation.z = 0; // Lock wrist/elbow rotation
        }
    }

    // Head track mouse (always active for engagement)
    const mouseX = state.mouse.x * 0.5;
    const mouseY = state.mouse.y * 0.5;
    headRef.current.rotation.y = MathUtils.lerp(headRef.current.rotation.y, -mouseX, 0.1);
    headRef.current.rotation.x = MathUtils.lerp(headRef.current.rotation.x, -mouseY, 0.1);
    
    // Torso follows slightly if not bowing
    if (window.scrollY < window.innerHeight * 2) {
       torsoRef.current.rotation.y = MathUtils.lerp(torsoRef.current.rotation.y, -mouseX * 0.3, 0.05);
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <group ref={torsoRef}>
        {/* Torso */}
        <mesh position={[0, 0.2, 0]} material={armorRed}>
          <cylinderGeometry args={[0.35, 0.25, 0.5, 8]} />
        </mesh>
        <mesh position={[0, 0.35, 0.15]} rotation={[0.2, 0, 0]} material={armorGold}>
          <boxGeometry args={[0.55, 0.2, 0.15]} />
        </mesh>
        <mesh position={[-0.2, 0.4, 0.1]} rotation={[0.4, 0, 0.2]} material={armorSilver}>
           <boxGeometry args={[0.1, 0.05, 0.2]} />
        </mesh>
        <mesh position={[0.2, 0.4, 0.1]} rotation={[0.4, 0, -0.2]} material={armorSilver}>
           <boxGeometry args={[0.1, 0.05, 0.2]} />
        </mesh>
        {/* ARC REACTOR */}
        <group position={[0, 0.25, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh material={reactorBlue}>
                <cylinderGeometry args={[0.08, 0.08, 0.05, 32]} />
            </mesh>
            <mesh material={armorSilver}>
                <torusGeometry args={[0.08, 0.01, 16, 32]} />
            </mesh>
        </group>
        <pointLight position={[0, 0.25, 0.3]} distance={3} intensity={2} color="#00FFFF" />
        {/* Abdomen */}
        <mesh position={[0, -0.2, 0]} material={armorGold}>
          <cylinderGeometry args={[0.24, 0.22, 0.4, 8]} />
        </mesh>
        <mesh position={[0, -0.2, 0.12]} material={armorRed}>
           <boxGeometry args={[0.2, 0.3, 0.05]} />
        </mesh>

        {/* Head Group */}
        <group ref={headRef} position={[0, 0.55, 0]}>
          <mesh position={[0, -0.1, 0]} material={armorSilver}>
            <cylinderGeometry args={[0.1, 0.12, 0.15]} />
          </mesh>
          <mesh position={[0, 0.1, 0]} material={armorRed}>
            <boxGeometry args={[0.28, 0.35, 0.32]} />
          </mesh>
          <mesh position={[0, 0.1, 0.165]} material={armorGold}>
            <planeGeometry args={[0.2, 0.25]} />
          </mesh>
          <mesh position={[-0.06, 0.12, 0.17]} material={reactorBlue}><planeGeometry args={[0.06, 0.02]} /></mesh>
          <mesh position={[0.06, 0.12, 0.17]} material={reactorBlue}><planeGeometry args={[0.06, 0.02]} /></mesh>
          <mesh position={[0.15, 0.1, 0]} rotation={[0, 0, Math.PI / 2]} material={armorSilver}><cylinderGeometry args={[0.08, 0.08, 0.05, 16]} /></mesh>
          <mesh position={[-0.15, 0.1, 0]} rotation={[0, 0, Math.PI / 2]} material={armorSilver}><cylinderGeometry args={[0.08, 0.08, 0.05, 16]} /></mesh>
        </group>

        {/* Shoulders */}
        <mesh position={[-0.45, 0.35, 0]} material={armorGold}><sphereGeometry args={[0.18, 16, 16]} /></mesh>
        <mesh position={[0.45, 0.35, 0]} material={armorGold}><sphereGeometry args={[0.18, 16, 16]} /></mesh>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.45, 0.35, 0]}>
           {/* UPPER ARM: GOLD */}
           <mesh position={[0.1, -0.3, 0]} rotation={[0, 0, -0.2]} material={armorGold}>
             <cylinderGeometry args={[0.1, 0.09, 0.45]} />
           </mesh>
           {/* Right Forearm Group (Attached to elbow pivot area) */}
           <group ref={rightForearmRef} position={[0.15, -0.6, 0]}>
             <mesh position={[0, -0.2, 0]} material={armorGold}><boxGeometry args={[0.14, 0.4, 0.14]} /></mesh>
             <mesh position={[0, -0.45, 0]} material={armorRed}><boxGeometry args={[0.1, 0.15, 0.05]} /></mesh>
             <mesh position={[0, -0.45, 0]} rotation={[Math.PI/2, 0, 0]} material={reactorBlue}><circleGeometry args={[0.03]} /></mesh>
             <ThrusterPlume position={[0, -0.5, 0]} scale={0.4} />
           </group>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.45, 0.35, 0]}>
           {/* UPPER ARM: GOLD */}
           <mesh position={[-0.1, -0.3, 0]} rotation={[0, 0, 0.2]} material={armorGold}>
             <cylinderGeometry args={[0.1, 0.09, 0.45]} />
           </mesh>
           {/* Left Forearm Group (Attached to elbow pivot area) */}
           <group ref={leftForearmRef} position={[-0.15, -0.6, 0]}>
             <mesh position={[0, -0.2, 0]} material={armorGold}><boxGeometry args={[0.14, 0.4, 0.14]} /></mesh>
             <mesh position={[0, -0.45, 0]} material={armorRed}><boxGeometry args={[0.1, 0.15, 0.05]} /></mesh>
              <mesh position={[0, -0.45, 0]} rotation={[Math.PI/2, 0, 0]} material={reactorBlue}><circleGeometry args={[0.03]} /></mesh>
             <ThrusterPlume position={[0, -0.5, 0]} scale={0.4} />
           </group>
        </group>
      </group>

      {/* Legs (Simplified) */}
      <group position={[0, -0.4, 0]}>
        <mesh position={[0, 0, 0]} material={armorRed}><boxGeometry args={[0.4, 0.25, 0.25]} /></mesh>
        <group position={[-0.2, -0.5, 0]}>
            <mesh material={armorGold}><cylinderGeometry args={[0.13, 0.1, 0.7]} /></mesh>
             <group position={[0, -1.3, 0.15]} rotation={[0.4, 0, 0]}>
                <mesh material={armorRed}><boxGeometry args={[0.15, 0.1, 0.25]} /></mesh>
                {thrustersActive && <ThrusterPlume position={[0, -0.1, 0]} scale={2.5} />}
             </group>
        </group>
        <group position={[0.2, -0.5, 0]}>
            <mesh material={armorGold}><cylinderGeometry args={[0.13, 0.1, 0.7]} /></mesh>
             <group position={[0, -1.3, 0.15]} rotation={[0.4, 0, 0]}>
                <mesh material={armorRed}><boxGeometry args={[0.15, 0.1, 0.25]} /></mesh>
                {thrustersActive && <ThrusterPlume position={[0, -0.1, 0]} scale={2.5} />}
             </group>
        </group>
      </group>
    </group>
  );
};

export default IronManSuit;