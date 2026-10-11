import type { Metadata } from "next";
import { ClientHome } from "@/components/client/ClientHome";
import { PageIntro } from "@/components/site/PageIntro";
import { clientArea } from "@/content/site";

export const metadata: Metadata = {
  title: "Client",
  description: clientArea.summary,
};

export default function ClientPage() {
  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <PageIntro kicker={clientArea.kicker} title={clientArea.title} lede={clientArea.summary} />
      <section className="mt-16 max-w-2xl border-t border-line pt-8" aria-labelledby="extension-heading">
        <h2 id="extension-heading" className="font-serif text-3xl text-sand">{clientArea.extension.title}</h2>
        <p className="mt-3 text-sm text-sand/70">{clientArea.extension.summary}</p>
        <p className="mt-3 text-[0.68rem] tracking-[0.18em] text-gold-2 uppercase">
          Mount {clientArea.extension.mountPath} · {clientArea.extension.status}
        </p>
      </section>
      <ClientHome />
    </main>
  );
}
