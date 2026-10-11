"use client";

import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";
import { spaceNodes } from "@/content/site";

function Body({
  id,
  position,
  tint,
  focused,
  reducedMotion,
  onSelect,
}: {
  id: string;
  position: [number, number, number];
  tint: string;
  focused: boolean;
  reducedMotion: boolean;
  onSelect: (id: string) => void;
}) {
  const ring = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (ring.current && !reducedMotion) ring.current.rotation.z += dt * 0.25;
  });

  return (
    <group position={position}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelect(id);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <sphereGeometry args={[0.46, 48, 48]} />
        <meshStandardMaterial
          color={tint}
          emissive={tint}
          emissiveIntensity={focused ? 0.65 : 0.22}
          roughness={0.28}
          metalness={0.35}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial color={tint} transparent opacity={focused ? 0.18 : 0.08} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2.6, 0.4, 0]}>
        <torusGeometry args={[0.82, 0.008, 16, 90]} />
        <meshBasicMaterial color={tint} />
      </mesh>
      <mesh position={[0, -0.95, 0]}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshBasicMaterial color="#f4efe6" />
      </mesh>
      {focused ? <pointLight intensity={6} distance={7} color={tint} /> : null}
    </group>
  );
}

export function SpaceRealm({
  visible,
  focusId,
  reducedMotion,
  onSelect,
}: {
  visible: boolean;
  focusId: string | null;
  reducedMotion: boolean;
  onSelect: (id: string) => void;
}) {
  if (!visible) return null;
  return (
    <group>
      <fogExp2 attach="fog" args={["#07080f", 0.02]} />
      <Stars radius={70} depth={40} count={1600} factor={2.4} fade saturation={0} speed={reducedMotion ? 0 : 0.35} />
      {spaceNodes.map((node) => (
        <Body
          key={node.id}
          id={node.id}
          position={node.position}
          tint={node.tint}
          focused={focusId === node.id}
          reducedMotion={reducedMotion}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}
