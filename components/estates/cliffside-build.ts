import * as THREE from "three";
import { buildLines } from "@/components/ocean/linework";

type Stroke = { points: THREE.Vector3[]; width: number; t0: number; t1: number };

export const CLIFF_VOLUMES = [
  { position: [0, 1.58, 2.4] as [number, number, number], size: [28, 3.05, 16] as [number, number, number] },
  { position: [-0.4, 4.72, 0.5] as [number, number, number], size: [21, 3.0, 12.5] as [number, number, number] },
  { position: [-1.2, 7.55, -0.7] as [number, number, number], size: [13.5, 2.55, 9.5] as [number, number, number] },
];

export const CLIFF_ROOFS = [
  { position: [0, 3.18, 2.4] as [number, number, number], size: [28.6, 0.2, 16.5] as [number, number, number] },
  { position: [-0.4, 6.28, 0.5] as [number, number, number], size: [21.5, 0.18, 12.9] as [number, number, number] },
  { position: [-1.2, 8.9, -0.7] as [number, number, number], size: [14, 0.16, 9.9] as [number, number, number] },
];

function boxEdges(cx: number, cy: number, cz: number, w: number, h: number, d: number, y0: number): Stroke[] {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const z0 = cz - d / 2;
  const z1 = cz + d / 2;
  const y = y0;
  const corners = [
    [x0, y, z0],
    [x1, y, z0],
    [x1, y, z1],
    [x0, y, z1],
  ];
  return corners.map((a, i) => {
    const b = corners[(i + 1) % corners.length];
    return {
      points: [new THREE.Vector3(a[0], a[1], a[2]), new THREE.Vector3(b[0], b[1], b[2])],
      width: 0.7,
      t0: 0.08,
      t1: 0.72,
    };
  });
}

function column(x: number, z: number, y0: number, y1: number, t0: number): Stroke {
  return {
    points: [new THREE.Vector3(x, y0, z), new THREE.Vector3(x, y1, z)],
    width: 0.85,
    t0,
    t1: Math.min(0.96, t0 + 0.34),
  };
}

function run(points: Array<[number, number, number]>, t0: number, t1: number, width = 0.9): Stroke {
  return {
    points: points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    width,
    t0,
    t1,
  };
}

