# Taksonomi ryux (draf v0.1)

Taksonomi terdiri dari empat lapisan tag: kategori app, tipe flow, pola, dan komponen. Slug memakai huruf kecil dan tanda hubung, dalam bahasa Inggris agar mudah dipakai agent; label tampil dalam Bahasa Indonesia.

## Kategori app

| Slug | Label | Pilot |
| --- | --- | --- |
| `fnb` | F&B dan pesan antar makanan | Ya |
| `ecommerce` | E-commerce dan marketplace | Ya |
| `pos-umkm` | Kasir dan manajemen usaha | Ya |
| `ride-hailing` | Transportasi dan super app | Nanti |
| `ewallet` | Dompet digital | Setelah rilis |
| `digital-bank` | Bank digital | Setelah rilis |
| `investment` | Investasi | Setelah rilis |
| `travel` | Tiket dan perjalanan | Nanti |
| `health` | Kesehatan dan telemedis | Nanti |
| `edtech` | Pendidikan | Nanti |
| `gov` | Layanan pemerintah | Nanti |

## Tipe flow

| Slug | Label |
| --- | --- |
| `onboarding` | Onboarding dan pengenalan app |
| `signup-login` | Daftar dan masuk (termasuk OTP) |
| `ekyc` | Verifikasi identitas |
| `home-discovery` | Beranda dan penemuan |
| `search-filter` | Pencarian dan filter |
| `product-detail` | Detail produk atau menu |
| `cart-checkout` | Keranjang dan checkout |
| `payment` | Pembayaran |
| `topup` | Isi saldo |
| `order-tracking` | Lacak pesanan |
| `promo-voucher` | Promo, voucher, dan cashback |
| `subscription` | Langganan dan paywall |
| `profile-settings` | Profil dan pengaturan |
| `empty-error` | Empty state dan error |
| `review-rating` | Ulasan dan rating |

## Pola lokal

| Slug | Label | Ciri |
| --- | --- | --- |
| `qris` | QRIS | Scan atau tampilkan kode, konfirmasi nominal |
| `virtual-account` | Virtual account | Pilih bank, salin nomor VA, batas waktu bayar |
| `ewallet-link` | Tautan e-wallet | Hubungkan akun, redirect ke app dompet |
| `paylater` | Paylater | Limit, tenor, simulasi cicilan |
| `installment` | Cicilan kartu | Pilihan tenor dan bunga |
| `cod` | Bayar di tempat | Konfirmasi dan catatan untuk kurir |
| `otp-sms-wa` | OTP via SMS atau WhatsApp | Pilihan kanal, hitung mundur kirim ulang |
| `ktp-capture` | Foto KTP dan selfie | Panduan bingkai, penjelasan alasan |
| `cashback-coins` | Cashback dan koin | Saldo poin, potongan di checkout |
| `flash-sale` | Flash sale | Hitung mundur, stok terbatas |
| `rupiah-input` | Input nominal Rupiah | Prefiks Rp, titik ribuan, nominal cepat |
| `address-pinpoint` | Alamat dan pin lokasi | Patokan, detail rumah, pin peta |

## Komponen

| Slug | Label |
| --- | --- |
| `bottom-sheet` | Bottom sheet |
| `modal` | Modal atau dialog |
| `pin-pad` | PIN pad |
| `otp-input` | Kolom OTP |
| `payment-method-picker` | Pemilih metode bayar |
| `promo-banner` | Banner promo |
| `stepper` | Indikator langkah |
| `tab-bar` | Navigasi bawah |
| `chip-filter` | Chip filter |
| `card-list` | Daftar kartu |
| `countdown` | Hitung mundur |
| `toast-snackbar` | Toast atau snackbar |
| `skeleton` | Skeleton loading |
| `map-view` | Tampilan peta |

## Aturan pemakaian

- Setiap screen wajib punya tepat satu kategori dan satu tipe flow (diwarisi dari flow), serta nol atau lebih pola dan komponen
- Slug baru hanya boleh ditambahkan oleh admin, dan dicatat di tabel perubahan di bawah
- Tag dari AI yang tidak cocok dengan slug yang ada ditolak, bukan dibuat otomatis
- Tinjau ulang taksonomi setelah pilot 10 app

## Riwayat perubahan

| Versi | Perubahan |
| --- | --- |
| v0.1 | Draf awal untuk pilot |
