# RYUX: design rules and modules

> **© 2026 ryux (Redho Yurizal). License: MIT.** Original ryux.design ruleset.
> Written from scratch based on public standards and methods: **Nielsen's 10 usability heuristics
> (Nielsen, 1994)** and **Nielsen Norman Group UX research** (nngroup.com), **WCAG 2.2**,
> **Apple Human Interface Guidelines**, **Material Design**, and findings from ryux's own agent runs.
> References to standards are factual; all explanations, examples, and numbering are written by us.
> **Not a derivative of any third-party licensed text** and not affiliated with NN/g or anyone else.
>
> **Version:** RYUX 2.4.0

RYUX is design intelligence for AI agents and designers, packaged as one skill, `ryux`. It has five
entry points: Analyze, Design, Build, Critique, and QA. The router (`SKILL.md`) picks the
knowledge modules each task needs. Anti-slop prevents bad, generic output; RYUX also guides good
design decisions. Three things make it distinctly RYUX: **evidence-based** (real product screens),
a **global core with local market depth** (Indonesia is the first market), and **human judgment** for
designer notes.

## Principle and workflow

Do not optimize for visual novelty. Optimize for clarity, usability, consistency, product fit,
accessibility, and intentional design decisions.

Understand the request → pick the entry point → read only the knowledge the task needs → gather
evidence → reason → produce and render → Hard Gates and the Delivery Gate.

## The skill and its modules

One skill, `ryux`, holds everything. `SKILL.md` is the router: the entry points, how RYUX works, the
levels, the Hard Gates, the task table, and the Delivery Gate. Each knowledge module is a short
framework (questions, decision trees, templates) followed by its rules.

<!-- groups:start -->
| File | What it holds | Rules |
| --- | --- | --- |
| `SKILL.md` | the router: entry points, how RYUX works, levels, Hard Gates, task table, Delivery Gate | |
| `capabilities/analyze.md` | Analyze: inventory of an existing interface | |
| `capabilities/design.md` | Design: create or improve UI and UX without code | |
| `capabilities/build.md` | Build: implement in the repo's own stack | |
| `capabilities/critique.md` | Critique: Design Read and evidence-backed findings | |
| `knowledge/product.md` | Product thinking: user, task, goal, primary action, constraints, assumptions, and decisions backed by evidence | RX-PR |
| `knowledge/ux.md` | UX architecture: information architecture, navigation, flows, grouping, disclosure, search and filters | RX-UX |
| `knowledge/interaction.md` | Interaction design: before, during, result, recovery; feedback, control, confirmation, states, keyboard, local payments | RX-IX |
| `knowledge/forms.md` | Forms: labels, layout, validation, input preservation, autofill, submission, unsaved work, OTP, address, e-KYC | RX-FM |
| `knowledge/edge-cases.md` | Edge cases: data, form, network, permission, and system states beyond the happy path | RX-EC |
| `knowledge/content.md` | Content design: specific copy, action labels, error messages, terminology, and locale (money, dates, natural Indonesian when the copy is Indonesian) | RX-CD |
| `knowledge/ui.md` | UI design: the visual expression of a product: hierarchy, type, layout, density, color, imagery, art direction, composition, motion, and visual language | RX-UI |
| `knowledge/design-system.md` | Design system: search before create, tokens, component states, consistency locks | RX-DS |
| `knowledge/accessibility.md` | Accessibility: semantics, keyboard, focus, contrast, targets, names, errors, reduced motion | RX-A11Y |
| `knowledge/responsive.md` | Responsive design: prioritize, simplify, reorganize; tables, overlays, overflow, safe areas | RX-RD |
| `knowledge/frontend.md` | Frontend implementation: the repo's own stack, semantic elements, one home for each piece of logic, tests, no invented logic | RX-FE |
| `capabilities/qa.md` | Visual QA: did the build match the intended design: compare, list deviations, fix, render again | RX-QA |
| `knowledge/anti-slop.md` | Anti-slop: hard gates, purpose gates, quality locks, honest claims | RX-AS |
<!-- groups:end -->

Analyze inventories an existing interface, labeling each item Measured, Observed, or Inferred.
Critique is the review playbook: a Design Read across nine dimensions (clarity,
hierarchy, coherence, density, confidence, efficiency, specificity, recoverability, accessibility),
then findings with evidence, impact, recommendation, and confidence, structured through the
`heuristic_eval` MCP tool.

### Load only what the task needs

<!-- activation:start -->
| Task | Read |
| --- | --- |
| UI implementation | `knowledge/product.md`, `knowledge/ux.md`, `knowledge/ui.md`, `knowledge/design-system.md`, `knowledge/frontend.md`, `capabilities/qa.md`, `knowledge/anti-slop.md` |
| Form implementation | `knowledge/product.md`, `knowledge/ux.md`, `knowledge/forms.md`, `knowledge/interaction.md`, `knowledge/accessibility.md`, `knowledge/edge-cases.md`, `knowledge/content.md` |
| Mobile UI | `knowledge/ux.md`, `knowledge/ui.md`, `knowledge/responsive.md`, `knowledge/accessibility.md`, `knowledge/anti-slop.md` |
| Checkout or payment | `knowledge/product.md`, `knowledge/interaction.md`, `knowledge/forms.md`, `knowledge/content.md`, `knowledge/edge-cases.md` |
| Data-heavy view (list, table, dashboard) | `knowledge/ux.md`, `knowledge/edge-cases.md`, `knowledge/responsive.md`, `knowledge/design-system.md`, `knowledge/frontend.md` |
| Frontend logic or utilities (formatting, state, data shown to users) | `knowledge/frontend.md`, `knowledge/content.md`, `knowledge/edge-cases.md` |
| Copy only (UI text, chat, announcements) | `knowledge/content.md`, `knowledge/anti-slop.md` |
| Visual refinement | `knowledge/ui.md`, `knowledge/design-system.md`, `capabilities/qa.md`, `knowledge/anti-slop.md` |
| Review or critique | `capabilities/critique.md` (Design Read + heuristic_eval), plus `capabilities/qa.md` |
<!-- activation:end -->

## Levels and gates

- **[Required]**: applies within its stated scope; an exception needs a written reason.
- **[Preferred]**: the default; break it only with a short written reason.
- **[Contextual]**: applies only when its "When" situation is present, for example a QRIS payment,
  a WhatsApp message, roles and permissions, or an e-KYC step.
- **[Hard Gate]**: a Required rule with no exceptions; fix it before declaring the work complete.
- **[Quality Lock]**: consistency that must hold across the product.

