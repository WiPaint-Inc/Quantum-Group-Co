"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Group } from "three";
import { MathUtils } from "three";
import type { Estate } from "@/content/site";
import { Villa } from "@/components/experience/Villa";

export function Island({
  estate,
  focused,
  onSelect,
  onHover,
}: {
  estate: Estate;
  focused: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const group = useRef<Group>(null);
  const [hot, setHot] = useState(false);
  const [width, depth] = estate.plinth;

  useEffect(() => () => {
    document.body.style.cursor = "";
  }, []);

  useFrame((_, dt) => {
    if (!group.current) return;
    const target = hot || focused ? 1.035 : 1;
    const next = MathUtils.damp(group.current.scale.x, target, 4, dt);
    group.current.scale.setScalar(next);
  });

  return (
    <group ref={group} position={estate.position} rotation={[0, estate.rotation, 0]}>
      <mesh position={[0, -0.28, 0]}>
        <boxGeometry args={[width + 0.08, 0.5, depth + 0.08]} />
        <meshStandardMaterial color="#6a5644" roughness={1} />
      </mesh>
      <mesh
        position={[0, 0.16, 0]}
        castShadow
        receiveShadow
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
          setHot(true);
          onHover(estate.slug);
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
          setHot(false);
          onHover(null);
        }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(estate.slug);
        }}
      >
        <boxGeometry args={[width, 0.46, depth]} />
        <meshStandardMaterial color={focused ? "#f4efe6" : "#e4d3b6"} roughness={0.9} />
      </mesh>
      <Villa massing={estate.massing} />
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color={focused || hot ? "#f4efe6" : "#c6a36a"} />
      </mesh>
      {focused ? <pointLight position={[0, 1.6, 0.4]} intensity={2.2} distance={5} color="#f0d7a8" /> : null}
    </group>
  );
}
