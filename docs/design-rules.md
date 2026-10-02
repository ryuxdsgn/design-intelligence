# Ryux: design rules and skills

> **© 2026 ryux (Redho Yurizal). License: MIT.** Original ryux.design ruleset.
> Written from scratch based on public standards and methods: **Nielsen's 10 usability heuristics
> (Nielsen, 1994)** and **Nielsen Norman Group UX research** (nngroup.com), **WCAG 2.2**,
> **Apple Human Interface Guidelines**, **Material Design**, and findings from ryux's own agent runs.
> References to standards are factual; all explanations, examples, and numbering are written by us.
> **Not a derivative of any third-party licensed text** and not affiliated with NN/g or anyone else.
>
> **Last updated:** 2026-10-02 · **Version:** RX-2.0

Ryux is a design intelligence layer for AI and designers, packaged as skills. It has four
capabilities: Analyze (`ryux-analyze`), Build (`ryux-core` and the knowledge skills below), Critique
(`ryux-critique`), and QA (`ryux-visual-qa`). Anti-slop prevents bad, generic output; Ryux also
guides good design decisions. Three things make it
distinctly ryux: **evidence-based** (real Indonesian screens), **Indonesia first**, and **human
judgment** for designer notes.

## Principle and workflow

Do not optimize for visual novelty. Optimize for clarity, usability, consistency, product fit,
accessibility, and intentional design decisions.

Request → understand context → understand the product problem → define UX structure → define
interaction → define UI → apply the design system → implement → inspect (render) → critique →
refine → Delivery Gate → done.

## Skills

`ryux-core` is small and always loaded: choosing the capability, the levels, which skills to load,
the Hard Gates, the Delivery Gate, and honest-claims wording. Every knowledge skill is a short
framework (questions, decision trees, templates) followed by its rules. Skills install in groups,
or through the presets `--for designer` and `--for builder`:

<!-- groups:start -->
| Group | Skills |
| --- | --- |
| `foundation` | `ryux-product` (RX-PR) |
| `ux` | `ryux-ux` (RX-UX), `ryux-interaction` (RX-IX), `ryux-forms` (RX-FM), `ryux-edge-cases` (RX-EC), `ryux-content` (RX-CD) |
| `ui` | `ryux-ui` (RX-UI), `ryux-design-system` (RX-DS), `ryux-accessibility` (RX-A11Y), `ryux-responsive` (RX-RD) |
| `engineering` | `ryux-frontend` (RX-FE) |
| `quality` | `ryux-visual-qa` (RX-QA), `ryux-anti-slop` (RX-AS) |
| `analyze` | `ryux-analyze` (capability skill) |
| `critique` | `ryux-critique` (capability skill) |
<!-- groups:end -->

`ryux-analyze` inventories an existing interface, labeling each item Measured, Observed, or
Inferred. `ryux-critique` is the review playbook: a Design Read across nine dimensions (clarity,
hierarchy, coherence, density, confidence, efficiency, specificity, recoverability, accessibility),
then findings with evidence, impact, recommendation, and confidence, structured through the
`heuristic_eval` MCP tool.

### Load only what the task needs

<!-- activation:start -->
| Task | Load (plus ryux-core) |
| --- | --- |
| UI implementation | `ryux-product`, `ryux-ux`, `ryux-ui`, `ryux-design-system`, `ryux-frontend`, `ryux-visual-qa`, `ryux-anti-slop` |
| Form implementation | `ryux-product`, `ryux-ux`, `ryux-forms`, `ryux-interaction`, `ryux-accessibility`, `ryux-edge-cases`, `ryux-content` |
| Mobile UI | `ryux-ux`, `ryux-ui`, `ryux-responsive`, `ryux-accessibility`, `ryux-anti-slop` |
| Checkout or payment | `ryux-product`, `ryux-interaction`, `ryux-forms`, `ryux-content`, `ryux-edge-cases` |
| Data-heavy view (list, table, dashboard) | `ryux-ux`, `ryux-edge-cases`, `ryux-responsive`, `ryux-design-system`, `ryux-frontend` |
| Frontend logic or utilities (formatting, state, data shown to users) | `ryux-frontend`, `ryux-content`, `ryux-edge-cases` |
| Copy only (UI text, chat, announcements) | `ryux-content`, `ryux-anti-slop` |
| Visual refinement | `ryux-ui`, `ryux-design-system`, `ryux-visual-qa`, `ryux-anti-slop` |
| Review or critique | `ryux-critique` (Design Read + heuristic_eval), plus `ryux-visual-qa` |
<!-- activation:end -->

## Levels and gates

- **[Required]**: applies within its stated scope; an exception needs a written reason.
- **[Preferred]**: the default; break it only with a short written reason.
- **[Contextual]**: applies only when its "When" situation is present, for example a QRIS payment,
  a WhatsApp message, roles and permissions, or an e-KYC step.
- **[Hard Gate]**: a Required rule with no exceptions; fix it before declaring the work complete.
- **[Quality Lock]**: consistency that must hold across the product.

Rules are written as scoped defaults rather than absolutes. Each has a **Do**, a **Do not**, and a
**Why** with its basis. Rationale cites real standards and thresholds only; rules that came from
ryux's own agent runs say so ("ryux run 2026-10-02").

### Hard Gates

<!-- hardgates:start -->
| Hard Gate | Rules |
| --- | --- |
| Fake data or fake metrics | RX-AS-01 |
| Fake testimonials or people | RX-AS-02 |
| Invented business rules or product requirements | RX-PR-02, RX-FE-02 |
| Placeholder copy shipped as final | RX-AS-03 |
| Fake urgency or scarcity | RX-AS-04 |
| Missing critical states | RX-EC-01 |
| Broken responsive behavior | RX-RD-01 |
| Accessibility failures | RX-A11Y-01, RX-A11Y-02, RX-A11Y-03, RX-A11Y-04, RX-A11Y-05 |
| Unclear primary action | RX-PR-03 |
| Unexplained interaction behavior | RX-IX-01 |
| Duplicate components | RX-DS-01 |
| Unnecessary complexity | RX-AS-06 |
<!-- hardgates:end -->

### Purpose Gates

Anti-slop does not ban styles. These patterns are allowed when they have a purpose; for each one in
a result, ask **"Why does this exist?"** and remove it when there is no meaningful reason.

<!-- purpose:start -->
| Pattern | Acceptable when |
| --- | --- |
| Cards | they group related content or separate items the user compares or acts on individually |
| Gradients | they carry the brand, show emphasis, or encode a value (a scale or progress) |
| Illustrations | they explain a concept, an empty state, or a step that words alone do not |
| Decorative icons | they speed recognition of a repeated item or action, next to a text label |
| Pills | they show a filter, a selectable option, or a short status |
| Badges | they show a count or status the user acts on |
| Shadows | they show elevation that matters: an overlay, a draggable or floating element |
| Large display type | it carries the single most important message of a page |
| Animation | it communicates state, continuity, feedback, or spatial relationships |
| Unusual layouts | the content or task genuinely differs from standard patterns |
| Generous whitespace | it separates groups or slows a high-stakes decision, not when it hides thin content |
| Borders | they separate regions that spacing alone cannot |
| Rounded containers | the rounding follows the system radius and the container groups something |
<!-- purpose:end -->

