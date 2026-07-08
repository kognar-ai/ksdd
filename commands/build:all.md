---
description: Builda um projeto KSDD inteiro a partir do SPEC.md — decompõe as fases de entrega em features, quebra em tasks, e implementa tudo em ordem de dependência com checkpoints por fase. Orquestra /ksdd:new:feature e /ksdd:build:feature automaticamente.
argument-hint: "[--phase N] [--plan-only] [--resume] (opcional — sem args builda tudo do MVP em diante)"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent, WebFetch, view, create_file, str_replace, ask_user_input_v0, web_search, web_fetch, conversation_search, execute_shell, list_directory, mcp__github__*, mcp__context7__*, mcp__pencil__*, mcp__executeautomation-playwright-server__*
---

# /ksdd:build:all — Build completo do projeto spec-driven

Você é o tech lead orquestrando o build completo de um projeto KSDD. Pega os artefatos aprovados (`SPEC.md`, `architecture.md`, `DESIGN.md`) e transforma em código funcional — decompondo as fases de entrega em features, quebrando em tasks, e implementando tudo com checkpoints.

É o equivalente a rodar `/ksdd:new:feature` + `/ksdd:build:feature` pra cada bloco de trabalho do SPEC, mas com orquestração inteligente de dependências, paralelismo e priorização.

## Idioma (obrigatório)

Siga `references/language-policy.md` — `BUILD-PLAN.md`, features, tasks e checkpoints no idioma dos artefatos aprovados e da conversa; não assuma pt-BR.

---

## Paths dos artefatos (KSDD v0.6.0+)

A partir da v0.6.0, KSDD usa `.ksdd/` para todos os artefatos:

| Artefato         | Leitura (em ordem, com fallback)                                              | Escrita default                  |
|------------------|-------------------------------------------------------------------------------|----------------------------------|
| SPEC.md          | `.ksdd/specs/SPEC.md` → raiz `SPEC.md`                                       | n/a (input)                      |
| architecture.md  | `.ksdd/specs/architecture.md` → raiz `architecture.md`                       | n/a (input)                      |
| DESIGN.md        | `.ksdd/specs/DESIGN.md` → raiz `DESIGN.md`                                   | n/a (input)                      |
| brainstorm.md    | `.ksdd/specs/brainstorm.md` → raiz `brainstorm.md`                           | n/a (input)                      |
| FEATURE-*.md     | `.ksdd/features/` → `docs/` → raiz (legados)                                  | `.ksdd/features/FEATURE-*.md`    |
| tasks            | `.ksdd/tasks/` → `docs/tasks/` (legado)                                       | `.ksdd/tasks/feature-*/`         |
| BUILD-PLAN.md    | `.ksdd/build/BUILD-PLAN.md` → raiz `BUILD-PLAN.md`                            | `.ksdd/build/BUILD-PLAN.md`      |
| features arquivadas | `.ksdd/archive/raw/[slug]/` (read-only — excluídas da fila de pendentes)   | n/a                              |
| fixes (bugs)     | `.ksdd/fixes/` + `.ksdd/tasks/fix-*/` (read-only aqui — via `/ksdd:new:fix` / `/ksdd:build:fix`) | n/a — fora da fila de features |

**Fallback de leitura:** ao detectar artefato em path legado, emita warning amarelo:

> ⚠ Detectado `<arquivo>` em path legado (`<path antigo>`). A partir da v0.6.0, KSDD usa `<path novo>`. Considere migrar com:
> `mkdir -p <novo-dir> && git mv <path antigo> <path novo>`

**Conflito:** se mesmo artefato existe em mais de um path **com conteúdos diferentes**, **aborte** com erro pedindo resolução manual.

**Escrita:** sempre nos paths default. Garanta `mkdir -p .ksdd/{features,tasks,build}/` conforme necessário antes dos `create_file`.

---

## Argumentos

`$ARGUMENTS` pode conter:
- `--phase N` → builda apenas a fase N do SPEC (seção 14: Fases de Entrega). Sem flag, builda da Fase 1 (MVP) em diante.
- `--plan-only` → gera o plano completo (features + tasks) mas NÃO implementa. Útil pra revisar antes de executar.
- `--resume` → retoma de onde parou (detecta features/tasks existentes e pula as concluídas).
- Sem args → builda tudo começando pela Fase 1.

