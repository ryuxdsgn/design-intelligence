#!/usr/bin/env python3
"""Score a routing eval: routing-score.py <out_dir>. Reads cases.json beside this script and <out_dir>/<id>/turn1.jsonl.

Per case: did the skill activate; which capability and knowledge files did the agent open (Read, or a path in a
Bash or Grep call); did it read every must-read module and none of the must-not files; and, when the reply carries
a Delivery Gate, does its "modules read" list name only modules that were opened. Writes score.md and score.json."""
import json, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = Path(sys.argv[1])
CASES = json.loads((HERE / "cases.json").read_text())["cases"]
PATH = re.compile(r"\.claude/skills/ryux/((?:knowledge|capabilities)/[a-z-]+\.md|SKILL\.md|report\.md)")
CAPABILITY = {"analyze": "analyze", "analyze-research": "analyze", "design": "design", "design-deliver": "design",
              "design-md": "design", "build": "build", "critique": "critique", "qa": "qa"}
MODULES = {p.stem for p in (HERE.parents[4] / "skills/ryux/knowledge").glob("*.md")}

TOKEN = re.compile(r"(?:knowledge|capabilities)/[a-z-]+\.md|SKILL\.md|report\.md")
READERS = {"cat", "sed", "head", "tail", "less", "more", "awk", "bat", "nl"}
# grep shows only the matching lines (often just the rule headings): the module was skimmed, not read.
SKIMMERS = {"grep", "rg", "egrep"}

def opened(events, skim=False):
    """Skill files whose content the agent took in: the Read tool, a Grep on a skill path, or a Bash segment that
    prints a file (cat, sed, grep, ...). ls and wc only list or count, so they are not reads. The Bash tool keeps its
    working directory between calls, so the last cd is tracked across calls; inside the installed skill, a relative
    path or a bare file name ("content.md" after cd knowledge) is resolved against it."""
    files = []
    sub = None  # None: outside the skill; "": the skill root; "knowledge" or "capabilities": that folder
    def add(text):
        for m in PATH.finditer(text):
            files.append(m.group(1))
        if sub is not None:
            files.extend(TOKEN.findall(text))
            if sub:
                files.extend(f"{sub}/{t}" for t in re.findall(r"(?<![/\w-])([a-z-]+\.md)\b", text))
    for d in events:
        if d.get("type") != "assistant":
            continue
        for c in d["message"].get("content", []):
            if c.get("type") != "tool_use":
                continue
            name, inp = c.get("name"), c.get("input", {})
            if name == "Read" and not skim:
                for m in PATH.finditer(inp.get("file_path", "")):
                    files.append(m.group(1))
            elif name == "Grep" and skim:
                for m in PATH.finditer(inp.get("path", "")):
                    files.append(m.group(1))
                for m in re.finditer(r"\.claude/skills/ryux/((?:knowledge|capabilities))/?$", inp.get("path", "")):
                    files.append(f"{m.group(1)}/{inp.get('glob', '*.md')}")
            elif name == "Bash":
                for seg in re.split(r"&&|\|\||;|\n|\s\|\s", inp.get("command", "")):  # a pipe needs spaces: grep "a\|b" is one pattern
                    words = seg.strip().split()
                    if not words:
                        continue
                    if words[0] == "cd":
                        target = words[1] if len(words) > 1 else ""
                        m = re.search(r"\.claude/skills/ryux(?:/(knowledge|capabilities))?/?$", target)
                        if m:
                            sub = m.group(1) or ""
                        elif target in ("knowledge", "capabilities") and sub == "":
                            sub = target
                        elif target == ".." and sub:
                            sub = ""
                        else:
                            sub = None
                    elif words[0] in (SKIMMERS if skim else READERS):
                        add(seg)
    return [f for f in dict.fromkeys(files) if "*" not in f]

def gate_list(text, label):
    """Module names after a gate label ("modules read", "required not read"), up to the next field."""
    m = re.search(label + r"[:\s]+(.*?)(?:[;,]\s*required not read|·|\n|$)", text, re.I)
    if not m:
        return None
    names = re.findall(r"[a-z]+(?:-[a-z]+)*", m.group(1).lower())
    return sorted({n for n in names if n in MODULES or n == "qa"})

