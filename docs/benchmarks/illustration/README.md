# Illustration: no skill vs RYUX (2.20.0, 2.21.0, direction A)

Protocol: [PROTOCOL.md](PROTOCOL.md), locked before the first run (commit 1f3a197). Four asset families, two runs
per arm, 16 runs, 49 SVGs, 2026-10-29.

**In short:** across these runs RYUX 2.20.0 did not make better illustration. The rater scored it lower on five of
six dimensions and equal on cohesion; it was higher only on the mascot task. It cost about 1.8 times as much.
Its files were cleaner (no text in the art, no editor metadata, more of them passing the technical floor). Every
low score was an art-direction failure; none was a construction failure.

**Rerun (below):** with the illustration module and RX-UI-24, the gap to no skill narrowed from −0.32 to
−0.08 and no side scored low; empty states and the mascot moved ahead of no skill; Art direction did not
move, and the editorial got worse. See [Rerun: B′](#rerun-b).

**Direction A (below, 2026-11-07):** RYUX writes the concept and art direction, an image model draws, and RYUX checks
the result at display size. Owner-rated, this beat no skill in both runs: mean 4.18 against 2.82, then 4.18 against
3.12 with the shipped rule alone. Craft, the gap that stopped the vector approach, led 4.67 and 4.33 against 1.67 and
2.67. It shipped in 2.22.5 (RX-UI-21). See [Direction A in Figma](#direction-a-in-figma).

## Deviation from the protocol

The protocol asks for a blind rating by the owner. The scores here come from **Claude in Chrome, an AI rater**,
given the six protocol dimensions and the same blind sheets (it did not know which side was which), and the owner
reviewed and approved them. Read every visual result below as an AI rating approved by the owner, not as a
human designer's blind rating. One rating pass, no repeat to check the rater's consistency.

## Rated profile

Means over 8 sides per arm, 1 to 5.

| Dimension | No skill | RYUX 2.20.0 |
| --- | --- | --- |
| Originality | 3.50 | 3.12 |
| Art direction | 3.62 | 3.12 |
| Craft | 3.88 | 3.50 |
| Cohesion | 3.88 | 3.88 |
| Editability | 4.50 | 4.12 |
| Brief fidelity | 3.88 | 3.62 |

Per task, mean of all six dimensions:

| Task | No skill | RYUX 2.20.0 |
| --- | --- | --- |
| T0 icons | 4.00 | 3.33 |
| T1 empty states | 3.75 | 3.25 |
| T2 mascot | 3.75 | 4.17 |
| T3 editorial | 4.00 | 3.50 |

Two runs per cell: the spread between runs of the same arm is as large as the gap between arms (T1 no skill: A1
3.50, A2 4.00; the arm gap on T1 is 0.50). This is a direction to investigate, not a rate.

**Low scores (1 or 2):** two sides, both RYUX, both labelled art direction:
- T0 B2, Originality 2: stock pictograms; "crew list has no list, safety check has no check, weather window has
  no window".
- T1 B1, Art direction 2 and Brief fidelity 2: "the recipe box is full and the search scene shows several recipe
  cards, so the empty and no-results states read as full".

No score was labelled construction. Craft problems the rater did name (an arm joint that reads as a handle,
oversized shadows, a magnifier that reads as a pan, a bus lost against a same-coloured skyline) were scored 3 or
higher and are about drawing and composition rather than broken geometry.

## Deterministic floor

[`score-svg.mjs`](score-svg.mjs): a sound, editable file, not a measure of quality.

| | No skill | RYUX 2.20.0 |
| --- | --- | --- |
| SVG files | 23 | 26 |
| Pass the whole floor | 0 | 12 |
| Fixed `width`/`height` on the root | 23 | 13 |
| `<text>` inside the art | 2 (both editorial runs) | 0 |
| Editor metadata | 4 | 0 |
| Elements wholly outside the viewBox | 0 | 2 (T3 B1) |
| Embedded raster | 0 | 0 |
| Named groups | 99% | 97% |
| Elements per file, mean | 38 | 46 |

Editor metadata was first counted as 8: four more files only mention Inkscape in a comment, which
`score-svg.mjs` counted until it was corrected on 2026-10-29, after the scores were in; no pass changed.
The difference matches RX-UI-19 (a viewBox with no fixed size, no text inside the art). A fixed size is not
wrong for a 24 px icon on its own; it is counted because the rule asks for it.

## From the runs

| | No skill | RYUX 2.20.0 |
| --- | --- | --- |
| Cost, all 8 runs | $4.64 | $8.29 |
| Cost per run | $0.32–1.01 | $0.83–1.42 |
| Asked before drawing | 0 of 8 | 0 of 8 |
| Rendered and looked at its own work | 8 of 8 | 8 of 8 |
| Libraries installed | none | none |
| Separate dark file (mascot) | 1 of 2 | 2 of 2 |

Both arms rendered and inspected their art before finishing, so a render-and-look loop alone does not explain any
difference. No run installed a geometry or rendering library.

## What helped, what did not, what it introduced

- **Helped:** cleaner, more editable files (RX-UI-19); a dark variant for the mascot in both runs; the mascot, its
  one better family, where both runs made the kiln itself the character (T2 B1 and B2 4.17, A1 3.83, A2 3.67). The
  strongest editorial (the glowing route line) was a no-skill run, T3 A2.
- **Did not help:** concept specificity and brief fidelity. RYUX's rules on illustration say what the result must
  meet (a written style, one family, a themed asset), not how to reach a concept, and the low scores are concept
  failures: icons that do not show their meaning, empty states that look full.
- **Introduced:** higher cost (about 1.8x) with no rated gain on three of four families; two elements left wholly
  outside the artboard in one editorial run.

## What this means for the next step

- **Geometry tooling:** not supported by this baseline. No failure was construction, and no run reached for a
  geometry library. The case for a scene format, Paper.js, or a Figma plugin would need a failure this baseline did
  not show.
- **An illustration module:** the gap is art direction: a concept that shows the meaning (an empty state that is
  visibly empty, a "crew list" with a list), checked against the brief before drawing and again on the render.
- **Before claiming anything:** a blind rating by a human designer, ideally on the same 8 pairs, and more than two
  runs per cell.

Not done yet: the Figma import check (information only in the protocol).

Raw runs are kept locally (`~/bench-runs/illustration/`); rating sheets and the unsealed mapping are in
`knowledge/benchmarks/illustration/` (local). Mapping: pair-1 A1/B1, pair-2 B2/A2, pair-3 A1/B1, pair-4 A2/B2,
pair-5 A1/B1, pair-6 B2/A2, pair-7 A1/B1, pair-8 B2/A2 (X/Y).

## Rerun: B′

Protocol: the [amendment](PROTOCOL.md#amendment-2026-10-29-the-rerun-b) locked before the first B′ run.
B′ is RYUX from branch `ryux/illustration` (c903971): the new `illustration` module, RX-UI-24 (each
illustration shows its meaning, read on the render with the label covered), and SVG checks in `ryux scan`.
The A runs were reused and paired again with B′, X/Y drawn again and sealed. Rated by Claude in Chrome on
the six dimensions, approved by the owner, as in the baseline.

**The rater moved between passes.** The same A runs scored 3.88 in the baseline and 4.17 here. So B′ is
read against A in its own pass, not against B's numbers.

| Dimension | B − A, baseline | B′ − A, rerun | A, rerun | B′, rerun |
| --- | --- | --- | --- | --- |
| Originality | −0.38 | +0.38 | 3.62 | 4.00 |
| Art direction | −0.50 | −0.50 | 4.12 | 3.62 |
| Craft | −0.38 | −0.25 | 3.88 | 3.62 |
| Cohesion | 0.00 | −0.25 | 4.38 | 4.12 |
| Editability | −0.38 | +0.25 | 4.50 | 4.75 |
| Brief fidelity | −0.25 | −0.12 | 4.50 | 4.38 |
| Mean | −0.32 | −0.08 | 4.17 | 4.08 |

| Task | B − A, baseline | B′ − A, rerun |
| --- | --- | --- |
| T0 icons | −0.67 | −0.17 |
| T1 empty states | −0.50 | +0.25 |
| T2 mascot | +0.42 | +0.25 |
| T3 editorial | −0.50 | −0.67 |

**Low scores:** none (baseline: two, both art direction on RYUX's side).

**Against the criteria locked before the rerun:**
- B′ at or above A on Originality: met (4.00 vs 3.62).
- B′ at or above A on Art direction: **not met** (3.62 vs 4.12), the same gap as the baseline.
- No low score on an empty state or an icon's meaning: met.
- Cost no higher than B's: met ($8.22 vs $8.29, 33 minutes; no-skill A was $4.64).

**Floor:** 21 of 22 B′ files pass (B 12 of 26, A 0 of 23): no fixed size, no text, no metadata, no raster.
The one that does not is the C1 editorial: five building windows lie just past the right edge, a bleed,
not broken art.

**What the notes say:**
- The concept gap closed where it was aimed. The empty states read as empty and tell one story ("recipe
  box and tablecloth used across the set", "a slow cooker with its plug out for offline: the freshest
  idea"), and the kiln became the mascot in both runs.
- Composition did not. The editorial is "flat, heavy at the bottom", "reflections that look like
  poles", a route line "not readable at the edges"; the mascot is "symmetrical, static". RX-UI-24
  checks what each asset says, not how the picture is built around it, and no rule asks for a
  composition study on a single complex image.
- The rater counted editable text as a plus on a no-skill editorial (T3 A1); RX-UI-19 keeps text out
  of the art, so that point does not count against B′.
- The smoke run (T2, not scored, $1.84) showed the new loop working: three concepts written, then four
  parts redrawn after reading the render without labels (a hand that read as a jug handle, a pot that
  read as a bucket).

**Next, if the owner wants the art direction gap:** a composition step for single complex images
(editorial, hero, mascot scene): two or three thumbnail compositions by focal point, depth, and weight,
read at display size before detailing. Imagery already asks this for expressive surfaces
(Composition exploration); illustration does not point to it. A blind rating by a human designer
remains the missing evidence.

Raw B′ runs: `~/bench-runs/illustration/<task>/C1`, `C2`; sheets and the unsealed mapping in
`knowledge/benchmarks/illustration-rerun/` (local). Mapping (X/Y): pair-1 C1/A1, pair-2 C2/A2, pair-3
A1/C1, pair-4 C2/A2, pair-5 A1/C1, pair-6 C2/A2, pair-7 C1/A1, pair-8 C2/A2.

## Direction A in Figma

After B′, illustration stopped improving through rules for hand-drawn vectors: Art direction and craft did not
move. Direction A changes who draws. RYUX directs: one concept line per asset and one written style block pasted
into every prompt. An image model draws, through Figma's `generate_image`. RYUX then reads each image at display
size, with at most two regenerations. Criteria were locked before the first run (2026-11-06).

**Setup:**
- Product: "Sejuk", an iOS app for booking an AC technician in Jakarta. One empty Figma file per arm, global skill
  moved aside, arms run serially, each arm proposes its own style.
- Tasks: T1, three service icons as one set at 64 pt; T2, the empty state "Belum ada pesanan"; T3, the success state
  "Teknisi sedang menuju rumahmu".
- Arms: X, RYUX 2.22.4 plus one paragraph describing direction A (the rule did not exist yet); Y, no skill.
- Rerun X2: the rule itself (RX-UI-21 and a "Make it" stage) on a branch, with no extra paragraph, against the same Y.
- Rating: **by the owner**, 1 to 5 per asset, letters re-randomized for each round. Not fully blind: the owner
  ran both arms, and raster against vector is visible.

**Owner rating, mean of the three tasks:**

| Dimension | X (RYUX + paragraph) | X2 (rule only) | Y (no skill), round 1 | Y, round 2 |
| --- | --- | --- | --- | --- |
| Concept | 4.00 | 4.00 | 3.33 | 3.33 |
| Originality | 3.67 | 4.33 | 2.33 | 3.00 |
| Art direction | 4.33 | 4.00 | 2.67 | 2.33 |
| Craft | 4.67 | 4.33 | 1.67 | 2.67 |
| Fit at real size | 4.00 | 4.00 | 4.00 | 4.00 |
| Cohesion: icon set / one product | 4 / 5 | 4 / 5 | 3 / 3 | 3 / 4 |
| **Mean of all 17 scores** | **4.18** | **4.18** | 2.82 | 3.12 |

Y was rated twice, once against X and once against X2. The second time it scored higher on T1 and T2, which is
drift in one rater; RYUX still led.

**Against the criteria, both rounds:**
- RYUX mean at or above no skill: met.
- RYUX Craft at or above no skill: met.
- No RYUX Craft or Fit score of 2 or lower: met (lowest 4).
- RYUX Cohesion at or above no skill: met.

**What the runs show:**
- The owner on round 1: "X jauh lebih baik", while Y was stiff, poorly drawn, and used bold colour in too many
  hues, off the brand.
- Y's success screen invented an arrival time and same-day service. X's said no time is shown because none is
  confirmed.
- The empty-state concept is the repeated weak spot: no skill led on Concept for T2 in both rounds (4 against 3),
  though X2's T2 Craft was 5.
- Trade-off: generated images are raster, so they cannot be edited as vectors or re-themed by changing a colour
  variable. RX-UI-21 keeps SVG for system icons and for theme, animation, or editability needs. RX-UI-19 asks for a
  transparent background or one image per theme.

**Cost:**

| Run | Agent cost | API time | Images |
| --- | --- | --- | --- |
| X | $2.42 | 6 min | 8 Figma AI images |
| X2 | $2.49 | 6 min | Figma AI images |
| Y | $1.90 | 5 min | none; vector |

The X runs also used Figma AI credits.

**Deviations:**
- Y's agent used a mistyped file key. The owner sent "Continue", pasted the file URL again, and set a goal to
  continue; X got the prompt only. This is unequal in Y's favour.
- One run per arm per round, so the evidence is thin.

Raw outputs are in the Figma files and local rating pages, not in this repository.

