# ryux-rules — Aturan Desain ryux

> **© 2026 ryux (Redho Yurizal). Lisensi: source-available.** Ruleset orisinal ryux.design.
> Ditulis dari nol berdasarkan standar & metode publik: **10 heuristik usability Nielsen
> (Nielsen, 1994)** dan **riset UX Nielsen Norman Group** (nngroup.com), **WCAG 2.2**,
> **Apple Human Interface Guidelines**, dan **Material Design**.
> Penyebutan standar bersifat faktual; seluruh penjelasan, contoh, dan penomoran ditulis sendiri.
> **Bukan turunan teks berlisensi pihak ketiga** dan tidak berafiliasi dengan NN/g atau pihak mana pun.
>
> **Terakhir diperbarui:** 2026-09-24 · **Versi:** RX-1.1

Gate mutu ryux untuk UI dan copy. Tiga hal yang membuatnya khas ryux: **berbasis bukti**
(rujuk screen nyata), **Indonesia lebih dulu**, dan **penilaian manusia** untuk catatan desainer.

## Empat lapisan

| Lapisan | Isi | Peran |
| --- | --- | --- |
| **RX-C** | Filter anti slop: pola UI generik, copy hambar, konten tak jujur | Menyaring keluaran "berbau AI" |
| **RX-H** | 10 heuristik usability + aksesibilitas | Dasar penilaian usability |
| **RX-N** | Pedoman UX terapan (riset NNGroup): form, error, checkout, kepercayaan, mobile, waktu-respons | Kedalaman usability yang bisa ditindak |
| **RX-L** | Pola dan copy khas Indonesia | Relevansi lokal |

## Cara pakai

- Setiap aturan berformat: **id · judul**, lalu `kategori`, `tingkat`, `dilarang`, `dianjurkan`, `cara cek`, `bukti`.
- **Tingkat [Wajib]** = Hard Gate, tidak boleh dilanggar. **[Anjuran]** = boleh dilanggar hanya dengan alasan tertulis.
- Temuan dari `heuristic_eval` memakai **skala severity 0–4** (konvensi umum): `0` bukan masalah · `1` kosmetik · `2` minor · `3` mayor · `4` katastrofik.
- Setiap temuan mayor (severity ≥ 3) **wajib** membawa minimal satu `screen_id` pembanding sebagai bukti.

---

## Lapisan RX-C — Filter anti slop

- **RX-C-01 · Bukti wajib**
  - kategori: fondasi · tingkat: **[Wajib]**
  - dilarang: keputusan desain tanpa rujukan screen nyata
  - dianjurkan: setiap keputusan merujuk ≥1 `screen_id` yang dikenal
  - cara cek: `delivery_gate` (RX-01) · bukti: `scr_...`

- **RX-C-02 · Tanpa pola UI generik**
  - kategori: visual · tingkat: **[Wajib]**
  - dilarang: tata letak template hambar (hero + 3 kartu + footer) tanpa alasan konteks
  - dianjurkan: komposisi mengikuti konten dan tugas pengguna, bukan cetakan
  - cara cek: review manual + pembanding screen · bukti: `scr_...`

- **RX-C-03 · Konten jujur: angka**
  - kategori: konten · tingkat: **[Wajib]**
  - dilarang: statistik atau jumlah tanpa sumber nyata
  - dianjurkan: kalau data tak ada, jangan tampilkan angka apa pun
  - cara cek: review manual · bukti: sumber data

- **RX-C-04 · Konten jujur: identitas**
  - kategori: konten · tingkat: **[Wajib]**
  - dilarang: testimonial, nama, foto, atau jabatan karangan
  - dianjurkan: bukti sosial yang bisa diverifikasi, atau tiadakan bagiannya
  - cara cek: review manual · bukti: sumber

- **RX-C-05 · Placeholder jujur**
  - kategori: konten · tingkat: **[Wajib]**
  - dilarang: konten sementara menyamar jadi final
  - dianjurkan: tandai jelas `[DATA NYATA]`, `[LOGO]`, atau avatar inisial
  - cara cek: `audit_copy` (C-01) · bukti: —

- **RX-C-06 · Copy tidak hambar**
  - kategori: copy · tingkat: **[Anjuran]**
  - dilarang: klise kosong ("mulus", "revolusioner", "berdayakan") dan CTA generik ("Pelajari selengkapnya")
  - dianjurkan: copy spesifik pada tindakan dan manfaat nyata
  - cara cek: `audit_copy` + review · bukti: `scr_...`

