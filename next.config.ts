import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Supported by @opennextjs/cloudflare on the Node.js runtime (composable cache and PPR).
  // The request gate stays in middleware.ts, because proxy.ts is Node-only and the adapter does not run it.
  cacheComponents: true,
  partialPrefetching: true,
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
