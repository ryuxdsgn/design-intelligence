// Hand-written framework text for each RYUX skill: the questions, decision trees, and templates an
// agent reasons with. Rules (Do / Do not / Why) are generated from content.ts and appended below
// each guide by render.ts. Keep each guide short; the core is loaded on every task.

import type { SkillId } from "./content.js";
import { UNTRUSTED_CONTENT } from "./capture.js";

export const CORE_POSITIONING = `RYUX is a design intelligence layer for AI and designers. It helps understand, reason, design,
build, critique, and verify interfaces using design knowledge and evidence. It is not a UI
generator, an anti-slop framework, a design system, or a prompt library.

**Understand before you design. Don't design from imagination when evidence is available.**

\`\`\`
Understand → Frame → Explore → Evaluate and select → Build and critique → Verify and deliver → done
\`\`\``;

export const CORE_CAPABILITIES = `Tell RYUX what you are doing; RYUX decides what it needs to know. Pick the entry point, read its
file, then only the knowledge modules the task needs (task table below); paths are relative to this skill's folder.

| Entry point | When | Read |
| --- | --- | --- |
| **Analyze** | understand a screen, product, or flow that exists | \`capabilities/analyze.md\` |
| **Design** | create or improve UI and UX without code: Figma, pen.dev, mockups, copy | \`capabilities/design.md\` |
| **Build** | implement or change the interface in code | \`capabilities/build.md\` |
| **Critique** | find what should change first, and why; a heuristic evaluation | \`capabilities/critique.md\` |
| **QA** | verify a build against the intended design | \`capabilities/qa.md\` |

Knowledge modules (\`knowledge/\`): product, ux, interaction, forms, edge-cases, content, ui,
design-system, accessibility, responsive, frontend, and anti-slop. Evidence comes from the brief, the
project, product data, standards, and the ryux MCP when connected; none is required. Every entry point ends at the quality gates: the Hard
Gates below and the Delivery Gate, with anti-slop as the last check, never the starting point.

Keep them apart: Analyze says what exists, Design what to do, Critique if it is right, QA if it matches.`;

export const CORE_PRINCIPLE = `Novelty is not a goal; a recognisable brand layer is: familiar structure, distinct surface.
Optimize for clarity, usability, consistency, product fit, accessibility, and intentional decisions.
Understand the context first; keep observed facts apart from assumptions; prefer evidence over
taste; invent no requirements; give each meaningful decision its trade-off; validate before claiming.`;

export const CORE_WORKFLOW = `One workflow, six stages; each entry point runs the stages it needs.

1. **Understand**: who, what task, which product and market (RX-PR-01). Read the RYUX project
   context in DESIGN.md, then the product docs (Product docs paths, else PRD.md, docs/prd*,
   docs/product*, README), and name what you read. Separate facts, assumptions, and unknowns
   (RX-PR-02); ask and record direction as in capabilities/design.md, stage 1. DESIGN.md is
   direction, not evidence. Read the entry point's file and only the modules the task table lists.
2. **Frame**: the user's task, the flow, what must be seen first, the primary action, and three to
   five success criteria from the brief, written before any alternative exists.
3. **Explore**: on a new or complex surface, two or three alternatives that differ in hypothesis and
   structure, not paint; reference screens through the ryux MCP when connected. A small change skips it.
4. **Evaluate and select**: rate the alternatives against the Frame criteria with evidence
   (RX-PR-09, RX-PR-10); the user picks; write the Decision Receipt.
5. **Build and critique**: design or implement the choice, render, inspect, and fix; Reconsider an
   unchosen alternative when a finding contradicts the choice, and say why.
6. **Verify and deliver**: Hard Gates, the Delivery Gate, honest claims, and a user test plan (RX-UX-12).

Analyze runs 1. Design runs 1-6. Build runs 1, 5, and 6 (2-4 through Design when no design exists).
Critique runs 1 and the critique half of 5. QA runs 6. Never go from "generate" straight to "done".`;

