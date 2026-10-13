import assert from "node:assert/strict";
import test from "node:test";
import { oceanStops } from "../content/ocean-stops.ts";
import { company } from "../content/site.ts";
import { applyCliffLedge, sampleIslandHeight } from "../components/ocean/geometry.ts";
import { parseEstateCameraPath, setEstateCameraPath } from "./estate-drop.ts";
import { contactReveal, estateAnchor, sampleFlight, shipMotion, shipTrack, stopProgress } from "./ocean-flight.ts";
import { journeyPath } from "../src/journey/path.ts";
import * as THREE from "three";

function heading(sample: ReturnType<typeof sampleFlight>) {
  return Math.atan2(sample.look[0] - sample.pos[0], sample.look[2] - sample.pos[2]);
}

function align(sample: ReturnType<typeof sampleFlight>) {
  const hx = Math.sin(heading(sample));
  const hz = Math.cos(heading(sample));
  const sun = Math.hypot(sample.sun[0], sample.sun[2]) || 1;
  return (sample.sun[0] * hx + sample.sun[2] * hz) / sun;
}

test("the cruise sits near 285 m and approaches drop into the 60–160 m band", () => {
  const arrival = sampleFlight(0);
  assert.ok(arrival.pos[1] > 250 && arrival.pos[1] < 310, `arrival ${arrival.pos[1]}`);
  const construction = sampleFlight(stopProgress(oceanStops.findIndex((stop) => stop.id === "construction")));
  assert.ok(construction.pos[1] > 55 && construction.pos[1] < 120, `construction ${construction.pos[1]}`);
  const cruise = sampleFlight(stopProgress(1) + (stopProgress(2) - stopProgress(1)) * 0.5);
  assert.ok(cruise.pos[1] > 240 && cruise.pos[1] < 310, `cruise ${cruise.pos[1]}`);
});

test("the sun stays world-fixed while the heading turns into it at sunset", () => {
  const day = sampleFlight(stopProgress(1));
  const sunset = sampleFlight(stopProgress(oceanStops.findIndex((stop) => stop.id === "construction")));
  const night = sampleFlight(stopProgress(oceanStops.findIndex((stop) => stop.id === "engineering")));
  const dawn = sampleFlight(1);
  assert.ok(day.night < 0.05);
  assert.ok(day.sun[1] > 0.3);
  assert.ok(sunset.night < 0.15, `sunset night ${sunset.night}`);
  assert.ok(sunset.sun[1] > 0 && sunset.sun[1] < 0.08, `sunset sunY ${sunset.sun[1]}`);
  assert.ok(align(sunset) > 0.85, `sunset align ${align(sunset)}`);
  assert.ok(night.night > 0.8);
  assert.ok(night.sun[1] < 0);
  assert.ok(dawn.night < 0.08);
  assert.ok(dawn.sun[1] > 0);
  assert.deepEqual(day.moon, night.moon);
});

