---
id: 029
title: Criar references/figma-mapping.md (canônico Stitch → Figma Variables)
status: para implementar
feature: figma-integration
area: data-model
priority: P0
estimate: M
depends_on: []
feature_refs:
  - ".ksdd/features/FEATURE-figma-integration.md#8-impacto-no-design"
  - ".ksdd/features/FEATURE-figma-integration.md#6-impacto-no-modelo-de-dados"
spec_refs:
  - ".ksdd/specs/SPEC.md#4-modelo-de-dados"
arch_refs:
  - ".ksdd/specs/architecture.md#3-modelo-de-dados-schemas"
---

# 029 — Criar references/figma-mapping.md

## Objetivo
Documento canônico que define como cada token Stitch (`references/design-md-spec.md`) é traduzido para Figma Variable (type + naming + edge cases). É o contrato consumido pelo command `/ksdd:figma:export` (T-028) e pelo QA (T-034).

## Escopo
- Criar `references/figma-mapping.md` com as seções:
  1. **Visão geral** — uma frase: "DESIGN.md (Stitch) → coleção única de Figma Variables agrupada por path."
  2. **Tabela de mapeamento** — para cada uma das 4 categorias (colors, typography, spacing, rounded):
     - Stitch token type
     - Figma Variable type (`COLOR`, `FLOAT`, `STRING`, `BOOLEAN`)
     - Naming convention (`colors/<name>`, `typography/<name>/<prop>`, etc.)
     - Conversões necessárias (ex: `rem`/`em` → `px`, `lineHeight` unitless → `px = multiplier × fontSize`)
  3. **Resolução de token references** — `{colors.primary}` resolve antes do export; Figma Variable aliases ficam fora de v1.
  4. **Tratamento de tokens fora do escopo v1** — `components.*` ignorado com warning no diff; `fontFeature`/`fontVariation` ignorados (Figma não tem mapping 1:1).
  5. **Edge cases documentados:**
     - Hex curto (`#FFF` → `#FFFFFF`)
     - Cores com alpha (Stitch atual não modela alpha; documentar limitação)
     - Spacing como number puro (sem unidade) → assumir `px`
     - Typography com `fontWeight` string (`"700"`) → coerção numérica
  6. **Schema do payload intermediário** — TypeScript-ish/JSON-Schema descrevendo `{ collectionName, variables: [{ name, resolvedType, value, scopes }] }` que o command produz.
  7. **Versão Stitch suportada** — citar versão de `references/design-md-spec.md` válida para este mapping.
- Estilo: tabelas Markdown, exemplos inline curtos, sem prosa floreada (segue tom de `references/`).

## Fora de escopo
- Implementação do parser/normalizer (acontece dentro do command T-028).
- Suporte a modes light/dark.
- Mapping de Stitch `components:` block.
- Suporte a Figma Variable aliases (referenciar uma Variable de dentro de outra).

## Critérios de aceitação
- [ ] `references/figma-mapping.md` existe e cobre as 4 categorias do escopo v1 com tabela completa.
- [ ] Cada linha da tabela tem: Stitch token, Figma type, naming, conversão (se aplicável).
- [ ] Documento cita explicitamente o que **não** é mapeado em v1 e por quê (components, modes, alpha).
- [ ] Schema do payload intermediário documentado (objeto + arrays + tipos primitivos).
- [ ] Edge cases listados (≥ 4: hex curto, alpha, spacing sem unidade, fontWeight string).
- [ ] Documento referencia `references/design-md-spec.md` como input authority.
- [ ] Após `ksdd install`, o arquivo aparece em `~/.claude/skills/ksdd/references/figma-mapping.md` (e equivalentes Codex/opencode).

## Notas técnicas
- Documento é puro Markdown sem código executável — sem `.js`/`.ts` files no escopo desta task.
- Naming convention `colors/primary`, `typography/headline-lg/fontSize` aproveita o agrupamento nativo de Figma Variables por `/` no nome (folders virtuais na UI).
- `lineHeight` unitless do Stitch (`lineHeight: 1.6`) deve ser convertido para `FLOAT` em px multiplicando pelo `fontSize` do mesmo grupo — documentar exemplo numérico.
- Figma `FLOAT` aceita ponto decimal; valores em `rem` (`1.5rem`) podem virar `24` (assumindo root=16px) — documentar a constante usada.

## Riscos / dependências externas
- Stitch alpha pode evoluir e adicionar fields (ex: modes) — documento precisa versionar suporte.
- Sem implementação real para validar, o mapping pode esconder ambiguidade que só aparece em T-028/T-034 — esperado refinar mapping após dogfood.
