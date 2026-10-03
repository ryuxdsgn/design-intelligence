# Deploying ryux

Three pieces ship independently: the Supabase database, the MCP server (Cloudflare Workers), and the
website (Vercel). None of them need secrets in the repo. The `screen_id`-backed content only appears
once Supabase has `published` rows; without env, the MCP falls back to the `@ryux/core` sample data.

## Order of operations (nothing is deployed until step 1 is done)

1. Register `ryux.design` and add the zone to Cloudflare.
2. Restore the paused Supabase project `ryuxdesign` from the Supabase dashboard.
3. Log in: `supabase login` (the account that owns the project) and `wrangler login`.
4. Push the migrations (section 1). This is a production write; do it on purpose.
5. Set the Worker secrets, uncomment the `mcp.ryux.design` route in `apps/mcp/wrangler.jsonc`,
   and deploy (section 2).
6. Set up the Knowledge editor and publish the first flows (section 4).

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

## 4. RYUX Knowledge pipeline (`pnpm knowledge`)

The pipeline writes as an editor account through Supabase Auth and RLS (`is_staff()`). It never uses
the service role key.

**One-time editor setup.** Sign up the editor account once (dashboard > Authentication > Add user),
then give it a staff role in the SQL editor:

```sql
insert into public.accounts (user_id, role)
select id, 'admin' from auth.users where email = '<editor email>'
on conflict (user_id) do update set role = 'admin';
```

**Local `.env` at the repo root** (gitignored):

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
RYUX_EDITOR_EMAIL=...
RYUX_EDITOR_PASSWORD=...
ANTHROPIC_API_KEY=...        # optional: AI draft tags and OCR
RYUX_TAG_MODEL=claude-opus-5-5   # optional
```

**One flow per folder**, outside git (a `knowledge/` folder in the repo is gitignored):

```
knowledge/<app>/<version>/<flow>/flow.yaml   app, category, version, captured_at, flow_type, title
knowledge/<app>/<version>/<flow>/01.png, 02.png, ...
```

**Commands**, each taking the flow folder:

```bash
pnpm knowledge tags              # sync the vocabulary from docs/taxonomy.md
pnpm knowledge ingest  <folder>  # upload to the private bucket, rows as draft
pnpm knowledge draft   <folder>  # AI tags (source: ai) and OCR (untrusted); skipped without a key
pnpm knowledge review  <folder>  # write review.md
pnpm knowledge publish <folder>  # refuses until review.md is complete
```

Publish refuses until every screen has its personal-data check ticked, every tag is a known key, and
the flow's designer notes (`why_it_works`, `weaknesses`) are written by a person. Unticked tags are
removed, and kept tags become `source: human`. Images stay private: the MCP serves them as 15-minute
signed URLs, and only for `published` screens.

**Local Supabase note.** With Supabase CLI 2.106, the bundled storage image drops the
`(bucket_id, name)` unique index that its own upload query needs, so every upload fails with
`42P10`. Update the CLI, or for local testing only, recreate the index as the storage owner:

```bash
docker exec supabase_db_ryux psql -U supabase_admin -d postgres \
  -c 'create unique index if not exists local_test_objects_bucket_name on storage.objects (bucket_id, name);'
```

## DNS

- `ryux.design` -> the Vercel project.
- `mcp.ryux.design` -> the Cloudflare Worker route.

## Checklist

- [ ] Migrations applied to the cloud project; RLS verified.
- [ ] MCP secrets set; `pnpm deploy:mcp` succeeds; a tool call returns `published` data.
- [ ] Web env vars set; the waitlist form saves a row.
- [ ] Both domains resolve.
- [ ] Editor account has a staff role; `pnpm knowledge publish` publishes a first flow.
- [ ] `search_screens` on `mcp.ryux.design` returns a signed `image_url` that loads.
