"use client";

import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { SkyDome } from "@/components/experience/SkyDome";
import { Water } from "@/components/experience/Water";

const MASSES: Array<[number, number, number, number, number, number]> = [
  [0, 0.55, 0, 2.8, 0.7, 1.25],
  [1.55, 0.42, 0.55, 1.05, 0.55, 0.95],
  [-1.35, 0.28, -0.35, 0.7, 0.36, 0.7],
];

const CAMERA_KEYS: Array<{ at: number; pos: [number, number, number]; look: [number, number, number] }> = [
  { at: 0, pos: [11, 6.2, 16], look: [0, 0.3, 0] },
  { at: 0.12, pos: [6.5, 3.6, 9], look: [0, 0.55, 0] },
  { at: 0.24, pos: [0.15, 8.2, 5.4], look: [0, 0, 0] },
  { at: 0.36, pos: [4.8, 2.4, 6.4], look: [0, 0.65, 0] },
  { at: 0.48, pos: [2.6, 1.55, 4.1], look: [0, 0.72, 0] },
  { at: 0.58, pos: [0.35, 1.28, 3.35], look: [0.12, 0.86, 0.08] },
  { at: 0.66, pos: [3.6, 3.1, 4.8], look: [0, 1.15, 0] },
  { at: 0.74, pos: [0.05, 2.15, 3.5], look: [0, 0.72, 0] },
  { at: 0.8, pos: [3.4, 1.7, 5.4], look: [0, 0.55, 0] },
  { at: 0.86, pos: [0.15, 1.05, 2.45], look: [0.25, 0.62, 0] },
  { at: 0.92, pos: [0.1, 3.6, 4.6], look: [0, 0.08, 0] },
  { at: 0.97, pos: [0.3, 7.2, 13], look: [0, 0.35, 0] },
  { at: 1, pos: [0.15, 12.5, 19], look: [0, 0.15, 0] },
];

const VIGNETTE_BANDS = [
  { name: "engineering", start: 0.635, end: 0.715 },
  { name: "plans", start: 0.715, end: 0.785 },
  { name: "construction", start: 0.785, end: 0.845 },
  { name: "finishing", start: 0.845, end: 0.905 },
  { name: "materials", start: 0.905, end: 0.955 },
  { name: "developments", start: 0.955, end: 1.05 },
];

const BLUEPRINT = [
  [-1.7, 0.045, -0.9, 1.7, 0.045, -0.9],
  [-1.7, 0.045, 0, 1.7, 0.045, 0],
  [-1.7, 0.045, 0.9, 1.7, 0.045, 0.9],
  [-1.25, 0.045, -1.2, -1.25, 0.045, 1.2],
  [0, 0.045, -1.2, 0, 0.045, 1.2],
  [1.25, 0.045, -1.2, 1.25, 0.045, 1.2],
  [-1.7, 0.045, -1.2, 1.7, 0.045, 1.2],
].map((line, index) => {
  const start = new THREE.Vector3(line[0], line[1], line[2]);
  const end = new THREE.Vector3(line[3], line[4], line[5]);
  const position = start.clone().add(end).multiplyScalar(0.5);
  const length = start.distanceTo(end);
  const direction = end.clone().sub(start).normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction);
  return { key: `plan-${index}`, position, quaternion, length };
});

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function fade(progress: number, start: number, end: number) {
  if (end === start) return progress >= end ? 1 : 0;
  return clamp01((progress - start) / (end - start));
}

function windowed(progress: number, start: number, end: number) {
  const enter = fade(progress, start, start + 0.018);
  const exit = 1 - fade(progress, end - 0.018, end);
  return enter * exit;
}

