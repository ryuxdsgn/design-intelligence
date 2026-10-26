# Wallet transaction detail, expressive direction: protocol

A follow-up to [wallet-detail](../wallet-detail/). Written before the first run. Results go in README.md after
scoring; nothing here changes after a run starts.

## Question

When DESIGN.md asks for a strong visual character and motion that explains what happens to the money, does the
RYUX side deliver that direction, and does it keep what wallet-detail measured: asking first, inventing no money
rule, and covering the states a money screen needs?

## Arms

- **B, RYUX 2.19.3 + this [`DESIGN.md`](DESIGN.md):** three new runs (B1-B3), each in an empty folder holding
  this DESIGN.md and RYUX 2.19.3 installed for Claude Code, with wallet-detail's
  [`prompt.txt`](../wallet-detail/prompt.txt) as the message. The only differences from wallet-detail's B arm
  are this DESIGN.md and the RYUX version (2.19.2 then).
- **A, No skill:** not rerun. The comparison uses wallet-detail's A1-A3: same prompt, same model (Opus 5.5),
  Claude Code 2.1.310 then and 2.1.311 now. A never had a DESIGN.md, so any visual difference is RYUX and
  DESIGN.md together, and the label says so.
- Same harness as wallet-detail: `claude -p`, auto permission mode, no MCP servers, synced plugins off, global
  skills moved aside, one run at a time. A run that ends its first turn with questions gets wallet-detail's
  [`reply.txt`](../wallet-detail/reply.txt) once; no other turns.

## What is counted

Everything wallet-detail's PROTOCOL.md counts, the same way ([`traps.txt`](../wallet-detail/traps.txt), states,
copy in failed and pending states, `ryux scan` 2.19.3, cost), plus:

1. **Motion built:** for each event DESIGN.md names (row press, detail push, amount settle, status change, banner
   or sheet in, success moment), whether the prototype animates it, read from a screen recording and the code.
2. **Motion discipline:** animations that loop outside loading; `prefers-reduced-motion` handled.
3. **Direction followed:** a display face for amounts, one accent reserved for money moving, depth on cards:
   present or not, from the code and the screens.

Visual quality comes later, blind, from at least three designers, 1-5, on all six runs (wallet-detail A1-A3
and these B1-B3) in a shuffled order. Until then the README marks it "not rated yet".

## What is shown

B1 here and wallet-detail's A1 are the pair in the README and the video, whatever they show. The video plays each
prototype's own screens, recorded in a browser with the same tap script on both sides; the finger, captions, and
rings are drawn over the recording, the same way on both sides. All three runs are published.

## Scope

Three new runs against three earlier ones, one brief, one model: results describe these runs, not rates.
