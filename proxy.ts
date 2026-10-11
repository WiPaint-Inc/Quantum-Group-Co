import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";

const corsHeaders: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
  "access-control-allow-headers": "Content-Type, X-Quantum-Agent-Key",
  "access-control-max-age": "86400",
};

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
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  if (isGated(pathname)) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!decodeSession(token)) {
      const url = request.nextUrl.clone();
      url.pathname = "/client/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();
  if (pathname.startsWith("/api")) {
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value);
    }
  }
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/client/portal", "/client/portal/:path*", "/client/homes/:path*"],
};
