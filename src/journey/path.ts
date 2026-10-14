/**
 * One blueprint for the homepage flythrough.
 * The website samples this through lib/ocean-flight.ts.
 * Unreal should import these numbers, not the React scene.
 * Units, axes, and the evaluated poses are written up in docs/JOURNEY_SPEC.md.
 */

export const journeyPath = {
  units: {
    length: "metres",
    angle: "degrees",
    progress: "0 at Arrival, 1 at the settled contact shot",
  },
  axes: {
    handedness: "right-handed",
    up: "+Y",
    azimuthZero: "+Z",
    azimuthNinety: "+X",
    unreal: "Unreal (Z up, left-handed) position (X, Y, Z) = (x, z, y) from this file",
  },
  camera: {
    fovDeg: 46,
    near: 0.12,
    far: 28000,
    maxPixelRatio: 3,
    cruiseAltitude: 285,
    cruiseFloor: 55,
    cruiseCeiling: 310,
    descentFloor: 1.15,
    arrival: {
      position: [420, 278, 980],
      lookAt: [40, 6, -260],
      /** Added to the arrival position, multiplied by the orbit parameter (−1..1). */
      orbitOffset: [-25, -6, -70],
    },
    /** Bearing is degrees, 0 along +Z. Distance and height are metres. */
    approaches: {
      "design-build": { bearing: 40, distance: 640, height: 150, orbit: 10, lookAhead: 0.62 },
      plans: { bearing: 70, distance: 430, height: 118, orbit: 10, lookAhead: 0.58 },
      construction: { bearing: 86, distance: 390, height: 72, orbit: 8, lookAhead: 0.78 },
      engineering: { bearing: 315, distance: 460, height: 120, orbit: 10, lookAhead: 0.55 },
      developments: { bearing: 250, distance: 1680, height: 155, orbit: 6, lookAhead: 0.42 },
      "build-live": { bearing: 240, distance: 140, height: 64, orbit: 12, lookAhead: 0.4 },
    },
    materials: {
      alongside: 76,
      fore: 28,
      height: 32,
      lookHeight: 9,
      lookBack: 72,
      orbitAlongside: -8,
      orbitFore: 34,
      orbitHeight: -5,
    },
    /**
     * Continuous fly-ins. orbit −1 stays on the authored approach.
     * orbit 0 is the chapter rest. orbit 1 is the close of the dwell.
     * shore/side place the estate origin on the island. Local +Z is seaward.
     * back/side are metres from that origin, toward the sea and to the right.
     */
    estateFlyIn: {
      "design-build": {
        bearing: 40,
        shore: 262,
        side: 0,
        base: 2.4,
        rest: { back: 168, height: 56, side: 78, lookHeight: 6 },
        close: { back: 72, height: 22, side: 24, lookHeight: 4.5 },
      },
      /** Cliffside (with build stages) seats on the Construction headland; Engineering is Shoreline House. */
      construction: {
        bearing: 86,
        shore: 160,
        side: 8,
        base: 16,
        rest: { back: 64, height: 34, side: 36, lookHeight: 20 },
        close: { back: 28, height: 21, side: 14, lookHeight: 18.5 },
      },
    },
  },
  /** Terrace cut into the construction headland for the cliffside. The rest of that island is unchanged. */
  cliffLedge: {
    stop: "construction",
    width: 44,
    length: 30,
    face: 12,
  },
  timing: {
    /** Homepage scroll track. Stop i sits at progress i / (stopCount - 1). */
    scrollTrackVh: 1100,
    /** Fraction of each stop-to-stop span spent holding the stop pose. */
    dwell: 0.17,
    /** Contact card fades in over the last 22% of the finale, starting at u = 0.78. */
    contactRevealStart: 0.78,
    contactRevealSpan: 0.22,
  },
  /**
   * One sun key per stop, in stop order.
   * Azimuth and elevation are degrees. Night is 0 day … 1 full night.
   * Arrival azimuth sits off the opening view axis so the sun is not centred on the title.
   */
  sun: [
    { stop: "arrival", elev: 38, az: 164, night: 0 },
    { stop: "design-build", elev: 26, az: 215, night: 0 },
    { stop: "engineering", elev: 14, az: 242, night: 0.05 },
    { stop: "construction", elev: 1.6, az: 274, night: 0.2 },
    { stop: "developments", elev: -8, az: 332, night: 0.72 },
    { stop: "materials", elev: -11, az: 382, night: 0.76 },
    { stop: "build-live", elev: -1.5, az: 428, night: 0.34 },
    { stop: "contact", elev: 2.8, az: 471, night: 0 },
  ],
  sky: {
    dayHorizon: "#8eafc4",
    dayZenith: "#1a5c96",
    sunsetHorizon: "#e07a3a",
    sunsetZenith: "#1c2c44",
    nightHorizon: "#24344f",
    nightZenith: "#121a2c",
    dawnHorizon: "#f8c4a0",
    dawnZenith: "#e79aaf",
    sunDay: "#fff4dd",
    sunSunset: "#ff7a32",
    sunDawn: "#ffc98a",
    moonAzimuth: 100,
    /** Radians. About 24.06°. Kept as radians so the direction matches the original key. */
    moonElevation: 0.42,
  },
  ship: {
    /** Degrees. Local +Z is the bow. */
    headingDeg: 48,
    speedMetresPerSecond: 8,
    length: 248,
  },
  /** Local metres on the meeting cay, before contactYaw is applied. u is 0–1 along the finale. */
  contact: {
    yawDeg: 111,
    finale: [
      { u: 0.2, position: [0, 240, -90], lookAt: [0, 6, 8] },
      { u: 0.46, position: [-8, 62, -32], lookAt: [0, 1.6, 10] },
      { u: 0.7, position: [0, 16, -14], lookAt: [0, 1.35, 18] },
      { u: 0.86, position: [0, 2.6, -6.2], lookAt: [0, 1.28, 22] },
      { u: 1, position: [0, 1.55, -3.6], lookAt: [0, 1.2, 26] },
    ],
  },
  scales: {
    large: { radius: 430, peak: 78, stretch: 1.16, form: "volcano" },
    peninsula: { radius: 560, peak: 44, stretch: 2.45, form: "peninsula" },
    "mid:construction": { radius: 260, peak: 64, stretch: 1.22, form: "headland" },
    "mid:engineering": { radius: 220, peak: 16, stretch: 1.72, form: "beachfront" },
    "mid:plans": { radius: 280, peak: 68, stretch: 1.32, form: "ridge" },
    mid: { radius: 250, peak: 42, stretch: 1.18, form: "ridge" },
    private: { radius: 16, peak: 0.55, stretch: 1.08, form: "private" },
    cay: { radius: 64, peak: 8, stretch: 1.06, form: "cay" },
    bar: { radius: 120, peak: 1.15, stretch: 1.85, form: "bar" },
    none: { radius: 0, peak: 0, stretch: 1, form: "cay" },
  },
  islands: [
    { id: "arrival", x: 0, z: 900, size: "none", kind: "arrival" },
    { id: "design-build", x: -620, z: 180, size: "large", kind: "design" },
    { id: "construction", x: -3680, z: 420, size: "mid", kind: "construction" },
    { id: "engineering", x: -2860, z: -2680, size: "mid", kind: "engineering" },
    { id: "developments", x: 980, z: -2100, size: "peninsula", kind: "developments" },
    { id: "materials", x: 2920, z: -720, size: "none", kind: "materials" },
    { id: "build-live", x: 1680, z: -3480, size: "cay", kind: "signal" },
    { id: "contact", x: 3480, z: 260, size: "private", kind: "contact" },
  ],
  scenic: [
    { id: "plans", x: -2300, z: -1180, size: "mid", kind: "plans" },
    { id: "cay-a", x: 200, z: 1400, size: "bar", kind: "arrival" },
    { id: "cay-b", x: -1600, z: 900, size: "cay", kind: "arrival" },
    { id: "cay-c", x: 1400, z: 400, size: "bar", kind: "arrival" },
    { id: "cay-d", x: -4200, z: -800, size: "cay", kind: "arrival" },
    { id: "cay-e", x: 400, z: -3800, size: "bar", kind: "arrival" },
    { id: "cay-f", x: 3600, z: -1800, size: "cay", kind: "arrival" },
    { id: "cay-g", x: -1200, z: -3400, size: "cay", kind: "arrival" },
  ],
} as const;

