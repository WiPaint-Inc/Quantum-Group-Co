"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Component, Suspense, useLayoutEffect, useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { chooseEstateLod, type EstateAvailability } from "@/lib/estate-drop";

const glassVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const glassFragment = /* glsl */ `
  uniform vec3 uCamera;
  uniform float uReveal;
  varying vec3 vNormal;
  varying vec3 vWorld;
  out vec4 fragColor;
  void main() {
    vec3 viewDir = normalize(uCamera - vWorld);
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 2.35);
    float alpha = (0.04 + fresnel * 0.7) * uReveal;
    vec3 col = mix(vec3(0.45, 0.62, 0.74), vec3(0.94, 0.97, 1.0), fresnel);
    if (alpha < 0.02) discard;
    fragColor = vec4(col, alpha);
  }
`;

function cloneScene(source: THREE.Object3D) {
  const scene = source.clone(true);
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (Array.isArray(mesh.material)) mesh.material = mesh.material.map((material) => material.clone());
    else mesh.material = mesh.material.clone();
  });
  return scene;
}

function GlbModel({
  url,
  glass,
  revealRef,
}: {
  url: string;
  glass: boolean;
  revealRef: { current: number };
}) {
  const gltf = useGLTF(url);
  const { camera } = useThree();
  const scene = useMemo(() => cloneScene(gltf.scene), [gltf.scene]);
  const glassMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uCamera: { value: new THREE.Vector3() },
          uReveal: { value: 1 },
        },
        vertexShader: glassVertex,
        fragmentShader: glassFragment,
      }),
    [],
  );

  useLayoutEffect(() => {
    if (!glass) return;
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const name = mesh.name.toLowerCase();
      const material = mesh.material as THREE.MeshStandardMaterial;
      const color = material?.color;
      const green = Boolean(color && color.g > color.r * 1.15 && color.g > 0.12);
      if (green || name.includes("roof") || name.includes("green")) return;
      mesh.material = glassMat;
      mesh.castShadow = false;
    });
    return () => {
      glassMat.dispose();
    };
  }, [glass, glassMat, scene]);

  useFrame(() => {
    glassMat.uniforms.uReveal.value = revealRef.current;
    (glassMat.uniforms.uCamera.value as THREE.Vector3).copy(camera.position);
    if (glass) return;
    scene.scale.y = 0.04 + 0.96 * revealRef.current;
  });

  return <primitive object={scene} />;
}

class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

export function EstateAsset({
  found,
  distance,
  glass,
  revealRef,
  fallback,
}: {
  found: EstateAvailability | null;
  distance: number;
  glass?: boolean;
  revealRef: { current: number };
  fallback: ReactNode;
}) {
  const url = found ? chooseEstateLod(found, distance) : null;
  if (!url) return fallback;
  return (
    <ModelBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <GlbModel url={url} glass={Boolean(glass)} revealRef={revealRef} />
      </Suspense>
    </ModelBoundary>
  );
}

export function MepAsset({
  url,
  fallback,
}: {
  url: string | null;
  fallback: ReactNode;
}) {
  if (!url) return fallback;
  return (
    <ModelBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <GlbModel url={url} glass={false} revealRef={{ current: 1 }} />
      </Suspense>
    </ModelBoundary>
  );
}
