---
id: 032
title: Atualizar SPEC.md + architecture.md (ADR-011) com a nova feature
status: para implementar
feature: figma-integration
area: backend
priority: P1
estimate: S
depends_on: [028, 031]
feature_refs:
  - ".ksdd/features/FEATURE-figma-integration.md#5-impacto-em-telas-existentes"
  - ".ksdd/features/FEATURE-figma-integration.md#7-impacto-na-api"
  - ".ksdd/features/FEATURE-figma-integration.md#10-critérios-de-aceite"
spec_refs:
  - ".ksdd/specs/SPEC.md#7-estrutura-de-páginas-e-telas"
  - ".ksdd/specs/SPEC.md#14-fases-de-entrega"
arch_refs:
  - ".ksdd/specs/architecture.md#5-integrações-externas"
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
  - ".ksdd/specs/architecture.md#12-roadmap-de-implementação"
---

# 032 — Atualizar SPEC.md + architecture.md (ADR-011)

## Objetivo
Refletir a feature `figma-integration` nos artefatos canônicos do projeto: SPEC §7 lista o novo command e §14 Fase 6 marca o exportador como entregue; architecture §5/§12 documentam a dependência do MCP oficial Figma e ganham ADR-011 explicando a decisão de orquestração via MCP.

## Escopo
- **`.ksdd/specs/SPEC.md`:**
  - §7.2 — adicionar `ksdd:figma:export` à lista de slash commands Claude.
  - §7.3 — adicionar `ksdd-figma-export` aos Codex prompts.
  - §7.4 — adicionar `ksdd-figma-export` aos opencode commands.
  - §13 — adicionar fluxo crítico "13.7 Export de tokens para Figma" (3-5 passos do fluxo principal — referenciar FEATURE §4.1).
  - §14 Fase 6 — alterar "Exportador para Figma (de DESIGN.md Google Stitch)" de pendente para **Entregue (v0.9.0, DD/MM/AAAA)**.
- **`.ksdd/specs/architecture.md`:**
  - §5 (Integrações Externas) — adicionar linha "MCP oficial do Figma — orquestrado pelos commands, instalado pelo usuário, auth via PAT do MCP".
  - §10 — adicionar **ADR-011: Orquestrar MCP oficial do Figma em vez de runtime próprio**. Cobrir: evidência (commands invocam tools do MCP de terceiro; bin/ksdd.js não recebe deps), decisão, confiança, consequência (aderência a ADR-001/ADR-003 preservada; trade-off: usuário precisa instalar MCP separadamente).
  - §11 (Riscos Técnicos) — adicionar 1-2 linhas sobre risco de breaking change na API do MCP do Figma.
  - §12 Fase 6 — marcar `Exportador DESIGN.md → Figma` como concluído.
- Manter `Status: Rascunho` dos dois documentos (não promover para Aprovado nesta task — quem aprova é o mantenedor).

## Fora de escopo
- Mudanças no README/CHANGELOG/package.json (cobertas por T-033).
- Atualizar `brainstorm.md` ou `DESIGN.md` (projeto não tem DESIGN.md próprio).
- Adicionar métricas reais na §15 do SPEC — só referenciar as métricas declaradas no FEATURE §1.3.

## Critérios de aceitação
- [ ] SPEC.md §7.2, §7.3 e §7.4 listam o command novo nos formatos corretos (`ksdd:figma:export` / `ksdd-figma-export`).
- [ ] SPEC.md §13 tem fluxo 13.7 com 3-5 passos do export.
- [ ] SPEC.md §14 Fase 6 marca o exportador para Figma como **Entregue (v0.9.0)**.
- [ ] architecture.md §5 lista MCP oficial Figma como integração externa (orquestrada, não embutida).
- [ ] architecture.md §10 tem **ADR-011** com seções Evidência / Decisão / Confiança / Consequência.
- [ ] architecture.md §11 lista o risco de breaking change da API do MCP do Figma com mitigação.
- [ ] architecture.md §12 Fase 6 marca o exportador como concluído.
- [ ] Status dos dois documentos continua "Rascunho" (atualização é do mantenedor).
- [ ] Atualizações usam str_replace (cirúrgico) — não reescrever seções inteiras.

## Notas técnicas
- Datar a entrega como `27/05/2026` (ou data efetiva do merge da branch).
- ADR-011 reforça por que **não** usamos REST API direta (quebraria ADR-001/ADR-003) — citar explicitamente ADR-001 e ADR-003 como decisões precedentes.
- Seguir o tom dos ADRs existentes (1-2 frases por seção, evidência cita arquivo + linha).

## Riscos / dependências externas
- T-028 e T-031 já devem ter mergedo antes desta atualização para SPEC/architecture refletirem o estado real do código.
