I've built the order tracking prototype as a single web page with no build step and no dependencies: open `index.html` in a browser. I ran it in headless Chrome at 390 px and 360 px wide (phone sizes) and on a desktop layout. Every flow worked with no console errors: a full autoplay run, choosing a refund, rider chat, running late, delivered, and cancel. On a phone it fills the screen; on desktop it sits in a phone frame with a controls panel beside it.

**Status from placed to delivered**
- Layout borrowed from ride-hailing apps: a live map (store, rider moving along the route, home) with a sheet below showing the current status in plain words, the arrival time and a 4-step progress bar.
- Before the rider has the order, the arrival time is a range (7:29–7:37 PM). Once they have it, it becomes an exact time with minutes left.
- While the shopper picks, each item updates live: Found, Needs you, Replaced, Refunded, or 4 of 6 found.
- A timeline records every event with a time. Notifications slide in at each step.

**Item unavailable**
- A notification, then a bottom sheet with three choices: the shopper's recommended replacement, a cheaper one, or a refund. Each shows the price difference.
- A visible 60-second countdown says what happens if the customer doesn't answer: the shopper picks the best match. The shopper keeps picking other items meanwhile and only waits once nothing else is left.
- If the customer closes the sheet, an "Action needed" card stays on the tracking screen.
- A second case: when only 4 of 6 bananas are available, the missing 2 are refunded automatically and the customer is told.
- The receipt shows the amount held at checkout and the final charge, so the customer only pays for what arrives.

**Running late**
- The app tells the customer before they have to ask: a notification, an amber arrival time with the old range struck through, and a plain reason (a road closure, with the rider taking a detour). The map highlights the traffic.
- A $5 credit is applied automatically as soon as the order falls outside the promised range. A small slip that stays inside the range only shows a gentle "a few minutes behind" note.
- From there the customer can switch to "leave at door" so they don't have to wait in, message the rider, or cancel for a full refund.

**Delivered**
- Delivery time and how it was handed over, plus a photo at the door if they chose "leave at door".
- An apology with the credit if it was late, and a summary of every change with amounts.
- Ratings for the rider and the shopper, a tip, and the final receipt.

**Demo controls** (the "Demo" button on a phone, the side panel on desktop): play/pause, next step, speed 1×/2×/4×, turning each scenario on or off, and jumping straight to "Item unavailable", "Running late" or "Delivered". At 1×, one second is about one minute of the order. The clock pauses while a sheet is open, so there's time to read and decide.

Two things to know:
- Calling, the support chat and "report an item" only show a notification; chat with the shopper and rider works, with scripted replies.
- On a phone, the floating Demo button can cover the right edge of a card.

Files are in `A2`:
- index.html
- styles.css
- app.js
- README.md
