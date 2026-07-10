---
id: 061
title: SPEC.md — atualizar fluxos 13.3/13.4 e seção 11 (paralelismo, PR único, sync)
status: em revisão
feature: parallel-build-sync
area: backend
priority: P1
estimate: M
depends_on: [057, 058, 059]
feature_refs:
  - ".ksdd/features/FEATURE-parallel-build-sync.md#51-superfícies-modificadas"
  - ".ksdd/features/FEATURE-parallel-build-sync.md#4-fluxos-de-uso"
spec_refs:
  - ".ksdd/specs/SPEC.md#133-implementação-de-feature-isolada"
  - ".ksdd/specs/SPEC.md#134-build-completo-do-projeto"
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs:
  - ".ksdd/specs/architecture.md#44-superfície-de-slash-commands-distribuída"
---

# 061 — Dogfood: atualizar `SPEC.md`

## Objetivo
Manter o próprio SPEC.md do KSDD coerente com o novo comportamento de build — dogfood da regra de que os artefatos-contrato refletem o produto. Atualiza os fluxos de build e a seção de interações.

## Escopo
- **Fluxo 13.3 (Implementação de feature isolada)**: trocar "PR aberto (sem merge)" por task por **PR único ao final do build completo** (múltiplos com `--multi-pr`); mencionar execução paralela em worktrees + sync pós-build de docs derivados.
- **Fluxo 13.4 (Build completo do projeto)**: refletir paralelismo por ondas, 1 PR por feature, sync pós-build por feature.
- **Seção 11 (Interações e Comportamentos)**: adicionar bullets para: paralelismo máximo com fallback seguro; worktrees efêmeros; PR único por default; sync pós-build "só docs derivados" com drift sinalizado; artefatos-contrato read-only preservados.
- Ajustar qualquer contagem/menção que fique inconsistente (ex.: descrição do `build:feature` na seção 7.2, se citar PR por task).

## Fora de escopo
- Editar `architecture.md` — task 062.
- Alterar personas, telas (N/A) ou fases de entrega além de uma possível linha de status.

## Critérios de aceitação
- [ ] Fluxos 13.3 e 13.4 descrevem PR único (default) + paralelismo + sync pós-build.
- [ ] Seção 11 lista os novos comportamentos (paralelismo/worktrees/PR único/sync/read-only preservado).
- [ ] Nenhuma menção residual a "1 PR por task" como default no SPEC.
- [ ] Consistência com os commands finais (057-059) e gates (060).

## Notas técnicas
- SPEC.md é read-only **durante build**, mas esta é uma task de **feature** (edição deliberada do artefato pelo mantenedor via `/ksdd:new:feature`→`/ksdd:build:feature`) — permitido, é o dogfood.
- Edição cirúrgica (`str_replace`); preservar o resto do SPEC.
- Idioma conforme `references/language-policy.md`.

## Riscos / dependências externas
- Depende de 057/058/059 para o texto casar com o comportamento real dos commands.
