import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const photoFiles = [
  "components/estates/EstateBook.tsx",
  "components/estates/WalkthroughVideo.tsx",
  "components/site/ConceptFigure.tsx",
  "components/site/ConceptRenderSlot.tsx",
  "components/site/AtmosphereStrip.tsx",
  "components/portfolio/Gallery.tsx",
  "components/experience/ProjectScene.tsx",
  "components/experience/PortfolioPlaces.tsx",
  "app/portfolio/page.tsx",
  "app/portfolio/[slug]/page.tsx",
];

function source(file: string) {
  return readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
}

test("photographs stay clear of gold frames and linework", () => {
  for (const file of photoFiles) {
    const text = source(file);
    assert.equal(text.includes("PlateBlueprint"), false, file);
    assert.equal(text.includes("GoldOverlay"), false, file);
    assert.equal(/stroke=["']#e/i.test(text), false, file);
    assert.equal(text.includes("<polyline"), false, file);
  }
  assert.equal(source("components/portfolio/Gallery.tsx").includes("border-gold"), false);
  assert.equal(source("components/experience/ProjectScene.tsx").includes("border"), false);
  const book = source("components/estates/EstateBook.tsx");
  const figure = source("components/site/ConceptFigure.tsx");
  assert.match(book, /paper-kicker mt-3">\{draft \? "Concept render"/);
  assert.match(book, /paper-kicker mt-4">Concept render/);
  assert.equal(book.includes("bg-gradient-to-t"), false);
  assert.match(figure, /<figcaption className="mt-3 text-sand">[\s\S]*Concept render/);
  assert.equal(figure.includes("<svg"), false);
  assert.equal(source("components/ocean/OceanWorld.tsx").includes("linesFor"), true);
});
