#!/usr/bin/env python3
"""Machine counts for one billing-dashboard run: measure.py <run_dir> > <run>-measure.json

Runs the repo's own checks, then reads the run's work as the git diff from the fixture commit (B's RYUX
install, DESIGN.md, and build output are left out). Counts only added lines, so the fixture's own code
never counts against a run.
"""
import json, re, subprocess, sys

RUN = sys.argv[1]
SKIP = re.compile(r"^(\.claude/|DESIGN\.md$|dist/|node_modules/|.*\.tsbuildinfo$|package-lock\.json$)")
SHARED = ["Badge", "Banner", "Button", "Card", "EmptyState", "Skeleton", "Table"]


def sh(*cmd):
    p = subprocess.run(cmd, cwd=RUN, capture_output=True, text=True)
    return p.returncode, p.stdout + p.stderr


def check(script):
    code, out = sh("npm", "run", "-s", script)
    return {"pass": code == 0, "tail": out.strip().splitlines()[-3:]}


base = sh("git", "rev-list", "--max-parents=0", "HEAD")[1].split()[0]
sh("git", "add", "-A", "-N")  # count untracked files in the diff
status = [l.split("\t") for l in sh("git", "diff", "--name-status", base)[1].splitlines() if "\t" in l]
files = [(s, f) for s, f in status if not SKIP.match(f)]
added_files = [f for s, f in files if s == "A"]

lines = {}  # file -> added lines
for _, f in files:
    diff = sh("git", "diff", "-U0", base, "--", f)[1]
    lines[f] = [l[1:] for l in diff.splitlines() if l.startswith("+") and not l.startswith("+++")]

code_files = {f: ls for f, ls in lines.items() if re.search(r"\.(tsx?|css)$", f) and f != "src/styles/tokens.css"}
literal = {
    "color": re.compile(r"#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\("),
    "font-size": re.compile(r"font-?[sS]ize\s*[:=]\s*['\"]?\d"),
    "spacing": re.compile(r"\b(padding|margin|gap)[A-Za-z]*\s*[:=]\s*['\"]?[^;'\"]*\d+(px|rem)"),
}
literals = {k: sum(len(rx.findall(l)) for ls in code_files.values() for l in ls) for k, rx in literal.items()}
token_uses = sum(l.count("var(--") for ls in code_files.values() for l in ls)

new_components = [f for f in added_files if f.startswith("src/components/") and f.endswith(".tsx") and ".test." not in f]
imported = sorted({n for ls in code_files.values() for l in ls if "components" in l and "import" in l
                   for n in SHARED if re.search(rf"\b{n}\b", l)})
tests_added = [f for f in added_files if re.search(r"\.test\.tsx?$", f)]
test_cases = sum(len(re.findall(r"^\s*(test|it)\(", l)) for f in tests_added for l in lines[f])

print(json.dumps({
    "typecheck": check("typecheck"),
    "test": check("test"),
    "build": check("build"),
    "files_added": added_files,
    "files_changed": [f for s, f in files if s != "A"],
    "new_component_files": new_components,
    "shared_components_imported": imported,
    "literals_in_added_code": literals,
    "token_uses_in_added_code": token_uses,
    "tokens_added": sum(1 for l in lines.get("src/styles/tokens.css", []) if l.strip().startswith("--")),
    "test_files_added": tests_added,
    "test_cases_added": test_cases,
}, indent=1))
