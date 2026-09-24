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
berbukti dan wajar. Contoh nyata:

**UI — layar pembayaran** (dibuat di pen.dev; brief sama, `after` memakai ryux-rules + data ryux)

| Sebelum — tanpa ryux | Sesudah — ryux-rules |
|:--|:--|
| <a href="assets/compare/ui/ui-before.png"><img src="assets/compare/ui/ui-before.png" alt="Layar bayar generik: logo sparkle, badge 256-BIT, angka pengguna karangan, metode global (Card/PayPal/Apple/Google), harga dolar, teks kontras rendah" width="100%"></a> | <a href="assets/compare/ui/ui-after.png"><img src="assets/compare/ui/ui-after.png" alt="Layar checkout ryux premium: ringkasan pesanan, rincian biaya transparan (subtotal, ongkir, total Rp1.250.000), QRIS dengan ekspektasi verifikasi kurang dari 5 detik, tombol Bayar Rp1.250.000, catatan kepercayaan, bukti scr_a3f091" width="100%"></a> |
| Pola global, angka karangan, dolar, kontras tipis. | Ringkasan pesanan + biaya transparan (RX-N-06/07), QRIS + ekspektasi waktu (RX-N-01), Rupiah, bukti `screen_id`. |

**Copy — pesan gagal bayar**

| Sebelum — tanpa ryux | Sesudah — ryux-rules |
|:--|:--|
| <a href="assets/compare/copy/copy-before.png"><img src="assets/compare/copy/copy-before.png" alt="Layar gagal bayar generik: Payment Failed, pesan samar Something went wrong, kode error TXN_0x8004, Amount IDR 1250000, tombol merah TRY AGAIN" width="100%"></a> | <a href="assets/compare/copy/copy-after.png"><img src="assets/compare/copy/copy-after.png" alt="Layar gagal bayar ryux: Pembayaran gagal, sebab jelas saldo BCA Virtual Account belum cukup untuk Rp1.250.000, kartu langkah pemulihan, tombol Pilih metode lain, bukti scr_a3f091" width="100%"></a> |
| "Payment Failed", pesan samar, kode error teknis, dolar, tombol kapital. | "Pembayaran gagal", sebab jelas + langkah pemulihan, Rupiah, bukti `screen_id`. |

**Review — usability**

| Sebelum — kritik dangkal | Sesudah — `heuristic_eval` |
|:--|:--|
| <a href="assets/compare/review/review-before.png"><img src="assets/compare/review/review-before.png" alt="Review AI dangkal: bullet samar seperti tambahkan white space, buat lebih modern, perbaiki UX, tanpa bukti" width="100%"></a> | <a href="assets/compare/review/review-after.png"><img src="assets/compare/review/review-after.png" alt="Review ryux heuristic_eval: temuan H-01 Visibility mayor dan H-05 Error prevention minor dengan rekomendasi dan bukti screen_id" width="100%"></a> |
| Opini tanpa bukti. | Temuan berformat: heuristik, severity 0–4, rekomendasi, bukti `screen_id`. |

**Keputusan desain**

| Sebelum | Sesudah |
| --- | --- |
| "Taruh QRIS paling atas karena bagus." | "Taruh QRIS paling atas — pola yang dipakai app F&B Indonesia untuk nominal kecil (`scr_demo_001`)." |

Aturan `RX-C-01` menolak keputusan tanpa bukti `screen_id`; `delivery_gate` menegakkannya.

Aturan UI yang dicek `audit_ui` / `heuristic_eval`: target sentuh ≥ 44px (RX-H-12), kontras ≥ 4.5:1
(RX-H-11), dan state lengkap loading/kosong/error (RX-H-14). Gambar di atas dibuat jujur — bukan
mockup palsu (RX-C-05).

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
