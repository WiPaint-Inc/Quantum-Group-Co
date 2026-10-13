import { connection } from "next/server";
import { readPayEnv } from "@/src/features/crypto-pay/config";
import { paymentStatus } from "@/src/features/crypto-pay/status";
import { apiOk } from "@/lib/http";

export async function GET() {
  await connection();
  return apiOk(paymentStatus(readPayEnv()), 200, "no-store");
}
