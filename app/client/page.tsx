import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { BuildLive } from "@/components/client/BuildLive";
import { ClientHome } from "@/components/client/ClientHome";
import { PageIntro } from "@/components/site/PageIntro";
import { clientArea, howWeWork } from "@/content/site";

export const metadata: Metadata = {
  title: "Client",
  description: clientArea.summary,
};

export default function ClientPage() {
  return (
    <Suspense fallback={null}>
      <ClientBody />
    </Suspense>
  );
}

async function ClientBody() {
  await connection();

  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <PageIntro kicker={clientArea.kicker} title={clientArea.title} lede={howWeWork.paragraphs[0]} />
      <p className="mt-6 max-w-2xl text-sand/70">{howWeWork.paragraphs[1]}</p>
      <BuildLive nested />
      <ClientHome />
    </main>
  );
}
