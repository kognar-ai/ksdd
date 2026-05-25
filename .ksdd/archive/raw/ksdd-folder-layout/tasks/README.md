# Tasks — Feature: Consolidar artefatos KSDD em `.ksdd/`

**Feature:** docs/FEATURE-ksdd-folder-layout.md
**Total:** 10 tasks
**Prioridade:** P0: 9 · P1: 1 · P2: 0
**Estimativa total:** ~11-15 dias

| ID  | Título                                                                | Área     | Prioridade | Estimativa | Status            | Depende de                |
|-----|------------------------------------------------------------------------|----------|------------|------------|-------------------|---------------------------|
| 001 | Atualizar commands de spec-phase (start/spec/tech/design) para .ksdd/specs/ | backend  | P0         | M          | concluída         | —                         |
| 002 | Atualizar commands/new:feature.md para .ksdd/features/ + .ksdd/tasks/  | backend  | P0         | M          | concluída         | —                         |
| 003 | Atualizar commands/build:feature.md para .ksdd/tasks/.context/         | backend  | P0         | S          | concluída         | 002                       |
| 004 | Atualizar commands/build:all.md para .ksdd/build/BUILD-PLAN.md         | backend  | P0         | S          | concluída         | —                         |
| 005 | Atualizar commands/setup.md com novo layout + detecção de legados      | backend  | P0         | M          | concluída         | 001, 002                  |
| 006 | Atualizar templates em references/ com paths .ksdd/                    | backend  | P0         | M          | concluída         | —                         |
| 007 | Atualizar agents (critic/interviewer/setup-analyst) com novos paths    | backend  | P1         | S          | concluída         | —                         |
| 008 | Atualizar README/INSTALL/CHANGELOG + bump versão 0.6.0                 | backend  | P0         | S          | concluída         | 001, 002, 003, 004, 005, 006, 007 |
| 009 | Dogfood — migrar artefatos do próprio repo KSDD para .ksdd/specs/      | backend  | P0         | S          | concluída         | 008                       |
| 010 | QA end-to-end — validar fluxo em projeto vazio + projeto legado        | qa       | P0         | M          | concluída         | 009                       |

---

## Ordem sugerida de execução

**Onda 1 (paralelizável):** 001, 002, 004, 006, 007 — sem dependências internas, independentes entre si.

**Onda 2:** 003 (depende de 002), 005 (depende de 001 + 002).

**Onda 3:** 008 — agrega tudo (docs + version bump).

**Onda 4:** 009 — dogfooding do próprio repo.

**Onda 5:** 010 — QA validando o todo.

---

**Próximo passo:** `/ksdd:build:feature ksdd-folder-layout` para implementar task por task em ordem de dependência.
