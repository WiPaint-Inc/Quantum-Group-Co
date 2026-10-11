export const copy = {
  disabled: "Payments not yet enabled",
  unconfigured: "Payments not configured",
  shared: "Each business profile needs its own receiving addresses.",
  invoiceHelp:
    "Enter the invoice number from the invoice. Amounts are in US dollars. USDC and USDT are credited 1:1. ETH and SOL amounts are estimates from a public price, and stablecoins are recommended.",
  invoiceRequired: "Enter the invoice number.",
  completion:
    "Payment is complete only when the full USD amount, net of network fees, is confirmed on-chain. Wrong-chain or wrong-address payments are at the payer's risk.",
  blocked: "This payment cannot be completed.",
  stableCredit: "USDC and USDT are credited 1:1 with the US dollar amount.",
  stablecoinRecommendation: "Stablecoins are recommended. The figure shown for ETH or SOL is an estimate.",
  estimateLabel: "Estimate",
  contactRequired: "Enter a name and email before sending this amount.",
  payerAddressRequired: "Connect a wallet on the selected network.",
  sendWarning: "You send from your own wallet. The site does not hold, convert, swap, or forward funds.",
  nonCustodial:
    "Non-custodial. The site never holds keys or funds. A payment goes from the payer wallet to the published receiving address. Nothing is converted, swapped, or forwarded.",
  antigua:
    "Digital-asset activity can fall under the laws of Antigua and Barbuda, including the Digital Assets Business Act, and under the laws of the payer's own jurisdiction. This page is not legal or tax advice. Antigua counsel must sign off before PAYMENTS_ENABLED is turned on.",
  walletMissing: "Wallet connection is unavailable until a Reown project id is set. You can still pay by scanning the code or copying the address.",
  sanctionsPassthrough:
    "Address screening is not connected. The default hook allows a payment. Connect a screening service before payments are turned on.",
  sanctionsConfigured: "Address screening is configured. A payment is refused when that hook does not allow it.",
  profileRequired: "Choose a payment profile.",
  modeRequired: "Choose a payment mode.",
} as const;

/** Mandated tip text. The business name is inserted from config. Do not paraphrase. */
export function tipDisclaimer(businessName: string): string {
  return `Tip / Thank-you payment. Optional, non-refundable payment made voluntarily in appreciation of services provided by ${businessName}. A tip is a payment for services, not a donation or charitable gift, not a purchase of any token, share or interest, and carries no right to profits, returns, governance or future services. No tax receipt is issued.`;
}
