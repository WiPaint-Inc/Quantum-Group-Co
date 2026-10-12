"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { buildCliffsideLines, buildCliffsidePlant, buildRockFace, CLIFF_VOLUMES, flowPositions, stepFlow } from "@/components/estates/cliffside-build";
import { EstateAsset, MepAsset } from "@/components/estates/EstateAsset";
import { buildMegaEstatePlaceholder } from "@/components/estates/mega-estate-build";
import { lineFragment, lineVertex } from "@/components/ocean/shaders";
import { CLIFFSIDE_DROP, loadEstateDrop, MEGA_ESTATE_DROP, type EstateAvailability } from "@/lib/estate-drop";
import { estateAnchor, estateFlyT, estateReveal, sampleFlight } from "@/lib/ocean-flight";
import { journeyPath } from "@/src/journey/path";

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

function lineMaterial(color: string, halfPx: number, additive: boolean) {
  return new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    toneMapped: false,
    depthTest: true,
    uniforms: {
      uDraw: { value: 0 },
      uWash: { value: 0 },
      uNight: { value: 1 },
      uFade: { value: 1 },
      uColor: { value: new THREE.Color(color) },
      uResolution: { value: new THREE.Vector2(1280, 720) },
      uHalfPx: { value: halfPx },
    },
    vertexShader: lineVertex,
    fragmentShader: lineFragment,
  });
}

function smooth(t: number) {
  const u = Math.min(1, Math.max(0, t));
  return u * u * (3 - 2 * u);
}

function beat(t: number, start: number, span: number) {
  return smooth((t - start) / span);
}

function MegaFlyIn({ progressRef }: { progressRef: { current: number } }) {
  const anchor = estateAnchor("design-build");
  const built = useMemo(() => buildMegaEstatePlaceholder(), []);
  const lines = useMemo(() => lineMaterial("#f0d9a2", 2.4, true), []);
  const mass = useRef<THREE.Group>(null);
  const revealRef = useRef(0);
  const [found, setFound] = useState<EstateAvailability | null>(null);
  const [distance, setDistance] = useState(400);
  const { camera, size, gl } = useThree();

  useEffect(() => {
    let live = true;
    loadEstateDrop(MEGA_ESTATE_DROP).then((next) => {
      if (live) setFound(next);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => () => {
    built.mass.dispose();
    built.lines.dispose();
    lines.dispose();
  }, [built, lines]);

  useFrame(() => {
    const reveal = estateReveal(progressRef.current, "design-build");
    const t = estateFlyT(progressRef.current, "design-build");
    revealRef.current = reveal;
    if (mass.current && !found?.solid) mass.current.scale.y = 0.035 + 0.965 * reveal;
    lines.uniforms.uDraw.value = smooth(Math.min(1, Math.max(0, t) * 1.45));
    lines.uniforms.uFade.value = found?.wireframe ? 0 : 0.28 + (1 - reveal) * 0.72;
    lines.uniforms.uNight.value = sampleFlight(progressRef.current).night;
    (lines.uniforms.uResolution.value as THREE.Vector2).set(size.width * gl.getPixelRatio(), size.height * gl.getPixelRatio());
    if (!anchor) return;
    const next = camera.position.distanceTo(new THREE.Vector3(anchor.x, anchor.y, anchor.z));
    setDistance((current) => (Math.abs(current - next) > 40 ? next : current));
  });

  if (!anchor) return null;
  const placeholder = (
    <group ref={mass}>
      <mesh geometry={built.mass} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.78} metalness={0.04} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
  return (
    <group position={[anchor.x, anchor.y, anchor.z]} rotation={[0, anchor.bearing, 0]}>
      <mesh geometry={built.lines} material={lines} renderOrder={4} visible={!found?.wireframe} />
      <EstateAsset found={found} distance={distance} revealRef={revealRef} fallback={placeholder} />
    </group>
  );
}

function Flow({
  strokes,
  count,
  color,
  size,
  speed,
  drawRef,
}: {
  strokes: Array<{ points: THREE.Vector3[]; width: number; t0: number; t1: number }>;
  count: number;
  color: string;
  size: number;
  speed: number;
  drawRef: { current: number };
}) {
  const flow = useMemo(() => flowPositions(strokes, count), [count, strokes]);
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(flow.position, 3));
    return geo;
  }, [flow.position]);
  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color,
        size,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        toneMapped: false,
      }),
    [color, size],
  );
  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);
  useFrame(({ clock }) => {
    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    stepFlow(flow.strokes, flow.seeds, attr, clock.elapsedTime, speed, drawRef.current);
  });
  return <points geometry={geometry} material={material} />;
}

