# RYUX: design rules and modules

> **© 2026 ryux (Redho Yurizal). License: MIT.** Original ryux.design ruleset.
> Written from scratch based on public standards and methods: **Nielsen's 10 usability heuristics
> (Nielsen, 1994)** and **Nielsen Norman Group UX research** (nngroup.com), **WCAG 2.2**,
> **Apple Human Interface Guidelines**, **Material Design**, and findings from ryux's own agent runs.
> A few rules share an idea with another MIT-licensed ruleset; each says so in its source line, and its
> text is written for RYUX. References to standards are factual; all explanations, examples, and
> numbering are written by us.
> **Not a derivative of any third-party licensed text** and not affiliated with NN/g or anyone else.
>
> **Version:** RYUX 2.14.1

RYUX is design intelligence for AI agents and designers, packaged as one skill, `ryux`. It has five
entry points: Analyze, Design, Build, Critique, and QA. The router (`SKILL.md`) picks the
knowledge modules each task needs. Anti-slop prevents bad, generic output; RYUX also guides good
design decisions. Three things make it distinctly RYUX: **evidence-based** decisions that say what
was observed, inferred, or unknown; a **global core** that adapts to the product's own market; and
**human judgment** for designer notes in the reference library (whose first screens come from
Indonesian products).

## Principle and workflow

Novelty is not a goal; a recognisable brand layer is: familiar structure, distinct surface. Optimize
for clarity, usability, consistency, product fit, accessibility, and intentional design decisions.

One workflow, six stages: Understand → Frame (task, priority, success criteria before any
alternative) → Explore (two or three alternatives that differ in hypothesis and structure) →
Evaluate and select (against the Frame criteria; the user picks) → Build and critique (render,
inspect, fix; Reconsider when a finding contradicts the choice) → Verify and deliver (Hard Gates and
the Delivery Gate). Each entry point runs the stages it needs.

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
| `knowledge/interaction.md` | Interaction design: before, during, result, recovery; feedback, confirmation, navigation, gestures, states, keyboard, local payments | RX-IX |
| `knowledge/forms.md` | Forms: labels, layout, validation, input preservation, autofill, submission, unsaved work, OTP, address, e-KYC | RX-FM |
| `knowledge/edge-cases.md` | Edge cases: data, form, network, permission, and system states beyond the happy path | RX-EC |
| `knowledge/content.md` | Content design: specific copy, action labels, error messages, terminology, and locale (money, dates, natural Indonesian when the copy is Indonesian) | RX-CD |
| `knowledge/ui.md` | UI design: the visual system of a product: hierarchy, type, layout, density, color, containers, icons, visual language, and detail craft | RX-UI |
| `knowledge/imagery.md` | Imagery and motion: art direction, composition, expressive surfaces, motion, asset sourcing and provenance, illustration, and delight | RX-UI |
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
| Form implementation | `knowledge/product.md`, `knowledge/ux.md`, `knowledge/forms.md`, `knowledge/interaction.md`, `knowledge/accessibility.md`, `knowledge/edge-cases.md`, `knowledge/content.md`, `knowledge/ui.md`, `knowledge/anti-slop.md` |
| Mobile UI | `knowledge/ux.md`, `knowledge/ui.md`, `knowledge/responsive.md`, `knowledge/accessibility.md`, `knowledge/anti-slop.md` |
| Checkout or payment | `knowledge/product.md`, `knowledge/interaction.md`, `knowledge/forms.md`, `knowledge/content.md`, `knowledge/edge-cases.md`, `knowledge/ui.md`, `knowledge/anti-slop.md` |
| Data-heavy view (list, table, dashboard) | `knowledge/ux.md`, `knowledge/edge-cases.md`, `knowledge/responsive.md`, `knowledge/design-system.md`, `knowledge/frontend.md`, `knowledge/ui.md`, `knowledge/anti-slop.md` |
| Frontend logic or utilities (formatting, state, data shown to users) | `knowledge/frontend.md`, `knowledge/content.md`, `knowledge/edge-cases.md` |
| AI feature (generated answers, summaries, drafts) | `knowledge/product.md`, `knowledge/ux.md`, `knowledge/content.md`, `knowledge/edge-cases.md`, `knowledge/anti-slop.md` |
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
| Unexplained interaction behavior | RX-IX-01, RX-IX-12 |
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
| Typeface choice | it is chosen for the product's character and legibility, not because it is the model's usual pick |
| Background patterns (grid, dots, noise) | they carry the identity or support the content, such as a canvas for a design tool |
| Arrows on buttons | the action moves the user somewhere (next step, another page), not on every button |
| Glass and blur | one surface needs to show what is behind it (an overlay over content), and text on it keeps its contrast |
| Glow | it marks the one element that needs attention, not every card, button, and icon |
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
| Radius | RX-UI-03, RX-DS-03 |
<!-- locks:end -->

## Delivery Gate

UI, UX, copy, and frontend work ends with this report:

