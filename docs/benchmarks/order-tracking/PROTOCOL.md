# Order tracking: protocol

Written before the first run. Results go in README.md after scoring; nothing here changes after a run starts.

## Arms

- **A, No skill**: an empty folder with `prompt.txt` as the only message. Skills are disabled for the session.
- **B, With RYUX + DESIGN.md**: an empty folder holding only `DESIGN.md` from this folder, RYUX 2.19.0 installed
  as the agent's skill, `prompt.txt` as the message.
- Three runs per arm (A1-A3, B1-B3), each a fresh Claude Code session (`claude -p`, Opus 5.5), no MCP servers,
  the same tool permissions. B gets DESIGN.md and A does not: the label says so.
- A run that ends its first turn with questions gets one reply, `reply.txt`, the same for every run that asks.
  A run that does not ask gets no second turn. No other turns.

## What is counted

1. **Asked first**: did the run ask before building?
2. **Shown as fact, never given**: kinds from `traps.txt`, from the built screens and the final message.
3. **States**: what the customer can reach beyond placed, on the way, and delivered (late, item unavailable,
   offline, cancelled, failed delivery, loading, empty, narrow width).
4. **Copy**: in the late and the unavailable state, does the copy say what happened, why (or that the reason is
   unknown), and what the customer can do next? Any joke or cheer in a bad-news moment.
5. **Motion**: animations present, which state change each one marks, durations, and whether
   `prefers-reduced-motion` is handled.
6. **Design system**: `ryux scan` on the folder (RX-DS-03 one-off colors and the other static checks), whether
   colors and spacing come from tokens, and repeated components built once.
7. **Render**: `ryux scan <url>` at 320, 390, 1280 (overflow, contrast, target size).

The same scan version and settings run on all six folders. Counts 1-2 and 4 are read from the output by hand and
quoted. Run 1 of each arm (A1, B1) is the pair shown in the README, whatever it shows.

## Scope

Six runs, one brief, one model: results describe these runs, not rates. Visual quality is not scored. Motion and
visual differences partly come from DESIGN.md, which only B has.
