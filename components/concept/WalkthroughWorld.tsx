"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Component, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import type { GLTF, GLTFLoader } from "three-stdlib";
import { lineFragment, lineVertex, placeholderBlueprint } from "@/components/concept/lines";
import { attachVillaLoaders } from "@/components/concept/loaders";
import { DRACO_DECODER_PATH, phaseFromName, type VillaSources } from "@/lib/villa-assets";
import { phaseWeight, sampleVilla, type VillaPhase } from "@/lib/villa-flight";

const GOLD = new THREE.Color("#e6d2a8");

function tagPhases(root: THREE.Object3D) {
  const found = new Set<VillaPhase>();
  root.traverse((obj) => {
    const own = phaseFromName(obj.name);
    const inherited = obj.parent?.userData.villaPhase as VillaPhase | undefined;
    const phase = own ?? inherited ?? null;
    if (phase) {
      obj.userData.villaPhase = phase;
      found.add(phase);
    }
  });
  return found;
}

function fitPavilion(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const span = Math.max(size.x, size.z, 0.001);
  const scale = 14 / span;
  root.scale.multiplyScalar(scale);
  root.updateMatrixWorld(true);
  const fitted = new THREE.Box3().setFromObject(root);
  const center = fitted.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= fitted.min.y;
}

function fadeMesh(mesh: THREE.Mesh, weight: number, clip: THREE.Plane | null) {
  mesh.visible = weight > 0.03;
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  for (const material of materials) {
    const surface = material as THREE.Material & { opacity?: number; transparent?: boolean; depthWrite?: boolean; clippingPlanes?: THREE.Plane[] };
    if (surface.opacity == null) continue;
    surface.transparent = weight < 0.98;
    surface.opacity = weight;
    surface.depthWrite = weight > 0.82;
    surface.clippingPlanes = clip ? [clip] : [];
  }
}

class ModelBoundary extends Component<{ children: ReactNode; onError?: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function useVillaGltf(url: string) {
  const gl = useThree((state) => state.gl);
  const ktx = useRef<ReturnType<typeof attachVillaLoaders> | null>(null);
  const extend = useCallback((loader: GLTFLoader) => {
    ktx.current?.dispose();
    ktx.current = attachVillaLoaders(loader, gl);
  }, [gl]);
  const gltf = useGLTF(url, DRACO_DECODER_PATH, true, extend) as GLTF;
  useEffect(() => () => {
    ktx.current?.dispose();
  }, []);
  return gltf;
}

function PhaseModel({
  url,
  phase,
  progressRef,
  yieldInterior,
  clip,
  onReady,
}: {
  url: string;
  phase: VillaPhase;
  progressRef: { current: number };
  yieldInterior: boolean;
  clip: THREE.Plane;
  onReady: (phase: VillaPhase) => void;
}) {
  const gltf = useVillaGltf(url);
  const ready = useRef(false);
  useLayoutEffect(() => {
    fitPavilion(gltf.scene);
    tagPhases(gltf.scene);
    if (!ready.current) {
      ready.current = true;
      onReady(phase);
    }
  }, [gltf.scene, onReady, phase]);

  useFrame(() => {
    const progress = progressRef.current;
    const interior = phaseWeight(progress, "interior");
    let weight = phaseWeight(progress, phase);
    if (yieldInterior && phase !== "interior") weight *= 1 - interior;
    const clipping = phase !== "interior" && phase !== "blueprint" && !yieldInterior ? clip : null;
    if (clipping) {
      const cut = THREE.MathUtils.lerp(6.2, 0.4, interior);
      clip.set(new THREE.Vector3(0, 0, -1), cut);
    }
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      fadeMesh(mesh, weight, clipping && interior > 0.04 ? clip : null);
    });
    const apply = gltf.scene.userData.applyPhaseMaterials as ((next: VillaPhase) => void) | undefined;
    apply?.(phase);
  });

  return <primitive object={gltf.scene} />;
}

