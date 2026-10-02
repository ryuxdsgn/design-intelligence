<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2ea44f" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/status-early__access%20v0.1-1f6feb" alt="Status: early access v0.1">
  <img src="https://img.shields.io/badge/MCP%20tools-9-8957e5" alt="9 MCP tools">
  <img src="https://img.shields.io/badge/rules-RX--C%20%2F%20RX--H%20%2F%20RX--N%20%2F%20RX--L-e36209" alt="ryux-rules">
</p>

# ryux

> UI and flow references from real Indonesian apps, served to AI agents over MCP, with an anti-slop
> gate built in (**ryux-rules**). It's evidence-based: every design decision has to cite a real
> screen instead of a generic pattern.

> **New here?** Start with [GUIDE.md](./GUIDE.md). It walks you through it from scratch: install the
> rules into your agent, then connect it to the reference data.

## What makes it different

- **Evidence-based.** Every result carries a `screen_id`, app name, version, and capture date. A design decision has to point at a real screen, and `delivery_gate` enforces that.
- **Indonesia-first.** QRIS, virtual accounts, WhatsApp OTP, paylater, e-KYC, Rupiah formatting. These are the patterns global libraries skip.
- **Human judgment.** Designer notes (why a flow works, where it falls short) are written by people, not generated. That's the part that matters most.
- **Its own ruleset.** `ryux-rules` (RX-C / RX-H / RX-N / RX-L) is original work, MIT-licensed, with no third-party dependencies.

## What's inside

- **Nine MCP tools** in three groups: research (`search_screens`, `get_flow`, `get_local_pattern`, `compare_apps`, `extract_design_direction`), audit (`audit_ui`, `audit_copy`, `heuristic_eval`, `delivery_gate`), and a design bridge.
- **ryux-rules** is 46 rules across four layers: an anti-slop filter (RX-C), usability and accessibility heuristics (RX-H), applied UX patterns from NNGroup research (RX-N), and Indonesian patterns and copy (RX-L). There's a PASS/FAIL Delivery Gate before you ship.
- **The `ryux-rules` CLI** installs the rules into Claude Code, Cursor, or AGENTS.md in one command. You pick only the concerns you need (ui, copy, a11y, ux, local, code), the way you'd pick skills. You can browse every skill in [`skills/`](./skills).

## See the difference

Each brief below ran headless (`claude -p`) in an empty folder, once without ryux and once with the
ryux skills installed. The screenshots are the agents' real output, not edited by hand. The colored
boxes are annotations added afterwards to point at what changed.

### UI

*"A 1920×1080 landing page for Catat, a cashier and bookkeeping app for Indonesian UMKM."* Both runs
designed in pen.dev through its MCP. The "with" run also had the ryux MCP for reference screens.

<a href="assets/compare/ui/compare.png"><img src="assets/compare/ui/compare.png" alt="Two Catat landing pages designed in pen.dev, stacked. Without ryux: a polished hero with invented stats (48.000+ warung, 210 kota, 4,8 stars on Google Play), an unconfirmed 30-day trial, an unsourced +12% growth tag, amounts written as Rp 2.840.000 with a space, and a stock photo of a stranger presented as the user. With ryux: a ledger card labeled Contoh data whose totals add up to Rp150.000, a QRIS payment screen that shows the shop and Rp45.000 before paying, admin fees left as [REAL DATA], and no invented counts, ratings, or photos" width="100%"></a>

Both look finished, and that is the trap. Without ryux, the polish hides invented numbers, a borrowed
face, and the wrong Rupiah format (RX-C-03, RX-C-04, RX-L-06). With ryux, every number is either
consistent sample data marked as such or an honest placeholder (RX-C-05), and the payment screen
follows Indonesian QRIS practice (RX-L-01, RX-L-04).

### Code

*"A TypeScript module that calculates an order total with shipping, an admin fee, and PPN 11%, and
formats it as Rupiah."*