---

## Pré-requisitos obrigatórios

1. **`SPEC.md` deve existir e estar aprovado** — é o contrato de produto. Sem ele, pare e instrua `/ksdd:spec`.
2. **`architecture.md` é fortemente recomendado** — sem ele, decisões de stack ficam por conta do engenheiro e será necessária uma rodada de perguntas.
3. **`DESIGN.md` é recomendado** — sem ele, decisões visuais serão derivadas da stack/framework.

Se apenas `SPEC.md` existe:
> Detectei apenas SPEC.md. Para um build completo recomendo ter também architecture.md (/ksdd:tech) e DESIGN.md (/ksdd:design). Quer prosseguir sem eles, ou gerar antes?

---

## Fluxo

### Fase A — Planejamento (gerar features + tasks)

#### A.1 Absorver contexto completo

Leia **todos** os artefatos KSDD (aplicando hierarquia de paths definida em "Paths dos artefatos"):

1. `view .ksdd/specs/SPEC.md` (fallback raiz) — especialmente seção 14 (Fases de Entrega), seção 7 (Telas), seção 4 (Modelo de Dados), seção 13 (Fluxos Críticos)
2. `view .ksdd/specs/architecture.md` (fallback raiz, se existir) — stack, schemas, APIs, ADRs, roadmap (seção 12)
3. `view .ksdd/specs/DESIGN.md` (fallback raiz, se existir) — componentes, tokens
4. `view .ksdd/specs/brainstorm.md` (fallback raiz, se existir) — contexto original
5. Verifique features existentes em `.ksdd/features/`, `docs/` legado, raiz legado; e tasks em `.ksdd/tasks/` ou `docs/tasks/` legado (pra `--resume`)
6. **Liste features arquivadas** em `.ksdd/archive/raw/*/` — esses slugs já foram entregues e devem ser **excluídos** da fila de features pendentes a serem geradas/buildadas. Mantenha-os apenas como histórico informativo no resumo do Checkpoint 1.

#### A.2 Decompor SPEC em features

Analise a seção 14 (Fases de Entrega) do SPEC.md. Cada **bloco coerente de funcionalidade** dentro de uma fase vira uma feature.

**Regras de decomposição:**

- Uma feature = um bloco funcional entregável e testável isoladamente
- Features são nomeadas com slug descritivo: `setup-monorepo`, `auth-flow`, `search-page`, `user-dashboard`
- Uma fase do SPEC pode ter 2-8 features (depende da complexidade)
- Features dentro de uma fase podem ter dependências entre si
- Features de fases posteriores dependem da fase anterior completa

**Exclusão de features arquivadas:** se um slug candidato corresponde a uma feature em `.ksdd/archive/raw/*/`, **não** inclua na fila de execução. Sinalize no resumo do Checkpoint 1 com formato `✓ [slug] (arquivada em [data extraída de ARCHIVE.md])` em linha informativa (dim/verde) — não entra no plano de build. A comparação é por slug (kebab-case do nome derivado do SPEC); falsos negativos são aceitáveis na v1.

**Resultado:** Lista de features por fase com dependências:

```
Fase 1 — MVP:
  1. setup-infra           (sem dependência)
  2. data-model            (depende: setup-infra)
  3. auth-flow             (depende: setup-infra)
  4. core-api              (depende: data-model)
  5. home-page             (depende: core-api, auth-flow)
  6. search                (depende: core-api)
  7. detail-page           (depende: core-api)
  ...

Fase 2 — [tema]:
  8. feature-x             (depende: Fase 1 completa)
  ...
```

#### A.3 Sessão de decisões (1 rodada)

Pergunte ao usuário apenas o que **não está claro** nos artefatos:

1. **Escopo do build:** Todas as fases ou só a Fase N?
2. **Abordagem de infra:** Se architecture.md não existe — decisões de stack mínimas.
3. **Priorização:** A ordem das features na fase faz sentido? Algum ajuste?
4. **Paralelismo:** Features independentes podem ser buildadas em paralelo? (recomende sim pra features sem dependência mútua)

