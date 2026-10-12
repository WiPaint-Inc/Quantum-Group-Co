import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Free-plan Worker: no R2 bucket and no Images binding.
// The dummy adapters keep the build from requiring cache infrastructure.
export default defineCloudflareConfig({
  incrementalCache: "dummy",
  tagCache: "dummy",
  queue: "dummy",
  cachePurge: "dummy",
});
