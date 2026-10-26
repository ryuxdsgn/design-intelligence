# Wallet transaction detail: protocol

Flagship A, "Think before designing". Written before the first run. Results go in README.md after scoring;
nothing here changes after a run starts.

## Question

Does the agent understand the problem before it builds: does it ask what changes the build, keep facts apart from
assumptions, avoid inventing fees, refunds, and promises, and cover the states a money screen needs?

## Arms

- **A, No skill**: an empty folder, [`prompt.txt`](prompt.txt) as the only message, every skill and command off.
- **B, RYUX 2.19.2 + DESIGN.md**: an empty folder holding [`DESIGN.md`](DESIGN.md) and RYUX 2.19.2 installed for
  Claude Code, the same message.
- Three runs per arm (A1-A3, B1-B3), one at a time, each a fresh `claude -p` session with Opus 5.5, auto
  permission mode, no MCP servers, synced plugins off, global skills moved aside
  (`packages/cli/scripts/bench/run.sh`). B has DESIGN.md and A does not; the label says so.
- A run that ends its first turn with questions gets one reply, [`reply.txt`](reply.txt), the same for every run
  that asks (`turn2.sh`). A run that does not ask gets no second turn. No other turns.
- Before the first run, one probe per arm confirms with `run-summary.py` that only B lists `ryux` and that no MCP
  server is listed.

## What is counted

Machine and hand counts, read from each run's screens, HTML, and final message, and quoted:

1. **Asked first**: did the run ask before building, and how many questions? Which of them change what gets built
   (policy, market, data) and which do not?
2. **Shown as fact, never given**: kinds from [`traps.txt`](traps.txt), one count per kind per run.
3. **Assumptions stated**: does the final message or the screen list the decisions the run made up?
4. **States reachable** in the prototype for each of payment, transfer, and top-up: completed, pending, failed,
   and refunded or reversed; plus loading, load error, offline, and a 320-wide layout.
5. **Copy in the failed and pending states**: does it say what happened, what it means for the money, and what to
   do next? Any cheer or joke when something failed.
6. **Scans**: `ryux scan` 2.19.2 on the folder and on the rendered page at 320, 390, and 1280.
7. **Cost**: turns, minutes, and USD per run, from `run-summary.py`.

Human scores come later, blind, from at least three designers who do not know the arms: UX correctness and
Context understanding, 1-5 each, on run 1 to 3 of each arm shown in a shuffled order. Until then the README marks
them "not rated yet". Scores are never summed with the counts.

## What is shown

Run 1 of each arm (A1, B1) is the pair in the README and the GIF, whatever it shows. All six runs are published.

## Scope

Six runs, one brief, one model: results describe these runs, not rates. Visual quality is not scored here.
