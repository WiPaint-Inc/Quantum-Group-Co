import { plans } from "@/content/site";
import { apiOk } from "@/lib/http";

export function GET(request: Request) {
  const estate = new URL(request.url).searchParams.get("estate");
  const items = estate ? plans.filter((item) => item.estateSlug === estate) : plans;
  return apiOk({ plans: items });
}