Se tudo está claro, pule.

#### A.4 Gerar features e tasks

Para cada feature identificada, execute internamente o fluxo do `/ksdd:new:feature`:

1. **Gere `.ksdd/features/FEATURE-[slug].md`** (crie pasta se necessário com `mkdir -p .ksdd/features/`) usando `references/feature-template.md`
   - Seções de impacto (telas, dados, API, design) derivadas do SPEC + architecture
   - Critérios de aceite derivados da feature e da fase
   - Referências cruzadas pros artefatos com paths atuais

2. **Quebre em tasks** em `.ksdd/tasks/feature-[slug]/NNN-slug.md` (`mkdir -p .ksdd/tasks/feature-[slug]/`)
   - Frontmatter com `feature_refs`, `spec_refs`, `arch_refs` apontando para paths novos por default
   - Granularidade 1-3 dias
   - Dependências entre tasks e entre features

3. **Gere README.md** de cada feature em `.ksdd/tasks/feature-[slug]/README.md` com índice de tasks

**Numeração de tasks:** IDs globais contínuos (não reinicia por feature). Feature 1 tem tasks 001-008, Feature 2 tem 009-015, etc. Isso permite `depends_on` entre features.

#### A.5 Gerar plano mestre `.ksdd/build/BUILD-PLAN.md`

Antes do `create_file`, garanta `mkdir -p .ksdd/build/`. Crie `.ksdd/build/BUILD-PLAN.md` — é o mapa de execução do projeto inteiro:

```markdown
# Build Plan — [Nome do Projeto]

**Data:** [DD/MM/AAAA]
**Status:** Planejado
**SPEC versão:** [versão do SPEC.md]
**Fases cobertas:** [1, 2, 3 ou subset]

---

## Resumo

| Fase | Features | Tasks | Estimativa | Status |
|------|----------|-------|------------|--------|
| Fase 1 — MVP | [N] | [N] | ~[N] dias | Planejado |
| Fase 2 — [tema] | [N] | [N] | ~[N] dias | Planejado |
| ... | | | | |
| **Total** | **[N]** | **[N]** | **~[N] dias** | |

---

## Fase 1 — MVP

### Ordem de execução

[Diagrama ou lista mostrando dependências entre features]

```
setup-infra → data-model → core-api → search
                                    → detail-page
           → auth-flow → home-page
```

### Features

| # | Feature | Tasks | Estimativa | Depende de | Status |
|---|---------|-------|------------|------------|--------|
| 1 | setup-infra | [N] | ~[N]d | — | Planejado |
| 2 | data-model | [N] | ~[N]d | setup-infra | Planejado |
| ... | | | | | |

---

## Fase 2 — [tema]
[mesmo formato]

---

## Decisões tomadas no planejamento

| Decisão | Justificativa | Artefato fonte |
|---------|---------------|----------------|
| [o que] | [por quê] | [SPEC/architecture seção X] |

---

## Riscos do build

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| [descrição] | [alto/médio/baixo] | [como] |
```

#### A.6 Checkpoint do plano (OBRIGATÓRIO)

> `.ksdd/build/BUILD-PLAN.md` gerado para o projeto **[nome]**:
>
> **Fase 1 — MVP:** [N] features, [N] tasks, ~[N] dias
> **Fase 2 — [tema]:** [N] features, [N] tasks, ~[N] dias
> **Total:** [N] features, [N] tasks
>
> Features geradas:
> 1. `.ksdd/features/FEATURE-setup-infra.md` — [N] tasks
> 2. `.ksdd/features/FEATURE-data-model.md` — [N] tasks
> 3. ...
>
> Recomendo revisar:
> - `.ksdd/build/BUILD-PLAN.md` — ordem de execução e dependências
> - FEATURE specs — escopo de cada bloco
> - Tasks P0 — são a espinha dorsal do MVP
>
> Aprovado para começar a implementação? Ou quer ajustar o plano?

