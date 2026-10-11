"use client";

import { Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { SkyDome } from "@/components/experience/SkyDome";

const night = { current: 0.68 };
const calm = { current: 0 };

function Glass() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.position.y = Math.sin(t * 0.32) * 0.05;
    group.current.rotation.y = -0.42 + Math.sin(t * 0.18) * 0.05;
  });

  return (
    <group ref={group} position={[-0.55, 0.05, 0]}>
      <mesh position={[-0.35, 0, 0]}>
        <planeGeometry args={[3.3, 2.05]} />
        <meshBasicMaterial color="#e6d2a8" transparent opacity={0.16} side={THREE.DoubleSide} />
      </mesh>
      {[-0.7, 0, 0.7].map((y) => (
        <mesh key={`row-${y}`} position={[-0.35, y, 0.01]}>
          <boxGeometry args={[3.1, 0.008, 0.008]} />
          <meshBasicMaterial color="#e6d2a8" transparent opacity={0.55} />
        </mesh>
      ))}
      {[-1.1, -0.35, 0.4].map((x) => (
        <mesh key={`col-${x}`} position={[x, 0, 0.01]}>
          <boxGeometry args={[0.008, 1.9, 0.008]} />
          <meshBasicMaterial color="#e6d2a8" transparent opacity={0.45} />
        </mesh>
      ))}
      {[
        [-0.35, 1.02, 0.04, 3.35, 0.02, 0.02],
        [-0.35, -1.02, 0.04, 3.35, 0.02, 0.02],
        [-2.02, 0, 0.04, 0.02, 2.04, 0.02],
        [1.32, 0, 0.04, 0.02, 2.04, 0.02],
      ].map((bar) => (
        <mesh key={bar.join("-")} position={[bar[0], bar[1], bar[2]]}>
          <boxGeometry args={[bar[3], bar[4], bar[5]]} />
          <meshBasicMaterial color="#e6d2a8" />
        </mesh>
      ))}
    </group>
  );
}

export function ClientDashboard() {
  return (
    <Canvas
      className="absolute inset-0"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      camera={{ position: [0.2, 0.15, 4.4], fov: 34, near: 0.1, far: 80 }}
      dpr={[1, 1.35]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <SkyDome blendRef={calm} dayRef={night} />
      <fog attach="fog" args={["#07080f", 8, 22]} />
      <hemisphereLight args={["#1a2438", "#c6a36a", 0.45]} />
      <ambientLight intensity={0.25} color="#1a140e" />
      <directionalLight position={[-3, 4, 2]} intensity={1.6} color="#ffd7a1" />
      <pointLight position={[1.4, 0.4, 2]} intensity={4} color="#e6d2a8" distance={8} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.15, 0]}>
        <circleGeometry args={[6, 48]} />
        <meshStandardMaterial color="#12100e" roughness={1} />
      </mesh>
      <Glass />
      <Stars radius={40} depth={12} count={280} factor={2} fade saturation={0} speed={0.1} />
    </Canvas>
  );
}
