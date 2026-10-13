import type { PaymentLogRecord, PaymentLogger } from "./types";

/**
 * Default logger. Always writes the server console.
 * When PAYMENT_LOG_WEBHOOK_URL is an HTTPS URL, also POSTs the record there.
 * An unset URL keeps the console only. No database and no committed secret.
 */
export function createPaymentLogger(webhookUrl: string, fetchImpl: typeof fetch = fetch): PaymentLogger {
  return {
    async log(record: PaymentLogRecord): Promise<void> {
      console.info(JSON.stringify({ source: "crypto-pay", ...record }));
      const trimmed = webhookUrl.trim();
      if (!trimmed) return;
      let endpoint: URL;
      try {
        endpoint = new URL(trimmed);
      } catch {
        console.error("Payment log webhook URL is not valid.");
        return;
      }
      if (endpoint.protocol !== "https:") {
        console.error("Payment log webhook must use HTTPS.");
        return;
      }
      try {
        const response = await fetchImpl(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(record),
          signal: AbortSignal.timeout(4000),
          redirect: "error",
        });
        if (!response.ok) console.error("Payment log webhook did not accept the record.");
      } catch {
        console.error("Payment log webhook could not be reached.");
      }
    },
  };
}
