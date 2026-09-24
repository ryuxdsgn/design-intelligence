---
name: ryux-rules
description: Inti aturan desain ryux (bukti + kejujuran konten). Selalu berlaku untuk pekerjaan UI atau copy; muat skill concern (ryux-ui, ryux-copy, ryux-a11y, ryux-ux, ryux-local, ryux-code) sesuai tugas.
---

# ryux-rules (inti)

> Aturan desain ryux.design — versi 0.2.0, lisensi MIT.
> Terapkan pada pekerjaan UI atau copy sebelum menganggapnya selesai.

## Bukti & kejujuran

- **RX-C-01** Setiap keputusan desain merujuk minimal satu screen_id nyata sebagai bukti.
- **RX-C-03** Tanpa angka atau statistik tanpa sumber nyata; kosong lebih baik daripada mengarang.
- **RX-C-04** Tanpa testimonial, nama, atau foto orang yang dikarang.
- **RX-C-05** Placeholder ditandai jelas ([DATA NYATA], [LOGO]), tidak menyamar sebagai final.
- **RX-C-09** Catatan desainer ditulis manusia, bukan digenerate AI.

Skill concern terpasang: `ryux-ui`, `ryux-copy`, `ryux-a11y`, `ryux-ux`, `ryux-local`, `ryux-code`. Muat yang relevan dengan tugas.

## Delivery Gate

Keputusan desain wajib punya bukti (`screen_id`); aturan wajib tidak boleh dilanggar, anjuran hanya
dengan alasan tertulis. Data referensi & review terstruktur lewat MCP ryux (`search_screens`,
`heuristic_eval`, `delivery_gate`). Sambungkan: `claude mcp add --transport http ryux https://mcp.ryux.design/mcp`