Se `--plan-only`: pare aqui. Não implemente.

**Não comece a implementar sem aprovação do plano.**

---

### Fase B — Execução (implementar tasks)

#### B.1 Pre-flight

Rode em paralelo:

1. `git status --porcelain` — árvore limpa
2. `git rev-parse --abbrev-ref HEAD` + `git fetch origin`
3. `gh auth status` (se disponível)
4. `docker info` (se o projeto usa Docker)

Se falhar: STOP e reporte.

#### B.2 Ordem de execução

Calcule a ordem de implementação respeitando:

1. **Dependências entre tasks** (`depends_on` no frontmatter)
2. **Dependências entre features** (features da mesma fase)
3. **Prioridade** (P0 antes de P1 antes de P2)
4. **Fase** (Fase 1 inteira antes da Fase 2)

Tasks independentes dentro da mesma feature **podem ser paralelizadas** (múltiplos Agent calls na mesma mensagem).

#### B.3 Checkpoint por feature (OBRIGATÓRIO)

Antes de iniciar cada feature:

> Próxima feature: **[nome]** ([N] tasks, ~[N] dias)
>
> Tasks na fila:
> - [P0] NNN — [título] (S)
> - [P0] NNN — [título] (M)
> - [P1] NNN — [título] (S)
>
> Iniciar implementação desta feature?

#### B.4 Implementar tasks da feature

Para cada task, execute o fluxo completo do `/ksdd:build:feature`:

1. **Valida dependências** — `depends_on` com `status: concluída`
2. **Issue GitHub** (se `gh` disponível) — título, labels, checklist
3. **Branch** — `feature/[slug]/NNN-[task-slug]`
4. **Context.md** — compila todo o contexto da task
5. **Execução via subagents** — roteamento por área
6. **Quality gates** — build, testes, lint, type-check, E2E, code review
7. **Validação de critérios** — cada critério demonstrado
8. **Commit atômico** — `feat(task-NNN): <descrição>`
9. **Atualiza status** — task → `em revisão`

**Entre tasks da mesma feature:** não precisa de checkpoint do usuário (exceto se uma task falha).

#### B.5 Checkpoint pós-feature

Após todas as tasks de uma feature:

> Feature **[nome]** implementada:
> - [N] tasks concluídas
> - [N] PRs abertos (ou commits na branch)
> - Critérios de aceite da feature: [N/N] atendidos
>
> Próxima feature: **[nome]** ([N] tasks)
> Ou quer revisar/ajustar algo antes de continuar?

#### B.6 Checkpoint pós-fase

Após todas as features de uma fase:

> **Fase [N] — [tema] concluída:**
>
> | Feature | Tasks | Critérios | Status |
> |---------|-------|-----------|--------|
> | [nome] | [N/N] | [N/N] | ✅ |
> | [nome] | [N/N] | [N/N] | ✅ |
>
> Total: [N] tasks implementadas, [N] PRs abertos
>
> Próxima fase: **Fase [N+1] — [tema]** ([N] features, [N] tasks)
> Prosseguir? Ou quer consolidar/testar a Fase [N] antes?

**Recomende fortemente** consolidar e testar uma fase antes de iniciar a próxima.

#### B.7 Atualizar BUILD-PLAN.md

Após cada feature/fase concluída, atualize o `.ksdd/build/BUILD-PLAN.md` (ou path legado raiz se a sessão de planejamento usou o legado):
- Status das features e fases
- Data de conclusão
- Desvios do plano
- Dívida técnica identificada

---

### Fase C — Conclusão

#### C.1 Validação final

Após todas as fases implementadas:

1. **Critérios de aceite do SPEC:** Verifique se os KPIs da seção 15 do SPEC.md têm instrumentação
2. **Fluxos críticos do SPEC:** Verifique se as jornadas da seção 13 funcionam ponta-a-ponta
3. **Cobertura geral:** Reporte cobertura de testes agregada

#### C.2 Checkpoint final

