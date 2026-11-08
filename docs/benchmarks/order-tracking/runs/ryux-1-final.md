# ryux-1: final message of each turn

## turn1

I'm using RYUX in **Build** mode. DESIGN.md already sets the UI direction (warm, one strong accent, the status is the main element), the motion direction and the voice. There's no design spec or product doc in the repo yet, though, and RYUX has me ask about product rules before building. If I made these up, the prototype would quietly turn them into policy. Three questions, with my recommendation first in each:

**1. Market and currency.** Nothing in the brief or DESIGN.md names one.
1. **No specific market (recommended):** English, a neutral currency format, sample addresses that aren't tied to a real city
2. Indonesia: Rp, id-ID formats, Indonesian sample stores and items
3. US: $, en-US
4. Other (tell me which)

**2. When an item is unavailable, who decides what happens?** This sets which screens and actions exist.
1. **The customer decides in the app (recommended):** for each item they can accept the shopper's suggested replacement, pick a different one, or remove it and get a refund. If they don't answer in time, the order follows the substitution preference they set at checkout. Tell me the time window, or I'll leave it as a clearly marked assumption.
2. The shopper substitutes automatically based on the checkout preference, and the customer can review the swaps and reject one for a refund
3. Remove and refund only, with no substitutions
4. Other

**3. What can the app offer when an order is late?**
1. **Honest status only (recommended):** the reason, an updated ETA, and ways to message the courier or contact support. No credits or compensation promised.
2. Also a credit or compensation. You give me the rule, because I won't invent one.
3. Also let the customer cancel once the order is late past a threshold. You give me the threshold and what happens to the refund.

You can reply with numbers, for example "1, 1, 1". If you'd rather not decide, I'll go with the recommended options and list them as assumptions in the build.

## turn2

The order tracking prototype is built and running at **http://localhost:5179/** (`app/`). It typechecks, all 29 tests pass, the production build succeeds, and I checked the screens in a browser at 320, 390 and 1280 wide. It hasn't been tested with users.

**What it does.** The layout puts the status first: a large headline (e.g. "Sam is on the way"), the arrival window, then a four-part progress bar that fills as the order moves. Below that are any cards that need attention, a map once the courier has the order, your items, and the step-by-step history. It works for a grocery order or a restaurant order.

- **Placed to delivered:** order placed → shopping (or preparing, for a restaurant) → courier at the store → on the way, with the courier moving on the map and the text changing to "almost there" near the end → delivered, with a check that animates once and a Done button that moves the order to Past orders.
- **Running late:** three cases.
  - **Late with a new time:** the reason, the new window, and the old window crossed out.
  - **Late with no new time yet:** it says so plainly.
  - **Window passed with no update:** "later than expected", with no estimate shown.

  Each case ends with a next step (message the courier, or Help). Nothing is cheerful, and no credit or compensation is promised.
- **Item unavailable:** a card with one main button opens a sheet listing the suggested replacement (pre-selected), other options, and "Remove this item", each with its price change. It handles two items in turn. While a choice is sending the button shows progress; if it fails offline, your selection is kept and you get "Try again". If shopping ends before you answer, the item is removed and the screen says why.
- **Other states:** a loading placeholder in the shape of the screen, a load error with retry, an offline banner showing when the status was last updated, messaging with suggested replies (including empty, sending, failed and sent), a Help sheet, and an empty orders list.

A **Prototype controls** panel sits outside the app (a strip at the top on a phone, a side panel on desktop). It switches order type, plays, pauses or jumps between steps, and triggers the late, out-of-stock, offline and error states.

**Assumptions, labeled on the screen where they apply**, since you haven't decided these policies:
- If the customer doesn't choose, the unavailable item is removed.
- How a price difference is charged or refunded is not decided.
- Fees and the final charge are not shown; only item prices are.
- How customers reach the courier or support is not decided, and the messages go nowhere.

All stores, names, items, USD prices and times are sample data. The map is labeled "Illustrative map". The look (raspberry accent on warm neutrals, DM Sans) is a proposal; I wrote it into DESIGN.md as provisional.

**Not built:** a map-first layout like ride-hailing apps, and a chronological event feed. The status-first layout follows your DESIGN.md ("the status is the hero"). The trade-off is that on short phones the map sits below the first screen.

```
PRODUCT        PASS · every undecided rule is labeled on its own screen; no invented policies, numbers or people · evidence Thin (brief + DESIGN.md + standards; the ryux MCP isn't available) · rationale in README and DESIGN.md
UX             PASS · status and arrival window first; the one action needed sits in context; no dead ends (every control leads somewhere)
CONTENT        PASS · calm, direct "you"; delays give reason + new time + next step; one name per thing (copy kept in one file)
UI             PASS · point of view: warm status-first; signature: the live progress bar, which turns amber when late · 1 display size, 3 text sizes + a 13px caption
DESIGN SYSTEM  PASS · color, spacing, size and motion values defined once in styles.css and named by role; one component per pattern (shared sheet and note)
ACCESSIBILITY  PASS · contrast measured (lowest text 6.6:1, boundaries 3.9:1); all app touch targets ≥44px (measured at 320); native dialog with focus return checked; status changes announced once; reduced motion → fades. Keyboard checked by hand; no automated audit
RESPONSIVE     PASS · 320 / 390 / 1280: no sideways scroll in any of 14 states; long store names wrap instead of being cut off
EDGE CASES     PASS · see matrix below
CODE QUALITY   PASS · tsc, 29 vitest tests (logic + 8 flow tests), vite build. The RYUX scanner was NOT run: permission to download it was denied
VISUAL QA      PASS · Playwright renders of 14 states at 320, 390 and 1280, plus the restaurant version; sheet motion checked (closing mid-open reverses from where it is, 3 rapid toggles, reduced motion)
ANTI-SLOP      PASS · 1 accent color (status colors excluded), 1 warm grey family, 1 icon set, 0 emoji, 0 gradients, 0 invented logos. Two small off-scale corners: the prototype-rule note and loading placeholders use 10px instead of the 14/20 scale
FINAL          PASS (checked criteria met; not tested with users)
```

| Screen or action | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Tracking | loading placeholder | can't happen (the screen opens only for an order) | load error + retry; offline banner showing the last status | status, late and delivered screens |
| Unavailable-item choice | "Sending your choice…" | can't happen without a pending item | offline error, choice kept, retry; decision window closed | confirmation message, item marked "Replaced" or "Removed" |
| Message | "Sending…" | asks for a message before sending | "Not sent" + try again | "Sent" with the time |
| Orders list | n/a (sample data is local) | "No orders in progress" | n/a | active card and past orders |

**Suggested user test:** 5 people using one hand. Tasks:
1. When will it arrive?
2. Your order is late. What happened, and what can you do?
3. An item is out of stock. Handle it.
4. You're offline. Is the status current?
5. Message the courier.

Signals to watch: time to the first correct answer, wrong choices in the replacement sheet, and whether people read the prototype-rule labels as promises. If people read the labels as promises, the policies need deciding before anything else.

**Decisions only you can make:** the no-answer rule for unavailable items, refunds for price differences, whether late orders get any compensation or cancellation, and how customers contact the courier and support.

Files are in `app/`:
- `README.md`: how to run it, plus the assumptions
- `src/domain/order.ts`: the order logic
- `src/domain/copy.ts`: all status wording
- `qa/`: the screenshots
