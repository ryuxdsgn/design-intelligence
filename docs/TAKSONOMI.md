# Taksonomi — ryux

> **Terakhir diperbarui:** 2026-09-23
> **Sumber kebenaran:** `packages/core/src/data.ts` (nilai), `packages/core/src/tools.ts` (aturan).

Taksonomi adalah **kosakata terkontrol** ryux: kumpulan slug yang dipakai tool sebagai input (`category`, `pattern`, `slug`, `flow_id`) dan sebagai label pada data (`Screen.tags`, `Screen.flow.type`). Menjaga slug tetap konsisten membuat pencarian, filter, dan perbandingan bisa diandalkan.

Dokumen ini dibaca Claude Code saat menulis `CLAUDE.md`, jadi ia harus menjadi acuan tunggal untuk penamaan.

---

## 1. Konvensi ID

| Jenis | Pola | Contoh | Dipakai di |
| --- | --- | --- | --- |
| Screen ID | `scr_<slug>` | `scr_demo_001` | bukti; dirujuk semua keputusan desain (RX-01) |
| Flow ID | `flw_<slug>` | `flw_demo_checkout` | input `get_flow` |
| Slug | `kebab-case`, huruf kecil | `virtual-account` | `category`, `pattern`, `slug`, `tags` |

Aturan slug: huruf kecil, angka, dan tanda hubung. Tanpa spasi, tanpa kapital, tanpa garis bawah.

---

## 2. Dimensi taksonomi

Empat dimensi yang membentuk kosakata terkontrol.

### 2.1 Kategori aplikasi (`app.category`)

Slug kategori. Dipakai sebagai filter `category` di `search_screens` dan `extract_design_direction`.

| Slug | Arti |
| --- | --- |
| `fnb` | Food & beverage (mis. warung, resto) |
| `ecommerce` | Toko / marketplace |

> Nilai di atas adalah yang **ada di data contoh v0.1**. Tambah kategori baru dengan menambah `Screen` yang memakainya.

### 2.2 Tipe flow (`flow.type`)

Jenis alur yang diwakili sebuah flow. Muncul di output `get_flow`, `compare_apps`, `extract_design_direction`.

| Slug | Arti |
| --- | --- |
| `cart-checkout` | Alur keranjang → pembayaran |
| `onboarding` | Alur pengenalan / pendaftaran awal |

### 2.3 Tags / pola (`Screen.tags`)

Slug pola desain dan komponen pada sebuah screen. Dipakai sebagai filter `pattern` dan sebagai dasar `shared_patterns` (`compare_apps`) serta `recommended_patterns` (`extract_design_direction`).

| Slug | Jenis | Arti |
| --- | --- | --- |
| `payment-method-picker` | pola | Pemilih metode pembayaran |
| `qris` | pola lokal | Pembayaran QRIS (lihat §3) |
| `virtual-account` | pola lokal | Transfer VA per bank (lihat §3) |
| `bottom-sheet` | komponen | Panel yang muncul dari bawah |
| `otp-sms-wa` | pola lokal | OTP via SMS atau WhatsApp |
| `otp-input` | komponen | Kolom input kode OTP |

### 2.4 Pola lokal terdokumentasi (`LOCAL_PATTERNS`)

Subset tags yang punya penjelasan lengkap dan bisa diambil lewat `get_local_pattern`. Berisi `description`, `user_behavior_notes`, dan `example_screen_ids`.

| Slug | Nama | Inti perilaku pengguna |
| --- | --- | --- |
| `qris` | QRIS | Untuk nominal kecil; nominal & nama merchant harus jelas sebelum konfirmasi |
| `virtual-account` | Virtual account | Butuh tombol salin nomor, batas waktu bayar, panduan per bank |

> Semua slug di `LOCAL_PATTERNS` sebaiknya juga muncul sebagai `tags` pada minimal satu screen (lihat `example_screen_ids`), agar `get_local_pattern` dan `search_screens` konsisten.

---

## 3. Aturan mutu (antislop)

Taksonomi juga mencakup **kode aturan** yang dipakai tool audit. Referensi tunggal untuk semua kode `R-*`, `C-*`, `RX-*`.

### 3.1 Gerbang bukti — `delivery_gate`

| Kode | Aturan |
| --- | --- |
| `RX-01` | Setiap keputusan desain wajib merujuk minimal satu `screen_id` yang dikenal |

> `delivery_gate` juga mengingatkan menjalankan Delivery Gate antislop penuh untuk `R-01..R-38`.

### 3.2 Aturan UI — `audit_ui` (`UI_RULES`)

Aturan `severity: error` yang gagal → hasil **FAIL**. Aturan tanpa data input → **SKIP**.

| Kode | Judul | Severity | Ambang |
| --- | --- | --- | --- |
| `R-01` | Target sentuh minimal 44px | error | `tap_target_px ≥ 44` |
| `R-02` | Teks body minimal 12px | error | `body_text_px ≥ 12` |
| `R-03` | Kontras teks minimal 4.5:1 (WCAG AA) | error | `contrast_ratio ≥ 4.5` |
| `R-04` | Tepat satu aksi primer | warning | `primary_actions == 1` |
| `R-05` | State penting hadir | warning | ada `loading`, `empty`, `error` |
| `R-06` | Ada umpan balik sentuh | warning | `touch_feedback == true` |

> `R-01..R-06` baru subset. Target penuh `R-01..R-38` (lihat roadmap PRD §10).

### 3.3 Aturan copy — `audit_copy` (`COPY_RULES`)

Ada finding `severity: error` → hasil **FAIL**.

| Kode | Severity | Berlaku pada | Melanggar bila |
| --- | --- | --- | --- |
| `C-01` | error | semua | mengandung placeholder (`lorem ipsum`, `dummy`, `todo`, `xxx`, dll) |
| `C-02` | warning | `button` | seluruhnya HURUF KAPITAL |
| `C-03` | warning | `button` | label > 25 karakter |
| `C-04` | warning | `error` | tak memberi langkah lanjut (`coba`, `periksa`, `ulangi`, `hubungi`, `cek`) |
| `C-05` | warning | `title` | judul diakhiri titik |
| `C-06` | warning | semua | spasi ganda atau spasi di ujung |

Peran teks (`role`) yang valid untuk `audit_copy`: `button`, `title`, `body`, `label`, `error`, `placeholder`.

---

## 4. Menambah entri baru

1. **Screen baru** → tambah objek `Screen` di `data.ts`. Pastikan `screen_id` unik (`scr_*`), `category`/`flow.type`/`tags` memakai slug yang sudah ada bila cocok.
2. **Pola lokal baru** → tambah tags-nya ke screen terkait, lalu daftarkan di `LOCAL_PATTERNS` dengan `example_screen_ids` yang menunjuk balik ke screen tersebut.
3. **Kategori / tipe flow baru** → cukup pakai slug baru pada `Screen`; keduanya diturunkan otomatis dari data (`appNames()`, `flowIds()`).
4. **Aturan audit baru** → tambah ke `UI_RULES` / `COPY_RULES` di `tools.ts`, lalu dokumentasikan kodenya di §3 sini.

Selalu jaga slug tetap `kebab-case` dan hindari sinonim (mis. jangan campur `qris` dengan `qr-payment`).
