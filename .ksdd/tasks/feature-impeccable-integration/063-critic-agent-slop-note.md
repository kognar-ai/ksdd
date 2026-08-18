---
id: 063
title: (Opcional) Nota em agents/critic.md — regras de slop do impeccable complementam o checklist do DESIGN.md
status: para implementar
feature: impeccable-integration
area: backend
priority: P2
estimate: S
depends_on: [057]
feature_refs:
  - ".ksdd/features/FEATURE-impeccable-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-impeccable-integration.md#51-superfícies-modificadas"
spec_refs:
  - ".ksdd/specs/SPEC.md#8-componentes-globais-reutilizáveis"
arch_refs:
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
---

# 063 — Nota opcional no agente `critic`

## Objetivo
(Baixa prioridade) Citar, no checklist de qualidade do agente `critic`, que as regras anti-slop do impeccable complementam o checklist do `DESIGN.md` — reforço, sem tornar o impeccable obrigatório.

## Escopo
- Editar `agents/critic.md`: adicionar uma nota breve, condicional, de que — para artefatos de design — as 59 regras anti-slop do impeccable complementam o checklist do `DESIGN.md`, com pointer para `references/integrations/impeccable.md`.
- Manter opt-in: o critic **não** passa a depender do impeccable; é só uma referência complementar.

## Fora de escopo
- Reescrever o checklist do critic.
- Tornar as regras do impeccable parte obrigatória da validação.

## Critérios de aceitação
- [ ] `agents/critic.md` tem a nota condicional citando as regras anti-slop do impeccable como complemento, com pointer para o doc de integração.
- [ ] A nota é opt-in — o critic funciona idêntico para quem não usa impeccable.

## Notas técnicas
- Task **opcional** (P2). Pode ser cortada sem impacto nos critérios de aceite da feature.
- Conteúdo puro; nenhuma mudança em `bin/ksdd.js`.

## Riscos / dependências externas
- Nenhum. Se o doc de integração (057) descrever as regras, basta apontar.
