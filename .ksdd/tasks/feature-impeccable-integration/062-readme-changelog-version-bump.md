---
id: 062
title: README "## Integrações" + CHANGELOG + bump package.json 0.11.0 → 0.12.0
status: em revisão
feature: impeccable-integration
area: backend
priority: P0
estimate: S
depends_on: [057, 058, 059, 060, 061]
feature_refs:
  - ".ksdd/features/FEATURE-impeccable-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-impeccable-integration.md#13-métricas-de-sucesso"
spec_refs:
  - ".ksdd/specs/SPEC.md#9-touchpoints-críticos"
arch_refs:
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
---

# 062 — Docs de release + version bump

## Objetivo
Tornar a integração descobrível publicamente e cortar a release 0.12.0 (minor, backward-compatible).

## Escopo
- **`README.md`:** nova seção "## Integrações" com o impeccable como a **primeira** — o que é, quando usar (design vs build), pointer para `references/integrations/` (convenção) e `references/integrations/impeccable.md`, nota de que é opt-in e não adiciona dependência. Mencionar a convenção reaproveitável (Figma/v0/Pencil no futuro).
- **`CHANGELOG.md`:** entrada `[0.12.0] - <data>` no padrão Keep a Changelog:
  - **Adicionado:** convenção `references/integrations/` + 1ª integração (impeccable) — handoff no `/ksdd:design`, craft/QA no `/ksdd:build:feature`, gate opcional `npx impeccable detect`, geração opcional de `PRODUCT.md`.
  - **Alterado:** `commands/design.md`, `commands/build:feature.md`, `references/design-md-spec.md`, `README.md`, `CLAUDE.md`.
  - **Arquitetura:** ADR-014 (convenção conteúdo-only; **não** dispara o refator `installTarget`; sem mudança em `bin/ksdd.js`; mantém ADR-001 zero-dep).
- **`package.json`:** bump `"version"` de `0.11.0` para `0.12.0`.

## Fora de escopo
- Alterar `engines.node` (permanece `>=16` — Node 22.12+ é problema do usuário do impeccable, não do KSDD).
- Publicar no npm (fora do escopo da feature).
- Editar `bin/ksdd.js`.

## Critérios de aceitação
- [ ] `README.md` tem a seção "## Integrações" com o impeccable como a primeira + pointers.
- [ ] `CHANGELOG.md` tem a entrada `[0.12.0]` com Adicionado/Alterado/Arquitetura coerentes com o que a feature entregou.
- [ ] `package.json` está em `0.12.0`.
- [ ] `engines.node` inalterado (`>=16`).
- [ ] Nenhuma dependência nova em `package.json` (mantém ADR-001).
- [ ] `node -c bin/ksdd.js` continua passando (nenhuma edição no CLI).

## Notas técnicas
- Precedente de release conteúdo-only: entrada `[0.11.0]` do CHANGELOG (feature new-fix-command) — bump minor sem tocar a arquitetura de instalação.
- A versão no `SPEC.md` seção 4.1 (manifest example, hoje `0.11.0`) pode ser mencionada como item de reconciliação, mas o bump canônico é `package.json`.

## Riscos / dependências externas
- Depende das tasks de conteúdo (057–061) estarem prontas para o CHANGELOG descrever o entregue com fidelidade.
