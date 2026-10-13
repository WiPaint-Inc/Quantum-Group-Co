import { conceptSources, type ConceptShot } from "@/lib/concept";

const BLUEPRINT = [
  "M380 220 H1220",
  "M380 420 H1220",
  "M380 620 H1220",
  "M540 160 V780",
  "M800 160 V780",
  "M1060 160 V780",
  "M460 280 H1140",
  "M620 220 V700",
  "M600 310 H1000 V500 H600 Z",
  "M470 360 H600 V480 H470 Z",
  "M1000 340 H1160 V460 H1000 Z",
];

export function ConceptFigure({
  shot,
  draft,
  className = "",
  sizes = "100vw",
  priority = false,
  caption,
  blueprint = false,
}: {
  shot: ConceptShot;
  draft: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  caption?: string;
  blueprint?: boolean;
}) {
  if (!draft) {
    return <div className={`neutral-plate ${className}`} aria-hidden="true" />;
  }

  const sources = conceptSources(shot);

  return (
    <figure className={`relative overflow-hidden ${className}`}>
      <picture>
        <source type="image/avif" srcSet={sources.avif} sizes={sizes} />
        <source type="image/webp" srcSet={sources.webp} sizes={sizes} />
        <img
          src={sources.fallback}
          alt={caption ?? "Concept render"}
          className="h-full w-full object-cover"
          fetchPriority={priority ? "high" : "auto"}
        />
      </picture>
      {blueprint ? (
        <svg viewBox="0 0 1600 900" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <g fill="none" stroke="#E6D3A3" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            {BLUEPRINT.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </svg>
      ) : null}
      {caption ? <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/80 to-transparent" /> : null}
      <figcaption className="pointer-events-none absolute bottom-4 left-4 text-sand">
        <span className="block text-[0.62rem] tracking-[0.22em] text-sand/80 uppercase">Concept render</span>
        {caption ? <span className="mt-2 block font-serif text-3xl text-sand">{caption}</span> : null}
      </figcaption>
    </figure>
  );
}
