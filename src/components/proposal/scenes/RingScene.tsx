"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useProposal } from "../state";
import { detectCapabilities } from "@/lib/proposal/capabilities";
import { Ring } from "./Ring";
import { RingBox } from "./RingBox";
import { HeartBurst } from "./HeartBurst";
import { useAudioController } from "../useAudio";

/**
 * RingScene — the centerpiece (PRD §4).
 *
 * Stages:
 *   1. ring-idle: Velvet ring box visible, slow idle rotation, waiting for tap.
 *   2. ring-open: User tapped. Box lid hinges open, chime plays,
 *      small hearts BURST out of the box, ring rises up.
 *   3. ring-reveal: Ring does one full 360° rotation, then settles.
 *   4. proposal: Proposal text + Yes button visible (handled by overlay UI).
 */
export function RingScene() {
  const phase = useProposal((s) => s.phase);
  const setPhase = useProposal((s) => s.setPhase);
  const ringGroupRef = useRef<THREE.Group>(null);
  const boxRef = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const caps = useMemo(() => detectCapabilities(), []);
  const { playChime } = useAudioController();

  // Local animation state
  const [revealed, setRevealed] = useState(false);
  const reveal360Progress = useRef(0); // 0..1 for the one-shot 360° rotation
  const reveal360Active = useRef(false);

  // --- Phase: ring-idle → ring-open (triggered by user tap, handled in Overlay) ---
  useEffect(() => {
    if (phase !== "ring-open") return;
    playChime();

    // Ring rises out of the box
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

  // --- Phase: ring-reveal → proposal ---
  useEffect(() => {
    if (phase !== "ring-reveal") return;
    const t = setTimeout(() => {
      setPhase("proposal");
    }, 3000);
    return () => clearTimeout(t);
  }, [phase, setPhase]);

  // --- Camera dolly ---
  useEffect(() => {
    if (phase !== "ring-idle" && phase !== "ring-open" && phase !== "ring-reveal") return;
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

  // --- Idle box rotation + one-shot ring reveal spin ---
  useFrame((_, dt) => {
    // Slowly rotate the box while idle
    if (boxRef.current && phase === "ring-idle") {
      boxRef.current.rotation.y += dt * 0.1;
    }
    // One-shot 360° rotation for the ring after it rises
    if (reveal360Active.current && ringGroupRef.current) {
      const duration = 2.5;
      reveal360Progress.current += dt / duration;
      const t = Math.min(reveal360Progress.current, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      ringGroupRef.current.rotation.y = eased * Math.PI * 2;
      if (t >= 1) {
        reveal360Active.current = false;
      }
    }
  });

  return (
    <group>
      {/* Lighting */}
      <spotLight
        position={[3, 6, 4]}
        angle={0.5}
        penumbra={0.6}
        intensity={3}
        color="#fff4e0"
        distance={20}
      />
      <pointLight position={[-4, 2, -4]} intensity={1.2} color="#c4d8ff" distance={15} />
      <pointLight position={[0, 1, 5]} intensity={1.5} color="#fff8f0" distance={12} />
      <ambientLight intensity={0.5} color="#ffffff" />

      {/* The velvet ring box — idle rotation parent */}
      <group ref={boxRef} position={[0, 0, 0]}>
        <RingBox />
      </group>

      {/* Small hearts that burst out when box opens */}
      <HeartBurst />

      {/* The ring — hidden inside box, rises on ring-open */}
      <group ref={ringGroupRef} position={[0, -0.2, 0]}>
        <Ring revealed={revealed} />
      </group>

      {/* Sparkles around the gem */}
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
