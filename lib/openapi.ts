import { absoluteUrl } from "@/lib/site";

export function buildOpenApi() {
  return {
    openapi: "3.1.0",
    info: {
      title: "Quantum Group Co. Agent API",
      version: "0.1.0",
      description:
        "Phase 1 contract for AI agents. Public facts match the human site and content/site.ts. Estates are placeholders. Commercial terms are omitted. Minting is a stub: no wallet and no mainnet.",
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
          summary: "Placeholder signature estates",
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