export const DESIGN_BODY = `# RYUX Design

> What should we design, and why? Design is the bridge between Analyze and Build. It works without
> code (Figma, pen.dev, a mockup, the copy) and ends in a Design Direction that Build follows.

## Workflow

The six stages of the core workflow (SKILL.md), as Design runs them.

1. **Understand.** Who, what task, which product and market, and the design intent
   (knowledge/product.md). Take it from the prompt, then DESIGN.md, then knowledge and evidence.
   Read the product docs first (the router, stage 1). Ask only when a missing answer materially
   affects the user flow, what the product can do, or whether the content is correct, those
   questions alone, most consequential first, at most three, in one message, before designing.
   A product rule that changes which states or actions the screen has (refunds, fees, what happens
   on failure) is a major decision. When the prompt and DESIGN.md disagree, the prompt wins for
   this task; say so. A DESIGN.md written for a different product (another name, domain, or
   audience than this brief) sets no direction for this task: say so, and treat direction as unset.
   **Direction is the user's call:** when neither the prompt nor DESIGN.md sets the UI direction
   (character, or brand colour and type) or the motion direction, ask for it in that message (it
   counts toward the three) instead of choosing it yourself. **No DESIGN.md and no product docs is the
   case where these questions matter most, never a reason to skip them:** ask, then wait for the
   answer before designing. Complete context means no questions. Never ask what the prompt, DESIGN.md, or the
   product docs already answer. For the rest, make the smallest reasonable assumption, write it
   down, and continue (RX-PR-01, RX-PR-02).
   **Record direction answers.** When the user answers a UI or motion direction question, write the
   answer into the UI direction or Motion direction field of the RYUX project context in DESIGN.md:
   between \`<!-- ryux-context:start -->\` and \`<!-- ryux-context:end -->\`, one line per field
   (\`- **UI direction**: Calm, trustworthy\`). If DESIGN.md or the block does not exist, create it
   with those two fields. Change only those field lines; leave every other line as it is. Your own
   assumptions do not go into DESIGN.md.
   **What exists.** When there is a screen, product, or design system already, read its
   analysis or run Analyze first (capabilities/analyze.md). Existing screens, components, and any
   screenshot or reference provided are your examples: read them before choosing patterns, take
   their principles, and never copy their facts. A request to copy a screenshot as it is goes to
   Build as a recreate (capabilities/build.md, step 2). Understand before you design. When the task
   redesigns or improves what exists, list what works and keep it; change only what has a named
   problem (RX-UX-10).
   **Modules.** Read the modules the task needs from the task table before deciding anything, for example ux,
   interaction, forms, and content for a form, or ui and responsive for a layout; for any surface
   with a visual direction, ui and anti-slop as well. The rules shape the first idea, not only the
   review of it.
2. **Frame.** Name the primary task, the flow, the one thing that must be seen first, and the
   primary action. Write three to five success criteria from the brief (the user's main task, what
   must be seen first, the brief's character words, conventions that must hold) before any
   alternative exists; Explore and Evaluate use these, and they do not change after you see the
   alternatives. For consequential choices, list the two or three patterns to compare, using
   reference screens when the ryux MCP is connected (RX-PR-09).
3. **Explore.** On a new screen or flow, a complex or ambiguous surface, or a brief that asks for a
   new look, render two or three alternatives as frames side by side: the main state only, the same
   content and sample data in each, each labelled with a name and a one-line hypothesis.
   - Each alternative is a hypothesis about what this user needs, not a style: on task UI, for
     example, task-first (status and the next action lead), editorial (type and composition carry
     the hierarchy), or expressive-brand (the brand layer leads without slowing the task). Choose
     hypotheses that fit this product; never force three.
   - Make them differ in structure, not paint: every two of them differ on at least two of
     hierarchy, information order, composition or layout model, navigation or interaction model
     (where the main action lives), and brand expression (type class, colour temperature). The same
     layout in new colours is the same alternative; replace it. Conventions that must hold stay fixed
     in all of them (RX-UX-08).
   - On task UI the brand layer carries one signature from the product's own domain, never a layout
     change for its own sake (RX-UI-12); on an expressive surface the signature can lead.
   - A small change, or a screen inside a fixed design system, skips Explore: say so and continue.
4. **Evaluate and select.** Rate each alternative against the Frame criteria, Strong, Adequate, or
   Weak with one reason each, rate the evidence (RX-PR-10), and recommend one with a Decision Receipt.
   "It looks better" is not a reason. Then stop and let the user choose. Build only the chosen one
   into the full design (states, widths, Visual Brief, RX-UI-10), write the Design Direction
   below, and mark the others on the canvas as not chosen. When the user has already said to pick for
   them, continue with the recommendation and say so.
   **Modes after the choice.** Refine improves the chosen alternative without losing its hypothesis.
   Reconsider returns to an unchosen alternative when a later finding or new evidence contradicts the
   choice: name the finding, show the alternative again, and let the user decide. Results from a
   usability test or production data can send the work further back, to Understand or Frame: restate
   the context or criteria they change, then explore again.
5. **Design in the tool, then critique it.** Use the Figma MCP or the pen.dev MCP. System first:
   look for the design system that exists (DESIGN.md, a tokens or theme file in the repo, the design file's variables and
   components, a linked library) and build from it. Create only what is missing: variables for color
   roles, spacing, radius, and type sizes and families before the first frame, and components for
   repeated elements (RX-DS-03). Building the system does not replace the states: design every
   state that matters (empty, loading, error, including content that fails to load) and every width
   you claim, and source assets on purpose (RX-UI-13); illustration follows a written style and is
   made as one set (RX-UI-17, RX-UI-18).
   **Render and inspect.** Screenshot what you made, check it against the direction and the rules,
   fix, and render again (capabilities/qa.md). Then, on the render:
   - Literal values: turn each into a variable or name the exception (RX-DS-03).
   - Counts: run the RX-AS-10 counts and report them in the gate.
   - Hierarchy: run the four hierarchy checks from Critique (control beside its data, a primary
     action that reads as an action, not a tab, no fact twice, grouped by what the user checks
     together); fix what fails and check each fix.
   - Weight ranking: list the screen's blocks in order of visual weight (size × contrast × surface)
     and compare it with the priority order from Frame (stage 2). If two blocks of different
     priority share a heading style and container, change one. On a checkout or order screen, the
     choice that sets the price and the total rank first and second.
   - Widths: a width check is a test, not a deliverable. List what broke at each width (wrap,
     truncation, overflow), fix it or record why it is acceptable, and render again; RESPONSIVE
     PASS names the width used, the findings, and their fixes.
   - Direction: list where the render differs from the Design Direction (hierarchy, states,
     widths) and fix or record each one, and check the result against the Liveliness you set.
   - Purpose: put each prominent or decorative element through the purpose gate (RX-AS-05); on
     calm task UI, deliberate restraint is a valid answer.
   - Reviewer's read: rate Clarity, Hierarchy, and Specificity from the Design Read
     (capabilities/critique.md), plus Craft (type steps, spacing rhythm, alignment, detail), Strong,
     Adequate, or Weak with one reason each; fix anything Weak before the gate.
   - Reference check: put the main state beside two or three reference apps (named in the brief,
     from the Reference Read, or comparable screens from the ryux MCP) and write, per reference,
     what holds up and what reads weaker or more generic in yours (surface, hierarchy, brand layer,
     assets); no score. Fix what reads weaker for the task; say so when no reference was available.
   - Assets: generated images and illustrations arrive asynchronously. Wait until each one has
     landed and render again before exporting or closing the gate; never finish with one pending.
6. **Verify and deliver.**
   - Facts: check every product fact on the canvas (tool and command names, integrations,
     platforms, pages, numbers) against the brief or the repo (RX-PR-02).
   - Canvas copy is for the team, not for RYUX: annotations, state captions, and labels use plain
     language ("Shown while prices load; button disabled"). Rule IDs, gate results, and Decision
     Receipts go in the Design Direction or the final message, never in frames meant for review or
     handoff.
   - Handoff: a handoff frame annotates, in plain language, the interaction behaviour, the
     truncation rule for each text that can overflow, and each component's code name.
   - Test plan: for a new flow or a consequential change, write the usability test plan (RX-UX-12);
     skip it for a small change or when the user says so. Suggest that the team watch the sessions,
     so what users show becomes shared knowledge rather than one person's report.
   - Close with the Delivery Gate, saying what was not designed, such as other widths or states. If
     you wrote DESIGN.md, say so in the final message: which file and which fields.

${UNTRUSTED_CONTENT}

Do not edit frames you were not asked to change. Do not hand off a design as "final" with
placeholder or invented content.

## Design Direction (the output)

Write only the sections the task needs: a button fix needs three lines, a new flow needs most of
them. Every significant decision carries a one-line reason; a visual choice without a reason is not
a decision yet.

\`\`\`
# Design Direction: <surface>

Context        who, which task, where in the product; what exists (from Analyze)
Design intent  what the user must understand, feel, and do here, and how we know it worked

UX direction   flow and steps; information hierarchy (first, second, third); interaction model;
               states (empty, loading, error, success, permission); edge cases; constraints and
               business rules given (never invented)
UI direction   layout and grid; type scale; spacing and density; color roles; containers;
               components reused or added; the focal point; the shape lock (radius per role);
               the icon style (outline or filled, stroke weight, corners)
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
\`\`\`

A direction the user gives, in the prompt or DESIGN.md, is input, not a suggestion: follow it, and
any deviation needs a Decision Receipt. A UI direction is a character ("calm, trustworthy,
minimal"), not a specification; translate it into concrete decisions (restrained color, strong
hierarchy, little decoration, clear status) instead of swapping in a style you prefer. Character
words are not a recipe: "trustworthy" does not mean blue and "premium" does not mean serif. Choose
color, type, spacing, and components from the brand, the design system, and evidence, and say which.

**Decision Receipt.** Write one for each major decision: the navigation model, payment method
priority, information hierarchy, checkout structure, interaction model, or responsive strategy.
Small choices ("8px between icon and label") need none; keep receipts few and short.

\`\`\`
Decision     what was chosen
Options      A / B / C compared
Evidence     count, type, and ids: "3 observed checkout flows (scr_...) + RX-IX-05" | None
Confidence   High | Medium | Low
Why          one line, from the evidence or the stated goal
Trade-off    what it costs
Assumption   what must be true for it to hold
Dissent      evidence only one source holds, or the case for an option not chosen | none
\`\`\`

Evidence names its count and never generalizes past it. "Evidence None, Confidence Low, Why:
business priority was not provided" is a valid receipt; keep it visible instead of upgrading it.

Visual, motion, and asset rules and tables live in knowledge/ui.md (RX-UI-07 to RX-UI-19); this
direction only records the choices made with them.`;

