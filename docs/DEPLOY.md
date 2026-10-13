# Deploy Quantum Group Co

Cloudflare Workers, free plan, through the OpenNext adapter. The Workers Builds project name must be `quantum-group-co`, the same value as `name` in `wrangler.jsonc`. There is no account id and no secret in the repo. There is no R2 bucket and no Images binding.

`main` does not yet contain this config. Until this pull request is merged, set the Workers Builds production branch to `cursor/quantum-phase-1-cb33`. After the merge, switch that production branch to `main`.

## Workers Builds

| Setting | Value |
| --- | --- |
| Project name | `quantum-group-co` |
| Production branch | `cursor/quantum-phase-1-cb33` until merged, then `main` |
| Root directory | repository root (leave the dashboard field empty) |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx opennextjs-cloudflare deploy --env production --keep-vars` |
| Preview command | `npx opennextjs-cloudflare upload --env preview` |
| Node.js | `22.23.2`, from `.node-version`. Do not also set `NODE_VERSION`. |
| Compatibility date | `2026-10-12` |
| Compatibility flags | `nodejs_compat`, `global_fetch_strictly_public` |

Workers Builds defaults to Node.js 24.18.0. `.node-version` selects 22.23.2, which that build image already has, and which satisfies Next.js 16 (`node >= 20.9.0`). A dashboard `NODE_VERSION` would override the file, so leave it unset.

Next.js is pinned to `16.3.8`. `@opennextjs/cloudflare` 1.20.10 accepts `>=16.3.8`, but 16.4.0 loads `.next/server/preview-props.json` from `NextNodeServer.getPreviewProps`, and this adapter's `loadManifest` patch does not inline that file. Every dynamic route then throws `Unexpected loadManifest(/.next/server/preview-props.json) call!` (Cloudflare error 1101). `16.3.8` is the newest release whose manifests the adapter inlines.

`cacheComponents` and `partialPrefetching` are off. With them on, Next parks `headers()` and `connection()` on a promise that only resolves when the Cache Components stage scheduler advances. That scheduler patches Node timer `_idleStart`. workerd does not have it, and 1.20.10 does not include the workerd scheduler, so the promise never settles and the runtime reports that the Worker hung. The same hang shows on `/about`, which does not load the 3D scene. Draft flags are still read per request: the root layout calls `headers()`, so routes render on the Worker instead of being frozen at build time.

Next.js 16 `proxy.ts` always runs as Node middleware, and the adapter does not run Node middleware. The portal gate, API CORS, and preview `noindex` header stay in `middleware.ts` with the runtime left unset, so Next compiles them for the edge runtime the adapter does run. The build warns that the `middleware` filename is deprecated. That warning is expected.

`preview_urls` is true. A non-production upload receives a `*.workers.dev` preview URL and is not promoted to production traffic.

The worker entry is `.open-next/worker.js`. Static files come from `.open-next/assets` on the `ASSETS` binding. `WORKER_SELF_REFERENCE` points at `quantum-group-co`. Wrangler does not inherit `services` or `vars` into an environment, so the preview environment repeats both. `env.preview.name` is set to `quantum-group-co` so the preview version stays on this Worker.

`--keep-vars` on the production deploy keeps dashboard secrets that are not listed in `wrangler.jsonc`. Flags that are listed in the file are still taken from the file.

## Feature flags

Workers Builds uses one build command for every branch. `NEXT_PUBLIC_*` values are inlined into the Next bundle when that build runs, so a build variable cannot mean one thing for production and another for preview unless the dashboard is given separate Production and Preview build variables.

The feature flags are not `NEXT_PUBLIC_` (except `NEXT_PUBLIC_SHOW_PLACEHOLDERS`). `lib/flags.ts` reads them from `process.env` on the request. `nodejs_compat` copies Worker vars into `process.env`. The same build artifact can therefore run with different flags:

- Production deploy uses `npx opennextjs-cloudflare deploy --env production --keep-vars`. `env.production` sets `DRAFT_CONTENT` to `false`. The same values are repeated at the top level, so a deploy that forgets `--env` still ships the safe defaults. Wrangler warns in that case. Concept plates stay off, and `/concept/demo-villa` is a 404.
- Non-production deploy runs `npx opennextjs-cloudflare upload --env preview`. Wrangler environment `preview` sets `DRAFT_CONTENT` to `true` and leaves every other flag off. `env.preview.name` is `quantum-group-co` on purpose. Without that, Wrangler would upload to a second Worker named `quantum-group-co-preview`. `versions upload` stores the version on `quantum-group-co` and does not send it production traffic. `preview_urls` gives that version a `*.workers.dev` hostname.

Do not set `DRAFT_CONTENT` as a Workers Builds build variable. A build variable would be the same for every branch unless Preview and Production build variables are both filled in, and it is unnecessary because the flag is applied at runtime.

| Variable | Production (`vars`) | Preview (`env.preview.vars`) |
| --- | --- | --- |
| `PAYMENTS_ENABLED` | `false` | `false` |
| `AI_FEATURES_ENABLED` | `false` | `false` |
| `ROBOTICS_ENABLED` | `false` | `false` |
| `AGENT_API_ENABLED` | `false` | `false` |
| `DRAFT_CONTENT` | `false` | `true` |
| `SHOW_VIVID_PRODUCT_LINES` | `true` | `true` |
| `NEXT_PUBLIC_SHOW_PLACEHOLDERS` | `false` | `false` |

`NEXT_PUBLIC_SHOW_PLACEHOLDERS` is also inlined if it is present while Next builds. Leave it unset in the Workers Builds build variables. The runtime value above stays `false`, so placeholder notes stay out of the HTML.

Leave secrets empty until they are real. Do not commit them. Set receiving addresses, `AGENT_API_KEY`, and `NEXT_PUBLIC_SITE_URL` in the dashboard when they exist. `NEXT_PUBLIC_SITE_URL` must be a build variable for the environment whose hostname should appear in the sitemap and Open Graph, because Next inlines it.

## Preview hostnames are not indexed

Any host ending in `.workers.dev` receives `X-Robots-Tag: noindex, nofollow` from `middleware.ts`, and the document includes `<meta name="robots" content="noindex, nofollow">`. Concept plates on a preview URL are not offered for indexing. A custom production domain does not match this rule.

`/concept/demo-villa` always sends that same `X-Robots-Tag`, on every host, including when the flag is off and the route is a 404. It is omitted from the sitemap and disallowed in `robots.txt`. The walkthrough itself is documented in [DEMO-VILLA.md](DEMO-VILLA.md).

## Local commands

| Script | Command |
| --- | --- |
| `build` | `next build` |
| `preview` | `opennextjs-cloudflare build && opennextjs-cloudflare preview` |
| `deploy` | `opennextjs-cloudflare build && opennextjs-cloudflare deploy --env production --keep-vars` |
| `upload` | `opennextjs-cloudflare build && opennextjs-cloudflare upload --env preview` |
| `cf-typegen` | `wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts` |

`npm run build` is only the Next.js build. Workers Builds runs `npx opennextjs-cloudflare build`, which includes the Next build and writes `.open-next/`.

The free plan allows a gzip-compressed Worker script of 3 MiB. Check the wrangler dry-run bundle after `npx opennextjs-cloudflare build`, not the uncompressed `.open-next` directory. A dry-run of this branch (`npx wrangler deploy --dry-run --env production --outdir /tmp/cf-dry --keep-vars`) reported **gzip 2906.46 KiB** (about 2.84 MiB), under that limit. Production `vars` in that bundle keep `DRAFT_CONTENT` at `false`.
