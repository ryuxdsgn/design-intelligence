# Landing page in Figma: no skill vs RYUX 2.22.5

One brief for the Raja Emas gold savings app: a landing page in desktop and mobile, designed in Figma through the
Figma connector. Does the page fit its product, or read as a template?

## Setup
- **Brief:** [`prompt.txt`](prompt.txt), with the file link filled in. It is a made-up app for Indonesia. The brief
  confirms OJK supervision, Antam and UBS as gold partners, and physical delivery, and confirms no price or fee.
- **Arms:** two runs each, run one at a time.
  - **No skill:** skills and slash commands off.
  - **RYUX 2.22.5:** the skill installed in the folder.
  - Both arms: Opus 5.5, `claude -p`, the claude.ai Figma connector and no other MCP server. Each run had **its own
    new Figma file**, page "Raja Emas".
- **Reply rule:** a run that stopped before building a desktop frame got one reply,
  [`reply-direction.txt`](reply-direction.txt): "Go with the direction you recommend and build the page." One RYUX
  run stopped after three style tiles and asked which direction to build, and got that reply. The other RYUX run
  marked its recommended direction as provisional and built it. The no-skill runs built straight away.
- **Rating:**
  - The owner rated the four pages blind, letters shuffled, 1 to 5 in eight areas.
  - A fresh AI counter checked invented facts, the mobile layout, and the call to action.
- **Pass for RYUX (locked before the runs), all of these:**
  - owner mean at least equal;
  - invented facts not higher;
  - mobile designed in both RYUX runs.

## Results

| Area | No skill (2 runs) | RYUX (2 runs) |
| --- | --- | --- |
| Context fit | 3.0 | **4.0** |
| Originality | 2.0 | **4.0** |
| Restraint | 3.5 | 3.5 |
| Visual hierarchy | **4.0** | 3.5 |
| Consistency | 4.0 | 4.0 |
| Production plausibility | **4.0** | 3.0 |
| AI-slop resistance | 2.0 | **3.5** |
| Intentionality | 3.0 | **4.0** |
| **Mean** | **3.19** (3.13, 3.25) | **3.69** (3.63, 3.75) |

- **Invented facts:** none on any of the four pages. No page shows a price, fee, or minimum, which the brief did not
  confirm.
- **Sample data:**
  - The RYUX pages labelled their sample figures, and left dashed, named slots for the OJK, Antam, and UBS logos.
  - The no-skill pages showed balances and goals in the phone mock-up with no label, and drew their own store badges
    instead of the official ones.
- **Layout:** all four reflow for mobile. The store badges are the only page action.
- **Owner notes:**
  - The two no-skill pages read as the same "premium fintech" template: cream, gold italic serif, a phone with
    floating chips, a grid of icon cards.
  - RYUX 1 (celengan, the clay piggy bank) was the most local idea, and "No shop counter. No dress code." answers the
    fear of gold shops. RYUX 2 made the gram balance the hero, with how-it-works written like ledger lines.
  - RYUX lost on production: the "Sample data" labels and logo slots show on the design itself, and RYUX 2's hero
    has two overlapping phones, cut off on mobile.
- **Cost:** no skill $1.94 and $1.79; RYUX $4.94 and $8.48, including the direction step.
- **Result: all three criteria pass.**

### An earlier round was discarded
A first round put all four runs on separate pages of **one** Figma file. Later runs read the earlier pages: a no-skill
run reused the first one's components, and a RYUX run saw a no-skill page and steered away from it. Because the runs
were not independent, that round is not published; this rerun gave every run its own file.

| No skill 1 | RYUX 1 |
| --- | --- |
| ![No skill, run 1: desktop and mobile](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--landing-gold--no-skill-1.jpg) | ![RYUX, run 1: desktop and mobile](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--landing-gold--ryux-1.jpg) |
| **No skill 2** | **RYUX 2** |
| ![No skill, run 2: desktop and mobile](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--landing-gold--no-skill-2.jpg) | ![RYUX, run 2: desktop and mobile](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--landing-gold--ryux-2.jpg) |

The images are the top of each page, desktop and mobile, as exported from Figma; nothing was edited after the runs.

## Rerun with the RYUX 2.22.7 rules (PR #39)

After the round above, the marketing-page rules were fixed in
[PR #39](https://github.com/ryuxdsgn/design-intelligence/pull/39) (released in 2.22.7) and two RYUX runs were made on a
new brief: a landing page for Raja Emas, a made-up gold savings app for Indonesia. Four of the six locked criteria
passed. One prompt in Claude Code with the Figma connector:

```
Design a one-page marketing landing page for a gold savings app called Raja Emas, in two versions: desktop and
mobile. [...] It is for young first-job savers who save small amounts toward a goal and find gold shops
intimidating. Confirmed: supervised by OJK; gold partners Antam and UBS (their role is not stated); physical gold
delivery. No minimum, fee, or price is confirmed. [...] Design it in Figma, on a new page in this file: <Figma link>
```

1. **It proposes three directions.** Each starts from a different idea: *Benang Emas*, the songket cloth woven
   with gold thread, where each top-up adds a row; a goal jar filling up; and the first-salary envelope set aside
   every payday. This run could not stop to ask, so it picked the first and marked the choice provisional.
2. **It designs both widths** in that direction, with the official App Store and Google Play badges as the only
   action. The gram balance shows its Rupiah value beside it. Sample data, open rules, and missing logo files are
   Figma annotations, not labels on the page. No minimum, fee, or price appears, since none was confirmed.

<img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/showcase--raja-emas-2.22.7-page.jpg" alt="The top of the Raja Emas page at desktop and mobile: a deep maroon hero, 'Real gold, saved thread by thread.', the official store badges, 'Supervised by OJK', and a phone showing a wedding fund of 3.2 g with its Rupiah value and a woven gold motif filling 3 of 10 rows; below, 'No gold shop, no counter to walk up to.'" width="100%">

3. **It explains its decisions,** in its final message and as 50 Figma annotations on the frames. Three lines,
   word for word:

```
The four app actions sit in one woven panel instead of four equal cards, so they read as one product, in
  order from first buy to cashing out.
No duplicate download buttons. I removed a "Get the app" header button because the hero badges already do
  that job. On phones, a sticky bar takes over once the badges scroll away.
What I left out: no minimum, fee, price, FAQ or "free" claim, because none of those are confirmed.
```

4. **It asks what only you can answer,** first the number visitors want most: "What is the minimum buy?", then the
   partners' role, delivery terms, the store links, and the logo file.

One run. In the owner's blind rating it scored 3.75 of 5, against 3.44 for RYUX 2.22.5 on the same brief.
