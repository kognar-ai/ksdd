---
id: 017
title: Atualizar README/INSTALL/CHANGELOG + bump versão 0.7.0
status: em revisão
feature: archive-features
area: backend
priority: P0
estimate: S
depends_on: [011, 012, 013, 014, 015, 016]
feature_refs:
  - ".ksdd/features/FEATURE-archive-features.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-archive-features.md#11-fases-de-implementação"
spec_refs:
  - ".ksdd/specs/SPEC.md#71-cli-binksddjs"
  - ".ksdd/specs/SPEC.md#72-slash-commands-claude-code"
arch_refs:
  - ".ksdd/specs/architecture.md#31-manifest-de-instalação-ksdd-manifestjson"
---

# 017 — Atualizar README/INSTALL/CHANGELOG + bump 0.7.0

## Objetivo
Documentar publicamente o novo `/ksdd:archive` no README, atualizar INSTALL (se houver lista explícita de arquivos), criar entrada no CHANGELOG e bumpar `package.json` para `0.7.0` (semver minor — feature retrocompatível).

## Escopo
- Editar `README.md`:
  - Listar `/ksdd:archive` na seção de slash commands.
  - Adicionar exemplo de uso para cada modo (slug individual, lista, `--all-eligible`, `--restore`, `--dry-run`) em bloco de código.
  - Nota curta sobre o layout `.ksdd/archive/` (1-2 linhas).
- Editar `INSTALL.md`:
  - Atualizar lista de comandos/arquivos distribuídos (se houver listagem explícita).
  - Mencionar `.ksdd/archive/` como diretório gerado on-demand (não criado em install).
- Atualizar `CHANGELOG.md`:
  - Nova entrada `## [0.7.0] - 2026-XX-XX` no topo.
  - Seções: `### Added` (`/ksdd:archive`, `references/archive-template.md`), `### Changed` (`commands/new:feature.md`, `commands/build:feature.md`, `commands/build:all.md` com detecção de slug arquivado).
  - Resumo de 2-3 frases descrevendo o "porquê" (problema da acumulação de features prontas).
- Atualizar `package.json`:
  - `version: "0.7.0"`.
  - Confirmar que não houve adição de `dependencies` ou `devDependencies` (manter ADR-001).
- Atualizar versão referenciada em SPEC seção 4.1 (campo `version` do manifest) se houver hardcoding. Se for documental, sinalizar para usuário ajustar fora do scope desta task (artefatos SPEC são read-only durante build — ver `commands/build:feature.md` seção "Artefatos são read-only durante build").

## Fora de escopo
- Criar `commands/archive.md` (task 011).
- Criar `references/archive-template.md` (task 012).
- Testar instalação (task 013).
- Atualizar `commands/new:feature.md`, `commands/build:feature.md`, `commands/build:all.md` (tasks 014, 015, 016).
- Dogfooding (task 018).
- QA end-to-end (task 019).
- Atualizar `.ksdd/specs/SPEC.md` ou `.ksdd/specs/architecture.md` (artefatos SPEC são read-only durante build).

## Critérios de aceitação
- [ ] `README.md` lista `/ksdd:archive` na seção de slash commands.
- [ ] `README.md` tem exemplo de uso de cada modo (5 modos) em bloco de código.
- [ ] `README.md` menciona `.ksdd/archive/` como diretório gerado on-demand.
- [ ] `INSTALL.md` atualizado se mencionar lista de arquivos explicitamente; caso contrário, sem mudança.
- [ ] `CHANGELOG.md` tem entrada `## [0.7.0]` no topo com sections Added/Changed.
- [ ] `package.json` versão é `0.7.0`.
- [ ] `package.json` continua sem `dependencies` nem `devDependencies` (ADR-001).
- [ ] Data no CHANGELOG segue formato `YYYY-MM-DD` (convenção do projeto — ver entradas anteriores).
- [ ] Texto do CHANGELOG segue tom técnico/direto (SPEC seção 3.5).

## Notas técnicas
- Manter consistência com o tom direto/opinativo dos artefatos KSDD (SPEC seção 3.1).
- Verifique no `package.json` se há outros campos derivados da versão (ex: descrição mencionando "v0.6.x"). Atualizar.
- Não tocar em `.ksdd/specs/SPEC.md`, `.ksdd/specs/architecture.md`, ou `.ksdd/features/FEATURE-*.md` — esses são read-only durante build (`commands/build:feature.md`).

## Riscos / dependências externas
- Discrepância entre versão em `package.json` e versão referenciada em `references/codex-SKILL.md` ou outros lugares hardcoded — varrer com `grep -rn "0\.6\." --include="*.md" --include="*.json"` antes de fechar a task.
- Mantenedor pode preferir bump para `0.6.1` (patch) em vez de `0.7.0` (minor) — confirmar antes do PR (FEATURE seção 9.1).
