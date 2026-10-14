import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(new URL("../ocean-journey/index.html", import.meta.url), "utf8");

function light(id: string) {
  const chunk = html.slice(html.indexOf(`id:'${id}'`));
  const match = chunk.match(/light:\{([^}]+)\}/);
  assert.ok(match, id);
  return Object.fromEntries(
    match[1].split(",").map((part) => {
      const [key, value] = part.split(":").map((item) => item.trim());
      return [key, value.startsWith("0x") ? value : Number(value)];
    }),
  );
}

test("the prototype lighting arc is day, sunset, night, then the sunrise contact", () => {
  const keys = ["arrival", "design", "engineering", "construction", "developments", "materials", "live", "contact"].map(light);
  for (let i = 1; i < keys.length; i += 1) assert.ok(Number(keys[i].az) > Number(keys[i - 1].az));
  assert.equal(keys[2].night, 0.05);
  assert.equal(keys[3].night, 0.2);
  assert.equal(keys[3].elev, 1.6);
  assert.equal(keys[4].night, 0.72);
  assert.equal(keys[5].night, 0.76);
  assert.equal(keys[6].night, 0.34);
  assert.equal(keys[7].night, 0);
  assert.equal(keys[7].elev, 4);
  assert.equal(keys[7].az, 446);
  assert.match(html, /uFloor:\{value:new THREE\.Color\(0x05304a\)\}/);
  assert.match(html, /outgoingLight = max\(outgoingLight, uFloor \* uNightMix\)/);
  assert.match(html, /type:'beachfront',segs:96/);
  assert.match(html, /cliffside\/web\/v2\/'\+E\.name\+'_wireframe\.glb'/);
  assert.match(html, /if\(!Q\.has\('nolawn'\)\) megaMats\(s\)/);
  assert.match(html, /function releaseEstate\(E\)/);
  assert.match(html, /Math\.abs\(s-k\)>2\.55/);
  assert.match(html, /Math\.abs\(s-k\)<1\.7/);
  assert.match(html, /const TEX_MAX=2048/);
  assert.match(html, /function batchStatic\(root\)/);
  assert.match(html, /const CAD_HIDE = \/\(\?:\^\|\\\/\)\(T_Terrain\(\?:_withSkirt\)\?/);
});
