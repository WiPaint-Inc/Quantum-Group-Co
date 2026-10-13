import assert from "node:assert/strict";
import test from "node:test";
import { phaseFromName } from "./villa-assets.ts";
import { dominantPhase, phaseWeight, sampleVilla } from "./villa-flight.ts";

test("blueprint leads, then structure, then a finished interior", () => {
  assert.ok(phaseWeight(0.1, "blueprint") > 0.8);
  assert.ok(sampleVilla(0.12).draw > 0.8);
  assert.ok(phaseWeight(0.1, "structure") < 0.05);
  assert.ok(phaseWeight(0.36, "structure") > phaseWeight(0.36, "blueprint"));
  assert.ok(phaseWeight(0.62, "finished") > 0.8);
  assert.ok(phaseWeight(0.62, "interior") < 0.2);
  assert.ok(phaseWeight(0.95, "interior") > 0.8);
  assert.equal(dominantPhase(0.12), "blueprint");
  assert.equal(dominantPhase(0.36), "structure");
  assert.equal(dominantPhase(0.62), "finished");
  assert.equal(dominantPhase(0.95), "interior");
});

test("the camera starts outside and ends inside the pavilion", () => {
  const start = sampleVilla(0);
  const end = sampleVilla(1);
  assert.ok(start.pos[2] > 8);
  assert.ok(start.pos[1] > 6);
  assert.ok(end.pos[1] < 2);
  assert.ok(end.pos[2] < 3);
  assert.ok(end.look[2] < end.pos[2]);
});

test("node names map onto the four states", () => {
  assert.equal(phaseFromName("Blueprint_Lines"), "blueprint");
  assert.equal(phaseFromName("demo-villa-wireframe"), "blueprint");
  assert.equal(phaseFromName("Structure_Frame"), "structure");
  assert.equal(phaseFromName("Finished_Shell"), "finished");
  assert.equal(phaseFromName("Interior_Living"), "interior");
  assert.equal(phaseFromName("Camera"), null);
});
