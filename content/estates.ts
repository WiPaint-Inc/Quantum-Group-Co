import { assertNoPricesOrExternalUrls } from "@/lib/public-copy";

export type EstatePiece = { id: string; label: string };
export type EstateZone = { name: string; intent: string };

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
  specified: boolean;
};

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
      "White lime-render walls and white trim, slender square columns, powder-blue louvred shutters, and pale silver-grey hipped roofs. Great-hall doors are tall mahogany leaves in white casings. The pool terrace is coral stone.",
    landscape:
      "Arrive beneath a sweeping avenue of palms to a residence designed around its own private fruit forest. Beyond the lawns and the long infinity pool, shaded groves are planned for mango, breadfruit, avocado and star apple, with soursop, sugar apple and Antigua's famed black pineapple beneath them. Fragrant kitchen courtyards of lime, lemongrass and island herbs are steps from the chef's kitchen, and passionfruit vines drape the pergolas. Toward the sea, native sea grape, buttonwood and silver thatch palms soften the breeze and frame the beach.",
    hero: "mega-estate-aerial",
    specified: true,
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
      "Cream coral rubble and honey stacked stone, sand lime plaster, dark-stained beams inside and silver-weathered timber outside, woven reed ceilings, rattan and aged brass. Bougainvillea on the terraces, and a deep teal pool.",
    landscape:
      "Set high above the Caribbean, this hillside retreat is designed around its own terraced fruit forest. Stone walls step down the leeward slope, planned for mango, tamarind and sapodilla above soursop, sugar apple and lime, with Antigua's sweet black pineapple tucked into sunny pockets. Walled kitchen courtyards of lemongrass, island thyme and peppers sit beside the pavilions, while passionfruit and dragon fruit climb the warm stone. Along the crest, native sea grape, buttonwood and whitewood are planned to temper the trade winds, and planted roofs move in the breeze.",
    hero: "rustic-modern-aerial",
    specified: false,
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
      "Pale cream coral stone in coursed blocks, warm-white lime plaster, pale teak louvres, white cedar ceilings and dark bronze frames. Crystal water, white sand, and greenery spilling from the roof edges.",
    landscape:
      "Approached along an avenue of palms and clipped lime trees, this beachfront residence is designed with its own orderly fruit forest. Behind the house, groves set out in rows are planned for mango, sapodilla and tamarind, with soursop, guava and Antigua's celebrated black pineapple in the alleys between. A walled kitchen courtyard of citrus, lemongrass and island herbs sits steps from the kitchen. Toward the water, sculptural silver thatch palms, agave and clipped sea grape frame the shore.",
    hero: "beachfront-from-water",
    specified: false,
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
      "Grey-brown rubble stone piers, honey round-log trusses, dark charcoal shingles with flared eaves, timber decks and grey-brown flagstones. Teak, rattan and bronze lanterns against a deep blue dusk.",
    landscape:
      "As dusk settles over the water, lantern light warms stone and timber pavilions arranged around a glassy pool, all designed within their own fruit forest. Landward of the terrace, a rustic grove is planned for mango, sapodilla, tamarind and breadfruit, sheltering soursop, sugar apple, lime and Antigua's sweet black pineapple. A shaded kitchen courtyard of lemongrass, island thyme and passionfruit sits beside the guest pavilion, while an avenue of coconut and sapodilla welcomes you home. At the water's edge, native sea grape, buttonwood and beach morning glory soften the shore.",
    hero: "rustic-modern-pavilion-dusk",
    specified: false,
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
      "Dark charcoal volcanic dry-stack stone, warm teak soffits, weathered timber decks, honed limestone floors and low-iron glass, with aged bronze. Sunset gold on the sea, and aqua pools against dark rock.",
    landscape:
      "Poised above the sea on a dramatic volcanic cliff, this residence is designed with its own sheltered fruit forest. Behind the house, stone-walled terraces are planned for mango, sapodilla, tamarind and genip, with soursop, sugar apple, lime and pomegranate below them and Antigua's sweet black pineapple in sunny pockets. A kitchen courtyard of lemongrass, island thyme and peppers sits steps from the kitchen, beneath a passionfruit pergola. A frangipani crowns the pool terraces, and native agave and sea grape are intended to cling to the cliff edge, sculpted by the wind.",
    hero: "rustic-modern-cliffside",
    specified: false,
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

export const megaPlans = [
  { src: "/estates/mega-estate-aerial/plans/site.webp", label: "Site plan" },
  { src: "/estates/mega-estate-aerial/plans/ground.webp", label: "Main house, ground floor" },
  { src: "/estates/mega-estate-aerial/plans/upper.webp", label: "Main house, upper floor" },
  { src: "/estates/mega-estate-aerial/plans/elevations.webp", label: "Elevations and section" },
  { src: "/estates/mega-estate-aerial/plans/villas-sports.webp", label: "Guest villas, pavilions and sports pavilion" },
  { src: "/estates/mega-estate-aerial/plans/villas.webp", label: "Guest villas and pavilions" },
  { src: "/estates/mega-estate-aerial/plans/cottages.webp", label: "Forecourt cottages and service building" },
] as const;

export const megaKeySpecs = [
  { label: "Site area", value: "5.1 ha" },
  { label: "Enclosed area", value: "4,576 m²" },
  { label: "Buildings", value: "10" },
  { label: "Bedrooms", value: "14" },
  { label: "Pools", value: "2" },
] as const;

assertNoPricesOrExternalUrls(estates, "estates");
assertNoPricesOrExternalUrls(megaPlans, "estate plans");
assertNoPricesOrExternalUrls(megaKeySpecs, "estate specs");
