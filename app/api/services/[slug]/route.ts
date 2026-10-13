import { getService, robotics, serviceParagraphs } from "@/content/site";
import { roboticsEnabled, showVividProductLines } from "@/lib/flags";
import { apiError, apiOk } from "@/lib/http";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (slug === "robotics") {
    if (!roboticsEnabled()) return apiError("not_found", "Robotics is not published.", 404);
    return apiOk({ service: robotics });
  }
  const service = getService(slug);
  if (!service) return apiError("not_found", "No service matches that slug.", 404);
  return apiOk({ service: { ...service, paragraphs: serviceParagraphs(service, showVividProductLines()) } });
}
