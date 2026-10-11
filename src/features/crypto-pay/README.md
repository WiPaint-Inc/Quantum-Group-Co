# Crypto pay

A portable, non-custodial panel for deposits and invoices. Copy this folder into another site and edit `crypto-pay.config.ts`. The module does not import the rest of the Quantum Group Co site.

Funds move from the payer's wallet to the public receiving addresses in that config. This code never generates, stores, or asks for a private key or a seed phrase. It does not hold, swap, or convert funds.

## Configure

1. Replace `0xYOUR_BASE_ADDRESS`, `0xYOUR_ETHEREUM_ADDRESS`, and `YOUR_SOLANA_ADDRESS` in `crypto-pay.config.ts`, or set `PAY_BASE_ADDRESS`, `PAY_ETHEREUM_ADDRESS`, and `PAY_SOLANA_ADDRESS`.
2. Give the optional tip profile its own addresses. A shared address blocks sending.
3. Set `PAYMENTS_ENABLED=true` only after the addresses are real.
4. Set `NEXT_PUBLIC_REOWN_PROJECT_ID` to a Reown project id when you want MetaMask, Coinbase Wallet, and Phantom through AppKit. Leave it empty and the panel offers a QR code and a copyable address only.
5. USDC and USDT follow the dollar amount one for one. ETH and SOL amounts are estimates from a public quote.

Chains are Base, Ethereum, and Solana. Token contracts live in `tokens.ts`, with the source for each address. Base USDT is the Base bridge of Ethereum USDT. Tether's own supported-protocols list does not include Base.

An invoice number or memo is optional. The panel does not collect a name, an email, or any other identity document.

## Card checkout

`PAY_FIAT_ENABLED` defaults off. When it is `true`, the panel can show two hosted links and nothing else:

- `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` must be an `https://buy.stripe.com/...` Payment Link. Create it in the Stripe Dashboard. Do not put a secret key in the repo. Stripe hosts the card form.
- `NEXT_PUBLIC_COINBASE_COMMERCE_URL` must be an `https://commerce.coinbase.com/...` hosted checkout. Create it in Coinbase Commerce. Do not put a Commerce API key in the repo.

Any other host is ignored. The links are public URLs, not credentials.

## Compliance

This module is for receiving payment for the company's own services. It does not hold, exchange, or transmit funds for other people. Have counsel review it under Antigua and Barbuda's Digital Assets Business Act before you turn payments on.

## Fit it to a Next.js app

The folder is the package. A host app supplies three route handlers that call `readPayEnv`, `settlePayment`, `buildPaymentUri`, and `ConsolePaymentLogger`:

- `POST /api/payments/screen` checks the amount, the optional memo, and the sanctions hook.
- `POST /api/payments/qr` returns the EIP-681 or Solana Pay code.
- `POST /api/payments/log` records a client-reported transfer. It does not verify the chain, and it stores no payer personal data.

`PayPanel` is the UI. Pass it a `PayPanelConfig` built on the server from `readPayEnv`. Do not import `crypto-pay.config.ts` from a client component if that file reads server environment variables.