- **RX-C-07 · Palet warna terbatas**
  - kategori: visual · tingkat: **[Anjuran]**
  - dilarang: warna ditebar tanpa sistem
  - dianjurkan: 2–3 warna inti + 1 aksen; aksen hanya untuk aksi/penekanan
  - cara cek: review manual · bukti: `scr_...`

- **RX-C-08 · Skala spasi & tipografi konsisten**
  - kategori: visual · tingkat: **[Anjuran]**
  - dilarang: jarak dan ukuran teks acak
  - dianjurkan: skala tetap (mis. kelipatan 4/8) dan hierarki tipografi jelas
  - cara cek: review manual · bukti: `scr_...`

- **RX-C-09 · Catatan desainer buatan manusia**
  - kategori: fondasi · tingkat: **[Wajib]**
  - dilarang: AI mengarang penilaian "kenapa berhasil / kelemahan"
  - dianjurkan: AI merangkum; penilaian ditulis manusia
  - cara cek: review manual · bukti: —

---

## Lapisan RX-H — Heuristik usability & aksesibilitas

Berdasarkan 10 heuristik usability Nielsen (Nielsen, 1994); penjelasan ditulis untuk konteks
aplikasi mobile Indonesia. Dipakai `heuristic_eval` dengan severity 0–4.

- **RX-H-01 · Visibilitas status sistem**
  - kategori: heuristik/umpan balik · tingkat: **[Wajib]**
  - dilarang: proses berjalan tanpa indikator (mis. verifikasi bayar diam)
  - dianjurkan: status jelas + estimasi waktu untuk proses > 1 detik
  - cara cek: `heuristic_eval` H-01 · bukti: `scr_...`

- **RX-H-02 · Kecocokan dengan dunia nyata**
  - kategori: heuristik/bahasa · tingkat: **[Anjuran]**
  - dilarang: istilah teknis/sistem yang asing bagi pengguna
  - dianjurkan: bahasa dan urutan sesuai kebiasaan pengguna Indonesia
  - cara cek: `heuristic_eval` H-02 · bukti: `scr_...`

- **RX-H-03 · Kendali & kebebasan pengguna**
  - kategori: heuristik/navigasi · tingkat: **[Wajib]**
  - dilarang: jebakan tanpa jalan keluar (tidak bisa batal/kembali)
  - dianjurkan: sediakan batal, undo, dan pintu keluar yang jelas
  - cara cek: `heuristic_eval` H-03 · bukti: `scr_...`

- **RX-H-04 · Konsistensi & standar**
  - kategori: heuristik/visual · tingkat: **[Wajib]**
  - dilarang: komponen sejenis tampil/berperilaku beda antar layar
  - dianjurkan: ikuti konvensi platform (HIG/Material) dan pola internal
  - cara cek: `heuristic_eval` H-04 · bukti: `scr_...`

- **RX-H-05 · Pencegahan kesalahan**
  - kategori: heuristik/interaksi · tingkat: **[Wajib]**
  - dilarang: aksi merusak tanpa konfirmasi; input rawan salah tanpa penjagaan
  - dianjurkan: konfirmasi untuk aksi tak-terbalikkan; validasi sebelum kirim
  - cara cek: `heuristic_eval` H-05 · bukti: `scr_...`

- **RX-H-06 · Kenali, bukan mengingat**
  - kategori: heuristik/kognitif · tingkat: **[Anjuran]**
  - dilarang: memaksa pengguna mengingat info dari layar sebelumnya
  - dianjurkan: tampilkan pilihan dan konteks; kurangi beban ingatan
  - cara cek: `heuristic_eval` H-06 · bukti: `scr_...`

- **RX-H-07 · Fleksibel & efisien**
  - kategori: heuristik/efisiensi · tingkat: **[Anjuran]**
  - dilarang: hanya satu jalur kaku untuk semua pengguna
  - dianjurkan: jalan pintas bagi pengguna mahir (mis. simpan metode bayar)
  - cara cek: `heuristic_eval` H-07 · bukti: `scr_...`

- **RX-H-08 · Estetika & minimalis**
  - kategori: heuristik/visual · tingkat: **[Anjuran]**
  - dilarang: elemen/dekorasi yang bersaing dengan info penting
  - dianjurkan: tiap elemen punya alasan; utamakan info yang relevan
  - cara cek: `heuristic_eval` H-08 · bukti: `scr_...`

