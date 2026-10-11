import type { MetadataRoute } from "next";
import { portfolioProjects } from "@/content/portfolio";
import { services } from "@/content/site";
import { paymentsEnabled, roboticsEnabled } from "@/lib/flags";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/services", "/portfolio", "/about", "/how-we-work", "/finishing", "/marketplace", "/contact", "/client", ...(paymentsEnabled() ? ["/pay"] : [])];
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
    ...portfolioProjects.map((project) => ({
      url: absoluteUrl(`/portfolio/${project.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
