# Tasks — Feature: Integração com opencode

**Feature:** [.ksdd/features/FEATURE-opencode-integration.md](../../features/FEATURE-opencode-integration.md)
**Total:** 8 tasks
**Prioridade:** P0: 7 · P1: 1 · P2: 0
**Estimativa total:** ~10-12 dias (S=4, M=4)

| ID  | Título                                                                          | Área       | Prioridade | Estimativa | Status            | Depende de             |
|-----|---------------------------------------------------------------------------------|------------|------------|------------|-------------------|------------------------|
| 020 | Adicionar `installOpencode()` + flag `--opencode` + env vars em `bin/ksdd.js`   | backend    | P0         | M          | para implementar  | —                      |
| 021 | Estender `normalizeManifest`, `uninstall`, `status`, `pruneEmptyDirs` p/ opencode | backend    | P0         | S          | para implementar  | 020                    |
| 022 | Criar `references/opencode-AGENTS.md` (template bundlado)                       | data-model | P0         | S          | para implementar  | —                      |
| 023 | Renomear `codexPromptBasename` → `agentPromptBasename`                          | backend    | P1         | S          | para implementar  | 020                    |
| 024 | `architecture.md` — ADR-010 + diagrama + roadmap Fase 5                         | design     | P0         | S          | para implementar  | —                      |
| 025 | `SPEC.md` — seções 7.1 (CLI) e 13 (fluxos) com opencode                         | design     | P0         | S          | para implementar  | —                      |
| 026 | Atualizar README + INSTALL + CHANGELOG + bump `package.json` 0.8.0              | design     | P0         | M          | para implementar  | 020, 021, 022, 023     |
| 027 | Dogfood + QA smoke test (macOS + Linux) + `QA-REPORT.md`                        | qa         | P0         | M          | para implementar  | 020, 021, 022, 023, 024, 025, 026 |

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

**Próximo passo:** `/ksdd:build:feature opencode-integration` para implementar task por task.
