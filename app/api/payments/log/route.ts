import { draftFrom, rejectOffHost } from "@/app/api/payments/draft";
import { apiError, apiOk, isRecord, readJson } from "@/lib/http";
import { copy } from "@/src/features/crypto-pay/copy";
import { readPayEnv } from "@/src/features/crypto-pay/config";
import { createPaymentLogger } from "@/src/features/crypto-pay/logger";
import { screenPaymentAddresses, screenerFromEnv } from "@/src/features/crypto-pay/sanctions";
import type { PaymentLogRecord, PaymentLogStatus, PaymentReceipt } from "@/src/features/crypto-pay/types";
import { settlePayment } from "@/src/features/crypto-pay/validate";

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
  const draft = draftFrom(body);
  const foreign = rejectOffHost(draft);
  if (foreign) return foreign;
  const env = readPayEnv();
  const settled = settlePayment(
    draft,
    env,
    typeof body.token === "string" && (body.token === "ETH" || body.token === "SOL")
      ? { token: body.token, usdPerToken: 1, source: "client-reported", at: new Date().toISOString() }
      : null,
    "send",
  );
  if (!settled.ok) return paymentError(settled.message);
  if (settled.payment.token === "ETH" || settled.payment.token === "SOL") {
    const reported = typeof body.tokenAmount === "string" ? body.tokenAmount.trim() : "";
    if (!/^\d+(\.\d{1,8})?$/.test(reported) || Number(reported) <= 0) {
      return apiError("invalid_request", "The reported token amount is not valid.", 400);
    }
    settled.payment.tokenAmount = reported;
  } else if (typeof body.tokenAmount === "string" && body.tokenAmount !== settled.payment.tokenAmount) {
    return apiError("invalid_request", "The token amount does not match the invoice amount.", 400);
  }
  const decision = await screenPaymentAddresses(
    screenerFromEnv(env.sanctionsApiUrl, env.sanctionsApiKey),
    settled.payment.chain,
    settled.payment.toAddress,
    settled.payment.fromAddress,
  );
  const recordStatus: PaymentLogStatus = decision.allowed ? status : "blocked";
  const at = new Date().toISOString();
  const receipt: PaymentReceipt = {
    txHash,
    chain: settled.payment.chain,
    token: settled.payment.token,
    payerAddress: settled.payment.fromAddress ?? "",
    amountUsd: settled.payment.amountUsd,
    invoiceNumber: settled.payment.invoiceNumber,
    at,
  };
  const record: PaymentLogRecord = {
    ...receipt,
    id: crypto.randomUUID(),
    mode: settled.payment.mode,
    profileId: settled.payment.profileId,
    tokenAmount: settled.payment.tokenAmount,
    toAddress: settled.payment.toAddress,
    payerName: settled.payment.payerName,
    payerEmail: settled.payment.payerEmail,
    status: recordStatus,
  };
  await createPaymentLogger(env.paymentLogWebhookUrl).log(record);
  if (!decision.allowed) return apiError("invalid_request", copy.blocked, 403);
  return apiOk({ logged: true, status: recordStatus, receipt }, 200, "no-store");
}

function paymentError(message: string) {
  const blocked = message === copy.disabled || message === copy.unconfigured || message === copy.shared;
  return apiError(blocked ? "unconfigured" : "invalid_request", message, blocked ? 403 : 400);
}
