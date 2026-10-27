The prototype is built in `app/` and works from placed to delivered, including the late order and the unavailable item. All automated checks pass, but it hasn't been tested with users. A dev server is running at http://localhost:5317.

**Layout choice:** you didn't choose between the three layouts in DESIGN.md, so I built the recommended one, **A, food first**. Map-first and timeline-first were not built.

**What it does**
- **Two sample orders on one simulated clock**, about a minute from placed to delivered:
  - **Ume Noodle Bar (restaurant):** runs late partway through.
  - **Corner Market on Pine (grocery):** one item goes out of stock.
- **Status:** the arrival time comes first and is the largest text on the screen; only the digits that change roll. The stage title updates in place, a step bar shows progress, and an illustration matches each stage.
- **Food photos are the main visual:** they lead every card and the top of the screen until the courier moves. The ordered items then stack, ride with the courier on the map after pickup, and return when the order is delivered.
- **Running late:** the new time rolls in, with "was 6:43 PM", a calm amber "Running late" label, a reason line and a way to get help. No compensation is offered (P3).
- **Item unavailable:** a sheet opens once with the store's suggestion and its price difference, "Pick something else", and "Remove item (−$4.99)". The new total shows before you confirm. After the choice there's a sending state and Undo. If the send fails, the choice is kept so you can retry. With no answer by pickup, the item is left out and not charged (P1).
- **Also covered:**
  - Loading skeleton.
  - Connection lost: shows the last update and how old it is.
  - Fallback tile when a photo fails.
  - Door code on arrival.
  - Message, Call and Help sheets that say plainly they're a prototype.
  - Photo credits.
  - Side-panel layout from 768 px.
- **Prototype button (dashed outline):** for test sessions. It pauses the clock, steps through stages, triggers each moment, and can simulate a failed send or reduced motion.

**Fixed during QA**
- **Undo reopened the sheet:** the replacement sheet came back after Undo.
- **No Escape after sending:** Escape stopped closing the message sheet, because focus fell to the page.
- **Undo while offline:** it was allowed without a connection.
- **Offline notice invisible:** it collapsed to zero height.
- **Map collisions:** markers overlapped labels and the food bag hung off the screen edge.
- **Hidden scroll:** controls below the fold could scroll inside the collapsed panel.

**Departures from DESIGN.md**, listed in `app/README.md` for you to confirm:
- Tracking opens from a "Your orders" list rather than straight after checkout.
- A few small strokes in the illustrations, where the style says no outlines.
- Some added colour and radius tokens.
- The map camera stays still, and the courier doesn't leap from the map into the card.
- Both sample couriers ride scooters, to match the drawing.

**Photos:** the food photos are real, from Wikimedia Commons under free licences, with credits in the app. Every store, courier, price, time and the "Pantry & Plate" name is sample data; the name hasn't been trademark-checked.

```
PRODUCT        PASS  · brief and DESIGN.md followed; undecided policies built as labelled assumptions P1–P9 · evidence Thin
UX             PASS  · every action has before, during, result and recovery; back, sheets and Escape behave consistently
CONTENT        PASS  · one label per action; button labels match the sheets they open; errors say what happened and what to do
UI             PASS  · point of view "the order travels as the food" (food stack shared across card, panel and map) · illustration style in DESIGN.md
DESIGN SYSTEM  PASS  · token-based; one Button, one Sheet, one Photo; additions listed in README
ACCESSIBILITY  PASS  · contrast measured, lowest 4.70:1; 48 px targets; focus trap, Escape and focus return tested; live region; reduced motion
RESPONSIVE     PASS  · 390, 320, 1280 rendered; no sideways scroll (e2e); fixed collisions and hidden scroll at 320
EDGE CASES     PASS  · matrix below
CODE QUALITY   PASS  · typecheck, lint clean; 28 unit + 30 e2e tests pass; build passes; ryux scan 0 fail 0 warn
VISUAL QA      PASS  · Playwright renders at 390, 320, 1280 of every state; 12 illustrations compared side by side
ANTI-SLOP      PASS  · 1 accent, 1 grey family, 1 icon set (regular, fill only for selected), 0 emoji, 0 logos, 0 gradients; 4 type sizes with the display reserved for the arrival time
FINAL          PASS  · checked criteria met; not tested with users
```

| View or action | Loading | Empty | Error | Success |
| --- | --- | --- | --- | --- |
| Tracking screen | Skeleton in the panel's shape | Can't happen: always opened from an order | Offline: last update and its age, Try again | Live stage |
| Arrival time | "Confirming time" before Accepted | — | Frozen while offline | Rolling time |
| Map / courier | Fades in with a pin drop | Hidden until a courier moves | Faded courier while offline | Live route |
| Replacement choice | "Sending your choice…" | No suggestion: falls back to the list | Not sent, choice kept, retry | Updated item and total, Undo |
| Photos | Lazy load | Category tile | Category tile | Photo |

**Motion checks, verified in a browser:**
- **Sheets:** open, close 60 ms into opening, and rapid toggling. The sheet reverses from where it is, closes faster than it opens, and returns focus.
- **Reduced motion:** movement becomes a cut, and all 10 flows pass in that mode.

The map, the stage push and the rolling digits were checked by eye in renders, not frame by frame. The five-person test plan is in DESIGN.md.

Files are in `app/`:
- source in `app/src`
- integration tests in `app/e2e`
- QA scripts in `app/scripts`
- notes in `app/README.md`

Screenshots are in `shots/`.
