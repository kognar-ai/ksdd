# Tasks — Feature: Build paralelo com worktrees, PR único ao final e sincronização de docs

**Feature:** .ksdd/features/FEATURE-parallel-build-sync.md
**Total:** 10 tasks
**Prioridade:** P0: 6 · P1: 4 · P2: 0
**Estimativa total:** ~15-18 dias

| ID  | Título                                                                            | Área    | Prioridade | Estimativa | Status           | Depende de              |
|-----|-----------------------------------------------------------------------------------|---------|------------|------------|------------------|-------------------------|
| 056 | Criar `references/parallel-build.md` (estratégia canônica)                        | backend | P0         | M          | em revisão      | —                       |
| 057 | `build:feature` — paralelismo + worktrees + fallback seguro                       | backend | P0         | L          | em revisão      | 056                     |
| 058 | `build:feature` — PR único ao final + fase de sync pós-build                      | backend | P0         | L          | em revisão      | 056, 057                |
| 059 | `build:all` — alinhar ao novo modelo                                              | backend | P0         | L          | em revisão      | 056, 057, 058           |
| 060 | `approval-gates` — Gates 6 e 7 (sync + PR único)                                  | backend | P1         | S          | em revisão      | 057, 058, 059           |
| 061 | Dogfood `SPEC.md` — fluxos 13.3/13.4 + seção 11                                   | backend | P1         | M          | em revisão      | 057, 058, 059           |
| 062 | Dogfood `architecture.md` — ADR-014 + riscos                                      | backend | P1         | M          | em revisão      | 057, 058, 059           |
| 063 | README/INSTALL/CHANGELOG + bump `package.json` 0.12.0                             | backend | P0         | S          | em revisão      | 056-062                 |
| 064 | Dogfood — rodar o novo `build:feature` num alvo real                             | qa      | P1         | M          | em revisão      | 063                     |
| 065 | QA end-to-end — paralelo, fallback, PR único vs `--multi-pr`, sync, drift, read-only | qa   | P0         | M          | em revisão      | 064                     |

---

## Ordem sugerida de execução

**Onda 1:** `056` — fonte canônica (`references/parallel-build.md`). Sem dependências. Habilita todo o resto.

**Onda 2:** `057` — paralelismo + worktrees no `build:feature` (depende de 056).

**Onda 3:** `058` — PR único + sync pós-build no `build:feature` (mesmo arquivo que 057, por isso **sequencial** após ele).

**Onda 4:** `059` — alinhar `build:all` ao modelo já estável do `build:feature`.

**Onda 5 (paralelizável — dogfood do próprio tema):** `060`, `061`, `062` — gates, SPEC e architecture. Arquivos distintos, sem overlap → podem rodar como teammates em paralelo (cada um no seu worktree), exatamente o padrão que esta feature introduz.

**Onda 6:** `063` — docs + CHANGELOG + bump 0.12.0 (depende de todo o conteúdo 056-062).

**Onda 7:** `064` — dogfood do fluxo ponta-a-ponta.

**Onda 8:** `065` — QA end-to-end (matriz completa de cenários A-L).

---

## Notas de escopo (decisões aprovadas)

- **Sync "só docs derivados":** a fase pós-build atualiza `README.md`, `CLAUDE.md`/`AGENTS.md`, `CHANGELOG`, `status`/README de tasks. **Nunca** edita SPEC/architecture/DESIGN/FEATURE — só **sinaliza drift**.
- **`build:all` alinhado:** herda paralelismo + worktrees + PR único (por feature) + sync, mantendo checkpoints por fase.
- **Paralelismo com fallback seguro:** máximo de teammates paralelos para tasks independentes (sem `depends_on` mútuo, sem overlap de arquivos); worktree negado ou overlap ⇒ sequencial in-place.
- **PR único default:** 1 PR ao final do build completo; `--multi-pr` para o comportamento antigo (1 por task).
- **Zero `bin/ksdd.js`:** só conteúdo Markdown; `references/parallel-build.md` é auto-bundlado pelo `copyDir` de `references/`.

---
**Status:** feature **implementada** — as 10 tasks (056–065) estão em `em revisão` na branch `claude/ksdd-build-feature-enhance-4qq9kp`, agregadas num **PR único** aguardando review humano. Após o merge, mude os `status:` para `concluída` (e considere `/ksdd:archive parallel-build-sync`).
