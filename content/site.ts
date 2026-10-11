import { atmosphereImages, getPortfolioProject, portfolioProjects, type PortfolioProject } from "@/content/portfolio";
import { assertNoPricesOrExternalUrls } from "@/lib/public-copy";

export { atmosphereImages, getPortfolioProject, portfolioProjects };
export type { PortfolioProject };

export const company = {
  name: "Quantum Group Co",
  shortName: "Quantum",
  market: "Antigua and Barbuda",
  marketCountryCode: "AG",
  tagline: "Design · Engineer · Build · Finish",
  heroTitle: "One Company. Every Detail.",
  heroSub:
    "Renderings, design, engineering and plans, construction, finishing and materials, all under one company in Antigua and Barbuda.",
  heroAlts: ["Design. Engineer. Build. Finish.", "The Future of Luxury Building in Antigua."],
  description:
    "Renderings, design, engineering and plans, construction, finishing and in-house materials, under one company. Quantum Group Co designs, engineers, builds and finishes exceptional homes in Antigua and Barbuda.",
  intro:
    "We are designers, engineers, and builders who specialize in creating unique properties. Our work centers on organic colours and natural materials: stone, timber, concrete, textured finishes and surfaces chosen for how they perform and age under Antigua's climate and light. Between our partners we bring more than 30 years of combined experience building and finishing projects across Antigua and Barbuda.",
} as const;

export type Marker = {
  key: string;
  kind: "PLACEHOLDER" | "CONFIRM";
  page: string;
  needed: string;
};

export const markers: Marker[] = [
  { key: "design-build-contract", kind: "CONFIRM", page: "Full Design and Build Services", needed: "Is Full Design and Build offered as a single fixed-scope contract, or structured in phases?" },
  { key: "rendering-media", kind: "CONFIRM", page: "Full Rendering, Design, Engineering & Plans", needed: "interior, exterior, or both? Still images, animations or walkthroughs?" },
  { key: "engineering-scope", kind: "CONFIRM", page: "Full Rendering, Design, Engineering & Plans", needed: "in-house engineering scope versus engineers retained per project" },
  { key: "drawing-sets", kind: "CONFIRM", page: "Full Rendering, Design, Engineering & Plans", needed: "which drawing sets are included, for example architectural, structural, MEP, and who submits for planning approval" },
  { key: "plans-only", kind: "CONFIRM", page: "Full Rendering, Design, Engineering & Plans", needed: "can clients commission plans only, without a build contract?" },
  { key: "drawing-certification", kind: "CONFIRM", page: "Full Rendering, Design, Engineering & Plans", needed: "drawing certification / stamping details" },
  { key: "renovation-only", kind: "CONFIRM", page: "Construction", needed: "does Quantum take on renovation-only projects?" },
  { key: "infrastructure", kind: "CONFIRM", page: "Construction", needed: "is infrastructure offered to private clients, or only within developments?" },
  { key: "engineering-drawings", kind: "CONFIRM", page: "Engineering", needed: "exact scope, and whether drawings are produced in-house or by retained engineers" },
  { key: "energy-service", kind: "CONFIRM", page: "Engineering", needed: "is energy engineering offered as a named service?" },
  { key: "development-types", kind: "CONFIRM", page: "Developments", needed: "types and scale of development Quantum will take on" },
  { key: "development-role", kind: "CONFIRM", page: "Developments", needed: "does Quantum act only as contractor, or also as co-developer or development manager?" },
  { key: "development-projects", kind: "PLACEHOLDER", page: "Developments", needed: "current or upcoming development projects, if any can be named publicly" },
  { key: "product-line-name", kind: "CONFIRM", page: "Construction Materials Distribution", needed: "product-line name to use on the Quantum site" },
  { key: "precast-2020", kind: "CONFIRM", page: "About", needed: "January 2020 precast date" },
  { key: "showroom", kind: "CONFIRM", page: "Construction Materials Distribution", needed: "is there a showroom, and where?" },
  { key: "third-party-materials", kind: "CONFIRM", page: "Construction Materials Distribution", needed: "does Quantum distribute other brands' materials, or only its own precast lines?" },
  { key: "level-5", kind: "CONFIRM", page: "Finishing", needed: "keep level 5? It is a technical finish grade, not a certification." },
  { key: "maintenance-plan", kind: "CONFIRM", page: "Finishing", needed: "is maintenance offered as a contract or a service plan?" },
  { key: "heritage-finishing", kind: "PLACEHOLDER", page: "About", needed: "finishing heritage. No dates until the final copy arrives." },
  { key: "heritage-construction", kind: "PLACEHOLDER", page: "About", needed: "construction heritage. No dates until the final copy arrives." },
  { key: "heritage-join", kind: "PLACEHOLDER", page: "About", needed: "how the two practices became one company. No date until the final copy arrives." },
  { key: "heritage-dates", kind: "CONFIRM", page: "About", needed: "Approval to keep publishing 2013 and January 2020. Italian roots stay, with no year." },
  { key: "founding", kind: "PLACEHOLDER", page: "About", needed: "Quantum Group Co founding date and legal entity, if they should be shown." },
  { key: "partner-materials", kind: "PLACEHOLDER", page: "About", needed: "partner/affiliate company content — awaiting owner materials" },
  { key: "page-16-grouping", kind: "CONFIRM", page: "Partner Portfolio", needed: "page-16 project grouping" },
  { key: "chris-headshot", kind: "PLACEHOLDER", page: "Team", needed: "Headshot for Chris Bento." },
  { key: "chris-bio", kind: "PLACEHOLDER", page: "Team", needed: "Anything further Chris wants in his bio." },
  { key: "marco-years", kind: "CONFIRM", page: "Team", needed: "15 years is as stated in the 2022 brochure. Update before showing a figure." },
  { key: "marco-degree", kind: "CONFIRM", page: "Team", needed: "Combined wording for the civil engineering degree, energy specialisation, and University of Bologna." },
  { key: "marco-headshot", kind: "PLACEHOLDER", page: "Team", needed: "Headshot for Marco Spagnolo." },
  { key: "contact-phone-email", kind: "PLACEHOLDER", page: "Contact", needed: "contact phone/email" },
  { key: "contact-email", kind: "PLACEHOLDER", page: "Contact", needed: "Quantum Group Co email. Do not reuse a partner address." },
  { key: "contact-phone", kind: "PLACEHOLDER", page: "Contact", needed: "Quantum Group Co phone or WhatsApp. Do not reuse a partner number." },
  { key: "contact-address", kind: "PLACEHOLDER", page: "Contact", needed: "Office or showroom address." },
  { key: "contact-social", kind: "PLACEHOLDER", page: "Contact", needed: "Social links." },
  { key: "leadership", kind: "PLACEHOLDER", page: "About", needed: "leadership names/titles, if owner wants them shown" },
  { key: "representative", kind: "PLACEHOLDER", page: "Your Build, Live", needed: "Name of the designated Representative, if one should be shown." },
  { key: "eco-credentials", kind: "PLACEHOLDER", page: "About", needed: "eco credentials. Do not claim a certification, or an energy or performance figure, until the owner supplies it." },
];

