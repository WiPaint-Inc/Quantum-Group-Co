import { apiError } from "@/lib/http";
import { sitePaymentAllowed } from "@/lib/payment-policy";
import type { PaymentDraft } from "@/src/features/crypto-pay/types";

export function draftFrom(body: Record<string, unknown>): PaymentDraft {
  const field = (key: string) => (typeof body[key] === "string" ? (body[key] as string) : "");
  return {
    mode: field("mode"),
    profileId: field("profileId"),
    chain: field("chain"),
    token: field("token"),
    amountUsd: field("amountUsd"),
    invoiceNumber: field("invoiceNumber"),
    fromAddress: field("fromAddress"),
    payerName: field("payerName"),
    payerEmail: field("payerEmail"),
  };
}

export function rejectOffHost(draft: PaymentDraft): Response | null {
  if (sitePaymentAllowed(draft.mode, draft.profileId)) return null;
  return apiError("invalid_request", "This site accepts invoice payments on its own profile only.", 400);
}
