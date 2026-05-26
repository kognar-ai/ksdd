---
id: 026
title: Atualizar README, INSTALL, CHANGELOG e bumpar package.json para 0.8.0
status: para implementar
feature: opencode-integration
area: design
priority: P0
estimate: M
depends_on: [020, 021, 022, 023]
feature_refs:
  - ".ksdd/features/FEATURE-opencode-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-opencode-integration.md#10-critérios-de-aceite"
spec_refs:
  - ".ksdd/specs/SPEC.md#13-fluxos-críticos-user-journeys"
  - ".ksdd/specs/SPEC.md#14-fases-de-entrega"
arch_refs:
  - ".ksdd/specs/architecture.md#24-infraestrutura"
  - ".ksdd/specs/architecture.md#12-roadmap-de-implementação"
---

# 026 — Docs do pacote + bump 0.8.0

## Objetivo
Atualizar a documentação distribuída com o pacote (`README.md`, `INSTALL.md`, `CHANGELOG.md`) e bumpar `package.json` para `0.8.0`, marcando o release oficial do suporte a opencode. Sem este task, usuários instalam a feature sem saber que ela existe.

## Escopo
- **`package.json`:**
  - `version`: `0.7.0` (ou versão atual) → `0.8.0`.
  - Validar que `engines.node` continua `>=16`; sem mudança esperada.
  - Sem novas dependências (manter zero — ADR-001).
- **`README.md`:**
  - Quick start: adicionar exemplo `KSDD_WITH_OPENCODE=1 npm install -g @kognar/ksdd` e linha `ksdd install --opencode` no bloco de comandos.
  - Tabela de agentes suportados: antes "Claude Code e Codex" → "Claude Code, OpenAI Codex e opencode" (com link https://opencode.ai).
  - Tabela de paths instalados: adicionar terceira coluna (ou linhas) para opencode mostrando `~/.config/opencode/commands/ksdd-*.md` e `~/.config/opencode/ksdd/`.
  - Seção de flags: adicionar `--opencode` à lista.
  - Seção de env vars: adicionar `KSDD_WITH_OPENCODE` e `OPENCODE_HOME`.
  - Onde for relevante (exemplos de invocação dos slash commands), citar a tripla `/ksdd:start` (Claude), `/prompts:ksdd-start` (Codex), `/ksdd-start` (opencode).
- **`INSTALL.md`:**
  - Seção "Targets" atualizada — listar os 3 agentes com paths default e env vars de override.
  - Seção "Instalação seletiva" — exemplo `ksdd install --opencode` e `ksdd install --codex --opencode`.
  - Seção "Uninstall" — confirmar que remove os 3 targets.
  - Seção "Troubleshooting": adicionar bullet "se `~/.config/opencode/` não existe, é criado pelo install — opencode pode ser instalado depois".
- **`CHANGELOG.md`:**
  - Nova seção no topo: `## 0.8.0 — 2026-05-26`.
  - Bullets seguindo o estilo das entradas anteriores (verificar). Mínimo:
    - `### Added`
      - Suporte a opencode (https://opencode.ai) como terceiro target — `ksdd install --opencode`.
      - Env vars `KSDD_WITH_OPENCODE` e `OPENCODE_HOME`.
      - `targets.opencode` no manifest.
      - `references/opencode-AGENTS.md` distribuído como bundle em `~/.config/opencode/ksdd/AGENTS.md`.
    - `### Changed`
      - `codexPromptBasename` → `agentPromptBasename` (compartilhado entre Codex e opencode) — apenas se task 023 entrou.
      - `installClaude` continua sendo chamado sempre; `installCodex` e `installOpencode` são opt-in.
    - `### Architecture`
      - ADR-010 registrado em `architecture.md` — terceiro target hardcoded antes do refator `installTarget` genérico (próxima feature multi-agent obrigada a refatorar).
- Validar que nenhum dos arquivos usa emoji ou exclamação (convenção SPEC 3.1 / 3.4).

## Fora de escopo
- `architecture.md` e `SPEC.md` (tasks 024, 025).
- Publicar no npm (`npm publish`) — responsabilidade do mantenedor após merge.
- Atualizar templates em `references/` (não aplicável — opencode-AGENTS.md já criado em task 022).
- Tag de release no git, GitHub Release notes — fluxo de release manual fora de escopo de tasks individuais.

## Critérios de aceitação
- [ ] `package.json` tem `"version": "0.8.0"`.
- [ ] `package.json` continua com zero dependencies/devDependencies.
- [ ] `README.md` Quick start tem exemplo opencode (`KSDD_WITH_OPENCODE=1 ...` e `ksdd install --opencode`).
- [ ] `README.md` lista "Claude Code, OpenAI Codex e opencode" como agentes suportados.
- [ ] `README.md` tabela de paths inclui `~/.config/opencode/` com bundle e commands.
- [ ] `README.md` lista `--opencode`, `KSDD_WITH_OPENCODE`, `OPENCODE_HOME` nas seções de flags e env vars.
- [ ] `INSTALL.md` lista os 3 targets com paths default.
- [ ] `INSTALL.md` mostra `ksdd install --codex --opencode` como exemplo de combinabilidade.
- [ ] `INSTALL.md` Troubleshooting menciona "opencode pode ser instalado depois — diretórios são criados idempotentemente".
- [ ] `CHANGELOG.md` tem seção `## 0.8.0 — 2026-05-26` com Added/Changed/Architecture cobrindo a feature.
- [ ] Nenhum arquivo modificado usa emoji ou exclamação (`grep -Pc '[\x{1F300}-\x{1FAFF}\!]'` permanece consistente com baseline).
- [ ] `ksdd status` (rodando local após bump) imprime "KSDD 0.8.0".
- [ ] Markdown válido em todos os arquivos.

## Notas técnicas
- O CHANGELOG provavelmente já tem entradas pra v0.5.0, 0.7.0, etc. Inspecionar formato e replicar exatamente (Keep a Changelog format ou variação custom).
- README.md tem várias seções — preferir adições pontuais via `Edit` em vez de reescrita. Buscar âncoras estáveis (`## Instalação`, `## Targets suportados`, `## Slash commands disponíveis`).
- Bump pra 0.8.0 é minor — paridade com bump de v0.4.0 (Codex foi minor também). Patch (0.7.1) seria subdimensionar a novidade.
- Se a feature 023 (rename helper) **não** for incluída neste release, remover a linha correspondente do CHANGELOG.

## Riscos / dependências externas
- Depende de 020-022 (implementação completa) pra evitar documentar capabilities que ainda não funcionam.
- Depende de 023 só pra mencionar o rename — se 023 não entrar, omitir a linha.
- Risco baixo: typo em CHANGELOG ou README descobertos só após `npm publish`. Mitigação: revisão humana antes de publicar (responsabilidade do mantenedor, fora desta task).
