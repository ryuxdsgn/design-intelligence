# ryux-rules (CLI)

Pasang **aturan desain ryux** (RX-C / RX-H / RX-N / RX-L) ke agent AI-mu dengan satu perintah.
Karya orisinal ryux.design, lisensi MIT. Sumber aturan: [`docs/design-rules.md`](../../docs/design-rules.md).

## Pakai

```bash
npx ryux-rules            # wizard interaktif
npx ryux-rules update     # perbarui yang sudah terpasang
npx ryux-rules remove     # hapus
```

Wizard menanyakan: agent yang dipakai, **concern** yang mau dipasang, dan (opsional) sambungan MCP ryux.

## Concern (pilih yang relevan, inti selalu ikut)

| Concern | Isi | Aturan RX |
| --- | --- | --- |
| `ui` | UI & visual | RX-C-02/07/08, RX-H-04/08/14, RX-N-12 |
| `copy` | Copywriting Indonesia | RX-C-06, RX-L-06/07, RX-H-09, RX-N-05 |
| `a11y` | Aksesibilitas | RX-H-11/12/13/14 |
| `ux` | Pola UX terapan (NNGroup) | RX-N-01/02/03/05/06/07/09/11 |
| `local` | Pola Indonesia | RX-L-01..05/09/10 |

Inti (bukti + kejujuran: RX-C-01/03/04/05/09) selalu terpasang sebagai skill `ryux-rules`.

## Target per agent

| Agent | File yang ditulis |
| --- | --- |
| Claude Code | `.claude/skills/ryux-rules/SKILL.md` (inti) + `.claude/skills/ryux-<concern>/SKILL.md` per concern + blok bertanda di `CLAUDE.md` |
| Cursor | `.cursor/rules/ryux-rules.mdc` (inti) + `.cursor/rules/ryux-<concern>.mdc` per concern |
| Codex / lainnya | blok bertanda di `AGENTS.md` (inti + concern terpilih, inline) |

## Aman untuk repo pengguna

- File pengguna tidak pernah ditimpa mentah. Perubahan pada `CLAUDE.md`/`AGENTS.md` hanya di
  dalam blok `<!-- ryux-rules:start -->` … `<!-- ryux-rules:end -->`.
- `update` hanya menyentuh yang sudah terpasang; `remove` mengembalikannya.

## Mode non-interaktif

```bash
npx ryux-rules install --agent claude,cursor,codex --concerns ui,copy,a11y,ux,local --mcp
npx ryux-rules remove --yes
```

## Kembangkan

```bash
pnpm --filter ryux-rules build      # tsc -> dist/
node packages/cli/dist/index.js --help
```

## Publikasi (nanti)

Paket masih `private: true`. Sebelum publish ke npm: cek ketersediaan nama `ryux-rules`
(alternatif `@ryux/rules`), set `private: false`, dan tambahkan `LICENSE`.
