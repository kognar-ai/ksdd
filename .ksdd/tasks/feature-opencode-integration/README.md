# Tasks — Feature: Integração com opencode

**Feature:** [.ksdd/features/FEATURE-opencode-integration.md](../../features/FEATURE-opencode-integration.md)
**Total:** 8 tasks
**Prioridade:** P0: 7 · P1: 1 · P2: 0
**Estimativa total:** ~10-12 dias (S=4, M=4)

| ID  | Título                                                                          | Área       | Prioridade | Estimativa | Status       | Issue | Commit    |
|-----|---------------------------------------------------------------------------------|------------|------------|------------|--------------|-------|-----------|
| 020 | Adicionar `installOpencode()` + flag `--opencode` + env vars em `bin/ksdd.js`   | backend    | P0         | M          | em revisão   | #8    | `99320c4` |
| 021 | Estender `normalizeManifest`, `uninstall`, `status`, `pruneEmptyDirs` p/ opencode | backend    | P0         | S          | em revisão   | #9    | `4a401bb` |
| 022 | Criar `references/opencode-AGENTS.md` (template bundlado)                       | data-model | P0         | S          | em revisão   | #10   | `697dc04` |
| 023 | Renomear `codexPromptBasename` → `agentPromptBasename`                          | backend    | P1         | S          | em revisão   | #11   | `758fac9` |
| 024 | `architecture.md` — ADR-010 + diagrama + roadmap Fase 5                         | design     | P0         | S          | em revisão   | #12   | `b653fdc` |
| 025 | `SPEC.md` — seções 7.1 (CLI) e 13 (fluxos) com opencode                         | design     | P0         | S          | em revisão   | #13   | `507f991` |
| 026 | Atualizar README + INSTALL + CHANGELOG + bump `package.json` 0.8.0              | design     | P0         | M          | em revisão   | #14   | `0cdd6ec` |
| 027 | Dogfood + QA smoke test cross-platform + `QA-REPORT.md`                         | qa         | P0         | M          | em revisão   | #15   | `5e8609a` |

---

## Ordem sugerida de execução

**Onda 1 — sem dependências (paralelizáveis):**
- 020 (núcleo do instalador)
- 022 (template AGENTS.md)
- 024 (architecture.md — pode revisar após 020 estar pronto)
- 025 (SPEC.md — pode revisar após 020 estar pronto)

**Onda 2 — destrava após 020:**
- 021 (manifest + uninstall + status)
- 023 (rename helper — opcional, P1)

**Onda 3 — destrava após 020-023:**
- 026 (docs do pacote + bump)

**Onda 4 — só após tudo acima:**
- 027 (QA end-to-end)

---

**Status:** 8/8 tasks implementadas em `feat/opencode-integration` (commits `697dc04..5e8609a`). Aguardando review do PR e merge em `main`.

**QA:** ver [QA-REPORT.md](./QA-REPORT.md) — 9/9 cenários macOS verde; cenários 10-11 (`/ksdd-start` e `/ksdd-spec` em opencode real) e validação Linux/Windows ficam como gates manuais antes de `npm publish`.
