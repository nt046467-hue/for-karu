"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useProposal } from "../state";

/**
 * HeartBurst — small 2D heart sprites that explode out of the box
 * when the lid opens (phase = "ring-open"), then float up and fade.
 *
 * Uses instanced flat heart planes (a heart texture drawn on a canvas)
 * for maximum performance with many particles.
 */

interface HeartParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: number;
  rotSpeed: number;
  scale: number;
  opacity: number;
  dead: boolean;
}

function makeHeartTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Draw a heart on the canvas
  const cx = size / 2;
  const cy = size / 2 + 8;
  const r = size * 0.34;

  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.25);
  ctx.bezierCurveTo(cx, cy + r * 0.25, cx - r * 0.1, cy + r * 0.45, cx - r * 0.5, cy + r * 0.45);
  ctx.bezierCurveTo(cx - r, cy + r * 0.45, cx - r, cy, cx - r, cy);
  ctx.bezierCurveTo(cx - r, cy - r * 0.55, cx - r * 0.5, cy - r * 0.77, cx, cy - r);
  ctx.bezierCurveTo(cx + r * 0.5, cy - r * 0.77, cx + r, cy - r * 0.55, cx + r, cy);
  ctx.bezierCurveTo(cx + r, cy, cx + r, cy + r * 0.45, cx + r * 0.5, cy + r * 0.45);
  ctx.bezierCurveTo(cx + r * 0.1, cy + r * 0.45, cx, cy + r * 0.25, cx, cy + r * 0.25);
  ctx.closePath();

  // Gradient fill: light pink to deep rose
  const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
  grad.addColorStop(0, "#ffd4e0");
  grad.addColorStop(0.5, "#e8829a");
  grad.addColorStop(1, "#c2506e");
  ctx.fillStyle = grad;
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

const HEART_COUNT = 40;

export function HeartBurst() {
  const phase = useProposal((s) => s.phase);
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const particles = useRef<HeartParticle[]>([]);
  const started = useRef(false);
  const elapsed = useRef(0);

  const texture = useMemo(() => {
    if (typeof window === "undefined") return null;
    return makeHeartTexture();
  }, []);

  const material = useMemo(() => {
    if (!texture) return null;
    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, [texture]);

  // Initialize particles when box opens
  useEffect(() => {
    if (phase !== "ring-open" || started.current) return;
    started.current = true;
    elapsed.current = 0;

    particles.current = Array.from({ length: HEART_COUNT }, (_, i) => {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 1.2 + Math.random() * 2.5;
      const upBias = 0.8 + Math.random() * 1.5; // strong upward push from box
      return {
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 0.6,  // start near box center X
          0.4,                            // start at box opening height
          (Math.random() - 0.5) * 0.6,  // start near box center Z
        ),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed * 0.5,
          upBias * speed,
          Math.sin(angle) * speed * 0.3,
        ),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 4,
        scale: 0.05 + Math.random() * 0.12,
        opacity: 1,
        dead: false,
      };
    });
  }, [phase]);

  useFrame((_, dt) => {
    if (!started.current || particles.current.length === 0) return;
    elapsed.current += dt;

    particles.current.forEach((p, i) => {
      if (p.dead) return;
      const mesh = meshRefs.current[i];
      if (!mesh) return;

      // Physics: gravity pulls down, velocity decays
      p.velocity.y -= dt * 2.5;
      p.position.addScaledVector(p.velocity, dt);
      p.rotation += p.rotSpeed * dt;

      // Fade out after 1.5s
      p.opacity = Math.max(0, 1 - (elapsed.current - 0.3) / 2.0);

      if (p.opacity <= 0) {
        p.dead = true;
        mesh.visible = false;
        return;
      }

      mesh.visible = true;
      mesh.position.copy(p.position);
      mesh.rotation.z = p.rotation;
      // Billboard: always face camera (handled by DoubleSide + flat plane)
      mesh.scale.setScalar(p.scale);
      (mesh.material as THREE.MeshBasicMaterial).opacity = p.opacity;
    });
  });

  if (!material) return null;

  return (
    <group ref={groupRef}>
      {Array.from({ length: HEART_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
          visible={false}
          material={material.clone()}
        >
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}
