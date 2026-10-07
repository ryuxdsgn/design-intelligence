# EN-OR-B1 · Orders list — design reasoning

Frame: `XUru3` "EN-OR-B1 · Orders list" in ryux.pen (x 68602, y 0, right of all existing content).
Export: EN-OR-B1-orders-list.png (1x board render).

Process: RYUX 2.3.3, Design capability. Knowledge read: product, ux, ui, responsive, accessibility,
edge-cases, design-system, frontend, anti-slop (task table rows "Mobile UI" and "Data-heavy view").
Before designing I asked three questions: market and currency, the order status model, and the
screen's main job. The answers I got back: global product in English, currency not decided,
390 wide, the data fields, payment status (Paid, Pending, Refunded), fulfillment status
(Unfulfilled, Shipped, Delivered), and the actions (open, search by order number or customer,
filter by status). The main job of the screen is not decided.

## Design Direction

Context: the owner of a small online store, managing orders on their phone, often in between
other things. Volume runs from 0 to several hundred orders.

Design intent: from one glance at a row, the owner can tell who ordered, how much, whether it is
paid, and whether it has shipped. They can find a given order in a couple of taps, by its number
or by the customer's name. It works if the owner can find order #1050, or every paid order that
hasn't shipped, without opening orders one by one.

UX direction
- One screen and one job: a list you can scan and search. The whole row opens the order. There
  are no row actions and no bulk actions, because none were given.
- Hierarchy within a row: 1) customer name and total (16/600); 2) order number (bold), time and
  item count; 3) payment status and fulfillment status as two labeled pills.
- Rows are newest first and grouped by day (Today, Yesterday, then the date), so the time on each
  row stays short. Sort order is an assumption.
- Search sits at the top in the header, with the placeholder "Order # or customer", which names
  both fields you can search by.
- Filter is a bottom sheet with two groups that match the two statuses. Within a group, any
  selected value matches (OR); across groups, both must match (AND). This logic is an assumption.
  Active filters show as removable chips with one-tap Clear all, and the filter button is filled
  while filters are on.
- Several hundred orders: rows load as you scroll ("Loading more orders…"), and the list ends with
  a plain "No more … orders" line.

States designed:
1. default
2. filter sheet
3. filters applied, with the end of the list
4. smallest width (320)
5. first load (skeleton)
6. no orders yet
7. no search matches
8. couldn't load (connection copy, server copy in the caption)
9. offline, showing the saved list with its age

UI direction: this is task UI, so I followed conventions on purpose and did not add an expressive
concept (RX-UI-12 does not apply).
- Type: Inter. Title 28/700, row primary text 16/600, meta text 13, pills 12/500, body 15.
- Spacing on a 4/8 scale: 16 px side gutter, 12–14 px row padding, 18 px before each day group.
- Separation comes from hairlines, not cards. Each row is one item in a long list, so a card per
  row would add noise.
- Color roles:
  - Ink #16191D for text and the primary action. No brand exists, so I didn't invent an accent.
  - Muted text #5A626D, about 6:1 on white.
  - Status colors: amber = needs attention (Payment pending, Unfulfilled); green = done (Paid,
    Delivered); blue = in transit (Shipped); grey = Refunded.
- Every pill has an icon and a word, so color is never the only signal.
- Tokens were added to the file as `orb1-*` variables, so they don't touch the file's existing
  variables.

Responsive: at 390 and 320 nothing is hidden or rearranged. The customer name truncates first;
the total, order number and pills keep their size. At 320 the placeholder "Search order # or
customer" wrapped, so I shortened it to "Order # or customer" at every width, which keeps behavior
consistent (RX-RD-06). There is no horizontal scroll.

Motion: none designed beyond platform defaults (row press, sheet slide-up, spinner).

## Decision Receipts

**Decision: row layout**
- Chosen: a three-line list row, with the name and total on the first line.
- Options:
  - A: table-like columns
  - B: one card per order
  - C: list row
