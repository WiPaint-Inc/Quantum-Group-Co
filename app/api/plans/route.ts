import { plans } from "@/content/site";
import { apiOk } from "@/lib/http";

export function GET() {
  return apiOk({ plans });
}
