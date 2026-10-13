import { islandPosition, islandScaleFor, type IslandForm, type IslandKind, type IslandSize } from "@/src/journey/path";

export type { IslandForm, IslandKind, IslandSize };

export type OceanStop = {
  id: string;
  short: string;
  tag: string;
  title: string;
  line: string;
  href: string;
  cta: string;
  secondary?: { href: string; label: string };
  kind: IslandKind;
  size: IslandSize;
  plate?: "mega-estate-aerial" | "peninsula-development-big-beach";
  plateCaption?: string;
  x: number;
  z: number;
};

/**
 * Arrival opens the flight. The chapters then run: Full Design & Build, Engineering, Plans & Rendering
 * (Shoreline House, X-ray + MEP), Construction (cliffside, build stages), Developments & Hotels, Advanced Materials Distribution,
 * Your Build, Live, Contact. The plans ridge stays in the water as scenery, not a stop.
 * Design and Build resolves into the Grand Beachfront estate. Engineering resolves into Shoreline House; Construction into the cliffside build. Developments keeps its gold linework.
 */
export const oceanStops: OceanStop[] = [
  {
    id: "arrival",
    short: "Arrival",
    tag: "Quantum Group Co",
    title: "Every detail, considered. Every estate, a legacy.",
    line: "Renderings, design, engineering and plans, construction, finishing and materials, all under one company in Antigua and Barbuda.",
    href: "/about",
    cta: "The company",
    kind: "arrival",
    size: "none",
    ...islandPosition("arrival"),
  },
  {
    id: "design-build",
    short: "Full Design & Build",
    tag: "Design · Engineer · Build · Finish",
    title: "One vision, from first sketch to final key.",
    line: "We design, engineer, build and finish your estate under one roof, so nothing is lost between the idea and the place you live.",
    href: "/services/full-design-and-build",
    cta: "Explore Full Design & Build",
    secondary: { href: "/estates", label: "The estates" },
    kind: "design",
    size: "large",
    plate: "mega-estate-aerial",
    plateCaption: "The Grand Beachfront Estate",
    ...islandPosition("design-build"),
  },
  {
    id: "engineering",
    short: "Engineering, Plans & Rendering",
    tag: "Engineer · Plan · Render",
    title: "See your estate before the first stone is laid.",
    line: "Structural engineering, full permit-ready plans and photoreal renders, so every decision is made with certainty before anything is built.",
    href: "/services/rendering-design-engineering-plans",
    cta: "Explore Engineering & Plans",
    kind: "engineering",
    size: "mid",
    ...islandPosition("engineering"),
  },
  {
    id: "construction",
    short: "Construction",
    tag: "Build · Renovate",
    title: "Estates and commercial projects, built to last.",
    line: "Full estate and commercial construction and renovation services, delivered to the same exacting standard from groundbreaking to handover.",
    href: "/services/construction",
    cta: "Explore Construction",
    kind: "construction",
    size: "mid",
    ...islandPosition("construction"),
  },
  {
    id: "developments",
    short: "Developments & Hotels",
    tag: "Develop · Build at scale",
    title: "Resorts, residences and hotels, built to last generations.",
    line: "Large-scale construction delivered to the same exacting standard as a private estate, from master plan to the final room key.",
    href: "/services/developments",
    cta: "Explore Developments & Hotels",
    kind: "developments",
    size: "peninsula",
    plate: "peninsula-development-big-beach",
    plateCaption: "Peninsula Development",
    ...islandPosition("developments"),
  },
  {
    id: "materials",
    short: "Advanced Materials Distribution",
    tag: "Source · Exclusive",
    title: "Materials you won't find anywhere else in the Caribbean.",
    line: "Exclusive distribution rights to specialised, high-performance materials, shipped direct to your site and available only through Quantum.",
    href: "/services/construction-materials-distribution",
    cta: "Explore Advanced Materials",
    kind: "materials",
    size: "none",
    ...islandPosition("materials"),
  },
  {
    id: "build-live",
    short: "Your Build, Live",
    tag: "Enjoy the journey · Live 24/7",
    title: "Your estate, open to you around the clock.",
    line: "Our exceptional backend gives you and your representatives 24/7 access to live progress, schedules, approvals and documents. Manage every detail from overseas, cut project-manager travel costs, and let building your estate feel as effortless as this journey.",
    href: "/client",
    cta: "Explore Your Build, Live",
    secondary: { href: "/how-we-work", label: "How we work" },
    kind: "signal",
    size: "cay",
    ...islandPosition("build-live"),
  },
  {
    id: "contact",
    short: "Contact",
    tag: "Begin",
    title: "Your estate starts with a conversation.",
    line: "Speak with a Representative on WhatsApp, or arrange a private video meeting.",
    href: "/contact",
    cta: "Start on WhatsApp",
    kind: "contact",
    size: "private",
    ...islandPosition("contact"),
  },
];

export function islandScale(size: IslandSize, kind?: IslandKind) {
  return islandScaleFor(size, kind);
}