export function markersFor(page: string) {
  return markers.filter((marker) => marker.page === page);
}

export const fullServiceCopy =
  "Most luxury builds involve a designer, an engineer, a builder, a finishing contractor and a supplier, each with their own contract and their own idea of who is responsible. We bring every one of those stages into one company, under a single contract covering every stage, from the first rendering to handover and beyond, with materials supplied in-house.";

export const transparencyCopy = [
  "Most of our clients are international and living off island during construction. Our goal is full transparency. Throughout each project we keep a shared project folder updated with invoices, material orders, change orders and payments, and close with a full project summary so everything remains organised and visible in one place.",
  "We strive to offer creative ways for you to stay involved with your build, whether you're on island or halfway across the world.",
] as const;

export const story = {
  title: "One company, built on two crafts.",
  body: "Quantum Group Co brings together the builders behind VIVID Construction and the master finishers of Wi Paint Inc. VIVID brings Italian construction heritage and engineering, from Italian roots in a family construction business, and has been building luxury villas in Antigua since 2013. Precast lines followed in January 2020. Wi Paint brings bespoke luxury finishing, shaped by three principles: quality of work, back-end service, and bespoke finishes. Together, that heritage makes possible a single contract covering every stage, from renderings and plans through construction to the final coat, with materials supplied in-house and full transparency for owners who live off-island.",
};

export const homeIntro = company.intro;

export const philosophy = {
  title: "Natural luxury.",
  paragraphs: [
    "The work is eco-friendly natural luxury. Houses are designed with the plants and the natural features of the site: local coral stone, timber, green roofs and native planting, so a home sits in the land rather than on top of it.",
    "Every home is designed with its own fruit forest or edible landscape, drawn into the plan with the house.",
  ],
  ecoSlot: "[PLACEHOLDER: eco credentials]",
};

