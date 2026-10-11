import type { MetadataRoute } from "next";
import { agentApiEnabled } from "@/lib/flags";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      ...(agentApiEnabled()
        ? {}
        : { disallow: ["/llms.txt", "/api/openapi", "/api/openapi.json", "/api/auth/agent"] }),
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
