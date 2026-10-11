import { getListing, type IssuanceStandard } from "@/content/site";
import { checkAgentKey } from "@/lib/agent-auth";
import { apiError, apiOk, isRecord, readJson } from "@/lib/http";

function isStandard(value: unknown): value is IssuanceStandard {
  return value === "nft" || value === "ordinal";
}

export async function POST(request: Request) {
  const agent = checkAgentKey(request);
  if (agent.status === "invalid" || (agent.status === "unconfigured" && request.headers.get("x-quantum-agent-key"))) {
    const message =
      agent.status === "unconfigured"
        ? "AGENT_API_KEY is not configured, so a provided key cannot be accepted."
        : "The agent key was rejected.";
    return apiError("unauthorized", message, 401);
  }

  const body = await readJson(request);
  if (!isRecord(body) || typeof body.listingId !== "string" || !isStandard(body.standard)) {
    return apiError("invalid_request", "Send listingId and standard: nft or ordinal.", 400);
  }

  const listing = getListing(body.listingId);
  if (!listing) return apiError("not_found", "No listing matches that id.", 404);
  if (!listing.standards.includes(body.standard)) {
    return apiError("invalid_request", "That listing does not contemplate this standard.", 400);
  }

  return apiOk(
    {
      status: "stub",
      minted: false,
      wallet: false,
      mainnet: false,
      listingId: listing.id,
      standard: body.standard,
      agentAuthenticated: agent.status === "ok",
      message: "Minting is not live. No wallet was opened and no public-network transaction was created.",
    },
    200,
    "no-store",
  );
}
