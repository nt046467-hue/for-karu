"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { PHOTOS } from "@/lib/timeline";

/**
 * Scene 2 — The Memories (PRD §3 Scene 2)
 *
 * 3D floating photo planes drift past the camera like a gentle memory stream.
 * Each photo has a short caption rendered as HTML overlay (drei <Html>).
 *
 * Photo loading: if the file at /public/photos/photo-N.webp is missing,
 * the texture loader will fail silently and we fall back to a colored gradient
 * plane (placeholder) so the scene never breaks.
 */

interface PhotoPlaneProps {
  index: number;
  src: string;
  caption: string;
  total: number;
}

function PhotoPlane({ index, src, caption, total }: PhotoPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [failed, setFailed] = useState(false);

  // Stagger positions along Z so they appear sequentially as the camera drifts forward
  const zPos = useMemo(() => -index * 6 - 4, [index]);
  const xOffset = useMemo(() => (index % 2 === 0 ? -1.5 : 1.5), [index]);
  const yTilt = useMemo(() => (Math.random() - 0.5) * 0.2, []);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      src,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      () => setFailed(true),
    );
  }, [src]);

  // Gentle drift + tilt
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.position.x = xOffset + Math.sin(t * 0.4 + index) * 0.2;
    meshRef.current.position.y = Math.sin(t * 0.3 + index * 1.5) * 0.15;
    meshRef.current.rotation.y = Math.sin(t * 0.2 + index) * 0.1 + yTilt;
    meshRef.current.rotation.z = Math.sin(t * 0.15 + index * 0.7) * 0.05;
  });

  // Placeholder gradient color (cycles through warm tones)
  const placeholderColor = useMemo(() => {
    const colors = ["#3a2a4a", "#4a3a2a", "#2a3a4a", "#4a2a3a", "#3a4a2a"];
    return colors[index % colors.length];
  }, [index]);

  return (
    <group position={[0, 0, zPos]}>
      <mesh ref={meshRef}>
        <planeGeometry args={[3, 2.1]} />
        {texture && !failed ? (
          <meshBasicMaterial map={texture} toneMapped={false} side={THREE.DoubleSide} />
        ) : (
          <meshStandardMaterial
            color={placeholderColor}
            roughness={0.7}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>
      {/* Subtle frame edge */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[3.1, 2.2]} />
        <meshBasicMaterial color="#1a1410" side={THREE.DoubleSide} />
      </mesh>
      {/* Caption below the photo */}
      <Html
        position={[0, -1.5, 0]}
        center
        distanceFactor={8}
        zIndexRange={[10, 0]}
      >
        <div
          style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: "0.22rem",
            color: "#f4e4c1",
            textAlign: "center",
            whiteSpace: "nowrap",
            textShadow: "0 0 10px rgba(0,0,0,0.8)",
            fontStyle: "italic",
            letterSpacing: "0.02em",
          }}
        >
          {caption}
        </div>
      </Html>
    </group>
  );
}

export function MemoryStream() {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef}>
      {/* Lighting for the memory stream photo planes */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[2, 5, 5]} intensity={1.8} color="#fff4e0" />
      
      {PHOTOS.map((p, i) => (
        <PhotoPlane
          key={i}
          index={i}
          src={p.src}
          caption={p.caption}
          total={PHOTOS.length}
        />
      ))}
    </group>
  );
}
