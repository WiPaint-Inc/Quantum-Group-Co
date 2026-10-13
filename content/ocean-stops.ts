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
 * Arrival opens the flight. The chapters then run: Full Design & Build, Construction,
 * Engineering, Plans & Rendering, Developments & Hotels, Advanced Materials Distribution,
 * Your Build, Live, Contact. The plans ridge stays in the water as scenery, not a stop.
 * Design and Build resolves into the Grand Beachfront estate. Engineering resolves into the cliffside study. Developments keeps its gold linework.
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
    tag: "01  ·  Full Design & Build",
    title: "Full Design & Build",
    line: "Every project is shaped around the site and the brief.",
    href: "/services/full-design-and-build",
    cta: "Full Design & Build",
    secondary: { href: "/estates", label: "The estates" },
    kind: "design",
    size: "large",
    plate: "mega-estate-aerial",
    plateCaption: "The Grand Beachfront Estate",
    ...islandPosition("design-build"),
  },
  {
    id: "construction",
    short: "Construction",
    tag: "02  ·  Construction",
    title: "Construction",
    line: "Luxury homes in Antigua and Barbuda, built to be looked after.",
    href: "/services/construction",
    cta: "Construction",
    kind: "construction",
    size: "mid",
    ...islandPosition("construction"),
  },
  {
    id: "engineering",
    short: "Engineering, Plans & Rendering",
    tag: "03  ·  Engineering, Plans & Rendering",
    title: "Engineering, Plans & Rendering",
    line: "From a concept to a buildable set of plans.",
    href: "/services/rendering-design-engineering-plans",
    cta: "Engineering, Plans & Rendering",
    kind: "engineering",
    size: "mid",
    ...islandPosition("engineering"),
  },
  {
    id: "developments",
    short: "Developments & Hotels",
    tag: "04  ·  Developments & Hotels",
    title: "Developments & Hotels",
    line: "The same single-company offering, carried across a larger site.",
    href: "/services/developments",
    cta: "Developments & Hotels",
    kind: "developments",
    size: "peninsula",
    plate: "peninsula-development-big-beach",
    plateCaption: "Peninsula Development",
    ...islandPosition("developments"),
  },
  {
    id: "materials",
    short: "Advanced Materials Distribution",
    tag: "05  ·  Advanced Materials Distribution",
    title: "Advanced Materials Distribution",
    line: "Precast concrete, planned and delivered on the Miami → Antigua run.",
    href: "/services/construction-materials-distribution",
    cta: "Advanced Materials Distribution",
    kind: "materials",
    size: "none",
    ...islandPosition("materials"),
  },
  {
    id: "build-live",
    short: "Your Build, Live",
    tag: "Enjoy the journey · Live 24/7",
    title: "Your Build, Live",
    line: "Weekly updates. Weekly video meetings. A designated Representative.",
    href: "/client",
    cta: "Your Build, Live",
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
