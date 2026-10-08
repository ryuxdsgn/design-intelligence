// Hand-written framework text for each RYUX skill: the questions, decision trees, and templates an
// agent reasons with. Rules (Do / Do not / Why) are generated from content.ts and appended below
// each guide by render.ts. Keep each guide short; the core is loaded on every task.

import type { SkillId } from "./content.js";

export const CORE_POSITIONING = `RYUX is a design intelligence layer for AI and designers. It helps understand, reason, design,
build, critique, and verify interfaces using design knowledge and evidence. It is not a UI
generator, an anti-slop framework, a design system, or a prompt library.

**Understand before you design. Don't design from imagination when evidence is available.**

\`\`\`
Analyze → Design → Build → Critique → QA → Anti-Slop (final gate) → done
\`\`\``;

export const CORE_CAPABILITIES = `Tell RYUX what you are doing; RYUX decides what it needs to know. Pick the entry point, read its
file, then read only the knowledge modules the task needs (task table below). Paths are relative
to this skill's folder.

| Entry point | When | Read |
| --- | --- | --- |
| **Analyze** | understand a screen, product, or flow that exists | \`capabilities/analyze.md\` |
| **Design** | create or improve UI and UX without code: Figma, pen.dev, mockups, copy | \`capabilities/design.md\` |
| **Build** | implement or change the interface in code | \`capabilities/build.md\` |
| **Critique** | find what should change first, and why | \`capabilities/critique.md\` |
| **QA** | verify a build against the intended design | \`capabilities/qa.md\` |

Knowledge modules (\`knowledge/\`): product, ux, interaction, forms, edge-cases, content, ui,
design-system, accessibility, responsive, frontend, and anti-slop. Evidence comes from the brief, the
project, product data, standards, and the ryux MCP when connected; none is required. Every entry point ends at the quality gates: the Hard
Gates below and the Delivery Gate, with anti-slop as the last check, never the starting point.

Keep the capabilities apart; do not collapse them into one generic "design" answer:

| Capability | Answers | Example |
| --- | --- | --- |
| Analyze | What exists? | "The screen uses a 24px horizontal container." (observed) |
| Design | What should we do, and why? | "Keep 24px: it matches the existing layout system." |
| Critique | Is this decision right? | "24px leaves the table too sparse at 1440 for daily use." |
| QA | Does the build match the intent? | "The build uses 16px where the design says 24px." |`;

export const CORE_PRINCIPLE = `Do not optimize for visual novelty. Optimize for clarity, usability, consistency, product fit,
accessibility, and intentional decisions. Understand the context before deciding; separate observed
facts from assumptions; prefer evidence over aesthetic preference; do not invent requirements;
explain meaningful decisions with their trade-off; validate before claiming.`;

export const CORE_WORKFLOW = `1. **Understand the request**: who, what task, which product and market (RX-PR-01). Read the
   RYUX project context in DESIGN.md first when it exists; do not guess what it leaves blank. Ask
   only when the answer would change a major decision (at most three, usually none), and assume
   the rest visibly. DESIGN.md answers are direction, not evidence of what users need.
2. **Pick the entry point** and read its file.
3. **Select knowledge**: read the modules the task table lists, and no others.
4. **Gather evidence**: reference screens through the ryux MCP when connected; otherwise say so.
5. **Reason**: decide with evidence (RX-PR-09, RX-PR-10); on expressive surfaces, set a point of
   view first (RX-UI-12).
6. **Produce**, then render and inspect what you made.
7. **Run the gates**: Hard Gates and the Delivery Gate, with honest claims.

Skip steps that do not apply, but never go from "generate" straight to "done".`;

export const DESIGN_BODY = `# RYUX Design

> What should we design, and why? Design is the bridge between Analyze and Build. It works without
> code (Figma, pen.dev, a mockup, the copy) and ends in a Design Direction that Build follows.

## Workflow

1. **Context.** Who, what task, which product and market, and the design intent
   (knowledge/product.md). Take it from the prompt, then DESIGN.md, then knowledge and evidence.
   Ask only when a missing answer would change a major decision: those questions alone, at most
   three, in one message, before designing. Complete context means no questions. Never ask what
   the prompt or DESIGN.md already answers; write the rest down as assumptions (RX-PR-01).
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

\`\`\`
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
Asset direction per asset: purpose, source, style, composition, context, consistency, usage,
               avoid, provenance (observed, sourced, illustrative, generated, inferred)
Responsive     what changes, stays, disappears, or stacks at each width

Assumptions    everything guessed, visible
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
\`\`\`

Evidence names its count and never generalizes past it. "Evidence None, Confidence Low, Why:
business priority was not provided" is a valid receipt; keep it visible instead of upgrading it.

Visual, motion, and asset rules and tables live in knowledge/ui.md (RX-UI-07 to RX-UI-13); this
direction only records the choices made with them.`;

