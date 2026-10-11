"use client";

import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { SkyDome } from "@/components/experience/SkyDome";
import { Water } from "@/components/experience/Water";
import { portfolioProjects } from "@/content/portfolio";

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
  const concrete = useMemo(() => new THREE.Color("#3c3a36"), []);
  const plaster = useMemo(() => new THREE.Color("#e6dcc8"), []);
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
            <meshBasicMaterial color={part.kind === "column" ? "#9fd0ea" : "#e6d2a8"} wireframe transparent opacity={1} />
          </mesh>
          <mesh userData={{ role: "solid", kind: part.kind }} castShadow receiveShadow>
            <boxGeometry args={part.size} />
            <meshStandardMaterial
              color={part.kind === "roof" ? "#8a6840" : part.kind === "pool" ? "#1c6f72" : part.kind === "glass" ? "#d7efe8" : "#e6dcc8"}
              roughness={part.kind === "glass" || part.kind === "pool" ? 0.12 : 0.78}
              metalness={part.kind === "roof" ? 0.35 : 0.04}
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

function Satellites({
  progressRef,
  onProject,
}: {
  progressRef: { current: number };
  onProject: (slug: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    const finish = weights(progressRef.current).finish;
    if (group.current) {
      group.current.visible = finish > 0.35;
      const scale = 0.4 + finish * 0.6;
      group.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={group}>
      {portfolioProjects.map((project, index) => {
        const angle = -1.15 + index * 0.38;
        const position: [number, number, number] = [Math.sin(angle) * 5.4, 0.15, Math.cos(angle) * 3.1 - 2.4];
        return (
          <mesh
            key={project.slug}
            position={position}
            onClick={(event) => {
              event.stopPropagation();
              onProject(project.slug);
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "";
            }}
          >
            <boxGeometry args={[0.7, 0.22, 0.4]} />
            <meshStandardMaterial color="#e6dcc8" roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function JourneyScene({
  progressRef,
  onProject,
}: {
  progressRef: { current: number };
  onProject: (slug: string) => void;
}) {
  const sea = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    const progress = progressRef.current;
    const finish = weights(progress).finish;
    if (sea.current) sea.current.visible = finish > 0.2;
    const y = 2.4 + (1 - finish) * 0.8;
    const z = 7.2 - finish * 0.6;
    camera.position.lerp(new THREE.Vector3(0.4, y, z), 0.08);
    camera.lookAt(0, 0.45, 0);
  });

  return (
    <>
      <SkyDome blendRef={progressRef} />
      <hemisphereLight args={["#d7fff6", "#c6a36a", 0.35]} />
      <ambientLight intensity={0.25} color="#1a140e" />
      <directionalLight position={[6, 8, 4]} intensity={2.2} color="#ffd2a8" castShadow />
      <pointLight position={[-2, 2.2, 2]} intensity={4} color="#e6d2a8" distance={10} />
      <group ref={sea}>
        <Water reducedMotion={false} onClear={() => undefined} />
        <Stars radius={50} depth={20} count={900} factor={2} fade saturation={0} speed={0.2} />
      </group>
      <Villa progressRef={progressRef} />
      <Satellites progressRef={progressRef} onProject={onProject} />
    </>
  );
}
