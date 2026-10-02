// Content bundled with the ryux-rules CLI. Original ryux.design work (MIT licensed), written from
// scratch on top of public standards and research: Nielsen's 10 heuristics (1994), NNGroup UX
// research, WCAG 2.2, Apple HIG, Material Design, and findings from ryux's own agent runs.
// Single source of truth: skills, Cursor rules, AGENTS.md, and the generated sections of
// docs/design-rules.md all come from this file and guides.ts (pnpm sync:skills).

export type Level = "required" | "preferred" | "contextual";
export type Gate = "hard" | "lock";
export type GroupId = "foundation" | "ux" | "ui" | "engineering" | "quality";
export type GateArea =
  | "PRODUCT"
  | "UX"
  | "UI"
  | "DESIGN SYSTEM"
  | "ACCESSIBILITY"
  | "RESPONSIVE"
  | "EDGE CASES"
  | "CODE QUALITY"
  | "VISUAL QA"
  | "ANTI-SLOP";

export type SkillId =
  | "product"
  | "ux"
  | "interaction"
  | "forms"
  | "edge-cases"
  | "content"
  | "ui"
  | "design-system"
  | "accessibility"
  | "responsive"
  | "frontend"
  | "visual-qa"
  | "anti-slop";

export interface Skill {
  id: SkillId;
  abbr: string;
  label: string;
  group: GroupId;
  gateArea: GateArea;
  summary: string;
  loadWhen: string;
}

export interface Group {
  id: GroupId;
  label: string;
}

export interface Rule {
  id: string;
  skill: SkillId;
  title: string;
  level: Level;
  /** "hard": a Hard Gate, no written exception allowed. "lock": a Quality Lock (consistency). */
  gate?: Gate;
  /** Contextual rules only: the situation that switches the rule on. */
  when?: string;
  do: string;
  dont: string;
  why: string;
  basis: string;
  check?: string;
  /** IDs from ruleset RX-1.x that this rule replaces. */
  formerly?: string[];
}

export const GATE_AREAS: GateArea[] = [
  "PRODUCT",
  "UX",
  "UI",
  "DESIGN SYSTEM",
  "ACCESSIBILITY",
  "RESPONSIVE",
  "EDGE CASES",
  "CODE QUALITY",
  "VISUAL QA",
  "ANTI-SLOP",
];

export const GROUPS: Group[] = [
  { id: "foundation", label: "Foundation" },
  { id: "ux", label: "UX" },
  { id: "ui", label: "UI" },
  { id: "engineering", label: "Engineering" },
  { id: "quality", label: "Quality" },
];

// Workflow order: an agent reaches these roughly top to bottom.
export const SKILLS: Skill[] = [
  { id: "product", abbr: "PR", label: "Product thinking", group: "foundation", gateArea: "PRODUCT", summary: "user, task, goal, primary action, constraints, assumptions", loadWhen: "starting a new screen or flow, or when the scope is unclear" },
  { id: "ux", abbr: "UX", label: "UX architecture", group: "ux", gateArea: "UX", summary: "information architecture, navigation, flows, grouping, disclosure, search and filters", loadWhen: "designing multi-screen flows, navigation, or data-heavy views" },
  { id: "interaction", abbr: "IX", label: "Interaction design", group: "ux", gateArea: "UX", summary: "before, during, result, recovery; feedback, control, confirmation, states, keyboard, local payments", loadWhen: "adding or changing anything the user can act on" },
  { id: "forms", abbr: "FM", label: "Forms", group: "ux", gateArea: "UX", summary: "labels, layout, validation, input preservation, autofill, submission, unsaved work, OTP, address, e-KYC", loadWhen: "building or reviewing any form" },
  { id: "edge-cases", abbr: "EC", label: "Edge cases", group: "ux", gateArea: "EDGE CASES", summary: "data, form, network, permission, and system states beyond the happy path", loadWhen: "building data views, flows, or anything that talks to a network" },
  { id: "content", abbr: "CD", label: "Content design", group: "ux", gateArea: "UX", summary: "specific copy, action labels, error messages, natural Indonesian, Rupiah, terminology", loadWhen: "writing or reviewing any user-facing text" },
  { id: "ui", abbr: "UI", label: "UI design", group: "ui", gateArea: "UI", summary: "hierarchy, type, spacing, layout, density, color, containers, imagery, motion", loadWhen: "doing visual design or visual refinement" },
  { id: "design-system", abbr: "DS", label: "Design system", group: "ui", gateArea: "DESIGN SYSTEM", summary: "search before create, tokens, component states, consistency locks", loadWhen: "adding or changing components, styles, or tokens" },
  { id: "accessibility", abbr: "A11Y", label: "Accessibility", group: "ui", gateArea: "ACCESSIBILITY", summary: "semantics, keyboard, focus, contrast, targets, names, errors, reduced motion", loadWhen: "building or reviewing any UI" },
  { id: "responsive", abbr: "RD", label: "Responsive design", group: "ui", gateArea: "RESPONSIVE", summary: "prioritize, simplify, reorganize; tables, overlays, overflow, safe areas", loadWhen: "building a layout that ships to more than one width" },
  { id: "frontend", abbr: "FE", label: "Frontend implementation", group: "engineering", gateArea: "CODE QUALITY", summary: "the repo's own stack, semantic elements, components, state, no invented logic", loadWhen: "writing UI code" },
  { id: "visual-qa", abbr: "QA", label: "Visual QA", group: "quality", gateArea: "VISUAL QA", summary: "render, inspect, critique, fix, render again; ranked by impact", loadWhen: "something visual has been implemented and is about to be called done" },
  { id: "anti-slop", abbr: "AS", label: "Anti-slop", group: "quality", gateArea: "ANTI-SLOP", summary: "hard gates, purpose gates, quality locks, honest claims", loadWhen: "work is about to be delivered, or during visual refinement" },
];

type RuleInput = Omit<Rule, "id" | "skill">;

function skill(id: SkillId, rules: RuleInput[]): Rule[] {
  const abbr = SKILLS.find((s) => s.id === id)!.abbr;
  return rules.map((r, i) => ({ id: `RX-${abbr}-${String(i + 1).padStart(2, "0")}`, skill: id, ...r }));
}

const RUN = "ryux run 2026-10-02";

