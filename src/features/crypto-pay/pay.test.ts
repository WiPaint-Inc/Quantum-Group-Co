import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { readPayEnv } from "./config";
import { copy, tipDisclaimer } from "./copy";
import { createPaymentLogger } from "./logger";
import { passthroughScreener, screenerFromEnv } from "./sanctions";
import { paymentStatus } from "./status";
import { buildPaymentUri } from "./uri";
import { estimateNativeAmount, isPlaceholderAddress, isValidAddress, parseInvoiceNumber, parseUsdAmount, settlePayment, sharedProfileAddresses, tipNeedsContact, toBaseUnits } from "./validate";
import { sitePaymentAllowed } from "../../../lib/payment-policy";
import type { PayEnv, PaymentLogRecord } from "./types";

function asEnv(values: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  return values as unknown as NodeJS.ProcessEnv;
}

const payer = "0x5555555555555555555555555555555555555555";
const solPayer = "SysvarRent111111111111111111111111111111111";

const ready: PayEnv = {
  paymentsEnabled: true,
  reownProjectId: "",
  solanaRpcUrl: "https://api.mainnet-beta.solana.com",
  sanctionsApiUrl: "",
  sanctionsApiKey: "",
  paymentLogWebhookUrl: "",
  anonymousTipCapUsd: 1000,
  presetAmountsUsd: [1000, 5000, 10000],
  fiat: { stripe: null, coinbase: null },
  profiles: {
    quantum: {
      businessName: "Quantum Group Co",
      addresses: {
        base: "0x1111111111111111111111111111111111111111",
        ethereum: "0x2222222222222222222222222222222222222222",
        solana: "So11111111111111111111111111111111111111112",
      },
    },
    botSite: {
      businessName: "Bot Site",
      addresses: {
        base: "0x3333333333333333333333333333333333333333",
        ethereum: "0x4444444444444444444444444444444444444444",
        solana: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
      },
    },
  },
};

const invoice = {
  mode: "invoice",
  profileId: "quantum",
  chain: "base",
  token: "USDC",
  amountUsd: "10.50",
  invoiceNumber: "INV-9",
  fromAddress: payer,
};

test("defaults stay off, profiles stay separate, and placeholders are not payable", () => {
  const env = readPayEnv(asEnv());
  assert.equal(env.paymentsEnabled, false);
  assert.equal(env.anonymousTipCapUsd, 1000);
  assert.equal(env.paymentLogWebhookUrl, "");
  assert.equal(env.sanctionsApiUrl, "");
  assert.equal(env.sanctionsApiKey, "");
  assert.equal(env.profiles.quantum.addresses.base, "0xYOUR_BASE_ADDRESS");
  assert.equal(env.profiles.botSite.addresses.base, "0xYOUR_BOT_BASE_ADDRESS");
  assert.notEqual(env.profiles.quantum.addresses.base, env.profiles.botSite.addresses.base);
  assert.equal(isPlaceholderAddress(env.profiles.quantum.addresses.base), true);
  assert.equal(isValidAddress("base", env.profiles.quantum.addresses.base), false);
  assert.equal(readPayEnv(asEnv({ PAYMENTS_ENABLED: "false" })).paymentsEnabled, false);
  assert.equal(readPayEnv(asEnv({ PAYMENTS_ENABLED: "true" })).paymentsEnabled, true);
  assert.equal(readPayEnv(asEnv({ ANONYMOUS_TIP_CAP_USD: "2500" })).anonymousTipCapUsd, 2500);

  const isolated = readPayEnv(asEnv({
    PAY_BASE_ADDRESS: "0x2222222222222222222222222222222222222222",
    PAY_TIP_BASE_ADDRESS: "0x1111111111111111111111111111111111111111",
  }));
  assert.equal(isolated.profiles.quantum.addresses.base, "0x2222222222222222222222222222222222222222");
  assert.equal(isolated.profiles.botSite.addresses.base, "0xYOUR_BOT_BASE_ADDRESS");
  assert.equal(paymentStatus(env).enabled, false);
  assert.equal(paymentStatus(env).sanctions, "passthrough");
  assert.equal(paymentStatus(env).paymentLog, "console");
  assert.equal(paymentStatus(env).forwarding, "none");
});

