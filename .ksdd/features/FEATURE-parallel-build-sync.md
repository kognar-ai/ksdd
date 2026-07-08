# Feature: Build paralelo com worktrees, PR único ao final e sincronização de docs

> Incrementa `/ksdd:build:feature` (e alinha `/ksdd:build:all`) em três eixos: (1) executa as tasks com o **máximo de paralelismo e teammates** possíveis, cada um isolado em um **git worktree**; (2) ao concluir um build completo, roda uma **fase de sincronização** que atualiza os docs derivados do projeto (README.md, CLAUDE.md, CHANGELOG) e o tracking de tasks do KSDD; (3) abre **um único PR ao final** do build completo — múltiplos PRs só sob pedido explícito.

**Slug:** parallel-build-sync
**Prioridade:** Alta
**Status:** Rascunho
**Data:** 08/07/2026
**Projeto:** KSDD — Kognar Spec-Driven Design & Development

---

## 1. Motivação

### 1.1 Problema / Oportunidade

O `/ksdd:build:feature` hoje entrega valor, mas deixa três atritos que crescem com o tamanho da feature:

1. **Execução sequencial subutiliza os agentes.** A seção 5 do command (`commands/build:feature.md`) roteia o trabalho para teammates, mas na prática executa **uma task de cada vez** — mesmo quando várias tasks da feature não têm dependência mútua nem tocam os mesmos arquivos. Um build de 6 tasks independentes leva ~6× o tempo de uma. O ecossistema de agentes já suporta despachar múltiplos teammates em paralelo (skill [dispatching-parallel-agents](https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/skills/dispatching-parallel-agents/SKILL.md)) e isolar cada um em um worktree (skill [using-git-worktrees](https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/skills/using-git-worktrees/SKILL.md)); o command não instrui o agente a usar nenhum dos dois.

2. **Um PR por task gera fadiga de revisão.** A seção 9 abre **um PR por task**. Uma feature de 6 tasks vira 6 PRs para revisar e mergear na ordem certa — ruído que se acumula, especialmente para quem entrega para clientes (persona Lia). Na maioria dos casos o revisor quer **um PR coeso por feature**, não seis fragmentos acoplados.

3. **Os docs vivos do projeto ficam desatualizados após o build.** Terminado o build, `README.md`, `CLAUDE.md` (guia de agentes) e `CHANGELOG.md` do projeto-alvo continuam descrevendo o estado anterior; o `README.md` de tasks e os `status:` das tasks ficam parciais. O usuário sai do fluxo disciplinado do KSDD e volta ao chat ad-hoc para "arrumar os docs" — reintroduzindo a dor de rastreabilidade que o KSDD nasceu para resolver (SPEC seção 1.1, brainstorm seção 2).

A oportunidade: transformar o `build:feature` de "implementa task por task, um PR cada, docs por sua conta" em "**implementa em paralelo, entrega um PR coeso e deixa os docs em dia**" — sem abrir mão dos quality gates nem dos checkpoints humanos que definem o KSDD.

### 1.2 Personas Impactadas

- **Lia — Líder técnica em agência (SPEC seção 2.3):** é a maior beneficiária. Usa `/ksdd:build:feature` reativamente e entrega PRs + artefatos ao cliente. **Um PR coeso por feature** com **README/CLAUDE.md/CHANGELOG já sincronizados** é exatamente o entregável que o cliente consegue manter depois. O paralelismo encurta o ciclo de entrega.
- **Rafa — Founder técnico solo (SPEC seção 2.2):** quer velocidade sem burocracia. O paralelismo com worktrees acelera builds de features com várias tasks independentes; a sincronização automática de `README.md`/`CLAUDE.md` mantém os docs que "substituem onboarding de novo dev" sem ele precisar lembrar de atualizá-los.
- **Marina — Product Designer / PM solo (SPEC seção 2.1):** impacto indireto — se beneficia dos docs sempre atualizados como "documento mestre" do produto, mesmo sem tocar na parte técnica do build.

### 1.3 Métricas de Sucesso

