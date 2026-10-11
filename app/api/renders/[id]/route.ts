import { getEstate, getRender } from "@/content/site";
import { apiError, apiOk } from "@/lib/http";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const render = getRender(id);
  if (!render) return apiError("not_found", "No render matches that id.", 404);
  return apiOk({ render, estate: getEstate(render.estateSlug) });
}
