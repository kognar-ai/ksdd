---
id: 060
title: Adicionar nota "## Interop com impeccable" em references/design-md-spec.md
status: para implementar
feature: impeccable-integration
area: backend
priority: P1
estimate: S
depends_on: [057]
feature_refs:
  - ".ksdd/features/FEATURE-impeccable-integration.md#81-contrato-de-interoperabilidade"
  - ".ksdd/features/FEATURE-impeccable-integration.md#51-superfícies-modificadas"
spec_refs:
  - ".ksdd/specs/SPEC.md#14-referência-principal"
arch_refs:
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
---

# 060 — Nota de interop em `references/design-md-spec.md`

## Objetivo
Documentar, no artefato que define o `DESIGN.md`, o contrato de interoperabilidade com o impeccable — reforçando que é o mesmo formato Google Stitch e apontando para o doc de integração.

## Escopo
Editar `references/design-md-spec.md`:
- Adicionar uma seção curta "## Interop com impeccable": mesmo formato Google Stitch (ADR-008); **passar `npx @google/design.md lint` é a garantia de compat**; pointer para `references/integrations/impeccable.md` + menção ao path bridge (`.ksdd/specs/` ↔ raiz).
- Manter a nota concisa (não duplicar o doc de integração — só o contrato + pointer).

## Fora de escopo
- Alterar a especificação do formato `DESIGN.md`.
- Repetir o conteúdo do doc de integração (path bridge detalhado, mapeamento PRODUCT.md).

## Critérios de aceitação
- [ ] `references/design-md-spec.md` tem a seção "## Interop com impeccable".
- [ ] A seção cita "mesmo Google Stitch" + "`@google/design.md lint` = compat" + pointer para `references/integrations/impeccable.md` + path bridge.
- [ ] É concisa e não duplica o doc de integração.

## Notas técnicas
- Conteúdo puro; nenhuma mudança em `bin/ksdd.js`.
- Alinha com o risco já mapeado em `architecture.md` seção 11 ("Google Stitch evolui o formato quebrantemente") — o lint é o contrato versionável.

## Riscos / dependências externas
- Depende do doc de integração (057) para o pointer. Baixo risco.