### Quality Locks

<!-- locks:start -->
| Quality Lock | Rules |
| --- | --- |
| Spacing | RX-UI-03, RX-DS-03 |
| Typography | RX-UI-03, RX-DS-03 |
| Color roles | RX-UI-04 |
| Terminology | RX-CD-05 |
| Components | RX-DS-02 |
| Interaction patterns and states | RX-DS-02, RX-DS-04 |
| Responsive behavior | RX-RD-06 |
| Visual hierarchy | RX-UI-01 |
<!-- locks:end -->

## Delivery Gate

UI, UX, copy, and frontend work ends with this report:

<!-- gate:start -->
```
PRODUCT        PASS | FAIL | N/A  · one-line reason
UX             PASS | FAIL | N/A  · one-line reason
UI             PASS | FAIL | N/A  · one-line reason
DESIGN SYSTEM  PASS | FAIL | N/A  · one-line reason
ACCESSIBILITY  PASS | FAIL | N/A  · one-line reason
RESPONSIVE     PASS | FAIL | N/A  · one-line reason
EDGE CASES     PASS | FAIL | N/A  · one-line reason
CODE QUALITY   PASS | FAIL | N/A  · one-line reason
VISUAL QA      PASS | FAIL | N/A  · one-line reason
ANTI-SLOP      PASS | FAIL | N/A  · one-line reason
FINAL          PASS | FAIL
```
<!-- gate:end -->

- Each area is PASS, FAIL, or N/A (with a reason when the area does not apply).
- An area FAILS when a [Required] rule in its skills fails without a written exception.
- A Hard Gate failure cannot be excepted.
- VISUAL QA cannot PASS without a render when a render tool is available.
- FINAL is PASS only when no area is FAIL.

Claims in the report describe what was checked and how. "Pixel perfect", "fully accessible",
"production ready", "senior-level", and "UX optimized" are not used without evidence.

## Rules

Generated from `packages/cli/src/content.ts` by `pnpm sync:skills`. Edit the rules there, not here.

<!-- rules:start -->
107 rules across 13 skills: 52 Required, 36 Preferred, 19 Contextual; 17 Hard Gates and 8 Quality Locks.

### ryux-product: Product thinking (RX-PR)

Group Foundation · gate area PRODUCT. Covers user, task, goal, primary action, constraints, assumptions. Load when starting a new screen or flow, or when the scope is unclear.

#### RX-PR-01 [Required] State the context first

- Do: Before designing, write down the user, their task, the business goal, the information that matters, the primary action, the constraints, and what success looks like.
- Do not: Start from a generic template with no stated user or task.
- Why: Without a task, design and review drift into taste. (ryux-critique playbook; NNGroup task-based evaluation)
- Check: review

#### RX-PR-02 [Required] [Hard Gate] Unknowns stay assumptions

- Do: List what you do not know as assumptions, and mark the matching UI with [REAL DATA] or a question.
- Do not: Invent business rules, metrics, user data, permissions, pricing, requirements, or API behavior.
- Why: Invented facts turn into promises and bugs that someone has to unwind. (ryux run 2026-10-02: an unconstrained agent invented a 30-day trial and user counts)
- Check: review

#### RX-PR-03 [Required] [Hard Gate] One goal, one primary action

