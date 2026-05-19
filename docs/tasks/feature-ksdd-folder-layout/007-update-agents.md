---
id: 007
title: Atualizar agents (critic, interviewer, setup-analyst) com novos paths
status: em revisão
feature: ksdd-folder-layout
area: backend
priority: P1
estimate: S
depends_on: []
feature_refs:
  - "docs/FEATURE-ksdd-folder-layout.md#2-escopo"
spec_refs:
  - "SPEC.md#8-componentes-globais-reutilizaveis"
arch_refs: []
---

# 007 — Atualizar agents com referências de path

## Objetivo
Sincronizar os 3 agents helpers (critic, interviewer, setup-analyst) com o novo layout `.ksdd/`, atualizando referências internas a paths de artefatos.

## Escopo
- `agents/critic.md`: atualizar menções a `SPEC.md`, `brainstorm.md`, `docs/FEATURE-` em checklists e exemplos.
- `agents/interviewer.md`: atualizar exemplos de path.
- `agents/setup-analyst.md`: atualizar refs aos artefatos gerados pela Fase 4 do `/ksdd:setup`.
- `agents/consolidator.md`: revisar (parece já genérico, mas confirmar).

## Fora de escopo
- Mudar comportamento dos agents (só strings de path).
- Adicionar agents novos.

## Critérios de aceitação
- [ ] Grep `grep -rn "SPEC\.md\|brainstorm\.md\|architecture\.md\|DESIGN\.md\|docs/FEATURE-" agents/` só retorna em blocos de fallback/legado ou paths novos.
- [ ] `agents/critic.md` cita `.ksdd/specs/SPEC.md` em checklist de quality.
- [ ] `agents/setup-analyst.md` recebe artefatos com paths novos como output esperado.

## Notas técnicas
- `agents/consolidator.md` pode não precisar de mudança (é stylistic helper) — checar antes de editar.
- Manter prioridade P1: agents não bloqueiam fluxo principal, mas precisam estar consistentes pra evitar confusão futura.

## Riscos / dependências externas
- Nenhuma — paralelo.
