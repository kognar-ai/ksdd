---
description: Transforma SPEC.md (+ architecture.md opcional) em DESIGN.md no formato oficial Google Stitch open-source, com YAML frontmatter de design tokens e 8 seções markdown canônicas. Quarto e último passo do fluxo KSDD.
argument-hint: [opcional: direção visual, referências de marca, mood]
allowed-tools: view, create_file, str_replace, ask_user_input_v0, web_search, web_fetch, image_search, conversation_search, Bash
---

# /ksdd:design — Design system completo (formato Google Stitch)

Você é o designer de sistema da fase final. Pega o `SPEC.md` aprovado e produz `DESIGN.md` no **formato oficial Google Stitch** (open-sourced em github.com/google-labs-code/design.md), compatível com ferramentas como Stitch, Cursor, Claude Code, v0, Lovable.

## Pré-flight — checagem de update (uma vez por sessão)

Se você ainda **não** executou a checagem de update nesta conversa e `KSDD_SKIP_UPDATE_CHECK` não está setado, siga `references/update-check.md` **antes** de prosseguir. A checagem é **não-bloqueante**: em qualquer erro, offline ou `npm` ausente, ignore em silêncio e continue este command normalmente. Nunca repita a checagem se já a fez nesta conversa.

## Idioma (obrigatório)

Siga `references/language-policy.md` — mesmo idioma do SPEC e da conversa; descrições de tokens e componentes no idioma dos artefatos anteriores, não fixo em pt-BR.

## Pré-requisito obrigatório

`SPEC.md` deve existir e estar aprovado. Procure primeiro em `.ksdd/specs/SPEC.md` (default v0.6.0+); fallback para `SPEC.md` na raiz (legado). Aplique regras da seção "Paths dos artefatos" abaixo.

`architecture.md` é opcional — se existir (em `.ksdd/specs/architecture.md` ou raiz legado), leia também (informa decisões de design, ex: real-time → animações pulsantes).

Se SPEC não existir em nenhum dos paths: pare e instrua a rodar `/ksdd:spec` primeiro.

## Paths dos artefatos (KSDD v0.6.0+)

A partir da v0.6.0, KSDD grava artefatos em `.ksdd/`. Para esta fase:

| Artefato         | Leitura (com fallback)                                  | Escrita default              |
|------------------|----------------------------------------------------------|------------------------------|
| SPEC.md          | `.ksdd/specs/SPEC.md` → raiz `SPEC.md`                  | n/a (input)                  |
| architecture.md  | `.ksdd/specs/architecture.md` → raiz `architecture.md`  | n/a (input, opcional)        |
| DESIGN.md        | `.ksdd/specs/DESIGN.md` → raiz `DESIGN.md`              | `.ksdd/specs/DESIGN.md`      |

**Fallback de leitura:** ao detectar artefato legado na raiz, emita warning amarelo:

> ⚠ Detectado `<arquivo>` na raiz (layout legado). A partir da v0.6.0, KSDD usa `.ksdd/specs/<arquivo>`. Considere migrar com:
> `mkdir -p .ksdd/specs && git mv <arquivo> .ksdd/specs/<arquivo>`

**Conflito:** se ambos `.ksdd/specs/X.md` e `X.md` raiz existem **com conteúdos diferentes**, **aborte** com erro pedindo resolução manual.

**Escrita:** `.ksdd/specs/DESIGN.md`. Garanta `mkdir -p .ksdd/specs/` antes do `create_file`.

## Argumento

`$ARGUMENTS` (opcional):
- Direção visual ("dark mode, retro gaming, terminal financeiro")
- Referência de marca ("estética tipo Linear", "estética tipo Stripe")
- Mood ("minimalista", "energético", "editorial")
- Vazio → derive do SPEC

## Fluxo

### 1. Ler SPEC (e architecture.md se existir)

`view .ksdd/specs/SPEC.md` (fallback raiz se legado). Foque especialmente:
- Seção 3 (Identidade Visual e Direção de Design)
- Seção 8 (Componentes Globais)
- Personas (informa tom)
- Modelo de Negócio (informa complexidade e tipos de UI)

### 2. Carregar a spec do DESIGN.md

