---
id: 062
title: architecture.md — ADR-014 (paralelismo/worktrees/PR único/sync) + riscos
status: em revisão
feature: parallel-build-sync
area: backend
priority: P1
estimate: M
depends_on: [057, 058, 059]
feature_refs:
  - ".ksdd/features/FEATURE-parallel-build-sync.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-parallel-build-sync.md#62-alterações-em-entidades-existentes"
  - ".ksdd/features/FEATURE-parallel-build-sync.md#92-riscos"
spec_refs:
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs:
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
  - ".ksdd/specs/architecture.md#11-riscos-técnicos"
---

# 062 — Dogfood: `architecture.md` ADR-014 + riscos

## Objetivo
Registrar a decisão arquitetural desta feature em `architecture.md`: um novo **ADR-014** cobrindo paralelismo/worktrees/PR-único/sync pós-build e o escopo "só docs derivados", mais os riscos técnicos correspondentes.

## Escopo
- Adicionar **ADR-014** na seção 10 (Decisões Arquiteturais):
  - Decisão: enriquecer `build:feature`/`build:all` com paralelismo (dispatching-parallel-agents) + worktrees (using-git-worktrees) + PR único ao final + sync pós-build, **como conteúdo Markdown** (commands + novo `references/parallel-build.md`), **sem tocar `bin/ksdd.js`**.
  - Escopo de produto registrado: **"só docs derivados"** na sync (SPEC/architecture/DESIGN/FEATURE read-only, drift só sinalizado); **fallback seguro** (worktree negado/overlap ⇒ sequencial in-place); **PR único default**, `--multi-pr` opt-in.
  - Confiança + consequência (fonte única em `references/parallel-build.md` evita divergência build:feature↔build:all; débito: prosa dos commands cresce, mitigada por referência).
- Atualizar **seção 11 (Riscos Técnicos)** com: worktree negado no sandbox (mitigado por fallback); conflito de merge entre teammates paralelos (mitigado por só paralelizar sem overlap); drift de docs vs artefatos-contrato (mitigado por sinalização + checkpoint); PR único grande (mitigado por commits atômicos + `--multi-pr`).
- Se útil, uma linha na seção 4.4 (superfície de slash commands) notando que `references/parallel-build.md` é auto-bundlado sem mudança de `COMMAND_FILES`.

## Fora de escopo
- Editar SPEC.md — task 061.
- Refator do instalador (`installTarget`) — segue como ADR-012 (gatilho antes do 6º target), intocado por esta feature.

## Critérios de aceitação
- [ ] ADR-014 presente na seção 10, com decisão, escopo "só docs derivados", fallback, PR único e consequência.
- [ ] Deixa explícito que **não** há mudança em `bin/ksdd.js` e que o reference é auto-bundlado.
- [ ] Seção 11 ganha os riscos novos com mitigação.
- [ ] Não altera o gatilho do ADR-012 (refator antes do 6º target).
- [ ] Coerente com SPEC (061) e commands (057-059).

## Notas técnicas
- Seguir o formato dos ADRs existentes (Evidência / Decisão / Confiança / Consequência).
- Edição cirúrgica; preservar ADR-001..013 e os demais riscos.
- Idioma conforme `references/language-policy.md`.

## Riscos / dependências externas
- Depende de 057/058/059 para descrever a decisão com precisão.
