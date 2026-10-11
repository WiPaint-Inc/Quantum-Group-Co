import { renders } from "@/content/site";
import { apiOk } from "@/lib/http";

export function GET(request: Request) {
  const estate = new URL(request.url).searchParams.get("estate");
  const items = estate ? renders.filter((item) => item.estateSlug === estate) : renders;
  return apiOk({ renders: items });
}
