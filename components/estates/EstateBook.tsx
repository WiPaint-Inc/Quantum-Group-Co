import Image from "next/image";
import Link from "next/link";
import { EstateWalk3d } from "@/components/estates/EstateWalk3d";
import { WalkthroughVideo } from "@/components/estates/WalkthroughVideo";
import { WHATSAPP_ENQUIRY_NUMBER, conceptPlate, estates, type EstateRecord, type EstateSpecs } from "@/content/estates";

function group(value: number) {
  return value.toLocaleString("en-US");
}

function enquiryHref(title: string) {
  const text = `Hello, I would like to enquire about ${title}, a concept study.`;
  return `https://wa.me/${WHATSAPP_ENQUIRY_NUMBER}?text=${encodeURIComponent(text)}`;
}

function Hero({ estate, draft }: { estate: EstateRecord; draft: boolean }) {
  const plate = conceptPlate(estate.hero);
  return (
    <figure>
      <div className="relative h-[78vh] min-h-[520px] w-full bg-[#ebe4d6]">
        {draft ? (
          <Image src={plate.src} alt="Concept render" fill priority className="object-cover" sizes="100vw" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="paper-kicker">Concept</p>
          </div>
        )}
      </div>
      <figcaption className="px-6 pt-8 md:px-14">
        <p className="paper-kicker">{estate.number}</p>
        <h1 className="mt-3 max-w-4xl font-display text-5xl leading-[0.95] text-[#1a1a1a] md:text-7xl">{estate.title}</h1>
        {draft ? <p className="paper-kicker mt-4">Concept render</p> : null}
      </figcaption>
    </figure>
  );
}

