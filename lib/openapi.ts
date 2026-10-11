import { absoluteUrl } from "@/lib/site";

export function buildOpenApi() {
  return {
    openapi: "3.1.0",
    info: {
      title: "Quantum Group Co Agent API",
      version: "0.1.0",
      description:
        "Phase 1 contract. Public facts match the site and content/site.ts. Estates are placeholders. Commercial terms are omitted. Minting is a stub: no wallet and no mainnet.",
    },
    servers: [{ url: absoluteUrl("") }],
    tags: [
      { name: "Discovery" },
      { name: "Company" },
      { name: "Estates" },
      { name: "Renders" },
      { name: "Plans" },
      { name: "Developments" },
      { name: "Marketplace" },
      { name: "Session" },
      { name: "Agent" },
      { name: "Payments" },
    ],
    components: {
      securitySchemes: {
        agentKey: {
          type: "apiKey",
          in: "header",
          name: "X-Quantum-Agent-Key",
          description:
            "Compared with the server environment variable AGENT_API_KEY. No key is published.",
        },
      },
      schemas: {
        Error: {
          type: "object",
          required: ["ok", "error"],
          properties: {
            ok: { const: false },
            error: {
              type: "object",
              required: ["code", "message"],
              properties: {
                code: {
                  type: "string",
                  enum: ["not_found", "unauthorized", "unconfigured", "invalid_request"],
                },
                message: { type: "string" },
              },
            },
          },
        },
        Estate: { $ref: "#/components/schemas/PlaceholderRecord" },
        PlaceholderRecord: {
          type: "object",
          description: "A public record from content/site.ts. placeholder is always true in Phase 1.",
          properties: {
            placeholder: { const: true },
            status: { type: "string" },
          },
          additionalProperties: true,
        },
      },
    },
    paths: {
      "/api": {
        get: {
          tags: ["Discovery"],
          summary: "List agent resources",
          operationId: "getApiIndex",
          responses: { "200": { description: "Resource index" } },
        },
      },
      "/api/openapi.json": {
        get: {
          tags: ["Discovery"],
          summary: "This document",
          operationId: "getOpenApi",
          responses: { "200": { description: "OpenAPI 3.1 document" } },
        },
      },
      "/api/services": {
        get: {
          tags: ["Company"],
          summary: "The six published services",
          operationId: "listServices",
          responses: { "200": { description: "Full Design and Build Services, Full Rendering, Design, Engineering & Plans, Construction, Engineering, Developments, and Construction Materials Distribution." } },
        },
      },
      "/api/services/{slug}": {
        get: {
          tags: ["Company"],
          summary: "One service",
          operationId: "getService",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Service" }, "404": { description: "Unknown or unpublished" } },
        },
      },
      "/api/portfolio": {
        get: {
          tags: ["Estates"],
          summary: "Partner portfolio",
          operationId: "listPortfolio",
          responses: { "200": { description: "Projects without client names" } },
        },
      },
      "/api/team": {
        get: {
          tags: ["Company"],
          summary: "Confirmed team cards",
          operationId: "listTeam",
          responses: { "200": { description: "Confirmed members only" } },
        },
      },
      "/api/company": {
        get: {
          tags: ["Company"],
          summary: "Company facts, practice copy, and client-area description",
          operationId: "getCompany",
          responses: { "200": { description: "Company record" } },
        },
      },
      "/api/estates": {
        get: {
          tags: ["Estates"],
          summary: "Partner portfolio, under the estates path",
          operationId: "listEstates",
          responses: { "200": { description: "Estate collection" } },
        },
      },
      "/api/estates/{slug}": {
        get: {
          tags: ["Estates"],
          summary: "One estate, with its renders and plans",
          operationId: "getEstate",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Estate" },
            "404": { description: "Unknown slug", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/renders": {
        get: {
          tags: ["Renders"],
          summary: "Render studies",
          operationId: "listRenders",
          parameters: [
            {
              name: "estate",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Filter by estate slug",
            },
          ],
          responses: { "200": { description: "Render collection" } },
        },
      },
      "/api/renders/{id}": {
        get: {
          tags: ["Renders"],
          summary: "One render study",
          operationId: "getRender",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Render" },
            "404": { description: "Unknown id" },
          },
        },
      },
      "/api/plans": {
        get: {
          tags: ["Plans"],
          summary: "Plan studies",
          operationId: "listPlans",
          parameters: [
            { name: "estate", in: "query", required: false, schema: { type: "string" } },
          ],
          responses: { "200": { description: "Plan collection" } },
        },
      },
      "/api/plans/{id}": {
        get: {
          tags: ["Plans"],
          summary: "One plan study",
          operationId: "getPlan",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Plan" },
            "404": { description: "Unknown id" },
          },
        },
      },
      "/api/developments": {
        get: {
          tags: ["Developments"],
          summary: "Placeholder developments",
          operationId: "listDevelopments",
          responses: { "200": { description: "Development collection" } },
        },
      },
      "/api/developments/{slug}": {
        get: {
          tags: ["Developments"],
          summary: "One development study",
          operationId: "getDevelopment",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Development" },
            "404": { description: "Unknown slug" },
          },
        },
      },
      "/api/marketplace/listings": {
        get: {
          tags: ["Marketplace"],
          summary: "Unissued plan and render teasers",
          operationId: "listListings",
          parameters: [
            {
              name: "kind",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["plan", "render"] },
            },
          ],
          responses: { "200": { description: "Listing collection" } },
        },
      },
      "/api/marketplace/listings/{id}": {
        get: {
          tags: ["Marketplace"],
          summary: "One marketplace teaser",
          operationId: "getListing",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Listing" },
            "404": { description: "Unknown id" },
          },
        },
      },
      "/api/marketplace/waitlist": {
        post: {
          tags: ["Marketplace"],
          summary: "Accept a waitlist request without storing it",
          operationId: "joinWaitlist",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "interest"],
                  properties: {
                    email: { type: "string", format: "email" },
                    interest: { type: "string", enum: ["plans", "renders", "both"] },
                  },
                },
              },
            },
          },
          responses: {
            "202": { description: "Accepted and discarded. Not persisted." },
            "400": { description: "Invalid body" },
          },
        },
      },
      "/api/marketplace/mint": {
        post: {
          tags: ["Marketplace"],
          summary: "Minting stub. Creates no asset.",
          description:
            "Returns a stub receipt. If X-Quantum-Agent-Key is sent it must be valid. A missing key still returns the stub so the human teaser can call it. An invalid key is rejected.",
          operationId: "mintStub",
          security: [{ agentKey: [] }, {}],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["listingId", "standard"],
                  properties: {
                    listingId: { type: "string" },
                    standard: { type: "string", enum: ["nft", "ordinal"] },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Stub receipt. minted is false." },
            "401": { description: "Key was sent and rejected" },
            "404": { description: "Unknown listing" },
            "400": { description: "Invalid body" },
          },
        },
      },
      "/api/session": {
        get: {
          tags: ["Session"],
          summary: "Read the human placeholder session",
          operationId: "getSession",
          responses: {
            "200": { description: "Stub session" },
            "401": { description: "No session cookie" },
          },
        },
        post: {
          tags: ["Session"],
          summary: "Create a placeholder session cookie",
          operationId: "createSession",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email"],
                  properties: { email: { type: "string", format: "email" } },
                },
              },
            },
          },
          responses: {
            "200": { description: "Cookie set. Not an account." },
            "400": { description: "Invalid email" },
          },
        },
        delete: {
          tags: ["Session"],
          summary: "Clear the placeholder session",
          operationId: "deleteSession",
          responses: { "200": { description: "Cookie cleared" } },
        },
      },
      "/api/payments": {
        get: {
          tags: ["Payments"],
          summary: "Payment module status",
          description: "Reports whether invoice payments are enabled. Receiving addresses are omitted.",
          operationId: "getPaymentStatus",
          responses: { "200": { description: "Status. Enabled is false unless PAYMENTS_ENABLED=true." } },
        },
      },
      "/api/payments/quote": {
        get: {
          tags: ["Payments"],
          summary: "Live USD quote for ETH or SOL",
          operationId: "getPaymentQuote",
          parameters: [{ name: "token", in: "query", required: true, schema: { type: "string", enum: ["ETH", "SOL"] } }],
          responses: { "200": { description: "Quote" }, "503": { description: "Quote unavailable" } },
        },
      },
      "/api/payments/screen": {
        post: {
          tags: ["Payments"],
          summary: "Validate an invoice payment and run the address screen",
          operationId: "screenPayment",
          responses: { "200": { description: "Settled payment" }, "400": { description: "Invalid payment" }, "403": { description: "Disabled, unconfigured, or blocked" } },
        },
      },
      "/api/payments/qr": {
        post: {
          tags: ["Payments"],
          summary: "Build a payment code for an invoice",
          operationId: "createPaymentQr",
          responses: { "200": { description: "QR and URI. Does not require PAYMENTS_ENABLED." }, "403": { description: "Address missing or screen refused" } },
        },
      },
      "/api/payments/log": {
        post: {
          tags: ["Payments"],
          summary: "Record a confirmed transfer",
          description: "Writes the server console, and forwards to PAYMENT_LOG_WEBHOOK_URL when that URL is set. The server does not verify the transfer on chain.",
          operationId: "logPayment",
          responses: { "200": { description: "Logged" }, "400": { description: "Invalid report" } },
        },
      },
      "/api/auth/agent": {
        post: {
          tags: ["Agent"],
          summary: "Check the agent API key",
          operationId: "authenticateAgent",
          security: [{ agentKey: [] }],
          responses: {
            "200": { description: "Key matched AGENT_API_KEY" },
            "401": { description: "Missing or invalid key" },
            "503": { description: "AGENT_API_KEY is not configured" },
          },
        },
      },
    },
    externalDocs: {
      description: "Agent guide",
      url: absoluteUrl("/llms.txt"),
    },
  };
}
