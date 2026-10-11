import { estates } from "@/content/site";
import { apiOk } from "@/lib/http";

export function GET() {
  return apiOk({ estates });
}