<!-- gate:start -->
```
PRODUCT        PASS | FAIL | NOT VERIFIED | N/A  · one-line reason · evidence Strong | Thin | None
UX             PASS | FAIL | NOT VERIFIED | N/A  · one-line reason
CONTENT        PASS | FAIL | NOT VERIFIED | N/A  · one-line reason
UI             PASS | FAIL | NOT VERIFIED | N/A  · one-line reason · point of view: <concept> | task UI, signature: <signature> · illustration style: <where written> | none
DESIGN SYSTEM  PASS | FAIL | NOT VERIFIED | N/A  · one-line reason
ACCESSIBILITY  PASS | FAIL | NOT VERIFIED | N/A  · one-line reason
RESPONSIVE     PASS | FAIL | NOT VERIFIED | N/A  · one-line reason
EDGE CASES     PASS | FAIL | NOT VERIFIED | N/A  · one-line reason · then the view × state matrix (RX-EC-01)
CODE QUALITY   PASS | FAIL | NOT VERIFIED | N/A  · one-line reason
VISUAL QA      PASS | FAIL | NOT VERIFIED | N/A  · one-line reason
ANTI-SLOP      PASS | FAIL | NOT VERIFIED | N/A  · one-line reason
FINAL          PASS | FAIL | NOT VERIFIED
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
The point is that every rule can be traced, not that the counts score them. Read each rule's Why
line below for its exact source.

<!-- provenance:start -->
| Source cited | Rules citing it | Rules citing only this |
| --- | --- | --- |
| Public standard or research | 70 | 52 |
| Industry practice | 14 | 5 |
| Observed in a RYUX run | 15 | 8 |
| Pattern also in another MIT ruleset (text written for RYUX) | 4 | 4 |
| RYUX principle, taxonomy, or review | 35 | 19 |

All 113 rules cite a source; 25 cite more than one kind, so the "Rules citing it" column adds up to more than 113.
<!-- provenance:end -->

## Rules

Generated from `packages/cli/src/content.ts` by `pnpm sync:skills`. Edit the rules there, not here.

<!-- rules:start -->
113 rules across 14 modules: 59 Required, 20 Preferred, 34 Contextual; 17 Hard Gates and 11 Quality Locks.

### Product thinking (RX-PR) · `knowledge/product.md`

Gate area PRODUCT. Covers user, task, goal, primary action, constraints, assumptions, and decisions backed by evidence. Read when starting a new screen or flow, choosing between patterns, or when the scope is unclear.

#### RX-PR-01 [Required] State the context first

- Do: Before designing, write down the user, their task, the business goal, the design intent (what the user must understand, feel, and do), the information that matters, the primary action, the constraints, and what success looks like.
  - Take what the prompt and DESIGN.md already give.
  - Ask only when a missing answer materially affects the user flow, what the product can do, or whether the content is correct, or when neither the prompt nor DESIGN.md sets the UI or motion direction: at most three questions in one message, most consequential first, none when the context is complete.
  - Otherwise make the smallest reasonable assumption, write it down, and continue.
- Do not: Start from a generic template with no stated user or task, or ask questions the prompt or DESIGN.md already answers.
- Why: Without a task, design and review drift into taste. (`capabilities/critique.md` playbook; NNGroup task-based evaluation)
- Check: review

#### RX-PR-02 [Required] [Hard Gate] Unknowns stay assumptions

- Do: Sort what the brief does not say into three kinds:
  - Design assumptions (low-risk visual or structural choices such as a merchant category icon or grouping by date): decide them from the context.
  - Unconfirmed capabilities (an action or feature the category usually has, such as sharing a receipt): convention is not proof, so ask when it materially changes the flow or scope; otherwise you may propose it, listed as unconfirmed, never as a requirement.
  - Users: without research data, describe them as a proto-persona labelled as assumptions, with the questions to ask real users; answers from an AI-simulated user are hypotheses, never research findings.
  - Facts, claims, and policies: take them only from the brief, the repo, or the product's own docs (feature and tool names, commands, integrations, platforms, pages, fees, timings, guarantees).
- Do not: Invent business rules, policies, guarantees, metrics, user data, permissions, pricing, requirements, or API behavior, or name a tool, command, integration, platform, or page the product does not have. Do not present an unconfirmed capability as a confirmed one.
- Why: Invented facts turn into promises and bugs that someone has to unwind; a screen trimmed to the brief's literal words reads unfinished and hides what still needs confirming. (ryux run 2026-10-02: an unconstrained agent invented a 30-day trial and user counts; ryux visual benchmark 2.6 human rater, 2026-10-13: RYUX screens lost on a missing receipt action; NNGroup proto-personas and synthetic users (AI output is hypotheses, not research))
- Not when: This rule is not a reason to drop content the brief implies or to leave a screen looking unfinished: sample content is RX-AS-03, design assumptions are yours to make.
- Check: compare every product fact on the screen (features, prices, fees, policies, names, integrations) with the brief, DESIGN.md, docs, or repo; each is sourced or labelled as an assumption; fails on one shown as fact without a source

#### RX-PR-03 [Required] [Hard Gate] One clear goal; one primary action when the task has one

- Do: Give each screen one clear, dominant goal. When the task has a clear next step (a form, checkout, a confirmation), give it one primary action and make secondary actions look secondary.
- Do not: Put two equal-weight calls to action side by side, or leave the screen's goal unclear.
- Why: A single clear path shortens the decision and the task. (Hick's law (Hick 1952; Hyman 1953): more options, longer decisions; NNGroup visual hierarchy)
- Not when: Monitoring and configuration screens (dashboards, settings) need a clear goal but not a single dominant action; do not invent one to satisfy this rule.
- Check: name the screen's goal and its primary action, then count the controls styled as primary in the main state; fails when two compete at the same weight

#### RX-PR-04 [Required] Back decisions with real screens

- Do: Cite at least one real screen_id for each meaningful design decision, or label it a judgment call with no reference.
- Do not: Claim "apps usually do X" without a screen to show it.
- Why: A cited screen makes a decision checkable instead of a matter of opinion. (ryux evidence principle)
- Check: search_screens, delivery_gate

#### RX-PR-05 [Required] The product's market first

- Do: Start from how users in the product's own market pay, sign in, write addresses, and read money and dates; check a pattern from another market before reusing it.
  - Take the market from the brief or the codebase, and ask when it is unclear.
  - When the brief does not name payment methods (or another market-standard capability), show the market's standard set as unconfirmed capabilities, labeled as proposed in Assumptions, rather than leaving them out: a market's table stakes are not "for later" (RX-AS-06). Ask when the set would change the flow.
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

#### RX-PR-11 [Contextual] An AI feature has a written standard for its output

- When: the product shows content generated by AI: an answer, a summary, a draft, a recommendation
- Do: Before designing it, write what good and bad output look like, per kind of response:
  - Sort the responses the feature gives (a short answer, an open explanation, a list, a draft, a refusal) and write pass criteria for each kind, concrete enough for a reviewer to check: "answers the question in the first sentence; at most two related details", not "not too verbose".
  - Design the states generated output brings: a long and a short answer, no answer or a refusal, an answer that is wrong, slow generation, and a failed request (RX-EC-01).
  - Hand the criteria to the team as the feature's test: real inputs checked against them before launch, and again after every model or prompt change.
- Do not: Design an AI feature around one ideal sample answer, judge its output by feel, or leave out the states where the output is wrong, empty, or slow.
- Why: Generated output cannot be specified exactly, so the design is only as good as its definition of good; a screen built around one perfect answer breaks on the next one. (NNGroup design critique in the AI era (criteria per response type; judge, evaluate, iterate; watch for regressions); RX-EC-01)
- Not when: AI that works behind the scenes and shows users no generated content
- Trade-off: criteria per response type take time before the first screen and need real inputs to write well
- Check: review: a criteria list per response type, and the wrong, empty, slow, and failed states in the design

---

### UX architecture (RX-UX) · `knowledge/ux.md`

Gate area UX. Covers information architecture, navigation, flows, grouping, disclosure, search and filters. Read when designing multi-screen flows, navigation, or data-heavy views.

#### RX-UX-01 [Required] Structure from the user's goal

- Do: Choose the information architecture and pattern from what users come to do and how they look for it. Keep together what the user checks together, and show each fact once.
- Do not: Apply a stock SaaS layout (sidebar, KPI cards, table) because it is familiar, or show the same fact twice on one screen (the merchant or the amount in the summary and again in a row, the balance in the header and in a card).
- Why: The right structure depends on the task; a template answers a different question. A repeated fact costs reading time and leaves the user to wonder which one is right. (NNGroup information architecture research; Gestalt proximity and common region (Palmer 1992): items close together or in one container read as one group; ryux four-problems blind rating, rater 1 (product designer), 2026-10-16: repeated facts were a reason not to ship)
- Not when: the product already has an established structure users rely on; change it only with evidence
- Trade-off: a less familiar layout can cost users a moment of learning
- Check: review

#### RX-UX-02 [Preferred] Where am I, what's left, how do I leave

- Do: Give each screen a clear title and keep a back or cancel path visible; in multi-step flows show the current step ("Langkah 2 dari 3") and a summary the user can review before committing. Show how close the goal is, and let an interrupted task resume where it stopped instead of starting over.
- Do not: Leave screens without a title or a way out, or run a multi-step flow with no sense of progress or review.
- Why: Orientation, progress, and an exit lower anxiety and abandonment. (NNGroup wayfinding and progress-indicator research; Nielsen heuristic 3; goal-gradient effect (Hull 1932; Kivetz, Urminsky and Zheng 2006): people speed up as the goal comes into view; Zeigarnik effect (Zeigarnik 1927): unfinished tasks stay on the mind, so a resumable task is less likely to be abandoned)
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

#### RX-UX-08 [Preferred] Recognition over recall; the product carries the load

- Do: Show options and context (recent items, saved addresses, visible choices) instead of asking users to remember them.
  - Take over what users would otherwise read, remember, or decide: a smart default from the last choice, information they entered shown again where they need it, a picture where it is faster than text, and familiar patterns that need no learning.
  - Cut extraneous load (decoration, redundant links, meaningless type flourishes, a new pattern for a solved problem) and keep the intrinsic load, the content and decisions that are the task itself.
- Do not: Make users retype or recall information the app already has, or cut content the task needs to make the screen look lighter.
- Why: Working memory is small; every task the product takes over leaves more of it for the decisions that matter. (Nielsen heuristic 6 (1994); limited working memory (Miller 1956; Cowan 2001); NNGroup minimize cognitive load (intrinsic and extraneous load; avoid clutter, build on mental models, offload tasks))
- Not when: a one-time task, where showing history or saved values adds clutter
- Trade-off: higher visual density; more on screen to scan
- Check: heuristic_eval H-06

#### RX-UX-10 [Required] Change what is broken, keep what works

- Do: Before changing an existing screen or flow, list what works today (from Analyze, the user, or analytics) and keep it. Every significant change names the problem it fixes and its evidence (a Critique finding, a user report, a metric); a pattern with no named problem stays as it is. Report what was kept as well as what changed.
- Do not: Replace a working layout, component, or interaction for novelty; restyle parts the brief did not ask to change; or treat "more modern" as a problem by itself.
- Why: A redesign that throws away what people already know costs them relearning and can make the product worse while looking newer. (ryux design principle (owner, 2026-10-19); Jakob's law (people expect a product to work like the ones they already know); ryux run: judge and motion benchmarks 2026-10-18; written for RYUX)
- Not when: a new product or screen with nothing to keep, or a brief that asks to replace the whole design
- Trade-off: a redesign can look less new; the gain is in fewer regressions and less relearning
- Check: the change list, each with its problem and evidence; the kept list; review

#### RX-UX-11 [Contextual] Accelerators for frequent users

- When: people use the product often (daily payments, ordering, messaging, work tools)
- Do: Give frequent users faster paths that novices can ignore: recent and saved items, repeat order or transfer, defaults from the last choice, search that jumps to an action, and keyboard shortcuts or gestures where the platform has them.
  - Keep every accelerator a second path: the visible, standard path still works and stays the one a new user sees.
- Do not: Make a gesture or shortcut the only way to an action, or fill a first-time screen with power-user controls.
- Why: The same product serves first-time and daily users; accelerators save the daily user time without costing the newcomer clarity. (Nielsen heuristic 7 (flexibility and efficiency of use); NNGroup 10 usability heuristics)
- Not when: a one-off or rarely used flow (a sign-up, a yearly tax form)
- Trade-off: each accelerator is one more thing to design, test, and keep consistent
- Check: heuristic_eval H-07

#### RX-UX-12 [Contextual] A test plan travels with the design

- When: the work is a new flow or a consequential change (payment, sign-up, navigation, a core task)
- Do: Close the design or build with a usability test plan a person can run; RYUX prepares it, people run it:
  - research questions: the open unknowns, the Frame success criteria, and the heuristic evaluation findings marked as needing a test
  - three to five task scenarios that are realistic, ask the participant to do something rather than describe it, and use none of the interface's labels or steps ("Kamu ingin membayar pesanan makan siang dengan saldo e-wallet", not "Ketuk Bayar lalu pilih GoPay")
  - participants: five per user group for a qualitative test; at least twenty when the goal is a number
  - a success measure per task, taken from the Frame criteria
  - after launch: the metrics to watch (task success, time on task, errors, completion, support tickets) and the baseline to measure before release
  - Plan at least two rounds of test and fix; a result that changes the context or the criteria sends the work back to Understand or Frame.
- Do not: Claim the design was tested with users, present AI-simulated users as participants, or write tasks that name the buttons to tap.
- Why: Rules and heuristics find likely problems; only people using the design show which ones are real, and a baseline is what makes the after-launch number mean something. (NNGroup usability testing 101; NNGroup how many test users (5 per group, 20 for quantitative); NNGroup task scenarios; NNGroup iterative design (at least three versions); NNGroup establishing baselines; NNGroup design thinking (test and implement))
- Not when: a small change (a colour, one label, spacing) or when the user says no test plan
- Trade-off: a plan nobody runs is only a list; say who should run it and when
- Check: review

---

### Interaction design (RX-IX) · `knowledge/interaction.md`

Gate area UX. Covers before, during, result, recovery; feedback, confirmation, navigation, gestures, states, keyboard, local payments. Read when adding or changing anything the user can act on.

#### RX-IX-01 [Required] [Hard Gate] Before, during, result, recovery

- Do: For each meaningful action, decide what the user sees before acting, while it runs, when it finishes, and how they recover if it fails. Make the result the clearest moment of the flow: what happened, the detail the user will check, and the next step.
- Do not: Ship an action whose in-progress, result, or failure behavior is undefined.
- Why: Undefined behavior becomes inconsistent behavior once it is implemented. (Nielsen heuristics 1 and 9; peak-end rule (Kahneman et al. 1993): people judge an experience largely by its most intense moment and its end; ryux interaction model)
- Not when: trivial actions with no wait and no failure mode (toggling a local view)
- Trade-off: more states to design, build, and test
- Check: for each async action, point to its before, during, result, and recovery states in the render or the design file; fails on any that is missing

#### RX-IX-02 [Required] Feedback that matches the wait

- Do: Give an immediate pressed state; past about 1 second show a loading indicator; past about 10 seconds show progress with an estimate or let the user leave and come back. A loading skeleton has the shape of the layout it stands in for: the same blocks in the same places, so nothing jumps when the content arrives.
- Do not: Let a payment or save run with no visible status.
- Why: Silence during a wait reads as failure and invites double taps. (Nielsen response-time limits (0.1 / 1 / 10 s); Nielsen heuristic 1; Doherty threshold (Doherty and Thadani 1982): responses under about 400 ms keep people engaged; skeleton shape: pattern also in appllama-app-design-skill (MIT); written for RYUX)
- Not when: instant actions under about 0.1 s; a spinner that flashes is noise
- Trade-off: progress indicators need real progress data; a fake bar misleads
- Check: heuristic_eval H-01

#### RX-IX-03 [Required] Cancel, back, and undo

- Do: Let users cancel, go back, or undo without losing their work; where a step is genuinely irreversible, say so before it. A finished flow is the exception: back leaves it instead of reopening it (RX-IX-14).
- Do not: Trap users in a flow with no exit.
- Why: Freedom to back out makes people willing to explore. (Nielsen heuristic 3 (1994))
- Not when: the step is genuinely irreversible once confirmed (a sent transfer); say so up front instead
- Trade-off: undo needs soft-delete or delayed execution in the backend
- Check: heuristic_eval H-03

#### RX-IX-04 [Required] Protect high-impact actions by reasoning

- Do: Weigh each destructive or costly action: is it reversible, how big is the impact, how easy is recovery? Prefer undo for reversible actions; confirm with the specifics (amount, recipient, item) when it is irreversible and costly; skip confirmation when it only adds friction.
  - A confirmation restates the request and its effect ("Hapus 3 foto dari album Liburan? Foto tidak bisa dikembalikan."), and its buttons name the outcomes ("Hapus foto" and "Batal"), never Ya/Tidak or OK.
  - Give a destructive confirmation no default button; ask for typing a word only for the rarest, most dangerous actions.
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

#### RX-IX-12 [Required] Every control leads somewhere real

- Do: Give every link, button, tab, menu item, and form a destination or an effect that exists: a page or section that is there, an action that runs. A control whose target is not built yet is removed, or shown disabled with the reason.
- Do not: Ship navigation to sections that do not exist, buttons that do nothing, or forms that pretend to submit.
- Why: A dead control breaks trust the moment someone tries it, and it hides what the product really does. (pattern also in anti-slop (MIT) R-24, R-26; written for RYUX)
- Check: click every control in the render; review

#### RX-IX-13 [Required] Each transition means one thing

- Do: Choose how a screen arrives by what it means, and keep that meaning across the product:
  - push to go one level deeper (back returns)
  - replace to move to a new stage (back does not return to the old one)
  - a modal for a self-contained task the user finishes or cancels
  - a sheet for a short interruption that keeps the screen behind it in view
  - Follow the platform's back gesture and button.
- Do not: Open the same kind of screen as a push in one place and a modal in another, push a step the user can never usefully go back to, or put a long multi-step task in a sheet.
- Why: People predict where back goes from how a screen arrived; a mixed model makes every exit a guess. (Apple HIG and Material navigation; pattern also in appllama-app-design-skill (MIT), navigation semantics; written for RYUX)
- Check: review the flow map; click back on every screen in the render

#### RX-IX-14 [Required] One-way doors

- Do: Once a payment, submission, or onboarding is complete, the result screen replaces the flow: back goes to where the user started, never into the finished steps. Block back only in two cases, while a request is in flight and while there is unsaved work, and say why on the screen ("Processing payment, please wait", or a discard confirmation).
- Do not: Let back reopen a paid checkout or a submitted form, or block back for any other reason.
- Why: Going back into a finished payment invites a double charge or a confused resubmission; blocking back without a reason feels like a trap. (Nielsen heuristic 3; pattern also in appllama-app-design-skill (MIT), one-way doors; written for RYUX)
- Not when: a draft the user can reopen and edit on purpose
- Check: walk the flow and press back on each step, including after completion

#### RX-IX-15 [Contextual] Gestures follow the finger

- When: the design uses direct manipulation: drag, swipe, pull to refresh, a draggable sheet or card
- Do: Track the finger from where the element is, keep the release velocity when the user lets go, let the user catch it again mid-animation, resist with a rubber band at the edges, and use one set of spring values across the product.
- Do not: Jump to a fixed start point when the gesture begins, ignore how fast the user flicked, or lock the element until its animation ends.
- Why: A gesture that keeps up with the hand feels like moving a real object; one that lags or snaps feels broken. (Apple HIG gestures; pattern also in appllama-app-design-skill (MIT), gestures; written for RYUX)
- Check: record the gesture and step through the frames (capabilities/qa.md)

#### RX-IX-16 [Contextual] Haptics as punctuation

- When: the product runs as a native mobile app with haptic feedback
- Do: Use at most one haptic per action, at the same moment as its visual change, for meaningful moments (a payment confirmed, a toggle set, an error), and follow the system setting.
- Do not: Make haptics the only feedback, fire them while scrolling or on repeated events, or stack several for one action.
- Why: Haptics confirm what the eye already sees; used constantly they become noise and drain attention. (Apple HIG playing haptics; pattern also in appllama-app-design-skill (MIT); written for RYUX)
- Check: review the interaction spec

#### RX-IX-17 [Preferred] Choices that change the price sit with the price

- When: a screen shows a total that the user's choices change: payment method, insurance, delivery or service tier, add-ons
- Do: Show each price-changing choice with its current value and its cost inline on the screen that shows the total, so the user sees what they pay for before they confirm.
- Do not: Hide a choice that changes the price behind a list row or a later screen, or show the total without the choices that make it up.
- Why: People check a total against the choices behind it; a cost they cannot see next to the total reads as a surprise fee. (ryux run: blind review of a delivery checkout 2026-10-20; NNGroup visual hierarchy; written for RYUX)
- Not when: a single fixed price with no choices on the screen
- Trade-off: a longer checkout screen; group the choices so the total stays visible
- Check: review the checkout render: every price-changing choice visible next to the total

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

- Do: Match the keyboard to the input (numeric for amounts, phone numbers, and OTP) and support autofill and paste. Accept the formats people type or paste (spaces, dashes, a country code or a leading zero) and normalize them in the product.
- Do not: Show a text keyboard for numbers or block pasting codes.
- Why: The right keyboard removes taps and typos on phones. (HTML inputmode and autocomplete (one-time-code); platform input guidance; robustness principle (Postel, RFC 761, 1980): be liberal in what you accept)
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
- Check: write a matrix in the Delivery Gate: each data view or action × loading / empty / error / success → frame name, or "cannot happen: reason"; a blank cell is a FAIL; audit_ui when the ryux MCP is connected

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

Gate area CONTENT. Covers specific copy, action labels, error messages, terminology, and locale (money, dates, natural Indonesian when the copy is Indonesian). Read when writing or reviewing any user-facing text.

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

- Do: Lead with the point and cut words that add length without meaning; write labels as RX-CD-12 says; use sentence case and plain lists, with at most one emoji where the channel expects it.
- Do not: Use vague labels ("Submit", "Learn more", "Get started" when a specific action exists), hype words ("unlock", "elevate", "seamlessly", "revolutionary", "next-generation"), emoji bullets, ALL CAPS, or stacked exclamation marks.
- Why: Specific, plain copy tells users what happens next; decoration on every line buries it and reads as generated. (NNGroup 3 C's of informational microcopy (clarity, concision, character); NNGroup button and link-label guidance; ryux run 2026-10-02: unconstrained WhatsApp copy)
- Check: audit_copy

#### RX-CD-04 [Required] Errors: what, why, how to recover

- Do: Say what happened, why when it helps the user act, and how to recover, next to where it happened, without blaming the user.
- Do not: Show codes like TXN_0x8004 or "Something went wrong" on their own.
- Why: Users can only recover from what they understand. (NNGroup error-message guidelines)
- Check: audit_copy C-04

#### RX-CD-05 [Required] [Quality Lock] One name per thing

- Do: Use one term for each concept across screens, buttons, and messages.
  - Use one label for each intent too: the same action is "Start" everywhere, not "Start" here and "Let's start" there.
  - Write product and brand names exactly as the brief or brand guide gives them, including the wordmark; when an older design in the file disagrees with the brief, follow the brief and say so.
- Do not: Call the same thing "pesanan", "order", and "transaksi" on different screens, or restyle a brand name (RYUX as "ryux") because an older frame did.
- Why: Changing terms make users wonder whether it is a different thing; a misspelled brand name looks careless or fake. (Nielsen heuristic 4 (1994); ryux run 2026-10-02: pen.dev hero wordmark)
- Check: review

#### RX-CD-09 [Contextual] Dates, times, and numbers in Indonesian form

- When: the copy is in Bahasa Indonesia; other markets follow their own locale
- Do: Write dates as 2 Okt 2026 or Jumat, 2 Oktober 2026; times as 14.30 in 24-hour form, with WIB, WITA, or WIT when the time zone matters; decimals with a comma (1,5) and thousands with a dot (12.500); phone numbers as +62 812-3456-7890.
- Do not: Write 10/02/2026, 2:30 PM, or 1.5 in Indonesian copy.
- Why: Slash dates are ambiguous and English number formats read as foreign or as the wrong value. (PUEBI number and time notation; id-ID locale conventions)
- Check: audit_copy C-08

#### RX-CD-10 [Contextual] A FAQ answers questions people ask

- When: The page has a FAQ or help section.
- Do: Take the questions from support data, sales calls, the brief, or the product's docs, and answer them with the product's real policies; mark an answer that nobody has confirmed as [CONFIRM].
- Do not: Fill a FAQ with template questions ("Is it secure?", "Can I cancel anytime?") or answer with policies nobody decided.
- Why: A template FAQ answers nothing, and an invented answer becomes a promise someone has to keep. (pattern also in anti-slop (MIT) R-28; written for RYUX)
- Check: review

#### RX-CD-11 [Preferred] Tone fits the moment, voice stays

- Do: Set a tone profile once, from the brand and the users, on four scales: formal to casual, serious to funny, respectful to irreverent, matter-of-fact to enthusiastic; add a few tone words and the anti-tone words to avoid ("hangat, tidak sok akrab").
  - Keep the voice the same everywhere and shift the tone with the user's state: matter-of-fact and serious for errors, money, and waiting; brief for success, where a check mark already says it worked ("Alamat disimpan", without "berhasil" unless the voice wants the warmth); warmer only in onboarding and empty moments.
  - Add personality only where it costs no clarity or length: clarity first, concision second, character third.
- Do not: Joke in an error or a payment failure, cheer on a routine save, or switch between "kamu" and "Anda" across screens.
- Why: The same words feel caring in one moment and careless in another; tone measurably changes how users judge a product. (NNGroup tone-of-voice dimensions (four dimensions; tested tone profiles); NNGroup 3 C's of informational microcopy)
- Not when: the brand guide already defines the tone; follow it
- Trade-off: a sober tone in serious moments gives up some brand flavour
- Check: review

#### RX-CD-12 [Required] Labels say what happens

- Do: Start a button with a verb and name the result ("Bayar Rp45.000", "Simpan alamat", "Lanjut ke pembayaran"), in about four words or fewer.
  - Make a link meaningful on its own, as if it is the only thing read: specific ("Lihat syarat promo", not "Selengkapnya"), front-loaded, and sincere: the screen it opens is the one it promised.
  - Keep a label and the title of the screen or dialog it opens the same words (RX-CD-05).
- Do not: Use "Submit", "OK", "Klik di sini", "Selengkapnya", or "Get started" when a specific action exists, or a label that promises one thing and opens another ("Lihat detail & pesan" that opens a contact form).
- Why: Users read the label, not the text around it; a label that breaks its promise costs trust on the next tap. (NNGroup better link labels (4Ss: specific, sincere, substantial, succinct); NNGroup UI copy guidance on command names; NNGroup button and link-label guidance)
- Check: audit_copy

#### RX-CD-13 [Required] Empty states teach and lead

- When: a list, search, inbox, or dashboard can be empty
- Do: Show an empty state only after loading has finished, and say plainly that nothing is here yet.
  - Tell the user what will appear here and how to fill it, in brief, explicit steps ("Simpan tempat favorit dengan ikon hati, nanti muncul di sini").
  - Give one direct action that starts that task, and keep a no-results state apart from a first-use state: name the active filters and offer to clear them.
- Do not: Leave the area blank, show "Belum ada data" alone, flash an empty state while data is still loading, or describe what to do without how.
- Why: An empty area is the moment users learn what a feature is for; a premature or bare message reads as broken. (NNGroup designing empty states in complex applications (system status, learning cues, direct pathways))
- Trade-off: each empty state needs its own copy and action
- Check: review; the view × state matrix (RX-EC-01)

#### RX-CD-14 [Contextual] Notifications and permission requests earn their place

- When: the product sends push notifications or asks for a device permission
- Do: Make each notification self-sufficient: what happened, what the user needs to do, and when ("Paketmu tiba besok, 10.00–12.00"), understandable without opening the app.
  - Combine bursts into one notification and send only what the user would want, with notification settings inside the app.
  - Ask for a permission in context, after the user has seen the value, and say what they get in plain words ("Izinkan lokasi untuk melihat tempat baca terdekat").
- Do not: Ask for notifications on first launch, promise "pengalaman yang lebih baik", send several alerts at once, or truncate the one fact that matters.
- Why: Notifications compete with everything on the phone; an irrelevant or unclear one gets the whole channel turned off. (NNGroup mobile push-notification mistakes; NNGroup permission-request design considerations)
- Not when: the operating system or a regulation sets the wording
- Trade-off: fewer notifications means fewer re-engagement chances
- Check: review

#### RX-CD-15 [Required] The user's words and order

- Do: Use the words, phrases, and concepts your users use, taken from the brief, support tickets, research, or the market's own apps, not the team's internal or system terms ("Saldo", not "Wallet balance ledger"; "Pesanan", not "Order entity").
  - Put information in the order people expect from the real world: an Indonesian address from street to province, a receipt from items to total, a schedule from date to place.
  - Explain a term that cannot be avoided where it first appears, in one line.
- Do not: Show database field names, status codes, internal feature names, or a translation of the team's English jargon ("Disbursement pending", "Status: PROCESSING_2").
- Why: Users should understand a screen without looking up a word; a term from the system's model makes them translate before they can act. (Nielsen heuristic 2 (match between the system and the real world); NNGroup 10 usability heuristics)
- Not when: an expert tool whose users share the domain's technical terms; use their terms
- Trade-off: the user's word may differ from the term the code and the team use, so the two need a written mapping
- Check: heuristic_eval H-02

#### RX-CD-16 [Contextual] Help where the question comes up

- When: a task has a step users may not understand on their own (a fee, a verification, a setting with consequences)
- Do: First make the step clear enough to need no help; when it still needs some, put it in context at that step (a line of helper text, a tooltip, an info sheet), not only in a help centre.
  - Write help as concrete steps for the user's task, and make longer help searchable by the words users type.
- Do not: Send users to a generic FAQ or a help centre home for a question about one field, or explain the interface instead of the task.
- Why: Help is read only at the moment of doubt; help elsewhere is help nobody finds. (Nielsen heuristic 10 (help and documentation); NNGroup 10 usability heuristics)
- Trade-off: help in context adds text to the screen; keep it to the steps that need it
- Check: heuristic_eval H-10

---

### UI design (RX-UI) · `knowledge/ui.md`

Gate area UI. Covers the visual system of a product: hierarchy, type, layout, density, color, containers, icons, visual language, and detail craft. Read when doing visual design or visual refinement.

#### RX-UI-01 [Required] [Quality Lock] Hierarchy follows priority

- Do: Make the primary action and the key information the most prominent things in each area, with one clear focal point.
  - Place each control next to the data it changes (a hide-balance toggle beside the balance it hides, not in the header).
  - Make the primary action read as an action, not a place: its own button with an action label. It may sit in the center of a bottom bar when it is clearly different from the tabs (its own shape, color, and size, with room around it), but it is never styled as one of the tabs and never crammed between them.
  - Use one display size per screen, for its single most important number or heading.
- Do not: Give everything equal weight, let decoration outrank content, park a control far from what it acts on, or make the main action look like one more tab.
- Why: Hierarchy is how users know what to read and do first; a control beside its data shows what it changes, and an action that looks like a tab reads as a place, not a task. (NNGroup visual hierarchy; Gestalt proximity; Fitts's law (Fitts 1954) for the primary action's size and reach; ryux four-problems blind rating, rater 1 (product designer), 2026-10-16: a hide toggle far from the balance and a CTA crowding the bottom nav were reasons not to ship; explore-judge blind rating 2026-10-18: the same rater shipped a screen with a distinct centered pay button in the bottom bar)
- Not when: screens with several equal peers, such as a dashboard of comparable items; use consistent hierarchy within each card instead
- Trade-off: emphasizing one thing de-emphasizes the rest
- Check: visual QA

#### RX-UI-03 [Preferred] [Quality Lock] One spacing and type scale

- Do: Use the project's spacing and type scale, or define one (for example multiples of 4 or 8), and align elements to a shared grid.
  - Keep a screen's main content to two or three text sizes, the most important the largest, and count them on the render (RX-AS-10).
  - State the shape lock in one sentence, a radius per component role ("action buttons pill, cards 16, inputs 12, sheets 28").
  - Keep emphasis inside the type family (weight or size), not a second face dropped into one word.
- Do not: Pick spacing and sizes one element at a time.
- Why: A scale produces rhythm and makes hierarchy legible. (Material Design 8dp grid; NNGroup principles of visual design (scale: two or three sizes); shape lock and in-family emphasis: pattern also in appllama-app-design-skill (MIT); written for RYUX)
- Not when: a one-off marketing piece outside the product
- Trade-off: a scale limits choices; occasional exceptions need a written reason
- Check: count radii and type faces (RX-AS-10); review

#### RX-UI-04 [Preferred] [Quality Lock] A palette with roles

- Do: Use a small set of colors with defined roles: surface, text, accent for the primary action, and status colors.
  - Pick one grey family, warm or cool, for surfaces, borders, and secondary text.
  - Elements that behave the same look the same, and elements that behave differently look different: a destructive action has its own color role, not the primary accent.
  - Lower importance with size, weight, or position, never by lowering text contrast.
- Do not: Introduce new colors per component, or use the accent for decoration.
- Why: When color has a role, the accent and status colors mean something. (ryux visual principle; NNGroup principles of visual design (contrast signals a different function; similarity); isolation effect (von Restorff 1933): the one item that differs is the one remembered, so the accent marks only the primary action; one grey family: pattern also in appllama-app-design-skill (MIT); written for RYUX)
- Not when: data visualization, which needs its own categorical or sequential palette
- Trade-off: fewer colors means relying on type and space for emphasis
- Check: count accent hues and grey families (RX-AS-10); review

#### RX-UI-05 [Preferred] Layout from content, not a template

- Do: Choose the layout from the content, the task, and the reference screens. Set the balance on purpose: symmetric for calm, focused screens, asymmetric for dynamic ones. On the render, check that visual weight is distributed, counting element size and not only the number of elements, with no side left empty or heavy without a reason.
- Do not: Default to hero, three feature cards, and a logo wall.
- Why: Template layouts look interchangeable and hide what is specific to the product. (ryux anti-slop principle; NNGroup principles of visual design (balance))
- Not when: a standard pattern users expect fits the content (a settings list, a table); familiarity is the right choice
- Trade-off: custom layouts cost design and build time
- Check: review

#### RX-UI-10 [Preferred] Visual language is chosen, not defaulted

- Do: Derive the art direction from the brand, the audience, the product context, and reference screens, and write it as a Visual Brief (template in knowledge/imagery.md) (objective, concept, composition, color, material, lighting, motion, avoid) before designing an expressive surface or generating images, 3D, or motion.
  - For a new product, decide the brand direction before the tokens, task UI included: palette, type, and shape follow from the product's character (fast, warm, trusted, and so on), not from the one accent that passes contrast.
- Do not: Reach for the category cliché (coins, money rain, floating dashboards, or gradient blobs for fintech; generic 3D characters for any app), or write an image prompt without a brief (role, concept, composition).
- Why: A default visual language makes the product interchangeable with its competitors. (art direction practice; RX-AS-05 purpose gate)
- Not when: an existing brand system already defines the visual language; follow it
- Trade-off: a brief takes time before any image exists
- Check: the Visual Brief; review

#### RX-UI-14 [Preferred] [Quality Lock] Type that is set, not only sized

- Do: Set the type, not only its size:
  - body paragraphs at 45 to 75 characters per line, checked in the render
  - line-height from size: about 1.5 for body, 1.2 to 1.3 for headings, about 1.1 for display
  - small uppercase labels opened slightly (about 0.05em), large display text tightened slightly
  - tabular figures for numbers that are compared or that change (amounts, tables, timers)
  - at most two families and three weights
  - headings balanced so none ends on one stranded word
- Do not: Let paragraphs run the full width of a desktop container, use one line-height for every size, set uppercase labels with no tracking, or let amounts in a column shift because digits differ in width.
- Why: Line length and leading decide whether text is read or skimmed; aligned figures make numbers comparable at a glance. (Bringhurst, The Elements of Typographic Style (a measure of 45 to 75 characters; leading by size); WCAG 2.2 SC 1.4.12 text spacing; OpenType tnum; Apple HIG and Material type scales)
- Not when: a single display line or a logo lockup, where the type is an image
- Trade-off: narrower text columns leave more empty space on wide screens
- Check: measure the render: characters per line, line-height, letter-spacing, font-variant-numeric, families and weights in use

#### RX-UI-15 [Preferred] [Quality Lock] Detail craft

- Do: Center icons on the optical middle of the text beside them and size them to its line-height; match icon stroke to the type weight; right-align (or decimal-align) number columns; take borders, dividers, radii, and shadows from a small token set; truncate long text on purpose, with the full value still reachable (a tooltip, a detail view, or wrapping).
- Do not: Let icons sit high or low against their labels, mix stroke weights, center amounts in a table, or invent a one-off shadow for one card.
- Why: Each detail is small; together they are what makes a screen look made rather than generated. (Bringhurst (figures and alignment); Apple HIG and Material iconography (optical size and alignment); owner review 2026-10-17: wrong tab icons in withryux.pen)
- Check: render inspection at 390 and 1280: icon center within 2 px of the text center; column alignment

#### RX-UI-20 [Preferred] An icon means one thing, and says it

- When: the design uses icons for actions, navigation, or status
- Do: Pick each icon for the action or concept it stands for, not for its look.
  - One icon, one meaning across the product: no icon for two actions, no two icons for one action.
  - Pair the icon with a text label unless it is one of the few users know without one in this context (search, close, back, menu, home). Keep the label in a tab bar, on uncommon actions, and on destructive ones.
  - Tell look-alikes apart by what they do: back leaves the screen, close dismisses a sheet or modal; delete removes, cancel stops.
  - Use the platform's icon for platform actions (share differs on iOS and Android).
- Do not: Choose an icon because it looks good, reuse one icon for two meanings, or ship an icon-only control whose meaning users have to guess.
- Why: Few icons are recognised without a label; an ambiguous icon costs more than a word, and an icon whose meaning changes breaks what users learned. (NNGroup icon usability; Nielsen heuristic 4 (consistency and standards); Apple HIG and Material iconography)
- Not when: a dense expert tool whose users learn the set; then a tooltip plus an accessible name
- Trade-off: labels take space, especially in toolbars and tab bars
- Check: review: list each icon with its meaning and flag duplicates; heuristic_eval H-04

---

### Imagery and motion (RX-UI) · `knowledge/imagery.md`

Gate area UI. Covers art direction, composition, expressive surfaces, motion, asset sourcing and provenance, illustration, and delight. Read when the work has photos, illustration, 3D, motion, or an expressive surface (hero, landing, onboarding, empty state, brand moment).

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

#### RX-UI-11 [Contextual] Motion earns its level

- When: the design adds motion or transitions
- Do: Classify each motion: L1 state feedback, L2 component transition, L3 page transition, L4 storytelling, L5 decorative; the higher the level, the stronger the reason it needs.
  - Weigh how often people see it: a surface opened many times a day (command palette, shortcut, core navigation, list selection) appears and closes without movement, at most a fade too short to notice; standard transitions belong to occasional surfaces (modal, drawer, toast), and expression to rare or first-time moments.
  - Take timing and easing from one motion personality, define them once as motion tokens, animate transform and opacity rather than layout properties, and honor reduced motion (RX-A11Y-08).
  - Anything that opens and closes (menu, popover, dialog, drawer) uses transitions that can reverse halfway, so a close or reopen mid-animation turns back from where it is, and it closes no slower than it opened.
- Do not: Animate everything, give a surface people open many times a day an entrance they must sit through, play an open-only keyframe animation on something people can close or reopen at any moment, use one generic duration and easing (transition: all 0.3s) everywhere, let decorative motion delay content or input, or move data the user is reading (a balance, an amount, a table value) for effect.
- Why: Motion directs attention; unearned motion steals it from the task and can make some people unwell. (NNGroup animation and usability guidance; WCAG 2.3.3 animation from interactions; frequency check: pattern also in emilkowalski/skills (MIT) find-animation-opportunities; reversible open and close: pattern also in emilkowalski/skills (MIT) animate; default timing, press state, and still data: pattern also in appllama-app-design-skill (MIT); all written for RYUX)
- Not when: L1 feedback on standard controls that follows the platform defaults
- Trade-off: fewer flourishes on marketing pages
- Check: review; reduced-motion test

#### RX-UI-12 [Contextual] A point of view on expressive surfaces

- When: the surface is expressive: a hero, landing page, onboarding, empty state, or brand moment, or the brief asks for a new look or more personality; on a new product's task UI, the brand layer only (see Do)
- Do: Run Explore (capabilities/design.md, stage 3) with alternatives that each carry a name, a concept taken from the product's own idea (for a tool about evidence: receipts, citations, marks of proof), and a signature element (type, composition, imagery, or motion); then make the rest of the design serve the chosen signature and put its concept in the Visual Brief.
  - On task UI: the alternatives are structure hypotheses and the conventions that must hold stay fixed. A new product's brand layer must carry one signature from its own domain (a mark, the type voice, a colour temperature, or one brand moment in the flow), never a layout change and never decoration without a job (RX-AS-05). Record it in the Delivery Gate UI line.
  - When the brief names reference products, read each one before it shapes the alternatives: the principle you borrow, what stays theirs (colours, mascot, signature features), and where you use it. Carry the borrowed character at the strength the brief asks for: when it asks for a reference's feel (playful, chunky, gamified), the feel shows on every main screen, in type weight, shape, colour energy, and one brand moment, not only in a button detail. A reference's signature mechanics (a streak, a daily goal, a score) are unconfirmed capabilities: propose them, never show them as facts.
- Do not: Show alternatives that differ only in colour or copy, choose for the user without showing them, or let the signature be the category's default (for developer tools a terminal or agent-session panel; for SaaS a dashboard screenshot; copy on the left and product on the right), or relabel that default as a concept. A product screen can support the signature, not be it. Turn a named reference into adjectives ("calm, white, soft") or copy what belongs to its brand.
- Why: Users remember a product by its idea; a correct but generic surface is forgotten and could belong to any competitor. (brand and art direction practice; RX-UI-05 layout from content; rendered variants on named axes, compared side by side, chosen by the user: pattern also in emilkowalski/skills (MIT) prototype; written for RYUX; owner review of a no-skill vs RYUX run (2026-10-20): RYUX kept the reference's feel to one button detail)
- Not when: an existing product whose brand system already sets the brand layer, or a small change inside a fixed design system; follow it
- Trade-off: a strong idea takes a decision someone may disagree with; keep it honest and on brand
- Check: the swap test (RX-AS-09); review

#### RX-UI-13 [Contextual] Source assets on purpose

- When: the design needs photos, illustration, 3D, icons, logos, or video
- Do: Pick each asset's source in this order: real product screens or the brand's own assets; a licensed library (one icon set, photos whose license you can name); a custom or generated asset made from the Visual Brief and labeled illustrative; otherwise a placeholder that looks like one (RX-AS-03). Record where each asset came from.
- Do not: Draw or imitate another company's logo, invent the product's own mark (RX-AS-11), mix icon sets, use a photo you cannot license, or fill a gap with a generic stock scene.
- Why: Assets carry claims about the product and its users; an unsourced or borrowed asset is a claim nobody can back. (licensing and trademark practice; RX-UI-07; RX-AS-02)
- Not when: a wireframe or internal prototype where placeholders are expected
- Trade-off: real or licensed assets take longer than a stock search
- Check: asset list with sources; review

#### RX-UI-16 [Contextual] Delight stands on three legs

- When: the brief asks for delight, personality, or a memorable experience, or the design adds a moment meant to please (an animation, an illustration, a reward)
- Do: Build delight on all three of Norman's levels, in this order of dependence:
  - behavioral: the task is easier than the user expected; no delight covers a usability problem
  - visceral: the first impression comes from the brand layer (RX-UI-12), not from decoration without a job
  - reflective: the product speaks to the user's values and aims, not only the task ("membangun kebiasaan membaca", not only "target 8 halaman")
  - Read the user's state before adding joy: none in a payment failure, an error, a loss, or a long wait; there the delight is a fast, calm way out.
- Do not: Add confetti, mascots, or jokes to a flow that is still hard to use, or celebrate in a moment of failure or worry.
- Why: Delight on one leg is superficial and people remember the bad more than the good; forced joy at the wrong moment annoys. (NNGroup three pillars of user delight (visceral, behavioral, reflective; Norman, Emotional Design); NNGroup delightful UX video)
- Not when: a utility or internal tool whose brief asks for none; ease of use is its delight
- Trade-off: the reflective layer needs knowledge of what users value, which may need research
- Check: review; Critique Design Read

#### RX-UI-17 [Contextual] Illustration follows a written style

- When: the design adds or makes illustration (spot, empty state, onboarding, hero) and the brand has no illustration system
- Do: Before the first drawing, write the style in five lines (six with characters) in DESIGN.md or the Assumptions:
  - line: stroke weight and cap, or no stroke
  - shape: geometric or hand-drawn, and the corner radius
  - colour: 2 to 4 tokens from the palette, one accent
  - depth and detail: flat, one shadow tone, or 3D; how much detail
  - subject: objects from the product, people, or abstract
  - characters, when the style has people or a mascot: proportions, face detail, the range of people shown, and a short set of poses and expressions; one character system across the product
  - Derive each line from the visual language (RX-UI-10): the stroke from the icon set, the radius from the components, the colour from the tokens. Functional icons stay in the icon set (RX-UI-13), not in the illustration style.
  - Record the style as a Decision Receipt: evidence from a brand guide, references, or the brief; Evidence None when it is derived from the visual language alone.
- Do not: Draw in the generator's default style (flat people with oversized limbs, gradient blobs, isometric 3D), or mix line and filled illustration in one product.
- Why: Without a written style, illustration drifts toward the generator's default and away from the UI around it. (Art direction practice (a written illustration style); RX-UI-10 chosen visual language; anti-slop tell (generic illustration); owner review 2026-10-22: request for illustration guidance)
- Not when: the brand already has an illustration system; follow it (RX-UI-13)
- Trade-off: one more step before the first drawing, and less variety
- Check: review

#### RX-UI-18 [Contextual] A set reads as one family

- When: the product uses more than one illustration (empty states, onboarding steps, errors)
- Do: Make the set together: same canvas and framing, same stroke and palette, same subject scale, viewpoint, and level of detail.
  - Tie each subject to the screen's job: an empty state shows what will appear there, not a mascot shrugging.
  - Put the set side by side before handoff and fix the one that stands out.
- Do not: Make each illustration in a separate prompt and hand them off without comparing them, or give one more detail or colour than the rest.
- Why: Users read a mismatched set as a mistake or a different product, and a generator drifts in style from prompt to prompt. (Design-system practice (one illustration family); RX-DS-02 consistency; owner review 2026-10-22: request for illustration guidance)
- Not when: a single illustration
- Trade-off: the whole set is redone when the style changes
- Check: render, side by side

#### RX-UI-19 [Contextual] Illustration ships as a themed, accessible asset

- When: illustration goes into a build, or into a design file that will be built
- Do: Flat and line art as SVG: colours from tokens (currentColor or CSS variables) so dark mode follows (RX-DS-05), a viewBox with no fixed size, no embedded raster, no text inside the art; text stays in the HTML so it can be translated and scaled.
  - Raster art (generated or 3D) at 2x the displayed size, compressed, with width and height set so the layout does not jump.
  - Decorative art gets aria-hidden or an empty alt; art that carries meaning gets alt text that says the meaning, not the drawing (RX-A11Y-04).
- Do not: Hard-code colours that vanish on dark, bake words into the image, ship an export with editor metadata, or write alt text that describes the picture ("a woman holding a box") instead of what it means.
- Why: Art that ignores tokens breaks in other themes, text inside an image cannot be read, translated, or zoomed, and alt text that only describes the drawing says nothing. (WCAG 2.2 SC 1.1.1 (non-text content); RX-DS-03; RX-DS-05; RX-A11Y-04; owner review 2026-10-22: request for illustration guidance)
- Not when: a concept frame that will not be built
- Trade-off: SVG built from tokens takes longer than one export
- Check: render in every theme; read the SVG source

---

### Design system (RX-DS) · `knowledge/design-system.md`

Gate area DESIGN SYSTEM. Covers search before create, tokens, component states, consistency locks. Read when adding or changing components, styles, or tokens.

#### RX-DS-01 [Required] [Hard Gate] Search before you create

- Do: Before adding a component, search existing components, tokens, and patterns; reuse, then extend with a variant, and create new only for a real semantic or behavioral difference.
- Do not: Create a near-duplicate component or pattern for one screen.
- Why: Duplicates drift apart, multiply maintenance, and break consistency. (Design-system practice)
- Check: for each new component or token, name the existing ones searched and why none fits; fails on a new one that duplicates an existing one

#### RX-DS-02 [Required] [Quality Lock] Consistency, conventions, and states

- Do: Follow platform conventions and the project's own patterns; the same component looks and behaves the same everywhere, with its states (default, hover, focus, pressed, disabled, loading, error) defined once.
- Do not: Style or wire similar components differently from screen to screen.
- Why: Consistency lets users transfer what they learned. (Nielsen heuristic 4; Jakob's law (Nielsen 2000): people spend most of their time in other products and expect yours to work the same way; Apple HIG; Material Design)
- Check: heuristic_eval H-04

#### RX-DS-03 [Preferred] [Quality Lock] Tokens over one-off values

- Do: Use tokens or variables for color, spacing, radius, elevation, and type.
  - First look for the ones that exist (DESIGN.md, a tokens or theme file in the repo, the design file's variables and components, a linked library) and use them.
  - When the project has none, define them before the first frame: color roles, a spacing scale, a radius scale, and a type scale (sizes and font families).
  - Name color tokens by role (surface, text, accent, status), not by value, so a second theme is a swap of values, not a rename.
  - In a design tool, create them as the tool's variables, reference them in every value, and make anything that repeats (a row, a button, a bar) a component.
  - After rendering, count the values that are still literal, by kind, and turn each into a token or name why it is an exception.
- Do not: Hard-code one-off values for things the system already defines, or define tokens for color only and leave spacing, radius, and type size literal.
- Why: Tokens keep changes consistent and reviewable; values that are not tokens drift from frame to frame and state to state. (W3C Design Tokens Community Group; ryux four-problems baseline 2026-10-16: in all 12 runs, with or without RYUX, spacing, radius, and font size were 100% literal)
- Check: count literal values after render; review

#### RX-DS-05 [Contextual] Every theme you ship works

- When: The product ships more than one theme (light and dark, or brand themes), or a theme is being chosen.
- Do: Choose the default theme from the product, its users, and where it is used, then check every shipped theme with the same care: contrast, every component state, images and charts, and focus.
- Do not: Pick dark mode because the product is technical, or ship a toggle whose second theme was never rendered.
- Why: A theme that was never checked fails for everyone who picks it, often in contrast and states first. (pattern also in anti-slop (MIT) R-21, R-34; written for RYUX)
- Check: render each theme; contrast check

#### RX-DS-06 [Preferred] [Quality Lock] The component sheet is a spec

- Do: Lay out each component as a labeled grid: one row per property, one column per state (default, hover on web, pressed, disabled, loading, error), each cell labeled with its variant name, and one line of usage under each component; no overlapping or clipped variants. Render and inspect the sheet like a screen.
- Do not: Leave variants scattered, unlabeled, or cut off at the frame edge.
- Why: Developers build from the component sheet; a variant they cannot find or read gets rebuilt or guessed. (ryux run: blind review of a delivery flow 2026-10-20; design-system practice; written for RYUX)
- Not when: a single screen with no shared components
- Trade-off: takes time to lay out; pays back at handoff
- Check: render the sheet; every variant visible and labeled

---

### Accessibility (RX-A11Y) · `knowledge/accessibility.md`

Gate area ACCESSIBILITY. Covers semantics, keyboard, focus, contrast, targets, names, errors, reduced motion. Read when building or reviewing any UI.

#### RX-A11Y-01 [Required] [Hard Gate] Readable contrast

- Do: Keep text contrast at least 4.5:1, and at least 3:1 for large text and component boundaries.
- Do not: Put light grey text on white or white text on a pale accent.
- Why: Low contrast fails outdoors, on cheap screens, and for low vision. (WCAG 2.2 SC 1.4.3 and 1.4.11)
- Check: audit_ui

#### RX-A11Y-02 [Required] [Hard Gate] Readable text, reachable targets

- Do: Keep body text around 14 to 16px on mobile, and touch targets at least 24×24px, preferably 44×44px. The target is the hit area, not the glyph: a 20 to 24px icon sits inside a 44×44 button.
- Do not: Shrink body text or crowd small targets together.
- Why: Small text and targets cause misreads and mis-taps. (WCAG 2.2 SC 2.5.8 (24px minimum); Apple HIG 44pt; Material 48dp; Fitts's law (Fitts 1954): bigger and nearer targets are faster to hit)
- Check: audit_ui

#### RX-A11Y-03 [Required] [Hard Gate] Keyboard and visible focus

- Do: Make actions operable from the keyboard (path-based input such as drawing excepted), show a visible focus indicator, and keep focus order the same as the visual order. When a dialog, menu, or popover closes, put focus back on the element that opened it, or on the nearest sensible element if that one is gone.
- Do not: Build pointer-only actions, or remove focus outlines without an accessible replacement.
- Why: Keyboard and switch users navigate and act by focus. (WCAG 2.2 SC 2.1.1, 2.4.3, and 2.4.7; WAI-ARIA APG dialog pattern)
- Check: tab through the render from the top: every control is reached in reading order and shows a visible focus indicator (3:1 against its background); fails on a skipped control, a focus trap, or an invisible focus

#### RX-A11Y-04 [Required] [Hard Gate] Semantic structure, native controls, and names

- Do: Use real headings, landmarks, lists, buttons, links, and the right input types before custom elements, and give icon-only buttons and meaningful images an accessible name or alt text. Hide decorative icons and images from assistive technology (aria-hidden, or an empty alt).
- Do not: Build structure or controls from styled divs, or ship unlabeled icon buttons.
- Why: Assistive technology navigates by semantics and announces unlabeled buttons as just "button"; native controls bring keyboard and platform behavior for free. (WCAG 2.2 SC 1.1.1, 1.3.1, and 4.1.2)
- Check: read the accessibility tree (a Playwright accessibility snapshot, or the design file's layer types): every control is a native element or has a role, and every one has a name; headings are in order; fails on an unnamed control or a div acting as a button

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
  - Take the smallest width from the brief, then DESIGN.md or the code, then the platform default: web 320 CSS px, iOS 375 pt, Android 360 dp. Write the width you used in Assumptions; ask only when the platform itself is unclear (a product that may be desktop-only).
  - On a native app, also check the largest system text size (Dynamic Type, Android font scale): it breaks layouts more often than width does.
  - The check is a test, not a deliverable: fix what broke in the main frames and report it in the Delivery Gate. Add frames for another width only when asked, or when the structure changes there (a table becomes cards).
- Do not: Design for one width only, test a native iOS app at 320, or hand off a set of frames that only prove the layout did not break.
- Why: Users meet the layout at many widths and text sizes; a test at a width the platform does not have finds nothing, and proof frames bury the design. (WCAG 2.2 SC 1.4.10 (reflow at 320 CSS px); Apple Human Interface Guidelines (Dynamic Type); Android font-scale guidance; owner review of the Ujicoba run (2026-10-21): four 320 frames on a native iOS design)
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
- Check: list each rule the UI code computes (fees, limits, eligibility, rounding, dates) and its source (API, spec, brief); fails on any computed from a guess

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

- Do: Write the tests, then run them:
  - unit tests for every new or changed pure function (calculations, formatting, validation, state transitions), including edge cases such as zero, empty, maximum, and invalid input
  - integration tests for critical flows (checkout, payment, form submit, sign-in), covering the success and failure paths
  - the repo's test runner and conventions; with none, propose one as an assumption and ask before adding the dependency
- Do not: Ship changed logic without tests, write snapshot-only tests or tests that mock the code under test, or claim tested without running the tests.
- Why: Tests catch the regressions review misses, before users find them in production. (Testing practice; owner review 2026-10-06)
- Check: run the project's tests

#### RX-FE-15 [Required] Change the source, not the output

- Do: Make UI changes in the source files that own them (components, styles, tokens), so the next build and the next person see the same code.
- Do not: Build a feature with a script that rewrites CSS or source by string replacement, or patch generated files.
- Why: Patched output is overwritten by the next build and hides where the behavior lives. (pattern also in anti-slop (MIT) R-33; written for RYUX)
- Check: review the diff

---

### Visual QA (RX-QA) · `capabilities/qa.md`

Gate area VISUAL QA. Covers did the build match the intended design: compare, list deviations, fix, render again. Read when something visual has been implemented and is about to be called done, or a build must match a design.

#### RX-QA-01 [Required] Render, inspect, fix, render again

- Do: Render the result at the target viewport (browser, screenshot, or design-tool export).
  - Inspect the main state, one empty or error state, and the smallest supported width (RX-RD-01), plus the largest text size on native.
  - Look for the defects source code hides: misaligned edges, type or spacing off the scale, density wrong for the task, overflow and clipping, a component that looks different from its siblings, a control that does nothing.
  - Rank issues by impact, fix from the top, and render again. Name the widths and states you inspected; if no render tool is available, say so in the report.
  - Whether the design itself is right or intentional is Critique's call; QA reports what it can verify.
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
- Check: list every number on the screen with its source (brief, docs, data, or a sample label); fails on any number without one

#### RX-AS-02 [Required] [Hard Gate] No invented people

- Do: Use testimonials, names, and faces only when they are real and consented.
- Do not: Make up testimonials, reviewers, or customer photos.
- Why: Fake people are fake endorsements. (ryux anti-slop principle)
- Check: list every person, quote, review, and customer logo on the screen with its source or its sample label; fails on any shown as real without a source

#### RX-AS-03 [Required] [Hard Gate] Sample data is realistic and labeled; placeholders only for what is missing

- Do: Fill mockups with realistic sample content consistent with the brief (names, merchants, amounts in the brief's currency, dates) and list it as sample data in the output. Keep a visible placeholder only for an asset that does not exist yet, such as [LOGO].
- Do not: Put [REAL DATA], XXX, or lorem text on the canvas where sample data would do, or ship sample data or placeholder copy as final. A sample-data label does not turn a fee, policy, or claim into a fact (RX-PR-02).
- Why: Bracketed values read as unfinished and hide the layout's real behavior; unlabeled sample data ships by accident. (ryux anti-slop principle; ryux visual benchmark 2.5, 2026-10-09: [Brand] and XXX read as unfinished)
- Check: audit_copy C-01

#### RX-AS-04 [Required] [Hard Gate] No fake urgency

- Do: State a deadline or a quota only when it is real, as a plain fact.
- Do not: Write "only 2 left", "offer ends tonight", or fake countdowns with nothing behind them.
- Why: Manufactured pressure erodes trust once users notice. (NNGroup credibility research; ryux run 2026-10-02: WhatsApp promo)
- Check: find every timer, deadline, stock count, and 'only N left'; each comes from the brief or real data; fails on any without a source

#### RX-AS-05 [Required] Decoration passes a purpose gate

- Do: For each potentially decorative pattern, answer three questions, and keep it only when all three have a real answer:
  - purpose: what does it do?
  - contribution: what does it add to understanding, interaction, or the product's character?
  - necessity: would something simpler do the same?
  - Three feature cards pass when the features are equal and compared; when one matters more, give it more weight instead.
- Do not: Keep cards, gradients, badges, shadows, or animation that have no reason, or accept "it looks more interesting" as one.
- Why: Unjustified decoration is what makes AI-generated UI look the same. (ryux anti-slop principle)
- Check: review

#### RX-AS-06 [Required] [Hard Gate] Complexity with a reason

- Do: Remove elements, options, states, code paths, abstractions, and dependencies that serve no stated need. Complexity that cannot be removed is carried by the product (defaults, formatting, calculation), not handed to the user.
- Do not: Add settings, sections, abstractions, or packages "for later", or features because similar products have them.
- Why: Unneeded complexity costs every user and every future change. (Nielsen heuristic 8; Tesler's law of conserved complexity (Tesler, 1980s): some complexity cannot be removed, only moved; clean-code practice)
- Check: list each element, option, state, and dependency the work added and the need it serves; fails on any without one

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

- When: the surface is expressive: a hero, landing page, onboarding, empty state, or brand moment, or the brief asks for a new look or more personality; on a new product's task UI, the brand layer only (see Do)
- Do: Run the swap test honestly: replace the name and logo with a competitor's in the same category. If the layout, the visual, and the headline would still work for them, the surface has no point of view yet; give it one (RX-UI-12). Report the answer in the Delivery Gate.
  - On task UI: keep the structure familiar and run the test on the brand layer only (palette, type, surfaces, iconography, map styling). On a new product, "only the logo would change" is a FAIL.
- Do not: Treat a tidy, generic layout as done because it passes every other gate; generic restraint is slop too.
- Why: Removing slop is the floor, not the ceiling; interchangeable design makes the product forgettable. (ryux delivery principle; Critique Design Read: specificity)
- Not when: an existing product whose brand system already defines the surface; follow it
- Trade-off: takes a design decision, not only removals
- Check: swap test; review

#### RX-AS-10 [Required] [Quality Lock] Count before handoff

- Do: Before handing off, count on the render or in the design file's variables, and report the counts against these limits:
  - accent hues 1 (status colors, and secondary colors the brand defines, are named and excluded)
  - grey families 1
  - corner radii only from the scale, matching the shape lock
  - display sizes per screen 1; text sizes in a screen's main content 3 at most
  - icon sets 1, in the chosen icon style
  - emoji in interface chrome 0; invented logos or app icons 0 (RX-AS-11); gradients without a brand reason 0
  - labels for the same intent 1
  - A count over its limit fails unless the brief or DESIGN.md gives the reason.
- Do not: Judge consistency by eye only, or hand off a screen with five accent hues, mixed icon sets, or two labels for one action because it looks fine.
- Why: Counts are harder to talk past than impressions; a design that passed a by-eye review still shipped five hues and the wrong tab icons. (isolation effect (von Restorff 1933): several accents cancel each other out; pattern also in appllama-app-design-skill (MIT), anti-slop counts; written for RYUX; owner review 2026-10-17: withryux.pen passed RYUX with 5+ hues and wrong tab icons)
- Check: count on the render or the design file's variables; report in the Delivery Gate

#### RX-AS-11 [Required] [Hard Gate] The product's own mark

- When: the design has a logo, wordmark, app icon, or favicon
- Do: Use the brand's own file wherever the product's mark appears.
  - Look in the repo (public/, assets/, the app icon and favicon), DESIGN.md, the design file's components, and what the user attached, and name the file you used.
  - With no file, set the product name in plain text in the brand's type, or leave a visible [LOGO] placeholder, and list the mark as missing in the handoff.
- Do not: Stand in for the mark with initials in a circle, an emoji, a generic shape, an invented SVG, a letter cut into a tile, or the name typeset to look like a logo; generate a favicon or app icon the user did not ask for; or redraw the brand's mark instead of using its file. Designing a mark is its own task, done only when the user asks for it.
- Why: An invented mark looks finished and is the first thing a team has to throw away; it also passes for a decision nobody made. (pattern also in superdesign-skill (MIT), logo invariant; RX-UI-13 asset provenance; ryux owner review 2026-10-18 (the logo and favicon are the owner's to make); written for RYUX)
- Check: list every mark slot and the file it uses, or the placeholder; fails on a slot filled by an invented mark
<!-- rules:end -->

## Installation via CLI

```bash
npx @ryuxdsgn/design-intelligence install --agent claude          # or --agent all; see the README for every agent
```

RYUX installs one folder, `ryux/`. The browsable skill lives in [`skills/ryux/`](../skills/ryux).
`update` also cleans up installs from RYUX 1.x.

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

## History

Rule IDs are never reused. These tables show where retired and RX-1.x IDs went.

<details>
<summary><b>Retired in rules 1.3</b></summary>

Rules 1.3 cut the rule set from 109 to 76. Each retired ID was merged into another rule or moved into
its skill's guide as guidance.

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

</details>

<details>
<summary><b>Migration from RX-1.x</b></summary>

The current rule set groups every rule by module. RX-1.x IDs map as follows; some old rules were
merged, and some were split across skills.

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

</details>

## License & ownership

This ruleset (text, the skill structure, numbering) is original ryux work, **MIT license**,
copyright © 2026 ryux. It references public standards (Nielsen 1994, WCAG 2.2, HIG, Material)
factually; it contains no text, images, paid checklists, or course material from any party, and is
not affiliated with them.
