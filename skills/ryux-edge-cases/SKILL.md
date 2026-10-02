---
name: ryux-edge-cases
description: Ryux Edge cases: data, form, network, permission, and system states beyond the happy path. Load when building data views, flows, or anything that talks to a network.
---

# ryux-edge-cases: Edge cases

> Group UX · Delivery Gate area EDGE CASES · RX-2.0. Levels are defined in `ryux-core`.

The happy path is not enough. Walk this list for the screen you built:

| Area | Cases |
| --- | --- |
| Data | empty, one item, many items, long content, missing fields, duplicates |
| Forms | invalid, partial, failed, loading, unsaved, expired |
| Network | slow, timeout, offline, server failure, retry |
| Permissions | read-only, restricted, different roles (only roles that exist) |
| System | session expired, unauthorized, unexpected error |

For each case that can happen, decide what the user sees and what they can do next. Cases that
cannot happen in this product do not need a design; say so in the Delivery Gate.

Does not cover: how errors are worded (see ryux-content).

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `ryux-core`.

## Rules

### RX-EC-01 [Required] [Hard Gate] Critical states exist

- Do: Design the loading, empty, error, and success states of each data view and action that can be slow, empty, or fail.
- Do not: Ship only the filled, happy-path screen.
- Why: Users meet the other states often, and they are where trust is lost. (Nielsen heuristics 1 and 9)
- Check: audit_ui

### RX-EC-02 [Required] Errors with a way forward

- Do: When something fails, say what happened, why if it helps, and the next action (retry, another method, contact).
- Do not: End on an error with only an "OK" button.
- Why: A recoverable error keeps the task alive. (Nielsen heuristic 9 (1994))
- Check: heuristic_eval H-09

### RX-EC-03 [Preferred] Data volume and shape

- Do: Check one item, many items, duplicates, and missing fields; paginate or virtualize long lists.
- Do not: Design only for a tidy sample of five items.
- Why: Real data is uneven, and layouts break at the extremes. (ryux review practice)
- Check: visual QA

### RX-EC-04 [Preferred] Long text and large amounts

- Do: Test with long names, long Indonesian words, and large amounts such as Rp1.250.000.000; wrap or truncate with access to the full value.
- Do not: Design only around short sample strings.
- Why: Real content is longer than sample content and breaks fixed layouts. (Localization practice; ryux review practice)
- Check: visual QA

### RX-EC-05 [Preferred] First use and zero data

- Do: Explain what will appear in an empty view and give one action to get started.
- Do not: Leave a blank list or a lone "No data".
- Why: An empty state is the first lesson in how the feature works. (NNGroup empty-state guidance)
- Check: review

### RX-EC-06 [Contextual] Slow, timeout, offline, server failure

- When: the screen depends on network data
- Do: Keep user input, show cached data with its age, offer retry, and say plainly when the server failed versus the connection.
- Do not: Show an endless spinner, an empty screen, or lose input when the request fails.
- Why: Connection quality varies a lot between places and moments. (ryux review practice)
- Check: review

### RX-EC-07 [Contextual] Roles and restricted access

- When: the product has roles, permissions, or read-only modes
- Do: Design the read-only and restricted states: say why an action is unavailable and who can do it. Use roles that exist in the product.
- Do not: Invent roles or show actions that fail only after the user tries them.
- Why: Users need to know whether to ask someone or give up. (ryux review practice)
- Check: review

### RX-EC-08 [Contextual] Session expiry and unauthorized

- When: the product has sessions or authentication
- Do: On expiry, keep the user's work, ask them to sign in again, and return them to the same place.
- Do not: Dump users on a login screen and lose their progress.
- Why: Re-authentication should cost seconds, not the task. (ryux review practice)
- Check: review
