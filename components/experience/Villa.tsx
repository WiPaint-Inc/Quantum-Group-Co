"use client";

import type { Massing } from "@/content/site";

const plaster = "#f3eee6";
const bronze = "#8d6a3c";
const glass = "#9fd8d2";
const pool = "#148f8a";

export function Villa({ massing }: { massing: Massing }) {
  if (massing === "court") {
    return (
      <group position={[0, 0.42, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <planeGeometry args={[0.55, 0.55]} />
          <meshStandardMaterial color={pool} roughness={0.12} metalness={0.25} />
        </mesh>
        {[
          [0, 0.16, 0.48],
          [0, 0.16, -0.48],
          [0.48, 0.16, 0],
          [-0.48, 0.16, 0],
        ].map((position) => (
          <mesh key={position.join(",")} position={position as [number, number, number]} castShadow>
            <boxGeometry args={[position[0] === 0 ? 0.85 : 0.28, 0.28, position[2] === 0 ? 0.85 : 0.28]} />
            <meshStandardMaterial color={plaster} roughness={0.78} />
          </mesh>
        ))}
      </group>
    );
  }

  if (massing === "lantern") {
    return (
      <group position={[0, 0.42, 0]}>
        <mesh position={[0, 0.16, 0]} castShadow>
          <boxGeometry args={[0.85, 0.32, 0.85]} />
          <meshStandardMaterial color={plaster} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.48, 0]} castShadow>
          <boxGeometry args={[0.55, 0.32, 0.55]} />
          <meshStandardMaterial color="#f0d7a4" emissive="#c9893a" emissiveIntensity={0.35} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.68, 0]}>
          <boxGeometry args={[0.7, 0.04, 0.7]} />
          <meshStandardMaterial color={bronze} metalness={0.45} roughness={0.4} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[0, 0.42, 0]}>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.45, 0.32, 0.48]} />
        <meshStandardMaterial color={plaster} roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.36, 0]} castShadow>
        <boxGeometry args={[1.7, 0.045, 0.68]} />
        <meshStandardMaterial color={bronze} metalness={0.4} roughness={0.42} />
      </mesh>
      <mesh position={[0.1, 0.16, 0.25]}>
        <boxGeometry args={[0.72, 0.18, 0.02]} />
        <meshStandardMaterial color={glass} transparent opacity={0.55} roughness={0.05} metalness={0.15} />
      </mesh>
      <mesh position={[-0.95, 0.02, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.38, 0.24]} />
        <meshStandardMaterial color={pool} roughness={0.15} metalness={0.2} />
      </mesh>
    </group>
  );
}
