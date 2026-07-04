"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useProposal } from "../state";
import { detectCapabilities } from "@/lib/proposal/capabilities";
import { Ring } from "./Ring";
import { LoveHeart } from "./LoveHeart";
import { useAudioController } from "../useAudio";

/**
 * RingScene — the centerpiece (PRD §4).
 *
 * Stages:
 *   1. ring-idle: Box visible, slow idle rotation (0.1 rad/s), waiting for tap.
 *      Camera slowly dollies in toward the box.
 *   2. ring-open: User tapped. Lid hinges open (handled in RingBox),
 *      chime plays, ring rises out of box (Y +0.8 over 1s, power3.out),
 *      camera continues subtle dolly.
 *   3. ring-reveal: Ring does one full 360° rotation (2.5s, power1.inOut)
 *      so every facet catches light, then settles into permanent slow idle spin.
 *   4. proposal: Proposal text + Yes button visible (handled by overlay UI).
 */
export function RingScene() {
  const phase = useProposal((s) => s.phase);
  const setPhase = useProposal((s) => s.setPhase);
  const ringGroupRef = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const caps = useMemo(() => detectCapabilities(), []);
  const { playChime } = useAudioController();

  // Local animation state
  const [revealed, setRevealed] = useState(false);
  const reveal360Progress = useRef(0); // 0..1 for the one-shot 360° rotation
  const reveal360Active = useRef(false);

  // --- Phase: ring-idle → ring-open (triggered by user tap, handled in Overlay) ---
  // When phase becomes 'ring-open', start the ring rise + chime
  useEffect(() => {
    if (phase !== "ring-open") return;
    playChime();

    // Ring rises out of the box (PRD §4.6 step 3)
    if (ringGroupRef.current) {
      const startY = ringGroupRef.current.position.y;
      gsap.to(ringGroupRef.current.position, {
        y: startY + 1.0,
        duration: 1.0,
        ease: "power3.out",
        onComplete: () => {
          setPhase("ring-reveal");
          setRevealed(true);
          reveal360Active.current = true;
        },
      });
    }
  }, [phase, setPhase, playChime]);

  // --- Phase: ring-reveal → proposal (after the 360° rotation finishes) ---
  useEffect(() => {
    if (phase !== "ring-reveal") return;
    // Total reveal duration: 2.5s for 360° + 0.5s pause before proposal text
    const t = setTimeout(() => {
      setPhase("proposal");
    }, 3000);
    return () => clearTimeout(t);
  }, [phase, setPhase]);

  // --- Camera dolly (subtle push toward the ring throughout the reveal) ---
  useEffect(() => {
    if (phase !== "ring-idle" && phase !== "ring-open" && phase !== "ring-reveal") return;
    // FOV 50 → 42 over the duration of the ring sequence (PRD §4.6 step 6)
    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const pc = camera as THREE.PerspectiveCamera;
      gsap.to(pc, {
        fov: 42,
        duration: 4.5,
        ease: "power2.inOut",
        onUpdate: () => pc.updateProjectionMatrix(),
      });
    }
  }, [phase, camera]);

  // LoveHeart self-animates; only handle the one-shot 360° ring reveal
  useFrame((_, dt) => {
    // One-shot 360° rotation for the ring after it rises (PRD §4.6 step 4)
    if (reveal360Active.current && ringGroupRef.current) {
      const duration = 2.5;
      reveal360Progress.current += dt / duration;
      const t = Math.min(reveal360Progress.current, 1);
      // power1.inOut ease (quad)
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      // Ring base rotation accumulates with idle spin once revealed
      ringGroupRef.current.rotation.y = eased * Math.PI * 2;
      if (t >= 1) {
        reveal360Active.current = false;
      }
    }
  });

  return (
    <group>
      {/* Lighting — manual setup so we don't depend on network HDRI */}
      {/* Key spotlight from top-front, warm white */}
      <spotLight
        position={[3, 6, 4]}
        angle={0.5}
        penumbra={0.6}
        intensity={3}
        color="#fff4e0"
        distance={20}
      />
      {/* Soft rim light from behind, cool blue-white */}
      <pointLight
        position={[-4, 2, -4]}
        intensity={1.2}
        color="#c4d8ff"
        distance={15}
      />
      {/* Front fill light so box faces are visible */}
      <pointLight
        position={[0, 1, 5]}
        intensity={1.5}
        color="#fff8f0"
        distance={12}
      />
      {/* Ambient fill — enough to see everything */}
      <ambientLight intensity={0.5} color="#ffffff" />

      {/* Love hearts cluster — replaces the ring box */}
      <group position={[0, 0, 0]}>
        <LoveHeart />
      </group>

      {/* The ring — starts hidden inside the box (low Y), rises when phase = ring-open */}
      <group ref={ringGroupRef} position={[0, -0.2, 0]}>
        <Ring revealed={revealed} />
      </group>

      {/* Sparkles around the gem (PRD §4.5) */}
      <Sparkles
        count={caps.sparkleCount}
        scale={3}
        size={caps.isMobile ? 2 : 3.5}
        speed={0.3}
        color="#fff8dc"
        position={[0, 0.8, 0]}
      />
    </group>
  );
}
