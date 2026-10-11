import type { Metadata } from "next";
import { PageIntro } from "@/components/site/PageIntro";
import { about, company } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: company.description,
};

export default function AboutPage() {
  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <PageIntro kicker={about.kicker} title={about.title} lede={about.paragraphs[0]} />
      <div className="mt-10 max-w-2xl space-y-6 text-base leading-relaxed text-sand/75">
        {about.paragraphs.slice(1).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <dl className="mt-16 max-w-xl space-y-3 text-sm">
        <div className="grid grid-cols-[8rem_1fr] gap-4 border-t border-line py-3">
          <dt className="kicker">Market</dt>
          <dd>{company.market}</dd>
        </div>
        <div className="grid grid-cols-[8rem_1fr] gap-4 border-t border-line py-3">
          <dt className="kicker">Practice</dt>
          <dd>{company.discipline}</dd>
        </div>
      </dl>
      <section className="mt-20" aria-labelledby="principles-heading">
        <h2 id="principles-heading" className="font-serif text-4xl text-sand">The standard</h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-2">
          {about.principles.map((principle) => (
            <li key={principle.id} id={principle.id} className="border-t border-line pt-6">
              <h3 className="font-serif text-3xl text-sand">{principle.title}</h3>
              <p className="mt-3 text-sand/70">{principle.body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="mt-20 max-w-2xl" aria-labelledby="facts-heading">
        <h2 id="facts-heading" className="font-serif text-4xl text-sand">Facts an agent can read</h2>
        <ul className="mt-6 space-y-3 text-sand/75">
          {company.facts.map((fact) => (
            <li key={fact} className="border-t border-line py-3">{fact}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
