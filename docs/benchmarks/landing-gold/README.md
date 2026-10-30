# Gold savings landing page: no skill, antislop, RYUX (and an Impeccable arm that ran RYUX 2.14.1)

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

## Correction, 2026-10-30: the Impeccable column is not Impeccable

Found while starting round 2, after the ratings below were given. Moving `~/.claude/skills` aside does not stop
Claude Code from syncing the account's claude.ai skills into the session. In the three skill arms that list held
`anthropic-skills:ryux`: an older RYUX, 2.14.1, uploaded to the owner's claude.ai account on 2026-10-23, as one
`SKILL.md` without its capability or knowledge files. The no-skill arm had none, because every skill was off.

- **M** had Impeccable installed, but the agent called `anthropic-skills:ryux` first, found only the router file,
  and never read Impeccable's `SKILL.md`. Impeccable's hook runs on code edits and never fired on Figma work. So
  M is **RYUX 2.14.1's router file alone**, with Impeccable present and unused. It is relabeled below.
- **K** (RYUX 2.21.0) and **T** (antislop) never called or read the synced skill; their results stand.
- Round 1 therefore has no Impeccable result. Round 2 is changed to isolate the account skills before it runs.

## Owner's blind rating (1–5)

| Area | No skill (P) | RYUX 2.14.1 router only, Impeccable unused (M) | antislop (T) | RYUX 2.21.0 (K) |
| --- | --- | --- | --- | --- |
| Context Fit | 3 | **5** | 2 | 4 |
| Originality | 3 | 4 | 4 | 4 |
| Restraint | 2 | 4 | 3 | 4 |
| Visual Hierarchy | 2 | **5** | 2 | 4 |
| Consistency | 3 | 4 | 4 | 4 |
| Production Plausibility | 4 | 4 | 4 | 4 |
| AI-Slop Resistance | 1 | **4** | 2 | 3 |
| Intentionality | 1 | 3 | 3 | 3 |

A profile per area, not a winner. M, RYUX 2.14.1's router file alone, rated highest or tied in every area, and
above RYUX 2.21.0 in three: Context Fit, Visual Hierarchy, and AI-Slop Resistance. No skill rated lowest, or tied
for lowest, in six of eight; Production Plausibility was 4 for every arm.

## What was counted

| | No skill (P) | RYUX 2.14.1 router (M) | antislop (T) | RYUX 2.21.0 (K) |
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

- **Helped:** no arm with a skill made up a fact; 2.21.0 kept unknowns visible as placeholders, put every text node
  on a text style and spacing and color on variables, and drew states and alternatives no other arm drew.
- **Did not help:** 2.21.0's visual result was rated below an agent that read only 2.14.1's router file, in Context
  Fit, Visual Hierarchy, and AI-Slop Resistance, at more cost ($3.37 v $2.28) and time (11.8 v 8.1 min). One run
  each; whether the full 2.21.0 load costs visual quality is a question, not a finding.
- **Open question:** three of four arms (no skill, antislop, RYUX 2.21.0) chose a cream background, a display serif,
  and gold; M chose Plus Jakarta Sans with monospaced gram figures and was rated the least AI-like.

## Scope

- One run per arm on one model and one brief: what happened once, not a rate.
- The rating is one rater, the owner, who also leads RYUX; blind labels were used for that reason.
- The account's claude.ai skills reached the skill arms; see the correction above.
- Each skill was installed the way its README recommends for one project; antislop's mode was set to `during`
  for its run so it would not stop to ask. Details in [`PROTOCOL.md`](PROTOCOL.md).
- Runs that listed pages saw the names of earlier runs' pages and variable collections; none opened another page.
- The original page "Uji" (`532:12011`) disappeared during run M; no run's code removed a page. The eight
  frames were copied to a new page "Uji" in the owner's file Ujicoba for rating.

## Round 2: Impeccable vs RYUX, three runs each

Protocol: the round 2 amendments in [`PROTOCOL.md`](PROTOCOL.md). Each skill called by name (`/impeccable` or
`/ryux` in front of the same brief), checked in every session transcript: the Impeccable runs loaded only
Impeccable 4.8.0, the RYUX runs only RYUX 2.21.0. A new empty Figma file; letters drawn again; rated blind by the
owner in one sitting.

