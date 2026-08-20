---
id: 058
title: Atualizar commands/design.md — Step 7 (bloco impeccable) + passo 5.5 (PRODUCT.md)
status: em revisão
feature: impeccable-integration
area: backend
priority: P0
estimate: M
depends_on: [057]
feature_refs:
  - ".ksdd/features/FEATURE-impeccable-integration.md#41-handoff-design--impeccable-fluxo-principal"
  - ".ksdd/features/FEATURE-impeccable-integration.md#51-superfícies-modificadas"
  - ".ksdd/features/FEATURE-impeccable-integration.md#82-mapeamento-spec--productmd"
spec_refs:
  - ".ksdd/specs/SPEC.md#72-slash-commands-claude-code"
arch_refs:
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
---

# 058 — Handoff impeccable no `/ksdd:design`

## Objetivo
Expor o handoff design → craft/QA no ponto natural (fim do `/ksdd:design`): um bloco opt-in no checkpoint e um passo opcional que emite `PRODUCT.md`.

## Escopo
Editar `commands/design.md`:
- **Step 7 (checkpoint):** adicionar bloco "Integração impeccable (opcional)" — como o `DESIGN.md` já é Google Stitch, apontar `/impeccable craft|audit|polish|live` + o path bridge, referenciando `references/integrations/impeccable.md`. Frasado condicional ("se você usa o impeccable…").
- **Novo passo opcional 5.5:** se o usuário optar pelo impeccable, também emitir `PRODUCT.md` a partir de SPEC/brainstorm/personas, conforme o mapeamento no doc de integração (Users, Mode `brand|product`, Brand voice, Anti-references), respeitando `references/language-policy.md`. O passo é **opt-in/gated** — não roda por padrão e não bloqueia quem não usa impeccable.
- Garantir que o passo 5.5 e o bloco do Step 7 apontem para `references/integrations/impeccable.md` como fonte da lógica (não duplicar o mapeamento inteiro dentro do command).

## Fora de escopo
- Alterar a geração do `DESIGN.md` em si (permanece spec-driven, formato Google Stitch — inalterado).
- Tornar o impeccable obrigatório ou adicionar detecção rígida.
- Escrever o conteúdo do mapeamento SPEC→PRODUCT.md (vive no doc, task 057).

## Critérios de aceitação
- [ ] `commands/design.md` Step 7 tem o bloco "Integração impeccable (opcional)" com `/impeccable craft|audit|polish|live` + path bridge + pointer para `references/integrations/impeccable.md`.
- [ ] Existe o passo opcional 5.5 que emite `PRODUCT.md` a partir de SPEC/brainstorm/personas, gated no opt-in do usuário.
- [ ] O passo 5.5 respeita `references/language-policy.md`.
- [ ] Todo o conteúdo novo é condicional/opt-in — dry-run mental sem impeccable termina o `/ksdd:design` normalmente.
- [ ] Numeração/estrutura dos steps existentes do command permanece coerente (5.5 encaixa sem quebrar 5→6→7).

## Notas técnicas
- Conteúdo puro; nenhuma mudança em `bin/ksdd.js`.
- Manter o `DESIGN.md` como fonte da verdade em `.ksdd/specs/`; o `PRODUCT.md` também é gravado no padrão KSDD e exposto ao impeccable via path bridge (documentado no doc de integração).
- Não duplicar o mapeamento — referenciar `references/integrations/impeccable.md`.

## Riscos / dependências externas
- Depende do doc de integração (057) já existir para o pointer resolver. Baixo risco de conteúdo.
