---
id: 040
title: Atualizar build:feature (redireciona slug de fix) e build:all (exclui fix tasks da fila)
status: em revisão
feature: new-fix-command
area: backend
priority: P2
estimate: S
depends_on: [035, 037]
feature_refs:
  - ".ksdd/features/FEATURE-new-fix-command.md#51-superfícies-modificadas"
  - ".ksdd/features/FEATURE-new-fix-command.md#23-o-que-não-é-essa-feature"
spec_refs:
  - ".ksdd/specs/SPEC.md#72-slash-commands-claude-code"
arch_refs:
  - ".ksdd/specs/architecture.md#4-apis-e-endpoints"
---

# 040 — Integração com `build:feature` e `build:all`

## Objetivo
Ajustar os dois commands de build de feature para conviverem com o namespace de fix: `build:feature` redireciona quando recebe um slug de fix; `build:all` mantém fix tasks fora da fila de features.

## Escopo
- **`commands/build:feature.md`** (via `str_replace`): na resolução de argumento/pre-flight, detectar quando o slug/task resolve para `.ksdd/fixes/` ou `.ksdd/tasks/fix-*/` e, em vez de tentar buildar, orientar o usuário a usar `/ksdd:build:fix [slug]` (fix tem fluxo próprio: repro-first + gate de regressão). Não buildar fix como se fosse feature.
- **`commands/build:all.md`** (via `str_replace`): na fase de planejamento/montagem da fila, deixar explícito que `.ksdd/tasks/fix-*/` **não** entra no `BUILD-PLAN.md` (o `build:all` decompõe fases do SPEC em features; correções reativas são conduzidas por `/ksdd:new:fix`/`/ksdd:build:fix`). Opcional: listar fixes pendentes como linha informativa, sem entrar na fila — espelhando como o `build:all` já trata slugs arquivados (CHANGELOG `[0.7.0]`).

## Fora de escopo
- Criar `new:fix`/`build:fix` (tasks 035, 037).
- Numeração no `new:feature` (task 039).
- Qualquer alteração no pipeline de execução de tasks.

## Critérios de aceitação
- [ ] `commands/build:feature.md` detecta slug/task de fix e redireciona para `/ksdd:build:fix` com mensagem clara, sem buildar.
- [ ] `commands/build:all.md` documenta que `.ksdd/tasks/fix-*/` fica fora da fila de features (não entra no `BUILD-PLAN.md`).
- [ ] Edições cirúrgicas (`str_replace`); resto dos commands inalterado.
- [ ] Nenhuma regressão no comportamento existente de feature build.

## Notas técnicas
- Precedente de "linha informativa fora da fila": tratamento de slugs arquivados no `build:all` (feature `archive-features`).
- Mudança é de prompt/documentação — sem código executável.

## Riscos / dependências externas
- Baixa prioridade (P2): a feature entrega valor mesmo sem isso (o usuário simplesmente usa o command certo). É polimento de UX para evitar confusão de namespace.
