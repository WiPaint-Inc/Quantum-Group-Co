import { readPayEnv } from "@/src/features/crypto-pay/config";
import { quoteToken } from "@/src/features/crypto-pay/quotes";
import { screenerFromEnv } from "@/src/features/crypto-pay/sanctions";
import { settlePayment } from "@/src/features/crypto-pay/validate";
import type { PaymentDraft, Quote } from "@/src/features/crypto-pay/types";
import { apiError, apiOk, isRecord, readJson } from "@/lib/http";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!isRecord(body)) return apiError("invalid_request", "Send a JSON payment.", 400);
  const draft = draftFrom(body);
  const env = readPayEnv();
  const quote = await quoteFor(draft.token);
  const settled = settlePayment(draft, env, quote);
  if (!settled.ok) return apiError(env.paymentsEnabled ? "invalid_request" : "unconfigured", settled.message, env.paymentsEnabled ? 400 : 403);
  const decision = await screenerFromEnv(env.sanctionsWebhookUrl).screen(settled.payment);
  if (!decision.allowed) return apiError("invalid_request", decision.reason, 403);
  return apiOk({ payment: settled.payment, sanctions: decision.reason }, 200, "no-store");
}

function draftFrom(body: Record<string, unknown>): PaymentDraft {
  return {
    mode: stringField(body.mode),
    chain: stringField(body.chain),
    token: stringField(body.token),
    amountUsd: stringField(body.amountUsd),
    invoiceNumber: stringField(body.invoiceNumber),
    fromAddress: stringField(body.fromAddress),
  };
}

function stringField(value: unknown): string {
  return typeof value === "string" ? value : "";
}

async function quoteFor(token: string): Promise<Quote | null> {
  if (token !== "ETH" && token !== "SOL") return null;
  return quoteToken(token);
}
