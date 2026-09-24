# ryux-rules: ryux Design Rules

> **© 2026 ryux (Redho Yurizal). License: MIT.** Original ryux.design ruleset.
> Written from scratch based on public standards and methods: **Nielsen's 10 usability heuristics
> (Nielsen, 1994)** and **Nielsen Norman Group UX research** (nngroup.com), **WCAG 2.2**,
> **Apple Human Interface Guidelines**, and **Material Design**.
> References to standards are factual; all explanations, examples, and numbering are written by us.
> **Not a derivative of any third-party licensed text** and not affiliated with NN/g or anyone else.
>
> **Last updated:** 2026-09-24 · **Version:** RX-1.2

ryux's quality gate for UI and copy. Three things make it distinctly ryux: **evidence-based**
(referencing real screens), **Indonesia first**, and **human judgment** for designer notes.

## Four layers

| Layer | Contents | Role |
| --- | --- | --- |
| **RX-C** | Anti-slop filter: generic UI patterns, bland copy, dishonest content | Filters out "AI-smelling" output |
| **RX-H** | 10 usability heuristics + accessibility | Baseline for usability assessment |
| **RX-N** | Applied UX guidelines (NNGroup research): forms, errors, checkout, trust, mobile, response time | Actionable usability depth |
| **RX-L** | Indonesian patterns and copy | Local relevance |

## How to use

- Each rule follows the format: **id · title**, then `category`, `level`, `avoid`, `prefer`, `how to check`, `evidence`.
- **Level [Required]** = Hard Gate, cannot be violated. **[Recommended]** = may only be violated with a written reason.
- Findings from `heuristic_eval` use a **severity scale of 0-4** (common convention): `0` not a problem · `1` cosmetic · `2` minor · `3` major · `4` catastrophic.
- Every major finding (severity ≥ 3) **must** carry at least one comparison `screen_id` as evidence.

---

## Layer RX-C: Anti-slop filter

- **RX-C-01 · Evidence required**
  - category: foundation · level: **[Required]**
  - avoid: design decisions with no reference to a real screen
  - prefer: every decision references ≥1 known `screen_id`
  - how to check: `delivery_gate` (RX-01) · evidence: `scr_...`

- **RX-C-02 · No generic UI patterns**
  - category: visual · level: **[Required]**
  - avoid: bland template layouts (hero + 3 cards + footer) with no contextual reason
  - prefer: composition that follows the content and the user's task, not a mold
  - how to check: manual review + screen comparison · evidence: `scr_...`

- **RX-C-03 · Honest content: numbers**
  - category: content · level: **[Required]**
  - avoid: statistics or counts without a real source
  - prefer: if there is no data, do not show any numbers at all
  - how to check: manual review · evidence: data source

- **RX-C-04 · Honest content: identity**
  - category: content · level: **[Required]**
  - avoid: made-up testimonials, names, photos, or job titles
  - prefer: verifiable social proof, or drop the section
  - how to check: manual review · evidence: source

- **RX-C-05 · Honest placeholders**
  - category: content · level: **[Required]**
  - avoid: temporary content disguised as final
  - prefer: clearly mark `[REAL DATA]`, `[LOGO]`, or initial avatars
  - how to check: `audit_copy` (C-01) · evidence: none

- **RX-C-06 · No bland copy**
  - category: copy · level: **[Recommended]**
  - avoid: empty clichés ("seamless", "revolutionary", "empower") and generic CTAs ("Learn more")
  - prefer: copy that is specific about the action and the real benefit
  - how to check: `audit_copy` + review · evidence: `scr_...`

- **RX-C-07 · Limited color palette**
  - category: visual · level: **[Recommended]**
  - avoid: colors scattered around without a system
  - prefer: 2-3 core colors + 1 accent; the accent only for actions/emphasis
  - how to check: manual review · evidence: `scr_...`

- **RX-C-08 · Consistent spacing & typography scale**
  - category: visual · level: **[Recommended]**
  - avoid: random spacing and text sizes
  - prefer: a fixed scale (e.g. multiples of 4/8) and a clear type hierarchy
  - how to check: manual review · evidence: `scr_...`

