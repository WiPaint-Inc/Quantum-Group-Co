import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Cache Components stage their render with Node's setTimeout/_idleStart scheduler.
  // workerd has no _idleStart, and @opennextjs/cloudflare 1.20.10 does not ship the
  // replacement scheduler, so connection() and headers() stay pending and the Worker hangs.
  // The request gate stays in middleware.ts, because proxy.ts is Node-only and the adapter does not run it.
  cacheComponents: false,
  partialPrefetching: false,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/services/full-rendering-design-engineering-plans",
        destination: "/services/rendering-design-engineering-plans",
        permanent: false,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();