export const BUILD_BODY = `# RYUX Build

> Implement or change the interface in code, faithfully and in the repo's own stack.

1. **Read the repo first**: the stack, components, tokens, conventions, the architecture already
   used (where components, state, pure logic, and data access live), and the test runner
   (knowledge/frontend.md, knowledge/design-system.md). Reuse before creating.
2. **Find the design source**: the Design Direction, a Figma or pen.dev design, a DESIGN.md, or an
   approved mockup; it is the spec. If there is none, run Design first (capabilities/design.md)
   instead of inventing one in code.
3. **Read the modules the task needs** from the task table: for example accessibility, responsive,
   and edge-cases for any UI, and forms and content for a form.
4. **Implement faithfully.** Use semantic elements, existing components, and real data paths.
   Build must not invent business rules, prices, or limits; API behavior or response shapes; or
   data presented as real (RX-FE-02, RX-PR-02). It must not silently change a design decision: a
   change goes back to Design as a new Decision Receipt. Mark every assumption in the code. Give
   each piece of logic one home in the repo's existing layers, never a copy (RX-FE-13).
5. **Test what can break.** Unit tests for new or changed pure logic, edge cases included;
   integration tests for critical flows such as checkout, payment, and form submit. Use the
   repo's runner; with none, propose one and ask before adding it (RX-FE-14).
6. **Render and verify.** Run it and the tests, check every width and state, and fix deviations
   from the design (capabilities/qa.md).
7. **Close with the Delivery Gate.** CODE QUALITY and VISUAL QA need real checks (typecheck,
   tests, render), or say what was not run.`;

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
"Keyboard and focus checked by hand; no automated accessibility test was available" instead.`;

export const CORE_DECISION_RECORD = `For consequential choices (RX-PR-09) and deviations, write **Decision**, **Options** compared, **Evidence**,
**Trade-off**, and **Choice**. Evidence is Strong (2+ comparable screen_ids), Thin (one, or another context),
or None (no screen_id: a judgment call). With None on a consequential choice, show options or ask (RX-PR-10).`;

export const GATE_RULES = `- Each area is PASS, FAIL, or N/A (with a reason when the area does not apply).
- An area FAILS when a [Required] rule in its skills fails without a written exception.
- A Hard Gate failure cannot be excepted: fix it before declaring the work complete.
- VISUAL QA cannot PASS without a render when a render tool is available; say which tool was used.
- CODE QUALITY cannot PASS while changed logic has no test run; say which checks ran (typecheck, tests).
- FINAL is PASS only when no area is FAIL.`;

export const GUIDES: Record<SkillId, string> = {
  product: `Answer these before any layout exists. Write the answers down; they are the brief.

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
1. **Concept**: write three directions first (name, concept, signature), then choose one. The idea
   comes from the product itself, not from the category: a tool about evidence might use receipts,
   citations, and marks of proof; a calm finance app might use the ledger. The category default
   (a terminal panel for developer tools, a dashboard screenshot for SaaS) is never the signature.
2. **Signature**: one element that carries the concept and that people would remember. Choose the
   lever: type (scale contrast, a distinctive face), composition (a broken grid, an unexpected
   crop, a large number), art direction, color temperature, motion personality, or copy voice.
3. **System**: everything else stays quiet and consistent so the signature reads.
Then run the swap test (RX-AS-09): with a competitor's name and logo, would anything need to change?
If not, the surface has no point of view yet. Stay honest while being bold: a strong idea never
needs invented numbers, people, or logos.

**3. Motion.** Start from purpose: what the motion communicates; with no purpose, no motion.
Every motion follows one lifecycle: before, trigger, transition, new state, feedback.
The states themselves (waiting, result, recovery) are defined in ryux-interaction (RX-IX-01,
RX-IX-02); motion only makes them visible, and it never compensates for weak UX. Decide the trigger,
duration, easing, distance, opacity or scale, and how several elements are choreographed. Define
duration and easing once as motion tokens, and animate transform and opacity rather than layout
properties (width, height, top, margin), which cause jank.

