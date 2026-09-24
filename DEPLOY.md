# Deploying ryux

Three pieces ship independently: the Supabase database, the MCP server (Cloudflare Workers), and the
website (Vercel). None of them need secrets in the repo. The `screen_id`-backed content only appears
once Supabase has `published` rows; without env, the MCP falls back to the `@ryux/core` sample data.

## Prerequisites

- Node 20+ and pnpm, `pnpm install` done.
- Supabase CLI, logged in to the account that owns the cloud project.
- Wrangler (bundled), logged in to Cloudflare.
- Vercel CLI or the Vercel dashboard.

## 1. Supabase (database)

Link the local repo to the cloud project, push the migrations, and seed:

```bash
supabase link --project-ref <your-project-ref>
supabase db push          # applies supabase/migrations/* (production write)
# optional: load seed data
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

RLS is on for every table from the first migration. Public/anon reads only see `published` content;
the `waitlist` table accepts inserts but no public reads.

Grab two values from Project Settings > API for the next steps:

- `SUPABASE_URL` (the project URL)
- `SUPABASE_ANON_KEY` (the anon/publishable key, safe to expose)

## 2. MCP server (Cloudflare Workers)

The Worker reads `SUPABASE_URL` and `SUPABASE_ANON_KEY` from its environment. Set them as secrets,
then deploy:

```bash
cd apps/mcp
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
cd ../.. && pnpm deploy:mcp
```

Local dev uses `apps/mcp/.dev.vars` (gitignored) with the same two keys pointed at your local
Supabase. The public endpoint is `https://mcp.ryux.design/mcp` (Streamable HTTP), so connect through
an MCP client, not a browser.

## 3. Website (Vercel)

Import the repo in Vercel and set the project root to `apps/web` (framework preset: Next.js). Add two
environment variables (Production and Preview):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

These are used server-side by the waitlist route (`/api/waitlist`), which inserts into `waitlist`
via the anon key + the RLS insert policy. Without them the form returns a clear "not wired up yet"
message instead of pretending to succeed. Deploy from the dashboard or:

```bash
cd apps/web && vercel --prod
```

## DNS

- `ryux.design` -> the Vercel project.
- `mcp.ryux.design` -> the Cloudflare Worker route.

## Checklist

- [ ] Migrations applied to the cloud project; RLS verified.
- [ ] MCP secrets set; `pnpm deploy:mcp` succeeds; a tool call returns `published` data.
- [ ] Web env vars set; the waitlist form saves a row.
- [ ] Both domains resolve.
