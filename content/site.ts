/**
 * Single source for public facts.
 * Replace the placeholder estates, developments, renders, and plans in this file.
 * Do not add prices, client names, private project data, or external URLs.
 */

export type Vec3 = [number, number, number];

export type Massing = "pavilion" | "court" | "lantern";

export type Estate = {
  slug: string;
  name: string;
  epithet: string;
  placeholder: true;
  status: "placeholder";
  setting: string;
  region: "Antigua and Barbuda";
  summary: string;
  narrative: string[];
  finishes: string[];
  composition: string;
  massing: Massing;
  position: Vec3;
  rotation: number;
  plinth: [number, number];
};

export type RenderStudy = {
  id: string;
  estateSlug: string;
  title: string;
  caption: string;
  timeOfDay: string;
  palette: { from: string; to: string };
};

export type PlanStudy = {
  id: string;
  estateSlug: string;
  title: string;
  caption: string;
  sheets: string[];
};

export type Development = {
  slug: string;
  name: string;
  placeholder: true;
  status: "placeholder";
  setting: string;
  summary: string;
  narrative: string[];
  estateSlugs: string[];
};

export type MarketplaceKind = "plan" | "render";
export type IssuanceStandard = "nft" | "ordinal";

export type MarketplaceListing = {
  id: string;
  title: string;
  kind: MarketplaceKind;
  refId: string;
  summary: string;
  standards: IssuanceStandard[];
  status: "teaser";
  availability: "unissued";
};

export type SpaceNode = {
  id: string;
  title: string;
  kicker: string;
  summary: string;
  href: string;
  position: Vec3;
  tint: string;
};

export const company = {
  name: "Quantum Group Co.",
  shortName: "Quantum",
  market: "Antigua and Barbuda",
  marketCountryCode: "AG",
  discipline: "Ultra-luxury residential construction and development",
  tagline: "Residences composed for the Caribbean light.",
  description:
    "Quantum Group Co. builds ultra-luxury houses in Antigua and Barbuda. The work is high-end residential, made with the finest finishes, and composed around light, shade, and water.",
  facts: [
    "Quantum Group Co. is a construction and development company.",
    "The practice is ultra-luxury, high-end residential.",
    "Antigua and Barbuda is the key market.",
    "The work is defined by the finest finishes.",
    "Published estates and developments are placeholders until the owner replaces this file.",
    "Commercial terms are not published.",
    "The marketplace does not mint, open a wallet, or touch a public network.",
  ],
} as const;

export const about = {
  kicker: "The practice",
  title: "Craft, before spectacle.",
  paragraphs: [
    "Quantum Group Co. makes houses for people who already know what they want from light. The rooms are few. The finishes are exact. Antigua and Barbuda is the ground the work is drawn for: trade wind, white-sand glare, and a long gold evening.",
    "We build and we develop. A house here is a construction, not a brochure. Stone, lime, bronze, timber, and glass are specified as a single idea, then carried through to the last joint.",
    "The estates on this site are studies. They hold a standard of composition until a real list takes their place. They are not client projects, and they are not offered as inventory.",
  ],
  principles: [
    {
      id: "light",
      title: "Light",
      body: "Openings are cut for a particular hour. Glare is refused. The afternoon is a material.",
    },
    {
      id: "water",
      title: "Water",
      body: "Courts, channels, and a single pool. Water is kept still so the house can be heard.",
    },
    {
      id: "craft",
      title: "Finish",
      body: "The finest finishes, specified once and not substituted. Lime plaster, oiled timber, bronze screens, and stone that takes the hand.",
    },
    {
      id: "quiet",
      title: "Quiet",
      body: "Fewer rooms than a house of this ambition usually claims. Service is hidden. The plan is calm.",
    },
  ],
} as const;

export const meridian = {
  id: "meridian",
  title: "The Meridian",
  kicker: "Portal",
  summary:
    "Leave the archipelago. The meridian holds the practice, the developments still ahead, and the marketplace of plans and renders.",
  position: [0, 1.35, -7.2] as Vec3,
};