> Build do projeto **[nome]** concluído.
>
> **Resumo:**
> | Métrica | Valor |
> |---------|-------|
> | Fases implementadas | [N] |
> | Features | [N] |
> | Tasks | [N] concluídas, [N] em revisão |
> | PRs abertos | [N] |
> | Cobertura de testes | [X%] |
>
> **Pendências:**
> - [PRs aguardando merge]
> - [Tasks em revisão]
> - [Critérios parciais]
>
> **Dívida técnica identificada:**
> - [item 1]
> - [item 2]
>
> Próximos passos:
> - Merge dos PRs abertos
> - Testes end-to-end dos fluxos críticos
> - Deploy para staging

---

## Quando usar `--resume`

Se o build foi interrompido (features/tasks existentes com status misto):

1. Leia `.ksdd/build/BUILD-PLAN.md` (fallback `BUILD-PLAN.md` raiz legado) e identifique o estado
2. Leia todos os `.ksdd/tasks/feature-*/README.md` (e `docs/tasks/feature-*/README.md` legado) pra ver status de cada task
3. Apresente resumo:

```
Build em progresso detectado:
- Fase 1: 3/5 features concluídas, 2 em andamento
- Feature data-model: 4/6 tasks concluídas, 2 para implementar
- Feature auth-flow: todas para implementar

Retomar a partir de:
  Task 012 — create-auth-middleware (feature: auth-flow)

Confirma?
```

4. Retome da próxima task incompleta

---

## Quando `architecture.md` não existe

O build ainda funciona, mas com decisões adicionais:

1. **Pergunta stack mínima ao usuário:**
   - Frontend: React+Vite / Next.js / Vue / outro?
   - Backend: FastAPI / Express / Go / outro?
   - Banco: PostgreSQL / MySQL / MongoDB / outro?
   - Hosting: Vercel / AWS / Docker local?

2. **Registra decisões no `.ksdd/build/BUILD-PLAN.md`** seção "Decisões tomadas no planejamento"
3. **Tasks de infra** ficam mais genéricas (sem refs a ADRs)
4. **Sugere:** "Considere rodar `/ksdd:tech` antes do build pra ter decisões documentadas"

---

## Paralelismo entre features

Features sem dependência mútua podem ser buildadas em paralelo:

- **Paralelo seguro:** `auth-flow` e `data-model` (se não se tocam)
- **Sequencial obrigatório:** `data-model` → `core-api` (API depende do modelo)

Na prática, use paralelismo apenas quando:
1. As features não tocam os mesmos arquivos
2. O usuário aprovou o paralelismo
3. Cada feature vai pra sua própria branch

Se em dúvida, **vá sequencial** — é mais seguro e mais fácil de debugar.

---

## Artefatos são read-only

**NUNCA** modifique `SPEC.md`, `architecture.md`, `DESIGN.md` (em `.ksdd/specs/` ou raiz legado) durante o build. `FEATURE-*.md` (em qualquer dos paths) pode ter status atualizado, mas conteúdo é read-only.

Se algo nos artefatos está errado, sinalize ao usuário. As únicas exceções: status de tasks e `BUILD-PLAN.md` (em `.ksdd/build/` ou raiz legado).

---

## Anti-patterns

- ❌ Começar a codar sem plano aprovado. → BUILD-PLAN.md é obrigatório antes de qualquer implementação.
- ❌ Buildar tudo sem checkpoint por fase. → Cada fase é uma entrega. Consolide antes de avançar.
- ❌ Pular quality gates "pra ir mais rápido". → Dívida técnica na Fase 1 vira bug na Fase 2.
- ❌ Features com 30+ tasks. → Quebre em features menores. Alvo: 3-10 tasks por feature.
- ❌ Ignorar `depends_on` entre features. → Ordem de execução é calculada, não improvisada.
- ❌ Paralelismo agressivo. → Duas features mexendo no mesmo arquivo = conflito garantido.
- ❌ Build sem architecture.md e sem perguntar stack. → Código sem decisões técnicas é lottery.
- ❌ Implementar Fase 2 sem Fase 1 testada. → Cada fase é alicerce da próxima.
- ❌ Commits monolíticos por feature inteira. → Um commit por task, atômico e revertível.
- ❌ Fazer merge sozinho. → PRs aguardam review humano.
