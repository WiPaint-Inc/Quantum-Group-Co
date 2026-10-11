import type { Metadata } from "next";
import { BuildLive } from "@/components/client/BuildLive";
import { PageIntro } from "@/components/site/PageIntro";
import { howWeWork } from "@/content/site";

export const metadata: Metadata = {
  title: "How we work",
  description: howWeWork.lede,
};

export default function HowWeWorkPage() {
  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <PageIntro kicker="How we work" title={howWeWork.headline} lede={howWeWork.lede} />
      <div className="mt-8 max-w-2xl space-y-5 text-sand/75">
        {howWeWork.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <ul className="mt-10 max-w-2xl">
        {howWeWork.points.map((point) => (
          <li key={point} className="border-t border-line py-3 text-sand/80">{point}</li>
        ))}
      </ul>
      <BuildLive nested />
    </main>
  );
}