Rules are written as scoped defaults rather than absolutes. Each has a **Do**, a **Do not**, and a
**Why** with its basis. Rules in the UX, interaction, forms, UI, and responsive skills also say
**Not when** (so they are not applied mechanically) and the **Trade-off** they cost. Rationale cites real standards and thresholds only; rules that came from
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
| Accessibility failures | RX-A11Y-01, RX-A11Y-02, RX-A11Y-03, RX-A11Y-04 |
| Unclear goal or competing actions | RX-PR-03 |
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
| Interaction patterns and states | RX-DS-02 |
| Responsive behavior | RX-RD-06 |
| Visual hierarchy | RX-UI-01 |
<!-- locks:end -->

## Delivery Gate

UI, UX, copy, and frontend work ends with this report:

<!-- gate:start -->
```
PRODUCT        PASS | FAIL | N/A  · one-line reason · evidence Strong | Thin | None
UX             PASS | FAIL | N/A  · one-line reason
UI             PASS | FAIL | N/A  · one-line reason · point of view: <concept> | task UI
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

## Rule provenance

Every rule ends its Why line with the source it comes from: a public standard or research, an
industry practice, something observed in a RYUX agent run, or a RYUX principle or review. A rule can
cite more than one. **Provenance describes where a rule comes from, not how authoritative or effective
it is.** A standard gives authority; a RYUX run gives an observation; they are not equivalent evidence.
The point is that all 84 rules can be traced, not that the counts score them. Read each rule's Why
line below for its exact source.

<!-- provenance:start -->
| Source cited | Rules citing it | Rules citing only this |
| --- | --- | --- |
| Public standard or research | 48 | 37 |
| Industry practice | 12 | 6 |
| Observed in a RYUX run | 12 | 8 |
| RYUX principle, taxonomy, or review | 26 | 19 |

All 84 rules cite a source; 14 cite more than one kind, so the "Rules citing it" column adds up to more than 84.
<!-- provenance:end -->

## Rules

Generated from `packages/cli/src/content.ts` by `pnpm sync:skills`. Edit the rules there, not here.

<!-- rules:start -->
84 rules across 13 modules: 49 Required, 14 Preferred, 21 Contextual; 16 Hard Gates and 7 Quality Locks.

### Product thinking (RX-PR) · `knowledge/product.md`

Gate area PRODUCT. Covers user, task, goal, primary action, constraints, assumptions, and decisions backed by evidence. Read when starting a new screen or flow, choosing between patterns, or when the scope is unclear.

#### RX-PR-01 [Required] State the context first

- Do: Before designing, write down the user, their task, the business goal, the design intent (what the user must understand, feel, and do), the information that matters, the primary action, the constraints, and what success looks like. Take what the prompt and DESIGN.md already give; ask only when a missing answer would change a major decision, at most three questions in one message (none when the context is complete), and write the rest as assumptions.
- Do not: Start from a generic template with no stated user or task, or ask questions the prompt or DESIGN.md already answers.
- Why: Without a task, design and review drift into taste. (`capabilities/critique.md` playbook; NNGroup task-based evaluation)
- Check: review

#### RX-PR-02 [Required] [Hard Gate] Unknowns stay assumptions

- Do: List what you do not know as assumptions, and mark the matching UI with [REAL DATA] or a question. Product facts (feature and tool names, commands, integrations, supported platforms, page names) come only from the brief, the repo, or the product's own docs.
- Do not: Invent business rules, metrics, user data, permissions, pricing, requirements, or API behavior, or name a tool, command, integration, platform, or page the product does not have.
- Why: Invented facts turn into promises and bugs that someone has to unwind. (ryux run 2026-10-02: an unconstrained agent invented a 30-day trial and user counts)
- Check: review

#### RX-PR-03 [Required] [Hard Gate] One clear goal; one primary action when the task has one

- Do: Give each screen one clear, dominant goal. When the task has a clear next step (a form, checkout, a confirmation), give it one primary action and make secondary actions look secondary.
- Do not: Put two equal-weight calls to action side by side, or leave the screen's goal unclear.
- Why: A single clear path shortens the decision and the task. (Hick's law; NNGroup visual hierarchy)
- Not when: Monitoring and configuration screens (dashboards, settings) need a clear goal but not a single dominant action; do not invent one to satisfy this rule.
- Check: review

#### RX-PR-04 [Required] Back decisions with real screens

- Do: Cite at least one real screen_id for each meaningful design decision, or label it a judgment call with no reference.
- Do not: Claim "apps usually do X" without a screen to show it.
- Why: A cited screen makes a decision checkable instead of a matter of opinion. (ryux evidence principle)
- Check: search_screens, delivery_gate

#### RX-PR-05 [Required] The product's market first

- Do: Start from how users in the product's own market pay, sign in, write addresses, and read money and dates; check a pattern from another market before reusing it. Take the market from the brief or the codebase, and ask when it is unclear.
- Do not: Import one market's checkout, currency, language, or tax rules into a product built for another market.
- Why: Payment, address, and trust habits differ by market (local payment rails, address formats, messaging channels). (ryux taxonomy of local patterns)
- Check: search_screens

#### RX-PR-09 [Required] Compare patterns before choosing

- Do: For a consequential decision (a new flow, payment, identity, navigation), list two or three candidate patterns with their context, strength, and weakness, then choose the one whose context matches, not the one that looks best.
- Do not: Pick the first familiar pattern, or choose by taste.
- Why: A pattern is right for a context, not in general; comparing makes the reason visible and checkable. (ryux evidence principle; NNGroup competitive usability practice)
- Not when: small, reversible decisions inside an established pattern; follow the design system instead
- Trade-off: takes longer than picking the familiar option
- Check: search_screens, compare_apps

#### RX-PR-10 [Required] Say when the evidence is not enough

- Do: Rate the evidence for a decision as Strong (two or more comparable screens in the same context), Thin (one, or a different context), or None; when it is None on a consequential choice, present the options and their trade-offs or ask, instead of picking silently.
- Do not: Invent a reference, or present a judgment call as if real products backed it.
- Why: Knowing what you do not know is part of design judgment; false certainty ships the wrong pattern. (ryux evidence principle)
- Check: review

---

### UX architecture (RX-UX) · `knowledge/ux.md`

Gate area UX. Covers information architecture, navigation, flows, grouping, disclosure, search and filters. Read when designing multi-screen flows, navigation, or data-heavy views.

#### RX-UX-01 [Required] Structure from the user's goal

- Do: Choose the information architecture and pattern from what users come to do and how they look for it.
- Do not: Apply a stock SaaS layout (sidebar, KPI cards, table) because it is familiar.
- Why: The right structure depends on the task; a template answers a different question. (NNGroup information architecture research)
- Not when: the product already has an established structure users rely on; change it only with evidence
- Trade-off: a less familiar layout can cost users a moment of learning
- Check: review

#### RX-UX-02 [Preferred] Where am I, what's left, how do I leave

- Do: Give each screen a clear title and keep a back or cancel path visible; in multi-step flows show the current step ("Langkah 2 dari 3") and a summary the user can review before committing.
- Do not: Leave screens without a title or a way out, or run a multi-step flow with no sense of progress or review.
- Why: Orientation, progress, and an exit lower anxiety and abandonment. (NNGroup wayfinding and progress-indicator research; Nielsen heuristic 3)
- Not when: a focused full-screen step such as payment in progress, where leaving would lose state; say how to cancel instead
- Trade-off: a persistent title and back path take vertical space on small screens
- Check: heuristic_eval H-03

#### RX-UX-06 [Contextual] Search, filter, and sort that match the hunt

- When: a list or catalog is longer than a screen or two
- Do: Offer search, filters, or sorting that match how users look for items, show active filters, and give a one-step way to clear them.
- Do not: Add every possible filter, or hide which filters are applied.
- Why: Users narrow by the attributes they care about; invisible filters cause "missing" items. (NNGroup filtering and faceted search research)
- Not when: the list fits in a screen or two; filters slow down scanning
- Trade-off: each filter is UI to maintain and can hide items users expect to see
- Check: review

#### RX-UX-07 [Contextual] Ask for sign-in when it is needed

- When: a flow asks for an account (checkout, saving, history)
- Do: Let users browse and build a cart first, then offer fast sign-in (OTP, WhatsApp, Google) or a guest path at the point it is needed.
- Do not: Force account creation before the user can see or try anything.
- Why: Early forced registration is a well-documented cause of abandonment. (NNGroup and Baymard checkout research)
- Not when: the core value requires an identity from the start (banking, a personal ledger)
- Trade-off: late sign-in can lose a cart or draft if it is not carried over
- Check: review

#### RX-UX-08 [Preferred] Recognition over recall

- Do: Show options and context (recent items, saved addresses, visible choices) instead of asking users to remember them.
- Do not: Make users retype or recall information the app already has.
- Why: Recognizing is easier and less error-prone than remembering. (Nielsen heuristic 6 (1994))
- Not when: a one-time task, where showing history or saved values adds clutter
- Trade-off: higher visual density; more on screen to scan
- Check: heuristic_eval H-06

---

### Interaction design (RX-IX) · `knowledge/interaction.md`

Gate area UX. Covers before, during, result, recovery; feedback, control, confirmation, states, keyboard, local payments. Read when adding or changing anything the user can act on.

#### RX-IX-01 [Required] [Hard Gate] Before, during, result, recovery

- Do: For each meaningful action, decide what the user sees before acting, while it runs, when it finishes, and how they recover if it fails.
- Do not: Ship an action whose in-progress, result, or failure behavior is undefined.
- Why: Undefined behavior becomes inconsistent behavior once it is implemented. (Nielsen heuristics 1 and 9; ryux interaction model)
- Not when: trivial actions with no wait and no failure mode (toggling a local view)
- Trade-off: more states to design, build, and test
- Check: review

#### RX-IX-02 [Required] Feedback that matches the wait

- Do: Give an immediate pressed state; past about 1 second show a loading indicator; past about 10 seconds show progress with an estimate or let the user leave and come back.
- Do not: Let a payment or save run with no visible status.
- Why: Silence during a wait reads as failure and invites double taps. (Nielsen response-time limits (0.1 / 1 / 10 s); Nielsen heuristic 1)
- Not when: instant actions under about 0.1 s; a spinner that flashes is noise
- Trade-off: progress indicators need real progress data; a fake bar misleads
- Check: heuristic_eval H-01

#### RX-IX-03 [Required] Cancel, back, and undo

- Do: Let users cancel, go back, or undo without losing their work; where a step is genuinely irreversible, say so before it.
- Do not: Trap users in a flow with no exit.
- Why: Freedom to back out makes people willing to explore. (Nielsen heuristic 3 (1994))
- Not when: the step is genuinely irreversible once confirmed (a sent transfer); say so up front instead
- Trade-off: undo needs soft-delete or delayed execution in the backend
- Check: heuristic_eval H-03

#### RX-IX-04 [Required] Protect high-impact actions by reasoning

- Do: Weigh each destructive or costly action: is it reversible, how big is the impact, how easy is recovery? Prefer undo for reversible actions; confirm with the specifics (amount, recipient, item) when it is irreversible and costly; skip confirmation when it only adds friction.
- Do not: Confirm every action by reflex, or use a bare "Are you sure?" before a payment.
- Why: Confirmation that appears everywhere gets dismissed by habit; specifics and undo catch real mistakes. (Nielsen heuristic 5; NNGroup confirmation-dialog guidance)
- Not when: reversible, low-impact actions where undo is enough
- Trade-off: one extra step versus irreversible loss
- Check: heuristic_eval H-05

#### RX-IX-05 [Required] Full cost before commitment

- Do: Show items, shipping, admin fees, and tax as a breakdown and total before the user commits.
- Do not: Reveal fees for the first time on the final step.
- Why: Unexpected extra costs are among the most reported reasons for abandoning checkout. (Baymard checkout usability research; NNGroup e-commerce research)
- Not when: prices are not known until a later choice (shipping before an address); show an estimate and say when it is final
- Trade-off: a full breakdown adds lines to a small screen
- Check: review

#### RX-IX-09 [Contextual] QRIS: amount and merchant first

- When: the flow takes a QRIS payment
- Do: Show the amount and the merchant name before the user scans or confirms, and the paid status afterwards.
- Do not: Show a QR code without the amount or the merchant.
- Why: Users check who they are paying and how much before they pay. (QRIS standard (Bank Indonesia); ryux reference screens)
- Not when: a static QRIS printed for any amount, where the user types the amount; show the merchant name
- Trade-off: an extra confirmation step before the code
- Check: search_screens qris

#### RX-IX-10 [Contextual] Virtual account: copy, deadline, steps

- When: the flow pays by virtual account
- Do: Give a copy button for the VA number, the payment deadline, and per-bank steps.
- Do not: Show a VA number with no copy button or no deadline.
- Why: Users switch to their banking app and need the number and steps at hand. (ryux reference screens)
- Not when: the app pays the VA itself in one step (auto-debit)
- Trade-off: per-bank steps make the screen longer
- Check: search_screens virtual-account

#### RX-IX-11 [Contextual] Paylater and installments in full

- When: the flow offers paylater or installments
- Do: Show the limit, the tenor options, and the total cost including interest and fees before commitment.
- Do not: Show only the monthly amount.
- Why: Credit decisions need the full cost to be informed ones. (OJK consumer-protection disclosure expectations)
- Not when: a single full payment with no credit involved
- Trade-off: the full cost can discourage a purchase; that is the point of disclosure
- Check: review

---

### Forms (RX-FM) · `knowledge/forms.md`

Gate area UX. Covers labels, layout, validation, input preservation, autofill, submission, unsaved work, OTP, address, e-KYC. Read when building or reviewing any form.

#### RX-FM-01 [Required] Visible labels tied to fields

- Do: Give each field a label tied to it, visible unless the context already names it (a lone search box beside a labeled button).
- Do not: Use placeholder text as the only label.
- Why: Placeholder labels vanish while typing and are often not announced. (NNGroup form-design research; WCAG 2.2 SC 1.3.1 and 3.3.2)
- Not when: a lone search field beside a labeled button, where context names it; still give it an accessible name
- Trade-off: labels above fields make the form taller
- Check: review

#### RX-FM-03 [Required] Validate near the field, keep the input

- Do: Validate close to the field when it helps, and keep everything the user typed when something fails.
- Do not: Clear the form or only report errors after a full submit.
- Why: Re-entering data is the most frustrating part of a failed form. (NNGroup inline-validation research)
- Not when: while the user is still typing; validate after they leave the field or the format is complete
- Trade-off: early validation can nag; late validation can surprise
- Check: review

#### RX-FM-05 [Preferred] The right keyboard and autofill

- Do: Match the keyboard to the input (numeric for amounts, phone numbers, and OTP) and support autofill and paste.
- Do not: Show a text keyboard for numbers or block pasting codes.
- Why: The right keyboard removes taps and typos on phones. (HTML inputmode and autocomplete (one-time-code); platform input guidance)
- Not when: free-text fields where a restricted keyboard blocks valid input (names with punctuation)
- Trade-off: inputmode varies across browsers; test on real devices
- Check: review

#### RX-FM-06 [Required] Submission states

- Do: On submit, prevent double submission, show progress, then show success with what happens next, or failure with the input kept and a retry.
- Do not: Leave the submit button live during a request or end on a blank screen.
- Why: Submission is where users lose work and trust. (Nielsen heuristics 1 and 9)
- Not when: instant local saves with no network round trip
- Trade-off: more states to build and test
- Check: review

#### RX-FM-08 [Contextual] OTP: channel choice and paste

- When: the flow sends a one-time code
- Do: Offer SMS or WhatsApp, allow paste and autofill, and allow a resend after a short countdown.
- Do not: Lock users to one channel with a long, punishing countdown.
- Why: SMS delivery is unreliable for some users; WhatsApp is often the faster channel. (ryux reference screens)
- Not when: the channel is fixed by the provider or by regulation
- Trade-off: more channels mean more delivery paths to maintain
- Check: search_screens otp

#### RX-FM-09 [Contextual] Addresses with landmarks

- When: the form collects a delivery address
- Do: Support landmarks, block or RT/RW, and courier notes alongside the map pin.
- Do not: Rely on a map pin alone.
- Why: Many Indonesian addresses are found by landmark rather than by street number. (ryux reference screens)
- Not when: delivery uses precise coordinates only (a pickup locker)
- Trade-off: more fields to fill
- Check: review

#### RX-FM-10 [Contextual] e-KYC: reason and guidance first

- When: the flow asks for an ID card or selfie
- Do: Explain why the data is needed and show framing guidance before opening the camera.
- Do not: Open the camera with no reason and no guidance.
- Why: People share identity data more willingly, and with fewer retakes, when they know why and how. (UU PDP No. 27/2022 (transparency); ryux reference screens)
- Not when: a returning user who has already been verified
- Trade-off: an extra screen before the camera
- Check: review

---

### Edge cases (RX-EC) · `knowledge/edge-cases.md`

Gate area EDGE CASES. Covers data, form, network, permission, and system states beyond the happy path. Read when building data views, flows, or anything that talks to a network.

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

#### RX-EC-03 [Preferred] Data volume, shape, and length

- Do: Check one item, many items, duplicates, missing fields, long names and long Indonesian words, and large amounts such as Rp1.250.000.000; paginate or virtualize long lists, and wrap or truncate with access to the full value.
- Do not: Design only around a tidy sample of five short items.
- Why: Real data is uneven and longer than sample data, and layouts break at the extremes. (Localization practice; ryux review practice)
- Check: visual QA

#### RX-EC-06 [Contextual] Slow, timeout, offline, server failure

- When: the screen depends on network data
- Do: Keep user input, show cached data with its age, offer retry, and say plainly when the server failed versus the connection.
- Do not: Show an endless spinner, an empty screen, or lose input when the request fails.
- Why: Connection quality varies a lot between places and moments. (ryux review practice)
- Check: review

#### RX-EC-07 [Contextual] Roles, access, and sessions

- When: the product has roles, permissions, read-only modes, or sessions
- Do: Design read-only and restricted states (say why an action is unavailable and who can do it, using roles that exist), and on session expiry keep the user's work and return them to the same place after signing in.
- Do not: Invent roles, show actions that fail only after the user tries them, or dump users on a login screen and lose their progress.
- Why: Users need to know whether to ask someone, and re-authentication should cost seconds, not the task. (ryux review practice)
- Check: review

---

### Content design (RX-CD) · `knowledge/content.md`

Gate area UX. Covers specific copy, action labels, error messages, terminology, and locale (money, dates, natural Indonesian when the copy is Indonesian). Read when writing or reviewing any user-facing text.

#### RX-CD-01 [Contextual] Natural Bahasa Indonesia

- When: the interface or message is in Bahasa Indonesia
- Do: Write the way Indonesian users speak; keep English only for terms they already use (checkout, promo).
- Do not: Ship stiff translations such as "Silakan melakukan pembayaran Anda".
- Why: Natural language reads faster and feels trustworthy. (ryux copy principle)
- Check: audit_copy, review

#### RX-CD-02 [Contextual] Rupiah as Rp1.250.000

- When: the product shows prices in Rupiah
- Do: Write money with Rp directly before the number, dots for thousands, and no decimals for whole Rupiah.
- Do not: Write Rp 1.250.000, IDR 1250000, or Rp1,250,000.
- Why: It is the common Indonesian form; mixed formats look careless next to prices. (PUEBI currency notation; ryux run 2026-10-02)
- Check: audit_copy C-07

#### RX-CD-03 [Preferred] Specific, plain copy

- Do: Name the action and what it gets the user ("Bayar Rp45.000", "Simpan alamat"); use sentence case and plain lists, with at most one emoji where the channel expects it.
- Do not: Use vague labels ("Submit", "Learn more"), hype words ("unlock", "elevate", "seamlessly"), emoji bullets, ALL CAPS, or stacked exclamation marks.
- Why: Specific, plain copy tells users what happens next; decoration on every line buries it and reads as generated. (NNGroup button and link-label guidance; ryux run 2026-10-02: unconstrained WhatsApp copy)
- Check: audit_copy

#### RX-CD-04 [Required] Errors: what, why, how to recover

- Do: Say what happened, why when it helps the user act, and how to recover, next to where it happened, without blaming the user.
- Do not: Show codes like TXN_0x8004 or "Something went wrong" on their own.
- Why: Users can only recover from what they understand. (NNGroup error-message guidelines)
- Check: audit_copy C-04

#### RX-CD-05 [Required] [Quality Lock] One name per thing

- Do: Use one term for each concept across screens, buttons, and messages. Write product and brand names exactly as the brief or brand guide gives them, including the wordmark; when an older design in the file disagrees with the brief, follow the brief and say so.
- Do not: Call the same thing "pesanan", "order", and "transaksi" on different screens, or restyle a brand name (RYUX as "ryux") because an older frame did.
- Why: Changing terms make users wonder whether it is a different thing; a misspelled brand name looks careless or fake. (Nielsen heuristic 4 (1994); ryux run 2026-10-02: pen.dev hero wordmark)
- Check: review

#### RX-CD-09 [Contextual] Dates, times, and numbers in Indonesian form

- When: the copy is in Bahasa Indonesia; other markets follow their own locale
- Do: Write dates as 2 Okt 2026 or Jumat, 2 Oktober 2026; times as 14.30 in 24-hour form, with WIB, WITA, or WIT when the time zone matters; decimals with a comma (1,5) and thousands with a dot (12.500); phone numbers as +62 812-3456-7890.
- Do not: Write 10/02/2026, 2:30 PM, or 1.5 in Indonesian copy.
- Why: Slash dates are ambiguous and English number formats read as foreign or as the wrong value. (PUEBI number and time notation; id-ID locale conventions)
- Check: audit_copy C-08

---

### UI design (RX-UI) · `knowledge/ui.md`

Gate area UI. Covers the visual expression of a product: hierarchy, type, layout, density, color, imagery, art direction, composition, motion, and visual language. Read when doing visual design or visual refinement, or directing images, 3D, or motion.

#### RX-UI-01 [Required] [Quality Lock] Hierarchy follows priority

- Do: Make the primary action and the key information the most prominent things in each area, with one clear focal point.
- Do not: Give everything equal weight, or let decoration outrank content.
- Why: Hierarchy is how users know what to read and do first. (NNGroup visual hierarchy)
- Not when: screens with several equal peers, such as a dashboard of comparable items; use consistent hierarchy within each card instead
- Trade-off: emphasizing one thing de-emphasizes the rest
- Check: visual QA

#### RX-UI-03 [Preferred] [Quality Lock] One spacing and type scale

- Do: Use the project's spacing and type scale, or define one (for example multiples of 4 or 8) and align elements to a shared grid.
- Do not: Pick spacing and sizes one element at a time.
- Why: A scale produces rhythm and makes hierarchy legible. (Material Design 8dp grid)
- Not when: a one-off marketing piece outside the product
- Trade-off: a scale limits choices; occasional exceptions need a written reason
- Check: review

#### RX-UI-04 [Preferred] [Quality Lock] A palette with roles

- Do: Use a small set of colors with defined roles: surface, text, accent for the primary action, and status colors.
- Do not: Introduce new colors per component, or use the accent for decoration.
- Why: When color has a role, the accent and status colors mean something. (ryux visual principle)
- Not when: data visualization, which needs its own categorical or sequential palette
- Trade-off: fewer colors means relying on type and space for emphasis
- Check: review

#### RX-UI-05 [Preferred] Layout from content, not a template

- Do: Choose the layout from the content, the task, and the reference screens.
- Do not: Default to hero, three feature cards, and a logo wall.
- Why: Template layouts look interchangeable and hide what is specific to the product. (ryux anti-slop principle)
- Not when: a standard pattern users expect fits the content (a settings list, a table); familiarity is the right choice
- Trade-off: custom layouts cost design and build time
- Check: review

#### RX-UI-07 [Contextual] Imagery has a job and is what it claims

- When: the design uses photos, illustration, or 3D
- Do: Name each visual's job in one line: explain, orient, demonstrate, set the emotion, carry the identity, give context, or tell the story. Use real product screens or clearly illustrative art.
- Do not: Add a visual because the hero looks empty, or present a stock photo of a stranger, or a generated image, as a real customer or product screen.
- Why: A visual without a job competes with the content; borrowed faces and fake screens imply things that do not exist. (ryux run 2026-10-02: pen.dev landing without ryux; RX-AS-05 purpose gate)
- Not when: pure illustration that clearly is not a photo of a customer
- Trade-off: real product screenshots age quickly and need updating
- Check: review

#### RX-UI-09 [Contextual] Composition leaves room for the content

- When: a visual sits next to or behind text or actions
- Do: Place the visual's focal point away from the headline and the primary action, keep text contrast over the image, and check the crop at every target width. On expressive surfaces, try three compositions first (subject left, subject right, centered or full-bleed) and choose by focal point, hierarchy, negative space, relation to the copy, and balance.
- Do not: Put the subject's focal point behind the headline, or let a crop cut the subject or the text at narrow widths.
- Why: The eye goes to the strongest focal point first; when it fights the headline, neither is read. (visual hierarchy (RX-UI-01); WCAG 1.4.3 contrast (RX-A11Y-01))
- Not when: a full-bleed visual with no text over it
- Trade-off: less freedom to place the subject
- Check: render at each width; review

#### RX-UI-10 [Preferred] Visual language is chosen, not defaulted

- Do: Derive the art direction from the brand, the audience, the product context, and reference screens, and write it as a Visual Brief (objective, concept, composition, color, material, lighting, motion, avoid) before designing an expressive surface or generating images, 3D, or motion.
- Do not: Reach for the category cliché (coins, money rain, floating dashboards, or gradient blobs for fintech; generic 3D characters for any app), or write an image prompt without a brief (role, concept, composition).
- Why: A default visual language makes the product interchangeable with its competitors. (art direction practice; RX-AS-05 purpose gate)
- Not when: an existing brand system already defines the visual language; follow it
- Trade-off: a brief takes time before any image exists
- Check: the Visual Brief; review

#### RX-UI-11 [Contextual] Motion earns its level

- When: the design adds motion or transitions
- Do: Classify each motion: L1 state feedback, L2 component transition, L3 page transition, L4 storytelling, L5 decorative. The higher the level, the stronger the reason it needs. Take timing and easing from one motion personality, define them once as motion tokens, animate transform and opacity rather than layout properties, and honor reduced motion (RX-A11Y-08).
- Do not: Animate everything, use one generic duration and easing (transition: all 0.3s) everywhere, or let decorative motion delay content or input.
- Why: Motion directs attention; unearned motion steals it from the task and can make some people unwell. (NNGroup animation and usability guidance; WCAG 2.3.3 animation from interactions)
- Not when: L1 feedback on standard controls that follows the platform defaults
- Trade-off: fewer flourishes on marketing pages
- Check: review; reduced-motion test

#### RX-UI-12 [Contextual] A point of view on expressive surfaces

- When: the surface is expressive: a hero, landing page, onboarding, empty state, or brand moment
- Do: Before designing, write three directions, each with a name, a concept taken from the product's own idea (for a tool about evidence: receipts, citations, marks of proof), and a signature element (type, composition, imagery, or motion). Choose one and say why (RX-PR-09), then make the rest of the design serve that signature. Put the chosen concept in the Visual Brief.
- Do not: Let the signature be the category's default (for developer tools a terminal or agent-session panel; for SaaS a dashboard screenshot; copy on the left and product on the right), or relabel that default as a concept. A product screen can support the signature, not be it.
- Why: Users remember a product by its idea; a correct but generic surface is forgotten and could belong to any competitor. (brand and art direction practice; RX-UI-05 layout from content)
- Not when: task UI such as forms, tables, settings, and checkout, where restraint and convention win
- Trade-off: a strong idea takes a decision someone may disagree with; keep it honest and on brand
- Check: the swap test (RX-AS-09); review

#### RX-UI-13 [Contextual] Source assets on purpose

- When: the design needs photos, illustration, 3D, icons, logos, or video
- Do: Pick each asset's source in this order: real product screens or the brand's own assets; a licensed library (one icon set, photos whose license you can name); a custom or generated asset made from the Visual Brief and labeled illustrative; otherwise a placeholder that looks like one (RX-AS-03). Record where each asset came from.
- Do not: Draw or imitate another company's logo, mix icon sets, use a photo you cannot license, or fill a gap with a generic stock scene.
- Why: Assets carry claims about the product and its users; an unsourced or borrowed asset is a claim nobody can back. (licensing and trademark practice; RX-UI-07; RX-AS-02)
- Not when: a wireframe or internal prototype where placeholders are expected
- Trade-off: real or licensed assets take longer than a stock search
- Check: asset list with sources; review

---

### Design system (RX-DS) · `knowledge/design-system.md`

Gate area DESIGN SYSTEM. Covers search before create, tokens, component states, consistency locks. Read when adding or changing components, styles, or tokens.

#### RX-DS-01 [Required] [Hard Gate] Search before you create

- Do: Before adding a component, search existing components, tokens, and patterns; reuse, then extend with a variant, and create new only for a real semantic or behavioral difference.
- Do not: Create a near-duplicate component or pattern for one screen.
- Why: Duplicates drift apart, multiply maintenance, and break consistency. (Design-system practice)
- Check: review

#### RX-DS-02 [Required] [Quality Lock] Consistency, conventions, and states

- Do: Follow platform conventions and the project's own patterns; the same component looks and behaves the same everywhere, with its states (default, hover, focus, pressed, disabled, loading, error) defined once.
- Do not: Style or wire similar components differently from screen to screen.
- Why: Consistency lets users transfer what they learned. (Nielsen heuristic 4; Apple HIG; Material Design)
- Check: heuristic_eval H-04

#### RX-DS-03 [Preferred] [Quality Lock] Tokens over one-off values

- Do: Use tokens or variables for color, spacing, radius, elevation, and type.
- Do not: Hard-code one-off values for things the system already defines.
- Why: Tokens keep changes consistent and reviewable. (W3C Design Tokens Community Group)
- Check: review

---

### Accessibility (RX-A11Y) · `knowledge/accessibility.md`

Gate area ACCESSIBILITY. Covers semantics, keyboard, focus, contrast, targets, names, errors, reduced motion. Read when building or reviewing any UI.

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

#### RX-A11Y-03 [Required] [Hard Gate] Keyboard and visible focus

- Do: Make actions operable from the keyboard (path-based input such as drawing excepted), show a visible focus indicator, and keep focus order the same as the visual order.
- Do not: Build pointer-only actions, or remove focus outlines without an accessible replacement.
- Why: Keyboard and switch users navigate and act by focus. (WCAG 2.2 SC 2.1.1, 2.4.3, and 2.4.7)
- Check: review

#### RX-A11Y-04 [Required] [Hard Gate] Semantic structure, native controls, and names

- Do: Use real headings, landmarks, lists, buttons, links, and the right input types before custom elements, and give icon-only buttons and meaningful images an accessible name or alt text.
- Do not: Build structure or controls from styled divs, or ship unlabeled icon buttons.
- Why: Assistive technology navigates by semantics and announces unlabeled buttons as just "button"; native controls bring keyboard and platform behavior for free. (WCAG 2.2 SC 1.1.1, 1.3.1, and 4.1.2)
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

---

### Responsive design (RX-RD) · `knowledge/responsive.md`

Gate area RESPONSIVE. Covers prioritize, simplify, reorganize; tables, overlays, overflow, safe areas. Read when building a layout that ships to more than one width.

#### RX-RD-01 [Required] [Hard Gate] Stated viewport plus the smallest

- Do: Check the stated viewport and the smallest supported width, with no horizontal page scroll at either.
- Do not: Design for one width only.
- Why: Users meet the layout at many widths, including small Android phones. (WCAG 2.2 SC 1.4.10 (reflow at 320 CSS px))
- Not when: a desktop-only internal tool with a documented minimum width
- Trade-off: more widths to design and test
- Check: visual QA

#### RX-RD-02 [Required] Prioritize, simplify, reorganize

- Do: As space shrinks, decide what matters most, simplify what remains, then reorganize: stack, collapse, or move secondary content behind a control. Keep text size.
- Do not: Squeeze the desktop layout into a smaller viewport.
- Why: Shrinking keeps the layout and loses the reader. (WCAG 2.2 SC 1.4.10; responsive design practice)
- Not when: the content is already simple enough to stack as is
- Trade-off: mobile users may need a tap to reach secondary content
- Check: visual QA

#### RX-RD-03 [Required] Safe areas and thumb reach

- Do: Keep content inside the safe areas and the primary action within thumb reach on phones.
- Do not: Put the main action under the notch or the home indicator.
- Why: Hidden or hard-to-reach actions stall the task. (Apple HIG layout; Material layout guidance)
- Not when: desktop-only layouts
- Trade-off: bottom-anchored actions cover content and need scroll padding
- Check: visual QA

#### RX-RD-04 [Contextual] Tables and overlays on small screens

- When: the layout has a data table, or modals, drawers, or popovers
- Do: Pick a table's priority columns, then stack rows into labeled blocks or scroll the table inside its own container with the key column fixed; on phones, show overlays as a full-screen or bottom sheet with the close and primary actions reachable.
- Do not: Shrink a wide table until it is unreadable, scroll the whole page sideways, or show a desktop-sized modal that overflows a phone.
- Why: Tables carry comparisons and overlays can trap users when they overflow. (NNGroup mobile tables guidance; Apple HIG sheets; Material bottom sheets)
- Not when: the table is two or three columns and fits as is
- Trade-off: stacked rows lose side-by-side comparison
- Check: visual QA

#### RX-RD-06 [Preferred] [Quality Lock] Consistent responsive behavior

- Do: Make the same component adapt the same way wherever it appears.
- Do not: Collapse the same navigation differently on different pages.
- Why: Predictable adaptation is part of consistency. (Nielsen heuristic 4 (1994))
- Not when: a page has a genuinely different purpose that needs a different pattern; write down why
- Trade-off: shared behavior can be suboptimal for an individual page
- Check: visual QA

---

### Frontend implementation (RX-FE) · `knowledge/frontend.md`

Gate area CODE QUALITY. Covers the repo's own stack, semantic elements, one home for each piece of logic, tests, no invented logic. Read when writing or changing frontend code, including formatting, state, data logic that users see, and its tests.

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

#### RX-FE-07 [Preferred] Fit the codebase

- Do: Follow the formatting, naming, and patterns of the surrounding files; name things by what they hold or do; remove unused code, imports, and commented-out blocks.
- Do not: Introduce a new style, use data, temp, or helper without context, or leave dead code and empty TODOs behind.
- Why: Code that reads like its neighbors is easier to review, and dead code misleads the next reader. (Clean-code practice)
- Check: review

#### RX-FE-12 [Contextual] Rupiah formatting in code

- When: the product is built for the Indonesian market and shows Rupiah; elsewhere, use Intl with the user's locale and add no market-specific branches nobody asked for
- Do: Format the number with id-ID grouping and prepend Rp yourself.
- Do not: Rely on Intl currency style alone, which inserts a space after Rp.
- Why: The built-in output does not match the Rp1.250.000 form used in copy. (ryux run 2026-10-02: order-total.ts with and without ryux)
- Check: audit_copy C-07 on rendered strings

#### RX-FE-13 [Required] One home for each piece of logic

- Do: Put logic in the layer the repo already uses: components render, hooks or stores hold state, pure modules hold calculations, formatting, and validation, and one data-access layer talks to the API. Before writing a function, search for an existing one and reuse or extend it.
- Do not: Copy logic between components, add a near-duplicate helper, mix API calls or business logic into render code, or add a layer, abstraction, or pattern the repo does not use.
- Why: Logic with one home is changed once and tested once; copies drift apart and ship different behavior. (Clean-code practice; owner review 2026-10-06)
- Check: review

#### RX-FE-14 [Required] Test logic and critical flows

- Do: Write unit tests for every new or changed pure function (calculations, formatting, validation, state transitions), including edge cases such as zero, empty, maximum, and invalid input, and integration tests for critical flows (checkout, payment, form submit, sign-in) covering the success and failure paths. Use the repo's test runner and conventions; with none, propose one as an assumption and ask before adding the dependency. Run the tests.
- Do not: Ship changed logic without tests, write snapshot-only tests or tests that mock the code under test, or claim tested without running the tests.
- Why: Tests catch the regressions review misses, before users find them in production. (Testing practice; owner review 2026-10-06)
- Check: run the project's tests

---

### Visual QA (RX-QA) · `capabilities/qa.md`

Gate area VISUAL QA. Covers did the build match the intended design: compare, list deviations, fix, render again. Read when something visual has been implemented and is about to be called done, or a build must match a design.

#### RX-QA-01 [Required] Render, inspect, fix, render again

- Do: Render the result at the target viewport (browser, screenshot, or design-tool export), inspect the main state, one empty or error state, and the smallest supported width, rank issues by impact, fix from the top, and render again; if no render tool is available, say so in the report.
- Do not: Claim visual quality for a layout you have only seen as code, or fix by guesswork without checking the result.
- Why: Overlaps and clipping are invisible in source and obvious on screen; the loop turns a draft into a reviewed result. (ryux run 2026-10-02: two runs shipped overlaps they never saw)
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

#### RX-QA-06 [Preferred] Match the intended design

- Do: When a reference exists (a Figma or pen.dev frame, DESIGN.md, an approved screenshot), capture it and the build at the same viewport, compare spacing, typography, color, size, position, components, states, and responsive behavior, and list each deviation with its fix; without one, compare with at least one reference screen_id.
- Do not: Call the build done while it visibly differs from the design without saying so, or judge it only against itself.
- Why: Visual QA answers whether the build matches the intent; whether the design is good is Critique's question. (ryux visual QA loop; ryux evidence principle)
- Check: screenshot comparison, search_screens

---

### Anti-slop (RX-AS) · `knowledge/anti-slop.md`

Gate area ANTI-SLOP. Covers hard gates, purpose gates, quality locks, honest claims. Read when work is about to be delivered, or during visual refinement.

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
- Do not: Write "only 2 left", "offer ends tonight", or fake countdowns with nothing behind them.
- Why: Manufactured pressure erodes trust once users notice. (NNGroup credibility research; ryux run 2026-10-02: WhatsApp promo)
- Check: review

#### RX-AS-05 [Required] Decoration passes a purpose gate

- Do: For each potentially decorative pattern, answer "why does this exist?" with a real reason (grouping, emphasis, state, brand), or remove it.
- Do not: Keep cards, gradients, badges, shadows, or animation that have no reason.
- Why: Unjustified decoration is what makes AI-generated UI look the same. (ryux anti-slop principle)
- Check: review

#### RX-AS-06 [Required] [Hard Gate] Complexity with a reason

- Do: Remove elements, options, states, code paths, abstractions, and dependencies that serve no stated need.
- Do not: Add settings, sections, abstractions, or packages "for later", or features because similar products have them.
- Why: Unneeded complexity costs every user and every future change. (Nielsen heuristic 8; clean-code practice)
- Check: review

#### RX-AS-07 [Required] Claims match the evidence

- Do: Describe what was checked and how ("keyboard and focus checked; no automated accessibility test was available"). Call a reference an observed pattern, with where it was observed ("seen in 4 screens across 3 apps").
- Do not: Claim "pixel perfect", "fully accessible", "production ready", "senior-level", or "UX optimized" without evidence, or call a pattern "best practice" because real apps use it.
- Why: False confidence hides the work that is still needed. (ryux delivery principle)
- Check: review

#### RX-AS-08 [Required] Human designer notes

- Do: Have a person write the "why it works / weaknesses" judgment; an agent may summarize it.
- Do not: Let an agent author designer notes.
- Why: The human judgment is the point of the notes. (ryux data principle)
- Check: review

#### RX-AS-09 [Contextual] Clean is not the same as designed

- When: the surface is expressive: a hero, landing page, onboarding, empty state, or brand moment
- Do: Run the swap test honestly: replace the name and logo with a competitor's in the same category. If the layout, the visual, and the headline would still work for them, the surface has no point of view yet; give it one (RX-UI-12). Report the answer in the Delivery Gate.
- Do not: Treat a tidy, generic layout as done because it passes every other gate; generic restraint is slop too.
- Why: Removing slop is the floor, not the ceiling; interchangeable design makes the product forgettable. (ryux delivery principle; Critique Design Read: specificity)
- Not when: task UI, where familiarity is the point
- Trade-off: takes a design decision, not only removals
- Check: swap test; review
<!-- rules:end -->

## Installation via CLI

```bash
npx @ryuxdsgn/ryux install --agent claude          # or --agent all; see the README for every agent
```

RYUX 2 installs one folder, `ryux/`. Installing or updating removes the per-skill folders of RYUX 1.x
(`ryux-core`, `ryux-forms`, ...), and the old `--for`, `--groups`, and `--concerns` flags are no
longer needed. The browsable skill lives in [`skills/ryux/`](../skills/ryux).

## Mapping to code

Checks in `packages/core` (tool-local numbering `R-0x` and `C-0x`):

| RYUX rule | Check in code |
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

## Retired in rules 1.3

Rules 1.3 cut the rule set from 109 to 76. Retired IDs are not reused: each was merged into another
rule or moved into its skill's guide as guidance, so nothing was lost.

<!-- retired:start -->
| Retired ID | Now in |
| --- | --- |
| RX-PR-06 | ryux-product guide |
| RX-PR-07 | ryux-product guide; RX-AS-06 |
| RX-PR-08 | ryux-product guide |
| RX-UX-03 | ryux-ux guide |
| RX-UX-04 | ryux-ux guide |
| RX-UX-05 | RX-UX-02 |
| RX-UX-09 | ryux-ux guide |
| RX-IX-06 | RX-A11Y-03 |
| RX-IX-07 | ryux-interaction guide |
| RX-IX-08 | ryux-interaction guide |
| RX-FM-02 | ryux-forms guide |
| RX-FM-04 | ryux-forms guide |
| RX-FM-07 | ryux-forms guide |
| RX-EC-04 | RX-EC-03 |
| RX-EC-05 | ryux-edge-cases guide |
| RX-EC-08 | RX-EC-07 |
| RX-CD-06 | RX-CD-03 |
| RX-CD-07 | ryux-content guide |
| RX-CD-08 | ryux-content guide |
| RX-UI-02 | RX-AS-05 |
| RX-UI-06 | ryux-ui guide |
| RX-UI-08 | ryux-ui guide |
| RX-DS-04 | RX-DS-02 |
| RX-A11Y-05 | RX-A11Y-04 |
| RX-A11Y-09 | ryux-accessibility guide |
| RX-RD-05 | RX-RD-04 |
| RX-FE-03 | RX-A11Y-04 |
| RX-FE-04 | ryux-frontend guide |
| RX-FE-08 | RX-FE-07 |
| RX-FE-09 | RX-FE-07 |
| RX-FE-10 | RX-AS-06 |
| RX-FE-11 | ryux-frontend guide |
| RX-QA-02 | RX-QA-01 |
| RX-QA-05 | RX-QA-01 |
| RX-QA-07 | RX-QA-06 |
<!-- retired:end -->

## Migration from RX-1.x

The current rule set groups every rule by module. RX-1.x IDs map as follows; some old rules were merged, and some
were split across skills.

<!-- migration:start -->
| RX-1.x ID | Current ID |
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
| RX-C-10 | RX-CD-03, RX-AS-04 |
| RX-H-01 | RX-IX-02 |
| RX-H-02 | ryux-ux guide (retired RX-UX-09) |
| RX-H-03 | RX-IX-03 |
| RX-H-04 | RX-DS-02 |
| RX-H-05 | RX-IX-04 |
| RX-H-06 | RX-UX-08 |
| RX-H-07 | ryux-interaction guide (retired RX-IX-08) |
| RX-H-08 | RX-AS-05 |
| RX-H-09 | RX-EC-02 |
| RX-H-10 | ryux-content guide (retired RX-CD-07) |
| RX-H-11 | RX-A11Y-01 |
| RX-H-12 | RX-A11Y-02 |
| RX-H-13 | RX-A11Y-03 |
| RX-H-14 | RX-EC-01, RX-RD-01, RX-RD-03, RX-QA-03 |
| RX-K-01 | RX-FE-06 |
| RX-K-02 | RX-FE-07 |
| RX-K-03 | RX-FE-07 |
| RX-K-04 | RX-FE-07 |
| RX-K-05 | RX-AS-06 |
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
| RX-N-02 | RX-FM-01 |
| RX-N-03 | RX-FM-03 |
| RX-N-04 | ryux-forms guide (retired RX-FM-04) |
| RX-N-05 | RX-CD-04 |
| RX-N-06 | RX-IX-05 |
| RX-N-07 | RX-UX-02 |
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
