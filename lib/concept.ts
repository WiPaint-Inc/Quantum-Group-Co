export const conceptShots = {
  hero: "mega-estate-aerial",
  designBuild: "mega-estate-bluehour",
  arrival: "mega-estate-arrival",
  interior: "interior-great-room",
  ocean: "ocean-golden-hour",
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