test("the launch line and the chapter lineup", () => {
  assert.equal(company.heroTitle, "Every detail, considered.");
  assert.equal(company.heroAccent, "Every estate, a legacy.");
  assert.equal(company.heroQuiet, "Enjoy the journey.");
  assert.equal(
    company.heroSub,
    "Renderings, design, engineering and plans, construction, finishing and materials, all under one company in Antigua and Barbuda.",
  );
  assert.deepEqual(
    oceanStops.map((stop) => stop.id),
    ["arrival", "design-build", "construction", "engineering", "developments", "materials", "build-live", "contact"],
  );
  assert.deepEqual(
    journeyPath.sun.map((key) => key.stop),
    oceanStops.map((stop) => stop.id),
  );
  assert.deepEqual(
    oceanStops.filter((stop) => stop.id !== "arrival").map((stop) => stop.short),
    [
      "Full Design & Build",
      "Construction",
      "Engineering, Plans & Rendering",
      "Developments & Hotels",
      "Advanced Materials Distribution",
      "Your Build, Live",
      "Contact",
    ],
  );
  const live = oceanStops.find((stop) => stop.id === "build-live");
  assert.equal(live?.tag, "Enjoy the journey · Live 24/7");
  assert.equal(JSON.stringify(oceanStops).includes("One Company. Every Detail."), false);
  const cards: Record<string, { tag: string; title: string; line: string; cta: string }> = {
    "design-build": {
      tag: "Design · Engineer · Build · Finish",
      title: "One vision, from first sketch to final key.",
      line: "We design, engineer, build and finish your estate under one roof, so nothing is lost between the idea and the place you live.",
      cta: "Explore Full Design & Build",
    },
    construction: {
      tag: "Build · Renovate",
      title: "Estates and commercial projects, built to last.",
      line: "Full estate and commercial construction and renovation services, delivered to the same exacting standard from groundbreaking to handover.",
      cta: "Explore Construction",
    },
    engineering: {
      tag: "Engineer · Plan · Render",
      title: "See your estate before the first stone is laid.",
      line: "Structural engineering, full permit-ready plans and photoreal renders, so every decision is made with certainty before anything is built.",
      cta: "Explore Engineering & Plans",
    },
    developments: {
      tag: "Develop · Build at scale",
      title: "Resorts, residences and hotels, built to last generations.",
      line: "Large-scale construction delivered to the same exacting standard as a private estate, from master plan to the final room key.",
      cta: "Explore Developments & Hotels",
    },
    materials: {
      tag: "Source · Exclusive",
      title: "Materials you won't find anywhere else in the Caribbean.",
      line: "Exclusive distribution rights to specialised, high-performance materials, shipped direct to your site and available only through Quantum.",
      cta: "Explore Advanced Materials",
    },
    "build-live": {
      tag: "Enjoy the journey · Live 24/7",
      title: "Your estate, open to you around the clock.",
      line: "Our exceptional backend gives you and your representatives 24/7 access to live progress, schedules, approvals and documents. Manage every detail from overseas, cut project-manager travel costs, and let building your estate feel as effortless as this journey.",
      cta: "Explore Your Build, Live",
    },
  };
  for (const [id, card] of Object.entries(cards)) {
    const stop = oceanStops.find((item) => item.id === id);
    assert.ok(stop, id);
    assert.equal(stop.tag, card.tag, id);
    assert.equal(stop.title, card.title, id);
    assert.equal(stop.line, card.line, id);
    assert.equal(stop.cta, card.cta, id);
  }
});

test("the contact card copy is locked", () => {
  const contact = oceanStops.find((stop) => stop.id === "contact");
  assert.ok(contact);
  assert.equal(contact.tag, "Begin");
  assert.equal(contact.title, "Your estate starts with a conversation.");
  assert.equal(contact.line, "Speak with a Representative on WhatsApp, or arrange a private video meeting.");
  assert.equal(contact.cta, "Start on WhatsApp");
  assert.equal(JSON.stringify(oceanStops).includes("Start a conversation"), false);
});

test("the opening stays high and the contact finale settles at eye level without a cut", () => {
  const arrival = sampleFlight(0);
  assert.ok(Math.abs(arrival.pos[0] - 420) < 0.01);
  assert.ok(Math.abs(arrival.pos[1] - 278) < 0.01);
  assert.ok(Math.abs(arrival.pos[2] - 980) < 0.01);
  const live = oceanStops.findIndex((stop) => stop.id === "build-live");
  const seam = (live + 0.17) / (oceanStops.length - 1);
  const held = sampleFlight(seam);
  const released = sampleFlight(seam + 1e-6);
  const jump = Math.hypot(held.pos[0] - released.pos[0], held.pos[1] - released.pos[1], held.pos[2] - released.pos[2]);
  const lookJump = Math.hypot(held.look[0] - released.look[0], held.look[1] - released.look[1], held.look[2] - released.look[2]);
  assert.ok(jump < 0.5, `seam jump ${jump}`);
  assert.ok(lookJump < 0.5, `look jump ${lookJump}`);
  const end = sampleFlight(1);
  assert.ok(Math.abs(end.pos[1] - 1.55) < 0.05, `eye ${end.pos[1]}`);
  assert.ok(Math.abs(end.bank) < 0.01, `bank ${end.bank}`);
  assert.ok(end.night < 0.08);
  assert.ok(end.sun[1] > 0);
  assert.ok(align(end) > 0.9, `sunrise align ${align(end)}`);
  assert.equal(contactReveal(0), 0);
  assert.equal(contactReveal(seam), 0);
  assert.ok(contactReveal(1) > 0.98);
});

