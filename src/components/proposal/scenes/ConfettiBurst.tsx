"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * ConfettiBurst — gold + white particle burst in 3D, fires on mount.
 *
 * Implementation: 200 particles spawned at origin with random outward
 * velocities, drifting outward + falling (gentle gravity) + fading out
 * over ~3 seconds.
 *
 * Velocities are stored in a mutable ref (not useMemo state) because we
 * mutate them every frame (gravity + air resistance).
 */
const PARTICLE_COUNT = 200;

export function ConfettiBurst() {
  const pointsRef = useRef<THREE.Points>(null);
  const startTimeRef = useRef(performance.now());

  // Initial particle data (computed once)
  const initial = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Start at the ring's position (roughly)
      positions[i * 3 + 0] = 0;
      positions[i * 3 + 1] = 0.5;
      positions[i * 3 + 2] = 0;

      // Random outward direction (sphere)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 2 + Math.random() * 4;
      velocities[i * 3 + 0] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.cos(phi) * speed * 0.6 + 1.5; // bias upward
      velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;

      // Alternate gold and white
      const isGold = Math.random() > 0.4;
      if (isGold) {
        colors[i * 3 + 0] = 1.0;
        colors[i * 3 + 1] = 0.84;
        colors[i * 3 + 2] = 0.0;
      } else {
        colors[i * 3 + 0] = 1.0;
        colors[i * 3 + 1] = 0.98;
        colors[i * 3 + 2] = 0.94;
      }

      sizes[i] = 0.05 + Math.random() * 0.12;
    }
    return { positions, colors, sizes, velocities };
  }, []);

  // Mutable velocity store — ref so we can update in useFrame
  const velocitiesRef = useRef<Float32Array>(initial.velocities);

  useFrame(() => {
    if (!pointsRef.current) return;
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const dt = 0.016;

    const pos = pointsRef.current.geometry.attributes.position
      .array as Float32Array;
    const vel = velocitiesRef.current;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Apply velocity
      pos[i * 3 + 0] += vel[i * 3 + 0] * dt;
      pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
      pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      // Gravity
      vel[i * 3 + 1] -= 2.5 * dt;
      // Air resistance
      vel[i * 3 + 0] *= 0.985;
      vel[i * 3 + 2] *= 0.985;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Fade out overall after 2.5s
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = Math.max(0, 1 - elapsed / 3.5);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[initial.positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[initial.colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[initial.sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.18}
        sizeAttenuation
        transparent
        opacity={1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
