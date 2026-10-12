# Deploy Quantum Group Co

Cloudflare Workers, free plan, through the OpenNext adapter. The Workers Builds project name must be `quantum-group-co`, the same value as `name` in `wrangler.jsonc`. There is no account id and no secret in the repo. There is no R2 bucket and no Images binding.

`main` does not yet contain this config. Until this pull request is merged, set the Workers Builds production branch to `cursor/quantum-phase-1-cb33`. After the merge, switch that production branch to `main`.

## Workers Builds

| Setting | Value |
| --- | --- |
| Project name | `quantum-group-co` |
| Production branch | `cursor/quantum-phase-1-cb33` until merged, then `main` |
| Root directory | repository root |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx opennextjs-cloudflare deploy --env production --keep-vars` |
| Non-production branch deploy command | `npx opennextjs-cloudflare upload --env preview` |
| Compatibility date | `2026-10-12` |
| Compatibility flags | `nodejs_compat`, `global_fetch_strictly_public` |

`preview_urls` is true. A non-production upload receives a `*.workers.dev` preview URL and is not promoted to production traffic.

The worker entry is `.open-next/worker.js`. Static files come from `.open-next/assets` on the `ASSETS` binding. `WORKER_SELF_REFERENCE` points at `quantum-group-co`. Wrangler does not inherit `services` or `vars` into an environment, so the preview environment repeats both. `env.preview.name` is set to `quantum-group-co` so the preview version stays on this Worker.

`--keep-vars` on the production deploy keeps dashboard secrets that are not listed in `wrangler.jsonc`. Flags that are listed in the file are still taken from the file.

## Feature flags

Workers Builds uses one build command for every branch. `NEXT_PUBLIC_*` values are inlined into the Next bundle when that build runs, so a build variable cannot mean one thing for production and another for preview unless the dashboard is given separate Production and Preview build variables.

The feature flags are not `NEXT_PUBLIC_` (except `NEXT_PUBLIC_SHOW_PLACEHOLDERS`). `lib/flags.ts` reads them from `process.env` on the request. `nodejs_compat` copies Worker vars into `process.env`. The same build artifact can therefore run with different flags:

- Production deploy uses `npx opennextjs-cloudflare deploy --env production --keep-vars`. `env.production` sets `DRAFT_CONTENT` to `false`. The same values are repeated at the top level, so a deploy that forgets `--env` still ships the safe defaults. Wrangler warns in that case. Concept plates stay off.
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

Any host ending in `.workers.dev` receives `X-Robots-Tag: noindex, nofollow` from `proxy.ts`, and the document includes `<meta name="robots" content="noindex, nofollow">`. Concept plates on a preview URL are not offered for indexing. A custom production domain does not match this rule.

## Local commands

| Script | Command |
| --- | --- |
| `build` | `next build` |
| `preview` | `opennextjs-cloudflare build && opennextjs-cloudflare preview` |
| `deploy` | `opennextjs-cloudflare build && opennextjs-cloudflare deploy` |
| `cf-typegen` | `wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts` |

`npm run build` is only the Next.js build. Workers Builds runs `npx opennextjs-cloudflare build`, which includes the Next build and writes `.open-next/`.

The free plan allows a gzip-compressed Worker script of 3 MiB. Check the wrangler dry-run bundle after `npx opennextjs-cloudflare build`, not the uncompressed `.open-next` directory.
