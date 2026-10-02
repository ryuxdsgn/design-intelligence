---
name: ryux-ux
description: ryux-rules: Interaction and applied UX (NNGroup). status, control, forms, errors, checkout, trust, mobile input. Load when working on Interaction and applied UX (NNGroup).
---

# ryux-ux: Interaction and applied UX (NNGroup)

> ryux.design design rules, version 0.3.0, MIT licensed.
> Apply to Interaction and applied UX (NNGroup) work before considering it done. [Required] rules are a hard gate; the rest
> may be broken only with a written reason.

- **RX-H-01** [Required] Visibility of system status: a process over 1 second shows status plus an estimate.
- **RX-H-03** [Required] Control and freedom: provide cancel, undo, and a clear way out.
- **RX-H-05** [Required] Error prevention: confirm destructive actions, validate before sending.
- **RX-H-06** Recognition over recall: show options and context, reduce memory load.
- **RX-H-07** Flexible and efficient: offer shortcuts for expert users.
- **RX-H-10** Short contextual help at the point of use.
- **RX-N-01** [Required] Feedback matches response-time limits: over 1s show loading, over 10s show progress plus an estimate.
- **RX-N-02** Single-column forms, labels above the field (not only inside it).
- **RX-N-03** [Required] Validate inline and keep the user's input on error.
- **RX-N-04** Minimize fields; mark required/optional clearly; use sensible defaults.
- **RX-N-05** [Required] Error messages state the problem plus the fix, near the source; don't blame the user.
- **RX-N-06** [Required] Total cost (shipping, admin, tax) is transparent before the user commits.
- **RX-N-07** A reviewable order summary plus a progress indicator for multi-step flows.
- **RX-N-08** Low sign-in friction: support guest checkout or fast login.
- **RX-N-09** [Required] Honest trust: no fake urgency or scarcity; real security signals.
- **RX-N-10** Correct mobile input: keyboard matches the type (numeric for amounts/OTP), autofill.
- **RX-N-11** [Required] Prevent mistakes: confirm irreversible actions (delete, pay) plus undo when possible.
