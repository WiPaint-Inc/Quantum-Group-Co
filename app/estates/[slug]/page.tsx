import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { EstatePage } from "@/components/estates/EstateBook";
import { estates, getEstate } from "@/content/estates";
import { draftContentEnabled } from "@/lib/flags";

export function generateStaticParams() {
  return estates.map((estate) => ({ slug: estate.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const estate = getEstate(slug);
  if (!estate) return { title: "Estate" };
  return {
    title: estate.title,
    description: `${estate.title}. Concept estate in Antigua and Barbuda.`,
  };
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<main id="content" className="paper px-6 pt-32"><p className="paper-kicker">Concept</p></main>}>
      <EstateBody params={params} />
    </Suspense>
  );
}

async function EstateBody({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const estate = getEstate(slug);
  if (!estate) notFound();
  return <EstatePage estate={estate} draft={draftContentEnabled()} />;
}
