---
id: 036
title: Criar references/fix-template.md (template canônico do FIX doc)
status: em revisão
feature: new-fix-command
area: backend
priority: P0
estimate: M
depends_on: []
feature_refs:
  - ".ksdd/features/FEATURE-new-fix-command.md#52-superfícies-novas"
  - ".ksdd/features/FEATURE-new-fix-command.md#61-novas-entidades-artefatos"
spec_refs:
  - ".ksdd/specs/SPEC.md#43-templates-canônicos-references"
arch_refs:
  - ".ksdd/specs/architecture.md#3-modelo-de-dados-schemas"
---

# 036 — Criar `references/fix-template.md`

## Objetivo
Criar o template canônico do artefato `FIX-[slug].md`, análogo a `references/feature-template.md` mas orientado a diagnóstico de bug: bug, reprodução, root cause com evidência, blast radius, ajuste proposto, critérios de verificação e estratégia de teste de regressão. Lido pelo `/ksdd:new:fix` para preencher cada investigação de forma consistente.

## Escopo
- Criar `references/fix-template.md` com header (placeholders `[SLUG]`, `[TITLE]`, `[SEVERITY]`, `[STATUS]`, `[DATE]`, `[PROJECT]`) e as seções canônicas:
  1. **Bug** — o que acontece × o que deveria acontecer.
  2. **Reprodução** — passos determinísticos; comando/teste que dispara.
  3. **Root cause** — hipótese + evidência `arquivo:linha`. Marcar "[investigação incompleta]" quando não reproduzível.
  4. **Componentes afetados / blast radius** — o que o ajuste toca e o que pode quebrar.
  5. **Ajuste proposto** — o quê, não o código completo. Caminho escolhido (inline vs build:fix) registrado aqui.
  6. **Critérios de verificação** — checklist binário de "como sei que corrigiu".
  7. **Estratégia de teste de regressão** — o teste que falha-antes/passa-depois.
  8. **Riscos do ajuste** — regressões possíveis, mitigação.
  9. **Referências** — SPEC/architecture/FEATURE/issue afetados.
- Placeholders neutros de idioma (o template é preenchido no idioma resolvido por `references/language-policy.md`).
- Incluir um exemplo curto preenchido (ou bloco comentado) para orientar o agente, à semelhança de outros templates de `references/`.
- Campo de **severidade** (Crítica / Alta / Média / Baixa) ligada a impacto no usuário — distinto de "prioridade" de task.

## Fora de escopo
- O command que consome o template (task 035).
- Formato das tasks de fix (embutido no command 035, reusa o formato de feature task).
- Distribuição via instalador (task 038 — `copyDir` de `references/` já cobre; verificar).

## Critérios de aceitação
- [ ] `references/fix-template.md` existe com as 9 seções canônicas + header com placeholders.
- [ ] Seção de root cause exige evidência `arquivo:linha` e suporta o estado "[investigação incompleta]".
- [ ] Seção de teste de regressão deixa claro o critério falha-antes/passa-depois.
- [ ] Campo de severidade presente e distinto de prioridade de task.
- [ ] Placeholders neutros de idioma; exemplo/orientação de preenchimento incluído.
- [ ] Consistente em tom e estrutura com `references/feature-template.md`.

## Notas técnicas
- Basear-se em `references/feature-template.md` (estrutura, estilo de placeholders, seção de referências).
- Distribuição: `references/` é copiado via `copyDir` nas funções `install*` de `bin/ksdd.js` — o template entra no bundle de skill de cada target automaticamente (confirmar na task 038).
- O `FIX-[slug].md` é read-only durante `/ksdd:build:fix` (mesma regra do FEATURE spec no build).

## Riscos / dependências externas
- Se o template ficar verboso demais, os FIX docs incham; manter enxuto (o valor está na evidência, não no boilerplate).
