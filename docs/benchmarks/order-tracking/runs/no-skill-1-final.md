# no-skill-1: final message of each turn

## turn1

I've built the order tracking prototype as a single file with no dependencies: `index.html`. Open it in any browser. On a phone it fills the screen; on desktop it shows in a phone frame with the demo controls beside it. I ran it in a headless browser through the main paths: the item running out, picking a replacement, choosing a refund, the order running late, cancelling, and delivery. No errors came up. The one path I didn't run end to end is letting the 60-second reply timer run out.

**What the customer sees**

- **Order status:** The layout follows ride-hailing apps: a map on top with a panel over it. The order moves through placed → confirmed → shopper picking items (with a live count, e.g. "8 of 11") → packed, with the rider on the way to the store → rider on the way → arriving now → delivered. There's a 4-step progress bar, an arrival time with minutes left, a card for the shopper or rider with chat and call buttons, and the code to give the rider at handover. Below that is an activity list: what has happened with times, and what's next with estimated times. Status changes also appear as phone-style notifications at the top.
- **Running late:**
  - The arrival time turns amber with a "Late" tag and the original time crossed out. An amber card gives a specific reason, which depends on where the order is (store busy, rider held up getting to the store, or traffic). A traffic stretch shows on the map.
  - A $5 credit is added automatically once the delay reaches 10 minutes, with no form to fill in.
  - Before the rider has the food, the customer can cancel for a full refund. A second delay changes the card to "Delayed again". After delivery, the screen says how late it was and apologises.
- **Item out of stock:**
  - A panel comes up showing the missing item crossed out and three replacements with the price difference (the shopper's pick is pre-selected), or a refund.
  - The customer has 60 seconds to reply. If they don't, the shopper takes the closest match so the order isn't held up, and the customer can still turn it down at the door.
  - While the choice is pending, the order pauses and the main screen shows an "Action needed" card. The shopper also sends a chat message. The change then appears in the item list, the receipt and the activity list.
- **Delivered:** A photo of the order at the door, a list of what changed, the receipt with refunds and the credit shown separately, a star rating with a tip, and a "Something wrong with your order?" link (that link only shows a notification for now).

**Demo controls** (side panel on desktop, "Demo" button on mobile): four scenarios (smooth delivery, item out of stock, late, or both), speed from ½× to 4×, pause, skip to the next step, buttons to trigger the out-of-stock item or a 12-minute delay at any point, and restart. Time is sped up, so a whole order takes about 30 seconds at 1×. While the out-of-stock choice is pending, the order clock stops and the 60-second countdown runs in real time.

The store, people and items are made-up sample data. The map is a drawing, not a real map.
