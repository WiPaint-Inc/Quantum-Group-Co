import type { MetadataRoute } from "next";
import { estates } from "@/content/estates";
import { portfolioProjects } from "@/content/portfolio";
// conceptRenders are draft studies. They have no public URLs and are not listed here.
import { services } from "@/content/site";
import { paymentsEnabled, roboticsEnabled } from "@/lib/flags";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/services", "/estates", "/portfolio", "/about", "/how-we-work", "/finishing", "/marketplace", "/contact", "/client", ...(paymentsEnabled() ? ["/pay"] : [])];
  return [
    ...paths.map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
    ...services.map((service) => ({
      url: absoluteUrl(`/services/${service.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...(roboticsEnabled()
      ? [{ url: absoluteUrl("/services/robotics"), changeFrequency: "monthly" as const, priority: 0.4 }]
      : []),
    ...estates.map((estate) => ({
      url: absoluteUrl(`/estates/${estate.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...portfolioProjects.map((project) => ({
      url: absoluteUrl(`/portfolio/${project.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
