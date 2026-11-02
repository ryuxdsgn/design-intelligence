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

## Round 3: Impeccable vs RYUX′ (RYUX with RX-UI-26), three runs each

Protocol: the round 3 amendments in [`PROTOCOL.md`](PROTOCOL.md). RYUX′ is RYUX at branch `ryux/rx-ui-26` (8d61fd5):
RX-UI-26 ("with no direction given, commit to a grounded one, not the safe one") and the revised RX-UI-10. Same
brief, skills called by name, checked in every transcript, a new empty Figma file, letters drawn again, rated blind by
the owner in one sitting. The success criteria were locked before the runs.

| Area | I1 | I2 | I3 | **Impeccable mean** | P1 | P2 | P3 | **RYUX′ mean** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Context Fit | 3 | 3 | 1 | **2.33** | 3 | 3 | 2 | **2.67** |
| Originality | 4 | 5 | 4 | **4.33** | 2 | 3 | 2 | **2.33** |
| Restraint | 2 | 2 | 2 | **2.00** | 3 | 3 | 3 | **3.00** |
| Visual Hierarchy | 4 | 3 | 3 | **3.33** | 3 | 4 | 4 | **3.67** |
| Consistency | 4 | 4 | 4 | **4.00** | 4 | 4 | 4 | **4.00** |
| Production Plausibility | 3 | 3 | 3 | **3.00** | 3 | 3 | 3 | **3.00** |
| AI-Slop Resistance | 4 | 4 | 3 | **3.67** | 2 | 3 | 1 | **2.00** |
| Intentionality | 3 | 3 | 3 | **3.00** | 3 | 4 | 3 | **3.33** |

Blind letters: I1 F, I2 L, I3 H, P1 R, P2 J, P3 D.

**The locked criteria:**

1. RYUX′ slop resistance at least Impeccable's minus 0.33 (3.33): **fails**, 2.00.
2. RYUX′ originality at least 3.00: **fails**, 2.33.
3. RYUX′ restraint at least 3.00: holds, 3.00.
4. No RYUX′ run shows a fact the brief never gave: holds, none found in three of three.

Against round 2 (same rater, a different set, so read as direction only): RYUX slop resistance 1.33 → 2.00,
originality 1.67 → 2.33, intentionality 2.67 → 3.33; Impeccable 4.00 → 3.67 and 4.33 → 4.33. The slop gap narrowed
from 2.67 to 1.67 points but did not close. The best RYUX′ run (P2, 3) only matches the weakest Impeccable run (I3).

| | I1 | I2 | I3 | P1 | P2 | P3 |
| --- | --- | --- | --- | --- | --- | --- |
| Asked first | no | no | no | yes | yes | yes |
| Cost | $6.96 | $5.90 | $6.97 | $4.26 | $4.44 | $3.63 |
| Minutes | ~23 | ~19.5 | ~20 | ~13 | ~12.5 | ~11.5 |
| Concept | *mahar* dowry frame | *nota emas* carbon-copy receipt | batik prada, 100 dots = 1 g | gold-shop receipts stacking to grams | gold shop + savings passbook | gold-shop receipt + gram ruler |
| Fonts | Gloock, Hanken Grotesk, Marcellus SC | Big Shoulders Display, Public Sans, Kalam | Gloock, Hanken Grotesk, Geist Mono | Fraunces, Plus Jakarta Sans | Gloock, Public Sans | Gloock, Archivo |
| Named the declined default and a signature | — | — | — | yes | yes | yes |
| Facts shown as given | many: vault in your name, sell back, minted bar delivered, no minimum bar size | few: weighed to the milligram (flagged on the page) | some: backed by physical gold, bars and sell-back as features (details bracketed) | none | none | none |

**What this says about RYUX:**

- **RX-UI-26 changed the behaviour, not enough of the result.** Every RYUX′ run named the default it declined
  (the quiet off-white fintech look) and a signature element, and Plus Jakarta Sans as the only family is gone. But
  all three landed on the same direction: an Indonesian gold shop, cream paper and lacquer red, a display serif, a
  receipt or passbook, near-identical hero copy ("Gold, a little at a time." twice). The rule moved RYUX off the
  category default onto one new default. Impeccable's three runs had three concepts.
- **Two of the three RYUX′ runs still recommended the safe look** in their first-turn questions and committed to a
  bold one only after the "use your own judgment" reply.
- **RYUX kept:** no fact made up in three of three (Impeccable made up some in all three), more restraint, about
  62% of the cost and time.
- **Next, per the protocol:** criteria 1 and 2 failed, so RX-UI-26 does not go into a release as is, and the next
  step is option B: a mechanism that varies the direction between runs instead of a rule the model applies the same
  way each time. Tested the same way, in a round 4.

**Scope:** three runs per arm on one brief and one model; one rater, the owner, who leads RYUX. I1 ran on the first
claude.ai account and the other five on the second; two runs were cut by the account limit and rerun from the start
(see the protocol).

## Round 5: Impeccable vs RYUX after the owner trials, three runs each

Protocol: the round 5 section in [`PROTOCOL.md`](PROTOCOL.md). RYUX is branch `ryux/direction-discovery` at 389fc08:
direction discovery with style tiles (RX-PR-13, RX-UI-26), concept as a system (RX-UI-27), official marks
(RX-UI-28), the craft floor (RX-UI-29), made imagery (RX-UI-30), palette roles (RX-UI-31), and one page, one world
(RX-UI-32), written over nine owner trials. Impeccable 4.8.0. Same brief with the product facts the RYUX trials asked
for ([`prompt-r5.txt`](prompt-r5.txt)); a run that stopped to ask got one fixed reply naming a sealed option number
([`reply-r5.txt`](reply-r5.txt)). Skills called by name and checked in every transcript, letters drawn before the
runs, rated blind by the owner in one sitting, criteria locked before the runs.

