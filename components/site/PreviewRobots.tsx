import { headers } from "next/headers";
import { isWorkersPreviewHost } from "@/lib/preview-host";

/** Server-rendered noindex meta for `*.workers.dev`. Next hoists this into `<head>`. */
export async function PreviewRobots() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!isWorkersPreviewHost(host)) return null;
  return <meta name="robots" content="noindex, nofollow" />;
}
