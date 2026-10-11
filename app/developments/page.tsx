import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/site/JsonLd";
import { PageIntro } from "@/components/site/PageIntro";
import { developments } from "@/content/site";
import { developmentsJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Developments",
  description:
    "Placeholder development studies by Quantum Group Co. for Antigua and Barbuda. Not released sites and not client projects.",
};

export default function DevelopmentsPage() {
  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <JsonLd data={developmentsJsonLd()} />
      <PageIntro
        kicker="Developments"
        title="What comes after a single house."
        lede="Three studies for a later map. A shore, a ridge, a quiet edge of water. None of them is a released site."
      />
      <ol className="mt-16 space-y-6">
        {developments.map((item) => (
          <li key={item.slug} className="border-t border-line py-10">
            <p className="kicker">Placeholder · {item.setting}</p>
            <h2 className="mt-3 font-serif text-4xl text-sand md:text-5xl">
              <Link href={`/developments/${item.slug}`} className="hover:text-gold-2">{item.name}</Link>
            </h2>
            <p className="mt-4 max-w-2xl text-sand/70">{item.summary}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
