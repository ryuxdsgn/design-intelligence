# ryux-rules (CLI)

Pasang **aturan desain ryux** (RX-C / RX-H / RX-L) ke agent AI-mu dengan satu perintah.
Karya orisinal ryux.design, lisensi source-available. Sumber aturan: [`docs/design-rules.md`](../../docs/design-rules.md).

## Pakai

```bash
npx ryux-rules            # wizard interaktif
npx ryux-rules update     # perbarui yang sudah terpasang
npx ryux-rules remove     # hapus
```

Wizard menanyakan: agent yang dipakai, lapisan aturan, dan (opsional) sambungan MCP ryux.

## Target per agent

| Agent | File yang ditulis |
| --- | --- |
| Claude Code | `.claude/skills/ryux-rules/SKILL.md` + blok bertanda di `CLAUDE.md` |
| Cursor | `.cursor/rules/ryux-rules.mdc` |
| Codex / lainnya | blok bertanda di `AGENTS.md` |

## Aman untuk repo pengguna

- File pengguna tidak pernah ditimpa mentah. Perubahan pada `CLAUDE.md`/`AGENTS.md` hanya di
  dalam blok `<!-- ryux-rules:start -->` … `<!-- ryux-rules:end -->`.
- `update` hanya menyentuh yang sudah terpasang; `remove` mengembalikannya.

## Mode non-interaktif

```bash
npx ryux-rules install --agent claude,cursor,codex --layers RX-C,RX-H,RX-L --mcp
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
