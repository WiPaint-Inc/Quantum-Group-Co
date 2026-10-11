import { getEstate, getPlan } from "@/content/site";
import { apiError, apiOk } from "@/lib/http";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const plan = getPlan(id);
  if (!plan) return apiError("not_found", "No plan matches that id.", 404);
  return apiOk({ plan, estate: getEstate(plan.estateSlug) });
}
