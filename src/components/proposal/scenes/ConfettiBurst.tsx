"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * ConfettiBurst — rose-gold + pink + white particle burst in 3D.
 *
 * Fires on mount: 400 particles spawned at origin with random outward
 * velocities, drifting outward + falling (gentle gravity) + fading out.
 * Loops after 5s so the celebration feels continuous.
 */
const PARTICLE_COUNT = 400;

export function ConfettiBurst() {
  const pointsRef = useRef<THREE.Points>(null);
  const startTimeRef = useRef(performance.now());

  // Initial particle data (computed once)
  const initial = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    // Romantic color palette: rose, pink, ivory, gold
    const palette = [
      [0.914, 0.514, 0.604], // #e8829a rose
      [0.976, 0.831, 0.784], // #f9d4c8 blush
      [0.761, 0.314, 0.431], // #c2506e deep rose
      [1.0,   0.84,  0.0  ], // gold
      [1.0,   0.98,  0.94 ], // ivory
      [1.0,   0.7,   0.8  ], // light pink
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Start near the ring's position
      positions[i * 3 + 0] = (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 1] = 0.5 + (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

      // Random outward direction (sphere) with upward bias
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 1.5 + Math.random() * 5;
      velocities[i * 3 + 0] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.abs(Math.cos(phi)) * speed * 0.7 + 1.8; // bias upward
      velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;

      // Pick a color from romantic palette
      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3 + 0] = col[0];
      colors[i * 3 + 1] = col[1];
      colors[i * 3 + 2] = col[2];

      sizes[i] = 0.04 + Math.random() * 0.14;
    }
    return { positions, colors, sizes, velocities };
  }, []);

  // Mutable velocity store — ref so we can update in useFrame
  const velocitiesRef = useRef<Float32Array>(initial.velocities);
  const positionsRef = useRef<Float32Array>(new Float32Array(initial.positions));

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
      vel[i * 3 + 1] -= 2.8 * dt;
      // Air resistance (more drag on X/Z = fluttery feel)
      vel[i * 3 + 0] *= 0.982;
      vel[i * 3 + 2] *= 0.982;

      // Reset particles that fall too far — keeps celebration going
      if (pos[i * 3 + 1] < -5) {
        pos[i * 3 + 0] = (Math.random() - 0.5) * 0.4;
        pos[i * 3 + 1] = 0.5;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
        const theta = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4;
        vel[i * 3 + 0] = Math.sin(theta) * speed;
        vel[i * 3 + 1] = 1.5 + Math.random() * 3;
        vel[i * 3 + 2] = Math.cos(theta) * speed;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Fade in then keep stable (no fade-out — celebration persists)
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = Math.min(1, elapsed * 2);
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
        size={0.2}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
