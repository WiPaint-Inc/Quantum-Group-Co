import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ConceptWalkthrough } from "@/components/concept/ConceptWalkthrough";
import { draftContentEnabled } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Concept walkthrough · Demo Villa",
  description: "A concept walkthrough of a demo villa. Not a client project and not a completed house.",
  robots: { index: false, follow: false },
};

export default function DemoVillaPage() {
  return (
    <Suspense fallback={null}>
      <DemoVillaGate />
    </Suspense>
  );
}

async function DemoVillaGate() {
  await connection();
  if (!draftContentEnabled()) notFound();
  return (
    <main id="content">
      <ConceptWalkthrough />
    </main>
  );
}