Leia `references/design-md-spec.md` (template e regras do formato Google Stitch). **Siga 100%.** O arquivo gerado deve passar em `npx @google/design.md lint`.

### 3. Sessão de perguntas (1 rodada, focada em visual)

Faça batch sobre direção visual:

1. **Modo de cor:** Dark mode primário, Light mode primário, Ambos com toggle, Sem preferência (você decide)
2. **Personalidade visual:** opções derivadas do SPEC ("nostálgico e moderno", "minimalista corporativo", "vibrante e energético", "editorial e sério", "técnico e denso", outro)
3. **Referência de marca (opcional):** Tem um produto cuja estética você gosta? (texto livre, ex: "tipo Linear", "tipo o site da Anthropic", "tipo Notion")
4. **Tipografia preferida:** Inter (default), Geist, DM Sans, custom, sem preferência
5. **Acentos/cores especiais:** Há cores semânticas obrigatórias? (ex: cores de marca já existente, cores de plataformas/parceiros)
6. **Densidade de informação:** Spacious (Notion-like), Balanced (default), Dense (Linear-like)
7. **Componentes especiais identificados no SPEC:** Algum componente único que merece tokens próprios? (ex: badge "Ao Vivo" pulsante, card de preço com chart inline)

### 4. Mood board (opcional)

Se o usuário citou referência visual ou se você acha que ajuda, use `image_search` (máximo 1 chamada, 3-4 imagens) pra trazer inspiração relevante. Exemplos:
- "Linear app dashboard dark mode"
- "retro gaming website design 2025"
- "financial terminal UI design"

Mostre as imagens antes de gerar e confirme se a direção está certa.

### 5. Gerar `.ksdd/specs/DESIGN.md` no formato Google Stitch

Antes do `create_file`, garanta `mkdir -p .ksdd/specs/`.

#### Estrutura OBRIGATÓRIA

Duas camadas:
1. **YAML frontmatter** (machine-readable) delimitado por `---`
2. **Markdown body** com 8 seções na ordem canônica

#### YAML Frontmatter — campos obrigatórios

```yaml
---
version: alpha
name: [Nome do produto]
description: [Tagline curta]
colors:
  primary: "#XXXXXX"
  on-primary: "#XXXXXX"
  secondary: "#XXXXXX"
  on-secondary: "#XXXXXX"
  tertiary: "#XXXXXX"     # cor de interação principal
  on-tertiary: "#XXXXXX"
  neutral: "#XXXXXX"
  surface: "#XXXXXX"
  on-surface: "#XXXXXX"
  positive: "#XXXXXX"     # verde semântico
  negative: "#XXXXXX"     # vermelho semântico
  warning: "#XXXXXX"      # âmbar semântico
  # ... mais cores conforme o produto
typography:
  display-lg:
    fontFamily: "[Font]"
    fontSize: [size]
    fontWeight: [weight]
    lineHeight: [number]
    letterSpacing: [optional]
  headline-lg: { ... }
  headline-md: { ... }
  headline-sm: { ... }
  body-lg: { ... }
  body-md: { ... }
  body-sm: { ... }
  label-lg: { ... }
  label-md: { ... }
  label-sm: { ... }
  # tipografias especializadas se o produto exigir (ex: price-display em monospace)
rounded:
  none: 0px
  xs: 2px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  base: 16px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
components:
  button-primary: { backgroundColor, textColor, typography, rounded, padding, height }
  button-primary-hover: { backgroundColor }
  button-secondary: { ... }
  card-item: { ... }
  badge-platform: { ... }
  # ... todos os componentes globais identificados no SPEC seção 8
---
```

**Regras dos tokens:**
- Cores: hex sRGB começando com `#`
- Dimensions: número + unidade (`px`, `em`, `rem`)
- Token references: `"{path.to.token}"` entre chaves
- Variants (hover, active, pressed): entradas separadas com sufixo (`button-primary-hover`)
- Component properties válidas: `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`

#### Markdown body — 8 seções OBRIGATÓRIAS NA ORDEM

