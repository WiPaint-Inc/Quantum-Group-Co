"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Component, Suspense, useLayoutEffect, useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { chooseEstateLod, type EstateAvailability } from "@/lib/estate-drop";
import { batchStatic, capTextures, disposeObjectTree, hideCadDupes, splitEstateVegetation } from "@/lib/estate-scene";

let ktx2: KTX2Loader | null = null;

function attachKtx2(loader: { setKTX2Loader?: (transcoder: unknown) => unknown }, gl: THREE.WebGLRenderer) {
  if (!ktx2) ktx2 = new KTX2Loader().setTranscoderPath("/decoders/basis/");
  ktx2.detectSupport(gl);
  loader.setKTX2Loader?.(ktx2);
}

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
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 4.4);
    float alpha = (0.012 + fresnel * 0.58) * uReveal;
    vec3 col = mix(vec3(0.55, 0.72, 0.84), vec3(1.0), fresnel);
    if (alpha < 0.01) discard;
    fragColor = vec4(col, alpha);
  }
`;

function cloneScene(source: THREE.Object3D, glass: boolean) {
  const scene = source.clone(true);
  hideCadDupes(scene);
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (Array.isArray(mesh.material)) mesh.material = mesh.material.map((material) => material.clone());
    else if (mesh.material) mesh.material = mesh.material.clone();
  });
  capTextures(scene);
  if (!glass) batchStatic(scene);
  const parts = glass ? null : splitEstateVegetation(scene);
  return { scene, buildings: parts?.buildings ?? scene };
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
  const { camera, gl } = useThree();
  const gltf = useGLTF(url, "/decoders/draco/gltf/", true, (loader) => {
    attachKtx2(loader as unknown as { setKTX2Loader?: (transcoder: unknown) => unknown }, gl);
  });
  const model = useMemo(() => cloneScene(gltf.scene, glass), [glass, gltf.scene]);
  const { scene, buildings } = model;
  const glassMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        side: THREE.FrontSide,
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

  useLayoutEffect(() => () => {
    disposeObjectTree(scene);
    useGLTF.clear(url);
  }, [scene, url]);

  useFrame(() => {
    glassMat.uniforms.uReveal.value = revealRef.current;
    (glassMat.uniforms.uCamera.value as THREE.Vector3).copy(camera.position);
    if (glass) return;
    buildings.scale.y = 0.04 + 0.96 * revealRef.current;
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
