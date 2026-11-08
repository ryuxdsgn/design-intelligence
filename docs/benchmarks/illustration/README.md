# Illustration in Figma: no skill vs RYUX 2.22.5

"Sejuk" is a made-up iOS app for booking an AC technician in Jakarta. Each run makes:
- three service icons as one set, at 64 pt;
- an empty state, "Belum ada pesanan";
- a success state, "Teknisi sedang menuju rumahmu".

Each one is shown at real size on a 390-wide screen. The style is each run's own proposal.

## Setup
- **Brief:** [`prompt.txt`](prompt.txt). Any run that asked first would have got [`reply.txt`](reply.txt); none did.
- **Arms:** two runs each, one empty Figma file per run, run one at a time.
  - **No skill:** skills and slash commands off.
  - **RYUX 2.22.5:** the skill installed in the folder.
  - Both arms: Opus 5.5, `claude -p`, the claude.ai Figma connector.
- **Image model:** the brief does not ask for one. RYUX 2.22.5 has a rule (RX-UI-21) to direct an image model,
  through Figma's `generate_image`, instead of drawing by hand.
- **Rating:** the owner rated blind, letters shuffled, 1 to 5 per asset on concept, originality, art direction, craft,
  and fit at real size, plus cohesion.
- **Pass for RYUX (locked before the runs), all of these:**
  - mean at least equal;
  - craft at least equal;
  - no craft or fit score of 2 or lower;
  - cohesion at least equal.

## Results

| Dimension | No skill (2 runs) | RYUX (2 runs) |
| --- | --- | --- |
| Concept | **3.83** | 3.33 |
| Originality | **2.83** | 2.33 |
| Art direction | **3.83** | 3.67 |
| Craft | **4.17** | 3.83 |
| Fit at real size | **4.00** | 3.33 |
| **Mean** | **3.73** | 3.30 |
| Cohesion (icon set and product) | 3.75 | **4.25** |

- **Result: fails three of four criteria.** Mean, craft, and the no-2-or-lower check fail; cohesion passes.
- **Where RYUX lost:** one RYUX icon set drew "Cuci AC" and "Isi freon" as the same bottle, which failed concept and
  fit. The other RYUX empty state was the most generic, with no AC in it.
- **Where no skill lost:** one no-skill set put steam on the AC, which reads as "hot".
- **Image model:** all four runs drew vectors. No run used `generate_image`, so RYUX's rule did not trigger without
  being asked.
- **Cost:** no skill $1.26 and $1.24; RYUX $2.19 and $8.22. The $8.22 run lost its Figma connection after a
  usage-limit pause and was resumed in the same session.

| No skill 1 | RYUX 1 |
| --- | --- |
| ![No skill, run 1: home, empty, success screens](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--illustration--no-skill-1.jpg) | ![RYUX, run 1: home, empty, success screens](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--illustration--ryux-1.jpg) |
| **No skill 2** | **RYUX 2** |
| ![No skill, run 2: home, empty, success screens](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--illustration--no-skill-2.jpg) | ![RYUX, run 2: home, empty, success screens](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--illustration--ryux-2.jpg) |

**Earlier test:** before 2.22.5, the same brief was run with the image-model rule on a branch. That RYUX run drew
with Figma's `generate_image` and scored higher than no skill (owner-rated, not fully blind, one run per arm). It is
archived at
[`archive/illustration-direction-a-2.22.4`](https://github.com/ryuxdsgn/design-intelligence/tree/archive/illustration-direction-a-2.22.4/docs/benchmarks/illustration).
In this 2.22.5 benchmark the image model was never used.

## Rerun with the fix ([PR #36](https://github.com/ryuxdsgn/design-intelligence/pull/36), not released yet)

The fix changes two rules.
- **RX-UI-21:** look for an image tool and ask once about paid generation. If the agent cannot ask, it ends the
  turn with the question instead of drawing vectors.
- **RX-UI-18:** one object per icon in a set.

**Setup:** 2 new RYUX runs from the PR branch, each with an empty Figma file. They were rated blind against the same 2
no-skill runs, with letters shuffled again. The pass criteria were locked before the runs, the same as above, plus
these:
- each run calls `generate_image` or asks first;
- no two icons in a set share a main object.

**Reply:** a run that ended its turn with a question got one fixed reply: "Go with what you recommend and make them."

| Dimension | No skill (2 runs) | RYUX with the fix (2 runs) |
| --- | --- | --- |
| **Mean** (5 dimensions x 3 tasks) | 3.00 | **3.97** |
| Craft | 3.00 | **3.83** |
| Lowest craft / fit | 2 / 3 | **3 / 3** |
| Cohesion (icon set and product) | 2.75 | **3.75** |

- **Result: passes all criteria.**
- **Image model:** both runs asked about generation first, then used `generate_image` (5 and 9 images).
- **Icons:** each icon keeps the AC unit and adds its own action (water or brush, gauge, wrench).
- **Weak spot:** one empty state scored 2 on concept and art direction, the same weak spot as before.
- **Cost:** $2.70 and $7.95. About $3.90 of the second run's cost went to resumed turns where the Figma connector was
  missing.
- **Evidence:** two runs per arm, so it is thin.

| RYUX with the fix 1 | RYUX with the fix 2 |
| --- | --- |
| ![RYUX with the fix, run 1: home, empty, success screens](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--illustration--ryux-fix-1.jpg) | ![RYUX with the fix, run 2: home, empty, success screens](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--illustration--ryux-fix-2.jpg) |