| Area | I1 | I2 | I3 | **Impeccable mean** | R1 | R2 | R3 | **RYUX mean** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Context Fit | 4 | 3 | 1 | **2.67** | 2 | 4 | 4 | **3.33** |
| Originality | 5 | 4 | 4 | **4.33** | 4 | 3 | 3 | **3.33** |
| Restraint | 3 | 3 | 3 | **3.00** | 3 | 3 | 3 | **3.00** |
| Visual Hierarchy | 3 | 3 | 2 | **2.67** | 3 | 4 | 4 | **3.67** |
| Consistency | 2 | 2 | 3 | **2.33** | 4 | 4 | 4 | **4.00** |
| Production Plausibility | 3 | 3 | 2 | **2.67** | 3 | 4 | 3 | **3.33** |
| AI-Slop Resistance | 4 | 4 | 3 | **3.67** | 2 | 3 | 3 | **2.67** |
| Intentionality | 3 | 3 | 2 | **2.67** | 3 | 3 | 3 | **3.00** |

Blind letters: I1 K, I2 L, I3 H, R1 V, R2 S, R3 Y.

**The locked criteria:**

1. RYUX slop resistance at least Impeccable's minus 0.33 (3.34): **fails**, 2.67.
2. RYUX originality at least Impeccable's minus 0.33 (4.00): **fails**, 3.33.
3. RYUX restraint at least 3.00: holds, 3.00.
4. No RYUX run shows a fact the brief never gave: holds, none found in three of three (sample figures labeled).
5. Store badges on the first screen at 1440 and at 390 by 844 in every RYUX run: holds (badge tops at y 496–612 on
   desktop, 328–390 on mobile). Every Impeccable run held it too.

Against round 3 (same rater, a different set, so read as direction only): RYUX slop resistance 2.00 → 2.67,
originality 2.33 → 3.33; Impeccable 3.67 → 3.67 and 4.33 → 4.33. Both gaps narrowed to one point and neither closed.
By pair, slop resistance: I1–R1 4 v 2, I2–R2 4 v 3, I3–R3 3 v 3. RYUX now rates higher in context fit, hierarchy,
consistency, production plausibility, and intentionality.

| | I1 | I2 | I3 | R1 | R2 | R3 |
| --- | --- | --- | --- | --- | --- | --- |
| Asked first | no | no | no | yes, style tiles | yes, style tiles | yes, style tiles |
| Cost | $5.34 | $5.98 | $4.77 | $7.53 | $9.28 | $7.97 |
| Minutes | ~22.5 | ~22.5 | ~18 | ~16.5 | ~25 | ~20 |
| Concept | kawung batik, one motif per 0.25 g | wayang gunungan and a phone puppet | yellow receipt and download coupon | celengan filled in layers | celengan grown up, cut-away jar | gram by gram, cobalt, gram ruler |
| Base surface | dark indigo | pale grey-green | saturated yellow | warm blush | warm blush | cobalt |
| Fonts | Bricolage Grotesque, Figtree | Kalnia, Hanken Grotesk | Martian Mono, Schibsted Grotesk | Fraunces, Figtree | Fraunces, Nunito Sans | Bricolage Grotesque, Instrument Sans |
| Facts shown as given | none | none | none | none | none | none |

Costs are the sum of a run's turns; R2's cost leaves out the first attempt cut by the limit (about $5).

**What this says about RYUX:**

- **The trials moved the page, not the slop read.** Blind, RYUX's pages are now the more coherent and plausible
  ones (consistency 4.00 v 2.33, hierarchy 3.67 v 2.67), but the rater still reads them as more generic, and the
  best RYUX run on slop (3) only matches the weakest Impeccable one.
- **The convergence moved up one level.** All three RYUX runs offered nearly the same three directions (a calm
  ledger or fintech look, a celengan, "Gram by Gram"), and two of the three built the celengan, with the same serif
  (Fraunces) and a warm blush base. Impeccable's three runs had three unrelated concepts.
- **A rule was missed.** R3's chosen direction made the gram ruler its signature, a first idea RX-UI-27 tells the
  model to drop for gold.
- **R1's options were numbered two ways.** Its message listed the celengan as 1, while its own question and the
  Figma tiles called it 2; the reply "option 1" was read as the celengan. Option text must use one numbering.
- **Impeccable no longer made facts up** in this round, with the product facts in the brief; RYUX cost about 54%
  more, mostly the extra turn.
- **Next, per the protocol:** criteria 1 and 2 failed, so the branch is not merged or released, the README's claim
  stays as round 3 states it, and the gap is read from the transcripts before any new rule.

**Scope:** three runs per arm on one brief and one model; one rater, the owner, who leads RYUX and ran the nine
trials that shaped this branch. I1, R1, and I2 ran on the first claude.ai account; R2 was cut by the account limit and
rerun from the start, and R2, I3, and R3 ran on the second (see the protocol).

**After round 5:** the transcripts and the owner's read led to four more changes, tried in owner trials T10 to T12
(2026-11-02, one run each, rated by the owner, not blind): ideas from three sources, one from the audience's
culture and place; one focal subject per section at most twice; one medium or a named mix per page with an asset
spec; and design rationale, annotated on the canvas. The owner's read of T12: "jauh lebih baik". On the owner's
decision these shipped in 2.22.0 without a blind round; the comparison with Impeccable above still stands as the
latest blind result, and a round 6 is planned.
