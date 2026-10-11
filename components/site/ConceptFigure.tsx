import { conceptSources, type ConceptShot } from "@/lib/concept";

export function ConceptFigure({
  shot,
  draft,
  className = "",
  sizes = "100vw",
  priority = false,
}: {
  shot: ConceptShot;
  draft: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
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
        {/* Sized AVIF and WebP files are the source set. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sources.fallback}
          alt="Concept render"
          className="h-full w-full object-cover"
          fetchPriority={priority ? "high" : "auto"}
        />
      </picture>
      <figcaption className="pointer-events-none absolute bottom-4 left-4 text-[0.62rem] tracking-[0.22em] text-sand/80 uppercase">
        Concept render
      </figcaption>
    </figure>
  );
}
