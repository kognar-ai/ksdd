# Tasks — Feature: Health check de update ao rodar um command (uma vez por sessão)

**Feature:** .ksdd/features/FEATURE-update-health-check.md
**Total:** 5 tasks
**Prioridade:** P0: 3 · P1: 2 · P2: 0
**Estimativa total:** ~6-8 dias

| ID  | Título                                                                          | Área    | Prioridade | Estimativa | Status           | Depende de           |
|-----|----------------------------------------------------------------------------------|---------|------------|------------|------------------|----------------------|
| 056 | Criar `references/update-check.md` (procedimento canônico da checagem)           | backend | P0         | M          | em revisão       | —                    |
| 057 | Bloco de pré-flight nos 11 commands + ajustar `allowed-tools`                    | backend | P0         | M          | em revisão       | 056                  |
| 058 | Atualizar `SPEC.md` + `architecture.md` (ADR-014, env var, fluxo 13.5)           | backend | P1         | M          | em revisão       | 056, 057             |
| 059 | README/INSTALL/CHANGELOG + `ksdd help` + bump `package.json` 0.12.0              | backend | P0         | S          | para implementar | 056, 057, 058        |
| 060 | Dogfood + QA smoke test (1x/sessão, offline silencioso, opt-out, 5 targets)      | qa      | P1         | M          | para implementar | 056, 057, 058, 059   |

---

## Ordem sugerida de execução

**Onda 1:** 056 — o reference canônico; núcleo do qual tudo depende. Sem dependências.

**Onda 2:** 057 (depende de 056) — o gatilho nos 11 commands, referenciando o reference.

**Onda 3:** 058 (depende de 056, 057) — SPEC + architecture (ADR-014) documentando o que foi construído.

**Onda 4:** 059 (depende de 056–058) — agrega docs de usuário + version bump 0.12.0.

**Onda 5:** 060 (depende de todas) — dogfood + QA smoke test, com foco em zero regressão offline.

---

**Próximo passo:** `/ksdd:build:feature update-health-check` para implementar task por task em ordem de dependência.
