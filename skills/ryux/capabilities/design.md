# RYUX Design

> What should we design, and why? Design is the bridge between Analyze and Build. It works without
> code (Figma, pen.dev, a mockup, the copy) and ends in a Design Direction that Build follows.

## Workflow

1. **Context.** Who, what task, which product and market, and the design intent
   (knowledge/product.md). Take it from the prompt, then DESIGN.md, then knowledge and evidence.
   Read the product docs first (the router, step 1). Ask only when a missing answer materially
   affects the user flow, what the product can do, or whether the content is correct, those
   questions alone, most consequential first, at most three, in one message, before designing.
   A product rule that changes which states or actions the screen has (refunds, fees, what happens
   on failure) is a major decision. When the prompt and DESIGN.md disagree, the prompt wins for
   this task; say so.
   **Direction is the user's call:** when neither the prompt nor DESIGN.md sets the UI direction
   (character, or brand colour and type) or the motion direction, ask for it in that message (it
   counts toward the three) instead of choosing it yourself. **No DESIGN.md and no product docs is the
   case where these questions matter most, never a reason to skip them:** ask, then wait for the
   answer before designing. Complete context means no questions. Never ask what the prompt, DESIGN.md, or the
   product docs already answer. For the rest, make the smallest reasonable assumption, write it
   down, and continue (RX-PR-01, RX-PR-02).
   **Record direction answers.** When the user answers a UI or motion direction question, write the
   answer into the UI direction or Motion direction field of the RYUX project context in DESIGN.md:
   between `<!-- ryux-context:start -->` and `<!-- ryux-context:end -->`, one line per field
   (`- **UI direction**: Calm, trustworthy`). If DESIGN.md or the block does not exist, create it
   with those two fields. Change only those field lines; leave every other line as it is. Your own
   assumptions do not go into DESIGN.md.
2. **Understand what exists.** When there is a screen, product, or design system already, read its
   analysis or run Analyze first (capabilities/analyze.md). Existing screens, components, and any
   screenshot or reference provided are your examples: read them before choosing patterns, take
   their principles, and never copy their facts. Understand before you design.
3. **Decide with evidence.** For consequential choices, compare two or three patterns, using
   reference screens when the ryux MCP is connected (RX-PR-09), and rate the evidence (RX-PR-10).
   On a complex or ambiguous surface (a new flow, a dashboard, a multi-step form), name the primary
   task, the one thing that must be seen first, and two or three UX approaches (structure and
   interaction model) before any visual work, and choose by the task; a small change skips this.
4. **Direction.** Write the Design Direction below. On an expressive surface (hero, landing,
   onboarding, empty state, brand moment), write three directions, choose one, and fill the Visual
   Direction (RX-UI-12, RX-UI-10). On task UI, follow conventions and the design system.
5. **Read the modules the task needs** from the task table, for example ux, interaction, forms, and
   content for a form, or ui and responsive for a layout.
6. **Design in the tool.** Use the Figma MCP or the pen.dev MCP. System first: look for the design
   system that exists (DESIGN.md, a tokens or theme file in the repo, the design file's variables and
   components, a linked library) and build from it. Create only what is missing: variables for color
   roles, spacing, radius, and type sizes and families before the first frame, and components for
   repeated elements (RX-DS-03). Building the system does not replace the states: design every
   state that matters (empty, loading, error, including content that fails to load) and every width
   you claim, and source assets on purpose (RX-UI-13).
7. **Render and inspect.** Screenshot what you made, check it against the direction and the rules,
   fix, and render again (capabilities/qa.md). Count the values still literal (color, spacing,
   radius, type size) and turn each into a variable or name the exception. List where the render
   differs from the Design Direction (hierarchy, states, widths) and fix or record each one. Check the result against the Liveliness you set, and
   put each prominent or decorative element through the purpose gate (RX-AS-05: purpose,
   contribution, necessity); on calm task UI, deliberate restraint is a valid answer. Then judge the main state as a
   reviewer would, not as a checklist: rate Clarity, Hierarchy, and Specificity from the Design Read
   (capabilities/critique.md), plus Craft (type steps, spacing rhythm, alignment, detail), Strong,
   Adequate, or Weak with one reason each, and fix anything Weak before the gate. Generated images and illustrations arrive
   asynchronously: wait until each one has landed and render again before exporting or closing the
   gate. Never finish with an asset still pending.
8. **Fact check, then the gate.** Check every product fact on the canvas (tool and command names,
   integrations, platforms, pages, numbers) against the brief or the repo (RX-PR-02), then close
   with the Delivery Gate, saying what was not designed, such as other widths or states. If you
   wrote DESIGN.md, say so in the final message: which file and which fields.

Do not edit frames you were not asked to change. Do not hand off a design as "final" with
placeholder or invented content.

## Design Direction (the output)

Write only the sections the task needs: a button fix needs three lines, a new flow needs most of
them. Every significant decision carries a one-line reason; a visual choice without a reason is not
a decision yet.

```
# Design Direction: <surface>

Context        who, which task, where in the product; what exists (from Analyze)
Design intent  what the user must understand, feel, and do here, and how we know it worked

UX direction   flow and steps; information hierarchy (first, second, third); interaction model;
               states (empty, loading, error, success, permission); edge cases; constraints and
               business rules given (never invented)
UI direction   layout and grid; type scale; spacing and density; color roles; containers;
               components reused or added; the focal point
Design language personality, tone, interaction personality, density, formality; each with its
               reason from the product, the audience, or the existing system
Visual direction for expressive surfaces: the Visual Brief (knowledge/ui.md, Visual production)
Motion direction each motion: purpose (what it communicates: state change, feedback, spatial
               relationship, progress, hierarchy), lifecycle (before, trigger, transition, new
               state, feedback), level L1 to L5, timing and easing from one personality,
               reduced-motion behavior
Liveliness     energy 1-3 (calm, balanced, expressive), rhythm 1-3 (even, steady with variation,
               varied), motion as its RX-UI-11 level; each with its reason from the product and
               the task. A decision, not a setup question: an operations dashboard can be energy
               1 and rhythm 2 on purpose; calm is a valid choice when it is chosen
Asset direction per asset: purpose, source, style, composition, context, consistency, usage,
               avoid, provenance (observed, sourced, illustrative, generated, inferred)
Responsive     what changes, stays, disappears, or stacks at each width

Assumptions    kept apart, all visible:
               design assumptions (low-risk choices made from context);
               unconfirmed capabilities (actions or features on the canvas the brief did not
               confirm; proposed, not requirements); sample data (realistic mockup content,
               never a fact, RX-AS-03)
Decisions      one Decision Receipt per major decision (below)
```

A direction the user gives, in the prompt or DESIGN.md, is input, not a suggestion: follow it, and
any deviation needs a Decision Receipt. A UI direction is a character ("calm, trustworthy,
minimal"), not a specification; translate it into concrete decisions (restrained color, strong
hierarchy, little decoration, clear status) instead of swapping in a style you prefer. Character
words are not a recipe: "trustworthy" does not mean blue and "premium" does not mean serif. Choose
color, type, spacing, and components from the brand, the design system, and evidence, and say which.

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
