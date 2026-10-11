# Quantum Group Co.

Phase 1 site for Quantum Group Co., an ultra-luxury residential construction and development practice. Antigua and Barbuda is the market. Humans browse a dark, cinematic site. AI agents are the primary readers of record: every public fact is also in a JSON API, an OpenAPI document, JSON-LD, and `llms.txt`.

There are no house prices. The partner portfolio names works, not clients. Payments, when enabled, are non-custodial and off by default.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm test
npm run build
npm start
```

`NEXT_PUBLIC_SITE_URL` is optional in local development. When it is unset, metadata falls back to `https://quantum-group.example`. Set it before a public deploy. `AGENT_API_KEY` is optional. Leave it empty until you want agent authentication to succeed.

## Experience

The home page opens on the company, then a four-stage scroll: Design, Engineer, Build, Finish. The scene assembles a wireframe villa into a finished house over a dark sea. Glass panels carry the same four words.

Desktop uses WebGL (React Three Fiber, drei, and Three.js), loaded only in the browser. The still edition is used when any of these are true:

- viewport under 900px
- `prefers-reduced-motion: reduce`
- `?experience=still`

Force the sequence with `?experience=webgl`, or use **Play the sequence** on the still edition. The written pages carry the same facts as the sequence.

## Edit the public copy

Company, services, team, and marketplace records live in [`content/site.ts`](content/site.ts). Partner portfolio records live in [`content/portfolio.ts`](content/portfolio.ts). Pages, the sequence, the REST API, the sitemap, and JSON-LD read those files.

The content module refuses to load if it finds a dollar price or an external URL. Keep new records free of prices, client names, private project data, and links to another site.

Unresolved items are listed in [`PLACEHOLDERS.md`](PLACEHOLDERS.md). Notes render in development, or when `NEXT_PUBLIC_SHOW_PLACEHOLDERS=true`. They are omitted from production HTML.

Team cards with `confirmed: false` stay off the public team API.

## Payments

The portable module is [`src/features/crypto-pay`](src/features/crypto-pay). It supports Base, Ethereum, and Solana, and the tokens USDC, USDT, ETH, and SOL.

- `PAYMENTS_ENABLED` defaults to false. The pay page shows “Payments are not yet enabled.” and will not build a payment code.
- Receiving addresses that still contain a placeholder are refused.
- The invoice profile and the tip profile must use different addresses.
- An invoice number is required for an invoice payment. USDC and USDT follow that USD amount one for one. ETH and SOL amounts are estimates from a live quote.
- Wallet connection uses Reown AppKit with wagmi, viem, and the Solana adapter. It stays hidden until `NEXT_PUBLIC_REOWN_PROJECT_ID` is a 32-character id. Scanning a code or copying an address does not need it.
- `SANCTIONS_WEBHOOK_URL` is the screening hook. With it empty, the hook allows the payment and says that no list was queried.
- `POST /api/payments/log` records a client-reported transfer. It does not verify the chain.

The site never holds keys or funds. A tip does not pay an invoice.

## Agent API

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/llms.txt` | Public |
| GET | `/api` | Public |
| GET | `/api/openapi.json` | Public |
| GET | `/api/company` | Public |
| GET | `/api/services` and `/api/services/{slug}` | Public. Robotics is absent unless `ROBOTICS_ENABLED=true`. |
| GET | `/api/portfolio` and `/api/portfolio/{slug}` | Public |
| GET | `/api/team` | Public. Confirmed cards only. |
| GET | `/api/estates` and `/api/estates/{slug}` | Public. Same portfolio, kept for the Phase 1 path. |
| GET | `/api/renders` and `/api/renders/{id}` | Public |
| GET | `/api/plans` and `/api/plans/{id}` | Public |
| GET | `/api/developments` and `/api/developments/{slug}` | Public |
| GET | `/api/marketplace/listings` and `/api/marketplace/listings/{id}` | Public. Filter with `?kind=plan` or `render` |
| POST | `/api/marketplace/waitlist` | Public. Body `{ email, interest }` where interest is `plans`, `renders`, or `both`. Not stored. |
| POST | `/api/marketplace/mint` | Stub. Body `{ listingId, standard }` where standard is `nft` or `ordinal`. Always `minted: false`. |
| GET | `/api/payments` | Public status. Addresses are omitted. |
| GET | `/api/payments/quote?token=ETH` | Public market quote for settlement. `token` is `ETH` or `SOL`. |
| POST | `/api/payments/screen` and `/api/payments/qr` | Refused while payments are disabled. |
| POST | `/api/payments/log` | Client-reported transfer. Not chain verification. |
| GET, POST, DELETE | `/api/session` | Human placeholder cookie. POST body `{ email }`. |
| POST | `/api/auth/agent` | Header `X-Quantum-Agent-Key`, compared with `AGENT_API_KEY`. |

Catalog reads are public so an agent can learn the site without a secret. If a key is sent to the mint stub and it does not match, the call is rejected. If the header is omitted, the stub still answers and mints nothing. `POST /api/auth/agent` returns 503 when `AGENT_API_KEY` is unset, 401 when the key is wrong, and 200 when it matches. No key is stored in the repository.

Responses use `{ ok, placeholder, data }` or `{ ok: false, error: { code, message } }`.

Human pages `/client/portal` and `/client/homes/{slug}` require the placeholder session cookie. It is not signed and it is not an identity provider.

## Architecture

- Next.js App Router and TypeScript. Pages are server-rendered from `content/site.ts`.
- Tailwind for the editorial UI.
- React Three Fiber and Three.js for the sequence. The canvas is a client-only dynamic import.
- Route Handlers for the agent API. `proxy.ts` gates the client portal and adds CORS on `/api`.
- JSON-LD on the key pages. Sitemap, robots, Open Graph image, and semantic HTML are included.
- `src/features/crypto-pay` is self-contained apart from the Next.js routes that call it.

## Hosting

Vercel runs this as-is.

Cloudflare Pages can run it through the OpenNext Cloudflare adapter, which provides a Node.js runtime. Do not use a pure static export, and do not use the older edge-only Next adapter. This project enables Next.js Cache Components, which require Node.js. Route Handlers are the agent API, so they have to stay on a server.

A later static-only marketing export would drop `/api/*` unless those routes move to a separate worker. Prefer Vercel, or Cloudflare via OpenNext, for Phase 1.

The pay page reads `PAYMENTS_ENABLED` on each request. A static export would freeze that flag at build time.

## Phase 2

- Real client authentication with an identity provider, replacing the unsigned cookie.
- A sanctions provider on `SANCTIONS_WEBHOOK_URL`, real receiving addresses, and `PAYMENTS_ENABLED=true`.
- Chain verification of payment logs, still without holding keys in the repo.
- Actual NFT or Bitcoin Ordinal issuance for plan sets and render plates, aimed at private buyers.
- Per-home applications mounted at `/client/homes/[slug]`. The slot and its contract are already there. Nothing is mounted.
- A final domain in `NEXT_PUBLIC_SITE_URL`, and a chosen host (Vercel or Cloudflare OpenNext).

## Not in this phase

No house prices or ranges. No client names. No links to another site or dashboard of the owner. No live mint. No API keys, tokens, or private data in the tree. Payments cannot send while the master switch is off.
