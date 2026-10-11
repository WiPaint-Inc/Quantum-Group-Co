import type { SanctionsDecision, SanctionsInput, SanctionsScreener } from "./types";

export const passthroughScreener: SanctionsScreener = {
  async screen(): Promise<SanctionsDecision> {
    return {
      allowed: true,
      reason: "No sanctions provider is configured. No list was queried.",
    };
  },
};

export function screenerFromEnv(webhookUrl: string): SanctionsScreener {
  if (!webhookUrl) return passthroughScreener;
  let endpoint: URL;
  try {
    endpoint = new URL(webhookUrl);
  } catch {
    return {
      async screen(): Promise<SanctionsDecision> {
        return { allowed: false, reason: "The sanctions webhook URL is not valid." };
      },
    };
  }
  if (endpoint.protocol !== "https:") {
    return {
      async screen(): Promise<SanctionsDecision> {
        return { allowed: false, reason: "The sanctions webhook must use HTTPS." };
      },
    };
  }
  return {
    async screen(input: SanctionsInput): Promise<SanctionsDecision> {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
          signal: AbortSignal.timeout(4000),
          redirect: "error",
        });
        if (!response.ok) return { allowed: false, reason: "Sanctions screening did not accept the payment." };
        const body = (await response.json()) as { allowed?: unknown; reason?: unknown };
        if (body.allowed === true) {
          return { allowed: true, reason: typeof body.reason === "string" ? body.reason : "Screening webhook allowed the payment." };
        }
        return { allowed: false, reason: typeof body.reason === "string" ? body.reason : "Screening webhook blocked the payment." };
      } catch {
        return { allowed: false, reason: "Sanctions screening could not be reached." };
      }
    },
  };
}
