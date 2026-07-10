---
description: Implementa tasks de uma feature ponta-a-ponta — issue+subtasks no GitHub, branch, context.md, execução via teammates, validação de quality gates, commit atômico e PR. Lê .ksdd/features/FEATURE-[slug].md + tasks de .ksdd/tasks/feature-[slug]/ (com fallback para docs/ e raiz legados).
argument-hint: "<slug|task-id|--all> [--multi-pr] (ex: push-notifications, 016, 016-create-endpoint, --all, push-notifications --multi-pr)"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent, WebFetch, view, create_file, str_replace, ask_user_input_v0, web_search, web_fetch, conversation_search, execute_shell, list_directory, mcp__github__*, mcp__context7__*, mcp__pencil__*, mcp__executeautomation-playwright-server__*
---

# /ksdd:build:feature — Implementar feature task por task

Você vai implementar tasks de uma feature definidas em `.ksdd/tasks/feature-[slug]/` (com fallback para `docs/tasks/feature-[slug]/` legado) seguindo o fluxo completo: pre-flight → leitura de contexto → issue no GitHub → branch de build → context.md → execução paralela em ondas (teammates + worktrees) → quality gates → sincronização de docs → PR único.

O modelo de execução (paralelismo, worktrees, PR único, sync) é canônico em `references/parallel-build.md` — este command o **aplica e referencia**, sem reduplicar a prosa.

**Princípios:**

- Atomic, rastreável, revertível. Cada passo é um commit ou comentário no issue.
- Nada de atalho: quality gates passando antes do PR.
- Falhou em qualquer gate? Reporta no issue, deixa branch limpa, pede direcionamento ao usuário.

## Idioma (obrigatório)

Siga `references/language-policy.md` — `context.md`, comentários em issues/PR, commits e comunicação com o usuário no idioma da conversa e dos artefatos KSDD; código e identificadores seguem convenções do repo.

---

## Argumentos

`$ARGUMENTS` aceita:

- **Slug da feature:** `push-notifications` → implementa a próxima task `para implementar` da feature (respeita dependências).
- **ID de task:** `016` → resolve para `.ksdd/tasks/feature-*/016-*.md` (fallback `docs/tasks/feature-*/016-*.md`).
- **Slug parcial:** `016-create-endpoint` ou `create-endpoint`.
- **Caminho completo:** `.ksdd/tasks/feature-push-notifications/016-create-endpoint.md` (ou path legado).
- **`--all`:** implementa todas as tasks `para implementar` da feature em **ondas paralelas**, respeitando dependências e prioridade (ver seção 5 e "Quando implementar `--all`"). Roda autônomo até o fim; pausa só em falha de gate ou no checkpoint da sync pós-build.
- **`--multi-pr`:** modificador (combina com `--all` ou com o slug) — abre **1 PR por task** em vez do PR único ao final (seção 9). Sem ele, build completo = **1 PR**.

Se ambíguo (mais de um match — incl. mesmo ID em paths novo e legado), **pare e peça desambiguação** — não adivinhe.

**Slug/task de fix (bug):** se o argumento resolve para uma correção — `.ksdd/fixes/FIX-[slug].md` ou tasks em `.ksdd/tasks/fix-[slug]/` — **não** builde por aqui. Fixes têm fluxo próprio (repro-first + teste de regressão obrigatório). Oriente o usuário a rodar `/ksdd:build:fix [slug]`.

---

## Paths dos artefatos (KSDD v0.6.0+)

Resolução de paths neste command segue esta hierarquia:

| Artefato                | Ordem de busca                                                                       |
|-------------------------|---------------------------------------------------------------------------------------|
| task `NNN-*.md`         | `.ksdd/tasks/feature-[slug]/` → `docs/tasks/feature-[slug]/`                          |
| FEATURE-[slug].md       | `.ksdd/features/FEATURE-[slug].md` → `docs/FEATURE-[slug].md` → raiz `FEATURE-[slug].md` |
| SPEC.md                 | `.ksdd/specs/SPEC.md` → raiz `SPEC.md`                                                |
| architecture.md         | `.ksdd/specs/architecture.md` → raiz `architecture.md`                                |
| DESIGN.md               | `.ksdd/specs/DESIGN.md` → raiz `DESIGN.md`                                            |
| features arquivadas     | `.ksdd/archive/raw/[slug]/` (read-only — detecção de archive bloqueia o build)        |

