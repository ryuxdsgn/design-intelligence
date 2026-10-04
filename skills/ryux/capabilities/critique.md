# RYUX Critique

> Get a senior design critique before your users do.

Critique answers "does this interface make sense, and what should change first?" It judges
decisions; it is not Analyze (what exists) or QA (does the build match its design). It is an
orchestrator, not a pile of rules: it analyzes the design, reasons with the RYUX knowledge modules,
pulls evidence from RYUX Knowledge, and reports findings someone can act on.

```
Critique
     ↓
Analyze                   what is actually there
     ↓
knowledge modules         ux, ui, interaction, forms, content, accessibility,
                          responsive, design-system, edge-cases, anti-slop
     ↓
RYUX Knowledge            real product screens (search_screens, heuristic_eval)
     ↓
findings
```

## Principles

1. **Review what you can see.** Capture the real design first. Never review from a description
   alone when the source is reachable.
2. **Read-only.** Do not edit the Figma file, the pen.dev document, or the site.
3. **Evidence over taste.** Every finding names its source; severity 3 or more needs a real
   comparison `screen_id` when the ryux MCP is connected.
4. **Honest scope.** A static frame shows no hover, focus, loading, or narrow widths. Say what was
   not tested, and lower the confidence of anything inferred.
5. **Concise and prioritized.** At most 12 findings; the ones that hurt users most come first.

## Steps

### 1. Context

Who the user is, what task happens on this screen, the platform, and the point in the flow. If the
request does not say, infer it from the design and list it as an assumption.

### 2. Analyze first

Run Analyze (`capabilities/analyze.md`: capture plus inventory) or reuse an analysis that already exists. Its
labeled inventory (Measured, Observed, Inferred) is what the findings point at. For a quick
critique, capture the design with this table and note what you saw:

| Source | How to capture | If it is not available |
| --- | --- | --- |
| Figma link (`figma.com/design/<fileKey>/...?node-id=1-2`) | Figma MCP: `get_screenshot` with the file key and node id (turn `1-2` into `1:2`) for the image; `get_metadata` for the frame tree; `get_design_context` and `get_variable_defs` for text, components, and variables (measured values) | Ask for a PNG export of the frames, or for the Figma MCP to be connected |
| pen.dev design | pencil MCP: `get_app_state` to list frames; `execute` with `TakeScreenshot([frameId])` for the image, and a `Get` visitor that prints text nodes, node properties (fonts, sizes, fills, gaps), and any `ctx.problems` (clipped content) | Ask for an exported PNG |
| Website URL | `npx playwright screenshot --full-page --viewport-size=1440,900 <url> desktop.png` and `--viewport-size=390,844` for mobile; a browser tool for interaction states (hover, focus, an error) when one is available; the page HTML and CSS for headings, labels, alt text, landmarks, and declared values | Ask for screenshots at desktop and mobile width |
| Screenshot or image | Read the image directly | none |
| Code only | Render it first (see `capabilities/qa.md`) | Work from the code and state that it was not rendered |

Stay read-only: do not edit the Figma file, the pen.dev document, or the site. Record what you
captured: the frames or URLs, the viewports, and the tools.

### 3. Design Read

Rate each dimension **Strong**, **Adequate**, or **Weak**, with one sentence of reason.

| Dimension | Question |
| --- | --- |
| Clarity | Can the user understand what this screen is for? |
| Hierarchy | Can the user identify what matters first? |
| Coherence | Does it feel like part of the same product? |
| Density | Is the information density right for how often and how carefully it is used? |
| Confidence | Does the user have enough information to act safely (cost, consequence, status)? |
| Efficiency | Can the task be done without unnecessary work? |
| Specificity | Does it feel designed for this product, or could it belong to any generic SaaS app? |
| Recoverability | Can users recover from mistakes and failures? |
| Accessibility | Can people with different abilities and input methods operate and understand it? |

### 4. Fact check