function Specs({ specs }: { specs: EstateSpecs }) {
  const rows = [
    { label: "Total area", value: `${group(specs.enclosedSqft)} ft²` },
    { label: "Total area, metric", value: `${group(specs.enclosedSqm)} m²` },
    { label: "Buildings", value: String(specs.buildingCount) },
  ];
  return (
    <div>
      <dl>
        {rows.map((row) => (
          <div key={`${row.label}-${row.value}`} className="flex items-baseline justify-between gap-6 border-b border-[#c5a059] py-4">
            <dt className="paper-kicker">{row.label}</dt>
            <dd className="text-right font-display text-2xl leading-none text-[#1a1a1a] md:text-3xl">{row.value}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-8">
        {specs.buildings.map((building) => (
          <li key={building.code} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-[#c5a059]/50 py-3 text-sm md:grid-cols-[3rem_1fr_auto]">
            <span className="paper-kicker">{building.code}</span>
            <span className="text-[#1a1a1a]">{building.name}</span>
            <span className="col-start-2 text-[#5c564c] md:col-start-auto md:text-right">
              {group(building.sqm)} m² · {group(building.sqft)} ft²
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EstateIndex({ draft }: { draft: boolean }) {
  return (
    <main id="content" className="paper min-h-dvh bg-[#f3efe6] px-6 pt-28 pb-24 text-[#1a1a1a] md:px-14">
      <p className="paper-kicker">The collection</p>
      <h1 className="mt-4 max-w-3xl font-display text-6xl leading-[0.92] text-[#1a1a1a] md:text-8xl">Estates</h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-[#4a453c]">
        Concept studies for Antigua and Barbuda. Each plate is a concept, not a house already built.
      </p>
      <ul className="mt-16 grid gap-10 sm:grid-cols-2">
        {estates.map((estate) => {
          const plate = conceptPlate(estate.hero);
          return (
            <li key={estate.slug}>
              <Link href={`/estates/${estate.slug}`} className="group block border-t border-[#c5a059] pt-6">
                <p className="paper-kicker">{estate.number}</p>
                <h2 className="mt-3 font-display text-4xl leading-none text-[#1a1a1a] group-hover:text-[#8d7344]">{estate.title}</h2>
                <p className="mt-3 max-w-md text-[#4a453c]">{estate.line}</p>
                <figure className="mt-5">
                  <div className="relative aspect-[16/10] bg-[#ebe4d6]">
                    {draft ? <Image src={plate.src} alt="Concept render" fill className="object-cover" sizes="(min-width: 640px) 45vw, 100vw" /> : null}
                  </div>
                  <figcaption className="paper-kicker mt-3">{draft ? "Concept render" : "Concept"}</figcaption>
                </figure>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export function EstatePage({ estate, draft }: { estate: EstateRecord; draft: boolean }) {
  const plate = conceptPlate(estate.hero);
  const index = estates.findIndex((item) => item.slug === estate.slug);
  const previous = estates[(index + estates.length - 1) % estates.length];
  const next = estates[(index + 1) % estates.length];
  const showSpecs = draft && estate.specs;
  return (
    <main id="content" className="paper min-h-dvh bg-[#f3efe6] pb-24 text-[#1a1a1a]">
      <Hero estate={estate} draft={draft} />
      <article className="px-6 py-16 md:px-14">
        <p className="max-w-xl text-base leading-relaxed text-[#3a342c]">{draft ? estate.concept : estate.line}</p>

        {draft ? (
          <div className="mt-16">
            <WalkthroughVideo src={estate.video} poster={plate.src} />
            {estate.walkthrough3d ? <EstateWalk3d config={estate.walkthrough3d} /> : null}
          </div>
        ) : null}

        <section id="specs" className="mt-16 border-t border-[#c5a059] pt-12">
          <p className="paper-kicker">Key specifications</p>
          {showSpecs && estate.specs ? (
            <div className="mt-8 max-w-3xl">
              <Specs specs={estate.specs} />
              <p className="mt-6 text-sm leading-relaxed text-[#5c564c]">Enclosed gross from the concept area schedule. This is a concept study.</p>
            </div>
          ) : (
            <p className="mt-6 font-display text-4xl leading-tight text-[#1a1a1a]">Specifications in preparation</p>
          )}
        </section>

        {draft && estate.plans.length > 0 ? (
          <section id="plans" className="mt-20 border-t border-[#c5a059] pt-12">
            <p className="paper-kicker">Plans</p>
            <h2 className="mt-4 font-display text-4xl text-[#1a1a1a]">Full plans on request</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              {estate.plans.slice(0, 2).map((plan) => (
                <figure key={plan.src}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-white">
                    <Image src={plan.src} alt="Concept" fill className="scale-125 object-cover blur-md" sizes="(min-width: 768px) 40vw, 100vw" />
                  </div>
                  <figcaption className="paper-kicker mt-3">Concept · Full plans on request</figcaption>
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {draft ? (
          <section id="materials" className="mt-20 border-t border-[#c5a059] pt-12">
            <p className="paper-kicker">Design and finishes</p>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#3a342c]">{estate.materials}</p>
          </section>
        ) : null}

        {draft ? (
          <section id="landscape" className="mt-20 border-t border-[#c5a059] pt-12">
            <p className="paper-kicker">Planting and fruit forest</p>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#3a342c]">{estate.landscape}</p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#5c564c]">A concept planting note. Nothing here is planted.</p>
          </section>
        ) : null}

        {draft ? (
          <section id="enquire" className="mt-20 border-t border-[#c5a059] pt-12">
            <p className="paper-kicker">Enquire</p>
            <h2 className="mt-4 font-display text-4xl text-[#1a1a1a]">Ask about this concept</h2>
            <a
              href={enquiryHref(estate.title)}
              className="mt-8 inline-flex border border-[#c5a059] px-6 py-4 text-[0.68rem] tracking-[0.22em] text-[#1a1a1a] uppercase hover:bg-[#1a1a1a] hover:text-[#f3efe6]"
            >
              WhatsApp
            </a>
          </section>
        ) : null}

        <nav className="mt-20 grid gap-6 border-t border-[#c5a059] pt-8 md:grid-cols-2" aria-label="Estates">
          <Link href={`/estates/${previous.slug}`} className="paper-kicker">
            {previous.number} {previous.title}
          </Link>
          <Link href={`/estates/${next.slug}`} className="paper-kicker md:text-right">
            {next.number} {next.title}
          </Link>
        </nav>
      </article>
    </main>
  );
}
