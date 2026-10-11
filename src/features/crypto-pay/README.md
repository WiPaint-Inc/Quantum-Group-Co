# Crypto pay

A portable, non-custodial panel for invoice payments. Copy this folder into another site and edit `crypto-pay.config.ts`. The module does not import the rest of the host site.

Funds move from the payer's wallet to a public receiving address. This code never generates, stores, or asks for a private key or a seed phrase. It does not hold, swap, convert, or forward funds.

## Configure

Profiles are `profiles.quantum` and `profiles.botSite`. Each has its own business name and its own Base, Ethereum, and Solana addresses. The module never copies an address from one profile to the other, and it never fills a gap in one profile with the other profile's address.

1. Replace the `YOUR_` placeholders for the profile you use, or set that profile's env vars. Quantum reads `PAY_QUANTUM_BASE_ADDRESS`, `PAY_QUANTUM_ETHEREUM_ADDRESS`, and `PAY_QUANTUM_SOLANA_ADDRESS` (`PAY_BASE_ADDRESS`, `PAY_ETHEREUM_ADDRESS`, and `PAY_SOLANA_ADDRESS` are aliases for quantum only). The other profile reads `PAY_BOT_BASE_ADDRESS`, `PAY_BOT_ETHEREUM_ADDRESS`, and `PAY_BOT_SOLANA_ADDRESS` only.
2. A shared address fails validation and blocks sending.
3. Leave `PAYMENTS_ENABLED` unset or `false` until counsel has signed off and the addresses are real. The config fallback is `false`.
4. Set `NEXT_PUBLIC_REOWN_PROJECT_ID` to a Reown project id when you want MetaMask, Coinbase Wallet, and Phantom through AppKit. Leave it empty and the panel offers a QR code and a copyable address only. AppKit swaps and onramps stay off.
5. USDC and USDT are credited 1:1 with the US dollar amount. ETH and SOL amounts are estimates from a public price, labeled as estimates. Stablecoins are recommended.

Chains are Base, Ethereum, and Solana. Token contracts live in `tokens.ts`, with the source for each address. Base USDT is the Base bridge of Ethereum USDT. Tether's own supported-protocols list does not include Base.

This host mounts invoice mode on the quantum profile only. Invoice number is required, and the pay button stays disabled without one. Tip mode stays in the module for a host that opts in. It is not mounted here.

## Card checkout

`PAY_FIAT_ENABLED` defaults off. When it is `true`, the panel can show two hosted links and nothing else:

- `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` must be an `https://buy.stripe.com/...` Payment Link. Create it in the Stripe Dashboard. Do not put a secret key in the repo. Stripe hosts the card form.
- `NEXT_PUBLIC_COINBASE_COMMERCE_URL` must be an `https://commerce.coinbase.com/...` hosted checkout. Create it in Coinbase Commerce. Do not put a Commerce API key in the repo.

Any other host is ignored. The links are public URLs, not credentials.

## Compliance

Antigua counsel must sign off before `PAYMENTS_ENABLED` is turned on.

These controls are mandatory:

0. **Master switch.** `PAYMENTS_ENABLED` defaults to false (env, with that config fallback). While it is false the full payment UI stays up, with the banner "Payments not yet enabled", and sending is blocked. Placeholder addresses are a separate check and show "Payments not configured". Both checks must pass before any send is allowed.
1. **Separate wallets.** `profiles.quantum` and `profiles.botSite` each have their own per-chain addresses. There is no shared wallet and no fallback between profiles. Validation fails if the two profiles share any address. This site uses `quantum`.
2. **Invoice mode.** The invoice number is required. Amounts are entered in USD. USDC and USDT are credited 1:1. ETH and SOL show a live USD estimate from a public price, labeled as an estimate, and stablecoins are recommended. The panel shows this note above the pay button: "Payment is complete only when the full USD amount, net of network fees, is confirmed on-chain. Wrong-chain or wrong-address payments are at the payer's risk." The confirmed receiving address for the selected chain is shown in full, with a copy control and a QR code, and it is tied to the invoice. After on-chain confirmation a pluggable `PaymentLogger` records the tx hash, chain, token, payer address, USD value, invoice number, and timestamp. The default implementation POSTs to the host log route, which forwards to `PAYMENT_LOG_WEBHOOK_URL` when that HTTPS URL is set. Unset, the route writes the server console only. No database is required, and no webhook secret is committed. The payer can copy or print a receipt with the same fields.
3. **Tip mode, for a host that opts in.** Not shown on this site. The panel must use this text, with the business name from config: "Tip / Thank-you payment. Optional, non-refundable payment made voluntarily in appreciation of services provided by [business name]. A tip is a payment for services, not a donation or charitable gift, not a purchase of any token, share or interest, and carries no right to profits, returns, governance or future services. No tax receipt is issued." `anonymousTipCapUsd` defaults to 1000. Above that cap, a name and email are required before sending and are passed to the logger.
4. **Sanctions-screen hook.** `screenAddress(address, chain)` runs before sending. The default is a no-op that allows. `SANCTIONS_API_URL` and `SANCTIONS_API_KEY` are the placeholder for a chain-analytics API. Both are unset, and no key is committed. A blocked result refuses the payment with "This payment cannot be completed." If the URL is set and the hook cannot be reached, the payment is refused the same way.
5. **No custody.** The site never takes custody of funds and never converts, swaps, or forwards them. Payments go wallet to wallet only.
6. **No client-project names.** Do not put a client project name in this folder's code, copy, or fixtures.

## Fit it to a Next.js app

The folder is the package. A host app supplies route handlers that call `readPayEnv`, `settlePayment`, `buildPaymentUri`, `screenerFromEnv`, and `createPaymentLogger`:

- `POST /api/payments/qr` builds the EIP-681 or Solana Pay code for display. Display does not require `PAYMENTS_ENABLED`, and it does require a real address and, for an invoice, an invoice number.
- `POST /api/payments/screen` is the send gate. It requires the master switch, a real address, the invoice number, and `screenAddress` on the receiving address and the payer address.
- `POST /api/payments/log` records a confirmed transfer through `PaymentLogger`.

`PayPanel` is the UI. Pass it a `PayPanelConfig` built on the server from `readPayEnv`. Pass only the profile and modes that host should expose. Do not import `crypto-pay.config.ts` from a client component if that file reads server environment variables.
