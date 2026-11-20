# OneAtlas — Loom Video Script (5–10 min)

Record against the deployed live URL. Keep it to ~7 minutes. Speak over the
live product, not slides.

## 0:00–0:45 — Intro
- "Hi, I'm Abhishek Kumar. This is OneAtlas — an AI model discovery and
  intelligence platform I built for The AI Signal's demo task, in the
  Full Stack Engineer role."
- One line on the problem: models are scattered across providers; developers
  need one place to discover, compare and evaluate them on price, context
  and benchmarks.

## 0:45–3:00 — Product tour (live demo)
- Discover page: search a model (e.g. "GPT-5" or "Claude"), filter by lab /
  provider / type / capability, sort by price, context window, release date,
  benchmark score. Note the model count (477 real models).
- Open a model detail page: pricing per 1M tokens, context window,
  modalities, capabilities, benchmark table with sources, related models.
- Comparison: add 3–4 models with the + Compare toggle, open the compare
  page — pricing, context, capabilities and benchmarks side by side.
  Mention the selection lives in the URL, so a comparison is shareable.
- Rankings: leaderboard per benchmark, filterable by model type.
- Labs & Providers directory: browse companies and providers with their
  models.

## 3:00–5:00 — Architecture
- Stack: Next.js 16 App Router + React + TypeScript (strict) + Tailwind,
  Node.js API routes, PostgreSQL + Prisma ORM.
- Data flow: OpenRouter's public models catalog is fetched by the seed
  script and stored in Postgres (models, labs, providers, benchmark
  scores). Every page and API route reads from the database — no hardcoded
  frontend data.
- API routes: `/api/models`, `/api/models/[slug]`, `/api/compare`,
  `/api/rankings`, `/api/labs`, `/api/providers`, `/api/search`.
- Why this shape: server-rendered pages for fast first paint and SEO,
  Prisma for type-safe DB access, env-based `DATABASE_URL` so the same
  code runs locally and on Vercel with a hosted Postgres.

## 5:00–6:15 — Technical decisions
- Real data over mock data: 477 models, 60 labs, 26 providers, 672
  benchmark rows. Benchmarks come from Artificial Analysis indices in the
  OpenRouter response plus vendor-published scores, each labelled with its
  source. Models without a sourced score show no score — I did not invent
  numbers.
- Prisma 8 RC: Prisma 7's installer kept failing on network errors, so the
  data layer is written against Prisma 8 RC, which installed cleanly.
- Deployment: Vercel + hosted Postgres (Neon). One-time `db:init` +
  `db:seed` against the hosted database, then `npm run build`.

## 6:15–7:00 — Challenges & close
- Challenge 1: getting a real Postgres running and seeded with the full
  OpenRouter catalog (477 models) instead of a small hardcoded list.
- Challenge 2: modelling pricing, context and benchmarks in one schema so
  search, sort, compare and rankings all read from the same tables.
- Close: "The code is on GitHub, the app is live at [live URL]. Happy to
  walk through any part of the implementation. Thank you."

## Checklist before recording
- [ ] Live URL loads; search, compare and rankings work
- [ ] GitHub repo link ready to paste in the form
- [ ] Loom set to record screen + camera (optional), 5–10 min
- [ ] Submit all three (live URL, GitHub URL, Loom link) at
      https://forms.gle/oDQ6ucjpiFaZtCGL9 before Mon 23 Nov, 7:00 PM IST
