# Edge cases

Designs beyond the happy path: empty, loading, error, offline, permission, and long-content states.

> Group UX · Delivery Gate area EDGE CASES · RYUX 2.4.1. Levels are defined in `SKILL.md`.

The happy path is not enough. Walk this list for the screen you built:

| Area | Cases |
| --- | --- |
| Data | empty, one item, many items, long content, missing fields, duplicates |
| Forms | invalid, partial, failed, loading, unsaved, expired |
| Network | slow, timeout, offline, server failure, retry |
| Permissions | read-only, restricted, different roles (only roles that exist) |
| System | session expired, unauthorized, unexpected error |

For first use and zero data, explain what will appear and give one action to start. For each case
that can happen, decide what the user sees and what they can do next. Cases that
cannot happen in this product do not need a design; say so in the Delivery Gate.

Does not cover: how errors are worded (see `knowledge/content.md`).

## Evidence from RYUX Knowledge

How reference apps show empty, error, offline, and loading states for this flow: `search_screens` with the state in the query. Without the ryux MCP, say the evidence comes from the design and standards alone.

> Hard Gates always apply, whichever skills are loaded: no invented numbers, people, urgency, business
> rules, or terms; no placeholder shipped as final; no missing critical states. See `SKILL.md`.

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

### RX-EC-03 [Preferred] Data volume, shape, and length

- Do: Check one item, many items, duplicates, missing fields, long names and long Indonesian words, and large amounts such as Rp1.250.000.000; paginate or virtualize long lists, and wrap or truncate with access to the full value.
- Do not: Design only around a tidy sample of five short items.
- Why: Real data is uneven and longer than sample data, and layouts break at the extremes. (Localization practice; ryux review practice)
- Check: visual QA

### RX-EC-06 [Contextual] Slow, timeout, offline, server failure

- When: the screen depends on network data
- Do: Keep user input, show cached data with its age, offer retry, and say plainly when the server failed versus the connection.
- Do not: Show an endless spinner, an empty screen, or lose input when the request fails.
- Why: Connection quality varies a lot between places and moments. (ryux review practice)
- Check: review

### RX-EC-07 [Contextual] Roles, access, and sessions

- When: the product has roles, permissions, read-only modes, or sessions
- Do: Design read-only and restricted states (say why an action is unavailable and who can do it, using roles that exist), and on session expiry keep the user's work and return them to the same place after signing in.
- Do not: Invent roles, show actions that fail only after the user tries them, or dump users on a login screen and lose their progress.
- Why: Users need to know whether to ask someone, and re-authentication should cost seconds, not the task. (ryux review practice)
- Check: review
