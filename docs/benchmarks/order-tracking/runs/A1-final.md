I've built the prototype as a single file, `index.html`, with no dependencies. Open it in a browser. On a phone it fills the screen; on a desktop it shows inside a phone frame with a control panel beside it.

I ran it in a headless browser on a phone-sized screen (390px wide) and on a desktop screen and walked through all the scenarios. There were no errors, and I checked screenshots of each state.

**How to try it:** use the control panel (the "⚙ Demo" button on mobile) to pick **Grocery** or **Restaurant** and a scenario: *On time*, *Running late*, *Item unavailable*, or *Late + unavailable*. You can also pause, play at 1×, 2× or 4×, skip to the next step, or set off a delay or an out-of-stock item whenever you like. Time is simulated: one minute takes about 1.5 seconds at 1×.

**Order status, from placed to delivered**
- **Map:** a live map shows the store, your home and the route. For grocery orders, the shopper's dot pulses at the store while they shop. For restaurant orders, a courier is found partway through cooking and you see them drive to the restaurant. After pickup, the scooter follows the route and the part already travelled turns grey.
- **Arrival time:** a large estimated arrival time, a "In about X min" line, an "On time" or "X min late" tag, and a progress bar with four steps (Placed → Shopping/Preparing → Packing/Pickup → On the way).
- **Live updates:** grocery items tick off as "✓ In cart" while the shopper picks them. You get push-style notifications at each step, including "2 minutes away", and a full order activity log with times.
- **Courier:** a card with chat (quick replies, and your number stays private) and a call button.
- **Delivered screen:** a photo of the order at your door, a summary of what changed, a star rating with tags, a tip (only offered for 4–5 stars), and the final receipt.

**When the order is running late**
- The new time shows next to the original promised time, which is struck through, and the progress bar turns amber.
- A banner gives the real reason, such as "FreshMart is busier than usual" or "Heavy traffic on Ridge Rd" (that stretch also shows red on the map). Under 10 minutes late it says "Running about X min late" and explains that a credit kicks in after 10 minutes.
- At 10 minutes or more it apologises and **adds a $5 credit automatically**, so you don't have to ask.
- If the order hasn't been picked up yet, you can **cancel for free** from the banner or the Help menu. After pickup that option is greyed out, with the reason shown.
- Time lost waiting for *your* reply to a substitution doesn't count as late. It shows as a separate "Waiting on your reply" message and doesn't earn a credit.

**When an item is unavailable**
- A panel slides up showing the item, two or three replacements with the price difference for each (one marked "Sam's pick" or "Kitchen suggests"), and a "Remove it and refund me" option.
- **60-second timer:** you have 60 seconds to choose. If you don't, it uses the preference you saved for that item. Each grocery item shows its saved preference, e.g. "If unavailable: best match".
- **Decide later:** "Decide in a moment" closes the panel and leaves a red card on the tracking screen with the countdown still running.
- **Shopper waits for you:** the shopper keeps picking the other items but can't check out until you decide.
- **Restaurant orders** can also cancel the whole order from this panel.
- **What changes afterwards:** the item list shows the replacement next to the struck-through original. The receipt adds a price-difference or refund line, with a note that you're only charged the final total.

**Things to know:**
- The map is a drawn illustration, not a real map.
- The back button, support, and "change instructions" actions only show a notification.
- The chat replies are scripted.
