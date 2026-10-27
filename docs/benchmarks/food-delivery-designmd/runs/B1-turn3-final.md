I've built the prototype in `app/`. To try it, run `npm install && npm run dev`. It covers every order step from placed to delivered, the late state, and the unavailable-item decision, for both food and grocery orders, at phone width and with a two-column layout from 1024 px. The typecheck, the build and all 17 tests pass. One check didn't run (see below).

**You didn't answer my three questions, so I used the recommended defaults. They're assumptions, and I haven't written them into `DESIGN.md`:**
- **Market:** English, US dollars and US time format. All of it is set in one file, `src/domain/locale.ts`, so it's easy to change.
- **Look:** calm and trustworthy, with one teal brand colour and the system font. Motion is limited to status changes and the courier marker moving on the map.
- **Unavailable item:** the customer can take the store's suggested replacement, pick another item, or remove it and not pay for it. If they don't choose before the store finishes, the item is removed and not charged. This rule is shown on the card and still needs your confirmation.

**What the customer sees:**
- **Arrival time first**, then the current step with a line that fills as the order moves. Once a courier is assigned, a map with the route appears above the order panel.
- **Running late:** a "Running late" tag next to the new time, plus an amber notice with the earlier time crossed out, the reason when the system gives one, and "You don't need to do anything."
- **Unavailable item:** the card moves to the top. Each option shows its price effect, and nothing is preselected. If several items are affected it says "item 1 of 2". Saving shows a "Saving your choice…" state; if saving fails, the choice stays selected and the button says "Try again". Changes then appear under "Changes to your order" and on the delivered receipt, with the old and new total.
- **Other states:** loading, order not found, offline (the screen keeps the last update and its time, with a retry), map failed to load, live location unavailable, and a delivered summary.
- **Prototype controls** let you reach every state. They're clearly labelled as not part of the app.

**Not real yet:**
- Everything is sample data: stores, items, prices, courier names, delays and reasons.
- The map is a drawing, not a real map service.
- "Message" and "Get help" open a note saying they aren't part of the prototype, because those features aren't confirmed.

**Checks:**
- **Tests:** 17 passing. They cover the order rules, the offline behaviour, and the full flow for the unavailable item, a failed save, a late order, and placed to delivered.
- **Rendered in Chromium** at 320, 390 and 1280 px across 12 states (screenshots in `qa/shots/`). Nothing scrolls sideways at any width.
- **Issues I found and fixed:**
  - A late order lost its late flag on delivery, so the delivered time used the original estimate.
  - On desktop the map cut off both the store and home pins.
  - The map legend icons were oversized.
  - The "location unavailable" note covered a map pin.
  - Units like "1 L" broke across lines.
  - The amber card border was too faint (raised to 3.7:1, above the 3:1 recommended for visible borders).
  - Closing the dialog sent keyboard focus to the top of the page instead of back to the button that opened it.
- **Contrast:** text is between 5.7:1 and 14:1. All touch targets are at least 44 px.
- **Motion:** the courier marker glides and the arrival time briefly highlights when it changes. With reduced motion turned on, both just update.
- **Not run:** the RYUX scan, because it downloads an external package and auto mode blocked that. If you allow it, the command is `npx @ryuxdsgn/design-intelligence scan http://localhost:4173/` with the preview server running.
- **Not built:** dragging the order panel up and down. It's a fixed panel with an "Order details" section that opens and closes.
- **Not done:** testing with a real screen reader, and with users. The usability test plan in `DESIGN.md` still applies.

```
PRODUCT        PASS · brief's three topics built; product rules not in the brief are labelled assumptions · evidence Thin
UX             PASS · one tracking screen, one primary action (the decision card), no dead ends
CONTENT        PASS · plain, calm copy; error messages say what happened and what to do; no invented promises
UI             PASS · point of view: arrival time first; signature: the route line doubles as the step indicator · illustration style: none (drawn map only)
DESIGN SYSTEM  PASS · colours, spacing, type and corner sizes all come from one tokens file
ACCESSIBILITY  PASS · contrast measured, 44px targets, focus return, live announcements, not colour alone; screen reader not tested
RESPONSIVE     PASS · Chromium 320/390/1280; map crop, legend and note overlap fixed
EDGE CASES     PASS · every state below has a render or a test
CODE QUALITY   PASS · typecheck, build, 17 tests; RYUX scan not run (blocked)
VISUAL QA      PASS · Playwright Chromium, 3 widths, 12 states; reduced motion and dialog focus checked
ANTI-SLOP      PASS · 1 accent (amber/red status excluded), 1 grey family, 1 display size, 3 text sizes, 1 icon set, 0 emoji
FINAL          PASS · checked criteria only; not tested with users
```

| What | Loading | Empty / not found | Error | Success |
|---|---|---|---|---|
| Order | 10-loading | 11-not-found | 06-offline | 01 → 05 → 04 |
| Unavailable-item choice | "Saving…" (test) | no response → removed (04) | 09-save-failed | change listed (test) |
| Map | — | 08 no live location | 07 map failed | 03, 05 |
| Late | — | no reason given (08) | — | 03 |

`DESIGN.md` itself is unchanged.

**Still open:**
- Confirm or replace the unavailable-item rule (question 3).
- Tell me the market (question 1).
- Pick the look (question 2).

When you answer, I'll write them into `DESIGN.md` and update the prototype to match.