- **RX-C-09 · Human-written designer notes**
  - category: foundation · level: **[Required]**
  - avoid: AI inventing the "why it works / weaknesses" assessment
  - prefer: AI summarizes; the assessment is written by a human
  - how to check: manual review · evidence: none

---

## Layer RX-H: Usability heuristics & accessibility

Based on Nielsen's 10 usability heuristics (Nielsen, 1994); the explanations are written for the
context of Indonesian mobile apps. Used by `heuristic_eval` with severity 0-4.

- **RX-H-01 · Visibility of system status**
  - category: heuristic/feedback · level: **[Required]**
  - avoid: a process running with no indicator (e.g. payment verification going silent)
  - prefer: clear status + a time estimate for any process > 1 second
  - how to check: `heuristic_eval` H-01 · evidence: `scr_...`

- **RX-H-02 · Match with the real world**
  - category: heuristic/language · level: **[Recommended]**
  - avoid: technical/system terms that are foreign to the user
  - prefer: language and ordering that match the habits of Indonesian users
  - how to check: `heuristic_eval` H-02 · evidence: `scr_...`

- **RX-H-03 · User control & freedom**
  - category: heuristic/navigation · level: **[Required]**
  - avoid: traps with no way out (cannot cancel/go back)
  - prefer: provide cancel, undo, and a clear exit
  - how to check: `heuristic_eval` H-03 · evidence: `scr_...`

- **RX-H-04 · Consistency & standards**
  - category: heuristic/visual · level: **[Required]**
  - avoid: similar components that look/behave differently across screens
  - prefer: follow platform conventions (HIG/Material) and internal patterns
  - how to check: `heuristic_eval` H-04 · evidence: `scr_...`

- **RX-H-05 · Error prevention**
  - category: heuristic/interaction · level: **[Required]**
  - avoid: destructive actions without confirmation; error-prone input with no safeguard
  - prefer: confirmation for irreversible actions; validation before sending
  - how to check: `heuristic_eval` H-05 · evidence: `scr_...`

- **RX-H-06 · Recognition, not recall**
  - category: heuristic/cognitive · level: **[Recommended]**
  - avoid: forcing the user to remember information from a previous screen
  - prefer: show the options and context; reduce memory load
  - how to check: `heuristic_eval` H-06 · evidence: `scr_...`

- **RX-H-07 · Flexible & efficient**
  - category: heuristic/efficiency · level: **[Recommended]**
  - avoid: a single rigid path for all users
  - prefer: shortcuts for expert users (e.g. saving a payment method)
  - how to check: `heuristic_eval` H-07 · evidence: `scr_...`

- **RX-H-08 · Aesthetic & minimalist**
  - category: heuristic/visual · level: **[Recommended]**
  - avoid: elements/decoration that compete with the important information
  - prefer: every element has a reason; prioritize the relevant information
  - how to check: `heuristic_eval` H-08 · evidence: `scr_...`

- **RX-H-09 · Recovery from errors**
  - category: heuristic/error · level: **[Required]**
  - avoid: vague error messages with no next step ("An error occurred")
  - prefer: clear language, state the cause, offer a concrete way out
  - how to check: `heuristic_eval` H-09 + `audit_copy` (C-04) · evidence: `scr_...`

- **RX-H-10 · Help & documentation**
  - category: heuristic/help · level: **[Recommended]**
  - avoid: complex features with no guidance when it is needed
  - prefer: short contextual help at the point of use
  - how to check: `heuristic_eval` H-10 · evidence: `scr_...`

- **RX-H-11 · Accessible contrast (WCAG AA)**
  - category: accessibility · level: **[Required]**
  - avoid: text < 4.5:1 (normal) or < 3:1 (large ≥18px/bold ≥14px) against the background
  - prefer: test across all text areas; avoid thin text on light backgrounds/gradients
  - how to check: `audit_ui` (R-03) / contrast ratio · evidence: `scr_...`

- **RX-H-12 · Text size & touch targets**
  - category: accessibility · level: **[Required]**
  - avoid: body text < 12px; touch targets < 44×44px
  - prefer: body 14-16px; enough spacing between targets
  - how to check: `audit_ui` (R-01, R-02) · evidence: `scr_...`

