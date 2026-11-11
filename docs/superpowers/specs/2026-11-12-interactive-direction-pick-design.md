# Interactive direction pick (`ryux pick`) — design

## Intent and why

When RYUX's Design capability reaches Explore, it offers three visual/UX directions as tiles on a
local HTML page, opens that page in the browser, and asks the user to choose. Today the choice
travels back by hand: the user reads the page, then types or pastes their pick into the CLI. The
owner's judgement (2026-11-11): the copy-paste bridge makes the flow feel half-finished — the
decision is made in the browser but has to be re-entered by hand.

This feature closes that loop. The user clicks a tile in the browser; the choice flows straight
back to the agent with no copy-paste. If none fit, one click sends the agent back to generate three
fresh directions, and the page reloads with them.

## Goals

- A click in the browser answers the agent directly: no manual copy, type, or paste.
- "None of these — make three new" is a click; the agent re-runs Explore and the page shows the new
  three. The loop repeats until the user picks one.
- The skill keeps full control of how the tiles look and read: it still writes the page's content.
- The feature is a progressive enhancement over today's text flow, not a replacement.

## Non-goals

- Not a general interactive-prompt framework. It serves one decision shape: pick one of N, or
  regenerate. (N is three today; the mechanism should not hard-code three, but no other shape is in
  scope.)
- Not a hosted or networked service. The server binds to loopback only, for the length of one pick.
- Not a redesign of the tiles, the directions, or how they are generated. The skill's existing
  stage-1 content and `directions.html` layout are unchanged except for how the page is served.
- Not a change to any capability other than Design's Explore step.

## Anti-goals (what makes this a failure even if it runs)

- **It silently breaks a headless or remote run.** A benchmark (`claude -p`), a CI run, a cloud
  routine, or an agent on a remote box where the user's browser cannot reach the server's loopback —
  each must fall back to the text flow, not hang and not fail the task. A run that blocks forever
  waiting for a click that can never come is the worst outcome.
- **It becomes load-bearing.** If `ryux pick` is absent, times out, or errors, the design run must
  still complete through the text path. The loop is a convenience, never a dependency.
- **It takes design control from the skill.** If the CLI starts deciding how the tiles look, per-run
  design freedom is lost.

## Constraints

- **Model-agnostic, host-dependent.** The mechanism does not depend on the LLM. It depends on the
  host being able to (a) run a shell command, (b) wait for a blocking command and return its stdout,
  and (c) let the user's browser reach `127.0.0.1`. These hold for local CLI coding agents on a
  desktop; they do not hold for headless, remote, or sandboxed runs. The design must detect or
  tolerate the latter and fall back.
- **Portability across the installed agents.** RYUX installs into 10+ agents. The skill text that
  invokes `ryux pick` must read the same everywhere and must pair with the existing text fallback so
  an agent that cannot run or wait for the command still finishes.
- **No new runtime dependency in the published package.** The server uses Node's built-in `http`
  (and `open` behaviour RYUX already relies on). No web framework.
- **Repo conventions.** Logic lives in `packages/cli/src`; the skill is generated from there via
  `pnpm sync:skills`; `pnpm typecheck`, `pnpm test`, `pnpm check:sync` gate every change; no version
  bump in the feature PR.
- **Security.** Bind to `127.0.0.1` only, never `0.0.0.0`. The page the server returns is the
  file the skill wrote, plus injected JS that RYUX controls; the server does not execute or echo
  arbitrary request content. The server lives only for one pick and shuts down on resolution or
  timeout.

## The decided shape (how it works)

### Division of labour

- **The skill** writes the directions page exactly as it does now (three tiles, each with palette,
  type, a sample, its signature, numbered). It owns the look and the copy.
- **`ryux pick`** owns the transport only: serve that page from loopback, inject the choice-return
  JavaScript, open the browser, block until a click (or timeout), print the result to stdout, shut
  down.

This mirrors how the repo already splits work: the skill decides, the CLI does the deterministic
mechanics (like `scan`).

### The command

```
npx @ryuxdsgn/design-intelligence pick <path-to-html> [--timeout <seconds>]
```

- Serves `<path-to-html>` from `http://127.0.0.1:<ephemeral-port>`, injecting a small script that
  turns the page's choice controls into POSTs back to the server.
- Opens the URL in the browser. This is **new CLI code** — a small cross-platform launcher using
  `open` / `xdg-open` / `start`, the pattern the skill prose uses today but which does not yet exist
  in `packages/cli/src`. If the launch fails, print the URL to **stderr** and keep serving, so the
  user can open it by hand; the block and timeout still work.