function CombinedModel({
  url,
  progressRef,
  clip,
  onReady,
}: {
  url: string;
  progressRef: { current: number };
  clip: THREE.Plane;
  onReady: (phases: VillaPhase[]) => void;
}) {
  const gltf = useVillaGltf(url);
  const reported = useRef(false);
  const phases = useRef<Set<VillaPhase>>(new Set());

  useLayoutEffect(() => {
    fitPavilion(gltf.scene);
    phases.current = tagPhases(gltf.scene);
    if (!reported.current) {
      reported.current = true;
      onReady(phases.current.size > 0 ? [...phases.current] : ["finished"]);
    }
  }, [gltf.scene, onReady]);

  useFrame(() => {
    const progress = progressRef.current;
    const interior = phaseWeight(progress, "interior");
    const hasInterior = phases.current.has("interior");
    const apply = gltf.scene.userData.applyPhaseMaterials as ((next: VillaPhase) => void) | undefined;
    const named = phases.current.size > 0;
    if (!named) apply?.(interior > 0.55 ? "interior" : phaseWeight(progress, "structure") > phaseWeight(progress, "finished") ? "structure" : "finished");
    if (interior > 0.04 && !hasInterior) {
      clip.set(new THREE.Vector3(0, 0, -1), THREE.MathUtils.lerp(6.2, 0.4, interior));
    }
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const tagged = (mesh.userData.villaPhase as VillaPhase | undefined) ?? (named ? null : "finished");
      if (!tagged) {
        mesh.visible = false;
        return;
      }
      let weight = phaseWeight(progress, tagged);
      if (hasInterior && tagged !== "interior" && tagged !== "blueprint") weight *= 1 - interior * 0.85;
      const clipping = !hasInterior && tagged !== "blueprint" && tagged !== "interior" && interior > 0.04 ? clip : null;
      fadeMesh(mesh, weight, clipping);
    });
  });

  return <primitive object={gltf.scene} />;
}

