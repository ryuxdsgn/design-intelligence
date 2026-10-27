# Wallet, expressive direction, round 2: protocol

Written before the first run of this round. Results go in this folder's README.md after scoring; nothing here
changes after a run starts.

## Why a second round

Round 1's [`DESIGN.md`](../DESIGN.md) described the visual character in words. The B runs built that direction,
but the screens stayed close to a generic list. This round asks: when DESIGN.md gives a full visual language
(colour roles with values, typefaces, shape and depth, a signature, and motion specs with durations), does the
RYUX side follow it, and does it keep asking first, inventing no money rule, and covering the states?

## Arms

- **B, RYUX 2.19.3 + this round's [`DESIGN.md`](DESIGN.md):** three new runs (B1-B3), each in an empty folder
  holding this DESIGN.md and RYUX 2.19.3 installed for Claude Code, with wallet-detail's
  [`prompt.txt`](../../wallet-detail/prompt.txt) as the message. The only difference from round 1 is the DESIGN.md.
- **A, No skill:** not rerun; wallet-detail's A1-A3, as in round 1. A never had a DESIGN.md, so any visual
  difference is RYUX and DESIGN.md together, and the label says so.
- Same harness: Opus 5.5, `claude -p`, auto permission mode, no MCP servers, synced plugins off, global skills
  moved aside, one run at a time. A run that ends its first turn with questions gets wallet-detail's
  [`reply.txt`](../../wallet-detail/reply.txt) once; no other turns.

## What is counted

Everything round 1 counts, the same way, plus:

1. **Spec followed:** for each colour role, typeface, the perforated receipt sheet, the money path, and each
   motion spec, whether the prototype uses it as written, differently (with or without a stated reason), or not
   at all, read from the code and the screens.
2. **Added values:** colour literals outside the given roles, counted from the code.

Round 1's runs stay published as they are. Visual quality comes later, blind, from at least three designers.

## What is shown

This round's B1 and wallet-detail's A1 become the pair in the root README video, whatever they show, recorded
with the same tap script as round 1. All three runs are published. If B1 fails to build a working prototype,
the video keeps round 1's B1 and the README says why.

## Scope

Three new runs against three earlier ones, one brief, one model: results describe these runs, not rates.