export const estates: Estate[] = [
  {
    slug: "atelier-residence",
    name: "The Atelier Residence",
    epithet: "A long room for the afternoon.",
    placeholder: true,
    status: "placeholder",
    setting: "A leeward shore study",
    region: "Antigua and Barbuda",
    summary:
      "A low house of one deep roof, set back from a pale beach. The principal room runs the length of the view.",
    narrative: [
      "The Atelier Residence is a placeholder study for a leeward shore. It is not a client house. The plan is a single bar, lifted just clear of the sand, with a bronze screen along the west and a court of still water on the lee side.",
      "Finishes are few and carried through: lime plaster, a limestone floor, and timber ceilings left visible. Shade is made by the roof, not by ornament.",
    ],
    finishes: ["Lime plaster", "Limestone floors", "Bronze screens", "Visible timber ceilings"],
    composition: "One bar, one court, one deep roof.",
    massing: "pavilion",
    position: [-7.4, 0, -0.2],
    rotation: 0.45,
    plinth: [2.5, 1.25],
  },
  {
    slug: "white-pavilion",
    name: "The White Pavilion",
    epithet: "Rooms held in a single shade.",
    placeholder: true,
    status: "placeholder",
    setting: "A pale shore study",
    region: "Antigua and Barbuda",
    summary:
      "A sequence of white rooms under one roof, arranged so the glare never enters whole.",
    narrative: [
      "The White Pavilion is a placeholder. It studies how a house on open sand can stay dim at noon without turning its back on the water.",
      "Walls are thick. Openings are tall and narrow, then suddenly a full bay. The finish is plaster, stone, and a bronze edge at every threshold.",
    ],
    finishes: ["Thick lime plaster", "Honed stone", "Bronze thresholds", "Linen shade"],
    composition: "A run of rooms, a shaded gallery, a short pool.",
    massing: "pavilion",
    position: [-2.5, 0, 1.8],
    rotation: -0.25,
    plinth: [2.2, 1.45],
  },
  {
    slug: "lantern-house",
    name: "The Lantern House",
    epithet: "One room for the evening.",
    placeholder: true,
    status: "placeholder",
    setting: "A windward rise study",
    region: "Antigua and Barbuda",
    summary:
      "A compact house with a single upper room that takes the last gold of the day.",
    narrative: [
      "The Lantern House is a placeholder for a windward rise. The lower floor is closed and cool. Above it, one room is glazed to the west and lined in timber.",
      "It is a study in restraint: two levels, a short stair, and a finish list that could be read aloud.",
    ],
    finishes: ["Oiled timber", "Limewash", "Bronze hardware", "Clear glass"],
    composition: "A closed base and a single glowing room.",
    massing: "lantern",
    position: [2.1, 0, -1.9],
    rotation: 0.2,
    plinth: [1.7, 1.7],
  },
  {
    slug: "quiet-court",
    name: "The Quiet Court",
    epithet: "Four wings and a pool.",
    placeholder: true,
    status: "placeholder",
    setting: "An inland garden study",
    region: "Antigua and Barbuda",
    summary:
      "Four short wings around a court of water. The garden is the view. The horizon is implied.",
    narrative: [
      "The Quiet Court is a placeholder for an inland site, where the luxury is shade and the sound of water rather than a panorama.",
      "Each wing is one room. The court is stone. Planting is kept outside the walls so the interior stays quiet.",
    ],
    finishes: ["Stone court", "Lime plaster", "Dark timber", "Bronze rain chains"],
    composition: "Four wings, one still pool, no grand stair.",
    massing: "court",
    position: [6.6, 0, 0.7],
    rotation: -0.4,
    plinth: [2.15, 2.15],
  },
  {
    slug: "harbour-study",
    name: "The Harbour Study",
    epithet: "Few openings. Exact joinery.",
    placeholder: true,
    status: "placeholder",
    setting: "A harbour-edge study",
    region: "Antigua and Barbuda",
    summary:
      "A waterfront house of measured openings and joinery cut to the millimetre. A study, not a berth.",
    narrative: [
      "The Harbour Study is a placeholder for a quiet edge of working water. It does not name a harbour. The house is a long plinth with a single gallery and a room for looking, not for display.",
      "Joinery is the finish. Panels, shutters, and a bronze screen are drawn as one set.",
    ],
    finishes: ["Fitted joinery", "Shutters", "Bronze screen", "Dark stone"],
    composition: "A long plinth, a gallery, a looking room.",
    massing: "pavilion",
    position: [3.4, 0, 3.6],
    rotation: 0.85,
    plinth: [2.6, 1.15],
  },
];

export const renders: RenderStudy[] = [
  {
    id: "render-atelier-dusk",
    estateSlug: "atelier-residence",
    title: "Dusk, west screen",
    caption: "The bronze screen against the last light. A study plate, not a photograph of a built house.",
    timeOfDay: "Dusk",
    palette: { from: "#12343c", to: "#e0b07a" },
  },
  {
    id: "render-pavilion-noon",
    estateSlug: "white-pavilion",
    title: "Noon, shaded gallery",
    caption: "White rooms kept dim while the shore glare stays outside.",
    timeOfDay: "Noon",
    palette: { from: "#f4efe6", to: "#8fd4cb" },
  },
  {
    id: "render-lantern-evening",
    estateSlug: "lantern-house",
    title: "Evening, upper room",
    caption: "The lantern room taking the gold hour. A drawn study.",
    timeOfDay: "Evening",
    palette: { from: "#1a120c", to: "#e6c48a" },
  },
  {
    id: "render-court-morning",
    estateSlug: "quiet-court",
    title: "Morning, the court",
    caption: "Still water and four short wings. Shade arrives before the guests.",
    timeOfDay: "Morning",
    palette: { from: "#0e2428", to: "#d7c4a2" },
  },
  {
    id: "render-harbour-overcast",
    estateSlug: "harbour-study",
    title: "Overcast, the gallery",
    caption: "Joinery and a narrow view to working water. No vessel is shown.",
    timeOfDay: "Overcast",
    palette: { from: "#243038", to: "#c9c2b4" },
  },
];

