# Quantum Group Co

Phase 1 site for Quantum Group Co, an ultra-luxury residential construction and development practice in Antigua and Barbuda. The home page is a cinematic 3D journey. Photographs of the partners' work support it, inside the editorial pages and as stand-ins inside each portfolio scene.

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

Scroll is the timeline. One canvas follows an estate from an empty site through vision, blueprint, structure, finish, and evening. Lighting moves from morning through dusk to night. A stage counter and a timeline of buttons mark the place in that journey. The canvas is its own chunk. Phones use a simpler scene: lower resolution, a coarser water mesh, fewer stars, and no shadows. `prefers-reduced-motion` skips the canvas and keeps the dusk photograph plus the written pages. Sound stays off until a visitor turns it on.

Lenis smooths wheel scrolling and stays in step with the camera. A gold ring follows a fine pointer and eases toward links. It does not replace the system cursor.

Each service is a short procedural scene:

- Engineering: an exploded structure, load-path lines, rebar, and a precast beam.
- Rendering and plans: sheets lift and a volume extrudes from them.
- Construction: massing rises out of the site.
- Finishing: a light sweeps plaster, stone, and timber.
- Materials: precast pavers tile a courtyard.
- Developments: the camera pulls back from one villa to an estate of them.

The partner portfolio is a flight from project to project. Scroll or choose a name. Opening a project shows a `ProjectScene`: the owner's photographs as floating planes, ready for a model.

## Models

To replace a project's photographs with a model:

1. Export glTF binary and compress it. Prefer meshopt. This site decodes meshopt. It does not load a Draco decoder or a KTX2 transcoder. Use WebP or JPEG textures inside the file until a transcoder is added. Keep each model under 8 MB, and under 4 MB when you can. 1K or 2K textures are enough at this camera distance.
2. Save it as `public/models/<project-slug>/scene.glb`.
3. Register the public path in `projectModels` in [`content/portfolio.ts`](content/portfolio.ts):

```ts
export const projectModels: Record<string, string> = {
  "delphis-jumby-bay": "/models/delphis-jumby-bay/scene.glb",
};
```

A Gaussian splat can use that same slot later. Today `model` is a glTF URL. `models/demo-villa/` is an old demo and is not loaded.

## Edit the public copy

Company, services, team, and marketplace records live in [`content/site.ts`](content/site.ts). Partner portfolio records live in [`content/portfolio.ts`](content/portfolio.ts). Pages, the sequence, the REST API, the sitemap, and JSON-LD read those files.

The content module refuses to load if it finds a dollar price or an external URL. Keep new records free of prices, client names, private project data, and links to another site.

Unresolved items are listed in [`PLACEHOLDERS.md`](PLACEHOLDERS.md). Notes render in development, or when `NEXT_PUBLIC_SHOW_PLACEHOLDERS=true`. They are omitted from production HTML.

Team cards with `confirmed: false` stay off the public team API.

## Payments

The portable module is [`src/features/crypto-pay`](src/features/crypto-pay). It supports Base, Ethereum, and Solana, and the tokens USDC, USDT, ETH, and SOL.

- `PAYMENTS_ENABLED` defaults to false. The pay page still shows the full panel, with the banner “Payments not yet enabled”, and the pay button does not send.
- Placeholder receiving addresses, including `0xYOUR_BASE_ADDRESS`, show “Payments not configured”. Sending requires both the master switch and a real address.
- This site uses the `quantum` profile. `botSite` has its own addresses. A shared address fails validation. There is no fallback between profiles.
- An invoice number is required. USDC and USDT are credited 1:1 with the US dollar amount. ETH and SOL amounts are estimates from a live quote, and stablecoins are recommended.
- Wallet connection uses Reown AppKit with wagmi, viem, and the Solana adapter. Leave `NEXT_PUBLIC_REOWN_PROJECT_ID` unset and the panel keeps QR and a copied address only. Swaps stay off.
- Card checkout is off unless `PAY_FIAT_ENABLED=true` and a Stripe Payment Link or Coinbase Commerce URL is set. No secret keys.

The module’s own notes, including the compliance controls and what the card links need, are in [`src/features/crypto-pay/README.md`](src/features/crypto-pay/README.md). Antigua counsel must sign off before `PAYMENTS_ENABLED` is turned on.

- `SANCTIONS_API_URL` and `SANCTIONS_API_KEY` are the address-screen hook. With the URL empty, the hook allows the payment. A blocked result refuses it.
- `POST /api/payments/log` records a confirmed transfer and, when `PAYMENT_LOG_WEBHOOK_URL` is set, forwards that record. Otherwise it writes the server console. It does not verify the chain.

