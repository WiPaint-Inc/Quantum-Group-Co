# Quantum Group Co.

Phase 1 site for Quantum Group Co., an ultra-luxury residential construction and development practice. Antigua and Barbuda is the market. The human site is a cinematic archipelago. AI agents are the primary readers of record: every public fact is also in a JSON API, an OpenAPI document, JSON-LD, and `llms.txt`.

There are no prices. The estates are placeholders. Nothing here is a client project, a wallet, or a live mint.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run build
npm start
```

`NEXT_PUBLIC_SITE_URL` is optional in local development. When it is unset, metadata falls back to `https://quantum-group.example`. Set it before a public deploy. `AGENT_API_KEY` is optional. Leave it empty until you want agent authentication to succeed.

## Experience

The home page has two realms.

- **Archipelago** is the ocean: Caribbean water, caustics, sunset light, and floating studies you can focus.
- **Meridian** is space: vision, future developments, craft, and the marketplace teaser.

Choose a node, or use the arrow keys. Escape releases focus. The Meridian ring leaves the water. The transition is a camera move into a portal veil.

Desktop uses WebGL (React Three Fiber, drei, Three.js), loaded only in the browser. The still edition is used when any of these are true:

- viewport under 900px
- `prefers-reduced-motion: reduce`
- save-data, very little memory, or two or fewer cores
- WebGL missing or the context is lost

Force an edition with `?experience=webgl` or `?experience=still`, or use **Enter the waters** / **View stills**. The still edition and a clipped written index carry the same facts as the 3D scene.

## Edit the projects

All public copy lives in [`content/site.ts`](content/site.ts). Replace the placeholder estates, renders, plans, developments, and marketplace listings there. Pages, the 3D nodes, the REST API, the sitemap, and JSON-LD read that file.

Keep new records free of prices, client names, private project data, and external URLs. The file refuses to load if it finds a price pattern or an `http` URL.

## Agent API

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/llms.txt` | Public |
| GET | `/api` | Public |
| GET | `/api/openapi.json` | Public |
| GET | `/api/company` | Public |
| GET | `/api/estates` and `/api/estates/{slug}` | Public |
| GET | `/api/renders` and `/api/renders/{id}` | Public. Filter with `?estate=` |
| GET | `/api/plans` and `/api/plans/{id}` | Public. Filter with `?estate=` |
| GET | `/api/developments` and `/api/developments/{slug}` | Public |
| GET | `/api/marketplace/listings` and `/api/marketplace/listings/{id}` | Public. Filter with `?kind=plan` or `render` |
| POST | `/api/marketplace/waitlist` | Public. Body `{ email, interest }` where interest is `plans`, `renders`, or `both`. Not stored. |
| POST | `/api/marketplace/mint` | Stub. Body `{ listingId, standard }` where standard is `nft` or `ordinal`. Always `minted: false`. |
| GET, POST, DELETE | `/api/session` | Human placeholder cookie. POST body `{ email }`. |
| POST | `/api/auth/agent` | Header `X-Quantum-Agent-Key`, compared with `AGENT_API_KEY`. |

Catalog reads are public so an agent can learn the site without a secret. If a key is sent to the mint stub and it does not match, the call is rejected. If the header is omitted, the stub still answers and mints nothing. `POST /api/auth/agent` returns 503 when `AGENT_API_KEY` is unset, 401 when the key is wrong, and 200 when it matches. No key is stored in the repository.

Responses use `{ ok, placeholder, data }` or `{ ok: false, error: { code, message } }`.

Human pages `/client/portal` and `/client/homes/{slug}` require the placeholder session cookie. It is not signed and it is not an identity provider.

## Architecture

- Next.js App Router and TypeScript. Pages are server-rendered from `content/site.ts`.
- Tailwind for the editorial UI.
- React Three Fiber, drei (`Stars`, `Float`, `AdaptiveDpr`), and Three.js for the waters. The canvas is a client-only dynamic import.
- Route Handlers for the agent API. `proxy.ts` gates the client portal and adds CORS on `/api`.
- JSON-LD (`Organization`, `RealEstateListing`, `Place`) on the key pages. Sitemap, robots, Open Graph image, and semantic HTML are included.

## Hosting

Vercel runs this as-is.

Cloudflare Pages can run it through the OpenNext Cloudflare adapter, which provides a Node.js runtime. Do not use a pure static export, and do not use the older edge-only Next adapter. This project enables Next.js Cache Components, which require Node.js. Route Handlers are the agent API, so they have to stay on a server.

A later static-only marketing export would drop `/api/*` unless those routes move to a separate worker. Prefer Vercel, or Cloudflare via OpenNext, for Phase 1.

## Phase 2

- Real client authentication with an identity provider, replacing the unsigned cookie.
- Wallet connection, still without holding keys in the repo.
- Actual NFT or Bitcoin Ordinal issuance for plan sets and render plates, aimed at private buyers.
- Per-home applications mounted at `/client/homes/[slug]`. The slot and its contract are already there. Nothing is mounted.
- A final domain in `NEXT_PUBLIC_SITE_URL`, and a chosen host (Vercel or Cloudflare OpenNext).

## Not in this phase

No dollar amounts or ranges. No real client or project names. No links to another site or dashboard. No live wallet, testnet, or mainnet. No API keys, tokens, or private data in the tree.