def gate_claims(text):
    return gate_list(text, "modules read")

rows = []
for case in CASES:
    turns = [p for p in (OUT / case["id"] / "turn1.jsonl", OUT / case["id"] / "turn2.jsonl") if p.exists()]
    if not turns:
        rows.append({"id": case["id"], "ran": False})
        continue
    events, raw = [], ""
    for f in turns:
        raw += f.read_text()
        for line in f.read_text().splitlines():
            try:
                events.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    results = [d for d in events if d.get("type") == "result"]
    result = results[-1] if results else {}
    files = opened(events)
    skimmed = [p[10:-3] for p in opened(events, skim=True) if p.startswith("knowledge/") and p not in files]
    caps = [CAPABILITY[p[13:-3]] for p in files if p.startswith("capabilities/") and p[13:-3] in CAPABILITY]
    mods = [p[10:-3] for p in files if p.startswith("knowledge/")]
    if "capabilities/qa.md" in files:
        mods.append("qa")
    want = case["capability"]
    final = result.get("result") or ""
    claims = gate_claims(final)
    rows.append({
        "id": case["id"], "ran": True,
        "activated": "Base directory for this skill:" in raw and "/ryux" in raw,
        "capability_ok": "any" in want or any(c in want for c in caps),
        "capabilities": list(dict.fromkeys(caps)),
        "must_read": [m for m in case["must_read"] if m in mods], "must_total": len(case["must_read"]),
        "missed": [m for m in case["must_read"] if m not in mods],
        "forbidden": [p for p in case["must_not_read"] if p in files],
        "modules": list(dict.fromkeys(mods)), "skimmed_only": skimmed,
        "gate": claims is not None, "declared_not_read": gate_list(final, "required not read") or [], "false_claims": [m for m in (claims or []) if m not in mods and m != "qa"],
        "full": bool(case.get("full")), "stop": result.get("subtype"),
        "turns": len(turns), "cost": round(sum(r.get("total_cost_usd", 0) for r in results), 2),
        "minutes": round(sum(r.get("duration_ms", 0) for r in results) / 60000, 1),
    })

ran = [r for r in rows if r["ran"]]
yes = lambda b: "yes" if b else "**no**"
lines = ["| Case | Activated | Capability | Must read | Missed | Must-not read | Skimmed only | Gate | False gate claims | Declared not read | Cost | Min |",
         "|---|---|---|---|---|---|---|---|---|---|---|---|"]
for r in rows:
    if not r["ran"]:
        lines.append(f"| {r['id']} | not run | | | | | | | | | | |")
        continue
    gate = ("yes" if r["gate"] else ("**missing**" if r["full"] else "capped")) if r["full"] or r["gate"] else "capped"
    lines.append(f"| {r['id']} | {yes(r['activated'])} | {yes(r['capability_ok'])} ({', '.join(r['capabilities']) or 'none'}) | "
                 f"{len(r['must_read'])}/{r['must_total']} | {', '.join(r['missed']) or '—'} | {', '.join(r['forbidden']) or '—'} | "
                 f"{', '.join(r['skimmed_only']) or '—'} | {gate} | {', '.join(r['false_claims']) or ('0' if r['gate'] else '—')} | {', '.join(r['declared_not_read']) or '—'} | ${r['cost']} | {r['minutes']} |")
total = lambda k: sum(1 for r in ran if r[k])
must = sum(len(r["must_read"]) for r in ran), sum(r["must_total"] for r in ran)
summary = (f"Activated {total('activated')}/{len(ran)} · capability {total('capability_ok')}/{len(ran)} · must-read {must[0]}/{must[1]} · "
           f"must-not reads {sum(len(r['forbidden']) for r in ran)} · false gate claims {sum(len(r['false_claims']) for r in ran)} · "
           f"cost ${round(sum(r['cost'] for r in ran), 2)}")
(OUT / "score.md").write_text(summary + "\n\n" + "\n".join(lines) + "\n")
(OUT / "score.json").write_text(json.dumps({"summary": summary, "cases": rows}, indent=1))
print(summary); print(); print("\n".join(lines))