**Regra-chave:** o path onde a **task** vive dita onde fica seu `.context/NNN-context.md` e qual `README.md` é atualizado:
- Task em `.ksdd/tasks/feature-[slug]/NNN-*.md` → context em `.ksdd/tasks/feature-[slug]/.context/` e README atualizado em `.ksdd/tasks/feature-[slug]/README.md`.
- Task em `docs/tasks/feature-[slug]/NNN-*.md` (legado) → context em `docs/tasks/feature-[slug]/.context/` e README legado atualizado. Sem migração automática.

Quando encontrar artefatos em paths legados, emita o warning amarelo padronizado descrito nos outros commands KSDD v0.6.0+ e sugira `git mv` para migração manual.

---

## 0. Pré-flight (FALHA RÁPIDA)

Rode em paralelo:

1. `git status --porcelain` — árvore limpa (sem modificações nem untracked relevantes). Se suja, pare e peça stash/commit.
2. `git rev-parse --abbrev-ref HEAD` + `git fetch origin` — capture branch atual e default branch.
3. Verifique se `gh` está disponível: `gh auth status`. Se não, prossiga sem GitHub integration (sem issue/PR, apenas implementação local).
4. Verifique Docker se o projeto usa: `docker info`. Se não responde e o projeto requer Docker, avise.

Se qualquer pré-requisito **crítico** falhar (git sujo), **STOP** e reporte o que falta.

---

## 0.5 Detecção de slug arquivado

**Antes** de tentar resolver a task (seção 1), verifique se o slug-alvo foi arquivado:

1. Parse o argumento para identificar o slug da feature (slug direto, ou slug derivado do ID/path).
2. Verifique se `.ksdd/archive/raw/[slug]/` existe.
3. Se existir, **pare** sem mexer em nada e apresente 3 opções via `ask_user_input_v0`:
   - **(a) Consultar `.ksdd/archive/ARCHIVE.md`** — abra a seção do slug com `view` e mostre ao usuário; encerre.
   - **(b) Restaurar a feature arquivada** — instrua o usuário a rodar `/ksdd:archive --restore [slug]` antes de re-tentar `/ksdd:build:feature`; encerre.
   - **(c) Abortar** — encerra sem fazer nada.
4. **Nunca** restaure automaticamente. A reabertura é decisão consciente do usuário.

Em projetos sem `.ksdd/archive/`, pule esta checagem silenciosamente. Se o argumento é um ID de task que vive em `.ksdd/archive/raw/[slug]/tasks/NNN-*.md`, o mesmo bloqueio se aplica.

---

## 1. Resolver e validar a task

1. **Resolva** o argumento para um caminho de arquivo de task.
2. **Leia** o arquivo da task. Parse o frontmatter (`id`, `title`, `status`, `feature`, `area`, `priority`, `estimate`, `depends_on`, `feature_refs`, `spec_refs`, `arch_refs`).
3. **Bloqueios:**
   - `status` ≠ `para implementar` → pare e pergunte se quer reabrir/forçar.
   - Cada ID em `depends_on` precisa ter `status: concluída`. Se algum não está, liste os pendentes e **pare**.
4. **Leia** os artefatos referenciados (use `Grep` para localizar seções e `Read` com `offset`/`limit` para extrair só os trechos). Aplique a hierarquia de paths definida em "Paths dos artefatos" — `*_refs` no frontmatter podem citar qualquer dos paths possíveis (novo ou legado):
   - FEATURE-[slug].md — seções em `feature_refs`
   - SPEC.md — seções em `spec_refs`
   - architecture.md — seções em `arch_refs` (se existir)
   - DESIGN.md — componentes/tokens referenciados (se existir)

---

## 2. Criar issue no GitHub (se `gh` disponível)

Use `gh issue create` com:

- **Título:** `[Task NNN] <título da task>`
- **Body (markdown):**
  - Metadata: `Feature: [slug] · Área: <area> · Prioridade: PX · Estimativa: S/M/L`
  - Seção "## Objetivo" copiada da task
  - Seção "## Critérios de aceitação" como checklist `- [ ]`
  - Seção "## Referências": links para a task, FEATURE spec, SPEC, architecture
  - Seção "## Riscos / dependências externas" copiada
  - Rodapé: `Gerada por /ksdd:build:feature em <ISO date>.`
