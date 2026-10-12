import * as THREE from "three";

const sand = new THREE.Color("#f6f1e6");
const wet = new THREE.Color("#cfc3a8");
const grass = new THREE.Color("#1d4a32");
const deep = new THREE.Color("#143628");

export function islandHeight(distance: number, peak: number) {
  const edge = THREE.MathUtils.smoothstep(distance, 1.02, 0.78);
  const crown = Math.pow(Math.max(0, 1 - distance), 1.45);
  return edge * peak * crown;
}

export function makeIsland(radius: number, peak: number, stretch: number, segments: number) {
  const geo = new THREE.PlaneGeometry(radius * 2 * stretch, radius * 2, segments, segments);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const color = new THREE.Color();
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const d = Math.hypot(x / stretch, z) / radius;
    const n = (Math.sin(x * 0.016) * Math.cos(z * 0.014) + Math.sin(x * 0.045 + 1.7) * Math.cos(z * 0.04) * 0.35) * peak * 0.28;
    const y = d > 1.04 ? -8.0 - (d - 1.04) * 10.0 : islandHeight(d, peak) + n * (d < 1 ? 1 : 0);
    pos.setY(i, y);
    color.copy(d > 0.9 ? wet : d > 0.72 ? sand : grass);
    if (d < 0.62) color.lerp(deep, 0.55);
    if (d > 0.93) color.lerp(wet, 0.55);
    if (d > 0.78 && d < 0.9) color.lerp(sand, 0.35);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
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

export function makeCanopyTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);
  ctx.fillStyle = "#1a432c";
  ctx.fillRect(0, 0, 512, 512);
  const greens = ["#2f6b3c", "#3e7d49", "#173c28", "#4d8b54", "#245536", "#10281c"];
  for (let i = 0; i < 220; i += 1) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 16 + Math.random() * 52;
    const paint = ctx.createRadialGradient(x, y, 2, x, y, r);
    paint.addColorStop(0, greens[i % greens.length]);
    paint.addColorStop(1, "rgba(16, 40, 28, 0)");
    ctx.fillStyle = paint;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
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