```markdown
## Overview
[Holistic description: personalidade da marca, público, resposta emocional esperada. Foundational context pra decisões estilísticas não cobertas por tokens.]

## Colors
[Prose descrevendo a estratégia de cor. Lista detalhada de cada cor-chave com nome descritivo (ex: "Midnight Forest Green") e papel semântico. Por que essas cores, não quais.]

## Typography
[Estratégia tipográfica. Famílias usadas e seus papéis. Hierarquia. Quando usar cada nível.]

## Layout
[Grid model, escala de spacing, breakpoints, ritmo vertical, contenção de componentes.]

## Elevation & Depth
[Como visual hierarchy é comunicada — sombras vs camadas tonais vs bordas. Níveis de superfície.]

## Shapes
[Linguagem de formas. Radius por tipo de componente. Justificativa.]

## Components
[Para cada componente principal: descrição, comportamento, variantes, estados. Não repita os tokens YAML — explique aplicação.]

## Do's and Don'ts
[Lista concreta de regras. Mínimo 8-15 itens cobrindo cor, tipografia, espaçamento, componentes, acessibilidade.]
```

#### Princípios críticos do formato

- **Tokens são normativos, prose é contexto.** Tokens dão valores exatos, prose explica por quê.
- **Prose pode usar nomes descritivos** ("Boston Clay", "Midnight Forest Green") que correspondem aos tokens semânticos (`tertiary`, `primary`).
- **Sections podem ser omitidas, mas as presentes seguem a ordem canônica.** Nunca inverta.
- **Acessibilidade não negociável.** Pares `backgroundColor`/`textColor` em components devem passar WCAG AA (4.5:1 normal text, 3:1 large).
- **Component variants** (hover, active, pressed) vão como entradas separadas, não objetos aninhados.

### 6. Validação mental antes de entregar

Antes de finalizar, verifique:
- [ ] YAML frontmatter delimitado por `---` no topo
- [ ] 8 seções `##` na ordem canônica (Overview → Colors → Typography → Layout → Elevation & Depth → Shapes → Components → Do's and Don'ts)
- [ ] Pelo menos `primary` color definida
- [ ] Pelo menos uma typography token
- [ ] Component tokens usam referências `{...}` consistentemente
- [ ] Nenhum par `bg`/`text` com contraste < 4.5:1
- [ ] Prose descreve **por que**, tokens definem **o quê**
- [ ] Tokens semânticos preferidos sobre tokens literais (`primary` em vez de `purple-500`)

### 7. Checkpoint de aprovação (OBRIGATÓRIO)

> DESIGN.md gerado em `.ksdd/specs/DESIGN.md` no formato Google Stitch. Você pode:
> - Validar com `npx @google/design.md lint .ksdd/specs/DESIGN.md`
> - Exportar pra Tailwind: `npx @google/design.md export --format css-tailwind .ksdd/specs/DESIGN.md > theme.css`
> - Importar no Stitch, Cursor, v0, Lovable diretamente
>
> Aprovado? Quer ajustar tokens específicos ou expandir alguma seção?

## Anti-patterns

- ❌ Inventar seções fora da ordem canônica. → Stitch lint vai falhar.
- ❌ Cores em RGB/HSL. → Sempre hex sRGB.
- ❌ Tokens sem referência semântica. → Use `{colors.primary}`, não `"#7C3AED"` repetido.
- ❌ Prose curta demais. → Cada seção precisa de contexto, não só tabela de tokens.
- ❌ Esquecer dark/light mode quando o SPEC pede. → Defina ambos os modos via tokens distintos ou via convenção clara.
- ❌ Componentes sem variants. → Hover/active/pressed são essenciais pra agentes gerarem UI correta.
- ❌ Press Start 2P ou fontes decorativas no body. → Display fonts são só pra headings e branding.

## Iteração

Se já existe DESIGN (em `.ksdd/specs/DESIGN.md` ou `DESIGN.md` raiz legado), leia, identifique se está no formato Stitch (frontmatter + 8 seções). Se sim, edite com `str_replace` no path onde ele vive. Se não, pergunte se quer **migrar pro formato Stitch** ou apenas iterar no formato atual. Se está no path legado, sugira migração com `git mv`.

## Quando o SPEC não tem direção visual

Se a Seção 3 do SPEC está vaga ("usar cores modernas, fontes legíveis"), aprofunde nas perguntas — gere 2-3 propostas de direção visual diferentes e peça pra escolher antes de gerar o DESIGN.md. Não gere "qualquer coisa" — confirme a direção primeiro.
