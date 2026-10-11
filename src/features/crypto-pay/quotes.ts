import type { Quote } from "./types";

const ids = { ETH: "ethereum", SOL: "solana" } as const;

export async function quoteToken(token: "ETH" | "SOL", fetchImpl: typeof fetch = fetch): Promise<Quote | null> {
  try {
    const response = await fetchImpl(`https://api.coingecko.com/api/v3/simple/price?ids=${ids[token]}&vs_currencies=usd`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as Record<string, { usd?: unknown }>;
    const usd = body[ids[token]]?.usd;
    if (typeof usd !== "number" || !(usd > 0)) return null;
    return { token, usdPerToken: usd, source: "coingecko", at: new Date().toISOString() };
  } catch {
    return null;
  }
}
