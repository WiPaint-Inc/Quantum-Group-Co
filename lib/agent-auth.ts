export const AGENT_KEY_HEADER = "x-quantum-agent-key";

export type AgentAuthResult =
  | { status: "ok" }
  | { status: "unconfigured" }
  | { status: "missing" }
  | { status: "invalid" };

function safeEqual(a: string, b: string): boolean {
  const length = Math.max(a.length, b.length);
  let mismatch = a.length === b.length ? 0 : 1;
  for (let index = 0; index < length; index += 1) {
    mismatch |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

/** Stub check against AGENT_API_KEY. No key is stored in the repository. */
export function checkAgentKey(request: Request): AgentAuthResult {
  const expected = process.env.AGENT_API_KEY?.trim() ?? "";
  const provided = request.headers.get(AGENT_KEY_HEADER)?.trim() ?? "";
  if (!expected) return { status: "unconfigured" };
  if (!provided) return { status: "missing" };
  if (!safeEqual(provided, expected)) return { status: "invalid" };
  return { status: "ok" };
}