| Level | Examples | Needs |
| --- | --- | --- |
| L1 State feedback | button press, checkbox, toggle | nothing beyond being fast (about 100 to 200 ms) |
| L2 Component transition | dropdown, modal, drawer, tooltip | shows where something came from or went |
| L3 Page transition | navigation, route change | keeps the user oriented between places |
| L4 Storytelling | onboarding, product introduction, marketing | a message that is clearer moving than still |
| L5 Decorative | background particles, floating elements | a brand reason, and never delaying content or input |

Pick one **motion personality** per product and derive timing and easing from it:

| Trait | Calm (banking) | Energetic (game) |
| --- | --- | --- |
| Character | calm, precise | energetic, playful |
| Speed | moderate | fast |
| Easing | smooth ease-out | spring |
| Movement | short, controlled | larger, expressive |
| Expression | subtle | high |

With reduced motion requested, large movement becomes a fade or a cut (RX-A11Y-08).

**4. Visual production.** Decide where each asset comes from before making anything (RX-UI-13):

| Asset | First choice | Then | Never |
| --- | --- | --- | --- |
| Product visuals | real screens, labeled sample data | a rebuilt screen labeled illustrative | a fake dashboard shown as real |
| Photography | the brand's own shoot | a licensed library you can name | a stranger presented as a customer |
| Illustration and 3D | the brand's system | custom or generated from the brief, labeled | a generic character or blob unrelated to the product |
| Icons | the project's set | one open-source set (for example Lucide or Phosphor) | mixed sets or hand-drawn one-offs |
| Logos | official files from each owner | the name in plain text | a redrawn or imitated logo |
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

If the project has no system yet, define the smallest token set the screen needs and use it
consistently. Do not introduce a component library the project does not use.`,

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

Check the stated viewport and the smallest supported width. No horizontal page scroll.`,

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

  "visual-qa": `Visual QA asks one question: **did the implementation match the intended design?** Whether the
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

**Rank issues by impact**: blocks the task, misleads (wrong numbers, unclear action), adds friction,
polish.`,

  "anti-slop": `Anti-slop runs last, after design, build, critique, and QA; it is the final quality gate, never the
starting point. Anti-slop is the floor, not the ceiling: a tidy, generic surface still fails on expressive
surfaces (RX-AS-09), and the point of view comes from RX-UI-12. Anti-slop is not a list of banned
styles. It has three parts.

**Hard Gates**: reject or fix before delivery; no written exception. The list is generated below
from the rules.

**Purpose Gates**: these patterns are allowed when they have a purpose. For each one in the
result, ask **"Why does this exist?"** If there is no meaningful reason, remove it.

**Quality Locks**: consistency that must hold across the product (listed below).

**Visual tells.** These are signals that a reason is missing, not banned styles. When you see one,
ask the purpose question; keep it only if the answer is real.

| Tell | Why it hurts | Fix |
| --- | --- | --- |
| A blue-to-purple gradient wash behind everything | carries no meaning and appears on every AI page | color from the brand and its roles (RX-UI-10), or a plain surface |
| A fake app, terminal, or agent window as the hero | the category default, often with invented output | a signature from the product's own idea; product UI only when real or labeled (RX-UI-12, RX-UI-07) |
| Generic illustration: people with laptops, abstract blobs | unrelated to the product, so it steals attention and says nothing | a contextual illustration made from the brief, or no visual (RX-UI-07) |
| Floating devices and dashboard mockups | fake screens imply features and data | real screens with labeled sample data (RX-UI-07, RX-AS-01) |
| Endless floating or looping motion | decorative motion with no reason, competing with the task | a single L4 moment with a message, or none (RX-UI-11) |
| A bento grid or three equal feature cards | a template that flattens hierarchy | a layout from the content and its priority (RX-UI-05, RX-UI-01) |
| Glass, glow, and blur on every layer | decoration without a job that also lowers contrast | one surface treatment with a purpose (RX-AS-05, RX-A11Y-01) |
| Stock teamwork or handshake photos | borrowed people implying endorsement | real people with consent, or no people (RX-AS-02, RX-UI-13) |`,
};
