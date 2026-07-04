"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";

/**
 * Scene 2 — The Memories (background only)
 *
 * The actual photo display is handled as an HTML overlay in Overlay.tsx
 * (MemoriesOverlay) so photos look crisp, properly framed, and captions
 * are fully readable. This component renders only the atmospheric 3D
 * background: a warm bokeh particle field drifting through space.
 */
export function MemoryStream() {
  const groupRef = useRef<THREE.Group>(null);

  // Slow forward drift for cinematic feel
  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.position.z += dt * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Deep starfield */}
      <Stars
        radius={60}
        depth={40}
        count={1200}
        factor={2.5}
        saturation={0.2}
        fade
        speed={0.2}
      />
      {/* Warm rose-gold bokeh particles */}
      <Sparkles
        count={80}
        scale={18}
        size={3}
        speed={0.15}
        color="#f9d4c8"
        position={[0, 0, 2]}
      />
      <Sparkles
        count={40}
        scale={14}
        size={2}
        speed={0.1}
        color="#e8829a"
        position={[2, 1, -2]}
      />
    </group>
  );
}