export const plans: PlanStudy[] = [
  {
    id: "plan-atelier-01",
    estateSlug: "atelier-residence",
    title: "Atelier plan set",
    caption: "Plan, section, and a west elevation. A measured study, unissued.",
    sheets: ["Plan", "Long section", "West elevation"],
  },
  {
    id: "plan-pavilion-01",
    estateSlug: "white-pavilion",
    title: "Pavilion plan set",
    caption: "The sequence of rooms and the shaded gallery.",
    sheets: ["Plan", "Cross section", "Bay detail"],
  },
  {
    id: "plan-lantern-01",
    estateSlug: "lantern-house",
    title: "Lantern plan set",
    caption: "Lower plan, upper plan, and the short stair.",
    sheets: ["Lower plan", "Upper plan", "Stair section"],
  },
  {
    id: "plan-court-01",
    estateSlug: "quiet-court",
    title: "Court plan set",
    caption: "Four wings and the stone court between them.",
    sheets: ["Plan", "Court section", "Wall detail"],
  },
  {
    id: "plan-harbour-01",
    estateSlug: "harbour-study",
    title: "Harbour plan set",
    caption: "Gallery, looking room, and the joinery elevation.",
    sheets: ["Plan", "Gallery elevation", "Joinery section"],
  },
];

export const developments: Development[] = [
  {
    slug: "leeward-sequence",
    name: "The Leeward Sequence",
    placeholder: true,
    status: "placeholder",
    setting: "A studied leeward shore",
    summary:
      "A short line of houses sharing one idea of roof, screen, and court. A development study, not a released site.",
    narrative: [
      "The Leeward Sequence is a placeholder for a future shore development. It imagines a few houses, not a resort, each with its own court and a shared discipline of finish.",
      "Nothing here is a named client project. The study exists so the standard can be discussed before land and lists are real.",
    ],
    estateSlugs: ["atelier-residence", "white-pavilion"],
  },
  {
    slug: "ridge-collection",
    name: "The Ridge Collection",
    placeholder: true,
    status: "placeholder",
    setting: "A windward ridge study",
    summary:
      "Elevated houses in the trade wind. Fewer, higher, and closed to the noon.",
    narrative: [
      "The Ridge Collection is a placeholder development for higher ground. Houses sit apart. The finish is timber, limewash, and glass cut small against the wind.",
      "It is a study of siting, not a map of parcels.",
    ],
    estateSlugs: ["lantern-house"],
  },
  {
    slug: "harbour-quiet",
    name: "Harbour Quiet",
    placeholder: true,
    status: "placeholder",
    setting: "An unnamed harbour edge",
    summary:
      "A small ensemble at the water, concerned with joinery and a civil relationship to working boats.",
    narrative: [
      "Harbour Quiet is a placeholder. It does not identify a port. The idea is a few houses that do not perform wealth toward the water.",
      "The associated estate study is The Harbour Study, together with the inland Quiet Court as a counterpoint.",
    ],
    estateSlugs: ["harbour-study", "quiet-court"],
  },
];

export const marketplaceListings: MarketplaceListing[] = [
  {
    id: "listing-plan-atelier",
    title: "Atelier plan set",
    kind: "plan",
    refId: "plan-atelier-01",
    summary:
      "A future issuance of the Atelier plan set, contemplated as an NFT or a Bitcoin Ordinal for a private buyer. Nothing is issued.",
    standards: ["nft", "ordinal"],
    status: "teaser",
    availability: "unissued",
  },
  {
    id: "listing-plan-court",
    title: "Court plan set",
    kind: "plan",
    refId: "plan-court-01",
    summary:
      "The Quiet Court drawings, held for a later private issuance. Unissued.",
    standards: ["ordinal", "nft"],
    status: "teaser",
    availability: "unissued",
  },
  {
    id: "listing-render-lantern",
    title: "Lantern evening plate",
    kind: "render",
    refId: "render-lantern-evening",
    summary:
      "The evening plate of the Lantern House, a render study reserved for a future issuance. Unissued.",
    standards: ["nft", "ordinal"],
    status: "teaser",
    availability: "unissued",
  },
  {
    id: "listing-render-atelier",
    title: "Atelier dusk plate",
    kind: "render",
    refId: "render-atelier-dusk",
    summary:
      "The dusk plate of the Atelier Residence. A teaser only. No token and no ordinal exists.",
    standards: ["ordinal"],
    status: "teaser",
    availability: "unissued",
  },
];

