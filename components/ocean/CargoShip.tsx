"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { buildLines } from "@/components/ocean/linework";
import { enableSolidShadows } from "@/components/ocean/geometry";
import { lineFragment, lineVertex } from "@/components/ocean/shaders";
import { oceanStops } from "@/content/ocean-stops";
import { drawAmount, SHIP_HEADING, SHIP_LENGTH, shipMotion } from "@/lib/ocean-flight";

const GOLD = new THREE.Color("#e6d2a8");
const BOX_COLORS = ["#8d3d34", "#cbb892", "#2f4638", "#6b4a32", "#243044", "#a3201c", "#d7c4a4"];

function section(half: number, keel: number, deck: number, v: number) {
  const side = v * 2 - 1;
  const a = Math.abs(side);
  const x = side * half * (a < 0.18 ? (a / 0.18) * 0.55 : 0.55 + ((a - 0.18) / 0.82) * 0.45);
  const y = a < 0.18 ? keel + (a / 0.18) * 0.35 : keel + 0.35 + Math.pow((a - 0.18) / 0.82, 0.62) * (deck - keel - 0.35);
  return { x, y };
}

function seaHeave(worldX: number, time: number) {
  const localX = worldX + 200;
  const waves: Array<[number, number, number, number, number]> = [
    [0.14, 320, 0.55, 0.84, 0.32],
    [0.09, 110, -0.25, 1, 0.62],
    [0.07, 38, 0.9, -0.35, 1.05],
  ];
  let height = 0;
  for (const [steep, length, dirX, dirZ, speed] of waves) {
    const k = 6.2831853 / length;
    const c = Math.sqrt(9.8 / k);
    const span = Math.hypot(dirX, dirZ) || 1;
    const f = k * ((dirX / span) * localX - c * speed * time);
    height += (steep / k) * Math.sin(f);
  }
  return height;
}

function makeHull() {
  const length = SHIP_LENGTH;
  const stations = 48;
  const rings = 18;
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const hull = new THREE.Color("#1c2128");
  const boot = new THREE.Color("#6a302c");
  const stripe = new THREE.Color("#d9c7a2");
  const color = new THREE.Color();
  const stride = rings + 1;
  for (let i = 0; i <= stations; i += 1) {
    const t = i / stations;
    const z = -length / 2 + t * length;
    const bow = THREE.MathUtils.smoothstep(t, 0.84, 1);
    const stern = THREE.MathUtils.smoothstep(t, 0.08, 0);
    const half = 16.4 * (1 - bow * 0.97) * (1 - stern * 0.18);
    const deck = 9.2 - bow * 1.4 - stern * 0.4;
    const keel = -6.4 + bow * 4.2 + stern * 1.4;
    for (let r = 0; r <= rings; r += 1) {
      const { x, y } = section(half, keel, deck, r / rings);
      positions.push(x, y, z);
      const panel = 0.82 + ((Math.floor(i / 3) + Math.floor(r / 2)) % 3) * 0.06;
      if (y < 0.15) color.copy(boot);
      else if (y < 1.15) color.copy(stripe);
      else color.copy(hull);
      color.multiplyScalar(panel);
      colors.push(color.r, color.g, color.b);
    }
  }
  for (let i = 0; i < stations; i += 1) {
    for (let r = 0; r < rings; r += 1) {
      const a = i * stride + r;
      const b = a + stride;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function paintContainers() {
  const width = 512;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  if (!ctx) return texture;
  ctx.fillStyle = "#f2f2f0";
  ctx.fillRect(0, 0, width, height);
  for (let x = 0; x < width; x += 32) {
    ctx.fillStyle = x % 64 === 0 ? "#d5d3ce" : "#f7f6f3";
    ctx.fillRect(x, 0, 16, height);
  }
  ctx.strokeStyle = "rgba(28, 24, 20, 0.55)";
  ctx.lineWidth = 28;
  ctx.strokeRect(20, 24, width - 40, height - 48);
  ctx.fillStyle = "rgba(70, 48, 32, 0.18)";
  ctx.fillRect(0, height - 168, width, 168);
  ctx.fillStyle = "rgba(40, 36, 32, 0.12)";
  for (let y = 72; y < height - 80; y += 184) ctx.fillRect(32, y, width - 64, 8);
  texture.needsUpdate = true;
  return texture;
}

function labelTexture(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (!ctx) return texture;
  ctx.clearRect(0, 0, 512, 128);
  ctx.fillStyle = "rgba(230, 210, 168, 0.92)";
  ctx.font = "500 64px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 64);
  texture.needsUpdate = true;
  return texture;
}

function arcPoints(from: THREE.Vector3, to: THREE.Vector3, lift: number) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 20; i += 1) {
    const t = i / 20;
    const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * (Math.max(from.y, to.y) + lift) + t * t * to.y;
    points.push(new THREE.Vector3(from.x + (to.x - from.x) * t, y, from.z + (to.z - from.z) * t));
  }
  return points;
}

function lineMaterial(fade: number, halfPx: number) {
  return new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uDraw: { value: 0 },
      uWash: { value: 0 },
      uNight: { value: 0 },
      uFade: { value: fade },
      uColor: { value: GOLD.clone() },
      uResolution: { value: new THREE.Vector2(1280, 720) },
      uHalfPx: { value: halfPx },
    },
    vertexShader: lineVertex,
    fragmentShader: lineFragment,
  });
}

