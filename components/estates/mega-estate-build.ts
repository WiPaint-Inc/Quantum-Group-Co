import * as THREE from "three";
import { ESTATE_PLAN, ESTATE_PLAN_LINES } from "@/components/ocean/estate-plan";
import { buildLines } from "@/components/ocean/linework";

const MPP = 0.105;

function toLocal(px: number, py: number): [number, number] {
  return [(px - 800) * MPP, (py - 450) * MPP];
}

function parsePairs(points: string) {
  return points.trim().split(/\s+/).map((pair) => {
    const [x, y] = pair.split(",").map(Number);
    return toLocal(x, y);
  });
}

function isClosed(points: string) {
  const raw = points.trim().split(/\s+/);
  return raw.length >= 4 && raw[0] === raw[raw.length - 1];
}

function ringArea(poly: Array<[number, number]>) {
  let sum = 0;
  for (let i = 0; i < poly.length; i += 1) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    sum += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(sum) * 0.5;
}

function heightFor(area: number) {
  if (area < 18) return 1.35;
  if (area < 55) return 4.4;
  if (area < 140) return 6.8;
  return Math.min(13.5, 8.2 + area / 380);
}

function pushTri(target: number[], a: number[], b: number[], c: number[], color: number[]) {
  for (const p of [a, b, c]) target.push(p[0], p[1], p[2], color[0], color[1], color[2]);
}

export function buildMegaEstatePlaceholder() {
  const positions: number[] = [];
  const wall = [0.9, 0.86, 0.78];
  const roof = [0.97, 0.94, 0.88];
  const strokes: Array<{ points: THREE.Vector3[]; width: number; t0: number; t1: number }> = [];
  let footprint = 0;

  for (const points of ESTATE_PLAN) {
    const pairs = parsePairs(points);
    if (!isClosed(points)) {
      strokes.push({
        points: pairs.map(([x, z]) => new THREE.Vector3(x, 0.35, z)),
        width: 1,
        t0: 0.05,
        t1: 0.42,
      });
      continue;
    }
    if (pairs.length > 1) {
      const a = pairs[0];
      const b = pairs[pairs.length - 1];
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.05) pairs.pop();
    }
    if (pairs.length < 3) continue;
    const area = ringArea(pairs);
    const height = heightFor(area);
    footprint += 1;
    const draw = 0.15 + (footprint % 5) * 0.08;
    const contour = pairs.map(([x, z]) => new THREE.Vector2(x, z));
    const faces = THREE.ShapeUtils.triangulateShape(contour, []);
    for (const face of faces) {
      const tri = face.map((index) => {
        const [x, z] = pairs[index];
        return [x, height, z];
      });
      pushTri(positions, tri[0], tri[1], tri[2], roof);
    }
    for (let i = 0; i < pairs.length; i += 1) {
      const [x0, z0] = pairs[i];
      const [x1, z1] = pairs[(i + 1) % pairs.length];
      pushTri(positions, [x0, 0, z0], [x1, 0, z1], [x1, height, z1], wall);
      pushTri(positions, [x0, 0, z0], [x1, height, z1], [x0, height, z0], wall);
      strokes.push({
        points: [new THREE.Vector3(x0, 0.4, z0), new THREE.Vector3(x1, 0.4, z1)],
        width: 1,
        t0: draw,
        t1: draw + 0.22,
      });
      strokes.push({
        points: [new THREE.Vector3(x0, 0.4, z0), new THREE.Vector3(x0, height + 0.15, z0)],
        width: 0.85,
        t0: draw + 0.12,
        t1: Math.min(0.92, draw + 0.4),
      });
    }
    strokes.push({
      points: [...pairs, pairs[0]].map(([x, z]) => new THREE.Vector3(x, height + 0.12, z)),
      width: 0.8,
      t0: Math.min(0.7, draw + 0.28),
      t1: 0.96,
    });
  }

  for (const [x1, y1, x2, y2] of ESTATE_PLAN_LINES) {
    const a = toLocal(x1, y1);
    const b = toLocal(x2, y2);
    strokes.push({
      points: [new THREE.Vector3(a[0], 0.45, a[1]), new THREE.Vector3(b[0], 0.45, b[1])],
      width: 0.7,
      t0: 0.2,
      t1: 0.55,
    });
  }

  return { mass: packMass(positions), lines: buildLines(strokes) };
}

function packMass(packed: number[]) {
  const count = packed.length / 6;
  const position = new Float32Array(count * 3);
  const color = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    position[i * 3] = packed[i * 6];
    position[i * 3 + 1] = packed[i * 6 + 1];
    position[i * 3 + 2] = packed[i * 6 + 2];
    color[i * 3] = packed[i * 6 + 3];
    color[i * 3 + 1] = packed[i * 6 + 4];
    color[i * 3 + 2] = packed[i * 6 + 5];
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(color, 3));
  geo.computeVertexNormals();
  return geo;
}