- **RX-H-09 · Pemulihan dari kesalahan**
  - kategori: heuristik/error · tingkat: **[Wajib]**
  - dilarang: pesan error samar tanpa langkah lanjut ("Terjadi kesalahan")
  - dianjurkan: bahasa jelas, sebut sebab, beri jalan keluar konkret
  - cara cek: `heuristic_eval` H-09 + `audit_copy` (C-04) · bukti: `scr_...`

- **RX-H-10 · Bantuan & dokumentasi**
  - kategori: heuristik/bantuan · tingkat: **[Anjuran]**
  - dilarang: fitur rumit tanpa panduan saat dibutuhkan
  - dianjurkan: bantuan kontekstual singkat di titik pemakaian
  - cara cek: `heuristic_eval` H-10 · bukti: `scr_...`

- **RX-H-11 · Kontras aksesibel (WCAG AA)**
  - kategori: aksesibilitas · tingkat: **[Wajib]**
  - dilarang: teks < 4.5:1 (biasa) atau < 3:1 (besar ≥18px/bold ≥14px) terhadap latar
  - dianjurkan: uji di seluruh area teks; hindari teks tipis di latar/gradien terang
  - cara cek: `audit_ui` (R-03) / rasio kontras · bukti: `scr_...`

- **RX-H-12 · Ukuran teks & target sentuh**
  - kategori: aksesibilitas · tingkat: **[Wajib]**
  - dilarang: teks body < 12px; target sentuh < 44×44px
  - dianjurkan: body 14–16px; jarak antar target cukup
  - cara cek: `audit_ui` (R-01, R-02) · bukti: `scr_...`

- **RX-H-13 · Fokus & keyboard**
  - kategori: aksesibilitas · tingkat: **[Anjuran]**
  - dilarang: indikator fokus dihapus; urutan fokus kacau
  - dianjurkan: fokus terlihat, elemen bisa dijangkau, urutan logis
  - cara cek: review manual · bukti: `scr_...`

- **RX-H-14 · State lengkap & mobile sehat**
  - kategori: aksesibilitas/mobile · tingkat: **[Wajib]**
  - dilarang: hanya jalur mulus (tanpa loading/kosong/error); overflow horizontal; abaikan safe area
  - dianjurkan: desain loading/kosong/error/sukses; hormati notch & jangkauan jempol
  - cara cek: `audit_ui` (R-05) + review · bukti: `scr_...`

---

## Lapisan RX-N — Pedoman UX terapan (riset NNGroup)

Distilasi riset publik Nielsen Norman Group ke aturan konkret, ditulis ulang untuk konteks mobile
Indonesia. Rujukan: **Nielsen Norman Group** (nngroup.com); teks, contoh, dan penomoran milik ryux.

- **RX-N-01 · Umpan balik sesuai batas waktu respons**
  - kategori: waktu-respons · tingkat: **[Wajib]**
  - dilarang: aksi tanpa umpan balik; proses > 1 detik tanpa indikator; > 10 detik tanpa progres + estimasi
  - dianjurkan: < 0,1 dtk terasa instan; < 1 dtk jaga alur; > 1 dtk tampilkan loading; > 10 dtk progres + estimasi
  - cara cek: `heuristic_eval` (H-01) · bukti: `scr_...` · dasar: batas waktu respons Nielsen (0,1 / 1 / 10 detik)

- **RX-N-02 · Form satu kolom, label di atas field**
  - kategori: form · tingkat: **[Anjuran]**
  - dilarang: form multi-kolom yang memecah alur; label hanya di dalam field (hilang saat mengetik)
  - dianjurkan: satu kolom, label terlihat di atas field, urutan logis
  - cara cek: review + pembanding screen · bukti: `scr_...`

- **RX-N-03 · Validasi inline & pertahankan input**
  - kategori: form · tingkat: **[Wajib]**
  - dilarang: menghapus data yang sudah diisi saat error; validasi hanya setelah submit penuh
  - dianjurkan: validasi dekat field saat relevan; pertahankan semua input saat gagal
  - cara cek: review · bukti: `scr_...`

- **RX-N-04 · Minimalkan field & beban input**
  - kategori: form · tingkat: **[Anjuran]**
  - dilarang: meminta data tak perlu; menandai semua field wajib tanpa alasan
  - dianjurkan: minimal field; tandai wajib/opsional jelas; default yang masuk akal
  - cara cek: review · bukti: `scr_...`

