import { apiOk } from "@/lib/http";
import { roboticsEnabled } from "@/lib/flags";

export function GET() {
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
      robotics: roboticsEnabled() ? "/api/services/robotics" : null,
    },
  });
}
