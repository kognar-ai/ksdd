---
id: 057
title: Criar references/integrations/impeccable.md (1ª integração — doc canônico)
status: para implementar
feature: impeccable-integration
area: backend
priority: P0
estimate: M
depends_on: [056]
feature_refs:
  - ".ksdd/features/FEATURE-impeccable-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-impeccable-integration.md#6-impacto-no-modelo-de-dados"
  - ".ksdd/features/FEATURE-impeccable-integration.md#8-impacto-no-design-interop"
spec_refs:
  - ".ksdd/specs/SPEC.md#2-personas"
  - ".ksdd/specs/SPEC.md#3-identidade-visual-e-direção-de-design"
  - ".ksdd/specs/SPEC.md#12-modelo-de-negócio-impacto-na-interface"
arch_refs:
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
---

# 057 — Doc canônico da 1ª integração (`references/integrations/impeccable.md`)

## Objetivo
Escrever o documento de integração do impeccable — o exemplo de referência da convenção (task 056) e a fonte única citada por `commands/design.md`, `commands/build:feature.md` e `references/design-md-spec.md`.

## Escopo
Criar `references/integrations/impeccable.md` cobrindo:
- **O que é o impeccable** (`pbakaus/impeccable`, Apache-2.0, Node 22.12+): camada de craft/QA que lê/escreve o mesmo `DESIGN.md` Google Stitch; 23 commands, 59 regras anti-slop, hooks nos edits de UI. O usuário o instala por conta (`npx impeccable install` / marketplace) — o KSDD **não** o empacota nem depende dele.
- **Quando acionar cada command por fase:**
  - Design (fim do `/ksdd:design`): `/impeccable craft|audit|polish|live`.
  - Build (tasks de UI no `/ksdd:build:feature`): `/impeccable shape|critique` **antes** de implementar, `/impeccable audit|polish` **depois**.
- **Garantia de compat:** mesmo formato Google Stitch dos dois lados; o contrato objetivo é **passar `npx @google/design.md lint .ksdd/specs/DESIGN.md`** = compat.
- **Path bridge:** o impeccable espera `DESIGN.md`/`PRODUCT.md` na **raiz**; o KSDD grava em `.ksdd/specs/`. Documentar a ponte confiável:
  - `ln -s .ksdd/specs/DESIGN.md DESIGN.md` (ou `cp`; idem `PRODUCT.md`).
  - **Verificar na doc do impeccable** se ele aceita flag de path (ex. `--path .ksdd/specs`); se sim, documentar como alternativa ao symlink. Default: symlink/`cp` a partir de `.ksdd/specs/` (mantém a convenção KSDD como fonte da verdade).
- **Mapeamento SPEC → PRODUCT.md** (formato do impeccable), derivado de Personas + Modelo de Negócio + Identidade Visual:
  - `Users` ← Personas (SPEC seção 2)
  - `Mode` (`brand` | `product`) ← Modelo de Negócio + natureza do produto (SPEC seções 1, 12)
  - `Brand voice` ← Identidade Visual / Personalidade da Marca (SPEC seção 3)
  - `Anti-references` ← Diferenciais / o que evitar (brainstorm + SPEC)
  - A geração respeita `references/language-policy.md`.
- **Slop detector como gate:** receita `npx impeccable detect <ui-paths>` — opt-in, não bloqueante.
- **Frasado condicional** em todo o doc ("se você usa o impeccable…").

## Fora de escopo
- Alterar o formato do `DESIGN.md` (permanece Google Stitch inalterado).
- Editar os commands (tasks 058, 059) — este doc é só a fonte referenciada.
- Vendorizar qualquer conteúdo do impeccable.

## Critérios de aceitação
- [ ] `references/integrations/impeccable.md` existe e segue a estrutura da convenção (task 056).
- [ ] Cobre: o que é + commands por fase (design vs build).
- [ ] Documenta a garantia de compat via `@google/design.md lint`.
- [ ] Documenta o path bridge (symlink/`cp` + nota "verificar flag `--path` na doc do impeccable").
- [ ] Traz a tabela de mapeamento SPEC → PRODUCT.md (Users, Mode, Brand voice, Anti-references).
- [ ] Traz a receita do slop detector como gate opcional.
- [ ] Todo o texto é condicional/opt-in.
- [ ] Nenhum conteúdo do impeccable é copiado (só links/referências).

## Notas técnicas
- Conteúdo puro (sem `bin/ksdd.js`). Distribuído via `copyDir` (ver task 056).
- Na implementação, confirmar o nome/superfície reais dos commands do impeccable e a existência (ou não) da flag de path consultando a doc oficial do `pbakaus/impeccable`; se um detalhe não puder ser confirmado, marcar `[verificar]` em vez de afirmar.
- Este é o arquivo verificado no CA da feature: "gerar DESIGN.md de exemplo e rodar `@google/design.md lint`" (task 064).

## Riscos / dependências externas
- **Externa:** disponibilidade/estabilidade da doc do impeccable para confirmar nomes de commands e a flag `--path`. Mitigação: default symlink/`cp`; marcar `[verificar]` onde não confirmado.
