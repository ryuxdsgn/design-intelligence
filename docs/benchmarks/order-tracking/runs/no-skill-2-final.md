# no-skill-2: final message of each turn

## turn1

You've hit your 5-hour limit · resets 4:10pm (Asia/Jakarta)

## turn2

I built the order tracking prototype as three plain files with no build step. Open `index.html` in a browser to use it. On a phone it fills the screen. On a desktop it shows in a phone frame, with a panel beside it for switching scenarios.

I ran it in headless Chrome at desktop and phone sizes with no console errors. These checks passed: the happy path arrives on time at 6:44 PM; a missing item can be swapped for a replacement or refunded; the default choice is applied when the customer doesn't answer; a delay produces the late warning and a $5 credit; and cancelling for free while late works. I also looked at screenshots of each screen.

**The order status, from placed to delivered**
- **Six steps:** order placed → store confirmed → picking items → on the way → arriving → delivered.
- **Arrival time:** before the driver leaves, it shows a 10-minute window ("6:40–6:50 PM"). Once the driver is on the way, it switches to minutes left ("9 min, around 6:44 PM"), like ride-hailing apps.
- **Map:** shows the store, the route and your home. The car moves along the route and its arrival time is labelled on the home pin.
- **While shopping:** the screen shows "11 of 12 picked" and the status of each item. The hot rotisserie chicken is picked last so it stays hot.
- **Driver card:** name, rating, car and number plate, plus buttons to message or call. Messaging works, with quick replies.
- **Phone-style notifications** appear at each step. There's also a timeline with the actual time each step happened and estimates for the ones still to come.
- **After delivery:** a drop-off photo, whether it arrived on time, what changed in the order, rating and tip, and the final amount charged compared with the amount held on the card.

**When the order is running late**
- The arrival label turns amber and reads "Updated arrival", with the old time crossed out.
- The banner gives a reason that fits the step the order is at, such as busy store or heavy traffic. The map highlights the slow part of the route in red.
- **Credit is added automatically:** $5 at 10 minutes late and $10 at 20, so the customer never has to ask.
- **Cancelling:** free if the order is late and the driver hasn't left yet. After the driver leaves, cancelling is no longer offered. A small delay that stays inside the original window gets a calm note instead of a warning.

**When an item is unavailable**
- A sheet opens with Dana's note about the item. Dana is the shopper and the driver.
- The customer chooses between Dana's suggested replacement, another option, or a refund, and each one shows the price difference.
- A countdown shows how long Dana will wait. If there's no answer, the customer's default applies, either "Use Dana's pick" or "Refund it", and they can set that default in the same sheet.
- They can tap "Decide later" and come back through a banner, and can still change the choice while Dana is shopping.
- The order total updates straight away, and the screen explains that the card only has a temporary hold, so they're charged only for what they receive.

**Demo controls:** there are four scenarios: happy path, running late, item unavailable, and both together. You can play, pause and change speed (1×, 3× or 8×), and jump to any step. Jumping restarts the scenario from that step. You can also add a delay or mark an item out of stock at any moment. Simulated time runs 12 times faster than real time. While the item decision is open, speed is held at 1× so the countdown can be read. You can open a scenario directly with a link like `index.html?scenario=late`.

A few things are placeholders that show a short message instead of a screen: editing delivery instructions, reporting a problem with an item, chatting with support, and calling the driver.

Files are in ``:
- `index.html`
- `styles.css`
- `app.js`
