# Anti-slop

Stops generic AI output before it ships: no invented numbers or people, decoration with a purpose, and honest claims.

> Group Quality · Delivery Gate area ANTI-SLOP · RYUX 2.5.0. Levels are defined in `SKILL.md`.

Anti-slop runs last, after design, build, critique, and QA; it is the final quality gate, never the
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
| Unclear goal or competing actions | RX-PR-03 |
| Unexplained interaction behavior | RX-IX-01, RX-IX-12 |
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
| Typeface choice | it is chosen for the product's character and legibility, not because it is the model's usual pick |
| Background patterns (grid, dots, noise) | they carry the identity or support the content, such as a canvas for a design tool |
| Arrows on buttons | the action moves the user somewhere (next step, another page), not on every button |
| Glass and blur | one surface needs to show what is behind it (an overlay over content), and text on it keeps its contrast |
| Glow | it marks the one element that needs attention, not every card, button, and icon |
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
| Radius | RX-UI-03, RX-DS-03 |

## Evidence from RYUX Knowledge

Real screens show what real products do instead of invented numbers and urgency: `search_screens`; heuristic findings via `heuristic_eval`. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `SKILL.md`.

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
- Do not: Write "only 2 left", "offer ends tonight", or fake countdowns with nothing behind them.
- Why: Manufactured pressure erodes trust once users notice. (NNGroup credibility research; ryux run 2026-10-02: WhatsApp promo)
- Check: review

### RX-AS-05 [Required] Decoration passes a purpose gate

- Do: For each potentially decorative pattern, answer three questions: purpose (what does it do?), contribution (what does it add to understanding, interaction, or the product's character?), and necessity (would something simpler do the same?). Keep it only when all three have a real answer. Three feature cards pass when the features are equal and compared; when one matters more, give it more weight instead.
- Do not: Keep cards, gradients, badges, shadows, or animation that have no reason, or accept "it looks more interesting" as one.
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

### RX-AS-09 [Contextual] Clean is not the same as designed

- When: the surface is expressive: a hero, landing page, onboarding, empty state, or brand moment
- Do: Run the swap test honestly: replace the name and logo with a competitor's in the same category. If the layout, the visual, and the headline would still work for them, the surface has no point of view yet; give it one (RX-UI-12). Report the answer in the Delivery Gate.
- Do not: Treat a tidy, generic layout as done because it passes every other gate; generic restraint is slop too.
- Why: Removing slop is the floor, not the ceiling; interchangeable design makes the product forgettable. (ryux delivery principle; Critique Design Read: specificity)
- Not when: task UI, where familiarity is the point
- Trade-off: takes a design decision, not only removals
- Check: swap test; review
