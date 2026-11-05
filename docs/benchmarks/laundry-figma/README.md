# Laundry order in Figma: No skill vs RYUX 2.22.1

One run per arm, 2026-11-05, as written in [PROTOCOL.md](PROTOCOL.md) before the runs. Neither arm asked a question,
so [reply.txt](reply.txt) was not sent. Each run's final answer is in [`runs/`](runs/).

| | A, No skill | B, RYUX 2.22.1 |
| --- | --- | --- |
| Cost, minutes, turns | $4.36, 16.7 min, 32 | $5.37, 18.4 min, 33 |
| Figma calls (use_figma / screenshots) | 17 / 9 | 13 / 1 (plus renders inside use_figma) |
| Screens at 390 | 15 | 13, plus a direction board |
| Skill calls | 0 | 1, base directory = the run folder's 2.22.1 copy |

## Traps shown as fact (fewer is better)

Kinds from the protocol, counted on the frames, not in the chat answer.

| Kind | A | B |
| --- | --- | --- |
| Price per kilo or item | Rp6.000–9.000/kg, mulai Rp25.000; no label | Rp6.000–10.000/kg; labeled "contoh · belum diputuskan" on screen 1, unlabeled on six later frames |
| Minimum weight | none | none |
| Turnaround | "2 hari", "kembali wangi dalam 2 hari", Kilat 1 hari | labeled on the frames that show it, except E3 |
| Express or delivery fee | Kilat +Rp5.000/kg, antar-jemput Rp10.000 "Gratis", biaya layanan Rp2.000 | ongkos jemput-antar Rp10.000 on six frames, **never labeled** |
| Discount or promo | voucher ongkir Rp10.000 as compensation, Promo tab | none |
| Damaged or lost item policy | "Laporkan dalam 24 jam" | report link labeled "fitur usulan · belum dikonfirmasi"; no policy |
| Courier time as a promise | "Kurir menelepon 15 menit sebelum tiba", re-weigh video "dalam 30 menit" | none; the slot is the window |
| **Kinds shown as fact** | **6 of 7** | **2 of 7** (fee never labeled; price labeled only on its first frame) |

A also states rules outside the list as fact: approval needed above 1 kg, a two-hour answer deadline, a 30-minute
auto-accept, free cancel, free first reschedule, GoPay charged after weighing, a 4-digit handover code, and a 4,9
courier rating. B tags its open rules on the frame (yellow dashed "belum diputuskan"), but its own Delivery Gate
says "22 tagged / 22 shown, none stated as fact", which the fee disproves: the self-check overclaimed.

## States (more is better)

| State | A | B |
| --- | --- | --- |
| Pickup failed or late | late (Lipatan's side) and customer not found | failed (gate locked); other causes in the caption |
| Weighed laundry differs | heavier, lighter, and a dispute sheet | heavier, lighter |
| Payment step | no screen; GoPay named on the summary | no screen; "Bayar" button, stated as not designed |
| Being washed | yes | yes |
| Out for delivery | yes, with handover code | no frame; a tracker step only |
| Delivered | yes | yes |
| Loading | no | yes, skeleton |
| Error | no | order failed to send, address outside the area |
| Empty | no | no slots left today |
| **Present** | **5 of 9** | **7 of 9** |

## Price, format, copy

- Both explain that the price is an estimate until weighing, and both ask before washing a heavier load. A puts a
  number on the threshold (> 1 kg); B leaves it as an open rule.
- Rupiah (Rp47.000) and Indonesian dates and times (Kam, 5 Nov · 13.00–15.00) are right in both.
- Copy: natural Bahasa Indonesia in both (judgment, to be confirmed by the owner).

## What this does not show

- One run per arm: what these runs did, not a rate. Visual quality is not scored here; the owner may rate the pages
  blind.
- A covers more of the happy path (out for delivery, a dispute sheet, two kinds of failed pickup); B covers more
  system states and keeps more rules open. Neither designed a payment screen.
