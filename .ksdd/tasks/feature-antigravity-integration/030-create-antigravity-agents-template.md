---
id: 030
title: Criar references/antigravity-AGENTS.md (template bundlado)
status: para implementar
feature: antigravity-integration
area: data-model
priority: P0
estimate: S
depends_on: []
feature_refs:
  - ".ksdd/features/FEATURE-antigravity-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-antigravity-integration.md#5-impacto-em-telas-existentes"
spec_refs:
  - ".ksdd/specs/SPEC.md#75-skill-instalada"
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs:
  - ".ksdd/specs/architecture.md#33-templates-canônicos-references"
---

# 030 — Criar `references/antigravity-AGENTS.md`

## Objetivo
Criar o template novo `references/antigravity-AGENTS.md` (~20-40 linhas) que o instalador copia para `~/.gemini/ksdd/AGENTS.md`. Dá ao agente Antigravity o contexto canônico pra invocar os commands KSDD corretamente. Sem ele, a task 028 não tem o que copiar.

## Escopo
- Criar `references/antigravity-AGENTS.md` espelhando `references/opencode-AGENTS.md`, adaptado ao estilo Antigravity.
- Conteúdo mínimo:
  - Que os templates canônicos estão em `./references/` (relativo a `~/.gemini/ksdd/`).
  - Que os agents auxiliares (`interviewer`, `consolidator`, `critic`) estão em `./agents/`.
  - Que os skills em `~/.gemini/antigravity-cli/skills/ksdd-*.md` e `~/.gemini/antigravity/skills/ksdd-*.md` esperam achar esses arquivos via referência relativa ao bundle.
  - Convenção de **aprovação obrigatória nos checkpoints** (commands KSDD param e pedem confirmação explícita — espelha `references/codex-SKILL.md` / `opencode-AGENTS.md`).
  - Convenção de idioma: seguir `references/language-policy.md` (idioma da conversa).
- Sem frontmatter especial; Markdown puro.

## Fora de escopo
- A cópia desse arquivo no install (task 028).
- Atualizar README/INSTALL (task 033).

## Critérios de aceitação
- [ ] `references/antigravity-AGENTS.md` existe, com 20-40 linhas.
- [ ] Cita `./references/` e `./agents/` como contexto canônico relativo ao bundle.
- [ ] Documenta a convenção de aprovação obrigatória nos checkpoints.
- [ ] Aponta os dois paths de skills (CLI + IDE) onde os commands ficam.
- [ ] Sem emojis (convenção do projeto — SPEC seção 3.4); voz ativa.
- [ ] Coerente em tom com `references/opencode-AGENTS.md` (usar como base de comparação).

## Notas técnicas
- Reaproveitar a estrutura de `references/opencode-AGENTS.md` (entregue na feature opencode, task 022) — trocar referências a opencode/`~/.config/opencode/` por Antigravity/`~/.gemini/`.
- O arquivo é agent-agnóstico no conteúdo dos templates; só o "onde achar" muda.

## Riscos / dependências externas
- Nenhuma. Task independente (sem `depends_on`) — pode/deve ser feita primeiro, pois 028 depende dela.