export function CargoShip({ progressRef }: { progressRef: { current: number } }) {
  const base = oceanStops.find((stop) => stop.id === "materials") ?? oceanStops[0];
  const rig = useRef<THREE.Group>(null);
  const miami = useRef<THREE.Mesh>(null);
  const antigua = useRef<THREE.Mesh>(null);
  const routeLabel = useRef<THREE.Mesh>(null);
  const boxesRef = useRef<THREE.InstancedMesh>(null);
  const hull = useMemo(() => makeHull(), []);
  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const boxMap = useMemo(() => paintContainers(), []);
  const boxes = useMemo(() => {
    const spots: Array<{ x: number; y: number; z: number; color: string }> = [];
    const along = 12;
    const across = 7;
    for (let i = 0; i < along; i += 1) {
      for (let j = 0; j < across; j += 1) {
        const tiers = 3 + ((i * 2 + j) % 3);
        for (let k = 0; k < tiers; k += 1) {
          if ((i * 5 + j * 3 + k) % 19 === 0) continue;
          spots.push({
            x: (j - (across - 1) / 2) * 2.6,
            y: 9.55 + k * 2.64,
            z: -72 + i * 12.2,
            color: BOX_COLORS[(i * 3 + j + k) % BOX_COLORS.length],
          });
        }
      }
    }
    return spots;
  }, []);
  const outlines = useMemo(() => {
    const strokes: Array<{ points: THREE.Vector3[]; width: number; t0: number; t1: number }> = [];
    const stacks = [
      { x: -9.2, z: -74, w: 18.4, d: 74, h: 15.6 },
      { x: -9.2, z: 8, w: 18.4, d: 62, h: 13.2 },
    ];
    stacks.forEach((stack, index) => {
      const y = 9.4;
      const t0 = index * 0.18;
      const corners = [
        [stack.x, stack.z],
        [stack.x + stack.w, stack.z],
        [stack.x + stack.w, stack.z + stack.d],
        [stack.x, stack.z + stack.d],
      ] as const;
      corners.forEach((corner, cornerIndex) => {
        const next = corners[(cornerIndex + 1) % corners.length];
        strokes.push({
          points: [new THREE.Vector3(corner[0], y, corner[1]), new THREE.Vector3(next[0], y, next[1])],
          width: 1,
          t0: t0 + cornerIndex * 0.05,
          t1: t0 + 0.22 + cornerIndex * 0.05,
        });
        strokes.push({
          points: [new THREE.Vector3(corner[0], y + stack.h, corner[1]), new THREE.Vector3(next[0], y + stack.h, next[1])],
          width: 1,
          t0: t0 + 0.28 + cornerIndex * 0.04,
          t1: t0 + 0.5 + cornerIndex * 0.04,
        });
        strokes.push({
          points: [new THREE.Vector3(corner[0], y, corner[1]), new THREE.Vector3(corner[0], y + stack.h, corner[1])],
          width: 1,
          t0: t0 + 0.42,
          t1: t0 + 0.68,
        });
      });
    });
    return buildLines(strokes);
  }, []);
  const flows = useMemo(() => {
    const strokes = [
      arcPoints(new THREE.Vector3(-4, 22, -48), new THREE.Vector3(3, 18, 62), 9),
      arcPoints(new THREE.Vector3(5, 20, -18), new THREE.Vector3(-3, 17, 78), 7),
      arcPoints(new THREE.Vector3(0, 24, -70), new THREE.Vector3(1, 16, 36), 11),
    ].map((points, index) => ({ points, width: 1, t0: 0.08 + index * 0.1, t1: 0.78 + index * 0.06, bright: 0.8 }));
    return buildLines(strokes);
  }, []);
  const route = useMemo(() => {
    const fx = Math.sin(SHIP_HEADING);
    const fz = Math.cos(SHIP_HEADING);
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 32; i += 1) {
      const t = i / 32;
      const along = -420 + t * 840;
      points.push(new THREE.Vector3(base.x + fx * along, 20 + Math.sin(t * Math.PI) * 26, base.z + fz * along));
    }
    return buildLines([{ points, width: 1, t0: 0.02, t1: 0.98, bright: 0.4 }]);
  }, [base.x, base.z]);
  const outlineMat = useMemo(() => lineMaterial(1, 4.2), []);
  const flowMat = useMemo(() => lineMaterial(1, 3.4), []);
  const routeMat = useMemo(() => lineMaterial(0.72, 2.8), []);
  const miamiMap = useMemo(() => labelTexture("Miami"), []);
  const antiguaMap = useMemo(() => labelTexture("Antigua"), []);
  const routeMap = useMemo(() => labelTexture("Miami  →  Antigua"), []);
  const resolution = useMemo(() => new THREE.Vector2(), []);
  const { camera, size, gl } = useThree();
  const index = oceanStops.findIndex((stop) => stop.id === "materials");
  const hullMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.42,
    metalness: 0.12,
    clearcoat: 0.22,
    clearcoatRoughness: 0.46,
    envMapIntensity: 0.18,
  }), []);
  const deckMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#3a4046",
    roughness: 0.78,
    metalness: 0.22,
    envMapIntensity: 0.12,
  }), []);
  const boxMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    map: boxMap,
    roughness: 0.62,
    metalness: 0.06,
    clearcoat: 0.16,
    clearcoatRoughness: 0.5,
    envMapIntensity: 0.16,
  }), [boxMap]);
  const bridgeMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#e4ddd2",
    roughness: 0.58,
    metalness: 0.04,
    clearcoat: 0.12,
    envMapIntensity: 0.2,
  }), []);
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#142028",
    roughness: 0.08,
    metalness: 0.86,
    clearcoat: 0.4,
    envMapIntensity: 0.35,
  }), []);

  useEffect(() => {
    const mesh = boxesRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    boxes.forEach((box, i) => {
      dummy.position.set(box.x, box.y, box.z);
      dummy.scale.set(2.42, 2.55, 12.02);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.set(box.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    enableSolidShadows(rig.current);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }, [boxes]);

  useEffect(() => () => {
    hull.dispose();
    boxGeo.dispose();
    outlines.dispose();
    flows.dispose();
    route.dispose();
    outlineMat.dispose();
    flowMat.dispose();
    routeMat.dispose();
    miamiMap.dispose();
    antiguaMap.dispose();
    routeMap.dispose();
    boxMap.dispose();
    hullMat.dispose();
    deckMat.dispose();
    boxMat.dispose();
    bridgeMat.dispose();
    glassMat.dispose();
  }, [antiguaMap, boxGeo, boxMap, boxMat, bridgeMat, deckMat, flowMat, flows, glassMat, hull, hullMat, miamiMap, outlineMat, outlines, route, routeMap, routeMat]);

  useFrame(({ clock }) => {
    const motion = shipMotion(clock.elapsedTime);
    const worldX = base.x + motion.dx;
    if (rig.current) {
      rig.current.position.set(worldX, seaHeave(worldX, clock.elapsedTime), base.z + motion.dz);
      rig.current.rotation.order = "YXZ";
      rig.current.rotation.y = motion.heading;
      rig.current.rotation.x = motion.pitch;
      rig.current.rotation.z = motion.roll;
    }
    resolution.set(size.width * gl.getPixelRatio(), size.height * gl.getPixelRatio());
    const draw = index < 0 ? 1 : drawAmount(progressRef.current, index);
    outlineMat.uniforms.uDraw.value = draw;
    outlineMat.uniforms.uNight.value = 1;
    flowMat.uniforms.uDraw.value = (clock.elapsedTime * 0.16) % 1;
    flowMat.uniforms.uNight.value = 1;
    routeMat.uniforms.uDraw.value = Math.max(draw, 0.55);
    routeMat.uniforms.uNight.value = 1;
    for (const material of [outlineMat, flowMat, routeMat]) {
      (material.uniforms.uResolution.value as THREE.Vector2).copy(resolution);
    }
    miami.current?.lookAt(camera.position);
    antigua.current?.lookAt(camera.position);
    routeLabel.current?.lookAt(camera.position);
  });

  return (
    <group>
      <group ref={rig}>
        <mesh geometry={hull} material={hullMat} frustumCulled={false} />
        <mesh position={[0, -2.4, SHIP_LENGTH / 2 - 8]} frustumCulled={false}>
          <sphereGeometry args={[3.4, 20, 14]} />
          <meshPhysicalMaterial color="#6a302c" roughness={0.48} metalness={0.08} envMapIntensity={0.12} />
        </mesh>
        <mesh position={[0, 9.15, -8]} rotation={[-Math.PI / 2, 0, 0]} material={deckMat} frustumCulled={false}>
          <planeGeometry args={[28, 196]} />
        </mesh>
        <mesh position={[0, 1.2, -SHIP_LENGTH / 2 + 4]} frustumCulled={false}>
          <boxGeometry args={[22, 12, 3.2]} />
          <meshPhysicalMaterial color="#1c2128" roughness={0.5} metalness={0.1} envMapIntensity={0.12} />
        </mesh>
        <mesh position={[0, -1.5, -SHIP_LENGTH / 2 + 1]} frustumCulled={false}>
          <boxGeometry args={[0.35, 7, 3.4]} />
          <meshStandardMaterial color="#2a2420" roughness={0.6} metalness={0.3} />
        </mesh>
        <instancedMesh ref={boxesRef} args={[boxGeo, boxMat, boxes.length]} frustumCulled={false} />
        <mesh position={[0, 18.2, -96]} material={bridgeMat} frustumCulled={false}>
          <boxGeometry args={[16, 14, 18]} />
        </mesh>
        <mesh position={[0, 15.2, -86.6]} material={glassMat} frustumCulled={false}>
          <boxGeometry args={[14.6, 3.4, 0.28]} />
        </mesh>
        <mesh position={[3.6, 26.4, -100]} frustumCulled={false}>
          <cylinderGeometry args={[1.5, 1.9, 6.5, 16]} />
          <meshStandardMaterial color="#8d3d34" roughness={0.72} metalness={0.08} />
        </mesh>
        <pointLight position={[10, 24, 12]} color="#f0d7b0" intensity={4200} distance={78} decay={2} />
        <pointLight position={[8, 22, -40]} color="#f0d7b0" intensity={3200} distance={70} decay={2} />
        <pointLight position={[22, 18, -6]} color="#c9d7ea" intensity={5600} distance={120} decay={2} />
        <mesh geometry={outlines} material={outlineMat} frustumCulled={false} />
        <mesh geometry={flows} material={flowMat} frustumCulled={false} />
        <mesh ref={miami} position={[2, 30, -96]} frustumCulled={false}>
          <planeGeometry args={[36, 8]} />
          <meshBasicMaterial map={miamiMap} transparent depthWrite={false} depthTest={false} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={antigua} position={[6, 42, 86]} frustumCulled={false}>
          <planeGeometry args={[40, 9]} />
          <meshBasicMaterial map={antiguaMap} transparent depthWrite={false} depthTest={false} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={routeLabel} position={[10, 36, -28]} frustumCulled={false}>
          <planeGeometry args={[58, 12]} />
          <meshBasicMaterial map={routeMap} transparent depthWrite={false} depthTest={false} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <mesh geometry={route} material={routeMat} frustumCulled={false} />
    </group>
  );
}
