# Motion in a booking prototype: no skill vs RYUX 2.22.7

A short brief asks for a clickable prototype of a booking flow, with motion for each step. The question: does the motion
serve the task and the platform, and does the flow stay honest about what nobody decided?

## Setup
- **Brief** ([prompt.txt](prompt.txt)): a Sejuk booking flow (choose a time slot, review, confirmed), one `index.html`
  with no libraries or network, 390 wide, English copy, and the motion and design decisions explained at the end. The RYUX
  side gets "Use the ryux skill." before it.
- **Agent:** Claude Code `claude -p`, Opus 5.5, an empty folder, no MCP servers, global skills moved aside. One run per
  side (2026-11-09).
- **Reply rule:** a turn that ends without an `.html` file gets [reply.txt](reply.txt) once ("Go with what you recommend
  and build the prototype."). The RYUX run asked first and got that reply.
- **Recording** (same for both): Playwright Chromium at 390 x 844, then by visible text: tap the first enabled time slot,
  the action matching review/continue/next, the action matching confirm/book; 800 ms after each tap, 2 s at the end.
  **Changed after the runs, recording only:** the RYUX prototype opens on a request screen with one "Choose a time"
  button, so the locked path found no slot. One step was added for both sides: if no slot is visible at the start, tap
  the action matching choose a time/book/schedule/start. The no-skill recording is unchanged by it.
- **Criteria, written before the runs:** the owner rates the two recordings blind (letters shuffled), 1 to 5 on motion
  that fits iOS and the task, feedback on each tap, honesty, copy, visual direction, and craft; `prefers-reduced-motion`
  handled in the code.

## Results

| | No skill | RYUX 2.22.7 |
| --- | --- | --- |
| Motion fits iOS and the task | 3 | **4** |
| Feedback on each tap | 4 | 4 |
| Honesty | 2 | **4** |
| Copy | 4 | 4 |
| Visual direction | 2 | **4** |
| Craft | 3 | 3 |
| **Mean** | 3.00 | **3.83** |
| `prefers-reduced-motion` | yes | yes (a 150 ms fade) |
| Cost | $0.91, 4 min | $4.14 over 3 turns (one cut by a usage limit, then resumed) |

## What the owner noted
- **No skill:** a native-feeling push with parallax, and the best tap feedback (the button label becomes "Continue · Tue
  10 Nov, 08:00"). But a technician ("Budi Santoso", 4.9, 1,240 jobs, Certified) is assigned before the booking is
  confirmed, "1 slot left" adds scarcity, the price is fixed with a free visit fee, GoPay appears on the success screen
  without being chosen, and the look is a generic iOS blue. The confirm button morphs into a spinner with its label cut.
- **RYUX:** calm motion that fits the task, skeleton loading, a disabled button that says why, "Booking…" with the
  back gesture blocked, and a success screen whose airflow lines carry the brand. No invented technician or rating; the
  price is an estimate, paid after the visit. Weak spots: a focus ring shows on the title at the start, the textarea
  shows the browser's resize grip, the price sits below the fold on the review screen, and the button label overlaps
  during the confirm transition (the no-skill run has the same overlap).

![No skill vs RYUX, motion](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/showcase--h2h-3-motion.gif)

One run per side: these numbers describe these two runs, not rates.