- **Labels:** `task`, `feature-<slug>`, `area-<area>`, `priority-<pri>`. Crie labels inexistentes.
- **Assignee:** `@me`

Capture `ISSUE_NUM` e URL.

Se `gh` não está disponível, **pule** — trabalhe local-only e registre no commit message.

---

## 3. Criar branch a partir da issue

Se `gh` disponível:
```
gh issue develop $ISSUE_NUM --checkout
```

Se `gh` indisponível, crie manualmente:
```
git checkout -b feature/[slug]/NNN-[task-slug]
```

Confirme que está na branch nova com `git rev-parse --abbrev-ref HEAD`.

---

## 4. Gerar `context.md` de implementação

Crie `<tasks-dir>/.context/NNN-context.md` onde `<tasks-dir>` é o diretório onde a **task vive** (`.ksdd/tasks/feature-[slug]/` no layout novo, `docs/tasks/feature-[slug]/` se a task ficou no legado). Antes do `create_file`, garanta `mkdir -p <tasks-dir>/.context/`.

Compila todo o contexto necessário para implementar a task.

### 4.1 Bloco "Task em uma página"

- Frontmatter da task
- Objetivo + escopo + critérios de aceitação
- Link para issue (se criada)

### 4.2 Bloco "Feature spec relevante"

Extraído das seções referenciadas em `feature_refs`. Cole textualmente — não parafraseie.

### 4.3 Bloco "SPEC relevante"

Extraído das seções em `spec_refs`.

### 4.4 Bloco "Arquitetura relevante"

Extraído das seções em `arch_refs`. Inclua ADRs citados (texto integral).

### 4.5 Bloco "Design" (se a task é `area: frontend` ou `area: design`)

- Tokens e componentes do DESIGN.md referenciados
- Se disponível, use MCP Pencil para extrair guidelines e variáveis do design system
- Se não houver design system, documente que decisões visuais serão tomadas na implementação

### 4.6 Bloco "Documentação oficial" (opcional)

Se a task cita libs/frameworks específicos nas Notas técnicas, use Context7 MCP (se disponível):

1. `resolve-library-id` com o nome da lib
2. `get-library-docs` com tópico específico da task

Cole apenas o trecho relevante + link da fonte. Não puxe docs inteiras.

### 4.7 Bloco "Plano de implementação"

Esboce **antes de codar**:

- Lista de arquivos novos/modificados (caminhos no projeto)
- Migrations necessárias (se `data-model`)
- Endpoints / componentes / workers expostos
- Lista de testes que serão escritos
- Pontos de risco específicos

### 4.8 Bloco "Quality gates"

Checklist dos comandos que serão rodados antes do commit:

```
- [ ] Build (docker compose build OU npm run build OU equivalente)
- [ ] Testes unitários + cobertura
- [ ] Lint + type-check
- [ ] E2E / Playwright (se UI tocada)
- [ ] code-reviewer agent
- [ ] security-auditor agent (se auth/PII/payment tocado)
```

**Commit** do context.md como primeiro commit da branch:
`chore(task-NNN): adiciona context.md de implementação`

---

## 5. Executar implementação via teammates (ondas de paralelismo)

O modelo de execução paralela é **canônico** em `references/parallel-build.md` (seções 1 e 2) — esta seção o **aplica**, sem reduplicar a prosa. Consulte o reference para o racional completo (ondas, worktrees, quem comita).

### 5.1 Organizar as tasks em ondas

Num build completo (mais de uma task — `--all` ou o slug da feature), organize as tasks `para implementar` em **ondas de execução** (`parallel-build.md` §1.1):

- **Dentro de uma onda:** tasks **independentes** rodam em paralelo — **um teammate cada, todas as chamadas de agente despachadas na MESMA mensagem** para rodarem concorrentes (contrato do skill dispatching-parallel-agents: um agente por problema independente; cada prompt self-contained, escopado a um domínio, com entregável explícito).
- **Entre ondas:** respeita-se a ordem de dependência.

Duas tasks são **independentes** (cabem na mesma onda) quando, e só quando:

