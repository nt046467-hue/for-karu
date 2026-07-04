"use client";

import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
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
 * Ring scenes get:
 *   - <Environment preset="studio" /> — gives metal and diamond something to
 *     reflect, which is the single biggest visual upgrade for PBR materials.
 *     Without an env map, metalness=1 and transmission look flat regardless of
 *     how correct the material settings are.
 *   - <Bloom /> (desktop only) — makes diamond sparkle points and gold
 *     highlights actually glow instead of just being bright pixels.
 *
 * Mobile: Environment still loads (critical for realism) but Bloom is skipped
 * to avoid GPU overload on weaker devices.
 */
export function Experience() {
  const phase = useProposal((s) => s.phase);
  useTimelineController();
  useAudioController();

  const [caps] = useState(() => detectCapabilities());

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

  // Whether ring environment / post-processing should be active
  const isRingPhase = showRing;

  const bgColor = useMemo(() => {
    if (isRingPhase) return new THREE.Color("#1a1410");
    if (phase === "turn") return new THREE.Color("#080608");
    return new THREE.Color("#0a0a0f");
  }, [phase, isRingPhase]);

  return (
    <Canvas
      dpr={caps.dprCap}
      gl={{
        antialias: !caps.isMobile,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
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
          <>
            {/* Studio HDRI — gives metalness + transmission real reflections.
                This is the biggest visual upgrade for the ring & diamond. */}
            <Environment
              preset="studio"
              background={false}   // don't replace our dark bg
              environmentIntensity={1.4}
            />
            <RingScene />
          </>
        )}

        {showConfetti && <ConfettiBurst />}

        {/* Bloom post-processing — desktop only for perf.
            Makes gem sparkles and gold highlights glow visibly. */}
        {isRingPhase && !caps.isMobile && (
          <EffectComposer>
            <Bloom
              intensity={0.55}
              luminanceThreshold={0.55}
              luminanceSmoothing={0.7}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}
