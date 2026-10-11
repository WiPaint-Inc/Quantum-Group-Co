import type { PaymentLogRecord, PaymentLogger } from "./types";

export class ConsolePaymentLogger implements PaymentLogger {
  async log(record: PaymentLogRecord): Promise<void> {
    console.info(JSON.stringify({ source: "quantum-crypto-pay", ...record }));
  }
}