test("design and engineering fly in without a cut, and developments stays aerial", () => {
  const n = oceanStops.length;
  const dwell = 0.17;
  const design = oceanStops.findIndex((stop) => stop.id === "design-build");
  const engineering = oceanStops.findIndex((stop) => stop.id === "engineering");
  const developments = oceanStops.findIndex((stop) => stop.id === "developments");
  const designAerial = sampleFlight(stopProgress(design) - dwell / (n - 1));
  const designRest = sampleFlight(stopProgress(design));
  const designClose = sampleFlight(stopProgress(design) + dwell / (n - 1));
  assert.ok(designAerial.pos[1] > 150, `design aerial ${designAerial.pos[1]}`);
  assert.ok(designRest.pos[1] > 40 && designRest.pos[1] < 80, `design rest ${designRest.pos[1]}`);
  assert.ok(designClose.pos[1] > 14 && designClose.pos[1] < 32, `design close ${designClose.pos[1]}`);
  const designMoved = Math.hypot(
    designRest.pos[0] - designClose.pos[0],
    designRest.pos[1] - designClose.pos[1],
    designRest.pos[2] - designClose.pos[2],
  );
  assert.ok(designMoved > 40, `design move ${designMoved}`);
  const engineeringAerial = sampleFlight(stopProgress(engineering) - dwell / (n - 1));
  const engineeringRest = sampleFlight(stopProgress(engineering));
  const engineeringClose = sampleFlight(stopProgress(engineering) + dwell / (n - 1));
  assert.ok(engineeringAerial.pos[1] > 110, `engineering aerial ${engineeringAerial.pos[1]}`);
  assert.ok(engineeringRest.pos[1] > 24 && engineeringRest.pos[1] < 50, `engineering rest ${engineeringRest.pos[1]}`);
  assert.ok(engineeringClose.pos[1] > 16 && engineeringClose.pos[1] < 28, `engineering close ${engineeringClose.pos[1]}`);
  const developmentsRest = sampleFlight(stopProgress(developments));
  assert.ok(developmentsRest.pos[1] > 140 && developmentsRest.pos[1] < 170, `developments ${developmentsRest.pos[1]}`);
  const seam = sampleFlight(stopProgress(design) + dwell / (n - 1));
  const after = sampleFlight(stopProgress(design) + dwell / (n - 1) + 1e-4);
  const jump = Math.hypot(seam.pos[0] - after.pos[0], seam.pos[1] - after.pos[1], seam.pos[2] - after.pos[2]);
  assert.ok(jump < 2, `design departure ${jump}`);
});

test("a delivered camera path bends the middle of the fly-in and leaves the ends", () => {
  const design = oceanStops.findIndex((stop) => stop.id === "design-build");
  const dwell = 0.17;
  const n = oceanStops.length;
  const before = sampleFlight(stopProgress(design));
  const aerialBefore = sampleFlight(stopProgress(design) - dwell / (n - 1));
  const closeBefore = sampleFlight(stopProgress(design) + dwell / (n - 1));
  setEstateCameraPath("design-build", [
    { t: 0, position: [0, 80, 220], target: [0, 4, 0] },
    { t: 1, position: [24, 6, 36], target: [0, 3, 0] },
  ]);
  try {
    const mid = sampleFlight(stopProgress(design));
    const aerial = sampleFlight(stopProgress(design) - dwell / (n - 1));
    const close = sampleFlight(stopProgress(design) + dwell / (n - 1));
    const moved = Math.hypot(mid.pos[0] - before.pos[0], mid.pos[1] - before.pos[1], mid.pos[2] - before.pos[2]);
    assert.ok(moved > 8, `path bend ${moved}`);
    const aerialJump = Math.hypot(aerial.pos[0] - aerialBefore.pos[0], aerial.pos[1] - aerialBefore.pos[1], aerial.pos[2] - aerialBefore.pos[2]);
    const closeJump = Math.hypot(close.pos[0] - closeBefore.pos[0], close.pos[1] - closeBefore.pos[1], close.pos[2] - closeBefore.pos[2]);
    assert.ok(aerialJump < 0.5, `aerial hold ${aerialJump}`);
    assert.ok(closeJump < 0.5, `close hold ${closeJump}`);
  } finally {
    setEstateCameraPath("design-build", null);
  }
});