1. Não há `depends_on` mútuo entre elas (nem transitivo ainda pendente), **e**
2. Não há **overlap de arquivos previsto** — derivado do bloco "Plano de implementação" (§4.7) de cada task / do `context.md`.

Task com dependência pendente **ou** overlap de arquivos vai para uma **onda posterior** — nunca para a mesma onda paralela. Build de **task única** (o argumento é um ID/slug isolado) não paraleliza: é uma onda de um teammate só.

### 5.2 Roteamento por área

Divida o trabalho entre agentes especializados (Agent tool). Roteamento por área:

| Área da task | Subagent preferido | Skill complementar |
|--------------|---------------------|--------------------|
| `backend`, `data-model`, `auth`, `billing` | `backend-architect` (planejamento) → `generalPurpose` (implementação) | `senior-backend` |
| `frontend`, `design` | `generalPurpose` com `senior-frontend` skill | `ui-design-system` se for novo componente |
| `infra`, `observability` | `generalPurpose` | `devops-iac-engineer` |
| `qa` | `generalPurpose` | `webapp-testing` |

### 5.3 Regras de orquestração

1. **Prompt de cada teammate** (self-contained — `parallel-build.md` §1.2) sempre inclui:
   - Caminho absoluto do `context.md` da task (o teammate lê antes de codar)
   - Caminho da task original + os **critérios de aceitação apenas dessa task**
   - Restrições explícitas: "edite só os arquivos do seu plano de implementação", "**não rode `git`**", "não toque em arquivos de outra task da onda"
   - Formato de retorno: **diff resumido** + o que validou localmente
2. **Teammates editam arquivos e retornam — não rodam `git`** (`parallel-build.md` §1.3). Quem comita é o orquestrador (este command), **sequencialmente após a onda**, para evitar contenção de index lock entre agentes concorrentes. Para cada task da onda que retornou:
   - Inspecione o diff (`git diff` no worktree da task)
   - Rode os **quality gates daquela task** (seção 6) — obrigatórios antes de integrar
   - Se aprovado: integre na **branch de build** com **commit atômico** `feat(task-NNN): <descrição>` (+ `Refs #ISSUE_NUM` quando houver issue) e **remova o worktree** (seção 5.4)
   - Se ruim: `git restore .` no worktree e re-prompte o teammate com feedback específico
3. **Progresso na issue** (se GitHub disponível): após cada commit atômico, comente no issue da task o que foi feito.

O paralelismo **não afrouxa nenhum gate**: os gates da seção 6 rodam por task, antes da integração de cada uma.

### 5.4 Isolamento em git worktrees

Ciclo de vida canônico em `references/parallel-build.md` (seção 2) — aqui está a aplicação (contrato do skill using-git-worktrees).

**Branch de build (base do PR único).** Num build completo, crie **uma** branch de build da feature a partir do default branch — ela **substitui a criação de branch-por-task da §3**, é onde os commits atômicos de todas as tasks são integrados, e dela sai o PR único (seção 9). No build de **task única**, a branch criada na §3 já é essa base (uma task = uma branch = um PR).

**Por teammate paralelo:**

1. **Detecte isolamento existente antes de criar — nunca aninhe worktrees.** Compare git-dir e git-common-dir; se diferentes, já há isolamento e você **não** cria outro:
   ```bash
   GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
   GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
   # GIT_DIR != GIT_COMMON (e não é submódulo) ⇒ já isolado; não crie outro worktree.
   ```
2. **Crie o worktree** com branch própria a partir da branch de build:
   ```bash
   git worktree add <path> -b feature/[slug]/NNN-[task-slug]
   ```
   Priorize `.worktrees/` (ou `worktrees/` se o projeto já usa). **Verifique que o diretório de worktrees está git-ignored** antes de criar.
3. O teammate trabalha dentro do `<path>` do seu worktree, isolado dos demais da onda.
4. **Na integração** (após gates verdes e commit atômico — seção 5.3), **remova o worktree** para não deixar órfãos:
   ```bash
   git worktree remove <path>
   ```

Nenhum worktree pode sobrar ao final do build.

### 5.5 Fallback seguro (sequencial in-place)

O paralelismo é o **default**, mas nunca ao custo de conflito garantido. Caia para **execução sequencial in-place** na branch de build — uma task por vez, **preservando todo o resto do fluxo** (gates por task, commits atômicos, sincronização pós-build e PR único) — quando:

