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
 * RingScene — the centerpiece.
 *
 * Mobile responsive: camera FOV is widened on portrait screens so the
 * box and ring are fully visible without cropping.
 */
export function RingScene() {
  const phase = useProposal((s) => s.phase);
  const setPhase = useProposal((s) => s.setPhase);
  const ringGroupRef = useRef<THREE.Group>(null);
  const boxRef = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const { size } = useThree();
  const caps = useMemo(() => detectCapabilities(), []);
  const { playChime } = useAudioController();

  // Mobile FOV correction — portrait screens need wider view
  const mobileFovBoost = useMemo(() => {
    const aspect = size.width / size.height;
    if (aspect < 0.55) return 20; // very narrow: +20° FOV
    if (aspect < 0.75) return 12; // normal portrait: +12°
    if (aspect < 0.9)  return 6;  // wide portrait: +6°
    return 0;
  }, [size.width, size.height]);

  // Local animation state
  const [revealed, setRevealed] = useState(false);
  const reveal360Progress = useRef(0);
  const reveal360Active = useRef(false);

  // Apply mobile FOV boost when entering ring scene
  useEffect(() => {
    if (phase !== "ring-idle") return;
    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera && mobileFovBoost > 0) {
      const pc = camera as THREE.PerspectiveCamera;
      gsap.to(pc, {
        fov: 50 + mobileFovBoost,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => pc.updateProjectionMatrix(),
      });
    }
  }, [phase, camera, mobileFovBoost]);

  // ring-open: lid opens, hearts burst, ring rises
  useEffect(() => {
    if (phase !== "ring-open") return;
    playChime();

    if (ringGroupRef.current) {
      const startY = ringGroupRef.current.position.y;
      gsap.to(ringGroupRef.current.position, {
        y: startY + 1.1,
        duration: 1.1,
        ease: "power3.out",
        onComplete: () => {
          setPhase("ring-reveal");
          setRevealed(true);
          reveal360Active.current = true;
        },
      });
    }
  }, [phase, setPhase, playChime]);

  // ring-reveal → proposal after 360° spin
  useEffect(() => {
    if (phase !== "ring-reveal") return;
    const t = setTimeout(() => setPhase("proposal"), 3200);
    return () => clearTimeout(t);
  }, [phase, setPhase]);

  // Camera dolly (compensate for mobile FOV)
  useEffect(() => {
    if (phase !== "ring-idle" && phase !== "ring-open" && phase !== "ring-reveal") return;
    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const pc = camera as THREE.PerspectiveCamera;
      const targetFov = 42 + mobileFovBoost * 0.5;
      gsap.to(pc, {
        fov: targetFov,
        duration: 4.5,
        ease: "power2.inOut",
        onUpdate: () => pc.updateProjectionMatrix(),
      });
    }
  }, [phase, camera, mobileFovBoost]);

  useFrame((_, dt) => {
    if (boxRef.current && phase === "ring-idle") {
      boxRef.current.rotation.y += dt * 0.08; // gentle slow rotation
    }
    if (reveal360Active.current && ringGroupRef.current) {
      const duration = 2.5;
      reveal360Progress.current += dt / duration;
      const t = Math.min(reveal360Progress.current, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      ringGroupRef.current.rotation.y = eased * Math.PI * 2;
      if (t >= 1) reveal360Active.current = false;
    }
  });

  return (
    <group>
      {/* ── PREMIUM LIGHTING SETUP ─────────────────────────── */}

      {/* Key light: warm top-front spotlight */}
      <spotLight
        position={[2, 7, 4]}
        angle={0.4}
        penumbra={0.5}
        intensity={5}
        color="#fff6e8"
        distance={25}
        castShadow={false}
      />

      {/* Fill: soft warm light from front-left */}
      <pointLight position={[-3, 3, 5]} intensity={2.5} color="#ffeedd" distance={14} />

      {/* Rim: cool blue from behind — gives depth to the velvet */}
      <pointLight position={[0, 3, -5]} intensity={1.8} color="#b0c8ff" distance={14} />

      {/* Diamond sparkle lights: positioned to hit different facets */}
      <pointLight position={[2, 5, 2]}   intensity={3.0} color="#ffffff" distance={10} />
      <pointLight position={[-2, 4, 2]}  intensity={2.0} color="#ffe8f0" distance={10} />
      <pointLight position={[0, -1, 4]}  intensity={1.5} color="#fff4e0" distance={8}  />

      {/* Pink accent from the side — romantic glow on the ring */}
      <pointLight position={[4, 2, 1]} intensity={1.2} color="#e8829a" distance={10} />
      <pointLight position={[-4, 2, 1]} intensity={0.8} color="#f9d4c8" distance={10} />

      {/* Ambient fill — enough to see details in shadow */}
      <ambientLight intensity={0.7} color="#ffffff" />

      {/* ── SCENE OBJECTS ───────────────────────────────────── */}

      {/* Velvet ring box */}
      <group ref={boxRef} position={[0, -0.2, 0]}>
        <RingBox />
      </group>

      {/* Heart burst on open */}
      <HeartBurst />

      {/* Ring — hidden inside box, rises on open */}
      <group ref={ringGroupRef} position={[0, -0.4, 0]}>
        <Ring revealed={revealed} />
      </group>

      {/* Diamond sparkle particles */}
      <Sparkles
        count={caps.isMobile ? 30 : caps.sparkleCount}
        scale={caps.isMobile ? 2.5 : 3.5}
        size={caps.isMobile ? 2 : 3}
        speed={0.4}
        color="#fff8dc"
        position={[0, 0.9, 0]}
      />
      {/* Pink heart sparkles for romance */}
      <Sparkles
        count={caps.isMobile ? 15 : 25}
        scale={caps.isMobile ? 2 : 3}
        size={caps.isMobile ? 1.5 : 2}
        speed={0.2}
        color="#e8829a"
        position={[0, 0.5, 0]}
      />
    </group>
  );
}
