<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-source--available-2ea44f" alt="Source-Available"></a>
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
- **Its own ruleset.** `ryux-rules` (RX-C / RX-H / RX-N / RX-L) is original work, source-available, with no third-party dependencies.

## What's inside

- **Nine MCP tools** in three groups: research (`search_screens`, `get_flow`, `get_local_pattern`, `compare_apps`, `extract_design_direction`), audit (`audit_ui`, `audit_copy`, `heuristic_eval`, `delivery_gate`), and a design bridge.
- **ryux-rules** is 45 rules across four layers: an anti-slop filter (RX-C), usability and accessibility heuristics (RX-H), applied UX patterns from NNGroup research (RX-N), and Indonesian patterns and copy (RX-L). There's a PASS/FAIL Delivery Gate before you ship.
- **The `ryux-rules` CLI** installs the rules into Claude Code, Cursor, or AGENTS.md in one command. You pick only the concerns you need (ui, copy, a11y, ux, local), the way you'd pick skills.

## See the difference

`ryux-rules` installs per **concern** (`ryux-ui`, `ryux-copy`, `ryux-a11y`, `ryux-ux`, `ryux-local`).
Each one has a real before/after below, built in pen.dev from the same brief. The "after" applies
that concern's rules plus ryux data. The reference screens are in Indonesian, on purpose.

**`ryux-ui`** · UI and visual · palette, spacing, consistency, states

| Before (no ryux) | After (`ryux-ui`) |
|:--|:--|
| <a href="assets/compare/ui/ui-before.png"><img src="assets/compare/ui/ui-before.png" alt="Generic payment screen: sparkle logo, 256-BIT badge, made-up user numbers, global methods (Card/PayPal/Apple/Google), dollar pricing, low-contrast text" width="100%"></a> | <a href="assets/compare/ui/ui-after.png"><img src="assets/compare/ui/ui-after.png" alt="ryux checkout screen: order summary, transparent fee breakdown (subtotal, shipping, total Rp1.250.000), QRIS with an under-5-second verification note, Bayar Rp1.250.000 button, trust note, scr_a3f091 evidence" width="100%"></a> |
| Global template, made-up numbers, dollars, thin contrast. | Two or three core colors plus one accent (RX-C-07), consistent spacing (RX-C-08), Rupiah, and `screen_id` evidence. |

**`ryux-copy`** · Indonesian copywriting · natural language, Rupiah, error messages

| Before (no ryux) | After (`ryux-copy`) |
|:--|:--|
| <a href="assets/compare/copy/copy-before.png"><img src="assets/compare/copy/copy-before.png" alt="Generic failed-payment screen: Payment Failed, vague Something went wrong, technical error code TXN_0x8004, Amount IDR 1250000, red TRY AGAIN button" width="100%"></a> | <a href="assets/compare/copy/copy-after.png"><img src="assets/compare/copy/copy-after.png" alt="ryux failed-payment screen: Pembayaran gagal, clear cause that the BCA Virtual Account balance is short of Rp1.250.000, recovery-steps card, Pilih metode lain button, scr_a3f091 evidence" width="100%"></a> |
| "Payment Failed", a vague message, a technical error code, dollars, a shouting button. | "Pembayaran gagal" with the cause and the fix (RX-N-05), natural Indonesian (RX-L-07), Rupiah (RX-L-06). |

**`ryux-a11y`** · accessibility · contrast, text size, touch targets, focus

| Before (no ryux) | After (`ryux-a11y`) |
|:--|:--|
| <a href="assets/compare/a11y/a11y-before.png"><img src="assets/compare/a11y/a11y-before.png" alt="Inaccessible settings screen: low-contrast 11px grey text, placeholder-only labels, small touch targets, tiny toggle, washed-out Simpan button" width="100%"></a> | <a href="assets/compare/a11y/a11y-after.png"><img src="assets/compare/a11y/a11y-after.png" alt="ryux settings screen: 16px AA-contrast text, a focused field with an accent ring, large touch targets, clear toggle, high-contrast Simpan perubahan button, scr_a3f091 evidence" width="100%"></a> |
| 11px text at roughly 2:1 contrast, placeholder-only labels, small targets, a washed-out button. | 16px or larger at AA contrast (RX-H-11), targets of 48px and up (RX-H-12), visible focus (RX-H-13). |

**`ryux-ux`** · applied UX patterns (NNGroup) · forms, validation, fewer fields, keypad

| Before (no ryux) | After (`ryux-ux`) |
|:--|:--|
| <a href="assets/compare/ux/ux-before.png"><img src="assets/compare/ux/ux-before.png" alt="Poor sign-up form: cramped two columns, placeholder-only labels, every field required including referral, vague error banner, generic DAFTAR button" width="100%"></a> | <a href="assets/compare/ux/ux-after.png"><img src="assets/compare/ux/ux-after.png" alt="ryux sign-up form: single column, labels above fields, phone number with a numeric keypad and a valid status, password with an inline error that keeps the input, optional referral code, Lanjut button, scr_a3f091 evidence" width="100%"></a> |
| Two columns, placeholder labels, everything required, a vague error. | One column with labels above the fields (RX-N-02), inline validation that keeps what you typed (RX-N-03), fewer fields (RX-N-04), a numeric keypad (RX-N-10). |

