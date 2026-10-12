import { oceanStops, type OceanStop } from "@/content/ocean-stops";
import { getEstateCameraPath, type EstateCameraFrame } from "@/lib/estate-drop";
import { journeyPath } from "@/src/journey/path";

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

/** Authored in src/journey/path.ts. Bearings are degrees. The cruise lifts toward cruiseAltitude. */
const VIEWS = journeyPath.camera.approaches as Record<string, View>;
const LIGHTS = journeyPath.sun as readonly LightKey[];

const HEX: Record<string, Vec3> = {
  dayH: hex(journeyPath.sky.dayHorizon),
  dayZ: hex(journeyPath.sky.dayZenith),
  sunsetH: hex(journeyPath.sky.sunsetHorizon),
  sunsetZ: hex(journeyPath.sky.sunsetZenith),
  nightH: hex(journeyPath.sky.nightHorizon),
  nightZ: hex(journeyPath.sky.nightZenith),
  dawnH: hex(journeyPath.sky.dawnHorizon),
  dawnZ: hex(journeyPath.sky.dawnZenith),
};

const DW = journeyPath.timing.dwell;
const N = oceanStops.length;
/** World-fixed. It does not follow the camera. */
const MOON = direction((journeyPath.sky.moonAzimuth * Math.PI) / 180, journeyPath.sky.moonElevation);

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

/** The materials ship steams this heading. Local +Z is the bow. */
export const SHIP_HEADING = (journeyPath.ship.headingDeg * Math.PI) / 180;
export const SHIP_SPEED = journeyPath.ship.speedMetresPerSecond;
export const SHIP_LENGTH = journeyPath.ship.length;

export function shipMotion(time: number) {
  const along = time * SHIP_SPEED;
  return {
    dx: Math.sin(SHIP_HEADING) * along,
    dz: Math.cos(SHIP_HEADING) * along,
    heading: SHIP_HEADING,
    pitch: Math.sin(time * 0.33) * 0.012,
    roll: Math.sin(time * 0.46 + 1.1) * 0.02,
  };
}

/** 1 while the camera rides with the ship, then falls away on the peel. */
export function shipTrack(progress: number) {
  const index = oceanStops.findIndex((stop) => stop.id === "materials");
  if (index < 0) return 0;
  const f = clamp01(progress) * (N - 1) - index;
  if (f < -0.28 || f > 0.52) return 0;
  if (f < -0.08) return smooth((f + 0.28) / 0.2);
  if (f <= DW) return 1;
  return 1 - smooth((f - DW) / 0.28);
}

type FlyShot = { back: number; height: number; side: number; lookHeight: number };
type FlyIn = {
  bearing: number;
  shore: number;
  side: number;
  base: number;
  rest: FlyShot;
  close: FlyShot;
};

export function estateAnchor(stopId: string) {
  const fly = (journeyPath.camera.estateFlyIn as Record<string, FlyIn>)[stopId];
  const stop = oceanStops.find((item) => item.id === stopId);
  if (!fly || !stop) return null;
  const bearing = (fly.bearing * Math.PI) / 180;
  const rightX = Math.cos(bearing);
  const rightZ = -Math.sin(bearing);
  return {
    x: stop.x + Math.sin(bearing) * fly.shore + rightX * fly.side,
    y: fly.base,
    z: stop.z + Math.cos(bearing) * fly.shore + rightZ * fly.side,
    bearing,
    fly,
  };
}

/** Local estate metres (sea on +Z) into world metres. */
export function estateWorld(stopId: string, local: Vec3): Vec3 | null {
  const anchor = estateAnchor(stopId);
  if (!anchor) return null;
  const c = Math.cos(anchor.bearing);
  const s = Math.sin(anchor.bearing);
  return [
    anchor.x + local[0] * c + local[2] * s,
    anchor.y + local[1],
    anchor.z - local[0] * s + local[2] * c,
  ];
}

function approachPose(stop: OceanStop, orbit: number): { pos: Vec3; look: Vec3 } {
  const view = VIEWS[stop.id];
  const bearing = ((view.bearing + orbit * view.orbit) * Math.PI) / 180;
  const height = view.height * (1.06 - 0.06 * orbit);
  const ahead = view.lookAhead * view.distance;
  return {
    pos: [stop.x + Math.sin(bearing) * view.distance, height, stop.z + Math.cos(bearing) * view.distance],
    look: [stop.x - Math.sin(bearing) * ahead, 3 + height * 0.02, stop.z - Math.cos(bearing) * ahead],
  };
}

function estateShot(stopId: string, shot: FlyShot): { pos: Vec3; look: Vec3 } {
  const anchor = estateAnchor(stopId);
  if (!anchor) return { pos: [0, 0, 0], look: [0, 0, 0] };
  const s = Math.sin(anchor.bearing);
  const c = Math.cos(anchor.bearing);
  const rightX = Math.cos(anchor.bearing);
  const rightZ = -Math.sin(anchor.bearing);
  return {
    pos: [anchor.x + s * shot.back + rightX * shot.side, shot.height, anchor.z + c * shot.back + rightZ * shot.side],
    look: [anchor.x, shot.lookHeight, anchor.z],
  };
}

function sampleEstateFrames(stopId: string, frames: EstateCameraFrame[], t: number): { pos: Vec3; look: Vec3 } | null {
  let i = 0;
  while (i < frames.length - 2 && t > frames[i + 1].t) i += 1;
  const a = frames[i];
  const b = frames[Math.min(frames.length - 1, i + 1)];
  const span = Math.max(1e-4, b.t - a.t);
  const u = smooth((t - a.t) / span);
  const pos = estateWorld(stopId, lerp3(a.position, b.position, u));
  const look = estateWorld(stopId, lerp3(a.target, b.target, u));
  if (!pos || !look) return null;
  return { pos, look };
}

