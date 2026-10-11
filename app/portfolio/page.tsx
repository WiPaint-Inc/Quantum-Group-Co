import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { MarkerNotes } from "@/components/site/MarkerNote";
import { PageIntro } from "@/components/site/PageIntro";
import { portfolioProjects } from "@/content/portfolio";
import { portfolioIntro } from "@/content/site";

const PortfolioPlaces = dynamic(
  () => import("@/components/experience/PortfolioPlaces").then((mod) => mod.PortfolioPlaces),
  { ssr: false },
);

export const metadata: Metadata = {
  title: "Partner Portfolio",
  description: portfolioIntro,
};

export default function PortfolioPage() {
  return (
    <main id="content">
      <PortfolioPlaces
        places={portfolioProjects.map((project) => ({
          slug: project.slug,
          name: project.name,
          location: project.location,
          caption: project.caption,
          images: project.images.slice(0, 3),
        }))}
      />
      <div className="px-6 pt-32 pb-24 md:px-14">
      <PageIntro kicker="Partner Portfolio" title="Work already standing." lede={portfolioIntro} />
      <MarkerNotes keys={["page-16-grouping"]} />
      <ol className="mt-16 grid gap-10 md:grid-cols-2">
        {portfolioProjects.map((project) => {
          const plate = project.images[0];
          return (
            <li key={project.slug} className="border border-line">
              <Link href={`/portfolio/${project.slug}`} className="block">
                {plate ? (
                  <span className="relative block aspect-[4/3] overflow-hidden">
                    <Image src={plate.src} alt={project.caption} fill className="object-cover" sizes="(min-width: 768px) 45vw, 100vw" />
                  </span>
                ) : (
                  <span className="flex aspect-[4/3] items-end border-b border-dashed border-gold/50 p-4 text-[0.62rem] tracking-[0.22em] text-gold-2 uppercase">
                    [PLACEHOLDER: gallery image]
                  </span>
                )}
                <span className="block px-5 py-6">
                  <span className="block font-serif text-4xl text-sand">{project.name}</span>
                  <span className="mt-2 block text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">{project.location}</span>
                  <span className="mt-4 block text-sm text-sand/70">{project.caption}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      </div>
    </main>
  );
}
