# Panduan ryux (dari nol)

Panduan singkat: apa itu ryux, cara memasang aturannya ke agent-mu, dan cara menyambung ke
data referensi lewat MCP. Kalau kamu cuma mau gambaran cepat, baca [README](./README.md).

## Apa itu ryux

ryux adalah dua hal yang bekerja bersama:

1. **ryux-rules** — aturan desain (RX-C / RX-H / RX-L) yang menyaring keluaran agar tidak
   "berbau AI": berbukti, aksesibel, dan sesuai konteks Indonesia. Dokumen: [`docs/design-rules.md`](./docs/design-rules.md).
2. **MCP server** — memberi agent akses ke **screen referensi aplikasi Indonesia** (data nyata,
   catatan desainer) plus tool audit. Sembilan tool; lihat [`docs/prd.md`](./docs/prd.md).

Aturan tanpa data cuma gaya; data tanpa aturan cuma tumpukan gambar. ryux menggabungkan keduanya.

## 1. Pasang ryux-rules ke agent

Satu perintah, lalu jawab beberapa pertanyaan (agent yang dipakai, lapisan aturan, sambungan MCP):

```bash
npx ryux-rules
```

CLI menulis ke tempat yang tepat sesuai agent:

| Agent | File |
| --- | --- |
| Claude Code | `.claude/skills/ryux-rules/SKILL.md` + blok bertanda di `CLAUDE.md` |
| Cursor | `.cursor/rules/ryux-rules.mdc` |
| Codex / lainnya | blok bertanda di `AGENTS.md` |

File pengguna tidak pernah ditimpa mentah — perubahan hanya di dalam blok
`<!-- ryux-rules:start -->` … `<!-- ryux-rules:end -->`.

### Non-interaktif

```bash
npx ryux-rules install --agent claude,cursor --layers RX-C,RX-H,RX-L
```

## 2. Sambungkan ke MCP (data referensi)

Aturan ryux paling kuat saat agent bisa mengambil bukti nyata. Sambungkan MCP ryux:

```bash
claude mcp add --transport http ryux https://mcp.ryux.design/mcp
```

Untuk pengembangan lokal, jalankan server sendiri:

```bash
pnpm install
pnpm dev:mcp        # http://localhost:8787/mcp
```

Sambungkan lewat MCP client (Claude Code, MCP Inspector) — bukan browser biasa (endpoint
memakai transport Streamable HTTP).

## 3. Coba

Minta agent-mu:

- "Cari referensi pemilih metode bayar dengan QRIS lewat ryux."
- "Audit halaman checkout ini dengan ryux-rules."
- "Review layar ini dengan `heuristic_eval`, sertakan screen pembanding sebagai bukti."

## Update & Remove

```bash
npx ryux-rules update     # perbarui aturan yang sudah terpasang
npx ryux-rules remove     # hapus (mengembalikan file ke keadaan semula)
```

## Selanjutnya

- Aturan lengkap: [`docs/design-rules.md`](./docs/design-rules.md)
- Kosakata (kategori, flow, pola): [`docs/taxonomy.md`](./docs/taxonomy.md)
- Arsitektur & rencana: [`docs/prd.md`](./docs/prd.md)
