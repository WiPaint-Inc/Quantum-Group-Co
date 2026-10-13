import { NextResponse } from "next/server";
import { apiError, isRecord, readJson } from "@/lib/http";
import {
  decodeSession,
  encodeSession,
  publicSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  type StubSession,
} from "@/lib/session";
import { parseEmail } from "@/lib/validate";

function sessionResponse(data: unknown, status = 200) {
  return NextResponse.json(
    { ok: true, placeholder: true, data },
    { status, headers: { "cache-control": "no-store" } },
  );
}

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const pair = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  const token = pair ? decodeURIComponent(pair.slice(SESSION_COOKIE.length + 1)) : null;
  const session = decodeSession(token);
  if (!session) return apiError("unauthorized", "No placeholder session.", 401);
  return sessionResponse(publicSession(session));
}

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!isRecord(body)) return apiError("invalid_request", "Expected a JSON object.", 400);
  const email = parseEmail(body.email);
  if (!email) return apiError("invalid_request", "Send a valid email.", 400);

  const session: StubSession = {
    email,
    mode: "stub",
    issuedAt: new Date().toISOString(),
  };
  const response = sessionResponse(publicSession(session));
  response.cookies.set({
    name: SESSION_COOKIE,
    value: encodeSession(session),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}

export function DELETE() {
  const response = sessionResponse({ authenticated: false, mode: "stub" });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
