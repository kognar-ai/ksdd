---
id: 057
title: build:feature — execução com máximo de paralelismo + worktrees + fallback seguro
status: para implementar
feature: parallel-build-sync
area: backend
priority: P0
estimate: L
depends_on: [056]
feature_refs:
  - ".ksdd/features/FEATURE-parallel-build-sync.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-parallel-build-sync.md#41-build-completo-paralelo-com-pr-único-fluxo-principal"
  - ".ksdd/features/FEATURE-parallel-build-sync.md#42-fallback-sequencial-worktree-negado-ou-overlap-de-arquivos"
spec_refs:
  - ".ksdd/specs/SPEC.md#133-implementação-de-feature-isolada"
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs:
  - ".ksdd/specs/architecture.md#44-superfície-de-slash-commands-distribuída"
---

# 057 — `build:feature`: paralelismo + worktrees + fallback

## Objetivo
Reescrever a execução do `commands/build:feature.md` para despachar o **máximo de teammates em paralelo** (um por task independente), cada um isolado em um **git worktree**, com **fallback seguro** para sequencial in-place. É o coração da feature no lado da execução.

## Escopo
- Reescrever a **seção 5** ("Executar implementação via teammates") de `commands/build:feature.md`:
  - Calcular **ondas de execução**: dentro de uma onda, tasks sem `depends_on` mútuo e sem overlap de arquivos previsto; entre ondas, respeitar dependências.
  - Despachar **um teammate por task em paralelo** (todas as chamadas de agente na mesma mensagem), cada um com context.md e critérios de aceite **isolados** (contrato dispatching-parallel-agents).
  - Manter o roteamento por área (backend/frontend/infra/qa) já existente.
- Adicionar **seção de worktrees** (referenciando `references/parallel-build.md`, task 056):
  - Detectar isolamento existente antes de criar (nunca aninhar).
  - `git worktree add <path> -b feature/[slug]/NNN-[task-slug]`; verificar git-ignore do dir.
  - `git worktree remove` ao concluir/integrar cada task.
  - Criar a **branch de build** da feature (base do PR único da task 058) a partir do default branch.
- Adicionar **fluxo de fallback**: se `git worktree add` for negado (sandbox) **ou** duas tasks da onda tocarem os mesmos arquivos, cair para **sequencial in-place** na branch de build, com aviso amarelo (mensagem canônica da FEATURE §8.3).
- Ajustar o bloco `--all` (seção "Quando implementar --all") para operar por ondas paralelas em vez de estritamente task-por-task com checkpoint entre cada.
- Referenciar `references/parallel-build.md` em vez de duplicar a prosa do modelo.

## Fora de escopo
- PR único e fase de sync pós-build — task 058 (mesmo arquivo, sequencial após esta).
- `commands/build:all.md` — task 059.
- Preservar quality gates **por task** exatamente como hoje (rodam antes da integração de cada task) — não afrouxar.

## Critérios de aceitação
- [ ] Seção 5 instrui despacho paralelo (várias chamadas de agente na mesma mensagem) para tasks independentes, citando o contrato do skill dispatching-parallel-agents.
- [ ] Worktree isolado por teammate paralelo documentado (add/detect/git-ignore/remove), citando o skill using-git-worktrees e `references/parallel-build.md`.
- [ ] Fallback seguro (worktree negado OU overlap de arquivos ⇒ sequencial in-place) presente, com a mensagem amarela canônica.
- [ ] Quality gates por task permanecem obrigatórios antes da integração de cada task.
- [ ] `--all` opera por ondas; dependências (`depends_on`) e prioridade continuam respeitadas.
- [ ] Nenhuma duplicação de prosa que já vive em `references/parallel-build.md` — usa referência.

## Notas técnicas
- Manter compatibilidade com o argumento de **task única** (ID/slug isolado): esse caso não paraleliza (uma task só) — o paralelismo é a semântica do build de múltiplas tasks.
- Preservar o restante do fluxo (pre-flight §0, detecção de arquivado §0.5, resolução de task §1, issue §2, context.md §4).
- Idioma conforme `references/language-policy.md`.
- Edição cirúrgica (`str_replace`) — não reescrever o arquivo inteiro; preservar seções não afetadas.

## Riscos / dependências externas
- Depende de 056 (o reference precisa existir para ser citado).
- Conflito de merge entre teammates ao integrar — mitigado por só paralelizar tasks sem overlap de arquivos previsto.
