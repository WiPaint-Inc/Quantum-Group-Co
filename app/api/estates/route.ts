import { portfolioProjects } from "@/content/portfolio";
import { apiOk } from "@/lib/http";

export function GET() {
  return apiOk({
    note: "Partner portfolio works. Not offerings, and not priced.",
    estates: portfolioProjects.map((project) => ({
      slug: project.slug,
      name: project.name,
      location: project.location,
      kind: "partner-portfolio",
    })),
  });
}
