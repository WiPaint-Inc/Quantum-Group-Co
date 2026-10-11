import type { PayEnv, ProfileAddresses } from "./types";
import { isPlaceholderAddress } from "./validate";

/**
 * Public receiving addresses. Replace the placeholders before enabling payments.
 * Env values override these so a second site can change addresses without editing code.
 * Invoice and tip profiles must not share an address.
 */
export const receivingAddresses: Record<"invoice" | "tip", ProfileAddresses> = {
  invoice: {
    base: "0xYOUR_BASE_ADDRESS",
    ethereum: "0xYOUR_ETHEREUM_ADDRESS",
    solana: "YOUR_SOLANA_ADDRESS",
  },
  tip: {
    base: "0xYOUR_TIP_BASE_ADDRESS",
    ethereum: "0xYOUR_TIP_ETHEREUM_ADDRESS",
    solana: "YOUR_TIP_SOLANA_ADDRESS",
  },
};

/** Amounts a payer can select. They are not a price list for a house. */
export const presetAmountsUsd = [1000, 5000, 10000] as const;

export const payeeName = "Quantum Group Co";

const STRIPE_HOSTS = new Set(["buy.stripe.com"]);
const COINBASE_HOSTS = new Set(["commerce.coinbase.com"]);

function readAddress(env: NodeJS.ProcessEnv, keys: string[], fallback: string): string {
  for (const key of keys) {
    const value = env[key]?.trim();
    if (value) return value;
  }
  return fallback;
}

function hostedLink(value: string, hosts: Set<string>): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !hosts.has(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function readPayEnv(env: NodeJS.ProcessEnv = process.env): PayEnv {
  const fiatEnabled = env.PAY_FIAT_ENABLED === "true";
  return {
    payeeName,
    paymentsEnabled: env.PAYMENTS_ENABLED === "true",
    reownProjectId: env.NEXT_PUBLIC_REOWN_PROJECT_ID?.trim() ?? "",
    solanaRpcUrl: env.PAY_SOLANA_RPC_URL?.trim() || "https://api.mainnet-beta.solana.com",
    sanctionsWebhookUrl: env.SANCTIONS_WEBHOOK_URL?.trim() ?? "",
    presetAmountsUsd,
    fiat: {
      stripe: fiatEnabled ? hostedLink(env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK?.trim() ?? "", STRIPE_HOSTS) : null,
      coinbase: fiatEnabled ? hostedLink(env.NEXT_PUBLIC_COINBASE_COMMERCE_URL?.trim() ?? "", COINBASE_HOSTS) : null,
    },
    profiles: {
      quantum: {
        base: readAddress(env, ["PAY_BASE_ADDRESS", "PAY_QUANTUM_BASE_ADDRESS"], receivingAddresses.invoice.base),
        ethereum: readAddress(env, ["PAY_ETHEREUM_ADDRESS", "PAY_QUANTUM_ETHEREUM_ADDRESS"], receivingAddresses.invoice.ethereum),
        solana: readAddress(env, ["PAY_SOLANA_ADDRESS", "PAY_QUANTUM_SOLANA_ADDRESS"], receivingAddresses.invoice.solana),
      },
      tip: {
        base: readAddress(env, ["PAY_TIP_BASE_ADDRESS"], receivingAddresses.tip.base),
        ethereum: readAddress(env, ["PAY_TIP_ETHEREUM_ADDRESS"], receivingAddresses.tip.ethereum),
        solana: readAddress(env, ["PAY_TIP_SOLANA_ADDRESS"], receivingAddresses.tip.solana),
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
