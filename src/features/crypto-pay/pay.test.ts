import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readPayEnv } from "./config";
import { copy } from "./copy";
import { buildPaymentUri } from "./uri";
import { estimateNativeAmount, isPlaceholderAddress, isValidAddress, parseInvoiceNumber, parseUsdAmount, settlePayment, sharedProfileAddresses, toBaseUnits } from "./validate";
import type { PayEnv } from "./types";

const ready: PayEnv = {
  payeeName: "Quantum Group Co",
  paymentsEnabled: true,
  reownProjectId: "",
  solanaRpcUrl: "https://api.mainnet-beta.solana.com",
  sanctionsWebhookUrl: "",
  presetAmountsUsd: [1000, 5000, 10000],
  fiat: { stripe: null, coinbase: null },
  profiles: {
    quantum: {
      base: "0x1111111111111111111111111111111111111111",
      ethereum: "0x2222222222222222222222222222222222222222",
      solana: "So11111111111111111111111111111111111111112",
    },
    tip: {
      base: "0x3333333333333333333333333333333333333333",
      ethereum: "0x4444444444444444444444444444444444444444",
      solana: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    },
  },
};

test("defaults stay off and placeholder", () => {
  const env = readPayEnv({} as NodeJS.ProcessEnv);
  assert.equal(env.paymentsEnabled, false);
  assert.equal(env.profiles.quantum.base, "0xYOUR_BASE_ADDRESS");
  assert.equal(isPlaceholderAddress(env.profiles.quantum.base), true);
  assert.equal(isValidAddress("base", env.profiles.quantum.base), false);
});

test("an invoice memo is optional and a shared profile is refused", () => {
  assert.equal(parseInvoiceNumber("A-104"), "A-104");
  assert.equal(parseInvoiceNumber("x"), null);
  assert.equal(parseUsdAmount("2500"), "2500.00");
  assert.equal(parseUsdAmount("$2500"), null);
  const open = settlePayment({ mode: "invoice", chain: "base", token: "USDC", amountUsd: "10", invoiceNumber: "" }, ready, null);
  assert.equal(open.ok, true);
  const memo = settlePayment({ mode: "invoice", chain: "base", token: "USDC", amountUsd: "10", invoiceNumber: "x" }, ready, null);
  assert.equal(memo.ok, false);
  const shared = structuredClone(ready);
  shared.profiles.tip.base = shared.profiles.quantum.base;
  assert.equal(sharedProfileAddresses(shared).length, 1);
  const refused = settlePayment({ mode: "invoice", chain: "base", token: "USDC", amountUsd: "10", invoiceNumber: "INV-9" }, shared, null);
  assert.equal(refused.ok, false);
});

test("stablecoins follow the invoice one for one", () => {
  const settled = settlePayment({ mode: "invoice", chain: "base", token: "USDC", amountUsd: "10.50", invoiceNumber: "INV-9" }, ready, null);
  assert.equal(settled.ok, true);
  if (!settled.ok) return;
  assert.equal(settled.payment.tokenAmount, "10.50");
  assert.equal(settled.payment.estimated, false);
  assert.equal(toBaseUnits(settled.payment.tokenAmount, 6), BigInt(10500000));
  const uri = buildPaymentUri(settled.payment);
  assert.match(uri, /ethereum:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913@8453\/transfer/);
  assert.match(uri, /uint256=10500000/);
});

test("native amounts are estimates and tips skip the invoice", () => {
  assert.equal(estimateNativeAmount("100.00", 200), "0.5");
  const settled = settlePayment({ mode: "tip", chain: "solana", token: "SOL", amountUsd: "100", invoiceNumber: "" }, ready, { token: "SOL", usdPerToken: 200, source: "test", at: "now" });
  assert.equal(settled.ok, true);
  if (!settled.ok) return;
  assert.equal(settled.payment.invoiceNumber, null);
  assert.equal(settled.payment.estimated, true);
  assert.match(buildPaymentUri(settled.payment), /^solana:/);
});

test("disabled payments and the wrong token are refused", () => {
  const disabled = settlePayment({ mode: "invoice", chain: "base", token: "USDC", amountUsd: "10", invoiceNumber: "INV-9" }, { ...ready, paymentsEnabled: false }, null);
  assert.equal(disabled.ok, false);
  if (disabled.ok) return;
  assert.match(disabled.message, /not yet enabled/);
  const wrong = settlePayment({ mode: "invoice", chain: "solana", token: "ETH", amountUsd: "10", invoiceNumber: "INV-9" }, ready, null);
  assert.equal(wrong.ok, false);
});

test("published copy and the placeholder register stay aligned", () => {
  const site = readFileSync("content/site.ts", "utf8");
  const register = readFileSync("PLACEHOLDERS.md", "utf8");
  const keys = [...site.matchAll(/key: "([^"]+)"/g)].map((match) => match[1]);
  assert.ok(keys.length >= 30);
  for (const key of keys) assert.match(register, new RegExp(`\\| ${key} \\|`));
  assert.doesNotMatch(site, /\$\s?\d/);
  assert.match(copy.disabled, /not yet enabled/);
  assert.match(copy.tip, /does not pay an invoice/);
  assert.match(copy.antigua, /Antigua and Barbuda/);
});