- **RX-H-13 · Focus & keyboard**
  - category: accessibility · level: **[Recommended]**
  - avoid: removing the focus indicator; a jumbled focus order
  - prefer: visible focus, reachable elements, a logical order
  - how to check: manual review · evidence: `scr_...`

- **RX-H-14 · Complete states & healthy mobile**
  - category: accessibility/mobile · level: **[Required]**
  - avoid: only the happy path (no loading/empty/error); horizontal overflow; ignoring safe areas
  - prefer: design loading/empty/error/success; respect the notch & thumb reach
  - how to check: `audit_ui` (R-05) + review · evidence: `scr_...`

---

## Layer RX-N: Applied UX guidelines (NNGroup research)

A distillation of public Nielsen Norman Group research into concrete rules, rewritten for the
context of Indonesian mobile. Reference: **Nielsen Norman Group** (nngroup.com); the text, examples, and numbering belong to ryux.

- **RX-N-01 · Feedback matching response-time limits**
  - category: response-time · level: **[Required]**
  - avoid: actions with no feedback; a process > 1 second with no indicator; > 10 seconds with no progress + estimate
  - prefer: < 0.1 sec feels instant; < 1 sec keeps the flow; > 1 sec show loading; > 10 sec progress + estimate
  - how to check: `heuristic_eval` (H-01) · evidence: `scr_...` · basis: Nielsen's response-time limits (0.1 / 1 / 10 seconds)

- **RX-N-02 · Single-column form, label above the field**
  - category: form · level: **[Recommended]**
  - avoid: a multi-column form that breaks the flow; labels only inside the field (which disappear while typing)
  - prefer: single column, label visible above the field, logical order
  - how to check: review + screen comparison · evidence: `scr_...`

- **RX-N-03 · Inline validation & preserve input**
  - category: form · level: **[Required]**
  - avoid: clearing already-filled data on error; validating only after a full submit
  - prefer: validate near the field when relevant; preserve all input on failure
  - how to check: review · evidence: `scr_...`

- **RX-N-04 · Minimize fields & input effort**
  - category: form · level: **[Recommended]**
  - avoid: asking for unnecessary data; marking every field required without reason
  - prefer: minimal fields; mark required/optional clearly; sensible defaults
  - how to check: review · evidence: `scr_...`

- **RX-N-05 · Error messages: problem + solution, near the location**
  - category: error · level: **[Required]**
  - avoid: vague/technical messages; blaming the user; errors far from their source
  - prefer: clear language, state what is wrong + the fix, place it near the field/action
  - how to check: `audit_copy` (C-04) + `heuristic_eval` (H-09) · evidence: `scr_...`

- **RX-N-06 · Transparent total cost from the start**
  - category: checkout · level: **[Required]**
  - avoid: costs (shipping, admin, tax) appearing suddenly at the final step
  - prefer: show the total and the breakdown before the user commits
  - how to check: review · evidence: `scr_...` · basis: NNGroup checkout research (unexpected costs = top cause of abandonment)

- **RX-N-07 · Order summary + progress indicator**
  - category: checkout · level: **[Recommended]**
  - avoid: checkout with no reviewable summary; a stepped flow with no "which step am I on"
  - prefer: a visible order summary; a progress indicator for stepped flows
  - how to check: review · evidence: `scr_...`

- **RX-N-08 · Minimal sign-in friction (guest / fast)**
  - category: checkout · level: **[Recommended]**
  - avoid: forcing account creation before the user can transact
  - prefer: support a guest path or fast login; save progress
  - how to check: review · evidence: `scr_...`

- **RX-N-09 · Honest trust, no fake urgency**
  - category: trust · level: **[Required]**
  - avoid: fake countdowns/scarcity; made-up testimonials or numbers; misleading security badges
  - prefer: real, verifiable trust signals; clear contact/support
  - how to check: review · evidence: `scr_...` · basis: NNGroup web credibility research

- **RX-N-10 · The right mobile input**
  - category: mobile · level: **[Recommended]**
  - avoid: a text keyboard for numeric input; forcing lots of typing; small targets crowded together
  - prefer: a keyboard matching the type (numeric for amounts/OTP), autofill, quick choices
  - how to check: review · evidence: `scr_...`

