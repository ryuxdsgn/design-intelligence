# RYUX Design

> What should we design, and why? Design is the bridge between Analyze and Build. It works without
> code (Figma, pen.dev, a mockup, the copy) and ends in a Design Direction that Build follows.

## Workflow

1. **Context.** Who, what task, which product and market (knowledge/product.md). Write the
   assumptions down.
2. **Understand what exists.** When there is a screen, product, or design system already, read its
   analysis or run Analyze first (capabilities/analyze.md). Understand before you design.
3. **Decide with evidence.** For consequential choices, compare two or three patterns, using
   reference screens when the ryux MCP is connected (RX-PR-09), and rate the evidence (RX-PR-10).
4. **Direction.** Write the Design Direction below. On an expressive surface (hero, landing,
   onboarding, empty state, brand moment), write three directions, choose one, and fill the Visual
   Direction (RX-UI-12, RX-UI-10). On task UI, follow conventions and the design system.
5. **Read the modules the task needs** from the task table, for example ux, interaction, forms, and
   content for a form, or ui and responsive for a layout.
6. **Design in the tool.** Use the Figma MCP or the pen.dev MCP. Design every state that matters
   (empty, loading, error) and every width you claim, and source assets on purpose (RX-UI-13).
7. **Render and inspect.** Screenshot what you made, check it against the direction and the rules,
   fix, and render again (capabilities/qa.md). Generated images and illustrations arrive
   asynchronously: wait until each one has landed and render again before exporting or closing the
   gate. Never finish with an asset still pending.
8. **Fact check, then the gate.** Check every product fact on the canvas (tool and command names,
   integrations, platforms, pages, numbers) against the brief or the repo (RX-PR-02), then close
   with the Delivery Gate, saying what was not designed, such as other widths or states.

Do not edit frames you were not asked to change. Do not hand off a design as "final" with
placeholder or invented content.

## Design Direction (the output)

Write only the sections the task needs: a button fix needs three lines, a new flow needs most of
them. Every significant decision carries a one-line reason; a visual choice without a reason is not
a decision yet.

```
# Design Direction: <surface>

Context        who, which task, where in the product; what exists (from Analyze)
User goal      what the user must finish, and how we know it worked

UX direction   flow and steps; information hierarchy (first, second, third); interaction model;
               states (empty, loading, error, success, permission); edge cases; constraints and
               business rules given (never invented)
UI direction   layout and grid; type scale; spacing and density; color roles; containers;
               components reused or added; the focal point
Design language personality, tone, interaction personality, density, formality; each with its
               reason from the product, the audience, or the existing system
Visual direction for expressive surfaces: the Visual Brief (knowledge/ui.md, Visual production)
Motion direction each motion: lifecycle (before, trigger, transition, new state, feedback),
               level L1 to L5, timing and easing from one personality, reduced-motion behavior
Asset direction per asset: purpose, source, style, composition, context, consistency, usage,
               avoid, provenance (observed, sourced, illustrative, generated, inferred)
Responsive     what changes, stays, disappears, or stacks at each width

Assumptions    everything guessed, visible
Decisions      one Decision Receipt per major decision (below)
```

**Decision Receipt.** Write one for each major decision: the navigation model, payment method
priority, information hierarchy, checkout structure, interaction model, or responsive strategy.
Small choices ("8px between icon and label") need none; keep receipts few and short.

```
Decision     what was chosen
Options      A / B / C compared
Evidence     count, type, and ids: "3 observed checkout flows (scr_...) + RX-IX-05" | None
Confidence   High | Medium | Low
Why          one line, from the evidence or the stated goal
Trade-off    what it costs
Assumption   what must be true for it to hold
```

Evidence names its count and never generalizes past it. "Evidence None, Confidence Low, Why:
business priority was not provided" is a valid receipt; keep it visible instead of upgrading it.

Visual, motion, and asset rules and tables live in knowledge/ui.md (RX-UI-07 to RX-UI-13); this
direction only records the choices made with them.