export const RULES: Rule[] = [
  ...skill("product", [
    {
      title: "State the context first",
      level: "required",
      do: "Before designing, write down the user, their task, the business goal, the information that matters, the primary action, the constraints, and what success looks like.",
      dont: "Start from a generic template with no stated user or task.",
      why: "Without a task, design and review drift into taste.",
      basis: "ryux-critique playbook; NNGroup task-based evaluation",
      check: "review",
    },
    {
      title: "Unknowns stay assumptions",
      level: "required",
      gate: "hard",
      do: "List what you do not know as assumptions, and mark the matching UI with [REAL DATA] or a question.",
      dont: "Invent business rules, metrics, user data, permissions, pricing, requirements, or API behavior.",
      why: "Invented facts turn into promises and bugs that someone has to unwind.",
      basis: `${RUN}: an unconstrained agent invented a 30-day trial and user counts`,
      check: "review",
    },
    {
      title: "One goal, one primary action",
      level: "required",
      gate: "hard",
      do: "Give each screen one primary goal and one primary action; make secondary actions look secondary.",
      dont: "Put two equal-weight calls to action side by side, or leave the main action unclear.",
      why: "A single clear path shortens the decision and the task.",
      basis: "Hick's law; NNGroup visual hierarchy",
      check: "review",
    },
    {
      title: "Back decisions with real screens",
      level: "required",
      do: "Cite at least one real screen_id for each meaningful design decision, or label it a judgment call with no reference.",
      dont: "Claim \"apps usually do X\" without a screen to show it.",
      why: "A cited screen makes a decision checkable instead of a matter of opinion.",
      basis: "ryux evidence principle",
      check: "search_screens, delivery_gate",
      formerly: ["RX-C-01"],
    },
    {
      title: "Indonesian context first",
      level: "required",
      do: "Start from how Indonesian apps and users work, and check a foreign pattern's local fit before reusing it.",
      dont: "Import a pattern such as card-first checkout or dollar pricing without checking local relevance.",
      why: "Payment, address, and trust habits differ locally (QRIS, virtual accounts, COD, WhatsApp).",
      basis: "ryux taxonomy of local patterns",
      check: "search_screens",
      formerly: ["RX-L-08"],
    },
    {
      title: "Outcome before feature",
      level: "preferred",
      do: "Lead with what the user gets or finishes, in their words, then explain the feature.",
      dont: "Open with product features or technology.",
      why: "People scan for relevance to their task before reading details.",
      basis: "NNGroup scanning research",
      check: "review",
    },
    {
      title: "Only what serves the task",
      level: "preferred",
      do: "Keep the elements and options the stated task needs and move the rest to a later step.",
      dont: "Add sections, stats, settings, or badges because similar products have them.",
      why: "Every extra element competes with the primary action and adds states to maintain.",
      basis: "Nielsen heuristic 8 (1994)",
      check: "review",
    },
    {
      title: "Follow the project's direction",
      level: "contextual",
      when: "the project has a DESIGN.md, a brand guide, or an existing design language",
      do: "Follow it and write down any deliberate departure as a design decision record.",
      dont: "Override it with the agent's default style.",
      why: "Ryux filters and reasons; visual direction belongs to the project.",
      basis: `${RUN}: rules alone produced honest but undirected layouts`,
      check: "review",
    },
  ]),

  ...skill("ux", [
    {
      title: "Structure from the user's goal",
      level: "required",
      do: "Choose the information architecture and pattern from what users come to do and how they look for it.",
      dont: "Apply a stock SaaS layout (sidebar, KPI cards, table) because it is familiar.",
      why: "The right structure depends on the task; a template answers a different question.",
      basis: "NNGroup information architecture research",
      check: "review",
    },
    {
      title: "Where am I, how do I leave",
      level: "preferred",
      do: "Give each screen a clear title and keep a back or cancel path visible.",
      dont: "Leave screens without a title or a way out.",
      why: "Orientation and an exit lower anxiety and abandonment.",
      basis: "NNGroup wayfinding; Nielsen heuristic 3",
      check: "heuristic_eval H-03",
      formerly: ["RX-N-12"],
    },
    {
      title: "Group by meaning",
      level: "preferred",
      do: "Group content by what it means to the user (task, time, status) and label the groups.",
      dont: "Group by how the data is stored or by visual symmetry alone.",
      why: "Meaningful groups let people skip what is not relevant to them.",
      basis: "Gestalt proximity and common region; NNGroup",
      check: "review",
    },
    {
      title: "Progressive disclosure",
      level: "preferred",
      do: "Show what the current decision needs and put advanced or rare options behind a clearly labeled control.",
      dont: "Show every option at once, or hide options people need often.",
      why: "Disclosure keeps the main path simple without removing power.",
      basis: "NNGroup progressive disclosure",
      check: "review",
    },
    {
      title: "Steps and a reviewable summary",
      level: "preferred",
      do: "In multi-step flows, show the current step (\"Langkah 2 dari 3\") and a summary the user can review before committing.",
      dont: "Run a multi-step flow with no sense of progress or no review.",
      why: "Users commit more confidently when they see what is left and can check their choices.",
      basis: "NNGroup checkout and progress-indicator research",
      check: "review",
      formerly: ["RX-N-07"],
    },
    {
      title: "Search, filter, and sort that match the hunt",
      level: "contextual",
      when: "a list or catalog is longer than a screen or two",
      do: "Offer search, filters, or sorting that match how users look for items, show active filters, and give a one-step way to clear them.",
      dont: "Add every possible filter, or hide which filters are applied.",
      why: "Users narrow by the attributes they care about; invisible filters cause \"missing\" items.",
      basis: "NNGroup filtering and faceted search research",
      check: "review",
    },
    {
      title: "Ask for sign-in when it is needed",
      level: "contextual",
      when: "a flow asks for an account (checkout, saving, history)",
      do: "Let users browse and build a cart first, then offer fast sign-in (OTP, WhatsApp, Google) or a guest path at the point it is needed.",
      dont: "Force account creation before the user can see or try anything.",
      why: "Early forced registration is a well-documented cause of abandonment.",
      basis: "NNGroup and Baymard checkout research",
      check: "review",
      formerly: ["RX-N-08"],
    },
    {
      title: "Recognition over recall",
      level: "preferred",
      do: "Show options and context (recent items, saved addresses, visible choices) instead of asking users to remember them.",
      dont: "Make users retype or recall information the app already has.",
      why: "Recognizing is easier and less error-prone than remembering.",
      basis: "Nielsen heuristic 6 (1994)",
      check: "heuristic_eval H-06",
      formerly: ["RX-H-06"],
    },
    {
      title: "The user's words and order",
      level: "preferred",
      do: "Use the terms and ordering users already know (ongkir, transfer, kelurahan before kecamatan).",
      dont: "Put system terms such as SKU or transaction codes in the primary UI.",
      why: "Familiar language and order remove a translation step for the user.",
      basis: "Nielsen heuristic 2 (1994)",
      check: "heuristic_eval H-02",
      formerly: ["RX-H-02"],
    },
  ]),

  ...skill("interaction", [
    {
      title: "Before, during, result, recovery",
      level: "required",
      gate: "hard",
      do: "For each meaningful action, decide what the user sees before acting, while it runs, when it finishes, and how they recover if it fails.",
      dont: "Ship an action whose in-progress, result, or failure behavior is undefined.",
      why: "Undefined behavior becomes inconsistent behavior once it is implemented.",
      basis: "Nielsen heuristics 1 and 9; ryux interaction model",
      check: "review",
    },
    {
      title: "Feedback that matches the wait",
      level: "required",
      do: "Give an immediate pressed state; past about 1 second show a loading indicator; past about 10 seconds show progress with an estimate or let the user leave and come back.",
      dont: "Let a payment or save run with no visible status.",
      why: "Silence during a wait reads as failure and invites double taps.",
      basis: "Nielsen response-time limits (0.1 / 1 / 10 s); Nielsen heuristic 1",
      check: "heuristic_eval H-01",
      formerly: ["RX-H-01", "RX-N-01"],
    },
    {
      title: "Cancel, back, and undo",
      level: "required",
      do: "Let users cancel, go back, or undo without losing their work; where a step is genuinely irreversible, say so before it.",
      dont: "Trap users in a flow with no exit.",
      why: "Freedom to back out makes people willing to explore.",
      basis: "Nielsen heuristic 3 (1994)",
      check: "heuristic_eval H-03",
      formerly: ["RX-H-03"],
    },
    {
      title: "Protect high-impact actions by reasoning",
      level: "required",
      do: "Weigh each destructive or costly action: is it reversible, how big is the impact, how easy is recovery? Prefer undo for reversible actions; confirm with the specifics (amount, recipient, item) when it is irreversible and costly; skip confirmation when it only adds friction.",
      dont: "Confirm every action by reflex, or use a bare \"Are you sure?\" before a payment.",
      why: "Confirmation that appears everywhere gets dismissed by habit; specifics and undo catch real mistakes.",
      basis: "Nielsen heuristic 5; NNGroup confirmation-dialog guidance",
      check: "heuristic_eval H-05",
      formerly: ["RX-H-05", "RX-N-11"],
    },
    {
      title: "Full cost before commitment",
      level: "required",
      do: "Show items, shipping, admin fees, and tax as a breakdown and total before the user commits.",
      dont: "Reveal fees for the first time on the final step.",
      why: "Unexpected extra costs are among the most reported reasons for abandoning checkout.",
      basis: "Baymard checkout usability research; NNGroup e-commerce research",
      check: "review",
      formerly: ["RX-N-06", "RX-L-04"],
    },
    {
      title: "Keyboard-operable actions",
      level: "required",
      do: "Make actions reachable and operable from the keyboard (path-based input such as drawing excepted); Enter submits a form and Escape closes a dialog.",
      dont: "Build actions that only work with a pointer or a touch gesture.",
      why: "Keyboard, switch, and power users depend on it.",
      basis: "WCAG 2.2 SC 2.1.1",
      check: "review",
    },
    {
      title: "Disabled controls explain themselves",
      level: "preferred",
      do: "When a control is disabled, show why or what enables it, or keep it enabled and explain on use.",
      dont: "Grey out a button with no explanation.",
      why: "An unexplained disabled state is a dead end.",
      basis: "NNGroup disabled-button guidance",
      check: "review",
    },
    {
      title: "Shortcuts for repeat use",
      level: "contextual",
      when: "the product is used repeatedly or by experts (cashier, admin, daily tools)",
      do: "Offer shortcuts such as recent items, quick amounts, and keyboard actions.",
      dont: "Make frequent users walk the novice path every time.",
      why: "Accelerators keep repeat work fast without hurting new users.",
      basis: "Nielsen heuristic 7 (1994)",
      check: "heuristic_eval H-07",
      formerly: ["RX-H-07"],
    },
    {
      title: "QRIS: amount and merchant first",
      level: "contextual",
      when: "the flow takes a QRIS payment",
      do: "Show the amount and the merchant name before the user scans or confirms, and the paid status afterwards.",
      dont: "Show a QR code without the amount or the merchant.",
      why: "Users check who they are paying and how much before they pay.",
      basis: "QRIS standard (Bank Indonesia); ryux reference screens",
      check: "search_screens qris",
      formerly: ["RX-L-01"],
    },
    {
      title: "Virtual account: copy, deadline, steps",
      level: "contextual",
      when: "the flow pays by virtual account",
      do: "Give a copy button for the VA number, the payment deadline, and per-bank steps.",
      dont: "Show a VA number with no copy button or no deadline.",
      why: "Users switch to their banking app and need the number and steps at hand.",
      basis: "ryux reference screens",
      check: "search_screens virtual-account",
      formerly: ["RX-L-02"],
    },
    {
      title: "Paylater and installments in full",
      level: "contextual",
      when: "the flow offers paylater or installments",
      do: "Show the limit, the tenor options, and the total cost including interest and fees before commitment.",
      dont: "Show only the monthly amount.",
      why: "Credit decisions need the full cost to be informed ones.",
      basis: "OJK consumer-protection disclosure expectations",
      check: "review",
      formerly: ["RX-L-09"],
    },
  ]),

  ...skill("forms", [
    {
      title: "Visible labels tied to fields",
      level: "required",
      do: "Give each field a label tied to it, visible unless the context already names it (a lone search box beside a labeled button).",
      dont: "Use placeholder text as the only label.",
      why: "Placeholder labels vanish while typing and are often not announced.",
      basis: "NNGroup form-design research; WCAG 2.2 SC 1.3.1 and 3.3.2",
      check: "review",
      formerly: ["RX-N-02"],
    },
    {
      title: "Layout by relationship",
      level: "preferred",
      do: "Default to one column for sequential input, and place short related fields together (date parts, city and postal code) when that matches how people read them.",
      dont: "Spread unrelated fields across columns to fill width.",
      why: "Reading order should match filling order; related fields read as one unit.",
      basis: "NNGroup form-design research",
      check: "review",
      formerly: ["RX-N-02"],
    },
    {
      title: "Validate near the field, keep the input",
      level: "required",
      do: "Validate close to the field when it helps, and keep everything the user typed when something fails.",
      dont: "Clear the form or only report errors after a full submit.",
      why: "Re-entering data is the most frustrating part of a failed form.",
      basis: "NNGroup inline-validation research",
      check: "review",
      formerly: ["RX-N-03"],
    },
    {
      title: "Fewest fields",
      level: "preferred",
      do: "Ask only for what the task needs, mark the less common case (optional or required), and prefill sensible defaults.",
      dont: "Ask for data the task does not use, or mark every field required by default.",
      why: "Each extra field adds effort and a chance to quit.",
      basis: "NNGroup form-design research",
      check: "review",
      formerly: ["RX-N-04"],
    },
    {
      title: "The right keyboard and autofill",
      level: "preferred",
      do: "Match the keyboard to the input (numeric for amounts, phone numbers, and OTP) and support autofill and paste.",
      dont: "Show a text keyboard for numbers or block pasting codes.",
      why: "The right keyboard removes taps and typos on phones.",
      basis: "HTML inputmode and autocomplete (one-time-code); platform input guidance",
      check: "review",
      formerly: ["RX-N-10"],
    },
    {
      title: "Submission states",
      level: "required",
      do: "On submit, prevent double submission, show progress, then show success with what happens next, or failure with the input kept and a retry.",
      dont: "Leave the submit button live during a request or end on a blank screen.",
      why: "Submission is where users lose work and trust.",
      basis: "Nielsen heuristics 1 and 9",
      check: "review",
    },
    {
      title: "Protect unsaved work",
      level: "contextual",
      when: "a form holds work the user can lose by navigating away or timing out",
      do: "Autosave with a visible status, or warn before discarding changes.",
      dont: "Discard edits silently.",
      why: "Lost work is the most expensive form failure.",
      basis: "NNGroup guidance on data loss",
      check: "review",
    },
    {
      title: "OTP: channel choice and paste",
      level: "contextual",
      when: "the flow sends a one-time code",
      do: "Offer SMS or WhatsApp, allow paste and autofill, and allow a resend after a short countdown.",
      dont: "Lock users to one channel with a long, punishing countdown.",
      why: "SMS delivery is unreliable for some users; WhatsApp is often the faster channel.",
      basis: "ryux reference screens",
      check: "search_screens otp",
      formerly: ["RX-L-03"],
    },
    {
      title: "Addresses with landmarks",
      level: "contextual",
      when: "the form collects a delivery address",
      do: "Support landmarks, block or RT/RW, and courier notes alongside the map pin.",
      dont: "Rely on a map pin alone.",
      why: "Many Indonesian addresses are found by landmark rather than by street number.",
      basis: "ryux reference screens",
      check: "review",
      formerly: ["RX-L-05"],
    },
    {
      title: "e-KYC: reason and guidance first",
      level: "contextual",
      when: "the flow asks for an ID card or selfie",
      do: "Explain why the data is needed and show framing guidance before opening the camera.",
      dont: "Open the camera with no reason and no guidance.",
      why: "People share identity data more willingly, and with fewer retakes, when they know why and how.",
      basis: "UU PDP No. 27/2022 (transparency); ryux reference screens",
      check: "review",
      formerly: ["RX-L-10"],
    },
  ]),

  ...skill("edge-cases", [
    {
      title: "Critical states exist",
      level: "required",
      gate: "hard",
      do: "Design the loading, empty, error, and success states of each data view and action that can be slow, empty, or fail.",
      dont: "Ship only the filled, happy-path screen.",
      why: "Users meet the other states often, and they are where trust is lost.",
      basis: "Nielsen heuristics 1 and 9",
      check: "audit_ui",
      formerly: ["RX-H-14"],
    },
    {
      title: "Errors with a way forward",
      level: "required",
      do: "When something fails, say what happened, why if it helps, and the next action (retry, another method, contact).",
      dont: "End on an error with only an \"OK\" button.",
      why: "A recoverable error keeps the task alive.",
      basis: "Nielsen heuristic 9 (1994)",
      check: "heuristic_eval H-09",
      formerly: ["RX-H-09"],
    },
    {
      title: "Data volume and shape",
      level: "preferred",
      do: "Check one item, many items, duplicates, and missing fields; paginate or virtualize long lists.",
      dont: "Design only for a tidy sample of five items.",
      why: "Real data is uneven, and layouts break at the extremes.",
      basis: "ryux review practice",
      check: "visual QA",
    },
    {
      title: "Long text and large amounts",
      level: "preferred",
      do: "Test with long names, long Indonesian words, and large amounts such as Rp1.250.000.000; wrap or truncate with access to the full value.",
      dont: "Design only around short sample strings.",
      why: "Real content is longer than sample content and breaks fixed layouts.",
      basis: "Localization practice; ryux review practice",
      check: "visual QA",
    },
    {
      title: "First use and zero data",
      level: "preferred",
      do: "Explain what will appear in an empty view and give one action to get started.",
      dont: "Leave a blank list or a lone \"No data\".",
      why: "An empty state is the first lesson in how the feature works.",
      basis: "NNGroup empty-state guidance",
      check: "review",
    },
    {
      title: "Slow, timeout, offline, server failure",
      level: "contextual",
      when: "the screen depends on network data",
      do: "Keep user input, show cached data with its age, offer retry, and say plainly when the server failed versus the connection.",
      dont: "Show an endless spinner, an empty screen, or lose input when the request fails.",
      why: "Connection quality varies a lot between places and moments.",
      basis: "ryux review practice",
      check: "review",
    },
    {
      title: "Roles and restricted access",
      level: "contextual",
      when: "the product has roles, permissions, or read-only modes",
      do: "Design the read-only and restricted states: say why an action is unavailable and who can do it. Use roles that exist in the product.",
      dont: "Invent roles or show actions that fail only after the user tries them.",
      why: "Users need to know whether to ask someone or give up.",
      basis: "ryux review practice",
      check: "review",
    },
    {
      title: "Session expiry and unauthorized",
      level: "contextual",
      when: "the product has sessions or authentication",
      do: "On expiry, keep the user's work, ask them to sign in again, and return them to the same place.",
      dont: "Dump users on a login screen and lose their progress.",
      why: "Re-authentication should cost seconds, not the task.",
      basis: "ryux review practice",
      check: "review",
    },
  ]),

  ...skill("content", [
    {
      title: "Natural Bahasa Indonesia",
      level: "required",
      do: "Write the way Indonesian users speak; keep English only for terms they already use (checkout, promo).",
      dont: "Ship stiff translations such as \"Silakan melakukan pembayaran Anda\".",
      why: "Natural language reads faster and feels trustworthy.",
      basis: "ryux copy principle",
      check: "audit_copy, review",
      formerly: ["RX-L-07"],
    },
    {
      title: "Rupiah as Rp1.250.000",
      level: "required",
      do: "Write money with Rp directly before the number, dots for thousands, and no decimals for whole Rupiah.",
      dont: "Write Rp 1.250.000, IDR 1250000, or Rp1,250,000.",
      why: "It is the common Indonesian form; mixed formats look careless next to prices.",
      basis: `PUEBI currency notation; ${RUN}`,
      check: "audit_copy C-07",
      formerly: ["RX-L-06"],
    },
    {
      title: "Labels name the real action",
      level: "preferred",
      do: "Name the action and what it gets the user (\"Bayar Rp45.000\", \"Simpan alamat\").",
      dont: "Use vague labels (\"Submit\", \"Learn more\") or hype words (\"unlock\", \"elevate\", \"seamlessly\").",
      why: "Specific labels tell users what happens next.",
      basis: "NNGroup button and link-label guidance",
      check: "audit_copy",
      formerly: ["RX-C-06"],
    },
    {
      title: "Errors: what, why, how to recover",
      level: "required",
      do: "Say what happened, why when it helps the user act, and how to recover, next to where it happened, without blaming the user.",
      dont: "Show codes like TXN_0x8004 or \"Something went wrong\" on their own.",
      why: "Users can only recover from what they understand.",
      basis: "NNGroup error-message guidelines",
      check: "audit_copy C-04",
      formerly: ["RX-N-05"],
    },
    {
      title: "One name per thing",
      level: "required",
      gate: "lock",
      do: "Use one term for each concept across screens, buttons, and messages.",
      dont: "Call the same thing \"pesanan\", \"order\", and \"transaksi\" on different screens.",
      why: "Changing terms make users wonder whether it is a different thing.",
      basis: "Nielsen heuristic 4 (1994)",
      check: "review",
    },
    {
      title: "Plain decoration",
      level: "preferred",
      do: "Use sentence case and plain lists; one emoji is fine where the channel expects it.",
      dont: "Use emoji as bullets, ALL CAPS, or stacked exclamation marks.",
      why: "Decoration on every line buries the information and reads as generated.",
      basis: `${RUN}: unconstrained WhatsApp copy`,
      check: "audit_copy, review",
      formerly: ["RX-C-10"],
    },
    {
      title: "Help at the point of need",
      level: "preferred",
      do: "Put short help where the question arises (a hint under a field, \"Kenapa diminta?\").",
      dont: "Send users to a separate FAQ for a field-level question.",
      why: "Help in context gets read; help elsewhere gets skipped.",
      basis: "Nielsen heuristic 10 (1994)",
      check: "heuristic_eval H-10",
      formerly: ["RX-H-10"],
    },
    {
      title: "Chat copy sounds like a person",
      level: "contextual",
      when: "the text goes to WhatsApp, Telegram, or another chat channel",
      do: "Use a short greeting, short paragraphs, sparse *bold*, and a clear contact line.",
      dont: "Paste a marketing page into a chat.",
      why: "Chat readers expect a message from a person, not an ad.",
      basis: `${RUN}: WhatsApp promo comparison`,
      check: "review",
    },
  ]),

  ...skill("ui", [
    {
      title: "Hierarchy follows priority",
      level: "required",
      gate: "lock",
      do: "Make the primary action and the key information the most prominent things in each area, with one clear focal point.",
      dont: "Give everything equal weight, or let decoration outrank content.",
      why: "Hierarchy is how users know what to read and do first.",
      basis: "NNGroup visual hierarchy",
      check: "visual QA",
    },
    {
      title: "Functional before decorative",
      level: "required",
      do: "Give each decorative element (card, gradient, shadow, badge, illustration, large display type) a stated reason; see the anti-slop purpose gates.",
      dont: "Add decoration because it looks modern.",
      why: "Unjustified decoration is the fastest route to generic UI.",
      basis: "Nielsen heuristic 8; ryux anti-slop principle",
      check: "review",
      formerly: ["RX-H-08"],
    },
    {
      title: "One spacing and type scale",
      level: "preferred",
      gate: "lock",
      do: "Use the project's spacing and type scale, or define one (for example multiples of 4 or 8) and align elements to a shared grid.",
      dont: "Pick spacing and sizes one element at a time.",
      why: "A scale produces rhythm and makes hierarchy legible.",
      basis: "Material Design 8dp grid",
      check: "review",
      formerly: ["RX-C-08"],
    },
    {
      title: "A palette with roles",
      level: "preferred",
      gate: "lock",
      do: "Use a small set of colors with defined roles: surface, text, accent for the primary action, and status colors.",
      dont: "Introduce new colors per component, or use the accent for decoration.",
      why: "When color has a role, the accent and status colors mean something.",
      basis: "ryux visual principle",
      check: "review",
      formerly: ["RX-C-07"],
    },
    {
      title: "Layout from content, not a template",
      level: "preferred",
      do: "Choose the layout from the content, the task, and the reference screens.",
      dont: "Default to hero, three feature cards, and a logo wall.",
      why: "Template layouts look interchangeable and hide what is specific to the product.",
      basis: "ryux anti-slop principle",
      check: "review",
      formerly: ["RX-C-02"],
    },
    {
      title: "Density fits the task",
      level: "preferred",
      do: "Use compact density for repeat, data-heavy work and roomier layouts for first-time or high-stakes decisions.",
      dont: "Apply the same generous whitespace to a cashier screen and a landing page.",
      why: "The right density depends on how often and how carefully people use the screen.",
      basis: "Material density guidance",
      check: "review",
    },
    {
      title: "Imagery that is what it claims",
      level: "contextual",
      when: "the design uses photos or illustrations",
      do: "Use real product screens or clearly illustrative art.",
      dont: "Present a stock photo of a stranger as a customer or user.",
      why: "Borrowed faces imply endorsements that do not exist.",
      basis: `${RUN}: pen.dev landing without ryux`,
      check: "review",
    },
    {
      title: "Motion explains change",
      level: "preferred",
      do: "Use motion for feedback and continuity (where something came from, what changed), keep it short, and let users act while it runs.",
      dont: "Animate for decoration alone or make users wait for an animation.",
      why: "Purposeful motion helps users follow state changes; slow motion is friction.",
      basis: "Material motion principles; Apple HIG motion",
      check: "review",
    },
  ]),

  ...skill("design-system", [
    {
      title: "Search before you create",
      level: "required",
      gate: "hard",
      do: "Before adding a component, search existing components, tokens, and patterns; reuse, then extend with a variant, and create new only for a real semantic or behavioral difference.",
      dont: "Create a near-duplicate component or pattern for one screen.",
      why: "Duplicates drift apart, multiply maintenance, and break consistency.",
      basis: "Design-system practice",
      check: "review",
    },
    {
      title: "Consistency and conventions",
      level: "required",
      gate: "lock",
      do: "Follow platform conventions and the project's own patterns; the same component looks and behaves the same everywhere.",
      dont: "Style or wire similar components differently from screen to screen.",
      why: "Consistency lets users transfer what they learned.",
      basis: "Nielsen heuristic 4; Apple HIG; Material Design",
      check: "heuristic_eval H-04",
      formerly: ["RX-H-04"],
    },
    {
      title: "Tokens over one-off values",
      level: "preferred",
      gate: "lock",
      do: "Use tokens or variables for color, spacing, radius, elevation, and type.",
      dont: "Hard-code one-off values for things the system already defines.",
      why: "Tokens keep changes consistent and reviewable.",
      basis: "W3C Design Tokens Community Group",
      check: "review",
    },
    {
      title: "Defined component states",
      level: "preferred",
      gate: "lock",
      do: "Define default, hover, focus, pressed, disabled, loading, and error states once per interactive component.",
      dont: "Leave states for each screen to improvise.",
      why: "Undefined states get designed inconsistently, or not at all.",
      basis: "Material Design state guidance",
      check: "review",
    },
  ]),

  ...skill("accessibility", [
    {
      title: "Readable contrast",
      level: "required",
      gate: "hard",
      do: "Keep text contrast at least 4.5:1, and at least 3:1 for large text and component boundaries.",
      dont: "Put light grey text on white or white text on a pale accent.",
      why: "Low contrast fails outdoors, on cheap screens, and for low vision.",
      basis: "WCAG 2.2 SC 1.4.3 and 1.4.11",
      check: "audit_ui",
      formerly: ["RX-H-11"],
    },
    {
      title: "Readable text, reachable targets",
      level: "required",
      gate: "hard",
      do: "Keep body text around 14 to 16px on mobile, and touch targets at least 24×24px, preferably 44×44px.",
      dont: "Shrink body text or crowd small targets together.",
      why: "Small text and targets cause misreads and mis-taps.",
      basis: "WCAG 2.2 SC 2.5.8 (24px minimum); Apple HIG 44pt; Material 48dp",
      check: "audit_ui",
      formerly: ["RX-H-12"],
    },
    {
      title: "Visible focus, logical order",
      level: "required",
      gate: "hard",
      do: "Show a visible focus indicator and keep the focus order the same as the visual order.",
      dont: "Remove focus outlines without an accessible replacement.",
      why: "Keyboard and switch users navigate by focus.",
      basis: "WCAG 2.2 SC 2.4.3 and 2.4.7",
      check: "review",
      formerly: ["RX-H-13"],
    },
    {
      title: "Semantic structure",
      level: "required",
      gate: "hard",
      do: "Use real headings, landmarks, lists, buttons, and links so the structure exists without the styling.",
      dont: "Build structure from styled divs alone.",
      why: "Assistive technology navigates by semantics.",
      basis: "WCAG 2.2 SC 1.3.1",
      check: "review",
    },
    {
      title: "Names for controls and images",
      level: "required",
      gate: "hard",
      do: "Give icon-only buttons and meaningful images an accessible name or alt text.",
      dont: "Ship unlabeled icon buttons.",
      why: "Screen readers announce unlabeled buttons as just \"button\".",
      basis: "WCAG 2.2 SC 1.1.1 and 4.1.2",
      check: "review",
    },
    {
      title: "Not color alone",
      level: "required",
      do: "Pair color with text or an icon when it carries meaning (errors, status, selection).",
      dont: "Signal an error or a selected state with color only.",
      why: "Color-blind users and grayscale screens miss color-only signals.",
      basis: "WCAG 2.2 SC 1.4.1",
      check: "review",
    },
    {
      title: "Errors announced and tied to fields",
      level: "required",
      do: "Link error messages to their fields and announce them to assistive technology.",
      dont: "Show errors only as red borders or as text that is not associated with the field.",
      why: "An error the user cannot perceive cannot be fixed.",
      basis: "WCAG 2.2 SC 3.3.1 and 4.1.3",
      check: "review",
    },
    {
      title: "Respect reduced motion",
      level: "required",
      do: "When reduced motion is requested, replace large movement with a fade or a cut.",
      dont: "Ignore the system reduced-motion setting.",
      why: "Large motion can cause discomfort for people with vestibular disorders.",
      basis: "WCAG 2.2 SC 2.3.3; prefers-reduced-motion; Apple HIG",
      check: "review",
    },
    {
      title: "ARIA only when native cannot",
      level: "preferred",
      do: "Use native elements first, and add ARIA only for semantics HTML cannot express.",
      dont: "Add roles and ARIA attributes to elements that already have the right semantics.",
      why: "Wrong ARIA is worse than none.",
      basis: "W3C ARIA Authoring Practices (first rule of ARIA)",
      check: "review",
    },
  ]),

  ...skill("responsive", [
    {
      title: "Stated viewport plus the smallest",
      level: "required",
      gate: "hard",
      do: "Check the stated viewport and the smallest supported width, with no horizontal page scroll at either.",
      dont: "Design for one width only.",
      why: "Users meet the layout at many widths, including small Android phones.",
      basis: "WCAG 2.2 SC 1.4.10 (reflow at 320 CSS px)",
      check: "visual QA",
      formerly: ["RX-H-14"],
    },
    {
      title: "Prioritize, simplify, reorganize",
      level: "required",
      do: "As space shrinks, decide what matters most, simplify what remains, then reorganize: stack, collapse, or move secondary content behind a control. Keep text size.",
      dont: "Squeeze the desktop layout into a smaller viewport.",
      why: "Shrinking keeps the layout and loses the reader.",
      basis: "WCAG 2.2 SC 1.4.10; responsive design practice",
      check: "visual QA",
    },
    {
      title: "Safe areas and thumb reach",
      level: "required",
      do: "Keep content inside the safe areas and the primary action within thumb reach on phones.",
      dont: "Put the main action under the notch or the home indicator.",
      why: "Hidden or hard-to-reach actions stall the task.",
      basis: "Apple HIG layout; Material layout guidance",
      check: "visual QA",
      formerly: ["RX-H-14"],
    },
    {
      title: "Tables on small screens",
      level: "contextual",
      when: "the layout has a data table",
      do: "Pick the priority columns, then stack rows into labeled blocks or scroll the table inside its own container with the key column fixed.",
      dont: "Shrink a wide table until it is unreadable or scroll the whole page sideways.",
      why: "Tables carry comparisons; losing the key column loses the meaning.",
      basis: "NNGroup mobile tables guidance",
      check: "visual QA",
    },
    {
      title: "Overlays on small screens",
      level: "contextual",
      when: "the layout uses modals, drawers, or popovers",
      do: "On phones, use a full-screen or bottom sheet and keep the close and primary actions reachable.",
      dont: "Show a desktop-sized modal that overflows a phone screen.",
      why: "Overflowing overlays trap users.",
      basis: "Apple HIG sheets; Material bottom sheets",
      check: "visual QA",
    },
    {
      title: "Consistent responsive behavior",
      level: "preferred",
      gate: "lock",
      do: "Make the same component adapt the same way wherever it appears.",
      dont: "Collapse the same navigation differently on different pages.",
      why: "Predictable adaptation is part of consistency.",
      basis: "Nielsen heuristic 4 (1994)",
      check: "visual QA",
    },
  ]),

  ...skill("frontend", [
    {
      title: "Work in the repo's own stack",
      level: "required",
      do: "Before writing UI code, read package.json and nearby components, and use the framework, styling approach, and patterns already there.",
      dont: "Assume React, Tailwind, or a component library the project does not use.",
      why: "Code in a foreign stack is a rewrite waiting to happen.",
      basis: "Clean-code practice",
      check: "review",
    },
    {
      title: "No invented logic in UI code",
      level: "required",
      gate: "hard",
      do: "Take prices, limits, permissions, and rules from data, config, or the API; mark unknown ones as assumptions.",
      dont: "Hard-code business rules or API behavior nobody specified.",
      why: "Invented logic ships as real behavior.",
      basis: "ryux product principle (see RX-PR-02)",
      check: "review",
    },
    {
      title: "Native, semantic controls",
      level: "required",
      do: "Use native or semantic elements (button, a, label, the right input types) before custom elements with handlers.",
      dont: "Build clickable divs without roles, focus, or keyboard support.",
      why: "Native controls bring accessibility and platform behavior for free.",
      basis: "WCAG 2.2 SC 4.1.2; HTML specification",
      check: "review",
    },
    {
      title: "Components with clear boundaries",
      level: "preferred",
      do: "Split components by responsibility, keep state close to where it is used, and derive values instead of duplicating state.",
      dont: "Grow a single giant component that fetches, formats, and renders everything.",
      why: "Clear boundaries make UI predictable and testable.",
      basis: "Clean-code practice",
      check: "review",
    },
    {
      title: "Actionable errors",
      level: "required",
      do: "Handle errors with messages that say what to fix, in the user's language when users see them.",
      dont: "Swallow errors silently or show raw developer messages to users.",
      why: "Silent failures hide bugs; raw messages leave users stuck.",
      basis: "Clean-code practice; Nielsen heuristic 9",
      check: "review",
      formerly: ["RX-K-06"],
    },
    {
      title: "Comments say why",
      level: "preferred",
      do: "Write comments that explain the reason behind the code.",
      dont: "Write doc comments that only repeat a field, type, or function name.",
      why: "Restating comments add noise and drift out of date.",
      basis: `${RUN}: order-total.ts without ryux`,
      check: "review",
      formerly: ["RX-K-01"],
    },
    {
      title: "Specific names",
      level: "preferred",
      do: "Name variables and functions by what they hold or do.",
      dont: "Use data, temp, helper, or manager without context.",
      why: "Specific names make code readable without comments.",
      basis: "Clean-code practice",
      check: "review",
      formerly: ["RX-K-02"],
    },
    {
      title: "No dead code",
      level: "preferred",
      do: "Remove unused code, imports, and commented-out blocks.",
      dont: "Leave empty TODOs or disabled code behind.",
      why: "Dead code misleads the next reader.",
      basis: "Clean-code practice",
      check: "review",
      formerly: ["RX-K-03"],
    },
    {
      title: "Match the surrounding style",
      level: "preferred",
      do: "Follow the formatting, naming, and patterns of the surrounding files.",
      dont: "Introduce a new style inside an existing codebase.",
      why: "Mixed styles make every change harder to review.",
      basis: "Clean-code practice",
      check: "review",
      formerly: ["RX-K-04"],
    },
    {
      title: "No speculative abstraction or dependencies",
      level: "preferred",
      do: "Build for the needs that exist now, and add a dependency only when it clearly earns its weight.",
      dont: "Add abstractions, configuration, or packages for needs nobody has stated.",
      why: "Unused flexibility costs reading time, bundle size, and hides bugs.",
      basis: "Clean-code practice",
      check: "review",
      formerly: ["RX-K-05"],
    },
    {
      title: "Mind performance",
      level: "preferred",
      do: "Size and lazy-load heavy images and media, and avoid needless re-renders and large client bundles.",
      dont: "Ship full-size images or heavy libraries for small effects.",
      why: "Many Indonesian users are on mid-range phones and metered data.",
      basis: "web.dev Core Web Vitals",
      check: "review",
    },
    {
      title: "Rupiah formatting in code",
      level: "contextual",
      when: "code formats money for display",
      do: "Format the number with id-ID grouping and prepend Rp yourself.",
      dont: "Rely on Intl currency style alone, which inserts a space after Rp.",
      why: "The built-in output does not match the Rp1.250.000 form used in copy.",
      basis: `${RUN}: order-total.ts with and without ryux`,
      check: "audit_copy C-07 on rendered strings",
    },
  ]),

  ...skill("visual-qa", [
    {
      title: "Render it and look",
      level: "required",
      do: "Render the result at the target viewport (browser, screenshot, or design-tool export) and inspect it before calling it done; if no render tool is available, say so in the report.",
      dont: "Claim visual quality for a layout you have only seen as code.",
      why: "Overlaps and clipping are invisible in source and obvious on screen.",
      basis: `${RUN}: two runs shipped overlaps they never saw`,
      check: "screenshot",
    },
    {
      title: "Fix, then render again",
      level: "required",
      do: "Rank issues by impact (blocks the task, misleads, adds friction, polish), fix from the top, and render again to confirm.",
      dont: "Fix by guesswork without checking the result, or polish while a blocking issue remains.",
      why: "The loop is what turns a first draft into a reviewed result.",
      basis: "ryux visual QA loop",
      check: "screenshot",
    },
    {
      title: "No covered or colliding text",
      level: "required",
      do: "Keep floating cards and mockups over empty space only, and keep navigation items clear of the logo and buttons.",
      dont: "Let a card cover prices or labels, or let nav items touch.",
      why: "Covered text is lost information and looks broken.",
      basis: `${RUN}: QRIS card over prices, colliding nav`,
      check: "screenshot",
      formerly: ["RX-H-14"],
    },
    {
      title: "Numbers agree",
      level: "required",
      do: "Make line items add up to subtotals and totals, and show the same value the same way everywhere on the screen.",
      dont: "Show sample numbers that contradict each other.",
      why: "Readers check sums; one wrong total undermines everything else.",
      basis: "ryux README checkout image (items Rp125.000, subtotal Rp1.200.000)",
      check: "review",
    },
    {
      title: "Check states and widths",
      level: "preferred",
      do: "Inspect at least the main state, one empty or error state, and the smallest supported width.",
      dont: "Review only the happy path at one width.",
      why: "Most visual bugs live outside the default screenshot.",
      basis: "ryux visual QA loop",
      check: "screenshot",
    },
    {
      title: "Compare with a reference",
      level: "preferred",
      do: "Compare the result with at least one reference screen_id and note any intentional difference.",
      dont: "Judge the result only against itself.",
      why: "A reference shows what you missed.",
      basis: "ryux evidence principle",
      check: "search_screens",
    },
  ]),

  ...skill("anti-slop", [
    {
      title: "Only real numbers",
      level: "required",
      gate: "hard",
      do: "Show counts, ratings, growth, and statistics only with a real source; otherwise leave them out or mark [REAL DATA].",
      dont: "Invent \"48.000+ users\", \"4,8★\", or \"+12%\".",
      why: "Invented numbers are false claims, however polished the page.",
      basis: `${RUN}: pen.dev landing without ryux`,
      check: "review",
      formerly: ["RX-C-03"],
    },
    {
      title: "No invented people",
      level: "required",
      gate: "hard",
      do: "Use testimonials, names, and faces only when they are real and consented.",
      dont: "Make up testimonials, reviewers, or customer photos.",
      why: "Fake people are fake endorsements.",
      basis: "ryux anti-slop principle",
      check: "review",
      formerly: ["RX-C-04"],
    },
    {
      title: "Placeholders look like placeholders",
      level: "required",
      gate: "hard",
      do: "Mark temporary content clearly: [REAL DATA], [LOGO], \"Contoh data\".",
      dont: "Ship placeholder copy or data disguised as final.",
      why: "Disguised placeholders ship by accident.",
      basis: "ryux anti-slop principle",
      check: "audit_copy C-01",
      formerly: ["RX-C-05"],
    },
    {
      title: "No fake urgency",
      level: "required",
      gate: "hard",
      do: "State a deadline or a quota only when it is real, as a plain fact.",
      dont: "Write \"sebelum kehabisan\", \"kuota terbatas\", or fake countdowns with nothing behind them.",
      why: "Manufactured pressure erodes trust once users notice.",
      basis: `NNGroup credibility research; ${RUN}: WhatsApp promo`,
      check: "review",
      formerly: ["RX-N-09", "RX-C-10"],
    },
    {
      title: "Decoration passes a purpose gate",
      level: "required",
      do: "For each potentially decorative pattern, answer \"why does this exist?\" with a real reason (grouping, emphasis, state, brand), or remove it.",
      dont: "Keep cards, gradients, badges, shadows, or animation that have no reason.",
      why: "Unjustified decoration is what makes AI-generated UI look the same.",
      basis: "ryux anti-slop principle",
      check: "review",
    },
    {
      title: "Complexity with a reason",
      level: "required",
      gate: "hard",
      do: "Remove elements, options, states, and code paths that serve no stated need.",
      dont: "Add settings, sections, or abstractions \"for later\".",
      why: "Unneeded complexity costs every user and every future change.",
      basis: "Nielsen heuristic 8; clean-code practice",
      check: "review",
    },
    {
      title: "Claims match the evidence",
      level: "required",
      do: "Describe what was checked and how (\"keyboard and focus checked; no automated accessibility test was available\").",
      dont: "Claim \"pixel perfect\", \"fully accessible\", \"production ready\", \"senior-level\", or \"UX optimized\" without evidence.",
      why: "False confidence hides the work that is still needed.",
      basis: "ryux delivery principle",
      check: "review",
    },
    {
      title: "Human designer notes",
      level: "required",
      do: "Have a person write the \"why it works / weaknesses\" judgment; an agent may summarize it.",
      dont: "Let an agent author designer notes.",
      why: "The human judgment is the point of the notes.",
      basis: "ryux data principle",
      check: "review",
      formerly: ["RX-C-09"],
    },
  ]),
];