export const spaceNodes: SpaceNode[] = [
  {
    id: "vision",
    title: "Vision",
    kicker: "The practice",
    summary:
      "What the company is for: ultra-luxury houses in Antigua and Barbuda, built with the finest finishes.",
    href: "/about",
    position: [-4.4, 1.15, 0.2],
    tint: "#e6d2a8",
  },
  {
    id: "future",
    title: "The Future",
    kicker: "Developments",
    summary:
      "Placeholder developments. A leeward sequence, a ridge collection, and a quiet harbour edge.",
    href: "/developments",
    position: [-1.3, 2.1, -1.4],
    tint: "#9fd0ea",
  },
  {
    id: "marketplace",
    title: "Marketplace",
    kicker: "Plans and renders",
    summary:
      "A private issuance, later, of plans and renders as NFTs or Bitcoin Ordinals. The door is a waitlist. Minting is not live.",
    href: "/marketplace",
    position: [2.2, 1.25, 0.4],
    tint: "#8fd4cb",
  },
  {
    id: "craft",
    title: "Craft",
    kicker: "Finishes",
    summary:
      "Lime, stone, bronze, timber. The standard the placeholder houses are trying to hold.",
    href: "/about#craft",
    position: [4.6, 2.0, -1.1],
    tint: "#f4efe6",
  },
];

export const clientArea = {
  kicker: "Private atelier",
  title: "A room for the houses, when they are real.",
  summary:
    "The client area is a shell. Sign-in creates a placeholder session in this browser. It is not an identity provider, and it does not open a house.",
  extension: {
    id: "residence-os",
    title: "Residence applications",
    status: "unmounted" as const,
    mountPath: "/client/homes/[slug]",
    summary:
      "Each future house can receive its own application in this slot. Phase 1 renders the slot only. No per-home app is mounted.",
  },
};

export const realms = {
  ocean: {
    id: "ocean" as const,
    label: "Archipelago",
    kicker: "Antigua and Barbuda",
    title: "Houses for the light.",
    lede: "Ultra-luxury residences, composed with the finest finishes. Select a study on the water.",
  },
  space: {
    id: "space" as const,
    label: "Meridian",
    kicker: "Vision, future, marketplace",
    title: "The longer field.",
    lede: "The practice, the developments ahead, and a marketplace of plans and renders that is not yet open.",
  },
};

const commercialTerm =
  /\$\s?\d|\bprices?\b|\bpricing\b|\busd\b|\bxcd\b|\beur\b|€|£\s?\d/i;

function assertPublishable(value: unknown) {
  const blob = JSON.stringify(value);
  if (commercialTerm.test(blob)) {
    throw new Error("Public content must not include prices or commercial terms.");
  }
  if (/https?:\/\//i.test(blob)) {
    throw new Error("Public content must not include external URLs.");
  }
}

assertPublishable({
  company,
  about,
  meridian,
  estates,
  renders,
  plans,
  developments,
  marketplaceListings,
  spaceNodes,
  clientArea,
  realms,
});

export function getEstate(slug: string) {
  return estates.find((estate) => estate.slug === slug) ?? null;
}

export function getDevelopment(slug: string) {
  return developments.find((item) => item.slug === slug) ?? null;
}

export function getRender(id: string) {
  return renders.find((item) => item.id === id) ?? null;
}

export function getPlan(id: string) {
  return plans.find((item) => item.id === id) ?? null;
}

export function getListing(id: string) {
  return marketplaceListings.find((item) => item.id === id) ?? null;
}

export function rendersForEstate(slug: string) {
  return renders.filter((item) => item.estateSlug === slug);
}

export function plansForEstate(slug: string) {
  return plans.filter((item) => item.estateSlug === slug);
}

export type FocusTarget = {
  id: string;
  realm: "ocean" | "space";
  position: Vec3;
  title: string;
};

export function focusTarget(id: string): FocusTarget | null {
  const estate = getEstate(id);
  if (estate) {
    return { id: estate.slug, realm: "ocean", position: estate.position, title: estate.name };
  }
  if (id === meridian.id) {
    return { id: meridian.id, realm: "ocean", position: meridian.position, title: meridian.title };
  }
  const node = spaceNodes.find((item) => item.id === id);
  if (node) {
    return { id: node.id, realm: "space", position: node.position, title: node.title };
  }
  return null;
}
