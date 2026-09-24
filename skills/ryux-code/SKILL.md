---
name: ryux-code
description: ryux-rules: Clean code. honest comments, meaningful names, no dead code, consistent style. Load when working on clean code.
---

# ryux-code: Clean code

> ryux.design design rules, version 0.2.0, MIT licensed.
> Apply to clean code work before considering it done.

- **RX-K-01** Comments explain the reason (why), not restate what the code already makes obvious.
- **RX-K-02** Variable and function names are specific and meaningful; avoid data, temp, helper, manager without context.
- **RX-K-03** Remove dead code, unused imports, and commented-out blocks; don't leave empty TODOs.
- **RX-K-04** Follow the style of the surrounding file (format, naming, patterns); don't impose a new one.
- **RX-K-05** Avoid over-engineering: no abstractions or config for needs that don't exist yet.
- **RX-K-06** Handle errors with actionable messages; don't swallow errors silently.
