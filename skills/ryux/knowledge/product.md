# Product thinking

Turns a vague request into a clear product decision: who it is for, the one job, what is assumed, and which pattern wins, backed by evidence.

> Group Foundation · Delivery Gate area PRODUCT · RYUX 2.3.0. Levels are defined in `SKILL.md`.

Answer these before any layout exists. Write the answers down; they are the brief.

1. **Who** is the user, and in what situation (device, place, time pressure)?
2. **What** are they trying to finish on this screen?
3. **Business goal**: what does the product need from this screen?
4. **Information that matters**: what must they see to decide or act?
5. **Primary action**: the one thing this screen exists for.
6. **Constraints**: platform, data that exists, technical or legal limits.
7. **Success**: how would you know the screen works?
8. **Assumptions**: everything you had to guess. Keep them visible.

Unknown facts stay assumptions. Do not invent business rules, metrics, user data, permissions,
pricing, requirements, or API behavior; mark them [REAL DATA] or ask.

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

How comparable Indonesian products frame the same task and offer: `search_screens` (category, flow) and `get_flow` for the full sequence. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `SKILL.md`.

## Rules

### RX-PR-01 [Required] State the context first

- Do: Before designing, write down the user, their task, the business goal, the information that matters, the primary action, the constraints, and what success looks like.
- Do not: Start from a generic template with no stated user or task.
- Why: Without a task, design and review drift into taste. (`capabilities/critique.md` playbook; NNGroup task-based evaluation)
- Check: review

### RX-PR-02 [Required] [Hard Gate] Unknowns stay assumptions

- Do: List what you do not know as assumptions, and mark the matching UI with [REAL DATA] or a question. Product facts (feature and tool names, commands, integrations, supported platforms, page names) come only from the brief, the repo, or the product's own docs.
- Do not: Invent business rules, metrics, user data, permissions, pricing, requirements, or API behavior, or name a tool, command, integration, platform, or page the product does not have.
- Why: Invented facts turn into promises and bugs that someone has to unwind. (ryux run 2026-10-02: an unconstrained agent invented a 30-day trial and user counts)
- Check: review

### RX-PR-03 [Required] [Hard Gate] One goal, one primary action

- Do: Give each screen one primary goal and one primary action; make secondary actions look secondary.
- Do not: Put two equal-weight calls to action side by side, or leave the main action unclear.
- Why: A single clear path shortens the decision and the task. (Hick's law; NNGroup visual hierarchy)
- Check: review

### RX-PR-04 [Required] Back decisions with real screens

- Do: Cite at least one real screen_id for each meaningful design decision, or label it a judgment call with no reference.
- Do not: Claim "apps usually do X" without a screen to show it.
- Why: A cited screen makes a decision checkable instead of a matter of opinion. (ryux evidence principle)
- Check: search_screens, delivery_gate

### RX-PR-05 [Required] The product's market first

- Do: Start from how users in the product's own market pay, sign in, write addresses, and read money and dates; check a pattern from another market before reusing it. Take the market from the brief or the codebase, and ask when it is unclear.
- Do not: Import card-first checkout into a QRIS market, or bring Rupiah, Bahasa Indonesia, or local tax rates into a product built for another market.
- Why: Payment, address, and trust habits differ by market (in Indonesia: QRIS, virtual accounts, COD, WhatsApp). (ryux taxonomy of local patterns)
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
