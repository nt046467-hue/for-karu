"use client";

import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useProposal } from "./state";
import { TIMELINE } from "@/lib/timeline";

/**
 * CameraRig — drives the camera through each scene (PRD §5).
 *
 * Each phase has a target camera position + lookAt target. On phase change,
 * we GSAP-tween the camera between them with power2.inOut easing.
 *
 * The lookAt target is stored in a ref and applied every frame in useFrame
 * (so it stays stable even when other animations are running).
 */

interface CameraTarget {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
}

const TARGETS: Record<string, CameraTarget> = {
  gate: { position: [0, 0, 12], lookAt: [0, 0, 0], fov: 50 },
  intro: { position: [0, 0, 8], lookAt: [0, 0, 0], fov: 50 },
  memories: { position: [0, 0, 6], lookAt: [0, 0, -10], fov: 55 },
  turn: { position: [0, 0.5, 5], lookAt: [0, 0, -5], fov: 50 },
  "ring-idle": { position: [0, 1.5, 5.5], lookAt: [0, 0, 0], fov: 50 },
  "ring-open": { position: [0, 1.5, 5.0], lookAt: [0, 0.5, 0], fov: 46 },
  "ring-reveal": { position: [0, 1.8, 4.2], lookAt: [0, 0.8, 0], fov: 44 },
  proposal: { position: [0, 2.0, 4.0], lookAt: [0, 0.8, 0], fov: 42 },
  answered: { position: [0, 2.5, 5.0], lookAt: [0, 1.0, 0], fov: 45 },
};

export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const lookAtRef = useRef(new THREE.Vector3(0, 0, 0));
  const phase = useProposal((s) => s.phase);

  useEffect(() => {
    const target = TARGETS[phase];
    if (!target) return;

    const pc = camera as THREE.PerspectiveCamera;
    if (!pc.isPerspectiveCamera) return;

    // Tween camera position
    gsap.to(camera.position, {
      x: target.position[0],
      y: target.position[1],
      z: target.position[2],
      duration: 2.2,
      ease: "power2.inOut",
    });

    // Tween lookAt target (so we pan smoothly)
    gsap.to(lookAtRef.current, {
      x: target.lookAt[0],
      y: target.lookAt[1],
      z: target.lookAt[2],
      duration: 2.2,
      ease: "power2.inOut",
    });

    // Tween FOV (subtle dolly effect)
    gsap.to(pc, {
      fov: target.fov,
      duration: 2.0,
      ease: "power2.inOut",
      onUpdate: () => pc.updateProjectionMatrix(),
    });
  }, [phase, camera]);

  // Apply lookAt every frame
  useFrame(() => {
    camera.lookAt(lookAtRef.current);
  });

  return null;
}
