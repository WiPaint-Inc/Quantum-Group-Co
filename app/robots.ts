import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { agentApiEnabled } from "@/lib/flags";
import { isWorkersPreviewHost } from "@/lib/preview-host";
import { absoluteUrl } from "@/lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (isWorkersPreviewHost(host)) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: agentApiEnabled()
        ? ["/concept/demo-villa"]
        : ["/llms.txt", "/api/openapi", "/api/openapi.json", "/api/auth/agent", "/concept/demo-villa"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
