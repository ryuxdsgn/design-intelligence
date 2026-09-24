<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-source--available-2ea44f" alt="Source-Available"></a>
  <img src="https://img.shields.io/badge/status-early__access%20v0.1-1f6feb" alt="Status: early access v0.1">
  <img src="https://img.shields.io/badge/MCP%20tools-9-8957e5" alt="9 MCP tools">
  <img src="https://img.shields.io/badge/rules-RX--C%20%2F%20RX--H%20%2F%20RX--N%20%2F%20RX--L-e36209" alt="ryux-rules">
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
- **Aturan milik sendiri.** `ryux-rules` (RX-C / RX-H / RX-N / RX-L) — karya orisinal, lisensi source-available, tanpa dependency pihak ketiga.

## Apa isinya

- **9 tool MCP** dalam tiga kelompok: riset (`search_screens`, `get_flow`, `get_local_pattern`, `compare_apps`, `extract_design_direction`), audit (`audit_ui`, `audit_copy`, `heuristic_eval`, `delivery_gate`), dan jembatan desain.
- **ryux-rules** — 45 aturan RX dalam empat lapisan: filter anti slop (RX-C), heuristik usability & aksesibilitas (RX-H), pola UX terapan riset NNGroup (RX-N), pola & copy Indonesia (RX-L). Plus Delivery Gate PASS/FAIL sebelum rilis.
- **CLI `ryux-rules`** — pasang aturan ke Claude Code, Cursor, atau AGENTS.md dengan satu perintah, **per-concern** (ui, copy, a11y, ux, local) seperti memilih skill.

## Lihat bedanya — per concern

`ryux-rules` dipasang per **concern** (`ryux-ui`, `ryux-copy`, `ryux-a11y`, `ryux-ux`, `ryux-local`).
Tiap concern punya before/after nyata di bawah — dibuat di pen.dev, brief sama, `after` memakai
aturan concern itu + data ryux.

**`ryux-ui` — UI & visual** · palet, spasi, konsistensi, state

| Sebelum — tanpa ryux | Sesudah — `ryux-ui` |
|:--|:--|
| <a href="assets/compare/ui/ui-before.png"><img src="assets/compare/ui/ui-before.png" alt="Layar bayar generik: logo sparkle, badge 256-BIT, angka pengguna karangan, metode global (Card/PayPal/Apple/Google), harga dolar, teks kontras rendah" width="100%"></a> | <a href="assets/compare/ui/ui-after.png"><img src="assets/compare/ui/ui-after.png" alt="Layar checkout ryux premium: ringkasan pesanan, rincian biaya transparan (subtotal, ongkir, total Rp1.250.000), QRIS dengan ekspektasi verifikasi kurang dari 5 detik, tombol Bayar Rp1.250.000, catatan kepercayaan, bukti scr_a3f091" width="100%"></a> |
| Pola global, angka karangan, dolar, kontras tipis. | Palet 2–3 warna + aksen (RX-C-07), spasi konsisten (RX-C-08), Rupiah, bukti `screen_id`. |

**`ryux-copy` — Copywriting Indonesia** · Bahasa wajar, Rupiah, pesan error

| Sebelum — tanpa ryux | Sesudah — `ryux-copy` |
|:--|:--|
| <a href="assets/compare/copy/copy-before.png"><img src="assets/compare/copy/copy-before.png" alt="Layar gagal bayar generik: Payment Failed, pesan samar Something went wrong, kode error TXN_0x8004, Amount IDR 1250000, tombol merah TRY AGAIN" width="100%"></a> | <a href="assets/compare/copy/copy-after.png"><img src="assets/compare/copy/copy-after.png" alt="Layar gagal bayar ryux: Pembayaran gagal, sebab jelas saldo BCA Virtual Account belum cukup untuk Rp1.250.000, kartu langkah pemulihan, tombol Pilih metode lain, bukti scr_a3f091" width="100%"></a> |
| "Payment Failed", pesan samar, kode error teknis, dolar, tombol kapital. | "Pembayaran gagal", sebab + solusi (RX-N-05), Bahasa wajar (RX-L-07), Rupiah (RX-L-06). |

**`ryux-a11y` — Aksesibilitas** · kontras, ukuran teks, target sentuh, fokus

