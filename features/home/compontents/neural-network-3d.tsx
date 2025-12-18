"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface Node {
  position: [number, number, number];
  id: number;
}

interface Connection {
  start: number;
  end: number;
}

// Neural network node
function NetworkNode({ position, index, totalNodes }: { position: [number, number, number]; index: number; totalNodes: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;
    timeRef.current += 0.01;
    
    // Pulsing animation
    const scale = 1 + Math.sin(timeRef.current * 2 + index) * 0.2;
    meshRef.current.scale.setScalar(scale);
    
    // Subtle rotation
    meshRef.current.rotation.x = Math.sin(timeRef.current + index) * 0.2;
    meshRef.current.rotation.y = Math.cos(timeRef.current + index) * 0.2;
  });

  const intensity = (index % 3) / 3;
  const colors = ["#05cdff", "#3f5be4", "#6746d4"] as const;
  const color = colors[index % 3];

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[0.15, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5 + intensity * 0.3}
        metalness={0.8}
        roughness={0.2}
      />
      {/* Glow effect */}
      <mesh>
        <icosahedronGeometry args={[0.2, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.3}
        />
      </mesh>
    </mesh>
  );
}

// Connection line between nodes
function ConnectionLine({ start, end, nodes }: { start: number; end: number; nodes: Node[] }) {
  const lineRef = useRef<THREE.Line>(null);
  const timeRef = useRef(0);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);

  useFrame(() => {
    if (!materialRef.current) return;
    timeRef.current += 0.02;
    
    // Animated opacity based on connection strength simulation
    const opacity = 0.2 + Math.sin(timeRef.current + start + end) * 0.15;
    materialRef.current.opacity = opacity;
  });

  const startNode = nodes[start];
  const endNode = nodes[end];
  if (!startNode || !endNode) return null;

  const points = useMemo(() => [
    new THREE.Vector3(...startNode.position),
    new THREE.Vector3(...endNode.position),
  ], [startNode.position, endNode.position]);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    return geom;
  }, [points]);

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        ref={materialRef}
        color="#05cdff"
        transparent
        opacity={0.3}
      />
    </line>
  );
}

// Main neural network structure
function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.002;
  });

  // Create layered neural network structure
  const layers = 3;
  const nodesPerLayer = [4, 6, 4];
  const layerSpacing = 2;
  
  const nodes: Node[] = [];
  let nodeId = 0;
  
  nodesPerLayer.forEach((count, layerIndex) => {
    const xPos = (layerIndex - 1) * layerSpacing;
    const spacing = count > 1 ? 1.5 : 0;
    
    for (let i = 0; i < count; i++) {
      const yPos = ((count - 1) / 2 - i) * spacing;
      const zPos = (Math.random() - 0.5) * 0.5; // Slight randomness
      nodes.push({
        position: [xPos, yPos, zPos],
        id: nodeId++,
      });
    }
  });

  // Create connections between layers
  const connections: Connection[] = [];
  let nodeIndex = 0;
  
  nodesPerLayer.forEach((count, layerIndex) => {
    if (layerIndex < layers - 1) {
      const nextStartIndex = nodeIndex + count;
      const nextCount = nodesPerLayer[layerIndex + 1];
      
      // Connect each node to multiple nodes in next layer
      for (let i = 0; i < count; i++) {
        for (let j = 0; j < nextCount; j++) {
          if (Math.random() > 0.3) { // Random connections for visual interest
            connections.push({
              start: nodeIndex + i,
              end: nextStartIndex + j,
            });
          }
        }
      }
    }
    nodeIndex += count;
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, index) => (
        <NetworkNode
          key={node.id}
          position={node.position}
          index={index}
          totalNodes={nodes.length}
        />
      ))}
      {connections.map((conn, index) => (
        <ConnectionLine key={index} start={conn.start} end={conn.end} nodes={nodes} />
      ))}
    </group>
  );
}

export function NeuralNetwork3D({ className }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className || ""}`}>
      <Canvas
        style={{ background: "transparent" }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#05cdff" />
        <pointLight position={[-5, -5, -5]} intensity={0.6} color="#6746d4" />
        <directionalLight position={[0, 5, 5]} intensity={0.5} />
        
        <NeuralNetwork />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.8}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={(3 * Math.PI) / 4}
        />
      </Canvas>
    </div>
  );
}
