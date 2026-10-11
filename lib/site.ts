/** Domain is not final. Set NEXT_PUBLIC_SITE_URL before launch. */
export const FALLBACK_SITE_URL = "https://quantum-group.example";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK_SITE_URL;
  try {
    const url = new URL(raw);
    return url.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export function absoluteUrl(path: string): string {
  const site = getSiteUrl();
  if (!path || path === "/") return site;
  return `${site}${path.startsWith("/") ? path : `/${path}`}`;
}
