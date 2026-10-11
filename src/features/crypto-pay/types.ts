export const chains = ["base", "ethereum", "solana"] as const;
export const tokens = ["USDC", "USDT", "ETH", "SOL"] as const;
export const profiles = ["quantum", "botSite"] as const;
export const modes = ["invoice", "tip"] as const;

export type ChainId = (typeof chains)[number];
export type TokenId = (typeof tokens)[number];
export type ProfileId = (typeof profiles)[number];
export type PayMode = (typeof modes)[number];

export type ProfileAddresses = Record<ChainId, string>;

export type BusinessProfile = {
  businessName: string;
  addresses: ProfileAddresses;
};

export type PayEnv = {
  paymentsEnabled: boolean;
  reownProjectId: string;
  solanaRpcUrl: string;
  sanctionsApiUrl: string;
  sanctionsApiKey: string;
  paymentLogWebhookUrl: string;
  anonymousTipCapUsd: number;
  presetAmountsUsd: readonly number[];
  fiat: { stripe: string | null; coinbase: string | null };
  profiles: Record<ProfileId, BusinessProfile>;
};

export type PaymentDraft = {
  mode: string;
  profileId: string;
  chain: string;
  token: string;
  amountUsd: string;
  invoiceNumber: string;
  fromAddress?: string;
  payerName?: string;
  payerEmail?: string;
};

export type SettledPayment = {
  mode: PayMode;
  profileId: ProfileId;
  chain: ChainId;
  token: TokenId;
  amountUsd: string;
  tokenAmount: string;
  estimated: boolean;
  invoiceNumber: string | null;
  toAddress: string;
  fromAddress: string | null;
  payerName: string | null;
  payerEmail: string | null;
  decimals: number;
  businessName: string;
};

export type Quote = {
  token: "ETH" | "SOL";
  usdPerToken: number;
  source: string;
  at: string;
};

export type SanctionsDecision = {
  allowed: boolean;
};

export interface SanctionsScreener {
  screenAddress(address: string, chain: ChainId): Promise<SanctionsDecision>;
}

export type PaymentLogStatus = "submitted" | "confirmed" | "failed" | "blocked";

export type PaymentReceipt = {
  txHash: string;
  chain: ChainId;
  token: TokenId;
  payerAddress: string;
  amountUsd: string;
  invoiceNumber: string | null;
  at: string;
};

export type PaymentLogRecord = PaymentReceipt & {
  id: string;
  mode: PayMode;
  profileId: ProfileId;
  tokenAmount: string;
  toAddress: string;
  payerName: string | null;
  payerEmail: string | null;
  status: PaymentLogStatus;
};

export interface PaymentLogger {
  log(record: PaymentLogRecord): Promise<void>;
}
