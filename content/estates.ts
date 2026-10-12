import { assertNoPricesOrExternalUrls } from "@/lib/public-copy";

export type EstatePiece = { id: string; label: string };
export type EstateZone = { name: string; intent: string };

export type EstateBuilding = {
  code: string;
  name: string;
  sqm: number;
  sqft: number;
};

/** Enclosed gross from an area schedule. Null until that schedule exists. */
export type EstateSpecs = {
  enclosedSqm: number;
  enclosedSqft: number;
  buildingCount: number;
  buildings: EstateBuilding[];
};

export type EstatePlan = { src: string; label: string };

/** Public GLB path, or a scene-module key registered for the estate walkthrough. */
export type Walkthrough3d = { glb: string } | { scene: string };

export type EstateRecord = {
  slug: string;
  number: string;
  title: string;
  line: string;
  concept: string;
  materials: string;
  landscape: string;
  hero: string;
  zones: EstateZone[];
  pieces: EstatePiece[];
  specs: EstateSpecs | null;
  video: string | null;
  plans: EstatePlan[];
  walkthrough3d?: Walkthrough3d;
};

function unpublished(): { specs: null; video: null; plans: EstatePlan[] } {
  return { specs: null, video: null, plans: [] };
}

const pieces = (rows: [string, string][]): EstatePiece[] => rows.map(([id, label]) => ({ id, label }));

