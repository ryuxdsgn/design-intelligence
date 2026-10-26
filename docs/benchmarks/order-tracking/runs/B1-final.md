I've built the order tracking prototype. It's plain HTML, CSS and JS with no dependencies, mobile first, and every state is reachable from a "Prototype controls" panel. To run it: `npm start` then open http://localhost:5173. Port 5173 was already taken on your machine, so I tested on `PORT=5188`.

**How it behaves**
- **Placed to delivered:** the arrival time is the biggest thing on screen, with the current status below it. A four-step progress track runs Placed → Picking (or Preparing for food) → On the way → Delivered. Once the courier picks up the order, a map takes the top of the screen and the courier moves along the route, as in ride-hailing apps. On delivery a check mark animates once, plus a summary and "Report a problem".
- **Running late:** the screen shows "15 min late" next to the new arrival time, gives a specific reason ("There is heavy traffic on Harbor Road."), shows the first estimate, and says "You don't need to do anything." The progress marker turns amber. Progress never jumps backwards when a delay is added mid-trip.
- **Item unavailable:** a panel asks the customer to choose, with the screen's only main button. The choice sheet shows the shopper's suggested replacement first, then other options, then "Remove it", each with its price difference. The confirm button names the outcome (for example "Replace with Organic whole milk 1 L"). After confirming, a message appears with Undo. "Decide later" keeps the panel on screen. If the phone is offline, the choice isn't lost; the sheet says it wasn't sent and how to retry.
- **Other states:** loading, failed load with Retry, offline (shows how old the status is, with Retry), order details, help, and messaging the courier or support. There are two sample orders, grocery and food.

**Decisions I made without asking you**
- **Layout:** I compared a map-first layout, a timeline layout, and a hybrid. I chose the hybrid: status first, with the map taking over only once the courier has the order, because the map means nothing while food is being prepared. This is my judgment; no reference screens were available. The other two can be built if you want to compare.
- **Language and currency:** you didn't name a market, so it's English with dollars. Both are set in one place in `src/format.js`.
- **Picking waits for the customer:** while an item waits for a choice, picking can't finish. There's no countdown and no automatic choice, because I don't know your real policy. These rules are marked `ASSUMPTION` in the code.
- **Left out on purpose:** calling the courier, cancelling the order, compensation for lateness, and fees, because I don't know your policies. Messages are local only, and the chat says so.
- **All data is sample data:** items, prices, people, timings and the map.

**Checks**

| Area | Result |
|---|---|
| Product | Pass. Built from your brief and DESIGN.md; no reference screens available. |
| UX | Pass. One main action per screen; every action shows sending, success and failure. |
| Content | Pass. Calm and direct; delays come with a reason and a next step. |
| UI | Pass. One accent colour, one warm grey, one display size per screen. |
| Design system | Pass. One sheet component reused for the item choice, details, help and messages. |
| Accessibility | Pass. Contrast and keyboard checked by hand (see below); no automated tool. |
| Responsive | Pass. 320, 390 and 1280 px, no sideways scrolling. |
| Edge cases | Pass. Loading, error, offline, long names, Undo, and a delay added mid-trip. |
| Code quality | Pass. 17 unit tests and `npm run check` (syntax check) pass. |
| Visual QA | Pass. Playwright/Chromium renders of 13 states at 3 widths, plus a reduced-motion run; no console errors. |
| Anti-slop | Pass, except the RYUX scan didn't run (below). |
| **Overall** | **Not verified**, because of the scan. Not tested with users. |

- **Contrast:** checked by script, and I fixed failing map labels and control borders.
- **Keyboard:** checked by script: focus is visible, moves into the sheet, Escape returns it to the button that opened it, and the item task completes with the keyboard.
- **Scan:** the RYUX scan (`npx @ryuxdsgn/design-intelligence scan`) was blocked because it downloads an external package. By hand, I searched for placeholder text and pressure phrases like "only N left", with no matches. If you allow it, I'll run the real scan.

**Suggested user test (5 people, phone, one hand):** "Your groceries are late, and the milk is out of stock: what's happening, and what do you do?" It works if people can say the new arrival time and the reason within 5 seconds, and they choose a replacement without help. If people miss the out-of-stock panel, that's the signal to also send a notification.

Files are in the project folder:
- index.html
- styles.css
- src
  - order.js
  - format.js
  - map.js
  - app.js
- tests
  - order.test.js
- qa
  - render.cjs
  - a11y.cjs
  - shots
