import * as THREE from "three";

type Stroke = {
  points: THREE.Vector3[];
  width: number;
  t0: number;
  t1: number;
  bright?: number;
  scatter?: THREE.Vector3;
};

export function buildLines(strokes: Stroke[]) {
  const positions: number[] = [];
  const ts: number[] = [];
  const sides: number[] = [];
  const brights: number[] = [];
  const scatter: number[] = [];
  const normals: number[] = [];
  const side = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  for (const stroke of strokes) {
    const points = stroke.points;
    const bright = stroke.bright ?? 1;
    const off = stroke.scatter ?? new THREE.Vector3();
    for (let i = 0; i < points.length - 1; i += 1) {
      const a = points[i];
      const b = points[i + 1];
      const dir = b.clone().sub(a);
      const len = dir.length();
      if (len < 1e-4) continue;
      dir.multiplyScalar(1 / len);
      side.crossVectors(dir, up);
      if (side.lengthSq() < 1e-5) side.set(0, 0, 1);
      side.normalize();
      const ta = THREE.MathUtils.lerp(stroke.t0, stroke.t1, i / (points.length - 1));
      const tb = THREE.MathUtils.lerp(stroke.t0, stroke.t1, (i + 1) / (points.length - 1));
      const centers = [a, a, b, a, b, b];
      const cornerT = [ta, ta, tb, ta, tb, tb];
      const cornerS = [-1, 1, 1, -1, 1, -1];
      for (let k = 0; k < 6; k += 1) {
        positions.push(centers[k].x, centers[k].y, centers[k].z);
        ts.push(cornerT[k]);
        sides.push(cornerS[k]);
        brights.push(bright);
        scatter.push(off.x, off.y, off.z);
        normals.push(side.x, side.y, side.z);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("aT", new THREE.Float32BufferAttribute(ts, 1));
  geo.setAttribute("aSide", new THREE.Float32BufferAttribute(sides, 1));
  geo.setAttribute("aBright", new THREE.Float32BufferAttribute(brights, 1));
  geo.setAttribute("aScatter", new THREE.Float32BufferAttribute(scatter, 3));
  geo.setAttribute("aN", new THREE.Float32BufferAttribute(normals, 3));
  return geo;
}

function rect(x: number, y: number, z: number, w: number, d: number, t0: number, t1: number, width: number, bright = 1, scatter?: THREE.Vector3): Stroke[] {
  const y0 = y;
  return [
    { points: [new THREE.Vector3(x, y0, z), new THREE.Vector3(x + w, y0, z)], width, t0, t1, bright, scatter },
    { points: [new THREE.Vector3(x + w, y0, z), new THREE.Vector3(x + w, y0, z + d)], width, t0, t1, bright, scatter },
    { points: [new THREE.Vector3(x + w, y0, z + d), new THREE.Vector3(x, y0, z + d)], width, t0, t1, bright, scatter },
    { points: [new THREE.Vector3(x, y0, z + d), new THREE.Vector3(x, y0, z)], width, t0, t1, bright, scatter },
  ];
}

function line(a: THREE.Vector3, b: THREE.Vector3, t0: number, t1: number, width: number, bright = 1, scatter?: THREE.Vector3): Stroke {
  return { points: [a, b], width, t0, t1, bright, scatter };
}

export function linesFor(kind: string, radius: number) {
  const s = radius * 0.42;
  const h = Math.min(42, Math.max(8, radius * 0.09));
  const w = 1;
  const strokes: Stroke[] = [];
  if (kind === "design") {
    strokes.push(...rect(-s, 0.2, -s * 0.72, s * 2, s * 1.44, 0, 0.28, w));
    strokes.push(...rect(-s * 0.35, 0.2, -s * 0.28, s * 0.7, s * 0.55, 0.18, 0.42, w * 0.8));
    strokes.push(line(new THREE.Vector3(-s, 0.2, 0), new THREE.Vector3(s, 0.2, 0), 0.3, 0.48, w * 0.7));
    strokes.push(line(new THREE.Vector3(0, 0.2, -s * 0.72), new THREE.Vector3(0, 0.2, s * 0.72), 0.34, 0.5, w * 0.7));
    const ex = s * 1.15;
    strokes.push(line(new THREE.Vector3(ex, 0.2, -s * 0.45), new THREE.Vector3(ex, 0.2, s * 0.45), 0.5, 0.62, w));
    strokes.push(line(new THREE.Vector3(ex, 0.2, -s * 0.45), new THREE.Vector3(ex, h * 0.65, -s * 0.45), 0.58, 0.72, w));
    strokes.push(line(new THREE.Vector3(ex, 0.2, s * 0.45), new THREE.Vector3(ex, h * 0.65, s * 0.45), 0.58, 0.72, w));
    strokes.push(line(new THREE.Vector3(ex, h * 0.65, -s * 0.45), new THREE.Vector3(ex, h, 0), 0.68, 0.86, w));
    strokes.push(line(new THREE.Vector3(ex, h * 0.65, s * 0.45), new THREE.Vector3(ex, h, 0), 0.68, 0.86, w));
    strokes.push(...rect(ex - 0.02, h * 0.32, -s * 0.12, 0.04, s * 0.18, 0.82, 0.94, w * 0.65));
  } else if (kind === "plans") {
    for (let sheet = 0; sheet < 3; sheet += 1) {
      const oz = (sheet - 1) * s * 0.62;
      const oy = 0.45;
      const t0 = sheet * 0.28;
      strokes.push(...rect(-s * 0.62, oy, -s * 0.22 + oz, s * 1.24, s * 0.4, t0, t0 + 0.22, w * 0.85));
      strokes.push(line(new THREE.Vector3(-s * 0.4, oy, oz), new THREE.Vector3(s * 0.4, oy, oz), t0 + 0.08, t0 + 0.24, w * 0.55));
      strokes.push(line(new THREE.Vector3(0, oy, -s * 0.16 + oz), new THREE.Vector3(0, oy, s * 0.16 + oz), t0 + 0.1, t0 + 0.26, w * 0.55));
    }
  } else if (kind === "construction") {
    const cols = [-0.7, -0.25, 0.25, 0.7];
    cols.forEach((nx, i) => {
      const x = nx * s;
      strokes.push(line(new THREE.Vector3(x, 0.15, -s * 0.35), new THREE.Vector3(x, h * 0.72, -s * 0.35), 0.02 + i * 0.04, 0.28 + i * 0.02, w));
      strokes.push(line(new THREE.Vector3(x, 0.15, s * 0.35), new THREE.Vector3(x, h * 0.72, s * 0.35), 0.05 + i * 0.04, 0.3 + i * 0.02, w));
    });
    strokes.push(...rect(-s * 0.78, h * 0.4, -s * 0.42, s * 1.56, s * 0.84, 0.4, 0.58, w * 0.8));
    strokes.push(...rect(-s * 0.78, h * 0.72, -s * 0.42, s * 1.56, s * 0.84, 0.52, 0.7, w * 0.8));
    strokes.push(line(new THREE.Vector3(-s * 0.7, h * 0.72, 0), new THREE.Vector3(0, h, 0), 0.7, 0.86, w));
    strokes.push(line(new THREE.Vector3(s * 0.7, h * 0.72, 0), new THREE.Vector3(0, h, 0), 0.7, 0.86, w));
    strokes.push(line(new THREE.Vector3(-s * 0.7, h * 0.72, 0), new THREE.Vector3(s * 0.7, h * 0.72, 0), 0.78, 0.92, w * 0.7));
  } else if (kind === "engineering") {
    strokes.push(...rect(-s * 0.8, 0.2, -s * 0.5, s * 1.6, s, 0, 0.16, w * 0.55, 0.35));
    strokes.push(...rect(-s * 0.8, h * 0.55, -s * 0.5, s * 1.6, s, 0.08, 0.22, w * 0.55, 0.35));
    for (const x of [-s * 0.8, s * 0.8]) {
      for (const z of [-s * 0.5, s * 0.5]) {
        strokes.push(line(new THREE.Vector3(x, 0.2, z), new THREE.Vector3(x, h * 0.55, z), 0.12, 0.24, w * 0.45, 0.35));
      }
    }
    strokes.push(line(new THREE.Vector3(-s * 0.7, 0.35, 0), new THREE.Vector3(s * 0.7, 0.35, 0), 0.28, 0.48, w, 1));
    strokes.push(line(new THREE.Vector3(-s * 0.2, 0.35, 0), new THREE.Vector3(-s * 0.2, h * 0.5, 0), 0.4, 0.55, w * 0.8, 1));
    strokes.push(line(new THREE.Vector3(s * 0.35, 0.35, -s * 0.2), new THREE.Vector3(s * 0.35, h * 0.5, -s * 0.2), 0.42, 0.56, w * 0.8, 1));
    strokes.push(...rect(-s * 0.55, h * 0.48, -s * 0.28, s * 1.1, s * 0.5, 0.58, 0.78, w * 0.9, 0.85));
    strokes.push(line(new THREE.Vector3(-s * 0.15, h * 0.32, s * 0.15), new THREE.Vector3(s * 0.55, h * 0.32, s * 0.15), 0.8, 0.9, w * 0.45, 1.15));
    strokes.push(line(new THREE.Vector3(s * 0.1, h * 0.32, s * 0.15), new THREE.Vector3(s * 0.1, h * 0.42, -s * 0.25), 0.86, 0.98, w * 0.4, 1.15));
  } else if (kind === "developments") {
    strokes.push(...rect(-s * 1.3, 0.25, -s * 0.55, s * 2.6, s * 1.1, 0, 0.2, w));
    for (let i = 1; i < 4; i += 1) {
      const x = -s * 1.3 + i * s * 0.65;
      strokes.push(line(new THREE.Vector3(x, 0.25, -s * 0.55), new THREE.Vector3(x, 0.25, s * 0.55), 0.18 + i * 0.06, 0.4 + i * 0.04, w * 0.7));
    }
    const road: THREE.Vector3[] = [];
    for (let i = 0; i <= 12; i += 1) {
      const t = i / 12;
      road.push(new THREE.Vector3(-s * 1.2 + t * s * 2.4, 0.3, Math.sin(t * Math.PI) * s * 0.22));
    }
    strokes.push({ points: road, width: w * 1.1, t0: 0.45, t1: 0.85 });
  } else if (kind === "materials") {
    for (let i = 0; i < 6; i += 1) {
      const x = -s * 0.7 + i * s * 0.26;
      const scatter = new THREE.Vector3((i - 2.5) * s * 0.35, 1.2 + (i % 3) * 0.4, (i - 3) * s * 0.2);
      strokes.push(...rect(x, 0.4 + (i % 2) * 1.4, -s * 0.22, s * 0.22, s * 0.44, i * 0.12, 0.35 + i * 0.1, w, 1, scatter));
    }
  } else if (kind === "signal") {
    const ring: THREE.Vector3[] = [];
    for (let i = 0; i <= 28; i += 1) {
      const a = (i / 28) * Math.PI * 2;
      ring.push(new THREE.Vector3(Math.cos(a) * s * 0.85, 1.2, Math.sin(a) * s * 0.85));
    }
    strokes.push({ points: ring, width: w * 1.2, t0: 0.1, t1: 0.7 });
    strokes.push(line(new THREE.Vector3(0, 1.2, 0), new THREE.Vector3(s * 0.85, 6.5, 0), 0.65, 1, w));
  }
  if (strokes.length === 0) return null;
  return buildLines(strokes);
}
