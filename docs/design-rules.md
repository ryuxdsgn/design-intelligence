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
> **Version:** RYUX 2.22.3

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
| `knowledge/imagery.md` | Imagery and motion: art direction, composition, expressive surfaces, motion, asset sourcing and provenance, and delight | RX-UI |
| `knowledge/illustration.md` | Illustration: each asset's concept and meaning, the written style, one family, the production method, and the render-and-read check | RX-UI |
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
| Competing primary actions | RX-PR-03 |
| Unexplained interaction behavior | RX-IX-01 |
| Duplicate components | RX-DS-01 |
| Build or typecheck fails | RX-FE-16 |
| Primary task cannot be completed | RX-QA-08 |
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
| Component property names | RX-DS-07 |
| Interaction patterns and states | RX-DS-02 |
| Responsive behavior | RX-RD-06 |
| Visual hierarchy | RX-UI-01 |
| Radius | RX-UI-03, RX-DS-03 |
| Icons | RX-UI-15, RX-UI-20 |
| Motion | RX-UI-11 |
<!-- locks:end -->

## Delivery Gate

UI, UX, copy, and frontend work ends with this report:

<!-- gate:start -->
```
PRODUCT        PASS | FAIL | NOT VERIFIED | N/A  · one-line reason · evidence Strong | Thin | None · rationale <n> lines, annotations <n> | none
UX             PASS | FAIL | NOT VERIFIED | N/A  · one-line reason
CONTENT        PASS | FAIL | NOT VERIFIED | N/A  · one-line reason · open rules on screen <tagged>/<shown> | none
UI             PASS | FAIL | NOT VERIFIED | N/A  · one-line reason · point of view: <concept> | task UI, signature: <signature> · concept sections <n>/<total>, devices <n>, focal subjects <n>/<sections>, carrier <kind>, made assets <n>/<planned> · illustration style: <where written> | none
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
| Public standard or research | 86 | 58 |
| Industry practice | 28 | 8 |
| Observed in a RYUX run | 17 | 8 |
| Pattern also in another MIT ruleset (text written for RYUX) | 4 | 3 |
| RYUX principle, taxonomy, or review | 59 | 22 |

All 144 rules cite a source; 45 cite more than one kind, so the "Rules citing it" column adds up to more than 144.
<!-- provenance:end -->

## Rules

Generated from `packages/cli/src/content.ts` by `pnpm sync:skills`. Edit the rules there, not here.

<!-- rules:start -->
144 rules across 15 modules: 65 Required, 31 Preferred, 48 Contextual; 18 Hard Gates and 13 Quality Locks.

### Product thinking (RX-PR) · `knowledge/product.md`

Gate area PRODUCT. Covers user, task, goal, primary action, constraints, assumptions, and decisions backed by evidence. Read when starting a new screen or flow, choosing between patterns, or when the scope is unclear.

#### RX-PR-01 [Required] State the context first

- Do: Before designing, write down the user, their task, the business goal, the design intent (what the user must understand, feel, and do), the information that matters, the primary action, the constraints, and what success looks like.
  - Take what the prompt and DESIGN.md already give.
  - Ask only when a missing answer materially affects the user flow, what the product can do, or whether the content is correct, or when neither the prompt nor DESIGN.md sets the UI or motion direction: at most three questions in one message, most consequential first, none when the context is complete. A new product or a new look runs Product Discovery first (RX-PR-13).
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
  - A rule the prototype must behave by but nobody decided (what happens when the customer does not answer, a time limit, a charge): the behavior is yours to assume, but its sentence on screen is a promise. Leave the promise out of the copy, or label it on that same screen ("Prototype rule, not decided yet"); a label in DESIGN.md, the code, or your reply never reaches the user.
- Do not: Invent business rules, policies, guarantees, metrics, user data, permissions, pricing, requirements, or API behavior, or name a tool, command, integration, platform, or page the product does not have. Do not present an unconfirmed capability as a confirmed one. Do not show an undecided rule as a plain sentence on screen because it is listed as an assumption somewhere else.
- Why: Invented facts turn into promises and bugs that someone has to unwind; a screen trimmed to the brief's literal words reads unfinished and hides what still needs confirming. (ryux run 2026-10-02: an unconstrained agent invented a 30-day trial and user counts; ryux visual benchmark 2.6 human rater, 2026-10-13: RYUX screens lost on a missing receipt action; NNGroup proto-personas and synthetic users (AI output is hypotheses, not research); owner review 2026-10-27, ryux run: food-delivery benchmark rounds 1 and 2, the no-answer rule for an unavailable item labelled an assumption only in DESIGN.md and the reply, read as fact on the screen; ryux run: laundry Figma benchmark 2026-11-05, the gate reported 22 tagged / 22 shown while a Rp10.000 fee repeated on six screens had no label naming it; reruns with the listing, 2026-11-06: B3 missed the payment rule (no listing word for it), and on a new brief (Pasarku payment) the delivery fee sat 44 px from a label naming the payment fee and was judged labelled, while the gate counted rule kinds (6/6); the listing now checks the label's word itself)
- Not when: This rule is not a reason to drop content the brief implies or to leave a screen looking unfinished: sample content is RX-AS-03, design assumptions are yours to make.
- Check: compare every product fact on the screen (features, prices, fees, policies, names, integrations) with the brief, DESIGN.md, docs, or repo; each is sourced, or labelled as an assumption on the same screen; then sweep: list every undecided rule and number (Assumptions, open questions, DESIGN.md), search the text of every screen for each, and count them with the listing in capabilities/design.md (one rule on one screen is the unit; every amount is placed as an open rule, a fact, or sample data; a fee the brief does not set is an open rule; labelled only when a label beside it contains the rule's word), never from memory; report open rules on screen <tagged>/<shown>; fails on one shown as fact without a source, labelled only outside the screen (a read-me board or notes frame counts as outside), or a count that the listing does not reproduce

#### RX-PR-03 [Required] [Hard Gate] One clear goal; one primary action when the task has one

- Do: Give each screen one clear, dominant goal. When the task has a clear next step (a form, checkout, a confirmation), give it one primary action and make secondary actions look secondary.
- Do not: Put two equal-weight calls to action side by side.
- Why: A single clear path shortens the decision and the task. (Hick's law (Hick 1952; Hyman 1953): more options, longer decisions; NNGroup visual hierarchy; choice overload (Iyengar and Lepper 2000): a longer list of options can lower the chance that anyone chooses at all)
- Not when: Monitoring and configuration screens (dashboards, settings) need a clear goal but not a single dominant action; do not invent one to satisfy this rule.
- Check: name the screen's goal and its primary action, then count the controls styled as primary in the main state; fails when two compete at the same weight

#### RX-PR-04 [Required] Back decisions with real screens

- Do: Cite at least one real screen_id for each meaningful design decision, or label it a judgment call with no reference.
- Do not: Claim "apps usually do X" without a screen to show it.
- Why: A cited screen makes a decision checkable instead of a matter of opinion. (ryux evidence principle)
- Check: search_screens, delivery_gate

#### RX-PR-05 [Required] The product's market first

- Do: Start from how users in the product's own market pay, sign in, write addresses, and read money and dates; check a pattern from another market before reusing it.
  - Take the market from the brief or the codebase, and ask when it is unclear. When you ask, propose no market as your default: RYUX's own examples are Indonesian, the product may not be. If you must proceed without an answer, follow the brief's language and its common currency, and list it under Assumptions.
  - When the brief does not name payment methods (or another market-standard capability), show the market's standard set as unconfirmed capabilities, labeled as proposed in Assumptions, rather than leaving them out: a market's table stakes are not "for later" (RX-AS-06). Ask when the set would change the flow.
- Do not: Import one market's checkout, currency, language, or tax rules into a product built for another market.
- Why: Payment, address, and trust habits differ by market (local payment rails, address formats, messaging channels). (ryux taxonomy of local patterns; wallet-detail benchmark, 2.19.2: 3 of 3 runs proposed Indonesia and IDR as the default for a brief with no market)
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

#### RX-PR-12 [Contextual] A DESIGN.md answers five questions or names what is unknown

- When: writing or updating DESIGN.md from a brief, product docs, references, or an existing product
- Do: Write DESIGN.md so it answers, each from a named source:
  - who the users are and what they need
  - which job they want done, and what done looks like
  - what evidence supports each design decision, with its strength (Strong, Thin, None)
  - which interaction patterns fit the context, and why
  - how the result is evaluated: success criteria, machine checks, the riskiest assumption and its cheapest test
  - and, apart from the five, the product's design principles: three to five value statements, each "X over Y" with why it matters to these users and where it gives way, so a trade-off is decided by a stated value, not by taste. They come from the user, the brief, or research; ones you propose are marked proposed until the team confirms them.
  - Ask in rounds of at most three questions until each has an answer or a recorded Unknown; values you choose (colors, type, timing) are tokens with a one-line reason, marked proposed until the team confirms them. When updating, keep the lines the user wrote.
- Do not: Fill a DESIGN.md with personas, research, metrics, or policies nobody gave, present your chosen values as the team's, rewrite lines the user wrote without asking, or write a design principle that takes no side ("simple and powerful"), or one you made up, as the team's.
- Why: DESIGN.md is what every later task reads first: an invented user or rule there spreads into every screen, and a file that only lists colors leaves the next agent to guess the user and the job. (owner review 2026-10-27; ryux run: wallet-expressive benchmark rounds 2 and 3 (a DESIGN.md that dictated values tested spec-following; one that named only character left the values unexplained); RX-PR-02, RX-PR-10; design principles as value statements that take a side and decide trade-offs: NNGroup, Crafting Product-Specific Design Principles (Rosala 2020); owner decision 2026-11-06)
- Trade-off: takes a few rounds of questions before the first screen
- Check: review: the five questions each answered with a source or listed under Open questions; three to five design principles that each take a side, sourced or marked proposed; chosen tokens marked proposed with a reason

#### RX-PR-13 [Preferred] Before a direction, learn what makes this product specific

- When: a new product, a new look, or an expressive surface, and the prompt, DESIGN.md, and the product docs do not say who exactly it is for and why they would choose it, or what the product does and which numbers may be shown
- Do: Before any visual direction, ask what the context does not answer, in one message of five questions at most, as choices with a recommended answer and room for the user's own:
  - who exactly: the group, their moment, and what they use today
  - why they would choose it over what they use now
  - its character in three words and what it must never feel like; recommend a personality (warm, bold, witty, proud) from the audience and the why, never a word for restraint (plain, clean, minimal): restraint is how a page behaves, not who the product is
  - one product or site whose look they like, and one they do not
  - the page's status and goal: live or not, and what the visitor should do
  - what the page can say: the three things people do in the product, the numbers that may be shown (a minimum, a fee, a limit), and whether real screenshots or photos exist; ask these even when who and why are known
  - the product facts (RX-PR-01), and for a fact with a mark (a store, a partner, a regulator) its official files (RX-UI-28)
  - Record each answer in the DESIGN.md context (Audience, Why choose it, UI direction, Taste references, Design intent, What people do in it, Numbers that may be shown); a missing or blank field is unanswered, and Confirmed capabilities does not say what people do.
  - When the user hands a question back, infer that answer, label it inferred, and continue.
- Do not: Build directions from the category alone (every gold app gets a gold shop), recommend plain, clean, or minimal as the character, ask open questions with no options, ask what the context already answers, or treat an inferred answer as the user's.
- Why: Without the product's own audience and reason to exist, an agent fills the gap with the category's cliché, so every product of a kind gets the same look; the answers are what make the direction specific. (Brand strategy and design discovery practice (audience, positioning, personality, references before visual work); landing-gold rounds 3 and 4 and owner trials T1 to T9, 2026-10-31 (docs/benchmarks/landing-gold): with only the category to go on, every RYUX run proposed the same gold-shop direction, and without content questions the pages stayed thin; owner review)
- Not when: the context already answers them, or a small change inside an existing product
- Trade-off: one more round of questions before any design; the answers are kept, so it is asked once per product
- Check: review: the questions asked or the answers cited from the context, each recorded in DESIGN.md or marked inferred

#### RX-PR-14 [Required] Every shaping decision carries its reason

- When: a design, a direction, or a page is delivered
- Do: Write the design rationale before the Delivery Gate: the five to seven decisions that shape the result (the direction and concept, the weight carrier, the section order, the palette, the type, where the primary action sits, and what was cut), one line each:
  - **Decision** → **because**: the user, the brief, or the evidence it answers, with its source and strength (Strong, Thin, None) → **principle**: the UX principle it applies, by name, and how it works here (a law of UX, a Nielsen heuristic, a Gestalt principle, or the platform's convention), with where it stops applying when that matters; a RYUX rule ID or rule name alone is not a principle, so name the principle behind it; the line on what was cut names one too. A line with a cost trades one value for another: also name the design principle, from DESIGN.md or the brief, that decided it, or say none is written (a judgment call) → **cost**: what it gives up → **would change if**: the result or fact that would reverse it
  - Name the alternative that lost and why, in the line or right after it.
  - A reason points to a person, a task, or a fact ("first-job savers distrust gold shops, so trust comes second, before how it works"), never to a taste word: modern, clean, premium, elegant, and sleek are not reasons.
  - A choice made on judgment says so (evidence None); a cultural or visual reference names what it means and why it fits.
- Do not: Describe what was made and call it the rationale, give a reason that only restates the choice ("indigo, because indigo feels trustworthy"), cite research, users, or numbers nobody gave (RX-AS-01, RX-PR-02), explain every small choice, name a principle without saying how it applies to this screen, cite one that does not fit the decision, or put rule IDs and evidence codes on the canvas.
- Why: A design whose reasons are missing can only be liked or disliked; with its reasons it can be checked, argued with, and changed for the right cause, and the next person keeps what was deliberate. (Design rationale practice (a decision recorded with its goal, the options weighed, and its cost); NNGroup design critique (feedback tied to goals, not taste); owner review 2026-11-02 of trial T10: the final message listed what was made and its risks, but not why the concept, colour, type, or order were chosen; owner request 2026-11-06: the rationale explains each decision with the UX principle behind it, in the chat and on the canvas)
- Not when: a small change inside an existing product, where one line on what changed and why is enough
- Trade-off: a longer final message; five to seven lines, not a receipt for every choice
- Check: review: five to seven rationale lines, each with a user, brief, or evidence reason and its strength, a UX principle named and applied to this screen, a cost, and what would change it; the losing alternative named; no taste word as a reason; on a design-tool canvas, the annotations beside the frames, each naming its principle in plain words, and the final message saying how many, where, and how to see them

---

### UX architecture (RX-UX) · `knowledge/ux.md`

Gate area UX. Covers information architecture, navigation, flows, grouping, disclosure, search and filters. Read when designing multi-screen flows, navigation, or data-heavy views.

#### RX-UX-01 [Required] Structure from the user's goal

- Do: Choose the information architecture and pattern from what users come to do and how they look for it. Keep together what the user checks together, and show each fact once.
- Do not: Apply a stock SaaS layout (sidebar, KPI cards, table) because it is familiar, or show the same fact twice on one screen (the merchant or the amount in the summary and again in a row, the balance in the header and in a card).
- Why: The right structure depends on the task; a template answers a different question. A repeated fact costs reading time and leaves the user to wonder which one is right. (NNGroup information architecture research; Gestalt proximity and common region (Palmer 1992): items close together or in one container read as one group; ryux four-problems blind rating, rater 1 (product designer), 2026-10-16: repeated facts were a reason not to ship; Pareto principle (Juran, after Pareto): a few tasks carry most of the use, so they get the structure first; uniform connectedness (Palmer and Rock 1994): elements joined by a line or a shared fill read as related)
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

- When: the work is a new flow, a consequential change (payment, sign-up, navigation, a core task), or a recommendation on an open brief
- Do: Close the design or build with a usability test plan a person can run; RYUX prepares it, people run it:
  - research questions: the open unknowns, the Frame success criteria, and the heuristic evaluation findings marked as needing a test
  - three to five task scenarios that are realistic, ask the participant to do something rather than describe it, and use none of the interface's labels or steps ("Kamu ingin membayar pesanan makan siang dengan saldo e-wallet", not "Ketuk Bayar lalu pilih GoPay")
  - participants: five per user group for a qualitative test; at least twenty when the goal is a number
  - a success measure per task, taken from the Frame criteria
  - after launch: the metrics to watch (task success, time on task, errors, completion, support tickets) and the baseline to measure before release
  - Plan at least two rounds of test and fix; a result that changes the context or the criteria sends the work back to Understand or Frame.
  - Before a full design exists (a proposal or a direction), the Decision Receipt's Test field is the minimum plan: never close a recommendation without it.
- Do not: Claim the design was tested with users, present AI-simulated users as participants, or write tasks that name the buttons to tap.
- Why: Rules and heuristics find likely problems; only people using the design show which ones are real, and a baseline is what makes the after-launch number mean something. (NNGroup usability testing 101; NNGroup how many test users (5 per group, 20 for quantitative); NNGroup task scenarios; NNGroup iterative design (at least three versions); NNGroup establishing baselines; NNGroup design thinking (test and implement))
- Not when: a small change (a colour, one label, spacing) or when the user says no test plan
- Trade-off: a plan nobody runs is only a list; say who should run it and when
- Check: review

#### RX-UX-13 [Preferred] A page's sections answer the visitor's questions, in their order

- When: a marketing or landing page, onboarding, or any page read top to bottom to reach one decision
- Do: Before the layout, write the questions this visitor has, in the order they have them, from the audience and the page goal (RX-PR-13): for a first-time saver, "what is this?", "is it for someone like me?", "what do I get for a small amount?", "can I trust it?", "how do I start?".
  - Each section answers one question; a question the visitor does not have gets no section, and a section that answers none is cut.
  - The order of the questions is the order of the page; the primary action sits where the visitor is ready for it, and again at the end.
  - The visual concept gives each section its form (RX-UI-27); it never adds a section or changes the order.
- Do not: Start from the usual section list (hero, features, how it works, FAQ, call to action) and fill it, or let a visual idea decide which sections exist.
- Why: A page that follows a template answers questions nobody asked and skips the one that decides; the visitor's own questions are what make the structure specific to this product. (Content strategy and conversion practice (a page as the answer to the reader's questions in order); NNGroup inverted pyramid; landing-gold concept-system trial 2026-10-31: a concept carried into every section still sat on the template order, as an independent reviewer and the owner noted; serial position effect (Ebbinghaus 1885; Murdock 1962): people recall the first and last items of a sequence best, so the action sits early and again at the end)
- Not when: task UI (a list, a form, a dashboard), where the user's task sets the structure (RX-UX-01)
- Trade-off: the order can differ from what the team expects to see; show the question list with the layout
- Check: review: the question list in Frame, and each section mapped to one question

#### RX-UX-14 [Preferred] Options show what sets them apart

- When: the user picks between two or more peer options: services, plans, tiers, delivery or payment methods, design directions
- Do: Put the attributes that differ first and make them visible at a glance (price, what is included, time, the one limit); keep what every option shares in one line above the options, not repeated in each.
  - Show the same attributes in the same order on every option, so they compare row by row.
  - Mark a recommended option only when the brief or the evidence names one, and say why.
- Do not: Repeat the same feature list in every card so the differences hide in the middle, or make options look identical except for a name.
- Why: People weigh every trade-off only when the options are few and the differences are easy to see; when they have to hunt for the difference, they take the first option that seems good enough. (NNGroup psychology study guide: explicit differences, compensatory and noncompensatory decisions, satisficing; Hick's law and choice overload (RX-PR-03); written for RYUX)
- Not when: a single option, or options that differ only in one value the control already shows (a size picker, a time slot)
- Trade-off: shared details move out of the cards; a reader who reads only one card sees less
- Check: review: list each option's attributes; the differing ones come first and in the same order on every option

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
  - When an action changes a value outside the element that was touched (a total in a bottom bar, a cart count, a badge), mark the change where it lands: a short highlight or a number transition, or keep the value next to the control.
- Do not: Let a payment or save run with no visible status, or change a total away from where the user is looking with no sign that it changed.
- Why: Silence during a wait reads as failure and invites double taps. (Nielsen response-time limits (0.1 / 1 / 10 s); Nielsen heuristic 1; Doherty threshold (Doherty and Thadani 1982): responses under about 400 ms keep people engaged; skeleton shape: pattern also in appllama-app-design-skill (MIT); written for RYUX; flow (Csikszentmihalyi 1990): a task without interruptions or unexplained waits keeps people absorbed in it; change blindness (NNGroup psychology study guide): people miss changes outside their focus)
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
  - While a confirmation is open it is the only control for that action: the button that opened it steps aside, and the confirming button repeats the trigger's label ("Publish changes", not "Publish now").
  - Give a destructive confirmation no default button; ask for typing a word only for the rarest, most dangerous actions.
- Do not: Confirm every action by reflex, use a bare "Are you sure?" before a payment, or leave the trigger beside its confirmation under another name.
- Why: Confirmation that appears everywhere gets dismissed by habit; specifics and undo catch real mistakes. Two buttons for one action, under two names, make people wonder whether they differ. (Nielsen heuristic 5; NNGroup confirmation-dialog guidance; owner review of the RYUX editor, 2026-10-29: editing a published flow showed "Publish changes" and "Publish now" at once)
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
- Why: The right keyboard removes taps and typos on phones. (HTML inputmode and autocomplete (one-time-code); platform input guidance; robustness principle (Postel, RFC 761, 1980): be liberal in what you accept; Parkinson's law (Parkinson 1955): work expands to the time it is given, so defaults and autofill shrink a task)
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

#### RX-FM-11 [Contextual] Names as people write them

- When: a form asks for a person's name
- Do: Use one full-name field unless a document or a regulation needs the parts, and then say which one.
  - Accept a single name (many Indonesians have one), long names, spaces, apostrophes, hyphens, periods, and accented letters; trim spaces instead of rejecting them.
  - When the product addresses people by name, ask what to call them instead of guessing from the first word.
  - When a real limit applies (a bank's character limit, the name exactly as on the KTP), say so at the field, before the user types.
- Do not: Require a first and a last name, reject an apostrophe or a hyphen, cap the length below real names without saying why, or make a person with one name type it twice.
- Why: A form that rejects a real name tells the person they do not fit; they type a false name or leave. (NNGroup Inclusive Design (Kendrick 2022): name fields that reject real names; W3C Internationalization: Personal names around the world; Indonesian naming practice (single names are common); written for RYUX)
- Not when: the field must match a document exactly; then say so and follow the document
- Trade-off: one field makes sorting by family name harder; store parts only when a real need asks for them
- Check: type a single name, a long name, and names with an apostrophe and a hyphen

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
- Machine check: `ryux scan` flags Rupiah written as Rp 1.000, Rp. 1.000, Rp1,000, Rp1.000,00, Rp1000, IDR 1000, or Rp followed by a space before a value (fail)

#### RX-CD-03 [Preferred] Specific, plain copy

- Do: Lead with the point and cut words that add length without meaning; write labels as RX-CD-12 says; use sentence case and plain lists, with at most one emoji where the channel expects it.
  - When numbers are compared and lower is better (errors, invented policies, cost), say so beside the label ("fewer is better").
- Do not: Use vague labels ("Submit", "Learn more", "Get started" when a specific action exists), hype words ("unlock", "elevate", "seamlessly", "revolutionary", "next-generation"), emoji bullets, ALL CAPS, or stacked exclamation marks.
- Why: Specific, plain copy tells users what happens next; decoration on every line buries it and reads as generated. (NNGroup 3 C's of informational microcopy (clarity, concision, character); NNGroup button and link-label guidance; ryux run 2026-10-02: unconstrained WhatsApp copy; owner review of a benchmark video 2026-10-28: "8 vs 0, why does 0 look better?")
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
- Machine check: `ryux scan` flags dates as 10/02/2026 and times as 2:30 PM in Indonesian copy (lang id, id-ID, Rupiah, or Indonesian words in the folder); test files are skipped (warn)

#### RX-CD-10 [Contextual] A FAQ answers questions people ask

- When: The page has a FAQ or help section.
- Do: Take the questions from support data, sales calls, the brief, or the product's docs, and answer them with the product's real policies; mark an answer that nobody has confirmed as [CONFIRM].
- Do not: Fill a FAQ with template questions ("Is it secure?", "Can I cancel anytime?") or answer with policies nobody decided.
- Why: A template FAQ answers nothing, and an invented answer becomes a promise someone has to keep. (pattern also in anti-slop (MIT) R-28; written for RYUX)
- Check: review

#### RX-CD-11 [Preferred] Tone fits the moment, voice stays

- Do: Set a tone profile once, from the brand and the users, on four scales: formal to casual, serious to funny, respectful to irreverent, matter-of-fact to enthusiastic; add a few tone words and the anti-tone words to avoid ("hangat, tidak sok akrab").
  - Take it from the Voice and tone field in DESIGN.md when it is set. When it is blank, infer it from the product's existing copy or brand docs, label it inferred in Assumptions, and keep it out of DESIGN.md until the user confirms it: copy that is live is observed, not a brand rule.
  - Keep the voice the same everywhere and shift the tone with the user's state: matter-of-fact and serious for errors, money, and waiting; brief for success, where a check mark already says it worked ("Alamat disimpan", without "berhasil" unless the voice wants the warmth); warmer only in onboarding and empty moments.
  - Add personality only where it costs no clarity or length: clarity first, concision second, character third.
- Do not: Joke in an error or a payment failure, cheer on a routine save, or switch between "kamu" and "Anda" across screens.
- Why: The same words feel caring in one moment and careless in another; tone measurably changes how users judge a product. (NNGroup tone-of-voice dimensions (four dimensions; tested tone profiles); NNGroup 3 C's of informational microcopy)
- Not when: the brand guide already defines the tone; follow it
- Trade-off: a sober tone in serious moments gives up some brand flavour
- Check: review against the Voice and tone field in DESIGN.md; a profile taken from existing copy is labeled inferred

#### RX-CD-12 [Required] Labels say what happens

- Do: Start a button with a verb and name the result ("Bayar Rp45.000", "Simpan alamat", "Lanjut ke pembayaran"), in about four words or fewer.
  - Make a link meaningful on its own, as if it is the only thing read: specific ("Lihat syarat promo", not "Selengkapnya"), front-loaded, and sincere: the screen it opens is the one it promised.
  - Keep a label and the title of the screen or dialog it opens the same words (RX-CD-05).
- Do not: Use "Submit", "OK", "Klik di sini", "Selengkapnya", or "Get started" when a specific action exists, or a label that promises one thing and opens another ("Lihat detail & pesan" that opens a contact form).
- Why: Users read the label, not the text around it; a label that breaks its promise costs trust on the next tap. (NNGroup better link labels (4Ss: specific, sincere, substantial, succinct); information scent (Pirolli and Card 1999; NNGroup): people follow the label that seems to lead to their goal; NNGroup UI copy guidance on command names; NNGroup button and link-label guidance)
- Check: audit_copy
- Machine check: `ryux scan` flags a link or button whose whole text is generic (Selengkapnya, Klik di sini, Learn more, Read more, Click here, Submit), with no information scent (warn)

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
- Why: Help is read only at the moment of doubt; help elsewhere is help nobody finds. (Nielsen heuristic 10 (help and documentation); NNGroup 10 usability heuristics; paradox of the active user (Carroll and Rosson 1987): people start using a product before reading any instructions, so help sits where the question comes up)
- Trade-off: help in context adds text to the screen; keep it to the steps that need it
- Check: heuristic_eval H-10

#### RX-CD-17 [Required] Choices are framed honestly

- Do: Write each option as the person's own intent in plain words ("Lewati", "Tidak, terima kasih"), say what each one costs or gives, and leave paid add-ons unchecked: insurance, protection, a tip, a donation, or a subscription is opted into, not out of.
  - Show the options with equal clarity; the option the business prefers is primary only when it is also the user's likely goal (RX-PR-03).
  - Make the copy match what the interface does: "Gratis" is free, and "Batalkan kapan saja" is a tap away.
- Do not: Shame the decline ("Tidak, saya tidak mau hemat"), push with a loss ("Kamu akan kehilangan semua keuntungan") when nothing real is lost, pre-check a paid add-on, or hide the decline as a faint link.
- Why: Framing changes what people choose; a choice won by pressure costs trust and comes back as complaints, refunds, and churn. (NNGroup Interface Copy Impacts Decision Making; Thaler and Sunstein, Nudge (2008): choice architecture; RX-AS-04 (no fake urgency); RX-IX-05 (full cost before commitment); written for RYUX)
- Check: review every choice screen: the labels, the defaults, and the way to decline

---

### UI design (RX-UI) · `knowledge/ui.md`

Gate area UI. Covers the visual system of a product: hierarchy, type, layout, density, color, containers, icons, visual language, and detail craft. Read when doing visual design or visual refinement.

#### RX-UI-01 [Required] [Quality Lock] Hierarchy follows priority

- Do: Make the primary action and the key information the most prominent things in each area, with one clear focal point.
  - Place each control next to the data it changes (a hide-balance toggle beside the balance it hides, not in the header).
  - Make the primary action read as an action, not a place: its own button with an action label. It may sit in the center of a bottom bar when it is clearly different from the tabs (its own shape, color, and size, with room around it), but it is never styled as one of the tabs and never crammed between them.
  - Use one display size per screen, for its single most important number or heading.
  - Show each fact and each action once per view. When an action needs two places (a header and a bottom bar), each appears only at the widths where the other is hidden. Show a state as text, not as a disabled button ("Up to date", "All drafted").
- Do not: Give everything equal weight, let decoration outrank content, park a control far from what it acts on, make the main action look like one more tab, or repeat a count or an action in the same view.
- Why: Hierarchy is how users know what to read and do first; a control beside its data shows what it changes, and an action that looks like a tab reads as a place, not a task. A fact shown twice makes users check whether the two agree, and a second button for one action, or a disabled button that only reports a state, takes the place of the next real step. (NNGroup visual hierarchy; Gestalt proximity; Fitts's law (Fitts 1954) for the primary action's size and reach; ryux four-problems blind rating, rater 1 (product designer), 2026-10-16: a hide toggle far from the balance and a CTA crowding the bottom nav were reasons not to ship; explore-judge blind rating 2026-10-18: the same rater shipped a screen with a distinct centered pay button in the bottom bar; owner review of the RYUX editor, 2026-10-28 ("no double information or double action"): one personal-data count shown three times, Publish in both the header and the review card, and disabled "Up to date" and "All drafted" buttons that only reported a state)
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
  - With no visual direction in the brief or DESIGN.md, discover it with the user before building: three directions, one chosen (RX-UI-26).
- Do not: Reach for the category cliché (coins, money rain, floating dashboards, or gradient blobs for fintech; generic 3D characters for any app), write an image prompt without a brief (role, concept, composition), or decline the category default by retreating to a neutral surface (cream or white, ink, one muted accent, no imagery): declining a look is not choosing one.
- Why: A default visual language makes the product interchangeable with its competitors. (art direction practice; RX-AS-05 purpose gate; owner review 2026-10-27: a food-delivery build "too plain, no illustration" from a DESIGN.md with no visual direction)
- Not when: an existing brand system already defines the visual language; follow it
- Trade-off: a brief takes time before any image exists
- Check: the Visual Brief; review

#### RX-UI-26 [Preferred] With no direction given, discover three and let the user choose

- When: a new product, a new look, or an expressive surface, and no visual direction in the prompt, DESIGN.md, or the product that exists
- Do: Build three directions from the Product Discovery answers (RX-PR-13) and the direction grammar (knowledge/ui.md), and name the category default:
  - one conventional (a familiar structure done well, still with a signature and a visual anchor), one grounded in this audience's world (an object, place, ritual, or material they know; not a paper object by default), one that stretches how the product speaks; name each by its character, not a style keyword, and say which answer it rests on
  - Each idea comes from a different source: the product's own mechanic (what it measures, moves, or records), the audience's everyday objects and rituals, and the audience's culture and place (a craft or textile, a performance, a script, architecture, a landscape, street language). At least one comes from culture and place, at most one from the product mechanic. For a cultural source, name the motif, what it means, and why it fits the product; never use a sacred or restricted motif as decoration, and take the most touristic symbol only when its meaning fits.
  - The three differ in visual language, not only in concept: three or more grammar dimensions, philosophy or grounding among them; base surface from different families (light and cool, dark, a saturated colour; cream, ivory, warm white, and paper are one family, used once at most); temperature (one cool or neutral, whatever the character); weight carrier (RX-UI-29); material and imagery model (flat with flat vectors once at most; a render, a retouched photo, or a UI composite at least once). Palettes follow RX-UI-31; each passes the coherence rules.
  - Calibrate each against a known product of its visual language for craft only: name it in the tile and take nothing from it.
  - Show each as a style tile with the same fields (name and philosophy, base surface, type pair with a heading, body, and figures, palette with roles, a button and a card, medium (one, or a named mix with its binding, RX-UI-32), a small hero holding one asset made for it, signature, calibration product, risk), side by side on the canvas, or as text with the same fields.
  - Ask as choices, the recommended one first, numbered once: the same number in the message, the question, and the tiles; with room to combine (a combination passes the coherence rules again); asked for others, offer three new ones. Without a choice tool, write them as numbered options, end the turn, and wait.
  - Choose yourself only when the user hands this choice back or the task runs without questions (a pipeline, a batch job); "up to you" on another question hands back only that question. Then pick one with a reason, marked provisional in the Assumptions, and offer the other two in a line each.
- Do not: Build the directions from the category alone, draw all three ideas from the product and the transaction, number the options differently in two places, pick three style keywords from a list, offer three palettes of one layout, put all three on light warm surfaces, describe a carrier in the tile instead of making it, offer a conventional direction with no signature or visual anchor, recommend the category default because it feels safer, ask an open "what look do you want?" with no options, or let a direction change the facts: assumptions about the look are allowed, assumptions about the product are not (RX-AS-01, RX-PR-02).
- Why: With no direction, an agent ranks the familiar look first and ships it, and a rule that tells it to be bold moves it to the next familiar look; the variety has to come from the user's choice among directions that fit. (Art direction practice (style tiles; a direction as a set of reasoned visual decisions); landing-gold rounds 2 to 4 and owner trials T1 to T9, 2026-10-30/31 (docs/benchmarks/landing-gold): with a direction assigned or chosen by the agent, RYUX runs converged on one look and rated below a peer for slop resistance; owner decision 2026-10-31 (Design Direction Intelligence); landing-gold round 5, 2026-11-01, and owner review: all three RYUX runs drew their ideas from the product and the saving habit and offered nearly the same three directions, while the peer drew on Indonesian textile, theatre, and shop culture; owner decision 2026-11-06: a product that exists keeps its own direction, read from its screens and code, instead of being offered three new ones)
- Not when: the prompt or DESIGN.md sets the direction, an existing brand system defines it, or the product already has screens, code, or a design file: their visual language is the direction, read through Analyze and written as the direction: block with status observed and its source files, unless the user asks for a new look; follow it, and on a surface it was not written for, carry it by RX-UI-33. A small change inside an existing product
- Trade-off: one more question and three tiles before the design starts
- Check: the Delivery Gate names the three directions offered, the answer each rests on, the one used, and whether the user chose it or it is provisional; the three differ on at least three grammar dimensions; three base surface families, warm off-white at most one, one cool or neutral direction; flat with flat vectors at most one, a render, retouched photo, or UI composite in at least one; three idea sources, one from the audience's culture or place, its meaning named; one numbering for the options; a made asset in each tile

#### RX-UI-31 [Preferred] A palette is built from roles, not picked

- When: a new palette: a new product, a new look, or a direction's tile (RX-UI-26)
- Do: Build the palette in this order and write it down:
  - roles: dominant, supporting, action accent, neutrals, and semantic colours; one meaning per colour everywhere
  - the scheme (monochromatic, analogous, complementary, split-complementary) and why it fits the character
  - neutrals from the dominant hue at very low saturation (a cobalt page gets a blue-tinted white); a warm neutral (cream, ivory) only when the dominant hue is warm, or with a written reason
  - three or four hues besides neutrals; the strongest colour on the primary action, the rest muted; roughly 60/30/10 as a guide
  - every text pair passes WCAG contrast, and colour is never the only cue (RX-A11Y-01)
  - Write the scheme and the neutrals' source into the direction block in DESIGN.md.
- Do not: Reach for cream or ivory as the light colour because the character is warm or the product is gold, add a hue without a role, give one colour two meanings, or spend the strongest colour on decoration while the action stays muted.
- Why: A palette chosen colour by colour drifts to the model's defaults (cream, one accent, grey); roles and a named scheme make every colour answer to the page's meaning and keep the neutrals in the same family as the brand. (NNGroup visual design articles (a limited palette of three or four colours, consistent meaning, bright for what matters, muted for the rest, contrast for low vision and colour blindness); colour practice for schemes and proportions; owner review 2026-10-31 of RYUX trial T5: a cobalt page still used cream for its light bands)
- Not when: a brand or design system that already defines the palette; then follow it
- Trade-off: tinted neutrals tie the page to one hue and make a later change of the dominant colour touch every surface
- Check: the scheme named; the light neutral's hue within 30 degrees of the dominant hue, or a written reason; hues besides neutrals four or fewer; the strongest colour on the primary action; text pairs measured

#### RX-UI-33 [Required] A direction moves to a new surface by its brand layer, not its mockups

- When: a direction chosen for one surface (a landing page, a campaign, a marketing image) is used on another (the product app, a dashboard, an email)
- Do: Carry the brand layer and decide the rest again for the new surface:
  - carry: the type pair, the colour roles, shape, voice, and the signature as one motif; in task UI the direction shows through these, not through the marketing page's imagery
  - decide again for the surface's job: density, components, navigation, hierarchy, and motion, with Frame and Explore for that surface (capabilities/design.md, stages 2 and 3)
  - a device mockup inside a marketing image is illustrative, a stand-in for screens nobody had designed; never trace the real screens from it
  - imagery in the app is optional and small: one or two moments at most that have room for it (an empty state, a success), sized to the component it sits in (a spot illustration in a card, not a landscape band); never behind data, figures, or actions; an asset that fails the craft read (RX-UI-30) is left out
  - give the app's brand band one surface treatment taken from the direction's grammar (material, shape, colour), so it is not a flat fill: contour lines for a direction grounded in a landscape, a tonal gradient with a soft light for a warm one, soft shapes for an organic one, glass only when the material is glass or digital; one treatment across the app, drawn flat or as an effect (not a picture), text over it still passing contrast (RX-A11Y-01), and never a trend effect the direction does not call for
  - write a surface entry in the DESIGN.md direction block: what carries, what changes, and which moments, if any, hold imagery
- Do not: Rebuild the marketing page's phone mockup as the app, read a direction written for a page as the spec for task screens, set a landscape render behind a balance or a form, add imagery to a screen only so it looks less plain, leave the brand band a flat fill when the direction has a ground, or pick blobs or glass because they are in fashion.
- Why: A direction is chosen for the surface in front of the user; an app carries it in its type, colour, and one motif, and a page's imagery set behind data reads as forced. (Art direction practice (a brand carried across surfaces); owner review 2026-11-02 of the Raja Emas app: App 3, the landing direction applied to the app, read as flat and as the landing's phone mockup built again; App 5, with imagery mapped to app moments, set a terrace render behind the balance and read as forced; App 6, with imagery left out, read as safe but plain; the owner compared contours, a gradient with warm light, soft bubbles, and glass on its green band and asked for a treatment chosen from the direction)
- Not when: the direction block already has an entry for this surface; a small change inside an existing app
- Trade-off: deciding the surface again costs a Frame and Explore round that the user may think is already done
- Check: the surface entry in the direction block (carry, change, moments, surface treatment and the grammar it comes from); screens not traced from a marketing mockup; imagery on two moments at most, sized to its component, none behind data or actions, each passing the craft read; the brand band carries one surface treatment, text contrast over it measured

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

- Do: Center icons on the optical middle of the text beside them and size them to its line-height; take every icon from one set and match its stroke to the type weight; right-align (or decimal-align) number columns; take borders, dividers, radii, and shadows from a small token set; truncate long text on purpose, with the full value still reachable (a tooltip, a detail view, or wrapping).
- Do not: Let icons sit high or low against their labels, mix icon sets or stroke weights, center amounts in a table, or invent a one-off shadow for one card.
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
- Why: Few icons are recognised without a label; an ambiguous icon costs more than a word, and an icon whose meaning changes breaks what users learned. (NNGroup icon usability; Nielsen heuristic 4 (consistency and standards); Apple HIG and Material iconography; Prägnanz (Gestalt; Wertheimer 1923): people read the simplest shape a figure allows, so a simple silhouette is recognised first)
- Not when: a dense expert tool whose users learn the set; then a tooltip plus an accessible name
- Trade-off: labels take space, especially in toolbars and tab bars
- Check: review: list each icon with its meaning and flag duplicates; heuristic_eval H-04

#### RX-UI-35 [Contextual] Translucent surfaces stay readable

- When: a surface is translucent or blurred over other content (glass, frosted panels, bars or sheets over images, video, or a scrolling page)
- Do: Check the text and icons on it against every background it can sit over (photos, video, the busiest part of a scrolling page), not only the calm one in the mockup, and raise the blur and the opacity of the fill until they pass (RX-A11Y-01).
  - Give the edge a faint stroke or a tone step so the panel keeps its shape over a similar background.
  - Fall back to a solid surface when the user asks for less transparency or more contrast (prefers-reduced-transparency, prefers-contrast, and the platform settings); where the platform has its own material (Apple materials, Windows Acrylic), use it.
  - Keep it to a few surfaces with a reason (navigation layered over content), not the look of every card.
- Do not: Check glass contrast only over the mockup's background, set body text on a thin blur over a photo, or make every card glass.
- Why: Text on a translucent surface loses contrast over busy content, and the content behind it changes as people scroll, so a panel that passes in the mockup can fail in use. (NNGroup Glassmorphism: Definition and Best Practices (Brown 2024); WCAG 2.2 SC 1.4.3 and 1.4.11; Apple HIG materials and Reduce Transparency; RX-UI-33 (glass only when the direction calls for it); written for RYUX)
- Trade-off: more blur and opacity make the effect quieter
- Check: render over the busiest background it can meet; contrast check; turn on reduced transparency
- Machine check: `ryux scan` flags a backdrop blur in a folder where nothing handles prefers-reduced-transparency or prefers-contrast (warn)

---

### Imagery and motion (RX-UI) · `knowledge/imagery.md`

Gate area UI. Covers art direction, composition, expressive surfaces, motion, asset sourcing and provenance, and delight. Read when the work has photos, illustration, 3D, motion, or an expressive surface (hero, landing, onboarding, empty state, brand moment).

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

#### RX-UI-11 [Contextual] [Quality Lock] Motion earns its level

- When: the design adds motion or transitions
- Do: Classify each motion: L1 state feedback, L2 component transition, L3 page transition, L4 storytelling, L5 decorative; the higher the level, the stronger the reason it needs.
  - Weigh how often people see it: a surface opened many times a day (menu, dropdown, tabs, list selection) gets a short transition that can be interrupted, about 150 to 250 ms of opacity with a small scale or a few pixels of movement from its trigger, and only a keyboard-opened command palette or shortcut appears at once; standard transitions belong to occasional surfaces (modal, drawer, toast), and expression to rare or first-time moments, where a completed payment or a first success may celebrate once without moving the amount.
  - When a control changes what is shown (tabs, segmented control, filter), the content moves with it: the indicator slides by transform and the panels cross-fade with a few pixels of travel in the same direction, together.
  - Take timing and easing from one motion personality, define them once as motion tokens, animate transform and opacity rather than layout properties, and honor reduced motion (RX-A11Y-08).
  - Anything that opens and closes (menu, popover, dialog, drawer) uses transitions that can reverse halfway, so a close or reopen mid-animation turns back from where it is, and it closes no slower than it opened.
  - Time each motion by its size and the distance it travels, then tune it to the motion personality: simple feedback (a toggle, a checkbox) about 100 ms; a component or a modal entering about 200 to 300 ms; 400 ms only for a large move across a large screen; near 500 ms, task UI reads as waiting. What leaves takes a little less than it took to enter. Ease out what enters; ease in or in-out can suit what leaves; linear only for loops and progress.
  - Match the motion to who started the change: a change the user made and is watching moves fast and short; a change they did not ask for (a new message, a background update) arrives slowly with little or no change of position, as a fade; only something they must act on now may move to catch the eye. Never shift text someone is reading.
  - One movement holds attention at a time: no two animations compete on screen. Items that enter together stagger by about 30 to 50 ms, the most important first, and the whole sequence stays within about 500 ms on task UI.
  - Animate a change the user would otherwise miss (a cart count far from the button they pressed), and let direction carry meaning: slide for forward and back in a process, zoom in to go deeper and out to go up a level, a sheet that rises can be pulled down. Motion never stands in for a visible label.
  - Hand motion off as a spec: per element, the trigger, the properties that change, the duration in ms (not frames), the delay, the easing in the platform's form (cubic-bezier for CSS, named curves on iOS and Android), and what reduced motion shows instead; a video supports the spec, it does not replace it.
- Do not: Animate everything, give a surface people open many times a day an entrance longer than about 250 ms or one they must wait for, move a tab indicator while the panel content snaps, freeze it with no transition at all when a short one would show where it came from, repeat a celebration, play an open-only keyframe animation on something people can close or reopen at any moment, use one generic duration and easing (transition: all 0.3s) everywhere, let decorative motion delay content or input, move data the user is reading (a balance, an amount, a table value) for effect, run two animations at once that compete for attention, slide or bounce in a change the user did not ask for, or hand off motion as a video alone.
- Why: Motion directs attention; unearned motion steals it from the task and can make some people unwell. (NNGroup animation and usability guidance; WCAG 2.3.3 animation from interactions; frequency check: pattern also in emilkowalski/skills (MIT) find-animation-opportunities; reversible open and close: pattern also in emilkowalski/skills (MIT) animate; default timing, press state, and still data: pattern also in appllama-app-design-skill (MIT); short transitions on frequent surfaces, content that moves with its control, and one celebration on rare moments: ryux owner blind ratings 2026-10-18 (explore-judge Part C, motion-loosen round 1) and hero-finance follow-up; durations by size and distance, shorter exits, easing, motion matched to who started the change, one movement at a time, change blindness, direction as meaning, and the motion spec in ms: NNGroup Animation Duration and Motion Characteristics (Laubheimer 2020), The Role of Animation and Motion in UX (Laubheimer 2020), and Animation for Attention and Comprehension (Harley 2014; motion captures attention: Pratt et al. 2010); stagger timing: Material motion, pattern also in owl-listener/designer-skills (MIT) motion-system; all written for RYUX)
- Not when: L1 feedback on standard controls that follows the platform defaults
- Trade-off: fewer flourishes on marketing pages
- Check: review; reduced-motion test; for a handoff, the motion spec per element
- Machine check: `ryux scan` flags a transition on all properties or on layout properties (width, height, top, left, margin, padding) (warn); a UI transition longer than 500 ms (warn)

#### RX-UI-12 [Contextual] A point of view on expressive surfaces

- When: the surface is expressive: a hero, landing page, onboarding, empty state, or brand moment, or the brief asks for a new look or more personality; on a new product's task UI, the brand layer only (see Do)
- Do: Run Explore (capabilities/design.md, stage 3) with alternatives that each carry a name, a concept taken from the product's own idea (for a tool about evidence: receipts, citations, marks of proof), and a signature element (type, composition, imagery, or motion); then make the rest of the design serve the chosen signature and put its concept in the Visual Brief.
  - On task UI: the alternatives are structure hypotheses and the conventions that must hold stay fixed. A new product's brand layer must carry one signature from its own domain (a mark, the type voice, a colour temperature, or one brand moment in the flow), never a layout change and never decoration without a job (RX-AS-05). Record it in the Delivery Gate UI line.
  - When the brief names reference products, read each one before it shapes the alternatives: the principle you borrow, what stays theirs (colours, mascot, signature features), and where you use it. Carry the borrowed character at the strength the brief asks for: when it asks for a reference's feel (playful, chunky, gamified), the feel shows on every main screen, in type weight, shape, colour energy, and one brand moment, not only in a button detail. A reference's signature mechanics (a streak, a daily goal, a score) are unconfirmed capabilities: propose them, never show them as facts.
- Do not: Show alternatives that differ only in colour or copy, choose for the user without showing them, or let the signature be the category's default (for developer tools a terminal or agent-session panel; for SaaS a dashboard screenshot; copy on the left and product on the right), or relabel that default as a concept. A product screen can support the signature, not be it. Turn a named reference into adjectives ("calm, white, soft") or copy what belongs to its brand.
- Why: Users remember a product by its idea; a correct but generic surface is forgotten and could belong to any competitor. (brand and art direction practice; RX-UI-05 layout from content; rendered variants on named axes, compared side by side, chosen by the user: pattern also in emilkowalski/skills (MIT) prototype; fit first with craft as tie-break, pairwise with a runner-up: ryux owner blind ratings 2026-10-18 (judge round 1: weighting distinctiveness picked against the designer); written for RYUX; owner review of a no-skill vs RYUX run (2026-10-20): RYUX kept the reference's feel to one button detail; aesthetic-usability effect (Kurosu and Kashimura 1995): people judge a better-looking interface as easier to use, which can also hide its problems in a test)
- Not when: an existing product whose brand system already sets the brand layer, or a small change inside a fixed design system; follow it
- Trade-off: a strong idea takes a decision someone may disagree with; keep it honest and on brand
- Check: the swap test (RX-AS-09); review

#### RX-UI-27 [Preferred] On an expressive surface, the concept shapes the page, not one card

- When: an expressive surface (a landing page, onboarding, a brand moment) with a chosen concept
- Do: Sections and their order come from the visitor's questions (RX-UX-13); the concept gives each its form from the concept's inventory (the parts the real thing has), and a generic section form needs a reason (knowledge/imagery.md, Expressive surfaces).
  - The hero's concept object does the product's core job with sample data, not a sample on display.
  - Devices: write three from the inventory, drop the one any product in the category would draw first (for gold: a coin, a bar, a scale, a ruler), and keep two or three, each naming the part of the inventory it comes from (one that names none is cut); each appears in three or more sections where it does a job (shows data, marks structure, leads to the next step); a decorative repeat counts once, and none sits between a message and its action.
  - The system repeats, the subject does not: what returns across sections is a pattern, a ground, a divider with meaning, a data form, or a rhythm, changing its role or form each time; each section's focal visual has its own subject (a scene, a figure, a moment of use), and one subject is the focal visual of two sections at most (a new angle or state of the same object counts as the same subject).
  - One decisive type move and one dominant colour field come from the concept.
  - Compose, do not stack: at most two same-skeleton sections in a row (text one side, a visual the other), and two or more composition moves (knowledge/ui.md, Direction grammar, Layout), each keeping the reading order and the path to the action.
  - Headlines in the concept's language; unknown facts go to the handoff notes, never a section of placeholders.
  - Before the gate, run the skeleton, swap, and thumbnail tests, with fresh eyes when a subagent is available (capabilities/design.md, stage 5).
- Do not: Let the concept add sections or set their order, put the concept in one hero card and build the rest from the template order, leave the page empty and call it restraint, repeat a device as a divider to reach a count, redraw the hero object as the focal visual of section after section, alternate text-left and text-right splits down the page, fill a section with "to confirm" chips or dashed boxes, or let a device or the concept invent a product fact (RX-AS-01, RX-PR-02).
- Why: A concept that lives in one card is decoration: the rest of the page is the same template every generated page uses, and that is what reads as AI-made. (Art direction practice (a concept carried as a system of forms and devices); landing-gold round 3 side-by-side read and owner trials T7 and T8, 2026-10-31: RYUX pages kept the concept in one card over a template order, then repeated one device as a divider and alternated split sections; owner review; landing-gold round 5, 2026-11-01: the same jar or ruler was the focal visual of three or four sections and read as monotonous (owner review), while the peer repeated a pattern or a scene break and changed the subject)
- Not when: task UI, where the structure stays familiar (RX-AS-09); a brand system that already defines the page
- Trade-off: a concept-shaped page takes longer and can overreach; each device still passes the purpose gate (RX-AS-05)
- Check: sections whose form comes from the concept (at least half), devices doing a job in three or more sections (decorative repeats counted once), the category's first-idea device dropped, same-skeleton sections in a row (two at most), composition moves (two or more), focal subjects per section listed (none focal in more than two sections), sections that are mostly placeholders (none), and the skeleton, swap, and thumbnail tests; report them in the Delivery Gate UI line

#### RX-UI-29 [Preferred] An expressive page has one weight carrier, made at full strength

- When: an expressive surface (a landing page, onboarding, a brand moment)
- Do: Name what carries the page's visual weight and make it at full strength, its asset first and read alone (RX-UI-30): atmosphere (a colour field or mesh made as an asset), a photo or render (labeled when not real), the product's UI (half the hero width or more, layered, with depth), illustration (a set for this product, in the hero and two more sections), or display type (80px or more on desktop over a colour block).
  - Floor: the hero holds the carrier, not only text and buttons; a full-bleed non-neutral band or a dark and light switch (the base surface counts: coloured bands over a cream page are still a cream page); a named depth system; at most one text-only section; images in one family, each section with its own subject (a new angle of the same object is not a new subject, RX-UI-27).
  - The carrier never costs the task: the primary action visible on the first screen at desktop and at 390 by 844; nothing decorative between a message and its action; on mobile the hero visual pushes the next section at most one screen down; sample-data labels next to their figures; decorative layers hidden from assistive technology.
  - Write the carrier and the depth system into the direction block in DESIGN.md (capabilities/design.md, stage 1); all of it speaks the direction's world (RX-UI-32).
- Do not: Ship a hero of text and buttons with a small card beside it, set every band on one neutral surface, name a carrier and then draw it small or leave it out, or fall back to text because making an image or a vector takes longer.
- Why: A page with no weight carrier has nothing for the eye to land on; the reader sees layout and text, which is the look of every generated page, however correct its rules are. (Art direction practice; published design-language descriptions of five marketing sites (VoltAgent awesome-design-md, MIT): each puts its weight in one medium made at full strength; owner review 2026-10-31 of RYUX trials T1 to T4, all on cream or white with text and small cards, read as plain and AI-made)
- Not when: task UI; a brand system that already sets the page's look
- Trade-off: making the carrier's asset takes time and tool calls before the page, and a strong carrier can crowd the message if its focal point fights the headline
- Check: the primary action on the first screen at 1440 and 390 by 844; no decoration between a message and its action; sample-data labels next to their figures; no image used twice; the carrier named and present in the hero; full-bleed non-neutral bands or a mode switch (count); depth system named; text-only sections (at most one); report the carrier in the Delivery Gate UI line

#### RX-UI-32 [Required] One page, one world

- When: an expressive surface built from a chosen direction
- Do: Hold the page to the direction's world:
  - every asset, device, and section shares the direction's material and light; an asset from another direction is reused only when its material matches, and a changed direction rebuilds from its new direction block
  - one medium for the page: flat 2D, 3D render, retouched photo, or UI composite, or one named mix with its binding, chosen with the direction:
    - photo and vector: the photo cut out and graded to the palette; the vector in one line weight and colour that touches, wraps, or annotates the photo, never floating beside it; the same pairing in every section
    - render and UI: the product's screens set into rendered devices as their textures, not flat vector phones beside renders
    - render and flat shapes: flat shapes only as ground and background, every object rendered, the render's light and shadow falling on the flat ground
    - ornaments, dividers, and icons take the page's medium; a mix without a name and a binding is two pages
  - plan the backgrounds as a rhythm before building: two or three surfaces in a repeating pattern, with the transitions designed
  - the concept runs through the page, not only the first and last section, as a system (material, pattern, ground, rhythm) while each section's focal subject changes (RX-UI-27)
  - the counts in RX-UI-27, RX-UI-29, and RX-UI-30 are minimums that serve the concept: an idea that fights unity is translated into the world's material, light, and shapes, and cut only when it cannot be; unity never lowers the carrier or the boldness the user chose
  - Before the gate, fresh eyes list the elements that look as if they came from another page; fix them.
- Do not: Make the page neat by making it timid, tick each rule with a different idea, carry a render from a rejected direction into the chosen one, set photoreal renders beside flat vector devices with nothing binding them, change the background world every section, or add a composition move only to reach a count.
- Why: A page that satisfies every rule with a different idea reads as a collage; people read unity as care and a collage as unfinished, however good each part is. (Art direction practice (unity of one surface); owner review 2026-10-31 of trial T8 (a render from the rejected direction and a new background world every section, read as disconnected) and trial T9 (with a cut-first version of this rule, neat but less creative); owner review 2026-11-02 of trial T11: renders, flat vector phones, and a flat roof-tile edge on one page read as undecided between 3D and 2D; a photo edited and paired with vector is a combination that holds when it is chosen and bound)
- Not when: task UI; a page that is deliberately a collage, where that is the chosen concept
- Trade-off: unity narrows choices and can cut an idea that is good on its own
- Check: the page's medium or named mix, with its binding, in the direction block; fresh-eyes list of elements from another page (none left); every asset's material and light matching the direction block; the background rhythm written before the build

#### RX-UI-13 [Contextual] Source assets on purpose

- When: the design needs photos, illustration, 3D, icons, logos, or video
- Do: Pick each asset's source in this order: real product screens or the brand's own assets; standard marks of a confirmed fact, from their official source (RX-UI-28); a licensed library (one icon set, photos whose license you can name); a custom or generated asset made from the Visual Brief (the design tool's image generation when it has one) and labeled illustrative; otherwise a placeholder that looks like one (RX-AS-03). Record where each asset came from.
- Do not: Draw or imitate another company's logo (use its official file, RX-UI-28), invent the product's own mark (RX-AS-11), mix icon sets, use a photo you cannot license, or fill a gap with a generic stock scene.
- Why: Assets carry claims about the product and its users; an unsourced or borrowed asset is a claim nobody can back. (licensing and trademark practice; RX-UI-07; RX-AS-02)
- Not when: a wireframe or internal prototype where placeholders are expected
- Trade-off: real or licensed assets take longer than a stock search
- Check: asset list with sources; review

#### RX-UI-28 [Preferred] Standard marks are used as they are, when their fact is confirmed

- When: the design shows where to get the app, how to pay, or who stands behind the product, and the brief, DESIGN.md, or the user confirms the fact, or the design needs real brands nobody has chosen yet (which banks offer a virtual account)
- Do: Use the official mark of a confirmed fact, from its owner, at its guideline size and clear space: store badges (App Store, Google Play) in the page's language; accepted payment marks (QRIS, confirmed banks, e-wallets, cards); a confirmed partner's or regulator's mark, with a handoff note that it needs the owner's permission; real platform chrome on device screens.
  - Ask for the files with the fact questions (RX-PR-13). Get each in this order: the user's file; the owner's brand or media kit page (found by searching, not guessed URLs); the platform's component library; a public archive that names source and license (Wikimedia Commons). Upload it as it is, and list every mark in the handoff: the mark, the file's source URL, its licence or terms, and "needs the brand owner's permission before launch" for a bank, partner, or regulator mark.
  - Brands nobody chose yet (the banks for a virtual account, the e-wallets offered): ask the user whether to show real brands with their logos or made-up names. When you cannot ask, use well-known real brands with their official logos and an open-rule label on the list (RX-AS-03); never a made-up name.
  - When no file works, ask the user before the build; only if they hand it back, a slot with the mark's exact shape, named for the file, with a Placeholder annotation and listed in the open tasks with its source. Never a text lookalike or a silent placeholder.
- Do not: Draw a text button in place of a store badge, redraw or recolour an official mark, or show an unconfirmed mark as a fact (a store the app is not on, a bank shown as a partner without an open-rule label): that is an invented claim (RX-PR-02).
- Why: People recognise standard marks faster than any label, and their absence makes a page look unfinished; drawn lookalikes read as fake. (App Store and Google Play badge guidelines; licensing and trademark practice (use the owner's file as provided); owner review 2026-10-31 of RYUX trials T1 and T2: store badges drawn as text pills, then partner logos left as empty slots after guessed URLs failed; owner decision 2026-11-06: QRIS and banks set as plain text in a payment run whose brief named QRIS; use the real logo, or ask the user)
- Not when: a wireframe
- Trade-off: official files take a download and their rules (size, clear space, no recolouring) limit the layout
- Check: review: each mark tied to a confirmed fact and an official source; no drawn lookalikes; every slot left has a source to get it from and was asked for

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

#### RX-UI-23 [Contextual] A mark designed on request

- When: the user asks for a logo, wordmark, lettermark, app icon, or favicon
- Do: Brief first (capabilities/design.md, stage 1, at most three questions): the name, what the product does, the audience, the one idea the mark should carry, where it appears (app icon down to a 16 px favicon, the header, social avatars), and any brand assets or limits that exist.
  - Explore three directions that differ in the kind of mark (wordmark, lettermark or monogram, pictorial or abstract, combination), each with a concept from the product's own domain, not the category's cliché.
  - Build each as vector (SVG, RX-UI-21): geometric construction on a grid with few anchor points; a wordmark is adjusted (spacing, a modified letter), not the name typed in a font, and the typeface's license is named.
  - Keep the concept's character for the audience (warmth, energy, trust) in colour and form; take detail away only where small sizes need it, with a simplified favicon when the full mark breaks down.
  - An app icon is the mark on a full-bleed square tile in the brand colour; the platform applies the mask. One silhouette: no overlapping shapes that merge at 16 px.
  - Before handing off, render every direction's icon at 16, 32, and 256 px and the lockup on light and dark (a browser or an SVG converter), look at the renders, and fix what fails: legibility at 16 and 32 px, a one-colour version, black and reversed, a clear silhouette, the negative space, and square and round masks. Write the clear space and minimum size. A check you could not run is named, and that direction is not called ready.
  - Deliver: SVG in full colour, one colour, and reversed; app icon or favicon sizes when asked; a short usage note (clear space, minimum size, colours as tokens); a Decision Receipt; the user picks the direction.
  - Say plainly that similarity and trademark were not checked and that a trademark search is needed before use; never call a mark unique or safe.
- Do not: Use the default marks (initials in a circle, a swoosh, a globe, a generic leaf, a gradient blob), imitate another brand's mark, hand off a raster from an image model as the final file, show a single direction with no choice, ship an app icon with no tile, or hand off sizes you did not render and look at.
- Why: A generated mark drifts to the category's default and fails at small sizes; a mark nobody checked for similarity can collide with another company's. (Brand identity practice (mark types, small-size and one-colour tests, clear space); RX-AS-11; RX-UI-21; owner review 2026-10-24: request that RYUX design a logo when asked)
- Not when: the product already has a mark; use its file (RX-AS-11)
- Trade-off: three vector directions take longer than one generated image
- Check: the renders at 16, 32, and 256 px, light and dark, in one colour, inspected before handoff; review

#### RX-UI-34 [Contextual] An animated scene tells one story

- When: the design animates a scene: a hero, a banner, an intro, an explainer, or an animated illustration (L4 in RX-UI-11)
- Do: Let the concept choose the motion: write what the scene says in one line, then pick the movement that shows that idea, not a device reused from another piece (something growing, things floating up).
  - Tie cause to effect at one spot: when something lands, the change happens where it landed, so the eye follows one chain instead of parallel events.
  - Use fewer elements than the still version would. Light the actor of each beat and quiet the rest; the actor stands in front, never behind the scenery.
  - Stage it as a story: the action resolves, a beat of stillness, then the message. Text never appears while things still move.
  - Keep the physical world honest: a held object sits in a hand with a pose that holds it, nothing floats; a character faces whoever they deal with and looks at the object in use; a seated figure has the chair back behind them and the desk in front along the way they face; people in conversation face each other.
  - Hold the moment of contact: a handover, a tap, or a catch rests about 0.2 to 0.3 s with the object in both hands before anything moves on, so it can be read.
  - One continuous movement (the sun crossing the sky, a vehicle along a road) is one segment with one easing; split into segments that each ease, it stalls at every joint.
  - A character leaves by an action the scene can show (walks back inside, the door closes), never by fading out in an open doorway.
  - Paths of moving elements stay clear of the controls on the piece (a pause button); place the controls where nothing passes.
  - A loop ends where it starts: the last frame flows into the first (an exit that wraps around, a staggered tidy-up), with no hard cut.
  - Step through the frames, or a recording, before handoff, and fix any floating object, wrong gaze, depth error, stall, collision with a control, or seam.
- Do not: Reuse one motion device across unrelated concepts, run several unrelated movements at once, show the closing line while the scene still moves, leave a held object floating, turn a character away from what they use, hide the beat's actor behind scenery, let a handover pass in a blink, split one continuous movement into eased segments, fade a character out of an open doorway, drive an element across a control, or cut a loop back to its start.
- Why: A scene is read as a story in a few seconds: one chain of cause and effect is followed, parallel motion reads as noise, and one physical error (a floating sheet of paper, a wrong gaze) is what people remember. (owner review 2026-11-02 of the README banner animation (held objects in a hand, gaze on the object, a seamless loop, furniture order in an isometric scene, the beat's actor in front); owner review 2026-11-05 of the Antar banner light test (a handover held about 0.05 s, the sun stalling between two eased segments, the customer fading out in an open doorway, the scooter passing over the pause button); NNGroup Animation for Attention and Comprehension (Harley 2014): motion captures attention, so one movement at a time; concept-led motion, cause at one spot, restraint, and resolve-pause-message: general motion-design and film staging practice, ideas also in iart-ai/generative-illustration-skills (no license given; no text or structure used); written for RYUX)
- Not when: UI transitions and feedback (RX-UI-11); a still illustration (RX-UI-24)
- Trade-off: checking frame by frame takes longer than watching the loop once
- Check: step through the frames or a recording; play the loop twice across the seam

---

### Illustration (RX-UI) · `knowledge/illustration.md`

Gate area UI. Covers each asset's concept and meaning, the written style, one family, the production method, and the render-and-read check. Read when the work draws, revises, or reviews illustration, a mascot or character, or a custom icon set.

#### RX-UI-17 [Contextual] Illustration follows a written style

- When: the design adds or makes illustration (spot, empty state, onboarding, hero) and the brand has no illustration system
- Do: Before the first drawing, write the style in five lines (six with characters) in DESIGN.md or the Assumptions:
  - line: stroke weight and cap, or no stroke
  - shape: geometric or hand-drawn, and the corner radius
  - colour: 2 to 4 tokens from the palette, one accent
  - depth and detail: flat, one shadow tone, or 3D; how much detail
  - subject: objects from the product, people, or abstract
  - texture, when the style has any: one family, its source, and its strength (RX-UI-22)
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
- Do: Make the set together: same canvas and framing, same stroke and palette, same subject scale and footprint (an added badge stays inside it), viewpoint, and level of detail.
  - Tie each subject to the screen's job: an empty state shows what will appear there, drawn empty (RX-UI-24), not a mascot shrugging.
  - Put the set side by side before handoff and fix the one that stands out.
  - People in the set look like the product's users: skin tones, ages, bodies, and dress (a hijab, glasses, a wheelchair) chosen from who uses it, not one default figure; an outline figure with no skin tone is often read as white, so give each figure a tone on purpose.
- Do not: Make each illustration in a separate prompt and hand them off without comparing them, give one more detail or colour than the rest, or draw every person as the same default figure.
- Why: Users read a mismatched set as a mistake or a different product, and a generator drifts in style from prompt to prompt. (Design-system practice (one illustration family); RX-DS-02 consistency; owner review 2026-10-22: request for illustration guidance; people who look like the users: NNGroup Inclusive Design (Kendrick 2022))
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
- Machine check: `ryux scan` flags an .svg file whose root has no viewBox, so it cannot scale (fail); an .svg file with a fixed width or height on the root, an embedded raster, <text> inside the art, or editor metadata (warn)

#### RX-UI-21 [Contextual] Pick the production method from the asset's job

- When: the design makes illustration, 3D, or a generated visual rather than sourcing one (RX-UI-13)
- Do: Choose the method from what the asset must do later, and write it on the Visual Brief's Method line:
  - SVG, drawn or procedural: art that must follow the theme, scale, animate, or stay editable; the default for spot and empty-state illustration (RX-UI-19).
  - Generated raster: painterly, photographic, or richly textured art for onboarding and hero moments. Lock the style with the written style (RX-UI-17) and reference images, then refine in steps (sketch, mask, edit), not by re-rolling the prompt.
  - 3D render: when form, material, and light carry the meaning, or the same object appears from several angles or in motion. One scene per set: the same camera, lights, and materials, coloured from tokens.
  - Combined: for example a 3D render with an SVG overlay; text stays in the HTML either way.
  - Name the tool you actually have. With no generator or 3D tool available, hand off the brief with SVG or a placeholder that looks like one (RX-AS-03), and never claim a render you did not make.
- Do not: Use whichever generator is at hand, make an empty state that must follow dark mode as a raster, re-roll a prompt until something looks good, or mix 3D and flat art in one set without a rule for it.
- Why: The method decides what the asset can do later (theme, scale, animate, edit) and how far its style drifts from one image to the next. (Art direction practice (choosing a production method); RX-UI-19; owner review 2026-10-23: request for illustration production methods)
- Not when: the brand's illustration system already sets the method; follow it
- Trade-off: the best method for the job may be slower than the generator at hand
- Check: the Visual Brief's Method line; review

#### RX-UI-22 [Contextual] Texture has a source and a limit

- When: the style uses texture or mixed media: grain, risograph, halftone, paper cut, collage, or hand-drawn marks
- Do: Choose one texture family and write it into the illustration style (RX-UI-17): what it refers to (a print process, a paper, a craft), why that fits the product's concept, and its strength.
  - Keep it on illustration and brand surfaces, never behind body text, amounts, or data, and measure contrast with the texture on (RX-A11Y-01).
  - Risograph uses two or three inks from the tokens with one fixed misregistration offset; collage uses only pieces the team made or can license (RX-UI-13).
  - On the web, build it as an SVG filter or a small tiled asset and check the page weight; reduce it at small sizes, where it turns to noise.
- Do not: Add grain or noise to make generic art look handmade, stack several textures, put texture under text or numbers, or run a wobble filter over geometric art and call it hand-drawn.
- Why: Texture with no source reads as an effect applied afterwards, not as character, and it costs contrast and page weight. (Art direction practice (print and craft texture: risograph, halftone, collage); RX-A11Y-01; RX-UI-13; owner review 2026-10-23: request for texture and mixed media)
- Not when: a clean, flat illustration style with no texture
- Trade-off: one texture family limits how expressive a single piece can be
- Check: render at the smallest and largest size; contrast with the texture on

#### RX-UI-24 [Contextual] Each illustration shows its meaning

- When: the design draws illustration, a mascot, or a custom icon rather than taking one from the icon set
- Do: Before drawing, write one line per asset: what it must say (an empty recipe box: "nothing saved yet, add the first"), the concept that says it, taken from the product rather than the category (RX-UI-12), and the one visible cue that proves it (the box is open and empty; a crew-list icon has the list).
  - Write two or three concepts per asset, a line each, and pick the one that reads fastest without its label; draw only the chosen one.
  - The state is the meaning: an empty state is visibly empty (no cards, no full shelf), a no-results scene shows the search finding nothing, an offline scene shows the broken link.
  - A stock pictogram (a plain sailboat, two people, a sun and a cloud) is a choice: use it only when the meaning is the generic one, and say so.
  - After rendering, look at each asset at its display size with the label covered and write what it says. When that is not the line you wrote, or a part reads as something else (a magnifier as a pan, a vehicle lost against a same-coloured background), redraw that part and look again.
- Do not: Draw the category's pictogram for a specific meaning, put content in an empty state, or judge the art only enlarged with its caption beside it.
- Why: An illustration that does not show its meaning is decoration; in the illustration baseline every low score was a concept that said the wrong thing, none was broken drawing. (Art direction practice (concept before rendering; the read test without a caption); illustration baseline 2026-10-29 (docs/benchmarks/illustration): a crew-list icon with no list, empty states that read as full; AI rater approved by the owner; owner decision 2026-10-29: art direction first, no geometry engine)
- Not when: the brand's illustration system already fixes the subject for this asset; follow it
- Trade-off: a written line per asset and one more look at the render before handoff
- Check: the concept lines; the render at display size with the label covered

#### RX-UI-30 [Preferred] Planned imagery is made, and passes a craft read before the page uses it

- When: the direction's carrier or imagery is an illustration, a render, or a photo
- Do: Make each planned asset before the page (RX-UI-29), by the method its job needs (RX-UI-21), with the tools in knowledge/imagery.md, Making images; label generated and retouched images, and before paid generation say how many and ask once.
  - Before the first asset, write one asset spec for the page in the direction block, so the subjects change and the treatment does not: the medium (RX-UI-32); for renders and photos, the camera (height, lens, angle) and the light (direction, temperature); the scale of an object that recurs; the staging (a contact shadow on a ground, or floating), the same for every asset; the crop and edge; the colour grade.
  - When the set is made, lay it side by side against the spec; an asset that differs on two or more axes is remade before the page uses it.
  - Read each asset alone at display size against seven checks: the silhouette reads with the label covered; the object has its defining parts; one light direction; three tones per material; clean joints; the written style (RX-UI-17); it reads at its smallest size.
  - Two or more fails: redraw or switch method (a render instead of hand-built vectors), two rounds at most, then use the better one and say what is weak.
  - Record each asset's method and read in the Delivery Gate.
- Do not: Drop a planned illustration or render for type, a slot, or a stock icon because making it takes longer; build a subject from stacked rectangles and circles; or place an asset on the page before reading it alone.
- Why: A direction sold on its imagery and then built without it is a different, plainer direction; an asset nobody read alone reaches the page with its flaws. (Illustration and art direction practice (silhouette, construction, light and tone; a shot list with one camera and light for a set); owner review 2026-10-31 of RYUX trials T1 to T4: no image was made in three, and the pages read as plain; owner review 2026-11-02 of trial T11: three renders with different cameras, scales, and staging read as three pages)
- Not when: the direction's imagery is type alone or the product's screens
- Trade-off: making and reading each asset costs tool calls before the page exists; the read stops when the seven checks pass, not when nothing could be polished
- Check: the asset spec written before the first asset; the set compared side by side against it; assets made out of those planned, each with its method and the seven-check read; report them in the Delivery Gate UI line

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
- Machine check: `ryux scan` flags with --design: a colour, font family, corner radius, or CSS duration the DESIGN.md direction does not have (design drift) (warn); three or more one-off hex colors in a file that is not a token or theme file (warn)

#### RX-DS-05 [Contextual] Every theme you ship works

- When: The product ships more than one theme (light and dark, or brand themes), or a theme is being chosen.
- Do: Choose the default theme from the product, its users, and where it is used, then check every shipped theme with the same care: contrast, every component state, images and charts, and focus.
  - In dark mode: follow the system setting by default (an in-app switch is optional, and few people look for it); lift layers by tone, lighter on top, because shadows do not read on dark; separate cards by a small tone step rather than thin grey lines; tone down saturated colours that vibrate or only just pass contrast; check very thin and very heavy weights.
  - Keep QR codes and barcodes dark on light in every theme (a QRIS code on a white tile), and give a dark logo or illustration a light edge or a dark-mode variant so it does not disappear.
- Do not: Pick dark mode because the product is technical, ship a toggle whose second theme was never rendered, invert a QR code or barcode in dark mode, or trust an automatic dark conversion without looking at it.
- Why: A theme that was never checked fails for everyone who picks it, often in contrast and states first. (pattern also in anti-slop (MIT) R-21, R-34; dark mode: NNGroup Dark Mode: How Users Think about It and Issues to Avoid (Kohler and Zhang 2023; survey of 115 mobile users: about a third each use dark, light, and both); written for RYUX)
- Check: render each theme; contrast check; scan a QR code in each theme

#### RX-DS-06 [Preferred] [Quality Lock] The component sheet is a spec

- Do: Lay out each component as a labeled grid: one row per property, one column per state (default, hover on web, pressed, disabled, loading, error), each cell labeled with its variant name, and one line of usage under each component; no overlapping or clipped variants. Render and inspect the sheet like a screen.
  - When the component ships to code, put its contract beside the grid: one row per property with its design-tool type, values, default, the code prop it maps to (or "none: CSS state"), and a note. Designers and developers read the same table.
- Do not: Leave variants scattered, unlabeled, or cut off at the frame edge.
- Why: Developers build from the component sheet; a variant they cannot find or read gets rebuilt or guessed. (ryux run: blind review of a delivery flow 2026-10-20; design-system practice; written for RYUX)
- Not when: a single screen with no shared components
- Trade-off: takes time to lay out; pays back at handoff
- Check: render the sheet; every variant visible and labeled

#### RX-DS-07 [Contextual] [Quality Lock] Property names are the code's props

- When: Building or changing reusable components or variables in a design tool (Figma, pen.dev) or a component library, meant to be used by designers and in code.
- Do: Name each component property and value the way the code names the prop: camelCase names (variant, size, hasLeadingIcon) and lowercase values (primary, secondary, sm, md). When the repo already has the component, take its prop names; otherwise agree them once in the contract (RX-DS-06) and use them on both sides.
- Do not: Name properties for one audience, such as Type=Primary Big in the design file and kind="main" in code, or rename a value on one side only.
- Why: When the panel and the props use the same words, handoff needs no translation table and nobody guesses which variant is which. (Design-system practice; Figma component properties and Code Connect (help.figma.com); written for RYUX)
- Check: compare the property and value names in the design file with the contract and the code props

#### RX-DS-08 [Contextual] Each property has the type its job needs

- When: Building or changing reusable components or variables in a design tool (Figma, pen.dev) or a component library, meant to be used by designers and in code.
- Do: Use a variant property for a change in look or structure (variant, size); a boolean for a part that shows or hides (hasLeadingIcon); an instance swap for the icon or slot that fills it (leadingIcon); a text property for copy (label). Set a default for each, the one used most.
- Do not: Make an icon position or a label a variant, or add a variant per icon.
- Why: The right property type keeps the variant count small and the panel readable, and maps one to one to a prop, a boolean, a slot, or a string in code. (Design-system practice; Figma component properties: variant, boolean, instance swap, text (help.figma.com); written for RYUX)
- Check: review the property list against the contract

#### RX-DS-09 [Contextual] Variants stay few and valid

- When: Building or changing reusable components or variables in a design tool (Figma, pen.dev) or a component library, meant to be used by designers and in code.
- Do: Before building, multiply the values of every variant axis. Above about 48 variants, or when some combinations make no sense (a loading state on a link-style button), split the component, turn an axis into a boolean or instance swap, or leave the invalid combinations out and note them in the contract.
- Do not: Build every combination because the tool can, or add an axis for one case.
- Why: Each extra axis multiplies what designers scroll through and developers must support; invalid combinations get used. (Design-system practice; ryux owner review 2026-10-25 (3 hierarchies × 3 sizes × 4 states is 36 before icons); written for RYUX)
- Trade-off: a split component is one more name to find
- Check: count the variants per component set; list the combinations left out and why

#### RX-DS-10 [Contextual] Interaction states are spec, data states are props

- When: Building or changing reusable components or variables in a design tool (Figma, pen.dev) or a component library, meant to be used by designers and in code.
- Do: Draw hover, pressed, and focus as variants so the look is specified, and mark them in the contract as CSS states with no prop. Make disabled, loading, selected, and error props, because the product sets them.
- Do not: Map state=hover to a prop, or leave loading and error as drawings with no prop behind them.
- Why: A hover prop has nothing to set it, and a loading state with no prop never ships. (ryux owner review 2026-10-25 of a design-system proposal; W3C WAI-ARIA states; written for RYUX)
- Check: every state in the contract is either a prop or marked CSS state

#### RX-DS-11 [Contextual] Components bind semantic variables

- When: Building or changing reusable components or variables in a design tool (Figma, pen.dev) or a component library, meant to be used by designers and in code.
- Do: Keep variables in two layers: primitives (blue/500, space/4) and semantic roles that point to them (text/accent, surface/raised, space/control-gap). Components bind only the semantic layer; themes and brands are modes of the semantic collection. Give code the same names as tokens.
- Do not: Bind a component to a primitive, or make a second theme by duplicating components.
- Why: With one semantic layer, a theme or rebrand changes values in one place and every component follows, in the design file and in code. (W3C Design Tokens Community Group (aliases); Figma variables and modes (help.figma.com); extends RX-DS-03)
- Check: count component values bound to a primitive or to no variable

#### RX-DS-12 [Contextual] Components resize like the code

- When: Building or changing reusable components or variables in a design tool (Figma, pen.dev) or a component library, meant to be used by designers and in code.
- Do: Build each component with auto layout, padding and gap bound to spacing variables, and a stated resize rule (hug the content, or fill the container). Check it with the longest real label, including Indonesian copy, which often runs longer than English, and at the smallest width it is used in.
- Do not: Position layers absolutely inside a component, or set a fixed width that clips a long label.
- Why: A component that does not resize the way the code does gets detached in the design file and rebuilt in code. (Design-system practice; Figma auto layout (help.figma.com); RX-RD-01; written for RYUX)
- Check: render each component with its longest label and at its smallest width

---

### Accessibility (RX-A11Y) · `knowledge/accessibility.md`

Gate area ACCESSIBILITY. Covers semantics, keyboard, focus, contrast, targets, names, errors, reduced motion. Read when building or reviewing any UI.

#### RX-A11Y-01 [Required] [Hard Gate] Readable contrast

- Do: Keep text contrast at least 4.5:1, and at least 3:1 for large text and component boundaries.
  - Over a photo, illustration, or gradient (a status bar on a full-bleed hero, a caption on an image), measure against the worst pixel behind the text or icon, not the average; fix it with a scrim or the bar's light or dark appearance.
- Do not: Put light grey text on white or white text on a pale accent.
- Why: Low contrast fails outdoors, on cheap screens, and for low vision. (WCAG 2.2 SC 1.4.3 and 1.4.11; ryux Figma pilot critique 2026-10-28: a dark status bar over a dark food photo (1.3:1), then a white one over a light grocery photo (2.7:1) until the scrim was darkened)
- Check: audit_ui
- Measured: `ryux scan <url>` flags text under 4.5:1 contrast (3:1 when large) on a solid background; text over images or gradients is skipped (fail)

#### RX-A11Y-02 [Required] [Hard Gate] Readable text, reachable targets

- Do: Keep body text around 14 to 16px on mobile, and touch targets at least 24×24px, preferably 44×44px. The target is the hit area, not the glyph: a 20 to 24px icon sits inside a 44×44 button. Measure it on the element or node; a name or comment that states a size is not a measurement.
- Do not: Shrink body text or crowd small targets together.
- Why: Small text and targets cause misreads and mis-taps. (WCAG 2.2 SC 2.5.8 (24px minimum); Apple HIG 44pt; Material 48dp; Fitts's law (Fitts 1954): bigger and nearer targets are faster to hit; ryux Figma pilot critique 2026-10-28: a layer named "Close (44 pt tap)" measured 24×44)
- Check: audit_ui
- Machine check: `ryux scan` flags zoom turned off: user-scalable=no, maximum-scale=1, userScalable: false, maximumScale: 1 (fail); text set below 12px (CSS font-size, Tailwind text-[Npx], fontSize in style objects) (warn)
- Measured: `ryux scan <url>` flags controls under 24x24px that are crowded by neighbours (warn when spaced as WCAG 2.5.8 allows); rendered text under 12px (warn) (fail)

#### RX-A11Y-03 [Required] [Hard Gate] Keyboard and visible focus

- Do: Make actions operable from the keyboard (path-based input such as drawing excepted), show a visible focus indicator, and keep focus order the same as the visual order. When a dialog, menu, or popover closes, put focus back on the element that opened it, or on the nearest sensible element if that one is gone.
- Do not: Build pointer-only actions, or remove focus outlines without an accessible replacement.
- Why: Keyboard and switch users navigate and act by focus. (WCAG 2.2 SC 2.1.1, 2.4.3, and 2.4.7; WAI-ARIA APG dialog pattern)
- Check: tab through the render from the top: every control is reached in reading order and shows a visible focus indicator (3:1 against its background); fails on a skipped control, a focus trap, or an invisible focus
- Machine check: `ryux scan` flags a positive tabindex, which takes the element out of the visual focus order (fail); focus outlines removed on a control (a button, link, input, or :focus rule) with no focus-visible replacement (warn)

#### RX-A11Y-04 [Required] [Hard Gate] Semantic structure, native controls, and names

- Do: Use real headings, landmarks, lists, buttons, links, and the right input types before custom elements, and give icon-only buttons and meaningful images an accessible name or alt text. Hide decorative icons and images from assistive technology (aria-hidden, or an empty alt).
- Do not: Build structure or controls from styled divs, or ship unlabeled icon buttons.
- Why: Assistive technology navigates by semantics and announces unlabeled buttons as just "button"; native controls bring keyboard and platform behavior for free. (WCAG 2.2 SC 1.1.1, 1.3.1, and 4.1.2)
- Check: read the accessibility tree (a Playwright accessibility snapshot, or the design file's layer types): every control is a native element or has a role, and every one has a name; headings are in order; fails on an unnamed control or a div acting as a button
- Machine check: `ryux scan` flags <img> with no alt attribute (fail); a clickable <div> or <span> with no role (warn); an icon-only <button> with no accessible name (warn); a heading that skips a level (h2 straight to h4) (warn)

#### RX-A11Y-06 [Required] Not color alone

- Do: Pair color with text or an icon when it carries meaning (errors, status, selection).
- Do not: Signal an error or a selected state with color only.
- Why: Color-blind users and grayscale screens miss color-only signals. (WCAG 2.2 SC 1.4.1; grayscale check: NNGroup 5 Visual Treatments that Improve Accessibility (Gordon 2022))
- Check: review; render in grayscale and confirm every meaning survives

#### RX-A11Y-07 [Required] Errors announced and tied to fields

- Do: Link error messages to their fields and announce them to assistive technology.
- Do not: Show errors only as red borders or as text that is not associated with the field.
- Why: An error the user cannot perceive cannot be fixed. (WCAG 2.2 SC 3.3.1 and 4.1.3)
- Check: review

#### RX-A11Y-08 [Required] Respect reduced motion

- Do: When reduced motion is requested, replace large movement with a fade or a cut, and turn off parallax, scroll-jacking, and carousels that advance on their own.
  - Anything that moves, blinks, or scrolls on its own for more than 5 seconds beside other content (a carousel, a ticker, a looping animation) can be paused, stopped, or hidden; a loading indicator is exempt while the wait lasts.
  - A long intro or onboarding animation can be skipped, and nothing repeats to win attention.
  - Nothing flashes more than three times in one second.
- Do not: Ignore the system reduced-motion setting, loop an animation with no way to stop it, or make people sit through an animation to reach the content.
- Why: Large motion can cause discomfort for people with vestibular disorders, motion that never stops pulls attention away from reading, and flashing can trigger seizures. (WCAG 2.2 SC 2.3.3 (animation from interactions), SC 2.2.2 (pause, stop, hide), SC 2.3.1 (three flashes); prefers-reduced-motion; Apple HIG; NNGroup Animation Duration and Motion Characteristics (Laubheimer 2020): parallax, auto-advancing carousels, and scroll-jacking affect people with vestibular disorders; NNGroup Animation for Attention and Comprehension (Harley 2014): repeated animation, and a skip for long ones)
- Check: review
- Machine check: `ryux scan` flags animation in a folder where nothing handles prefers-reduced-motion (warn); an animation that repeats forever and is not a loading indicator, with no way to pause it (warn)

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
- Measured: `ryux scan <url>` flags a page that scrolls sideways at a scanned width, naming the widest elements (fail)

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
- Machine check: `ryux scan` flags Intl currency style with IDR, which prints Rp 1.250.000,00 (a space, and decimals unless set to 0) (warn)

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
  - while iterating, run the tests the change touches; run the whole suite once before handing off, with quiet output (a summary or dot reporter, failures in full)
- Do not: Ship changed logic without tests, write snapshot-only tests or tests that mock the code under test, or claim tested without running the tests.
- Why: Tests catch the regressions review misses, before users find them in production. (Testing practice; owner review 2026-10-06; ryux run: food-delivery round 2 (2026-10-27) ran the full suite 21 times in one build, about a quarter of its steps)
- Check: run the project's tests

#### RX-FE-15 [Required] Change the source, not the output

- Do: Make UI changes in the source files that own them (components, styles, tokens), so the next build and the next person see the same code.
- Do not: Build a feature with a script that rewrites CSS or source by string replacement, or patch generated files.
- Why: Patched output is overwritten by the next build and hides where the behavior lives. (pattern also in anti-slop (MIT) R-33; written for RYUX)
- Check: review the diff

#### RX-FE-16 [Required] [Hard Gate] The build passes

- Do: Before handoff, run the checks the repo already has (build, typecheck, lint, tests) and fix what fails. Report each one you ran and its result; a check you could not run is named, and the work is not called done.
- Do not: Hand off code that does not build or typecheck, silence an error to make it pass (a type cast, a disabled rule, a skipped test), or call it done without running the checks.
- Why: A build that fails cannot be reviewed, rendered, or shipped; every other check in the Delivery Gate depends on it. (Continuous integration practice; owner review 2026-10-25: build failure belongs with the checks that cannot be argued)
- Not when: design-only work with no code; then CODE QUALITY is N/A
- Check: run the repo's build, typecheck, lint, and tests; fails on any error

#### RX-FE-17 [Preferred] A visual library is offered as a choice, the lightest first

- When: the build needs motion, 3D, a shader, or animated illustration that CSS and SVG cannot carry, and the repo has no library for it
- Do: Offer two or three libraries as choices, the lightest that does the job first, each with its weight, license, the static fallback, and what happens under prefers-reduced-motion:
  - UI and scroll motion: CSS first; Motion for React, GSAP elsewhere or for timelines
  - animated illustration: Lottie (dotLottie) for exported animations, Rive for interactive state
  - 3D: Three.js, React Three Fiber with drei in React, a Spline runtime when the scene is made in Spline
  - gradients and shaders: OGL or a small WebGL shader, with a static image under it
  - 2D canvas and generative: PixiJS, p5.js
  - smooth scrolling (Lenis) only with a reason, never on long reading pages
  - One library per job; record the choice in DESIGN.md with the reason, and load it lazily, after the page is usable.
- Do not: Add a library for an effect CSS or SVG can do, add two libraries for one job, ship a 3D or shader hero with no static fallback, or ignore reduced motion.
- Why: A visual library is a long-term cost in weight, upkeep, and accessibility; the user should choose it knowing what it costs, and the page must work without it. (Web performance and accessibility practice (WCAG 2.3.3 animation from interactions, prefers-reduced-motion); each library's documentation; owner request 2026-10-31 that RYUX offer library options when a direction needs them)
- Not when: the repo already uses a library for this job: use it
- Trade-off: a choice to make before building, and the lightest option may limit the effect
- Check: options offered with weight, license, fallback, and reduced-motion behaviour; one library per job; static fallback renders

#### RX-FE-18 [Preferred] A hard job gets a proven library, offered as a choice

- When: the build needs a job that is hard to get right by hand (an accessible dialog, menu, combobox, or tabs; a form with validation; data from a server; a large table or list; dates; a chart; tests), and the platform and the repo do not cover it
- Do: Choose in this order: the platform (<dialog>, <details>, the popover attribute, Intl.NumberFormat for Rupiah, Intl.DateTimeFormat, CSS), then a library the repo already has, then two or three options for the repo's framework, each with its size, license, last release, accessibility support, and framework fit:
  - accessible components: Radix UI, React Aria, or Base UI (React); Reka UI (Vue); Bits UI or Melt UI (Svelte); Kobalte (Solid); Angular CDK (Angular); Ark UI on Zag.js across React, Vue, Solid, and Svelte; shadcn/ui and its Vue and Svelte ports when the team wants to own the component code
  - forms and validation: TanStack Form (most frameworks), React Hook Form (React), VeeValidate (Vue), Superforms (SvelteKit), Angular's reactive forms; a schema in Zod or Valibot shared with the server
  - server data: TanStack Query (React, Vue, Svelte, Solid, Angular), SWR (React)
  - tables and long lists: TanStack Table and TanStack Virtual, across frameworks
  - dates: date-fns or Day.js; money and numbers with Intl, no library
  - charts: ECharts or Chart.js in any framework; Recharts or visx in React
  - icons: Lucide, with a package per framework; toasts: Sonner (React) or its Vue and Svelte ports
  - tests: Vitest, Testing Library for the framework, Playwright, and axe-core
  - Before adding one, check on the npm registry and its documentation that the package exists under that exact name, is maintained, fits the framework version, and has the API you will call; this list is a starting point, not a source of truth.
  - Ask before adding it (a dependency is a long-term choice), one library per job, and record the choice with its reason (RX-PR-14).
- Do not: Hand-roll a focus trap, a combobox, or date arithmetic the platform or a proven library does correctly; add a library the platform covers; add a second library for a job the repo already solves; install a package name from memory without checking it exists; or call an API you have not read in its documentation (RX-FE-02).
- Why: The hard parts of these jobs are keyboard, focus, screen readers, time zones, caching, and edge cases; hand-written versions usually miss them, and an unchecked package name can be one that does not exist or that someone registered to catch exactly that mistake. (W3C WAI-ARIA Authoring Practices (dialog, menu, combobox, and tabs patterns); each library's documentation; software supply chain practice (verify a package before installing it); owner request 2026-11-02 that RYUX recommend frontend libraries across frameworks)
- Not when: the repo already uses a library for the job: use it; a prototype the user says will be thrown away
- Trade-off: a question and a check before the build; a dependency to keep up to date
- Check: review: the platform and the repo checked first; two or three options with size, license, last release, accessibility, and framework fit; each package verified on the registry and its docs before use; one library per job; the choice recorded with its reason

---

### Visual QA (RX-QA) · `capabilities/qa.md`

Gate area VISUAL QA. Covers did the build match the intended design: compare, list deviations, fix, render again. Read when something visual has been implemented and is about to be called done, or a build must match a design.

#### RX-QA-01 [Required] Render, inspect, fix, render again

- Do: Render the result at the target viewport (browser, screenshot, or design-tool export).
  - Inspect the main state, one empty or error state, and the smallest supported width (RX-RD-01), plus the largest text size on native.
  - Look for the defects source code hides: misaligned edges, type or spacing off the scale, density wrong for the task, overflow and clipping, a component that looks different from its siblings, a control that does nothing.
  - Look at the states of one width together: tile their screenshots into one contact sheet and inspect that, open a single screenshot only to check a defect up close, and after a fix render again only what it touched.
  - Rank issues by impact, fix from the top, and render again. Name the widths and states you inspected; if no render tool is available, say so in the report.
  - Whether the design itself is right or intentional is Critique's call; QA reports what it can verify.
- Do not: Claim visual quality for a layout you have only seen as code, or fix by guesswork without checking the result.
- Why: Overlaps and clipping are invisible in source and obvious on screen; the loop turns a draft into a reviewed result. (ryux run 2026-10-02: two runs shipped overlaps they never saw; ryux run: food-delivery round 2 (2026-10-27) read 21 screenshots one at a time, and every read stays in the context for the rest of the build)
- Check: screenshot

#### RX-QA-03 [Required] No covered or colliding text

- Do: Keep floating cards and mockups over empty space only, and keep navigation items clear of the logo and buttons.
  - Labels in a row (steps, tabs, chips) stay visibly apart at the smallest width: at least twice a word space between two labels, or show only the current one.
  - On a map, keep street and place labels clear of markers, chips, and the route.
- Do not: Let a card cover prices or labels, or let nav items touch.
- Why: Covered text is lost information and looks broken; labels a word space apart read as one phrase. (ryux run 2026-10-02: QRIS card over prices, colliding nav; ryux Figma pilot critique 2026-10-28: "On the way" and "Delivered" 6 pt apart at 360, a courier marker over street labels)
- Check: screenshot
- Measured: `ryux scan <url>` flags text boxes of unrelated elements that overlap (warn)

#### RX-QA-04 [Required] Numbers agree

- Do: Make line items add up to subtotals and totals, and show the same value the same way everywhere on the screen.
  - Times follow one timeline across a flow: the status-bar clock, timestamps, and estimates on each frame fit its stage.
- Do not: Show sample numbers or times that contradict each other.
- Why: Readers check sums and clocks; one wrong total or an arrival time already past undermines everything else. (ryux README checkout image (items Rp125.000, subtotal Rp1.200.000); ryux Figma pilot critique 2026-10-28: a 7:31 clock on every frame beside a 7:38 last update and a 6:15 arrival window)
- Check: review

#### RX-QA-06 [Preferred] Match the intended design

- Do: When a reference exists (a Figma or pen.dev frame, DESIGN.md, an approved screenshot), capture it and the build at the same viewport, compare spacing, typography, color, size, position, components, states, and responsive behavior, and list each deviation with its fix; without one, compare with at least one reference screen_id.
- Do not: Call the build done while it visibly differs from the design without saying so, or judge it only against itself.
- Why: Visual QA answers whether the build matches the intent; whether the design is good is Critique's question. (ryux visual QA loop; ryux evidence principle)
- Check: screenshot comparison, search_screens

#### RX-QA-08 [Required] [Hard Gate] The primary task completes

- Do: In the running build or a clickable prototype, do the screen's primary task from start to result as a user would (tap, type, submit), then one failure path (invalid input or a failed request). Name the path you ran.
- Do not: Hand off a primary flow with a dead end: a button that does nothing, a submit that never resolves, a step that cannot be reached, or an error with no way back.
- Why: A broken primary action fails the one thing the screen exists for, whatever else is right. (Usability testing practice (task completion); owner review 2026-10-25: a broken main interaction belongs with the checks that cannot be argued)
- Not when: static mockups with no interaction; then say the flow was not run and VISUAL QA is NOT VERIFIED
- Check: run the primary task and one failure path in the render; fails on any dead end
- Measured: `ryux scan <url>` flags script errors thrown while the page loads (warn)

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

- Do: Fill mockups with realistic sample content consistent with the brief (names, merchants, amounts in the brief's currency, dates). Names of people, merchants, and orders are made up, and listed as sample data in the output. A real brand the design needs (a bank, an e-wallet, a card network, a payment or store mark): ask once, with the fact questions, whether to show the real brands with their official logos or made-up names; when you cannot ask, use the real brand with its official logo (RX-UI-28), with an open-rule label when which brands is not decided ("Bank list: sample, not decided"). Never a made-up brand with a drawn logo, or a real brand set as plain text where its logo belongs. A stand-in asset (a sample QR code, a map, a photo, the product's own logo before it exists) carries a Placeholder annotation in the design tool, not a note inside the UI (capabilities/design.md, stage 6).
- Do not: Put [REAL DATA], XXX, or lorem text on the canvas where sample data would do, or ship sample data or placeholder copy as final. A sample-data label does not turn a fee, policy, or claim into a fact (RX-PR-02).
- Why: Bracketed values read as unfinished and hide the layout's real behavior; unlabeled sample data ships by accident. (ryux anti-slop principle; ryux visual benchmark 2.5, 2026-10-09: [Brand] and XXX read as unfinished; wallet-detail benchmark, 2.19.2: 3 of 3 runs showed Visa on a sample card; owner decision 2026-11-06 after the Pasarku payment run (made-up banks and QRIS as plain text, a "sample QR" note inside the screen): use the real brand's logo or ask, and mark placeholders with annotations)
- Check: audit_copy C-01
- Machine check: `ryux scan` flags lorem ipsum filler (fail); placeholder content: John Doe, Jane Doe, [DATA], [TBD], XXXX (warn)

#### RX-AS-04 [Required] [Hard Gate] No fake urgency

- Do: State a deadline or a quota only when it is real, as a plain fact.
- Do not: Write "only 2 left", "offer ends tonight", or fake countdowns with nothing behind them.
- Why: Manufactured pressure erodes trust once users notice. (NNGroup credibility research; ryux run 2026-10-02: WhatsApp promo; cognitive bias research (Tversky and Kahneman 1974): scarcity and anchoring act before reflection, which is why they are never faked)
- Check: find every timer, deadline, stock count, and 'only N left'; each comes from the brief or real data; fails on any without a source
- Machine check: `ryux scan` flags urgency copy (only 2 left, hurry, offer ends tonight, hanya tersisa 2, buruan, stok terbatas) (warn)

#### RX-AS-05 [Required] Decoration passes a purpose gate

- Do: For each potentially decorative pattern, answer three questions, and keep it only when all three have a real answer:
  - purpose: what does it do?
  - contribution: what does it add to understanding, interaction, or the product's character?
  - necessity: would something simpler do the same?
  - Three feature cards pass when the features are equal and compared; when one matters more, give it more weight instead.
- Do not: Keep cards, gradients, badges, shadows, or animation that have no reason, or accept "it looks more interesting" as one.
- Why: Unjustified decoration is what makes AI-generated UI look the same. (ryux anti-slop principle; selective attention and banner blindness (Benway and Lane 1998; NNGroup eyetracking): people skip what looks like an ad or decoration, so a key message never wears that look)
- Check: review

#### RX-AS-06 [Required] Complexity with a reason

- Do: Remove elements, options, states, code paths, abstractions, and dependencies that serve no stated need. Complexity that cannot be removed is carried by the product (defaults, formatting, calculation), not handed to the user.
- Do not: Add settings, sections, abstractions, or packages "for later", or features because similar products have them.
- Why: Unneeded complexity costs every user and every future change. (Nielsen heuristic 8; Tesler's law of conserved complexity (Tesler, 1980s): some complexity cannot be removed, only moved; clean-code practice; Occam's razor: of two designs that do the job, keep the one with fewer parts)
- Check: list each element, option, state, and dependency the work added and the need it serves; fails on any without one or a written reason

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
- Do not: Stand in for the mark with initials in a circle, an emoji, a generic shape, an invented SVG, a letter cut into a tile, or the name typeset to look like a logo; generate a favicon or app icon the user did not ask for; or redraw the brand's mark instead of using its file. Designing a mark is its own task, done only when the user asks for it (RX-UI-23).
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

Checks in the ryux MCP's review tools (tool-local numbering `R-0x` and `C-0x`):

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
