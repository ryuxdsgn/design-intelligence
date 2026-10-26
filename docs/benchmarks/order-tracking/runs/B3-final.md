I've built the prototype. Start it with `python3 -m http.server 4173` in the project folder; a copy is running now at http://127.0.0.1:4173/ (add `?type=food` for a restaurant order). The 13 unit tests for the order logic pass, the typecheck is clean, and I checked the screens in Chromium at 320, 390 and 1280px widths. It hasn't been tested with users.

**How it works.** It borrows the layout of ride-hailing apps: a street map at the top and a sheet below it. The arrival time is the biggest thing on screen, with a four-step progress bar under it: Placed → Shopping (or Preparing for a restaurant) → On the way → Delivered. A courier marker moves along the route on the map. Below that you can message the shopper, store or courier, see the delivery address, and open the order details. When the order arrives, a check mark plays once and the route turns green.

**When the order is running late:**
- A "Running late" label appears, with the new arrival time and the original estimate next to it.
- A yellow box gives the reason and says whether you need to do anything. For example: "Heavy traffic on Harbour Rd is slowing Sam down. Nothing you need to do."
- The courier slows down on the map rather than jumping backwards.
- The delivered screen says how late the order was and apologises without being cheerful about it.

**When an item is out of stock:**
- An alert appears in the order, with one main button: **Choose replacement**.
- That opens a sheet with the store's suggested replacement already picked, other replacements, and a "Remove it from my order" option. Each option shows its price change, and the sheet shows the new total before you confirm.
- If two items are out, you go through them one at a time ("item 1 of 2").
- If sending your choice fails, your choice stays selected and the error says whether you're offline or it failed on the server, with a **Try again** button.
- The order waits for your answer. If you don't answer, every minute pushes the arrival time back, and past five minutes the order shows as late for that reason.

A **Prototype controls** panel (dashed button on a phone, side panel on desktop) lets you trigger each situation: next stage, make it late, out-of-stock item, go offline, fail the next send, fail to load. Loading, load error and offline states are all built.

**Things I made up that the product team needs to confirm.** These are listed in `README.md` and marked in the code:
- An order counts as late at 5 minutes past the first estimate.
- The store suggests replacements.
- Removing an item takes its full price off the total. I don't promise when or how the refund arrives.
- There's no timeout if the customer never answers the out-of-stock question.
- I left out anything I'd have had to invent a policy for: calling, support chat, cancelling, and credits for late orders.
- All merchants, people, items, prices, fees and the map are sample data, and the map is labelled "Sample map" on screen. Prices are in `$` only as a stand-in because no market was given.

**Checks:**

| Area | Result |
| --- | --- |
| Accessibility | **Passed** for what I checked. Text contrast is at least 5.1:1 for all text and 3.6:1 for borders. Touch targets are at least 44px. In the sheets, focus is trapped and Escape returns focus to the button that opened them. Status changes are announced to screen readers, and reduced-motion settings swap movement for fades or cuts. I checked by hand; no automated accessibility test was run. |
| Layout | **Passed** at 320, 390 and 1280px, with no horizontal scrolling and no console errors. |
| Motion | **Passed** on samples only. I sampled the courier's movement and the progress fills; I didn't record video. |
| RYUX scan | **Not run.** The download of the `@ryuxdsgn/design-intelligence` scanner was blocked by the permission system. If you allow it, I can run it. |

**Files:**
- `index.html`
- `styles.css`
- `src/logic.js`
- `src/app.js`
- `src/map.js`
- `src/icons.js`
- `tests/logic.test.js`
- `README.md`
