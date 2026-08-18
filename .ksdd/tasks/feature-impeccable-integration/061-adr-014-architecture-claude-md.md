---
id: 061
title: Registrar ADR-014 (convenção de integrações) em architecture.md + nota em CLAUDE.md
status: para implementar
feature: impeccable-integration
area: backend
priority: P1
estimate: S
depends_on: [056, 057]
feature_refs:
  - ".ksdd/features/FEATURE-impeccable-integration.md#23-o-que-não-é-essa-feature"
  - ".ksdd/features/FEATURE-impeccable-integration.md#7-impacto-na-api-superfície-cli"
  - ".ksdd/features/FEATURE-impeccable-integration.md#51-superfícies-modificadas"
spec_refs:
  - ".ksdd/specs/SPEC.md#14-fases-de-entrega"
arch_refs:
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
---

# 061 — ADR-014 + nota em CLAUDE.md

## Objetivo
Registrar a decisão arquitetural da convenção de integrações (conteúdo-only, sem framework de plugins) e orientar agentes futuros sobre `references/integrations/`.

## Escopo
- **`architecture.md` — ADR-014 "Convenção de integrações (soft addon), conteúdo-only":**
  - Evidência: feature impeccable-integration adiciona `references/integrations/README.md` + `references/integrations/impeccable.md` — distribuídos via `copyDir` recursivo, **sem** entrada em `COMMAND_FILES`, **sem** função `install*` nova, **zero** mudança em `bin/ksdd.js`.
  - Decisão: integrações são handoff/opt-in documentado, nunca dependência de código; **sem** framework/registry de plugins no CLI.
  - Por que não incorre na dívida ADR-010/011/012: não é um novo target de instalação nem novo command — logo **não** dispara o refator `installTarget(targetConfig)`; o gatilho do ADR-012 (refator inescapável antes do 6º target) permanece intocado. Mesmo espírito conteúdo-only do ADR-013.
  - Consequência: KSDD ganha capacidade de integração extensível a custo de conteúdo; a fronteira de licença (AGPL-3.0 × Apache-2.0) fica limpa por não-vendorização.
  - Confiança: alta (decisão explícita do mantenedor no checkpoint da feature).
  - Opcional: refletir a convenção na Fase 6 do roadmap (`architecture.md` seção 12 / SPEC seção 14) como nota leve — não obrigatório nesta task.
- **`CLAUDE.md`:** nota breve na estrutura do repositório / convenções sobre `references/integrations/` (integrações são conteúdo-only handoff/opt-in; distribuídas por `copyDir`; ver ADR-014), para agentes futuros.

## Fora de escopo
- README / CHANGELOG / bump de versão (task 062).
- Reescrever seções inteiras do SPEC (fora do escopo desta feature).

## Critérios de aceitação
- [ ] ADR-014 registrado em `architecture.md` seção 10, no formato dos ADRs existentes (Evidência / Decisão / Confiança / Consequência).
- [ ] ADR-014 explica por que a convenção **não** dispara o refator `installTarget` (ADR-010/011/012 intocados).
- [ ] `CLAUDE.md` tem a nota sobre `references/integrations/` para agentes futuros.
- [ ] Numeração de ADR correta (próximo após ADR-013).

## Notas técnicas
- Seguir o padrão de escrita dos ADRs anteriores em `architecture.md` seção 10.
- Precedente conteúdo-only: ADR-013 (`.ksdd/fixes/` como classe de artefato, sem novo `install*`).

## Riscos / dependências externas
- Depende de 056/057 existirem para citar os arquivos concretos no ADR. Baixo risco.
