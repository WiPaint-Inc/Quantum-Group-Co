import * as THREE from "three";
import type { IslandForm } from "@/content/ocean-stops";

const sand = new THREE.Color("#fbf7ef");
const wet = new THREE.Color("#e7d8c0");
const grass = new THREE.Color("#1e6a38");
const deep = new THREE.Color("#0f3d24");
const ridge = new THREE.Color("#3e7a3a");
const rock = new THREE.Color("#8a7d6c");

function wave(x: number, z: number) {
  return Math.sin(x * 0.012 + z * 0.009) * 0.55
    + Math.sin(x * 0.031 + 1.7) * Math.cos(z * 0.027 + 0.6) * 0.3
    + Math.sin((x + z) * 0.07) * 0.15;
}

function coast(angle: number, salt: number) {
  return 1 + 0.2 * Math.sin(angle * 3 + salt) + 0.09 * Math.sin(angle * 7.2 + salt * 1.7);
}

/** Metres above the water. Negative values are the underwater shelf. */
export function sampleIslandHeight(form: IslandForm, x: number, z: number, radius: number, peak: number, stretch: number) {
  const angle = Math.atan2(z, x);
  const edge = coast(angle, radius * 0.01);
  const d = Math.hypot(x / (radius * stretch * edge), z / (radius * edge));
  const n = wave(x, z);
  const drop = d > 1.03 ? -4 - (d - 1.03) * 14 : 0;
  if (drop < 0 && form !== "bar") return drop;
  if (form === "bar") return d < 1 ? 0.55 + n * 0.35 : -2.2 - (d - 1) * 6;
  if (form === "private") {
    const dome = Math.pow(Math.max(0, 1 - d), 1.6);
    return d < 1.02 ? 0.18 + dome * 0.22 : drop;
  }
  if (form === "cay") {
    const dome = Math.pow(Math.max(0, 1 - d), 1.15);
    return d < 1.02 ? 0.25 + dome * peak + n * 0.4 : drop;
  }
  if (form === "lagoon") {
    const ring = Math.exp(-((d - 0.58) ** 2) / 0.05);
    const bowl = Math.max(0, 0.42 - d) * peak * 0.85;
    const h = ring * peak * 0.85 + Math.pow(Math.max(0, 1 - d), 1.5) * peak * 0.2 + n * 1.4 - bowl;
    return d < 1.02 ? Math.max(0.15, h) : drop;
  }
  if (form === "volcano") {
    const px = x - radius * 0.14;
    const pz = z + radius * 0.1;
    const pd = Math.hypot(px, pz) / (radius * 0.58);
    const ribs = 0.72 + 0.28 * Math.cos(Math.atan2(pz, px) * 5);
    let h = Math.pow(Math.max(0, 1 - pd), 1.12) * peak * ribs;
    h += Math.pow(Math.max(0, 1 - d), 1.7) * peak * 0.12 + n * peak * 0.05;
    if (Math.cos(angle) < -0.15) h *= 0.42 + 0.58 * THREE.MathUtils.smoothstep(d, 0.95, 0.62);
    if (Math.sin(angle) > 0.45 && d > 0.62) h = Math.min(h, 1.4);
    return d < 1.02 ? h : drop;
  }
  if (form === "peninsula") {
    const spine = Math.exp(-((z / (radius * 0.62)) ** 2));
    let h = spine * (0.28 + 0.72 * Math.pow(Math.max(0, 1 - Math.abs(x) / (radius * stretch * 0.92)), 1.15)) * peak;
    h += n * 4.5 * Math.max(0, 1 - d);
    const lagoon = Math.hypot(x - radius * 0.15, z - radius * 0.05) / (radius * 0.32);
    if (lagoon < 1) h = Math.min(h, 0.35 + lagoon * 2.2);
    if (z > radius * 0.22) h = Math.min(h, 1.15 + Math.max(0, 1 - d) * 2.4);
    return d < 1.02 ? h : drop;
  }
  const spine = Math.exp(-((z / (radius * 0.3)) ** 2));
  let h = spine * Math.pow(Math.max(0, 1 - Math.abs(x) / (radius * stretch * 0.95)), 1.05) * peak;
  h += n * peak * 0.12 * Math.max(0, 1 - d);
  if (form === "headland" && x > radius * 0.15) h *= 0.38 + 0.62 * THREE.MathUtils.smoothstep(d, 0.92, 0.55);
  if (z > radius * 0.28 && d > 0.45) h = Math.min(h, 1.35);
  return d < 1.02 ? h : drop;
}

