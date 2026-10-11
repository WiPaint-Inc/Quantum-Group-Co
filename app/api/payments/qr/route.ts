import QRCode from "qrcode";
import { readPayEnv } from "@/src/features/crypto-pay/config";
import { quoteToken } from "@/src/features/crypto-pay/quotes";
import { screenerFromEnv } from "@/src/features/crypto-pay/sanctions";
import type { PaymentDraft, Quote } from "@/src/features/crypto-pay/types";
import { buildPaymentUri } from "@/src/features/crypto-pay/uri";
import { settlePayment } from "@/src/features/crypto-pay/validate";
import { apiError, apiOk, isRecord, readJson } from "@/lib/http";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!isRecord(body)) return apiError("invalid_request", "Send a JSON payment.", 400);
  const draft: PaymentDraft = {
    mode: typeof body.mode === "string" ? body.mode : "",
    chain: typeof body.chain === "string" ? body.chain : "",
    token: typeof body.token === "string" ? body.token : "",
    amountUsd: typeof body.amountUsd === "string" ? body.amountUsd : "",
    invoiceNumber: typeof body.invoiceNumber === "string" ? body.invoiceNumber : "",
  };
  const env = readPayEnv();
  const quote: Quote | null = draft.token === "ETH" || draft.token === "SOL" ? await quoteToken(draft.token) : null;
  const settled = settlePayment(draft, env, quote);
  if (!settled.ok) return apiError(env.paymentsEnabled ? "invalid_request" : "unconfigured", settled.message, env.paymentsEnabled ? 400 : 403);
  const decision = await screenerFromEnv(env.sanctionsWebhookUrl).screen(settled.payment);
  if (!decision.allowed) return apiError("invalid_request", decision.reason, 403);
  const uri = buildPaymentUri(settled.payment);
  const qr = await QRCode.toDataURL(uri, { margin: 1, width: 280, color: { dark: "#071014", light: "#f4efe6" } });
  return apiOk({ qr, uri, payment: settled.payment }, 200, "no-store");
}
