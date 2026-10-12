export type VillaPhase = "blueprint" | "structure" | "finished" | "interior";

export type Vec3 = [number, number, number];

export type VillaPose = {
  pos: Vec3;
  look: Vec3;
  /** 0–1 draw for the line assembly. */
  draw: number;
};

type Key = { p: number; pos: Vec3; look: Vec3 };

/** Metres. The path starts outside the pavilion and ends inside it. */
const KEYS: Key[] = [
  { p: 0, pos: [16, 10, 18], look: [0, 1.6, 0] },
  { p: 0.18, pos: [9, 5.2, 12], look: [0, 1.5, 0] },
  { p: 0.38, pos: [5.5, 3.1, 9], look: [0, 1.55, -0.4] },
  { p: 0.58, pos: [2.6, 1.85, 7.4], look: [0, 1.5, -0.8] },
  { p: 0.78, pos: [0.2, 1.62, 5.4], look: [0, 1.45, -0.6] },
  { p: 1, pos: [0, 1.55, 1.15], look: [0, 1.35, -2.6] },
];

const PHASE_AT: Record<VillaPhase, number> = {
  blueprint: 0.12,
  structure: 0.36,
  finished: 0.6,
  interior: 0.92,
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smooth(t: number) {
  const u = clamp01(t);
  return u * u * (3 - 2 * u);
}

function catmull(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
  const t2 = t * t;
  const t3 = t2 * t;
  const out: Vec3 = [0, 0, 0];
  for (let i = 0; i < 3; i += 1) {
    out[i] = 0.5 * (
      2 * p1[i]
      + (-p0[i] + p2[i]) * t
      + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2
      + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3
    );
  }
  return out;
}

export function phaseWeight(progress: number, phase: VillaPhase) {
  const p = clamp01(progress);
  if (phase === "blueprint") return smooth(p / 0.1) * (1 - smooth((p - 0.28) / 0.16));
  if (phase === "structure") return smooth((p - 0.2) / 0.12) * (1 - smooth((p - 0.48) / 0.16));
  if (phase === "finished") return smooth((p - 0.4) / 0.14);
  return smooth((p - 0.72) / 0.14);
}

export function dominantPhase(progress: number): VillaPhase {
  const p = clamp01(progress);
  if (p < 0.28) return "blueprint";
  if (p < 0.5) return "structure";
  if (p < 0.78) return "finished";
  return "interior";
}

export function phaseProgress(phase: VillaPhase) {
  return PHASE_AT[phase];
}

export function sampleVilla(progress: number): VillaPose {
  const p = clamp01(progress);
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i += 1;
  const span = Math.max(0.0001, KEYS[i + 1].p - KEYS[i].p);
  const t = smooth((p - KEYS[i].p) / span);
  const i0 = Math.max(0, i - 1);
  const i3 = Math.min(KEYS.length - 1, i + 2);
  return {
    pos: catmull(KEYS[i0].pos, KEYS[i].pos, KEYS[i + 1].pos, KEYS[i3].pos, t),
    look: catmull(KEYS[i0].look, KEYS[i].look, KEYS[i + 1].look, KEYS[i3].look, t),
    draw: smooth(p / 0.14),
  };
}
