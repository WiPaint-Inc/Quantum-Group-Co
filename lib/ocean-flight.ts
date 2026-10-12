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

type Key = { p: number; pos: Vec3; look: Vec3 };

/**
 * Metres. Cruise sits near 280 m and each approach descends toward 130 m,
 * inside the 120–300 m aerial band. The keys swing the heading: day on a
 * southwest leg, a turn onto the sunset azimuth, night, then a turn into dawn.
 */
const KEYS: Key[] = [
  { p: 0, pos: [420, 285, 2680], look: [-250, 30, 1500] },
  { p: 0.06, pos: [40, 250, 1450], look: [-700, 18, 400] },
  { p: 0.125, pos: [-480, 148, 460], look: [-900, 6, 20] },
  { p: 0.16, pos: [-700, 128, 160], look: [-920, 4, -20] },
  { p: 0.21, pos: [120, 275, -420], look: [800, 24, -1100] },
  { p: 0.25, pos: [760, 142, -1180], look: [1080, 6, -1480] },
  { p: 0.32, pos: [480, 255, -2000], look: [-100, 16, -2600] },
  { p: 0.375, pos: [-180, 136, -2620], look: [-520, 5, -2920] },
  { p: 0.44, pos: [180, 240, -3600], look: [-700, 10, -4200] },
  { p: 0.5, pos: [-620, 132, -4120], look: [-1360, 4, -4480] },
  { p: 0.56, pos: [-900, 268, -5300], look: [-300, 12, -6100] },
  { p: 0.625, pos: [-280, 140, -6000], look: [-160, 4, -6480] },
  { p: 0.7, pos: [360, 280, -7200], look: [900, 18, -7900] },
  { p: 0.75, pos: [720, 134, -7780], look: [980, 5, -8160] },
  { p: 0.86, pos: [280, 245, -9200], look: [900, 16, -10400] },
  { p: 0.94, pos: [520, 128, -10240], look: [1260, 4, -10940] },
  { p: 1, pos: [860, 160, -10820], look: [1400, 12, -11600] },
];

const HEX: Record<string, Vec3> = {
  morningH: hex("#e7c4a4"),
  morningZ: hex("#3f7eae"),
  dayH: hex("#8eafc4"),
  dayZ: hex("#1a5c96"),
  sunsetH: hex("#e07a3a"),
  sunsetZ: hex("#1c2c44"),
  nightH: hex("#0c1524"),
  nightZ: hex("#03060e"),
  dawnH: hex("#f0b89a"),
  dawnZ: hex("#5d86a8"),
};

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

function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function lerpAngle(a: number, b: number, t: number) {
  const delta = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + delta * t;
}

function mix4(keys: Array<{ at: number; color: Vec3 }>, t: number): Vec3 {
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].at) i += 1;
  const a = keys[i];
  const b = keys[i + 1];
  const span = Math.max(0.0001, b.at - a.at);
  return lerp3(a.color, b.color, smooth((t - a.at) / span));
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

function poseAt(progress: number) {
  const p = clamp01(progress);
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i += 1;
  const span = Math.max(0.0001, KEYS[i + 1].p - KEYS[i].p);
  const t = smooth((p - KEYS[i].p) / span);
  const i0 = Math.max(0, i - 1);
  const i3 = Math.min(KEYS.length - 1, i + 2);
  const pos = catmull(KEYS[i0].pos, KEYS[i].pos, KEYS[i + 1].pos, KEYS[i3].pos, t);
  const look = catmull(KEYS[i0].look, KEYS[i].look, KEYS[i + 1].look, KEYS[i3].look, t);
  pos[1] = clamp(pos[1], 120, 300);
  return { pos, look };
}

function headingOf(pos: Vec3, look: Vec3) {
  return Math.atan2(look[0] - pos[0], look[2] - pos[2]);
}

const DAWN_AZ = headingOf(KEYS[15].pos, KEYS[15].look);
const NIGHT_AZ = headingOf(KEYS[11].pos, KEYS[11].look);