- **RX-N-05 · Pesan error: masalah + solusi, dekat lokasi**
  - kategori: error · tingkat: **[Wajib]**
  - dilarang: pesan samar/teknis; menyalahkan pengguna; error jauh dari sumbernya
  - dianjurkan: bahasa jelas, sebut apa yang salah + langkah perbaikan, tempatkan dekat field/aksi
  - cara cek: `audit_copy` (C-04) + `heuristic_eval` (H-09) · bukti: `scr_...`

- **RX-N-06 · Biaya total transparan sejak awal**
  - kategori: checkout · tingkat: **[Wajib]**
  - dilarang: biaya (ongkir, admin, pajak) muncul mendadak di langkah akhir
  - dianjurkan: tampilkan total dan rincian sebelum pengguna berkomitmen
  - cara cek: review · bukti: `scr_...` · dasar: riset checkout NNGroup (biaya tak terduga = penyebab utama abandonment)

- **RX-N-07 · Ringkasan pesanan + indikator progres**
  - kategori: checkout · tingkat: **[Anjuran]**
  - dilarang: checkout tanpa ringkasan yang bisa diperiksa; alur bertahap tanpa "di langkah mana"
  - dianjurkan: ringkasan pesanan terlihat; indikator progres untuk alur bertahap
  - cara cek: review · bukti: `scr_...`

- **RX-N-08 · Minim friksi masuk (tamu / cepat)**
  - kategori: checkout · tingkat: **[Anjuran]**
  - dilarang: memaksa buat akun sebelum bisa bertransaksi
  - dianjurkan: dukung jalur tamu atau login cepat; simpan progres
  - cara cek: review · bukti: `scr_...`

- **RX-N-09 · Kepercayaan jujur, tanpa urgensi palsu**
  - kategori: kepercayaan · tingkat: **[Wajib]**
  - dilarang: hitung mundur/scarcity palsu; testimonial atau angka karangan; badge keamanan menyesatkan
  - dianjurkan: sinyal kepercayaan yang nyata & bisa diverifikasi; kontak/bantuan jelas
  - cara cek: review · bukti: `scr_...` · dasar: riset kredibilitas web NNGroup

- **RX-N-10 · Input mobile yang tepat**
  - kategori: mobile · tingkat: **[Anjuran]**
  - dilarang: keyboard teks untuk input angka; memaksa banyak ketik; target kecil berdempetan
  - dianjurkan: keyboard sesuai tipe (numerik untuk nominal/OTP), autofill, pilihan cepat
  - cara cek: review · bukti: `scr_...`

- **RX-N-11 · Cegah kesalahan: konfirmasi & undo**
  - kategori: interaksi · tingkat: **[Wajib]**
  - dilarang: aksi tak-terbalikkan (hapus, bayar) tanpa konfirmasi atau undo
  - dianjurkan: konfirmasi ringkas untuk aksi berisiko; sediakan undo bila memungkinkan
  - cara cek: `heuristic_eval` (H-05) · bukti: `scr_...`

- **RX-N-12 · Wayfinding: "di mana saya", selalu ada jalan keluar**
  - kategori: navigasi · tingkat: **[Anjuran]**
  - dilarang: layar tanpa judul/konteks; jalur buntu tanpa kembali atau batal
  - dianjurkan: judul jelas, jejak lokasi, tombol kembali/batal selalu tersedia
  - cara cek: `heuristic_eval` (H-03) · bukti: `scr_...`

---

## Lapisan RX-L — Pola & copy Indonesia

- **RX-L-01 · QRIS transparan**
  - kategori: pembayaran · tingkat: **[Wajib]**
  - dilarang: menyembunyikan nominal atau nama merchant sebelum konfirmasi
  - dianjurkan: tampilkan nominal + merchant jelas, tombol konfirmasi tegas
  - cara cek: review + screen QRIS nyata · bukti: `scr_...`

- **RX-L-02 · Virtual account lengkap**
  - kategori: pembayaran · tingkat: **[Wajib]**
  - dilarang: nomor VA tanpa tombol salin atau tanpa batas waktu
  - dianjurkan: tombol salin, batas waktu bayar, panduan per bank
  - cara cek: review + screen VA · bukti: `scr_...`

- **RX-L-03 · OTP fleksibel**
  - kategori: autentikasi · tingkat: **[Anjuran]**
  - dilarang: hanya satu kanal + hitung mundur menyiksa
  - dianjurkan: pilihan SMS/WhatsApp; kirim ulang wajar (idealnya ≤ 30 dtk)
  - cara cek: review + screen OTP · bukti: `scr_...`