export type Service = {
  order: number;
  slug: string;
  title: string;
  headline: string;
  lede: string;
  paragraphs: string[];
  points: string[];
  markerKeys: string[];
  related?: { href: string; label: string }[];
};

const materialsIntro = {
  withLines:
    "Through our VIVID Industrial & Decor product lines, we produce and supply precast concrete products for builders and private clients.",
  withoutLines: "We produce and supply precast concrete products for builders and private clients.",
};

const materialsRest = [
  "One line is precast concrete elements made to make a contractor's project simpler, more economical and faster to complete. The other is concrete bricks, pavers, planters and pots, benches and more, for interiors, exteriors, gardens and floors.",
  "Alongside those precast products, we plan, purchase, transport and manage the materials used on our projects, and keep key samples on file for future maintenance and renovation.",
];

export const services: Service[] = [
  {
    order: 1,
    slug: "full-design-and-build",
    title: "Full Design and Build Services",
    headline: "From first sketch to final finish, under one roof.",
    lede: "Every project is different, so the approach is shaped around the site and the brief.",
    paragraphs: [
      fullServiceCopy,
      "Every project is different, so we shape our approach around yours. We begin with collaborative design and planning, carry the work through engineering and construction, and finish every surface to the standard a luxury home demands. Because design, construction, finishing and materials all sit inside one company, decisions made at the drawing board carry through to the final coat.",
    ],
    points: [
      "Collaborative design and planning, tailored to your site and brief",
      "Engineering and construction, coordinated in-house",
      "Finishing trades and materials managed in-house",
      "A single contract covering every stage",
      "Care through handover and beyond",
    ],
    markerKeys: ["design-build-contract"],
  },
  {
    order: 2,
    slug: "rendering-design-engineering-plans",
    title: "Full Rendering, Design, Engineering & Plans",
    headline: "See your home before the first foundation is poured.",
    lede: "From a concept to a complete, buildable set of plans.",
    paragraphs: [
      "We take your ideas from concept to a complete, buildable set of plans. Our design process starts with 3D renderings and visualisations, so you can walk through spaces, test materials and see how natural light falls across a room before any decisions are fixed. From there we move into design development, refining layouts, finishes and details with you, and then into engineering and full construction plans and drawings.",
      "Because the company that draws your home also builds and finishes it, the plans are made to be built. Structure, services, materials and finishes are thought through together, so fewer surprises reach the site. Those studies are also the basis for a later private marketplace of renders and plans.",
    ],
    points: [
      "3D renderings and visualisations",
      "Design development: layouts, materials, finishes and details",
      "Engineering input from the start",
      "Full construction plans and drawings",
      "Plans available as a standalone service",
    ],
    markerKeys: ["rendering-media", "engineering-scope", "drawing-sets", "plans-only", "drawing-certification"],
    related: [{ href: "/marketplace", label: "Renders and plans" }],
  },
  {
    order: 3,
    slug: "construction",
    title: "Construction",
    headline: "Built with care, built to last.",
    lede: "Luxury villas and homes in Antigua and Barbuda, built to be looked after for years.",
    paragraphs: [
      "We build luxury villas and homes in Antigua and Barbuda with a focus on exceptional quality and safety, and on homes that are easy to maintain for years to come. Careful planning, disciplined site management and quality control at every stage mean the home you were promised is the home you receive.",
      "Natural stone, timber, concrete and textured finishes are chosen and detailed to suit the island's climate, its sun, salt air and seasonal rain, so your home stays beautiful long after handover.",
    ],
    points: [
      "New-build luxury villas and residences",
      "Renovations and extensions",
      "Site management and quality control throughout",
      "Infrastructure works",
    ],
    markerKeys: ["renovation-only", "infrastructure"],
  },
  {
    order: 4,
    slug: "engineering",
    title: "Engineering",
    headline: "Engineering that makes the design work.",
    lede: "Civil engineering inside the same company that designs and builds, from the first sketch.",
    paragraphs: [
      "Good design depends on sound engineering. Our civil engineering expertise sits inside the same company that designs and builds your home, so structural thinking shapes the project from the first sketch, not after it. We manage the technical side of every project, from structure and materials to buildability and long-term performance, and keep it aligned with the look and feel you want.",
      "We also bring a focus on energy-conscious design, so homes are comfortable in the Caribbean climate and efficient to run.",
    ],
    points: [
      "Civil and structural engineering input",
      "Energy-conscious design considerations",
      "Technical management across design and construction",
      "Experience with complex works, including concrete and precast elements",
    ],
    markerKeys: ["engineering-drawings", "energy-service", "drawing-certification"],
  },
  {
    order: 5,
    slug: "developments",
    title: "Developments",
    headline: "From a single villa to a complete community.",
    lede: "The same single-company offering, carried across a larger site.",
    paragraphs: [
      "We bring the same complete, single-company offering to multi-unit and larger-scale projects: planning and design, engineering, construction, finishing and materials, all under one contract. For developers and investors, that means in-house materials, consistent quality across every unit, and a transparent record of progress and spending at every stage.",
    ],
    points: [
      "Multi-unit residential and resort-style developments",
      "Coordinated design, construction and finishing across every unit",
      "Transparent project records for owners, developers and investors",
      "Development partnerships",
    ],
    markerKeys: ["development-types", "development-role", "development-projects"],
  },
  {
    order: 6,
    slug: "construction-materials-distribution",
    title: "Construction Materials Distribution",
    headline: "Materials we trust, available to every builder.",
    lede: "Precast concrete for contractors and for the house, planned and delivered with the work.",
    paragraphs: [materialsIntro.withoutLines],
    points: [
      "Precast concrete for contractors and developers",
      "Decorative concrete for homes, gardens and outdoor living",
      "Materials planning, purchasing and logistics",
      "Showroom visits by appointment",
      "Distribution of third-party materials",
    ],
    markerKeys: ["product-line-name", "showroom", "third-party-materials"],
  },
];

