---
id: 037
title: Criar commands/build:fix.md (repro-first, teste de regressão obrigatório, PR rotulado bug)
status: para implementar
feature: new-fix-command
area: backend
priority: P0
estimate: L
depends_on: [035]
feature_refs:
  - ".ksdd/features/FEATURE-new-fix-command.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-new-fix-command.md#43-implementação-completa-via-ksddbuildfix"
  - ".ksdd/features/FEATURE-new-fix-command.md#83-mensagens-canônicas-texto"
spec_refs:
  - ".ksdd/specs/SPEC.md#72-slash-commands-claude-code"
  - ".ksdd/specs/SPEC.md#134-build-completo-do-projeto"
arch_refs:
  - ".ksdd/specs/architecture.md#4-apis-e-endpoints"
---

# 037 — Criar `commands/build:fix.md`

## Objetivo
Criar o slash command `/ksdd:build:fix` em `commands/build:fix.md`, que implementa tasks de fix ponta-a-ponta na linha do `/ksdd:build:feature`, com três adaptações de bug: repro-first, teste de regressão como quality gate obrigatório, e issue/PR rotulados como bug.

## Escopo
- Criar `commands/build:fix.md` referenciando o pipeline de `commands/build:feature.md` (pre-flight → issue → branch → context.md → teammates → quality gates → commit → PR) e documentando **apenas os deltas** de fix (não reescrever o pipeline inteiro — evitar duplicação).
- **Resolução de argumento**: `[slug]`, `[task-id]`, `--all`; lê `.ksdd/fixes/FIX-[slug].md` + `.ksdd/tasks/fix-[slug]/` (com fallback de path legado quando aplicável).
- **Detecção de slug arquivado** no pre-flight (mesmo bloqueio 3-way dos demais commands).
- **Repro-first (delta 1)**: antes de corrigir, roda o teste/fluxo que reproduz o bug para confirmar o diagnóstico do `FIX-[slug].md`. Se não reproduz, **para** e sinaliza que o FIX doc pode estar errado — não corrige às cegas.
- **Teste de regressão obrigatório (delta 2)**: quality gate que exige um teste que **falha na base atual** e **passa após o ajuste**. Sem ele, bloqueia o PR. Documentar a exceção (bug de concorrência/inviável de automatizar → evidência manual reproduzível + aprovação consciente, nunca silenciar o gate).
- **Labels bug (delta 3)**: issue e PR com `bug`/`fix`; corpo do PR referencia `FIX-[slug].md`, root cause e evidência de regressão. `Closes #N` quando o fix veio de issue.
- **context.md** compila `FIX-[slug].md` (root cause, blast radius, critérios de verificação) + trechos de SPEC/architecture referenciados.
- **NÃO faz merge** — aguarda review humano. Atualiza `status` da task e o `README.md` do fix.
- Mensagens canônicas (FEATURE 8.3) com cores ANSI (SPEC 3.2).

## Fora de escopo
- `commands/new:fix.md` (task 035) e `references/fix-template.md` (task 036).
- Wiring em `bin/ksdd.js` (task 038).
- Reescrever o pipeline do `build:feature` — referenciar e adaptar, não copiar 400 linhas.
- `--hotfix` a partir de tag de produção (FEATURE seção 2.2).

## Critérios de aceitação
- [ ] `commands/build:fix.md` existe com frontmatter padronizado e `allowed-tools` equivalente ao `build:feature` (inclui `mcp__github__*`, `Bash`, `Agent`).
- [ ] Resolve `[slug]`/`[task-id]`/`--all` lendo `.ksdd/fixes/` + `.ksdd/tasks/fix-[slug]/`.
- [ ] Pre-flight inclui git limpo + detecção de slug arquivado (3-way fork).
- [ ] Repro-first: reproduz o bug antes de corrigir; para se não reproduz.
- [ ] Teste de regressão é gate obrigatório (falha-antes/passa-depois demonstrado); bloqueia PR se ausente; exceção documentada sem silenciar o gate.
- [ ] Issue/PR rotulados `bug`/`fix`; corpo referencia FIX doc + root cause + evidência de regressão; `Closes #N` quando aplicável.
- [ ] Não faz merge; atualiza status da task e README do fix.
- [ ] Reusa o pipeline do `build:feature` por referência, documentando só os deltas.
- [ ] Anti-patterns documentados (não corrigir sem reproduzir, não abrir PR sem teste de regressão, não fazer merge sozinho).

## Notas técnicas
- Basename Codex/opencode/Antigravity: `ksdd-build-fix.md` via `agentPromptBasename()`.
- Reusar o parser de frontmatter de task do `build:feature` (`fix:` no lugar de `feature:`; demais campos idênticos — FEATURE seção 6.2).
- Roteamento por área e quality gates são os mesmos do `build:feature`; o delta é o gate de regressão + repro-first + labels.
- Se `gh` indisponível, cai para fluxo local-only (mesma degradação do `build:feature`).

## Riscos / dependências externas
- Divergência de manutenção entre `build:fix` e `build:feature` — mitigar referenciando o pipeline em vez de duplicá-lo.
- Depende de 035 para o contrato de layout (`.ksdd/fixes/`, `.ksdd/tasks/fix-[slug]/`, frontmatter `fix:`).
- Gate de regressão pode travar bug difícil de testar — exceção documentada, coberta no QA (task 045).
