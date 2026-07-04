"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useProposal } from "../state";

/**
 * RingBox — luxurious velvet ring box, mobile-responsive.
 *
 * Scales automatically based on screen aspect ratio so the box
 * is fully visible on narrow portrait mobile screens.
 *
 * Materials:
 *   - Exterior: deep burgundy velvet (high roughness, zero metalness)
 *   - Interior: warm cream silk cushion
 *   - Trim: rose-gold metallic edge strip
 *   - Logo plate: small gold oval on lid face
 */
interface RingBoxProps {
  autoOpen?: boolean;
}

export function RingBox({ autoOpen = false }: RingBoxProps) {
  const lidRef = useRef<THREE.Group>(null);
  const phase = useProposal((s) => s.phase);
  const { size } = useThree();

  // Scale down on narrow portrait mobile screens
  const mobileScale = useMemo(() => {
    const aspect = size.width / size.height;
    if (aspect < 0.55) return 0.65;
    if (aspect < 0.75) return 0.78;
    if (aspect < 0.9)  return 0.88;
    return 1.0;
  }, [size.width, size.height]);

  // --- Materials ---
  const velvetMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#1e0812"),   // very deep burgundy / black-red
    roughness: 1.0,
    metalness: 0.0,
    emissive: new THREE.Color("#3a0a18"),
    emissiveIntensity: 0.06,
  }), []);

  const velvetLidMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#2a0a1a"),   // slightly lighter top face
    roughness: 0.98,
    metalness: 0.0,
    emissive: new THREE.Color("#3a0a18"),
    emissiveIntensity: 0.08,
  }), []);

  const silkMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#f8ecd8"),   // warm ivory silk
    roughness: 0.55,
    metalness: 0.0,
    emissive: new THREE.Color("#f0d8b0"),
    emissiveIntensity: 0.04,
  }), []);

  const roseGoldTrimMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#E8B4A0"),   // rose gold
    metalness: 0.95,
    roughness: 0.15,
    emissive: new THREE.Color("#c27050"),
    emissiveIntensity: 0.12,
  }), []);

  const logoPlateMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#FFD700"),
    metalness: 0.9,
    roughness: 0.25,
    emissive: new THREE.Color("#8a6000"),
    emissiveIntensity: 0.1,
  }), []);

  // --- Lid opening animation ---
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
      const duration = 0.9;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // power3.out — snappier open
      currentLidAngle.current = openingFrom.current + (-2.15 - openingFrom.current) * eased;
      lidRef.current.rotation.x = currentLidAngle.current;
      if (t >= 1) isOpening.current = false;
    }
  });

  // Box dimensions — portrait-friendly proportions
  const W = 1.85;  // width
  const H = 0.65;  // height (slightly shallower than original)
  const D = 1.85;  // depth
  const wall = 0.075;
  const lidH = 0.075;

  return (
    <group dispose={null} scale={[mobileScale, mobileScale, mobileScale]}>

      {/* ── BASE ─────────────────────────────────────────────── */}
      {/* Bottom face */}
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

      {/* ── INTERIOR ─────────────────────────────────────────── */}
      {/* Silk cushion base */}
      <mesh position={[0, -H / 2 + wall + 0.03, 0]} material={silkMaterial}>
        <boxGeometry args={[W - wall * 2 - 0.02, 0.08, D - wall * 2 - 0.02]} />
      </mesh>
      {/* Silk ring slot ridge (central raised bar where ring sits) */}
      <mesh position={[0, -H / 2 + wall + 0.09, 0]} material={silkMaterial}>
        <boxGeometry args={[0.18, 0.08, D - wall * 2 - 0.08]} />
      </mesh>
      {/* Side silk walls */}
      <mesh position={[0, 0, 0]} material={silkMaterial}>
        <boxGeometry args={[W - wall * 2 - 0.02, H - wall - 0.02, 0.012]} />
      </mesh>

      {/* ── ROSE GOLD TRIM ───────────────────────────────────── */}
      {/* Trim around base top opening */}
      <mesh position={[0, H / 2, 0]} material={roseGoldTrimMaterial}>
        <boxGeometry args={[W + 0.02, 0.018, D + 0.02]} />
      </mesh>
      {/* Corner trim accents */}
      {[[-W / 2, 0, -D / 2], [W / 2, 0, -D / 2], [-W / 2, 0, D / 2], [W / 2, 0, D / 2]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} material={roseGoldTrimMaterial}>
          <boxGeometry args={[0.025, H + 0.01, 0.025]} />
        </mesh>
      ))}

      {/* ── LID ──────────────────────────────────────────────── */}
      {/* Hinge pivot at back top edge */}
      <group ref={lidRef} position={[0, H / 2, -D / 2]}>
        {/* Lid top face */}
        <mesh position={[0, lidH / 2, D / 2]} material={velvetLidMaterial}>
          <boxGeometry args={[W, lidH, D]} />
        </mesh>
        {/* Rose gold trim strip on lid edge */}
        <mesh position={[0, lidH + 0.01, D / 2]} material={roseGoldTrimMaterial}>
          <boxGeometry args={[W + 0.025, 0.018, D + 0.025]} />
        </mesh>
        {/* Silk underside of lid */}
        <mesh position={[0, -0.004, D / 2]} material={silkMaterial}>
          <boxGeometry args={[W - wall, 0.006, D - wall]} />
        </mesh>
        {/* Small logo plate centered on lid top */}
        <mesh position={[0, lidH + 0.015, D / 2]} material={logoPlateMaterial} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.28, 0.012, 0.12]} />
        </mesh>
      </group>

      {/* ── BASE BOTTOM FEET ─────────────────────────────────── */}
      {[[-W / 2 + 0.15, -H / 2 - 0.02, -D / 2 + 0.15],
        [W / 2 - 0.15, -H / 2 - 0.02, -D / 2 + 0.15],
        [-W / 2 + 0.15, -H / 2 - 0.02, D / 2 - 0.15],
        [W / 2 - 0.15, -H / 2 - 0.02, D / 2 - 0.15]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} material={roseGoldTrimMaterial}>
          <cylinderGeometry args={[0.04, 0.05, 0.04, 10]} />
        </mesh>
      ))}
    </group>
  );
}
