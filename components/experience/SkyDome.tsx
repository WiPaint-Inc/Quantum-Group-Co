"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { skyFragment, skyVertex } from "@/components/experience/shaders";

export function SkyDome({
  realm = "ocean",
  blendRef,
}: {
  realm?: "ocean" | "space";
  blendRef?: { current: number };
}) {
  const blend = useRef(realm === "space" ? 1 : 0);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { uBlend: { value: blend.current } },
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, dt) => {
    const target = blendRef ? blendRef.current : realm === "space" ? 1 : 0;
    blend.current += (target - blend.current) * (1 - Math.exp(-1.4 * dt));
    material.uniforms.uBlend.value = blend.current;
  });

  return (
    <mesh material={material} frustumCulled={false}>
      <sphereGeometry args={[80, 48, 32]} />
    </mesh>
  );
}
