---
name: ryux-local
description: ryux-rules: Indonesian patterns. QRIS, VA, OTP, fees, address, paylater, e-KYC, local references. Load when working on Indonesian patterns.
---

# ryux-local: Indonesian patterns

> ryux.design design rules, version 0.3.0, MIT licensed.
> Apply to Indonesian patterns work before considering it done. [Required] rules are a hard gate; the rest
> may be broken only with a written reason.

- **RX-L-08** [Required] References and patterns come from real Indonesian apps.
- **RX-L-01** [Required] QRIS: the amount and merchant name are clear before confirmation.
- **RX-L-02** [Required] Virtual account: copy-number button, payment deadline, per-bank guidance.
- **RX-L-03** OTP: offer a channel (SMS or WhatsApp); a reasonable resend countdown.
- **RX-L-04** [Required] Fees (admin, shipping, tax) are visible before the user commits.
- **RX-L-05** Address: support a landmark and house details, not just a map pin.
- **RX-L-09** Paylater or installments: show the limit, tenor, and total cost clearly.
- **RX-L-10** e-KYC: framing guidance and the reason for collecting data before the camera opens.
