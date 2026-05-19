---
id: 001
title: Atualizar commands de spec-phase (start/spec/tech/design) para .ksdd/specs/
status: para implementar
feature: ksdd-folder-layout
area: backend
priority: P0
estimate: M
depends_on: []
feature_refs:
  - "docs/FEATURE-ksdd-folder-layout.md#2-escopo"
  - "docs/FEATURE-ksdd-folder-layout.md#41-projeto-novo-fluxo-completo-com-novo-layout"
  - "docs/FEATURE-ksdd-folder-layout.md#42-projeto-legado-leitura-backward-compatible"
spec_refs:
  - "SPEC.md#42-artefatos-ksdd-gerados-pelos-commands-no-diretorio-do-projeto-alvo"
  - "SPEC.md#72-slash-commands-claude-code"
arch_refs:
  - "architecture.md#1-visão-geral-da-arquitetura"
---

# 001 — Atualizar commands de spec-phase para `.ksdd/specs/`

## Objetivo
Alinhar os 4 commands da fase de especificação (`start`, `spec`, `tech`, `design`) ao novo layout: escrever artefatos em `.ksdd/specs/` e implementar leitura backward-compatible do path legado na raiz.

## Escopo
- Editar `commands/start.md`: gerar `.ksdd/specs/brainstorm.md` (criar diretório se não existir).
- Editar `commands/spec.md`: ler brainstorm com fallback (`.ksdd/specs/brainstorm.md` → `brainstorm.md` raiz); gerar `.ksdd/specs/SPEC.md`.
- Editar `commands/tech.md`: ler SPEC/brainstorm com fallback; gerar `.ksdd/specs/architecture.md`.
- Editar `commands/design.md`: ler SPEC + architecture com fallback; gerar `.ksdd/specs/DESIGN.md`.
- Adicionar instrução padrão de warning amarelo quando detectar artefato legado (formato definido na FEATURE seção 8.3).
- Adicionar instrução de erro bloqueante quando legado E novo coexistem com conteúdos diferentes.

## Fora de escopo
- Implementar `ksdd migrate` (fora da v1 — FEATURE seção 2.2).
- Mudar formato interno de qualquer artefato.
- Mudar `commands/new:feature.md`, `commands/build:*.md`, `commands/setup.md` (outras tasks).

## Critérios de aceitação
- [ ] `commands/start.md` instrui criação em `.ksdd/specs/brainstorm.md` com `mkdir -p .ksdd/specs/` antes do `create_file`.
- [ ] `commands/spec.md` lê primeiro `.ksdd/specs/brainstorm.md`, faz fallback para `brainstorm.md` raiz, e gera em `.ksdd/specs/SPEC.md`.
- [ ] `commands/tech.md` faz fallback de leitura idêntico e escreve em `.ksdd/specs/architecture.md`.
- [ ] `commands/design.md` faz fallback de leitura idêntico e escreve em `.ksdd/specs/DESIGN.md`.
- [ ] Cada command tem bloco padronizado: "Se detectar artefato legado, emita warning amarelo: '<formato definido na FEATURE 8.3>'".
- [ ] Cada command tem bloco padronizado: "Se `.ksdd/specs/X.md` e `X.md` raiz coexistem com conteúdos diferentes, aborte com erro pedindo resolução manual".
- [ ] Grep `grep -n "view SPEC.md\|view brainstorm.md\|create_file SPEC.md\|create_file brainstorm.md" commands/{start,spec,tech,design}.md` só retorna em blocos de fallback/legado.

## Notas técnicas
- Os commands são prompts em Markdown lidos por Claude/Codex — não tem código executável. A "implementação" é redigir bem os passos.
- Convenção de fallback descrita na FEATURE seção 4.2 (fluxo legado).
- Manter consistência de tom: pt-BR técnico, voz ativa (SPEC seção 3.5).

## Riscos / dependências externas
- Dessincronização entre os 4 commands se editados em momentos diferentes. Mitigar: revisar todos no mesmo PR antes de commitar.
- Linguagem de fallback precisa ser inequívoca para o agente seguir corretamente; testar com um caso real em projeto vazio (cobre task 010).
