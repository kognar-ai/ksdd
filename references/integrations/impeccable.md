# Integração: impeccable (craft/QA de UI)

> **Primeira integração documentada do KSDD.** Segue a convenção em
> `references/integrations/README.md`: é **handoff/opt-in**, nunca dependência de código.
> Todo este doc está frasado como "se você usa o impeccable…". O fluxo KSDD roda ponta a
> ponta sem ele.

## O que é o impeccable

[impeccable](https://github.com/pbakaus/impeccable) (`pbakaus/impeccable`, **Apache-2.0**) é
uma camada de **craft/QA de interface** para agentes de código. Ele lê e escreve **o mesmo
`DESIGN.md` no formato Google Stitch** que o `/ksdd:design` já gera, e adiciona um vocabulário
de commands (`craft`, `shape`, `critique`, `audit`, `polish`, `live`, `document`, `extract`,
`bolder`, `quieter`, `distill`, `harden`, `animate`, `colorize`, `typeset`, `layout`, …) mais
regras de "anti-slop" aplicadas durante a implementação da UI.

O usuário instala o impeccable **por conta própria** — o KSDD não o empacota nem o invoca:

```bash
npx impeccable install     # instala os commands do impeccable no seu agente
```

> **Requisito de versão é problema do impeccable, não do KSDD.** O impeccable exige um Node
> recente (22.12+ conforme a doc dele); o KSDD segue Node ≥16 e **não** altera `engines.node`.
> Confirme a versão mínima atual na doc oficial do impeccable.

## Onde encaixa no fluxo (sem sobreposição de responsabilidade)

| Fase | KSDD (spec-driven) | impeccable (craft/QA) |
|------|--------------------|------------------------|
| `brainstorm → SPEC → architecture → DESIGN` | produz o **contrato** de design (`DESIGN.md`) | — |
| build (a UI vira código) | trata `DESIGN.md` como **read-only** (Gate 6/7) | **eleva e valida** o design **no código** |

O KSDD entrega o contrato; o impeccable atua **depois**, no código, exatamente onde o KSDD
hoje não toca. As fases são complementares.

### Quando acionar cada command

- **No fim do `/ksdd:design`** (contrato pronto): `/impeccable craft`, `/impeccable audit`,
  `/impeccable polish`, `/impeccable live` para começar o craft a partir do `DESIGN.md`.
- **Durante o `/ksdd:build:feature`, em tasks de UI** (`area: frontend`/`design`):
  - **antes** de implementar a UI: `/impeccable shape`, `/impeccable critique`;
  - **depois** de implementar: `/impeccable audit`, `/impeccable polish`.
- **Como gate de qualidade** (opcional): `npx impeccable detect <ui-paths>` (ver "Slop
  detector como gate" abaixo).

## Garantia de compatibilidade (o contrato de interop)

O `DESIGN.md` do KSDD e o do impeccable são **o mesmo formato Google Stitch** (KSDD ADR-008;
ver `references/design-md-spec.md`). O **teste objetivo de compat** é o linter oficial:

```bash
npx @google/design.md lint .ksdd/specs/DESIGN.md    # passar = compatível com o impeccable
```

Se o `DESIGN.md` passa no lint, o impeccable o consome sem conversão. Não há formato
intermediário nem exportador — a interoperabilidade já existe por construção.

## Path bridge (atenção — wrinkle real)

O impeccable espera `DESIGN.md` (e `PRODUCT.md`) na **raiz do projeto**; o KSDD grava em
`.ksdd/specs/`. Como a doc atual do impeccable **não documenta uma flag de path**
(`--path`/`--dir`), a ponte confiável é um **symlink** (ou cópia) da raiz para o artefato
canônico do KSDD:

```bash
ln -s .ksdd/specs/DESIGN.md  DESIGN.md      # ou: cp .ksdd/specs/DESIGN.md DESIGN.md
ln -s .ksdd/specs/PRODUCT.md PRODUCT.md     # idem, se você gerou o PRODUCT.md (abaixo)
```

- **A fonte da verdade continua sendo `.ksdd/specs/`.** O symlink só expõe o artefato onde o
  impeccable procura. Use `cp` se preferir um arquivo real (ex.: Windows sem privilégio de
  symlink), lembrando de re-copiar quando o `DESIGN.md` mudar.
- Se uma versão futura do impeccable passar a aceitar flag de path, prefira-a ao symlink e
  atualize este doc. **[verificar]** a cada bump relevante do impeccable.
- Adicione `DESIGN.md`/`PRODUCT.md` da raiz ao `.gitignore` se optar por cópia e não quiser
  versionar o duplicado.

## Mapeamento SPEC → PRODUCT.md

Além do `DESIGN.md`, o impeccable usa um `PRODUCT.md` como contexto de produto (o
`/impeccable init` o gera interativamente, coletando *audience, brand/product lane, voice,
anti-references, colors, type, components*). Se você usa o KSDD, esses campos já foram
decididos no `SPEC.md`/`brainstorm.md` — dá para semear o `PRODUCT.md` a partir deles:

| Campo do PRODUCT.md (impeccable) | Origem no KSDD |
|----------------------------------|----------------|
| **Users** (audience) | Personas — `SPEC.md` seção 2 |
| **Mode** (`brand` \| `product` lane) | Modelo de Negócio + natureza do produto — `SPEC.md` seções 1 e 12 |
| **Brand voice** | Identidade Visual / Personalidade da Marca — `SPEC.md` seção 3 |
| **Anti-references** | Diferenciais + "o que evitar" — `brainstorm.md` + `SPEC.md` |
| Colors / Type / Components | já normativos no `DESIGN.md` (Google Stitch) — não reduplicar |

Duas formas de obter o `PRODUCT.md`:

1. **Deixe o `/ksdd:design` emitir um rascunho** de `.ksdd/specs/PRODUCT.md` a partir do
   mapeamento acima (passo opcional 5.5 do `/ksdd:design`), respeitando
   `references/language-policy.md`. Depois exponha-o via path bridge.
2. **Rode `/impeccable init`** e responda às perguntas usando o SPEC como fonte — o impeccable
   gera o `PRODUCT.md` no formato dele.

> O **esquema exato** (headings/campos) do `PRODUCT.md` é definido pelo impeccable e pode
> evoluir. Trate o rascunho emitido pelo KSDD como ponto de partida e **[verificar]** contra o
> que o `/impeccable init` produz na versão que você usa; `/impeccable init` é o gerador
> autoritativo.

## Slop detector como gate (opcional)

Para usar o detector de "slop" do impeccable como um **quality gate opcional** de UI no build:

```bash
npx impeccable detect <ui-paths>     # ex.: npx impeccable detect src/components src/app
```

- **Opt-in, não bloqueante.** Se o impeccable não está instalado, pule o gate — o
  `/ksdd:build:feature` segue com os gates padrão (build, testes, lint, E2E, code review). Ver
  a §6 do `commands/build:feature.md`.
- Rode **depois** de implementar a UI de uma task e **antes** de fechar a task; corrija os
  apontamentos com `/impeccable polish`/`audit` se fizer sentido.

## Referências

- impeccable: https://github.com/pbakaus/impeccable (Apache-2.0)
- Formato Google Stitch (`DESIGN.md`): `references/design-md-spec.md` + KSDD ADR-008
- Convenção de integrações: `references/integrations/README.md` + KSDD ADR-014
- Superfícies do fluxo que apontam para cá: `commands/design.md` (Step 7 + passo 5.5) e
  `commands/build:feature.md` (§4.5 + gate opcional §4.8/§6)