export function serviceParagraphs(service: Service, vividLines: boolean) {
  if (service.slug !== "construction-materials-distribution") return service.paragraphs;
  const lead = vividLines ? materialsIntro.withLines : materialsIntro.withoutLines;
  return [lead, ...materialsRest];
}

export function getService(slug: string) {
  return services.find((service) => service.slug === slug) ?? null;
}

export const finishing = {
  slug: "finishing",
  title: "Finishing & Bespoke Surfaces",
  headline: "The final details, done properly.",
  paragraphs: [
    "Finishing is where a luxury home is won or lost. Our finishing division carries every project through the last fine details to completion, with every finishing trade in-house for a faster finish and consistent quality on the day of handover.",
  ],
  points: [
    "Painting: new construction and repaints, with preparation and protection before every coat",
    "Textured finishes: trowel-on textures, plastering and textured faux finishes",
    "Staining and pickling: custom stains and pickles mixed in-house, and care for wood finishing",
    "Bespoke finishes: murals, wallpaper, artwork and colour matching",
    "Tiling in custom patterns and layouts",
    "Carpentry: custom woodwork for bespoke spaces",
    "Sheetrock installation, repair and finishing, up to a level 5 finish",
    "Installations: doors, windows, cabinets, hardware and furniture, coordinated before handover",
    "Site maintenance and final construction cleaning",
    "Materials management, including key samples kept for the future",
    "Maintenance and ongoing care after handover",
  ],
  markerKeys: ["level-5", "maintenance-plan"],
};

export const howWeWork = {
  title: "How we work",
  headline: "Transparent from first estimate to final invoice.",
  lede: "Every invoice, change order, colour schedule and payment in one shared client folder, built for owners who live off-island.",
  paragraphs: [
    "Most of our clients live off-island, so we built our process around trust and visibility.",
    ...transparencyCopy,
  ],
  points: [
    "Detailed estimates, customised per project, with labour, materials, product information, costs by room and surface, and a detailed scope of work",
    "A shared client folder for invoices, change orders, colour schedules, payment schedules and contracts",
    "Careful record keeping, so a later repair can find the same material and colour",
    "Preparation, protection and craftsmanship on every surface",
    "One contract, every stage: renderings and plans through construction, finishing and in-house materials, through handover and beyond",
  ],
};

export const portfolioIntro =
  "Selected work by our partners includes luxury homes at Jumby Bay, Barbuda, Mill Reef and Willikies, among them Delphis, Ty Compton and Lazy Lizard at Jumby Bay; Casitas, Barbuda; Aquamarine and Bodmer at Mill Reef; and Cinnamint Hill, Willikies.";

export type TeamMember = {
  id: string;
  name: string;
  title: string;
  confirmed: boolean;
  bio: string;
  markerKeys: string[];
};

