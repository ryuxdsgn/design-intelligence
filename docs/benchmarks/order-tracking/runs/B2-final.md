I've built the prototype: a mobile-first order tracking screen in Vite, React and TypeScript, with a panel for stepping through the scenarios. Typecheck and build pass, all 27 tests pass, and I checked every state in a real browser at 375px, 320px and 1280px.

**To run it:** `npm run dev`, then open the local URL Vite prints. On a phone-width screen, the dark bar at the top opens the prototype controls. On desktop they sit next to the phone frame. You can pick a scenario, step forward or back, auto-play, or switch on "Make the next request fail" to see the error states.

## What the customer sees
- **Placed to delivered.** The arrival time is the biggest thing on the screen. Under it is a progress line with four stops: Placed, Preparing (or Shopping for groceries), On the way, Delivered. The line advances as items are picked or the courier moves.
  - The map and courier card only appear once a courier is assigned. Before that there is nothing useful to show on a map.
  - When the order arrives, a check mark animates in once, the summary opens with the final total, and the screen says if delivery was later than the first estimate.
- **Running late.** A "Late, was 6:38 PM" label sits under the new time, and a note says why it's late and what happens next. The customer can call the store or message the courier.
  - If the estimate passes with no new time, the screen says "Was due at…" and "new time pending" rather than showing a time that has already passed.
  - A second delay says "Running late again" and apologises once.
- **Item unavailable.** The item that needs a decision appears straight under the status. It shows the shopper's suggested replacement, its price and the price difference, with one main button, "Accept replacement".
  - "Other options" opens a panel listing the other replacements and "Don't replace it", with the new order total.
  - The customer can change their mind until the deadline. If they don't answer, the item is removed and the screen says so.
  - An item with no similar product is removed with a short notice.
  - If saving the choice fails, the choice is kept so the customer can tap "Try again".
- **Connection problems.** If the first load fails, the screen shows a retry button. If the phone goes offline mid-delivery, a banner says "Showing updates from 6:22 PM" and the screen keeps the last data it had.

## Decisions I made without asking you
- **Design direction.** RYUX normally asks you to pick between two or three directions before building. Because you asked for a working prototype, I picked one and built it: status first, with the map appearing only once there's a courier to show. The alternatives were a ride-hailing style full-screen map with a panel over it, and a chat-style feed of updates. Your DESIGN.md says the status is the hero, which pointed to my choice. No real apps were compared, so this is a judgment call.
- **Business rules (please confirm):**
  - Removed items aren't charged.
  - An unanswered item is removed at the deadline, and the customer can change their choice until then.
  - Late notices show a reason supplied with the order.

  Cancelling, refunds or compensation for late orders, and a support channel are not shown, because the brief didn't say what they are.
- **Market.** The brief doesn't name one, so the copy is English and prices are in US dollars. Both are set in `src/config.ts`.
- **Sample data.** All stores, couriers, phone numbers, prices, times and delay reasons are made up, and the panel says so. The map is a drawing labelled "Prototype map, not to scale". No logo is used.

## Delivery Gate
```
PRODUCT        PASS · flow covers placed→delivered, late, unavailable; rules above are flagged assumptions · evidence None (no reference screens; judgment call)
UX             PASS · one primary action per state; decision surfaced under status; every failure has a way forward
CONTENT        PASS · calm, "you", reason + next step when late, no cheer; no fact repeated (fixed duplicate delivered time)
UI             PASS · point of view: the route line, signature: progress line + map route in one accent · illustration style: none (map is a labelled drawing)
DESIGN SYSTEM  PASS · tokens for colour/space/type/radius/motion; Button/Sheet shared. 1 accent, 1 grey family, 3 named status colours; 1 display size, 3 text sizes; 1 icon set (Lucide); 0 emoji; 0 logos. A few radii off-scale (skeleton, chat bubble, prototype panel)
ACCESSIBILITY  PASS · native dialog + focus return checked in browser; labelled icon buttons; text + icon for late/errors; live region for status; reduced motion swaps slides for fades. No automated a11y audit run
RESPONSIVE     PASS · Chromium at 320/375/1280: no horizontal scroll; fixed stage labels colliding at 320 and courier card wrapping
EDGE CASES     PASS · loading, load error, offline, save failure, message failure, timeout auto-removal, no-match item, repeated delay, overdue
CODE QUALITY   PASS · tsc, vite build, 27 vitest tests (logic, state, item-unavailable flow including failure). RYUX scan not run (needs an npm download)
VISUAL QA      PASS · Playwright Chromium, 320/375/1280, ~18 states per width including sheets and reduced motion
ANTI-SLOP      PASS · no invented stats or people; sample data labelled; no decorative loops
FINAL          PASS · not tested with users
```

**Not covered:** dark mode, a real map or live courier position, push notifications, and screens beyond tracking (home, help, rating). A first usability test would ask about five people waiting on an order to find out when the food arrives, why it's late, and to handle the out-of-stock eggs, then watch whether they spot the deadline and the price change without help.

**One step was blocked:** RYUX's final step runs `npx @ryuxdsgn/design-intelligence scan`, which downloads and runs an npm package, and the permission check refused it. If you want it, allow it or run it yourself on `src`.
