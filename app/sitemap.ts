import type { MetadataRoute } from "next";
import { developments, estates } from "@/content/site";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/estates", "/about", "/developments", "/marketplace", "/client"];
  return [
    ...paths.map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
    ...estates.map((estate) => ({
      url: absoluteUrl(`/estates/${estate.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...developments.map((item) => ({
      url: absoluteUrl(`/developments/${item.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
