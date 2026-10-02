---
name: ryux-content
description: Ryux Content design: specific copy, action labels, error messages, natural Indonesian, Rupiah, terminology. Load when writing or reviewing any user-facing text.
---

# ryux-content: Content design

> Group UX · Delivery Gate area UX · RX-2.0. Levels are defined in `ryux-core`.

Copy is interface. Write it specific, concise, human, action-oriented, and in context.

Avoid generic AI language: "unlock", "elevate", "transform", "seamlessly", "powerful solution",
"next-generation", "experience the future", and their Indonesian equivalents
("solusi terbaik", "pengalaman tak terlupakan").

- **Buttons** describe the actual action: "Bayar Rp45.000", not "Lanjutkan" when it pays.
- **Error messages**: 1. what happened, 2. why it matters when that helps, 3. how to recover.
- **Terminology**: one name per thing, everywhere.
- **Indonesian** as users speak it; English only for terms they already use.
- **Money**: Rp1.250.000.

Does not cover: layout of the text (see ryux-ui).

## Rules

### RX-CD-01 [Required] Natural Bahasa Indonesia

- Do: Write the way Indonesian users speak; keep English only for terms they already use (checkout, promo).
- Do not: Ship stiff translations such as "Silakan melakukan pembayaran Anda".
- Why: Natural language reads faster and feels trustworthy. (ryux copy principle)
- Check: audit_copy, review

### RX-CD-02 [Required] Rupiah as Rp1.250.000

- Do: Write money with Rp directly before the number, dots for thousands, and no decimals for whole Rupiah.
- Do not: Write Rp 1.250.000, IDR 1250000, or Rp1,250,000.
- Why: It is the common Indonesian form; mixed formats look careless next to prices. (PUEBI currency notation; ryux run 2026-10-02)
- Check: audit_copy C-07

### RX-CD-03 [Preferred] Labels name the real action

- Do: Name the action and what it gets the user ("Bayar Rp45.000", "Simpan alamat").
- Do not: Use vague labels ("Submit", "Learn more") or hype words ("unlock", "elevate", "seamlessly").
- Why: Specific labels tell users what happens next. (NNGroup button and link-label guidance)
- Check: audit_copy

### RX-CD-04 [Required] Errors: what, why, how to recover

- Do: Say what happened, why when it helps the user act, and how to recover, next to where it happened, without blaming the user.
- Do not: Show codes like TXN_0x8004 or "Something went wrong" on their own.
- Why: Users can only recover from what they understand. (NNGroup error-message guidelines)
- Check: audit_copy C-04

### RX-CD-05 [Required] [Quality Lock] One name per thing

- Do: Use one term for each concept across screens, buttons, and messages.
- Do not: Call the same thing "pesanan", "order", and "transaksi" on different screens.
- Why: Changing terms make users wonder whether it is a different thing. (Nielsen heuristic 4 (1994))
- Check: review

### RX-CD-06 [Preferred] Plain decoration

- Do: Use sentence case and plain lists; one emoji is fine where the channel expects it.
- Do not: Use emoji as bullets, ALL CAPS, or stacked exclamation marks.
- Why: Decoration on every line buries the information and reads as generated. (ryux run 2026-10-02: unconstrained WhatsApp copy)
- Check: audit_copy, review

### RX-CD-07 [Preferred] Help at the point of need

- Do: Put short help where the question arises (a hint under a field, "Kenapa diminta?").
- Do not: Send users to a separate FAQ for a field-level question.
- Why: Help in context gets read; help elsewhere gets skipped. (Nielsen heuristic 10 (1994))
- Check: heuristic_eval H-10

### RX-CD-08 [Contextual] Chat copy sounds like a person

- When: the text goes to WhatsApp, Telegram, or another chat channel
- Do: Use a short greeting, short paragraphs, sparse *bold*, and a clear contact line.
- Do not: Paste a marketing page into a chat.
- Why: Chat readers expect a message from a person, not an ad. (ryux run 2026-10-02: WhatsApp promo comparison)
- Check: review
