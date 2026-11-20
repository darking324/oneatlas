# OneAtlas — AI Model Discovery & Intelligence Platform

A demo-task build for **The AI Signal — AI Software Engineer Internship
(Full Stack Engineer role)**. OneAtlas helps users discover, compare and
evaluate AI models across providers, with real pricing, context windows,
capabilities and benchmark intelligence.

## What it does

- **Discover (`/`)** — browse and search ~470 AI models; filter by lab,
  provider, model type, capability and input modality; sort by price, context
  window, release date or benchmark score.
- **Model detail (`/models/[slug]`)** — overview, input/output pricing,
  context window, modalities, capabilities, benchmarks, related models.
- **Compare (`/compare?models=a,b,c`)** — up to 4 models side by side
  (pricing, context, capabilities, benchmarks); the selection lives in the
  URL, so comparisons are shareable.
- **Rankings (`/rankings`)** — leaderboards per benchmark, filterable by
  model type.
- **AI Labs (`/labs`) & Providers (`/providers`)** — directories of the
  companies building the models and the inference providers serving them.
- **API** — `GET /api/models`, `/api/models/[slug]`, `/api/compare`,
  `/api/rankings`, `/api/labs`, `/api/providers`, `/api/search`.
  All data comes from PostgreSQL via Prisma ORM — nothing is hardcoded in
  the frontend.

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript (strict),
  Tailwind CSS 4 — dark theme
- **Backend:** Node.js / TypeScript, Next.js API Routes
- **Database:** PostgreSQL 16 + Prisma ORM 8 (contract in
  `src/prisma/contract.prisma`)
- **Data:** seeded from OpenRouter's public models endpoint
  (`https://openrouter.ai/api/v1/models`, no key needed) plus curated,
  vendor-published benchmark scores. Scores are only stored when they come
  from a published source — nothing is invented.

## Setup

```bash
# 1. PostgreSQL 16 running locally, database `oneatlas` created
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo -u postgres createdb oneatlas

# 2. Environment
cp .env.example .env        # DATABASE_URL=postgresql://postgres:postgres@localhost:5432/oneatlas

# 3. Install & set up the database
npm install
npm run db:init             # create tables from the Prisma contract
npm run db:seed             # fetch OpenRouter catalog + seed labs/providers/models/benchmarks

# 4. Run
npm run dev                 # http://localhost:3000
npm run build               # production build (must pass with zero errors)
npm start                   # serve the production build
```

## Deploy

Set `DATABASE_URL` to a hosted PostgreSQL (e.g. Neon, Supabase, Railway)
and deploy the repo to Vercel / Railway / Render. Run `npm run db:init` and
`npm run db:seed` once against the hosted database, then `npm run build`.

## Notes

- AI-assisted coding tools (Claude, Cursor, Copilot) were used to write the
  code by hand; no no-code/low-code generators (Lovable, Bolt, etc.) were
  used, per the task rules.
- Benchmark scores: Artificial Analysis indices come from the OpenRouter
  response; the curated scores in `prisma/seed.ts` are each labelled with
  their vendor-published source. Models without a sourced score show no
  score rather than an estimate.
