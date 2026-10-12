import assert from "node:assert/strict";
import test from "node:test";
import { oceanStops } from "../content/ocean-stops.ts";
import { contactReveal, sampleFlight, stopProgress } from "./ocean-flight.ts";

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
