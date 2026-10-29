# Billing page in an existing repo: protocol

Flagship C, "Design that survives delivery". Written before the first run. Results go in README.md after scoring;
nothing here changes after a run starts.

## Question

Given a real repo with tokens, components, and tests, does the agent build a new page that fits it: reuses what
exists, adds no one-off values or near-duplicate components, keeps typecheck, tests, and build passing, covers the
states the data can be in, and invents no billing policy?

## Arms

- **Fixture:** [`fixture/`](fixture/), a small admin app (React 18, TypeScript, Vite, Vitest) with design tokens,
  seven shared components, a Members page that shows its loading and error pattern, a fake API with
  `?scenario=` cases, tests, and a layout wireframe ([`fixture/docs/billing-wireframe.png`](https://github.com/ryuxdsgn/design-intelligence/releases/download/media/benchmarks--billing-dashboard--fixture--docs--billing-wireframe.png)).
- **A, No skill:** a copy of the fixture, [`prompt.txt`](prompt.txt) as the only message, every skill and command
  off.
- **B, RYUX 2.19.3 + DESIGN.md:** the same copy plus [`DESIGN.md`](DESIGN.md) and RYUX 2.19.3 installed for
  Claude Code, the same message. B has DESIGN.md and A does not; the label says so.
- Three runs per arm (A1-A3, B1-B3), one at a time, each a fresh `claude -p` session with Opus 5.5, auto
  permission mode, no MCP servers, synced plugins off, global skills moved aside
  (`BENCH_FIXTURE=fixture packages/cli/scripts/bench/run.sh`). Each copy has its dependencies installed and one
  commit, so a run's work is its `git diff` from that commit.
- A run that ends its first turn with questions gets one reply, [`reply.txt`](reply.txt), the same for every run
  that asks (`turn2.sh`). No other turns.
- Before the first run, one probe per arm confirms with `run-summary.py` that only B lists `ryux` and that no MCP
  server is listed.

## What is counted

Machine counts from [`measure.py`](measure.py) (added lines only, RYUX files and DESIGN.md left out), the rest by
hand from the diff, the screens, and the final message, and quoted:

1. **Checks:** `npm run typecheck`, `npm test`, and `npm run build` pass or fail, run after the session ends.
   Any check silenced to pass (a type cast to `any`, a disabled rule, a skipped test) is listed.
2. **Reuse:** which shared components the new code imports; new component files; and, by hand, any new component
   or markup that duplicates a shared one (a second card, button, badge, table, banner, or skeleton).
3. **One-off values:** color, font-size, and spacing literals in added code outside `tokens.css`; tokens added
   to `tokens.css` are counted apart (the repo's README allows adding one).
4. **Tests:** test files and cases added for the new page or its logic.
5. **States reachable** with the fixture's scenarios: `slow` (loading), `error` (load error and a way to retry),
   `payment-failed`, `over-limit`, and `empty` (no invoices and no payment method), plus the default.
6. **Shown as fact, never given:** kinds from [`traps.txt`](traps.txt), one count per kind per run.
7. **Asked first:** did the run ask before building, and how many questions?
8. **Rendered:** `ryux scan` 2.19.3 on `src` and on the built page at 320, 390, and 1280 wide; console errors
   on load in each scenario.
9. **Cost:** turns, minutes, and USD per run, from `run-summary.py`.

Visual quality comes later, blind, from at least three designers who do not know the arms, 1-5, on run 1 to 3
of each arm in a shuffled order. Until then the README marks it "not rated yet". Scores are never summed with
the counts.

## What is shown

Run 1 of each arm (A1, B1) is the pair in the README and the GIF, whatever it shows. All six runs are published as
diffs, screens, final messages, and measurements.

## Scope

Six runs, one repo, one brief, one model: results describe these runs, not rates. One turn plus at most the
fixed reply; no review round.
