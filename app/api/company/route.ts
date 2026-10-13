import { clientArea, company, howWeWork, story } from "@/content/site";
import { apiOk } from "@/lib/http";

export function GET() {
  return apiOk({ company, story, howWeWork, clientArea });
}