| Métrica | Meta | Prazo |
|---------|------|-------|
| Redução de wall-clock em builds com ≥3 tasks independentes | ~2× ou melhor vs. sequencial (quando worktrees disponíveis) | no primeiro dogfood (task de QA) |
| PRs abertos por build completo de uma feature | 1 (default); N só com `--multi-pr` | verificável no dogfood |
| Docs derivados sincronizados ao fim do build | `README.md`, `CLAUDE.md`, `CHANGELOG`, `status`/README de tasks — 100% quando existem | verificável no dogfood |
| Artefatos read-only preservados | 0 escritas automáticas em SPEC/architecture/DESIGN/FEATURE | garantido por design + QA |

---

## 2. Escopo

### 2.1 O que entra (v1)

Todas as mudanças são **edições de conteúdo Markdown** distribuído (commands + references). **Nenhuma alteração em `bin/ksdd.js`** (ver seção 6.2).

1. **Execução com máximo de paralelismo e teammates** em `commands/build:feature.md`:
   - Reescreve a seção 5 (execução via teammates) para **despachar múltiplos teammates em paralelo** — um por task/domínio independente, cada um com contexto isolado (contrato do skill dispatching-parallel-agents: uma chamada de agente por problema independente, todas na mesma mensagem, prompt self-contained e escopado).
   - "Independente" = tasks **sem `depends_on` mútuo** e **sem overlap de arquivos previsto** (a partir do "Plano de implementação" da §4.7 / do context.md). Tasks dependentes ou que tocam os mesmos arquivos rodam em ondas sequenciais.

2. **Isolamento em git worktrees** em `commands/build:feature.md`:
   - Cada teammate paralelo trabalha em um **worktree isolado** com sua própria branch (contrato do skill using-git-worktrees: detectar isolamento existente antes de criar — nunca aninhar worktrees; `git worktree add <path> -b <branch>`; verificar que o diretório de worktrees é git-ignored).
   - **Fallback seguro (decisão de produto):** se o ambiente **negar** a criação de worktree (sandbox) **ou** as tasks tocarem os mesmos arquivos, cai para execução **sequencial in-place** na branch de build. O paralelismo é o default, mas nunca ao custo de conflito garantido ("máximo paralelo com fallback seguro").
   - **Integração:** ao concluir, os resultados dos worktrees são integrados numa **única branch de build da feature**; worktrees são removidos (`git worktree remove`) ao final.

3. **PR único ao final do build completo** em `commands/build:feature.md`:
   - Reescreve a seção 9: em vez de um PR por task, o build completo (`--all` ou o slug da feature) abre **um único PR** ao final, agregando todos os commits atômicos das tasks na branch de build.
   - **Múltiplos PRs só sob pedido explícito** — flag `--multi-pr` ou instrução direta do usuário. Sem isso, sempre 1 PR.
   - Build de **task única** (argumento é um ID/slug de uma task) continua abrindo 1 PR daquela task — o "PR único ao final" é a semântica do **build completo**.

4. **Fase de sincronização de docs pós-build** em `commands/build:feature.md` (nova seção, roda **após** todas as tasks e **antes** do PR único, com checkpoint):
   - Atualiza **apenas docs derivados**, caso existam no projeto: `README.md` (raiz), `CLAUDE.md` / `AGENTS.md` (guia de agentes), `CHANGELOG.md`, o `README.md` de tasks e os `status:` das tasks (→ `concluída`/`em revisão` conforme o fluxo).
   - **Sinaliza drift** dos artefatos read-only: se a implementação sugere que `SPEC.md`, `architecture.md`, `DESIGN.md` ou `FEATURE-*.md` ficaram desatualizados, **avisa o usuário** (mensagem amarela) com o que revisar — **sem editar** nenhum deles.
   - Comita a sincronização como parte da branch de build (entra no PR único).