export const BUILD_BODY = `# RYUX Build

> Implement or change the interface in code, faithfully and in the repo's own stack.

Build runs Understand (steps 1-3), Build and critique (4-6), and Verify and deliver (7) of the core
workflow (SKILL.md); Frame, Explore, and Evaluate happen in Design.

1. **Read the repo first**: the stack, components, tokens, conventions, the architecture already
   used (where components, state, pure logic, and data access live), and the test runner
   (knowledge/frontend.md, knowledge/design-system.md). Reuse before creating.
2. **Find the design source**: the Design Direction, a Figma or pen.dev design, a DESIGN.md, or an
   approved mockup; it is the spec. If there is none, run Design's Frame, Explore, and Evaluate
   first (capabilities/design.md, stages 2-4) instead of inventing one in code.
   A screenshot or another product's page is a reference, not the spec, unless the user asks to
   recreate it ("recreate", "match this", "samakan"). Then match it, let QA compare at the same
   viewport, and still leave out another product's brand, logo, and content (RX-AS-11). With no word
   either way, design from its principles and write "reference, not recreate" in Assumptions.
3. **Read the modules the task needs** from the task table: for example accessibility, responsive,
   and edge-cases for any UI, and forms and content for a form. When the build adds motion or
   transitions, read knowledge/ui.md (RX-UI-11) before writing any: how often the surface is seen
   decides how much it moves. When it adds illustration, read RX-UI-19: SVG coloured from tokens,
   no text inside, alt text that says the meaning.
4. **Implement faithfully.** Use semantic elements, existing components, and real data paths.
   Build must not invent business rules, prices, or limits; API behavior or response shapes; or
   data presented as real (RX-FE-02, RX-PR-02). It must not silently change a design decision: a
   change goes back to Design as a new Decision Receipt, and when the code shows the chosen design
   cannot work (data, platform, performance), say so and send it back to Reconsider. Mark every
   assumption in the code. Give each piece of logic one home in the repo's existing layers, never a
   copy (RX-FE-13).
5. **Test what can break.** Unit tests for new or changed pure logic, edge cases included;
   integration tests for critical flows such as checkout, payment, and form submit. Use the
   repo's runner; with none, propose one and ask before adding it (RX-FE-14).
6. **Render and verify.** Run it and the tests, check every width and state, and fix deviations
   from the design (capabilities/qa.md). When changing an existing screen, also check that what
   you did not mean to change still works: neighbouring screens, shared components, and the flow
   around the change.
   When anything animates, run the motion passes in capabilities/qa.md as well. Run the counts of
   RX-AS-10 on the render and report them in the gate.
7. **Close with the Delivery Gate.** CODE QUALITY and VISUAL QA need real checks (typecheck,
   tests, render), or say what was not run. For a new flow or a consequential change, add the
   usability test plan (RX-UX-12) unless the design already has one.`;

export const CORE_EVIDENCE = `Say where every claim comes from:

| Source | Meaning | Example |
| --- | --- | --- |
| **Observed** (or Measured) | seen in the design, a capture, or read from its values | "body text is 16/24, from the CSS" |
| **Inferred** | a reasonable guess; say it is one | "probably an 8px scale" |
| **Knowledge** | a known pattern or standard, cited | "WCAG 1.4.3", "observed in 4 screens, scr_..." |

Product evidence (brief, requirements, analytics, research, support data) is Observed when sourced;
reference screens show what products do, not what this product's users need. Four questions, not four
output fields: where it came from (source, above), is it known (known, inferred, or **unknown**, kept
visible), how strong is the basis (Strong, Thin, None), how sure is the choice (High, Medium, Low).
Knowledge is what is generally known, evidence is what this context shows, judgment chooses from both.

Rate the evidence for a decision **Strong** (2+ comparable screens), **Thin** (one, or another
context), or **None** (a judgment call; say so, RX-PR-10). Scope each claim to its evidence: one
screen supports "observed in scr_x", not "apps do X"; name the count ("in 4 observed screens"), and
never generalize to a market or category from Thin evidence (RX-PR-02). Label every visual asset's provenance:
**observed** (from the real product), **sourced** (licensed, with its source), **illustrative**
(made to explain, labeled), **generated** (from a Visual Brief, labeled), or **inferred** (a
stand-in until the real one exists). Never invent numbers, user behavior, business rules, research,
compliance, product or competitor facts, screenshots, or references (RX-PR-02, RX-AS-01).

Record a source as \`{ type: observed | inferred | knowledge, origin, reference }\`, for example
\`{ knowledge, ryux-knowledge, scr_123 }\` from the ryux MCP, or \`{ observed, screenshot, hero.png }\`.
Optional sources (the ryux MCP, Figma, a browser, screenshots, other reference libraries) add
evidence when connected; none is required.`;

