# Tasks — Feature: Investigar e corrigir bugs com `/ksdd:new:fix` e `/ksdd:build:fix`

**Feature:** .ksdd/features/FEATURE-new-fix-command.md
**Total:** 11 tasks
**Prioridade:** P0: 6 · P1: 4 · P2: 1
**Estimativa total:** ~15-19 dias

| ID  | Título                                                                     | Área    | Prioridade | Estimativa | Status           | Depende de                          |
|-----|-----------------------------------------------------------------------------|---------|------------|------------|------------------|-------------------------------------|
| 035 | Criar `commands/new:fix.md` (investigação code-aware, FIX doc, tasks, inline) | backend | P0         | L          | para implementar | —                                   |
| 036 | Criar `references/fix-template.md` (template canônico do FIX doc)            | backend | P0         | M          | para implementar | —                                   |
| 037 | Criar `commands/build:fix.md` (repro-first, gate de regressão, PR bug)       | backend | P0         | L          | para implementar | 035                                 |
| 038 | `bin/ksdd.js` — `COMMAND_FILES` + distribuição/uninstall nos 4 targets       | backend | P0         | S          | para implementar | 035, 037                            |
| 039 | Atualizar `commands/new:feature.md` — numeração considera `fix-*`            | backend | P1         | S          | para implementar | 035                                 |
| 040 | Atualizar `build:feature` (redireciona fix) + `build:all` (exclui fix tasks) | backend | P2         | S          | para implementar | 035, 037                            |
| 041 | Gate 8 (`new:fix`) + Gate 9 (`build:fix`) em `references/approval-gates.md`  | backend | P1         | S          | para implementar | 035, 037                            |
| 042 | Atualizar `SPEC.md` + `architecture.md` (ADR-012, artefatos, contagem)       | backend | P1         | M          | para implementar | 035, 037                            |
| 043 | README/INSTALL/CHANGELOG + bump `package.json` 0.10.0                        | backend | P0         | S          | para implementar | 035, 036, 037, 038, 039, 040, 041, 042 |
| 044 | Dogfood — `/ksdd:new:fix` num bug real do repo (contagem de commands)        | qa      | P1         | S          | para implementar | 043                                 |
| 045 | QA end-to-end — cenários A–O + 4 targets + edge cases                        | qa      | P0         | M          | para implementar | 044                                 |

---

## Ordem sugerida de execução

**Onda 1 (paralelizável):** 035, 036 — sem dependências. Criam o command principal e o template canônico.

**Onda 2:** 037 (depende de 035) — o segundo command, que herda o contrato de layout do `new:fix`.

**Onda 3 (paralelizável após 035/037):** 038, 039, 040, 041, 042 — wiring do instalador, integração com commands existentes, gates e artefatos KSDD. Podem rodar em paralelo se conflitos de PR forem gerenciados.

**Onda 4:** 043 — agrega docs + version bump (depende de todas as anteriores).

**Onda 5:** 044 — dogfooding (depende de 043).

**Onda 6:** 045 — QA end-to-end (depende de 044).

---

**Próximo passo:** `/ksdd:build:feature new-fix-command` para implementar task por task em ordem de dependência.
