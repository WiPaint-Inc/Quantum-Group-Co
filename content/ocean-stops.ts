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
 * One island per service, in the owner's order, with Arrival and Contact at the ends.
 * Positions follow the v2 archipelago so the path can sweep, bank, and change heading.
 * Estate photographs are landing moments on Design and Developments only.
 */
export const oceanStops: OceanStop[] = [
  {
    id: "arrival",
    short: "Arrival",
    tag: "Quantum Group Co",
    title: "One Company. Every Detail.",
    line: "Renderings, design, engineering and plans, construction, finishing and materials, all under one company in Antigua and Barbuda.",
    href: "/about",
    cta: "The company",
    kind: "arrival",
    size: "none",
    ...islandPosition("arrival"),
  },
  {
    id: "design-build",
    short: "Design",
    tag: "01  ·  Design and build",
    title: "Full Design and Build",
    line: "Every project is shaped around the site and the brief.",
    href: "/services/full-design-and-build",
    cta: "Full Design and Build",
    secondary: { href: "/estates", label: "The estates" },
    kind: "design",
    size: "large",
    plate: "mega-estate-aerial",
    plateCaption: "The Grand Beachfront Estate",
    ...islandPosition("design-build"),
  },
  {
    id: "plans",
    short: "Plans",
    tag: "02  ·  Plans",
    title: "Rendering, Design, Engineering & Plans",
    line: "From a concept to a buildable set of plans.",
    href: "/services/rendering-design-engineering-plans",
    cta: "Plans and renderings",
    kind: "plans",
    size: "mid",
    ...islandPosition("plans"),
  },
  {
    id: "construction",
    short: "Construction",
    tag: "03  ·  Construction",
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
    short: "Engineering",
    tag: "04  ·  Engineering",
    title: "Engineering",
    line: "Civil engineering inside the same company that designs and builds.",
    href: "/services/engineering",
    cta: "Engineering",
    kind: "engineering",
    size: "mid",
    ...islandPosition("engineering"),
  },
  {
    id: "developments",
    short: "Developments",
    tag: "05  ·  Developments",
    title: "Developments",
    line: "The same single-company offering, carried across a larger site.",
    href: "/services/developments",
    cta: "Developments",
    kind: "developments",
    size: "peninsula",
    plate: "peninsula-development-big-beach",
    plateCaption: "Peninsula Development",
    ...islandPosition("developments"),
  },
  {
    id: "materials",
    short: "Materials",
    tag: "06  ·  Materials",
    title: "Materials distribution",
    line: "Precast concrete, planned and delivered on the Miami → Antigua run.",
    href: "/services/construction-materials-distribution",
    cta: "Materials",
    kind: "materials",
    size: "none",
    ...islandPosition("materials"),
  },
  {
    id: "build-live",
    short: "Your build",
    tag: "Your build, live",
    title: "Wherever you are",
    line: "Weekly updates. Weekly video meetings. A designated Representative.",
    href: "/client",
    cta: "Your build, live",
    secondary: { href: "/how-we-work", label: "How we work" },
    kind: "signal",
    size: "cay",
    ...islandPosition("build-live"),
  },
  {
    id: "contact",
    short: "Contact",
    tag: "Contact",
    title: "Start a conversation",
    line: "Sunrise on a quiet cay. Two chairs, and the time to begin.",
    href: "/contact",
    cta: "Start a conversation",
    kind: "contact",
    size: "private",
    ...islandPosition("contact"),
  },
];

export function islandScale(size: IslandSize, kind?: IslandKind) {
  return islandScaleFor(size, kind);
}