export const CORE_HONESTY = `Report what was checked, how, and what was not available. Do not claim "pixel perfect",
"fully accessible", "production ready", "senior-level", or "UX optimized" without evidence. Say
"Keyboard and focus checked by hand; no automated accessibility test was available" instead.
Rule IDs and gate results belong in your report, never on the design itself.`;

export const CORE_DECISION_RECORD = `For consequential choices (RX-PR-09) and deviations, write **Decision**, **Options** compared, **Evidence**,
**Trade-off**, and **Choice**. Evidence is Strong (2+ comparable screen_ids), Thin (one, or another context),
or None (no screen_id: a judgment call). With None on a consequential choice, show options or ask (RX-PR-10).`;

export const GATE_RULES = `- Each area is PASS, FAIL, NOT VERIFIED (it applies, but the evidence was not available: name what is missing), or N/A (it does not apply: say why). Scale the gate to the task: a copy fix or a one-component change marks the areas it cannot affect N/A, one line each.
- An area FAILS when a [Required] rule in its skills fails without a written exception.
- A Hard Gate failure cannot be excepted: fix it before declaring the work complete.
- VISUAL QA without a render is NOT VERIFIED; a PASS names the render tool, the widths, and the states inspected.
- CODE QUALITY is NOT VERIFIED while changed logic has no test run; say which checks ran (typecheck, tests).
- FINAL is FAIL if any area fails, NOT VERIFIED if none fails but one is not verified, else PASS. PASS means the checked criteria were met, not that the design is good or was validated with users ("not tested with users" unless it was).`;

