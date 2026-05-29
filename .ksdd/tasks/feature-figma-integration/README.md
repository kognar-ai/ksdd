# Tasks — Feature: Integração Figma (Exportador DESIGN.md → Figma via MCP)

**Feature:** [.ksdd/features/FEATURE-figma-integration.md](../../features/FEATURE-figma-integration.md)
**Total:** 7 tasks
**Prioridade:** P0: 4 · P1: 3 · P2: 0
**Estimativa total:** ~7-9 dias

| ID  | Título                                                                 | Área       | Prioridade | Estimativa | Status            | Depende de        |
|-----|------------------------------------------------------------------------|------------|------------|------------|-------------------|-------------------|
| 028 | Criar slash command `commands/figma:export.md`                         | backend    | P0         | M          | para implementar  | 029               |
| 029 | Criar `references/figma-mapping.md` (Stitch → Figma Variables)         | data-model | P0         | M          | para implementar  | —                 |
| 030 | Criar fixture `references/fixtures/example-DESIGN.md`                  | qa         | P0         | S          | para implementar  | 029               |
| 031 | Atualizar agent `critic` + skill discovery + Gate 8                    | backend    | P1         | S          | para implementar  | 028               |
| 032 | Atualizar SPEC.md + architecture.md (ADR-011)                          | backend    | P1         | S          | para implementar  | 028, 031          |
| 033 | Atualizar README/INSTALL/CHANGELOG + bump `0.9.0`                      | backend    | P1         | S          | para implementar  | 028, 029, 030, 031, 032 |
| 034 | Dogfood QA — `/ksdd:figma:export` contra fixture via MCP oficial Figma | qa         | P0         | M          | para implementar  | 028, 029, 030     |

## Ordem sugerida de execução

Núcleo (P0):
1. **029** — Mapping reference (zero dependências, define o contrato).
2. **030** — Fixture sintética (depende do mapping para cobrir os tipos certos).
3. **028** — Command que consome o mapping + fixture.
4. **034** — Dogfood QA do command com a fixture.

Integração (P1):
5. **031** — Critic + discovery + Gate 8.
6. **032** — SPEC + architecture + ADR-011.
7. **033** — README + INSTALL + CHANGELOG + bump 0.9.0 (fecha a release).

---
**Próximo passo:** `/ksdd:build:feature figma-integration` para implementar task por task.
