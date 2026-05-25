# Tasks — Feature: Arquivar features implementadas com `/ksdd:archive`

**Feature:** .ksdd/features/FEATURE-archive-features.md
**Total:** 9 tasks
**Prioridade:** P0: 9 · P1: 0 · P2: 0
**Estimativa total:** ~10-13 dias

| ID  | Título                                                                       | Área    | Prioridade | Estimativa | Status            | Depende de                  |
|-----|-------------------------------------------------------------------------------|---------|------------|------------|-------------------|-----------------------------|
| 011 | Criar `commands/archive.md` (slug, lista, --all-eligible, --restore, --dry-run) | backend | P0         | M          | em revisão       | —                           |
| 012 | Criar `references/archive-template.md`                                        | backend | P0         | S          | em revisão       | —                           |
| 013 | Verificar `bin/ksdd.js` distribui archive.md + archive-template.md            | backend | P0         | S          | em revisão       | 011, 012                    |
| 014 | Atualizar `commands/new:feature.md` — detecção de slug arquivado + IDs        | backend | P0         | M          | em revisão       | 011                         |
| 015 | Atualizar `commands/build:feature.md` — detecção de slug arquivado            | backend | P0         | S          | em revisão       | 011                         |
| 016 | Atualizar `commands/build:all.md` — ignorar slugs arquivados                  | backend | P0         | S          | em revisão       | 011                         |
| 017 | Atualizar README/INSTALL/CHANGELOG + bump 0.7.0                               | backend | P0         | S          | em revisão       | 011, 012, 013, 014, 015, 016 |
| 018 | Dogfood — arquivar `ksdd-folder-layout` no próprio repo                       | backend | P0         | S          | em revisão       | 017                         |
| 019 | QA end-to-end — 15 cenários (A–O) cobrindo modos + edge cases + integrações  | qa      | P0         | M          | em revisão       | 018                         |

---

## Ordem sugerida de execução

**Onda 1 (paralelizável):** 011, 012 — sem dependências internas. Criam o command e o template canônico.

**Onda 2:** 013 (depende de 011, 012) — verifica/ajusta instalador.

**Onda 3 (paralelizável após 011):** 014, 015, 016 — integrações em `new:feature`, `build:feature`, `build:all`. Podem rodar em paralelo se conflitos de PR forem gerenciados.

**Onda 4:** 017 — agrega docs + version bump (depende de todas as anteriores).

**Onda 5:** 018 — dogfooding (depende de 017).

**Onda 6:** 019 — QA end-to-end (depende de 018).

---

**Próximo passo:** `/ksdd:build:feature archive-features` para implementar task por task em ordem de dependência.
