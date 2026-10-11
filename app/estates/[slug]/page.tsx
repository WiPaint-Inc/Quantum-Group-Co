import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/site/JsonLd";
import { Plate } from "@/components/site/Plate";
import { estates, getEstate, plansForEstate, rendersForEstate } from "@/content/site";
import { estateJsonLd } from "@/lib/jsonld";

export function generateStaticParams() {
  return estates.map((estate) => ({ slug: estate.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const estate = getEstate(slug);
  if (!estate) return { title: "Estate" };
  return {
    title: estate.name,
    description: `${estate.summary} Placeholder study in ${estate.region}.`,
  };
}

export default async function EstatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const estate = getEstate(slug);
  if (!estate) notFound();
  const renderStudies = rendersForEstate(estate.slug);
  const planStudies = plansForEstate(estate.slug);

  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <JsonLd data={estateJsonLd(estate)} />
      <p className="kicker">Placeholder estate</p>
      <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.92] text-sand sm:text-7xl">{estate.name}</h1>
      <p className="mt-6 max-w-xl text-lg text-sand/80">{estate.epithet}</p>
      <p className="mt-3 text-sm tracking-wide text-gold-2">{estate.setting} · {estate.region}</p>

      <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.6fr)]">
        <div className="space-y-6 text-base leading-relaxed text-sand/75">
          {estate.narrative.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p>{estate.composition}</p>
        </div>
        <aside>
          <p className="kicker">Finishes</p>
          <ul className="mt-4 space-y-2 text-sand">
            {estate.finishes.map((finish) => (
              <li key={finish} className="border-t border-line py-3">{finish}</li>
            ))}
          </ul>
        </aside>
      </div>

      <section className="mt-20" aria-labelledby="renders-heading">
        <h2 id="renders-heading" className="font-serif text-4xl text-sand">Renders</h2>
        <p className="mt-3 max-w-xl text-sm text-sand/60">Drawn plates. Not photographs of a built house.</p>
        <ul className="mt-8 grid gap-8 md:grid-cols-2">
          {renderStudies.map((render) => (
            <li key={render.id}>
              <Plate from={render.palette.from} to={render.palette.to} label={render.title} />
              <h3 className="mt-4 font-serif text-2xl text-sand">{render.title}</h3>
              <p className="mt-2 text-sm text-sand/65">{render.caption}</p>
              <p className="mt-2 text-[0.68rem] tracking-[0.18em] text-gold-2 uppercase">{render.timeOfDay}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-20" aria-labelledby="plans-heading">
        <h2 id="plans-heading" className="font-serif text-4xl text-sand">Plans</h2>
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {planStudies.map((plan) => (
            <li key={plan.id} className="grid gap-3 py-6 md:grid-cols-12">
              <h3 className="font-serif text-2xl text-sand md:col-span-4">{plan.title}</h3>
              <p className="text-sm text-sand/70 md:col-span-5">{plan.caption}</p>
              <p className="text-sm text-sand/55 md:col-span-3">{plan.sheets.join(" · ")}</p>
            </li>
          ))}
        </ul>
      </section>

      <Link href="/estates" className="mt-16 inline-block text-[0.68rem] tracking-[0.22em] text-gold-2 uppercase">
        All estates
      </Link>
    </main>
  );
}
