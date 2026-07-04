"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Sparkles } from "@react-three/drei";
import { useProposal } from "../state";

/**
 * LoveHeart — replaces the ring box with a romantic floating heart cluster.
 *
 * Three large glowing 3D hearts orbit gently around a central point,
 * pulsing in sync with the heartbeat animation. When the user taps
 * (phase becomes ring-open), they burst outward and fade, revealing the ring.
 */

/** Build a heart shape using THREE.Shape (parametric heart curve) */
function makeHeartShape(size: number): THREE.Shape {
  const s = size;
  const shape = new THREE.Shape();
  shape.moveTo(0, s * 0.25);
  shape.bezierCurveTo(0, s * 0.25, -s * 0.1, s * 0.45, -s * 0.5, s * 0.45);
  shape.bezierCurveTo(-s, s * 0.45, -s, 0, -s, 0);
  shape.bezierCurveTo(-s, -s * 0.55, -s * 0.5, -s * 0.77, 0, -s);
  shape.bezierCurveTo(s * 0.5, -s * 0.77, s, -s * 0.55, s, 0);
  shape.bezierCurveTo(s, 0, s, s * 0.45, s * 0.5, s * 0.45);
  shape.bezierCurveTo(s * 0.1, s * 0.45, 0, s * 0.25, 0, s * 0.25);
  return shape;
}

interface HeartMeshProps {
  position: [number, number, number];
  scale: number;
  color: string;
  emissiveColor: string;
  phaseOffset: number;
  orbitRadius: number;
  orbitSpeed: number;
}

function HeartMesh({
  position,
  scale,
  color,
  emissiveColor,
  phaseOffset,
  orbitRadius,
  orbitSpeed,
}: HeartMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const phase = useProposal((s) => s.phase);

  const geometry = useMemo(() => {
    const shape = makeHeartShape(0.5);
    const extrudeSettings = {
      depth: 0.22,
      bevelEnabled: true,
      bevelSegments: 6,
      bevelSize: 0.04,
      bevelThickness: 0.04,
      steps: 1,
    };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Center the geometry
    geo.center();
    return geo;
  }, []);

  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(emissiveColor),
      emissiveIntensity: 0.6,
      metalness: 0.1,
      roughness: 0.3,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.95,
    });
  }, [color, emissiveColor]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime + phaseOffset;

    if (phase === "ring-open" || phase === "ring-reveal" || phase === "proposal" || phase === "answered") {
      // Burst outward and fade when opened
      meshRef.current.position.y += 0.03;
      material.opacity = Math.max(0, material.opacity - 0.02);
      meshRef.current.scale.setScalar(meshRef.current.scale.x * 1.02);
      return;
    }

    // Gentle orbit in XZ plane
    meshRef.current.position.x = position[0] + Math.sin(t * orbitSpeed) * orbitRadius;
    meshRef.current.position.z = position[2] + Math.cos(t * orbitSpeed * 0.7) * orbitRadius * 0.5;

    // Heartbeat pulse on Y scale
    const pulse = 1 + Math.sin(t * 2.2) * 0.07;
    meshRef.current.scale.set(scale * pulse, scale * pulse, scale * pulse);

    // Gentle Y float
    meshRef.current.position.y = position[1] + Math.sin(t * 0.9 + phaseOffset) * 0.15;

    // Slow rotation on Y so we see the 3D depth
    meshRef.current.rotation.y = Math.sin(t * 0.3 + phaseOffset) * 0.4;
    meshRef.current.rotation.z = Math.sin(t * 0.4 + phaseOffset) * 0.08;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      scale={[scale, scale, scale]}
    />
  );
}

export function LoveHeart() {
  const groupRef = useRef<THREE.Group>(null);

  // Gentle slow rotation of the whole group
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.3;
  });

  return (
    <group ref={groupRef}>
      {/* Central large heart */}
      <HeartMesh
        position={[0, 0, 0]}
        scale={1.5}
        color="#e8829a"
        emissiveColor="#c2506e"
        phaseOffset={0}
        orbitRadius={0}
        orbitSpeed={0}
      />

      {/* Left orbiting heart — smaller, lighter pink */}
      <HeartMesh
        position={[-1.4, 0.3, -0.3]}
        scale={0.75}
        color="#f9d4c8"
        emissiveColor="#e8829a"
        phaseOffset={1.2}
        orbitRadius={0.25}
        orbitSpeed={0.8}
      />

      {/* Right orbiting heart — medium, deeper rose */}
      <HeartMesh
        position={[1.3, -0.2, 0.2]}
        scale={0.9}
        color="#c2506e"
        emissiveColor="#8b2040"
        phaseOffset={2.4}
        orbitRadius={0.2}
        orbitSpeed={1.1}
      />

      {/* Top-left tiny accent heart */}
      <HeartMesh
        position={[-0.7, 1.1, 0]}
        scale={0.45}
        color="#f9d4c8"
        emissiveColor="#e8829a"
        phaseOffset={3.6}
        orbitRadius={0.15}
        orbitSpeed={1.4}
      />

      {/* Bottom-right tiny accent heart */}
      <HeartMesh
        position={[0.8, -0.9, 0.1]}
        scale={0.4}
        color="#e8829a"
        emissiveColor="#c2506e"
        phaseOffset={0.8}
        orbitRadius={0.12}
        orbitSpeed={1.6}
      />

      {/* Warm glow sparkles around the hearts */}
      <Sparkles
        count={60}
        scale={4.5}
        size={2.5}
        speed={0.2}
        color="#f9d4c8"
        position={[0, 0, 0]}
      />
      <Sparkles
        count={30}
        scale={3}
        size={1.5}
        speed={0.15}
        color="#e8829a"
        position={[0, 0.5, 0]}
      />
    </group>
  );
}