export const team: TeamMember[] = [
  {
    id: "chris-bento",
    name: "Chris Bento",
    title: "CEO, Wi Paint Inc",
    confirmed: true,
    bio: "Leads Wi Paint Inc, Master Painters, a luxury painting and finishing contractor offering all-inclusive painting and finishing services, covering labour and materials for the final fine details of a project, with extensive experience finishing luxury homes and large-scale projects in Antigua and Barbuda.",
    markerKeys: ["chris-headshot", "chris-bio"],
  },
  {
    id: "marco-spagnolo",
    name: "Marco Spagnolo",
    title: "Co-founder, CEO & Project Manager, VIVID Construction",
    confirmed: true,
    bio: "Holds a degree in civil engineering and a specialisation in energy engineering, and completed his engineering studies at the University of Bologna. He manages the technical aspects of each project, and the relationship with clients.",
    markerKeys: ["marco-years", "marco-degree", "marco-headshot"],
  },
];

export const robotics = {
  slug: "robotics",
  title: "Robotics",
  headline: "A later chapter for machines on the site.",
  paragraphs: [
    "This page is reserved for robotics in construction, layout and finishing. It is not offered as a service today.",
    "Any future note would stay general. No machine, maker, or supplier is named here.",
  ],
};

export const buildLive = {
  kicker: "Your Build, Live",
  title: "Your build, live.",
  lede: "Weekly progress, a WhatsApp channel, a Slack channel, and a weekly video meeting. The service is customised per client, with a designated Representative and a private project app.",
  points: [
    "Weekly progress updates",
    "WhatsApp and Slack channels",
    "Weekly video meetings",
    "A service customised per client",
    "A designated Representative",
    "A private project app",
  ],
};

export const clientArea = {
  kicker: "Client folder",
  title: "One place for the life of the build.",
  summary: howWeWork.lede,
  extension: {
    id: "residence-os",
    title: "Residence applications",
    status: "unmounted" as const,
    mountPath: "/client/homes/[slug]",
    summary: "A future per-home application can mount here. Phase 1 renders the slot only.",
  },
};

export const marketplaceListings = [
  {
    id: "listing-plan-study",
    title: "Construction plan set",
    kind: "plan" as const,
    refId: "plan-study-01",
    summary: "A future private issuance of a plan set, contemplated as an NFT or a Bitcoin Ordinal. Nothing is issued.",
    standards: ["nft", "ordinal"] as const,
    status: "teaser" as const,
    availability: "unissued" as const,
  },
  {
    id: "listing-render-study",
    title: "Render plate",
    kind: "render" as const,
    refId: "render-study-01",
    summary: "A future private issuance of a render plate. Nothing is issued. No wallet and no network.",
    standards: ["nft", "ordinal"] as const,
    status: "teaser" as const,
    availability: "unissued" as const,
  },
];

export type MarketplaceListing = (typeof marketplaceListings)[number];

export type IssuanceStandard = "nft" | "ordinal";

export const plans = [
  {
    id: "plan-study-01",
    title: "Plan study",
    caption: "An unissued set of construction drawings, held for a later private issuance.",
    sheets: ["Plans", "Sections", "Elevations"],
  },
];

export const renders = [
  {
    id: "render-study-01",
    title: "Render study",
    caption: "An unissued visualisation. Not a photograph of a specific commission.",
    palette: { from: "#14110e", to: "#c6a36a" },
  },
];

export function getListing(id: string) {
  return marketplaceListings.find((item) => item.id === id) ?? null;
}

export function getPlan(id: string) {
  return plans.find((item) => item.id === id) ?? null;
}

export function getRender(id: string) {
  return renders.find((item) => item.id === id) ?? null;
}

export const stages = [
  {
    id: "design",
    kicker: "Design",
    title: "The first drawing.",
    body: "Renderings and a concept, before the ground is touched.",
  },
  {
    id: "engineer",
    kicker: "Engineer",
    title: "The lines that hold.",
    body: "Plans and structure, drawn so the house can be built.",
  },
  {
    id: "build",
    kicker: "Build",
    title: "Stone, concrete, mass.",
    body: "The house becomes solid. The climate is already in the specification.",
  },
  {
    id: "finish",
    kicker: "Finish",
    title: "The last surface.",
    body: "Timber, plaster, glass and warm light. The villa over a dark sea.",
  },
] as const;

assertNoPricesOrExternalUrls(
  {
    company,
    markers,
    story,
    homeIntro,
    philosophy,
    services,
    finishing,
    howWeWork,
    portfolioIntro,
    team,
    robotics,
    buildLive,
    clientArea,
    marketplaceListings,
    plans,
    renders,
    stages,
    portfolioProjects,
    atmosphereImages,
    publishedServices: services.map((service) => serviceParagraphs(service, true)),
  },
  "content",
);
