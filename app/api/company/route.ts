import { about, clientArea, company, realms } from "@/content/site";
import { apiOk } from "@/lib/http";

export function GET() {
  return apiOk({ company, about, clientArea, realms });
}
