import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProjectSceneGate } from "@/components/experience/ProjectSceneGate";
import { Gallery } from "@/components/portfolio/Gallery";
import { getPortfolioProject, portfolioProjects, projectModel } from "@/content/portfolio";

export function generateStaticParams() {
  return portfolioProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getPortfolioProject(slug);
  if (!project) return { title: "Portfolio" };
  return { title: project.name, description: `${project.name}, ${project.location}. Partner portfolio.` };
}

export default function PortfolioProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<main id="content" className="px-6 pt-32 pb-24 md:px-14"><p className="kicker">Partner Portfolio</p></main>}>
      <ProjectBody params={params} />
    </Suspense>
  );
}

async function ProjectBody({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getPortfolioProject(slug);
  if (!project) notFound();

  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <p className="kicker">Partner Portfolio · {project.location}</p>
      <h1 className="mt-4 font-serif text-6xl text-sand">{project.name}</h1>
      <p className="mt-6 max-w-2xl text-sand/70">{project.caption}</p>
      <div className="mt-10">
        <ProjectSceneGate images={project.images} model={projectModel(project.slug)} />
      </div>
      <div className="mt-12">
        <Gallery images={project.images} />
      </div>
      <Link href="/portfolio" className="mt-12 inline-block text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">
        All work
      </Link>
    </main>
  );
}
