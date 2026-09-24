---
name: ryux-critique
description: Playbook review usability ryux — kumpulkan konteks, telusur layar per layar terhadap ryux-rules (RX-C/RX-H/RX-N/RX-L), beri severity 0-4 dengan bukti screen nyata, lalu strukturkan lewat heuristic_eval dan tutup dengan prioritas. Pakai saat mengkritik atau mereview UI, layar, atau flow.
---

# ryux-critique

> Cara ryux menjalankan review usability: berbukti, terstruktur, dan tidak dangkal.

Skill ini memandu review sebuah layar atau flow memakai **ryux-rules** (`docs/design-rules.md`)
dan tool `heuristic_eval`. Tujuannya: kritik yang bisa ditindaklanjuti karena disertai contoh
nyata, bukan komentar kabur seperti "tambahkan white space".

## Kapan dipakai

- Diminta mereview, mengaudit, atau mengkritik UI / layar / flow.
- Sebelum menganggap pekerjaan UI selesai (Delivery Gate).

## Prinsip

1. **Berbukti.** Tiap temuan mayor (severity ≥ 3) wajib menunjuk minimal satu `screen_id` nyata sebagai pembanding. Cari lewat `search_screens`.
2. **Pass pertama, bukan pengganti manusia.** Hasilnya review cepat awal, bukan evaluasi usability final.
3. **Ringkas & berprioritas.** Batasi temuan (maks 12); dahulukan yang paling merugikan pengguna.

## Langkah

### 1. Kumpulkan konteks (jangan lewati)

Tetapkan dulu:
- Siapa penggunanya (mis. pelanggan warung, pengguna baru).
- Tugas apa yang sedang dikerjakan di layar ini (mis. bayar QRIS).
- Platform dan titik dalam flow.

Tanpa konteks ini, review jatuh jadi selera, bukan usability.

### 2. Telusur layar per layar

Untuk tiap layar, periksa terhadap empat lapisan ryux-rules:
- **RX-C** — ada pola UI generik? copy hambar? konten tak jujur?
- **RX-H** — uji 10 heuristik: status terlihat? bisa batal (kendali)? cegah error? pesan error beri jalan keluar? kontras & target sentuh cukup?
- **RX-N** — pola UX terapan (NNGroup): umpan balik sesuai waktu respons, form (label di atas, validasi inline jaga isian, field minimal), biaya transparan, cegah kesalahan, wayfinding.
- **RX-L** — pola lokal benar? QRIS/VA transparan, biaya di depan, format Rupiah, Bahasa Indonesia wajar.

### 3. Beri severity + alasan

Skala 0–4: `0` bukan masalah · `1` kosmetik · `2` minor · `3` mayor · `4` katastrofik.
Tiap temuan tulis: heuristik, lokasi, masalah, dan rekomendasi konkret. Alasan wajib — jangan hanya label.

### 4. Ambil bukti nyata

Untuk tiap temuan mayor, cari 1–3 screen pembanding dari aplikasi Indonesia lewat `search_screens`
(mis. "cara app F&B menampilkan status pembayaran"). Kutip `screen_id`-nya.

### 5. Strukturkan lewat heuristic_eval

Kirim semua temuan ke tool `heuristic_eval` (`task_context` + `findings`). Tool akan:
- memvalidasi severity dan menolak temuan mayor tanpa bukti valid,
- membatasi jumlah temuan,
- mengembalikan ringkasan (katastrofik/mayor/minor) + PASS/FAIL.

Perbaiki temuan bertanda `supported: false` sebelum lanjut.

### 6. Tutup dengan prioritas perbaikan

Urutkan: katastrofik → mayor → minor. Untuk tiap prioritas sebut perbaikan konkret + screen acuan.
Bila perlu gate rilis, jalankan `delivery_gate` (bukti) dan `audit_ui`/`audit_copy` (cek terprogram).

## Larangan (anti-dangkal)

- Jangan memberi kritik tanpa lokasi dan alasan.
- Jangan menaikkan severity ke mayor tanpa bukti `screen_id`.
- Jangan menyalin rekomendasi generik ("modernkan", "tambah white space") tanpa menautkan ke masalah nyata.
- Jangan mengarang klaim "app X begini" tanpa `screen_id` pembanding.

## Contoh temuan (ringkas)

```
H-01 · severity 3 · Layar konfirmasi bayar
masalah: tidak ada indikator saat verifikasi berjalan
saran:   tampilkan status + estimasi waktu
bukti:   scr_demo_001
```

## Referensi

- Aturan: `docs/design-rules.md` (RX-C / RX-H / RX-N / RX-L)
- Tool: `heuristic_eval`, `search_screens`, `delivery_gate`, `audit_ui`, `audit_copy`
