# Product thinking

Turns a vague request into a clear product decision: who it is for, the one job, what is assumed, and which pattern wins, backed by evidence.

> Group Foundation · Delivery Gate area PRODUCT · RYUX 2.19.0. Levels are defined in `SKILL.md`.

Answer these before any layout exists. Write the answers down; they are the brief.

1. **Who** is the user, and in what situation (device, place, time pressure)?
2. **What** are they trying to finish on this screen?
3. **Business goal**: what does the product need from this screen?
4. **Information that matters**: what must they see to decide or act?
5. **Primary action**: the one thing this screen exists for.
6. **Constraints**: platform, data that exists, technical or legal limits.
7. **Success**: how would you know the screen works?
8. **Assumptions**: everything you had to guess, kept visible and sorted into design assumptions,
   unconfirmed capabilities, and sample data.

Unknown facts stay assumptions. Do not invent business rules, policies, metrics, user data,
permissions, pricing, requirements, or API behavior; ask when one materially affects the flow or
correctness, otherwise leave it out. Mockup content is realistic sample data, labeled (RX-PR-02,
RX-AS-03).

Find evidence with the ryux MCP (`search_screens`, `get_flow`, `get_local_pattern`) and cite the
`screen_id`, or call the decision a judgment call.

Lead with the user's outcome, keep only what serves the task, and follow the project's DESIGN.md
or brand when it exists (write down any deliberate departure).

**Decide with evidence.** For a consequential decision, compare patterns, then choose by context:

```
Decision:   payment confirmation layout
Context:    standalone bank transfer, first-time users
Options:
  A  QR success screen        scr_...  strength: instant      weakness: little detail
  B  bank-transfer receipt    scr_...  strength: verifiable   weakness: dense
  C  marketplace order status scr_...  strength: order link   weakness: not standalone
Choice:     B, because the context is a standalone transfer
Evidence:   Strong (2+ comparable screens, same context) | Thin (1, or other context) | None
Trade-off:  higher density
```

With **None**, say so: present the options and their trade-offs, or ask. Never invent a reference.

Does not cover: layout or visual decisions (see `knowledge/ux.md` and `knowledge/ui.md`).

## Evidence from RYUX Knowledge

How comparable products frame the same task and offer: `search_screens` (category, flow) and `get_flow` for the full sequence. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. Labeled sample data is
> not an invented number; an unconfirmed capability is never presented as confirmed. See `SKILL.md`.

## Rules

### RX-PR-01 [Required] State the context first

- Do: Before designing, write down the user, their task, the business goal, the design intent (what the user must understand, feel, and do), the information that matters, the primary action, the constraints, and what success looks like.
  - Take what the prompt and DESIGN.md already give.
  - Ask only when a missing answer materially affects the user flow, what the product can do, or whether the content is correct, or when neither the prompt nor DESIGN.md sets the UI or motion direction: at most three questions in one message, most consequential first, none when the context is complete.
  - Otherwise make the smallest reasonable assumption, write it down, and continue.
- Do not: Start from a generic template with no stated user or task, or ask questions the prompt or DESIGN.md already answers.
- Why: Without a task, design and review drift into taste. (`capabilities/critique.md` playbook; NNGroup task-based evaluation)
- Check: review

### RX-PR-02 [Required] [Hard Gate] Unknowns stay assumptions

- Do: Sort what the brief does not say into three kinds:
  - Design assumptions (low-risk visual or structural choices such as a merchant category icon or grouping by date): decide them from the context.
  - Unconfirmed capabilities (an action or feature the category usually has, such as sharing a receipt): convention is not proof, so ask when it materially changes the flow or scope; otherwise you may propose it, listed as unconfirmed, never as a requirement.
  - Users: without research data, describe them as a proto-persona labelled as assumptions, with the questions to ask real users; answers from an AI-simulated user are hypotheses, never research findings.
  - Facts, claims, and policies: take them only from the brief, the repo, or the product's own docs (feature and tool names, commands, integrations, platforms, pages, fees, timings, guarantees).
