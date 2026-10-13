import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { AtmosphereStrip } from "@/components/site/AtmosphereStrip";
import { ConceptFigure } from "@/components/site/ConceptFigure";
import { MarkerNotes } from "@/components/site/MarkerNote";
import { atmosphereWhere } from "@/content/portfolio";
import { getService, serviceParagraphs, services } from "@/content/site";
import { conceptShots } from "@/lib/concept";
import { draftContentEnabled, showVividProductLines } from "@/lib/flags";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Service" };
  return { title: service.title, description: service.lede };
}

export default function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<main id="content" className="px-6 pt-32 pb-24 md:px-14"><p className="kicker">Service</p></main>}>
      <ServiceBody params={params} />
    </Suspense>
  );
}

async function ServiceBody({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  const paragraphs = serviceParagraphs(service, showVividProductLines());
  const texture =
    service.slug === "full-design-and-build"
      ? atmosphereWhere("partner-portfolio").slice(0, 4)
      : service.slug === "construction"
        ? atmosphereWhere("partner-portfolio").slice(4)
        : [];

  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <p className="kicker">Service 0{service.order}</p>
      <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.92] text-sand sm:text-7xl">{service.title}</h1>
      <p className="mt-6 max-w-2xl text-lg text-sand/80">{service.headline}</p>
      {service.slug === "developments" ? (
        <ConceptFigure
          shot={conceptShots.development}
          draft={draftContentEnabled()}
          caption="Peninsula Development"
          className="mt-10 h-[52vh] min-h-80 max-w-5xl"
          sizes="(min-width: 768px) 80vw, 100vw"
        />
      ) : null}
      <AtmosphereStrip images={texture} className="mt-10 max-w-5xl" />
      <div className="mt-10 max-w-2xl space-y-5 text-sand/75">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <ul className="mt-10 max-w-2xl space-y-3">
        {service.points.map((point) => (
          <li key={point} className="border-t border-line py-3 text-sand/80">{point}</li>
        ))}
      </ul>
      <MarkerNotes keys={service.markerKeys} />
      <div className="mt-12 flex flex-wrap gap-6">
        {service.related?.map((link) => (
          <Link key={link.href} href={link.href} className="text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">{link.label}</Link>
        ))}
        <Link href="/services" className="text-[0.68rem] tracking-[0.2em] text-sand/60 uppercase">All services</Link>
      </div>
    </main>
  );
}
