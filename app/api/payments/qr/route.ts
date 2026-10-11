import QRCode from "qrcode";
import { draftFrom, rejectOffHost } from "@/app/api/payments/draft";
import { apiError, apiOk, isRecord, readJson } from "@/lib/http";
import { copy } from "@/src/features/crypto-pay/copy";
import { readPayEnv } from "@/src/features/crypto-pay/config";
import { quoteToken } from "@/src/features/crypto-pay/quotes";
import { screenerFromEnv } from "@/src/features/crypto-pay/sanctions";
import type { Quote } from "@/src/features/crypto-pay/types";
import { buildPaymentUri } from "@/src/features/crypto-pay/uri";
import { settlePayment } from "@/src/features/crypto-pay/validate";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!isRecord(body)) return apiError("invalid_request", "Send a JSON payment.", 400);
  const draft = draftFrom(body);
  const foreign = rejectOffHost(draft);
  if (foreign) return foreign;
  const env = readPayEnv();
  const quote: Quote | null = draft.token === "ETH" || draft.token === "SOL" ? await quoteToken(draft.token) : null;
  const settled = settlePayment(draft, env, quote, "display");
  if (!settled.ok) return paymentError(settled.message);
  const decision = await screenerFromEnv(env.sanctionsApiUrl, env.sanctionsApiKey).screenAddress(settled.payment.toAddress, settled.payment.chain);
  if (!decision.allowed) return apiError("invalid_request", copy.blocked, 403);
  const uri = buildPaymentUri(settled.payment);
  const qr = await QRCode.toDataURL(uri, { margin: 1, width: 280, color: { dark: "#071014", light: "#f4efe6" } });
  return apiOk({ qr, uri, payment: settled.payment }, 200, "no-store");
}

function paymentError(message: string) {
  const blocked = message === copy.unconfigured || message === copy.shared;
  return apiError(blocked ? "unconfigured" : "invalid_request", message, blocked ? 403 : 400);
}
