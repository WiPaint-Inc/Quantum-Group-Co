import { reownReady } from "./config";
import { profileConfigured, sharedProfileAddresses } from "./validate";
import type { PayEnv } from "./types";

export function paymentStatus(env: PayEnv) {
  return {
    enabled: env.paymentsEnabled,
    custody: "non-custodial" as const,
    stablesPeggedToUsd: true,
    sanctions: env.sanctionsWebhookUrl ? ("webhook" as const) : ("passthrough" as const),
    walletConnect: reownReady(env.reownProjectId),
    chains: ["base", "ethereum", "solana"] as const,
    tokens: ["USDC", "USDT", "ETH", "SOL"] as const,
    profiles: {
      quantum: profileConfigured(env, "quantum"),
      tip: profileConfigured(env, "tip"),
    },
    sharedAddresses: sharedProfileAddresses(env).length > 0,
  };
}
