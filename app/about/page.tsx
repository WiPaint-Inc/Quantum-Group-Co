import type { Metadata } from "next";
import { StoryHalves } from "@/components/site/StoryHalves";
import { TeamGrid } from "@/components/site/TeamGrid";
import { company, team } from "@/content/site";
import { showInternalNotes } from "@/lib/flags";

export const metadata: Metadata = {
  title: "About",
  description: company.intro,
};

export default function AboutPage() {
  return (
    <main id="content" className="pt-28 pb-24">
      <section className="px-6 md:px-14">
        <p className="kicker">About</p>
        <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.92] text-sand sm:text-7xl">{company.heroTitle}</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-sand/75">{company.intro}</p>
      </section>
      <StoryHalves />
      <TeamGrid members={team} showUnconfirmed={showInternalNotes()} />
    </main>
  );
}
