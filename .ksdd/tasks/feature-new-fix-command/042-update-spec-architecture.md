---
id: 042
title: Atualizar SPEC.md e architecture.md (ADR-012 .ksdd/fixes/, artefatos, superfícies, roadmap, contagem)
status: para implementar
feature: new-fix-command
area: backend
priority: P1
estimate: M
depends_on: [035, 037]
feature_refs:
  - ".ksdd/features/FEATURE-new-fix-command.md#6-impacto-no-modelo-de-dados"
  - ".ksdd/features/FEATURE-new-fix-command.md#7-impacto-na-api"
spec_refs:
  - ".ksdd/specs/SPEC.md#42-artefatos-ksdd-gerados-pelos-commands-no-diretório-do-projeto-alvo"
  - ".ksdd/specs/SPEC.md#72-slash-commands-claude-code"
arch_refs:
  - ".ksdd/specs/architecture.md#3-modelo-de-dados-schemas"
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
  - ".ksdd/specs/architecture.md#12-roadmap-de-implementação"
---

# 042 — Atualizar SPEC e architecture

## Objetivo
Refletir a nova classe de artefato `.ksdd/fixes/` e os dois commands nos artefatos KSDD do próprio repo: SPEC (produto) e architecture (decisão + roadmap).

## Escopo — SPEC.md (`.ksdd/specs/SPEC.md`)
- **Seção 7.2** (slash commands Claude): adicionar `ksdd:new:fix` e `ksdd:build:fix` à lista.
- **Seção 4.2** (artefatos KSDD): adicionar linhas para `FIX-[slug].md` (`.ksdd/fixes/`, gerado por `/ksdd:new:fix`) e tasks `.ksdd/tasks/fix-[slug]/`.
- **Seção 4.4** (diagrama de relações): adicionar `.ksdd/fixes/FIX-[slug].md` consumido por `build:fix`.
- **Seções 7.3/7.4/7.5** (Codex/opencode/Antigravity): mencionar os basenames `ksdd-new-fix`/`ksdd-build-fix` na contagem/lista, se as seções enumeram commands.
- **Reconciliar a contagem de commands** — o SPEC hoje diz "8 slash commands" (seções 1.2/7.2) e "9 commands" (seções Antigravity). Após esta feature são **11**. Uniformizar para 11 (este é, inclusive, o bug candidato do dogfood — task 044).
- **Seção 13** (fluxos críticos): opcional — adicionar um fluxo "Correção de bug isolada" (new:fix → build:fix) espelhando 13.3.
- **Seção 14** (fases de entrega): registrar a entrega dos commands de fix.

## Escopo — architecture.md (`.ksdd/specs/architecture.md`)
- **Nova ADR-012** — `.ksdd/fixes/` como classe de artefato paralela a `.ksdd/features/`; `new:fix`/`build:fix` como commands de conteúdo (2 entradas em `COMMAND_FILES`, sem função `install*` nova → **não** dispara o refator ADR-010/011). Registrar a decisão do fix inline opcional + gate de regressão obrigatório.
- **Seção 3** (schemas): documentar `fix: [slug]` como contexto de frontmatter de task e `fix_refs`.
- **Seção 4** (CLI surface): adicionar os 2 slash commands.
- **Seção 12** (roadmap): marcar a entrega; registrar "arquivar fixes" como item futuro.

## Fora de escopo
- README/INSTALL/CHANGELOG/package.json (task 043).
- Gates (task 041).
- Criar os commands (tasks 035, 037).

## Critérios de aceitação
- [ ] SPEC 7.2 lista `ksdd:new:fix` e `ksdd:build:fix`.
- [ ] SPEC 4.2 e 4.4 incluem `.ksdd/fixes/FIX-[slug].md` e `.ksdd/tasks/fix-[slug]/`.
- [ ] Contagem de commands reconciliada para 11 em todas as ocorrências.
- [ ] architecture tem ADR-012 registrando `.ksdd/fixes/` + decisão de não disparar refator ADR-010/011.
- [ ] architecture seção 3 documenta `fix:`/`fix_refs`; seção 4 lista os commands; roadmap atualizado.
- [ ] Edições cirúrgicas (`str_replace`) preservando o resto dos documentos.

## Notas técnicas
- Precedente: tasks 031/032 da feature `antigravity-integration` (ADR-011 + SPEC) e a atualização de SPEC 4.2 na `archive-features`.
- Estes artefatos são read-only durante `build:feature`/`build:fix` de OUTRAS features — mas atualizá-los para documentar ESTA feature é trabalho legítimo desta task (não é build de outra feature).

## Riscos / dependências externas
- A contagem "11 commands" precisa ficar consistente com o README (task 043) — sincronizar as duas tasks.
