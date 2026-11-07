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

**Next:** find out why the image-model rule does not trigger on its own, and fix the icon concept check (one object
per service). Then run this benchmark again.
