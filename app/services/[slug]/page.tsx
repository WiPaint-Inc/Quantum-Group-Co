import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkerNotes } from "@/components/site/MarkerNote";
import { getService, serviceParagraphs, services } from "@/content/site";
import { showVividProductLines } from "@/lib/flags";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Service" };
  return { title: service.title, description: service.lede };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  const paragraphs = serviceParagraphs(service, showVividProductLines());

  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <p className="kicker">Service 0{service.order}</p>
      <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.92] text-sand sm:text-7xl">{service.title}</h1>
      <p className="mt-6 max-w-2xl text-lg text-sand/80">{service.headline}</p>
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
      {service.slug === "rendering-design-engineering-plans" ? (
        <Link href="/marketplace" className="mt-10 inline-block text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">
          Marketplace teaser
        </Link>
      ) : null}
      <div className="mt-12">
        <Link href="/services" className="text-[0.68rem] tracking-[0.2em] text-sand/60 uppercase">All services</Link>
      </div>
    </main>
  );
}
