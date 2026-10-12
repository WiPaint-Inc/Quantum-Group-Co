/** True for Cloudflare preview hostnames such as `*.workers.dev`. */
export function isWorkersPreviewHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const hostname = host.split(",")[0]?.trim().split(":")[0]?.toLowerCase() ?? "";
  return hostname.endsWith(".workers.dev");
}
