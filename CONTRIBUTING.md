# Contributing to RYUX

Thanks for helping. The most useful contributions are reports from real use: a rule that fired
where it should not, a rule that stayed quiet where it should have caught something, or an agent
that invented a fact while RYUX was loaded. Code and docs pull requests are welcome too.

## Ways to help

- **Rule feedback.** A rule misfires, misses, or gives advice that does not fit the context. Open a
  [rule feedback issue](https://github.com/ryuxdsgn/design-intelligence/issues/new?template=rule_feedback.yml)
  with the rule ID and what you saw.
- **Bugs** in the CLI, `ryux scan`, or the install. Open a
  [bug report](https://github.com/ryuxdsgn/design-intelligence/issues/new?template=bug_report.yml).
- **Blind ratings.** Designers who want to rate the next blind benchmark round: open a blank issue
  and say so.
- **Pull requests** for fixes, tests, and docs. For a new rule or a change to how a step works, open
  an issue first so we can agree on the evidence before you write it.

Security problems never go in a public issue: see [SECURITY.md](./SECURITY.md). Everyone taking
part follows the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Set up

You need Node 22 and pnpm.

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm check:sync
```

CI runs the same four steps on every pull request.

## Where things live

```
packages/cli/src/   the source: CLI, scan, and every rule and skill file
skills/ryux/        generated from packages/cli/src, do not edit by hand
plugins/ryux/       generated plugin copy, do not edit by hand
docs/               design rules, showcase, benchmarks
```

After changing anything in `packages/cli/src`, run `pnpm sync:skills` and commit the generated
files with your change. `pnpm check:sync` fails when they are out of date.

## Writing or changing a rule

Rules live in the knowledge modules (`RX-PR`, `RX-UX`, `RX-IX`, and so on; the full list is in
[docs/design-rules.md](./docs/design-rules.md)). Each rule has the same parts: a level (Required,
Preferred, Contextual), **Do**, **Do not**, **Why**, **Not when**, **Trade-off**, and **Check**.

- **Write it yourself.** RYUX rules are original text. Cite standards and research by name (WCAG,
  a heuristic, a study), but do not paste or closely paraphrase text from other rulesets, style
  guides, or design systems.
- **Show the evidence.** The **Why** line says where the rule comes from: a standard, research, or a
  run or review where an agent got it wrong. A rule with no source does not go in.
- **Sharpen before adding.** Most findings belong inside an existing rule as a clearer **Do** or a
  new case. A new rule ID is rare and needs a reason the existing rules cannot cover it.
- **Say when it does not apply.** A rule without a **Not when** fires everywhere and gets ignored.
- **Keep examples neutral.** Use generic products (checkout, settings, a dashboard) and English
  copy, except in rules about copy in a specific language.

## Benchmarks

Benchmark runs in [docs/benchmarks](./docs/benchmarks) follow a few rules:

- The protocol (brief, replies, what is counted) is committed **before** the first run.
- Raw outputs are kept as the agent wrote them; any edit is listed in the run folder.
- Report what RYUX missed as plainly as what it got right, and scope each claim to the number of
  runs ("in 2 of 3 runs", never "RYUX always").
- Screenshots, GIFs, and videos do not go in git. Upload them to the
  [`media` release](https://github.com/ryuxdsgn/design-intelligence/releases/tag/media) and link the
  asset: `docs/benchmarks/x/y.png` becomes `benchmarks--x--y.png`.

## Commits and pull requests

- Commit messages use `type(scope): summary`, for example `fix(scan): ...`, `feat(rules): ...`,
  `docs(benchmarks): ...`.
- One change per pull request, with the reason in the description.
- Releases, versions, and npm publishing are done by the maintainer; do not bump versions in a pull
  request.

## License

RYUX is MIT licensed. By contributing, you agree that your contribution is released under the same
[license](./LICENSE).
