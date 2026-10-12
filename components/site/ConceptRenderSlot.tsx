import Image from "next/image";
import { visibleConceptRenders } from "@/content/concept-renders";

const LABEL = "Concept render";

/** Sample floor-plan studies. Renders nothing unless the draft flag is on and the slot has plates. */
export function ConceptRenderSlot({ draft }: { draft: boolean }) {
  const plates = visibleConceptRenders(draft);
  if (plates.length === 0) return null;

  return (
    <section className="px-6 py-16 md:px-14" aria-label={LABEL}>
      <p className="kicker">{LABEL}</p>
      <p className="mt-4 max-w-2xl text-sand/70">
        Studies from anonymous sample floor plans. Not a client project. Not completed work.
      </p>
      <ul className="mt-8 grid gap-6 md:grid-cols-2">
        {plates.map((plate) => (
          <li key={plate.id}>
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={plate.src} alt={LABEL} fill className="object-cover" sizes="(min-width: 768px) 45vw, 100vw" />
              </div>
              <figcaption className="mt-3 text-[0.62rem] tracking-[0.22em] text-sand/80 uppercase">{LABEL}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
