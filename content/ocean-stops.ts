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

export type IslandSize = "none" | "cay" | "mid" | "large" | "peninsula";

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
    z: 2400,
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
    x: -900,
    z: 0,
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
    x: 1080,
    z: -1480,
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
    x: -520,
    z: -2920,
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
    x: -1380,
    z: -4480,
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
    x: -160,
    z: -6400,
  },
  {
    id: "materials",
    short: "Materials",
    tag: "06  ·  Materials",
    title: "Materials distribution",
    line: "Precast concrete, planned and delivered with the work.",
    href: "/services/construction-materials-distribution",
    cta: "Materials",
    kind: "materials",
    size: "mid",
    x: 980,
    z: -8120,
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
    x: -80,
    z: -9680,
  },
  {
    id: "contact",
    short: "Contact",
    tag: "Contact",
    title: "Begin a project",
    line: "Quantum Group Co, Antigua and Barbuda.",
    href: "/contact",
    cta: "Contact",
    kind: "contact",
    size: "cay",
    x: 1280,
    z: -10950,
  },
];

export function islandScale(size: IslandSize) {
  if (size === "large") return { radius: 220, peak: 14, stretch: 1.08 };
  if (size === "peninsula") return { radius: 160, peak: 9, stretch: 2.35 };
  if (size === "mid") return { radius: 125, peak: 8, stretch: 1.05 };
  if (size === "cay") return { radius: 52, peak: 3.4, stretch: 1 };
  return { radius: 0, peak: 0, stretch: 1 };
}