test("an invoice number is required and a shared address fails", () => {
  assert.equal(parseInvoiceNumber("A-104"), "A-104");
  assert.equal(parseInvoiceNumber("x"), null);
  assert.equal(parseUsdAmount("2500"), "2500.00");
  assert.equal(parseUsdAmount("$2500"), null);
  const open = settlePayment({ ...invoice, invoiceNumber: "", amountUsd: "10" }, ready, null, "send");
  assert.equal(open.ok, false);
  if (open.ok) return;
  assert.equal(open.message, copy.invoiceRequired);
  const shared = structuredClone(ready);
  shared.profiles.botSite.addresses.base = shared.profiles.quantum.addresses.base;
  assert.equal(sharedProfileAddresses(shared).length, 1);
  const refused = settlePayment(invoice, shared, null, "send");
  assert.equal(refused.ok, false);
  if (refused.ok) return;
  assert.equal(refused.message, copy.shared);
});

test("stablecoins follow the invoice one for one", () => {
  const settled = settlePayment(invoice, ready, null, "send");
  assert.equal(settled.ok, true);
  if (!settled.ok) return;
  assert.equal(settled.payment.tokenAmount, "10.50");
  assert.equal(settled.payment.estimated, false);
  assert.equal(settled.payment.invoiceNumber, "INV-9");
  assert.equal(settled.payment.toAddress, ready.profiles.quantum.addresses.base);
  assert.equal(toBaseUnits(settled.payment.tokenAmount, 6), BigInt(10500000));
  const uri = buildPaymentUri(settled.payment);
  assert.match(uri, /ethereum:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913@8453\/transfer/);
  assert.match(uri, /uint256=10500000/);
});

test("native amounts are estimates and a tip uses only its own profile", () => {
  assert.equal(estimateNativeAmount("100.00", 200), "0.5");
  const quote = { token: "SOL" as const, usdPerToken: 200, source: "test", at: "now" };
  const settled = settlePayment(
    { mode: "tip", profileId: "botSite", chain: "solana", token: "SOL", amountUsd: "100", invoiceNumber: "", fromAddress: solPayer },
    ready,
    quote,
    "send",
  );
  assert.equal(settled.ok, true);
  if (!settled.ok) return;
  assert.equal(settled.payment.invoiceNumber, null);
  assert.equal(settled.payment.estimated, true);
  assert.equal(settled.payment.toAddress, ready.profiles.botSite.addresses.solana);
  assert.notEqual(settled.payment.toAddress, ready.profiles.quantum.addresses.solana);
  assert.equal(settled.payment.payerName, null);
  assert.match(buildPaymentUri(settled.payment), /^solana:/);
  const missingProfile = settlePayment({ ...invoice, profileId: "" }, ready, null, "send");
  assert.equal(missingProfile.ok, false);
});

test("sending needs the master switch and a real address, and display does not need the switch", () => {
  const disabled = settlePayment(invoice, { ...ready, paymentsEnabled: false }, null, "send");
  assert.equal(disabled.ok, false);
  if (disabled.ok) return;
  assert.equal(disabled.message, "Payments not yet enabled");
  const shown = settlePayment(invoice, { ...ready, paymentsEnabled: false }, null, "display");
  assert.equal(shown.ok, true);
  const placeholders = settlePayment(invoice, readPayEnv(asEnv({ PAYMENTS_ENABLED: "true" })), null, "send");
  assert.equal(placeholders.ok, false);
  if (placeholders.ok) return;
  assert.equal(placeholders.message, "Payments not configured");
  const wrong = settlePayment({ ...invoice, chain: "solana", token: "ETH" }, ready, null, "send");
  assert.equal(wrong.ok, false);
});

test("a tip above the cap needs a name and email, and this site stays on invoice", () => {
  assert.equal(tipNeedsContact("1000.00", 1000), false);
  assert.equal(tipNeedsContact("1000.01", 1000), true);
  const quote = { token: "SOL" as const, usdPerToken: 200, source: "test", at: "now" };
  const over = settlePayment(
    { mode: "tip", profileId: "botSite", chain: "solana", token: "SOL", amountUsd: "1000.01", invoiceNumber: "", fromAddress: solPayer },
    ready,
    quote,
    "send",
  );
  assert.equal(over.ok, false);
  if (over.ok) return;
  assert.equal(over.message, copy.contactRequired);
  const named = settlePayment(
    {
      mode: "tip",
      profileId: "botSite",
      chain: "solana",
      token: "SOL",
      amountUsd: "1500",
      invoiceNumber: "",
      fromAddress: solPayer,
      payerName: "Ada Lovelace",
      payerEmail: "ada@example.com",
    },
    ready,
    quote,
    "send",
  );
  assert.equal(named.ok, true);
  if (!named.ok) return;
  assert.equal(named.payment.payerName, "Ada Lovelace");
  assert.equal(named.payment.payerEmail, "ada@example.com");
  assert.equal(sitePaymentAllowed("invoice", "quantum"), true);
  assert.equal(sitePaymentAllowed("tip", "botSite"), false);
  assert.equal(sitePaymentAllowed("invoice", "botSite"), false);
});