| Sebelum — tanpa ryux | Sesudah — `ryux-a11y` |
|:--|:--|
| <a href="assets/compare/a11y/a11y-before.png"><img src="assets/compare/a11y/a11y-before.png" alt="Layar pengaturan tak aksesibel: teks abu kontras rendah 11px, label hanya placeholder, target sentuh kecil, toggle mungil, tombol Simpan pucat kontras rendah" width="100%"></a> | <a href="assets/compare/a11y/a11y-after.png"><img src="assets/compare/a11y/a11y-after.png" alt="Layar pengaturan ryux: teks 16px kontras AA, field fokus dengan ring aksen, target sentuh besar, toggle jelas, tombol Simpan perubahan kontras tinggi, bukti scr_a3f091" width="100%"></a> |
| Teks 11px kontras ~2:1, label placeholder, target kecil, tombol pucat. | Teks ≥16px kontras AA (RX-H-11), target ≥48px (RX-H-12), fokus terlihat (RX-H-13). |

**`ryux-ux` — Pola UX terapan (NNGroup)** · form, validasi, field minimal, keypad

| Sebelum — tanpa ryux | Sesudah — `ryux-ux` |
|:--|:--|
| <a href="assets/compare/ux/ux-before.png"><img src="assets/compare/ux/ux-before.png" alt="Form daftar buruk: dua kolom sempit, label hanya placeholder, semua field wajib termasuk referral, banner error samar, tombol DAFTAR generik" width="100%"></a> | <a href="assets/compare/ux/ux-after.png"><img src="assets/compare/ux/ux-after.png" alt="Form daftar ryux: satu kolom, label di atas field, nomor HP dengan keypad angka dan status valid, kata sandi dengan error inline yang mempertahankan isian, kode referral opsional, tombol Lanjut, bukti scr_a3f091" width="100%"></a> |
| Dua kolom, label placeholder, semua wajib, error samar. | Satu kolom + label di atas (RX-N-02), validasi inline jaga isian (RX-N-03), field minimal (RX-N-04), keypad angka (RX-N-10). |

**`ryux-local` — Pola Indonesia** · QRIS, Virtual Account, biaya, Rupiah

| Sebelum — tanpa ryux | Sesudah — `ryux-local` |
|:--|:--|
| <a href="assets/compare/local/local-before.png"><img src="assets/compare/local/local-before.png" alt="Pembayaran kartu global: judul Payment, tagihan dolar 79.00, form kartu nomor MM/YY CVV, metode global VISA Mastercard PayPal G Pay, tombol PAY 79.00" width="100%"></a> | <a href="assets/compare/local/local-after.png"><img src="assets/compare/local/local-after.png" alt="Virtual Account BCA ryux: hitung mundur batas bayar, nomor VA dengan tombol Salin, rincian biaya admin transparan, total Rp1.250.000, langkah bayar m-BCA bernomor, bukti scr_a3f091" width="100%"></a> |
| Kartu global, dolar, metode luar negeri, tak ada pola lokal. | Virtual Account + Salin + batas bayar (RX-L-02), biaya admin transparan (RX-L-04), Rupiah. |

**Bonus — review usability lewat MCP** (`heuristic_eval`; tool audit, bukan concern instalasi)

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
docs/             taxonomy.md, design-rules.md
```

Roadmap (belum dibuat): `apps/web` (website Next.js) dan `packages/pipeline` (capture video → data).

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
npx ryux-rules            # wizard: pilih agent + concern (ui, copy, a11y, ux, local)
```

Pasang hanya yang kamu butuhkan — seperti antislop yang membiarkanmu memilih UI/copywriting/dll.
Tiap concern jadi skill sendiri (mis. `ryux-ui`, `ryux-copy`); inti (bukti + kejujuran) selalu ikut.
Detail: [`packages/cli`](./packages/cli). Sumber aturan: [`docs/design-rules.md`](./docs/design-rules.md).

## Dokumentasi

| Dokumen | Isi |
| --- | --- |
| [`docs/taxonomy.md`](./docs/taxonomy.md) | Kosakata terkontrol: kategori, flow, pola, komponen |
| [`docs/design-rules.md`](./docs/design-rules.md) | Aturan desain ryux (RX-C / RX-H / RX-N / RX-L) |
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
