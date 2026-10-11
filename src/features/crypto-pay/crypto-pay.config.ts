import type { BusinessProfile, PayEnv, ProfileId } from "./types";
import { isPlaceholderAddress } from "./validate";

/**
 * Named receiving profiles. Each profile has its own addresses.
 * Never copy an address from one profile onto the other.
 * Replace the placeholders before turning payments on.
 */
export const profileDefaults: Record<ProfileId, BusinessProfile> = {
  quantum: {
    businessName: "Quantum Group Co",
    addresses: {
      base: "0xYOUR_BASE_ADDRESS",
      ethereum: "0xYOUR_ETHEREUM_ADDRESS",
      solana: "YOUR_SOLANA_ADDRESS",
    },
  },
  botSite: {
    businessName: "Bot Site",
    addresses: {
      base: "0xYOUR_BOT_BASE_ADDRESS",
      ethereum: "0xYOUR_BOT_ETHEREUM_ADDRESS",
      solana: "YOUR_BOT_SOLANA_ADDRESS",
    },
  },
};

/** Master switch used when PAYMENTS_ENABLED is unset. */
export const paymentsEnabledDefault = false;

/** Used when ANONYMOUS_TIP_CAP_USD is unset. Amounts above this need a name and email. */
export const anonymousTipCapUsdDefault = 1000;

/** Amounts a payer can select. They are not a price list for a house. */
export const presetAmountsUsd = [1000, 5000, 10000] as const;

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

function readPaymentsEnabled(env: NodeJS.ProcessEnv): boolean {
  const raw = env.PAYMENTS_ENABLED;
  if (raw === undefined || raw.trim() === "") return paymentsEnabledDefault;
  return raw.trim() === "true";
}

function readTipCap(env: NodeJS.ProcessEnv): number {
  const raw = env.ANONYMOUS_TIP_CAP_USD?.trim();
  if (!raw) return anonymousTipCapUsdDefault;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return anonymousTipCapUsdDefault;
  return value;
}

function readProfile(env: NodeJS.ProcessEnv, profileId: ProfileId, keys: Record<"base" | "ethereum" | "solana" | "businessName", string[]>): BusinessProfile {
  const defaults = profileDefaults[profileId];
  const businessName = readAddress(env, keys.businessName, defaults.businessName);
  return {
    businessName,
    addresses: {
      base: readAddress(env, keys.base, defaults.addresses.base),
      ethereum: readAddress(env, keys.ethereum, defaults.addresses.ethereum),
      solana: readAddress(env, keys.solana, defaults.addresses.solana),
    },
  };
}

export function readPayEnv(env: NodeJS.ProcessEnv = process.env): PayEnv {
  const fiatEnabled = env.PAY_FIAT_ENABLED === "true";
  return {
    paymentsEnabled: readPaymentsEnabled(env),
    reownProjectId: env.NEXT_PUBLIC_REOWN_PROJECT_ID?.trim() ?? "",
    solanaRpcUrl: env.PAY_SOLANA_RPC_URL?.trim() || "https://api.mainnet-beta.solana.com",
    sanctionsApiUrl: env.SANCTIONS_API_URL?.trim() ?? "",
    sanctionsApiKey: env.SANCTIONS_API_KEY?.trim() ?? "",
    paymentLogWebhookUrl: env.PAYMENT_LOG_WEBHOOK_URL?.trim() ?? "",
    anonymousTipCapUsd: readTipCap(env),
    presetAmountsUsd,
    fiat: {
      stripe: fiatEnabled ? hostedLink(env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK?.trim() ?? "", STRIPE_HOSTS) : null,
      coinbase: fiatEnabled ? hostedLink(env.NEXT_PUBLIC_COINBASE_COMMERCE_URL?.trim() ?? "", COINBASE_HOSTS) : null,
    },
    profiles: {
      quantum: readProfile(env, "quantum", {
        businessName: ["PAY_QUANTUM_BUSINESS_NAME"],
        base: ["PAY_QUANTUM_BASE_ADDRESS", "PAY_BASE_ADDRESS"],
        ethereum: ["PAY_QUANTUM_ETHEREUM_ADDRESS", "PAY_ETHEREUM_ADDRESS"],
        solana: ["PAY_QUANTUM_SOLANA_ADDRESS", "PAY_SOLANA_ADDRESS"],
      }),
      botSite: readProfile(env, "botSite", {
        businessName: ["PAY_BOT_BUSINESS_NAME"],
        base: ["PAY_BOT_BASE_ADDRESS"],
        ethereum: ["PAY_BOT_ETHEREUM_ADDRESS"],
        solana: ["PAY_BOT_SOLANA_ADDRESS"],
      }),
    },
  };
}

export function reownReady(projectId: string): boolean {
  return /^[a-fA-F0-9]{32}$/.test(projectId);
}

export function addressesArePlaceholders(env: PayEnv): boolean {
  return Object.values(env.profiles).some((profile) => Object.values(profile.addresses).some((address) => isPlaceholderAddress(address)));
}
