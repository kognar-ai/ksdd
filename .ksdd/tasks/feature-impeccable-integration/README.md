# Tasks — Feature: Integração KSDD ↔ impeccable.style (1ª integração / convenção de integrações)

**Feature:** .ksdd/features/FEATURE-impeccable-integration.md
**Total:** 9 tasks
**Prioridade:** P0: 5 · P1: 2 · P2: 1 · (QA P0 incluso)
**Estimativa total:** ~7-11 dias

| ID  | Título                                                                          | Área    | Prioridade | Estimativa | Status           | Depende de                 |
|-----|----------------------------------------------------------------------------------|---------|------------|------------|------------------|----------------------------|
| 056 | `references/integrations/README.md` (convenção de integrações)                   | backend | P0         | S          | em revisão      | —                          |
| 057 | `references/integrations/impeccable.md` (1ª integração — doc canônico)            | backend | P0         | M          | em revisão      | 056                        |
| 058 | `commands/design.md` — Step 7 (bloco impeccable) + passo 5.5 (`PRODUCT.md`)       | backend | P0         | M          | em revisão      | 057                        |
| 059 | `commands/build:feature.md` — §4.5 (craft) + §4.8/§6 (gate opcional slop)         | backend | P0         | S          | em revisão      | 057                        |
| 060 | `references/design-md-spec.md` — nota "## Interop com impeccable"                 | backend | P1         | S          | em revisão      | 057                        |
| 061 | ADR-014 em `architecture.md` + nota em `CLAUDE.md`                                | backend | P1         | S          | em revisão      | 056, 057                   |
| 062 | README "## Integrações" + CHANGELOG + bump `package.json` 0.12.0                  | backend | P0         | S          | em revisão      | 057, 058, 059, 060, 061    |
| 063 | (Opcional) nota em `agents/critic.md` — regras de slop complementam o `DESIGN.md` | backend | P2         | S          | em revisão      | 057                        |
| 064 | QA end-to-end — CLI intacto + distribuição 5 targets + `@google/design.md lint`   | qa      | P0         | M          | em revisão      | 062                        |

---

## Ordem sugerida de execução

**Onda 1:** 056 — semente da convenção (sem dependências; fundação de todas as outras).

**Onda 2:** 057 — doc canônico da 1ª integração (impeccable), o exemplo da convenção e a fonte citada por design/build/spec.

**Onda 3 (paralelizável após 057):** 058, 059, 060, 063 — superfícies do fluxo (design + build), nota de interop e a nota opcional do critic. 061 (ADR-014 + CLAUDE.md) também pode rodar em paralelo (depende de 056/057).

**Onda 4:** 062 — README + CHANGELOG + bump de versão (agrega tudo; depende das tasks de conteúdo).

**Onda 5:** 064 — QA end-to-end (depende de 062).

---

## Invariantes da feature (não quebrar)

- **Zero mudança em `bin/ksdd.js`** — a distribuição é 100% conteúdo via `copyDir` de `references/`. Nenhuma entrada em `COMMAND_FILES`, nenhuma função `install*`, **não** dispara o refator `installTarget` (ADR-012 intocado).
- **Sem dependência de código** — o KSDD nunca faz `require('impeccable')` nem entra em `package.json`; `engines.node` permanece `>=16`.
- **Tudo opt-in/condicional** — o fluxo KSDD roda ponta a ponta sem impeccable instalado, sem bloqueio.
- **Sem vendorizar conteúdo do impeccable** — só linkar/referenciar (fronteira AGPL-3.0 × Apache-2.0 limpa).
- **Build continua read-only sobre `DESIGN.md`** (Gate 6/7).

---

**Status:** feature buildada em 2026-08-18 — as 9 tasks estão `em revisão` num **único PR** (branch `claude/ksdd-impeccable-integration-ug1zlr`). QA em `QA-REPORT.md` (todos os gates verdes). Marque as tasks como `concluída` após o merge do PR.
