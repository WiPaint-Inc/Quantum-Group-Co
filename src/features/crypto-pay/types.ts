export const chains = ["base", "ethereum", "solana"] as const;
export const tokens = ["USDC", "USDT", "ETH", "SOL"] as const;
export const profiles = ["quantum", "tip"] as const;
export const modes = ["invoice", "tip"] as const;

export type ChainId = (typeof chains)[number];
export type TokenId = (typeof tokens)[number];
export type ProfileId = (typeof profiles)[number];
export type PayMode = (typeof modes)[number];

export type ProfileAddresses = Record<ChainId, string>;

export type PayEnv = {
  paymentsEnabled: boolean;
  reownProjectId: string;
  solanaRpcUrl: string;
  sanctionsWebhookUrl: string;
  profiles: Record<ProfileId, ProfileAddresses>;
};

export type PaymentDraft = {
  mode: string;
  chain: string;
  token: string;
  amountUsd: string;
  invoiceNumber: string;
  fromAddress?: string;
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
  decimals: number;
};

export type Quote = {
  token: "ETH" | "SOL";
  usdPerToken: number;
  source: string;
  at: string;
};

export type SanctionsInput = {
  mode: PayMode;
  profileId: ProfileId;
  chain: ChainId;
  token: TokenId;
  amountUsd: string;
  invoiceNumber: string | null;
  toAddress: string;
  fromAddress: string | null;
};

export type SanctionsDecision = {
  allowed: boolean;
  reason: string;
};

export interface SanctionsScreener {
  screen(input: SanctionsInput): Promise<SanctionsDecision>;
}

export type PaymentLogStatus = "submitted" | "confirmed" | "failed" | "blocked";

export type PaymentLogRecord = {
  id: string;
  at: string;
  mode: PayMode;
  profileId: ProfileId;
  invoiceNumber: string | null;
  amountUsd: string;
  tokenAmount: string;
  estimated: boolean;
  token: TokenId;
  chain: ChainId;
  toAddress: string;
  fromAddress: string | null;
  txHash: string | null;
  status: PaymentLogStatus;
  sanctions: string;
  chainVerified: false;
};

export interface PaymentLogger {
  log(record: PaymentLogRecord): Promise<void>;
}
