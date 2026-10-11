export const SESSION_COOKIE = "qg_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type StubSession = {
  email: string;
  mode: "stub";
  issuedAt: string;
};

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): string | null {
  try {
    const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
    const pad = (4 - (normalized.length % 4)) % 4;
    const binary = atob(normalized + "=".repeat(pad));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function encodeSession(session: StubSession): string {
  return toBase64Url(JSON.stringify(session));
}

export function decodeSession(token: string | undefined | null): StubSession | null {
  if (!token) return null;
  const json = fromBase64Url(token);
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as Partial<StubSession>;
    if (parsed.mode !== "stub") return null;
    if (typeof parsed.email !== "string" || !parsed.email.includes("@")) return null;
    if (typeof parsed.issuedAt !== "string" || parsed.issuedAt.length < 4) return null;
    return { email: parsed.email, mode: "stub", issuedAt: parsed.issuedAt };
  } catch {
    return null;
  }
}

export function publicSession(session: StubSession) {
  return {
    authenticated: true as const,
    mode: "stub" as const,
    email: session.email,
    issuedAt: session.issuedAt,
    note: "Placeholder session. Not an identity provider. The cookie is not signed.",
  };
}
