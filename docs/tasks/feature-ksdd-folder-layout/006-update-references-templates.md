---
id: 006
title: Atualizar templates em references/ com paths .ksdd/
status: para implementar
feature: ksdd-folder-layout
area: backend
priority: P0
estimate: M
depends_on: []
feature_refs:
  - "docs/FEATURE-ksdd-folder-layout.md#2-escopo"
  - "docs/FEATURE-ksdd-folder-layout.md#5-impacto-em-telas-existentes"
spec_refs:
  - "SPEC.md#43-templates-canonicos-references"
arch_refs: []
---

# 006 — Atualizar templates canônicos em `references/`

## Objetivo
Garantir que todos os 8 templates canônicos referenciem paths `.ksdd/...` em exemplos, refs cruzadas e instruções, para que artefatos gerados a partir deles já saiam no novo padrão.

## Escopo
- `references/feature-template.md`: rodapé "Referências:" + seções 5/6/7/8 com refs cruzadas (atualizar `SPEC.md` → `.ksdd/specs/SPEC.md`, `docs/FEATURE-` → `.ksdd/features/FEATURE-`).
- `references/build-plan-template.md`: paths exemplo apontam para `.ksdd/`.
- `references/spec-template.md`: instrução de salvar em `.ksdd/specs/SPEC.md`.
- `references/architecture-template.md`: idem para `.ksdd/specs/architecture.md`.
- `references/brainstorm-template.md`: idem para `.ksdd/specs/brainstorm.md`.
- `references/design-md-spec.md`: instrução de salvar em `.ksdd/specs/DESIGN.md`.
- `references/approval-gates.md`: cada gate (1-7) atualizado mencionando paths novos.
- `references/codex-SKILL.md`: triggers e exemplos de invocação alinhados.

## Fora de escopo
- Mudar estrutura interna de qualquer template (só paths).
- Mudar gates em si — só a menção a paths dentro deles.

## Critérios de aceitação
- [ ] Grep `grep -rn "^SPEC\.md\|^brainstorm\.md\|^architecture\.md\|^DESIGN\.md\|^BUILD-PLAN\.md\|docs/FEATURE-" references/` só retorna em blocos explícitos de "(legado / fallback)".
- [ ] Todos os 8 templates citam `.ksdd/...` em pelo menos uma instrução de path.
- [ ] `references/approval-gates.md` mantém os 7 gates com numeração e fluxo iguais; só paths mudaram.
- [ ] `references/codex-SKILL.md` continua válido como SKILL.md (frontmatter `name`/`description` intactos).

## Notas técnicas
- Templates são "imutáveis no escopo do consumidor" (SPEC seção 4.3) — alteração feita upstream no repo do KSDD. Bumps de versão do KSDD propagam via reinstall.
- Em design-md-spec.md cuidar para não quebrar a referência canônica ao Google Stitch (ADR-008).

## Riscos / dependências externas
- Paralelo com tasks 001-005 — não conflita.
