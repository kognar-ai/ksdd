---
id: 014
title: Atualizar commands/new:feature.md — detecção de slug arquivado + numeração de IDs considerando archive
status: para implementar
feature: archive-features
area: backend
priority: P0
estimate: M
depends_on: [011]
feature_refs:
  - ".ksdd/features/FEATURE-archive-features.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-archive-features.md#46-colisão-com-slug-arquivado-em-ksddnewfeature"
  - ".ksdd/features/FEATURE-archive-features.md#51-superfícies-modificadas"
spec_refs:
  - ".ksdd/specs/SPEC.md#72-slash-commands-claude-code"
arch_refs: []
---

# 014 — Atualizar `commands/new:feature.md` para detectar slug arquivado

## Objetivo
Adicionar ao `commands/new:feature.md` dois novos comportamentos: (1) detectar colisão com slug presente em `.ksdd/archive/raw/` e apresentar 3-way fork; (2) considerar IDs de tasks em `.ksdd/archive/raw/[slug]/tasks/` ao continuar numeração para evitar colisão.

## Escopo
- Editar `commands/new:feature.md` adicionando um bloco "Detecção de slug arquivado" antes da seção de leitura de artefatos (ou no início do fluxo após pré-requisitos).
- O bloco deve:
  - Verificar existência de `.ksdd/archive/raw/[slug]/` quando o argumento do command resolve para um slug.
  - Se existir, apresentar 3 opções via `ask_user_input_v0`: (a) escolher novo slug, (b) restaurar via `/ksdd:archive --restore [slug]`, (c) abortar.
  - Nunca prosseguir automaticamente — espera decisão explícita.
- Editar a seção de cálculo do "próximo ID de task" para considerar:
  - IDs em `.ksdd/tasks/feature-*/NNN-*.md`
  - IDs em `docs/tasks/feature-*/NNN-*.md` (legado)
  - **Novo:** IDs em `.ksdd/archive/raw/*/tasks/NNN-*.md`
- Adicionar referência cruzada para `/ksdd:archive` na seção "Iteração" do command (caso slug colida com arquivado).
- Atualizar tabela "Paths dos artefatos" do command para incluir `.ksdd/archive/raw/` como localização de leitura de IDs (não escrita).

## Fora de escopo
- Atualizar `commands/build:feature.md` (task 015).
- Atualizar `commands/build:all.md` (task 016).
- Criar `commands/archive.md` (task 011).
- Mover/restaurar features (responsabilidade do `/ksdd:archive`).

## Critérios de aceitação
- [ ] `commands/new:feature.md` contém bloco explícito "Detecção de slug arquivado" com 3-way fork.
- [ ] Command instrui verificação `ls .ksdd/archive/raw/[slug]/ 2>/dev/null` (ou equivalente Markdown-readable) antes de prosseguir.
- [ ] Command apresenta opções A/B/C via `ask_user_input_v0` ou estrutura equivalente.
- [ ] Bloco de numeração de IDs explicitamente lista os 3 paths a varrer (`.ksdd/tasks/`, `docs/tasks/`, `.ksdd/archive/raw/*/tasks/`).
- [ ] Tabela "Paths dos artefatos" tem coluna ou nota adicional sobre `.ksdd/archive/raw/` para detecção de colisão.
- [ ] Grep `grep -n "archive\|arquivad" commands/new:feature.md` retorna ocorrências apenas nos blocos novos (sem poluir o restante).
- [ ] Idempotência: rodar `/ksdd:new:feature [slug-novo]` em projeto sem `.ksdd/archive/` continua funcionando (path opcional, ausência não bloqueia).

## Notas técnicas
- Texto do command em pt-BR técnico, voz ativa (SPEC seção 3.5).
- Reaproveitar tom de detecção de fallback legado (já existente em `commands/new:feature.md` para `.ksdd/features/` vs `docs/`).
- Sequenciamento depende da task 011 estar com convenção definida (path `.ksdd/archive/raw/[slug]/` e command `/ksdd:archive --restore [slug]`).

## Riscos / dependências externas
- Texto ambíguo pode levar o agente a prosseguir mesmo quando deve abortar — testar com QA (task 019) num cenário de colisão.
- Mudança em paralelo com tasks 015 e 016 pode gerar conflito menor de revisão — agrupar no mesmo PR ou rebasear.