function PlaceholderVilla({
  progressRef,
  skip,
}: {
  progressRef: { current: number };
  skip: VillaPhase[];
}) {
  const lines = useMemo(() => placeholderBlueprint(), []);
  const lineMat = useMemo(() => new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uDraw: { value: 0 } },
    vertexShader: lineVertex,
    fragmentShader: lineFragment,
  }), []);
  const plaster = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f4efe6", roughness: 0.78 }), []);
  const stone = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c8bba6", roughness: 0.7 }), []);
  const roof = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3d4a45", roughness: 0.62 }), []);
  const timber = useMemo(() => new THREE.MeshStandardMaterial({ color: "#b08968", roughness: 0.55 }), []);
  const table = useMemo(() => new THREE.MeshStandardMaterial({ color: "#b08968", roughness: 0.55 }), []);
  const panel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c8bba6", roughness: 0.7 }), []);
  const glass = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#d5ebe6",
    roughness: 0.05,
    metalness: 0.04,
    transparent: true,
    opacity: 0.22,
  }), []);
  const frame = useMemo(() => new THREE.MeshStandardMaterial({ color: "#b7b1a6", roughness: 0.86, transparent: true }), []);
  const cloth = useMemo(() => new THREE.MeshStandardMaterial({ color: "#efe6d8", roughness: 0.9 }), []);
  const structure = useRef<THREE.Group>(null);
  const finished = useRef<THREE.Group>(null);
  const interior = useRef<THREE.Group>(null);

  useEffect(() => () => {
    lines.dispose();
    lineMat.dispose();
    plaster.dispose();
    stone.dispose();
    roof.dispose();
    timber.dispose();
    table.dispose();
    panel.dispose();
    glass.dispose();
    frame.dispose();
    cloth.dispose();
  }, [cloth, frame, glass, lineMat, lines, panel, plaster, roof, stone, table, timber]);

  useFrame(() => {
    const progress = progressRef.current;
    const blueprint = skip.includes("blueprint") ? 0 : phaseWeight(progress, "blueprint");
    const structureWeight = skip.includes("structure") ? 0 : phaseWeight(progress, "structure");
    const finishedWeight = skip.includes("finished") ? 0 : phaseWeight(progress, "finished");
    const interiorWeight = skip.includes("interior") ? 0 : phaseWeight(progress, "interior");
    lineMat.uniforms.uDraw.value = blueprint > 0.02 ? sampleVilla(progress).draw : 0;
    if (structure.current) {
      structure.current.visible = structureWeight > 0.03;
      structure.current.position.y = (structureWeight - 1) * 3.2;
      frame.opacity = structureWeight;
    }
    if (finished.current) {
      finished.current.visible = finishedWeight > 0.03;
      const fade = finishedWeight * (skip.includes("interior") ? 1 : 1 - interiorWeight * 0.15);
      for (const material of [plaster, stone, roof, timber]) {
        material.opacity = fade;
        material.transparent = fade < 0.98;
      }
      glass.opacity = 0.22 * fade;
    }
    if (interior.current) {
      interior.current.visible = interiorWeight > 0.08 && !skip.includes("interior");
      for (const material of [cloth, table, panel]) {
        material.opacity = interiorWeight;
        material.transparent = interiorWeight < 0.98;
      }
    }
  });

  const columns = [-6.2, -2.1, 2.1, 6.2].flatMap((x) => [-3.2, 3.2].map((z) => ({ x, z })));

  return (
    <group>
      {!skip.includes("blueprint") ? <mesh geometry={lines} material={lineMat} /> : null}
      <group ref={structure}>
        <mesh position={[0, 0.08, 0]} material={frame}>
          <boxGeometry args={[14.4, 0.16, 8.4]} />
        </mesh>
        {columns.map((column) => (
          <mesh key={`${column.x}-${column.z}`} position={[column.x, 1.7, column.z]} material={frame}>
            <boxGeometry args={[0.28, 3.4, 0.28]} />
          </mesh>
        ))}
        <mesh position={[0, 3.15, 0]} material={frame}>
          <boxGeometry args={[13.6, 0.18, 7.6]} />
        </mesh>
        <mesh position={[0, 3.42, 0]} material={frame}>
          <boxGeometry args={[14.8, 0.12, 8.8]} />
        </mesh>
      </group>
      <group ref={finished}>
        <mesh position={[0, 0.06, 0]} material={timber}>
          <boxGeometry args={[13.4, 0.08, 7.4]} />
        </mesh>
        <mesh position={[0, 1.7, -3.86]} material={plaster}>
          <boxGeometry args={[13.6, 3.2, 0.16]} />
        </mesh>
        <mesh position={[-6.86, 1.7, 0]} material={plaster}>
          <boxGeometry args={[0.16, 3.2, 7.6]} />
        </mesh>
        <mesh position={[6.86, 1.7, 0]} material={plaster}>
          <boxGeometry args={[0.16, 3.2, 7.6]} />
        </mesh>
        <mesh position={[0, 0.28, 3.7]} material={stone}>
          <boxGeometry args={[12.4, 0.36, 0.2]} />
        </mesh>
        <mesh position={[0, 1.75, 3.92]} material={glass}>
          <planeGeometry args={[12.2, 2.7]} />
        </mesh>
        <mesh position={[0, 3.48, 0]} material={roof}>
          <boxGeometry args={[15.2, 0.14, 9.1]} />
        </mesh>
      </group>
      <group ref={interior}>
        <mesh position={[-1.4, 0.42, -1.1]} material={cloth}>
          <boxGeometry args={[2.4, 0.62, 0.9]} />
        </mesh>
        <mesh position={[1.5, 0.38, -0.2]} material={table}>
          <boxGeometry args={[1.1, 0.42, 0.7]} />
        </mesh>
        <mesh position={[0, 2.15, -3.7]} material={panel}>
          <planeGeometry args={[2.2, 1.3]} />
        </mesh>
        <mesh position={[0, 2.55, -0.4]}>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={2.2} />
        </mesh>
      </group>
    </group>
  );
}

