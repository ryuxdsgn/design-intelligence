# Aturan Desain ryux

> **© 2026 ryux (Redho Yurizal).** Aturan orisinal ryux — ditulis mandiri berdasarkan standar
> publik (WCAG 2.x, Apple Human Interface Guidelines, Material Design) dan data referensi ryux.
> **Bukan turunan teks berlisensi pihak ketiga.** Bebas dipakai dan dimodifikasi untuk ryux.
>
> **Terakhir diperbarui:** 2026-09-23 · **Versi:** RX-1.0

Ini adalah gerbang mutu ryux: aturan yang harus dipenuhi sebelum sebuah UI atau copy dianggap
selesai. Tiga hal yang membuatnya khas ryux:

1. **Berbasis bukti** — keputusan desain merujuk screen referensi nyata, bukan selera.
2. **Indonesia lebih dulu** — Rupiah, QRIS, virtual account, OTP WhatsApp, Bahasa Indonesia wajar.
3. **Penilaian manusia** — catatan "kenapa berhasil / apa kelemahannya" ditulis orang, bukan AI.

## Cara pakai

- Setiap aturan berkode `RX-NN` dan bertingkat **[Wajib]** atau **[Anjuran]**.
- **Hard Gate** = kumpulan aturan [Wajib] di grup G1–G4. Melanggar salah satunya → **FAIL**, tanpa perkecualian.
- **[Anjuran]** boleh dilanggar **jika ada alasan tertulis**; tanpa alasan dianggap pelanggaran.
- Tanya dulu ke pengguna kapan aturan ini diterapkan: selama pengerjaan, atau saat review akhir.

---

## G1 — Fondasi ryux

Pembeda utama. Tanpa ini, keluaran ryux tidak ada bedanya dengan generator UI biasa.

- **RX-01 · Bukti wajib. [Wajib]** Setiap keputusan desain merujuk minimal satu `screen_id` referensi yang nyata dan dikenal. Ditegakkan oleh tool `delivery_gate`. *Kenapa: klaim desain harus bisa diverifikasi, bukan opini mengambang.*
- **RX-02 · Catatan desainer buatan manusia. [Wajib]** Penilaian "kenapa sebuah flow berhasil" dan "apa kelemahannya" tidak boleh digenerate AI. AI boleh merangkum, tidak boleh mengarang penilaian. *Kenapa: ini nilai jual ryux; kalau dikarang AI, kepercayaannya runtuh.*
- **RX-03 · Konteks Indonesia dulu. [Wajib]** Rujukan dan pola diambil dari aplikasi Indonesia nyata. Pola dari luar hanya dipakai bila terbukti relevan untuk pengguna Indonesia. *Kenapa: kebiasaan pengguna lokal berbeda (pembayaran, verifikasi, alamat).*

## G2 — Kejujuran konten

- **RX-04 · Tanpa angka tanpa sumber. [Wajib]** Statistik, metrik, dan jumlah hanya ditampilkan bila datanya nyata. Kalau tidak ada, jangan tampilkan angka apa pun. *Kosong lebih baik daripada menyesatkan.*
- **RX-05 · Tanpa identitas palsu. [Wajib]** Dilarang testimonial, nama, foto, jabatan, atau ulasan karangan. Pakai bukti sosial yang bisa diverifikasi, atau tiadakan bagiannya.
- **RX-06 · Placeholder jujur. [Wajib]** Konten sementara tidak boleh menyamar sebagai final. Tandai jelas: `[DATA NYATA]`, `[LOGO]`, atau avatar berbasis inisial.
- **RX-07 · Aset butuh konfirmasi. [Anjuran]** Logo, foto orang, dan ikon merek tidak dibuat seolah final tanpa persetujuan pengguna. Bila tidak bisa bertanya, pakai placeholder yang jelas.

## G3 — Keterbacaan & aksesibilitas

