import { readPayEnv } from "@/src/features/crypto-pay/config";
import { ConsolePaymentLogger } from "@/src/features/crypto-pay/logger";
import { screenerFromEnv } from "@/src/features/crypto-pay/sanctions";
import type { PaymentLogStatus } from "@/src/features/crypto-pay/types";
import { settlePayment } from "@/src/features/crypto-pay/validate";
import { apiError, apiOk, isRecord, readJson } from "@/lib/http";

const logger = new ConsolePaymentLogger();

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!isRecord(body)) return apiError("invalid_request", "Send a JSON payment log.", 400);
  const status = body.status;
  if (status !== "submitted" && status !== "confirmed" && status !== "failed") {
    return apiError("invalid_request", "The payment status is not recognised.", 400);
  }
  const txHash = typeof body.txHash === "string" ? body.txHash.trim() : "";
  if ((status === "submitted" || status === "confirmed") && !/^[A-Za-z0-9]{32,128}$/.test(txHash)) {
    return apiError("invalid_request", "A transaction id is required.", 400);
  }
  const env = readPayEnv();
  const settled = settlePayment(
    {
      mode: typeof body.mode === "string" ? body.mode : "",
      chain: typeof body.chain === "string" ? body.chain : "",
      token: typeof body.token === "string" ? body.token : "",
      amountUsd: typeof body.amountUsd === "string" ? body.amountUsd : "",
      invoiceNumber: typeof body.invoiceNumber === "string" ? body.invoiceNumber : "",
      fromAddress: typeof body.fromAddress === "string" ? body.fromAddress : "",
    },
    env,
    typeof body.token === "string" && (body.token === "ETH" || body.token === "SOL")
      ? { token: body.token, usdPerToken: 1, source: "client-reported", at: new Date().toISOString() }
      : null,
  );
  if (!settled.ok) return apiError("invalid_request", settled.message, 400);
  if (settled.payment.token === "ETH" || settled.payment.token === "SOL") {
    const reported = typeof body.tokenAmount === "string" ? body.tokenAmount.trim() : "";
    if (!/^\d+(\.\d{1,8})?$/.test(reported) || Number(reported) <= 0) {
      return apiError("invalid_request", "The reported token amount is not valid.", 400);
    }
    settled.payment.tokenAmount = reported;
  } else if (typeof body.tokenAmount === "string" && body.tokenAmount !== settled.payment.tokenAmount) {
    return apiError("invalid_request", "The token amount does not match the invoice amount.", 400);
  }
  const decision = await screenerFromEnv(env.sanctionsWebhookUrl).screen({
    ...settled.payment,
    fromAddress: settled.payment.fromAddress,
  });
  const recordStatus: PaymentLogStatus = decision.allowed ? status : "blocked";
  await logger.log({
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    ...settled.payment,
    txHash: txHash || null,
    status: recordStatus,
    sanctions: decision.reason,
    chainVerified: false,
  });
  if (!decision.allowed) return apiError("invalid_request", decision.reason, 403);
  return apiOk({ logged: true, status: recordStatus }, 200, "no-store");
}
