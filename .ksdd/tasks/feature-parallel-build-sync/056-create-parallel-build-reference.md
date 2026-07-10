---
id: 056
title: Criar references/parallel-build.md (estratégia canônica de build paralelo)
status: para implementar
feature: parallel-build-sync
area: backend
priority: P0
estimate: M
depends_on: []
feature_refs:
  - ".ksdd/features/FEATURE-parallel-build-sync.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-parallel-build-sync.md#4-fluxos-de-uso"
  - ".ksdd/features/FEATURE-parallel-build-sync.md#52-superfícies-novas"
spec_refs:
  - ".ksdd/specs/SPEC.md#8-componentes-globais-reutilizáveis"
arch_refs:
  - ".ksdd/specs/architecture.md#1-visão-geral-da-arquitetura"
  - ".ksdd/specs/architecture.md#44-superfície-de-slash-commands-distribuída"
---

# 056 — Criar `references/parallel-build.md`

## Objetivo
Criar o documento canônico que descreve a estratégia de build paralelo do KSDD — paralelismo de teammates, ciclo de vida do git worktree, integração numa branch de build única com PR único, e o escopo "só docs derivados" da sincronização pós-build. Vira a **fonte única** referenciada por `build:feature` e `build:all`, evitando duplicação de prosa entre os dois commands.

## Escopo
- Criar `references/parallel-build.md` seguindo o estilo dos outros references do repo (Markdown técnico pt-BR, sem emojis, títulos claros).
- **Bloco "Modelo de paralelismo"**: uma onda = várias chamadas de agente na mesma mensagem; um teammate por task/domínio independente; prompt self-contained e escopado (contrato do skill dispatching-parallel-agents — citar a URL). "Independente" = tasks sem `depends_on` mútuo **e** sem overlap de arquivos previsto (derivado do "Plano de implementação"/context.md). Tasks dependentes/com overlap → ondas sequenciais.
- **Bloco "Ciclo de vida do worktree"** (contrato do skill using-git-worktrees — citar a URL):
  - Passo 0: detectar isolamento existente (`git rev-parse --git-dir` vs `--git-common-dir`) — nunca aninhar worktrees.
  - Criar: `git worktree add <path> -b <branch>`; diretório priorizando `.worktrees/`; verificar que o dir está git-ignored antes de criar.
  - Remover: `git worktree remove` ao final de cada task/onda; nada de worktree órfão.
- **Bloco "Integração + PR único"**: branch de build da feature a partir do default branch; commits atômicos por task integrados na branch de build; 1 PR ao final do build completo; `--multi-pr` para 1 PR por task.
- **Bloco "Fallback seguro"**: worktree negado (sandbox) **ou** overlap de arquivos ⇒ execução sequencial in-place na branch de build, com aviso amarelo; preserva gates, commits atômicos, sync e PR único.
- **Bloco "Sincronização pós-build (só docs derivados)"**: lista o que a fase pode tocar (`README.md`, `CLAUDE.md`/`AGENTS.md`, `CHANGELOG.md`, `status`/README de tasks) e o que é **read-only** (SPEC/architecture/DESIGN/FEATURE — só sinaliza drift). Checkpoint antes de comitar.

## Fora de escopo
- Editar `commands/build:feature.md` e `commands/build:all.md` — só o reference aqui (tasks 057-059 consomem).
- Qualquer mudança em `bin/ksdd.js` — `references/` é auto-bundlado (ver task 063 valida).

## Critérios de aceitação
- [ ] `references/parallel-build.md` existe e cobre os 5 blocos acima (paralelismo, worktree, integração/PR único, fallback, sync).
- [ ] Cita as duas skills externas por URL como contrato conceitual (não como dependência de runtime).
- [ ] Deixa explícita a regra "só docs derivados" e a preservação read-only de SPEC/architecture/DESIGN/FEATURE.
- [ ] Documenta a convenção de branch de build + worktrees efêmeros e sua remoção ao final.
- [ ] Escrito para ser **referenciável** por seções — títulos estáveis que `build:feature`/`build:all` possam citar.

## Notas técnicas
- Não há mudança de instalador: `bin/ksdd.js` copia `references/` como diretório (`copyDir`, ver `bin/ksdd.js:168/205/235/283/367`), então o arquivo é auto-distribuído a todos os 5 targets.
- Idioma: pt-BR técnico (doc de manutenção do repo), conforme `references/language-policy.md` — mas o conteúdo orienta o agente a produzir artefatos no idioma da conversa.
- Alinhar terminologia com os commands existentes (task, onda, gate, checkpoint, branch de build).

## Riscos / dependências externas
- Estabilidade das URLs das skills (obra/superpowers) — mitigado por embutir o contrato no próprio reference; a URL é citação, não fetch em runtime.