- Blocks until the page POSTs a result, then prints one line to **stdout** and exits 0:
  - a pick: `pick: <n>` (the chosen tile's number). The skill maps the number back to its
    direction; v1 carries no labels (see Calls made below).
  - regenerate: `regenerate` — the user clicked "none of these, make three new".
- On its own timeout or a transport error: prints `fallback: <reason>` to stdout and exits **3**
  (1 and 2 already mean problem and misuse in `scan`), so the agent knows to use the text path.
- **stdout carries the machine result; stderr carries human/diagnostic text** (the CLI's convention).

### The contract the page must meet

For `ryux pick` to wire a page up without the skill and the CLI drifting apart, the injected script
looks for agreed hooks in the HTML the skill writes — a small, documented contract (exact attribute
names are the builder's call, but the shape is fixed):

- each choice control carries its number (e.g. a `data-ryux-pick="2"` attribute);
- an optional regenerate control carries a regenerate marker (e.g. `data-ryux-pick="regenerate"`).

The skill's stage-1 instructions and the `directions.html` it writes are updated to include these
hooks **and a regenerate control** ("None of these — make three new"), which the page does not carry
today. The owner confirmed the regenerate control belongs on the page itself, not only as a text
option. The current instruction "no server, no scripts" becomes "no server, and no scripts of its
own" so it does not fight the injected script. The hooks are inert data attributes in a plain browser
open, so the same file still works in the fallback path.

### The loop, in the skill

Stage 1 (Explore) of `capabilities/design.md` gains this flow:

1. Write the directions page with the choice hooks (as today, plus the attributes).
2. **Try** `ryux pick <file>`: if it prints `pick: <n>`, that is the answer — proceed to build that
   direction. If it prints `regenerate`, explore three new directions, rewrite the page, and run
   `ryux pick` again. Repeat.
3. **Fallback:** open the file the way the skill does today and ask the user to reply with their pick
   in text — the current behaviour, unchanged. The same text question also stands when the user wants
   to answer in words instead of clicking.

### Fallback detection (the mechanical rule)

The agent does not try to predict whether its host will wait on a blocking command. It uses one rule:
**the only success is a clean `pick: <n>` or `regenerate` line on stdout. Anything else means use the
text path** — a `fallback:` line, a non-zero exit, the command killed by the host, no output, or
`pick` not installed. This one check covers every failure mode (not installed, timeout, a host that
refuses to wait and kills the process, a crash) without a capability probe.

Two guards make it safe:
- `ryux pick` has its **own** timeout (default 240s, configurable), set below typical host command
  limits, so in a waiting host the command self-terminates with a clean `fallback: timeout` before
  the host ever kills it; the loopback server shuts down then too, so nothing blocks forever.
- A headless run never reaches an interactive pick: Explore already degrades to "recommend one and
  proceed" when no human can answer (the existing reply-rule behaviour), so `ryux pick` is simply not
  invoked there.

## What is left to the builder

- The injected-script implementation (the result grammar, attribute names, exit code 3, port 0, and
  240s default are settled below).
- The timeout copy shown on the page.
- How the skill text phrases the try/fallback so it reads cleanly and identically across agents, and
  how `check:sync` and the bundle tests cover the new stage-1 flow.
- Build strictly for the one shape (pick one of N, or regenerate). Do **not** generalise `pick` into a
  prompt framework now; a later capability can reuse it if evidence calls for it.

## Testing

- CLI unit tests for `pick`: result parsing (`pick`, `regenerate`, `fallback`), timeout, missing
  file, and that it binds to loopback only.
- A bundle test asserting the skill's stage-1 text carries both the `ryux pick` try and the text
  fallback.
- Manual: one real local run in Claude Code (pick, then regenerate, then pick) and one forced
  fallback (timeout) to confirm the text path still finishes.
- `pnpm typecheck`, `pnpm test`, `pnpm check:sync` green; no version bump.

## Calls made in review (2026-11-12)

Settled by the author after a builder read, listed for the owner to veto:

- **No per-tile labels in v1.** `ryux pick` returns only the number (or `regenerate`); the skill maps
  number → direction from its own message. Removes an indexed-flag parser quirk; simpler.
- **The CLI opens the browser**, as new code (there is none today), and prints the URL to stderr as a
  manual backup if the launch fails. A browser-launch failure does not trigger the text fallback by
  itself — the server keeps waiting.
- **Fallback is detected by one rule**, not a capability probe: a clean `pick:`/`regenerate` line is
  the only success; anything else is the text path. `pick` self-times-out (240s) below host limits.
- **Exit code 3** for fallback (1 and 2 are taken). Attribute hooks `data-ryux-pick="<n>"` and
  `data-ryux-pick="regenerate"`. Ephemeral port (bind 0). One result line, newline-terminated.
- **Narrow build:** pick-one-of-N-or-regenerate only; no generic prompt framework.
