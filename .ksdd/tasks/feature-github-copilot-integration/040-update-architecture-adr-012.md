---
id: 040
title: architecture.md — ADR-012 + atualizar ADR-011 + diagrama + roadmap + riscos
status: em revisão
feature: github-copilot-integration
area: design
priority: P0
estimate: S
depends_on: []
feature_refs:
  - ".ksdd/features/FEATURE-github-copilot-integration.md#1-motivação"
  - ".ksdd/features/FEATURE-github-copilot-integration.md#22-o-que-fica-pra-depois"
  - ".ksdd/features/FEATURE-github-copilot-integration.md#9-dependências-e-riscos"
spec_refs: []
arch_refs:
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
  - ".ksdd/specs/architecture.md#11-riscos-técnicos"
  - ".ksdd/specs/architecture.md#12-roadmap-de-implementação"
  - ".ksdd/specs/architecture.md#1-visão-geral-da-arquitetura"
---

# 040 — `architecture.md`: ADR-012 + atualizações

## Objetivo
Registrar formalmente a decisão da 5ª cópia hardcoded (`installCopilot`) e o adiamento reforçado do refator `installTarget`, além de atualizar diagrama, roadmap e riscos para incluir o Copilot como quinto target.

## Escopo
- **Adicionar ADR-012** em `architecture.md` seção 10:
  - Título: "Quinto target (GitHub Copilot) hardcoded — refator `installTarget` vira pré-requisito inescapável antes do 6º target".
  - Evidência: `installCopilot()` como cópia adaptada de `installAntigravity`, distribuindo prompt files no perfil VS Code por SO + chat mode + CLI placeholder + modo `--project`.
  - Decisão: aceitar a **quinta cópia** para capturar o maior público (Copilot) antes de pagar a dívida; o refator continua feature dedicada, agora **inescapável antes do 6º target** (Cursor/Windsurf/Cline).
  - Confiança: alta (decisão explícita do mantenedor no checkpoint — hardcoded + 4 superfícies + Alta/minor).
  - Consequência: entrega rápida do target de maior alcance; dívida sobe para **5 funções `install*` duplicadas** (~250 linhas a mais); risco novo específico: resolução de path por SO e prune sob o `User/` compartilhado do VS Code.
- **Atualizar ADR-011** com nota de continuidade: o gatilho "antes do 5º target" foi conscientemente não cumprido; ADR-012 o substitui por "inescapável antes do 6º target".
- **Atualizar ADR-010** (opcional) só se necessário para coerência da cadeia.
- **Diagrama (seção 1):** adicionar o bloco GitHub Copilot (target: copilot) com paths por SO + `.github/` (project) + `~/.copilot/` (CLI placeholder) + bundle `<vscode-user>/ksdd/`.
- **Seção 3.1 (manifest schema):** adicionar `copilot: [...]` ao exemplo de `targets`.
- **Seção 4.3 (funções internas):** adicionar `installCopilot(tracked, out)` e `resolveVscodeUserDir()`.
- **Seção 4.2 (env vars):** adicionar `COPILOT_HOME` e `KSDD_WITH_COPILOT`.
- **Seção 11 (riscos):** adicionar risco de path por SO, prune sob `User/` compartilhado, e a 5ª cópia duplicada.
- **Seção 12 (roadmap Fase 5):** marcar Copilot como entregue (v0.10.0); reforçar que o refator `installTarget` é obrigatório antes do 6º target.

## Fora de escopo
- Código do instalador (tasks 035-038).
- Atualização do `SPEC.md` (task 041) e README/CHANGELOG (task 042).

## Critérios de aceitação
- [ ] ADR-012 existe em `architecture.md` com evidência, decisão, confiança e consequência.
- [ ] ADR-011 tem nota de continuidade apontando para ADR-012.
- [ ] Diagrama da seção 1 inclui o bloco Copilot com as superfícies e paths.
- [ ] Seção 3.1 mostra `targets.copilot` no schema.
- [ ] Seção 4.2 documenta `COPILOT_HOME` e `KSDD_WITH_COPILOT`; seção 4.3 lista `installCopilot`/`resolveVscodeUserDir`.
- [ ] Seção 11 ganha os riscos de path por SO, prune sob `User/` e 5ª cópia.
- [ ] Seção 12 (Fase 5) marca Copilot entregue e reforça o gatilho do refator.
- [ ] Numeração e formato dos ADRs consistentes com ADR-010/011 existentes.

## Notas técnicas
- Espelhar o estilo do ADR-011 (que documentou o 4º target) — mesma estrutura de campos.
- Coerência com a FEATURE seção 2.2 (o que fica pra depois) e seção 9.2 (riscos).

## Riscos / dependências externas
- Nenhuma dependência de código; pode ser feita em paralelo com as tasks de backend.
