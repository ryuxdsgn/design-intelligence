<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-source--available-2ea44f" alt="Source-Available"></a>
  <img src="https://img.shields.io/badge/status-early__access%20v0.1-1f6feb" alt="Status: early access v0.1">
  <img src="https://img.shields.io/badge/MCP%20tools-9-8957e5" alt="9 MCP tools">
  <img src="https://img.shields.io/badge/rules-RX--C%20%2F%20RX--H%20%2F%20RX--L-e36209" alt="ryux-rules">
</p>

# ryux

> **Referensi UI dari aplikasi Indonesia yang terbukti berhasil** — disajikan lewat website dan
> MCP server untuk agent AI, dengan gate anti slop bawaan (**ryux-rules**). Berbasis bukti:
> setiap keputusan desain merujuk screen nyata, bukan pola generik.

> **Baru di sini?** Mulai dari [GUIDE.md](./GUIDE.md) — panduan dari nol: pasang aturan ke agent-mu
> lalu sambungkan ke data referensi.

## Apa yang membedakan

- **Berbasis bukti.** Setiap hasil membawa `screen_id`, nama app, versi, dan tanggal capture. Keputusan desain wajib merujuk screen nyata — ditegakkan `delivery_gate`.
- **Lokal Indonesia dulu.** QRIS, virtual account, OTP WhatsApp, paylater, e-KYC, format Rupiah — pola yang tidak ada di library global.
- **Penilaian manusia.** Catatan desainer (kenapa berhasil, apa kelemahannya) ditulis orang, bukan digenerate AI. Ini pembeda utama ryux.
- **Aturan milik sendiri.** `ryux-rules` (RX-C / RX-H / RX-L) — karya orisinal, lisensi source-available, tanpa dependency pihak ketiga.

## Apa isinya

- **9 tool MCP** dalam tiga kelompok: riset (`search_screens`, `get_flow`, `get_local_pattern`, `compare_apps`, `extract_design_direction`), audit (`audit_ui`, `audit_copy`, `heuristic_eval`, `delivery_gate`), dan jembatan desain.
- **ryux-rules** — 33 aturan RX dalam tiga lapisan: filter anti slop (RX-C), heuristik usability & aksesibilitas (RX-H), pola & copy Indonesia (RX-L). Plus Delivery Gate PASS/FAIL sebelum rilis.
- **CLI `ryux-rules`** — pasang aturan ke Claude Code, Cursor, atau AGENTS.md dengan satu perintah.

## Lihat bedanya

ryux-rules bekerja seperti filter: mengubah keputusan dan copy yang "berbau AI" menjadi yang
berbukti dan wajar. Contoh nyata (berbasis teks, bukan mockup):

**Copy**

| Sebelum | Sesudah | Aturan |
| --- | --- | --- |
| `Rp 1250000` | `Rp1.250.000` | RX-L-06 |
| "Terjadi kesalahan." | "Pembayaran gagal. Cek koneksi lalu coba lagi." | RX-H-09 |
| "BAYAR SEKARANG" | "Bayar sekarang" | RX-C-06 |
| "Pelajari selengkapnya" | "Lihat contoh checkout QRIS" | RX-C-06 |

**Keputusan desain**

| Sebelum | Sesudah |
| --- | --- |
| "Taruh QRIS paling atas karena bagus." | "Taruh QRIS paling atas — pola yang dipakai app F&B Indonesia untuk nominal kecil (`scr_demo_001`)." |

Aturan `RX-C-01` menolak keputusan tanpa bukti `screen_id`; `delivery_gate` menegakkannya.

**UI** (dicek `audit_ui` / `heuristic_eval`)

| Sebelum | Sesudah | Aturan |
| --- | --- | --- |
| Tombol 32px | Tombol ≥ 44px | RX-H-12 |
| Kontras teks 3:1 | Kontras ≥ 4.5:1 | RX-H-11 |
| Hanya layar sukses | + loading / kosong / error | RX-H-14 |

> Perbandingan **gambar** (screenshot before/after) menyusul saat data screen asli sudah ada.
> ryux tidak memakai mockup palsu — itu melanggar aturannya sendiri (RX-C-05).

## Isi repo (monorepo pnpm)

```
apps/mcp/         MCP server (Cloudflare Workers) — 9 tool
packages/core/    @ryux/core — data + logika tool, bebas platform
packages/cli/     ryux-rules — CLI pasang aturan ke agent AI
docs/             prd.md, taxonomy.md, design-rules.md
```

Roadmap PRD (belum dibuat): `apps/web` (website Next.js) dan `packages/pipeline` (capture video → data).

## Mulai cepat

Prasyarat: Node 20+, pnpm.

```bash
pnpm install
pnpm dev:mcp        # MCP server di http://localhost:8787/mcp
pnpm typecheck
```

Endpoint MCP memakai transport **Streamable HTTP** — sambungkan lewat MCP client (Claude Code,
MCP Inspector), bukan browser biasa.

### Pasang ryux-rules ke agent-mu

```bash
npx ryux-rules            # wizard: pilih agent + lapisan aturan
```

Detail: [`packages/cli`](./packages/cli). Sumber aturan: [`docs/design-rules.md`](./docs/design-rules.md).

## Dokumentasi

| Dokumen | Isi |
| --- | --- |
| [`docs/prd.md`](./docs/prd.md) | PRD sistem & MCP: arsitektur, model data, auth, rilis |
| [`docs/taxonomy.md`](./docs/taxonomy.md) | Kosakata terkontrol: kategori, flow, pola, komponen |
| [`docs/design-rules.md`](./docs/design-rules.md) | Aturan desain ryux (RX-C / RX-H / RX-L) |
| [`apps/mcp/README.md`](./apps/mcp/README.md) | Menjalankan & mencoba MCP server |

## Status

**v0.1 (early access, gratis).** Data masih contoh, belum ada login, kuota di memori. Menuju
produksi: Supabase (data `published`, RLS aktif), OAuth, kuota berbasis ledger, pencarian
full-text + pgvector.

## Keamanan

Lihat [`SECURITY.md`](./SECURITY.md) untuk cara melaporkan kerentanan. Prinsip yang sudah dipegang:
teks OCR diperlakukan sebagai data (bukan instruksi), RLS aktif sejak migrasi pertama, dan tidak
ada secret di repo.

## Lisensi

**Source-available**, © 2026 ryux.design (lihat [`LICENSE`](./LICENSE)). Bebas dipakai dan
dimodifikasi untuk keperluanmu, tetapi **tidak boleh dijual ulang atau dirilis ulang sebagai
produk lain**. Bukan turunan, dan tidak berafiliasi dengan proyek pihak ketiga mana pun.
