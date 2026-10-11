import { getListing, getPlan, getRender } from "@/content/site";
import { apiError, apiOk } from "@/lib/http";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const listing = getListing(id);
  if (!listing) return apiError("not_found", "No listing matches that id.", 404);
  const subject = listing.kind === "plan" ? getPlan(listing.refId) : getRender(listing.refId);
  return apiOk({ listing, subject });
}
