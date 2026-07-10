---
id: 060
title: approval-gates — documentar checkpoint de sync pós-build e default de PR único (Gates 6 e 7)
status: para implementar
feature: parallel-build-sync
area: backend
priority: P1
estimate: S
depends_on: [057, 058, 059]
feature_refs:
  - ".ksdd/features/FEATURE-parallel-build-sync.md#43-fase-de-sincronização-de-docs-pós-build"
  - ".ksdd/features/FEATURE-parallel-build-sync.md#51-superfícies-modificadas"
spec_refs:
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs:
  - ".ksdd/specs/architecture.md#44-superfície-de-slash-commands-distribuída"
---

# 060 — Gates 6 e 7: sync pós-build + PR único

## Objetivo
Atualizar `references/approval-gates.md` para documentar o novo **checkpoint de sincronização pós-build** e o **default de PR único** nos gates de build (Gate 6 = `build:feature`, Gate 7 = `build:all`), mantendo o contrato de checkpoints coerente com os commands.

## Escopo
- **Gate 6 (`/ksdd:build:feature`)**: adicionar o checkpoint da **fase de sync pós-build** (aprovação do diff de docs derivados + lista de drift sinalizado antes de comitar) e registrar que o build completo abre **1 PR** por default (`--multi-pr` para múltiplos).
- **Gate 7 (`/ksdd:build:all`)**: refletir o mesmo — sync por feature + **1 PR por feature** por default; checkpoints por fase/feature preservados.
- Deixar explícito que a sync **não** afrouxa a regra read-only: SPEC/architecture/DESIGN/FEATURE seguem read-only (drift só sinalizado).

## Fora de escopo
- Gates 8 e 9 (fix) — não são afetados por esta feature.
- Mudar a numeração dos gates ou criar gate novo — reusar 6 e 7.

## Critérios de aceitação
- [ ] Gate 6 documenta o checkpoint de sync pós-build e o default de PR único + `--multi-pr`.
- [ ] Gate 7 documenta sync por feature + 1 PR por feature + checkpoints por fase preservados.
- [ ] Texto reforça que a sync só toca docs derivados; read-only preservado.
- [ ] Coerente com o texto final de `commands/build:feature.md` e `commands/build:all.md` (tasks 057-059).

## Notas técnicas
- Ler o estado atual de Gate 6/7 antes de editar (o arquivo já descreve "checkpoints por task" no Gate 6).
- Edição cirúrgica; preservar Gates 1-5, 8, 9.
- Idioma conforme `references/language-policy.md` (o reference é pt-BR técnico).

## Riscos / dependências externas
- Depende de 057/058/059 estarem estáveis para o texto dos gates casar com os commands.