**`ryux-local`** · Indonesian patterns · QRIS, virtual account, fees, Rupiah

| Before (no ryux) | After (`ryux-local`) |
|:--|:--|
| <a href="assets/compare/local/local-before.png"><img src="assets/compare/local/local-before.png" alt="Global card payment: Payment title, $79.00 dollar amount, card form (number, MM/YY, CVV), global methods VISA Mastercard PayPal G Pay, PAY $79.00 button" width="100%"></a> | <a href="assets/compare/local/local-after.png"><img src="assets/compare/local/local-after.png" alt="ryux BCA Virtual Account screen: payment countdown, VA number with a Salin (copy) button, transparent admin-fee breakdown, Rp1.250.000 total, numbered m-BCA payment steps, scr_a3f091 evidence" width="100%"></a> |
| A global card form, dollars, foreign methods, no local pattern. | A Virtual Account with a copy button and a payment deadline (RX-L-02), a transparent admin fee (RX-L-04), and Rupiah. |

**Bonus: usability review over MCP** (`heuristic_eval`, an audit tool rather than an install concern)

| Before (shallow critique) | After (`heuristic_eval`) |
|:--|:--|
| <a href="assets/compare/review/review-before.png"><img src="assets/compare/review/review-before.png" alt="Shallow AI review: vague bullets like add white space, make it more modern, improve UX, with no evidence" width="100%"></a> | <a href="assets/compare/review/review-after.png"><img src="assets/compare/review/review-after.png" alt="ryux heuristic_eval review: an H-01 Visibility major finding and an H-05 Error prevention minor finding, each with a recommendation and screen_id evidence" width="100%"></a> |
| Opinions, no evidence. | Structured findings: the heuristic, a severity from 0 to 4, a recommendation, and `screen_id` evidence. |

**Landing page: the hero section** · headline, call to action, social proof

_No ryux._ A generic "AI-flavored" hero: buzzwords, invented stats, fake logos.

<a href="assets/compare/hero/hero-before.png"><img src="assets/compare/hero/hero-before.png" alt="Generic AI landing hero: Nexlify sparkle logo, headline Empower Your Business with AI-Powered Solutions, buzzword subhead about an all-in-one platform, Get Started Free and Book a Demo buttons, fake five-star Trusted by 10,000+ teams worldwide, empty AS SEEN IN logo grid" width="100%"></a>

_With `ryux-rules`._ Specific, honest, Indonesian. A brand color that means something (green for profit), one clear call to action, and local patterns (WhatsApp login, transfer to BCA).

<a href="assets/compare/hero/hero-after.png"><img src="assets/compare/hero/hero-after.png" alt="ryux landing hero on a warm off-white background: Catat kasir app with a green brand color, a KASIR & PEMBUKUAN UMKM kicker, headline Tutup kasir untung ketahuan, subhead about recording every transaction from your phone without Excel, Coba gratis and Lihat 1 menit cara kerjanya buttons, a WhatsApp-login line offering 50 free transactions, and an end-of-day preview for Warung Bu Sri showing Untung hari ini Rp680.000 with transfer to BCA, marked Contoh" width="100%"></a>

The slop tells: buzzwords that say nothing (RX-C-06), a "10,000+" with no source (RX-C-03), fake logos (RX-C-04), and the default-template indigo. The ryux version leads with a specific benefit in local idiom, picks a brand color that means something, makes a real offer instead of inventing a number, uses local patterns (WhatsApp, BCA), and marks the preview `Contoh` (RX-C-05).

**Design decisions**

| Before | After |
| --- | --- |
| "Put QRIS at the top because it looks good." | "Put QRIS at the top, since that's what Indonesian F&B apps do for small amounts (`scr_demo_001`)." |

`RX-C-01` rejects any decision that has no `screen_id` behind it, and `delivery_gate` enforces that.

The UI checks that `audit_ui` and `heuristic_eval` run: touch targets of 44px or more (RX-H-12),
contrast of at least 4.5:1 (RX-H-11), and the full set of states, loading, empty, and error
(RX-H-14). The screens above are built honestly. They're not faked mockups (RX-C-05).

## Repo layout (pnpm monorepo)

```
apps/mcp/         MCP server (Cloudflare Workers), 9 tools
apps/web/         ryux.design site (Next.js), landing + waitlist
packages/core/    @ryux/core, shared data and tool logic
packages/cli/     ryux-rules, the CLI that installs the rules into agents
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
npx ryux-rules            # wizard: pick your agent and concerns (ui, copy, a11y, ux, local)
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

**Source-available**, © 2026 ryux.design (see [`LICENSE`](./LICENSE)). Use it and change it for your
own work. You can't resell it or re-release it as a competing product. It isn't a derivative of any
third-party project, and it isn't affiliated with one.
