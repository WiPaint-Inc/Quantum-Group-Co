export const copy = {
  disabled: "Payments are not yet enabled.",
  unconfigured: "Payments not configured",
  shared: "Invoice and tip profiles share a receiving address. Sending stays blocked until each profile has its own addresses.",
  invoiceHelp:
    "Enter the invoice number exactly as it appears on your invoice. The amount is that invoice in US dollars. USDC and USDT are treated as one US dollar each. ETH and SOL amounts are estimates from a live quote and are not a locked rate.",
  tip:
    "A tip is voluntary. It does not pay an invoice, buy goods or services, or represent equity. It is not a tax receipt. Tips use a separate receiving profile from invoice payments. Send a tip only if you mean to, and only after you have checked the network, the token, and the address.",
  sendWarning: "You are sending digital assets from your own wallet. Quantum Group Co cannot reverse a transfer.",
  antigua:
    "Quantum Group Co may accept digital assets only as payment of a stated invoice for its own construction and related services in Antigua and Barbuda, or, separately, as a voluntary tip. The company does not offer digital-asset custody, exchange, or investment services, and it does not hold a payer's keys or funds. A transfer goes from the payer's wallet to a published receiving address. Network fees are paid by the payer. Transfers are generally irreversible. Confirm the invoice, the amount, the network, the token, and the address before you send. This page is not legal, tax, or investment advice. Digital-asset activity can fall under the laws of Antigua and Barbuda, including the Digital Assets Business Act, and under the laws of the payer's own jurisdiction.",
  nonCustodial: "Non-custodial. The site never holds keys or funds. Nothing is sent until you confirm it in your own wallet.",
  walletMissing: "Wallet connection is unavailable until a Reown project id is set. You can still pay by scanning the code or copying the address.",
  sanctionsPassthrough: "Sanctions screening is not connected. The default hook allows the payment and records that no list was queried. Connect a screening webhook before you enable payments.",
  sanctionsWebhook: "A sanctions screening webhook is configured. A payment is refused when that hook does not allow it.",
} as const;