export function buildRockFace(width: number, height: number) {
  const geo = new THREE.PlaneGeometry(width, height, 22, 10);
  geo.translate(0, height * 0.5 - 1.2, 0);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const rock = new THREE.Color("#5c554c");
  const dark = new THREE.Color("#2c2824");
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const wave = Math.sin(x * 0.31) * 0.9 + Math.sin(y * 0.72 + x * 0.2) * 0.45 + Math.sin(x * 1.3) * 0.18;
    pos.setZ(i, wave + y * 0.08);
    const shade = dark.clone().lerp(rock, 0.35 + (y / height) * 0.65);
    colors[i * 3] = shade.r;
    colors[i * 3 + 1] = shade.g;
    colors[i * 3 + 2] = shade.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

export function buildCliffsideLines() {
  const structure: Stroke[] = [];
  CLIFF_VOLUMES.forEach((volume, index) => {
    const [cx, cy, cz] = volume.position;
    const [w, h, d] = volume.size;
    const base = cy - h / 2;
    const top = cy + h / 2;
    structure.push(...boxEdges(cx, base + 0.08, cz, w, h, d, base + 0.08));
    structure.push(...boxEdges(cx, top, cz, w, h, d, top));
    const cols = [
      [cx - w / 2 + 0.4, cz - d / 2 + 0.4],
      [cx + w / 2 - 0.4, cz - d / 2 + 0.4],
      [cx + w / 2 - 0.4, cz + d / 2 - 0.4],
      [cx - w / 2 + 0.4, cz + d / 2 - 0.4],
      [cx, cz - d / 2 + 0.4],
      [cx, cz + d / 2 - 0.4],
    ];
    cols.forEach(([x, z], columnIndex) => {
      structure.push(column(x, z, 0.05, top, 0.18 + index * 0.12 + columnIndex * 0.03));
    });
  });

  const plumbing: Stroke[] = [
    run([[-11, 0.55, -5.5], [8, 0.55, -5.2], [8, 0.55, 2]], 0, 0.46, 1.05),
    run([[-2.2, 0.55, -5.2], [-2.2, 8.1, -1.2]], 0.32, 0.72, 1.05),
    run([[-2.2, 1.35, -5], [-2.2, 1.35, 6.5], [8, 1.35, 6.5]], 0.55, 0.92, 0.85),
    run([[-2.2, 4.45, -4], [6.5, 4.45, -1.5], [6.5, 4.45, 4]], 0.62, 1, 0.85),
    run([[-2.2, 7.3, -2.5], [3, 7.3, -0.5]], 0.74, 1, 0.8),
  ];

  const hvac: Stroke[] = [
    run([[-10, 2.85, -3.2], [9, 2.85, -3.2], [9, 2.85, 5.5]], 0, 0.58, 1.35),
    run([[-8, 5.85, -2.2], [7, 5.85, -2.2], [7, 5.85, 3.2]], 0.28, 0.78, 1.2),
    run([[6, 3.4, -4.2], [6, 5.85, -2.2]], 0.45, 0.7, 1.1),
    run([[-1, 8.55, -1.5], [4, 8.55, -0.4], [4, 5.85, -2.2]], 0.55, 1, 1),
  ];

  const electrical: Stroke[] = [
    run([[9.2, 1.15, -4.5], [9.2, 1.15, 5], [-9, 1.15, 5.4], [-9, 1.15, -4]], 0, 0.62, 0.7),
    run([[4.2, 0.9, -4], [4.2, 8.6, -0.6]], 0.34, 0.8, 0.7),
    run([[4.2, 4.2, -2], [-6, 4.2, 1.5]], 0.58, 0.9, 0.62),
    run([[4.2, 8.6, -0.6], [-2, 9.15, -0.7]], 0.72, 1, 0.62),
  ];

  return {
    structure: buildLines(structure),
    plumbing: buildLines(plumbing),
    hvac: buildLines(hvac),
    electrical: buildLines(electrical),
    flows: { plumbing, hvac, electrical },
  };
}

function pointOn(stroke: Stroke, t: number) {
  const points = stroke.points;
  const span = Math.max(1, points.length - 1);
  const f = Math.min(0.999, Math.max(0, t)) * span;
  const i = Math.min(points.length - 2, Math.floor(f));
  return points[i].clone().lerp(points[i + 1], f - i);
}

export function flowPositions(strokes: Stroke[], count: number) {
  const position = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const stroke = strokes[i % strokes.length];
    const t = (i * 0.37) % 1;
    const p = pointOn(stroke, t);
    position[i * 3] = p.x;
    position[i * 3 + 1] = p.y;
    position[i * 3 + 2] = p.z;
    seeds[i] = t;
  }
  return { position, seeds, strokes };
}

export function stepFlow(strokes: Stroke[], seeds: Float32Array, position: THREE.BufferAttribute, time: number, speed: number, draw: number) {
  for (let i = 0; i < seeds.length; i += 1) {
    const stroke = strokes[i % strokes.length];
    const span = Math.max(0.05, stroke.t1 - stroke.t0);
    const local = (seeds[i] + time * speed) % 1;
    const shown = stroke.t0 + local * span;
    if (shown > draw) {
      position.setXYZ(i, 0, -20, 0);
      continue;
    }
    const p = pointOn(stroke, local);
    position.setXYZ(i, p.x, p.y, p.z);
  }
  position.needsUpdate = true;
}

function box(w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  return mesh;
}

function cylinder(r: number, h: number, x: number, y: number, z: number, material: THREE.Material, axis: "y" | "z" = "y") {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 16), material);
  mesh.position.set(x, y, z);
  if (axis === "z") mesh.rotation.x = Math.PI / 2;
  return mesh;
}

