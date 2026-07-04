"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useProposal } from "../state";
import { detectCapabilities } from "@/lib/proposal/capabilities";

/**
 * The Ring — realistic solitaire engagement ring.
 *
 * Rose-gold band with cathedral prong setting.
 * Diamond with multi-layer shimmer for realistic sparkle.
 * Scales automatically for mobile vs desktop.
 */

// Rose gold — warm romantic hue
const ROSE_GOLD = "#E8B4A0";
const ROSE_GOLD_DARK = "#C8845A";

interface RingProps {
  revealed?: boolean;
}

export function Ring({ revealed = false }: RingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const diamondRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const caps = useMemo(() => detectCapabilities(), []);
  const { size } = useThree();

  // Scale down on narrow screens (mobile portrait)
  const mobileScale = useMemo(() => {
    const aspect = size.width / size.height;
    if (aspect < 0.6) return 0.72; // very narrow portrait
    if (aspect < 0.8) return 0.82; // normal portrait
    return 1.0;
  }, [size.width, size.height]);

  // --- Band geometry: smooth torus ---
  const bandGeometry = useMemo(() => {
    return new THREE.TorusGeometry(0.9, 0.14, 80, 160);
  }, []);

  // --- Cathedral shoulders: slightly raised band sections near the setting ---
  const shoulderGeometry = useMemo(() => {
    // Two small torus arcs that arch upward toward the prongs
    return new THREE.TorusGeometry(0.9, 0.11, 32, 80, Math.PI * 0.55);
  }, []);

  // --- Diamond geometry: proper brilliant cut (more facets = more sparkle) ---
  const diamondGeometry = useMemo(() => {
    const segments = 16; // 16 sides = much smoother, more facets
    const crownHeight = 0.38;
    const pavilionHeight = 0.72;
    const tableRadius = 0.36;
    const girdleRadius = 0.54;
    const starRadius = 0.46; // mid-crown breakline

    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    const pushTri = (
      ax: number, ay: number, az: number,
      bx: number, by: number, bz: number,
      cx: number, cy: number, cz: number,
    ) => {
      positions.push(ax, ay, az, bx, by, bz, cx, cy, cz);
      const nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay);
      const ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
      const nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      normals.push(nx / len, ny / len, nz / len, nx / len, ny / len, nz / len, nx / len, ny / len, nz / len);
      uvs.push(0, 0, 1, 0, 0.5, 1);
    };

    for (let i = 0; i < segments; i++) {
      const a1 = (i / segments) * Math.PI * 2;
      const a2 = ((i + 1) / segments) * Math.PI * 2;
      const aMid = ((i + 0.5) / segments) * Math.PI * 2;

      const g1x = Math.cos(a1) * girdleRadius, g1z = Math.sin(a1) * girdleRadius;
      const g2x = Math.cos(a2) * girdleRadius, g2z = Math.sin(a2) * girdleRadius;
      const t1x = Math.cos(a1) * tableRadius,  t1z = Math.sin(a1) * tableRadius;
      const t2x = Math.cos(a2) * tableRadius,  t2z = Math.sin(a2) * tableRadius;
      const s1x = Math.cos(aMid) * starRadius, s1z = Math.sin(aMid) * starRadius;

      // Upper crown: girdle → star facet point → table corner
      pushTri(g1x, 0, g1z, g2x, 0, g2z, s1x, crownHeight * 0.55, s1z);
      pushTri(g1x, 0, g1z, s1x, crownHeight * 0.55, s1z, t1x, crownHeight, t1z);
      pushTri(g2x, 0, g2z, t2x, crownHeight, t2z, s1x, crownHeight * 0.55, s1z);

      // Pavilion: girdle → culet
      const culetY = -pavilionHeight;
      // Break pavilion into 2 sub-facets for more realism
      const pMidX = Math.cos(aMid) * girdleRadius * 0.3;
      const pMidZ = Math.sin(aMid) * girdleRadius * 0.3;
      const pMidY = -pavilionHeight * 0.5;
      pushTri(g1x, 0, g1z, pMidX, pMidY, pMidZ, g2x, 0, g2z);
      pushTri(g1x, 0, g1z, 0, culetY, 0, pMidX, pMidY, pMidZ);
      pushTri(g2x, 0, g2z, pMidX, pMidY, pMidZ, 0, culetY, 0);
    }

    // Table (flat top) — fan from center
    for (let i = 0; i < segments; i++) {
      const a1 = (i / segments) * Math.PI * 2;
      const a2 = ((i + 1) / segments) * Math.PI * 2;
      const t1x = Math.cos(a1) * tableRadius, t1z = Math.sin(a1) * tableRadius;
      const t2x = Math.cos(a2) * tableRadius, t2z = Math.sin(a2) * tableRadius;
      pushTri(t1x, crownHeight, t1z, t2x, crownHeight, t2z, 0, crownHeight, 0);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.computeVertexNormals();
    return geo;
  }, []);

  // --- Rose gold band material ---
  const goldMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(ROSE_GOLD),
      metalness: 1.0,
      roughness: 0.18,
      envMapIntensity: 1.8,
      clearcoat: 0.5,
      clearcoatRoughness: 0.08,
      reflectivity: 1.0,
      emissive: new THREE.Color(ROSE_GOLD_DARK),
      emissiveIntensity: 0.04,
    });
  }, []);

  // --- Diamond material: iridescent sparkle ---
  const diamondMaterial = useMemo(() => {
    if (caps.useTransmission) {
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#ffffff"),
        metalness: 0.0,
        roughness: 0.0,
        transmission: 0.92,
        thickness: 0.8,
        ior: 2.42,           // real diamond IOR
        dispersion: 0.3,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        envMapIntensity: 3.0,
        transparent: true,
        opacity: 0.95,
        emissive: new THREE.Color("#ffffff"),
        emissiveIntensity: 0.06,
      });
    }
    // Mobile: bright iridescent white — visible without transmission
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#e8f4ff"),
      metalness: 0.0,
      roughness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      envMapIntensity: 3.0,
      transparent: true,
      opacity: 0.92,
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: 0.15,
    });
  }, [caps.useTransmission]);

  // --- Shimmer halo material (inner glow around diamond) ---
  const haloMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ffe4ef"),
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  // --- Cathedral prongs (6-prong solitaire) ---
  const prongs = useMemo(() => {
    const count = 6;
    const radius = 0.50;
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2;
      return { x: Math.cos(a) * radius, z: Math.sin(a) * radius, key: i };
    });
  }, []);

  // Prong material: same rose gold
  const prongMaterial = useMemo(() => goldMaterial.clone(), [goldMaterial]);

  // --- Animation ---
  useFrame((state, dt) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    if (revealed) {
      // Idle spin
      groupRef.current.rotation.y += dt * 0.45;
    }

    // Diamond shimmer: subtle scale pulse + emissive flicker
    if (diamondRef.current) {
      const shimmer = 1 + Math.sin(t * 3.5) * 0.012;
      diamondRef.current.scale.setScalar(shimmer);
      const mat = diamondRef.current.material as THREE.MeshPhysicalMaterial;
      mat.emissiveIntensity = caps.useTransmission
        ? 0.04 + Math.abs(Math.sin(t * 4.2)) * 0.08
        : 0.1 + Math.abs(Math.sin(t * 4.2)) * 0.12;
    }

    // Halo pulse
    if (haloRef.current) {
      const haloMat = haloRef.current.material as THREE.MeshBasicMaterial;
      haloMat.opacity = 0.12 + Math.abs(Math.sin(t * 2.0)) * 0.12;
    }
  });

  return (
    <group ref={groupRef} dispose={null} scale={[mobileScale, mobileScale, mobileScale]}>
      {/* Rose gold band — flat orientation */}
      <mesh geometry={bandGeometry} material={goldMaterial} rotation={[Math.PI / 2, 0, 0]} />

      {/* Cathedral shoulder arcs (left and right) */}
      <mesh
        geometry={shoulderGeometry}
        material={goldMaterial}
        rotation={[Math.PI / 2, 0, Math.PI * 0.5]}
        position={[0, 0.05, 0]}
        scale={[1.02, 1.02, 1.02]}
      />
      <mesh
        geometry={shoulderGeometry}
        material={goldMaterial}
        rotation={[Math.PI / 2, 0, -Math.PI * 0.5]}
        position={[0, 0.05, 0]}
        scale={[1.02, 1.02, 1.02]}
      />

      {/* Setting base: small cylinder bridging band to prongs */}
      <mesh position={[0, 0.22, 0]} material={goldMaterial}>
        <cylinderGeometry args={[0.46, 0.56, 0.28, 32]} />
      </mesh>

      {/* Diamond */}
      <mesh
        ref={diamondRef}
        geometry={diamondGeometry}
        material={diamondMaterial}
        position={[0, 0.48, 0]}
      />

      {/* Halo glow around diamond */}
      <mesh ref={haloRef} position={[0, 0.48, 0]} material={haloMaterial}>
        <sphereGeometry args={[0.72, 24, 24]} />
      </mesh>

      {/* 6-prong setting */}
      {prongs.map((p) => (
        <mesh
          key={p.key}
          position={[p.x, 0.30, p.z]}
          material={prongMaterial}
        >
          {/* Tapered prong: wider at base, thin tip gripping the diamond */}
          <cylinderGeometry args={[0.025, 0.045, 0.45, 10]} />
        </mesh>
      ))}

      {/* Tiny diamond accent: round brilliant reflection point at table center */}
      <mesh position={[0, 0.88, 0]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
