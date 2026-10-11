import { getDevelopment, getEstate } from "@/content/site";
import { apiError, apiOk } from "@/lib/http";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const development = getDevelopment(slug);
  if (!development) return apiError("not_found", "No development matches that slug.", 404);
  return apiOk({
    development,
    estates: development.estateSlugs.map((estateSlug) => getEstate(estateSlug)).filter(Boolean),
  });
}
