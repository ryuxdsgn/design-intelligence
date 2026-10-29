# Explore, judge, critique (RYUX 2.8 → 2.9)

Three changes, each written down with its keep rule before any run, then rated blind by a product
designer with nine years of experience. Same model throughout, a fresh agent per run.

## Three directions before one design

**What changed.** On an expressive surface, RYUX now renders three directions as real frames, each
different in structure (what comes first, the layout, where the main action lives, type, colour),
rates them against the brief, and lets the user pick. Only the chosen one gets built out.

<a href="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--explore-judge--three-directions.png"><img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--explore-judge--three-directions.png" alt="Three wallet home directions from one pen.dev run: Counter with a pay block on top, Receipt with activity printed as a receipt, Pass with a card you tap to pay, and the Receipt direction built out" width="100%"></a>

**Brief:** a digital wallet home, "more personality while it stays trustworthy", in pen.dev.

- All three runs rendered three directions, and every pair of directions differed on 3 to 5 of the
  five structural axes. RYUX 2.8 built one concept straight away in all three runs.
- The designer found the directions to be useful, real choices in 2 of 3 sets.
- The designer picked a different direction than RYUX recommended in all three sets. That is why the
  pick is the user's: RYUX lays out the options and the trade-offs, the person decides.

<a href="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--explore-judge--wallet-home.png"><img src="https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--explore-judge--wallet-home.png" alt="Two finished wallet home screens: RYUX 2.8 on the left with a yellow Pay button in the bottom bar, RYUX 2.9 on the right with a receipt-style activity list and a Scan to pay button" width="62%"></a>

Final screens, shuffled and unlabeled: the designer shipped one from each side and neither in the
third pair. One pick praised a clear, centered pay button in the bottom bar, so RYUX 2.9.2 now allows
a centered action there when it is clearly not a tab.

## A hierarchy pass in Critique

**What changed.** Critique and Design check four things on every screen: each control sits next to
the data it changes, the main action reads as an action, no fact appears twice, and what the user
checks together is grouped. These came from the designer's own reasons for rejecting earlier screens.

On three screens with planted defects (three runs each, scored against a sealed key): "control far
from its data" was found in 4 of 6 cases, up from 0 of 6; repeated facts in 3 of 3, up from 2 of 3.
The other planted defects (contrast, fake urgency, number format, an unlabeled icon) stayed at 12 of
12, with no false findings.

## Motion, recorded

**What changed.** QA now drives every animated element in a real browser: open, close mid-way, open
and close fast, and the same with reduced motion, reading the animations instead of the code.

Five components (menu, dialog, toast, tabs, drawer) were built three times each without RYUX, with
2.8, and with the candidate, and recorded ([clips](survey/motion/)). On the measured criteria RYUX
was ahead of the plain agent (reversible dialogs and drawers 9 of 9 against 5 of 9, no layout-property
animation 15 of 15 against 11 of 15). The designer, watching the clips, preferred the plain agent's
motion in all five, for its easing and its sense of purpose. That is the next change: RYUX keeps
frequently used menus and tabs almost still, and the designer wants a short, reversible transition
there. The rule is being loosened and will be re-rated before it ships.

## Rating images

Everything the designer saw is in [`survey/`](survey/): wallet pairs and direction sets, and the
motion clips at normal and half speed. Sides and order were shuffled per item.

Three to six runs per condition, one model, one rater. Read the numbers as what happened in these
runs, not as a rate.
