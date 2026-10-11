import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/site/JsonLd";
import { PageIntro } from "@/components/site/PageIntro";
import { estates } from "@/content/site";
import { estatesItemListJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Signature estates",
  description:
    "Placeholder signature estates by Quantum Group Co. Studies for Antigua and Barbuda, held until a real list replaces them.",
};

export default function EstatesPage() {
  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <JsonLd data={estatesItemListJsonLd()} />
      <PageIntro
        kicker="Signature estates"
        title="Studies, until the real list."
        lede="These houses are placeholders. They describe a standard of finish and composition for Antigua and Barbuda. They are not client projects, and they are not offered for sale."
      />
      <ol className="mt-20 border-t border-line">
        {estates.map((estate, index) => (
          <li key={estate.slug} className="border-b border-line">
            <Link href={`/estates/${estate.slug}`} className="grid gap-4 py-10 md:grid-cols-12 md:items-end">
              <span className="kicker md:col-span-2">{String(index + 1).padStart(2, "0")}</span>
              <span className="font-serif text-4xl text-sand md:col-span-6 md:text-5xl">{estate.name}</span>
              <span className="text-sand/65 md:col-span-4">
                {estate.epithet}
                <span className="mt-2 block text-[0.68rem] tracking-[0.18em] text-gold-2 uppercase">Placeholder · {estate.setting}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
