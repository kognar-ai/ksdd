---
description: Implementa tasks de uma feature ponta-a-ponta — issue+subtasks no GitHub, branch, context.md, execução via teammates, validação de quality gates, commit atômico e PR. Lê .ksdd/features/FEATURE-[slug].md + tasks de .ksdd/tasks/feature-[slug]/ (com fallback para docs/ e raiz legados).
argument-hint: "<slug|task-id|--all> (ex: push-notifications, 016, 016-create-endpoint, --all)"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent, WebFetch, view, create_file, str_replace, ask_user_input_v0, web_search, web_fetch, conversation_search, execute_shell, list_directory, mcp__github__*, mcp__context7__*, mcp__pencil__*, mcp__executeautomation-playwright-server__*
---

# /ksdd:build:feature — Implementar feature task por task

Você vai implementar tasks de uma feature definidas em `.ksdd/tasks/feature-[slug]/` (com fallback para `docs/tasks/feature-[slug]/` legado) seguindo o fluxo completo: pre-flight → leitura de contexto → issue no GitHub → branch → context.md → execução com teammates → quality gates → commit → PR.

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
- **`--all`:** implementa todas as tasks `para implementar` da feature em ordem de dependência (com checkpoint entre cada uma).

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
- **Craft/QA com impeccable (opcional):** se o impeccable estiver disponível, registre no plano rodar `/impeccable shape|critique` **antes** de implementar a UI e `/impeccable audit|polish` **depois**. É opt-in — não bloqueia quem não o tem. Ver `references/integrations/impeccable.md`.

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
- [ ] Slop detector de UI (impeccable, opcional — só se disponível): npx impeccable detect <ui-paths>
```

**Commit** do context.md como primeiro commit da branch:
`chore(task-NNN): adiciona context.md de implementação`

---

## 5. Executar implementação via teammates

Divida o trabalho entre agentes especializados (Agent tool). Roteamento por área:

| Área da task | Subagent preferido | Skill complementar |
|--------------|---------------------|--------------------|
| `backend`, `data-model`, `auth`, `billing` | `backend-architect` (planejamento) → `generalPurpose` (implementação) | `senior-backend` |
| `frontend`, `design` | `generalPurpose` com `senior-frontend` skill | `ui-design-system` se for novo componente |
| `infra`, `observability` | `generalPurpose` | `devops-iac-engineer` |
| `qa` | `generalPurpose` | `webapp-testing` |

**Regras de orquestração:**

1. **Prompt do agente** sempre inclui:
   - Caminho absoluto do `context.md` (agente lê antes de codar)
   - Caminho da task original
   - Critérios de aceitação **apenas dessa task**
   - Regra: o agente implementa e testa localmente, retorna com diff resumido
2. **Após cada agente concluir:**
   - Inspecione o diff (`git diff`)
   - Se satisfatório: `git add -p` → `git commit -m "feat(task-NNN): <descrição>" -m "Refs #ISSUE_NUM"`
   - Se ruim: `git restore .`, re-prompte com feedback mais específico
3. **Progresso na issue** (se GitHub disponível): após cada commit, adicione comentário com o que foi feito

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

### 6.6 Slop detector de UI (impeccable — opcional)

**Opt-in, não bloqueante.** Só para tasks que tocam UI (`area: frontend`/`design`) e apenas se o impeccable estiver instalado:

```bash
npx impeccable detect <ui-paths>    # ex.: npx impeccable detect src/components
```

Se apontar slop, corrija com `/impeccable polish|audit` antes de fechar a task. Se o impeccable não está instalado, **pule** — os gates padrão (§6.1–§6.5) seguem valendo. O build permanece **read-only sobre `DESIGN.md`** (o impeccable atua no código, não nos artefatos KSDD). Ver `references/integrations/impeccable.md`.

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

## 9. Abrir PR (se GitHub disponível)

Use `gh pr create` com:

- **Base:** branch principal do projeto (main/master/production)
- **Head:** branch atual
- **Título:** `[Task NNN] <título>`
- **Body:**

```markdown
## Resumo
<2-4 bullets do que mudou>

## Issue
Closes #<ISSUE_NUM>

## Feature
.ksdd/features/FEATURE-[slug].md — [nome da feature] (ou path legado se a feature ainda não migrou)

## Critérios de aceitação
<checklist marcada>

## Quality gates
- [x] Build OK
- [x] Testes: cobertura X%
- [x] Lint + type-check OK
- [x] E2E (se aplicável)
- [x] Code review
- [x] Security audit (se aplicável)

## Notas para revisor
<pontos sutis, decisões, trade-offs>
```

- **Labels:** `feature-<slug>`, `area-<area>`, `ready-for-review`

**NÃO faça merge** — aguarde review humano.

Se `gh` não está disponível, apresente o resumo ao usuário com instruções pra criar o PR manualmente.

---

## 10. Checkpoint final

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

---

## Quando implementar `--all` (múltiplas tasks)

Se `$ARGUMENTS` contém `--all` ou é apenas o slug da feature:

1. Liste todas as tasks `para implementar` da feature, ordenadas por: dependências → prioridade (P0 primeiro) → ID
2. **Checkpoint antes de cada task**: mostre qual task será implementada e peça confirmação
3. Execute o fluxo completo (seções 1-10) para cada task
4. Após todas concluídas, mostre resumo agregado:

```
Build da feature [slug] concluído:
- [N] tasks implementadas
- [N] PRs abertos
- [N/N] critérios de aceite da feature atendidos
```

---

## Falhas e abortos

- **Gate falha** (build, testes): comente no issue, deixe branch inspecionável, **não** force `--no-verify`.
- **Conflito de merge**: `git fetch && git rebase origin/<base>`. Se conflito não-trivial, pare e peça ajuda.
- **Subagente entrega lixo**: `git restore .`, re-prompte com feedback específico. Não acumule lixo.
- **MCP indisponível**: caia para CLI equivalente via Bash (`gh` para GitHub, etc.).
- **Dependência não concluída**: pare, liste os blockers, pergunte se quer implementar a dependência primeiro.

---

## Artefatos são read-only durante build

**NUNCA** modifique `SPEC.md`, `architecture.md`, `DESIGN.md` ou `FEATURE-[slug].md` (em qualquer um dos paths suportados — `.ksdd/specs/`, `.ksdd/features/`, raiz, `docs/`) durante o build. Se durante a implementação ficar claro que algo está errado ou incompleto num artefato, sinalize ao usuário — não corrija automaticamente.

A única exceção são os arquivos de task: `status` e o `README.md` de tasks podem ser atualizados (no path onde a task vive).

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