<a href="assets/compare/code/compare.png"><img src="assets/compare/code/compare.png" alt="Two versions of order-total.ts side by side. Without ryux: doc comments that restate each field, English error messages with no fix for the shop owner, and a formatter that outputs Rp 1.500.000 with a space. With ryux: a comment that says why amounts are integers, Indonesian error messages that say how to fix the input, a formatter that outputs Rp1.250.000, and summary labels like Ongkos kirim and Total bayar" width="100%"></a>

Comments only say why (RX-K-01). Errors name the fix in Indonesian (RX-K-06, RX-N-05). Money comes
out as `Rp1.250.000`, not `Rp 1.250.000` (RX-L-06).

### Copy

*"Tulis pengumuman promo gratis ongkir untuk grup WhatsApp pelanggan toko online saya."*

<a href="assets/compare/chat/compare.png"><img src="assets/compare/chat/compare.png" alt="Two WhatsApp promo announcements side by side. Without ryux: emoji on almost every line, emoji number bullets, ALL CAPS, and three urgency lines including selama persediaan masih ada and sebelum kehabisan. With ryux: one emoji in the greeting, plain lists, an automatic promo with no voucher code, a step to check that shipping shows Rp0 before paying, and a line on what to do if the discount doesn't apply" width="100%"></a>

No emoji bullets or invented scarcity (RX-C-10, RX-N-09). The "with" version adds what a customer
needs: how to check the discount and who to contact if it fails (RX-H-09).

More before/after pairs per concern (a11y, ux, local, review) are in
[`docs/showcase.md`](docs/showcase.md#per-concern-gallery).

## Repo layout (pnpm monorepo)

```
apps/mcp/         MCP server (Cloudflare Workers), 9 tools
apps/web/         ryux.design site (Next.js), landing + waitlist
packages/core/    @ryux/core, shared data and tool logic
packages/cli/     ryux-rules, the CLI that installs the rules into agents
skills/           browsable copies of each ryux-rules skill
docs/             taxonomy.md, design-rules.md
```

Still to come: `packages/pipeline`, which turns captured video into data.

## Quick start

You'll need Node 20+ and pnpm.

```bash
pnpm install
pnpm dev:mcp        # MCP server on http://localhost:8787/mcp
pnpm dev:web        # ryux.design site on http://localhost:3000
pnpm typecheck
```

The MCP endpoint speaks **Streamable HTTP**, so connect through an MCP client (Claude Code, MCP
Inspector) rather than a regular browser.

### Install ryux-rules into your agent

```bash
npx ryux-rules            # wizard: pick your agent and concerns (ui, copy, a11y, ux, local, code)
```

Install only what you need. Each concern becomes its own skill (`ryux-ui`, `ryux-copy`, and so on),
and the core (evidence and honesty) always comes along. There's more detail in
[`packages/cli`](./packages/cli), and the rules themselves live in
[`docs/design-rules.md`](./docs/design-rules.md).

## Docs

| Document | What's in it |
| --- | --- |
| [`docs/taxonomy.md`](./docs/taxonomy.md) | Controlled vocabulary: categories, flows, patterns, components |
| [`docs/design-rules.md`](./docs/design-rules.md) | The ryux design ruleset (RX-C / RX-H / RX-N / RX-L) |
| [`apps/mcp/README.md`](./apps/mcp/README.md) | Running and trying the MCP server |

## Status

**v0.1, early access, free.** The data is still sample data, there's no login yet, and quota lives
in memory. On the way to production: Supabase (`published` data with RLS on), OAuth, ledger-based
quota, and full-text plus pgvector search.

## Security

See [`SECURITY.md`](./SECURITY.md) for how to report a vulnerability. A few things we already do:
OCR text is treated as data and never as instructions, RLS is on from the first migration, and no
secrets live in the repo.

## License

**MIT**, © 2026 ryux.design (see [`LICENSE`](./LICENSE)). Use it, change it, ship it. The code and the
ryux-rules ruleset are covered by this license. The reference data (screens, flows, designer notes)
and the hosted service are separate and not part of this repo.
