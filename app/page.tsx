import { connection } from "next/server";
import { Suspense } from "react";
import { OceanJourney } from "@/components/ocean/OceanJourney";
import { JsonLd } from "@/components/site/JsonLd";
import { draftContentEnabled } from "@/lib/flags";
import { organizationJsonLd } from "@/lib/jsonld";

export default function HomePage() {
  return (
    <Suspense fallback={<OceanJourney draft={false} />}>
      <HomeBody />
    </Suspense>
  );
}

async function HomeBody() {
  await connection();
  const draft = draftContentEnabled();
  return (
    <main id="content">
      <JsonLd data={organizationJsonLd()} />
      <OceanJourney draft={draft} />
    </main>
  );
}
