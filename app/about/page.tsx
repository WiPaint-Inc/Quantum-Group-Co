import type { Metadata } from "next";
import { MarkerNotes } from "@/components/site/MarkerNote";
import { PageIntro } from "@/components/site/PageIntro";
import { company, story } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: company.intro,
};

export default function AboutPage() {
  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <PageIntro kicker="About" title={story.title} lede={story.paragraphs[0]} />
      <div className="mt-8 max-w-2xl space-y-5 text-sand/75">
        {story.paragraphs.slice(1).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <p className="mt-8 text-[0.72rem] tracking-[0.28em] text-gold-2 uppercase">{company.tagline}</p>
      <MarkerNotes keys={["partner-materials", "leadership", "founding"]} />
    </main>
  );
}