- O ambiente **nega** `git worktree add` (sandbox), **ou**
- Duas tasks da onda **tocam os mesmos arquivos** (overlap de arquivos previsto).

Avise o usuário com a mensagem amarela canônica (FEATURE §8.3):

> ⚠ worktrees indisponíveis neste ambiente (ou tasks com overlap de arquivos) — executando em modo sequencial in-place.

---

## 6. Quality gates obrigatórios (antes do PR)

Rode os gates relevantes para a área da task. Em paralelo onde possível:

### 6.1 Build

```bash
# Adapte ao projeto: docker compose, npm run build, python -m build, etc.
# O comando correto vem do architecture.md ou do codebase existente
```

Se build falhar, **pare** e corrija antes de continuar.

### 6.2 Testes + cobertura

```bash
# Backend: pytest --cov --cov-branch
# Frontend: npm run test:coverage / vitest run --coverage
# Adapte ao projeto
```

### 6.3 Lint + type-check

```bash
# Backend: ruff check . && mypy .
# Frontend: npm run lint && npm run type-check
# Adapte ao projeto
```

### 6.4 E2E / Playwright (se UI tocada)

Use a skill `webapp-testing` ou Playwright MCP:
- Navegue pelo fluxo da task
- Valide elementos-chave
- Capture screenshots como evidência

### 6.5 Revisão de código

Spawn em paralelo:

- `Agent(subagent_type="code-reviewer")` — revisa qualidade, patterns, manutenibilidade
- `Agent(subagent_type="security-auditor")` — **somente se** a task envolve auth, PII, billing, OAuth, uploads, SQL dinâmico

Se algum revisor levantar issue **bloqueante**: corrija, recomite, re-rode os gates.

---

## 7. Validar critérios de aceitação

Para cada `- [ ]` na seção "Critérios de aceitação" da task:

1. Demonstre que está atendido (teste passando, comando, screenshot)
2. Se GitHub disponível: marque como `- [x]` na issue
3. Se algum critério **não puder ser demonstrado**, **pare** e peça direcionamento ao usuário

---

## 8. Atualizar status da task

1. Edite o frontmatter da task: `status: em revisão` (no path onde a task vive).
2. Atualize o `README.md` de tasks **no mesmo diretório** da task (`.ksdd/tasks/feature-[slug]/README.md` ou `docs/tasks/feature-[slug]/README.md` legado).
3. Commit: `docs(task-NNN): atualiza status para em revisão`

---

## 8.5 Sincronização de artefatos e docs (pós-build)

Aplica `references/parallel-build.md` (seção 5). Roda **depois de todas as tasks** do build completo estarem concluídas na branch de build, **antes do PR** (seção 9) e **com checkpoint de aprovação antes de comitar**.

### 8.5.1 Atualiza SÓ docs derivados (edição cirúrgica)

Somente os que **existirem** no projeto — `str_replace` cirúrgico, nunca reescrita:

- `README.md` (raiz)
- `CLAUDE.md` / `AGENTS.md` (guia de agentes)
- `CHANGELOG.md`
- Tracking de tasks: confirma o `status:` das tasks (a §8 já move cada uma para `em revisão`) e atualiza de forma consolidada o `README.md` de tasks da feature

**Doc derivado ausente → pula aquele doc e informa o usuário:**

> README.md/CLAUDE.md/CHANGELOG não encontrado — pulando atualização deste doc.

### 8.5.2 NUNCA edita os artefatos-contrato — só sinaliza drift

`SPEC.md`, `architecture.md`, `DESIGN.md` e `FEATURE-*.md` permanecem **read-only** nesta fase. Se a implementação sugerir que algum ficou desatualizado, **sinalize sem editar** (mensagem amarela, FEATURE §8.3):

> ⚠ A implementação sugere que <artefato read-only> pode estar desatualizado: <o que revisar>. Não foi editado — revise manualmente.

### 8.5.3 Checkpoint + commit

Apresente o **diff dos docs derivados** + a **lista de drift sinalizado** e **peça aprovação** ao usuário. Só após o OK, comite a sincronização na **branch de build** (`docs(sync): sincroniza docs derivados pós-build`) — ela entra no **PR único** (seção 9). Este é um **checkpoint humano obrigatório**: nunca comite a sync sem aprovação.

