"use client";

import { Suspense, useMemo, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, DepthOfField } from "@react-three/postprocessing";
import * as THREE from "three";
import { useProposal } from "./state";
import { useTimelineController } from "./useTimelineController";
import { useAudioController } from "./useAudio";
import { detectCapabilities } from "@/lib/proposal/capabilities";
import { CameraRig } from "./CameraRig";
import { IntroScene } from "./scenes/IntroScene";
import { MemoryStream } from "./scenes/MemoryStream";
import { RingScene } from "./scenes/RingScene";
import { ConfettiBurst } from "./scenes/ConfettiBurst";

/**
 * Experience — top-level R3F Canvas + scene switching.
 *
 * Renders all scenes simultaneously (mounted as needed) but the camera rig
 * controls what's visible by positioning the camera appropriately per phase.
 * Each scene is conditionally rendered to keep the scene graph light.
 */
export function Experience() {
  const phase = useProposal((s) => s.phase);
  useTimelineController();
  useAudioController();

  const [caps] = useState(() => detectCapabilities());

  // Show scenes based on phase
  const showIntro = phase === "intro";
  const showMemories = phase === "memories" || phase === "turn";
  const showTurn = phase === "turn";
  const showRing =
    phase === "ring-idle" ||
    phase === "ring-open" ||
    phase === "ring-reveal" ||
    phase === "proposal" ||
    phase === "answered";
  const showConfetti = phase === "answered";

  // Background color — warm slightly during ring scene (PRD §5)
  const bgColor = useMemo(() => {
    if (phase === "ring-idle" || phase === "ring-open" || phase === "ring-reveal" || phase === "proposal" || phase === "answered") {
      return new THREE.Color("#1a1410");
    }
    if (phase === "turn") {
      return new THREE.Color("#080608");
    }
    return new THREE.Color("#0a0a0f");
  }, [phase]);

  return (
    <Canvas
      // PRD §8: cap DPR at 1.5 on mobile to avoid overheating/lag
      dpr={caps.dprCap}
      gl={{
        antialias: !caps.isMobile,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      camera={{ position: [0, 0, 12], fov: 50, near: 0.1, far: 100 }}
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
    >
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[bgColor, 8, 120]} />

      <Suspense fallback={null}>
        <CameraRig />

        {showIntro && <IntroScene />}
        {showMemories && <MemoryStream />}
        {showTurn && <IntroScene />}
        {showRing && (
          <RingScene />
        )}
        {showConfetti && <ConfettiBurst />}

        {/* Post-processing — PRD §2 */}
        <EffectComposer multisampling={caps.isMobile ? 0 : 4}>
          {/* PRD §4.5: Bloom so sparkle points and light hits actually glow */}
          <Bloom
            intensity={caps.isMobile ? 0.8 : 1.2}
            luminanceThreshold={0.4}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          {/* Subtle vignette for cinematic framing */}
          <Vignette eskil={false} offset={0.25} darkness={0.65} />
          {/* DepthOfField only on desktop — expensive on mobile */}
          {!caps.isMobile && phase !== "gate" && (
            <DepthOfField
              focusDistance={0.02}
              focalLength={0.05}
              bokehScale={2.5}
            />
          )}
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
