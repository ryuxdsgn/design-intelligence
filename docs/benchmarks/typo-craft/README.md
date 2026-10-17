# Typography and craft (RYUX 2.9.1 vs 2.9.2)

One Build prompt, six fresh agents: three with RYUX 2.9.1, three with the build that added
RX-UI-14 (type that is set, not only sized) and RX-UI-15 (detail craft). Same model, same prompt,
each run in an empty folder. The criteria and the keep rule were written down before the first run.

<a href="typography-measure.png"><img src="typography-measure.png" alt="The same help paragraph from two runs: RYUX 2.9.1 at 91 characters per line, RYUX 2.9.2 at 75 characters per line" width="100%"></a>

## The prompt

[`prompt.txt`](prompt.txt): the Billing page of a team project-management app, as one HTML file,
with an intro, a plan summary, uppercase section labels, an invoices table, a payment method, and an
80-word help paragraph.

## How it is scored

[`score-type.mjs`](score-type.mjs) renders each page in Chromium at 1280 and 390 wide and measures:

| ID | Check | Pass |
| --- | --- | --- |
| T1 | Line length of paragraphs with 40+ words | at most 75 characters per rendered line |
| T2 | Line-height | body 1.35–1.7; text 28 px and up at most 1.3 |
| T3 | Small uppercase labels | letter-spacing above 0 |
| T4 | Amounts and numeric table cells | tabular figures |
| T5 | Type restraint | at most 3 weights and 2 families |
| T6 | Headings at 390 | no last line with one stranded word |
| T7 | Display text 32 px and up | letter-spacing 0 or tighter |
| C1 | Small icons beside text | centered within 2 px |
| C2 | Amount columns | right-aligned |

Checks that do not apply to a page are left out. Before any run, the scorer was tested on a planted
good page (9 of 9) and a planted bad page (0 of 9).

## Results

| Pair | RYUX 2.9.1 | RYUX 2.9.2 |
| --- | --- | --- |
| 1 | 4 of 6 · 90 characters per line, 4 weights | 5 of 6 · 92 characters per line |
| 2 | 5 of 7 · 91 characters per line, 4 weights | **7 of 7** · 75 characters per line |
| 3 | 5 of 7 · 90 characters per line, 5 weights | 5 of 7 · 77 characters per line, 4 weights |

- All three 2.9.1 runs sized paragraphs with `60ch` or `68ch`. CSS `ch` is the width of a zero, so
  those widths run to about 90 characters. Two of the three 2.9.2 runs switched to `30–34em`.
- Weights in use went from 4, 4, 5 to 3, 3, 4.
- Line-height, uppercase tracking, tabular figures, and right-aligned amounts were already right in
  every run on both sides.
- Every run built all sections, rendered its page before reporting, and said what it had not tested.

**Blind rating.** A product designer with nine years of experience compared each pair, desktop and
mobile, with the sides shuffled ([pair images](survey/)). They shipped the 2.9.2 page in 2 of 3
pairs, naming line length, hierarchy, and alignment as reasons.

## Run it yourself

```bash
pnpm install && pnpm --filter @ryuxdsgn/design-intelligence build
packages/cli/scripts/bench/run.sh B <empty folder outside any repo> docs/benchmarks/typo-craft/prompt.txt
PLAYWRIGHT_ROOT=$(npm root -g)/ node docs/benchmarks/typo-craft/score-type.mjs <folder>/index.html
```

`run.sh B` installs the RYUX build from this checkout into the run folder. The scorer needs
Playwright with Chromium; `PLAYWRIGHT_ROOT` points to the folder that has it installed.

The six pages are in [`runs/`](runs/), exactly as the agents wrote them.

Six runs, one model, one rater. Read the numbers as what happened in these runs, not as a rate.
