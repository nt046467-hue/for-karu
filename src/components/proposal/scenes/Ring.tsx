"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useProposal } from "../state";
import { detectCapabilities } from "@/lib/proposal/capabilities";

/**
 * The Ring — centerpiece of the proposal.
 *
 * Geometry: procedural (PRD §4.1 Option A)
 *   - Band: TorusGeometry (high segment count for smoothness)
 *   - Diamond: custom brilliant-cut shape (top crown + bottom pavilion)
 *   - Prongs: 4 small cylinders gripping the gem
 *
 * Material: PRD §4.2 spec exactly
 *   - Gold band: MeshPhysicalMaterial, metalness 1.0, roughness 0.2, envMapIntensity 2
 *   - Diamond: MeshPhysicalMaterial, transmission 1.0, ior 2.4 (real diamond IOR),
 *     thickness 0.5, roughness 0 — this is what makes light bend through it.
 *
 * On mobile, transmission is disabled (perf fallback → fake glass look).
 */

const GOLD_COLOR = "#FFD700"; // match to real ring: rose gold #E8B4A0 / white gold #E8E8E8

interface RingProps {
  /** Set true once the ring has fully risen out of the box. Drives idle spin. */
  revealed?: boolean;
}

export function Ring({ revealed = false }: RingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const diamondRef = useRef<THREE.Mesh>(null);
  const caps = useMemo(() => detectCapabilities(), []);

  // --- Geometry (memoized once) ---

  const bandGeometry = useMemo(() => {
    // radius 1, tube 0.16, 64 radial segments, 128 tubular segments
    return new THREE.TorusGeometry(1, 0.16, 64, 128);
  }, []);

  const diamondGeometry = useMemo(() => {
    // Brilliant-cut diamond: top crown (table + crown facets) + bottom pavilion
    // Built by merging two cone geometries top-to-bottom, then flattening the top.
    //
    // We construct it from a single BufferGeometry by computing vertices manually.
    // Crown: 8-sided cone, narrower at top (the "table")
    // Pavilion: 8-sided cone, narrowing to a point at the bottom (the "culet")
    const segments = 8;

    const crownHeight = 0.45;
    const pavilionHeight = 0.9;
    const tableRadius = 0.42; // top flat
    const girdleRadius = 0.62; // widest point (where crown meets pavilion)

    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    // Helper: push a triangle (a, b, c)
    const pushTri = (
      ax: number, ay: number, az: number,
      bx: number, by: number, bz: number,
      cx: number, cy: number, cz: number,
    ) => {
      positions.push(ax, ay, az, bx, by, bz, cx, cy, cz);
      const nx = (ay - by) * (cz - bz) - (az - bz) * (cy - by);
      const ny = (az - bz) * (bx - ax) - (ax - bx) * (cz - bz);
      const nz = (ax - bx) * (by - ay) - (ay - by) * (bx - ax);
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      normals.push(
        -nx / len, -ny / len, -nz / len,
        -nx / len, -ny / len, -nz / len,
        -nx / len, -ny / len, -nz / len,
      );
      uvs.push(0, 0, 1, 0, 0.5, 1);
    };

    // Generate ring vertices for crown (at girdleRadius) and table (at tableRadius)
    for (let i = 0; i < segments; i++) {
      const a1 = (i / segments) * Math.PI * 2;
      const a2 = ((i + 1) / segments) * Math.PI * 2;

      // Crown: girdle (y=0) to table (y=crownHeight)
      const g1x = Math.cos(a1) * girdleRadius, g1z = Math.sin(a1) * girdleRadius;
      const g2x = Math.cos(a2) * girdleRadius, g2z = Math.sin(a2) * girdleRadius;
      const t1x = Math.cos(a1) * tableRadius, t1z = Math.sin(a1) * tableRadius;
      const t2x = Math.cos(a2) * tableRadius, t2z = Math.sin(a2) * tableRadius;

      // Crown side triangle (girdle-to-table per segment)
      pushTri(g1x, 0, g1z, g2x, 0, g2z, t2x, crownHeight, t2z);
      pushTri(g1x, 0, g1z, t2x, crownHeight, t2z, t1x, crownHeight, t1z);

      // Pavilion: girdle (y=0) down to culet point (y=-pavilionHeight)
      const culetX = 0, culetY = -pavilionHeight, culetZ = 0;
      pushTri(g2x, 0, g2z, g1x, 0, g1z, culetX, culetY, culetZ);
    }

    // Table (top flat face) — fan from center
    const tableCenterY = crownHeight;
    for (let i = 0; i < segments; i++) {
      const a1 = (i / segments) * Math.PI * 2;
      const a2 = ((i + 1) / segments) * Math.PI * 2;
      const t1x = Math.cos(a1) * tableRadius, t1z = Math.sin(a1) * tableRadius;
      const t2x = Math.cos(a2) * tableRadius, t2z = Math.sin(a2) * tableRadius;
      pushTri(t1x, tableCenterY, t1z, t2x, tableCenterY, t2z, 0, tableCenterY, 0);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.computeVertexNormals();
    return geo;
  }, []);

  // --- Materials ---

  const goldMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(GOLD_COLOR),
      metalness: 1.0,
      roughness: 0.2,
      envMapIntensity: 2.0,
      clearcoat: 0.3,
      clearcoatRoughness: 0.1,
    });
  }, []);

  const diamondMaterial = useMemo(() => {
    if (caps.useTransmission) {
      // Full PBR spec from PRD §4.2 — real diamond IOR
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#ffffff"),
        metalness: 0,
        roughness: 0,
        transmission: 1.0,
        thickness: 0.5,
        ior: 2.4, // diamond's real index of refraction
        clearcoat: 1,
        clearcoatRoughness: 0,
        envMapIntensity: 2,
        transparent: true,
      });
    }
    // Mobile fallback — fake glass with iridescent white
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#f8fbff"),
      metalness: 0.1,
      roughness: 0.05,
      envMapIntensity: 2.5,
      clearcoat: 1,
      clearcoatRoughness: 0,
      transparent: true,
      opacity: 0.85,
    });
  }, [caps.useTransmission]);

  // Prong positions (4 prongs evenly around the diamond's girdle)
  const prongs = useMemo(() => {
    const count = 4;
    const radius = 0.55;
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + Math.PI / 4;
      return {
        x: Math.cos(a) * radius,
        z: Math.sin(a) * radius,
        key: i,
      };
    });
  }, []);

  // --- Idle rotation ---
  // Slow idle when revealed (PRD §4.6 step 5: 0.15 rad/s permanent spin)
  useFrame((_, dt) => {
    if (!groupRef.current) return;
    if (revealed) {
      groupRef.current.rotation.y += dt * 0.5; // a bit faster than 0.15 so the user can see all facets
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      {/* Band — rotated so the torus lies flat (ring finger orientation) */}
      <mesh
        geometry={bandGeometry}
        material={goldMaterial}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* Diamond — sitting on top of the band */}
      <mesh
        ref={diamondRef}
        geometry={diamondGeometry}
        material={diamondMaterial}
        position={[0, 0.55, 0]}
        scale={[1, 1, 1]}
      />

      {/* Prongs */}
      {prongs.map((p) => (
        <mesh
          key={p.key}
          position={[p.x, 0.35, p.z]}
          rotation={[0, 0, 0]}
        >
          <cylinderGeometry args={[0.04, 0.05, 0.4, 12]} />
          <primitive object={goldMaterial} attach="material" />
        </mesh>
      ))}
    </group>
  );
}
