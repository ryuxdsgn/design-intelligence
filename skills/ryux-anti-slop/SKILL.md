---
name: ryux-anti-slop
description: "RYUX Anti-slop: hard gates, purpose gates, quality locks, honest claims. Load when work is about to be delivered, or during visual refinement."
---

# ryux-anti-slop: Anti-slop

> Group Quality · Delivery Gate area ANTI-SLOP · RX-2.0. Levels are defined in `ryux-core`.

Anti-slop is not a list of banned styles. It has three parts.

**Hard Gates**: reject or fix before delivery; no written exception. The list is generated below
from the rules.

**Purpose Gates**: these patterns are allowed when they have a purpose. For each one in the
result, ask **"Why does this exist?"** If there is no meaningful reason, remove it.

**Quality Locks**: consistency that must hold across the product (listed below).

## Hard Gates

| Hard Gate | Rules |
| --- | --- |
| Fake data or fake metrics | RX-AS-01 |
| Fake testimonials or people | RX-AS-02 |
| Invented business rules or product requirements | RX-PR-02, RX-FE-02 |
| Placeholder copy shipped as final | RX-AS-03 |
| Fake urgency or scarcity | RX-AS-04 |
| Missing critical states | RX-EC-01 |
| Broken responsive behavior | RX-RD-01 |
| Accessibility failures | RX-A11Y-01, RX-A11Y-02, RX-A11Y-03, RX-A11Y-04 |
| Unclear primary action | RX-PR-03 |
| Unexplained interaction behavior | RX-IX-01 |
| Duplicate components | RX-DS-01 |
| Unnecessary complexity | RX-AS-06 |

## Purpose Gates

| Pattern | Acceptable when |
| --- | --- |
| Cards | they group related content or separate items the user compares or acts on individually |
| Gradients | they carry the brand, show emphasis, or encode a value (a scale or progress) |
| Illustrations | they explain a concept, an empty state, or a step that words alone do not |
| Decorative icons | they speed recognition of a repeated item or action, next to a text label |
| Pills | they show a filter, a selectable option, or a short status |
| Badges | they show a count or status the user acts on |
| Shadows | they show elevation that matters: an overlay, a draggable or floating element |
| Large display type | it carries the single most important message of a page |
| Animation | it communicates state, continuity, feedback, or spatial relationships |
| Unusual layouts | the content or task genuinely differs from standard patterns |
| Generous whitespace | it separates groups or slows a high-stakes decision, not when it hides thin content |
| Borders | they separate regions that spacing alone cannot |
| Rounded containers | the rounding follows the system radius and the container groups something |

## Quality Locks

| Quality Lock | Rules |
| --- | --- |
| Spacing | RX-UI-03, RX-DS-03 |
| Typography | RX-UI-03, RX-DS-03 |
| Color roles | RX-UI-04 |
| Terminology | RX-CD-05 |
| Components | RX-DS-02 |
| Interaction patterns and states | RX-DS-02 |
| Responsive behavior | RX-RD-06 |
| Visual hierarchy | RX-UI-01 |

## Evidence from RYUX Knowledge

Real screens show what real products do instead of invented numbers and urgency: `search_screens`; heuristic findings via `heuristic_eval`. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `ryux-core`.

## Rules

### RX-AS-01 [Required] [Hard Gate] Only real numbers

- Do: Show counts, ratings, growth, and statistics only with a real source; otherwise leave them out or mark [REAL DATA].
- Do not: Invent "48.000+ users", "4,8★", or "+12%".
- Why: Invented numbers are false claims, however polished the page. (ryux run 2026-10-02: pen.dev landing without ryux)
- Check: review

### RX-AS-02 [Required] [Hard Gate] No invented people

- Do: Use testimonials, names, and faces only when they are real and consented.
- Do not: Make up testimonials, reviewers, or customer photos.
- Why: Fake people are fake endorsements. (ryux anti-slop principle)
- Check: review

### RX-AS-03 [Required] [Hard Gate] Placeholders look like placeholders

- Do: Mark temporary content clearly: [REAL DATA], [LOGO], "Contoh data".
- Do not: Ship placeholder copy or data disguised as final.
- Why: Disguised placeholders ship by accident. (ryux anti-slop principle)
- Check: audit_copy C-01

### RX-AS-04 [Required] [Hard Gate] No fake urgency

- Do: State a deadline or a quota only when it is real, as a plain fact.
- Do not: Write "sebelum kehabisan", "kuota terbatas", or fake countdowns with nothing behind them.
- Why: Manufactured pressure erodes trust once users notice. (NNGroup credibility research; ryux run 2026-10-02: WhatsApp promo)
- Check: review

### RX-AS-05 [Required] Decoration passes a purpose gate

- Do: For each potentially decorative pattern, answer "why does this exist?" with a real reason (grouping, emphasis, state, brand), or remove it.
- Do not: Keep cards, gradients, badges, shadows, or animation that have no reason.
- Why: Unjustified decoration is what makes AI-generated UI look the same. (ryux anti-slop principle)
- Check: review

### RX-AS-06 [Required] [Hard Gate] Complexity with a reason

- Do: Remove elements, options, states, code paths, abstractions, and dependencies that serve no stated need.
- Do not: Add settings, sections, abstractions, or packages "for later", or features because similar products have them.
- Why: Unneeded complexity costs every user and every future change. (Nielsen heuristic 8; clean-code practice)
- Check: review

### RX-AS-07 [Required] Claims match the evidence

- Do: Describe what was checked and how ("keyboard and focus checked; no automated accessibility test was available"). Call a reference an observed pattern, with where it was observed ("seen in 4 screens across 3 apps").
- Do not: Claim "pixel perfect", "fully accessible", "production ready", "senior-level", or "UX optimized" without evidence, or call a pattern "best practice" because real apps use it.
- Why: False confidence hides the work that is still needed. (ryux delivery principle)
- Check: review

### RX-AS-08 [Required] Human designer notes

- Do: Have a person write the "why it works / weaknesses" judgment; an agent may summarize it.
- Do not: Let an agent author designer notes.
- Why: The human judgment is the point of the notes. (ryux data principle)
- Check: review
