import { portfolioProjects } from "@/content/portfolio";
import { apiOk } from "@/lib/http";

export function GET() {
  return apiOk({
    projects: portfolioProjects.map((project) => ({
      slug: project.slug,
      name: project.name,
      location: project.location,
      images: project.images.map((image) => ({ src: image.src, caption: image.caption, width: image.width, height: image.height })),
    })),
  });
}