5. **Alinhamento do `/ksdd:build:all`** em `commands/build:all.md`:
   - Herda os quatro pontos acima (paralelismo + worktrees + PR único ao final + sync pós-build), **mantendo os checkpoints por fase/feature** existentes.
   - Resolve a contradição atual: hoje `build:all` replica o fluxo antigo (PR por task, sequencial). Passa a delegar ao mesmo modelo, para os dois commands não se contradizerem.

6. **Fonte única da estratégia** — novo `references/parallel-build.md`:
   - Documento canônico que descreve o modelo (paralelismo, ciclo de vida do worktree, integração e PR único, escopo da sincronização "só docs derivados"). `build:feature` e `build:all` **referenciam** este doc em vez de duplicar a prosa — mesma filosofia de "references como fonte única" do KSDD.

7. **Rastreabilidade + docs do próprio KSDD:** gates atualizados (`references/approval-gates.md`), SPEC/architecture do KSDD dogfooded (novo ADR), README/INSTALL/CHANGELOG do repo + bump `package.json` para **v0.12.0**.

### 2.2 O que fica pra depois

- **Auto-atualização de SPEC/architecture/DESIGN/FEATURE** — a fase de sync só **sinaliza** drift desses artefatos; escrevê-los automaticamente (mesmo com aprovação) fica fora da v1 (decisão de produto: "só docs derivados"). Um `/ksdd:sync` dedicado poderia cobrir isso no futuro.
- **Merge automático do PR** — o PR único continua aguardando review humano; nunca há auto-merge.
- **Paralelismo entre features no `build:all`** de forma agressiva — a v1 paraleliza **tasks dentro de uma feature**; paralelizar features inteiras entre si segue com a regra conservadora atual ("se em dúvida, sequencial"), agora com worktrees disponíveis para quando fizer sentido.
- **Aplicar o modelo ao `/ksdd:build:fix`** — o fluxo de fix tem gate de regressão próprio e PR rotulado `bug`; adaptá-lo ao paralelismo/PR-único fica para uma feature futura.

### 2.3 O que NÃO é essa feature

- **Não** é mudança em `bin/ksdd.js` nem no instalador — é 100% conteúdo Markdown (o novo `references/parallel-build.md` é auto-bundlado pelo `copyDir` de `references/`; ver 6.2).
- **Não** é um novo slash command — nenhuma entrada nova em `COMMAND_FILES`. Só edita `build:feature`/`build:all` e adiciona um reference.
- **Não** afrouxa quality gates — build, testes, lint, code review e (quando aplicável) security audit continuam obrigatórios **por task**, antes de qualquer integração.
- **Não** remove os checkpoints humanos — o build completo ganha um checkpoint novo (sync pós-build), não perde nenhum.
- **Não** toca no fluxo de `build:fix`.

---

## 3. User Stories

| # | Como... | Quero... | Para... |
|---|---------|----------|---------|
| US-01 | Lia (agência) | rodar `/ksdd:build:feature [slug]` e receber **um único PR** com a feature inteira | entregar ao cliente algo coeso de revisar, não 6 PRs acoplados |
| US-02 | Rafa (founder) | que tasks independentes rodem **em paralelo**, cada uma isolada em um worktree | encurtar o wall-clock do build sem risco de um teammate pisar no outro |
| US-03 | Rafa (founder) | que ao final do build o `README.md`, `CLAUDE.md` e `CHANGELOG` já reflitam a feature | não ter que lembrar de atualizar docs manualmente depois |
| US-04 | Lia (agência) | que a sincronização **avise** quando o SPEC/architecture parecem desatualizados, sem mexer neles | manter o controle editorial dos artefatos-contrato |
| US-05 | Rafa (founder) | pedir `--multi-pr` quando quiser um PR por task | ter a opção nos casos em que a revisão fragmentada faz sentido |
| US-06 | Lia (agência) | rodar em um sandbox que **nega worktrees** e ainda assim concluir o build (sequencial in-place) | não depender do ambiente para o build funcionar |
| US-07 | mantenedor do KSDD | que `/ksdd:build:all` siga o **mesmo modelo** do `build:feature` | não ter dois commands que se contradizem |

