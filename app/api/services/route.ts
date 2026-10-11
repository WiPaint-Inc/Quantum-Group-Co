import { finishing, howWeWork, services } from "@/content/site";
import { roboticsEnabled } from "@/lib/flags";
import { apiOk } from "@/lib/http";

export function GET() {
  return apiOk({
    services,
    finishing,
    howWeWork,
    robotics: roboticsEnabled() ? { slug: "robotics", href: "/services/robotics" } : null,
  });
}
