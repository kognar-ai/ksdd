# ARCHIVE — Features KSDD arquivadas

> Índice cronológico decrescente das features deste projeto que já foram entregues e arquivadas via `/ksdd:archive`. Cada seção resume uma feature; o conteúdo bruto (FEATURE-[slug].md + tasks) vive em `.ksdd/archive/raw/[slug]/`.

**Como usar:**
- Para consultar o resumo de uma feature, role até a seção `## [slug] — YYYY-MM-DD`.
- Para reabrir uma feature arquivada: `/ksdd:archive --restore [slug]` (move `raw/[slug]/` de volta para `.ksdd/features/` e `.ksdd/tasks/`).
- Para arquivar mais features: `/ksdd:archive [slug]` ou `/ksdd:archive --all-eligible`.

**Template-version:** 1

<!-- new entries appear below -->

## ksdd-folder-layout — 2026-05-25

*Consolidar artefatos KSDD em `.ksdd/` · Prioridade: Alta · Arquivado em 2026-05-25*

### Objetivo

Consolidar todos os artefatos KSDD (brainstorm, SPEC, architecture, DESIGN, FEATURE, tasks, BUILD-PLAN) sob uma pasta `.ksdd/` única organizada por fase, eliminando a poluição da raiz do projeto-alvo, padronizando a navegação ("onde acho o SPEC?") e separando claramente artefatos de processo de docs de produto. Compatibilidade retroativa garantida: cada command lê primeiro o path novo (`.ksdd/specs/SPEC.md`) e faz fallback para o legado (`SPEC.md` na raiz, `docs/FEATURE-*.md`) emitindo warning amarelo com instrução de `git mv`.

### Tasks

- 001 — Atualizar commands de spec-phase (start/spec/tech/design) para .ksdd/specs/ (backend) — concluída
- 002 — Atualizar commands/new:feature.md para .ksdd/features/ + .ksdd/tasks/ (backend) — concluída
- 003 — Atualizar commands/build:feature.md para .ksdd/tasks/.context/ (backend) — concluída
- 004 — Atualizar commands/build:all.md para .ksdd/build/BUILD-PLAN.md (backend) — concluída
- 005 — Atualizar commands/setup.md com novo layout + detecção de legados (backend) — concluída
- 006 — Atualizar templates em references/ com paths .ksdd/ (backend) — concluída
- 007 — Atualizar agents (critic/interviewer/setup-analyst) com novos paths (backend) — concluída
- 008 — Atualizar README/INSTALL/CHANGELOG + bump versão 0.6.0 (backend) — concluída
- 009 — Dogfood — migrar artefatos do próprio repo KSDD para .ksdd/specs/ (backend) — concluída
- 010 — QA end-to-end — validar fluxo em projeto vazio + projeto legado (qa) — concluída

### Critérios de aceite

- [x] Em projeto vazio, `/ksdd:start` cria `.ksdd/specs/brainstorm.md` (e não `brainstorm.md` na raiz).
- [x] Em projeto vazio, `/ksdd:spec` lê `.ksdd/specs/brainstorm.md` e gera `.ksdd/specs/SPEC.md`.
- [x] Em projeto vazio, `/ksdd:tech` gera `.ksdd/specs/architecture.md`.
- [x] Em projeto vazio, `/ksdd:design` gera `.ksdd/specs/DESIGN.md`.
- [x] Em projeto vazio, `/ksdd:new:feature [slug]` gera `.ksdd/features/FEATURE-[slug].md` + `.ksdd/tasks/feature-[slug]/README.md` + tasks.
- [x] Em projeto vazio, `/ksdd:build:feature [slug]` grava `.ksdd/tasks/feature-[slug]/.context/NNN-context.md` antes de implementar.
- [x] Em projeto vazio, `/ksdd:build:all` gera `.ksdd/build/BUILD-PLAN.md`.
- [x] Em projeto com `SPEC.md` na raiz (legado), `/ksdd:new:feature` lê o legado, emite warning amarelo claro citando path antigo + path novo + sugestão de `git mv`, e prossegue.
- [x] Em projeto com `SPEC.md` na raiz E `.ksdd/specs/SPEC.md` com conteúdos diferentes, comando aborta com erro bloqueante pedindo resolução manual.
- [x] Em projeto com `SPEC.md` na raiz E `.ksdd/specs/SPEC.md` idênticos, comando usa o novo e emite warning sugerindo remover o legado.
- [x] `/ksdd:setup` em projeto sem artefatos KSDD gera tudo em `.ksdd/` direto.
- [x] `/ksdd:setup` em projeto com artefatos KSDD legados pergunta explicitamente o que fazer (manter, mover, abortar).
- [x] Todos os 8 arquivos em `commands/` mencionam `.ksdd/...` como path default e descrevem o fallback de leitura.
- [x] Todos os 8 arquivos em `references/` (templates + approval-gates + codex-SKILL) usam `.ksdd/...` em exemplos.
- [x] Os 3 agents (`critic`, `interviewer`, `setup-analyst`) atualizados pra referenciar novos paths quando aplicável.
- [x] `README.md` documenta o novo layout em uma seção dedicada + nota de migração para v0.6.0.
- [x] `INSTALL.md` atualizado com exemplos de paths.
- [x] `CHANGELOG.md` tem entrada `## [0.6.0]` descrevendo: (a) novo layout `.ksdd/`, (b) compat retroativa de leitura, (c) sugestão de migração manual, (d) lista de breaking changes não-imediatos planejados para 1.0.
- [x] Próprio repo KSDD migrado: `brainstorm.md`, `SPEC.md`, `architecture.md` movidos via `git mv` para `.ksdd/specs/`; raiz limpa.
- [x] `package.json` bumped para `0.6.0`.
- [x] Após `npm install -g @kognar/ksdd@0.6.0`, projeto pré-existente continua funcionando sem mudança.
- [x] Grep no repo por `^[^.]*FEATURE-\|^SPEC\.md\|^brainstorm\.md\|^architecture\.md\|^DESIGN\.md\|^BUILD-PLAN\.md` (paths legados) só retorna match em: CHANGELOG, comentários explícitos de compat, ou texto de warning de deprecação.

*Conteúdo bruto: .ksdd/archive/raw/ksdd-folder-layout/*