/** A delivered camera path bends the middle of the fly-in. Both ends stay on the authored pose. */
function withEstatePath(stopId: string, orbit: number, pose: { pos: Vec3; look: Vec3 }) {
  const frames = getEstateCameraPath(stopId);
  if (!frames) return pose;
  const t = clamp((orbit + 1) / 2, 0, 1);
  const blend = smooth(clamp(Math.min(t, 1 - t) / 0.18, 0, 1));
  if (blend <= 0) return pose;
  const cad = sampleEstateFrames(stopId, frames, t);
  if (!cad) return pose;
  return { pos: lerp3(pose.pos, cad.pos, blend), look: lerp3(pose.look, cad.look, blend) };
}

function viewPose(index: number, orbit: number): { pos: Vec3; look: Vec3 } {
  const stop = oceanStops[index];
  if (stop.id === "arrival") {
    const pose = journeyPath.camera.arrival;
    const drift = journeyPath.camera.arrival.orbitOffset;
    return {
      pos: [pose.position[0] + orbit * drift[0], pose.position[1] + orbit * drift[1], pose.position[2] + orbit * drift[2]],
      look: [pose.lookAt[0], pose.lookAt[1], pose.lookAt[2]],
    };
  }
  if (stop.id === "materials") {
    const rig = journeyPath.camera.materials;
    const side = SHIP_HEADING + Math.PI / 2;
    const alongside = rig.alongside + orbit * rig.orbitAlongside;
    const fore = rig.fore + orbit * rig.orbitFore;
    const height = rig.height + orbit * rig.orbitHeight;
    const fx = Math.sin(SHIP_HEADING);
    const fz = Math.cos(SHIP_HEADING);
    const sx = Math.sin(side);
    const sz = Math.cos(side);
    const lookAlong = fore - rig.lookBack;
    return {
      pos: [stop.x + fx * fore + sx * alongside, height, stop.z + fz * fore + sz * alongside],
      look: [stop.x + fx * lookAlong, journeyPath.camera.materials.lookHeight, stop.z + fz * lookAlong],
    };
  }
  const fly = (journeyPath.camera.estateFlyIn as Record<string, FlyIn>)[stop.id];
  if (fly) {
    const rest = estateShot(stop.id, fly.rest);
    const close = estateShot(stop.id, fly.close);
    const pose = orbit <= 0
      ? { pos: lerp3(approachPose(stop, orbit).pos, rest.pos, smooth(orbit + 1)), look: lerp3(approachPose(stop, orbit).look, rest.look, smooth(orbit + 1)) }
      : { pos: lerp3(rest.pos, close.pos, smooth(orbit)), look: lerp3(rest.look, close.look, smooth(orbit)) };
    return withEstatePath(stop.id, orbit, pose);
  }
  return approachPose(stop, orbit);
}

/** 0 at the start of the arrival into the stop, 1 at the end of its dwell, and it keeps climbing after. */
export function estateFlyT(progress: number, stopId: string) {
  const index = oceanStops.findIndex((stop) => stop.id === stopId);
  if (index < 0) return 0;
  const rel = clamp01(progress) * (N - 1) - index;
  return (rel + DW) / (2 * DW);
}

/** The built form is up by the chapter and stays on the island afterwards. */
export function estateReveal(progress: number, stopId: string) {
  const t = estateFlyT(progress, stopId);
  if (t <= 0) return 0;
  return smooth(Math.min(1, t * 1.65));
}

/** Sunrise azimuth. Local +Z on the meeting cay points at the sun. */
export const contactYaw = (journeyPath.contact.yawDeg * Math.PI) / 180;

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
    ...journeyPath.contact.finale.map((key) => ({
      p: key.u,
      pos: contactPoint(key.position[0], key.position[1], key.position[2]),
      look: contactPoint(key.lookAt[0], key.lookAt[1], key.lookAt[2]),
    })),
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
  pos[1] += Math.sin(Math.PI * t) * Math.max(0, journeyPath.camera.cruiseAltitude - (start.pos[1] + end.pos[1]) / 2);
  const next = bez(start.pos, c1, c2, end.pos, Math.min(1, t + 0.01));
  const tangent = norm([next[0] - pos[0], 0, next[2] - pos[2]]);
  const cruiseLook: Vec3 = [pos[0] + tangent[0] * 1100, 0, pos[2] + tangent[2] * 1100];
  const eased = t * t * (3 - 2 * t);
  const look = lerp3(lerp3(start.look, end.look, eased), cruiseLook, Math.pow(Math.sin(Math.PI * t), 1.5) * 0.8);
  const low = Math.min(start.pos[1], end.pos[1]);
  const floor = journeyPath.camera.cruiseFloor;
  pos[1] = clamp(pos[1], low < floor ? low : floor, journeyPath.camera.cruiseCeiling);
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
    lerp3(hex(journeyPath.sky.sunDay), hex(journeyPath.sky.sunSunset), sunset),
    hex(journeyPath.sky.sunDawn),
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
  return smooth(clamp01((finaleBlend(progress) - journeyPath.timing.contactRevealStart) / journeyPath.timing.contactRevealSpan));
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

export const scenicCays: OceanStop[] = journeyPath.scenic.map((cay) => ({
  id: cay.id,
  short: "",
  tag: "",
  title: "",
  line: "",
  href: "/",
  cta: "",
  kind: cay.kind,
  size: cay.size,
  x: cay.x,
  z: cay.z,
}));