The site never holds keys or funds, and it does not convert, swap, or forward them. Payments go wallet to wallet. Tip mode exists in the module for another host and is not shown on this site.

## Agent API

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/llms.txt` | Public |
| GET | `/api` | Public |
| GET | `/api/openapi.json` | Public |
| GET | `/api/company` | Public |
| GET | `/api/services` and `/api/services/{slug}` | Public. Robotics is absent unless `ROBOTICS_ENABLED=true`. Includes the Your Build, Live summary. |
| GET | `/api/client-experience` | Public. Weekly updates, channels, video meetings, the private project app, and the shared folder. |
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
| POST | `/api/payments/screen` | Send gate. Refused while payments are disabled, unconfigured, or blocked by the address screen. |
| POST | `/api/payments/qr` | Payment code for a real address and an invoice number. Display does not require the master switch. |
| POST | `/api/payments/log` | Confirmed transfer. Console, or `PAYMENT_LOG_WEBHOOK_URL` when set. Not chain verification. |
| GET, POST, DELETE | `/api/session` | Human placeholder cookie. POST body `{ email }`. |
| POST | `/api/auth/agent` | Header `X-Quantum-Agent-Key`, compared with `AGENT_API_KEY`. |

Catalog reads are public so an agent can learn the site without a secret. If a key is sent to the mint stub and it does not match, the call is rejected. If the header is omitted, the stub still answers and mints nothing. `POST /api/auth/agent` returns 503 when `AGENT_API_KEY` is unset, 401 when the key is wrong, and 200 when it matches. No key is stored in the repository.

Responses use `{ ok, placeholder, data }` or `{ ok: false, error: { code, message } }`.

Human pages `/client/portal` and `/client/homes/{slug}` require the placeholder session cookie. It is not signed and it is not an identity provider.

## Architecture

- Next.js App Router and TypeScript. Pages are server-rendered from `content/site.ts`.
- Tailwind for the editorial UI.
- React Three Fiber and Three.js for the home journey, the service vignettes, and the portfolio scenes. Each canvas is a client-only dynamic import. Lenis drives smooth scrolling.
- Route Handlers for JSON reads. `llms.txt`, OpenAPI, and the agent routes answer only when `AGENT_API_ENABLED=true`. `proxy.ts` gates the client portal and adds CORS on `/api`.
- JSON-LD on the key pages. Sitemap, robots, Open Graph image, and semantic HTML are included.
- `src/features/crypto-pay` is self-contained apart from the Next.js routes that call it.

## Hosting

Do not use a static export. Cache Components need a Node.js runtime.

Cloudflare Workers, free plan, via OpenNext:

```bash
npm run build:cloudflare
```

That runs `opennextjs-cloudflare build`. Wrangler config is `wrangler.jsonc`. Worker name `quantum-group-co`. Compatibility date `2026-10-11`. Flags `nodejs_compat` and `global_fetch_strictly_public`. No R2 bucket and no Images binding, so the free plan does not need those products.

Workers Builds, connected to GitHub:

- Production branch: `main`
- Root directory: repository root
- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `npx opennextjs-cloudflare deploy`
- Non-production branch deploy command: `npx wrangler versions upload`

`DRAFT_CONTENT`, `PAYMENTS_ENABLED`, `ROBOTICS_ENABLED`, `AI_FEATURES_ENABLED`, and `AGENT_API_ENABLED` default to false. Set them as build variables if a preview should turn one on. `NEXT_PUBLIC_SITE_URL` defaults to `https://quantum-group.example` when unset.

## Phase 2

- Real client authentication with an identity provider, replacing the unsigned cookie.
- A sanctions provider on `SANCTIONS_API_URL`, real receiving addresses, counsel sign-off, and `PAYMENTS_ENABLED=true`.
- Chain verification of payment logs, still without holding keys in the repo.
- Actual NFT or Bitcoin Ordinal issuance for plan sets and render plates, aimed at private buyers.
- Per-home applications mounted at `/client/homes/[slug]`. The slot and its contract are already there. Nothing is mounted.
- A final domain in `NEXT_PUBLIC_SITE_URL`, and a chosen host (Vercel or Cloudflare OpenNext).

## Not in this phase

No house prices or ranges. No client names. No links to another site or dashboard of the owner. No live mint. No API keys, tokens, or private data in the tree. Payments cannot send while the master switch is off.
