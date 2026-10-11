import { notFound } from "next/navigation";
import { agentApiEnabled } from "@/lib/flags";
import { buildOpenApi } from "@/lib/openapi";

export function GET() {
  if (!agentApiEnabled()) notFound();
  return Response.json(buildOpenApi(), {
    headers: { "cache-control": "public, max-age=300" },
  });
}
