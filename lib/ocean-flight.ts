import { oceanStops, type OceanStop } from "@/content/ocean-stops";

export type Vec3 = [number, number, number];

export type FlightSample = {
  pos: Vec3;
  look: Vec3;
  /** Radians, right wing down when positive. */
  bank: number;
  /** 0 morning, through day, sunset, night, and back to dawn. */
  phase: number;
  night: number;
  sun: Vec3;
  moon: Vec3;
  horizon: Vec3;
  zenith: Vec3;
  sunColor: Vec3;
};

type View = { bearing: number; distance: number; height: number; orbit: number; lookAhead: number };
type LightKey = { elev: number; az: number; night: number };

/**
 * Bearings are degrees. Height is the island approach, about 60–160 m.
 * The cruise between islands is lifted to about 285 m. The sun azimuth is
 * world-fixed and only interpolated between these keys, so a turn changes
 * how the light sits in the view.
 */
const VIEWS: Record<string, View> = {
  "design-build": { bearing: 40, distance: 640, height: 150, orbit: 10, lookAhead: 0.62 },
  plans: { bearing: 70, distance: 430, height: 118, orbit: 10, lookAhead: 0.58 },
  construction: { bearing: 86, distance: 390, height: 72, orbit: 8, lookAhead: 0.78 },
  engineering: { bearing: 315, distance: 460, height: 120, orbit: 10, lookAhead: 0.55 },
  developments: { bearing: 250, distance: 1680, height: 155, orbit: 6, lookAhead: 0.42 },
  materials: { bearing: 330, distance: 400, height: 116, orbit: 10, lookAhead: 0.58 },
  "build-live": { bearing: 240, distance: 140, height: 64, orbit: 12, lookAhead: 0.4 },
};

const LIGHTS: LightKey[] = [
  { elev: 38, az: 200, night: 0 },
  { elev: 26, az: 215, night: 0 },
  { elev: 9, az: 248, night: 0 },
  { elev: 1.2, az: 266, night: 0.04 },
  { elev: -10, az: 285, night: 0.9 },
  { elev: -18, az: 330, night: 1 },
  { elev: -18, az: 380, night: 1 },
  { elev: -4, az: 440, night: 0.42 },
  { elev: 2.8, az: 471, night: 0 },
];

const HEX: Record<string, Vec3> = {
  dayH: hex("#8eafc4"),
  dayZ: hex("#1a5c96"),
  sunsetH: hex("#e07a3a"),
  sunsetZ: hex("#1c2c44"),
  nightH: hex("#24344f"),
  nightZ: hex("#121a2c"),
  dawnH: hex("#f8c4a0"),
  dawnZ: hex("#e79aaf"),
};

const DW = 0.17;
const N = oceanStops.length;
/** World-fixed. It does not follow the camera. */
const MOON = direction((100 * Math.PI) / 180, 0.42);

