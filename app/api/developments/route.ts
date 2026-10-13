import { getService } from "@/content/site";
import { apiOk } from "@/lib/http";

export function GET() {
  return apiOk({ developments: [getService("developments")] });
}
