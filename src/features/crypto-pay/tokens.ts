import type { ChainId, TokenId } from "./types";

export const chainMeta: Record<ChainId, { label: string; chainId: number | null; nativeSymbol: "ETH" | "SOL"; explorerTx: string }> = {
  base: { label: "Base", chainId: 8453, nativeSymbol: "ETH", explorerTx: "https://basescan.org/tx/" },
  ethereum: { label: "Ethereum", chainId: 1, nativeSymbol: "ETH", explorerTx: "https://etherscan.io/tx/" },
  solana: { label: "Solana", chainId: null, nativeSymbol: "SOL", explorerTx: "https://solscan.io/tx/" },
};

/** Public mainnet contracts and mints. These are not receiving addresses and not secrets. */
export const tokenContracts: Record<Exclude<ChainId, "solana">, Record<"USDC" | "USDT", { address: `0x${string}`; decimals: number }>> = {
  ethereum: {
    USDC: { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
    USDT: { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
  },
  base: {
    USDC: { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
    USDT: { address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", decimals: 6 },
  },
};

export const solanaMints: Record<"USDC" | "USDT", string> = {
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
};

export function tokenAllowed(chain: ChainId, token: TokenId): boolean {
  if (token === "SOL") return chain === "solana";
  if (token === "ETH") return chain === "base" || chain === "ethereum";
  return true;
}

export function tokenDecimals(chain: ChainId, token: TokenId): number {
  if (token === "ETH") return 18;
  if (token === "SOL") return 9;
  if (chain === "solana") return 6;
  return tokenContracts[chain][token].decimals;
}

export const erc20TransferAbi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;