export function CliffStudy({
  progressRef,
  placed = false,
  forceNight,
}: {
  progressRef: { current: number };
  placed?: boolean;
  forceNight?: number;
}) {
  const anchor = estateAnchor("engineering");
  const lines = useMemo(() => buildCliffsideLines(), []);
  const plant = useMemo(() => buildCliffsidePlant(), []);
  const rock = useMemo(() => buildRockFace(journeyPath.cliffLedge.width + 8, journeyPath.cliffLedge.face + 4), []);
  const structure = useMemo(() => lineMaterial("#f3d7a0", 3.4, true), []);
  const plumbing = useMemo(() => lineMaterial("#3eb6ff", 4.6, true), []);
  const hvac = useMemo(() => lineMaterial("#f7fbff", 4.2, true), []);
  const electrical = useMemo(() => lineMaterial("#ffd56a", 3.6, true), []);
  const glass = useMemo(
    () =>
      new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        side: THREE.FrontSide,
        uniforms: {
          uCamera: { value: new THREE.Vector3() },
          uReveal: { value: 0 },
        },
        vertexShader: glassVertex,
        fragmentShader: glassFragment,
      }),
    [],
  );
  const shellGroup = useRef<THREE.Group>(null);
  const revealRef = useRef(0);
  const draws = useRef({ shell: 0, structure: 0, plumbing: 0, hvac: 0, electrical: 0, plant: 0 });
  const [found, setFound] = useState<EstateAvailability | null>(null);
  const [distance, setDistance] = useState(400);
  const light = useRef<THREE.PointLight>(null);
  const { camera, size, gl } = useThree();

  useEffect(() => {
    let live = true;
    loadEstateDrop(CLIFFSIDE_DROP).then((next) => {
      if (live) setFound(next);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => () => {
    lines.structure.dispose();
    lines.plumbing.dispose();
    lines.hvac.dispose();
    lines.electrical.dispose();
    rock.dispose();
    glass.dispose();
    for (const material of [structure, plumbing, hvac, electrical]) material.dispose();
    plant.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry.dispose();
    });
  }, [electrical, glass, hvac, lines, plant, plumbing, rock, structure]);

  useFrame(() => {
    const t = estateFlyT(progressRef.current, "engineering");
    const night = forceNight ?? sampleFlight(progressRef.current).night;
    const shell = beat(t, 0.02, 0.26);
    const structureDraw = beat(t, 0.0, 0.34);
    const plumb = beat(t, 0.2, 0.24);
    const air = beat(t, 0.4, 0.22);
    const power = beat(t, 0.58, 0.2);
    const gear = beat(t, 0.76, 0.22);
    revealRef.current = shell;
    draws.current = { shell, structure: structureDraw, plumbing: plumb, hvac: air, electrical: power, plant: gear };
    if (shellGroup.current) shellGroup.current.scale.y = 0.04 + 0.96 * shell;
    const roofs = plant.getObjectByName("roofs");
    if (roofs) {
      roofs.visible = !found?.solid;
      roofs.scale.y = 0.04 + 0.96 * shell;
    }
    glass.uniforms.uReveal.value = shell;
    (glass.uniforms.uCamera.value as THREE.Vector3).copy(camera.position);
    const resolution = structure.uniforms.uResolution.value as THREE.Vector2;
    resolution.set(size.width * gl.getPixelRatio(), size.height * gl.getPixelRatio());
    for (const material of [plumbing, hvac, electrical]) {
      (material.uniforms.uResolution.value as THREE.Vector2).copy(resolution);
      material.uniforms.uNight.value = Math.max(night, 0.85);
    }
    structure.uniforms.uDraw.value = found?.wireframe ? 0 : structureDraw;
    structure.uniforms.uNight.value = 1;
    (structure.uniforms.uResolution.value as THREE.Vector2).copy(resolution);
    plumbing.uniforms.uDraw.value = found?.mep ? 0 : plumb;
    plumbing.uniforms.uFade.value = 0.92;
    hvac.uniforms.uDraw.value = found?.mep ? 0 : air;
    hvac.uniforms.uFade.value = 0.88;
    electrical.uniforms.uDraw.value = found?.mep ? 0 : power;
    const gearNode = plant.getObjectByName("plant");
    if (gearNode) {
      gearNode.visible = !found?.mep;
      if (!found?.mep) gearNode.scale.y = 0.04 + 0.96 * gear;
    }
    if (light.current) light.current.intensity = 1.4 + night * 4.5;
    if (!anchor) return;
    const next = camera.position.distanceTo(new THREE.Vector3(anchor.x, anchor.y, anchor.z));
    setDistance((current) => (Math.abs(current - next) > 40 ? next : current));
  });

  if (placed && !anchor) return null;
  const showShell = !found?.solid;
  const body = (
    <group>
      <mesh geometry={rock} position={[0, 0, -journeyPath.cliffLedge.length / 2 - 0.6]} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.94} metalness={0.02} emissive="#3a342c" emissiveIntensity={0.22} />
      </mesh>
      <pointLight ref={light} position={[1, 8, 5]} color="#d7e6ff" intensity={12} distance={46} decay={2} />
      {showShell ? (
        <group ref={shellGroup}>
          {CLIFF_VOLUMES.map((volume) => (
            <mesh key={volume.position.join("-")} position={volume.position} material={glass} renderOrder={3}>
              <boxGeometry args={volume.size} />
            </mesh>
          ))}
        </group>
      ) : null}
      <mesh geometry={lines.structure} material={structure} renderOrder={5} />
      <mesh geometry={lines.plumbing} material={plumbing} renderOrder={5} />
      <mesh geometry={lines.hvac} material={hvac} renderOrder={5} />
      <mesh geometry={lines.electrical} material={electrical} renderOrder={5} />
      {found?.mep ? null : (
        <>
          <Flow strokes={lines.flows.plumbing} count={28} color="#8fd4ff" size={1.15} speed={0.28} drawRef={{ get current() { return draws.current.plumbing; } }} />
          <Flow strokes={lines.flows.hvac} count={36} color="#f7fbff" size={0.72} speed={0.42} drawRef={{ get current() { return draws.current.hvac; } }} />
          <Flow strokes={lines.flows.electrical} count={22} color="#ffe09a" size={0.55} speed={0.85} drawRef={{ get current() { return draws.current.electrical; } }} />
        </>
      )}
      <primitive object={plant} />
      <EstateAsset found={found} distance={distance} glass revealRef={revealRef} fallback={null} />
      <MepAsset url={found?.mep ?? null} fallback={null} />
    </group>
  );
  if (!placed || !anchor) return body;
  return (
    <group position={[anchor.x, anchor.y, anchor.z]} rotation={[0, anchor.bearing, 0]}>
      {body}
    </group>
  );
}

export function EstateFlyIns({
  progressRef,
  draft,
}: {
  progressRef: { current: number };
  draft: boolean;
}) {
  if (!draft) return null;
  return (
    <>
      <MegaFlyIn progressRef={progressRef} />
      <CliffStudy progressRef={progressRef} placed />
    </>
  );
}
