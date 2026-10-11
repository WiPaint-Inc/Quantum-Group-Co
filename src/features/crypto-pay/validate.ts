import { chainMeta, tokenAllowed, tokenDecimals } from "./tokens";
import { chains, modes, tokens, type ChainId, type PayEnv, type PayMode, type PaymentDraft, type ProfileId, type Quote, type SettledPayment, type TokenId } from "./types";

const EVM = /^0x[a-fA-F0-9]{40}$/;
const SOLANA = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isPlaceholderAddress(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (/your_|placeholder|change_me|example|xxx+/i.test(trimmed)) return true;
  if (/^0x0{40}$/i.test(trimmed)) return true;
  return false;
}

export function isValidAddress(chain: ChainId, value: string): boolean {
  if (isPlaceholderAddress(value)) return false;
  const trimmed = value.trim();
  if (chain === "solana") return SOLANA.test(trimmed);
  return EVM.test(trimmed);
}

export function sharedProfileAddresses(env: PayEnv): string[] {
  const tip = new Set(Object.values(env.profiles.tip).map((address) => address.trim().toLowerCase()).filter(Boolean));
  return Object.values(env.profiles.quantum)
    .map((address) => address.trim().toLowerCase())
    .filter((address) => address && tip.has(address));
}

export function profileConfigured(env: PayEnv, profileId: ProfileId): boolean {
  return chains.every((chain) => isValidAddress(chain, env.profiles[profileId][chain]));
}

export function profileForMode(mode: PayMode): ProfileId {
  return mode === "invoice" ? "quantum" : "tip";
}

export function parseInvoiceNumber(value: string): string | null {
  const trimmed = value.trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]{1,63}$/.test(trimmed)) return null;
  return trimmed;
}

export function parseUsdAmount(value: string): string | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const amount = Number(trimmed);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 50_000_000) return null;
  return amount.toFixed(2);
}

export function toBaseUnits(amount: string, decimals: number): bigint {
  if (!/^\d+(\.\d+)?$/.test(amount)) throw new Error("Amount is not a decimal string.");
  const [whole, fraction = ""] = amount.split(".");
  if (fraction.length > decimals) throw new Error("Amount has too many decimal places.");
  const padded = (fraction + "0".repeat(decimals)).slice(0, decimals);
  return BigInt(whole) * (BigInt(10) ** BigInt(decimals)) + BigInt(padded || "0");
}

export function estimateNativeAmount(usd: string, usdPerToken: number): string | null {
  if (!(usdPerToken > 0) || !Number.isFinite(usdPerToken)) return null;
  const value = Number(usd) / usdPerToken;
  if (!Number.isFinite(value) || value <= 0) return null;
  const fixed = value.toFixed(8);
  return fixed.replace(/0+$/, "").replace(/\.$/, "");
}

export function gateProfile(env: PayEnv, mode: PayMode): { ok: true } | { ok: false; message: string } {
  if (!env.paymentsEnabled) return { ok: false, message: "Payments are not yet enabled." };
  if (sharedProfileAddresses(env).length > 0) {
    return { ok: false, message: "Invoice and tip profiles share a receiving address." };
  }
  const profileId = profileForMode(mode);
  if (!profileConfigured(env, profileId)) {
    return { ok: false, message: "Receiving addresses for this payment are still placeholders." };
  }
  return { ok: true };
}

export function settlePayment(draft: PaymentDraft, env: PayEnv, quote: Quote | null): { ok: true; payment: SettledPayment } | { ok: false; message: string } {
  if (!modes.includes(draft.mode as PayMode)) return { ok: false, message: "Choose an invoice payment or a tip." };
  const mode = draft.mode as PayMode;
  const gate = gateProfile(env, mode);
  if (!gate.ok) return gate;
  if (!chains.includes(draft.chain as ChainId)) return { ok: false, message: "Choose Base, Ethereum, or Solana." };
  if (!tokens.includes(draft.token as TokenId)) return { ok: false, message: "Choose USDC, USDT, ETH, or SOL." };
  const chain = draft.chain as ChainId;
  const token = draft.token as TokenId;
  if (!tokenAllowed(chain, token)) return { ok: false, message: `${token} is not available on ${chainMeta[chain].label}.` };

  const amountUsd = parseUsdAmount(draft.amountUsd);
  if (!amountUsd) return { ok: false, message: "Enter the invoice amount in US dollars." };

  let invoiceNumber: string | null = null;
  if (mode === "invoice") {
    invoiceNumber = parseInvoiceNumber(draft.invoiceNumber);
    if (!invoiceNumber) return { ok: false, message: "An invoice number is required." };
  }

  const stable = token === "USDC" || token === "USDT";
  let tokenAmount: string;
  let estimated = false;
  if (stable) {
    tokenAmount = amountUsd;
  } else {
    if (!quote || quote.token !== token) return { ok: false, message: "A live quote is required before an ETH or SOL amount can be estimated." };
    const estimatedAmount = estimateNativeAmount(amountUsd, quote.usdPerToken);
    if (!estimatedAmount) return { ok: false, message: "The quote could not be turned into a token amount." };
    tokenAmount = estimatedAmount;
    estimated = true;
  }

  const profileId = profileForMode(mode);
  const toAddress = env.profiles[profileId][chain].trim();
  const fromAddress = draft.fromAddress?.trim() || null;
  if (fromAddress && !isValidAddress(chain, fromAddress)) return { ok: false, message: "The sending address is not valid for that network." };

  return {
    ok: true,
    payment: {
      mode,
      profileId,
      chain,
      token,
      amountUsd,
      tokenAmount,
      estimated,
      invoiceNumber,
      toAddress,
      fromAddress,
      decimals: tokenDecimals(chain, token),
    },
  };
}
