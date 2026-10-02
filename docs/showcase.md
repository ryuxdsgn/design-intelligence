# Before/After Playbook for ryux (showcase)

A guide to creating 3 **before vs after** comparisons for the README: real proof that Ryux
turns "AI-smelling" output into something grounded and natural. Principle: **honest, not a fake mockup**
(RX-AS-03). "Before" = agent output without ryux; "After" = the same agent's output **with**
Ryux + the ryux MCP.

## Setup (one time)

1. Run the local MCP: `pnpm dev:mcp` (reference data at `http://localhost:8787/mcp`).
2. Install the rules in the agent you use: `npx ryux` (choose Claude Code/Cursor + groups: foundation, ux, ui, engineering, quality).
3. Connect the agent to the MCP: `claude mcp add --transport http ryux-local http://localhost:8787/mcp`.
4. Prepare the assets folder: `assets/compare/{ui,code,chat,copy,a11y,ux,local,review,landing}/`.
5. Capture mobile screens at a width of **390px**; for the README UI image use a **1920×1080** frame. Export as PNG, and name the pairs `before` / `after`.

> Fairness tip: "before" is produced in a session/agent **without** Ryux and **without** the MCP; "after" in a session
> **with** both. The brief is exactly the same. Do not hand-edit the results, so the comparison stays honest.

---

## README headline: one image each for UI, Code, Copy (headless runs)

The README "See the difference" section shows one image per area, each pairing a run without ryux
and a run with ryux. Each variant runs headless (`claude -p`) in its own empty folder outside this
repo, so the repo's own `CLAUDE.md` does not leak in:

```bash
# rules on: install the stage skills into the run folder
node packages/cli/dist/index.js install --agent claude --groups foundation,ux,ui,quality
# reference data on: start the local MCP and pass it to the run
pnpm dev:mcp   # then: claude -p "<brief>" --mcp-config mcp.json --strict-mcp-config
```

| Image | Without | With |
| --- | --- | --- |
| `ui/compare.png` | pen.dev MCP only | pen.dev MCP + ryux MCP + all Ryux RX-2.0 skills (`--groups foundation,ux,ui,engineering,quality`); the brief asks for `DESIGN.md` from `search_screens` + `extract_design_direction` first |
| `code/compare.png` | no skills | all Ryux RX-2.0 skills; the agent picks which to load |
| `chat/compare.png` | no skills | all Ryux RX-2.0 skills; the agent picks which to load |

pen.dev's `execute` always targets the open document, so UI runs add a top-level frame named
`Catat landing A`/`B` and export it with `Export([frameId], "png", dir, {scale: 1})`. Code and copy
output is rendered verbatim in an editor-style and a chat-style page. Pairs are composed into one
image, and the colored boxes are annotations layered on top, never edits to the output.

If a run shows a defect (overflow, covered text), rerun it and pick another run. If every run shows
the same weakness, fix the rule or skill that should have prevented it, then rerun. Captions only
claim what the image shows.

---

## Use case 1 · UI: payment method picker screen (QRIS checkout)

**Shows:** RX-UI-05, RX-AS-01, RX-AS-03 (no generic patterns or fake data), RX-IX-09 (transparent QRIS),
RX-A11Y-01, RX-A11Y-02 (contrast & touch targets), RX-PR-04 (`screen_id` evidence).

**Steps:**

1. **Before**: in the agent without ryux, ask:
   > "Build one mobile HTML file (390px wide) for the payment method picker screen of an Indonesian F&B app."
   Save `before.html`, open it in the browser (390px device mode), screenshot → `assets/compare/ui/before.webp`.
2. **After**: in the agent with Ryux + MCP, ask for the same thing plus:
   > "Use the QRIS reference from ryux (`search_screens` query 'qris'), apply the interaction-design and accessibility stages, do not use fake logos/numbers, cite the `screen_id` in a comment."
   Save `after.html`, screenshot → `assets/compare/ui/after.webp`.
3. **Numeric proof (optional but powerful):** run `audit_ui` on both screens (fill in `tap_target_px`,
   `contrast_ratio`, `states`, and so on). Record the result: *before* FAIL, *after* PASS. This can serve as a caption.

**What you usually see:** before has a sparkle logo + generic methods + thin contrast; after
puts QRIS at the very top with a clear amount, touch targets ≥44px, and no invented data.

