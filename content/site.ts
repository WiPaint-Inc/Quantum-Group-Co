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
    "Design, engineering, construction and finishing, unified under one roof in Antigua and Barbuda.",
  heroAlt: "From Vision to Handover. One Team.",
  description:
    "Quantum Group Co is one company for the design, engineering, construction and finishing of exceptional homes in Antigua and Barbuda.",
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
  { key: "design-build-contract", kind: "CONFIRM", page: "Full Design and Build Services", needed: "Whether the service is one fixed-scope contract or phased." },
  { key: "engineering-scope", kind: "CONFIRM", page: "Engineering", needed: "In-house engineering scope versus engineers retained per project." },
  { key: "drawing-certification", kind: "CONFIRM", page: "Engineering", needed: "Drawing certification or stamping details. Do not claim sealed drawings until this is answered." },
  { key: "renovation-only", kind: "CONFIRM", page: "Construction", needed: "Whether renovation-only projects are taken." },
  { key: "infrastructure", kind: "CONFIRM", page: "Construction", needed: "Whether infrastructure is offered to private clients or only inside developments." },
  { key: "energy-service", kind: "CONFIRM", page: "Engineering", needed: "Whether energy engineering is a named service." },
  { key: "development-types", kind: "CONFIRM", page: "Developments", needed: "Types and scale of development the company will take on." },
  { key: "development-role", kind: "CONFIRM", page: "Developments", needed: "Whether the company acts only as contractor, or also as co-developer or development manager." },
  { key: "development-projects", kind: "PLACEHOLDER", page: "Developments", needed: "Current or upcoming development projects, if any can be named publicly." },
  { key: "product-line-name", kind: "CONFIRM", page: "Construction Materials Distribution", needed: "Product-line name to use. The VIVID Industrial & Decor wording is behind SHOW_VIVID_PRODUCT_LINES." },
  { key: "showroom", kind: "CONFIRM", page: "Construction Materials Distribution", needed: "Whether there is a showroom, and where." },
  { key: "third-party-materials", kind: "CONFIRM", page: "Construction Materials Distribution", needed: "Whether other brands are distributed, or only the precast lines." },
  { key: "level-5", kind: "CONFIRM", page: "Finishing", needed: "Whether to keep the level 5 sheetrock wording. It is a finish grade, not a certification." },
  { key: "maintenance-plan", kind: "CONFIRM", page: "Finishing", needed: "Whether maintenance is a contract or a service plan." },
  { key: "heritage-1981", kind: "CONFIRM", page: "About", needed: "Wording for the 1981 Italian family construction business, which the brochure says was under a different name." },
  { key: "heritage-dates", kind: "CONFIRM", page: "About", needed: "Approval to keep publishing 1981, 2013, and January 2020." },
  { key: "founding", kind: "PLACEHOLDER", page: "About", needed: "Quantum Group Co founding date and legal entity, if they should be shown." },
  { key: "partner-materials", kind: "PLACEHOLDER", page: "About", needed: "Partner or affiliate company content still awaiting owner materials." },
  { key: "page-16-grouping", kind: "CONFIRM", page: "Partner Portfolio", needed: "How the remaining gallery pages should be grouped. Do not publish a project name until a public caption is approved." },
  { key: "chris-headshot", kind: "PLACEHOLDER", page: "Team", needed: "Headshot for Chris Bento." },
  { key: "chris-bio", kind: "PLACEHOLDER", page: "Team", needed: "Anything further Chris wants in his bio." },
  { key: "marco-card", kind: "CONFIRM", page: "Team", needed: "Confirm Marco Spagnolo's card for public display." },
  { key: "marco-years", kind: "CONFIRM", page: "Team", needed: "The 2022 brochure said 15 years. Update before showing a figure." },
  { key: "marco-degree", kind: "CONFIRM", page: "Team", needed: "Combined wording for the civil engineering degree, energy specialisation, and University of Bologna." },
  { key: "marco-headshot", kind: "PLACEHOLDER", page: "Team", needed: "Headshot for Marco Spagnolo." },
  { key: "luigi-card", kind: "CONFIRM", page: "Team", needed: "Confirm Luigi Spagnolo's card for public display." },
  { key: "luigi-years", kind: "CONFIRM", page: "Team", needed: "The 2022 brochure said 17 years. Update before showing a figure." },
  { key: "luigi-headshot", kind: "PLACEHOLDER", page: "Team", needed: "Headshot for Luigi Spagnolo." },
  { key: "contact-email", kind: "PLACEHOLDER", page: "Contact", needed: "Quantum Group Co email. Do not reuse a partner address." },
  { key: "contact-phone", kind: "PLACEHOLDER", page: "Contact", needed: "Quantum Group Co phone or WhatsApp. Do not reuse a partner number." },
  { key: "contact-address", kind: "PLACEHOLDER", page: "Contact", needed: "Office or showroom address." },
  { key: "contact-social", kind: "PLACEHOLDER", page: "Contact", needed: "Social links." },
  { key: "leadership", kind: "PLACEHOLDER", page: "About", needed: "Leadership names and titles, if they should be shown as Quantum roles. Team cards use partner-company titles only." },
];

