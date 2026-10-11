"use client";

import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { SkyDome } from "@/components/experience/SkyDome";
import { Water } from "@/components/experience/Water";
import { services } from "@/content/site";

const PARTS: Array<{ position: [number, number, number]; size: [number, number, number]; kind: "mass" | "roof" | "glass" | "pool" | "column" }> = [
  { position: [0, 0.42, 0], size: [2.6, 0.52, 1.15], kind: "mass" },
  { position: [1.45, 0.5, 0.72], size: [0.95, 0.62, 0.9], kind: "mass" },
  { position: [-0.15, 0.78, 0], size: [2.95, 0.05, 1.45], kind: "roof" },
  { position: [1.45, 0.86, 0.72], size: [1.15, 0.045, 1.1], kind: "roof" },
  { position: [-1.05, 0.36, 0.62], size: [0.07, 0.62, 0.07], kind: "column" },
  { position: [-0.45, 0.36, 0.62], size: [0.07, 0.62, 0.07], kind: "column" },
  { position: [0.15, 0.36, 0.62], size: [0.07, 0.62, 0.07], kind: "column" },
  { position: [0.15, 0.48, 0.58], size: [1.15, 0.28, 0.02], kind: "glass" },
  { position: [-1.7, 0.08, 0.15], size: [1.15, 0.03, 0.62], kind: "pool" },
];

function clamp01(value: number) {
  return THREE.MathUtils.clamp(value, 0, 1);
}

function weights(progress: number) {
  const design = 1 - clamp01((progress - 0.08) / 0.24);
  const engineer = clamp01((progress - 0.12) / 0.16) * (1 - clamp01((progress - 0.4) / 0.18));
  const build = clamp01((progress - 0.38) / 0.16) * (1 - clamp01((progress - 0.7) / 0.16));
  const finish = clamp01((progress - 0.66) / 0.2);
  return { design, engineer, build, finish, solid: Math.max(build, finish), wire: Math.max(design, engineer * 0.9) };
}

function Villa({ progressRef }: { progressRef: { current: number } }) {
  const group = useRef<THREE.Group>(null);
  const concrete = useMemo(() => new THREE.Color("#6a5c4e"), []);
  const plaster = useMemo(() => new THREE.Color("#e4d5c0"), []);
  const scratch = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const { wire, solid, finish, engineer } = weights(progressRef.current);
    group.current?.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      const role = mesh.userData.role as string | undefined;
      const material = mesh.material as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;
      if (role === "wire") material.opacity = wire * (mesh.userData.engineer ? 0.35 + engineer : 1);
      if (role === "solid") {
        material.opacity = solid * (mesh.userData.kind === "glass" || mesh.userData.kind === "pool" ? finish : 1);
        if ("color" in material && mesh.userData.kind === "mass") {
          material.color.copy(scratch.copy(concrete).lerp(plaster, finish));
        }
      }
      mesh.visible = material.opacity > 0.02;
    });
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      {PARTS.map((part) => (
        <group key={part.position.join("-")} position={part.position}>
          <mesh userData={{ role: "wire", kind: part.kind, engineer: part.kind === "column" }}>
            <boxGeometry args={part.size} />
            <meshBasicMaterial color={part.kind === "column" || part.kind === "roof" ? "#b88858" : "#e4d5c0"} wireframe transparent opacity={1} />
          </mesh>
          <mesh userData={{ role: "solid", kind: part.kind }} castShadow receiveShadow>
            <boxGeometry args={part.size} />
            <meshStandardMaterial
              color={part.kind === "roof" ? "#7a5430" : part.kind === "column" ? "#8d6844" : part.kind === "pool" ? "#1a5c58" : part.kind === "glass" ? "#d7efe8" : "#d9cbb6"}
              roughness={part.kind === "glass" || part.kind === "pool" ? 0.16 : 0.92}
              metalness={part.kind === "roof" ? 0.12 : 0.02}
              transparent
              opacity={0}
              emissive={part.kind === "glass" ? "#f0d7a4" : "#000000"}
              emissiveIntensity={part.kind === "glass" ? 0.25 : 0}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ServiceNodes({ onOpen }: { onOpen: (slug: string) => void }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    group.current?.children.forEach((child, index) => {
      const base = child.userData.baseY as number;
      child.position.y = base + Math.sin(time * 0.7 + index * 0.85) * 0.1;
    });
  });

  return (
    <group ref={group}>
      {services.map((service, index) => {
        const spread = Math.max(services.length - 1, 1);
        const angle = -0.9 + (index / spread) * 1.8;
        const y = 2.05 + (index % 2) * 0.7;
        const position: [number, number, number] = [Math.sin(angle) * 3.3, y, Math.cos(angle) * 1.4];
        return (
          <mesh
            key={service.slug}
            position={position}
            userData={{ baseY: y }}
            onClick={(event) => {
              event.stopPropagation();
              onOpen(service.slug);
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "";
            }}
          >
            <sphereGeometry args={[0.16, 24, 24]} />
            <meshStandardMaterial color="#f3e6c8" emissive="#e6d2a8" emissiveIntensity={1.4} roughness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function JourneyScene({
  progressRef,
  onService,
}: {
  progressRef: { current: number };
  onService: (slug: string) => void;
}) {
  const stars = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    const progress = progressRef.current;
    const finish = weights(progress).finish;
    if (stars.current) stars.current.visible = progress > 0.62;
    const y = 2.4 + (1 - finish) * 0.8;
    const z = 7.2 - finish * 0.6;
    camera.position.lerp(new THREE.Vector3(0.4, y, z), 0.08);
    camera.lookAt(0, 0.45, 0);
  });

  return (
    <>
      <SkyDome blendRef={progressRef} />
      <hemisphereLight args={["#f3eadc", "#c6a36a", 0.42]} />
      <ambientLight intensity={0.25} color="#1a140e" />
      <directionalLight position={[6, 8, 4]} intensity={2.2} color="#ffd2a8" castShadow />
      <pointLight position={[-2, 2.2, 2]} intensity={4} color="#e6d2a8" distance={10} />
      <Water reducedMotion={false} onClear={() => undefined} />
      <group ref={stars}>
        <Stars radius={50} depth={20} count={1200} factor={2.4} fade saturation={0} speed={0.15} />
      </group>
      <Villa progressRef={progressRef} />
      <ServiceNodes onOpen={onService} />
    </>
  );
}
