---
id: 041
title: SPEC.md — seções 4.1, 7, 7.1, 11 e 13 com GitHub Copilot
status: em revisão
feature: github-copilot-integration
area: design
priority: P0
estimate: M
depends_on: []
feature_refs:
  - ".ksdd/features/FEATURE-github-copilot-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-github-copilot-integration.md#5-impacto-em-telas-existentes"
  - ".ksdd/features/FEATURE-github-copilot-integration.md#4-fluxos-de-uso"
spec_refs:
  - ".ksdd/specs/SPEC.md#41-manifest-de-instalação-ksdd-manifestjson"
  - ".ksdd/specs/SPEC.md#71-cli-binksddjs"
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
  - ".ksdd/specs/SPEC.md#13-fluxos-críticos-user-journeys"
  - ".ksdd/specs/SPEC.md#14-fases-de-entrega"
arch_refs: []
---

# 041 — `SPEC.md`: seções de Copilot

## Objetivo
Refletir o quinto target no contrato de produto: manifest, superfície CLI, nova subseção de superfície Copilot, comportamentos de preservação e fluxo de instalação.

## Escopo
- **Seção 4.1 (manifest):** adicionar `copilot` ao objeto `targets` do exemplo JSON.
- **Seção 7.1 (comandos CLI):** adicionar linhas de `ksdd install --copilot`, `ksdd install --copilot --project` e o exemplo dos 5 targets (`--codex --opencode --antigravity --copilot`); atualizar a lista de flags e env vars (`--copilot`, `--project`, `KSDD_WITH_COPILOT`, `COPILOT_HOME`).
- **Nova subseção 7.7 (Prompt files GitHub Copilot):** descrever que os 9 commands ficam como `ksdd-*.prompt.md` no perfil VS Code (paths por SO), invocáveis como `/ksdd-start` etc. no Copilot Chat; chat mode `ksdd.chatmode.md`; modo `--project` (`.github/prompts/`); placeholder CLI (`~/.copilot/`) com nota de que o CLI ainda não consome comandos custom; bundle em `<vscode-user>/ksdd/`.
- **Seção 11 (comportamentos):** adicionar "`install` sem `--copilot` preserva instalação Copilot anterior"; nota sobre `--project` gravar em `.github/` do repo só com flag explícita.
- **Seção 13 (fluxos):** adicionar/atualizar o fluxo de adicionar Copilot em instalação existente (espelha 13.6/13.7); atualizar 13.1 (onboarding) para citar `KSDD_WITH_COPILOT` e `/ksdd-start` no Copilot.
- **Seção 14 (Fase 5):** marcar "Suporte a GitHub Copilot (entregue v0.10.0)"; ajustar a linha de cobertura de agents (5 targets).
- **Seção 7.5/7.6 (bundles):** se necessário, citar o bundle Copilot junto dos demais para consistência.

## Fora de escopo
- Código do instalador (tasks 035-038).
- ADRs em `architecture.md` (task 040).
- README/INSTALL/CHANGELOG (task 042).

## Critérios de aceitação
- [ ] Seção 4.1 mostra `copilot` no exemplo de `targets`.
- [ ] Seção 7.1 documenta `--copilot`, `--project`, e o exemplo dos 5 targets; env vars atualizadas.
- [ ] Nova subseção 7.7 descreve as superfícies Copilot (prompt files por SO, chat mode, project, CLI placeholder, bundle).
- [ ] Seção 11 tem a regra de preservação do Copilot e a nota do `--project`.
- [ ] Seção 13 cobre o fluxo de adicionar Copilot; 13.1 cita Copilot no onboarding.
- [ ] Seção 14 (Fase 5) marca Copilot entregue (v0.10.0).
- [ ] Consistência de numeração/estilo com as subseções 7.4/7.5 existentes.

## Notas técnicas
- Espelhar como a feature Antigravity atualizou o SPEC (subseção 7.5, fluxo 13.7) — mesma granularidade.
- Manter a nota de path OS-específico (novidade vs targets anteriores) na subseção nova.

## Riscos / dependências externas
- Nenhuma dependência de código; paralelizável.
