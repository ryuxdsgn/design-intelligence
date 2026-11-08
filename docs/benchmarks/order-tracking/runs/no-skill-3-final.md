# no-skill-3: final message of each turn

## turn1

I've built the prototype as one file, `index.html`, with no dependencies. Open it in a browser. I ran it in headless Chrome at phone size and desktop size through all three cases: picking a replacement, letting the replacement timer run out, and an order that's late and has an unavailable item. There were no console errors.

On desktop the app shows in a phone frame with demo controls beside it. On a real phone it fills the screen, and a "Demo controls" button opens the panel. The panel has four scenarios (on time, running late, item unavailable, both), play/pause, next stage, speed from ½× to 4×, and buttons to make the order late or an item unavailable at any point. At 1×, one second is about one minute of order time. It opens on the "both" scenario; to start on another, add `?scenario=happy`, `late` or `oos` to the URL.

**Order status, placed to delivered**
- **Layout:** a map at the top shows the store, the route and your home, with the arrival time pinned to the home. Below it, a sheet shows the arrival time, a four-part progress bar (Confirmed, Shopping, Checkout, On the way) and one plain-language status line.
- **Arrival time:** it shows as a range early on (7:39–7:47 PM) and changes to "Arriving in 12 min" once the order is on the way.
- **Details:** each item gets ticked off as the shopper picks it. There's also a timestamped list of updates, a shopper card with chat and a simulated call, and phone-style notifications at each key moment.
- **Delivered screen:** a drop-off photo, a "What changed" list, and a receipt that explains why the final charge differs from the checkout estimate. It also has a rating and an option to change the tip.

**When the order is running late**
- **Told first:** the customer gets a notification before they'd notice the delay. The reason fits the stage (busy store, long checkout lines, or heavy traffic), and the new arrival range is shown.
- **Nothing hidden:** the original time stays on screen, crossed out, and the map route, progress bar and arrival time turn amber.
- **Credit:** $5 is added automatically once the order is 10 or more minutes late, and $10 at 20 or more, with "You don't need to contact us."
- **Options:**
  - Cancelling is free only while the shopper is still shopping. After that the option is greyed out with the reason.
  - There's a late guarantee: if it isn't delivered by a stated time, delivery and service fees are refunded.
  - The customer can also change the drop-off instructions or message the shopper.
- **After delivery:** the delivered screen confirms the order arrived late and that the credit applies to their next order.

**When an item is unavailable**
- **The ask:** a sheet opens with the shopper's own message, her suggested replacement (labelled "Maya's pick"), other options with the price difference shown, and "Don't replace it", which refunds the item.
- **Default if no answer:** a 30-second countdown says what happens then: the shopper uses her pick, and the customer can still get a refund after delivery. The shopper keeps picking other items meanwhile, but checkout waits for the answer.
- **If they close the sheet:** a red "needs your choice" card stays on the tracking screen with "Accept her pick" in one tap.
- **Item list:** the original shows crossed out, with the replacement or refund under it.
- **After delivery:** the delivered screen has a Refund button next to each replacement.

**Limits:**
- Calling and the "missing item" reports are simulated, and the chat replies are scripted.
- The 30-second countdown runs on real time, not order time, so it's readable at any speed. A real app would give the customer several minutes.
- The map is a drawing, not a real map.