List every product fact the design states: names of features, tools, and commands, integrations,
supported platforms, numbers, dates, prices, people, and claims. Mark each one sourced (the brief,
the repo, the product's docs, a screen_id) or unsourced. Every unsourced fact is a finding under
RX-PR-02 or RX-AS-01, even when it looks plausible, and even inside a sample or example panel.

### 5. Evaluate by category

Read the knowledge modules that apply and walk the design with their rules. [Required] rules are the
gate, [Preferred] rules need a reason when broken, and [Contextual] rules count only when their
situation is present. Use their "Not when" lines so a rule is not applied mechanically.

| Category | Skill | Look for |
| --- | --- | --- |
| Product | `knowledge/product.md` | stated purpose, one primary action, invented facts |
| UX | `knowledge/ux.md` | structure, wayfinding, grouping, disclosure, steps |
| Interaction | `knowledge/interaction.md` | before, during, result, recovery; confirm or undo; cost upfront; local payments |
| Forms | `knowledge/forms.md` | labels, validation, input kept, submission states |
| Content | `knowledge/content.md` | specific labels, errors, terminology, Rupiah, dates and numbers |
| UI | `knowledge/ui.md` | hierarchy, scale, color roles, density; each visual's job, composition around the copy, motion level; the result against its Visual Brief when there is one |
| Design system | `knowledge/design-system.md` | consistency, tokens, component states |
| Accessibility | `knowledge/accessibility.md` | contrast, targets, focus, names, color alone |
| Responsive | `knowledge/responsive.md` | what changes, stays, disappears, or stacks across widths |
| Edge cases | `knowledge/edge-cases.md` | empty, error, loading, long text, permissions |
| Anti-slop | `knowledge/anti-slop.md` | invented numbers or people, fake urgency, unjustified decoration |

### 6. Evidence from RYUX Knowledge

With the ryux MCP connected, find 1 to 3 comparison screens for each major finding with
`search_screens`, then send the findings to `heuristic_eval` (`task_context` + `findings`).
Its `heuristic` field takes the Nielsen codes `H-01` to `H-10`; map each finding and name the
RYUX rule in `issue`:

| Category | Map to |
| --- | --- |
| Edge cases, interaction feedback | `H-01` visibility of system status |
| Content, the user's words | `H-02` match with the real world |
| Exits and wayfinding | `H-03` user control and freedom |
| Design system, accessibility | `H-04` consistency and standards |
| Confirm or undo, forms | `H-05` error prevention |
| Recognition | `H-06` recognition rather than recall |
| Shortcuts | `H-07` flexibility and efficiency |
| UI decoration, anti-slop | `H-08` aesthetic and minimalist design |
| Error messages and recovery | `H-09` error recovery |
| Help | `H-10` help and documentation |

The tool rejects major findings without valid evidence, caps the list at 12, and returns PASS or
FAIL. Without the MCP, say the evidence comes from the design and standards alone.

### 7. Report

Each finding uses this schema:

| Field | Content |
| --- | --- |
| ID | C-01, C-02, ... |
| Severity | 0 not a problem · 1 cosmetic · 2 minor · 3 major · 4 catastrophic |
| Category | one of the categories above |
| Finding | where it is and what the problem is |
| Evidence | what you saw: the capture, a measured value, a comparison screen |
| Impact | who is affected, in which task, and how badly |
| Recommendation | a concrete fix |
| Confidence | High (seen directly), Medium (partly seen, such as one width), Low (inferred) |
| Source | the RYUX rule ID, plus a screen_id, a standard (WCAG SC), or "this design" |

```
Verdict: one sentence (what works, the biggest risk)

What was reviewed and how
  Source:      Figma frame "Checkout" (node 1:2) / https://... / pen.dev frame "..."
  Analysis:    `capabilities/analyze.md`, desktop 1440 and mobile 390, via Playwright
  Not tested:  hover and focus states, live data, screen reader

Design Read
  Clarity       Strong    · ...
  Confidence    Weak      · ...
  (all nine)

Findings (most severe first, at most 12)
  C-01 · severity 3 · Interaction · confidence High
    Finding:         Payment confirmation shows no status while verifying
    Evidence:        no loading or progress element in the frame (Observed)
    Impact:          buyers paying by QRIS may tap twice and pay twice
    Recommendation:  show status with a time estimate; disable the button while verifying
    Source:          RX-IX-02; scr_demo_001

What works (keep it)
  - ...

Fix priorities
  1. C-01 ...
```

## Don'ts

- Don't review a design you have not captured when it is reachable.
- Don't edit the source file while reviewing.
- Don't give a finding without a location, a source, and a reason.
- Don't raise severity to major without evidence, or claim "app X does this" without a `screen_id`.
- Don't mark an inferred issue High confidence.
- Don't paste generic advice ("modernize", "add white space") without a real problem.
- Don't call the result "fully accessible" or "UX optimized"; say what was checked.