test("the cliff ledge flattens only the terrace", () => {
  const anchor = estateAnchor("engineering");
  assert.ok(anchor);
  const stop = oceanStops.find((item) => item.id === "engineering");
  assert.ok(stop);
  const scale = { radius: 310, peak: 34, stretch: 1.12, form: "lagoon" as const };
  const ledge = {
    x: anchor.x - stop.x,
    z: anchor.z - stop.z,
    yaw: anchor.bearing,
    width: journeyPath.cliffLedge.width,
    length: journeyPath.cliffLedge.length,
    pad: anchor.y,
  };
  const position = new THREE.BufferAttribute(new Float32Array([
    ledge.x, 28, ledge.z,
    ledge.x + 400, 12, ledge.z,
  ]), 3);
  const farBefore = sampleIslandHeight(scale.form, ledge.x + 400, ledge.z, scale.radius, scale.peak, scale.stretch);
  position.setY(1, farBefore);
  applyCliffLedge(position, ledge);
  assert.ok(Math.abs(position.getY(0) - ledge.pad) < 0.2, `pad ${position.getY(0)}`);
  assert.ok(Math.abs(position.getY(1) - farBefore) < 0.01, `far ${position.getY(1)}`);
});

test("camera path json parses local frames", () => {
  const frames = parseEstateCameraPath({
    frames: [
      { t: 0, position: [0, 10, 20], target: [0, 2, 0] },
      { t: 1, position: [4, 3, 8], lookAt: [0, 1, 0] },
    ],
  });
  assert.equal(frames?.length, 2);
  assert.equal(parseEstateCameraPath({ frames: [] }), null);
});

test("materials runs alongside the ship, then the track lets go", () => {
  const materials = oceanStops.findIndex((stop) => stop.id === "materials");
  const pose = sampleFlight(stopProgress(materials));
  assert.ok(pose.pos[1] > 18 && pose.pos[1] < 48, `alongside ${pose.pos[1]}`);
  const stop = oceanStops[materials];
  const hx = Math.sin(heading(pose));
  const hz = Math.cos(heading(pose));
  const toward = Math.hypot(stop.x - pose.pos[0], stop.z - pose.pos[2]) || 1;
  const facing = ((stop.x - pose.pos[0]) * hx + (stop.z - pose.pos[2]) * hz) / toward;
  assert.ok(facing > 0.75, `facing ${facing}`);
  const moved = shipMotion(12);
  assert.ok(Math.hypot(moved.dx, moved.dz) > 80);
  assert.ok(Math.abs(moved.pitch) < 0.03 && Math.abs(moved.roll) < 0.04);
  assert.ok(shipTrack(stopProgress(materials)) > 0.95);
  assert.equal(shipTrack(0), 0);
  assert.equal(shipTrack(1), 0);
  const peel = sampleFlight(stopProgress(materials) + 0.39 / (oceanStops.length - 1));
  assert.ok(peel.pos[1] > pose.pos[1] + 40, `peel ${peel.pos[1]}`);
  assert.ok(shipTrack(stopProgress(materials) + 0.39 / (oceanStops.length - 1)) < 0.35);
});
