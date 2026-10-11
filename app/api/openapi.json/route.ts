import { buildOpenApi } from "@/lib/openapi";

export function GET() {
  return Response.json(buildOpenApi(), {
    headers: { "cache-control": "public, max-age=300" },
  });
}
