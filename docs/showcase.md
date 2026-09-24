# Playbook Before/After ryux (showcase)

Panduan membuat 3 perbandingan **sebelum vs sesudah** untuk README — bukti nyata bahwa ryux-rules
mengubah keluaran "berbau AI" jadi berbukti dan wajar. Prinsip: **jujur, bukan mockup palsu**
(RX-C-05). "Before" = keluaran agent tanpa ryux; "After" = keluaran agent yang sama **dengan**
ryux-rules + MCP ryux.

## Persiapan (sekali)

1. Jalankan MCP lokal: `pnpm dev:mcp` (data referensi di `http://localhost:8787/mcp`).
2. Pasang aturan di agent yang dipakai: `npx ryux-rules` (pilih Claude Code/Cursor + RX-C/RX-H/RX-L).
3. Sambungkan agent ke MCP: `claude mcp add --transport http ryux-local http://localhost:8787/mcp`.
4. Siapkan folder aset: `assets/compare/{ui,copy,review}/`.
5. Tangkap gambar pada lebar **mobile 390px**, ekspor **WebP** (atau PNG), beri nama `before` / `after`.

> Tips adil: "before" dibuat di sesi/agent **tanpa** ryux-rules dan **tanpa** MCP; "after" di sesi
> **dengan** keduanya. Brief-nya sama persis. Jangan mengedit tangan hasilnya — biar perbandingan jujur.

---

## Use case 1 — UI: layar pemilih metode bayar (checkout QRIS)

**Menunjukkan:** RX-C-02/03/05 (tanpa pola generik & data palsu), RX-L-01 (QRIS transparan),
RX-H-11/12 (kontras & target sentuh), RX-C-01 (bukti `screen_id`).

**Langkah:**

1. **Before** — di agent tanpa ryux, minta:
   > "Buat satu file HTML mobile (lebar 390px) untuk layar pemilih metode pembayaran app F&B Indonesia."
   Simpan `before.html`, buka di browser (mode device 390px), screenshot → `assets/compare/ui/before.webp`.
2. **After** — di agent dengan ryux-rules + MCP, minta hal yang sama plus:
   > "Pakai referensi QRIS dari ryux (`search_screens` query 'qris'), terapkan RX-L dan RX-H, jangan pakai logo/angka palsu, rujuk `screen_id` di komentar."
   Simpan `after.html`, screenshot → `assets/compare/ui/after.webp`.
3. **Bukti angka (opsional tapi kuat):** jalankan `audit_ui` untuk kedua layar (isi `tap_target_px`,
   `contrast_ratio`, `states`, dst). Catat hasil: *before* FAIL, *after* PASS. Bisa dijadikan caption.

**Yang biasanya terlihat:** before punya logo sparkle + metode generik + kontras tipis; after
menaruh QRIS paling atas dengan nominal jelas, target sentuh ≥44px, tanpa data karangan.

---

## Use case 2 — Copy: teks & format (Rupiah, error, CTA)

**Menunjukkan:** RX-L-06 (Rupiah), RX-L-07 (Bahasa Indonesia wajar), RX-H-09 (error beri jalan keluar),
RX-C-06 (CTA spesifik, bukan klise).

**Langkah:**

1. **Before** — di agent tanpa ryux, minta menulis 4 teks apa adanya:
   > "Tulis untuk app belanja: (a) label tombol bayar, (b) tampilan harga Rp1250000, (c) pesan saat pembayaran gagal, (d) CTA banner promo."
2. **After** — di agent dengan ryux-rules, minta perbaiki keempatnya sesuai RX-L/RX-H, lalu jalankan
   `audit_copy` untuk membuktikan (before ada findings, after bersih).
3. Tempel kedua set ke satu kartu sederhana (atau screenshot langsung output yang dirapikan),
   screenshot → `assets/compare/copy/before.webp` & `after.webp`.

**Target:** `Rp 1250000` → `Rp1.250.000`; "Terjadi kesalahan." → "Pembayaran gagal. Cek koneksi lalu
coba lagi."; "BAYAR SEKARANG" → "Bayar sekarang"; "Pelajari selengkapnya" → "Lihat contoh checkout QRIS".

---

## Use case 3 — Review: kritik dangkal vs `heuristic_eval` berbukti

**Menunjukkan:** skill `ryux-critique` + tool `heuristic_eval` + wajib bukti `screen_id`.

**Langkah:**

1. Ambil satu layar untuk direview (boleh `before.html` dari use case 1, atau screenshot app nyata).
2. **Before** — di agent tanpa ryux, minta: "Review layar ini." Biasanya keluar kritik dangkal
   ("tambahkan white space", "buat lebih modern"). Screenshot → `assets/compare/review/before.webp`.
3. **After** — di agent dengan skill `ryux-critique`, minta review terstruktur. Agent akan
   memanggil `heuristic_eval` → temuan berformat: heuristik, severity 0–4, lokasi, rekomendasi, dan
   `screen_id` pembanding. Rapikan output (JSON atau tabel), screenshot → `assets/compare/review/after.webp`.

**Kontras utama:** before = opini tanpa bukti; after = temuan berprioritas dengan contoh app nyata.

---

## Menaruh ke README

Ganti/lengkapi tabel teks di bagian **"Lihat bedanya"** dengan gambar (pola seperti repo lain):

```md
| Sebelum | Sesudah |
|:--|:--|
| <a href="assets/compare/ui/before.webp"><img src="assets/compare/ui/before.webp" width="100%"></a> | <a href="assets/compare/ui/after.webp"><img src="assets/compare/ui/after.webp" width="100%"></a> |
```

Selalu isi `alt` yang deskriptif (aksesibilitas — RX-H-13). Setiap gambar klik-untuk-perbesar.

## Checklist

- [ ] `assets/compare/ui/before.webp` + `after.webp`
- [ ] `assets/compare/copy/before.webp` + `after.webp`
- [ ] `assets/compare/review/before.webp` + `after.webp`
- [ ] Caption tiap pasangan menyebut aturan (RX-…) dan, bila ada, hasil `audit_ui`/`audit_copy`
- [ ] README diperbarui memakai gambar, dengan `alt` deskriptif