- **RX-08 · Kontras cukup. [Wajib]** Teks biasa ≥ **4.5:1**, teks besar (≥18px atau bold ≥14px) ≥ **3:1** terhadap latar (WCAG AA). Uji di seluruh area yang dilewati teks, bukan satu titik. Hindari teks abu muda di latar abu, atau teks putih di gradien terang. *(cek: `audit_ui` / `contrast-check`)*
- **RX-09 · Ukuran teks layak. [Wajib]** Teks body minimal **12px**; konten utama idealnya 14–16px. Tidak ada teks penting yang lebih kecil dari 12px.
- **RX-10 · State lengkap. [Wajib]** Setiap layar yang memuat data mendesain **loading, kosong, error, dan sukses** — bukan hanya jalur mulus. *Kenapa: jaringan Indonesia sering lambat/putus; error tanpa desain = pengalaman rusak.*
- **RX-11 · Fokus terlihat. [Anjuran]** Indikator fokus (keyboard/aksesibilitas) tidak dihapus. Elemen interaktif bisa dijangkau dan urutannya masuk akal.

## G4 — Sentuhan & interaksi

- **RX-12 · Target sentuh ≥ 44px. [Wajib]** Tiap elemen yang bisa disentuh minimal **44×44px** dengan jarak antar target yang cukup agar tidak salah tekan.
- **RX-13 · Satu aksi primer. [Wajib]** Tepat satu aksi utama (CTA) per layar. Aksi lain dibuat sekunder/tersier secara visual. *Kenapa: dua tombol "sama kuat" membingungkan pilihan.*
- **RX-14 · Umpan balik sentuh. [Wajib]** Setiap elemen interaktif memberi respons saat ditekan (pressed/ripple/perubahan state). Tidak ada tombol yang "diam".
- **RX-15 · Tanpa kontrol mati. [Wajib]** Tombol, tautan, dan toggle harus benar-benar melakukan sesuatu: link menuju tujuan yang ada, submit memunculkan validasi/sukses, toggle mengubah state.
- **RX-16 · Navigasi jujur. [Wajib]** Menu/navbar hanya menautkan halaman atau bagian yang benar-benar ada. Fitur yang belum jadi ditiadakan atau ditandai "segera hadir".

## G5 — Copy Bahasa Indonesia

- **RX-17 · Bahasa Indonesia wajar. [Wajib]** Copy ditulis seperti orang Indonesia bicara, bukan terjemahan kaku dari Inggris. Hindari istilah teknis yang tidak perlu.
- **RX-18 · Tanpa teks jeplakan. [Wajib]** Dilarang `lorem ipsum`, `dummy`, `TODO`, `xxx`, atau teks tempelan lain muncul di layar.
- **RX-19 · Label tombol ringkas. [Anjuran]** Label tombol pendek (≤ ~25 karakter) dan memakai Sentence case, bukan HURUF KAPITAL SEMUA. Awali dengan kata kerja bila memungkinkan ("Bayar sekarang").
- **RX-20 · Error memberi jalan keluar. [Wajib]** Pesan error menjelaskan apa yang terjadi **dan** langkah lanjut ("Periksa koneksi lalu coba lagi"), bukan sekadar "Terjadi kesalahan".
- **RX-21 · Rapi tanpa hiasan berlebih. [Anjuran]** Judul tanpa titik di akhir; spasi bersih (tanpa spasi ganda atau di ujung); tidak berteriak dengan tanda seru beruntun.
- **RX-22 · Format Rupiah lokal. [Wajib]** Nominal uang memakai prefiks **Rp** dan titik sebagai pemisah ribuan (`Rp1.250.000`), tanpa desimal kecuali memang perlu. Konsisten di seluruh app.

## G6 — Pola lokal Indonesia

- **RX-23 · QRIS transparan. [Wajib]** Sebelum konfirmasi, nominal dan nama merchant terlihat jelas. Jangan sembunyikan jumlah yang akan dibayar.
- **RX-24 · Virtual account lengkap. [Wajib]** Sediakan tombol **salin nomor VA**, tampilkan **batas waktu bayar**, dan panduan singkat per bank.
- **RX-25 · OTP fleksibel. [Anjuran]** Tawarkan kanal (SMS/WhatsApp). Hitung mundur kirim ulang wajar dan tidak menyiksa (idealnya ≤ 30 detik).
- **RX-26 · Biaya di depan. [Wajib]** Biaya admin, ongkir, dan pajak terlihat **sebelum** pengguna berkomitmen membayar, bukan muncul mendadak di langkah akhir.
- **RX-27 · Alamat khas Indonesia. [Anjuran]** Formulir alamat mendukung patokan dan detail (blok, RT/RW, warna rumah), bukan hanya pin peta.