---

## 9. Abrir PR (se GitHub disponível)

Modelo canônico em `references/parallel-build.md` (seção 3) — aqui está a aplicação.

### 9.1 PR único — default do build completo

Um **build completo** (`--all` ou o slug da feature) abre **exatamente 1 PR** ao final, da **branch de build** para o default branch, **agregando todos os commits atômicos** das tasks **+ o commit de sincronização pós-build** (seção 8.5). **NÃO faz merge** — aguarda review humano. Mensagem de sucesso:

> PR único aberto para a feature [slug]: <URL>. Múltiplos PRs? use --multi-pr.

### 9.2 `--multi-pr` — 1 PR por task (sob pedido)

Com `--multi-pr` no `$ARGUMENTS` (ou pedido explícito do usuário na conversa), reproduz o comportamento histórico: **1 PR por task** concluída. A fase de sync (seção 8.5) roda uma vez ao final.

### 9.3 Build de task única — 1 PR daquela task

Quando o argumento é um único ID/slug de task, abre **1 PR daquela task** (semântica inalterada). O "PR único ao final" é a semântica do **build completo**, não da task isolada.

### 9.4 Conteúdo do PR

Use `gh pr create` com:

- **Base:** default branch do projeto (main/master/production)
- **Head:** a **branch de build** (9.1) ou a branch da task (9.2/9.3)
- **Título:** build completo → `[Feature <slug>] <nome da feature>`; task única / `--multi-pr` → `[Task NNN] <título>`
- **Body:**

```markdown
## Resumo
<2-4 bullets: o que a feature entrega (build completo) ou o que a task mudou (task única / --multi-pr)>

## Issues
Closes #<ISSUE_NUM>   <!-- uma linha por issue de task no build completo -->

## Feature
.ksdd/features/FEATURE-[slug].md — [nome da feature] (ou path legado se a feature ainda não migrou)

## Commits
<lista dos commits atômicos por task + o commit de sync pós-build (build completo)>

## Critérios de aceitação
<checklist marcada: da feature no build completo; da task em task única / --multi-pr>

## Quality gates
- [x] Build OK
- [x] Testes: cobertura X%
- [x] Lint + type-check OK
- [x] E2E (se aplicável)
- [x] Code review
- [x] Security audit (se aplicável)

## Sincronização pós-build (seção 8.5)
<docs derivados atualizados (README/CLAUDE.md/CHANGELOG/status de tasks) + drift sinalizado dos read-only>

## Notas para revisor
<pontos sutis, decisões, trade-offs>
```

- **Labels:** `feature-<slug>`, `area-<area>` (uma por área tocada), `ready-for-review`

**NÃO faça merge** — aguarde review humano.

Se `gh` não está disponível, apresente o resumo ao usuário com instruções pra criar o PR manualmente.

---

## 10. Checkpoint final

**Build de task única:**

> Task **NNN — [título]** implementada.
>
> - Branch: `[nome]`
> - Commits: [N]
> - PR: [URL ou "local-only"]
> - Critérios atendidos: [N/N]
> - Quality gates: todos verdes
>
> **Próxima task sugerida:** NNN — [título] (próxima P0 sem dependências bloqueadas)
>
> Quer implementar a próxima? Ou revisar algo nesta?

**Build completo (`--all` / slug):**

> Feature **[slug]** buildada.
>
> - Execução: [K] ondas em paralelo ([N] teammates) — ou `sequencial in-place` (motivo: worktree negado pelo ambiente / overlap de arquivos)
> - Tasks: [N] concluídas · commits atômicos: [N]
> - PR: **1 único** — [URL] — ou `[N] PRs` (com `--multi-pr`)
> - Sync pós-build: docs derivados sincronizados ([lista]); drift sinalizado: [lista ou "nenhum"]
> - Quality gates: todos verdes por task
>
> **NÃO** foi feito merge — o PR aguarda review humano.

---

## Quando implementar `--all` (múltiplas tasks)

Se `$ARGUMENTS` contém `--all` ou é apenas o slug da feature, o build roda no **modelo paralelo canônico** (`references/parallel-build.md`) — **não** task-por-task com checkpoint entre cada uma:

