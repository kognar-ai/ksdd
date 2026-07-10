# Dogfood — feature parallel-build-sync (task 064)

**Data:** 2026-07-10
**Alvo:** o próprio repo `kognar-ai/ksdd`, branch `claude/ksdd-build-feature-enhance-4qq9kp`.
**Como:** a implementação **desta** feature foi conduzida com o próprio modelo que ela introduz (`references/parallel-build.md`) — o orquestrador aplicou ondas de paralelismo, teammates isolados, commits atômicos e (ao final) sync pós-build + PR único. É dogfood literal: a feature se construiu com suas próprias regras.

## Observações por pilar

### 1. Paralelismo em ondas (máximo de teammates)
- **Wave B:** 2 teammates concorrentes — `build:feature.md` (057+058) ‖ `build:all.md` (059) — arquivos disjuntos, ambos derivados de `references/parallel-build.md` (fonte única). Despachados na mesma mensagem.
- **Wave C:** 3 teammates concorrentes — `approval-gates.md` (060) ‖ `SPEC.md` (061) ‖ `architecture.md` (062) — arquivos disjuntos. Pico de paralelismo = 3, exatamente o que o grafo de dependências permite (ver README de tasks: as demais ondas são sequenciais por edição do mesmo arquivo ou por dependência dura).
- **Quem comita:** os teammates **editaram e retornaram**; nenhum rodou `git`. O orquestrador inspecionou cada diff e comitou sequencialmente após cada onda — exatamente o contrato de `parallel-build.md` §1.3 (evita contenção de index lock).

### 2. Worktrees vs. fallback
- Os teammates rodaram **in-place sobre arquivos disjuntos** (sem overlap previsto) — o caminho **seguro** do modelo (§4): quando não há overlap de arquivos, o isolamento por worktree não é necessário e o in-place é seguro. Como a orquestração deste dogfood atribuiu um arquivo distinto a cada teammate, o fallback in-place foi o comportamento correto e esperado — não houve conflito.
- O ciclo de vida literal de `git worktree` (§2) é exercitado quando duas tasks disputariam os mesmos arquivos; aqui isso foi evitado por design (partição por arquivo), que é a mesma decisão que o command instrui.

### 3. PR único ao final
- Todo o trabalho foi integrado numa **única branch de build** (`claude/ksdd-build-feature-enhance-4qq9kp`) com **commits atômicos por task** (056, 057+058, 059, 060, 061, 062, 063, 064, 065). **1 PR** aberto ao final agregando tudo — sem `--multi-pr`, conforme o pedido.

### 4. Sync pós-build (só docs derivados)
- Ao final: `README.md` (task 063), `CHANGELOG.md` (063) e `CLAUDE.md` (sync final) atualizados; `package.json` bumpado; `README.md` de tasks e `status:` das tasks sincronizados.
- **Artefatos-contrato:** `SPEC.md` e `architecture.md` foram editados **como tasks deliberadas** (061/062, o dogfood documental), **não** pela sync automática. `DESIGN.md` e `FEATURE-*.md` não foram tocados. A sync automática final restringiu-se a `CLAUDE.md` + tracking de tasks — honrando "só docs derivados".

## Métricas
- **Tasks:** 10 (056–065), todas implementadas em `em revisão` (aguardando merge — status `concluída` só pós-merge, por convenção).
- **Ondas paralelas reais:** 2 (Wave B: 2 teammates; Wave C: 3 teammates).
- **PRs:** 1 (único).
- **`bin/ksdd.js`:** 0 alterações (validado por `git diff` vazio + smoke test).
- **Distribuição:** `references/parallel-build.md` auto-bundlado nos 5 targets (smoke test).

## Limitações honestas
- O "build" foi orquestrado diretamente pelo agente (o command é um prompt Markdown que um agente executa) — não houve invocação de um binário `/ksdd:build:feature`. Isso é intrínseco ao produto (conteúdo distribuído, ADR-003/ADR-014).
- A validação de ponta-a-ponta num **projeto consumidor real** (com worktrees literais disputando arquivos e `gh pr create`) é o próximo passo de validação em campo — ver QA-REPORT.md cenários marcados como "design-guaranteed".
