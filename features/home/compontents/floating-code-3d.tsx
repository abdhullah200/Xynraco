"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei";
import * as THREE from "three";

// Floating code character
function FloatingCodeChar({ 
  position, 
  char, 
  delay = 0 
}: { 
  position: [number, number, number]; 
  char: string;
  delay?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame(() => {
    if (!meshRef.current) return;
    timeRef.current += 0.01;
    
    // Floating animation
    meshRef.current.position.y = position[1] + Math.sin(timeRef.current * 0.8 + delay) * 0.4;
    meshRef.current.rotation.y += 0.01;
    meshRef.current.position.x = position[0] + Math.cos(timeRef.current * 0.6 + delay) * 0.2;
  });

  const colors = ["#05cdff", "#3f5be4", "#6746d4"] as const;
  const color = colors[Math.floor(Math.random() * 3)];

  return (
    <group ref={meshRef} position={position}>
      <mesh>
        <boxGeometry args={[0.3, 0.3, 0.05]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Simplified representation without font dependency */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[0.25, 0.25, 0.02]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

// Main floating code scene
function FloatingCodeScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.003;
  });

  const codeChars = ["{", "}", "<", ">", "(", ")", "[", "]", ";", "=", "=>", "fn"];
  const positions: [number, number, number][] = codeChars.map((_, i) => {
    const angle = (i / codeChars.length) * Math.PI * 2;
    const radius = 2.5;
    return [
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 3,
      Math.sin(angle) * radius,
    ] as [number, number, number];
  });

  return (
    <group ref={groupRef}>
      {codeChars.map((char, index) => (
        <FloatingCodeChar
          key={index}
          position={positions[index]}
          char={char}
          delay={index * 0.3}
        />
      ))}
      
      {/* Central glowing orb */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#05cdff"
          emissive="#05cdff"
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

export function FloatingCode3D({ className }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className || ""}`}>
      <Canvas
        style={{ background: "transparent" }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#05cdff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6746d4" />
        <directionalLight position={[0, 5, 5]} intensity={0.8} />
        
        <FloatingCodeScene />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={(2 * Math.PI) / 3}
        />
      </Canvas>
    </div>
  );
}
