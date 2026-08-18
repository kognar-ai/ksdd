---
id: 059
title: Atualizar commands/build:feature.md — §4.5 (craft) + §4.8/§6 (gate opcional slop detector)
status: para implementar
feature: impeccable-integration
area: backend
priority: P0
estimate: S
depends_on: [057]
feature_refs:
  - ".ksdd/features/FEATURE-impeccable-integration.md#42-craftqa-durante-o-ksddbuildfeature"
  - ".ksdd/features/FEATURE-impeccable-integration.md#51-superfícies-modificadas"
  - ".ksdd/features/FEATURE-impeccable-integration.md#83-slop-detector-como-gate-textoreceita"
spec_refs:
  - ".ksdd/specs/SPEC.md#133-implementação-de-feature-isolada"
arch_refs:
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
---

# 059 — Craft/QA impeccable no `/ksdd:build:feature`

## Objetivo
Expor a camada de craft/QA do impeccable no build, onde a UI vira código: orientação condicional no bloco de design/frontend e um gate opcional de UI nos quality gates — sem alterar o comportamento read-only do build sobre `DESIGN.md`.

## Escopo
Editar `commands/build:feature.md`:
- **§4.5 "Bloco Design"** (`area: frontend/design`): adicionar orientação condicional — "se o impeccable estiver disponível, rode `/impeccable shape|critique` **antes** e `/impeccable audit|polish` **depois** nas tasks de UI" (pointer para `references/integrations/impeccable.md`).
- **§4.8 + §6 (quality gates):** adicionar um gate **opcional** de UI — "Slop detector (impeccable): `npx impeccable detect <ui-paths>`". Explicitamente **opt-in**, **não** obrigatório: se o impeccable não está instalado, o gate é pulado silenciosamente e **não** bloqueia o build.
- Deixar claro que o build continua **read-only sobre `DESIGN.md`** (Gate 6/7) — o impeccable atua no código, não nos artefatos KSDD.

## Fora de escopo
- Tornar o gate obrigatório/bloqueante.
- Adicionar detecção rígida do impeccable ou mudança em `bin/ksdd.js`.
- Alterar os quality gates existentes (build, testes, lint, E2E, code review, security) — o gate novo é adicional e opcional.

## Critérios de aceitação
- [ ] §4.5 tem a orientação condicional `/impeccable shape|critique` (antes) e `/impeccable audit|polish` (depois) para tasks de UI, com pointer para o doc de integração.
- [ ] §4.8 e §6 têm o gate opcional "Slop detector (impeccable): `npx impeccable detect <ui-paths>`", marcado como opt-in/não bloqueante.
- [ ] O texto reafirma o comportamento read-only sobre `DESIGN.md`.
- [ ] Dry-run mental sem impeccable: o gate é pulado, o build segue com os gates padrão.
- [ ] Todo o conteúdo novo é condicional/opt-in.

## Notas técnicas
- Conteúdo puro; nenhuma mudança em `bin/ksdd.js`.
- Consistente com ADR-013 (mudança de conteúdo, sem novo target/`install*`).
- Referenciar `references/integrations/impeccable.md` em vez de duplicar a receita.

## Riscos / dependências externas
- Depende do doc de integração (057). Baixo risco.
