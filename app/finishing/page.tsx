import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { AtmosphereStrip } from "@/components/site/AtmosphereStrip";
import { ConceptFigure } from "@/components/site/ConceptFigure";
import { MarkerNotes } from "@/components/site/MarkerNote";
import { PageIntro } from "@/components/site/PageIntro";
import { atmosphereWhere } from "@/content/portfolio";
import { finishing } from "@/content/site";
import { conceptShots } from "@/lib/concept";
import { draftContentEnabled } from "@/lib/flags";

export const metadata: Metadata = {
  title: finishing.title,
  description: finishing.headline,
};

export default function FinishingPage() {
  return (
    <Suspense fallback={<FinishingBody draft={false} />}>
      <FinishingDraft />
    </Suspense>
  );
}

async function FinishingDraft() {
  await connection();
  return <FinishingBody draft={draftContentEnabled()} />;
}

function FinishingBody({ draft }: { draft: boolean }) {
  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <PageIntro kicker="Interiors and finishing" title={finishing.title} lede={finishing.headline} />
      <ConceptFigure shot={conceptShots.interior} draft={draft} className="mt-10 h-[52vh] min-h-80 max-w-5xl" sizes="(min-width: 768px) 80vw, 100vw" />
      <AtmosphereStrip images={atmosphereWhere("finish-detail")} className="mt-6 max-w-5xl" />
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
