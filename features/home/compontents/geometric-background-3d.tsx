"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// Floating geometric shape
function GeometricShape({ 
  position, 
  shape = "box", 
  delay = 0 
}: { 
  position: [number, number, number]; 
  shape?: "box" | "tetrahedron" | "octahedron";
  delay?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const colors = ["#05cdff", "#3f5be4", "#6746d4"] as const;
  const color = colors[Math.floor(Math.random() * 3)];

  useFrame((state) => {
    if (!meshRef.current) return;
    timeRef.current += 0.01;
    
    // Floating animation
    meshRef.current.position.y = position[1] + Math.sin(timeRef.current * 0.5 + delay) * 0.5;
    meshRef.current.rotation.x += 0.005;
    meshRef.current.rotation.y += 0.008;
    meshRef.current.rotation.z += 0.003;
    
    // Subtle scale pulse
    const scale = 1 + Math.sin(timeRef.current + delay) * 0.1;
    meshRef.current.scale.setScalar(scale);
  });

  const getGeometry = () => {
    switch (shape) {
      case "tetrahedron":
        return <tetrahedronGeometry args={[0.3, 0]} />;
      case "octahedron":
        return <octahedronGeometry args={[0.3, 0]} />;
      default:
        return <boxGeometry args={[0.4, 0.4, 0.4]} />;
    }
  };

  return (
    <mesh ref={meshRef} position={position}>
      {getGeometry()}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        metalness={0.7}
        roughness={0.3}
        transparent
        opacity={0.6}
        wireframe={false}
      />
      {/* Wireframe overlay for some shapes */}
      {shape === "box" && (
        <mesh>
          {getGeometry()}
          <meshStandardMaterial
            color={color}
            wireframe
            emissive={color}
            emissiveIntensity={0.2}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </mesh>
  );
}

// Main geometric background
function GeometricBackgroundScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.001;
  });

  // Generate random positions for shapes
  const shapes: Array<{ position: [number, number, number]; shape: "box" | "tetrahedron" | "octahedron"; delay: number }> = [];
  const count = 15;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 3 + Math.random() * 4;
    const x = Math.cos(angle) * radius;
    const y = (Math.random() - 0.5) * 6;
    const z = Math.sin(angle) * radius;
    
    const shapeTypes: Array<"box" | "tetrahedron" | "octahedron"> = ["box", "tetrahedron", "octahedron"];
    shapes.push({
      position: [x, y, z],
      shape: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
      delay: i * 0.3,
    });
  }

  return (
    <group ref={groupRef}>
      {shapes.map((shape, index) => (
        <GeometricShape
          key={index}
          position={shape.position}
          shape={shape.shape}
          delay={shape.delay}
        />
      ))}
    </group>
  );
}

export function GeometricBackground3D({ className }: { className?: string }) {
  return (
    <div className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${className || ""}`}>
      <Canvas
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={60} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#05cdff" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#6746d4" />
        
        <GeometricBackgroundScene />
      </Canvas>
    </div>
  );
}
