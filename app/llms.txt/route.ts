import { notFound } from "next/navigation";
import { buildLlmsTxt } from "@/lib/llms";
import { agentApiEnabled } from "@/lib/flags";

export function GET() {
  if (!agentApiEnabled()) notFound();
  return new Response(buildLlmsTxt(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
