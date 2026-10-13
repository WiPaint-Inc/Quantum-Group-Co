import { notFound } from "next/navigation";
import { checkAgentKey } from "@/lib/agent-auth";
import { agentApiEnabled } from "@/lib/flags";
import { apiError, apiOk } from "@/lib/http";

export function GET() {
  if (!agentApiEnabled()) notFound();
  return new Response(null, { status: 405, headers: { allow: "POST" } });
}

export function POST(request: Request) {
  if (!agentApiEnabled()) notFound();
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
