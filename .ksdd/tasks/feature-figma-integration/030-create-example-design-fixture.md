---
id: 030
title: Criar fixture references/fixtures/example-DESIGN.md
status: para implementar
feature: figma-integration
area: qa
priority: P0
estimate: S
depends_on: [029]
feature_refs:
  - ".ksdd/features/FEATURE-figma-integration.md#2-escopo"
  - ".ksdd/features/FEATURE-figma-integration.md#4-fluxos-de-uso"
spec_refs:
  - ".ksdd/specs/SPEC.md#4-modelo-de-dados"
arch_refs:
  - ".ksdd/specs/architecture.md#3-modelo-de-dados-schemas"
---

# 030 — Criar fixture references/fixtures/example-DESIGN.md

## Objetivo
DESIGN.md sintético, mínimo e válido pelo lint Stitch, cobrindo as 4 categorias do escopo (colors/typography/spacing/rounded). Serve como input do QA dogfood (T-034) e como exemplo público no README (T-033).

## Escopo
- Criar `references/fixtures/example-DESIGN.md` seguindo `references/design-md-spec.md`.
- Cobertura mínima de tokens (escolher quantidades que façam o output visual no Figma fácil de inspecionar):
  - **colors:** ≥ 6 tokens (primary, secondary, tertiary, neutral, surface, on-surface, error) com hex válido + pelo menos 1 token usando token reference (`{colors.primary}`) para exercitar resolução.
  - **typography:** ≥ 4 entradas (headline-lg, body-md, body-sm, label-md) cobrindo `fontFamily`, `fontSize`, `fontWeight`, `lineHeight` (incluir um exemplo de `lineHeight` unitless e um em px).
  - **spacing:** ≥ 5 levels (xs, sm, md, lg, xl) misturando Dimension (`16px`) e number puro.
  - **rounded:** ≥ 4 levels (sm, md, lg, full).
- Markdown body com seções canônicas mínimas: Overview, Colors, Typography, Layout (1-2 frases cada). Não precisa preencher Components/Do's/Don'ts.
- Frontmatter inclui `name: "KSDD Example"` (esse será o default de coleção no Figma).

## Fora de escopo
- Cobrir `components:` (fora do escopo v1).
- Cobrir modes light/dark.
- Tornar fixture um "design system real" — propósito é puramente de QA / exemplo.

## Critérios de aceitação
- [ ] `references/fixtures/example-DESIGN.md` existe.
- [ ] `npx @google/design.md lint references/fixtures/example-DESIGN.md` passa sem `error` (warnings aceitáveis se documentados).
- [ ] Frontmatter cobre as 4 categorias do escopo v1 nas quantidades mínimas listadas acima.
- [ ] Pelo menos 1 token usa token reference `{...}` para exercitar a resolução em T-028.
- [ ] Após `ksdd install`, o arquivo aparece em `~/.claude/skills/ksdd/references/fixtures/example-DESIGN.md` (e equivalentes Codex/opencode) — `copyDir` recursivo já garante isso; verificar no manifest.
- [ ] Não introduz tokens fora do schema Stitch (sem fields exóticos).

## Notas técnicas
- `copyDir` em `bin/ksdd.js:49` é recursivo, então criar `references/fixtures/` automaticamente é copiado para `~/.claude/skills/ksdd/references/fixtures/` sem mudar código do CLI.
- Confirmar que `tracked[]` no manifest registra o path da fixture após install (smoke test simples).
- Fixture deve ser auto-explicativa — sem prosa elaborada; quem lê é o agente + mantenedor durante QA.

## Riscos / dependências externas
- `@google/design.md` CLI precisa estar disponível para rodar o lint na CI manual — sem CI/CD atual, mantenedor roda local.
- Se Stitch alpha mudar schema antes do release, fixture pode quebrar — manter alinhada com `references/design-md-spec.md` da mesma release.