export type JourneyIsland = (typeof journeyPath.islands)[number];
export type IslandSize = JourneyIsland["size"] | (typeof journeyPath.scenic)[number]["size"];
export type IslandKind = JourneyIsland["kind"] | (typeof journeyPath.scenic)[number]["kind"];
export type IslandForm = (typeof journeyPath.scales)[keyof typeof journeyPath.scales]["form"];

export function islandPosition(id: string) {
  const row = journeyPath.islands.find((item) => item.id === id) ?? journeyPath.scenic.find((item) => item.id === id);
  if (!row) throw new Error(`Unknown island ${id}`);
  return { x: row.x, z: row.z };
}

export function islandScaleFor(size: string, kind?: string) {
  if (size === "large") return journeyPath.scales.large;
  if (size === "peninsula") return journeyPath.scales.peninsula;
  if (size === "mid" && kind === "construction") return journeyPath.scales["mid:construction"];
  if (size === "mid" && kind === "engineering") return journeyPath.scales["mid:engineering"];
  if (size === "mid" && kind === "plans") return journeyPath.scales["mid:plans"];
  if (size === "mid") return journeyPath.scales.mid;
  if (size === "private") return journeyPath.scales.private;
  if (size === "cay") return journeyPath.scales.cay;
  if (size === "bar") return journeyPath.scales.bar;
  return journeyPath.scales.none;
}