1. Liste todas as tasks `para implementar` da feature e calcule as **ondas de execução** (seção 5.1). A ordem entre ondas continua respeitando dependências (`depends_on`) → prioridade (P0 primeiro) → ID.
2. Crie a **branch de build** da feature (seção 5.4) e execute **onda a onda**, cada onda despachando em paralelo os teammates das tasks independentes (seção 5). **Sem checkpoint humano obrigatório entre cada task** — o usuário pode rodar o build completo de forma **autônoma até o fim**.
3. Após todas as ondas: rode a **sincronização pós-build** (seção 8.5, com seu checkpoint de aprovação) e abra **1 único PR** (seção 9) — ou `N` PRs com `--multi-pr`.
4. Reporte o resumo agregado no checkpoint final (seção 10): ondas usadas (ou fallback sequencial + motivo), PR(s), docs sincronizados, drift sinalizado.

**Checkpoint em falha (mantido):** se um gate falhar numa task, aquela task pausa/volta ao teammate enquanto as demais da onda seguem; a branch de build fica inspecionável. Pare e peça direcionamento **apenas** quando um gate bloquear — não a cada task bem-sucedida.

---

## Falhas e abortos

- **Gate falha** (build, testes): comente no issue, deixe branch inspecionável, **não** force `--no-verify`.
- **Conflito de merge**: `git fetch && git rebase origin/<base>`. Se conflito não-trivial, pare e peça ajuda.
- **Subagente entrega lixo**: `git restore .`, re-prompte com feedback específico. Não acumule lixo.
- **MCP indisponível**: caia para CLI equivalente via Bash (`gh` para GitHub, etc.).
- **Dependência não concluída**: pare, liste os blockers, pergunte se quer implementar a dependência primeiro.

---

## Artefatos são read-only durante build

**NUNCA** modifique os **artefatos-contrato** — `SPEC.md`, `architecture.md`, `DESIGN.md` ou `FEATURE-[slug].md` (em qualquer um dos paths suportados — `.ksdd/specs/`, `.ksdd/features/`, raiz, `docs/`) — durante o build. Eles seguem **read-only inclusive na sincronização pós-build** (seção 8.5): drift é apenas **sinalizado** ao usuário, nunca corrigido automaticamente. Se durante a implementação ficar claro que algo está errado ou incompleto num desses artefatos, sinalize — não corrija.

**Exceção — docs derivados:** a fase de sync pós-build (seção 8.5) faz **edição cirúrgica** apenas nos **docs derivados** do projeto (`README.md`, `CLAUDE.md`/`AGENTS.md`, `CHANGELOG.md`) e no tracking de tasks (`status` e o `README.md` de tasks, no path onde a task vive), sempre com o **checkpoint de aprovação** da §8.5. Durante as ondas de implementação (seções 5–8), trate tudo como read-only exceto o `status`/README das tasks que você conclui.

---

## Anti-patterns

- ❌ Começar a codar sem ler context.md e artefatos. → Contexto incompleto = código inconsistente.
- ❌ Implementar fora do escopo da task. → A task define o trabalho. Respeite "Fora de escopo".
- ❌ Reescrever arquivos inteiros. → `str_replace` cirúrgico.
- ❌ Ignorar padrões do codebase. → Siga naming, imports, organização existentes.
- ❌ Pular quality gates. → Cada gate existe por uma razão.
- ❌ Instalar dependências sem justificativa. → Toda lib nova precisa estar documentada.
- ❌ Gerar código sem tratamento de erros. → Happy path only é dívida técnica.
- ❌ Fazer merge sozinho. → PR aguarda review humano.
- ❌ Marcar task como `concluída` antes do merge. → Status fica `em revisão` até merge confirmado.
- ❌ Commits monolíticos com todo o diff. → Commits atômicos por subtarefa/bloco lógico.
- ❌ Tentar implementar slug arquivado sem confirmação. → Use `/ksdd:archive --restore [slug]` explicitamente para reabrir.

---

## Iteração / Retomada

Se o build foi interrompido (branch existe com commits parciais):

1. Leia o context.md e o estado da task
2. `git log --oneline` na branch pra ver o que já foi feito
3. Pergunte se quer continuar de onde parou ou recomeçar
4. Se continuar, retome da próxima subtarefa/gate incompleto