export const GUIDES: Record<SkillId, string> = {
  product: `Answer these before any layout exists. Write the answers down; they are the brief.

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

Find evidence with the ryux MCP (\`search_screens\`, \`get_flow\`, \`get_local_pattern\`) and cite the
\`screen_id\`, or call the decision a judgment call.

Lead with the user's outcome, keep only what serves the task, and follow the project's DESIGN.md
or brand when it exists (write down any deliberate departure).

**Decide with evidence.** For a consequential decision, compare patterns, then choose by context:

\`\`\`
Decision:   payment confirmation layout
Context:    standalone bank transfer, first-time users
Options:
  A  QR success screen        scr_...  strength: instant      weakness: little detail
  B  bank-transfer receipt    scr_...  strength: verifiable   weakness: dense
  C  marketplace order status scr_...  strength: order link   weakness: not standalone
Choice:     B, because the context is a standalone transfer
Evidence:   Strong (2+ comparable screens, same context) | Thin (1, or other context) | None
Trade-off:  higher density
\`\`\`

With **None**, say so: present the options and their trade-offs, or ask. Never invent a reference.

Does not cover: layout or visual decisions (see ryux-ux and ryux-ui).`,

  ux: `Choose structure from the user's goal, not from a template.

- **Information architecture**: what objects and tasks exist, how users name them, and how they
  look for them (browse, search, or follow a notification).
- **Navigation**: the minimum set of destinations, named in the user's words. Where am I, and how
  do I get back?
- **Flows**: list the steps; remove steps that only serve the system. Multi-step flows show
  progress and a reviewable summary.
- **Grouping**: by meaning (task, time, status), with labels.
- **Progressive disclosure**: what the current decision needs first; rare options behind a
  clearly labeled control.
- **Search, filter, sort**: only when the content is long enough to need them, matching how
  users hunt.
- **Recovery paths**: every flow has a way back and a way out.

Reason like a senior designer: a principle, where it applies, where it does not, and what it costs.

\`\`\`
Rule:       Recognition over recall (RX-UX-08)
Context:    a complex enterprise form filled many times a day
Decision:   show previously selected values and recent entries
Trade-off:  higher visual density
Reason:     less memory burden in a repeated workflow
\`\`\`

Does not cover: per-action behavior (see ryux-interaction), forms (see ryux-forms), or states
(see ryux-edge-cases).`,

  interaction: `Define every meaningful action in four parts before implementing it:

| Phase | Question |
| --- | --- |
| Before | What tells the user this action exists, what it will do, and what it costs? |
| During | What do they see while it runs (pressed state, loading, progress)? |
| Result | How do they know it worked, and what changed? |
| Recovery | If it fails or was a mistake, how do they undo, retry, or get help? |

**Confirm or undo?** Reason about it; do not apply it mechanically.
1. Is it reversible? Then prefer an undo after the fact over a confirmation before.
2. Is it irreversible **and** high-impact (money, sending, deleting shared data)? Then confirm with
   the specifics: amount, recipient, item.
3. Is recovery easy and the impact small? Then skip confirmation; it only adds friction.
4. Would a confirmation appear so often that people dismiss it by habit? Then it protects
   nothing; use undo.

States to define for interactive elements: default, hover (pointer), focus, active or pressed,
disabled (with a reason, or keep it enabled and explain on use), loading, success, error. Keyboard:
every action is reachable; Enter submits; Escape closes. For repeat or expert use, add shortcuts
(recent items, quick amounts) without crowding the novice path.

**Navigation.** How a screen arrives tells people where back goes (RX-IX-13, RX-IX-14):

| Transition | Means | Back |
| --- | --- | --- |
| Push | one level deeper in the same task | returns to the screen before |
| Replace | a new stage; the old one is finished | does not return to the finished stage |
| Modal | a self-contained task, finished or cancelled | closes the task |
| Sheet | a short interruption over the current screen | dismisses the sheet |

After a completed payment, submission, or onboarding, the result replaces the flow (a one-way door).
Back is blocked only while a request is in flight or work is unsaved, and the screen says why.
Follow the platform's back gesture and button; on the web, the browser's back follows the same map.

Does not cover: form-specific behavior (see ryux-forms).`,

  forms: `A form is a conversation. Design it field by field, then as a whole.

- **Grouping**: related fields together, with a group label when there are more than a few.
- **Labels**: visible and tied to the field; placeholders are examples, not labels.
- **Layout**: one column for sequential input is the default; put short related fields side by
  side when people read them as one unit. Decide by relationship, not by filling width.
- **Fewest fields**: ask only what the task needs; mark whichever of required or optional is less
  common.
- **Validation timing**: validate a field after the user leaves it or when the format is clear;
  never erase what they typed.
- **Defaults and autofill**: prefill what you know; set autocomplete and inputmode.
- **Multi-step**: show the step, allow going back without losing data.
- **Unsaved changes**: autosave with a visible status, or warn before discarding.
- **Submission**: prevent double submits, show progress, then success with what happens next, or
  failure with input kept and a retry.

Does not cover: general interaction states (see ryux-interaction) or error copy wording (see
ryux-content).`,

  "edge-cases": `The happy path is not enough. Walk this list for the screen you built:

| Area | Cases |
| --- | --- |
| Data | empty, one item, many items, long content, missing fields, duplicates |
| Forms | invalid, partial, failed, loading, unsaved, expired |
| Network | slow, timeout, offline, server failure, retry |
| Permissions | read-only, restricted, different roles (only roles that exist) |
| System | session expired, unauthorized, unexpected error |

For first use and zero data, explain what will appear and give one action to start. For each case
that can happen, decide what the user sees and what they can do next. Cases that
cannot happen in this product do not need a design; say so in the Delivery Gate.

Does not cover: how errors are worded (see ryux-content).`,

  content: `Content is interface: labels, CTAs, errors, empty states, confirmations, helper text, terminology,
numbers, dates, currency, and localization are all designed, not filled in last. Write them
specific, concise, human, action-oriented, and in context.

Avoid generic AI language: "unlock", "elevate", "transform", "seamlessly", "powerful solution",
"next-generation", "experience the future", and their Indonesian equivalents
("solusi terbaik", "pengalaman tak terlupakan").

- **Buttons** describe the actual action: "Bayar Rp45.000", not "Lanjutkan" when it pays.
- **Error messages**: 1. what happened, 2. why it matters when that helps, 3. how to recover.
- **Terminology**: one name per thing, everywhere.
- **Locale** comes from the product's market: language, money, dates, and numbers follow it.
- **Indonesian copy**: as users speak it, English only for terms they already use; money as
  Rp1.250.000; dates and numbers as 2 Okt 2026, 14.30 WIB, 1,5, 12.500, +62 812-3456-7890.
- **Help** at the point of need (a hint under a field, "Kenapa diminta?"), not only in an FAQ.
- **Chat channels** (WhatsApp, Telegram): a short greeting, short paragraphs, sparse *bold*, and a
  clear contact line; not a marketing page.
- **Offers and terms**: write only the terms you were given. Unknown minimums, quotas, deadlines,
  and codes stay placeholders (\`[minimal belanja]\`, \`[tanggal selesai]\`); do not add "kuota
  terbatas" or "sebelum kehabisan" unless a real limit was stated (RX-AS-04, RX-PR-02).

Does not cover: layout of the text (see ryux-ui).`,

  ui: `**Visuals are not decoration. They are communication.** RYUX UI owns the visual expression of
a product: what each visual decision communicates, why it exists, and how it behaves. Functional UI
helps the user read, decide, or act. Anything decorative needs a stated reason (see the purpose
gates in ryux-anti-slop). It works in four layers.

**1. UI system.** Work in this order:
1. **Hierarchy**: what is read first, second, third? The primary action and key information win.
2. **Layout and alignment**: a shared grid; groups by meaning; consistent edges.
3. **Spacing and type**: one scale; size and weight carry hierarchy, not color alone.
4. **Density**: compact for repeat work, roomier for first-time or high-stakes decisions.
5. **Color**: roles first (surface, text, accent for the primary action, status); contrast checked.
6. **Containers**: use a container only when it groups or separates something.
7. **Icons**: next to labels, from one set, at consistent sizes.

**Justify values.** Every value comes from the scale and has a reason you can say in one line:
"12px between these two fields because they belong together; 24px before the next group because it
is a new topic." Tighter inside a group, looser between groups; density follows the task. If you
cannot say why 8 and not 12, the choice is not a decision yet.

**Set the type, don't only size it** (RX-UI-14). Body text reads best at 45 to 75 characters per line:
give paragraphs a max width and check the rendered count (about 30 to 34em in most text faces; CSS
\`ch\` is the width of a zero, so 65ch runs well past 75 characters). Line-height falls as size rises:
about 1.5 for body, 1.2 to 1.3 for headings, close to 1.1 for display. Large display text tightens
slightly; small uppercase labels open up (about 0.05em). Numbers people compare or watch change use
tabular figures. Two families at most, three weights at most: hierarchy comes from size and weight
steps, not from more faces. Headings do not end on one stranded word (\`text-wrap: balance\`, or
rewrite).

**Craft is the last 10 percent people notice first** (RX-UI-15). Icons sit on the optical center of
their text, sized to its line-height, with a stroke that matches the type weight. Number columns align
right or on the decimal. Borders, dividers, and shadows come from one small token set. Long text
truncates on purpose, with the full value still reachable.

**2. Art direction.** Each visual has a job (RX-UI-07), its composition leaves room for the
content (RX-UI-09), and the visual language is chosen, not defaulted (RX-UI-10). Name the visual
language in a few words (editorial, product-centric, human, technical, playful, premium,
institutional) and its form (shape language, geometric or organic, flat or with depth).

**Composition exploration.** For an expressive surface, sketch three compositions of the chosen
direction (subject left, subject right, centered or full-bleed) as quick frames, then choose by
focal point, hierarchy, negative space, relation to the copy, and balance (RX-UI-09).

**Expressive surfaces** (hero, landing, onboarding, empty states, brand moments). Restraint keeps
task UI usable; on expressive surfaces it is only the floor. Work concept, then signature, then
system:
1. **Concept**: explore two or three alternatives first (name, concept, signature; capabilities/design.md, stage 3), then choose one. The idea
   comes from the product itself, not from the category: a tool about evidence might use receipts,
   citations, and marks of proof; a calm finance app might use the ledger. The category default
   (a terminal panel for developer tools, a dashboard screenshot for SaaS) is never the signature.
2. **Signature**: one element that carries the concept and that people would remember. Choose the
   lever: type (scale contrast, a distinctive face), composition (a broken grid, an unexpected
   crop, a large number), art direction, color temperature, motion personality, or copy voice.
3. **System**: everything else stays quiet and consistent so the signature reads.
The Liveliness you set (Design Direction) turns into these levers: one focal point per screen,
contrast in size and weight that builds the hierarchy, whitespace that groups, one deliberate
accent, and a motif the signature repeats. Low energy uses the same levers, quietly.
Then run the swap test (RX-AS-09): with a competitor's name and logo, would anything need to change?
If not, the surface has no point of view yet. Stay honest while being bold: a strong idea never
needs invented numbers, people, or logos.

**3. Motion.** Start from purpose: what the motion communicates; with no purpose, no motion.
Then ask how often someone will see it. The more often, the less of it they should notice: what
people open many times a day (a command palette, a shortcut, core navigation) appears at once, and
expression is kept for occasional or first-time moments. A purpose does not outweigh frequency.
Every motion follows one lifecycle: before, trigger, transition, new state, feedback.
The states themselves (waiting, result, recovery) are defined in ryux-interaction (RX-IX-01,
RX-IX-02); motion only makes them visible, and it never compensates for weak UX. Decide the trigger,
duration, easing, distance, opacity or scale, and how several elements are choreographed. Define
duration and easing once as motion tokens, and animate transform and opacity rather than layout
properties (width, height, top, margin), which cause jank. What opens and closes should be able to
reverse halfway: use transitions, not an open-only keyframe animation.

| Level | Examples | Needs |
| --- | --- | --- |
| L1 State feedback | button press, checkbox, toggle | starts on touch and lasts 100 to 150 ms; buttons and cards press to about 0.97 scale, list rows change background only |
| L2 Component transition | dropdown, modal, drawer, tooltip | shows where something came from or went: enters from about 0.95 scale with a fade (never from 0), exits faster along the same path, a menu grows from its trigger |
| L3 Page transition | navigation, route change | keeps the user oriented between places |
| L4 Storytelling | onboarding, product introduction, marketing | a message that is clearer moving than still |
| L5 Decorative | background particles, floating elements | a brand reason, and never delaying content or input |

Pick one **motion personality** per product and derive timing and easing from it:

| Trait | Calm (banking) | Energetic (game) |
| --- | --- | --- |
| Character | calm, precise | energetic, playful |
| Speed | moderate | fast |
| Easing | ease-out; default token \`cubic-bezier(0.23, 1, 0.32, 1)\` | spring |
| Movement | short, controlled | larger, expressive |
| Expression | subtle | high |

When neither the brief nor DESIGN.md sets the motion direction, start from Calm: the easing token
above, interface transitions under 300 ms, and no ease-in on anything that enters. Replace these
defaults as soon as the product sets its own. Data the user is reading (a balance, an amount, a
table value) does not move for effect. With reduced motion requested, large movement becomes a fade
or a cut (RX-A11Y-08).

**4. Visual production.** Decide where each asset comes from before making anything (RX-UI-13):

| Asset | First choice | Then | Never |
| --- | --- | --- | --- |
| Product visuals | real screens, labeled sample data | a rebuilt screen labeled illustrative | a fake dashboard shown as real |
| Photography | the brand's own shoot | a licensed library you can name | a stranger presented as a customer |
| Illustration and 3D | the brand's system | custom or generated from the brief, labeled | a generic character or blob unrelated to the product |
| Icons | the project's set | one set that matches the chosen icon style (for example Tabler, Iconoir, Phosphor, or Material Symbols), or a custom set drawn to that style | mixed sets, or one-off icons outside the style |
| Logos | official files from each owner; the product's own file (RX-AS-11) | the name in plain text, or [LOGO] | a redrawn, imitated, or invented logo; initials or an emoji as a mark; a generated favicon or app icon |
| Video | real product footage | a screen recording of the real product | stock footage implying use |
| Missing | a placeholder that looks like one (RX-AS-03) | | an invented stand-in |

Label every asset's provenance: observed (from the real product), sourced (licensed, with its
source), illustrative, generated, or inferred (a stand-in). See the evidence model in the router.

RYUX directs the generator; it is not the generator. Work context, goal,
audience, role, art direction, composition, then generate, critique the result against the brief,
and refine. A prompt without a brief is not art direction. Write the brief first:

\`\`\`
# Visual Brief
Role:           its job (explain, orient, demonstrate, emotion, identity, context, story)
Objective:      what the viewer must understand or feel
Audience:       who sees it, in which context
Emotion:        the feeling, in two or three words
Concept:        the visual thesis, in one sentence
Subject:        what is shown (the product concept, not a generic person or device)
Visual language: editorial / product-centric / technical / ..., and the art direction
Form:           shape language, geometric or organic, depth
Composition:    where the subject sits, and the space kept for copy
Color, material, lighting: from the product palette; surfaces; direction and softness
Motion:         level (L1 to L5) and personality
Output:         format, background, aspect ratios and sizes
Avoid:          the category clichés (for fintech: coins, money rain, floating dashboards)
Sources:        reference screen_ids or the analysis it came from
\`\`\`

A generated image is illustrative art; never present it as a real customer or a real product
screen (RX-UI-07).

**Illustration.** With no brand system to follow, write the style in five lines before the first
drawing (RX-UI-17), make a set together and compare it side by side (RX-UI-18), and ship it as SVG
coloured from tokens, with no text inside and alt text that says the meaning (RX-UI-19).

Does not cover: component reuse and tokens (see ryux-design-system).`,

  "design-system": `Prioritize the existing system. Before creating anything:

1. Search existing components.
2. Search existing tokens (color, spacing, radius, type, elevation).
3. Search existing patterns (how similar screens solve this).
4. Reuse if an existing component fits.
5. Extend with a variant if it almost fits.
6. Create a new component only for a real semantic or behavioral difference, and name why.

**Quality Locks** to keep across the product: spacing, typography, color roles, terminology,
components, interaction patterns and states, responsive behavior, and visual hierarchy.

Look for the existing system before defining one: DESIGN.md, a tokens or theme file in the repo, the
design file's variables and components, or a linked library. If the project has no system yet, define
the smallest token set the screen needs and use it consistently: color roles, a spacing scale, a
radius scale, and a type scale, not color alone. After rendering, count the literal values left and
convert them (RX-DS-03). Do not introduce a component library the project does not use.`,

  accessibility: `Accessibility is product quality, not an enhancement. Check:

- **Semantics**: real headings, landmarks, lists, buttons, links, labels.
- **Keyboard**: everything reachable and operable; focus order follows the visual order.
- **Focus**: visible on every interactive element; never removed without a replacement.
- **Contrast**: 4.5:1 for text, 3:1 for large text and component boundaries.
- **Targets**: at least 24×24px, preferably 44×44px on touch.
- **Names**: icon-only buttons and meaningful images have accessible names.
- **Forms**: labels tied to fields; errors tied to fields and announced.
- **Color**: never the only signal.
- **Motion**: honor reduced-motion settings.
- **ARIA**: only when native semantics cannot express it.

Report what was checked and how. Do not claim full conformance without an audit.`,

  responsive: `Responsive design is behavioral. When space decreases: **prioritize → simplify → reorganize**.
Do not squeeze everything into a smaller viewport.

| Element | On narrow screens |
| --- | --- |
| Content | keep the priority content first; move secondary content behind a control |
| Navigation | collapse to the few top destinations; keep the current location visible |
| Tables | priority columns, stacked rows, or scroll inside the table with the key column fixed |
| Forms | one column; keyboards that match the input |
| Actions | primary action within thumb reach; not hidden under the fold |
| Modals and drawers | full-screen or bottom sheet; close and primary action reachable |
| Text | keep the size; let it wrap; truncate only with access to the full value |

For each section, answer before building: what **changes**, what **stays**, what **disappears**,
what **reorders**, what becomes **scrollable**, what becomes **stacked**, and which **interaction**
changes (hover becomes tap, a side panel becomes a sheet)?

Example: a data table on desktop → on tablet, scroll horizontally inside the table or show the
priority columns → on mobile, a different information architecture: a list of rows as summary cards
that open a detail view.

Check the stated viewport and the smallest supported width (RX-RD-01 says how to pick it), and on
native the largest text size. No horizontal page scroll.`,

  frontend: `Connect design decisions to the code that ships them.

1. **Detect the stack first**: read package.json, the router, the styling approach, and two or
   three nearby components. Write in that stack. Do not assume React or Tailwind.
2. **Semantic HTML** and native controls before custom ones.
3. **Architecture**: follow the layers the repo already has. Components render; state lives close
   to where it is used; calculations, formatting, and validation live in pure modules; one layer
   talks to the API. Each piece of logic has one home: search before writing, never copy.
   Derived values instead of duplicated state.
4. **Tokens** instead of magic numbers; no duplicate styles.
5. **No invented logic**: prices, limits, and permissions come from data or are marked as
   assumptions.
6. **Dependencies** only when they clearly earn their weight.
7. **Performance**: sized and lazy-loaded media; no heavy libraries for small effects.
8. **Tests**: unit tests for pure logic with its edge cases, integration tests for critical flows,
   in the repo's own runner. Run them before claiming the work is done.

Does not cover: visual decisions (see ryux-ui) or component reuse decisions (see ryux-design-system).`,

  "visual-qa": `As an entry point, Visual QA is the Verify and deliver stage of the core workflow (SKILL.md)
for a build; Design and Build also use its loop in Build and critique. It asks one question: **did the implementation match the intended design?** Whether the
design itself is good is Critique's question (ryux-critique).

**With a reference** (a Figma or pen.dev frame, DESIGN.md, or an approved screenshot):
1. Capture the reference and the implementation at the same viewport (see the capture table in
   ryux-analyze).
2. Compare property by property: spacing, typography, color, size, position, components, states,
   responsive behavior.
3. Report each deviation:

\`\`\`
Area        | Expected (reference) | Actual (build) | Deviation       | Severity | Fix
Card radius | 16px                 | 8px            | half the radius | minor    | use radius-lg
\`\`\`

**Without a reference**, check the build against its own intent and the rules below.

**Loop**: implement → render → compare → fix → render again.

**Render with what is available**, in this order: the project's own preview or test setup;
\`npx playwright screenshot --viewport-size=1440,900 <url>\` (and 390 wide for mobile); a browser
tool; a design-tool export such as pen.dev \`Export\`. If none is available, say so in the gate.

${UNTRUSTED_CONTENT}

**Motion** (when anything opens, closes, or switches with an animation): a screenshot cannot show it,
so drive it in a real browser (the project's test setup or Playwright). For each animated element,
run four passes: open it; close it about 60 ms into the opening; open and close it three times
quickly; and all of it again with reduced motion (\`reducedMotion: 'reduce'\`). During each pass read
\`document.getAnimations()\` and the computed transition and animation, or watch a recording, and
check the motion rules already in force (RX-UI-11, RX-A11Y-08):
- a close mid-way turns back from where it is, with no jump to fully open and no restart;
- closing takes no longer than opening; entrances never use ease-in;
- only transform and opacity move; a menu grows from its trigger, a drawer from its own edge;
- what people open many times a day (menus, tabs) appears at once or with a short fade;
- reduced motion leaves a fade or a cut, no movement;
- after a dialog or drawer closes, focus is back on the control that opened it.
Then record the interaction and step through it frame by frame: look for broken or skipped frames,
a flash of the wrong theme, and layout that jumps; aim for 60 frames per second and count dropped
frames in a performance trace or the recording. For gestures (RX-IX-15), record a drag that is
caught mid-animation. Fix what fails and run the passes again. Report each animated element as Verified (passes run,
widths) or NOT VERIFIED (why); motion read only from code is NOT VERIFIED.

**Rank issues by impact**: blocks the task, misleads (wrong numbers, unclear action), adds friction,
polish.`,

  "anti-slop": `Anti-slop runs in Verify and deliver, after design, build, critique, and QA; it is the final
quality gate, never the
starting point. Anti-slop is the floor, not the ceiling: a tidy, generic surface still fails on expressive
surfaces (RX-AS-09), and the point of view comes from RX-UI-12. Anti-slop is not a list of banned
styles. It has three parts.

**Hard Gates**: reject or fix before delivery; no written exception. The list is generated below
from the rules.

**Purpose Gates**: these patterns are allowed when they have a purpose. For each one in the
result, ask three questions: **purpose** (what does it do?), **contribution** (what does it add to
understanding, interaction, or character?), and **necessity** (would something simpler do the
same?). "It looks more interesting" answers none of them; remove what fails.

**Quality Locks**: consistency that must hold across the product (listed below).

**Visual tells.** These are signals that a reason is missing, not banned styles. When you see one,
run the purpose gate; keep it when the answer is real, as in the last column.

| Tell | Why it hurts | Fix | Fine when |
| --- | --- | --- | --- |
| A blue-to-purple gradient wash behind everything | carries no meaning and appears on every AI page | color from the brand and its roles (RX-UI-10), or a plain surface | the gradient is the brand, or it encodes a value |
| A fake app, terminal, or agent window as the hero | the category default, often with invented output | a signature from the product's own idea; product UI only when real or labeled (RX-UI-12, RX-UI-07) | it is the real product with labeled sample data |
| Generic illustration: people with laptops, abstract blobs | unrelated to the product, so it steals attention and says nothing | a contextual illustration made from the brief, or no visual (RX-UI-07) | it explains a concept or an empty state words cannot |
| Floating devices and dashboard mockups | fake screens imply features and data | real screens with labeled sample data (RX-UI-07, RX-AS-01) | the screens are real and labeled |
| The template section order (hero, three cards, three-column pricing, four-column footer) | the page follows a template instead of what this content needs | order and form sections by what the reader needs next (RX-UI-05) | the content really has that shape |
| Identical feature cards in a row | equal boxes flatten priorities that are not equal | give the main point more weight; a list or one strong block (RX-UI-01) | the items are equal and compared side by side |
| A bento grid | a fashionable frame that hides which item matters | a layout from the content and its priority (RX-UI-05) | the items are independent and similar in weight |
| A typeface picked because it is in fashion | the same few faces on every generated page | a face chosen for the product's voice and legibility (RX-UI-10) | the brand already uses it |
| Monospace to look technical | mood instead of meaning; harder to read in prose | monospace only for code, IDs, and aligned numbers | it shows code, commands, or tabular figures |
| A sparkle or robot icon on every AI feature | says "AI" instead of what the feature does | an icon for the action, or none | the product's own AI mark, used once |
| A small badge above the headline that repeats it | a label that adds no information | cut it, or say something the headline does not | it carries real status: beta, new version, date |
| Endless floating, looping, or scroll-triggered motion | decorative motion with no reason, competing with the task | a single L4 moment with a message, or none (RX-UI-11) | it shows state, continuity, or the product's idea once |
| Glass, glow, and blur on every layer | decoration without a job that also lowers contrast | one surface treatment with a purpose (RX-AS-05, RX-A11Y-01) | one overlay needs to show what is behind it |
| Stock teamwork or handshake photos | borrowed people implying endorsement | real people with consent, or no people (RX-AS-02, RX-UI-13) | never as evidence of customers |
| Cards inside cards, surfaces on surfaces | every nesting level costs a border, a radius, and padding, and the grouping stops meaning anything | one container per real group; separate inside it with spacing or a divider (RX-UI-01) | the inner surface is a distinct object the user acts on, such as a selectable option |
| Every group boxed in the same white bordered card | the stack of equal boxes flattens priority and reads as a template | one container for the decision the user makes; other groups flat, with a heading and a divider (RX-UI-01) | each box is a selectable option the user compares |
| One "safe" accent on white with neutral grey everything | the default palette of generated UI; nothing in it is the brand's | colour temperature and surface tone chosen from the product's character (RX-UI-10) | the brand already defines it |
| A placeholder map: grey, or flat blocks in any colour without streets or names | reads as unfinished, and the map is the product's core visual | a styled map with streets, labels, and the route rendered in the brand palette | wireframe stage, labeled as such |
| A stub device status bar (the time and one icon) | the mockup reads as unfinished at first glance | the platform's full status bar (time, signal, Wi-Fi, battery), or no device chrome at all | the frame is a wireframe, labeled as such |
| Every content object drawn as the same icon in a different colour (book covers, place photos, products) | the screen reads as a template, and detail screens lose their main visual | a sample image slot shaped like the real asset (cover ratio, photo crop), labeled sample data (RX-UI-07) | the product really has no imagery for that object |
| Question headings by default ("Where to?", "What are you sending?") on every step | a generated voice once it repeats; the step's label says less than a plain noun would | a plain label for the field or step; a question only where it is clearest | it is the market's convention, with an observed screen (RX-PR-04) |
| One record split into a grid of cards | details that are read together (an order, a profile, a transaction) are scattered into equal boxes | one block with labeled rows or a table (RX-UI-05) | each card is a separate item the user compares or acts on |
| A dashboard of KPI tiles and charts that answer no question | decoration in place of the decision the screen supports | lead with what needs attention and the next action; dense tables where people scan (RX-UI-01, RX-UX-01) | each tile drives a decision and links to its detail |
| Display-size headings on task UI | a hero-sized title pushes the data and the action below the fold | a heading sized for its rank in the page (RX-UI-01, RX-UI-03) | it is the single message of a marketing or brand page |
| A landing-page layout for a product screen | hero, feature rows, and a closing CTA on an app screen, a settings page, or a tool | the structure the task needs: list, detail, form, or workspace (RX-UI-05) | the surface really is marketing |`,
};
