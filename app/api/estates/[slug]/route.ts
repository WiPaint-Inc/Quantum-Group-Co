import { getEstate, plansForEstate, rendersForEstate } from "@/content/site";
import { apiError, apiOk } from "@/lib/http";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const estate = getEstate(slug);
  if (!estate) return apiError("not_found", "No estate matches that slug.", 404);
  return apiOk({
    estate,
    renders: rendersForEstate(estate.slug),
    plans: plansForEstate(estate.slug),
  });
}
