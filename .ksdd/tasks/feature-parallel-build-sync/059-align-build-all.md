---
id: 059
title: build:all — alinhar ao novo modelo (paralelismo, worktrees, PR único, sync)
status: em revisão
feature: parallel-build-sync
area: backend
priority: P0
estimate: L
depends_on: [056, 057, 058]
feature_refs:
  - ".ksdd/features/FEATURE-parallel-build-sync.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-parallel-build-sync.md#45-ksddbuildall-alinhado"
  - ".ksdd/features/FEATURE-parallel-build-sync.md#51-superfícies-modificadas"
spec_refs:
  - ".ksdd/specs/SPEC.md#134-build-completo-do-projeto"
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs:
  - ".ksdd/specs/architecture.md#44-superfície-de-slash-commands-distribuída"
---

# 059 — `build:all`: alinhar ao novo modelo

## Objetivo
Estender o novo modelo (paralelismo + worktrees + PR único + sync pós-build) ao `commands/build:all.md`, que hoje replica o fluxo antigo (PR por task, sequencial). Resolve a contradição entre os dois commands, mantendo os checkpoints por fase/feature do `build:all`.

## Escopo
- Atualizar `commands/build:all.md`:
  - **Seção B.4** ("Implementar tasks da feature"): delegar ao **mesmo modelo** do `build:feature` (execução por ondas paralelas em worktrees; commit atômico por task; sync pós-build por feature; **1 PR por feature** por default; `--multi-pr` = 1 PR por task).
  - **Seção "Paralelismo entre features"**: reconciliar com a nova capacidade — a v1 paraleliza **tasks dentro de uma feature**; features inteiras entre si seguem a regra conservadora ("se em dúvida, sequencial"), agora com worktrees disponíveis quando fizer sentido.
  - **Seção "Artefatos são read-only"**: alinhar com a exceção de docs derivados (idêntica à do `build:feature`).
  - **Seção B.5 (checkpoint pós-feature)** e **B.7 (BUILD-PLAN)**: refletir "1 PR por feature" e a sync executada.
  - Referenciar `references/parallel-build.md` (fonte única) em vez de duplicar prosa.
  - Atualizar `argument-hint` se necessário para `--multi-pr`.
- Preservar **todos os checkpoints por fase/feature** existentes (A.6 plano, B.3 por feature, B.6 por fase, C.2 final).

## Fora de escopo
- Paralelizar features inteiras entre si de forma agressiva (fica pra depois — FEATURE §2.2).
- Mudanças no `build:feature` (tasks 057/058) — aqui só o `build:all`.

## Critérios de aceitação
- [ ] `build:all` delega a execução de cada feature ao modelo do `build:feature` (paralelismo + worktrees + fallback).
- [ ] Default de **1 PR por feature**; `--multi-pr` mantém 1 PR por task.
- [ ] Sync pós-build roda ao concluir cada feature (docs derivados; drift sinalizado).
- [ ] Checkpoints por fase/feature preservados (A.6, B.3, B.5, B.6, C.2).
- [ ] Nota read-only alinhada à exceção de docs derivados.
- [ ] Referencia `references/parallel-build.md`; sem duplicação de prosa vs `build:feature`.

## Notas técnicas
- `build:all` já tem uma subseção "Paralelismo entre features" conservadora e uma nota read-only — esta task ajusta ambas, não recria do zero.
- Edição cirúrgica (`str_replace`); preservar Fase A (planejamento) e a numeração global de tasks.
- Coerência de contagem/fluxo com a atualização de SPEC/architecture (tasks 061/062) e gates (060).

## Riscos / dependências externas
- Depende de 057/058 (o modelo do `build:feature` precisa estar definido para o `build:all` espelhá-lo) e 056 (reference).
- Risco de divergência futura entre os dois commands — mitigado pela fonte única em `references/parallel-build.md`.
