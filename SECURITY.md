# Security Policy

We appreciate responsible vulnerability reports. Thank you for helping keep
ryux and its users safe.

## Supported versions

| Version | Supported |
| --- | --- |
| `main` (v0.1, pre-release) | ✅ |

During pre-release, only the `main` branch receives security fixes.

## Reporting a vulnerability

**Do not** open a public issue for a security vulnerability.

- Preferred: **GitHub Security Advisories**, the **Security > Report a vulnerability** tab on this repo
  (reports stay private).
- Alternative: email **the Security tab of this repository** with the subject `[ryux security]`.
  (This will switch to `security@ryux.design` once the domain is live.)

Please include, if you can: reproduction steps, impact, version/commit, and a proof of concept.

Target for initial response: **3 business days**. Please give us a reasonable amount of time to fix the issue before
public disclosure (coordinated disclosure).

## Scope

**In scope**
- MCP server (`apps/mcp`) and tool logic (`packages/core`)
- The `ryux-rules` CLI (`packages/cli`)
- The `ryux.design` website and its API (once released)

**Out of scope**
- Attacks that require physical access or an already-compromised account
- Rate limiting or volumetric denial-of-service
- Automated reports with no real impact (for example, scanner output without a PoC)

## Security principles already in place

- **Prompt injection.** OCR text from screenshots always goes into the
  `untrusted_text` field and is treated as data, not as instructions.
- **Secrets.** No secrets in the repo; `.env`, `.env.*`, and `.dev.vars` are in `.gitignore`.
- **Data access (production).** Row Level Security is on for every table from the first migration;
  the website and MCP only read content with `published` status; the service role key is only used to
  write `usage_events` and `credit_ledger`, not to query on a user's behalf.
- **Tokens.** OAuth authentication; tokens can be revoked per connection; no static API keys.
- **Image assets.** Accessed through signed URLs that expire, not permanent public URLs.

## App owner objections (takedown)

To object to content (app screenshots), use the takedown form on the website or the
email above. Reported content is hidden while it's under review.