---

## 4. Fluxos de Uso

### 4.1 Build completo paralelo com PR único (fluxo principal)

**Pré-condição:** feature com tasks `para implementar` em `.ksdd/tasks/feature-[slug]/`; git limpo; `gh` disponível.
**Trigger:** `/ksdd:build:feature [slug]` ou `/ksdd:build:feature --all`.

1. Pre-flight (git limpo, `gh`, docker se aplicável) — inalterado.
2. Resolve a fila de tasks `para implementar` e calcula **ondas de execução**: dentro de cada onda, tasks sem `depends_on` mútuo e sem overlap de arquivos previsto; entre ondas, respeita dependências.
3. Cria a **branch de build** da feature a partir do default branch.
4. Para cada onda: cria um **worktree por task** (`git worktree add`), despacha **um teammate por task em paralelo** (todas as chamadas na mesma mensagem), cada um com seu context.md e critérios de aceite isolados.
5. Ao concluir cada teammate: quality gates **daquela task** (build, testes, lint, code review, security se aplicável) → commit atômico → integra na branch de build → remove o worktree.
6. Após todas as ondas: **fase de sincronização de docs** (seção 4.3).
7. Abre **um único PR** da branch de build para o default branch, agregando todos os commits + a sincronização. **Não faz merge.**
8. Checkpoint final com resumo (tasks, PR único, gates, docs sincronizados).

**Sucesso:** 1 PR aberto, docs derivados em dia, artefatos read-only intactos.
**Erro / edge case:** gate falha em uma task → aquela task volta ao teammate (ou pausa), as outras da onda seguem; a branch de build fica inspecionável.

### 4.2 Fallback sequencial (worktree negado ou overlap de arquivos)

**Trigger:** ambiente nega `git worktree add`, **ou** duas tasks da onda tocam os mesmos arquivos.

1. O command detecta a negação/overlap (seguindo o skill using-git-worktrees: "sandboxes may deny worktree creation; fallback to working in place").
2. Cai para execução **sequencial in-place** na branch de build (uma task por vez), preservando todo o resto do fluxo (gates, commits atômicos, sync, PR único).
3. Avisa o usuário (mensagem amarela) que rodou em modo sequencial e por quê.

**Sucesso:** build concluído sem paralelismo, sem conflito.

### 4.3 Fase de sincronização de docs pós-build

**Pré-condição:** todas as tasks do build completo concluídas na branch de build.
**Trigger:** automático ao fim do build completo, antes do PR — com checkpoint.

1. Detecta quais docs derivados existem no projeto: `README.md`, `CLAUDE.md`/`AGENTS.md`, `CHANGELOG.md`.
2. Atualiza cada um que existe com o que a feature introduziu/mudou (edição cirúrgica, não reescrita).
3. Atualiza `status:` das tasks e o `README.md` de tasks da feature.
4. **Detecta drift** dos read-only: se a implementação divergiu do que SPEC/architecture/DESIGN/FEATURE descrevem, monta um aviso com "o que revisar" — **sem editar**.
5. **Checkpoint:** apresenta o diff dos docs derivados + a lista de drift sinalizado; pede aprovação antes de comitar a sincronização.
6. Comita a sincronização na branch de build (entra no PR único).

**Sucesso:** docs derivados sincronizados e comitados; drift do contrato sinalizado ao humano.
**Erro / edge case:** nenhum doc derivado existe → pula a atualização de docs, mantém apenas status/README de tasks, informa o usuário.

### 4.4 Múltiplos PRs sob pedido

**Trigger:** `/ksdd:build:feature [slug] --multi-pr` (ou pedido explícito na conversa).

1. Mesmo fluxo paralelo/worktrees, mas cada task concluída vira **seu próprio PR** (como no comportamento antigo).
2. A fase de sync roda uma vez ao final e entra em um PR de docs (ou no último PR, conforme o usuário preferir no checkpoint).

### 4.5 `/ksdd:build:all` alinhado

**Trigger:** `/ksdd:build:all`.

