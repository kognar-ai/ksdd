---
id: 025
title: Atualizar SPEC.md — seções 7.1 (CLI) e 13 (fluxos) com opencode
status: em revisão
feature: opencode-integration
area: design
priority: P0
estimate: S
depends_on: []
feature_refs:
  - ".ksdd/features/FEATURE-opencode-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-opencode-integration.md#4-fluxos-de-uso"
  - ".ksdd/features/FEATURE-opencode-integration.md#5-impacto-em-telas-existentes"
spec_refs:
  - ".ksdd/specs/SPEC.md#71-cli-binksddjs"
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
  - ".ksdd/specs/SPEC.md#13-fluxos-críticos-user-journeys"
  - ".ksdd/specs/SPEC.md#14-fases-de-entrega"
arch_refs: []
---

# 025 — `SPEC.md`: seções 7.1 (CLI) e 13 (fluxos) com opencode

## Objetivo
Atualizar `.ksdd/specs/SPEC.md` para refletir a nova capacidade `--opencode` nos comandos CLI, novos env vars, mensagens canônicas e os fluxos críticos de onboarding cross-agent. Sem isso, SPEC.md desincroniza da realidade após release.

## Escopo
- **Seção 4.1 (Manifest):** atualizar o exemplo JSON do manifest pra incluir `targets.opencode: [...]` e bumpar `version` pra `0.8.0`.
- **Seção 4.2 (Tabela de Artefatos KSDD):** sem mudança — feature não afeta artefatos gerados no projeto-alvo.
- **Seção 7.1 (CLI):** adicionar linhas à tabela:
  ```
  ksdd install --opencode             | Claude apenas + opencode
  ksdd install --codex --opencode     | Claude + Codex + opencode
  ```
  Adicionar `--opencode` à linha "Flags" e `KSDD_WITH_OPENCODE`, `OPENCODE_HOME` à linha "Env vars".
- **Seção 7.2 (Slash commands Claude):** sem mudança.
- **Seção 7.3 (Custom prompts Codex):** sem mudança.
- **NOVA seção 7.4 (após 7.3, renumerar antiga 7.4 → 7.5):** "Slash commands opencode" — descreve `~/.config/opencode/commands/ksdd-*.md` (global) e como são invocados como `/ksdd-start`, `/ksdd-spec`, etc. Cita que o bundle adicional em `~/.config/opencode/ksdd/` contém references/agents/AGENTS.md.
- **Seção 7.5 (antiga 7.4 — Skill instalada):** atualizar pra mencionar que opencode tem o equivalente bundle em `~/.config/opencode/ksdd/` (não chamado "skill" por convenção opencode, mas mesmo propósito funcional).
- **Seção 8 (Componentes Globais):** atualizar a linha do "Manifest writer/reader" pra mencionar `targets.opencode` no formato. Sem mudança no resto.
- **Seção 11 (Interações):** adicionar bullet "`install` sem `--opencode` preserva instalação opencode anterior" — espelha o bullet existente do Codex.
- **Seção 13.1 (Onboarding em projeto novo):** mencionar `KSDD_WITH_OPENCODE=1 npm install -g @kognar/ksdd` como alternativa válida, e `/ksdd-start` (opencode) como invocação equivalente.
- **NOVA seção 13.6 (após 13.5):** "Adicionar opencode em instalação existente" — passo-a-passo do FEATURE seção 4.2 (3-4 linhas). Trigger: `ksdd install --opencode`. Mostra preservação de Codex.
- **Seção 14 (Fases de Entrega):**
  - Atualizar Fase 5 de "Próximo" para "Em andamento (v0.8.0)" e listar opencode como primeiro entregável: `- Suporte a opencode (entregue v0.8.0, 26/05/2026)`.
  - Manter Cursor/Windsurf/Cline como pendentes na mesma Fase 5.
- Atualizar header: "Última atualização: 26/05/2026" e bumpar "Versão" para `1.1` (ou manter 1.0 + nota de delta — escolha tática; preferir 1.1).

## Fora de escopo
- Edições em `architecture.md` (task 024) ou `brainstorm.md` (não aplicável — brainstorm é histórico).
- Documentação package-side (README, INSTALL, CHANGELOG, package.json — task 026).
- Mudar `Status:` do SPEC.md de "Aprovado" para outra coisa — manter como está; updates incrementais são esperados.
- Refatoração estrutural do SPEC (numeração de seções fora das que mudaram).

## Critérios de aceitação
- [ ] Seção 4.1 exemplo de manifest tem `targets.opencode: [...]` e `version: "0.8.0"`.
- [ ] Seção 7.1 tabela lista `ksdd install --opencode` e `ksdd install --codex --opencode`.
- [ ] Seção 7.1 lista `--opencode` em flags e `KSDD_WITH_OPENCODE` + `OPENCODE_HOME` em env vars.
- [ ] Nova seção 7.4 "Slash commands opencode" existe com paths e exemplos de invocação.
- [ ] Antigas 7.4 e 7.5 renumeradas corretamente (sem buraco nem duplicata).
- [ ] Seção 11 tem bullet "`install` sem `--opencode` preserva instalação opencode anterior".
- [ ] Seção 13.1 menciona invocação opencode (`/ksdd-start` + env var).
- [ ] Nova seção 13.6 "Adicionar opencode em instalação existente" existe com 3-4 passos.
- [ ] Seção 14 Fase 5 mostra "Em andamento (v0.8.0)" com opencode marcado como entregue.
- [ ] Header tem "Última atualização: 26/05/2026" e versão bumpada (ou nota de delta).
- [ ] Links internos entre seções (referências cruzadas) ainda funcionam após renumeração de 7.x.
- [ ] Markdown válido — sem tabelas quebradas, sem listas mal-indentadas.

## Notas técnicas
- Edição cirúrgica via `Edit` (preserva resto do arquivo). Cuidado com renumeração: se inserir 7.4 nova, antiga 7.4 vira 7.5 e referências `(SPEC seção 7.4)` em outros documentos podem quebrar. **Grep prévio** em `.ksdd/`, `commands/`, `references/` pra encontrar "SPEC seção 7.4" e atualizar onde necessário.
- O FEATURE-archive-features.md também faz referências cruzadas — verificar se cita seções renumeradas.
- Texto do SPEC tem estilo direto, sem floreio (SPEC 3.1) — manter.

## Riscos / dependências externas
- Independente de código — pode rodar em paralelo com 020-023. Conveniente revisar **após** implementação pra garantir descrição condiz com comportamento real.
- Risco médio: renumeração de seção 7.x quebra referências externas. Mitigação: grep + atualizar.
