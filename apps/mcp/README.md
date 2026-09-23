# ryux-mcp (starter lokal)

MCP server ryux versi paling awal, berjalan di Cloudflare Workers. Datanya masih contoh,
belum ada login, dan kuotanya disimpan di memori. Tujuannya melihat bentuk MCP-nya dulu.

## Isi

| File | Fungsi |
| --- | --- |
| `src/index.ts` | Wiring server MCP + Durable Object; mendaftarkan tujuh tool dari `@ryux/core` dan mengelola kuota per-sesi |
| `wrangler.jsonc` | Konfigurasi Worker dan Durable Object |

Data dan logika tool (`search_screens`, `get_flow`, `compare_apps`, `extract_design_direction`,
`get_local_pattern`, `delivery_gate`, `audit_ui`) ada di paket `@ryux/core` (`packages/core/src`),
supaya bisa dipakai ulang oleh app lain nanti.

## Menjalankan

```bash
npm install
npm run dev          # server di http://localhost:8787/mcp
```

## Mencoba

**Lewat MCP Inspector** (tampilan visual untuk memanggil tool):

```bash
npm run inspect
```

Pilih transport *Streamable HTTP*, isi URL `http://localhost:8787/mcp`, klik Connect,
lalu buka tab Tools.

**Lewat Claude Code:**

```bash
claude mcp add --transport http ryux-local http://localhost:8787/mcp
claude
```

Contoh prompt:

- "Pakai ryux-local, cari referensi pemilih metode bayar dengan QRIS"
- "Tampilkan flow flw_demo_checkout dari ryux-local"
- "Bandingkan Warung Contoh dan Toko Contoh lewat ryux-local"
- "Rangkum arah desain checkout QRIS dari ryux-local"
- "Jelaskan pola virtual-account dari ryux-local"
- "Jalankan delivery_gate untuk keputusan desain checkout ini"
- "Audit UI checkout ini pakai audit_ui (target sentuh 40px, satu tombol bayar)"

## Deploy

```bash
npx wrangler login
npm run deploy
```

## Langkah berikutnya (sesuai PRD)

1. Ganti `src/data.ts` dengan query Supabase (`published` saja)
2. Tambahkan OAuth dengan `@cloudflare/workers-oauth-provider` dan pemetaan ke `user_id`
3. Pindahkan kuota ke `usage_events` dan `credit_ledger`
4. Tambah tool `audit_copy`
5. Pencarian gabungan full-text + pgvector