// Brief item: patterns that are allowed when they have a purpose, and removed when they do not.
export interface PurposeGate {
  pattern: string;
  acceptableWhen: string;
}

export const PURPOSE_GATES: PurposeGate[] = [
  { pattern: "Cards", acceptableWhen: "they group related content or separate items the user compares or acts on individually" },
  { pattern: "Gradients", acceptableWhen: "they carry the brand, show emphasis, or encode a value (a scale or progress)" },
  { pattern: "Illustrations", acceptableWhen: "they explain a concept, an empty state, or a step that words alone do not" },
  { pattern: "Decorative icons", acceptableWhen: "they speed recognition of a repeated item or action, next to a text label" },
  { pattern: "Pills", acceptableWhen: "they show a filter, a selectable option, or a short status" },
  { pattern: "Badges", acceptableWhen: "they show a count or status the user acts on" },
  { pattern: "Shadows", acceptableWhen: "they show elevation that matters: an overlay, a draggable or floating element" },
  { pattern: "Large display type", acceptableWhen: "it carries the single most important message of a page" },
  { pattern: "Animation", acceptableWhen: "it communicates state, continuity, feedback, or spatial relationships" },
  { pattern: "Unusual layouts", acceptableWhen: "the content or task genuinely differs from standard patterns" },
  { pattern: "Generous whitespace", acceptableWhen: "it separates groups or slows a high-stakes decision, not when it hides thin content" },
  { pattern: "Borders", acceptableWhen: "they separate regions that spacing alone cannot" },
  { pattern: "Rounded containers", acceptableWhen: "the rounding follows the system radius and the container groups something" },
];

