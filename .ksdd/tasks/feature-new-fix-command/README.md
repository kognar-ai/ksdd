# Tasks — Feature: Investigar e corrigir bugs com `/ksdd:new:fix` e `/ksdd:build:fix`

**Feature:** .ksdd/features/FEATURE-new-fix-command.md
**Total:** 11 tasks
**Prioridade:** P0: 6 · P1: 4 · P2: 1
**Estimativa total:** ~15-19 dias

| ID  | Título                                                                     | Área    | Prioridade | Estimativa | Status           | Depende de                          |
|-----|-----------------------------------------------------------------------------|---------|------------|------------|------------------|-------------------------------------|
| 044 | Criar `commands/new:fix.md` (investigação code-aware, FIX doc, tasks, inline) | backend | P0         | L          | em revisão       | —                                   |
| 045 | Criar `references/fix-template.md` (template canônico do FIX doc)            | backend | P0         | M          | em revisão       | —                                   |
| 046 | Criar `commands/build:fix.md` (repro-first, gate de regressão, PR bug)       | backend | P0         | L          | em revisão       | 044                                 |
| 047 | `bin/ksdd.js` — `COMMAND_FILES` + distribuição/uninstall nos 5 targets       | backend | P0         | S          | em revisão       | 044, 046                            |
| 048 | Atualizar `commands/new:feature.md` — numeração considera `fix-*`            | backend | P1         | S          | em revisão       | 044                                 |
| 049 | Atualizar `build:feature` (redireciona fix) + `build:all` (exclui fix tasks) | backend | P2         | S          | em revisão       | 044, 046                            |
| 050 | Gate 8 (`new:fix`) + Gate 9 (`build:fix`) em `references/approval-gates.md`  | backend | P1         | S          | em revisão       | 044, 046                            |
| 051 | Atualizar `SPEC.md` + `architecture.md` (ADR-013, artefatos, contagem)       | backend | P1         | M          | em revisão       | 044, 046                            |
| 052 | README/INSTALL/CHANGELOG + bump `package.json` 0.11.0                        | backend | P0         | S          | em revisão       | 044, 045, 046, 047, 048, 049, 050, 051 |
| 053 | Dogfood — `/ksdd:new:fix` num bug real do repo (contagem de commands)        | qa      | P1         | S          | em revisão       | 052                                 |
| 054 | QA end-to-end — cenários A–O + 5 targets + edge cases                        | qa      | P0         | M          | em revisão       | 053                                 |

---

## Ordem sugerida de execução

**Onda 1 (paralelizável):** 044, 045 — sem dependências. Criam o command principal e o template canônico.

**Onda 2:** 046 (depende de 044) — o segundo command, que herda o contrato de layout do `new:fix`.

**Onda 3 (paralelizável após 044/046):** 047, 048, 049, 050, 051 — wiring do instalador, integração com commands existentes, gates e artefatos KSDD. Podem rodar em paralelo se conflitos de PR forem gerenciados.

**Onda 4:** 052 — agrega docs + version bump (depende de todas as anteriores).

**Onda 5:** 053 — dogfooding (depende de 052).

**Onda 6:** 054 — QA end-to-end (depende de 053).

---

**Próximo passo:** `/ksdd:build:feature new-fix-command` para implementar task por task em ordem de dependência.
