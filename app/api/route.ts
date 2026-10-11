import { apiOk } from "@/lib/http";

export function GET() {
  return apiOk({
    name: "Quantum Group Co. Agent API",
    openapi: "/api/openapi.json",
    llms: "/llms.txt",
    resources: {
      company: "/api/company",
      estates: "/api/estates",
      renders: "/api/renders",
      plans: "/api/plans",
      developments: "/api/developments",
      marketplace: "/api/marketplace/listings",
    },
    actions: {
      waitlist: "POST /api/marketplace/waitlist",
      mintStub: "POST /api/marketplace/mint",
      session: "/api/session",
      agentAuth: "POST /api/auth/agent",
    },
  });
}