## G7 — Konsistensi & sistem

- **RX-28 · Palet warna terbatas. [Anjuran]** Maksimal 2–3 warna inti + 1 aksen. Warna aksen hanya untuk aksi dan penekanan, tidak ditebar merata.
- **RX-29 · Skala spasi konsisten. [Anjuran]** Jarak memakai skala tetap (mis. kelipatan 4 atau 8). Tidak ada nilai spasi acak.
- **RX-30 · Skala tipografi berjenjang. [Anjuran]** Ukuran teks memakai skala terbatas dengan hierarki jelas (judul → subjudul → body → caption).
- **RX-31 · Komponen konsisten. [Wajib]** Komponen sejenis (tombol, kartu, sheet) tampil dan berperilaku sama di seluruh flow.

## G8 — Mobile-first & layout

- **RX-32 · Tanpa overflow. [Wajib]** Tidak ada scroll horizontal tak sengaja; teks tidak keluar kontainer; kartu tidak berbenturan atau terpotong.
- **RX-33 · Hormati area aman. [Wajib]** Layout menghormati safe area (notch, home indicator) dan menempatkan aksi utama dalam jangkauan jempol.
- **RX-34 · Reflow mulus. [Anjuran]** Tata letak mengalir rapi dari layar kecil ke besar. Mobile adalah desain utama, bukan renungan belakangan.

---

## Delivery Gate ryux

Sebelum menganggap pekerjaan UI/copy selesai, lewati gerbang ini:

1. **Bukti (RX-01)** dan **kejujuran (G2)** — Hard Gate, mutlak.
2. **Aksesibilitas (G3)** dan **interaksi inti (G4)** — Hard Gate, mutlak.
3. **Copy (G5)**, **pola lokal (G6)**, **konsistensi (G7)**, **layout (G8)** — periksa; [Anjuran] yang dilanggar wajib punya alasan tertulis.

Hasil **FAIL** bila ada aturan [Wajib] yang gagal. Aturan [Anjuran] tanpa alasan dihitung gagal juga.

## Pemetaan ke kode

Tool audit di `packages/core` saat ini memakai penomoran warisan (`R-0x`, `C-0x`). Berikut padanannya
ke aturan ryux; rencana ke depan: migrasikan kode ke namespace `RX-` agar satu sumber.

| Kode ryux | Cek di kode | Isi |
| --- | --- | --- |
| RX-01 | `delivery_gate` (RX-01) | Bukti `screen_id` |
| RX-08 | `audit_ui` R-03 | Kontras ≥ 4.5:1 |
| RX-09 | `audit_ui` R-02 | Teks body ≥ 12px |
| RX-10 | `audit_ui` R-05 | State lengkap |
| RX-12 | `audit_ui` R-01 | Target sentuh ≥ 44px |
| RX-13 | `audit_ui` R-04 | Satu aksi primer |
| RX-14 | `audit_ui` R-06 | Umpan balik sentuh |
| RX-18 | `audit_copy` C-01 | Tanpa teks jeplakan |
| RX-19 | `audit_copy` C-02, C-03 | Tombol tidak kapital, tidak kepanjangan |
| RX-20 | `audit_copy` C-04 | Error beri langkah lanjut |
| RX-21 | `audit_copy` C-05, C-06 | Judul tanpa titik, spasi rapi |

## Lisensi & kepemilikan

Dokumen ini dan penomoran `RX-NN` adalah karya orisinal ryux, ditulis mandiri dari standar publik
dan data ryux sendiri. Hak cipta © 2026 ryux. Tidak memuat teks dari, dan tidak menggantikan
kewajiban lisensi atas, perangkat lunak pihak ketiga mana pun.