export function markersFor(page: string) {
  return markers.filter((marker) => marker.page === page);
}

export const story = {
  title: "One company, built from two crafts.",
  paragraphs: [
    "Quantum Group Co brings together the builders behind VIVID Construction and the master finishers of Wi Paint Inc. VIVID brings Italian construction heritage and engineering, building luxury villas in Antigua since 2013. Wi Paint brings bespoke luxury finishing. Together we are one accountable team, one contract, and one point of contact, carrying a project from renderings and plans through construction to the final coat.",
    "The construction knowledge has its roots in Italy, in a family construction business established in 1981, where it built and renovated complex works. In 2013 that knowledge crossed the Atlantic and luxury villas began to rise in Antigua. In January 2020 the work expanded into precast concrete, with an industrial line and a decor line. The finishing practice brought three principles: quality of work, back-end service, and bespoke finishes.",
    "Today that is one company. Design, engineering, construction and finishing sit under one roof, so nothing falls between the drawing and the last surface.",
  ],
};

export const homeIntro = company.intro;

export type Service = {
  order: number;
  slug: string;
  title: string;
  headline: string;
  lede: string;
  paragraphs: string[];
  points: string[];
  markerKeys: string[];
};

const materialsIntro = {
  withLines:
    "Through the VIVID Industrial & Decor product lines, we produce and supply precast concrete products for builders and private clients. The industrial line is made to make a contractor's work simpler and faster. The decor line is bricks, pavers, planters and pots, benches, and other pieces for interiors, exteriors, gardens and floors.",
  withoutLines:
    "We produce and supply precast concrete products for builders and private clients. One line is made to make a contractor's work simpler and faster. The other is bricks, pavers, planters and pots, benches, and other pieces for interiors, exteriors, gardens and floors.",
};

export const services: Service[] = [
  {
    order: 1,
    slug: "full-design-and-build",
    title: "Full Design and Build Services",
    headline: "From first sketch to final finish, under one roof.",
    lede: "One accountable team, one contract, and one point of contact, from the first planning conversation to handover.",
    paragraphs: [
      "Most luxury builds involve a designer, an engineer, a builder, a finishing contractor and a supplier, each with their own contract. We bring that into one company. You work with one accountable team, sign one contract, and talk to one point of contact, from the first planning conversation through handover and beyond.",
      "On every project we help design from start to finish. When clients need it, we can also procure everything from foundation through to handover. A complete, coordinated full-service package is what we specialise in: one accountable team handling design, construction, finishing and materials so nothing falls between the gaps.",
    ],
    points: [
      "Collaborative design and planning, tailored to the site and the brief",
      "Engineering and construction, coordinated in-house",
      "Finishing trades and materials managed by the same team",
      "One contract and one point of contact throughout",
      "Care through handover and beyond",
    ],
    markerKeys: ["design-build-contract"],
  },
  {
    order: 2,
    slug: "construction",
    title: "Construction",
    headline: "Built with care, built to last.",
    lede: "Luxury villas and homes in Antigua and Barbuda, made to be looked after for years.",
    paragraphs: [
      "We build luxury villas and homes with a focus on quality, safety, and houses that are straightforward to maintain. Careful planning, disciplined site management and quality control are how the home you were promised is the home you receive.",
      "Natural stone, timber, concrete and textured finishes are chosen for the island's sun, salt air and seasonal rain.",
    ],
    points: [
      "New-build luxury villas and residences",
      "Site management and quality control throughout",
      "Materials detailed for the Caribbean climate",
    ],
    markerKeys: ["renovation-only", "infrastructure"],
  },
  {
    order: 3,
    slug: "engineering",
    title: "Engineering",
    headline: "Engineering that makes the design work.",
    lede: "Civil engineering inside the same team that designs and builds, from the first sketch.",
    paragraphs: [
      "Good design depends on sound engineering. Structural thinking shapes the project from the start, not after the drawings are finished. We manage the technical side, from structure and materials to buildability and long-term performance, and keep it aligned with the look of the house.",
      "Energy-conscious design is part of that thinking, so homes stay comfortable in the Caribbean climate.",
    ],
    points: [
      "Civil and structural engineering input",
      "Technical management across design and construction",
      "Experience with concrete and precast elements",
    ],
    markerKeys: ["engineering-scope", "energy-service", "drawing-certification"],
  },
  {
    order: 4,
    slug: "developments",
    title: "Developments",
    headline: "From a single villa to a complete community.",
    lede: "The same one-team approach, carried across multi-unit and larger work.",
    paragraphs: [
      "Planning and design, engineering, construction, finishing and materials can be coordinated by one accountable team. For developers and investors, that means a single point of responsibility and a transparent record of progress.",
    ],
    points: [
      "Coordinated design, construction and finishing",
      "A transparent record for owners, developers and investors",
    ],
    markerKeys: ["development-types", "development-role", "development-projects"],
  },
  {
    order: 5,
    slug: "construction-materials-distribution",
    title: "Construction Materials Distribution",
    headline: "Materials we trust, available to the build.",
    lede: "Precast concrete for contractors and for the house, planned and delivered with the work.",
    paragraphs: [materialsIntro.withoutLines],
    points: [
      "Precast concrete for contractors and developers",
      "Decorative concrete for homes, gardens and outdoor living",
      "Materials planning, purchasing and logistics",
      "Key samples kept for later maintenance",
    ],
    markerKeys: ["product-line-name", "showroom", "third-party-materials"],
  },
];

