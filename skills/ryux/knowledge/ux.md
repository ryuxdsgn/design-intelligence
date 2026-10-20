# UX architecture

Structures screens and flows so people find their way: information architecture, navigation, grouping, and progressive disclosure.

> Group UX · Delivery Gate area UX · RYUX 2.13.1. Levels are defined in `SKILL.md`.

Choose structure from the user's goal, not from a template.

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

```
Rule:       Recognition over recall (RX-UX-08)
Context:    a complex enterprise form filled many times a day
Decision:   show previously selected values and recent entries
Trade-off:  higher visual density
Reason:     less memory burden in a repeated workflow
```

Does not cover: per-action behavior (see `knowledge/interaction.md`), forms (see `knowledge/forms.md`), or states
(see `knowledge/edge-cases.md`).

## Evidence from RYUX Knowledge

How Indonesian apps sequence and structure this flow: `get_flow` for a reference flow, `compare_apps` to compare steps across apps. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. Labeled sample data is
> not an invented number; an unconfirmed capability is never presented as confirmed. See `SKILL.md`.

## Rules

### RX-UX-01 [Required] Structure from the user's goal

- Do: Choose the information architecture and pattern from what users come to do and how they look for it. Keep together what the user checks together, and show each fact once.
- Do not: Apply a stock SaaS layout (sidebar, KPI cards, table) because it is familiar, or show the same fact twice on one screen (the merchant or the amount in the summary and again in a row, the balance in the header and in a card).
- Why: The right structure depends on the task; a template answers a different question. A repeated fact costs reading time and leaves the user to wonder which one is right. (NNGroup information architecture research; Gestalt proximity and common region (Palmer 1992): items close together or in one container read as one group; ryux four-problems blind rating, rater 1 (product designer), 2026-10-16: repeated facts were a reason not to ship)
- Not when: the product already has an established structure users rely on; change it only with evidence
- Trade-off: a less familiar layout can cost users a moment of learning
- Check: review

### RX-UX-02 [Preferred] Where am I, what's left, how do I leave

- Do: Give each screen a clear title and keep a back or cancel path visible; in multi-step flows show the current step ("Langkah 2 dari 3") and a summary the user can review before committing. Show how close the goal is, and let an interrupted task resume where it stopped instead of starting over.
- Do not: Leave screens without a title or a way out, or run a multi-step flow with no sense of progress or review.
- Why: Orientation, progress, and an exit lower anxiety and abandonment. (NNGroup wayfinding and progress-indicator research; Nielsen heuristic 3; goal-gradient effect (Hull 1932; Kivetz, Urminsky and Zheng 2006): people speed up as the goal comes into view; Zeigarnik effect (Zeigarnik 1927): unfinished tasks stay on the mind, so a resumable task is less likely to be abandoned)
- Not when: a focused full-screen step such as payment in progress, where leaving would lose state; say how to cancel instead
- Trade-off: a persistent title and back path take vertical space on small screens
- Check: heuristic_eval H-03

### RX-UX-06 [Contextual] Search, filter, and sort that match the hunt

- When: a list or catalog is longer than a screen or two
- Do: Offer search, filters, or sorting that match how users look for items, show active filters, and give a one-step way to clear them.
- Do not: Add every possible filter, or hide which filters are applied.
- Why: Users narrow by the attributes they care about; invisible filters cause "missing" items. (NNGroup filtering and faceted search research)
- Not when: the list fits in a screen or two; filters slow down scanning
- Trade-off: each filter is UI to maintain and can hide items users expect to see
- Check: review

### RX-UX-07 [Contextual] Ask for sign-in when it is needed

- When: a flow asks for an account (checkout, saving, history)
- Do: Let users browse and build a cart first, then offer fast sign-in (OTP, WhatsApp, Google) or a guest path at the point it is needed.
- Do not: Force account creation before the user can see or try anything.
- Why: Early forced registration is a well-documented cause of abandonment. (NNGroup and Baymard checkout research)
- Not when: the core value requires an identity from the start (banking, a personal ledger)
- Trade-off: late sign-in can lose a cart or draft if it is not carried over
- Check: review

### RX-UX-08 [Preferred] Recognition over recall

- Do: Show options and context (recent items, saved addresses, visible choices) instead of asking users to remember them.
- Do not: Make users retype or recall information the app already has.
- Why: Recognizing is easier and less error-prone than remembering. (Nielsen heuristic 6 (1994); limited working memory (Miller 1956; Cowan 2001))
- Not when: a one-time task, where showing history or saved values adds clutter
- Trade-off: higher visual density; more on screen to scan
- Check: heuristic_eval H-06

### RX-UX-10 [Required] Change what is broken, keep what works

- Do: Before changing an existing screen or flow, list what works today (from Analyze, the user, or analytics) and keep it. Every significant change names the problem it fixes and its evidence (a Critique finding, a user report, a metric); a pattern with no named problem stays as it is. Report what was kept as well as what changed.
- Do not: Replace a working layout, component, or interaction for novelty; restyle parts the brief did not ask to change; or treat "more modern" as a problem by itself.
- Why: A redesign that throws away what people already know costs them relearning and can make the product worse while looking newer. (ryux design principle (owner, 2026-10-19); Jakob's law (people expect a product to work like the ones they already know); ryux run: judge and motion benchmarks 2026-10-18; written for RYUX)
- Not when: a new product or screen with nothing to keep, or a brief that asks to replace the whole design
- Trade-off: a redesign can look less new; the gain is in fewer regressions and less relearning
- Check: the change list, each with its problem and evidence; the kept list; review
