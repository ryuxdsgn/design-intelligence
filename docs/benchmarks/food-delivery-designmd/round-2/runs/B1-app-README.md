# Order tracking prototype (Pantry & Plate, working name)

A working web prototype of the customer's order tracking after checkout, for a food and grocery delivery app.
It is built from `../DESIGN.md` and uses its tokens, voice, illustration style, motion and prototype assumptions (P1–P9).
Mobile first, designed at 390 px, checked at 320 px. From 768 px the panel sits beside the map.

## Run

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # unit tests for the domain logic (Vitest)
npm run e2e          # flows at 390, 320 and with reduced motion (Playwright)
npm run typecheck && npm run lint && npm run build
```

## What to try

The two sample orders run on one simulated clock (about a minute from placed to delivered).

- **Ume Noodle Bar (food):** goes from placed to delivered, and starts running late a few minutes in.
- **Corner Market on Pine (grocery):** one item goes out of stock while it's being shopped.

The dashed **Prototype** button is not part of the product. It pauses the clock, steps through stages, raises
the late and out-of-stock moments, drops the connection, makes the next replacement choice fail to send, and
simulates reduced motion.

## Where things live

| Layer | Path |
| --- | --- |
| Domain logic: stages, lateness, totals, substitutions, routes, formatting | `src/domain/` (pure, unit-tested) |
| Sample data: orders and the map | `src/data/` |
| Simulated clock and network delay | `src/sim/` |
| Screens and components | `src/orders/`, `src/tracking/`, `src/ui/` |
| State illustrations: one SVG family, coloured from tokens | `src/illustrations/` |
| QA scripts (screenshots, motion passes, tabular-figure check) | `scripts/` |

## Sample data and assets

Every store, courier, address, price (USD), fee, time and delay reason is sample data. Food photos come from
Wikimedia Commons under CC0, public domain, CC BY or CC BY-SA, with authors and licences in
`public/food/credits.json` and in the app under "Photo credits". The map is a hand-drawn sample neighbourhood.
The working name has no logo. Neither the name nor the trademark has been checked.

## Departures from DESIGN.md (for the team to confirm)

- **Layout:** I built alternative **A, food first**, as recommended. B (map first) and C (timeline first) were not built.
- **Entry:** tracking opens from an "Your orders" list, so back returns to the list. DESIGN.md describes tracking
  arriving after checkout as a one-way door; checkout is outside this prototype.
- **Illustration:** a few small marks are rounded strokes (mouth, check, steam, basket handle, the dashed empty
  shelf slot), where the style says "no outlines". Courier skin tones sit outside the palette, which follows from
  the style's "range of skin tones".
- **Tokens added:** `--radius-thumb` (12 px) for small thumbnails, plus soft tints (`accent-soft`, `good-soft`,
  `error-soft`), `cream-shade`, and illustration shades. The status screen uses 4 text sizes; the display size is
  reserved for the arrival time, as in the type table.
- **Motion not built:** the map camera stays still (no zoom or radar search, since this flow has no courier
  search stage), and the courier doesn't leap from the map into the card. The plate flash is adapted as the door
  code highlighting once on arrival.
- **Sample data change:** both sample couriers ride a scooter, to match the illustration.