export function buildCliffsidePlant() {
  const white = new THREE.MeshStandardMaterial({
    color: "#f4f1ea",
    roughness: 0.42,
    metalness: 0.08,
    emissive: "#fffaf2",
    emissiveIntensity: 0.8,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: "#d7b56a",
    roughness: 0.35,
    metalness: 0.4,
    emissive: "#ffd56a",
    emissiveIntensity: 0.95,
  });
  const silver = new THREE.MeshStandardMaterial({
    color: "#d5dbe2",
    roughness: 0.28,
    metalness: 0.72,
    emissive: "#f4f7fb",
    emissiveIntensity: 0.28,
  });
  const cell = new THREE.MeshStandardMaterial({
    color: "#102033",
    roughness: 0.4,
    metalness: 0.5,
    emissive: "#16324a",
    emissiveIntensity: 0.35,
  });
  const green = new THREE.MeshStandardMaterial({
    color: "#1d6a42",
    roughness: 0.86,
    metalness: 0,
    emissive: "#3dce78",
    emissiveIntensity: 0.85,
  });

  const root = new THREE.Group();
  const roofs = new THREE.Group();
  roofs.name = "roofs";
  for (const roof of CLIFF_ROOFS) {
    roofs.add(box(roof.size[0], roof.size[1], roof.size[2], roof.position[0], roof.position[1], roof.position[2], green));
  }
  root.add(roofs);

  const plant = new THREE.Group();
  plant.name = "plant";
  const chiller = new THREE.Group();
  chiller.add(box(3.2, 0.35, 1.6, 0, 0.2, 0, gold));
  chiller.add(cylinder(0.55, 1.5, -0.7, 1.05, 0, white));
  chiller.add(cylinder(0.55, 1.5, 0.7, 1.05, 0, white));
  chiller.add(cylinder(0.58, 0.08, -0.7, 1.55, 0, gold));
  chiller.add(cylinder(0.58, 0.08, 0.7, 1.55, 0, gold));
  chiller.position.set(9.2, 0, -6.4);
  plant.add(chiller);

  const ahu = new THREE.Group();
  ahu.add(box(3.4, 1.5, 1.7, 0, 0.75, 0, white));
  ahu.add(box(3.5, 0.08, 1.78, 0, 1.5, 0, gold));
  ahu.add(box(0.9, 0.7, 0.7, 1.9, 0.7, 0, silver));
  ahu.position.set(5.6, 3.25, -4.3);
  plant.add(ahu);

  const pumps = new THREE.Group();
  pumps.add(box(2.4, 0.18, 1.1, 0, 0.1, 0, gold));
  pumps.add(cylinder(0.28, 1.1, -0.45, 0.38, 0, silver, "z"));
  pumps.add(cylinder(0.28, 1.1, 0.5, 0.38, 0, silver, "z"));
  pumps.position.set(-6.2, 0, -3.4);
  plant.add(pumps);

  const generator = new THREE.Group();
  generator.add(box(2.6, 1.35, 1.25, 0, 0.7, 0, white));
  generator.add(box(2.7, 0.1, 1.35, 0, 0.12, 0, gold));
  generator.add(box(0.18, 0.7, 1.26, 0.9, 0.85, 0, gold));
  generator.position.set(10.4, 0, -3.1);
  plant.add(generator);

  const tanks = new THREE.Group();
  tanks.add(cylinder(0.85, 2.3, -0.95, 1.15, 0, white));
  tanks.add(cylinder(0.7, 1.8, 0.85, 0.9, 0, white));
  tanks.add(cylinder(0.9, 0.08, -0.95, 2.15, 0, gold));
  tanks.add(cylinder(0.74, 0.08, 0.85, 1.7, 0, gold));
  tanks.position.set(-10.4, 0, -5.6);
  plant.add(tanks);

  const solar = new THREE.Group();
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const panel = box(1.15, 0.06, 0.7, (col - 2) * 1.35, 0, (row - 1) * 0.9, cell);
      panel.add(box(1.15, 0.02, 0.03, 0, 0.04, 0, gold));
      solar.add(panel);
    }
  }
  solar.position.set(-1.2, 9.05, -0.7);
  plant.add(solar);

  root.add(plant);
  return root;
}
