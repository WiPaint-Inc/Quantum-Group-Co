import { conceptSources, type ConceptShot } from "@/lib/concept";

export function ConceptFigure({
  shot,
  draft,
  className = "",
  sizes = "100vw",
  priority = false,
  caption,
}: {
  shot: ConceptShot;
  draft: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  caption?: string;
}) {
  if (!draft) {
    return <div className={`neutral-plate ${className}`} aria-hidden="true" />;
  }

  const sources = conceptSources(shot);

  return (
    <figure>
      <div className={`overflow-hidden ${className}`}>
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
      </div>
      <figcaption className="mt-3 text-sand">
        <span className="block text-[0.62rem] tracking-[0.22em] text-sand/80 uppercase">Concept render</span>
        {caption ? <span className="mt-2 block font-serif text-3xl text-sand">{caption}</span> : null}
      </figcaption>
    </figure>
  );
}
