"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// Individual code block that floats around the cube
function FloatingCodeBlock({ position, delay = 0 }: { position: [number, number, number]; delay?: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;
    timeRef.current += 0.01;
    
    // Floating animation
    meshRef.current.position.y = position[1] + Math.sin(timeRef.current + delay) * 0.3;
    meshRef.current.rotation.y += 0.005;
    meshRef.current.rotation.x = Math.sin(timeRef.current + delay) * 0.1;
  });

  const color = "#05cdff";

  return (
    <group ref={meshRef} position={position}>
      <mesh>
        <boxGeometry args={[0.8, 0.4, 0.05]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Inner highlight for code-like appearance */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[0.7, 0.3, 0.01]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

// Main code cube
function CodeCube() {
  const groupRef = useRef<THREE.Group>(null);
  const cubeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current || !cubeRef.current) return;
    
    // Rotate the entire group
    groupRef.current.rotation.y += 0.005;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    
    // Rotate the cube itself
    cubeRef.current.rotation.x += 0.01;
    cubeRef.current.rotation.y += 0.01;
  });

  const positions: [number, number, number][] = [
    [2, 1, 0],
    [-2, 1, 0],
    [0, 2.5, 0],
    [0, -0.5, 0],
    [1.5, 1, 1.5],
    [-1.5, 1, -1.5],
  ];

  return (
    <group ref={groupRef}>
      {/* Main cube */}
      <mesh ref={cubeRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          color="#6746d4"
          emissive="#6746d4"
          emissiveIntensity={0.2}
          metalness={0.9}
          roughness={0.1}
          wireframe={false}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Wireframe outline */}
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          color="#05cdff"
          wireframe
          emissive="#05cdff"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Floating code blocks */}
      {positions.map((position, index) => (
        <FloatingCodeBlock
          key={index}
          position={position}
          delay={index * 0.5}
        />
      ))}

      {/* Corner accents */}
      {[
        [1, 1, 1],
        [-1, 1, 1],
        [1, -1, 1],
        [-1, -1, 1],
        [1, 1, -1],
        [-1, 1, -1],
        [1, -1, -1],
        [-1, -1, -1],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color="#05cdff"
            emissive="#05cdff"
            emissiveIntensity={1}
          />
        </mesh>
      ))}
    </group>
  );
}

export function CodeCube3D({ className }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className || ""}`}>
      <Canvas
        style={{ background: "transparent" }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#05cdff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6746d4" />
        <directionalLight position={[0, 5, 5]} intensity={0.8} />
        
        <CodeCube />
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
