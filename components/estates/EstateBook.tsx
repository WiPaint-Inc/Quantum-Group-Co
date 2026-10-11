import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { megaBuildings, megaGrounds, megaRooms, plantingByEstate } from "@/content/estate-facts";
import { conceptPlate, estates, megaKeySpecs, megaPlans, type EstateRecord } from "@/content/estates";

function Caption({ children }: { children: string }) {
  return <figcaption className="paper-kicker mt-3">{children}</figcaption>;
}

function RuleList({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl>
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline justify-between gap-6 border-b border-[#c5a059] py-4">
          <dt className="paper-kicker">{row.label}</dt>
          <dd className="text-right font-display text-2xl leading-none text-[#1a1a1a] md:text-3xl">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Plate({
  draft,
  className,
  children,
}: {
  draft: boolean;
  className: string;
  children: ReactNode;
}) {
  if (!draft) {
    return (
      <div className={`flex items-center justify-center border border-[#c5a059]/70 bg-[#ebe4d6] ${className}`}>
        <p className="paper-kicker">Concept</p>
      </div>
    );
  }
  return <div className={className}>{children}</div>;
}

function Hero({ estate, draft }: { estate: EstateRecord; draft: boolean }) {
  const plate = conceptPlate(estate.hero);
  return (
    <figure className="relative">
      <Plate draft={draft} className="relative h-[78vh] min-h-[520px] w-full">
        <Image src={plate.src} alt="Concept render" fill priority className="object-cover" sizes="100vw" />
      </Plate>
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-6 pt-24 pb-8 text-white md:px-14 md:pb-12">
        <p className="text-[0.68rem] tracking-[0.32em] text-[#e6d2a8] uppercase">{estate.number}</p>
        <p className="mt-3 max-w-4xl font-display text-5xl leading-[0.95] md:text-7xl">{estate.title}</p>
        <p className="mt-4 text-[0.68rem] tracking-[0.28em] text-[#e6d2a8] uppercase">Concept render</p>
      </figcaption>
    </figure>
  );
}

function Planting({ slug }: { slug: string }) {
  const groups = plantingByEstate[slug as keyof typeof plantingByEstate] ?? [];
  return (
    <div className="mt-10 grid gap-8 md:grid-cols-2">
      {groups.map((group) => (
        <div key={group.layer}>
          <p className="paper-kicker">{group.layer.replace(/\s*\([^)]*\)/g, "")}</p>
          <p className="mt-3 text-sm leading-relaxed text-[#3a342c]">{group.names.join(", ")}.</p>
        </div>
      ))}
    </div>
  );
}

function Schedule() {
  const buildings = megaBuildings.map((row) => ({
    label: row.name,
    value: `${row.sqm} m²`,
  }));
  return (
    <div className="mt-16 space-y-16">
      <p className="max-w-xl text-sm leading-relaxed text-[#5c564c]">
        Fourteen sleeping rooms are in the residences. Staff rooms are listed with the service building. The two pools are the main pool and the beach plunge pool. Areas are concept planning sizes.
      </p>
      <div>
        <h3 className="font-display text-3xl text-[#1a1a1a]">Buildings</h3>
        <div className="mt-6">
          <RuleList rows={[...buildings, { label: "Enclosed total", value: "4,576 m²" }]} />
        </div>
      </div>
      <div>
        <h3 className="font-display text-3xl text-[#1a1a1a]">Rooms</h3>
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#c5a059] text-[0.62rem] tracking-[0.18em] text-[#8d7344] uppercase">
              <th className="py-3 font-normal">Room</th>
              <th className="py-3 font-normal">Level</th>
              <th className="py-3 text-right font-normal">Area</th>
            </tr>
          </thead>
          <tbody>
            {megaRooms.map((room) => (
              <tr key={`${room.code}-${room.room}`} className="border-b border-[#c5a059]/40">
                <td className="py-2.5 pr-4 text-[#1a1a1a]">
                  <span className="mr-2 text-[0.62rem] tracking-[0.14em] text-[#8d7344] uppercase">{room.building}</span>
                  {room.room}
                  {room.note ? <span className="mt-1 block text-xs text-[#6e675c]">{room.note}</span> : null}
                </td>
                <td className="py-2.5 text-[#5c564c]">{room.level}</td>
                <td className="py-2.5 text-right text-[#1a1a1a]">{room.sqm} m²</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="font-display text-3xl text-[#1a1a1a]">Grounds</h3>
        <RuleList rows={megaGrounds.map((row) => ({ label: row.name, value: `${row.sqm} m²` }))} />
      </div>
    </div>
  );
}

export function EstateIndex({ draft }: { draft: boolean }) {
  return (
    <main id="content" className="paper px-6 pt-28 pb-24 md:px-14">
      <p className="paper-kicker">The collection</p>
      <h1 className="mt-4 max-w-3xl font-display text-6xl leading-[0.92] text-[#1a1a1a] md:text-8xl">Five estates.</h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-[#4a453c]">
        Concept studies for Quantum Group Co in Antigua and Barbuda. Each plate is a concept, not a house already built.
      </p>
      <ol className="mt-16">
        {estates.map((estate) => {
          const plate = conceptPlate(estate.hero);
          return (
            <li key={estate.slug} className="border-t border-[#c5a059] py-10">
              <Link href={`/estates/${estate.slug}`} className="group grid gap-6 md:grid-cols-[8rem_1fr] md:gap-10">
                <p className="paper-kicker pt-2">{estate.number}</p>
                <div>
                  <h2 className="font-display text-4xl leading-none text-[#1a1a1a] group-hover:text-[#8d7344] md:text-6xl">{estate.title}</h2>
                  <p className="mt-4 max-w-xl text-[#4a453c]">{estate.line}</p>
                  <figure className="mt-6">
                    <Plate draft={draft} className="relative h-64 w-full md:h-80">
                      <Image src={plate.src} alt="Concept render" fill className="object-cover" sizes="(min-width: 768px) 70vw, 100vw" />
                    </Plate>
                    <Caption>Concept render</Caption>
                  </figure>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </main>
  );
}

export function EstatePage({ estate, draft }: { estate: EstateRecord; draft: boolean }) {
  const index = estates.findIndex((item) => item.slug === estate.slug);
  const previous = estates[(index + estates.length - 1) % estates.length];
  const next = estates[(index + 1) % estates.length];
  return (
    <main id="content" className="paper pb-24">
      <Hero estate={estate} draft={draft} />
      <article className="px-6 py-20 md:px-14">
        <section id="specs" className="grid gap-12 border-t border-[#c5a059] pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)] lg:gap-20">
          <div>
            <p className="paper-kicker">{estate.number} · Concept</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] text-[#1a1a1a] md:text-6xl">{estate.title}</h1>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-[#3a342c]">{draft ? estate.concept : estate.line}</p>
          </div>
          <div>
            <p className="paper-kicker mb-2">Key specifications</p>
            {estate.specified && draft ? (
              <RuleList rows={megaKeySpecs.map((row) => ({ label: row.label, value: row.value }))} />
            ) : (
              <p className="mt-6 font-display text-4xl leading-tight text-[#1a1a1a]">Specifications in preparation</p>
            )}
          </div>
        </section>
        {estate.specified && draft ? <Schedule /> : null}

        <section id="plans" className="mt-24 border-t border-[#c5a059] pt-12">
          <p className="paper-kicker">Plans</p>
          <h2 className="mt-4 font-display text-4xl text-[#1a1a1a] md:text-5xl">{estate.specified && draft ? "Concept sheets" : "Specifications in preparation"}</h2>
          {estate.specified && draft ? (
            <div className="mt-10 space-y-12">
              {megaPlans.map((plan) => (
                <figure key={plan.src}>
                  <div className="relative aspect-[16/10] border border-[#c5a059]/50 bg-white">
                    <Image src={plan.src} alt="Concept" fill className="object-contain" sizes="100vw" />
                  </div>
                  <Caption>{`Concept · ${plan.label}`}</Caption>
                </figure>
              ))}
            </div>
          ) : null}
        </section>

        <section id="materials" className="mt-24 border-t border-[#c5a059] pt-12">
          <p className="paper-kicker">Materials and finishes</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl text-[#1a1a1a] md:text-5xl">The material direction.</h2>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#3a342c]">{draft ? estate.materials : "Concept."}</p>
        </section>

        <section id="furnishing" className="mt-24 border-t border-[#c5a059] pt-12">
          <p className="paper-kicker">Furnishing and finishes</p>
          <h2 className="mt-4 font-display text-4xl text-[#1a1a1a] md:text-5xl">Specification direction</h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-[#5c564c]">A mood board of direction. Pieces are shown without names. Concept only.</p>
          {draft ? (
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
              {estate.pieces.map((piece) => (
                <li key={piece.id}>
                  <figure>
                    <div className="relative aspect-square border border-[#c5a059]/40 bg-white">
                      <Image
                        src={`/estates/${estate.slug}/ffe/${piece.id}.webp`}
                        alt={`Specification direction. ${piece.label}. Concept.`}
                        fill
                        className="object-contain p-3"
                        sizes="(min-width: 768px) 22vw, 45vw"
                      />
                    </div>
                    <Caption>{`Concept · ${piece.label}`}</Caption>
                  </figure>
                </li>
              ))}
            </ul>
          ) : (
            <p className="paper-kicker mt-8">Concept</p>
          )}
        </section>

        <section id="landscape" className="mt-24 border-t border-[#c5a059] pt-12">
          <p className="paper-kicker">Landscape and fruit forest</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl text-[#1a1a1a] md:text-5xl">A forest meant to be picked.</h2>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#3a342c]">{draft ? estate.landscape : "Concept."}</p>
          {draft ? (
            <>
              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[#5c564c]">Concept only. Nothing here is built or planted. Manchineel is not included.</p>
              <Planting slug={estate.slug} />
              <figure className="mt-12">
                <div className="relative aspect-[16/10] border border-[#c5a059]/50 bg-white">
                  <Image src={`/estates/${estate.slug}/zoning.webp`} alt="Concept. Landscape zoning." fill className="object-contain" sizes="100vw" />
                </div>
                <Caption>Concept</Caption>
              </figure>
              <dl className="mt-10">
                {estate.zones.map((zone) => (
                  <div key={zone.name} className="grid gap-2 border-b border-[#c5a059] py-4 md:grid-cols-[16rem_1fr] md:gap-8">
                    <dt className="font-display text-2xl text-[#1a1a1a]">{zone.name}</dt>
                    <dd className="text-sm leading-relaxed text-[#3a342c]">{zone.intent}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : null}
        </section>

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
