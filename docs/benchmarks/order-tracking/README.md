# Order tracking: no skill vs RYUX 2.22.5

The agent builds a working mobile web prototype from a one-line brief that leaves policies open. Does it invent
them, and does it build the states for when things go wrong?

## Setup
- **Brief:** [`prompt.txt`](prompt.txt). A run that asked first got [`reply.txt`](reply.txt), the same text for
  every run that asked.
- **Arms:** three runs each, run one at a time.
  - **No skill:** an empty folder, with skills and slash commands off.
  - **RYUX 2.22.5:** the skill installed in the folder, plus [`DESIGN.md`](DESIGN.md). The no-skill arm has no
    DESIGN.md, so some visual difference comes from that file.
  - Both arms: Opus 5.5, `claude -p`, no MCP servers.
- **Counted blind** by a fresh AI counter that saw letters only:
  - invented facts: the 11 kinds in [`traps.txt`](traps.txt), shown as real without an assumption or sample label;
  - reachable states;
  - bad-news copy: what happened, why, and what to do next;
  - whether the page runs.
- **Scan:** `ryux scan` (static) on each folder.
- **Pass for RYUX (locked before the runs), all of these:**
  - fewer invented facts;
  - median reachable states at least equal;
  - scan errors not higher;
  - every RYUX run builds.

## Results

| Run | Asked first | Invented facts | Extra states reachable | Cheer in bad news | Scan errors / warnings | Cost |
| --- | --- | --- | --- | --- | --- | --- |
| No skill 1 | no | 9 | late, unavailable, cancelled | yes | 0 / 11 | $1.98 |
| No skill 2 | no | 9 | late, unavailable, cancelled | yes | 0 / 5 | $4.54 |
| No skill 3 | no | 10 | late, unavailable, cancelled | yes | 0 / 11 | $1.57 |
| RYUX 1 | yes | 0 | late, unavailable, offline, loading, error, empty | no | 0 / 1 | $4.36 |
| RYUX 2 | yes | 0 | late, unavailable, offline, loading, error, empty | no | 0 / 1 | $5.30 |
| RYUX 3 | yes | 1 | late, unavailable, offline, loading, error | no | 0 / 0 | $3.54 |

- **No skill presented these as real:**
  - "$5 credit added — sorry for the wait";
  - refund timing ("3–5 business days");
  - automatic substitution when the customer does not answer;
  - delivery and service fees;
  - a $4.99 cancellation fee;
  - courier calls and chat;
  - tips;
  - courier ratings ("★ 4.9");
  - a late-delivery guarantee;
  - a real grocery chain's name.
- **RYUX's one invented fact:** a "Message Sam" courier chat with no label.
- **Where the RYUX runs left a policy open,** they marked it on screen, for example "Prototype rule, not decided"
  and "[fees: not decided]".
- **Late and unavailable copy** scored 3/3 in all six runs.
- **Gaps in both arms:** no run built a failed-delivery state.
- **Result: all four criteria pass.**

Raw output: each run's final messages and scan JSON are in [`runs/`](runs/). One no-skill run hit the usage limit and
was resumed in the same session.
