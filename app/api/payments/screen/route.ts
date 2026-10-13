import { draftFrom, rejectOffHost } from "@/app/api/payments/draft";
import { apiError, apiOk, isRecord, readJson } from "@/lib/http";
import { copy } from "@/src/features/crypto-pay/copy";
import { readPayEnv } from "@/src/features/crypto-pay/config";
import { quoteToken } from "@/src/features/crypto-pay/quotes";
import { screenPaymentAddresses, screenerFromEnv } from "@/src/features/crypto-pay/sanctions";
import type { Quote } from "@/src/features/crypto-pay/types";
import { settlePayment } from "@/src/features/crypto-pay/validate";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!isRecord(body)) return apiError("invalid_request", "Send a JSON payment.", 400);
  const draft = draftFrom(body);
  const foreign = rejectOffHost(draft);
  if (foreign) return foreign;
  const env = readPayEnv();
  const quote = await quoteFor(draft.token);
  const settled = settlePayment(draft, env, quote, "send");
  if (!settled.ok) return paymentError(settled.message);
  const decision = await screenPaymentAddresses(
    screenerFromEnv(env.sanctionsApiUrl, env.sanctionsApiKey),
    settled.payment.chain,
    settled.payment.toAddress,
    settled.payment.fromAddress,
  );
  if (!decision.allowed) return apiError("invalid_request", copy.blocked, 403);
  return apiOk({ payment: settled.payment }, 200, "no-store");
}

function paymentError(message: string) {
  const blocked = message === copy.disabled || message === copy.unconfigured || message === copy.shared;
  return apiError(blocked ? "unconfigured" : "invalid_request", message, blocked ? 403 : 400);
}

async function quoteFor(token: string): Promise<Quote | null> {
  if (token !== "ETH" && token !== "SOL") return null;
  return quoteToken(token);
}
