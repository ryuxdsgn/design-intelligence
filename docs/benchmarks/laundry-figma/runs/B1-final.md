I've designed the Lipatan order flow in Figma on a new page, **Porto B1**. It has 13 mobile screens at 390 wide, in two labelled rows, with all app copy in Bahasa Indonesia and amounts like Rp60.000. I checked every screen as a render and fixed what I found (a cloth drawing that read as a calendar, a card hidden under the bottom bar, overlapping labels).

**The main flow (row 1)**
1. **Pilih layanan:** four services with per-kg prices, plus an estimated weight. That estimate is what the weighed result gets compared against later.
2. **Alamat & jadwal jemput:** saved address, a note for the courier, date chips and 2-hour time slots. Full slots stay visible but are crossed out.
3. **Cek & pesan:** the estimated total is the biggest number. Next to it is the promise that if the weight differs, the customer approves before anything is washed. The button says "Pesan penjemputan".
4. **Kurir menuju rumahmu:** courier card with chat and call, plus a short checklist of what to do while waiting.
5. **Sedang dicuci:** the final bill, "Bayar Rp82.000", and a history log.
6. **Cucianmu sudah sampai:** delivered, with "Pesan lagi".

The order is tracked on a **clothesline**: one t-shirt per stage (Dijemput, Ditimbang, Dicuci, Diantar, Sampai). Finished stages are teal with a tick, the current one is sun-yellow, and later ones are dashed. Each stage is also labelled in text, so it doesn't rely on colour alone.

**When things go wrong (row 2)**
- **E1, pickup failed:** a locked gate with the laundry bag still behind it, and the first shirt turns red. The main action is "Pilih waktu jemput baru". You can also chat with the courier, and "Batalkan pesanan" is a less prominent red text button.
- **E2, heavier than expected:** a bottom sheet with a hanging scale. "Berat cucianmu 7,2 kg" sits next to the old estimate (crossed out) and the new total of Rp82.000 (+Rp22.000). The laundry is held until the customer chooses. One main button ("Setuju, lanjut cuci"), then "Minta timbang ulang", then a red text option to cancel and have it returned.
- **E3, lighter than expected:** a notice only. The bill drops to Rp51.000 and washing carries on.
- **System states:** no slots left today (empty clothesline, offers tomorrow's earliest slot), loading skeleton, address outside the service area, and order failed to send (inputs kept, "Coba kirim lagi").

**Look:** teal and mint with sun-yellow and coral, Plus Jakarta Sans, and small line-and-flat drawings of laundry objects with no people. The direction and the written illustration style are on a notes board to the left of the screens. Colours are Figma variables (30 in total) and the repeated parts are components.

**Business rules you need to decide.** Your brief didn't set these, so every one on screen has a yellow dashed "belum diputuskan" tag. The tags are notes for the team, not part of the app:
- All prices, the Rp10.000 pickup-and-delivery fee, turnaround times and slot windows are sample numbers.
- Paying after weighing.
- Asking for approval when the laundry is heavier, but not when it's lighter.
- Cancellation fees, the service area, and how long the customer can chat with the courier.
- "Lihat foto timbangan" (photo of the scale) and "Laporkan masalah cucian" (report a problem) are features I proposed; they aren't confirmed.

**What I skipped or didn't check**
- I picked the visual direction from your "fresh and friendly, illustrated" brief without stopping to show you alternatives, so treat it as provisional. If you'd like to compare, the other two I'd offer are an editorial direction where type leads, or a darker night-laundry look.
- Not designed: other widths, dark mode, the payment screen, the courier's side, and the screen for rescheduling after a failed pickup (it would reuse screen 2).
- Text contrast passes the accessibility standard (WCAG AA) on every pair I measured; the lowest is 4.78:1, red on its pink background. Screen readers and real users were not tested.
- A usability test of the weight-approval sheet (E2) would show quickly whether people understand the new total.

I left 5 annotations explaining key decisions, on screens 1, 3 and 4 and on E1 and E2. To see them, open Dev Mode (Shift+D) and select the screen.

```
PRODUCT        PASS · open rules tagged on screen, none stated as fact · evidence None (brief only) · rationale 5 annotations
UX             PASS · order → track → deliver is complete; failed pickup and weight differences each have a way forward
CONTENT        PASS · Bahasa Indonesia, Rupiah written Rp60.000, buttons name their action · open rules on screen 22 tagged / 22 shown
UI             PASS · clothesline tracker as the signature · 10 drawings made, 10 planned · style written on the notes board
DESIGN SYSTEM  PASS · 30 variables, Button with 4 variants, StatusBar, HomeIndicator, open-rule tag; icons are fixed colours, not variables
ACCESSIBILITY  PASS · lowest text contrast 4.78:1; tap targets 44 px or more · screen reader not checked
RESPONSIVE     NOT VERIFIED · 390 wide only, as asked; nothing else designed
EDGE CASES     PASS · services: sample prices · slots: L1 empty, full slot shown · address: L3 · order sent: L4 failed · tracking: L2 loading, E1 failed, screen 6 done · weight: E2, E3
CODE QUALITY   N/A · design only, no code
VISUAL QA      PASS · Figma renders of all 13 screens; overlaps, a hidden card and a misreading drawing found and fixed
ANTI-SLOP      PASS · no invented reviews or numbers; courier, customer and order details are sample data
FINAL          NOT VERIFIED · only 390 wide was designed and nothing was tested with users
```

Link: https://www.figma.com/design/Zq8v2pwQPX9fPCShDpKKpj/Porto-B — page **Porto B1**
