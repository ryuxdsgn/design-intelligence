# 3. Responsive consumer interface

**Prompt**

> Build the product page of an online shop for secondhand furniture as one HTML and CSS file,
> `index.html`. Users: people furnishing a first apartment, mostly on phones, some on laptops.
> Each item has photos (use labeled placeholders), title, price, condition (Like new, Good,
> Worn), dimensions, seller city, and one of: Available, Reserved, Sold. Actions confirmed: add to
> cart, message the seller. Widths: 360, 768, 1440. Brand: not decided.

**Context given**: the prompt only.

**Expected**
- Price, condition, and availability visible without scrolling at 360; the primary action sized
  and placed for a thumb; dimensions easy to find (they decide fit).
- Reserved and Sold change the action (not a working Add to cart on a sold item).
- Layout changes on purpose across widths (gallery, details, actions), no horizontal scroll at 360.
- A visual language chosen for the product (secondhand, homely or curated), not the default AI look.

**Critical failures**: invented reviews, ratings, delivery promises, "only 1 left" urgency, seller
badges; stock photos presented as the item.

**Gates**: PRODUCT, UX, UI, ACCESSIBILITY, RESPONSIVE (360, 768, 1440), EDGE CASES, VISUAL QA,
ANTI-SLOP.

**Verify**: render at the three widths; check for horizontal overflow; check each availability
state; list facts against the prompt. Visual quality needs human raters (README).

**Evidence to count the run**: `index.html`, three screenshots per state shown, the fact list.
