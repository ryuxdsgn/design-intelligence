---
name: ryux-ux
description: Ryux UX architecture: information architecture, navigation, flows, grouping, disclosure, search and filters. Load when designing multi-screen flows, navigation, or data-heavy views.
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

Does not cover: per-action behavior (see ryux-interaction), forms (see ryux-forms), or states
(see ryux-edge-cases).

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `ryux-core`.

## Rules

### RX-UX-01 [Required] Structure from the user's goal

- Do: Choose the information architecture and pattern from what users come to do and how they look for it.
- Do not: Apply a stock SaaS layout (sidebar, KPI cards, table) because it is familiar.
- Why: The right structure depends on the task; a template answers a different question. (NNGroup information architecture research)
- Check: review

### RX-UX-02 [Preferred] Where am I, how do I leave

- Do: Give each screen a clear title and keep a back or cancel path visible.
- Do not: Leave screens without a title or a way out.
- Why: Orientation and an exit lower anxiety and abandonment. (NNGroup wayfinding; Nielsen heuristic 3)
- Check: heuristic_eval H-03

### RX-UX-03 [Preferred] Group by meaning

- Do: Group content by what it means to the user (task, time, status) and label the groups.
- Do not: Group by how the data is stored or by visual symmetry alone.
- Why: Meaningful groups let people skip what is not relevant to them. (Gestalt proximity and common region; NNGroup)
- Check: review

### RX-UX-04 [Preferred] Progressive disclosure

- Do: Show what the current decision needs and put advanced or rare options behind a clearly labeled control.
- Do not: Show every option at once, or hide options people need often.
- Why: Disclosure keeps the main path simple without removing power. (NNGroup progressive disclosure)
- Check: review

### RX-UX-05 [Preferred] Steps and a reviewable summary

- Do: In multi-step flows, show the current step ("Langkah 2 dari 3") and a summary the user can review before committing.
- Do not: Run a multi-step flow with no sense of progress or no review.
- Why: Users commit more confidently when they see what is left and can check their choices. (NNGroup checkout and progress-indicator research)
- Check: review

### RX-UX-06 [Contextual] Search, filter, and sort that match the hunt

- When: a list or catalog is longer than a screen or two
- Do: Offer search, filters, or sorting that match how users look for items, show active filters, and give a one-step way to clear them.
- Do not: Add every possible filter, or hide which filters are applied.
- Why: Users narrow by the attributes they care about; invisible filters cause "missing" items. (NNGroup filtering and faceted search research)
- Check: review

### RX-UX-07 [Contextual] Ask for sign-in when it is needed

- When: a flow asks for an account (checkout, saving, history)
- Do: Let users browse and build a cart first, then offer fast sign-in (OTP, WhatsApp, Google) or a guest path at the point it is needed.
- Do not: Force account creation before the user can see or try anything.
- Why: Early forced registration is a well-documented cause of abandonment. (NNGroup and Baymard checkout research)
- Check: review

### RX-UX-08 [Preferred] Recognition over recall

- Do: Show options and context (recent items, saved addresses, visible choices) instead of asking users to remember them.
- Do not: Make users retype or recall information the app already has.
- Why: Recognizing is easier and less error-prone than remembering. (Nielsen heuristic 6 (1994))
- Check: heuristic_eval H-06

### RX-UX-09 [Preferred] The user's words and order

- Do: Use the terms and ordering users already know (ongkir, transfer, kelurahan before kecamatan).
- Do not: Put system terms such as SKU or transaction codes in the primary UI.
- Why: Familiar language and order remove a translation step for the user. (Nielsen heuristic 2 (1994))
- Check: heuristic_eval H-02
