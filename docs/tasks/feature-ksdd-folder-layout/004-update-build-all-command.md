---
id: 004
title: Atualizar commands/build:all.md para .ksdd/build/BUILD-PLAN.md
status: para implementar
feature: ksdd-folder-layout
area: backend
priority: P0
estimate: S
depends_on: []
feature_refs:
  - "docs/FEATURE-ksdd-folder-layout.md#2-escopo"
  - "docs/FEATURE-ksdd-folder-layout.md#6-impacto-no-modelo-de-dados"
spec_refs:
  - "SPEC.md#42-artefatos-ksdd-gerados-pelos-commands-no-diretorio-do-projeto-alvo"
  - "SPEC.md#134-build-completo-do-projeto"
arch_refs: []
---

# 004 — Atualizar `commands/build:all.md` para novo layout

## Objetivo
Migrar geração do `BUILD-PLAN.md` para `.ksdd/build/`, com leitura backward-compatible do SPEC e fallback do legado na raiz.

## Escopo
- Editar `commands/build:all.md` para:
  - Ler SPEC de `.ksdd/specs/SPEC.md` com fallback raiz.
  - Gerar `.ksdd/build/BUILD-PLAN.md` (criar pasta com `mkdir -p .ksdd/build/`).
  - Orquestrar `/ksdd:new:feature` e `/ksdd:build:feature` invocando-os com paths novos.
  - Atualizar exemplos de path em todas as seções do prompt.
- Adicionar warning padronizado quando detectar `BUILD-PLAN.md` legado na raiz.
- Detectar conflito (ambos paths existem com conteúdos diferentes) e abortar.

## Fora de escopo
- Mudar fluxo de orquestração (decompose → checkpoint → execute).
- Mudar formato do BUILD-PLAN (template separado — task 006).

## Critérios de aceitação
- [ ] Lê SPEC primeiro de `.ksdd/specs/SPEC.md`, fallback `SPEC.md` raiz.
- [ ] Gera `BUILD-PLAN.md` em `.ksdd/build/BUILD-PLAN.md` (não na raiz).
- [ ] Warning amarelo padronizado quando detectar `BUILD-PLAN.md` legado raiz.
- [ ] Abort quando conflito (ambos paths existem com conteúdos diferentes).
- [ ] Exemplos de invocação de subcommands (`/ksdd:new:feature`, `/ksdd:build:feature`) mencionam paths novos.

## Notas técnicas
- BUILD-PLAN é o único artefato que ganha pasta dedicada (`build/`) apesar de ser único — mantém simetria com outras fases e abre espaço para futuros artefatos de build (logs, métricas).

## Riscos / dependências externas
- Nenhuma dependência interna a esta feature (paralelizável).
