---
id: 056
title: Criar references/integrations/README.md (convenção de integrações)
status: para implementar
feature: impeccable-integration
area: backend
priority: P0
estimate: S
depends_on: []
feature_refs:
  - ".ksdd/features/FEATURE-impeccable-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-impeccable-integration.md#52-superfícies-novas"
  - ".ksdd/features/FEATURE-impeccable-integration.md#43-adicionar-a-próxima-integração-convenção"
spec_refs:
  - ".ksdd/specs/SPEC.md#43-templates-canônicos-references"
arch_refs:
  - ".ksdd/specs/architecture.md#1-visão-geral-da-arquitetura"
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
---

# 056 — Semente da convenção de integrações (`references/integrations/README.md`)

## Objetivo
Criar o documento que define a **convenção de integrações** do KSDD — o padrão reaproveitável que o impeccable inaugura e que Figma/v0/Pencil seguirão depois. É a fundação conceitual referenciada por todas as outras tasks desta feature.

## Escopo
Criar `references/integrations/README.md` cobrindo:
- **O que é a convenção:** integrações do KSDD são **sempre handoff/opt-in**, nunca dependência de código. O KSDD nunca faz `require(<tool>)` nem entra em `package.json` (preserva ADR-001 zero-dep e ADR-003 conteúdo estático).
- **Conteúdo obrigatório de um doc de integração** (`references/integrations/<tool>.md`): o que é a ferramenta e quando acioná-la por fase (design vs build); a garantia de compat de formato (quando aplicável); o path bridge (se a ferramenta espera artefatos em local diferente de `.ksdd/specs/`); mapeamento de artefatos KSDD → artefatos da ferramenta; e receitas de uso (gates/commands).
- **Distribuição:** explica que `references/` é copiado recursivamente por `copyDir` para o bundle de cada target, então `references/integrations/*.md` cai automaticamente nos 5 targets **sem tocar `bin/ksdd.js`** (nem `COMMAND_FILES`, nem função `install*`).
- **Princípio da neutralidade de licença:** só linkar/referenciar a ferramenta externa; **não** vendorizar conteúdo dela (mantém fronteiras de licença limpas).
- **Como adicionar a próxima integração:** passo a passo curto (criar `references/integrations/<tool>.md` seguindo `impeccable.md` como exemplo; zero CLI change).
- **Frasado condicional/opt-in obrigatório:** toda orientação de integração deve ser "se você usa <tool>…" para nunca quebrar o fluxo de quem não a tem.

## Fora de escopo
- O doc do impeccable em si (task 057).
- Edições em `commands/` (tasks 058, 059).
- ADR-014 / CLAUDE.md (task 061).

## Critérios de aceitação
- [ ] `references/integrations/README.md` existe.
- [ ] Define explicitamente: handoff/opt-in, nunca dependência de código; sem framework de plugins no CLI.
- [ ] Lista o conteúdo obrigatório de um doc de integração.
- [ ] Explica a distribuição via `copyDir` (zero mudança em `bin/ksdd.js`).
- [ ] Explica o princípio de não-vendorização (fronteira de licença).
- [ ] Tem a seção "como adicionar a próxima integração" (Figma/v0/Pencil).
- [ ] Segue `references/language-policy.md` (idioma da conversa; docs do repo em pt-BR técnico).

## Notas técnicas
- É conteúdo puro — nenhuma edição em `bin/ksdd.js`. O subdiretório `references/integrations/` é distribuído recursivamente pelas 5 funções `installX` via `copyDir(references, …)` (ver `.ksdd/features/FEATURE-impeccable-integration.md` seção 7.2 para os paths de destino por target).
- Precedente de conteúdo-only sem novo target: ADR-013 (`new:fix`/`build:fix` como commands de conteúdo).
- Este README é a base referenciada pelo ADR-014 (task 061).

## Riscos / dependências externas
- Nenhuma. Task fundacional sem dependências.
