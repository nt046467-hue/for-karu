"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useProposal } from "../state";

/**
 * RingBox — a closed velvet ring box that opens on tap.
 *
 * Construction:
 *   - Base (open-top hollow box): 5 box faces (no top)
 *   - Lid: a thin box hinged at the back, rotates -120° on X to open
 *
 * Animation (PRD §4.6 step 2):
 *   - Lid rotates open on X axis from 0 → -2.1 rad over 0.8s, ease power2.out
 *   - Triggered when phase becomes 'ring-open'
 */
interface RingBoxProps {
  /** Trigger open immediately on mount (used if user already tapped) */
  autoOpen?: boolean;
}

export function RingBox({ autoOpen = false }: RingBoxProps) {
  const lidRef = useRef<THREE.Group>(null);
  const phase = useProposal((s) => s.phase);

  // Velvety material for the box exterior
  const velvetMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#2a0a14"), // deep wine
      roughness: 0.95,
      metalness: 0.0,
    });
  }, []);

  // Interior silk
  const silkMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#f4e4c1"), // warm cream silk
      roughness: 0.6,
      metalness: 0.05,
    });
  }, []);

  // Gold trim around the lid edge — use standard material so it works without envMap
  const trimMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#FFD700"),
      metalness: 0.9,
      roughness: 0.2,
      emissive: new THREE.Color("#7a5800"),
      emissiveIntensity: 0.15,
    });
  }, []);

  // Open animation — driven by useFrame to keep it simple and stable
  const targetLidAngle = useRef(0);
  const currentLidAngle = useRef(0);
  const openingFrom = useRef(0);
  const openingStart = useRef<number | null>(null);
  const isOpening = useRef(false);

  useEffect(() => {
    if (autoOpen || phase === "ring-open") {
      if (!isOpening.current && currentLidAngle.current < 0.1) {
        openingFrom.current = currentLidAngle.current;
        openingStart.current = performance.now();
        isOpening.current = true;
      }
    }
  }, [phase, autoOpen]);

  useFrame(() => {
    if (!lidRef.current) return;
    if (isOpening.current && openingStart.current !== null) {
      const elapsed = (performance.now() - openingStart.current) / 1000;
      const duration = 0.8; // PRD §4.6 step 2
      const t = Math.min(elapsed / duration, 1);
      // power2.out ease
      const eased = 1 - (1 - t) * (1 - t);
      currentLidAngle.current =
        openingFrom.current + (-2.1 - openingFrom.current) * eased;
      lidRef.current.rotation.x = currentLidAngle.current;
      if (t >= 1) {
        isOpening.current = false;
      }
    }
  });

  // Box dimensions
  const W = 2.0; // width
  const H = 0.7; // height
  const D = 2.0; // depth
  const wall = 0.08;

  return (
    <group dispose={null}>
      {/* Base — hollow box (no top face) */}
      {/* Bottom */}
      <mesh position={[0, -H / 2, 0]} material={velvetMaterial}>
        <boxGeometry args={[W, wall, D]} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 0, -D / 2 + wall / 2]} material={velvetMaterial}>
        <boxGeometry args={[W, H, wall]} />
      </mesh>
      {/* Front wall */}
      <mesh position={[0, 0, D / 2 - wall / 2]} material={velvetMaterial}>
        <boxGeometry args={[W, H, wall]} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-W / 2 + wall / 2, 0, 0]} material={velvetMaterial}>
        <boxGeometry args={[wall, H, D - wall * 2]} />
      </mesh>
      {/* Right wall */}
      <mesh position={[W / 2 - wall / 2, 0, 0]} material={velvetMaterial}>
        <boxGeometry args={[wall, H, D - wall * 2]} />
      </mesh>

      {/* Silk interior cushion (sits inside, with a small dome to hold the ring) */}
      <mesh position={[0, -H / 2 + wall + 0.04, 0]} material={silkMaterial}>
        <boxGeometry args={[W - wall * 2 - 0.02, 0.1, D - wall * 2 - 0.02]} />
      </mesh>

      {/* Lid — hinged at the back edge */}
      <group ref={lidRef} position={[0, H / 2, -D / 2]}>
        {/* Lid top */}
        <mesh position={[0, wall / 2, D / 2]} material={velvetMaterial}>
          <boxGeometry args={[W, wall, D]} />
        </mesh>
        {/* Gold trim around lid edge */}
        <mesh position={[0, wall + 0.005, D / 2]} material={trimMaterial}>
          <boxGeometry args={[W + 0.02, 0.02, D + 0.02]} />
        </mesh>
        {/* Underside silk lining */}
        <mesh position={[0, -0.005, D / 2]} material={silkMaterial}>
          <boxGeometry args={[W - wall, 0.005, D - wall]} />
        </mesh>
      </group>
    </group>
  );
}
