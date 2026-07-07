---
id: 039
title: Atualizar commands/new:feature.md — numeração de IDs considera .ksdd/tasks/fix-*/
status: para implementar
feature: new-fix-command
area: backend
priority: P1
estimate: S
depends_on: [035]
feature_refs:
  - ".ksdd/features/FEATURE-new-fix-command.md#62-alterações-em-entidades-existentes"
  - ".ksdd/features/FEATURE-new-fix-command.md#51-superfícies-modificadas"
spec_refs:
  - ".ksdd/specs/SPEC.md#72-slash-commands-claude-code"
arch_refs:
  - ".ksdd/specs/architecture.md#3-modelo-de-dados-schemas"
---

# 039 — Numeração de IDs no `new:feature` considera fixes

## Objetivo
Atualizar `commands/new:feature.md` para que o cálculo do próximo ID de task varra também `.ksdd/tasks/fix-*/`, garantindo espaço global único de IDs entre feature tasks e fix tasks.

## Escopo
- Editar (via `str_replace` cirúrgico) a seção de "Numeração de tasks" de `commands/new:feature.md` para incluir um **quarto path** na varredura: `.ksdd/tasks/fix-*/NNN-*.md` (além de `.ksdd/tasks/feature-*/`, `docs/tasks/feature-*/` e `.ksdd/archive/raw/*/tasks/`).
- Ajustar o texto para "maior ID encontrado nos quatro paths combinados + 1".
- Adicionar nota curta sobre a fronteira de namespaces: features vivem em `.ksdd/features/` + `.ksdd/tasks/feature-*/`; fixes em `.ksdd/fixes/` + `.ksdd/tasks/fix-*/`. Bug ≠ feature.

## Fora de escopo
- Criar/alterar `new:fix` (task 035) ou `build:fix` (task 037).
- Alterar `build:feature`/`build:all` (task 040).
- Mover ou renomear tasks existentes.

## Critérios de aceitação
- [ ] Seção de numeração de `commands/new:feature.md` cita explicitamente `.ksdd/tasks/fix-*/` como fonte de IDs.
- [ ] Texto atualizado para "quatro paths combinados".
- [ ] Nota de fronteira de namespaces (feature vs fix) presente.
- [ ] Edição cirúrgica (`str_replace`) — resto do command inalterado.

## Notas técnicas
- Espelha exatamente o tratamento que a feature `archive-features` deu ao incluir `.ksdd/archive/raw/*/tasks/` na numeração (CHANGELOG `[0.7.0]`).
- O `new:fix` (task 035) já faz a varredura simétrica (inclui `feature-*`); esta task fecha o outro lado.

## Riscos / dependências externas
- Nenhuma. Mudança documental de baixo risco no prompt.
