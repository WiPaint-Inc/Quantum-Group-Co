export const conceptShots = {
  hero: "rustic-modern-aerial",
  alternate: "rustic-modern-cliffside",
  designBuild: "rustic-modern-pavilion-dusk",
  interior: "rustic-modern-great-room",
  ocean: "ocean-golden-hour",
  /** Secondary plates. Kept in the repo, not used on the primary pages. */
  colonialAerial: "mega-estate-aerial",
  colonialPavilion: "mega-estate-bluehour",
  colonialArrival: "mega-estate-arrival",
  dusk: "hero-villa-dusk",
} as const;

export type ConceptShot = (typeof conceptShots)[keyof typeof conceptShots];

const widths = [640, 960, 1280] as const;

export function conceptSources(name: ConceptShot) {
  return {
    avif: widths.map((width) => `/concept/${name}-${width}.avif ${width}w`).join(", "),
    webp: widths.map((width) => `/concept/${name}-${width}.webp ${width}w`).join(", "),
    fallback: `/concept/${name}-1280.webp`,
  };
}