- **RX-N-11 · Prevent errors: confirmation & undo**
  - category: interaction · level: **[Required]**
  - avoid: irreversible actions (delete, pay) without confirmation or undo
  - prefer: a brief confirmation for risky actions; provide undo where possible
  - how to check: `heuristic_eval` (H-05) · evidence: `scr_...`

- **RX-N-12 · Wayfinding: "where am I", always an exit**
  - category: navigation · level: **[Recommended]**
  - avoid: screens with no title/context; dead ends with no back or cancel
  - prefer: a clear title, a location trail, back/cancel buttons always available
  - how to check: `heuristic_eval` (H-03) · evidence: `scr_...`

---

## Layer RX-L: Indonesian patterns & copy

- **RX-L-01 · Transparent QRIS**
  - category: payment · level: **[Required]**
  - avoid: hiding the amount or merchant name before confirmation
  - prefer: show the amount + merchant clearly, with a firm confirmation button
  - how to check: review + a real QRIS screen · evidence: `scr_...`

- **RX-L-02 · Complete virtual account**
  - category: payment · level: **[Required]**
  - avoid: a VA number with no copy button or no time limit
  - prefer: a copy button, a payment deadline, per-bank guidance
  - how to check: review + a VA screen · evidence: `scr_...`

- **RX-L-03 · Flexible OTP**
  - category: authentication · level: **[Recommended]**
  - avoid: a single channel + a punishing countdown
  - prefer: a choice of SMS/WhatsApp; reasonable resend (ideally ≤ 30 sec)
  - how to check: review + an OTP screen · evidence: `scr_...`

- **RX-L-04 · Costs up front**
  - category: payment · level: **[Required]**
  - avoid: admin/shipping/tax costs appearing suddenly at the final step
  - prefer: all costs visible before the user commits
  - how to check: review · evidence: `scr_...`

- **RX-L-05 · Indonesian-style addresses**
  - category: form · level: **[Recommended]**
  - avoid: only a map pin with no details
  - prefer: support landmarks, block/RT-RW, house color, courier notes
  - how to check: review + an address screen · evidence: `scr_...`

- **RX-L-06 · Rupiah format**
  - category: copy · level: **[Required]**
  - avoid: inconsistent money formatting or a missing prefix
  - prefer: `Rp` + thousands separators (`Rp1.250.000`), no decimals unless needed
  - how to check: `audit_copy` + review · evidence: `scr_...`

- **RX-L-07 · Natural Indonesian**
  - category: copy · level: **[Required]**
  - avoid: stiff translations from English; unnecessary technical terms
  - prefer: language the way Indonesians actually speak
  - how to check: `audit_copy` + review · evidence: `scr_...`

- **RX-L-08 · Indonesian context first**
  - category: foundation · level: **[Required]**
  - avoid: copying foreign patterns without checking local relevance
  - prefer: references from real Indonesian apps
  - how to check: `search_screens` + review · evidence: `scr_...`

- **RX-L-09 · Transparent paylater & installments**
  - category: payment · level: **[Recommended]**
  - avoid: showing installments without the limit, tenor, or a simulation
  - prefer: show the limit, tenor options, and total cost clearly
  - how to check: review + a paylater screen · evidence: `scr_...`

- **RX-L-10 · e-KYC / ID photo**
  - category: verification · level: **[Recommended]**
  - avoid: asking for an ID/selfie photo with no guidance or reason
  - prefer: framing guidance, an explanation of why the data is requested
  - how to check: review + an e-KYC screen · evidence: `scr_...`

---

## ryux Delivery Gate

Before UI/copy work is considered done:

1. **RX-C foundation** (RX-C-01 evidence, RX-C-03/04/05 honesty, RX-C-09): Hard Gate.
2. **RX-H [Required]** (H-01, H-03, H-04, H-05, H-09, H-11, H-12, H-14): Hard Gate.
3. **RX-N [Required]** (N-01, N-03, N-05, N-06, N-09, N-11): Hard Gate.
4. **RX-L [Required]** (L-01, L-02, L-04, L-06, L-07, L-08): Hard Gate.
5. Everything else is **[Recommended]**: violated only with a written reason.