| Area | I1 | I2 | I3 | **Impeccable mean** | R1 | R2 | R3 | **RYUX mean** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Context Fit | 2 | 3 | 3 | **2.67** | 3 | 2 | 3 | **2.67** |
| Originality | 4 | 4 | 5 | **4.33** | 2 | 2 | 1 | **1.67** |
| Restraint | 2 | 2 | 2 | **2.00** | 3 | 3 | 3 | **3.00** |
| Visual Hierarchy | 3 | 3 | 3 | **3.00** | 3 | 3 | 3 | **3.00** |
| Consistency | 3 | 3 | 3 | **3.00** | 3 | 3 | 4 | **3.33** |
| Production Plausibility | 3 | 3 | 3 | **3.00** | 3 | 4 | 3 | **3.33** |
| AI-Slop Resistance | 4 | 4 | 4 | **4.00** | 1 | 2 | 1 | **1.33** |
| Intentionality | 4 | 3 | 3 | **3.33** | 2 | 3 | 3 | **2.67** |

Blind letters: I1 G, I2 X, I3 U, R1 W, R2 V, R3 C. Pairs in run order: I1–R1, I2–R2, I3–R3.

**The decision rule, as locked:**

- Context Fit: does not hold (2.67 v 2.67).
- Visual Hierarchy: does not hold (3 v 3 in every run).
- AI-Slop Resistance: **holds**: Impeccable 4.00 v RYUX 1.33, higher in all three pairs.

Outside the three named areas, the same rule would also hold for Originality (4.33 v 1.67, three of three pairs),
and the other way for Restraint (RYUX 3 v 2, three of three). Round 1's Context Fit and Hierarchy gaps did not come
back; the slop gap did, and wider.

| | I1 | I2 | I3 | R1 | R2 | R3 |
| --- | --- | --- | --- | --- | --- | --- |
| Asked first | no | no | no | yes | yes | no |
| Cost | $6.33 | $5.80 | $6.77 | $3.08 | $4.00 | $3.81 |
| Minutes | ~20 | ~20 | ~23 | ~11 | ~13 | ~12 |
| Files written first | PRODUCT.md, DESIGN.md | PRODUCT.md, DESIGN.md | PRODUCT.md, DESIGN.md | — | — | — |
| Concept | savings envelopes | bank passbook, dot-matrix figures | woven thread | gram ruler, phone | sentence estimate | one-gram bar |
| Fonts | Bricolage Grotesque, Familjen Grotesk, Kalam | Unbounded, Hanken Grotesk, Doto | Hanken Grotesk, Bricolage Grotesque | Plus Jakarta Sans | Plus Jakarta Sans | Plus Jakarta Sans |
| Text on a style (desktop) | 0/92 | 0/179 | 0/112 | 0/94 | 53/55 | 57/57 |
| Facts shown as given | none found | some: allocated 24-karat bars, outside auditor, minted bars (names bracketed) | some: vault in your name, KTP check, bar delivery (most marked "confirm") | none | none | none |

**What this says about RYUX:**

- **Holds:** RYUX's landing pages read as AI-made and unoriginal next to Impeccable's (1.33 v 4.00 slop
  resistance; 1.67 v 4.33 originality). All three RYUX runs chose the same type family and a similar quiet palette;
  each Impeccable run chose its own concept, type, and color. Impeccable wrote a product and design brief to disk
  before designing; RYUX did not. Which of these causes the gap is a hypothesis for round 3, not a finding.
- **RYUX kept:** no fact made up in three of three (Impeccable two of three), more restraint, text styles in two
  of three, about 58% of the cost and time.
- **Next, per the protocol:** read what Impeccable's skill says about direction, typography, and slop; write
  RYUX's own rule for it (own text and numbering, nothing copied); test it in a round 3 with the same brief.

**Scope:** three runs per arm on one brief and one model; one rater, the owner, who leads RYUX and had seen round
1's mapping. Round 1 and round 2 scores are not compared with each other: the owner rated round 2 against a
different set. Round 2 ran on two claude.ai accounts (see the protocol).