1. Planejamento e checkpoints por fase/feature — inalterados.
2. A execução de cada feature delega ao **mesmo modelo** do `build:feature` (paralelismo + worktrees + PR único por feature + sync). Default: **um PR por feature**; `--multi-pr` mantém o comportamento por task.
3. Sync pós-build roda ao concluir cada feature (docs derivados) e a validação agregada final permanece.

---

## 5. Impacto em Superfícies Existentes

### 5.1 Superfícies modificadas

| Superfície | O que muda | Por quê |
|-----------|------------|---------|
| `commands/build:feature.md` | §5 (paralelismo+worktrees), §9 (PR único), nova fase de sync pós-build, ajuste da nota "Artefatos são read-only" (exceção só p/ docs derivados), novo comportamento de `--all` e `--multi-pr`, seção de fallback | Núcleo da feature |
| `commands/build:all.md` | §B.4 (delegar ao novo modelo), §"Paralelismo entre features", §"Artefatos são read-only", checkpoints por fase preservados, PR único por feature | Evitar contradição entre os dois commands (decisão: alinhar) |
| `references/approval-gates.md` | Gate 6 (build:feature) e Gate 7 (build:all): documentar o **checkpoint de sync pós-build** e o **default de PR único** | Gates são o contrato dos checkpoints |
| `.ksdd/specs/SPEC.md` | Fluxos 13.3/13.4 (PR único em vez de "PR por task"), seção 11 (Interações: paralelismo/worktrees/sync) | Dogfood — manter o próprio SPEC do KSDD coerente |
| `.ksdd/specs/architecture.md` | Novo **ADR-014** (paralelismo/worktrees/PR-único/sync + escopo "só docs derivados"); seção 11 (riscos: worktree negado, conflito de merge, drift de docs) | Registrar a decisão arquitetural |
| `README.md` / `INSTALL.md` / `CHANGELOG.md` / `package.json` | Documentar o fluxo turbinado; entrada de changelog; bump **0.12.0** | Release |

### 5.2 Superfícies novas

| Superfície | Objetivo |
|-----------|----------|
| `references/parallel-build.md` | Doc canônico da estratégia de build paralelo — fonte única referenciada por `build:feature` e `build:all`. Auto-distribuído a todos os targets pelo `copyDir` de `references/` (sem tocar `bin/ksdd.js`). |

---

## 6. Impacto em Artefatos e Modelo de Dados

KSDD não tem banco — "modelo de dados" aqui são os artefatos em disco.

### 6.1 Novas Entidades (artefatos)

| Entidade | Onde | Gerado/editado por |
|----------|------|--------------------|
| `references/parallel-build.md` | bundle de skill de cada target | mantenedor (esta feature) |

### 6.2 Alterações em Entidades Existentes

| Entidade | Alteração |
|----------|-----------|
| `COMMAND_FILES` (`bin/ksdd.js`) | **Nenhuma** — não há novo command. `references/` é copiado como diretório (`copyDir`, `bin/ksdd.js:168/205/235/283/367`), então o novo reference é auto-bundlado. **Esta feature não altera `bin/ksdd.js`.** |
| Frontmatter de task (`status:`) | Sem mudança de schema — a fase de sync apenas transiciona `status` como o fluxo já faz |
| Branch/worktree | Convenção nova: branch de build da feature + worktrees efêmeros por task (documentada em `references/parallel-build.md`), removidos ao final |

---

## 7. Impacto na Superfície de Slash Commands ("API")

Sem novos commands. Mudança de **comportamento** e um **flag novo**:

### 7.1 Flags / comportamento

```
/ksdd:build:feature [slug]            # build completo → execução paralela + PR ÚNICO ao final + sync
/ksdd:build:feature --all             # idem
/ksdd:build:feature [slug] --multi-pr # 1 PR por task (comportamento antigo), sob pedido
/ksdd:build:feature NNN               # task única → 1 PR daquela task (semântica inalterada)
/ksdd:build:all [--multi-pr]          # mesmo modelo, 1 PR por feature (default)
```

