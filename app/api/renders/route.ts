import { atmosphereImages } from "@/content/portfolio";
import { renders } from "@/content/site";
import { apiOk } from "@/lib/http";

export function GET() {
  return apiOk({
    renders,
    photographs: atmosphereImages.map((image) => ({ src: image.src, caption: image.caption })),
  });
}
