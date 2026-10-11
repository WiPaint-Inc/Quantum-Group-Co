import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components need the Node.js runtime. See README hosting notes.
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
