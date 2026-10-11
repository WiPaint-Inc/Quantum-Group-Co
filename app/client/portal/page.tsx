import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { BuildLive } from "@/components/client/BuildLive";
import { PortalView } from "@/components/client/PortalView";
import { PageIntro } from "@/components/site/PageIntro";
import { draftContentEnabled } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Portal",
  robots: { index: false, follow: false },
};

export default function PortalPage() {
  return (
    <Suspense fallback={null}>
      <PortalBody />
    </Suspense>
  );
}

async function PortalBody() {
  await connection();
  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <PageIntro
        kicker="Portal"
        title="The private project."
        lede="Nothing private is stored here. The sample below is Demo Villa, a concept only."
      />
      <BuildLive draft={draftContentEnabled()} nested />
      <PortalView />
    </main>
  );
}
