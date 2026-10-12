"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { EstateAsset } from "@/components/estates/EstateAsset";
import { buildMegaEstatePlaceholder } from "@/components/estates/mega-estate-build";
import { lineFragment, lineVertex } from "@/components/ocean/shaders";
import { MEGA_ESTATE_DROP, loadEstateDrop, type EstateAvailability } from "@/lib/estate-drop";

export default function MegaEstateScene() {
  const built = useMemo(() => buildMegaEstatePlaceholder(), []);
  const revealRef = useRef(1);
  const [found, setFound] = useState<EstateAvailability | null>(null);
  const { camera } = useThree();
  const lines = useMemo(
    () =>
      new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uDraw: { value: 1 },
          uWash: { value: 0 },
          uNight: { value: 0 },
          uFade: { value: 0.45 },
          uColor: { value: new THREE.Color("#f0d9a2") },
          uResolution: { value: new THREE.Vector2(1280, 720) },
          uHalfPx: { value: 2.2 },
        },
        vertexShader: lineVertex,
        fragmentShader: lineFragment,
      }),
    [],
  );

  useEffect(() => {
    let live = true;
    loadEstateDrop(MEGA_ESTATE_DROP).then((next) => {
      if (live) setFound(next);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const view = camera as THREE.PerspectiveCamera;
    view.fov = 46;
    view.near = 0.2;
    view.far = 4000;
    view.position.set(78, 42, 150);
    view.lookAt(0, 5, 0);
    view.updateProjectionMatrix();
  }, [camera]);

  useEffect(() => () => {
    built.mass.dispose();
    built.lines.dispose();
    lines.dispose();
  }, [built, lines]);

  return (
    <>
      <hemisphereLight args={["#f4efe4", "#2a241c", 0.85]} />
      <directionalLight position={[40, 60, 24]} intensity={1.6} />
      <mesh geometry={built.lines} material={lines} />
      <EstateAsset
        found={found}
        distance={80}
        revealRef={revealRef}
        fallback={(
          <mesh geometry={built.mass} castShadow receiveShadow>
            <meshStandardMaterial vertexColors roughness={0.78} metalness={0.04} side={THREE.DoubleSide} />
          </mesh>
        )}
      />
    </>
  );
}
