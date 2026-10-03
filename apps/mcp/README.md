# ryux-mcp (local starter)

The earliest version of the RYUX MCP server, running on Cloudflare Workers. The data is still
sample data, there's no login yet, and quotas are kept in memory. The goal is just to see the
shape of the MCP first.

## Contents

| File | Purpose |
| --- | --- |
| `src/index.ts` | Wiring for the MCP server + Durable Object; registers the nine tools from `@ryux/core` and manages per-session quota |
| `wrangler.jsonc` | Worker and Durable Object configuration |

The tool data and logic (`search_screens`, `get_flow`, `compare_apps`, `extract_design_direction`,
`get_local_pattern`, `delivery_gate`, `audit_ui`, `audit_copy`, `heuristic_eval`) live in the `@ryux/core` package
(`packages/core/src`), so other apps can reuse them later.

## Running

```bash
npm install
npm run dev          # server at http://localhost:8787/mcp
```

## Trying it out

**Via MCP Inspector** (a visual interface for calling tools):

```bash
npm run inspect
```

Pick the *Streamable HTTP* transport, enter the URL `http://localhost:8787/mcp`, click Connect,
then open the Tools tab.

**Via Claude Code:**

```bash
claude mcp add --transport http ryux-local http://localhost:8787/mcp
claude
```

Example prompts:

- "Use ryux-local, find a reference for a payment method picker with QRIS"
- "Show the flow flw_demo_checkout from ryux-local"
- "Compare Warung Contoh and Toko Contoh via ryux-local"
- "Summarize the QRIS checkout design direction from ryux-local"
- "Explain the virtual-account pattern from ryux-local"
- "Run delivery_gate for this checkout design decision"
- "Audit this checkout UI with audit_ui (40px touch target, a single pay button)"
- "Audit the copy of the 'BAYAR SEKARANG' button and the checkout title with audit_copy"
- "Run heuristic_eval for this checkout, and include a comparison screen as evidence for each major finding"

## Deploy

```bash
npx wrangler login
npm run deploy
```

## Next steps (per the PRD)

The nine core tools are already in `@ryux/core`. Next, on the way to a production version:

1. Replace `packages/core/src/data.ts` with Supabase queries (`published` only)
2. Add OAuth with `@cloudflare/workers-oauth-provider` and mapping to `user_id`
3. Move the quota (currently in Durable Object memory) into `usage_events` and `credit_ledger`
4. Combined full-text + pgvector search
5. Complete the audit rules (`UI_RULES`/`COPY_RULES`) up to R-01..R-38