- **RX-L-04 · Biaya di depan**
  - kategori: pembayaran · tingkat: **[Wajib]**
  - dilarang: biaya admin/ongkir/pajak muncul mendadak di langkah akhir
  - dianjurkan: semua biaya terlihat sebelum pengguna berkomitmen
  - cara cek: review · bukti: `scr_...`

- **RX-L-05 · Alamat khas Indonesia**
  - kategori: form · tingkat: **[Anjuran]**
  - dilarang: hanya pin peta tanpa detail
  - dianjurkan: dukung patokan, blok/RT-RW, warna rumah, catatan kurir
  - cara cek: review + screen alamat · bukti: `scr_...`

- **RX-L-06 · Format Rupiah**
  - kategori: copy · tingkat: **[Wajib]**
  - dilarang: format uang tidak konsisten atau tanpa prefiks
  - dianjurkan: `Rp` + titik ribuan (`Rp1.250.000`), tanpa desimal kecuali perlu
  - cara cek: `audit_copy` + review · bukti: `scr_...`

- **RX-L-07 · Bahasa Indonesia wajar**
  - kategori: copy · tingkat: **[Wajib]**
  - dilarang: terjemahan kaku dari Inggris; istilah teknis tak perlu
  - dianjurkan: bahasa seperti orang Indonesia bicara
  - cara cek: `audit_copy` + review · bukti: `scr_...`

- **RX-L-08 · Konteks Indonesia dulu**
  - kategori: fondasi · tingkat: **[Wajib]**
  - dilarang: menyalin pola luar tanpa cek relevansi lokal
  - dianjurkan: rujukan dari aplikasi Indonesia nyata
  - cara cek: `search_screens` + review · bukti: `scr_...`

- **RX-L-09 · Paylater & cicilan transparan**
  - kategori: pembayaran · tingkat: **[Anjuran]**
  - dilarang: menampilkan cicilan tanpa limit, tenor, atau simulasi
  - dianjurkan: tampilkan limit, pilihan tenor, dan total biaya jelas
  - cara cek: review + screen paylater · bukti: `scr_...`

- **RX-L-10 · e-KYC / foto KTP**
  - kategori: verifikasi · tingkat: **[Anjuran]**
  - dilarang: minta foto KTP/selfie tanpa panduan atau alasan
  - dianjurkan: panduan bingkai, penjelasan kenapa data diminta
  - cara cek: review + screen e-KYC · bukti: `scr_...`

---

## Delivery Gate ryux

Sebelum pekerjaan UI/copy dianggap selesai:

1. **RX-C fondasi** (RX-C-01 bukti, RX-C-03/04/05 kejujuran, RX-C-09) — Hard Gate.
2. **RX-H [Wajib]** (H-01, H-03, H-04, H-05, H-09, H-11, H-12, H-14) — Hard Gate.
3. **RX-N [Wajib]** (N-01, N-03, N-05, N-06, N-09, N-11) — Hard Gate.
4. **RX-L [Wajib]** (L-01, L-02, L-04, L-06, L-07, L-08) — Hard Gate.
5. Sisanya **[Anjuran]**: dilanggar hanya dengan alasan tertulis.

Hasil **FAIL** bila ada aturan [Wajib] gagal, atau ada temuan `heuristic_eval` severity ≥ 3 tanpa perbaikan.

## Pemetaan ke kode

Tool di `packages/core` (penomoran warisan `R-0x`/`C-0x`) dan tool baru `heuristic_eval`:

| Aturan ryux | Cek di kode |
| --- | --- |
| RX-C-01 | `delivery_gate` (RX-01) |
| RX-C-05 | `audit_copy` C-01 |
| RX-C-06 | `audit_copy` C-02, C-03 |
| RX-H-09 | `audit_copy` C-04 + `heuristic_eval` H-09 |
| RX-H-11 | `audit_ui` R-03 |
| RX-H-12 | `audit_ui` R-01, R-02 |
| RX-H-14 | `audit_ui` R-05 |
| RX-H-01..10 | `heuristic_eval` H-01..H-10 (belum dibangun) |
| RX-L-06 | `audit_copy` (format Rupiah) |

## Lisensi & kepemilikan

Ruleset ini (teks, struktur RX-C/RX-H/RX-L, penomoran) adalah karya orisinal ryux, **lisensi
source-available**, hak cipta © 2026 ryux. Menyebut standar publik (Nielsen 1994, WCAG 2.2, HIG,
Material) secara faktual; tidak memuat teks, gambar, checklist berbayar, atau materi kursus pihak
mana pun, dan tidak berafiliasi dengan mereka.
