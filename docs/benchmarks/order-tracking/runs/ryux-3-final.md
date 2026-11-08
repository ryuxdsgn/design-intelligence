# ryux-3: final message of each turn

## turn1

I'm using RYUX in **Build** mode. I've read DESIGN.md (it sets the product, audience, UI and motion direction, and voice) and the Build, edge-case, interaction and content guidance. The project has no code yet, so the prototype will be new.

Before building, I need three answers that change which screens and actions exist. Reply with numbers, e.g. "1a 2a 3a". Each recommended option is listed first.

**1. Market and locale.** Nothing names one, and it sets the language, currency and time format.
- **a. No specific market (recommended):** English, a neutral currency shown as clearly labeled sample prices, 24-hour times
- b. Indonesia: Bahasa Indonesia, Rp, WIB
- c. Another market (name it)

**2. When an item is unavailable.** This decides the actions on the "item unavailable" screen and where the money goes.
- **a. You choose (recommended):** the shopper suggests a replacement, and you approve it, pick another, or refund the item. If you don't answer in time, it is refunded. The prototype will show this timeout as a configurable sample value, not a promised policy.
- b. Replace automatically with a similar item, and you can undo it afterwards
- c. Refund only, no replacements
- d. Your own rule. Please also say where refunds go: the original payment method or in-app credit. If you don't know yet, I'll write "refunded to your payment method" and mark it as an assumption.

**3. When the order is running late.** This decides whether the late screen offers anything beyond honest information.
- **a. Information only (recommended):** a new arrival time, the reason, and actions to contact the courier or get help. No credit or compensation is promised, because no such policy exists.
- b. A credit appears past a threshold. Give the amount and the threshold, or I'll show them as marked placeholders.
- c. Cancelling is allowed once it's late. Say whether that's for a full refund or a partial one.

Once you answer, I'll build it as one self-contained, mobile-first HTML prototype with a state switcher. It will cover placed, preparing, picked up, on the way and delivered, plus late, item unavailable, offline and error states. Then I'll render and check it at several widths and finish with the Delivery Gate report.

Following "reference, not recreate", I'll borrow common delivery and ride-hailing patterns: a map with a bottom sheet, a live ETA, a step timeline and courier contact. I won't use any real app's brand or visuals.

## turn2

The order tracking prototype is built and working. It's a single mobile-first web page in `prototype/`, and every state can be reached from a "Prototype controls" bar, including the late order and the unavailable item.

**To run it:** `cd prototype && python3 -m http.server 4873`, then open http://localhost:4873. Run the unit tests with `node --test logic.test.mjs`.

## What a customer sees
- **Placed to delivered:** a five-step tracker (Order placed, Preparing, On the way, Almost there, Delivered) under a large arrival window, such as "5:06–5:11 PM, in 9–14 min". A one-line status names who has the order. The courier moves along a sample map once they have it. On delivery, a check mark appears once and the order details open.
- **Running late:** a new arrival time appears, with the old one crossed out next to it. A plain amber note says how much later ("About 17 min later than we said"), gives the reason, and states what happens now. There's a link to get help and a button to message the courier. No jokes and no compensation, because there is no compensation policy.
- **Item unavailable:** a card says "Oat milk, 1 L is out of stock" and has one main button. It opens a sheet with three options: the shopper's suggested replacement (pre-selected), another product, or removing the item. Each option shows its price difference.
  - The confirm button names the result, for example "Confirm almond milk".
  - While sending it says "Sending to your shopper…". If sending fails, an error appears with a way to try again.
  - A confirmed choice can still be changed while the order is being prepared. After that, the order details show what replaced what.
- **Other states:**
  - a loading placeholder in the shape of the screen
  - a load error with a retry button
  - an offline mode that shows when the status was last updated and turns off messaging, with the reason
  - courier messages that show sending, sent and failed (with retry)
  - a Help sheet