The result is **FAIL** if any [Required] rule fails, or if there is a `heuristic_eval` finding of severity ≥ 3 with no fix.

## Installation via CLI (per-concern)

The `ryux-rules` CLI (`packages/cli`) installs rules into agents (Claude Code, Cursor, AGENTS.md)
grouped by **concern**, not by layer. The user picks the relevant concerns; the **core**
is always included. This concern → rule map is the source of truth shared with
`packages/cli/src/content.ts`. Keep the two in sync.

| Concern (skill) | Contents | RX rules |
| --- | --- | --- |
| `ryux-rules` (core, always) | Evidence + content honesty | RX-C-01, RX-C-03, RX-C-04, RX-C-05, RX-C-09 |
| `ryux-ui` | UI & visual | RX-C-02, RX-C-07, RX-C-08, RX-H-04, RX-H-08, RX-H-14, RX-N-12 |
| `ryux-copy` | Indonesian copywriting | RX-C-06, RX-L-06, RX-L-07, RX-H-09, RX-N-05 |
| `ryux-a11y` | Accessibility | RX-H-11, RX-H-12, RX-H-13, RX-H-14 |
| `ryux-ux` | Applied UX patterns (NNGroup) | RX-N-01, RX-N-02, RX-N-03, RX-N-05, RX-N-06, RX-N-07, RX-N-09, RX-N-11 |
| `ryux-local` | Indonesian patterns | RX-L-01, RX-L-02, RX-L-03, RX-L-04, RX-L-05, RX-L-09, RX-L-10 |
| `ryux-code` | Clean code (add-on) | RX-K-01, RX-K-02, RX-K-03, RX-K-04, RX-K-05, RX-K-06 |
| `ryux-critique` | Usability review playbook | (see the `ryux-critique` skill) |

Browsable skills live in the `skills/` directory (generated from `content.ts` via `pnpm sync:skills`).
The entire RX-N layer is now bundled in the CLI (previously only in this document). Rules not yet
part of any concern (e.g. RX-H-01/02/03/05/06/07/10, RX-N-04/08/10, RX-L-08) still apply
via the MCP `heuristic_eval` and the Delivery Gate.

### RX-K: Clean code (add-on, outside the core design gate)

The `ryux-code` concern installs code-cleanliness rules. These are not part of the four design layers
(RX-C/H/N/L) and are not assessed by `heuristic_eval`; they are supplementary for code-writing work.

- **RX-K-01** Comments explain the reason (why), not repeat what is already clear from the code.
- **RX-K-02** Variable and function names are specific and meaningful; avoid `data`, `temp`, `helper`, `manager` without context.
- **RX-K-03** Remove dead code, unused imports, and commented-out blocks; do not leave empty TODOs.
- **RX-K-04** Follow the style of the surrounding files (formatting, naming, patterns); do not impose a new style.
- **RX-K-05** Avoid over-abstraction and over-configuration for needs that do not exist yet.
- **RX-K-06** Handle errors with actionable messages; do not swallow errors silently.

## Mapping to code

Tools in `packages/core` (legacy numbering `R-0x`/`C-0x`) and the new `heuristic_eval` tool:

| ryux rule | Check in code |
| --- | --- |
| RX-C-01 | `delivery_gate` (RX-01) |
| RX-C-05 | `audit_copy` C-01 |
| RX-C-06 | `audit_copy` C-02, C-03 |
| RX-H-09 | `audit_copy` C-04 + `heuristic_eval` H-09 |
| RX-H-11 | `audit_ui` R-03 |
| RX-H-12 | `audit_ui` R-01, R-02 |
| RX-H-14 | `audit_ui` R-05 |
| RX-H-01..10 | `heuristic_eval` H-01..H-10 (not yet built) |
| RX-L-06 | `audit_copy` (Rupiah format) |

## License & ownership

This ruleset (text, the RX-C/RX-H/RX-N/RX-L structure, numbering) is original ryux work, **MIT
license**, copyright © 2026 ryux. It references public standards (Nielsen 1994, WCAG 2.2, HIG,
Material) factually; it contains no text, images, paid checklists, or course material from any
party, and is not affiliated with them.
