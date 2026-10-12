import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isWorkersPreviewHost } from "@/lib/preview-host";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";

const corsHeaders: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
  "access-control-allow-headers": "Content-Type, X-Quantum-Agent-Key",
  "access-control-max-age": "86400",
};

function withPreviewRobots(request: NextRequest, response: NextResponse) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const path = request.nextUrl.pathname;
  if (isWorkersPreviewHost(host) || path === "/concept/demo-villa" || path.startsWith("/concept/demo-villa/")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

function isGated(pathname: string) {
  return (
    pathname === "/client/portal" ||
    pathname.startsWith("/client/portal/") ||
    pathname.startsWith("/client/homes/")
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api") && request.method === "OPTIONS") {
    return withPreviewRobots(request, new NextResponse(null, { status: 204, headers: corsHeaders }));
  }

  if (isGated(pathname)) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!decodeSession(token)) {
      const url = request.nextUrl.clone();
      url.pathname = "/client/login";
      url.searchParams.set("next", pathname);
      return withPreviewRobots(request, NextResponse.redirect(url));
    }
  }

  const response = NextResponse.next();
  if (pathname.startsWith("/api")) {
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value);
    }
  }
  return withPreviewRobots(request, response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
