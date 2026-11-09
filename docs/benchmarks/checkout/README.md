# Checkout from a one-sentence brief: no skill vs RYUX 2.22.7

The kind of brief people really type: the product and the screen, nothing else. No price, rule, user research, or
visual direction. The question: what does the agent put on the screen for what nobody told it?

## Setup
- **Brief** ([prompt.txt](prompt.txt)): "Design the checkout screen for Sejuk, an iOS app in Jakarta for booking an AC
  service technician to come to your home. One screen, 390 wide, in this empty Figma file. Work only in that file.
  Write the copy in English." The RYUX side gets "Use the ryux skill." before it.
- **Agent:** Claude Code `claude -p`, Opus 5.5, Figma connector, one new empty Figma file per run, global skills moved
  aside. One run per side (2026-11-09).
- **Reply rule:** a turn that ends without a 390-wide frame gets [reply.txt](reply.txt) once ("Go with the direction you
  recommend and build the page."). If the Figma connector drops, the run is resumed with "The Figma connection is back.
  Continue where you stopped and finish the task in the same file." (recorded below).
- **Criteria, written before the runs:** the owner rates the two clean screens blind (letters shuffled, no markers),
  1 to 5 on fit to product and users, honesty, copy, visual direction, craft, and states; a fresh AI counter, blind to
  the side, lists every product fact the brief does not give; `ryux scan` checks the screen text. Markers go on the image
  only after the rating.

## Results

| | No skill | RYUX 2.22.7 |
| --- | --- | --- |
| Fit to product and users | **5** | 4 |
| Honesty | 1 | **5** |
| Copy | 4 | 4 |
| Visual direction | 2 | **4** |
| Craft | 4 | 4 |
| States | 1 | **5** |
| **Mean** | 2.83 | **4.33** |
| Invented facts (blind counter) | 16 | 2 |
| `ryux scan` findings | 0 | 0 |
| Asked first | no | yes |
| Cost | $1.08, 3 min | $7.89, 3 turns |

- **No skill** built one long screen in 3 minutes, with a per-unit price, what each unit includes, a 90-minute
  duration, a GoPay balance, promo SEJUKHEMAT, a transport fee, a service fee, a 30-day cooling warranty, free
  cancellation until 11:00, and Terms of Service. Its final message called the prices, address, dates and promo code
  "sample data I made up"; the screen does not say so. No other states.
- **RYUX** asked first: three visual directions in the file, then how the price is set, how people pay, and what the
  screen may promise. After the reply it used its recommended answers as assumptions, labelled the price ("Sample price.
  Per-unit pricing not decided") and payment methods ("proposed, not decided") on the screen, and showed no fee,
  promo, warranty, or cancellation rule. It built five states (prices loading, price failed, paying, payment failed,
  slot taken) and a 360 check, and wrote five design-rationale annotations. The counter still found two details the
  brief did not give: "Split AC, wall-mounted" and the arrival window "13:00–15:00".
- **Deviation:** the reply turn hit a dropped Figma connector and built nothing; the resume turn built the screen.

## What the owner noted
- RYUX: the "not decided" chips sit inside the UI and compete with the content; they belong in Figma annotations
  outside the frame. The header is tall for a checkout. The "time no longer available" message should carry the direct
  action.
- No skill: fits the AC service domain best (what each unit includes, the 2 PK limit, parking note), but every number
  and policy on it is made up and would read as a business decision in review. The visual direction is a generic iOS
  list.

![No skill vs RYUX, checkout](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/showcase--h2h-1-checkout.jpg)

One run per side: these numbers describe these two runs, not rates.