- Evidence: None, since the ryux MCP was not connected. This is a judgment call guided by
  RX-RD-04 (tables become summary rows on mobile) and the anti-slop card purpose gate.
- Confidence: Medium.
- Why: two statuses plus money and identity won't fit in columns at 390; rows scan faster than
  cards.
- Trade-off: three lines per row means about 7 orders per screen, not 10.
- Assumption: owners need both statuses in the list, not just one.

**Decision: grouping**
- Chosen: group by day.
- Options:
  - A: flat list with a full date on each row
  - B: grouped by day
  - C: grouped by status (a "To ship" queue)
- Evidence: None.
- Confidence: Low to Medium.
- Why: the main job is not decided, so a neutral chronological view serves both lookup and
  review. A status-first queue (C) would presume the job is fulfilment.
- Trade-off: work that needs doing isn't pulled to the top; the owner has to filter for it.
- Assumption: newest first is the right default.

**Decision: filter model**
- Chosen: a two-group bottom sheet plus visible active-filter chips.
- Options:
  - A: one row of quick chips mixing both statuses
  - B: a two-group sheet
  - C: segmented tabs for fulfillment only
- Evidence: None, plus RX-UX-06 (show active filters, one-step clear).
- Confidence: Medium.
- Why: the two status dimensions are independent. Mixing them in one chip row hides the AND/OR
  logic, and tabs would drop payment.
- Trade-off: applying a filter takes one extra tap (open the sheet).
- Assumption: AND across groups, OR within a group.

## Assumptions, visible

- Currency is not decided. "$" is a stand-in, labeled on the board.
- All names, totals, times and order numbers are illustrative sample data, labeled on the board.
- Time format is 12-hour English, and "Today" is Oct 7.
- There is no app navigation (tab bar or menu), because no other destinations were given. Adding
  one would invent pages.
- The empty state has no call to action, because no next step for a new store was given.
- Refunded + Unfulfilled shows the amber Unfulfilled pill. Whether a refunded order still counts
  as "to ship" is a business rule I didn't decide. Open question for the owner.

## Not designed

- Order detail
- Pull-to-refresh visuals
- Pressed and focus states drawn as frames (pressed = row background #F1F3F5; focus = a 2 px ink
  ring, specified here only)
- Dark mode
- Tablet and other wider sizes
- Search while typing (the debounce/loading indicator)
- The server-error variant as its own frame (the copy is in the caption)

## Delivery Gate

```
PRODUCT        PASS · user, task and data from the brief; nothing invented beyond labeled sample data · evidence None
UX             PASS · search + two-group filter with visible active filters and one-step clear; whole row opens the order
UI             PASS · clear row hierarchy, one type/spacing scale, role-based color · point of view: task UI
DESIGN SYSTEM  PASS · none existed; smallest token set (orb1-*), one pill/row/chip pattern reused across 9 screens
ACCESSIBILITY  PASS · text ≥ 4.5:1 by hex estimate (no automated checker run), status = icon + word, targets 44 px
               (clear-search 24 px, the WCAG minimum), body 15–16 px; focus order not testable in a static design
RESPONSIVE     PASS · 390 and 320 rendered, no sideways scroll, name truncates first
EDGE CASES     PASS · loading, empty, no matches, error, offline-cached, long name, large total, end of list, load more
CODE QUALITY   N/A · no code changed
VISUAL QA      PASS · rendered with pen.dev TakeScreenshot/Export and inspected; fixed placeholder wrap at 320 and
               a missing icon (clock → hourglass)
ANTI-SLOP      PASS · no invented metrics or urgency; sample data and currency stand-in labeled; no decorative cards or gradients
FINAL          PASS
```

Honest limits: contrast was estimated from hex values and not measured with a tool. There was no
reference evidence, because the ryux MCP was not connected. Every pattern choice above is a
judgment call, not an observed pattern.