export function World({ progressRef, quality }: { progressRef: { current: number }; quality: "high" | "low" }) {
  const dayRef = useRef(0.12);
  const nightRef = useRef(0);
  const sun = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.PointLight>(null);
  const windows = useRef<THREE.PointLight>(null);
  const estate = useRef<THREE.Group>(null);
  const vignette = useRef<THREE.Group>(null);
  const stars = useRef<THREE.Group>(null);
  const cameraTarget = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(0, 0.4, 0), []);
  const sunColor = useMemo(() => new THREE.Color(), []);
  const fogColor = useMemo(() => new THREE.Color(), []);

  useFrame(({ camera, scene }, delta) => {
    const progress = progressRef.current;
    const day = fade(progress, 0.05, 0.64);
    dayRef.current = day;
    nightRef.current = fade(progress, 0.5, 0.7);
    const vision = fade(progress, 0.06, 0.16);
    const blueprint = windowed(progress, 0.16, 0.38);
    const structure = fade(progress, 0.28, 0.46);
    const finish = fade(progress, 0.4, 0.56);
    const lived = fade(progress, 0.5, 0.64);
    const vignetteMix = fade(progress, 0.62, 0.68);
    const damp = 1 - Math.exp(-2.6 * delta);

    if (sun.current) {
      sun.current.intensity = THREE.MathUtils.damp(sun.current.intensity, 2.6 * (1 - day * 0.78), 2, delta);
      sun.current.color.copy(sunColor.set(day < 0.42 ? "#fff1d2" : day < 0.72 ? "#ff9a55" : "#9eb6ff"));
      sun.current.position.set(8 - day * 10, 10 - day * 7.5, 4 - day * 6);
    }
    if (fill.current) fill.current.intensity = 1.15 * (1 - nightRef.current * 0.85);
    if (windows.current) windows.current.intensity = lived * 7;
    if (stars.current) stars.current.visible = nightRef.current > 0.45;

    let index = 0;
    while (index < CAMERA_KEYS.length - 2 && progress > CAMERA_KEYS[index + 1].at) index += 1;
    const from = CAMERA_KEYS[index];
    const to = CAMERA_KEYS[index + 1];
    const span = Math.max(0.0001, to.at - from.at);
    const local = clamp01((progress - from.at) / span);
    cameraTarget.set(
      THREE.MathUtils.lerp(from.pos[0], to.pos[0], local),
      THREE.MathUtils.lerp(from.pos[1], to.pos[1], local),
      THREE.MathUtils.lerp(from.pos[2], to.pos[2], local),
    );
    lookTarget.set(
      THREE.MathUtils.lerp(from.look[0], to.look[0], local),
      THREE.MathUtils.lerp(from.look[1], to.look[1], local),
      THREE.MathUtils.lerp(from.look[2], to.look[2], local),
    );
    camera.position.lerp(cameraTarget, damp);
    look.lerp(lookTarget, damp);
    camera.lookAt(look);

    if (scene.fog) {
      const fog = scene.fog as THREE.Fog;
      fog.color.copy(fogColor.set(day > 0.72 ? "#07080f" : day > 0.45 ? "#8a5a3a" : "#d9c7ae"));
    }

    estate.current?.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      const role = mesh.userData.role as string | undefined;
      const material = mesh.material as THREE.Material & { opacity: number };
      if (!material || !("opacity" in material)) return;
      if (role === "stake") material.opacity = (1 - vignetteMix) * 0.9;
      if (role === "ghost") material.opacity = vision * (1 - structure) * (1 - vignetteMix);
      if (role === "line") material.opacity = Math.max(blueprint, structure * 0.28) * (1 - vignetteMix);
      if (role === "rise") {
        const delay = (mesh.userData.delay as number) ?? 0;
        const full = (mesh.userData.full as number) ?? 1;
        const risen = fade(structure, delay, delay + 0.55);
        const scale = 0.02 + risen * 0.98;
        mesh.scale.y = scale;
        mesh.position.y = (full * scale) / 2;
        material.opacity = risen * (0.42 + finish * 0.58) * (1 - vignetteMix);
      }
      if (role === "skin") material.opacity = finish * (1 - vignetteMix);
      if (role === "glow") material.opacity = lived * (1 - vignetteMix);
      mesh.visible = material.opacity > 0.02;
    });

    vignette.current?.children.forEach((child) => {
      const band = VIGNETTE_BANDS.find((item) => item.name === child.name);
      const amount = band ? windowed(progress, band.start, band.end) : 0;
      const assemble = band ? fade(progress, band.start, band.start + (band.end - band.start) * 0.72) : 0;
      child.visible = amount > 0.03;
      child.traverse((object) => {
        const light = object as THREE.SpotLight;
        if (light.isSpotLight) {
          light.intensity = amount * (quality === "high" ? 16 : 6);
          light.position.x = -1.7 + assemble * 3.5;
          return;
        }
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        const material = mesh.material as THREE.Material & { opacity: number };
        if (material && "opacity" in material) material.opacity = amount;
        const data = mesh.userData;
        if (typeof data.baseY !== "number") data.baseY = mesh.position.y;
        const baseY = data.baseY as number;
        if (typeof data.lift === "number") mesh.position.y = baseY + data.lift * (1 - assemble);
        if (typeof data.rise === "number" && typeof data.full === "number") {
          const risen = fade(assemble, data.rise as number, Math.min(1, (data.rise as number) + 0.38));
          const scale = 0.04 + risen * 0.96;
          mesh.scale.y = scale;
          mesh.position.y = ((data.full as number) * scale) / 2 + ((data.stack as number) ?? 0);
        }
        if (typeof data.sheet === "number") {
          mesh.rotation.x = -1.05 + assemble * 0.7;
          mesh.position.y = baseY + data.sheet * 0.22 * assemble + (1 - assemble) * 0.02;
        }
        if (data.extrude) {
          const scale = 0.05 + assemble * 0.95;
          mesh.scale.y = scale;
          mesh.position.y = baseY * scale;
        }
        if (typeof data.tile === "number") {
          const placed = fade(assemble, data.tile as number, Math.min(1, (data.tile as number) + 0.2));
          mesh.scale.setScalar(0.02 + placed * 0.98);
          mesh.position.y = 0.03 + (1 - placed) * 0.35;
        }
      });
    });
  });

  return (
    <>
      <SkyDome blendRef={nightRef} dayRef={dayRef} />
      <fog attach="fog" args={["#d9c7ae", 16, 46]} />
      <hemisphereLight args={["#f4efe6", "#c6a36a", 0.62]} />
      <ambientLight intensity={0.18} color="#1a140e" />
      <directionalLight
        ref={sun}
        position={[8, 10, 4]}
        intensity={2.4}
        color="#fff1d2"
        castShadow={quality === "high"}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight ref={fill} position={[-4, 2.6, 3]} intensity={1.15} color="#e6d2a8" distance={16} />
      <pointLight ref={windows} position={[0.2, 1.15, 0.85]} intensity={0} color="#ffd7a1" distance={9} />
      <Water reducedMotion={quality === "low"} onClear={() => undefined} segments={quality === "high" ? 36 : 10} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0.35]} receiveShadow>
        <circleGeometry args={[7.2, quality === "high" ? 64 : 28]} />
        <meshStandardMaterial color="#cbb89a" roughness={1} />
      </mesh>
      <group ref={estate}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0.35]} userData={{ role: "stake" }}>
          <ringGeometry args={[6.15, 6.24, quality === "high" ? 72 : 36]} />
          <meshBasicMaterial color="#e6d2a8" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
        {[
          [-2.4, 0.55],
          [2.4, 0.55],
          [-2.4, -1.5],
          [2.4, -1.5],
        ].map(([x, z]) => (
          <mesh key={`stake-${x}-${z}`} position={[x, 0.18, z]} userData={{ role: "stake" }}>
            <boxGeometry args={[0.025, 0.36, 0.025]} />
            <meshBasicMaterial color="#e6d2a8" transparent opacity={0.9} />
          </mesh>
        ))}
        {MASSES.map((box) => (
          <mesh key={`ghost-${box.join("-")}`} position={[box[0], box[1], box[2]]} userData={{ role: "ghost" }}>
            <boxGeometry args={[box[3], box[4], box[5]]} />
            <meshBasicMaterial color="#f4efe6" transparent opacity={0} wireframe />
          </mesh>
        ))}
        <Blueprint />
        {MASSES.map((box, index) => (
          <mesh key={`rise-${box.join("-")}`} position={[box[0], 0, box[2]]} userData={{ role: "rise", delay: index * 0.16, full: box[4] }} castShadow>
            <boxGeometry args={[box[3], box[4], box[5]]} />
            <meshStandardMaterial color={index === 0 ? "#c4b39a" : "#a89078"} roughness={0.92} transparent opacity={0} />
          </mesh>
        ))}
        <mesh position={[0, 0.92, 0]} userData={{ role: "skin" }} castShadow>
          <boxGeometry args={[2.9, 0.07, 1.5]} />
          <meshStandardMaterial color="#6e4a2c" roughness={0.62} transparent opacity={0} />
        </mesh>
        <mesh position={[0.15, 0.48, 0.66]} userData={{ role: "skin" }}>
          <boxGeometry args={[1.55, 0.46, 0.035]} />
          <meshStandardMaterial color="#d7efe8" roughness={0.08} metalness={0.08} transparent opacity={0} />
        </mesh>
        <mesh position={[-1.75, 0.05, 0.15]} userData={{ role: "glow" }}>
          <boxGeometry args={[1.35, 0.035, 0.78]} />
          <meshStandardMaterial color="#1d6a64" roughness={0.12} emissive="#7fd0c4" emissiveIntensity={0.45} transparent opacity={0} />
        </mesh>
        {[-1.05, -0.35, 0.35, 1.05].map((x) => (
          <mesh key={`col-${x}`} position={[x, 0.4, 0.7]} userData={{ role: "skin" }}>
            <boxGeometry args={[0.07, 0.72, 0.07]} />
            <meshStandardMaterial color="#8d6844" roughness={0.55} transparent opacity={0} />
          </mesh>
        ))}
      </group>
      <group ref={vignette}>
        <Engineering />
        <Plans />
        <ConstructionRise />
        <FinishingSweep />
        <Materials />
        <Developments />
      </group>
      <group ref={stars}>
        <Stars radius={55} depth={16} count={quality === "high" ? 700 : 180} factor={2.2} fade saturation={0} speed={0.15} />
      </group>
    </>
  );
}

