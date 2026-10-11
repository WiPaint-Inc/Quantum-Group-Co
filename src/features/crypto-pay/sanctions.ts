import type { ChainId, SanctionsDecision, SanctionsScreener } from "./types";

/**
 * Optional chain-analytics hook. The default allows every address.
 *
 * Set SANCTIONS_API_URL to an HTTPS endpoint. The server POSTs
 * `{ "address", "chain" }` and treats `{ "allowed": false }` or `{ "blocked": true }`
 * as a refusal. SANCTIONS_API_KEY, when set, is sent as a Bearer token on the
 * server only. Both variables are unset by default. Do not commit a key.
 */
export const passthroughScreener: SanctionsScreener = {
  async screenAddress(): Promise<SanctionsDecision> {
    return { allowed: true };
  },
};

export function screenerFromEnv(apiUrl: string, apiKey = "", fetchImpl: typeof fetch = fetch): SanctionsScreener {
  const trimmed = apiUrl.trim();
  if (!trimmed) return passthroughScreener;
  let endpoint: URL;
  try {
    endpoint = new URL(trimmed);
  } catch {
    return closedScreener;
  }
  if (endpoint.protocol !== "https:") return closedScreener;
  return {
    async screenAddress(address: string, chain: ChainId): Promise<SanctionsDecision> {
      try {
        const headers: Record<string, string> = { "content-type": "application/json" };
        if (apiKey.trim()) headers.authorization = `Bearer ${apiKey.trim()}`;
        const response = await fetchImpl(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify({ address, chain }),
          signal: AbortSignal.timeout(4000),
          redirect: "error",
        });
        if (!response.ok) return { allowed: false };
        const body = (await response.json()) as { allowed?: unknown; blocked?: unknown };
        if (body.allowed === false || body.blocked === true) return { allowed: false };
        if (body.allowed === true) return { allowed: true };
        return { allowed: false };
      } catch {
        return { allowed: false };
      }
    },
  };
}

const closedScreener: SanctionsScreener = {
  async screenAddress(): Promise<SanctionsDecision> {
    return { allowed: false };
  },
};

export async function screenPaymentAddresses(
  screener: SanctionsScreener,
  chain: ChainId,
  toAddress: string,
  fromAddress: string | null,
): Promise<SanctionsDecision> {
  const destination = await screener.screenAddress(toAddress, chain);
  if (!destination.allowed) return destination;
  if (!fromAddress) return { allowed: true };
  return screener.screenAddress(fromAddress, chain);
}
