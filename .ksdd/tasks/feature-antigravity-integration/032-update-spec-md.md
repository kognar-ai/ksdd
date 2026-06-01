---
id: 032
title: SPEC.md — seções 7.1 (CLI) e 13 (fluxos) com Antigravity
status: para implementar
feature: antigravity-integration
area: design
priority: P0
estimate: S
depends_on: []
feature_refs:
  - ".ksdd/features/FEATURE-antigravity-integration.md#4-fluxos-de-uso"
  - ".ksdd/features/FEATURE-antigravity-integration.md#71-novas-rotas-cli"
spec_refs:
  - ".ksdd/specs/SPEC.md#71-cli-binksddjs"
  - ".ksdd/specs/SPEC.md#13-fluxos-críticos-user-journeys"
  - ".ksdd/specs/SPEC.md#14-fases-de-entrega"
arch_refs: []
---

# 032 — `SPEC.md`: seções 7.1 e 13 com Antigravity

## Objetivo
Atualizar o SPEC para refletir Antigravity como quarto target invocável, mantendo o documento mestre coerente com a capacidade entregue.

## Escopo
- **Seção 7.1 (comandos CLI):** adicionar `ksdd install --antigravity` e a combinação `--codex --opencode --antigravity` na tabela; incluir `--antigravity` na lista de flags e `KSDD_WITH_ANTIGRAVITY` / `ANTIGRAVITY_HOME` nas env vars.
- **Nova subseção (7.x) "Skills Antigravity"** análoga a 7.4 (opencode): explica que após `ksdd install --antigravity`, os commands ficam em `~/.gemini/antigravity-cli/skills/ksdd-*.md` (TUI) e `~/.gemini/antigravity/skills/ksdd-*.md` (IDE), invocáveis como `/ksdd-start` etc., e o bundle em `~/.gemini/ksdd/`.
- **Seção 13 (fluxos):** atualizar 13.1 (onboarding) pra citar Antigravity como opção de agente; adicionar fluxo 13.x "Adicionar Antigravity em instalação existente" (espelha 13.6 do opencode).
- **Seção 14 (fases):** marcar Antigravity na Fase 5 (entregue v0.9.0).
- Atualizar a versão do manifest citada (4.1) para `0.9.0` se aplicável.

## Fora de escopo
- architecture.md (task 031); README/INSTALL/CHANGELOG (task 033); código (028/029).

## Critérios de aceitação
- [ ] Seção 7.1 lista `--antigravity`, `KSDD_WITH_ANTIGRAVITY`, `ANTIGRAVITY_HOME` e a combinação dos 4 targets.
- [ ] Existe subseção descrevendo skills Antigravity (CLI + IDE) e o bundle, análoga à 7.4 do opencode.
- [ ] Seção 13 cita Antigravity no onboarding e tem fluxo de "adicionar Antigravity em instalação existente".
- [ ] Seção 14 (Fase 5) marca Antigravity entregue (v0.9.0).
- [ ] Edições cirúrgicas (`str_replace`), sem reescrever seções não afetadas.

## Notas técnicas
- Usar a seção 7.4 (opencode) e o fluxo 13.6 do SPEC como molde direto.
- Manter o tom do SPEC (technical, voz ativa, sem emojis).

## Riscos / dependências externas
- Nenhuma externa. Coordenar paths com task 028.