function hex(value: string): Vec3 {
  const n = Number.parseInt(value.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clamp01(value: number) {
  return clamp(value, 0, 1);
}

function smooth(t: number) {
  const u = clamp01(t);
  return u * u * (3 - 2 * u);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function scale(a: Vec3, t: number): Vec3 {
  return [a[0] * t, a[1] * t, a[2] * t];
}

function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function length(a: Vec3) {
  return Math.hypot(a[0], a[1], a[2]);
}

function norm(a: Vec3): Vec3 {
  const span = Math.max(1e-4, length(a));
  return [a[0] / span, a[1] / span, a[2] / span];
}

function direction(azimuth: number, elevation: number): Vec3 {
  const c = Math.cos(elevation);
  return [Math.sin(azimuth) * c, Math.sin(elevation), Math.cos(azimuth) * c];
}

function bez(a: Vec3, b: Vec3, c: Vec3, d: Vec3, t: number): Vec3 {
  const u = 1 - t;
  return add(add(add(scale(a, u * u * u), scale(b, 3 * u * u * t)), scale(c, 3 * u * t * t)), scale(d, t * t * t));
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

function viewPose(index: number, orbit: number): { pos: Vec3; look: Vec3 } {
  const stop = oceanStops[index];
  if (stop.id === "arrival") {
    return {
      pos: [420 - orbit * 25, 278 - orbit * 6, 980 - orbit * 70],
      look: [40, 6, -260],
    };
  }
  const view = VIEWS[stop.id];
  const bearing = ((view.bearing + orbit * view.orbit) * Math.PI) / 180;
  const height = view.height * (1.06 - 0.06 * orbit);
  const ahead = view.lookAhead * view.distance;
  return {
    pos: [stop.x + Math.sin(bearing) * view.distance, height, stop.z + Math.cos(bearing) * view.distance],
    look: [stop.x - Math.sin(bearing) * ahead, 3 + view.height * 0.02, stop.z - Math.cos(bearing) * ahead],
  };
}

/** Sunrise azimuth. Local +Z on the meeting cay points at the sun. */
export const contactYaw = (111 * Math.PI) / 180;

function contactPoint(localX: number, y: number, localZ: number): Vec3 {
  const cay = oceanStops.find((stop) => stop.id === "contact");
  const x = cay?.x ?? 0;
  const z = cay?.z ?? 0;
  return [
    x + localX * Math.cos(contactYaw) + localZ * Math.sin(contactYaw),
    y,
    z - localX * Math.sin(contactYaw) + localZ * Math.cos(contactYaw),
  ];
}

/** One spline from the previous island down to eye level on the meeting cay. */
function finalePose(u: number): { pos: Vec3; look: Vec3 } {
  const depart = viewPose(oceanStops.findIndex((stop) => stop.id === "build-live"), 1);
  const keys: Array<{ p: number; pos: Vec3; look: Vec3 }> = [
    { p: 0, pos: depart.pos, look: depart.look },
    { p: 0.2, pos: contactPoint(0, 240, -90), look: contactPoint(0, 6, 8) },
    { p: 0.46, pos: contactPoint(-8, 62, -32), look: contactPoint(0, 1.6, 10) },
    { p: 0.7, pos: contactPoint(0, 16, -14), look: contactPoint(0, 1.35, 18) },
    { p: 0.86, pos: contactPoint(0, 2.6, -6.2), look: contactPoint(0, 1.28, 22) },
    { p: 1, pos: contactPoint(0, 1.55, -3.6), look: contactPoint(0, 1.2, 26) },
  ];
  const p = clamp01(u);
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1].p) i += 1;
  const span = Math.max(0.0001, keys[i + 1].p - keys[i].p);
  const t = (p - keys[i].p) / span;
  const i0 = Math.max(0, i - 1);
  const i3 = Math.min(keys.length - 1, i + 2);
  return {
    pos: catmull(keys[i0].pos, keys[i].pos, keys[i + 1].pos, keys[i3].pos, t),
    look: catmull(keys[i0].look, keys[i].look, keys[i + 1].look, keys[i3].look, t),
  };
}

function camAt(progressStops: number): { pos: Vec3; look: Vec3 } {
  const k = clamp(Math.floor(progressStops), 0, N - 1);
  const f = progressStops - k;
  if (k >= N - 1) return finalePose(1);
  if (k === N - 2) {
    if (f <= DW) return viewPose(k, f / DW);
    return finalePose((f - DW) / (1 - DW));
  }
  if (f <= DW) return viewPose(k, f / DW);
  if (f >= 1 - DW) return viewPose(k + 1, (f - 1) / DW);
  const tl = (f - DW) / (1 - 2 * DW);
  const te = tl * tl * tl * (tl * (tl * 6 - 15) + 10);
  const t = tl * 0.25 + te * 0.75;
  const start = viewPose(k, 1);
  const startBack = viewPose(k, 0.92);
  const end = viewPose(k + 1, -1);
  const endForward = viewPose(k + 1, -0.92);
  const span = length(sub(end.pos, start.pos));
  const dir = norm(sub(end.pos, start.pos));
  const out = scale(norm(add(scale(norm(sub(start.pos, startBack.pos)), 0.6), dir)), span * 0.38);
  const into = scale(norm(add(scale(norm(sub(endForward.pos, end.pos)), 0.6), dir)), span * 0.38);
  const c1 = add(start.pos, out);
  const c2 = sub(end.pos, into);
  const pos = bez(start.pos, c1, c2, end.pos, t);
  pos[1] += Math.sin(Math.PI * t) * Math.max(0, 285 - (start.pos[1] + end.pos[1]) / 2);
  const next = bez(start.pos, c1, c2, end.pos, Math.min(1, t + 0.01));
  const tangent = norm([next[0] - pos[0], 0, next[2] - pos[2]]);
  const cruiseLook: Vec3 = [pos[0] + tangent[0] * 1100, 0, pos[2] + tangent[2] * 1100];
  const eased = t * t * (3 - 2 * t);
  const look = lerp3(lerp3(start.look, end.look, eased), cruiseLook, Math.pow(Math.sin(Math.PI * t), 1.5) * 0.8);
  pos[1] = clamp(pos[1], 55, 310);
  return { pos, look };
}

function headingOf(pos: Vec3, look: Vec3) {
  return Math.atan2(look[0] - pos[0], look[2] - pos[2]);
}

function lightAt(progressStops: number): Pick<FlightSample, "night" | "sun" | "moon" | "horizon" | "zenith" | "sunColor"> {
  const k = clamp(Math.floor(progressStops), 0, N - 2);
  const f = smooth(progressStops - k);
  const a = LIGHTS[k];
  const b = LIGHTS[Math.min(N - 1, k + 1)];
  const elev = lerp(a.elev, b.elev, f);
  const az = lerp(a.az, b.az, f);
  const night = lerp(a.night, b.night, f);
  const sunset = (1 - night) * smooth((14 - elev) / 14) * (1 - smooth((elev + 2) / 6));
  const dawn = (1 - night) * smooth((elev + 1) / 6) * smooth((az - 420) / 40);
  let horizon = lerp3(HEX.dayH, HEX.nightH, night);
  let zenith = lerp3(HEX.dayZ, HEX.nightZ, night);
  horizon = lerp3(horizon, HEX.sunsetH, sunset);
  zenith = lerp3(zenith, HEX.sunsetZ, sunset * 0.75);
  horizon = lerp3(horizon, HEX.dawnH, dawn);
  zenith = lerp3(zenith, HEX.dawnZ, dawn);
  const sunColor = lerp3(
    lerp3(hex("#fff4dd"), hex("#ff7a32"), sunset),
    hex("#ffc98a"),
    dawn,
  );
  return {
    night,
    sun: direction((az * Math.PI) / 180, (elev * Math.PI) / 180),
    moon: MOON,
    horizon,
    zenith,
    sunColor: night > 0.5 ? lerp3(sunColor, hex("#b7c6de"), night) : sunColor,
  };
}

/** 0 through the journey, then 0–1 on the final descent after the build-live dwell. */
export function finaleBlend(progress: number) {
  const live = oceanStops.findIndex((stop) => stop.id === "build-live");
  if (live < 0) return 0;
  const f = clamp01(progress) * (N - 1) - live;
  if (f <= DW) return 0;
  return clamp01((f - DW) / (1 - DW));
}

/** Contact card. It stays hidden through the descent and fades in as the camera settles. */
export function contactReveal(progress: number) {
  return smooth(clamp01((finaleBlend(progress) - 0.78) / 0.22));
}

export function sampleFlight(progress: number): FlightSample {
  const p = clamp01(progress);
  const stops = p * (N - 1);
  const now = camAt(stops);
  const ahead = camAt(Math.min(N - 1, stops + 0.02));
  let turn = headingOf(ahead.pos, ahead.look) - headingOf(now.pos, now.look);
  turn = Math.atan2(Math.sin(turn), Math.cos(turn));
  const bank = clamp(-turn * 1.2, -0.13, 0.13) * (1 - smooth(finaleBlend(p)));
  return { pos: now.pos, look: now.look, bank, phase: p, ...lightAt(stops) };
}

export function stopProgress(index: number) {
  return index / Math.max(1, oceanStops.length - 1);
}

export function nearestStop(progress: number) {
  const scaled = clamp01(progress) * (oceanStops.length - 1);
  return Math.round(scaled);
}

export function stopPresence(progress: number, index: number) {
  const distance = Math.abs(clamp01(progress) - stopProgress(index));
  return 1 - smooth(distance / 0.045);
}

export function drawAmount(progress: number, index: number) {
  const center = stopProgress(index);
  if (progress >= center) return 1;
  return smooth((progress - (center - 0.055)) / 0.055);
}

export const scenicCays: OceanStop[] = [
  { id: "cay-a", short: "", tag: "", title: "", line: "", href: "/", cta: "", kind: "arrival", size: "bar", x: 200, z: 1400 },
  { id: "cay-b", short: "", tag: "", title: "", line: "", href: "/", cta: "", kind: "arrival", size: "cay", x: -1600, z: 900 },
  { id: "cay-c", short: "", tag: "", title: "", line: "", href: "/", cta: "", kind: "arrival", size: "bar", x: 1400, z: 400 },
  { id: "cay-d", short: "", tag: "", title: "", line: "", href: "/", cta: "", kind: "arrival", size: "cay", x: -4200, z: -800 },
  { id: "cay-e", short: "", tag: "", title: "", line: "", href: "/", cta: "", kind: "arrival", size: "bar", x: 400, z: -3800 },
  { id: "cay-f", short: "", tag: "", title: "", line: "", href: "/", cta: "", kind: "arrival", size: "cay", x: 3600, z: -1800 },
  { id: "cay-g", short: "", tag: "", title: "", line: "", href: "/", cta: "", kind: "arrival", size: "cay", x: -1200, z: -3400 },
];
