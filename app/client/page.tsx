import type { Metadata } from "next";
import Link from "next/link";
import { ClientHome } from "@/components/client/ClientHome";
import { PageIntro } from "@/components/site/PageIntro";
import { clientArea, howWeWork } from "@/content/site";

export const metadata: Metadata = {
  title: "Client",
  description: clientArea.summary,
};

export default function ClientPage() {
  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <PageIntro kicker={clientArea.kicker} title={clientArea.title} lede={howWeWork.paragraphs[0]} />
      <p className="mt-6 max-w-2xl text-sand/70">{howWeWork.paragraphs[1]}</p>
      <p className="mt-8">
        <Link href="/pay" className="inline-block border border-gold px-4 py-3 text-[0.68rem] tracking-[0.22em] text-sand uppercase">Pay deposit / invoice</Link>
      </p>
      <section className="mt-16 max-w-2xl border-t border-line pt-8">
        <h2 className="font-serif text-3xl text-sand">{clientArea.extension.title}</h2>
        <p className="mt-3 text-sm text-sand/70">{clientArea.extension.summary}</p>
      </section>
      <ClientHome />
    </main>
  );
}
