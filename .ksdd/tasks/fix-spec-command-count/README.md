# Tasks — Fix: Contagem de slash commands inconsistente

**Fix:** .ksdd/fixes/FIX-spec-command-count.md
**Total:** 1 task
**Prioridade:** P0: 0 · P1: 0 · P2: 1
**Estimativa total:** ~1 dia

| ID  | Título                                                        | Área | Prioridade | Estimativa | Status           | Depende de |
|-----|---------------------------------------------------------------|------|------------|------------|------------------|------------|
| 046 | Guarda de consistência da contagem de slash commands          | qa   | P2         | S          | para implementar | —          |

---

**Contexto:** a correção imediata (reconciliar a contagem para 11 nos artefatos em tempo
presente) foi aplicada **inline** na v0.11.0, junto da feature `new-fix-command`
(tasks 042/043 + `brainstorm.md §3`). Esta task 046 é a **guarda de regressão** — evita
que a contagem volte a divergir quando um novo command for adicionado.

**Próximo passo:** `/ksdd:build:fix spec-command-count` (ou aplicar a guarda manualmente).