// Brief item: each hard-gate failure mapped to the rule that enforces it.
export const HARD_GATES: { item: string; rules: string[] }[] = [
  { item: "Fake data or fake metrics", rules: ["RX-AS-01"] },
  { item: "Fake testimonials or people", rules: ["RX-AS-02"] },
  { item: "Invented business rules or product requirements", rules: ["RX-PR-02", "RX-FE-02"] },
  { item: "Placeholder copy shipped as final", rules: ["RX-AS-03"] },
  { item: "Fake urgency or scarcity", rules: ["RX-AS-04"] },
  { item: "Missing critical states", rules: ["RX-EC-01"] },
  { item: "Broken responsive behavior", rules: ["RX-RD-01"] },
  { item: "Accessibility failures", rules: ["RX-A11Y-01", "RX-A11Y-02", "RX-A11Y-03", "RX-A11Y-04", "RX-A11Y-05"] },
  { item: "Unclear primary action", rules: ["RX-PR-03"] },
  { item: "Unexplained interaction behavior", rules: ["RX-IX-01"] },
  { item: "Duplicate components", rules: ["RX-DS-01"] },
  { item: "Unnecessary complexity", rules: ["RX-AS-06"] },
];

// Brief item: consistency that must hold across the product.
export const QUALITY_LOCKS: { item: string; rules: string[] }[] = [
  { item: "Spacing", rules: ["RX-UI-03", "RX-DS-03"] },
  { item: "Typography", rules: ["RX-UI-03", "RX-DS-03"] },
  { item: "Color roles", rules: ["RX-UI-04"] },
  { item: "Terminology", rules: ["RX-CD-05"] },
  { item: "Components", rules: ["RX-DS-02"] },
  { item: "Interaction patterns and states", rules: ["RX-DS-02", "RX-DS-04"] },
  { item: "Responsive behavior", rules: ["RX-RD-06"] },
  { item: "Visual hierarchy", rules: ["RX-UI-01"] },
];

