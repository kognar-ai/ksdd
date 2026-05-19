---
id: 009
title: Dogfood — migrar artefatos do próprio repo KSDD para .ksdd/specs/
status: para implementar
feature: ksdd-folder-layout
area: backend
priority: P0
estimate: S
depends_on: [008]
feature_refs:
  - "docs/FEATURE-ksdd-folder-layout.md#21-o-que-entra-v1"
  - "docs/FEATURE-ksdd-folder-layout.md#11-fases-de-implementacao"
spec_refs:
  - "SPEC.md#42-artefatos-ksdd-gerados-pelos-commands-no-diretorio-do-projeto-alvo"
arch_refs:
  - "architecture.md#3-modelo-de-dados-schemas"
---

# 009 — Dogfooding: migrar próprio repo KSDD para `.ksdd/specs/`

## Objetivo
Aplicar o novo layout ao próprio repo do KSDD movendo `brainstorm.md`, `SPEC.md` e `architecture.md` da raiz para `.ksdd/specs/`, demonstrando o fluxo end-to-end e mantendo o repo coerente com a ferramenta que distribui.

## Escopo
- `mkdir -p .ksdd/specs/`.
- `git mv brainstorm.md .ksdd/specs/brainstorm.md`.
- `git mv SPEC.md .ksdd/specs/SPEC.md`.
- `git mv architecture.md .ksdd/specs/architecture.md`.
- Atualizar referências cruzadas internas dentro dos 3 artefatos onde mencionam outros artefatos (ex: SPEC seção 4.2 lista paths — atualizar para refletir nova realidade).
- Atualizar `docs/FEATURE-ksdd-folder-layout.md` e tasks desta feature para refletir paths atualizados (refs cruzadas — opcional, já que tasks são de geração única).
- Mover `docs/FEATURE-ksdd-folder-layout.md` para `.ksdd/features/FEATURE-ksdd-folder-layout.md` (consistência).
- Mover `docs/tasks/feature-ksdd-folder-layout/` para `.ksdd/tasks/feature-ksdd-folder-layout/`.
- Commit atômico: `chore(docs): migrate artifacts to .ksdd/ layout (dogfood v0.6.0)`.

## Fora de escopo
- Mudar conteúdo substantivo dos 3 artefatos (só paths em refs).
- Gerar `DESIGN.md` (KSDD não tem UI — SPEC seção 3).
- Gerar `BUILD-PLAN.md`.

## Critérios de aceitação
- [ ] Raiz do repo não tem mais `brainstorm.md`, `SPEC.md`, `architecture.md`.
- [ ] `.ksdd/specs/{brainstorm,SPEC,architecture}.md` existem com conteúdo idêntico ao histórico.
- [ ] `git log --follow .ksdd/specs/SPEC.md` mostra histórico preservado (git mv).
- [ ] `docs/FEATURE-ksdd-folder-layout.md` movido para `.ksdd/features/`.
- [ ] `docs/tasks/feature-ksdd-folder-layout/` movido para `.ksdd/tasks/`.
- [ ] Refs cruzadas dentro de SPEC seção 4.2 ("Artefatos KSDD") atualizadas para mostrar paths novos como default + nota "(legado: raiz)" onde aplicável.
- [ ] `git status` limpo após commit.
- [ ] `ls .ksdd/` mostra a árvore esperada (`specs/`, `features/`, `tasks/`).

## Notas técnicas
- Usar `git mv` (não `mv`) para preservar histórico via `--follow`.
- Pasta `docs/` pode ficar vazia após mover — remover diretório vazio se for o caso.
- README do projeto continua na raiz (não é artefato KSDD).

## Riscos / dependências externas
- Bloqueada por 008 — só migrar depois que código + docs + version bump estão prontos, para o repo refletir uma versão coerente.
- Links externos (PRs anteriores, posts) que apontem para `SPEC.md` na raiz quebram. Aceito por design (FEATURE seção 9.2 risco listado).
