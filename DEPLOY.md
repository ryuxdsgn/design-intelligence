# Running your own RYUX instance

This guide sets up your own copy of the RYUX service: the database, the MCP server, and the website.
You do not need any of it to use the RYUX skill. The hosted ryux.design MCP is not live yet (see
[README](./README.md#status)).

Three pieces ship independently: the Supabase database, the MCP server (Cloudflare Workers), and the
website (Vercel). None of them need secrets in the repo. The `screen_id`-backed content only appears
once Supabase has `published` rows; without env, the MCP falls back to the `@ryux/core` sample data.

## Order of operations

1. Create a Supabase project and a Cloudflare zone for your domain.
2. Log in: `supabase login` and `wrangler login`.
3. Push the migrations (section 1). This is a production write; do it on purpose.
4. Set the Worker secrets and deploy (section 2). Read "Before exposing the MCP publicly" first.
5. Set up an editor account and publish your first flows (section 4).

## Prerequisites

- Node 20+ and pnpm, `pnpm install` done.
- Supabase CLI, logged in to the account that owns your project.
- Wrangler (bundled), logged in to Cloudflare.
- Vercel CLI or the Vercel dashboard.

## 1. Supabase (database)

Link the local repo to your project, push the migrations, and seed:

```bash
supabase link --project-ref <your-project-ref>
supabase db push          # applies supabase/migrations/* (production write)
# optional: load seed data
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

RLS is on for every table from the first migration. Anonymous reads only see `published` content;
the `waitlist` table accepts inserts but no public reads.

The next steps need two values from Project Settings > API:

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

To serve it on your own domain, add a route in `apps/mcp/wrangler.jsonc`
(`"routes": [{ "pattern": "<mcp.your-domain>", "custom_domain": true }]`). The endpoint path is `/mcp`
(Streamable HTTP), so connect through an MCP client, not a browser.

Local dev uses `apps/mcp/.dev.vars` (gitignored) with the same two keys pointed at your local
Supabase.

### Before exposing the MCP publicly

The MCP server in this repo is a starter: it has no login, and quotas are kept in memory. Keep the
route off a public domain until it has:

- authentication and authorization per client
- rate limiting and abuse protection
- input size limits and request timeouts
- logging
- cost control for any tool that calls a paid API

## 3. Website (Vercel)

Import the repo in Vercel and set the project root to `apps/web` (framework preset: Next.js). Add two
environment variables (Production and Preview):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

The waitlist route (`/api/waitlist`) uses them server-side. It inserts into `waitlist` with the anon
key and the RLS insert policy. Without them the form returns a clear "not wired up yet" message
instead of pretending to succeed. Deploy from the dashboard or:

```bash
cd apps/web && vercel --prod
```

## 4. RYUX Knowledge pipeline (`pnpm knowledge`)

The pipeline is open source; the reference data it produces is yours and stays out of git. It writes
as an editor account through Supabase Auth and RLS (`is_staff()`). It never uses the service role
key.

**One-time editor setup.** Create the editor user in Supabase Auth, then give it a staff role
(`admin` or `reviewer`) in `public.accounts`.

**Local `.env` at the repo root** (gitignored):

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
RYUX_EDITOR_EMAIL=...
RYUX_EDITOR_PASSWORD=...
ANTHROPIC_API_KEY=...        # optional: AI draft tags and OCR
RYUX_TAG_MODEL=...           # optional
```

**One flow per folder**, outside git (a `knowledge/` folder in the repo is gitignored):

```
knowledge/<app>/<version>/<flow>/flow.yaml   app, category, version, captured_at, flow_type, title
knowledge/<app>/<version>/<flow>/01.png, 02.png, ...
```

**Commands**, each taking the flow folder:

```bash
pnpm knowledge tags              # sync the vocabulary from docs/taxonomy.md
pnpm knowledge capture <folder> <url...> [--width 390]   # web references: screenshots in order
pnpm knowledge ingest  <folder>  # upload to the private bucket, rows as draft
pnpm knowledge draft   <folder>  # AI tags (source: ai) and OCR (untrusted); skipped without a key
pnpm knowledge review  <folder>  # write review.md
pnpm knowledge publish <folder>  # refuses until review.md is complete
```

`draft` also proposes **observations** (what the screen visibly does: layout, hierarchy, components,
interaction, content), labeled observed or inferred and stored as `source: ai`. In `review.md`, tick
the accurate ones, fix their wording, or add your own; unticked ones are removed on publish, and
ticked ones become `source: human`. Observations describe; designer notes judge, and only people
write those. Pattern rows (local and general) are created from `docs/taxonomy.md` by `tags`; fill
in `useful_when` and `risk` in the dashboard. Where a pattern was observed is computed from
published screens, never typed.

Publish refuses until every screen has its personal-data check ticked, every tag is a known key, and
the flow's designer notes (`why_it_works`, `weaknesses`) are written by a person. Unticked tags are
removed, and kept tags become `source: human`.

Images live in a private bucket. Publishing is the gate: once a screen is `published`, its image can
be read through the storage API, and the MCP hands it out as a 15-minute signed URL. Draft images
stay private.

**Local Supabase note.** With Supabase CLI 2.106, the bundled storage image drops the
`(bucket_id, name)` unique index that its own upload query needs, so every upload fails with
`42P10`. Update the CLI, or for local testing only, recreate the index as the storage owner:

```bash
docker exec supabase_db_<project_id> psql -U supabase_admin -d postgres \
  -c 'create unique index if not exists local_test_objects_bucket_name on storage.objects (bucket_id, name);'
```

## Checklist

- [ ] Migrations applied; RLS verified.
- [ ] MCP secrets set; `pnpm deploy:mcp` succeeds; a tool call returns `published` data.
- [ ] The public-exposure list above is done before the MCP route goes on a public domain.
- [ ] Web env vars set; the waitlist form saves a row.
- [ ] Editor account has a staff role; `pnpm knowledge publish` publishes a first flow.
- [ ] `search_screens` returns a signed `image_url` that loads.
