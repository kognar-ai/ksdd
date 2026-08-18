# Referência: Especificação Google Stitch DESIGN.md

Resumo da spec oficial open-source publicada por Google Labs em `github.com/google-labs-code/design.md`. Use isto como autoridade ao gerar `DESIGN.md` via `/ksdd:design`.

**Path KSDD v0.6.0+:** salvar em `.ksdd/specs/DESIGN.md` (fallback raiz `DESIGN.md` legado).

## Estrutura geral

Um arquivo DESIGN.md tem duas camadas:

1. **YAML frontmatter** — tokens machine-readable, delimitado por `---` no topo e no fim do bloco
2. **Markdown body** — prose human-readable em seções `##`

Tokens são normativos. Prose é contexto.

---

## YAML Frontmatter — Schema

```yaml
version: <string>          # opcional, atual: "alpha"
name: <string>             # obrigatório
description: <string>      # opcional
colors:
  <token-name>: <Color>
typography:
  <token-name>: <Typography>
rounded:
  <scale-level>: <Dimension>
spacing:
  <scale-level>: <Dimension | number>
components:
  <component-name>:
    <token-name>: <string | token reference>
```

## Tipos primitivos

| Tipo | Formato | Exemplo |
|------|---------|---------|
| Color | `#` + hex sRGB | `"#1A1C1E"` |
| Dimension | número + unidade (`px`, `em`, `rem`) | `48px`, `1.5rem`, `-0.02em` |
| Token Reference | `{path.to.token}` | `"{colors.primary}"` |

## Tipo Typography (objeto)

Propriedades válidas:
- `fontFamily` (string)
- `fontSize` (Dimension)
- `fontWeight` (number)
- `lineHeight` (Dimension | number unitless = multiplier do fontSize)
- `letterSpacing` (Dimension)
- `fontFeature` (string — configura `font-feature-settings`)
- `fontVariation` (string — configura `font-variation-settings`)

## Componentes — propriedades válidas

`backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`

**Variantes** (hover, active, pressed): entradas separadas com sufixo. Não objetos aninhados.

```yaml
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.tertiary-container}"
```

---

## Markdown Body — Ordem canônica das seções

Use `##`. Seções podem ser omitidas, mas as presentes seguem esta ordem:

| # | Seção | Aliases aceitos |
|---|-------|-----------------|
| 1 | **Overview** | "Brand & Style" |
| 2 | **Colors** | — |
| 3 | **Typography** | — |
| 4 | **Layout** | "Layout & Spacing" |
| 5 | **Elevation & Depth** | "Elevation" |
| 6 | **Shapes** | — |
| 7 | **Components** | — |
| 8 | **Do's and Don'ts** | — |

Um `#` (h1) opcional pode aparecer pra título do documento; não é parsed como seção.

---

## Guia de conteúdo por seção

### Overview
Descrição holística do look-and-feel. Personalidade da marca, público-alvo, resposta emocional esperada. Foundational context pra decisões estilísticas quando regras específicas não cobrem.

### Colors
Prose descrevendo a estratégia. Para cada palette key: nome descritivo + hex + papel semântico.

Tokens: pelo menos `primary`. Convenções comuns: `primary`, `secondary`, `tertiary`, `neutral`, `surface`, `on-surface`, `error`.

### Typography
Estratégia tipográfica. Famílias e seus papéis. Quando usar cada nível.

Tokens comuns: `headline-display`, `headline-lg`, `headline-md`, `body-lg`, `body-md`, `body-sm`, `label-lg`, `label-md`, `label-sm`. Tipicamente 9-15 níveis.

### Layout
Grid model (fluido, fixo, max-width). Escala de spacing. Breakpoints. Ritmo vertical.

Tokens spacing: scale levels descritivos (`xs`, `sm`, `md`, `lg`, `xl`) com Dimension ou número.

### Elevation & Depth
Como visual hierarchy é comunicada — sombras, camadas tonais, bordas. Se flat, explica o substituto.

### Shapes
Linguagem de formas. Radius por componente. Justificativa.

