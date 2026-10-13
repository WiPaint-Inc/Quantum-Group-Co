import * as THREE from "three";

type Stroke = { points: THREE.Vector3[]; width: number; t0: number; t1: number };

function pushSegment(target: Stroke[], a: THREE.Vector3, b: THREE.Vector3, width: number, t0: number, t1: number) {
  target.push({ points: [a, b], width, t0, t1 });
}

export function buildVillaLines(strokes: Stroke[]) {
  const positions: number[] = [];
  const ts: number[] = [];
  const sides: number[] = [];
  const side = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  for (const stroke of strokes) {
    const points = stroke.points;
    for (let i = 0; i < points.length - 1; i += 1) {
      const a = points[i];
      const b = points[i + 1];
      const dir = b.clone().sub(a);
      const len = dir.length();
      if (len < 1e-4) continue;
      dir.multiplyScalar(1 / len);
      side.crossVectors(dir, up);
      if (side.lengthSq() < 1e-5) side.set(0, 0, 1);
      side.normalize().multiplyScalar(stroke.width * 0.5);
      const ta = THREE.MathUtils.lerp(stroke.t0, stroke.t1, i / (points.length - 1));
      const tb = THREE.MathUtils.lerp(stroke.t0, stroke.t1, (i + 1) / (points.length - 1));
      const corners = [a.clone().sub(side), a.clone().add(side), b.clone().add(side), a.clone().sub(side), b.clone().add(side), b.clone().sub(side)];
      const cornerT = [ta, ta, tb, ta, tb, tb];
      const cornerS = [-1, 1, 1, -1, 1, -1];
      for (let k = 0; k < 6; k += 1) {
        positions.push(corners[k].x, corners[k].y, corners[k].z);
        ts.push(cornerT[k]);
        sides.push(cornerS[k]);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("aT", new THREE.Float32BufferAttribute(ts, 1));
  geo.setAttribute("aSide", new THREE.Float32BufferAttribute(sides, 1));
  return geo;
}

export function placeholderBlueprint() {
  const strokes: Stroke[] = [];
  const w = 0.035;
  const plan: Array<[number, number, number, number, number, number]> = [
    [-7, 0.04, -4, 7, 0.04, -4],
    [7, 0.04, -4, 7, 0.04, 4],
    [7, 0.04, 4, -7, 0.04, 4],
    [-7, 0.04, 4, -7, 0.04, -4],
    [-7, 0.04, 0, 7, 0.04, 0],
    [0, 0.04, -4, 0, 0.04, 4],
  ];
  plan.forEach((seg, index) => {
    const t0 = index * 0.04;
    pushSegment(strokes, new THREE.Vector3(seg[0], seg[1], seg[2]), new THREE.Vector3(seg[3], seg[4], seg[5]), w, t0, t0 + 0.08);
  });
  const columns = [-6.2, -2.1, 2.1, 6.2];
  columns.forEach((x, index) => {
    for (const z of [-3.2, 3.2]) {
      const t0 = 0.28 + index * 0.04;
      pushSegment(strokes, new THREE.Vector3(x, 0.04, z), new THREE.Vector3(x, 3.35, z), w * 0.8, t0, t0 + 0.1);
    }
  });
  pushSegment(strokes, new THREE.Vector3(-7.2, 3.35, -4.2), new THREE.Vector3(7.2, 3.35, -4.2), w, 0.55, 0.68);
  pushSegment(strokes, new THREE.Vector3(7.2, 3.35, -4.2), new THREE.Vector3(7.2, 3.35, 4.2), w, 0.64, 0.74);
  pushSegment(strokes, new THREE.Vector3(7.2, 3.35, 4.2), new THREE.Vector3(-7.2, 3.35, 4.2), w, 0.7, 0.8);
  pushSegment(strokes, new THREE.Vector3(-7.2, 3.35, 4.2), new THREE.Vector3(-7.2, 3.35, -4.2), w, 0.76, 0.86);
  pushSegment(strokes, new THREE.Vector3(-7, 0.04, -4), new THREE.Vector3(-7, 3.35, -4), w * 0.7, 0.82, 0.92);
  pushSegment(strokes, new THREE.Vector3(7, 0.04, -4), new THREE.Vector3(7, 3.35, -4), w * 0.7, 0.86, 0.96);
  return buildVillaLines(strokes);
}

export const lineVertex = /* glsl */ `
  in float aT;
  in float aSide;
  out float vT;
  out float vSide;
  void main() {
    vT = aT;
    vSide = aSide;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const lineFragment = /* glsl */ `
  uniform float uDraw;
  in float vT;
  in float vSide;
  out vec4 fragColor;
  void main() {
    float shown = smoothstep(vT - 0.02, vT + 0.008, uDraw);
    if (shown < 0.02) discard;
    float edge = pow(1.0 - smoothstep(0.2, 1.0, abs(vSide)), 1.2);
    float head = exp(-pow((vT - uDraw) * 28.0, 2.0));
    vec3 col = vec3(0.93, 0.82, 0.55) * (0.85 + head * 1.6);
    fragColor = vec4(col, edge * max(shown, head) * 0.95);
  }
`;
