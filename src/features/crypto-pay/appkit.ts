"use client";

import { SolanaAdapter } from "@reown/appkit-adapter-solana";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { base, mainnet, solana } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import type { Config } from "wagmi";

let config: Config | null = null;

export function ensurePayAppKit(projectId: string, siteUrl: string, businessName: string): Config {
  if (config) return config;
  const wagmi = new WagmiAdapter({
    projectId,
    networks: [base, mainnet],
    ssr: true,
  });
  createAppKit({
    adapters: [wagmi, new SolanaAdapter()],
    projectId,
    networks: [base, mainnet, solana],
    defaultNetwork: base,
    metadata: {
      name: businessName,
      description: "Wallet to wallet payment",
      url: siteUrl,
      icons: [`${siteUrl}/icon`],
    },
    themeMode: "dark",
    features: {
      analytics: false,
      email: false,
      socials: false,
      onramp: false,
      swaps: false,
    },
  });
  config = wagmi.wagmiConfig;
  return config;
}