---

## Use case 2 · Copy: text & formatting (Rupiah, errors, CTA)

**Shows:** RX-CD-02 (Rupiah), RX-CD-01 (natural Bahasa Indonesia), RX-EC-02 (errors offer a way out),
RX-CD-03 (specific CTA, not a cliché).

**Steps:**

1. **Before**: in the agent without ryux, ask it to write 4 pieces of text as-is:
   > "Write for a shopping app: (a) the pay button label, (b) the price display for Rp1250000, (c) the message when payment fails, (d) the CTA for a promo banner."
2. **After**: in the agent with Ryux, ask it to fix all four per the `ryux-content` skill, then run
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

Always fill in a descriptive `alt` (accessibility, RX-A11Y-03). Every image is click-to-enlarge.

## Checklist

- [ ] `assets/compare/ui/before.webp` + `after.webp`
- [ ] `assets/compare/copy/before.webp` + `after.webp`
- [ ] `assets/compare/review/before.webp` + `after.webp`
- [ ] Each pair's caption names the rules (RX-…) and, if available, the `audit_ui`/`audit_copy` result
- [ ] README updated to use images, with descriptive `alt`

## Earlier gallery

Earlier pairs built in pen.dev under RX-1.x, one per former install concern. Rule IDs are shown in RX-2.0 numbering.

**`ryux-copy`** · Indonesian copywriting · natural language, Rupiah, error messages

| Before (no ryux) | After (`ryux-copy`) |
|:--|:--|
| <a href="../assets/compare/copy/copy-before.png"><img src="../assets/compare/copy/copy-before.png" alt="Generic failed-payment screen: Payment Failed, vague Something went wrong, technical error code TXN_0x8004, Amount IDR 1250000, red TRY AGAIN button" width="100%"></a> | <a href="../assets/compare/copy/copy-after.png"><img src="../assets/compare/copy/copy-after.png" alt="ryux failed-payment screen: Pembayaran gagal, clear cause that the BCA Virtual Account balance is short of Rp1.250.000, recovery-steps card, Pilih metode lain button, scr_a3f091 evidence" width="100%"></a> |
| "Payment Failed", a vague message, a technical error code, dollars, a shouting button. | "Pembayaran gagal" with the cause and the fix (RX-CD-04), natural Indonesian (RX-CD-01), Rupiah (RX-CD-02). |

**`ryux-a11y`** · accessibility · contrast, text size, touch targets, focus

| Before (no ryux) | After (`ryux-a11y`) |
|:--|:--|
| <a href="../assets/compare/a11y/a11y-before.png"><img src="../assets/compare/a11y/a11y-before.png" alt="Inaccessible settings screen: low-contrast 11px grey text, placeholder-only labels, small touch targets, tiny toggle, washed-out Simpan button" width="100%"></a> | <a href="../assets/compare/a11y/a11y-after.png"><img src="../assets/compare/a11y/a11y-after.png" alt="ryux settings screen: 16px AA-contrast text, a focused field with an accent ring, large touch targets, clear toggle, high-contrast Simpan perubahan button, scr_a3f091 evidence" width="100%"></a> |
| 11px text at roughly 2:1 contrast, placeholder-only labels, small targets, a washed-out button. | 16px or larger at AA contrast (RX-A11Y-01), targets of 48px and up (RX-A11Y-02), visible focus (RX-A11Y-03). |

**`ryux-ux`** · applied UX patterns (NNGroup) · forms, validation, fewer fields, keypad

| Before (no ryux) | After (`ryux-ux`) |
|:--|:--|
| <a href="../assets/compare/ux/ux-before.png"><img src="../assets/compare/ux/ux-before.png" alt="Poor sign-up form: cramped two columns, placeholder-only labels, every field required including referral, vague error banner, generic DAFTAR button" width="100%"></a> | <a href="../assets/compare/ux/ux-after.png"><img src="../assets/compare/ux/ux-after.png" alt="ryux sign-up form: single column, labels above fields, phone number with a numeric keypad and a valid status, password with an inline error that keeps the input, optional referral code, Lanjut button, scr_a3f091 evidence" width="100%"></a> |
| Two columns, placeholder labels, everything required, a vague error. | One column with labels above the fields (RX-FM-02), inline validation that keeps what you typed (RX-FM-03), fewer fields (RX-FM-04), a numeric keypad (RX-FM-05). |