function Blueprint() {
  return (
    <group>
      {BLUEPRINT.map((line) => (
        <mesh key={line.key} position={line.position} quaternion={line.quaternion} userData={{ role: "line" }}>
          <boxGeometry args={[line.length, 0.012, 0.012]} />
          <meshBasicMaterial color="#e6d2a8" transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}

function Engineering() {
  const slabs = [0.15, 0.7, 1.25, 1.8];
  return (
    <group name="engineering" visible={false}>
      {slabs.map((y, index) => (
        <mesh key={y} position={[0, y, 0]} userData={{ lift: 0.85 - index * 0.12 }}>
          <boxGeometry args={[2.5 - index * 0.08, 0.07, 1.45]} />
          <meshStandardMaterial color={index % 2 ? "#d7c4a4" : "#f3eadc"} roughness={0.72} transparent opacity={0} />
        </mesh>
      ))}
      {[-0.85, 0, 0.85].map((x) =>
        [-0.4, 0.4].map((z) => (
          <mesh key={`rebar-${x}-${z}`} position={[x, 1.05, z]} userData={{ lift: 0.45 }}>
            <cylinderGeometry args={[0.018, 0.018, 1.7, 6]} />
            <meshStandardMaterial color="#b9a07a" metalness={0.55} roughness={0.32} transparent opacity={0} />
          </mesh>
        )),
      )}
      {[-0.7, 0.7].map((x) => (
        <mesh key={`path-${x}`} position={[x, 1.05, 0]} userData={{ lift: 0.2 }}>
          <boxGeometry args={[0.015, 1.9, 0.015]} />
          <meshBasicMaterial color="#e6d2a8" transparent opacity={0} />
        </mesh>
      ))}
      <mesh position={[0, 0.42, 0.78]} userData={{ lift: 0.55 }}>
        <boxGeometry args={[2.2, 0.12, 0.18]} />
        <meshStandardMaterial color="#9a7b58" roughness={0.8} transparent opacity={0} />
      </mesh>
    </group>
  );
}

function Plans() {
  return (
    <group name="plans" visible={false} position={[0, 0.55, 0]}>
      {[0, 1, 2].map((sheet) => (
        <mesh key={sheet} position={[0, 0.02, 0]} userData={{ sheet }}>
          <boxGeometry args={[1.9, 0.008, 1.2]} />
          <meshStandardMaterial color={sheet === 1 ? "#e6d2a8" : "#f7f1e6"} roughness={0.9} transparent opacity={0} />
        </mesh>
      ))}
      <mesh position={[0, 0.72, 0]} userData={{ extrude: 1 }}>
        <boxGeometry args={[1.35, 0.72, 0.85]} />
        <meshStandardMaterial color="#e6d2a8" wireframe transparent opacity={0} />
      </mesh>
    </group>
  );
}

function ConstructionRise() {
  const tiers = [
    { y: 0.32, w: 2.5, d: 1.4, delay: 0 },
    { y: 0.28, w: 2.15, d: 1.2, delay: 0.28 },
    { y: 0.24, w: 1.7, d: 0.95, delay: 0.5 },
  ];
  return (
    <group name="construction" visible={false}>
      {tiers.map((tier, index) => (
        <mesh key={tier.w} position={[0, 0, 0]} userData={{ rise: tier.delay, full: tier.y, stack: index * 0.32 }}>
          <boxGeometry args={[tier.w, tier.y, tier.d]} />
          <meshStandardMaterial color={index === 2 ? "#d7c4a4" : "#b7a48c"} roughness={0.95} transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}

function FinishingSweep() {
  return (
    <group name="finishing" visible={false}>
      <spotLight position={[-1.6, 2.5, 2.2]} angle={0.42} penumbra={0.75} intensity={0} color="#fff6e4" distance={8} />
      <mesh position={[-0.85, 0.75, 0]}>
        <boxGeometry args={[0.95, 1.35, 0.08]} />
        <meshStandardMaterial color="#f3ecdf" roughness={0.96} transparent opacity={0} />
      </mesh>
      <mesh position={[0.2, 0.62, 0.12]}>
        <boxGeometry args={[0.85, 1.05, 0.08]} />
        <meshStandardMaterial color="#9a9188" roughness={0.78} transparent opacity={0} />
      </mesh>
      <mesh position={[1.15, 0.5, -0.05]}>
        <boxGeometry args={[0.62, 0.82, 0.08]} />
        <meshStandardMaterial color="#8a5a32" roughness={0.48} transparent opacity={0} />
      </mesh>
    </group>
  );
}

function Materials() {
  const tiles: Array<{ x: number; z: number; delay: number; gold: boolean }> = [];
  for (let ix = -3; ix <= 3; ix += 1) {
    for (let iz = -2; iz <= 2; iz += 1) {
      const distance = Math.hypot(ix, iz) / 4.2;
      tiles.push({ x: ix * 0.38, z: iz * 0.38, delay: distance * 0.62, gold: (ix + iz) % 2 === 0 });
    }
  }
  return (
    <group name="materials" visible={false} position={[0, 0.02, 0]}>
      {tiles.map((tile) => (
        <mesh key={`${tile.x}-${tile.z}`} position={[tile.x, 0.03, tile.z]} userData={{ tile: tile.delay }}>
          <boxGeometry args={[0.32, 0.05, 0.32]} />
          <meshStandardMaterial color={tile.gold ? "#c6a36a" : "#7a5340"} roughness={0.62} transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}

function Developments() {
  const villas: Array<[number, number, number, number]> = [
    [0, 0.55, 0, 1],
    [-2.4, 0.38, 1.35, 0.82],
    [2.35, 0.42, 1.05, 0.88],
    [-1.7, 0.32, -1.7, 0.74],
    [1.85, 0.36, -1.55, 0.8],
    [0.2, 0.28, 2.5, 0.66],
  ];
  return (
    <group name="developments" visible={false}>
      {villas.map((villa) => (
        <group key={villa.join("-")} position={[villa[0], 0, villa[2]]}>
          <mesh position={[0, villa[1] / 2, 0]} userData={{ lift: 0.7 * villa[3] }}>
            <boxGeometry args={[1.15 * villa[3], villa[1], 0.72 * villa[3]]} />
            <meshStandardMaterial color="#eadcc8" roughness={0.82} emissive="#ffd7a1" emissiveIntensity={0.22} transparent opacity={0} />
          </mesh>
          <mesh position={[0, villa[1] + 0.04, 0]} userData={{ lift: 0.9 * villa[3] }}>
            <boxGeometry args={[1.28 * villa[3], 0.06, 0.84 * villa[3]]} />
            <meshStandardMaterial color="#6e4a2c" roughness={0.6} transparent opacity={0} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