export function islandHeight(distance: number, peak: number) {
  const edge = THREE.MathUtils.smoothstep(distance, 1.02, 0.78);
  const crown = Math.pow(Math.max(0, 1 - distance), 1.45);
  return edge * peak * crown;
}

export function makeIsland(radius: number, peak: number, stretch: number, segments: number, form: IslandForm = "ridge") {
  const geo = new THREE.PlaneGeometry(radius * 2 * stretch, radius * 2, segments, Math.max(8, Math.round(segments / stretch)));
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    pos.setY(i, sampleIslandHeight(form, pos.getX(i), pos.getZ(i), radius, peak, stretch));
  }
  geo.computeVertexNormals();
  const normal = geo.attributes.normal;
  const colors = new Float32Array(pos.count * 3);
  const color = new THREE.Color();
  for (let i = 0; i < pos.count; i += 1) {
    const y = pos.getY(i);
    const ny = normal.getY(i);
    const beach = form === "bar" || form === "private" || y < 2.1;
    if (y < 0.15) color.copy(wet);
    else if (beach && ny > 0.72 && y < 2.4) color.copy(sand);
    else if (ny < 0.58 && y > 4) color.copy(rock);
    else if (y > peak * 0.62) color.copy(deep);
    else if (y > peak * 0.38) color.copy(ridge);
    else color.copy(grass);
    if (y > 0.15 && y < 0.7) color.lerp(wet, 0.45);
    if (form === "private" || form === "bar") color.copy(y < 0.35 ? wet : sand);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

export function makePalm() {
  const positions: number[] = [];
  const colors: number[] = [];
  const trunk = new THREE.Color("#6b4a32");
  const leafA = new THREE.Color("#d5e2b4");
  const leafB = new THREE.Color("#1f5a38");
  const sides = 6;
  const rows = 5;
  const height = 6.2;
  for (let y = 0; y < rows; y += 1) {
    for (let s = 0; s < sides; s += 1) {
      const a0 = (s / sides) * Math.PI * 2;
      const a1 = ((s + 1) / sides) * Math.PI * 2;
      const t0 = y / rows;
      const t1 = (y + 1) / rows;
      const r0 = 0.22 * (1 - t0 * 0.45);
      const r1 = 0.22 * (1 - t1 * 0.45);
      const bend0 = Math.sin(t0 * 1.2) * 0.35;
      const bend1 = Math.sin(t1 * 1.2) * 0.35;
      const quad = [
        [Math.cos(a0) * r0 + bend0, t0 * height, Math.sin(a0) * r0],
        [Math.cos(a1) * r0 + bend0, t0 * height, Math.sin(a1) * r0],
        [Math.cos(a1) * r1 + bend1, t1 * height, Math.sin(a1) * r1],
        [Math.cos(a0) * r0 + bend0, t0 * height, Math.sin(a0) * r0],
        [Math.cos(a1) * r1 + bend1, t1 * height, Math.sin(a1) * r1],
        [Math.cos(a0) * r1 + bend1, t1 * height, Math.sin(a0) * r1],
      ];
      for (const p of quad) {
        positions.push(p[0], p[1], p[2]);
        colors.push(trunk.r, trunk.g, trunk.b);
      }
    }
  }
  for (let f = 0; f < 7; f += 1) {
    const yaw = (f / 7) * Math.PI * 2;
    const steps = 6;
    for (let i = 0; i < steps; i += 1) {
      const t0 = i / steps;
      const t1 = (i + 1) / steps;
      const frond = (t: number) => {
        const len = 3.4 * t;
        const droop = t * t * 1.6;
        const x = Math.cos(yaw) * len;
        const z = Math.sin(yaw) * len;
        return new THREE.Vector3(x, height - droop, z);
      };
      const a = frond(t0);
      const b = frond(t1);
      const width = (1 - t0) * 0.42;
      const side = new THREE.Vector3(-Math.sin(yaw), 0, Math.cos(yaw)).multiplyScalar(width);
      const col = leafA.clone().lerp(leafB, t0);
      const corners = [a.clone().sub(side), a.clone().add(side), b.clone().add(side), a.clone().sub(side), b.clone().add(side), b.clone().sub(side)];
      for (const p of corners) {
        positions.push(p.x, p.y, p.z);
        colors.push(col.r, col.g, col.b);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

function finishRepeat(texture: THREE.Texture) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  return texture;
}

export function makeCanopyTexture() {
  const size = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (!ctx) return finishRepeat(texture);
  ctx.fillStyle = "#1a432c";
  ctx.fillRect(0, 0, size, size);
  const greens = ["#2f6b3c", "#3e7d49", "#173c28", "#4d8b54", "#245536", "#10281c", "#6ea36a", "#143221"];
  for (let i = 0; i < 1400; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 10 + Math.random() * 70;
    const paint = ctx.createRadialGradient(x, y, 1, x, y, r);
    paint.addColorStop(0, greens[i % greens.length]);
    paint.addColorStop(1, "rgba(16, 40, 28, 0)");
    ctx.fillStyle = paint;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return finishRepeat(texture);
}

/** World-space grain for sand and canopy so the islands are not flat vertex colour. */
export function makeTerrainTexture(size = 2048) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const n = hash(x * 0.37 + y * 1.91) * 0.62 + hash(x * 0.07 - y * 0.11 + 8.2) * 0.38;
      const warm = 0.72 + n * 0.46;
      const i = (y * size + x) * 4;
      data[i] = Math.min(255, warm * 255);
      data[i + 1] = Math.min(255, (warm * 0.96 + 0.02) * 255);
      data[i + 2] = Math.min(255, (warm * 0.86) * 255);
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  return finishRepeat(texture);
}

/** 2048 sea normal. R and G are the X/Z tilt, matching the water shader. */
export function makeWaterNormal(size = 2048) {
  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y += 1) {
    const v = y / size;
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      heights[y * size + x] = Math.sin((u * 40 + v * 16) * Math.PI * 2) * 0.5
        + Math.sin((u * 18 - v * 33) * Math.PI * 2) * 0.28
        + Math.sin((u * 86 + v * 64) * Math.PI * 2) * 0.12
        + Math.sin((u * 7 + v * 5) * Math.PI * 2) * 0.22;
    }
  }
  const data = new Uint8Array(size * size * 4);
  const strength = 2.6;
  for (let y = 0; y < size; y += 1) {
    const y0 = (y - 1 + size) % size;
    const y1 = (y + 1) % size;
    for (let x = 0; x < size; x += 1) {
      const x0 = (x - 1 + size) % size;
      const x1 = (x + 1) % size;
      const dx = (heights[y * size + x1] - heights[y * size + x0]) * strength;
      const dz = (heights[y1 * size + x] - heights[y0 * size + x]) * strength;
      const inv = 1 / Math.hypot(-dx, 1, -dz);
      const i = (y * size + x) * 4;
      data[i] = ((-dx) * inv * 0.5 + 0.5) * 255;
      data[i + 1] = ((-dz) * inv * 0.5 + 0.5) * 255;
      data[i + 2] = (inv * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.colorSpace = THREE.NoColorSpace;
  return finishRepeat(texture);
}

export function enableSolidShadows(root: THREE.Object3D | null) {
  root?.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    const list = Array.isArray(material) ? material : material ? [material] : [];
    if (list.some((item) => item.transparent || item.depthWrite === false || (item as THREE.ShaderMaterial).isShaderMaterial)) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });
}

export function makeCanopyDome() {
  const geo = new THREE.SphereGeometry(1, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
  geo.translate(0, 0, 0);
  return geo;
}

export function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}
