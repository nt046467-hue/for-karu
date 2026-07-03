"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";

/**
 * Scene 1 — The Beginning (PRD §3 Scene 1)
 *
 * Visuals: dark starfield + soft particle field (Sparkles), camera drifts
 * forward slowly. Text is rendered as HTML overlay (handled in Overlay.tsx).
 */
export function IntroScene() {
  const groupRef = useRef<THREE.Group>(null);

  // Slow forward drift — always moving = cinematic feel
  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.position.z += dt * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Deep starfield */}
      <Stars
        radius={50}
        depth={30}
        count={1500}
        factor={3}
        saturation={0}
        fade
        speed={0.3}
      />
      {/* Soft warm sparkles closer to camera */}
      <Sparkles
        count={60}
        scale={12}
        size={2}
        speed={0.2}
        color="#ffe9c4"
        position={[0, 0, 2]}
      />
    </group>
  );
}
