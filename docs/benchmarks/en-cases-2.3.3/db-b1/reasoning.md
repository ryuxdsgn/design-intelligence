# EN-DB-B1 · Home dashboard, first login: design reasoning

pen.dev frame: `Ukmeh` ("EN-DB-B1 · Dashboard") in ryux.pen, at x 64740, to the right of all existing content (no overlaps checked).
It holds four screens: 1 Default 1440x900, 2 Smallest width 390, 3 Loading 1440, 4 Error 1440.

RYUX route: Design capability. Knowledge read: product, ux, edge-cases, responsive, design-system, frontend, ui, content, anti-slop, plus capabilities/qa.md.
Evidence: the ryux MCP was not connected, so no reference screens were used. Every pattern choice below is a judgment call (evidence None), based on the brief and general standards.

## Context (from the brief, after asking)
- Who: a team lead or member at a small company, on desktop, who has just signed up and created a workspace.
- State: the workspace has no projects, tasks, or teammates. The only data is the user's name and the workspace name.
- Actions available: Create a project, Invite teammates, Import from a CSV file.
- Not decided: product name, brand, design system, navigation, feature set, metrics, market.
- Design intent: the user understands that the page is empty because nothing exists yet (not because something broke), knows the one thing to do first, and sees the other two ways in.
- How we would know it worked: the share of new workspaces that create or import a first project in the first session (not measured; no data exists).

## Key decision: what a dashboard is when there is no data
Decision Receipt
- Decision: the first-login home page is a getting-started surface, not a dashboard with empty widgets.
- Options: A) a standard dashboard with zero-value widgets and charts; B) three equal cards (create / invite / import); C) one primary start action, two secondary routes, and a quiet outline of what the page will hold.
- Evidence: None (no ryux MCP). Edge-cases rule: "For first use and zero data, explain what will appear and give one action to start."
- Confidence: Medium.
- Why C: A would show invented metrics and empty charts (Hard Gate RX-AS-01, and it says nothing). B breaks one primary action (RX-PR-03). C gives one clear first move and still lets people coming from spreadsheets or with a team get started.
- Trade-off: the page does not look like the dashboard it will become; the "What this page will show" row bridges that gap.
- Assumption: creating a project is the most valuable first step. Import is the alternative for people who already track work; inviting is less useful before there is anything to share.

## Hierarchy
1. Greeting with the user's and workspace's names, saying plainly that nothing is here yet.
2. Start panel: "Create a project" is the only filled (accent) button on the page.
   Right column: "Import from a CSV file" (outlined secondary) and "Invite teammates" (text link, tertiary).
   Each one is framed by the question it answers ("Already tracking work in a spreadsheet?", "Working with others?") so users can tell which applies to them.
3. "What this page will show": outlined, unfilled slots for Projects, Tasks, and Team. Each says what will appear and where it comes from. The Team slot already lists "Dana (you)" because that data exists.
   These three slots are equal on purpose: they are peers, and none is more important before data exists (the RX-UI-01 exception for comparable items). They have no fill so they don't compete with the start panel.

## What I deliberately did not draw
- No sidebar or navigation beyond Home: navigation and features are not decided (RX-PR-02, RX-AS-06).
- No search, notifications, charts, progress meters, checklists, or "0 of 3" counters: not requested, and they would be invented mechanics or numbers.
- No illustration: it would have no job beyond decoration, and no brand exists to draw from.
- No product name or logo: "[Product name]" is a visible placeholder (RX-AS-03).
- "Dana" and "Harbor Studio" are sample values, labeled as such on the board.

## UI direction
- Character: calm, plain, and work-focused. This is a tool people will use every day, so the first screen sets that tone rather than a marketing one.
- Type: Instrument Sans. Headline 36/600, panel title 22, body 15 to 17, labels 13 to 14.
- Color roles, as `dbb1-*` variables: warm paper background #F7F6F3, white surfaces, ink #1C1B19, secondary text #57554F, lines #E3E0D8, outline #B9B4A9, accent #16594A (used only for the primary action, the eyebrow, and the tertiary link), danger #A3321F (error icon only).
- Spacing on a 4/8 scale: 16 inside groups, 32 to 36 between sections. The content column is 1056px wide and centered.
- Signature: the page shows the outline of its future contents. Filled surfaces are what you can act on now; outlined slots are what's coming. This comes from the product's own state (an empty workspace), not from a category default.
- Icons: Lucide only, always next to a text label.

## States
- Default: designed at 1440x900.
- Loading: the top bar shows the workspace and user, which are known from sign-up. The rest is a skeleton with the same structure as the content, plus a visible "Loading your home page…" so the skeleton is not the only signal.
- Error: what happened and how to recover, with a single "Try again" button. The greeting stays because that data is local. I made no claim about whether the data is safe, because that behavior was not specified.
- Partly filled (after the first project) and the creation, import, and invite flows: not designed. They are separate surfaces, and their behavior is not decided.
- Interaction: "Create a project", "Import from a CSV file", and "Invite teammates" each open their own flow, and none of those flows is decided. A button's in-progress state is needed only if opening its flow takes time. In-flow success and failure belong to those flows.

## Responsive
- 1440 (stated): two-zone start panel, with the three slots in a row.
- 390 (smallest width designed): everything stacks in one column. The primary button is full width and 48px tall, the secondary and tertiary actions have 44px targets, and the slots become one outlined list. Text size stays the same, and nothing scrolls sideways.
- 1024 and 320 were not drawn. At 1024 the 1056 column must shrink to fit with 32px gutters; the start panel can stay two-zone down to about 900, then stack.

## Accessibility (checked by hand, no automated tool)
- Contrast: ink on the background is about 16:1. Secondary text is about 7:1 on the background and 7.4:1 on white. White on the accent is about 8:1.
- Known weakness: the #B9B4A9 outline on the secondary button is about 2:1 against white. The button's label carries its meaning, but if the button must be recognizable from its border, darken it to about #8C877C (3:1).
- The tertiary link is underlined, so it doesn't rely on color.

## Delivery Gate
PRODUCT        PASS · one primary action; only the brief's three actions and two data fields are used · evidence None
UX             PASS · empty state explains what will appear and gives one action to start; secondary routes are framed by when they apply
UI             PASS · one focal point (the primary button); point of view: "outline of what's coming" (filled = act now, outlined = later)
DESIGN SYSTEM  PASS · no system existed; the smallest token set is defined as dbb1-* variables and reused across all four screens
ACCESSIBILITY  PASS · text contrast is 7:1 or more, by hand; the secondary button outline is about 2:1 (noted, not text)
RESPONSIVE     PASS · 1440 and 390 designed; 1024 and 320 described but not drawn
EDGE CASES     PASS · default (empty), loading, and error designed; partly filled and the action flows are out of scope and not decided
CODE QUALITY   N/A · no code
VISUAL QA      PASS · rendered with pen.dev TakeScreenshot and Export; no overlap with other frames, verified by a bounds check
ANTI-SLOP      PASS · no invented numbers, people, features, or nav; placeholders are labeled. Swap test: the layout is a generic but honest empty state; the signature is restrained by choice for task UI
FINAL          PASS
