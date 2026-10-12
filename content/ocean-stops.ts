export type IslandKind =
  | "arrival"
  | "design"
  | "plans"
  | "construction"
  | "engineering"
  | "developments"
  | "materials"
  | "signal"
  | "contact";

export type IslandSize = "none" | "private" | "bar" | "cay" | "mid" | "large" | "peninsula";
export type IslandForm = "volcano" | "ridge" | "headland" | "lagoon" | "peninsula" | "cay" | "bar" | "private";

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
    x: 0,
    z: 900,
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
    x: -620,
    z: 180,
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
    x: -2300,
    z: -1180,
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
    x: -3680,
    z: 420,
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
    x: -2860,
    z: -2680,
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
    x: 980,
    z: -2100,
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
    x: 2920,
    z: -720,
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
    x: 1680,
    z: -3480,
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
    x: 3480,
    z: 260,
  },
];

export function islandScale(size: IslandSize, kind?: IslandKind) {
  if (size === "large") return { radius: 430, peak: 78, stretch: 1.16, form: "volcano" as const };
  if (size === "peninsula") return { radius: 560, peak: 44, stretch: 2.45, form: "peninsula" as const };
  if (size === "mid" && kind === "construction") return { radius: 260, peak: 64, stretch: 1.22, form: "headland" as const };
  if (size === "mid" && kind === "engineering") return { radius: 310, peak: 34, stretch: 1.12, form: "lagoon" as const };
  if (size === "mid" && kind === "plans") return { radius: 280, peak: 68, stretch: 1.32, form: "ridge" as const };
  if (size === "mid") return { radius: 250, peak: 42, stretch: 1.18, form: "ridge" as const };
  if (size === "private") return { radius: 16, peak: 0.55, stretch: 1.08, form: "private" as const };
  if (size === "cay") return { radius: 64, peak: 8, stretch: 1.06, form: "cay" as const };
  if (size === "bar") return { radius: 120, peak: 1.15, stretch: 1.85, form: "bar" as const };
  return { radius: 0, peak: 0, stretch: 1, form: "cay" as const };
}
