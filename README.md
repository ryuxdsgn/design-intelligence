# ryux

**Library referensi UI dan flow dari aplikasi Indonesia** — disajikan lewat website dan MCP
server untuk agent AI, dengan gate anti slop bawaan (**ryux-rules**).

> Referensi UI dari aplikasi Indonesia yang terbukti berhasil, plus aturan mutu agar agent
> tidak menghasilkan UI generik. Rilis pertama gratis (`early_access`); struktur akun, kuota,
> dan billing sudah disiapkan untuk paket berbayar.

Lisensi: **source-available** (lihat [`LICENSE`](./LICENSE)) · Keamanan: [`SECURITY.md`](./SECURITY.md)

## Apa yang membedakan

- **Berbasis bukti.** Setiap keputusan desain merujuk `screen_id` nyata dari aplikasi Indonesia.
- **Lokal Indonesia dulu.** QRIS, virtual account, OTP WhatsApp, paylater, e-KYC, format Rupiah.
- **Penilaian manusia.** Catatan desainer ditulis orang, bukan digenerate AI.

## Isi repo (monorepo pnpm)

```
apps/mcp/         MCP server (Cloudflare Workers) — 9 tool
packages/core/    @ryux/core — data + logika tool, bebas platform
packages/cli/     ryux-rules — CLI pasang aturan ke Claude Code / Cursor / AGENTS.md
docs/             PRD, taksonomi, aturan desain (design-rules.md)
```

Belum dibuat (roadmap PRD): `apps/web` (website Next.js), `packages/pipeline` (capture video → data).

## Mulai cepat

Prasyarat: Node 20+, pnpm.

```bash
pnpm install
pnpm dev:mcp        # MCP server di http://localhost:8787/mcp
pnpm typecheck
```

Endpoint MCP memakai transport Streamable HTTP — sambungkan lewat MCP client (Claude Code,
MCP Inspector), bukan browser biasa.

### Aturan desain ryux (ryux-rules)

Pasang aturan RX-C / RX-H / RX-L ke agent AI-mu:

```bash
npx ryux-rules            # wizard: pilih agent + lapisan
```

Sumber aturan: [`docs/design-rules.md`](./docs/design-rules.md). CLI: [`packages/cli`](./packages/cli).

## Sembilan tool MCP

`search_screens`, `get_flow`, `get_local_pattern`, `compare_apps`, `extract_design_direction`,
`audit_ui`, `audit_copy`, `heuristic_eval`, `delivery_gate`.

Detail: [`apps/mcp/README.md`](./apps/mcp/README.md) dan [`docs/prd.md`](./docs/prd.md).

## Dokumentasi

| Dokumen | Isi |
| --- | --- |
| [`docs/prd.md`](./docs/prd.md) | PRD sistem & MCP: arsitektur, model data, auth, rilis |
| [`docs/taxonomy.md`](./docs/taxonomy.md) | Kosakata terkontrol: kategori, flow, pola, komponen |
| [`docs/design-rules.md`](./docs/design-rules.md) | Aturan desain ryux (RX-C / RX-H / RX-L) |

## Status

v0.1 — data masih contoh, belum ada login, kuota di memori. Menuju produksi: Supabase
(data `published`, RLS), OAuth, kuota berbasis ledger, pencarian full-text + pgvector.

## Lisensi

Source-available, © 2026 ryux.design. Bebas dipakai dan dimodifikasi untuk keperluanmu, tetapi
tidak boleh dijual ulang atau dirilis ulang sebagai produk lain. Lihat [`LICENSE`](./LICENSE).
