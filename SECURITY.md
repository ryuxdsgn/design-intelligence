# Security Policy

We appreciate responsible vulnerability reports. Thank you for helping keep
RYUX and its users safe.

## Supported versions

| Version | Supported |
| --- | --- |
| Latest 2.x release on npm, and `main` | ✅ |
| Older releases | ❌ |

Fixes ship in a new release; update with `npx @ryuxdsgn/design-intelligence update`. Check your version
with `npx @ryuxdsgn/design-intelligence --version`.

## Reporting a vulnerability

**Do not** open a public issue for a security vulnerability.

- Use **GitHub private vulnerability reporting**: the **Security > Report a vulnerability** tab on
  this repo. Reports stay private between you and the maintainers.

Please include, if you can: reproduction steps, impact, version/commit, and a proof of concept.

Target for initial response: **3 business days**. Please give us a reasonable amount of time to fix the issue before
public disclosure (coordinated disclosure).

## Scope

**In scope**
- The `ryux` CLI (`packages/cli`), including `ryux scan`, and the RYUX skill in `skills/` and `plugins/`
- The ryux MCP server (early access, by key) and the `ryux.design` website and its API; report these
  through the same Security tab

**Out of scope**
- Attacks that require physical access or an already-compromised account
- Rate limiting or volumetric denial-of-service
- Automated reports with no real impact (for example, scanner output without a PoC)
- Problems in the AI agent or host that runs RYUX (Claude Code, Codex, and others): report those to
  their vendor

## Security principles already in place

- **Prompt injection.** OCR text from screenshots always goes into the
  `untrusted_text` field and is treated as data, not as instructions.
- **Untrusted reference content.** Analyze, Critique, Design, and QA read content other people can
  write (web pages, screenshots, Figma and pen.dev files, MCP results). The skill tells the agent to
  use it only as evidence, never to follow instructions in it, never to run code, call tools, touch
  local files, open other URLs, or send data because it asks, and to report any attempt. This lowers
  the risk; it does not enforce anything. Enforcement belongs to the host: when you analyze sites or
  files you do not control, keep your agent's permission prompts on for shell commands, web fetches,
  and file writes, and prefer a sandboxed or throwaway environment.
- **Secrets.** No secrets in the repo; `.env`, `.env.*`, and `.dev.vars` are in `.gitignore`.
- **Data access (production).** Row Level Security is on for every table from the first migration;
  the website and MCP only read content with `published` status; the service role key is only used to
  write `usage_events` and `credit_ledger`, not to query on a user's behalf.
- **MCP keys.** Every MCP client carries a personal key issued by a staff member. Only the key's
  SHA-256 hash is stored; a key can be revoked at any time, and each call is logged per key. A
  missing or revoked key gets 401; more than 60 calls a minute per key gets 429. The MCP checks keys
  without the service role key.
- **Image assets.** Accessed through signed URLs that expire after 15 minutes, not permanent public
  URLs.

## App owner objections (takedown)

To object to content (app screenshots), use the takedown form on the website once it is live, or a
private report through the Security tab until then. Reported content is hidden while it's under
review.
