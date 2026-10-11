import type { Metadata } from "next";
import Link from "next/link";
import { MarkerNotes } from "@/components/site/MarkerNote";
import { PageIntro } from "@/components/site/PageIntro";
import { portfolioProjects } from "@/content/portfolio";
import { portfolioIntro } from "@/content/site";

export const metadata: Metadata = {
  title: "Partner portfolio",
  description: portfolioIntro,
};

export default function PortfolioPage() {
  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <PageIntro kicker="Partner portfolio" title="Work already standing." lede={portfolioIntro} />
      <MarkerNotes keys={["page-16-grouping"]} />
      <ol className="mt-16 divide-y divide-line border-y border-line">
        {portfolioProjects.map((project) => (
          <li key={project.slug}>
            <Link href={`/portfolio/${project.slug}`} className="grid gap-3 py-8 md:grid-cols-12 md:items-end">
              <span className="font-serif text-4xl text-sand md:col-span-6">{project.name}</span>
              <span className="text-sand/65 md:col-span-4">{project.location}</span>
              <span className="text-[0.68rem] tracking-[0.18em] text-gold-2 uppercase md:col-span-2">{project.images.length} plates</span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
