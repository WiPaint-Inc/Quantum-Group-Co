import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortfolioProject, portfolioProjects } from "@/content/portfolio";
import { clientArea } from "@/content/site";

export function generateStaticParams() {
  return portfolioProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getPortfolioProject(slug);
  return {
    title: project ? `${project.name} application` : "Residence application",
    robots: { index: false, follow: false },
  };
}

export default async function HomeAppPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getPortfolioProject(slug);
  if (!project) notFound();

  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <p className="kicker">Extension point · {clientArea.extension.status}</p>
      <h1 className="mt-4 font-serif text-5xl text-sand">{project.name}</h1>
      <p className="mt-6 max-w-xl text-sand/75">{clientArea.extension.summary}</p>
      <p className="mt-4 text-sm text-sand/55">{project.location}. No per-home application is mounted.</p>
      <Link href="/client/portal" className="mt-12 inline-block text-[0.68rem] tracking-[0.22em] text-gold-2 uppercase">
        Back to the portal
      </Link>
    </main>
  );
}
