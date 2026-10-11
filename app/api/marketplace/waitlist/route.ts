import { apiError, apiOk, isRecord, readJson } from "@/lib/http";
import { parseEmail } from "@/lib/validate";

const interests = new Set(["plans", "renders", "both"]);

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!isRecord(body)) return apiError("invalid_request", "Expected a JSON object.", 400);
  const email = parseEmail(body.email);
  const interest = body.interest;
  if (!email || typeof interest !== "string" || !interests.has(interest)) {
    return apiError("invalid_request", "Send email and interest: plans, renders, or both.", 400);
  }
  return apiOk(
    {
      status: "accepted",
      persisted: false,
      id: `wl_${crypto.randomUUID()}`,
      email,
      interest,
      note: "Waitlist stub. The address was not stored.",
    },
    202,
    "no-store",
  );
}
