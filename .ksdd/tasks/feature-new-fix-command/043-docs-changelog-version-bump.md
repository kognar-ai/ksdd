---
id: 043
title: Atualizar README/INSTALL/CHANGELOG + bump package.json para 0.10.0
status: para implementar
feature: new-fix-command
area: backend
priority: P0
estimate: S
depends_on: [035, 036, 037, 038, 039, 040, 041, 042]
feature_refs:
  - ".ksdd/features/FEATURE-new-fix-command.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-new-fix-command.md#51-superfícies-modificadas"
spec_refs:
  - ".ksdd/specs/SPEC.md#71-cli-binksddjs"
arch_refs:
  - ".ksdd/specs/architecture.md#12-roadmap-de-implementação"
---

# 043 — Docs públicas + version bump

## Objetivo
Documentar os dois commands nas docs públicas e cortar a release: README, INSTALL, CHANGELOG `[0.10.0]` e bump de `package.json`.

## Escopo
- **`README.md`**: adicionar `/ksdd:new:fix` e `/ksdd:build:fix` à tabela/lista de comandos; nova seção "Corrigindo bugs" com exemplos dos modos (descrição, `#issue`, teste; `build:fix`); atualizar a contagem de commands (11) e a tabela tripla/quádrupla de invocação por target (`/ksdd:new:fix` Claude · `/prompts:ksdd-new-fix` Codex · `/ksdd-new-fix` opencode/Antigravity).
- **`INSTALL.md`**: atualizar contagem de arquivos por target e paths se enumerados.
- **`CHANGELOG.md`**: entrada `## [0.10.0] - 2026-XX-XX` no topo, seguindo Keep a Changelog (pt-BR), com "Adicionado" (2 commands + `references/fix-template.md` + classe `.ksdd/fixes/`), "Alterado" (`new:feature` numeração, `build:feature`/`build:all` integração, `bin/ksdd.js` `COMMAND_FILES`), "Arquitetura" (ADR-012). Espelhar o estilo da entrada `[0.7.0]` (archive).
- **`package.json`**: `version` de `0.9.0` → `0.10.0`.
- Verificar coerência da contagem "11 commands" entre README, INSTALL e SPEC (task 042).

## Fora de escopo
- Criar commands/template (tasks 035–037).
- Alterar SPEC/architecture (task 042) — só sincronizar a contagem.
- Dogfood/QA (tasks 044, 045).

## Critérios de aceitação
- [ ] README lista os 2 commands e tem seção "Corrigindo bugs" com exemplos por modo.
- [ ] README/INSTALL refletem 11 commands e a invocação por target.
- [ ] CHANGELOG tem `## [0.10.0]` com Adicionado/Alterado/Arquitetura preenchidos.
- [ ] `package.json` em `0.10.0`.
- [ ] Contagem "11 commands" consistente entre README, INSTALL e SPEC.

## Notas técnicas
- Modelo de entrada de CHANGELOG: `[0.7.0]` (archive) e `[0.9.0]` (antigravity) — mesmo nível de detalhe.
- Semver: minor (2 commands novos, retrocompatível).

## Riscos / dependências externas
- Depende de todas as tasks anteriores estarem mergeadas para a doc refletir o estado real. Última task antes do dogfood.
