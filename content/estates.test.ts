import assert from "node:assert/strict";
import test from "node:test";
import { estateSceneModules } from "../components/estates/scene-modules.ts";
import { WHATSAPP_ENQUIRY_NUMBER, estates } from "./estates.ts";

const EMPTY = [
  "rustic-modern-aerial",
  "beachfront-from-water",
  "rustic-modern-pavilion-dusk",
  "rustic-modern-cliffside",
];

test("mega estate uses the area schedule total", () => {
  const mega = estates.find((estate) => estate.slug === "mega-estate-aerial");
  assert.ok(mega?.specs);
  assert.equal(mega.specs.enclosedSqm, 4570);
  assert.equal(mega.specs.enclosedSqft, 49191);
  assert.equal(mega.specs.buildingCount, 9);
  assert.equal(mega.specs.buildings.length, 9);
  assert.equal(
    mega.specs.buildings.reduce((sum, building) => sum + building.sqm, 0),
    4570,
  );
  assert.equal(mega.specs.buildings.find((building) => building.code === "E")?.sqm, 90);
  assert.equal(mega.specs.buildings.find((building) => building.code === "E")?.sqft, 969);
  assert.equal(mega.specs.buildings.find((building) => building.code === "F1")?.sqft, 1163);
  assert.equal(mega.video, "/estates/mega-estate-aerial/walkthrough.mp4");
  assert.equal(mega.plans.length, 2);
  assert.equal(mega.walkthrough3d, undefined);
  assert.equal(WHATSAPP_ENQUIRY_NUMBER, "0000000000");
  assert.equal(estates.some((estate) => estate.specs?.buildings.some((building) => building.code === "H")), false);
});

test("the other four estates stay empty for later drawings", () => {
  assert.deepEqual(
    estates.map((estate) => estate.slug),
    ["mega-estate-aerial", ...EMPTY],
  );
  for (const slug of EMPTY) {
    const estate = estates.find((item) => item.slug === slug);
    assert.ok(estate);
    assert.equal(estate.specs, null);
    assert.equal(estate.video, null);
    assert.deepEqual(estate.plans, []);
    assert.equal(estate.walkthrough3d, undefined);
    assert.deepEqual(Object.keys(estateSceneModules), []);
    assert.ok(estate.materials.length > 0);
    assert.ok(estate.landscape.length > 0);
  }
});
