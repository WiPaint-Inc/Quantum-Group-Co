import { reownReady } from "./config";
import { profileConfigured, sharedProfileAddresses } from "./validate";
import type { PayEnv } from "./types";

export function paymentStatus(env: PayEnv) {
  return {
    enabled: env.paymentsEnabled,
    custody: "non-custodial" as const,
    forwarding: "none" as const,
    stablesCreditedOneToOne: true,
    sanctions: env.sanctionsApiUrl ? ("configured" as const) : ("passthrough" as const),
    paymentLog: env.paymentLogWebhookUrl ? ("webhook" as const) : ("console" as const),
    walletConnect: reownReady(env.reownProjectId),
    chains: ["base", "ethereum", "solana"] as const,
    tokens: ["USDC", "USDT", "ETH", "SOL"] as const,
    profile: "quantum" as const,
    configured: profileConfigured(env, "quantum"),
    sharedAddresses: sharedProfileAddresses(env).length > 0,
  };
}
