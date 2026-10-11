import { buildLive, finishing, howWeWork, serviceParagraphs, services } from "@/content/site";
import { roboticsEnabled, showVividProductLines } from "@/lib/flags";
import { apiOk } from "@/lib/http";

export function GET() {
  const vividLines = showVividProductLines();
  return apiOk({
    services: services.map((service) => ({ ...service, paragraphs: serviceParagraphs(service, vividLines) })),
    finishing,
    howWeWork,
    clientExperience: {
      headline: buildLive.headline,
      href: buildLive.href,
      offerings: buildLive.offerings,
      kept: buildLive.kept,
      representative: buildLive.representative,
      avatar: { status: "coming_soon" as const, copy: buildLive.avatar.copy },
      endpoint: "/api/client-experience",
    },
    ...(roboticsEnabled() ? { robotics: { slug: "robotics", href: "/services/robotics" } } : {}),
  });
}