// Contextual activation: load only what the task needs (core is always loaded).
export const ACTIVATION: { task: string; skills: SkillId[] }[] = [
  { task: "UI implementation", skills: ["product", "ux", "ui", "design-system", "frontend", "visual-qa", "anti-slop"] },
  { task: "Form implementation", skills: ["product", "ux", "forms", "interaction", "accessibility", "edge-cases", "content"] },
  { task: "Mobile UI", skills: ["ux", "ui", "responsive", "accessibility", "anti-slop"] },
  { task: "Checkout or payment", skills: ["product", "interaction", "forms", "content", "edge-cases"] },
  { task: "Data-heavy view (list, table, dashboard)", skills: ["ux", "edge-cases", "responsive", "design-system", "frontend"] },
  { task: "Copy only", skills: ["content", "anti-slop"] },
  { task: "Visual refinement", skills: ["ui", "design-system", "visual-qa", "anti-slop"] },
];

export const ALL_SKILL_IDS: SkillId[] = SKILLS.map((s) => s.id);
export const ALL_GROUP_IDS: GroupId[] = GROUPS.map((g) => g.id);

export const skillsInGroups = (groups: string[]): SkillId[] =>
  SKILLS.filter((s) => groups.includes(s.group)).map((s) => s.id);

// Old per-concern installs (ruleset RX-1.x) mapped to the new skills, for --concerns.
export const LEGACY_CONCERNS: Record<string, SkillId[]> = {
  ui: ["ui", "design-system", "responsive"],
  copy: ["content"],
  a11y: ["accessibility"],
  ux: ["ux", "interaction", "forms", "edge-cases"],
  local: ["product", "interaction", "forms", "content"],
  code: ["frontend"],
};

// Skill folder names from earlier releases that no longer exist. "ui" and "ux" are not listed:
// they are current skill names again and get overwritten or removed with the current set.
export const LEGACY_SKILL_DIRS = ["rules", "copy", "a11y", "local", "code"];

export const LEVEL_LABEL: Record<Level, string> = {
  required: "Required",
  preferred: "Preferred",
  contextual: "Contextual",
};

export const RULES_VERSION = "1.0.0";
export const RULESET_VERSION = "RX-2.0";
export const MCP_NAME = "ryux";
export const MCP_URL = "https://mcp.ryux.design/mcp";
export const MCP_ADD_CMD = `claude mcp add --transport http ${MCP_NAME} ${MCP_URL}`;
export const MARK_START = "<!-- ryux-rules:start -->";
export const MARK_END = "<!-- ryux-rules:end -->";