function direction(azimuth: number, elevation: number): Vec3 {
  const c = Math.cos(elevation);
  return [Math.sin(azimuth) * c, Math.sin(elevation), Math.cos(azimuth) * c];
}

function light(phase: number): Pick<FlightSample, "night" | "sun" | "moon" | "horizon" | "zenith" | "sunColor"> {
  const p = clamp01(phase);
  const horizon = mix4(
    [
      { at: 0, color: HEX.morningH },
      { at: 0.18, color: HEX.dayH },
      { at: 0.42, color: HEX.sunsetH },
      { at: 0.6, color: HEX.nightH },
      { at: 0.82, color: HEX.nightH },
      { at: 1, color: HEX.dawnH },
    ],
    p,
  );
  const zenith = mix4(
    [
      { at: 0, color: HEX.morningZ },
      { at: 0.18, color: HEX.dayZ },
      { at: 0.42, color: HEX.sunsetZ },
      { at: 0.6, color: HEX.nightZ },
      { at: 0.82, color: HEX.nightZ },
      { at: 1, color: HEX.dawnZ },
    ],
    p,
  );
  const night = smooth((p - 0.46) / 0.05) * (1 - smooth((p - 0.84) / 0.1));
  const sunsetPose = poseAt(0.44);
  const sunsetAz = headingOf(sunsetPose.pos, sunsetPose.look);
  const towardSunset = smooth((p - 0.28) / 0.12);
  const dawnBlend = smooth((p - 0.8) / 0.12);
  const azimuth = lerpAngle(lerpAngle(sunsetAz + 1.65, sunsetAz, towardSunset), DAWN_AZ, dawnBlend);
  const dayElev = lerp(0.48, 0.78, smooth(p / 0.18));
  const elev = lerp(lerp(dayElev, 0.055, towardSunset), -0.42, smooth((p - 0.46) / 0.05));
  const elevDawn = lerp(elev, 0.16, dawnBlend);
  const sunColor = mix4(
    [
      { at: 0, color: hex("#ffe0b0") },
      { at: 0.22, color: hex("#fff6e4") },
      { at: 0.46, color: hex("#ff7a32") },
      { at: 0.66, color: hex("#9eb4d8") },
      { at: 1, color: hex("#ffd0b4") },
    ],
    p,
  );
  return {
    night,
    sun: direction(azimuth, elevDawn),
    moon: direction(NIGHT_AZ, 0.38),
    horizon,
    zenith,
    sunColor,
  };
}

export function sampleFlight(progress: number): FlightSample {
  const p = clamp01(progress);
  const now = poseAt(p);
  const ahead = poseAt(Math.min(1, p + 0.016));
  let turn = headingOf(ahead.pos, ahead.look) - headingOf(now.pos, now.look);
  turn = Math.atan2(Math.sin(turn), Math.cos(turn));
  const bank = clamp(-turn * 4.2, -0.12, 0.12);
  return { pos: now.pos, look: now.look, bank, phase: p, ...light(p) };
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
  { id: "cay-a", short: "", tag: "", title: "", line: "", href: "/", cta: "", kind: "arrival", size: "cay", x: -1680, z: 480 },
  { id: "cay-b", short: "", tag: "", title: "", line: "", href: "/", cta: "", kind: "arrival", size: "cay", x: 720, z: -280 },
  { id: "cay-c", short: "", tag: "", title: "", line: "", href: "/", cta: "", kind: "arrival", size: "mid", x: -1900, z: -1900 },
  { id: "cay-d", short: "", tag: "", title: "", line: "", href: "/", cta: "", kind: "arrival", size: "cay", x: 1760, z: -2500 },
  { id: "cay-e", short: "", tag: "", title: "", line: "", href: "/", cta: "", kind: "arrival", size: "cay", x: -2100, z: -5300 },
  { id: "cay-f", short: "", tag: "", title: "", line: "", href: "/", cta: "", kind: "arrival", size: "cay", x: 420, z: -5000 },
  { id: "cay-g", short: "", tag: "", title: "", line: "", href: "/", cta: "", kind: "arrival", size: "cay", x: -1100, z: -8600 },
];
