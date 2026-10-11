import type { Metadata } from "next";
import { MarkerNotes } from "@/components/site/MarkerNote";
import { PageIntro } from "@/components/site/PageIntro";
import { finishing } from "@/content/site";

export const metadata: Metadata = {
  title: finishing.title,
  description: finishing.headline,
};

export default function FinishingPage() {
  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <PageIntro kicker="Finishing" title={finishing.title} lede={finishing.headline} />
      <div className="mt-8 max-w-2xl space-y-5 text-sand/75">
        {finishing.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <ul className="mt-10 max-w-2xl">
        {finishing.points.map((point) => (
          <li key={point} className="border-t border-line py-3">{point}</li>
        ))}
      </ul>
      <MarkerNotes keys={finishing.markerKeys} />
    </main>
  );
}
