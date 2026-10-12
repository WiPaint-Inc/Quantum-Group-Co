import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { EstateIndex } from "@/components/estates/EstateBook";
import { draftContentEnabled } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Estates",
  description: "Five concept estates by Quantum Group Co in Antigua and Barbuda.",
};

export default function EstatesPage() {
  return (
    <Suspense fallback={<main id="content" className="paper min-h-dvh bg-[#f3efe6] px-6 pt-32 text-[#1a1a1a]"><p className="paper-kicker">The collection</p></main>}>
      <EstatesBody />
    </Suspense>
  );
}

async function EstatesBody() {
  await connection();
  return <EstateIndex draft={draftContentEnabled()} />;
}