test("the default screener allows, a blocked hook refuses, and the logger can post", async () => {
  const allowed = await passthroughScreener.screenAddress(payer, "base");
  assert.deepEqual(allowed, { allowed: true });
  assert.equal((await screenerFromEnv("").screenAddress(payer, "base")).allowed, true);
  let header = "";
  const blocked = screenerFromEnv("https://analytics.example/screen", "test-key", async (_input, init) => {
    header = new Headers(init?.headers).get("authorization") ?? "";
    return new Response(JSON.stringify({ blocked: true }), { status: 200 });
  });
  const decision = await blocked.screenAddress(payer, "ethereum");
  assert.equal(decision.allowed, false);
  assert.equal(header, "Bearer test-key");
  assert.equal(JSON.stringify(decision).includes("test-key"), false);
  const closed = await screenerFromEnv("https://analytics.example/screen", "", async () => {
    throw new Error("down");
  }).screenAddress(payer, "base");
  assert.equal(closed.allowed, false);

  let posted = "";
  const record: PaymentLogRecord = {
    id: "log-1",
    txHash: "a".repeat(64),
    chain: "base",
    token: "USDC",
    payerAddress: payer,
    amountUsd: "10.50",
    invoiceNumber: "INV-9",
    at: "2026-10-11T00:00:00.000Z",
    mode: "invoice",
    profileId: "quantum",
    tokenAmount: "10.50",
    toAddress: ready.profiles.quantum.addresses.base,
    payerName: null,
    payerEmail: null,
    status: "confirmed",
  };
  let calls = 0;
  await createPaymentLogger("", async () => {
    calls += 1;
    return new Response(null, { status: 204 });
  }).log(record);
  assert.equal(calls, 0);
  await createPaymentLogger("https://logs.example/hook", async (_input, init) => {
    posted = String(init?.body ?? "");
    return new Response(null, { status: 204 });
  }).log(record);
  assert.match(posted, /INV-9/);
  assert.match(posted, new RegExp(payer));
});

test("published copy keeps the mandated sentences and avoids the banned phrases", () => {
  const site = readFileSync("content/site.ts", "utf8");
  const register = readFileSync("PLACEHOLDERS.md", "utf8");
  const keys = [...site.matchAll(/key: "([^"]+)"/g)].map((match) => match[1]);
  assert.ok(keys.length >= 30);
  for (const key of keys) assert.match(register, new RegExp(`\\| ${key} \\|`));
  assert.doesNotMatch(site, /\$\s?\d/);
  assert.equal(copy.disabled, "Payments not yet enabled");
  assert.equal(copy.unconfigured, "Payments not configured");
  assert.equal(
    copy.completion,
    "Payment is complete only when the full USD amount, net of network fees, is confirmed on-chain. Wrong-chain or wrong-address payments are at the payer's risk.",
  );
  assert.equal(copy.blocked, "This payment cannot be completed.");
  const held = ["ret", "urns"].join("");
  assert.equal(
    tipDisclaimer("Bot Site"),
    `Tip / Thank-you payment. Optional, non-refundable payment made voluntarily in appreciation of services provided by Bot Site. A tip is a payment for services, not a donation or charitable gift, not a purchase of any token, share or interest, and carries no right to profits, ${held}, governance or future services. No tax receipt is issued.`,
  );
  const page = readFileSync("app/pay/page.tsx", "utf8");
  assert.match(page, /modes: \["invoice"\]/);
  assert.doesNotMatch(page, /modes: \["invoice", "tip"\]/);
  const banned = [
    ["support", "the", "project"].join(" "),
    ["back", "us"].join(" "),
    ["early", "supporter"].join(" "),
    ["rew", "ards"].join(""),
    held,
    ["comm", "unity"].join(""),
  ];
  const disclaimer = new RegExp(
    String.raw`Tip / Thank-you payment\. Optional, non-refundable payment made voluntarily in appreciation of services provided by .+?\. A tip is a payment for services, not a donation or charitable gift, not a purchase of any token, share or interest, and carries no right to profits, ${held}, governance or future services\. No tax receipt is issued\.`,
    "g",
  );
  const stripped = readTree(join(process.cwd(), "src/features/crypto-pay")).replace(disclaimer, "");
  for (const phrase of banned) {
    assert.equal(new RegExp(`\\b${phrase}\\b`, "i").test(stripped), false, phrase);
  }
});

function readTree(dir: string): string {
  let text = "";
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) text += readTree(path);
    else if (/\.(ts|tsx|md)$/.test(entry.name)) text += `\n${readFileSync(path, "utf8")}`;
  }
  return text;
}
