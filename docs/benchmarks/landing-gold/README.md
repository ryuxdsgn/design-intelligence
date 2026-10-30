# Gold savings landing page: no skill, Impeccable, antislop, RYUX

One short brief, sent once to four fresh agents: no skill, [Impeccable](https://github.com/pbakaus/impeccable),
[antislop](https://github.com/miqdadbadjuber/anti-slop), and RYUX 2.21.0. Each designed a landing page in desktop
and mobile in Figma, on its own page. The owner rated the eight frames blind (labels K, M, P, T, drawn at random)
before the mapping was opened. Protocol, locked before the first run: [`PROTOCOL.md`](PROTOCOL.md).

## The brief

[`prompt.txt`](prompt.txt), only the page name differing per run:

> Design a one-page marketing landing page for a gold savings app, in two versions: desktop and mobile. The app
> is for Indonesia: people buy and save gold in small amounts from their phone. Write the copy in English. Design
> it in Figma, on a new page named "{PAGE}" in this file: …

No arm asked a question, so [`reply.txt`](reply.txt) was never sent. Each run is one turn.

## Owner's blind rating (1–5)

| Area | No skill (P) | Impeccable (M) | antislop (T) | RYUX (K) |
| --- | --- | --- | --- | --- |
| Context Fit | 3 | **5** | 2 | 4 |
| Originality | 3 | 4 | 4 | 4 |
| Restraint | 2 | 4 | 3 | 4 |
| Visual Hierarchy | 2 | **5** | 2 | 4 |
| Consistency | 3 | 4 | 4 | 4 |
| Production Plausibility | 4 | 4 | 4 | 4 |
| AI-Slop Resistance | 1 | **4** | 2 | 3 |
| Intentionality | 1 | 3 | 3 | 3 |

A profile per area, not a winner. Impeccable rated highest or tied in every area, and above RYUX in three: Context
Fit, Visual Hierarchy, and AI-Slop Resistance. RYUX tied Impeccable in the other five. No skill rated lowest, or
tied for lowest, in six of eight; Production Plausibility was 4 for every arm.

## What was counted

| | No skill (P) | Impeccable (M) | antislop (T) | RYUX (K) |
| --- | --- | --- | --- | --- |
| Asked first | no | no | no | no |
| Cost / minutes | $2.82 / 10.2 | $2.28 / 8.1 | $2.43 / 6.5 | $3.37 / 11.8 |
| Figma tool calls | 25 | 13 | 15 | 23 |
| Sections | 11 | 6 | 7 | 7 |
| Facts shown as given that the brief never gave | about 15 kinds | none | none | none |
| How unknown facts appear on the page | made up | left out; phone figures labeled sample | `[REAL DATA]` everywhere, including the hero card | labeled sample price; a "Check the facts first" section with bracketed placeholders |
| Text on a text style (desktop, mobile) | 0/164, 0/155 | 71/71, 48/65 | 0/63, 0/60 | 75/75, 73/73 |
| Frames beyond desktop and mobile | components | components | components, menu open, price-card states | components, three hero directions, states (price loading, failed, stale; QR dialog; sticky bar; menu), notes for the team |
| Mobile | stacked, testimonials as a carousel | stacked | stacked, menu sheet | stacked, also tried at 320 |

No skill's made-up facts: a 4.8 rating from 210k reviews, 1.2 million users, Rp10.000 minimum, 24K 99.99%, Rp0
fees (the footer then mentions a spread), "licensed and supervised", LBMA bars in an insured Jakarta vault, an
audited reserve report (100.07%), three named testimonials, payment methods, e-KTP in three minutes, sell 24/7,
printing a bar, gifting, 24/7 support, and a company name.

## What this says about RYUX

- **Helped:** no made-up facts; unknowns shown on the page as placeholders the team must fill, not hidden; every
  text node on a text style and spacing and color on variables; states and alternatives no other arm drew.
- **Did not help:** the visual result. RYUX tied Impeccable in five areas and was below it in Context Fit, Visual
  Hierarchy, and AI-Slop Resistance. Its extra frames (three directions, states, notes) were not part of the
  rating and cost the most ($3.37, 11.8 min).
- **Open question, not a finding:** three of four arms (no skill, antislop, RYUX) chose a cream background,
  a display serif, and gold. Impeccable chose Plus Jakarta Sans with monospaced gram figures, and was rated the
  least AI-like and the best fit for Indonesia. Whether that typeface choice is why needs more than one run.

## Scope

- One run per arm on one model and one brief: what happened once, not a rate.
- The rating is one rater, the owner, who also leads RYUX; blind labels were used for that reason.
- Each skill was installed the way its README recommends for one project; antislop's mode was set to `during`
  for its run so it would not stop to ask. Details in [`PROTOCOL.md`](PROTOCOL.md).
- Runs that listed pages saw the names of earlier runs' pages and variable collections; none opened another page.
- The original page "Uji" (`532:12011`) disappeared during run M; no run's code removed a page. The eight
  frames were copied to a new page "Uji" in the owner's file Ujicoba for rating.
