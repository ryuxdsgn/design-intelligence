# EN-OR-A1 · Orders list: design reasoning

Frame: `PkobG` in ryux.pen, 390 x 906, at x 68012 / y 0 (to the right of all existing content).

## What I assumed (I asked no questions)
- A small to mid-size online store (made-up name "Northwind Goods"). One admin, or a small team, packs and ships the orders.
- USD currency and English copy. All data is placeholder.
- On mobile, the admin's main job on this screen is "what do I need to ship next, and is anything blocking it?" Full reporting and bulk editing stay on desktop.

## Key decisions
1. **Default view is "To fulfill", not "All".** Most of the time an admin opens Orders on a phone to act on it. "All 248" is still one tab away. Tabs carry counts (All 248, To fulfill 12, Unpaid 3, Shipped, Returns 1), so the admin can see the workload without opening each one. The tab row runs off the right edge on purpose, to show it scrolls sideways.
2. **The list is grouped by urgency, not by date placed.** Within To fulfill, the useful question is "when must this ship". The groups are Overdue (red band, clock icon, "Was due Oct 6"), Ship today ("Carrier pickup 5 PM"), and Ship by tomorrow. The group counts add up to the tab count (2 + 6 + 4 = 12).
3. **Rows are scannable, not cards.** Each row is full width with a hairline divider and no boxes:
   - Line 1: order number (mono, muted, so it is easy to match) and customer name (the main identifier).
   - Line 2: item count, shipping method, and order date. Shipping method changes how the order is packed.
   - Right column: total, with payment status under it.
4. **Badges only for exceptions.** In this view "Paid" and "Unfulfilled" are normal, so they show as quiet text or not at all. Colour appears only where action is needed: "Pending" payment plus a "Wait for payment" badge (amber), "2 of 4 shipped" for a partly fulfilled order (blue), and overdue (red). Less colour means the exceptions stand out.
5. **Controls in reach, in the expected places.** Search sits near the top (order number, customer or email are the real lookup keys). Sort and filter are 44 px icon buttons next to the title. Bottom tab bar: Home, Orders (active), Products, Customers, More. Touch targets are at least 44 px. Rows are about 70 to 100 px tall.
6. **Visual style.** Restrained and neutral: white surface, warm grey group bands, near-black ink, Geist with Geist Mono for order numbers. No gradients and no decoration. A dense list of data reads best when quiet.

## Not designed (would be next)
- Row tap target (order detail), swipe actions, multi-select for bulk "Mark as fulfilled / print labels"
- Empty state ("All caught up, nothing to fulfill"), loading skeleton, error or offline state
- Filter sheet content and sort options
- Search results state, dark mode, larger text sizes, and how a long customer name truncates against a long total

## Open questions I would ask a real team
- Do they ship from one location or several? Several would need a location filter.
- Who uses mobile: an owner checking in, or warehouse staff packing? Packing staff may want a pick-list view instead.
- Is there a real carrier cutoff time? "Carrier pickup 5 PM" is an assumption.
