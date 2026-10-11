import { absoluteUrl } from "@/lib/site";

export function buildLlmsTxt(): string {
  const link = (path: string, label: string, detail: string) =>
    `- [${label}](${absoluteUrl(path)}): ${detail}`;

  return `# Quantum Group Co

> One company for design, engineering, construction and finishing in Antigua and Barbuda. Agents are the primary readers of record.

Quantum Group Co publishes no commercial schedule for its houses. The partner portfolio names works, not clients. The marketplace does not mint. Payments, when enabled, are non-custodial and go wallet to wallet. Robotics is unpublished unless the server flag is on.

## Pages

${link("/", "Home", "Hero, four-stage sequence, services, and story.")}
${link("/services", "Services", "Six services, in order.")}
${link("/services/full-design-and-build", "Full Design and Build Services", "One team from sketch to handover.")}
${link("/services/rendering-design-engineering-plans", "Rendering, design, engineering and plans", "Visualisation and drawings.")}
${link("/services/construction", "Construction", "Villas and homes.")}
${link("/services/engineering", "Engineering", "Civil and structural input.")}
${link("/services/developments", "Developments", "Larger work, same team.")}
${link("/services/construction-materials-distribution", "Materials", "Precast and project materials.")}
${link("/finishing", "Finishing", "Bespoke surfaces.")}
${link("/how-we-work", "How we work", "Shared client folder for off-island owners.")}
${link("/portfolio", "Partner portfolio", "Named works. No client names.")}
${link("/about", "About", "One company. Heritage stays in this story.")}
${link("/marketplace", "Marketplace", "Unissued plans and renders.")}
${link("/pay", "Pay", "Deposit or invoice. Disabled unless PAYMENTS_ENABLED=true.")}
${link("/client", "Client", "Placeholder session and per-home slots.")}

## API

${link("/api/openapi.json", "OpenAPI", "Contract.")}
${link("/api/company", "Company", "Name, story, and how the work is run.")}
${link("/api/services", "Services", "The six services. Robotics is absent unless enabled.")}
${link("/api/portfolio", "Portfolio", "Partner works and public captions.")}
${link("/api/estates", "Estates", "Same portfolio, kept for the Phase 1 path.")}
${link("/api/team", "Team", "Confirmed cards only.")}
${link("/api/renders", "Renders", "Unissued render study and finish photographs.")}
${link("/api/plans", "Plans", "Unissued plan study.")}
${link("/api/marketplace/listings", "Listings", "Marketplace teasers.")}
${link("/api/auth/agent", "Agent auth", "Header X-Quantum-Agent-Key against AGENT_API_KEY.")}

## Payments

PAYMENTS_ENABLED defaults off. This site takes invoice payments on the quantum profile only, and the invoice number is required. A second profile keeps its own addresses and must not share one. USDC and USDT are credited one for one with the US dollar amount. ETH and SOL amounts are estimates. Address screening uses SANCTIONS_API_URL when set. The site never holds keys or funds and does not convert, swap, or forward them. Confirmed payments are logged to the server console, or to PAYMENT_LOG_WEBHOOK_URL when that URL is set. The log is not chain verification.
`;
}