- Do: Give each screen one primary goal and one primary action; make secondary actions look secondary.
- Do not: Put two equal-weight calls to action side by side, or leave the main action unclear.
- Why: A single clear path shortens the decision and the task. (Hick's law; NNGroup visual hierarchy)
- Check: review

#### RX-PR-04 [Required] Back decisions with real screens

- Do: Cite at least one real screen_id for each meaningful design decision, or label it a judgment call with no reference.
- Do not: Claim "apps usually do X" without a screen to show it.
- Why: A cited screen makes a decision checkable instead of a matter of opinion. (ryux evidence principle)
- Check: search_screens, delivery_gate

#### RX-PR-05 [Required] Indonesian context first

- Do: Start from how Indonesian apps and users work, and check a foreign pattern's local fit before reusing it.
- Do not: Import a pattern such as card-first checkout or dollar pricing without checking local relevance.
- Why: Payment, address, and trust habits differ locally (QRIS, virtual accounts, COD, WhatsApp). (ryux taxonomy of local patterns)
- Check: search_screens

#### RX-PR-06 [Preferred] Outcome before feature

- Do: Lead with what the user gets or finishes, in their words, then explain the feature.
- Do not: Open with product features or technology.
- Why: People scan for relevance to their task before reading details. (NNGroup scanning research)
- Check: review

#### RX-PR-07 [Preferred] Only what serves the task

- Do: Keep the elements and options the stated task needs and move the rest to a later step.
- Do not: Add sections, stats, settings, or badges because similar products have them.
- Why: Every extra element competes with the primary action and adds states to maintain. (Nielsen heuristic 8 (1994))
- Check: review

#### RX-PR-08 [Contextual] Follow the project's direction

- When: the project has a DESIGN.md, a brand guide, or an existing design language
- Do: Follow it and write down any deliberate departure as a design decision record.
- Do not: Override it with the agent's default style.
- Why: Ryux filters and reasons; visual direction belongs to the project. (ryux run 2026-10-02: rules alone produced honest but undirected layouts)
- Check: review

---

### ryux-ux: UX architecture (RX-UX)

Group UX · gate area UX. Covers information architecture, navigation, flows, grouping, disclosure, search and filters. Load when designing multi-screen flows, navigation, or data-heavy views.

#### RX-UX-01 [Required] Structure from the user's goal

- Do: Choose the information architecture and pattern from what users come to do and how they look for it.
- Do not: Apply a stock SaaS layout (sidebar, KPI cards, table) because it is familiar.
- Why: The right structure depends on the task; a template answers a different question. (NNGroup information architecture research)
- Check: review

#### RX-UX-02 [Preferred] Where am I, how do I leave

- Do: Give each screen a clear title and keep a back or cancel path visible.
- Do not: Leave screens without a title or a way out.
- Why: Orientation and an exit lower anxiety and abandonment. (NNGroup wayfinding; Nielsen heuristic 3)
- Check: heuristic_eval H-03

#### RX-UX-03 [Preferred] Group by meaning

- Do: Group content by what it means to the user (task, time, status) and label the groups.
- Do not: Group by how the data is stored or by visual symmetry alone.
- Why: Meaningful groups let people skip what is not relevant to them. (Gestalt proximity and common region; NNGroup)
- Check: review

#### RX-UX-04 [Preferred] Progressive disclosure

- Do: Show what the current decision needs and put advanced or rare options behind a clearly labeled control.
- Do not: Show every option at once, or hide options people need often.
- Why: Disclosure keeps the main path simple without removing power. (NNGroup progressive disclosure)
- Check: review

#### RX-UX-05 [Preferred] Steps and a reviewable summary

- Do: In multi-step flows, show the current step ("Langkah 2 dari 3") and a summary the user can review before committing.
- Do not: Run a multi-step flow with no sense of progress or no review.
- Why: Users commit more confidently when they see what is left and can check their choices. (NNGroup checkout and progress-indicator research)
- Check: review

#### RX-UX-06 [Contextual] Search, filter, and sort that match the hunt

- When: a list or catalog is longer than a screen or two
- Do: Offer search, filters, or sorting that match how users look for items, show active filters, and give a one-step way to clear them.
- Do not: Add every possible filter, or hide which filters are applied.
- Why: Users narrow by the attributes they care about; invisible filters cause "missing" items. (NNGroup filtering and faceted search research)
- Check: review

#### RX-UX-07 [Contextual] Ask for sign-in when it is needed

- When: a flow asks for an account (checkout, saving, history)
- Do: Let users browse and build a cart first, then offer fast sign-in (OTP, WhatsApp, Google) or a guest path at the point it is needed.
- Do not: Force account creation before the user can see or try anything.
- Why: Early forced registration is a well-documented cause of abandonment. (NNGroup and Baymard checkout research)
- Check: review

#### RX-UX-08 [Preferred] Recognition over recall

- Do: Show options and context (recent items, saved addresses, visible choices) instead of asking users to remember them.
- Do not: Make users retype or recall information the app already has.
- Why: Recognizing is easier and less error-prone than remembering. (Nielsen heuristic 6 (1994))
- Check: heuristic_eval H-06

#### RX-UX-09 [Preferred] The user's words and order

- Do: Use the terms and ordering users already know (ongkir, transfer, kelurahan before kecamatan).
- Do not: Put system terms such as SKU or transaction codes in the primary UI.
- Why: Familiar language and order remove a translation step for the user. (Nielsen heuristic 2 (1994))
- Check: heuristic_eval H-02

---

### ryux-interaction: Interaction design (RX-IX)

Group UX · gate area UX. Covers before, during, result, recovery; feedback, control, confirmation, states, keyboard, local payments. Load when adding or changing anything the user can act on.

#### RX-IX-01 [Required] [Hard Gate] Before, during, result, recovery

- Do: For each meaningful action, decide what the user sees before acting, while it runs, when it finishes, and how they recover if it fails.
- Do not: Ship an action whose in-progress, result, or failure behavior is undefined.
- Why: Undefined behavior becomes inconsistent behavior once it is implemented. (Nielsen heuristics 1 and 9; ryux interaction model)
- Check: review

#### RX-IX-02 [Required] Feedback that matches the wait

- Do: Give an immediate pressed state; past about 1 second show a loading indicator; past about 10 seconds show progress with an estimate or let the user leave and come back.
- Do not: Let a payment or save run with no visible status.
- Why: Silence during a wait reads as failure and invites double taps. (Nielsen response-time limits (0.1 / 1 / 10 s); Nielsen heuristic 1)
- Check: heuristic_eval H-01

#### RX-IX-03 [Required] Cancel, back, and undo

- Do: Let users cancel, go back, or undo without losing their work; where a step is genuinely irreversible, say so before it.
- Do not: Trap users in a flow with no exit.
- Why: Freedom to back out makes people willing to explore. (Nielsen heuristic 3 (1994))
- Check: heuristic_eval H-03

#### RX-IX-04 [Required] Protect high-impact actions by reasoning

- Do: Weigh each destructive or costly action: is it reversible, how big is the impact, how easy is recovery? Prefer undo for reversible actions; confirm with the specifics (amount, recipient, item) when it is irreversible and costly; skip confirmation when it only adds friction.
- Do not: Confirm every action by reflex, or use a bare "Are you sure?" before a payment.
- Why: Confirmation that appears everywhere gets dismissed by habit; specifics and undo catch real mistakes. (Nielsen heuristic 5; NNGroup confirmation-dialog guidance)
- Check: heuristic_eval H-05

#### RX-IX-05 [Required] Full cost before commitment

- Do: Show items, shipping, admin fees, and tax as a breakdown and total before the user commits.
- Do not: Reveal fees for the first time on the final step.
- Why: Unexpected extra costs are among the most reported reasons for abandoning checkout. (Baymard checkout usability research; NNGroup e-commerce research)
- Check: review

#### RX-IX-06 [Required] Keyboard-operable actions

- Do: Make actions reachable and operable from the keyboard (path-based input such as drawing excepted); Enter submits a form and Escape closes a dialog.
- Do not: Build actions that only work with a pointer or a touch gesture.
- Why: Keyboard, switch, and power users depend on it. (WCAG 2.2 SC 2.1.1)
- Check: review

#### RX-IX-07 [Preferred] Disabled controls explain themselves

- Do: When a control is disabled, show why or what enables it, or keep it enabled and explain on use.
- Do not: Grey out a button with no explanation.
- Why: An unexplained disabled state is a dead end. (NNGroup disabled-button guidance)
- Check: review

#### RX-IX-08 [Contextual] Shortcuts for repeat use

- When: the product is used repeatedly or by experts (cashier, admin, daily tools)
- Do: Offer shortcuts such as recent items, quick amounts, and keyboard actions.
- Do not: Make frequent users walk the novice path every time.
- Why: Accelerators keep repeat work fast without hurting new users. (Nielsen heuristic 7 (1994))
- Check: heuristic_eval H-07

#### RX-IX-09 [Contextual] QRIS: amount and merchant first

- When: the flow takes a QRIS payment
- Do: Show the amount and the merchant name before the user scans or confirms, and the paid status afterwards.
- Do not: Show a QR code without the amount or the merchant.
- Why: Users check who they are paying and how much before they pay. (QRIS standard (Bank Indonesia); ryux reference screens)
- Check: search_screens qris

#### RX-IX-10 [Contextual] Virtual account: copy, deadline, steps

- When: the flow pays by virtual account
- Do: Give a copy button for the VA number, the payment deadline, and per-bank steps.
- Do not: Show a VA number with no copy button or no deadline.
- Why: Users switch to their banking app and need the number and steps at hand. (ryux reference screens)
- Check: search_screens virtual-account

#### RX-IX-11 [Contextual] Paylater and installments in full

- When: the flow offers paylater or installments
- Do: Show the limit, the tenor options, and the total cost including interest and fees before commitment.
- Do not: Show only the monthly amount.
- Why: Credit decisions need the full cost to be informed ones. (OJK consumer-protection disclosure expectations)
- Check: review

---

### ryux-forms: Forms (RX-FM)

Group UX · gate area UX. Covers labels, layout, validation, input preservation, autofill, submission, unsaved work, OTP, address, e-KYC. Load when building or reviewing any form.

#### RX-FM-01 [Required] Visible labels tied to fields

- Do: Give each field a label tied to it, visible unless the context already names it (a lone search box beside a labeled button).
- Do not: Use placeholder text as the only label.
- Why: Placeholder labels vanish while typing and are often not announced. (NNGroup form-design research; WCAG 2.2 SC 1.3.1 and 3.3.2)
- Check: review

#### RX-FM-02 [Preferred] Layout by relationship

- Do: Default to one column for sequential input, and place short related fields together (date parts, city and postal code) when that matches how people read them.
- Do not: Spread unrelated fields across columns to fill width.
- Why: Reading order should match filling order; related fields read as one unit. (NNGroup form-design research)
- Check: review

#### RX-FM-03 [Required] Validate near the field, keep the input

- Do: Validate close to the field when it helps, and keep everything the user typed when something fails.
- Do not: Clear the form or only report errors after a full submit.
- Why: Re-entering data is the most frustrating part of a failed form. (NNGroup inline-validation research)
- Check: review

#### RX-FM-04 [Preferred] Fewest fields

- Do: Ask only for what the task needs, mark the less common case (optional or required), and prefill sensible defaults.
- Do not: Ask for data the task does not use, or mark every field required by default.
- Why: Each extra field adds effort and a chance to quit. (NNGroup form-design research)
- Check: review

#### RX-FM-05 [Preferred] The right keyboard and autofill

- Do: Match the keyboard to the input (numeric for amounts, phone numbers, and OTP) and support autofill and paste.
- Do not: Show a text keyboard for numbers or block pasting codes.
- Why: The right keyboard removes taps and typos on phones. (HTML inputmode and autocomplete (one-time-code); platform input guidance)
- Check: review

#### RX-FM-06 [Required] Submission states

- Do: On submit, prevent double submission, show progress, then show success with what happens next, or failure with the input kept and a retry.
- Do not: Leave the submit button live during a request or end on a blank screen.
- Why: Submission is where users lose work and trust. (Nielsen heuristics 1 and 9)
- Check: review

#### RX-FM-07 [Contextual] Protect unsaved work

- When: a form holds work the user can lose by navigating away or timing out
- Do: Autosave with a visible status, or warn before discarding changes.
- Do not: Discard edits silently.
- Why: Lost work is the most expensive form failure. (NNGroup guidance on data loss)
- Check: review

#### RX-FM-08 [Contextual] OTP: channel choice and paste

- When: the flow sends a one-time code
- Do: Offer SMS or WhatsApp, allow paste and autofill, and allow a resend after a short countdown.
- Do not: Lock users to one channel with a long, punishing countdown.
- Why: SMS delivery is unreliable for some users; WhatsApp is often the faster channel. (ryux reference screens)
- Check: search_screens otp

#### RX-FM-09 [Contextual] Addresses with landmarks

- When: the form collects a delivery address
- Do: Support landmarks, block or RT/RW, and courier notes alongside the map pin.
- Do not: Rely on a map pin alone.
- Why: Many Indonesian addresses are found by landmark rather than by street number. (ryux reference screens)
- Check: review

#### RX-FM-10 [Contextual] e-KYC: reason and guidance first

- When: the flow asks for an ID card or selfie
- Do: Explain why the data is needed and show framing guidance before opening the camera.
- Do not: Open the camera with no reason and no guidance.
- Why: People share identity data more willingly, and with fewer retakes, when they know why and how. (UU PDP No. 27/2022 (transparency); ryux reference screens)
- Check: review

---

### ryux-edge-cases: Edge cases (RX-EC)

Group UX · gate area EDGE CASES. Covers data, form, network, permission, and system states beyond the happy path. Load when building data views, flows, or anything that talks to a network.

#### RX-EC-01 [Required] [Hard Gate] Critical states exist

- Do: Design the loading, empty, error, and success states of each data view and action that can be slow, empty, or fail.
- Do not: Ship only the filled, happy-path screen.
- Why: Users meet the other states often, and they are where trust is lost. (Nielsen heuristics 1 and 9)
- Check: audit_ui

#### RX-EC-02 [Required] Errors with a way forward

- Do: When something fails, say what happened, why if it helps, and the next action (retry, another method, contact).
- Do not: End on an error with only an "OK" button.
- Why: A recoverable error keeps the task alive. (Nielsen heuristic 9 (1994))
- Check: heuristic_eval H-09

#### RX-EC-03 [Preferred] Data volume and shape

- Do: Check one item, many items, duplicates, and missing fields; paginate or virtualize long lists.
- Do not: Design only for a tidy sample of five items.
- Why: Real data is uneven, and layouts break at the extremes. (ryux review practice)
- Check: visual QA

#### RX-EC-04 [Preferred] Long text and large amounts

- Do: Test with long names, long Indonesian words, and large amounts such as Rp1.250.000.000; wrap or truncate with access to the full value.
- Do not: Design only around short sample strings.
- Why: Real content is longer than sample content and breaks fixed layouts. (Localization practice; ryux review practice)
- Check: visual QA

#### RX-EC-05 [Preferred] First use and zero data

- Do: Explain what will appear in an empty view and give one action to get started.
- Do not: Leave a blank list or a lone "No data".
- Why: An empty state is the first lesson in how the feature works. (NNGroup empty-state guidance)
- Check: review

#### RX-EC-06 [Contextual] Slow, timeout, offline, server failure

- When: the screen depends on network data
- Do: Keep user input, show cached data with its age, offer retry, and say plainly when the server failed versus the connection.
- Do not: Show an endless spinner, an empty screen, or lose input when the request fails.
- Why: Connection quality varies a lot between places and moments. (ryux review practice)
- Check: review

#### RX-EC-07 [Contextual] Roles and restricted access

- When: the product has roles, permissions, or read-only modes
- Do: Design the read-only and restricted states: say why an action is unavailable and who can do it. Use roles that exist in the product.
- Do not: Invent roles or show actions that fail only after the user tries them.
- Why: Users need to know whether to ask someone or give up. (ryux review practice)
- Check: review

#### RX-EC-08 [Contextual] Session expiry and unauthorized

- When: the product has sessions or authentication
- Do: On expiry, keep the user's work, ask them to sign in again, and return them to the same place.
- Do not: Dump users on a login screen and lose their progress.
- Why: Re-authentication should cost seconds, not the task. (ryux review practice)
- Check: review

---

### ryux-content: Content design (RX-CD)

Group UX · gate area UX. Covers specific copy, action labels, error messages, natural Indonesian, Rupiah, terminology. Load when writing or reviewing any user-facing text.

#### RX-CD-01 [Required] Natural Bahasa Indonesia

- Do: Write the way Indonesian users speak; keep English only for terms they already use (checkout, promo).
- Do not: Ship stiff translations such as "Silakan melakukan pembayaran Anda".
- Why: Natural language reads faster and feels trustworthy. (ryux copy principle)
- Check: audit_copy, review

#### RX-CD-02 [Required] Rupiah as Rp1.250.000

- Do: Write money with Rp directly before the number, dots for thousands, and no decimals for whole Rupiah.
- Do not: Write Rp 1.250.000, IDR 1250000, or Rp1,250,000.
- Why: It is the common Indonesian form; mixed formats look careless next to prices. (PUEBI currency notation; ryux run 2026-10-02)
- Check: audit_copy C-07

#### RX-CD-03 [Preferred] Labels name the real action

- Do: Name the action and what it gets the user ("Bayar Rp45.000", "Simpan alamat").
- Do not: Use vague labels ("Submit", "Learn more") or hype words ("unlock", "elevate", "seamlessly").
- Why: Specific labels tell users what happens next. (NNGroup button and link-label guidance)
- Check: audit_copy

#### RX-CD-04 [Required] Errors: what, why, how to recover

- Do: Say what happened, why when it helps the user act, and how to recover, next to where it happened, without blaming the user.
- Do not: Show codes like TXN_0x8004 or "Something went wrong" on their own.
- Why: Users can only recover from what they understand. (NNGroup error-message guidelines)
- Check: audit_copy C-04

#### RX-CD-05 [Required] [Quality Lock] One name per thing

- Do: Use one term for each concept across screens, buttons, and messages.
- Do not: Call the same thing "pesanan", "order", and "transaksi" on different screens.
- Why: Changing terms make users wonder whether it is a different thing. (Nielsen heuristic 4 (1994))
- Check: review

#### RX-CD-06 [Preferred] Plain decoration

- Do: Use sentence case and plain lists; one emoji is fine where the channel expects it.
- Do not: Use emoji as bullets, ALL CAPS, or stacked exclamation marks.
- Why: Decoration on every line buries the information and reads as generated. (ryux run 2026-10-02: unconstrained WhatsApp copy)
- Check: audit_copy, review

#### RX-CD-07 [Preferred] Help at the point of need

- Do: Put short help where the question arises (a hint under a field, "Kenapa diminta?").
- Do not: Send users to a separate FAQ for a field-level question.
- Why: Help in context gets read; help elsewhere gets skipped. (Nielsen heuristic 10 (1994))
- Check: heuristic_eval H-10

#### RX-CD-08 [Contextual] Chat copy sounds like a person

- When: the text goes to WhatsApp, Telegram, or another chat channel
- Do: Use a short greeting, short paragraphs, sparse *bold*, and a clear contact line.
- Do not: Paste a marketing page into a chat.
- Why: Chat readers expect a message from a person, not an ad. (ryux run 2026-10-02: WhatsApp promo comparison)
- Check: review

---

### ryux-ui: UI design (RX-UI)

Group UI · gate area UI. Covers hierarchy, type, spacing, layout, density, color, containers, imagery, motion. Load when doing visual design or visual refinement.

#### RX-UI-01 [Required] [Quality Lock] Hierarchy follows priority

- Do: Make the primary action and the key information the most prominent things in each area, with one clear focal point.
- Do not: Give everything equal weight, or let decoration outrank content.
- Why: Hierarchy is how users know what to read and do first. (NNGroup visual hierarchy)
- Check: visual QA

#### RX-UI-02 [Required] Functional before decorative

- Do: Give each decorative element (card, gradient, shadow, badge, illustration, large display type) a stated reason; see the anti-slop purpose gates.
- Do not: Add decoration because it looks modern.
- Why: Unjustified decoration is the fastest route to generic UI. (Nielsen heuristic 8; ryux anti-slop principle)
- Check: review

#### RX-UI-03 [Preferred] [Quality Lock] One spacing and type scale

- Do: Use the project's spacing and type scale, or define one (for example multiples of 4 or 8) and align elements to a shared grid.
- Do not: Pick spacing and sizes one element at a time.
- Why: A scale produces rhythm and makes hierarchy legible. (Material Design 8dp grid)
- Check: review

#### RX-UI-04 [Preferred] [Quality Lock] A palette with roles

- Do: Use a small set of colors with defined roles: surface, text, accent for the primary action, and status colors.
- Do not: Introduce new colors per component, or use the accent for decoration.
- Why: When color has a role, the accent and status colors mean something. (ryux visual principle)
- Check: review

#### RX-UI-05 [Preferred] Layout from content, not a template

- Do: Choose the layout from the content, the task, and the reference screens.
- Do not: Default to hero, three feature cards, and a logo wall.
- Why: Template layouts look interchangeable and hide what is specific to the product. (ryux anti-slop principle)
- Check: review

#### RX-UI-06 [Preferred] Density fits the task

- Do: Use compact density for repeat, data-heavy work and roomier layouts for first-time or high-stakes decisions.
- Do not: Apply the same generous whitespace to a cashier screen and a landing page.
- Why: The right density depends on how often and how carefully people use the screen. (Material density guidance)
- Check: review

#### RX-UI-07 [Contextual] Imagery that is what it claims

- When: the design uses photos or illustrations
- Do: Use real product screens or clearly illustrative art.
- Do not: Present a stock photo of a stranger as a customer or user.
- Why: Borrowed faces imply endorsements that do not exist. (ryux run 2026-10-02: pen.dev landing without ryux)
- Check: review

#### RX-UI-08 [Preferred] Motion explains change

- Do: Use motion for feedback and continuity (where something came from, what changed), keep it short, and let users act while it runs.
- Do not: Animate for decoration alone or make users wait for an animation.
- Why: Purposeful motion helps users follow state changes; slow motion is friction. (Material motion principles; Apple HIG motion)
- Check: review

---

### ryux-design-system: Design system (RX-DS)

Group UI · gate area DESIGN SYSTEM. Covers search before create, tokens, component states, consistency locks. Load when adding or changing components, styles, or tokens.

#### RX-DS-01 [Required] [Hard Gate] Search before you create

- Do: Before adding a component, search existing components, tokens, and patterns; reuse, then extend with a variant, and create new only for a real semantic or behavioral difference.
- Do not: Create a near-duplicate component or pattern for one screen.
- Why: Duplicates drift apart, multiply maintenance, and break consistency. (Design-system practice)
- Check: review

#### RX-DS-02 [Required] [Quality Lock] Consistency and conventions

- Do: Follow platform conventions and the project's own patterns; the same component looks and behaves the same everywhere.
- Do not: Style or wire similar components differently from screen to screen.
- Why: Consistency lets users transfer what they learned. (Nielsen heuristic 4; Apple HIG; Material Design)
- Check: heuristic_eval H-04

#### RX-DS-03 [Preferred] [Quality Lock] Tokens over one-off values

- Do: Use tokens or variables for color, spacing, radius, elevation, and type.
- Do not: Hard-code one-off values for things the system already defines.
- Why: Tokens keep changes consistent and reviewable. (W3C Design Tokens Community Group)
- Check: review

#### RX-DS-04 [Preferred] [Quality Lock] Defined component states

- Do: Define default, hover, focus, pressed, disabled, loading, and error states once per interactive component.
- Do not: Leave states for each screen to improvise.
- Why: Undefined states get designed inconsistently, or not at all. (Material Design state guidance)
- Check: review

---

### ryux-accessibility: Accessibility (RX-A11Y)

Group UI · gate area ACCESSIBILITY. Covers semantics, keyboard, focus, contrast, targets, names, errors, reduced motion. Load when building or reviewing any UI.

#### RX-A11Y-01 [Required] [Hard Gate] Readable contrast

- Do: Keep text contrast at least 4.5:1, and at least 3:1 for large text and component boundaries.
- Do not: Put light grey text on white or white text on a pale accent.
- Why: Low contrast fails outdoors, on cheap screens, and for low vision. (WCAG 2.2 SC 1.4.3 and 1.4.11)
- Check: audit_ui

#### RX-A11Y-02 [Required] [Hard Gate] Readable text, reachable targets

- Do: Keep body text around 14 to 16px on mobile, and touch targets at least 24×24px, preferably 44×44px.
- Do not: Shrink body text or crowd small targets together.
- Why: Small text and targets cause misreads and mis-taps. (WCAG 2.2 SC 2.5.8 (24px minimum); Apple HIG 44pt; Material 48dp)
- Check: audit_ui

#### RX-A11Y-03 [Required] [Hard Gate] Visible focus, logical order

- Do: Show a visible focus indicator and keep the focus order the same as the visual order.
- Do not: Remove focus outlines without an accessible replacement.
- Why: Keyboard and switch users navigate by focus. (WCAG 2.2 SC 2.4.3 and 2.4.7)
- Check: review

#### RX-A11Y-04 [Required] [Hard Gate] Semantic structure

- Do: Use real headings, landmarks, lists, buttons, and links so the structure exists without the styling.
- Do not: Build structure from styled divs alone.
- Why: Assistive technology navigates by semantics. (WCAG 2.2 SC 1.3.1)
- Check: review

#### RX-A11Y-05 [Required] [Hard Gate] Names for controls and images

- Do: Give icon-only buttons and meaningful images an accessible name or alt text.
- Do not: Ship unlabeled icon buttons.
- Why: Screen readers announce unlabeled buttons as just "button". (WCAG 2.2 SC 1.1.1 and 4.1.2)
- Check: review

#### RX-A11Y-06 [Required] Not color alone

- Do: Pair color with text or an icon when it carries meaning (errors, status, selection).
- Do not: Signal an error or a selected state with color only.
- Why: Color-blind users and grayscale screens miss color-only signals. (WCAG 2.2 SC 1.4.1)
- Check: review

#### RX-A11Y-07 [Required] Errors announced and tied to fields

- Do: Link error messages to their fields and announce them to assistive technology.
- Do not: Show errors only as red borders or as text that is not associated with the field.
- Why: An error the user cannot perceive cannot be fixed. (WCAG 2.2 SC 3.3.1 and 4.1.3)
- Check: review

#### RX-A11Y-08 [Required] Respect reduced motion

- Do: When reduced motion is requested, replace large movement with a fade or a cut.
- Do not: Ignore the system reduced-motion setting.
- Why: Large motion can cause discomfort for people with vestibular disorders. (WCAG 2.2 SC 2.3.3; prefers-reduced-motion; Apple HIG)
- Check: review

#### RX-A11Y-09 [Preferred] ARIA only when native cannot

- Do: Use native elements first, and add ARIA only for semantics HTML cannot express.
- Do not: Add roles and ARIA attributes to elements that already have the right semantics.
- Why: Wrong ARIA is worse than none. (W3C ARIA Authoring Practices (first rule of ARIA))
- Check: review

---

### ryux-responsive: Responsive design (RX-RD)

Group UI · gate area RESPONSIVE. Covers prioritize, simplify, reorganize; tables, overlays, overflow, safe areas. Load when building a layout that ships to more than one width.

#### RX-RD-01 [Required] [Hard Gate] Stated viewport plus the smallest

- Do: Check the stated viewport and the smallest supported width, with no horizontal page scroll at either.
- Do not: Design for one width only.
- Why: Users meet the layout at many widths, including small Android phones. (WCAG 2.2 SC 1.4.10 (reflow at 320 CSS px))
- Check: visual QA

#### RX-RD-02 [Required] Prioritize, simplify, reorganize

- Do: As space shrinks, decide what matters most, simplify what remains, then reorganize: stack, collapse, or move secondary content behind a control. Keep text size.
- Do not: Squeeze the desktop layout into a smaller viewport.
- Why: Shrinking keeps the layout and loses the reader. (WCAG 2.2 SC 1.4.10; responsive design practice)
- Check: visual QA

#### RX-RD-03 [Required] Safe areas and thumb reach

- Do: Keep content inside the safe areas and the primary action within thumb reach on phones.
- Do not: Put the main action under the notch or the home indicator.
- Why: Hidden or hard-to-reach actions stall the task. (Apple HIG layout; Material layout guidance)
- Check: visual QA

#### RX-RD-04 [Contextual] Tables on small screens

- When: the layout has a data table
- Do: Pick the priority columns, then stack rows into labeled blocks or scroll the table inside its own container with the key column fixed.
- Do not: Shrink a wide table until it is unreadable or scroll the whole page sideways.
- Why: Tables carry comparisons; losing the key column loses the meaning. (NNGroup mobile tables guidance)
- Check: visual QA

#### RX-RD-05 [Contextual] Overlays on small screens

- When: the layout uses modals, drawers, or popovers
- Do: On phones, use a full-screen or bottom sheet and keep the close and primary actions reachable.
- Do not: Show a desktop-sized modal that overflows a phone screen.
- Why: Overflowing overlays trap users. (Apple HIG sheets; Material bottom sheets)
- Check: visual QA

#### RX-RD-06 [Preferred] [Quality Lock] Consistent responsive behavior

- Do: Make the same component adapt the same way wherever it appears.
- Do not: Collapse the same navigation differently on different pages.
- Why: Predictable adaptation is part of consistency. (Nielsen heuristic 4 (1994))
- Check: visual QA

---

### ryux-frontend: Frontend implementation (RX-FE)

Group Engineering · gate area CODE QUALITY. Covers the repo's own stack, semantic elements, components, state, no invented logic. Load when writing or changing frontend code, including formatting, state, and data logic that users see.

#### RX-FE-01 [Required] Work in the repo's own stack

- Do: Before writing UI code, read package.json and nearby components, and use the framework, styling approach, and patterns already there.
- Do not: Assume React, Tailwind, or a component library the project does not use.
- Why: Code in a foreign stack is a rewrite waiting to happen. (Clean-code practice)
- Check: review

#### RX-FE-02 [Required] [Hard Gate] No invented logic in UI code

- Do: Take prices, limits, permissions, and rules from data, config, or the API; mark unknown ones as assumptions.
- Do not: Hard-code business rules or API behavior nobody specified.
- Why: Invented logic ships as real behavior. (ryux product principle (see RX-PR-02))
- Check: review

#### RX-FE-03 [Required] Native, semantic controls

- Do: Use native or semantic elements (button, a, label, the right input types) before custom elements with handlers.
- Do not: Build clickable divs without roles, focus, or keyboard support.
- Why: Native controls bring accessibility and platform behavior for free. (WCAG 2.2 SC 4.1.2; HTML specification)
- Check: review

#### RX-FE-04 [Preferred] Components with clear boundaries

- Do: Split components by responsibility, keep state close to where it is used, and derive values instead of duplicating state.
- Do not: Grow a single giant component that fetches, formats, and renders everything.
- Why: Clear boundaries make UI predictable and testable. (Clean-code practice)
- Check: review

#### RX-FE-05 [Required] Actionable errors

- Do: Handle errors with messages that say what to fix, in the user's language when users see them.
- Do not: Swallow errors silently or show raw developer messages to users.
- Why: Silent failures hide bugs; raw messages leave users stuck. (Clean-code practice; Nielsen heuristic 9)
- Check: review

#### RX-FE-06 [Preferred] Comments say why

- Do: Write comments that explain the reason behind the code.
- Do not: Write doc comments that only repeat a field, type, or function name.
- Why: Restating comments add noise and drift out of date. (ryux run 2026-10-02: order-total.ts without ryux)
- Check: review

#### RX-FE-07 [Preferred] Specific names

- Do: Name variables and functions by what they hold or do.
- Do not: Use data, temp, helper, or manager without context.
- Why: Specific names make code readable without comments. (Clean-code practice)
- Check: review

#### RX-FE-08 [Preferred] No dead code

- Do: Remove unused code, imports, and commented-out blocks.
- Do not: Leave empty TODOs or disabled code behind.
- Why: Dead code misleads the next reader. (Clean-code practice)
- Check: review

#### RX-FE-09 [Preferred] Match the surrounding style

- Do: Follow the formatting, naming, and patterns of the surrounding files.
- Do not: Introduce a new style inside an existing codebase.
- Why: Mixed styles make every change harder to review. (Clean-code practice)
- Check: review

#### RX-FE-10 [Preferred] No speculative abstraction or dependencies

- Do: Build for the needs that exist now, and add a dependency only when it clearly earns its weight.
- Do not: Add abstractions, configuration, or packages for needs nobody has stated.
- Why: Unused flexibility costs reading time, bundle size, and hides bugs. (Clean-code practice)
- Check: review

#### RX-FE-11 [Preferred] Mind performance

- Do: Size and lazy-load heavy images and media, and avoid needless re-renders and large client bundles.
- Do not: Ship full-size images or heavy libraries for small effects.
- Why: Many Indonesian users are on mid-range phones and metered data. (web.dev Core Web Vitals)
- Check: review

#### RX-FE-12 [Contextual] Rupiah formatting in code

- When: code formats money for display
- Do: Format the number with id-ID grouping and prepend Rp yourself.
- Do not: Rely on Intl currency style alone, which inserts a space after Rp.
- Why: The built-in output does not match the Rp1.250.000 form used in copy. (ryux run 2026-10-02: order-total.ts with and without ryux)
- Check: audit_copy C-07 on rendered strings

---

### ryux-visual-qa: Visual QA (RX-QA)

Group Quality · gate area VISUAL QA. Covers render, inspect, critique, fix, render again; ranked by impact. Load when something visual has been implemented and is about to be called done.

#### RX-QA-01 [Required] Render it and look

- Do: Render the result at the target viewport (browser, screenshot, or design-tool export) and inspect it before calling it done; if no render tool is available, say so in the report.
- Do not: Claim visual quality for a layout you have only seen as code.
- Why: Overlaps and clipping are invisible in source and obvious on screen. (ryux run 2026-10-02: two runs shipped overlaps they never saw)
- Check: screenshot

#### RX-QA-02 [Required] Fix, then render again

- Do: Rank issues by impact (blocks the task, misleads, adds friction, polish), fix from the top, and render again to confirm.
- Do not: Fix by guesswork without checking the result, or polish while a blocking issue remains.
- Why: The loop is what turns a first draft into a reviewed result. (ryux visual QA loop)
- Check: screenshot

#### RX-QA-03 [Required] No covered or colliding text

- Do: Keep floating cards and mockups over empty space only, and keep navigation items clear of the logo and buttons.
- Do not: Let a card cover prices or labels, or let nav items touch.
- Why: Covered text is lost information and looks broken. (ryux run 2026-10-02: QRIS card over prices, colliding nav)
- Check: screenshot

#### RX-QA-04 [Required] Numbers agree

- Do: Make line items add up to subtotals and totals, and show the same value the same way everywhere on the screen.
- Do not: Show sample numbers that contradict each other.
- Why: Readers check sums; one wrong total undermines everything else. (ryux README checkout image (items Rp125.000, subtotal Rp1.200.000))
- Check: review

#### RX-QA-05 [Preferred] Check states and widths

- Do: Inspect at least the main state, one empty or error state, and the smallest supported width.
- Do not: Review only the happy path at one width.
- Why: Most visual bugs live outside the default screenshot. (ryux visual QA loop)
- Check: screenshot

#### RX-QA-06 [Preferred] Compare with a reference

- Do: Compare the result with at least one reference screen_id and note any intentional difference.
- Do not: Judge the result only against itself.
- Why: A reference shows what you missed. (ryux evidence principle)
- Check: search_screens

---

### ryux-anti-slop: Anti-slop (RX-AS)

Group Quality · gate area ANTI-SLOP. Covers hard gates, purpose gates, quality locks, honest claims. Load when work is about to be delivered, or during visual refinement.

#### RX-AS-01 [Required] [Hard Gate] Only real numbers

- Do: Show counts, ratings, growth, and statistics only with a real source; otherwise leave them out or mark [REAL DATA].
- Do not: Invent "48.000+ users", "4,8★", or "+12%".
- Why: Invented numbers are false claims, however polished the page. (ryux run 2026-10-02: pen.dev landing without ryux)
- Check: review

#### RX-AS-02 [Required] [Hard Gate] No invented people

- Do: Use testimonials, names, and faces only when they are real and consented.
- Do not: Make up testimonials, reviewers, or customer photos.
- Why: Fake people are fake endorsements. (ryux anti-slop principle)
- Check: review

#### RX-AS-03 [Required] [Hard Gate] Placeholders look like placeholders

- Do: Mark temporary content clearly: [REAL DATA], [LOGO], "Contoh data".
- Do not: Ship placeholder copy or data disguised as final.
- Why: Disguised placeholders ship by accident. (ryux anti-slop principle)
- Check: audit_copy C-01

#### RX-AS-04 [Required] [Hard Gate] No fake urgency

- Do: State a deadline or a quota only when it is real, as a plain fact.
- Do not: Write "sebelum kehabisan", "kuota terbatas", or fake countdowns with nothing behind them.
- Why: Manufactured pressure erodes trust once users notice. (NNGroup credibility research; ryux run 2026-10-02: WhatsApp promo)
- Check: review

#### RX-AS-05 [Required] Decoration passes a purpose gate

- Do: For each potentially decorative pattern, answer "why does this exist?" with a real reason (grouping, emphasis, state, brand), or remove it.
- Do not: Keep cards, gradients, badges, shadows, or animation that have no reason.
- Why: Unjustified decoration is what makes AI-generated UI look the same. (ryux anti-slop principle)
- Check: review

#### RX-AS-06 [Required] [Hard Gate] Complexity with a reason

- Do: Remove elements, options, states, and code paths that serve no stated need.
- Do not: Add settings, sections, or abstractions "for later".
- Why: Unneeded complexity costs every user and every future change. (Nielsen heuristic 8; clean-code practice)
- Check: review

#### RX-AS-07 [Required] Claims match the evidence

- Do: Describe what was checked and how ("keyboard and focus checked; no automated accessibility test was available").
- Do not: Claim "pixel perfect", "fully accessible", "production ready", "senior-level", or "UX optimized" without evidence.
- Why: False confidence hides the work that is still needed. (ryux delivery principle)
- Check: review

#### RX-AS-08 [Required] Human designer notes

- Do: Have a person write the "why it works / weaknesses" judgment; an agent may summarize it.
- Do not: Let an agent author designer notes.
- Why: The human judgment is the point of the notes. (ryux data principle)
- Check: review
<!-- rules:end -->

## Installation via CLI

```bash
npx @ryuxdsgn/ryux install --agent claude          # or --agent all; see the README for every agent
```

`ryux-core` is always installed. `--concerns` from RX-1.x still works as a deprecated alias, and
installing removes folders from earlier releases. Browsable copies of every skill live in
[`skills/`](../skills).

## Mapping to code

Checks in `packages/core` (tool-local numbering `R-0x` and `C-0x`):

| Ryux rule | Check in code |
| --- | --- |
| RX-PR-04 | `delivery_gate` (screen_id citations) |
| RX-AS-03 | `audit_copy` C-01 |
| RX-CD-03 | `audit_copy` C-02, C-03 |
| RX-CD-04, RX-EC-02 | `audit_copy` C-04 + `heuristic_eval` H-09 |
| RX-CD-02 | `audit_copy` C-07 (Rupiah format) |
| RX-A11Y-01 | `audit_ui` R-03 |
| RX-A11Y-02 | `audit_ui` R-01, R-02 |
| RX-EC-01 | `audit_ui` R-05 |
| Nielsen heuristics 1-10 | `heuristic_eval` H-01..H-10 |

## Migration from RX-1.x

RX-2.0 regroups every rule by skill. Old IDs map as follows; some old rules were merged, and some
were split across skills.

<!-- migration:start -->
| RX-1.x ID | RX-2.0 ID |
| --- | --- |
| RX-C-01 | RX-PR-04 |
| RX-C-02 | RX-UI-05 |
| RX-C-03 | RX-AS-01 |
| RX-C-04 | RX-AS-02 |
| RX-C-05 | RX-AS-03 |
| RX-C-06 | RX-CD-03 |
| RX-C-07 | RX-UI-04 |
| RX-C-08 | RX-UI-03 |
| RX-C-09 | RX-AS-08 |
| RX-C-10 | RX-CD-06, RX-AS-04 |
| RX-H-01 | RX-IX-02 |
| RX-H-02 | RX-UX-09 |
| RX-H-03 | RX-IX-03 |
| RX-H-04 | RX-DS-02 |
| RX-H-05 | RX-IX-04 |
| RX-H-06 | RX-UX-08 |
| RX-H-07 | RX-IX-08 |
| RX-H-08 | RX-UI-02 |
| RX-H-09 | RX-EC-02 |
| RX-H-10 | RX-CD-07 |
| RX-H-11 | RX-A11Y-01 |
| RX-H-12 | RX-A11Y-02 |
| RX-H-13 | RX-A11Y-03 |
| RX-H-14 | RX-EC-01, RX-RD-01, RX-RD-03, RX-QA-03 |
| RX-K-01 | RX-FE-06 |
| RX-K-02 | RX-FE-07 |
| RX-K-03 | RX-FE-08 |
| RX-K-04 | RX-FE-09 |
| RX-K-05 | RX-FE-10 |
| RX-K-06 | RX-FE-05 |
| RX-L-01 | RX-IX-09 |
| RX-L-02 | RX-IX-10 |
| RX-L-03 | RX-FM-08 |
| RX-L-04 | RX-IX-05 |
| RX-L-05 | RX-FM-09 |
| RX-L-06 | RX-CD-02 |
| RX-L-07 | RX-CD-01 |
| RX-L-08 | RX-PR-05 |
| RX-L-09 | RX-IX-11 |
| RX-L-10 | RX-FM-10 |
| RX-N-01 | RX-IX-02 |
| RX-N-02 | RX-FM-01, RX-FM-02 |
| RX-N-03 | RX-FM-03 |
| RX-N-04 | RX-FM-04 |
| RX-N-05 | RX-CD-04 |
| RX-N-06 | RX-IX-05 |
| RX-N-07 | RX-UX-05 |
| RX-N-08 | RX-UX-07 |
| RX-N-09 | RX-AS-04 |
| RX-N-10 | RX-FM-05 |
| RX-N-11 | RX-IX-04 |
| RX-N-12 | RX-UX-02 |
<!-- migration:end -->

## License & ownership

This ruleset (text, the skill structure, numbering) is original ryux work, **MIT license**,
copyright © 2026 ryux. It references public standards (Nielsen 1994, WCAG 2.2, HIG, Material)
factually; it contains no text, images, paid checklists, or course material from any party, and is
not affiliated with them.
