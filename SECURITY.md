# Kebijakan Keamanan

Kami menghargai laporan kerentanan yang bertanggung jawab. Terima kasih sudah membantu menjaga
ryux dan penggunanya tetap aman.

## Versi yang didukung

| Versi | Didukung |
| --- | --- |
| `main` (v0.1, pra-rilis) | ✅ |

Selama pra-rilis, hanya branch `main` yang menerima perbaikan keamanan.

## Melaporkan kerentanan

**Jangan** membuka issue publik untuk kerentanan keamanan.

- Utamakan: **GitHub Security Advisories** — tab **Security → Report a vulnerability** di repo ini
  (laporan bersifat privat).
- Alternatif: email **the Security tab of this repository** dengan subjek `[ryux security]`.
  (Akan diganti ke `security@ryux.design` setelah domain aktif.)

Sertakan bila memungkinkan: langkah reproduksi, dampak, versi/commit, dan bukti konsep.

Target respons awal: **3 hari kerja**. Mohon beri kami waktu wajar untuk memperbaiki sebelum
pengungkapan publik (coordinated disclosure).

## Cakupan

**Dalam cakupan**
- MCP server (`apps/mcp`) dan logika tool (`packages/core`)
- CLI `ryux-rules` (`packages/cli`)
- Website `ryux.design` dan API-nya (setelah dirilis)

**Di luar cakupan**
- Serangan yang butuh akses fisik atau akun yang sudah diretas
- Rate limiting atau denial-of-service volumetrik
- Laporan otomatis tanpa dampak nyata (mis. hasil scanner tanpa PoC)

## Prinsip keamanan yang sudah diterapkan

- **Prompt injection.** Teks hasil OCR dari screenshot selalu ditempatkan di field
  `untrusted_text` dan diperlakukan sebagai data, bukan instruksi.
- **Rahasia.** Tidak ada secret di repo; `.env`, `.env.*`, dan `.dev.vars` di-`.gitignore`.
- **Akses data (produksi).** Row Level Security aktif untuk setiap tabel sejak migrasi pertama;
  website dan MCP hanya membaca konten berstatus `published`; service role key hanya untuk
  menulis `usage_events` dan `credit_ledger`, bukan query atas nama pengguna.
- **Token.** Autentikasi OAuth; token dapat dicabut per koneksi; tidak ada API key statis.
- **Aset gambar.** Diakses lewat signed URL yang kedaluwarsa, bukan URL publik permanen.

## Keberatan pemilik aplikasi (takedown)

Untuk keberatan atas konten (screenshot aplikasi), gunakan formulir takedown di website atau
email di atas. Konten yang dilaporkan disembunyikan selama ditinjau.
