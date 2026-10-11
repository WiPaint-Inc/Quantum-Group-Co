import { getPortfolioProject } from "@/content/portfolio";
import { apiError, apiOk } from "@/lib/http";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const project = getPortfolioProject(slug);
  if (!project) return apiError("not_found", "No portfolio project matches that slug.", 404);
  return apiOk({
    project: {
      slug: project.slug,
      name: project.name,
      location: project.location,
      images: project.images.map((image) => ({ src: image.src, caption: image.caption, width: image.width, height: image.height })),
    },
  });
}
