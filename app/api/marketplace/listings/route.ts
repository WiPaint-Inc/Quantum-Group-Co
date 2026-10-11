import { marketplaceListings } from "@/content/site";
import { apiOk } from "@/lib/http";

export function GET(request: Request) {
  const kind = new URL(request.url).searchParams.get("kind");
  const listings =
    kind === "plan" || kind === "render"
      ? marketplaceListings.filter((item) => item.kind === kind)
      : marketplaceListings;
  return apiOk({ listings });
}