### 7.2 Superfícies de comando modificadas

| Command | Mudança |
|---------|---------|
| `/ksdd:build:feature` | Default de PR muda de "por task" → "único ao final do build completo"; adiciona `--multi-pr`; adiciona fase de sync; paralelismo+worktrees na execução |
| `/ksdd:build:all` | Delega ao novo modelo; PR único por feature; sync por feature |

---

## 8. Impacto no "Design" (CLI / mensagens)

KSDD é CLI sem UI — "design" aqui é o padrão das mensagens de terminal e checkpoints (SPEC seção 3).

### 8.1 Padrões visuais (terminal) reutilizados

- Cores ANSI semânticas: verde (sucesso/onda concluída), amarelo (fallback sequencial, drift sinalizado, doc ausente), dim (paths de worktree), bold (nomes de command/flag).
- Sem emojis, sem barra de progresso animada (convenção do projeto).

### 8.2 Novos padrões necessários

- **Resumo de ondas de paralelismo** no checkpoint final: quantas ondas, quantos teammates por onda, quais tasks rodaram em paralelo vs. sequencial.
- **Bloco de sincronização** no checkpoint pós-build: diff dos docs derivados + lista de drift sinalizado (read-only).

### 8.3 Mensagens canônicas (texto)

- Fallback sequencial: `⚠ worktrees indisponíveis neste ambiente (ou tasks com overlap de arquivos) — executando em modo sequencial in-place.`
- Drift sinalizado: `⚠ A implementação sugere que <artefato read-only> pode estar desatualizado: <o que revisar>. Não foi editado — revise manualmente.`
- Doc ausente na sync: `README.md/CLAUDE.md/CHANGELOG não encontrado — pulando atualização deste doc.`
- PR único: `PR único aberto para a feature [slug]: <URL>. Múltiplos PRs? use --multi-pr.`

---

## 9. Dependências e Riscos

### 9.1 Dependências

| Tipo | Dependência | Status | Impacto se bloqueada |
|------|-------------|--------|----------------------|
| Externa (conceitual) | Skill dispatching-parallel-agents (contrato de despacho paralelo) | Referência pública estável | Baixo — o modelo é embutido no reference; a URL é citação |
| Externa (conceitual) | Skill using-git-worktrees (contrato de worktree + fallback) | Referência pública estável | Baixo — idem |
| Técnica | Ambiente do agente suportar `git worktree` | Variável (sandbox pode negar) | Médio — mitigado pelo fallback sequencial in-place |
| Técnica | `gh` disponível para PR único | Como hoje | Baixo — sem `gh`, apresenta resumo p/ PR manual (como o command já faz) |

### 9.2 Riscos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Teammates paralelos gerarem conflito de merge ao integrar na branch de build | Médio | Média | Só paraleliza tasks sem overlap de arquivos previsto; overlap → sequencial. Integração revisa `git diff` por task |
| Worktrees não removidos poluírem o repo | Baixo | Média | `references/parallel-build.md` obriga `git worktree remove` ao final + verificação de que o dir é git-ignored (skill) |
| Fase de sync editar demais (tocar read-only por engano) | Alto | Baixa | Regra dura "só docs derivados"; SPEC/architecture/DESIGN/FEATURE só recebem **aviso de drift**; QA cobre o cenário |
| PR único ficar grande demais para revisar | Médio | Média | Commits atômicos por task dentro do PR + `--multi-pr` como escape hatch |
| `build:feature` e `build:all` divergirem de novo no futuro | Médio | Baixa | Fonte única em `references/parallel-build.md` referenciada pelos dois |
| Prosa dos dois commands crescer e duplicar | Baixo | Média | Referenciar `references/parallel-build.md`, não copiar |

---

## 10. Critérios de Aceite

