import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { developments, getDevelopment, getEstate } from "@/content/site";

export function generateStaticParams() {
  return developments.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const development = getDevelopment(slug);
  if (!development) return { title: "Development" };
  return { title: development.name, description: development.summary };
}

export default async function DevelopmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const development = getDevelopment(slug);
  if (!development) notFound();
  const linked = development.estateSlugs
    .map((estateSlug) => getEstate(estateSlug))
    .filter((estate) => estate !== null);

  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <p className="kicker">Placeholder development</p>
      <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.92] text-sand sm:text-7xl">{development.name}</h1>
      <p className="mt-4 text-sm tracking-wide text-gold-2">{development.setting}</p>
      <div className="mt-10 max-w-2xl space-y-6 text-sand/75">
        {development.narrative.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <section className="mt-16" aria-labelledby="related-estates">
        <h2 id="related-estates" className="font-serif text-3xl text-sand">Related studies</h2>
        <ul className="mt-6 space-y-3">
          {linked.map((estate) => (
            <li key={estate.slug}>
              <Link href={`/estates/${estate.slug}`} className="font-serif text-2xl text-sand hover:text-gold-2">
                {estate.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Link href="/developments" className="mt-16 inline-block text-[0.68rem] tracking-[0.22em] text-gold-2 uppercase">
        All developments
      </Link>
    </main>
  );
}
