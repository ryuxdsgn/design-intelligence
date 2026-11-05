The Lipatan order flow is built in Figma on a new page, **"Porto A1"**. It has 15 mobile screens at 390 × 844, with copy in Bahasa Indonesia and prices in Rupiah. Each screen has a short caption above it explaining the design decision. Text, layout and illustrations are all editable layers; there are no flattened images.

**Row 1: placing the order (01–06)**
- **01 Beranda:** greeting, the active pickup address, an illustrated banner, and four service cards with price per kg (Cuci Setrika at Rp9.000/kg is selected).
- **02 Atur cucian:** a weight estimator (5 kg, "± 1 keranjang sedang") with quick picks, speed (Reguler / Kilat) and pewangi choice. The running estimate is Rp45.000.
- **03 Alamat penjemputan:** a map, a landmark note for the courier, a contact number, and a "titip satpam" fallback.
- **04 Waktu penjemputan:** date chips and 2-hour slots marked Penuh, Sisa 2 slot or Tersedia, plus the estimated return date.
- **05 Ringkasan & bayar:** total labelled "Perkiraan Rp47.000". It explains up front that the final price follows the weighing, and that payment is charged only after weighing.
- **06 Pesanan diterima:** order number and the three next steps.

**Row 2: following the order (07–10)**
- **07** Courier on the way, with a map, arrival time, a 5-step progress bar, and chat/call buttons.
- **08** Order detail with a timeline, including the weight result, when it was approved, and a photo link.
- **09** Delivery back, with a 4-digit handover code.
- **10** Delivered, with a quick review and a link to report problems within 24 hours.

**Row 3: when plans change (11–15)**
- **11 Penjemputan tertunda (Lipatan's side):** the courier is about 45 minutes late because of rain. It shows the old and new times and three choices: keep today, move to tomorrow, or cancel for free. A Rp10.000 voucher is given automatically.
- **12 Kurir tidak bisa menemui (customer's side):** a visit log with a photo. Options are a free reschedule today, leaving it with the security guard, or another time.
- **13 Berat lebih dari perkiraan:** 6,4 kg against the 5 kg estimate (+Rp12.600), with photo evidence and a reply deadline. If the customer doesn't answer, the laundry is held, not washed or charged.
- **14 "Ada yang tidak sesuai?" sheet:** re-weigh with video, remove some items, chat with the outlet, or cancel and get everything back.
- **15 Berat kurang dari perkiraan:** 4,2 kg, and the bill drops to Rp39.800 automatically.

One rule ties the weight screens together, and screen 05 states it before ordering: lighter means the price drops automatically; more than 1 kg heavier needs the customer's approval. The prices and weights stay consistent across screens. For example, the 6,4 kg approved on screen 08 matches screen 13.

**The look:** teal and mint as the main colours, with sun-yellow and coral accents. Headings use Fredoka and body text uses Plus Jakarta Sans. Eight custom flat illustrations add the friendly touches: a smiling washing machine, the courier on a scooter, a laundry basket, a clock with rain, a closed door, two scales (heavier and lighter), and a map.

**Reusable pieces:** a "Komponen Lipatan" section to the left of the screens holds 20 colour variables, 12 text styles, 2 shadow styles, 36 icons, the 8 illustrations, a button with 4 variants and an editable label, an app bar, a status bar and a home indicator. All screens use these instead of fixed values.

**Not done:**
- **No prototype links between screens.** Each phone frame sits inside a frame that also holds its caption, so links can't point at the phone alone. To make it clickable, I'd move the phone frames out to the top level.
- **The basic Material and iOS kits already attached to the file weren't used.** They didn't fit an illustrated brand like this.