- Do not: Invent business rules, policies, guarantees, metrics, user data, permissions, pricing, requirements, or API behavior, or name a tool, command, integration, platform, or page the product does not have. Do not present an unconfirmed capability as a confirmed one.
- Why: Invented facts turn into promises and bugs that someone has to unwind; a screen trimmed to the brief's literal words reads unfinished and hides what still needs confirming. (ryux run 2026-10-02: an unconstrained agent invented a 30-day trial and user counts; ryux visual benchmark 2.6 human rater, 2026-10-13: RYUX screens lost on a missing receipt action; NNGroup proto-personas and synthetic users (AI output is hypotheses, not research))
- Not when: This rule is not a reason to drop content the brief implies or to leave a screen looking unfinished: sample content is RX-AS-03, design assumptions are yours to make.
- Check: compare every product fact on the screen (features, prices, fees, policies, names, integrations) with the brief, DESIGN.md, docs, or repo; each is sourced or labelled as an assumption; fails on one shown as fact without a source

### RX-PR-03 [Required] [Hard Gate] One clear goal; one primary action when the task has one

- Do: Give each screen one clear, dominant goal. When the task has a clear next step (a form, checkout, a confirmation), give it one primary action and make secondary actions look secondary.
- Do not: Put two equal-weight calls to action side by side.
- Why: A single clear path shortens the decision and the task. (Hick's law (Hick 1952; Hyman 1953): more options, longer decisions; NNGroup visual hierarchy)
- Not when: Monitoring and configuration screens (dashboards, settings) need a clear goal but not a single dominant action; do not invent one to satisfy this rule.
- Check: name the screen's goal and its primary action, then count the controls styled as primary in the main state; fails when two compete at the same weight

### RX-PR-04 [Required] Back decisions with real screens

- Do: Cite at least one real screen_id for each meaningful design decision, or label it a judgment call with no reference.
- Do not: Claim "apps usually do X" without a screen to show it.
- Why: A cited screen makes a decision checkable instead of a matter of opinion. (ryux evidence principle)
- Check: search_screens, delivery_gate

### RX-PR-05 [Required] The product's market first

- Do: Start from how users in the product's own market pay, sign in, write addresses, and read money and dates; check a pattern from another market before reusing it.
  - Take the market from the brief or the codebase, and ask when it is unclear.
  - When the brief does not name payment methods (or another market-standard capability), show the market's standard set as unconfirmed capabilities, labeled as proposed in Assumptions, rather than leaving them out: a market's table stakes are not "for later" (RX-AS-06). Ask when the set would change the flow.
- Do not: Import one market's checkout, currency, language, or tax rules into a product built for another market.
- Why: Payment, address, and trust habits differ by market (local payment rails, address formats, messaging channels). (ryux taxonomy of local patterns)
- Check: search_screens

### RX-PR-09 [Required] Compare patterns before choosing

- Do: For a consequential decision (a new flow, payment, identity, navigation), list two or three candidate patterns with their context, strength, and weakness, then choose the one whose context matches, not the one that looks best.
- Do not: Pick the first familiar pattern, or choose by taste.
- Why: A pattern is right for a context, not in general; comparing makes the reason visible and checkable. (ryux evidence principle; NNGroup competitive usability practice)
- Not when: small, reversible decisions inside an established pattern; follow the design system instead
- Trade-off: takes longer than picking the familiar option
- Check: search_screens, compare_apps

### RX-PR-10 [Required] Say when the evidence is not enough

- Do: Rate the evidence for a decision as Strong (two or more comparable screens in the same context), Thin (one, or a different context), or None; when it is None on a consequential choice, present the options and their trade-offs or ask, instead of picking silently.
- Do not: Invent a reference, or present a judgment call as if real products backed it.
- Why: Knowing what you do not know is part of design judgment; false certainty ships the wrong pattern. (ryux evidence principle)
- Check: review

### RX-PR-11 [Contextual] An AI feature has a written standard for its output

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
