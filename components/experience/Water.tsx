"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { waterFragment, waterVertex } from "@/components/experience/shaders";

export function Water({
  reducedMotion,
  onClear,
}: {
  reducedMotion: boolean;
  onClear: () => void;
}) {
  const { camera } = useThree();
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uCamera: { value: new THREE.Vector3() },
        },
        vertexShader: waterVertex,
        fragmentShader: waterFragment,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame((state) => {
    if (!reducedMotion) material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uCamera.value.copy(camera.position);
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      material={material}
      onClick={(event) => {
        event.stopPropagation();
        onClear();
      }}
    >
      <planeGeometry args={[96, 96, 72, 72]} />
    </mesh>
  );
}
