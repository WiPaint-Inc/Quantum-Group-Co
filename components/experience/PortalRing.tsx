"use client";

import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";
import { meridian } from "@/content/site";

export function PortalRing({
  reducedMotion,
  onPortal,
}: {
  reducedMotion: boolean;
  onPortal: () => void;
}) {
  const ring = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (ring.current && !reducedMotion) ring.current.rotation.z += dt * 0.15;
  });

  const rings = (
    <group position={meridian.position}>
      <mesh
        ref={ring}
        onClick={(event) => {
          event.stopPropagation();
          onPortal();
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <torusGeometry args={[1.15, 0.018, 24, 96]} />
        <meshBasicMaterial color="#e6d2a8" />
      </mesh>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onPortal();
        }}
      >
        <circleGeometry args={[1.15, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.45, 0.006, 16, 80]} />
        <meshBasicMaterial color="#8fd4cb" transparent opacity={0.7} />
      </mesh>
      <pointLight intensity={3} distance={8} color="#e6c48a" />
    </group>
  );

  if (reducedMotion) return rings;
  return (
    <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.35}>
      {rings}
    </Float>
  );
}
