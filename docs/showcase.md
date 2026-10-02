# Before/After Playbook for ryux (showcase)

A guide to creating 3 **before vs after** comparisons for the README: real proof that ryux-rules
turns "AI-smelling" output into something grounded and natural. Principle: **honest, not a fake mockup**
(RX-C-05). "Before" = agent output without ryux; "After" = the same agent's output **with**
ryux-rules + the ryux MCP.

## Setup (one time)

1. Run the local MCP: `pnpm dev:mcp` (reference data at `http://localhost:8787/mcp`).
2. Install the rules in the agent you use: `npx ryux-rules` (choose Claude Code/Cursor + concern: ui, copy, a11y, ux, local).
3. Connect the agent to the MCP: `claude mcp add --transport http ryux-local http://localhost:8787/mcp`.
4. Prepare the assets folder: `assets/compare/{ui,code,chat,copy,a11y,ux,local,review,landing}/`.
5. Capture mobile screens at a width of **390px**; for the README UI matrix use a **1920×1080** desktop viewport. Export as PNG, and name them `before` / `after` (or `without` / `rules` / `reference` / `both` for the matrix).

> Fairness tip: "before" is produced in a session/agent **without** ryux-rules and **without** the MCP; "after" in a session
> **with** both. The brief is exactly the same. Do not hand-edit the results, so the comparison stays honest.

---

## README headline: UI matrix, Code, Copy (headless runs)

The top of the README "See the difference" section is built from headless runs, so nothing is
hand-made. Each variant runs in its own empty folder, outside this repo, so the repo's own
`CLAUDE.md` does not leak in:

```bash
# rules on: install the concern skills into the run folder
node packages/cli/dist/index.js install --agent claude --concerns ui,copy,a11y,ux,local
# reference data on: start the local MCP and pass it to the run
pnpm dev:mcp   # then: claude -p "<brief>" --mcp-config mcp.json --strict-mcp-config
# rules and data off: claude -p "<brief>" --strict-mcp-config
```

| Image | Setup |
| --- | --- |
| `ui/without.png` | no skills, no MCP |
| `ui/rules.png` | `ryux-rules` skills, no MCP |
| `ui/reference.png` | MCP only; the brief asks the agent to write `DESIGN.md` from `search_screens` + `extract_design_direction` first |
| `ui/both.png` | skills + MCP, same brief as `reference` |
| `code/{before,after}.png` | no skills / `ryux-code` + `ryux-copy`; the `.ts` output rendered in an editor-style page |
| `chat/{before,after}.png` | no skills / `ryux-copy` + `ryux-local`; the text output rendered in a chat-style page |

If a run shows a defect (for example, overflow), rerun it and pick another run. Never hand-edit the
output. Captions only claim what the image shows.

---

## Use case 1 · UI: payment method picker screen (QRIS checkout)

**Shows:** RX-C-02/03/05 (no generic patterns or fake data), RX-L-01 (transparent QRIS),
RX-H-11/12 (contrast & touch targets), RX-C-01 (`screen_id` evidence).

**Steps:**

1. **Before**: in the agent without ryux, ask:
   > "Build one mobile HTML file (390px wide) for the payment method picker screen of an Indonesian F&B app."
   Save `before.html`, open it in the browser (390px device mode), screenshot → `assets/compare/ui/before.webp`.
2. **After**: in the agent with ryux-rules + MCP, ask for the same thing plus:
   > "Use the QRIS reference from ryux (`search_screens` query 'qris'), apply RX-L and RX-H, do not use fake logos/numbers, cite the `screen_id` in a comment."
   Save `after.html`, screenshot → `assets/compare/ui/after.webp`.
3. **Numeric proof (optional but powerful):** run `audit_ui` on both screens (fill in `tap_target_px`,
   `contrast_ratio`, `states`, and so on). Record the result: *before* FAIL, *after* PASS. This can serve as a caption.

**What you usually see:** before has a sparkle logo + generic methods + thin contrast; after
puts QRIS at the very top with a clear amount, touch targets ≥44px, and no invented data.

---

## Use case 2 · Copy: text & formatting (Rupiah, errors, CTA)

**Shows:** RX-L-06 (Rupiah), RX-L-07 (natural Bahasa Indonesia), RX-H-09 (errors offer a way out),
RX-C-06 (specific CTA, not a cliché).

**Steps:**

1. **Before**: in the agent without ryux, ask it to write 4 pieces of text as-is:
   > "Write for a shopping app: (a) the pay button label, (b) the price display for Rp1250000, (c) the message when payment fails, (d) the CTA for a promo banner."
2. **After**: in the agent with ryux-rules, ask it to fix all four per RX-L/RX-H, then run
   `audit_copy` to prove it (before has findings, after is clean).
3. Paste both sets onto a single simple card (or screenshot the cleaned-up output directly),
   screenshot → `assets/compare/copy/before.webp` & `after.webp`.

**Target:** `Rp 1250000` → `Rp1.250.000`; "Terjadi kesalahan." → "Pembayaran gagal. Cek koneksi lalu
coba lagi."; "BAYAR SEKARANG" → "Bayar sekarang"; "Pelajari selengkapnya" → "Lihat contoh checkout QRIS".

---

## Use case 3 · Review: shallow critique vs grounded `heuristic_eval`

**Shows:** the `ryux-critique` skill + the `heuristic_eval` tool + mandatory `screen_id` evidence.

**Steps:**

1. Take one screen to review (it can be `before.html` from use case 1, or a screenshot of a real app).
2. **Before**: in the agent without ryux, ask: "Review this screen." You usually get a shallow critique
   ("add white space", "make it more modern"). Screenshot → `assets/compare/review/before.webp`.
3. **After**: in the agent with the `ryux-critique` skill, ask for a structured review. The agent will
   call `heuristic_eval`, which returns formatted findings: heuristic, severity 0-4, location, recommendation, and
   a comparison `screen_id`. Clean up the output (JSON or a table), screenshot → `assets/compare/review/after.webp`.

**Key contrast:** before = opinion with no evidence; after = prioritized findings with real app examples.

---

## Putting it in the README

Replace/complete the text table in the **"See the difference"** section with images (a pattern like other repos use):

```md
| Before | After |
|:--|:--|
| <a href="assets/compare/ui/before.webp"><img src="assets/compare/ui/before.webp" width="100%"></a> | <a href="assets/compare/ui/after.webp"><img src="assets/compare/ui/after.webp" width="100%"></a> |
```

Always fill in a descriptive `alt` (accessibility, RX-H-13). Every image is click-to-enlarge.

## Checklist

- [ ] `assets/compare/ui/before.webp` + `after.webp`
- [ ] `assets/compare/copy/before.webp` + `after.webp`
- [ ] `assets/compare/review/before.webp` + `after.webp`
- [ ] Each pair's caption names the rules (RX-…) and, if available, the `audit_ui`/`audit_copy` result
- [ ] README updated to use images, with descriptive `alt`
