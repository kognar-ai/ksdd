---
id: 016
title: Atualizar commands/build:all.md — ignorar slugs arquivados ao montar fila de features pendentes
status: em revisão
feature: archive-features
area: backend
priority: P0
estimate: S
depends_on: [011]
feature_refs:
  - ".ksdd/features/FEATURE-archive-features.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-archive-features.md#51-superfícies-modificadas"
spec_refs:
  - ".ksdd/specs/SPEC.md#72-slash-commands-claude-code"
  - ".ksdd/specs/SPEC.md#134-build-completo-do-projeto"
arch_refs: []
---

# 016 — Atualizar `commands/build:all.md` para ignorar features arquivadas

## Objetivo
Garantir que `/ksdd:build:all`, ao decompor fases de entrega do SPEC em features e montar `BUILD-PLAN.md`, ignore slugs presentes em `.ksdd/archive/raw/` (já entregues) — sem alarme falso de "feature pendente".

## Escopo
- Editar `commands/build:all.md` adicionando, na seção que calcula features pendentes (ou monta a fila / `BUILD-PLAN.md`):
  - Passo explícito: "Lista slugs em `.ksdd/archive/raw/*/` e exclua da fila de features pendentes a serem geradas."
  - Quando detectar feature do SPEC já arquivada, anotar na saída: `✓ [slug] (arquivada em [data])` apenas como informativo, sem entrar na fila.
- Adicionar nota no Checkpoint 1 (mapa mestre) do command: "Features marcadas como arquivadas aparecem como histórico no resumo; não entram no plano de execução."
- Tabela "Paths dos artefatos" do command (se existir) precisa mencionar `.ksdd/archive/raw/` como input opcional de leitura.

## Fora de escopo
- Outras integrações em `new:feature` (task 014) ou `build:feature` (task 015).
- Lógica de archive (task 011).
- Reativar features arquivadas (responsabilidade explícita do `--restore`, não do build:all).

## Critérios de aceitação
- [ ] `commands/build:all.md` instrui exclusão de slugs em `.ksdd/archive/raw/` ao gerar fila de features pendentes.
- [ ] Quando feature do SPEC está arquivada, command produz linha informativa (verde/dim) no resumo do Checkpoint 1.
- [ ] Tabela de paths (se existir) menciona `.ksdd/archive/raw/` como path de leitura.
- [ ] Idempotência: em projeto sem `.ksdd/archive/`, `build:all` continua funcionando sem warning indevido.
- [ ] Grep `grep -n "archive\|arquivad" commands/build:all.md` retorna ocorrências apenas nos blocos novos.

## Notas técnicas
- O command já usa `BUILD-PLAN.md` em `.ksdd/build/` (SPEC seção 4.2). Esta task só ajusta a lógica de seleção, não muda layout do BUILD-PLAN.
- Caso o SPEC liste features que correspondem 1:1 a slugs arquivados, o resumo do checkpoint deve sinalizar isso claramente para o usuário ter consciência.

## Riscos / dependências externas
- Mapping entre "feature do SPEC" e "slug arquivado" não é 1:1 trivial — o SPEC usa nomes em português; o slug é kebab-case. Documentar no command que a comparação é por slug (kebab-case do nome), não por nome textual exato. Aceitar falsos negativos como aceitáveis para v1.
