import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/portfolio/Gallery";
import { getPortfolioProject, portfolioProjects } from "@/content/portfolio";

export function generateStaticParams() {
  return portfolioProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getPortfolioProject(slug);
  if (!project) return { title: "Portfolio" };
  return { title: project.name, description: `${project.name}, ${project.location}. Partner portfolio.` };
}

export default async function PortfolioProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getPortfolioProject(slug);
  if (!project) notFound();

  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <p className="kicker">Partner portfolio · {project.location}</p>
      <h1 className="mt-4 font-serif text-6xl text-sand">{project.name}</h1>
      <div className="mt-12">
        <Gallery images={project.images} />
      </div>
      <Link href="/portfolio" className="mt-12 inline-block text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">
        All work
      </Link>
    </main>
  );
}
