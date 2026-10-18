# Personal finance app: no skill vs RYUX 2.9.3

One short design brief, six fresh agents: three with no skill (A), three with RYUX 2.9.3 (B). Same
model, same harness, each run in an empty folder, designed in pen.dev on a cleared canvas. The
counts, the order of runs, and which pair goes in the README (run 1 of each side, whatever it
showed) were written down before the first run.

<a href="see-the-difference.gif"><img src="see-the-difference.gif" alt="Animation: the same brief; with no skill the agent draws right away, with RYUX it asks three questions first; then both sets of screens; close-ups with seven invented facts circled on the left and labeled assumptions on the right; seven states drawn on the right and none on the left; then the totals across three runs, and a follow-up turn on the RYUX side with its recorded success animation" width="100%"></a>

Still version: [`see-the-difference.png`](see-the-difference.png).

## The brief

[`prompt.txt`](prompt.txt):

> Design a personal finance app in pen.dev: the dashboard, a payment, and the payment success
> screen. Mobile. Flow inspiration: digital banks and e-wallets. Visual inspiration: super-apps for
> payments, rides, and travel.

A run that asked questions got one reply, the same for every run that asked:
[`factsheet.txt`](factsheet.txt) (a digital wallet, global and in English, USD as sample data,
brand and name not decided, "polished, trustworthy, and friendly", 390 wide). Runs that did not ask
got no second turn.

## What was counted

From the exported frames and each run's final message:

- **Asked first**: did the agent ask before drawing?
- **Facts shown as given that the brief never gave**: promotions, points, fees, credit limits,
  vouchers, services, delivery times.
- **States** beyond the three requested screens (loading, empty, offline, errors, other widths).
- **Comprehension**: a fresh agent sees only the dashboard image and answers three questions
  ([`questions.txt`](questions.txt)): how much is in the wallet, how to pay at a counter, and the most
  recent transaction.

## Results

| Run | Asked first | Screens | Shown as fact, never given | Market |
| --- | --- | --- | --- | --- |
| [A1](runs/A1.jpg) | no | 3 | coins (12.400, +430 earned), travel promo "10% back", PayLater "0% fee" and a limit, voucher code, "Service fee Free", ride, food, flights, hotels, insurance, ride offer "pickup in 4 min" | IDR, chosen without asking |
| [A2](runs/A2.jpg) | no | 3 | points (1,240), 5% cashback "within 24 hours", travel promo "10% back by 31 Oct", "No fees", ride, food, flights, hotels, insurance, ride offer "4 min away", a Rewards tab | SGD, chosen without asking |
| [A3](runs/A3.jpg) | no | 3 | points (12,480, +765), PayLater limit, voucher code, "Service fee Free", travel, insurance, investing, "30% off airport rides", ride offer "15% off", a monthly budget | IDR, chosen without asking |
| [B1](runs/B1.jpg) | yes, 3 questions | 3 + [7 states](runs/B1-other-frames.jpg): loading, empty, offline, processing, not enough balance, declined, 360 wide | none; fee "$0.00 is sample data", Face ID or PIN, saved billers, and the brand listed to confirm | USD sample, from the reply |
| [B2](runs/B2.jpg) | yes | 3 + [6 states and 360 wide](runs/B2-other-frames.jpg) | none; "No fee is shown, on purpose. Fees aren't decided"; added features listed as added | USD sample |
| [B3](runs/B3.jpg) | yes | 3 + [7 states, 360 wide, three dashboard directions](runs/B3-other-frames.jpg) | none; fees, failure wording, Face ID, and Share receipt listed as assumptions | USD sample |

- Asked before designing: A 0 of 3, B 3 of 3.
- Facts not in the brief shown as given: A 7 to 9 kinds per run, in 3 of 3; B none, in 3 of 3, with
  every assumption listed.
- States beyond the three screens: A none in 3 of 3; B 6 to 7 in 3 of 3.
- Comprehension: 3 of 3 questions in all six runs. Both sides produced dashboards a reader understood.

## Follow-up: one more turn on B1 (not part of the comparison)

After scoring, B1 got a third turn in the same session ([`turn3-b1.txt`](turn3-b1.txt)): the owner's
direction "more modern, simpler, and bolder", and an answer to B1's own question 3 on motion ("the
payment success moment should feel engaging, like a small celebration or a thank-you"). The pen.dev
canvas had been cleared, so the turn asked for a build instead: one HTML file with a clickable flow.

- RYUX saved the direction to [`DESIGN.md`](runs/B1-turn3/DESIGN.md) and built
  [`index.html`](runs/B1-turn3/index.html) (open it in a browser; `?screen=success` replays the
  celebration).
- Same facts and sample data as turn 2; the success heading became "Thanks, Maya!".
- The celebration plays once (760 ms: check, ring, 12 dots); amounts never move; reduced motion
  turns it into a fade.
- Its own QA: 69 of 69 scripted checks, motion passes, 390 and 360 wide. Not verified with a screen
  reader.

The animation's last part is recorded from this file, stepped frame by frame in Chromium. The A
runs got no third turn, so this part shows what a follow-up looks like, not a difference between
the arms.

## Scope

- Six runs on one model and one brief. Read the numbers as what happened in these runs, not as rates.
- These counts are about decisions (what was asked, invented, and covered), not about visual quality.
  No designer rating was run for this benchmark.
- B asked first, so B got a second turn with the reply and A did not. That difference is the
  behavior being compared: A designed without asking, so it had no reply to use.
- "No skill" means no skill was loaded. The owner's account has a global anti-slop plugin (skills and a
  contrast-check tool) that both sides could use: no run called its skills; the B runs called the
  contrast tool in turn 2, the A runs never did. RYUX was moved aside for the A runs.

## What was edited

The A runs named real businesses as sample merchants. Those names are blurred in every image here. Images are scaled down; nothing else is changed. Sample names in the
B runs were chosen by the agent; any match with a real business is unintended.
