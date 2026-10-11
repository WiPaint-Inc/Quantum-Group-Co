import { finishing, howWeWork, serviceParagraphs, services } from "@/content/site";
import { roboticsEnabled, showVividProductLines } from "@/lib/flags";
import { apiOk } from "@/lib/http";

export function GET() {
  const vividLines = showVividProductLines();
  return apiOk({
    services: services.map((service) => ({ ...service, paragraphs: serviceParagraphs(service, vividLines) })),
    finishing,
    howWeWork,
    ...(roboticsEnabled() ? { robotics: { slug: "robotics", href: "/services/robotics" } } : {}),
  });
}