export const estates: EstateRecord[] = [
  {
    slug: "mega-estate-aerial",
    number: "01",
    title: "The Grand Beachfront Estate",
    line: "A palm allée, a long pool, and a private fruit forest above the beach.",
    concept:
      "A Caribbean Georgian estate of white lime-render, pale hipped roofs and a two-tier veranda, set between an arrival allée and the sea. The main house keeps a great hall, a library and a primary suite, with family and guest villas, a wellness pavilion and a pool pavilion across the grounds.",
    materials:
      "Ivory coral stone, cream limestone and lime-white columns; honey teak and dark mahogany; brushed brass; soft shutter blue as the single cool note; turquoise sea and deep blue-hour sky.",
    landscape:
      "A formal estate orchard is planned in rows on the leeward side of the windbreak, between the lawns and the inland scrub. The canopy is mango, sapodilla, tamarind, breadfruit, coconut, genip, avocado and star apple. The sub-canopy is soursop, sugar apple, guava and key lime.",
    hero: "mega-estate-aerial",
    specs: {
      enclosedSqm: 4570,
      enclosedSqft: 49191,
      buildingCount: 9,
      buildings: [
        { code: "A", name: "Main House", sqm: 2336, sqft: 25144 },
        { code: "B", name: "West Family Villa", sqm: 336, sqft: 3617 },
        { code: "C1", name: "East Guest Villa", sqm: 300, sqft: 3229 },
        { code: "C2", name: "Wellness Pavilion", sqm: 320, sqft: 3444 },
        { code: "D", name: "Beach Guest Villa", sqm: 252, sqft: 2713 },
        { code: "E", name: "Pool Pavilion", sqm: 90, sqft: 969 },
        { code: "F1", name: "West Forecourt Cottage (guest)", sqm: 108, sqft: 1163 },
        { code: "F2", name: "East Forecourt Cottage (estate office & security)", sqm: 108, sqft: 1163 },
        { code: "G", name: "Service & Staff Building", sqm: 720, sqft: 7750 },
      ],
    },
    video: "/estates/mega-estate-aerial/walkthrough.mp4",
    walkthrough3d: { scene: "mega-estate" },
    plans: [
      { src: "/estates/mega-estate-aerial/plans/teaser-site.png", label: "Site" },
      { src: "/estates/mega-estate-aerial/plans/teaser-ground.png", label: "Ground floor" },
    ],
    zones: [
      { name: "Arrival orchard allée", intent: "A formal palm allée with a clipped edible understorey at the forecourt." },
      { name: "Dune and back-dune", intent: "Low groundcovers and a silver native shrub band, with the view to the sea kept open." },
      { name: "Windbreak", intent: "Coconut and sea grape take the salt spray and shelter the lawns behind." },
      { name: "Edible courtyards", intent: "Herbs, citrus and vines beside the kitchens and guest pavilions." },
      { name: "Food forest", intent: "Orchard groves inland of the windbreak, in seven layers." },
      { name: "Lawns and pool", intent: "Clipped hedges and low-litter planting around the long pool." },
      { name: "Service and nursery", intent: "A downwind yard for propagation, compost and cistern access." },
    ],
    pieces: pieces([
      ["01", "Chandelier"],
      ["02", "Library sofa"],
      ["03", "Dining table"],
      ["04", "Armchair"],
      ["05", "Chandelier"],
      ["06", "Picture light"],
      ["07", "Sconce"],
      ["08", "Bed"],
      ["09", "Lantern"],
      ["10", "Hanging lantern"],
      ["11", "Range"],
      ["12", "Kitchen faucet"],
      ["13", "Cabinet pull"],
      ["14", "Bath faucet"],
      ["15", "Bathtub"],
      ["17", "Outdoor sofa"],
      ["18", "Chaise"],
      ["19", "Dining table"],
      ["20", "Armchair"],
      ["21", "Daybed"],
      ["22", "Shade"],
      ["23", "Fire table"],
    ]),
  },
  {
    slug: "rustic-modern-aerial",
    number: "02",
    title: "The Hillside Estate",
    line: "Stone pavilions and a terraced fruit forest above the Caribbean.",
    concept:
      "Pavilions step down a headland in cream coral stone and honey stacked walls, with planted roofs and a cantilevered pool. The great room is dark timber, woven reed and rattan, open to the sea at dusk.",
    materials:
      "Rough coral stone in honey and cream, sand lime plaster, dark-oiled greenheart beams, woven reed ceilings, rattan and aged brass; bougainvillea magenta and leaf green on the terraces; deep teal pool.",
    landscape:
      "The fruit forest is planned on the leeward slope, in terraces held by the dry-stone walls. Tamarind, sapodilla and genip take the upper edges. Mango sits on the main terraces. Breadfruit, soursop and banana are planned for the lowest, best-watered terraces.",
    hero: "rustic-modern-aerial",
    ...unpublished(),
    zones: [
      { name: "Orchard allée", intent: "A rustic avenue of fruit trees along the arrival drive." },
      { name: "Crest windbreak", intent: "Native trees temper the trades before they reach the terraces." },
      { name: "Slope", intent: "Deep-rooted natives hold the thin soil of the banks." },
      { name: "Terraced food forest", intent: "Seven layers on dry-stone terraces, with tender fruit lowest and best watered." },
      { name: "Edible courtyards", intent: "Herbs, peppers, lime and vines within reach of the kitchens." },
      { name: "Pool terraces", intent: "Frangipani, bougainvillea and low-litter planting beside the pool." },
      { name: "Green roofs", intent: "Shallow mats of drought-hardy succulents and grasses." },
    ],
    pieces: pieces([
      ["01", "Hanging light"],
      ["02", "Hanging light"],
      ["03", "Hanging light"],
      ["04", "Sofa"],
      ["05", "Armchair"],
      ["06", "Dining table"],
      ["07", "Chair"],
      ["08", "Bed"],
      ["09", "Kitchen faucet"],
      ["10", "Farmhouse sink"],
      ["11", "Bathtub"],
      ["12", "Bath filler"],
      ["13", "Vessel sink"],
      ["14", "Chaise"],
      ["15", "Chaise"],
      ["16", "Dining table"],
      ["17", "Armchair"],
      ["18", "Shade"],
      ["19", "Fire bowl"],
      ["20", "Lantern"],
    ]),
  },
  {
    slug: "beachfront-from-water",
    number: "03",
    title: "The Shoreline Residence",
    line: "A stone and timber house, an infinity pool, and an ordered fruit forest behind the sand.",
    concept:
      "A two-storey house of coursed coral stone and pale teak louvres sits just behind the beach, with a long pool at sand level and planting along the roof edge. The fruit forest is set out in rows on the arrival axis.",
    materials:
      "Honed coral limestone in warm ivory, warm-white lime plaster, pale teak louvres, white cedar ceilings, champagne bronze frames; crystal turquoise water and white sand; greenery spilling from the roof edges.",
    landscape:
      "The fruit forest is planned as a grid of single-species rows behind the windbreak and the house. Coconut, sapodilla, mango, tamarind and breadfruit form the canopy. Pineapple, lemongrass and sweet potato are planned as repeating bands in the alleys.",
    hero: "beachfront-from-water",
    ...unpublished(),
    zones: [
      { name: "Orchard allée", intent: "A double row of coconut palms, with key lime and pineapple between them." },
      { name: "Dune", intent: "A low sweep of a single species, so the view from the water stays clear." },
      { name: "Windbreak", intent: "Clipped sea grape and buttonwood, held clear of the main view." },
      { name: "Grid fruit forest", intent: "Seven layers in single-species rows behind the house." },
      { name: "Edible courtyard", intent: "Clipped citrus, herbs and dragon fruit beside the kitchen." },
      { name: "Pool deck", intent: "Silver thatch, agave and white frangipani on the axis." },
      { name: "Roof garden", intent: "Low succulents and trailing plants over the parapets." },
    ],
    pieces: pieces([
      ["01", "Pendant light"],
      ["02", "Pendant light"],
      ["03", "Wall lamp"],
      ["04", "Sofa"],
      ["05", "Lounge chair"],
      ["06", "Dining table"],
      ["07", "Dining chair"],
      ["08", "Bed"],
      ["09", "Kitchen faucet"],
      ["10", "Bathtub"],
      ["11", "Bath filler"],
      ["12", "Vessel sink"],
      ["13", "Bath filler"],
      ["14", "Daybed"],
      ["15", "Sun lounge"],
      ["16", "Shade"],
      ["17", "Dining table"],
      ["18", "Armchair"],
      ["19", "Fire table"],
    ]),
  },
  {
    slug: "rustic-modern-pavilion-dusk",
    number: "04",
    title: "The Pavilion House",
    line: "Stone and timber pavilions around a still pool at dusk.",
    concept:
      "Separate pavilions of rubble stone and round-log trusses gather around a reflecting pool. Charcoal shingle roofs flare at the eaves. Lantern light doubles in the water at blue hour.",
    materials:
      "Rubble coral stone in honey and cream, dark-oiled greenheart trusses, wallaba shingle roofs, teak and rattan furniture, bronze lanterns; deep blue dusk sky, sea-green reflecting pool, warm 2200K glow.",
    landscape:
      "An informal fruit grove is planned landward of the pavilions, grading inland from the windbreak. Coconut, sapodilla and tamarind hold the windward edge. Mango, genip and breadfruit sit in the sheltered interior.",
    hero: "rustic-modern-pavilion-dusk",
    ...unpublished(),
    zones: [
      { name: "Orchard allée", intent: "Coconut and sapodilla, with cocoplum hedges and lemongrass at the edge." },
      { name: "Shore band", intent: "Low natives bind the sand and gravel in front of the terrace." },
      { name: "Windbreak", intent: "Screens the trades while the view from the pavilion stays open." },
      { name: "Landward fruit grove", intent: "An informal grove, with tender fruit in the innermost clumps." },
      { name: "Edible courtyard", intent: "Herbs, lime and vines under a timber arbor." },
      { name: "Pool terrace", intent: "Low-litter planting, with frangipani as the focal tree." },
    ],
    pieces: pieces([
      ["01", "Lantern"],
      ["02", "Hanging light"],
      ["03", "Dining table"],
      ["04", "Dining chair"],
      ["05", "Sofa"],
      ["06", "Lounge chair"],
      ["07", "Daybed"],
      ["08", "Bed"],
      ["09", "Kitchen faucet"],
      ["10", "Prep faucet"],
      ["11", "Bathtub"],
      ["12", "Bath filler"],
      ["13", "Chaise"],
      ["14", "Shade"],
      ["15", "Lantern"],
      ["16", "Lantern"],
    ]),
  },
  {
    slug: "rustic-modern-cliffside",
    number: "05",
    title: "The Cliffside Residence",
    line: "A stone house cantilevered over the cliff, with a sheltered fruit forest behind.",
    concept:
      "Dark volcanic stone and teak step down a cliff above the surf. Three pools catch the sunset, and a fire pit sits on a lower terrace. The fruit forest is planned on walled terraces inland of the wind.",
    materials:
      "Warm dry-stack stone in honey and buff, honed coral limestone, plantation teak soffits, greenheart, low-iron glass, aged bronze; sunset gold on the sea, aqua pools, dark rock and white surf below.",
    landscape:
      "The fruit forest is planned landward of the house, in walled terraces and courtyards. Sapodilla and tamarind hold the outer wall. Mango and genip sit in the sheltered courtyard. No fruit trees are planned on the seaward face.",
    hero: "rustic-modern-cliffside",
    walkthrough3d: { scene: "cliffside" },
    ...unpublished(),
    zones: [
      { name: "Orchard allée", intent: "A short avenue of wind-firm fruit trees and a clipped hedge." },
      { name: "Cliff edge", intent: "Low, wind-sculpted natives on the rock. No fruit trees." },
      { name: "Crest windbreak", intent: "Breaks the trades before they reach the fruit terraces." },
      { name: "Walled fruit terraces", intent: "Seven layers on dry-stone terraces, tender species innermost." },
      { name: "Edible courtyard", intent: "Herbs, peppers, lime and a passionfruit pergola." },
      { name: "Pool terraces", intent: "Sculptural natives and a frangipani beside the pools." },
    ],
    pieces: pieces([
      ["01", "Pendant light"],
      ["02", "Pendant light"],
      ["03", "Linear pendant"],
      ["04", "Sconce"],
      ["05", "Sofa"],
      ["06", "Lounge chair"],
      ["07", "Dining table"],
      ["08", "Dining chair"],
      ["09", "Bed"],
      ["10", "Kitchen faucet"],
      ["11", "Farmhouse sink"],
      ["12", "Bathtub"],
      ["13", "Bath filler"],
      ["14", "Fire table"],
      ["15", "Outdoor sofa"],
      ["16", "Chaise"],
      ["17", "Shade"],
      ["18", "Lantern"],
    ]),
  },
];

export function getEstate(slug: string) {
  return estates.find((estate) => estate.slug === slug);
}

export function conceptPlate(name: string) {
  const widths = [640, 960, 1280];
  return {
    avif: widths.map((width) => `/concept/${name}-${width}.avif ${width}w`).join(", "),
    webp: widths.map((width) => `/concept/${name}-${width}.webp ${width}w`).join(", "),
    src: `/concept/${name}-1280.webp`,
  };
}

/** Digits only, country code included. Replace this one value when the enquiry number is assigned. */
export const WHATSAPP_ENQUIRY_NUMBER = "0000000000";

assertNoPricesOrExternalUrls(estates, "estates");
