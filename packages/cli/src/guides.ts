// Hand-written framework text for each Ryux skill: the questions, decision trees, and templates an
// agent reasons with. Rules (Do / Do not / Why) are generated from content.ts and appended below
// each guide by render.ts. Keep each guide short; the core is loaded on every task.

import type { SkillId } from "./content.js";

export const CORE_POSITIONING = `Ryux is a design intelligence layer for AI and designers: it helps understand, build, evaluate,
and fix interfaces through design reasoning. It is not a UI generator, an anti-slop framework, or
a design system.`;

export const CORE_CAPABILITIES = `| Capability | When | Load |
| --- | --- | --- |
| **Analyze** | understand an interface that exists | \`ryux-analyze\` |
| **Build** | create or change UI, copy, or frontend code | the workflow below and the task table |
| **Critique** | evaluate a design, page, or flow | \`ryux-critique\` |
| **QA** | verify what was just built | \`ryux-visual-qa\` |

Skill roles: **core** is the operating system; **knowledge** skills (product, ux, interaction,
forms, edge-cases, content, ui, design-system, accessibility, responsive, frontend) say how to
reason; **capability** skills (analyze, critique) are workflows; **gate** skills (visual-qa,
anti-slop) verify and filter. Ryux Knowledge is the evidence layer for all of them. Every
capability ends at the Anti-Slop Quality Gate: the Hard Gates below and the Delivery Gate.`;

export const CORE_PRINCIPLE = `Do not optimize for visual novelty. Optimize for clarity, usability, consistency, product fit,
accessibility, and intentional decisions. Understand the context before deciding; separate observed
facts from assumptions; prefer evidence over aesthetic preference; do not invent requirements;
explain meaningful decisions with their trade-off; validate before claiming.`;

export const CORE_WORKFLOW = `Request → understand context → understand the product problem → define UX structure → define
interaction → define UI → apply the design system → implement → inspect (render) → critique →
refine → Delivery Gate → done.

Skip steps that do not apply to the task, but never skip from "generate" straight to "done".`;

export const CORE_HONESTY = `Report what was checked, how, and what was not available. Do not claim "pixel perfect",
"fully accessible", "production ready", "senior-level", or "UX optimized" without evidence. Say
"Keyboard and focus checked by hand; no automated accessibility test was available" instead.`;

export const CORE_DECISION_RECORD = `For meaningful deviations only (from a rule, the design system, or a reference screen), write
four lines: **Decision**, **Reason** (with a screen_id or "judgment call"), **Trade-off**, and
**Alternative** considered. Skip trivial decisions.`;

export const GATE_RULES = `- Each area is PASS, FAIL, or N/A (with a reason when the area does not apply).
- An area FAILS when a [Required] rule in its skills fails without a written exception.
- A Hard Gate failure cannot be excepted: fix it before declaring the work complete.
- VISUAL QA cannot PASS without a render when a render tool is available; say which tool was used.
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
disabled (with a reason), loading, success, error. Keyboard: every action is reachable; Enter
submits; Escape closes.

Does not cover: form-specific behavior (see ryux-forms).`,

  forms: `A form is a conversation. Design it field by field, then as a whole.

- **Grouping**: related fields together, with a group label when there are more than a few.
- **Labels**: visible and tied to the field; placeholders are examples, not labels.
- **Layout**: one column for sequential input is the default; put short related fields side by
  side when people read them as one unit. Decide by relationship, not by filling width.
- **Required and optional**: mark whichever is less common.
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

For each case that can happen, decide what the user sees and what they can do next. Cases that
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
- **Indonesian** as users speak it; English only for terms they already use.
- **Money**: Rp1.250.000.
- **Dates, times, numbers**: 2 Okt 2026, 14.30 WIB, 1,5, 12.500, +62 812-3456-7890.
- **Offers and terms**: write only the terms you were given. Unknown minimums, quotas, deadlines,
  and codes stay placeholders (\`[minimal belanja]\`, \`[tanggal selesai]\`); do not add "kuota
  terbatas" or "sebelum kehabisan" unless a real limit was stated (RX-AS-04, RX-PR-02).

Does not cover: layout of the text (see ryux-ui).`,

  ui: `Separate functional UI from decorative UI. Functional UI helps the user read, decide, or act.
Decorative UI needs a stated reason (see the purpose gates in ryux-anti-slop).

Work in this order:
1. **Hierarchy**: what is read first, second, third? The primary action and key information win.
2. **Layout and alignment**: a shared grid; groups by meaning; consistent edges.
3. **Spacing and type**: one scale; size and weight carry hierarchy, not color alone.
4. **Density**: compact for repeat work, roomier for first-time or high-stakes decisions.
5. **Color**: roles first (surface, text, accent for the primary action, status); contrast checked.
6. **Containers**: use a container only when it groups or separates something.
7. **Icons**: next to labels, from one set, at consistent sizes.
8. **Motion**: only to explain change; short; never blocking.

**Justify values.** Every value comes from the scale and has a reason you can say in one line:
"12px between these two fields because they belong together; 24px before the next group because it
is a new topic." Tighter inside a group, looser between groups; density follows the task. If you
cannot say why 8 and not 12, the choice is not a decision yet.

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
3. **Components** split by responsibility; state close to where it is used; derived values
   instead of duplicated state.
4. **Tokens** instead of magic numbers; no duplicate styles.
5. **No invented logic**: prices, limits, and permissions come from data or are marked as
   assumptions.
6. **Dependencies** only when they clearly earn their weight.
7. **Performance**: sized and lazy-loaded media; no heavy libraries for small effects.

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

  "anti-slop": `Anti-slop is not a list of banned styles. It has three parts.

**Hard Gates**: reject or fix before delivery; no written exception. The list is generated below
from the rules.

**Purpose Gates**: these patterns are allowed when they have a purpose. For each one in the
result, ask **"Why does this exist?"** If there is no meaningful reason, remove it.

**Quality Locks**: consistency that must hold across the product (listed below).`,
};
