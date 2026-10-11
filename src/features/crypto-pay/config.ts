import { isPlaceholderAddress } from "./validate";
import type { PayEnv, ProfileAddresses } from "./types";

const DEFAULTS: Record<"quantum" | "tip", ProfileAddresses> = {
  quantum: {
    base: "0xYOUR_QUANTUM_BASE_ADDRESS",
    ethereum: "0xYOUR_QUANTUM_ETHEREUM_ADDRESS",
    solana: "YOUR_QUANTUM_SOLANA_ADDRESS",
  },
  tip: {
    base: "0xYOUR_TIP_BASE_ADDRESS",
    ethereum: "0xYOUR_TIP_ETHEREUM_ADDRESS",
    solana: "YOUR_TIP_SOLANA_ADDRESS",
  },
};

function readAddress(env: NodeJS.ProcessEnv, key: string, fallback: string): string {
  const value = env[key]?.trim();
  return value || fallback;
}

export function readPayEnv(env: NodeJS.ProcessEnv = process.env): PayEnv {
  return {
    paymentsEnabled: env.PAYMENTS_ENABLED === "true",
    reownProjectId: env.NEXT_PUBLIC_REOWN_PROJECT_ID?.trim() ?? "",
    solanaRpcUrl: env.PAY_SOLANA_RPC_URL?.trim() || "https://api.mainnet-beta.solana.com",
    sanctionsWebhookUrl: env.SANCTIONS_WEBHOOK_URL?.trim() ?? "",
    profiles: {
      quantum: {
        base: readAddress(env, "PAY_QUANTUM_BASE_ADDRESS", DEFAULTS.quantum.base),
        ethereum: readAddress(env, "PAY_QUANTUM_ETHEREUM_ADDRESS", DEFAULTS.quantum.ethereum),
        solana: readAddress(env, "PAY_QUANTUM_SOLANA_ADDRESS", DEFAULTS.quantum.solana),
      },
      tip: {
        base: readAddress(env, "PAY_TIP_BASE_ADDRESS", DEFAULTS.tip.base),
        ethereum: readAddress(env, "PAY_TIP_ETHEREUM_ADDRESS", DEFAULTS.tip.ethereum),
        solana: readAddress(env, "PAY_TIP_SOLANA_ADDRESS", DEFAULTS.tip.solana),
      },
    },
  };
}

export function reownReady(projectId: string): boolean {
  return /^[a-fA-F0-9]{32}$/.test(projectId);
}

export function addressesArePlaceholders(env: PayEnv): boolean {
  return Object.values(env.profiles).some((profile) => Object.values(profile).some((address) => isPlaceholderAddress(address)));
}