Tokens rounded: `none`, `sm`, `md`, `lg`, `xl`, `full` (geralmente `9999px`).

### Components
Style guidance pra componentes principais: buttons, chips, lists, tooltips, checkboxes, radio buttons, input fields, + específicos do domínio.

Documente sizing, padding, estados, variantes.

### Do's and Don'ts
Guardrails concretos. Lista de regras práticas e armadilhas comuns. Cobrir cor, tipografia, espaçamento, contraste, consistência.

---

## Regras de lint (oficial)

| Regra | Severidade | O que checa |
|-------|------------|-------------|
| `broken-ref` | error | Token references que não resolvem |
| `missing-primary` | warning | Sem `primary` color quando há outras cores |
| `contrast-ratio` | warning | bg/text de componentes abaixo de WCAG AA (4.5:1) |
| `orphaned-tokens` | warning | Color tokens definidos mas nunca referenciados |
| `missing-typography` | warning | Cores definidas mas sem typography tokens |
| `section-order` | warning | Seções fora da ordem canônica |
| `token-summary` | info | Resumo de quantos tokens por seção |
| `missing-sections` | info | Seções opcionais ausentes |

Erro = file rejeitado. Validar com `npx @google/design.md lint .ksdd/specs/DESIGN.md`.

---

## Export para outros formatos

```bash
# Tailwind v3 config
npx @google/design.md export --format json-tailwind .ksdd/specs/DESIGN.md > tailwind.theme.json

# Tailwind v4 @theme block (CSS custom properties)
npx @google/design.md export --format css-tailwind .ksdd/specs/DESIGN.md > theme.css

# W3C Design Tokens Format Module
npx @google/design.md export --format dtcg .ksdd/specs/DESIGN.md > tokens.json
```

---

## Comportamento com conteúdo desconhecido

| Cenário | Comportamento |
|---------|---------------|
| Heading de seção desconhecida | Preserva, não erra |
| Color token name desconhecido | Aceita se valor é válido |
| Typography token desconhecido | Aceita como Typography válida |
| Component property desconhecida | Aceita com warning |
| Heading duplicado | Erro — rejeita o arquivo |

---

## Exemplo mínimo válido

```markdown
---
version: alpha
name: Exemplo
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  tertiary: "#B8422E"
  neutral: "#F7F5F2"
typography:
  h1:
    fontFamily: Inter
    fontSize: 3rem
    fontWeight: 700
    lineHeight: 1.1
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    lineHeight: 1.6
rounded:
  sm: 4px
  md: 8px
spacing:
  sm: 8px
  md: 16px
---

## Overview
[descrição da marca e personalidade]

## Colors
[prose sobre a paleta e papel de cada cor]

## Typography
[prose sobre a estratégia tipográfica]

## Layout
[prose sobre grid e spacing]

## Components
[prose sobre componentes]

## Do's and Don'ts
- Do [...]
- Don't [...]
```

---

## Interop com impeccable

O `DESIGN.md` gerado pelo `/ksdd:design` é **o mesmo formato Google Stitch** que o [impeccable](https://github.com/pbakaus/impeccable) (camada de craft/QA de UI, Apache-2.0) lê e escreve — não há formato intermediário nem exportador. O **teste objetivo de compat** é o próprio lint:

```bash
npx @google/design.md lint .ksdd/specs/DESIGN.md    # passar = compatível com o impeccable
```

O impeccable espera o `DESIGN.md` na raiz do projeto, enquanto o KSDD mantém a fonte da verdade em `.ksdd/specs/`. Ponte confiável: `ln -s .ksdd/specs/DESIGN.md DESIGN.md` (a doc atual do impeccable não documenta flag de path). Handoff completo — commands por fase, mapeamento SPEC→`PRODUCT.md` e slop detector como gate: `references/integrations/impeccable.md`.

---

## Referências oficiais

- Spec completa: https://github.com/google-labs-code/design.md/blob/main/docs/spec.md
- Docs Stitch: https://stitch.withgoogle.com/docs/design-md/overview
- CLI: `@google/design.md` no npm
