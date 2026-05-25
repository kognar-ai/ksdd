---
id: 013
title: Verificar bin/ksdd.js distribui archive.md + archive-template.md corretamente
status: para implementar
feature: archive-features
area: backend
priority: P0
estimate: S
depends_on: [011, 012]
feature_refs:
  - ".ksdd/features/FEATURE-archive-features.md#51-superfícies-modificadas"
  - ".ksdd/features/FEATURE-archive-features.md#72-endpointssuperfícies-modificadas"
spec_refs:
  - ".ksdd/specs/SPEC.md#71-cli-binksddjs"
arch_refs:
  - ".ksdd/specs/architecture.md#43-funções-internas-não-exportadas-uso-interno-do-cli"
  - ".ksdd/specs/architecture.md#adr-001-zero-dependências-runtime"
  - ".ksdd/specs/architecture.md#adr-009-slash-commands-com-prefixo-ksdd-claude-e-ksdd-codex"
---

# 013 — Verificar instalador (`bin/ksdd.js`) e Codex prompt naming

## Objetivo
Confirmar que `ksdd install` (Claude) e `ksdd install --codex` (Codex) distribuem corretamente os dois novos arquivos sem modificações no instalador, e que o naming Codex `archive.md → ksdd-archive.md` funciona via `codexPromptBasename`.

## Escopo
- Inspecionar `bin/ksdd.js` funções `installClaude` e `installCodex` para confirmar que `copyDir` é recursivo (já é — architecture.md seção 4.3 / 10 ADR-001/007).
- Confirmar que `codexPromptBasename('archive.md')` retorna `ksdd-archive.md` (vs `archive.md` que tem prefixo correto). Se houver caso especial (não tem `:`), validar saída esperada.
- Testar localmente:
  1. `npm link` (ou `npm install -g .`) na branch da feature.
  2. `ksdd install` em diretório temporário → verificar `~/.claude/commands/ksdd:archive.md` e `~/.claude/skills/ksdd/references/archive-template.md`.
  3. `ksdd install --codex` → verificar `~/.codex/prompts/ksdd-archive.md` e `~/.agents/skills/ksdd/references/archive-template.md`.
  4. `ksdd status` mostra contagem incrementada nos targets.
  5. `ksdd uninstall` remove os dois novos arquivos via manifest.
- Se algum teste falhar, ajustar `bin/ksdd.js` (provavelmente apenas se houver hardcoding inesperado).
- Se tudo passa, documentar no commit que nenhuma mudança em `bin/ksdd.js` foi necessária.

## Fora de escopo
- Criar os arquivos `archive.md` / `archive-template.md` (tasks 011 e 012).
- Atualizar README/CHANGELOG (task 017).
- Mudanças estruturais no `bin/ksdd.js` (sem demanda — manter ADR-001).

## Critérios de aceitação
- [ ] Após `npm link` + `ksdd install`, `ls ~/.claude/commands/` lista `ksdd:archive.md`.
- [ ] Após `ksdd install --codex`, `ls ~/.codex/prompts/` lista `ksdd-archive.md`.
- [ ] Após install, `ls ~/.claude/skills/ksdd/references/` e `~/.agents/skills/ksdd/references/` listam `archive-template.md`.
- [ ] `ksdd status` reporta contagem com os 2 arquivos novos (ou +1 se Claude-only).
- [ ] `ksdd uninstall` remove ambos os arquivos novos sem deixar resíduo (verificar com `ls`).
- [ ] Manifest `~/.claude/skills/ksdd/.ksdd-manifest.json` contém os paths dos novos arquivos em `targets.claude`/`targets.codex`.
- [ ] Nenhuma alteração em `bin/ksdd.js` foi necessária (ou, se foi, alteração é mínima e documentada).

## Notas técnicas
- `codexPromptBasename` (`bin/ksdd.js:116`) substitui `:` por `-`. Como `archive.md` não tem `:`, retorna `ksdd-archive.md` por prefixação. Não exige caso especial.
- `installClaude` (`bin/ksdd.js:121`) e `installCodex` (`bin/ksdd.js:150`) chamam `copyDir` recursivo sobre `commands/` e `references/` — qualquer arquivo novo é incluído automaticamente.
- Testar em diretório temporário (`mktemp -d`) para evitar lixo em `~/`.
- Re-instalar (`ksdd install` em cima de install prévio) precisa preservar/atualizar manifest — confirmar idempotência.

## Riscos / dependências externas
- Risco baixo de mudança não-trivial em `bin/ksdd.js`: ADR-001 (zero deps) + estrutura atual já são suficientes.
- Caso degenerado: se `archive.md` colidir com algum nome reservado em `~/.codex/`, vira problema do Codex (improvável).
