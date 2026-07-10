---
id: 058
title: build:feature — PR único ao final + fase de sincronização de docs pós-build
status: em revisão
feature: parallel-build-sync
area: backend
priority: P0
estimate: L
depends_on: [056, 057]
feature_refs:
  - ".ksdd/features/FEATURE-parallel-build-sync.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-parallel-build-sync.md#43-fase-de-sincronização-de-docs-pós-build"
  - ".ksdd/features/FEATURE-parallel-build-sync.md#44-múltiplos-prs-sob-pedido"
  - ".ksdd/features/FEATURE-parallel-build-sync.md#83-mensagens-canônicas-texto"
spec_refs:
  - ".ksdd/specs/SPEC.md#133-implementação-de-feature-isolada"
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs:
  - ".ksdd/specs/architecture.md#44-superfície-de-slash-commands-distribuída"
---

# 058 — `build:feature`: PR único + sync pós-build

## Objetivo
Trocar o modelo de "um PR por task" por **um único PR ao final do build completo** (múltiplos só com `--multi-pr`) e adicionar a **fase de sincronização de docs pós-build** que atualiza apenas docs derivados e sinaliza drift dos artefatos read-only.

## Escopo
- Reescrever a **seção 9** ("Abrir PR") de `commands/build:feature.md`:
  - Build completo (`--all` ou slug) → **1 PR** agregando todos os commits atômicos da branch de build ao final.
  - Flag **`--multi-pr`** (ou pedido explícito) → 1 PR por task (comportamento antigo).
  - Build de task única → 1 PR daquela task (inalterado).
  - Atualizar o `argument-hint` do frontmatter para incluir `--multi-pr`.
- Adicionar **nova seção "Sincronização de artefatos e docs (pós-build)"** antes do PR (referenciando `references/parallel-build.md`):
  - Roda após todas as ondas concluídas, com **checkpoint de aprovação** antes de comitar.
  - Atualiza (se existirem): `README.md`, `CLAUDE.md`/`AGENTS.md`, `CHANGELOG.md`, `status` das tasks e `README.md` de tasks — edição cirúrgica.
  - **Sinaliza drift** de SPEC/architecture/DESIGN/FEATURE (mensagem amarela canônica) **sem editá-los**.
  - Comita a sync na branch de build (entra no PR único).
  - Doc ausente → pula aquele doc, informa o usuário.
- Ajustar a nota **"Artefatos são read-only durante build"**: deixar claro que a sync pós-build só toca **docs derivados** e que SPEC/architecture/DESIGN/FEATURE seguem read-only (drift só sinalizado).
- Atualizar o **checkpoint final** (seção 10) para reportar: ondas de paralelismo, 1 PR (ou N com `--multi-pr`), docs sincronizados, drift sinalizado.

## Fora de escopo
- Paralelismo/worktrees — task 057 (já feita; esta assume a branch de build criada lá).
- `commands/build:all.md` — task 059.
- Editar SPEC/architecture/DESIGN/FEATURE automaticamente — proibido por design (só sinaliza).

## Critérios de aceitação
- [ ] Build completo abre **exatamente 1 PR** por default; `--multi-pr` reproduz 1 PR por task; task única = 1 PR.
- [ ] `argument-hint` inclui `--multi-pr`.
- [ ] Fase de sync atualiza `README.md`/`CLAUDE.md`/`AGENTS.md`/`CHANGELOG`/status+README de tasks quando existem, e **sinaliza drift** dos read-only sem editá-los.
- [ ] A fase de sync tem **checkpoint de aprovação** antes de comitar.
- [ ] Nota "read-only durante build" ajustada para a exceção de docs derivados; SPEC/architecture/DESIGN/FEATURE continuam read-only.
- [ ] Doc derivado ausente é tratado graciosamente (pula + informa).
- [ ] Checkpoint final reporta ondas, PR(s), sync e drift.

## Notas técnicas
- A sync entra **na mesma branch de build** e portanto no PR único — não abre PR separado por default.
- Edição cirúrgica (`str_replace`) no command; preservar seções 0-8 já ajustadas pela 057.
- Coerência com `references/approval-gates.md` (task 060 documenta o gate correspondente).
- Idioma conforme `references/language-policy.md`.

## Riscos / dependências externas
- Depende de 057 (branch de build + fluxo de execução) e 056 (reference).
- Fase de sync tocar read-only por engano — mitigado pela regra dura + checkpoint + QA (task 065).
- PR único grande demais — mitigado por commits atômicos + `--multi-pr`.