- [ ] `commands/build:feature.md` instrui despacho de **múltiplos teammates em paralelo** (uma onda = várias chamadas de agente na mesma mensagem) para tasks sem `depends_on` mútuo e sem overlap de arquivos, citando o contrato do skill dispatching-parallel-agents.
- [ ] `commands/build:feature.md` instrui **worktree isolado por teammate paralelo** (`git worktree add -b`, detecção de isolamento existente, git-ignore do dir, `git worktree remove` ao final), citando o skill using-git-worktrees.
- [ ] **Fallback seguro** documentado: worktree negado **ou** overlap de arquivos ⇒ execução sequencial in-place, com aviso amarelo.
- [ ] Build completo (`--all` / slug) abre **exatamente 1 PR** ao final por default; `--multi-pr` reproduz o comportamento de 1 PR por task; build de task única segue com 1 PR daquela task.
- [ ] Nova **fase de sync pós-build** atualiza `README.md`, `CLAUDE.md`/`AGENTS.md`, `CHANGELOG.md` (quando existem) + `status`/README de tasks, e **sinaliza drift** de SPEC/architecture/DESIGN/FEATURE **sem editá-los**; roda com checkpoint de aprovação antes de comitar.
- [ ] A nota "Artefatos são read-only durante build" é ajustada para deixar claro que a sync pós-build só toca **docs derivados** e que os artefatos-contrato continuam read-only (drift apenas sinalizado).
- [ ] `commands/build:all.md` delega ao **mesmo modelo** (paralelismo + worktrees + PR único por feature + sync), mantendo os checkpoints por fase/feature.
- [ ] `references/parallel-build.md` existe como fonte única e é **referenciado** por `build:feature` e `build:all` (sem duplicação de prosa).
- [ ] **Nenhuma alteração em `bin/ksdd.js`**; o novo reference é auto-bundlado (validado por `ksdd install`/`status` com HOME de teste).
- [ ] Gate 6 e Gate 7 em `references/approval-gates.md` documentam o checkpoint de sync e o default de PR único.
- [ ] `.ksdd/specs/SPEC.md` (fluxos 13.3/13.4, seção 11) e `.ksdd/specs/architecture.md` (ADR-014, riscos) atualizados coerentemente.
- [ ] `README.md`/`INSTALL.md`/`CHANGELOG.md` atualizados e `package.json` em **0.12.0**.
- [ ] Dogfood: rodar o novo fluxo numa feature/task real do repo comprova paralelismo (quando possível), PR único, sync e read-only preservado.

---

## 11. Fases de Implementação

### Fase 1 — Fonte canônica + core do `build:feature`
- [ ] `references/parallel-build.md` (estratégia canônica)
- [ ] `commands/build:feature.md` — paralelismo + worktrees + fallback
- [ ] `commands/build:feature.md` — PR único + fase de sync + ajuste read-only

### Fase 2 — Alinhamento e gates
- [ ] `commands/build:all.md` — delegar ao novo modelo
- [ ] `references/approval-gates.md` — Gates 6 e 7

### Fase 3 — Dogfood dos artefatos KSDD + release
- [ ] `.ksdd/specs/SPEC.md` + `.ksdd/specs/architecture.md` (ADR-014)
- [ ] `README.md`/`INSTALL.md`/`CHANGELOG.md` + bump `package.json` 0.12.0

### Fase 4 — Dogfood + QA
- [ ] Dogfood do novo fluxo num alvo real
- [ ] QA end-to-end (paralelo, fallback, PR único vs `--multi-pr`, sync com/sem docs, drift, read-only, consistência build:feature↔build:all)

---

**Referências:**
- `.ksdd/specs/SPEC.md` — seções 2 (personas), 3 (tom CLI), 7.2 (slash commands), 11 (interações), 13.3/13.4 (fluxos de build)
- `.ksdd/specs/architecture.md` — seções 1 (visão geral), 4 (superfície CLI), 10 (ADRs), 11 (riscos)
- `references/approval-gates.md` — Gates 6 e 7
- Skills externas (citação): [dispatching-parallel-agents](https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/skills/dispatching-parallel-agents/SKILL.md) · [using-git-worktrees](https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/skills/using-git-worktrees/SKILL.md)
