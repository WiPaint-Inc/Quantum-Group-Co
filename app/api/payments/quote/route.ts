import { quoteToken } from "@/src/features/crypto-pay/quotes";
import { apiError, apiOk } from "@/lib/http";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (token !== "ETH" && token !== "SOL") return apiError("invalid_request", "Quote ETH or SOL.", 400);
  const quote = await quoteToken(token);
  if (!quote) return apiError("unconfigured", "A live quote is unavailable.", 503);
  return apiOk(quote, 200, "no-store");
}
