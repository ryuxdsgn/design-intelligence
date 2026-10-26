I've built the order tracking prototype for a grocery delivery app ("Green Basket"). It's plain HTML, CSS and JavaScript with no build step: open `index.html` in a browser. I ran all four scenarios in headless Chrome at phone (390×844) and desktop sizes with no JavaScript errors, and checked screenshots of each state. I haven't tried it on a real phone or in Safari.

**Placed to delivered**
- A live map shows the shopper working at the store, then the courier's scooter moving along the route, with the distance left.
- The arrival time is shown as a range while the order is being shopped, and becomes a single time once the courier picks it up.
- A four-step progress bar (Placed, Shopping, On the way, Delivered) fills in as the order moves along.
- During shopping there's a live checklist of items being picked.
- There's a card for the shopper, then the courier, with chat (quick replies and auto-replies) and calling through a masked number.
- Updates appear as push-style notifications, and there's an expandable order timeline.
- Delivered screen: a drop-off photo placeholder, a list of what changed in the order, star rating, then tip options, and a final receipt showing how much of the card hold was released.

**Running late**
- The arrival time turns amber, a "12 min late, was 10:54" chip appears with the old time crossed out, and the minutes left show "· updated".
- The customer is told why: the store is busy (during shopping) or there's traffic (on the way, also shown in red on the map).
- If the order is more than 10 minutes late, $5 credit is added automatically. Before that, the app says it will add credit so the customer doesn't have to ask.
- Before pickup the customer can cancel for free. After pickup the option becomes "Message Marco", and cancelling shows as unavailable with the reason.
- The countdown never goes negative; near the end it reads "Any minute now". The late notice can be collapsed to a single line.

**Item unavailable**
- A panel slides up: "Organic Whole Milk is out of stock". It shows the shopper's suggested replacement and the price difference, other options, and a "Don't replace, refund" choice.
- A countdown tells the customer that if they don't reply in 1:30, the shopper will follow their saved preference. They can set that to "Best match" or "Refund" in the item list.
- "Decide later" leaves an "Action needed" banner with the countdown. If the order reaches handoff before they answer, their preference is applied automatically.
- A partial case is also included: only 3 of 4 avocados were ripe, so one is refunded automatically and the customer gets a notification.
- Each item shows a "Replaced · you chose", "Replaced · best match" or "Refunded" label, and the receipt shows the replacement and refund lines.

**Demo controls.** These sit in a side panel on wide screens and behind a "⚙︎ Demo" button on smaller ones. You can pick one of four scenarios (Happy path, Item unavailable, Running late, Late + unavailable), pause, run at 1×, 3× or 8×, skip to the next step, or trigger a delay or an out-of-stock item at any point. You can also open a scenario directly with a link like `index.html?scenario=both` (the others are `happy`, `oos` and `late`).

Two things behave differently from a real app:
- **Simulated time:** each order minute passes in about 2 seconds at 1×, so a full order takes about a minute.
- **Paused simulation:** time stops while the out-of-stock question is open, because the shopper is waiting in the aisle. The reply countdown still runs in real seconds.

Files are in `A3`:
- `index.html`
- `styles.css`
- `app.js`
