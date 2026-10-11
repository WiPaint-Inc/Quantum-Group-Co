import { notFound } from "next/navigation";
import { roboticsEnabled, agentApiEnabled } from "@/lib/flags";
import { apiOk } from "@/lib/http";

export function GET() {
  if (!agentApiEnabled()) notFound();
  return apiOk({
    name: "Quantum Group Co Agent API",
    openapi: "/api/openapi.json",
    llms: "/llms.txt",
    resources: {
      company: "/api/company",
      services: "/api/services",
      portfolio: "/api/portfolio",
      estates: "/api/estates",
      renders: "/api/renders",
      plans: "/api/plans",
      developments: "/api/developments",
      marketplace: "/api/marketplace/listings",
      team: "/api/team",
      payments: "/api/payments",
      ...(roboticsEnabled() ? { robotics: "/api/services/robotics" } : {}),
    },
  });
}
