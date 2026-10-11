export const conceptShots = {
  hero: "mega-estate-aerial",
  bluehour: "mega-estate-bluehour",
  arrival: "mega-estate-arrival",
  ocean: "ocean-golden-hour",
  ecoAerial: "rustic-modern-aerial",
  ecoInterior: "rustic-modern-great-room",
  beachfront: "beachfront-from-water",
  developmentBluehour: "development-bluehour-masterplan",
  developmentOffshore: "development-golden-offshore",
  /** Optional plates. Present in the repo, not the lead sequence. */
  interior: "interior-great-room",
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
