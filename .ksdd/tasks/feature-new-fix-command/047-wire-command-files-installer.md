---
id: 047
title: Adicionar new:fix.md e build:fix.md a COMMAND_FILES em bin/ksdd.js + verificar distribuição/uninstall
status: em revisão
feature: new-fix-command
area: backend
priority: P0
estimate: S
depends_on: [044, 046]
feature_refs:
  - ".ksdd/features/FEATURE-new-fix-command.md#72-endpointssuperfícies-modificadas"
  - ".ksdd/features/FEATURE-new-fix-command.md#51-superfícies-modificadas"
spec_refs:
  - ".ksdd/specs/SPEC.md#71-cli-binksddjs"
arch_refs:
  - ".ksdd/specs/architecture.md#4-apis-e-endpoints"
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
---

# 047 — Wiring de `COMMAND_FILES` no instalador

## Objetivo
Adicionar `new:fix.md` e `build:fix.md` ao array `COMMAND_FILES` em `bin/ksdd.js` para que os dois commands sejam distribuídos e removidos corretamente nos 5 targets (Claude, Codex, opencode, Antigravity).

## Escopo
- Editar `bin/ksdd.js:29` (`COMMAND_FILES`) adicionando `'new:fix.md'` e `'build:fix.md'` — inserir junto do namespace `new:`/`build:` para leitura clara (ex.: após `'new:feature.md'` e após `'build:all.md'`).
- Confirmar que `references/fix-template.md` entra no bundle via `copyDir` de `references/` (sem edição adicional — só verificar).
- Verificar que os 4 loops de instalação (`installClaude`, `installCodex`, `installOpencode`, `installAntigravity`) iteram `COMMAND_FILES` e portanto passam a copiar os 2 novos arquivos:
  - Claude: `~/.claude/commands/ksdd:new:fix.md`, `ksdd:build:fix.md`.
  - Codex/opencode/Antigravity: `ksdd-new-fix.md`, `ksdd-build-fix.md` (via `agentPromptBasename`).
- Verificar `cmdUninstall` (fallback sem manifest) — remove `ksdd:*` e `ksdd-*` por convenção; os novos entram no padrão sem código extra.

## Fora de escopo
- Criar os commands e o template (tasks 044, 045, 046).
- Documentação/CHANGELOG/bump (task 052).
- Nova função `install*` — **não** é necessária (são commands de conteúdo; sem dívida ADR-010/011).

## Critérios de aceitação
- [ ] `COMMAND_FILES` inclui `new:fix.md` e `build:fix.md`.
- [ ] `node bin/ksdd.js install` copia `ksdd:new:fix.md` e `ksdd:build:fix.md` para `~/.claude/commands/`.
- [ ] `node bin/ksdd.js install --codex --opencode --antigravity` copia `ksdd-new-fix.md` e `ksdd-build-fix.md` para cada target.
- [ ] `references/fix-template.md` presente no bundle de skill de cada target após install.
- [ ] `ksdd status` reflete a contagem maior (2 arquivos a mais por target).
- [ ] `ksdd uninstall` remove os 2 commands e o template via manifest, sem resíduo.
- [ ] Idempotência preservada (re-rodar install não duplica).

## Notas técnicas
- Precedente exato: CHANGELOG `[0.7.0]` — "adiciona `archive.md` ao array `COMMAND_FILES` (necessário porque install/uninstall não usam `copyDir` para `commands/`)".
- Sem novas dependências runtime (ADR-001). Nenhuma função `install*` nova (não toca ADR-010/011).
- Validar localmente com `ANTIGRAVITY_HOME`/`OPENCODE_HOME`/`CODEX_HOME` apontando para tmpdir se quiser evitar sujar o home.

## Riscos / dependências externas
- Baixo risco — mudança de 2 linhas num array. O grosso da verificação é o smoke de install/uninstall (fecha no QA, task 054).