export function serviceParagraphs(service: Service, vividLines: boolean) {
  if (service.slug !== "construction-materials-distribution" || !vividLines) return service.paragraphs;
  return [materialsIntro.withLines, "Alongside those precast products, we plan, purchase, transport and manage the materials used on our projects, and keep key samples on file for future maintenance."];
}

export function getService(slug: string) {
  return services.find((service) => service.slug === slug) ?? null;
}

export const finishing = {
  slug: "finishing",
  title: "Finishing & Bespoke Surfaces",
  headline: "The final details, done properly.",
  paragraphs: [
    "Finishing is where a luxury home is won or lost. The finishing team carries a project through the last fine details, coordinating the finishing trades for a consistent result on the day of handover.",
  ],
  points: [
    "Painting for new construction and repaints, with preparation and protection before every coat",
    "Textured finishes, plastering and textured faux finishes",
    "Custom stains and pickles, and care for wood finishing",
    "Bespoke work: murals, wallpaper, artwork and colour matching",
    "Tiling in custom patterns, and custom woodwork",
    "Sheetrock installation, repair and finishing",
    "Doors, windows, cabinets, hardware and the last installations",
    "Site cleaning, materials management, and care after handover",
  ],
  markerKeys: ["level-5", "maintenance-plan"],
};

export const howWeWork = {
  title: "How we work",
  headline: "Transparent from first estimate to final invoice.",
  lede: "Every invoice, change order, colour schedule and payment in one shared client folder, built for owners who live off-island.",
  paragraphs: [
    "Most of our clients are international and living off island during construction. Our goal is full transparency. Throughout each project we keep a shared project folder updated with invoices, material orders, change orders and payments, and close with a full project summary so everything remains organised and visible in one place.",
    "We strive to offer creative ways for you to stay involved with your build, whether you are on island or halfway across the world.",
  ],
  points: [
    "Proposals customised per project, with labour, materials, scope and product information",
    "A shared client folder for invoices, change orders, colour schedules, payments and contracts",
    "Records kept so a later repair can find the same material",
    "One accountable team through handover and beyond",
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
    bio: "Leads Wi Paint Inc, Master Painters, a luxury painting and finishing contractor. The practice covers labour and materials for the final fine details of a project, with extensive experience finishing luxury homes and large-scale projects in Antigua and Barbuda.",
    markerKeys: ["chris-headshot", "chris-bio"],
  },
  {
    id: "marco-spagnolo",
    name: "Marco Spagnolo",
    title: "Co-founder, CEO & Project Manager, VIVID Construction",
    confirmed: false,
    bio: "Holds a degree in civil engineering and a specialisation in energy engineering, and completed his engineering studies at the University of Bologna. He manages technical aspects of each project, and the relationship with clients.",
    markerKeys: ["marco-card", "marco-years", "marco-degree", "marco-headshot"],
  },
  {
    id: "luigi-spagnolo",
    name: "Luigi Spagnolo",
    title: "Co-founder, President & Production Director, VIVID Construction",
    confirmed: false,
    bio: "Runs operations and sees that the work meets the standard set for it.",
    markerKeys: ["luigi-card", "luigi-years", "luigi-headshot"],
  },
];

export const robotics = {
  slug: "robotics",
  title: "Robotics",
  headline: "A later chapter for machines on the site.",
  paragraphs: [
    "This page is reserved for how AI and robotics may assist construction, layout and finishing. It is not offered as a service today.",
    "Any future note would stay general. No machine, maker, or supplier is named here.",
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

export const posterImage = "/images/portfolio/ty-compton-jumby-bay-03.jpg";

assertNoPricesOrExternalUrls(
  {
    company,
    markers,
    story,
    homeIntro,
    services,
    finishing,
    howWeWork,
    portfolioIntro,
    team,
    robotics,
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