export function WalkthroughWorld({
  progressRef,
  sources,
}: {
  progressRef: { current: number };
  sources: VillaSources;
}) {
  const [covered, setCovered] = useState<VillaPhase[]>([]);
  const addCovered = useCallback((phases: VillaPhase[]) => {
    setCovered((current) => {
      const next = new Set(current);
      for (const phase of phases) next.add(phase);
      return next.size === current.length ? current : [...next];
    });
  }, []);
  const onCombined = useCallback((phases: VillaPhase[]) => addCovered(phases), [addCovered]);
  const onPhase = useCallback((phase: VillaPhase) => addCovered([phase]), [addCovered]);
  const clip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 8), []);
  const sun = useRef<THREE.DirectionalLight>(null);
  const room = useRef<THREE.PointLight>(null);
  const look = useMemo(() => new THREE.Vector3(), []);
  const desired = useMemo(() => new THREE.Vector3(), []);
  const desiredLook = useMemo(() => new THREE.Vector3(), []);
  const { camera, gl } = useThree();
  const fps = useRef(60);
  const yieldInterior = Boolean(sources.interior);

  useFrame((_, delta) => {
    const flight = sampleVilla(progressRef.current);
    const interior = phaseWeight(progressRef.current, "interior");
    desired.set(flight.pos[0], flight.pos[1], flight.pos[2]);
    desiredLook.set(flight.look[0], flight.look[1], flight.look[2]);
    const damp = 1 - Math.exp(-4 * delta);
    camera.position.lerp(desired, damp);
    look.lerp(desiredLook, damp);
    camera.lookAt(look);
    if (sun.current) sun.current.intensity = 2.1 * (1 - interior * 0.55);
    if (room.current) room.current.intensity = interior * 8;
    const instant = 1 / Math.max(delta, 1e-4);
    fps.current = fps.current * 0.92 + instant * 0.08;
    if (fps.current < 26 && gl.getPixelRatio() > 1) gl.setPixelRatio(1);
  });

  return (
    <>
      <color attach="background" args={["#10161b"]} />
      <fog attach="fog" args={["#10161b", 28, 70]} />
      <hemisphereLight args={["#d5e4ef", "#3c4638", 0.55]} />
      <directionalLight ref={sun} position={[8, 14, 10]} intensity={2.1} color="#fff3df" />
      <pointLight ref={room} position={[0, 2.5, -0.4]} color="#ffd7a8" intensity={0} distance={12} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[28, 48]} />
        <meshStandardMaterial color="#1a2420" roughness={1} />
      </mesh>
      <PlaceholderVilla progressRef={progressRef} skip={covered} />
      <Suspense fallback={null}>
        {sources.combined ? (
          <ModelBoundary>
            <CombinedModel url={sources.combined} progressRef={progressRef} clip={clip} onReady={onCombined} />
          </ModelBoundary>
        ) : null}
        {sources.blueprint ? (
          <ModelBoundary>
            <PhaseModel url={sources.blueprint} phase="blueprint" progressRef={progressRef} yieldInterior={yieldInterior} clip={clip} onReady={onPhase} />
          </ModelBoundary>
        ) : null}
        {sources.structure ? (
          <ModelBoundary>
            <PhaseModel url={sources.structure} phase="structure" progressRef={progressRef} yieldInterior={yieldInterior} clip={clip} onReady={onPhase} />
          </ModelBoundary>
        ) : null}
        {sources.finished ? (
          <ModelBoundary>
            <PhaseModel url={sources.finished} phase="finished" progressRef={progressRef} yieldInterior={yieldInterior} clip={clip} onReady={onPhase} />
          </ModelBoundary>
        ) : null}
        {sources.interior ? (
          <ModelBoundary>
            <PhaseModel url={sources.interior} phase="interior" progressRef={progressRef} yieldInterior={false} clip={clip} onReady={onPhase} />
          </ModelBoundary>
        ) : null}
      </Suspense>
    </>
  );
}
