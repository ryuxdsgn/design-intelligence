---
name: ryux-ux
description: "Ryux UX architecture: information architecture, navigation, flows, grouping, disclosure, search and filters. Load when designing multi-screen flows, navigation, or data-heavy views."
---

# ryux-ux: UX architecture

> Group UX · Delivery Gate area UX · RX-2.0. Levels are defined in `ryux-core`.

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

Does not cover: per-action behavior (see ryux-interaction), forms (see ryux-forms), or states
(see ryux-edge-cases).

## Evidence from Ryux Knowledge

How Indonesian apps sequence and structure this flow: `get_flow` for a reference flow, `compare_apps` to compare steps across apps. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `ryux-core`.

## Rules

### RX-UX-01 [Required] Structure from the user's goal

- Do: Choose the information architecture and pattern from what users come to do and how they look for it.
- Do not: Apply a stock SaaS layout (sidebar, KPI cards, table) because it is familiar.
- Why: The right structure depends on the task; a template answers a different question. (NNGroup information architecture research)
- Not when: the product already has an established structure users rely on; change it only with evidence
- Trade-off: a less familiar layout can cost users a moment of learning
- Check: review

### RX-UX-02 [Preferred] Where am I, what's left, how do I leave

- Do: Give each screen a clear title and keep a back or cancel path visible; in multi-step flows show the current step ("Langkah 2 dari 3") and a summary the user can review before committing.
- Do not: Leave screens without a title or a way out, or run a multi-step flow with no sense of progress or review.
- Why: Orientation, progress, and an exit lower anxiety and abandonment. (NNGroup wayfinding and progress-indicator research; Nielsen heuristic 3)
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
- Why: Recognizing is easier and less error-prone than remembering. (Nielsen heuristic 6 (1994))
- Not when: a one-time task, where showing history or saved values adds clutter
- Trade-off: higher visual density; more on screen to scan
- Check: heuristic_eval H-06
