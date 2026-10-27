I've designed the order tracking experience on a new page called **Pilot A2** in the Ujicoba file. It has 8 mobile screens (390×844), a header with the state flow and design principles, and design notes under each screen. I checked every screen with screenshots and fixed the problems that showed up.

**Approach (borrowed from ride-hailing apps):** one tracking screen with a live map on top and a bottom panel that changes with each order stage. A 4-step progress bar (Placed → Preparing → On the way → Delivered) stays in the same place on every stage screen. Both problem cases are handled on that same screen, so the customer never gets sent to a separate error page.

| # | Screen | What it does |
|---|---|---|
| 01 | Order placed | Arrival time shown as a range from the start, a countdown for free cancellation, and the store → home route on the map |
| 02 | Shopping your items | Live picking progress ("8 of 12 picked"). One item shows "Checking shelf…" as an early hint that something may be out of stock |
| 03 | Item unavailable | A panel over the dimmed map with the original item, a pre-selected suggested replacement, the price difference and automatic refund, and a reply timer. If the customer doesn't answer, the shopper picks the best match, so the order never waits on them |
| 04 | Choose a replacement | In-stock alternatives with price differences, "Don't replace — refund it" as a full option, a "use this choice next time" switch, and a footer showing the new total |
| 05 | On the way | Courier on the map, arrival time in minutes and clock time, courier card with chat and call buttons, and the earlier replacement still listed |
| 06 | Running late | The new arrival time with the old one crossed out, a plain-language reason (heavy rain), a Rp10.000 voucher added automatically, and the rule that orders 30+ min late can be cancelled for a full refund |
| 07 | Lock screen | A live tracking card on the lock screen in the late state, plus a notification about the out-of-stock item that the customer can act on |
| 08 | Delivered | Delivery photo and a summary that accounts for every change: the replacement, the refund and the voucher. The totals add up |

**How it's built:** colours come from a new "Pilot A2" variable collection (23 colours: brand, text, surfaces, status and map). There are two reusable components, Status bar and Button (Primary, Secondary, Danger and Ghost). The font is Plus Jakarta Sans.

**Things to know:**
- **Copy:** the text is in English, but prices use rupiah and the places are in Jakarta, to match the Indonesian context of the file's other pages. Tell me if you want it in Indonesian.
- **Placeholders:** product images and the delivery photo are simple placeholder shapes, not real images. The maps are drawn by hand, not real map tiles.
- **Lock-screen transparency:** Figma drops a colour's transparency when it's linked to a variable. I fixed this on the dimmed background in screen 03. The lock-screen cards in screen 07 are therefore fully opaque white rather than slightly see-through like real iOS cards.
