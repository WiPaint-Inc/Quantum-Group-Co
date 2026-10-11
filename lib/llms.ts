import { absoluteUrl } from "@/lib/site";

export function buildLlmsTxt(): string {
  const link = (path: string, label: string, detail: string) =>
    `- [${label}](${absoluteUrl(path)}): ${detail}`;

  return `# Quantum Group Co.

> Ultra-luxury residential construction and development in Antigua and Barbuda. Agents are the primary readers of record. The human site is a cinematic view of the same facts.

Quantum Group Co. builds high-end houses and publishes no commercial terms. Estates, developments, renders, and plans in Phase 1 are placeholders in content/site.ts. They are not client projects. The marketplace is a teaser for a later issuance of plans and renders as NFTs or Bitcoin Ordinals. Minting is not live. There is no wallet and no mainnet.

## Pages

${link("/", "Home", "Archipelago (ocean) and Meridian (space) experience, with a still edition for small screens and reduced motion.")}
${link("/estates", "Signature estates", "Placeholder houses.")}
${link("/about", "About", "Practice, market, and finishes.")}
${link("/developments", "Developments", "Placeholder development studies.")}
${link("/marketplace", "Marketplace", "Unissued plans and renders, waitlist, mint stub.")}
${link("/client", "Client", "Private atelier shell and per-home app extension point.")}

## API

${link("/api/openapi.json", "OpenAPI", "Machine-readable contract for every route below.")}
${link("/api", "Index", "Discovery document.")}
${link("/api/company", "Company", "Facts a human can read on the site.")}
${link("/api/estates", "Estates", "Placeholder signature estates.")}
${link("/api/renders", "Renders", "Render studies. Filter with ?estate={slug}.")}
${link("/api/plans", "Plans", "Plan studies. Filter with ?estate={slug}.")}
${link("/api/developments", "Developments", "Placeholder developments.")}
${link("/api/marketplace/listings", "Listings", "Marketplace teasers. Filter with ?kind=plan or ?kind=render.")}

Detail routes: /api/estates/{slug}, /api/renders/{id}, /api/plans/{id}, /api/developments/{slug}, /api/marketplace/listings/{id}.

## Actions

${link("/api/marketplace/waitlist", "Waitlist", "POST { email, interest: plans | renders | both }. Accepted and not persisted.")}
${link("/api/marketplace/mint", "Mint stub", "POST { listingId, standard: nft | ordinal }. Always returns minted: false.")}
${link("/api/session", "Human session", "POST { email } sets an unsigned stub cookie. GET reads it. DELETE clears it. Not an identity provider.")}
${link("/api/auth/agent", "Agent auth", "POST with header X-Quantum-Agent-Key. Checked against the server env AGENT_API_KEY. No key is published. 503 if unset, 401 if wrong, 200 if it matches.")}

## Auth model

- Catalog reads are public so an agent can learn the site without a secret.
- Human entry is a placeholder cookie named qg_session. It is not signed.
- Agent entry is the header X-Quantum-Agent-Key. If the header is sent to the mint stub and does not match, the call is rejected. If the header is omitted, the mint stub still returns a non-minting receipt.
- Gated human pages: /client/portal and /client/homes/{slug}.

## Structured data

HTML pages include JSON-LD for Organization, RealEstateListing, and Place. There is no price field.

## Optional

Phase 2, not implemented: a real identity provider, wallets, NFT or Ordinal minting, per-home applications, and a final domain.
`;
}