**`ryux-local`** · Indonesian patterns · QRIS, virtual account, fees, Rupiah

| Before (no ryux) | After (`ryux-local`) |
|:--|:--|
| <a href="../assets/compare/local/local-before.png"><img src="../assets/compare/local/local-before.png" alt="Global card payment: Payment title, $79.00 dollar amount, card form (number, MM/YY, CVV), global methods VISA Mastercard PayPal G Pay, PAY $79.00 button" width="100%"></a> | <a href="../assets/compare/local/local-after.png"><img src="../assets/compare/local/local-after.png" alt="ryux BCA Virtual Account screen: payment countdown, VA number with a Salin (copy) button, transparent admin-fee breakdown, Rp1.250.000 total, numbered m-BCA payment steps, scr_a3f091 evidence" width="100%"></a> |
| A global card form, dollars, foreign methods, no local pattern. | A Virtual Account with a copy button and a payment deadline (RX-IX-10), a transparent admin fee (RX-IX-05), and Rupiah. |

**Bonus: usability review over MCP** (`heuristic_eval`, an audit tool rather than an installed stage)

| Before (shallow critique) | After (`heuristic_eval`) |
|:--|:--|
| <a href="../assets/compare/review/review-before.png"><img src="../assets/compare/review/review-before.png" alt="Shallow AI review: vague bullets like add white space, make it more modern, improve UX, with no evidence" width="100%"></a> | <a href="../assets/compare/review/review-after.png"><img src="../assets/compare/review/review-after.png" alt="ryux heuristic_eval review: an H-01 Visibility major finding and an H-05 Error prevention minor finding, each with a recommendation and screen_id evidence" width="100%"></a> |
| Opinions, no evidence. | Structured findings: the heuristic, a severity from 0 to 4, a recommendation, and `screen_id` evidence. |

**ryux's own landing page (we use ryux on ryux)** · the honest test

_Without ryux._ The same product pitched like generic AI slop: a buzzword headline, a "10,000+" with no source, and a fake "AS SEEN IN" logo wall.

<a href="../assets/compare/landing/landing-before.png"><img src="../assets/compare/landing/landing-before.png" alt="Generic AI landing for ryux: sparkle logo, headline Supercharge your AI agents with beautiful production-ready UI, all-in-one platform subhead, Get Started Free and Book a Demo buttons, fake five-star Trusted by 10,000+ developers worldwide, and an empty AS SEEN IN logo grid" width="100%"></a>

_With `Ryux`._ Designed in pen.dev under its own rules: an editorial layout, one accent, a specific evidence-first headline, and a real `search_screens` result (screen_id, app, version, capture date, designer note) where the slop version put fake logos.

<a href="../assets/compare/landing/landing-after.png"><img src="../assets/compare/landing/landing-after.png" alt="ryux landing designed with Ryux: warm paper background, an MCP + design rules for AI agents kicker, headline Every design decision backed by a real screen, an honest subhead, Join the waitlist and See the difference buttons, an honest early-access trust line, and a search_screens evidence card for Warung Kopi Contoh with screen_id scr_a3f091, version, capture date, and a designer note" width="100%"></a>

Real evidence (`scr_a3f091`, app, version, date) in place of a fake logo wall (RX-AS-02): the "after" shows the product's whole point instead of borrowing credibility. Specific over buzzword (RX-CD-03), one accent over default-everything (RX-UI-04), an honest early-access line over an invented "10,000+" (RX-AS-01).

**Design decisions**

| Before | After |
| --- | --- |
| "Put QRIS at the top because it looks good." | "Put QRIS at the top, since that's what Indonesian F&B apps do for small amounts (`scr_demo_001`)." |

`RX-PR-04` rejects any decision that has no `screen_id` behind it, and `delivery_gate` enforces that.

The UI checks that `audit_ui` and `heuristic_eval` run: touch targets of 44px or more (RX-A11Y-02),
contrast of at least 4.5:1 (RX-A11Y-01), and the full set of states, loading, empty, and error
(RX-EC-01). The screens above are built honestly. They're not faked mockups (RX-AS-03).
