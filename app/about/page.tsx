import type { Metadata } from "next";
import { MarkerNotes } from "@/components/site/MarkerNote";
import { PageIntro } from "@/components/site/PageIntro";
import { company, story, team } from "@/content/site";
import { showInternalNotes } from "@/lib/flags";

export const metadata: Metadata = {
  title: "About",
  description: company.description,
};

export default function AboutPage() {
  const visibleTeam = team.filter((member) => member.confirmed || showInternalNotes());

  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <PageIntro kicker="About" title={story.title} lede={story.paragraphs[0]} />
      <div className="mt-8 max-w-2xl space-y-5 text-sand/75">
        {story.paragraphs.slice(1).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <p className="mt-8 text-[0.72rem] tracking-[0.28em] text-gold-2 uppercase">{company.tagline}</p>
      <MarkerNotes keys={["heritage-1981", "heritage-dates", "founding", "partner-materials", "leadership"]} />

      <section className="mt-20" aria-labelledby="team-heading">
        <h2 id="team-heading" className="font-serif text-4xl text-sand">Team</h2>
        <p className="mt-3 max-w-xl text-sm text-sand/60">Titles are partner-company titles. Nobody is given a Quantum Group Co title here.</p>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {visibleTeam.map((member) => (
            <li key={member.id} className="border-t border-line pt-5">
              <div className="mb-4 aspect-[4/5] border border-line bg-white/5" aria-hidden="true" />
              {!member.confirmed ? <p className="kicker">To confirm</p> : null}
              <h3 className="mt-2 font-serif text-3xl text-sand">{member.name}</h3>
              <p className="mt-2 text-sm text-gold-2">{member.title}</p>
              <p className="mt-3 text-sm text-sand/70">{member.bio}</p>
              <MarkerNotes keys={member.markerKeys} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
