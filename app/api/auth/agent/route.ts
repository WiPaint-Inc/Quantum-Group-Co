import { checkAgentKey } from "@/lib/agent-auth";
import { apiError, apiOk } from "@/lib/http";

export function POST(request: Request) {
  const result = checkAgentKey(request);
  if (result.status === "unconfigured") {
    return apiError("unconfigured", "AGENT_API_KEY is not set on the server.", 503);
  }
  if (result.status !== "ok") {
    return apiError("unauthorized", "Missing or invalid agent key.", 401);
  }
  return apiOk(
    {
      authenticated: true,
      mode: "stub",
      principal: "agent",
      note: "Key matched the server environment. This is not a session token.",
    },
    200,
    "no-store",
  );
}