## What you need to decide
Every undecided policy appears on screen as a striped `[bracket]` placeholder, never as a plain sentence:
- how long the customer has to choose a replacement, and what happens if they don't
- where refunds go
- how a more expensive replacement is charged
- fees and tip
- the support channel
- cancellation
- whether customers can call the courier or only chat

The **Contact support** and **Cancel order** options in Help are shown disabled for that reason. The store, items, USD prices, courier "Sam", the late reason and the map are invented sample data. The colour and type are a proposal, and I made no logo or favicon. `prototype/README.md` lists all the assumptions.

**Layout choice:** I kept the familiar map-on-top, status-panel-below layout from ride-hailing and delivery apps, with the arrival time as the biggest element. The alternative I didn't build hides the map until the courier is moving, since a map adds little while the store is packing. This is a judgment call with no screen data behind it.

## Delivery Gate
```
PRODUCT        PASS · tracking, late and unavailable-item flows built; no invented policy shown as fact (placeholders) · evidence None (brief + standards; ryux MCP not available) · rationale 4 lines, annotations 8 placeholders
UX             PASS · one main action at a time (only the "Choose a replacement" button); every action has before/during/result/recovery; sheets close with Esc, the close button or the backdrop, and focus returns
CONTENT        PASS · calm "you" voice, no cheer on bad news; labels name results; errors say what happened and what to do; one term per thing
UI             PASS · point of view: task UI, signature: big arrival-window display + 5-segment tracker that turns amber when late and green when delivered · devices 1 (phone) · made assets 1/1 (illustrative map, labeled)
DESIGN SYSTEM  PASS · colour, spacing, radius, type and motion tokens in styles.css; RYUX scan 0 fail, 0 warn
ACCESSIBILITY  PASS · contrast checked by script (lowest 5.03:1); targets ≥44 px; keyboard path and focus trap/return tested with Playwright; ARIA tree read; status changes announced to screen readers; colour always paired with icon + text. No automated audit tool was run
RESPONSIVE     PASS · 320, 390, 430, 1280 rendered, no sideways scroll; courier row reflowed for 320
EDGE CASES     PASS · see matrix
CODE QUALITY   PASS · 13 unit tests pass (time windows across noon/24 h, money, delay, substitution math, labels); node --check; no console errors
VISUAL QA      PASS · Playwright Chromium at 320/390/430/1280: all 7 order states, loading, error, offline, choice sheet (default/sending/error/done), messages, help
ANTI-SLOP      PASS · accent hues 1 (status amber/green/red named), grey families 1, display sizes 1/screen, icon set 1, emoji 0, logos 0, gradients 0 (striped placeholder only). Exceptions: placeholder text and the map label add 2 small sizes; 4 px radii on placeholder tags and message bubble tails are outside the scale
FINAL          NOT VERIFIED · motion is only partly verified (below); not tested with users
```

**Edge cases:**

| View or action | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Order status | skeleton | not possible (the screen opens after checkout) | load error with retry; offline with last-updated time | 7 order states |
| Item choice | "Sending…" | not possible (always 3 options) | inline error with retry | confirmation, focus moves to it |
| Courier message | "Sending…" | quick replies shown | "Not sent", try again | "Sent" |

**Motion:**
- **Verified at 390:** the bottom sheet (open, close mid-way, three rapid toggles, reduced motion). Mid-close reverses from where it is, reduced motion removes movement, and focus returns.
- **Checked only from screenshots and code:** the delivered check mark plays once, and courier movement and the progress fill animate only transform. I didn't record frames or measure frame rate, so motion as a whole is NOT VERIFIED.

**Quick user test:** five people complete three tasks one-handed on a phone. First, glance at the screen and say when the order arrives. Second, handle the out-of-stock item. Third, explain why the order is late and what they'd do next. The riskiest assumption is that pre-selecting the shopper's suggestion is acceptable. If people confirm without reading the price difference, drop the pre-selection.
