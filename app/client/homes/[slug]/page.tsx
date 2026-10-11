import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { clientArea, estates, getEstate } from "@/content/site";

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
  return {
    title: estate ? `${estate.name} application` : "Residence application",
    robots: { index: false, follow: false },
  };
}

export default async function HomeAppPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const estate = getEstate(slug);
  if (!estate) notFound();

  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <p className="kicker">Extension point · {clientArea.extension.status}</p>
      <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.92] text-sand sm:text-6xl">{estate.name}</h1>
      <p className="mt-6 max-w-xl text-sand/75">{clientArea.extension.summary}</p>
      <dl className="mt-12 max-w-xl text-sm">
        <div className="grid grid-cols-[9rem_1fr] gap-4 border-t border-line py-3">
          <dt className="kicker">Slot</dt>
          <dd>{clientArea.extension.id}</dd>
        </div>
        <div className="grid grid-cols-[9rem_1fr] gap-4 border-t border-line py-3">
          <dt className="kicker">Estate</dt>
          <dd>{estate.slug}</dd>
        </div>
        <div className="grid grid-cols-[9rem_1fr] gap-4 border-t border-line py-3">
          <dt className="kicker">Contract</dt>
          <dd>A future app receives this estate record and the stub session. Phase 1 renders the slot only.</dd>
        </div>
      </dl>
      <Link href="/client/portal" className="mt-12 inline-block text-[0.68rem] tracking-[0.22em] text-gold-2 uppercase">
        Back to the portal
      </Link>
    </main>
  );
}
