# Build paralelo com worktrees, PR único e sync — estratégia canônica (KSDD)

Fonte única do modelo de execução usado por `/ksdd:build:feature` e `/ksdd:build:all`.
Os dois commands **referenciam** este documento em vez de duplicar a prosa. Se o modelo
mudar, muda aqui — e os dois commands herdam.

O modelo tem quatro pilares:

1. **Máximo de paralelismo e teammates** para tasks independentes.
2. **Isolamento em git worktrees** por teammate paralelo (com fallback seguro).
3. **PR único ao final** de um build completo (múltiplos só sob pedido).
4. **Sincronização pós-build** que atualiza só os **docs derivados** do projeto.

As duas primeiras seções seguem contratos de skills públicas, citadas como referência
conceitual (não são dependência de runtime — o KSDD não baixa nada):

- Paralelismo: [dispatching-parallel-agents](https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/skills/dispatching-parallel-agents/SKILL.md)
- Worktrees: [using-git-worktrees](https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/skills/using-git-worktrees/SKILL.md)

---

## 1. Modelo de paralelismo (teammates)

**Princípio (dispatching-parallel-agents):** um agente por problema independente, todos
despachados **na mesma mensagem** para rodarem concorrentes; cada prompt é **self-contained**
(o teammate recebe exatamente o que precisa, sem herdar o histórico da sessão), **escopado**
a um domínio e com **entregável explícito**.

### 1.1 Ondas de execução

O build organiza as tasks `para implementar` em **ondas**:

- **Dentro de uma onda:** tasks **independentes** rodam em paralelo — um teammate cada.
- **Entre ondas:** respeita-se a ordem de dependência.

Uma task é **independente** de outra na mesma onda quando:

1. Não há `depends_on` mútuo (nem transitivo pendente), **e**
2. Não há **overlap de arquivos previsto** entre elas (derivado do bloco "Plano de
   implementação" de cada task / do `context.md`).

Tasks com dependência ou com overlap de arquivos vão para **ondas sequenciais** — nunca
para a mesma onda paralela.

### 1.2 Regras do prompt de cada teammate

Todo prompt de teammate inclui, no mínimo:

- Caminho do `context.md` (ou o conteúdo essencial) — o teammate lê antes de codar.
- Caminho da task original + os **critérios de aceitação apenas daquela task**.
- Restrições explícitas (ex.: "edite só `<arquivo>`", "não rode `git`", "não toque outros arquivos").
- Formato de retorno: diff resumido + o que foi validado.

**Anti-pattern (dispatching-parallel-agents):** escopo largo demais ("implemente a feature
inteira"), contexto faltando, entregável vago, ou sem restrições. Cada teammate tem **um**
domínio nítido.

### 1.3 Quem comita

Teammates paralelos **editam arquivos e retornam** — **não** rodam `git`. O orquestrador
(o command) inspeciona cada diff (`git diff`), e faz os commits atômicos **sequencialmente**
após a onda. Isso evita contenção de index lock entre agentes concorrentes.

---

## 2. Ciclo de vida do git worktree

**Princípio (using-git-worktrees):** cada teammate paralelo trabalha em um **worktree
isolado**, para não interferir na árvore dos outros. Usar ferramenta nativa de worktree
quando existir; senão, `git worktree` manual.

### 2.1 Passo 0 — detectar isolamento existente (nunca aninhar)

Antes de criar qualquer worktree, verifique se já está em um worktree linkado:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
# Se GIT_DIR != GIT_COMMON (e não é submódulo), já há isolamento — NÃO crie outro.
```

### 2.2 Criar

```bash
git worktree add "<path>" -b feature/<slug>/NNN-<task-slug>
```

- Diretório priorizando `.worktrees/` (ou `worktrees/` se o projeto já usa).
- **Verifique que o diretório de worktrees está git-ignored** antes de criar.

### 2.3 Remover (sem órfãos)

Ao integrar/concluir cada task:

```bash
git worktree remove "<path>"
```

Nenhum worktree pode sobrar ao final do build.

---

## 3. Branch de build, integração e PR único

### 3.1 Branch de build

O build completo cria **uma branch de build da feature** a partir do default branch.
É nela que os commits atômicos de todas as tasks são integrados e da qual sai o PR.

### 3.2 Integração

Ao concluir cada task (gates verdes), o resultado do worktree é integrado na branch de
build com um **commit atômico** (`feat(task-NNN): …`). O worktree é então removido.

### 3.3 PR único (default) vs `--multi-pr`

- **Default (build completo):** **1 único PR** ao final, agregando todos os commits +
  a sincronização pós-build (seção 5). **Não faz merge** — aguarda review humano.
- **`--multi-pr`** (ou pedido explícito do usuário): **1 PR por task** (o comportamento
  histórico). A sync roda uma vez ao final.
- **Build de task única** (o argumento é um ID/slug de uma task): abre **1 PR daquela
  task** — o "PR único ao final" é a semântica do **build completo**, não da task isolada.

---

## 4. Fallback seguro

O paralelismo é o **default**, mas nunca ao custo de conflito garantido. Cai para
**execução sequencial in-place** na branch de build quando:

- O ambiente **nega** a criação de worktree (sandbox) — using-git-worktrees:
  *"Sandboxes may deny worktree creation; fallback to working in place."*, **ou**
- Duas tasks da onda **tocam os mesmos arquivos** (overlap de arquivos previsto).

No fallback, todo o resto do fluxo é preservado (gates por task, commits atômicos, sync,
PR único). Avise o usuário com mensagem amarela:

> ⚠ worktrees indisponíveis neste ambiente (ou tasks com overlap de arquivos) —
> executando em modo sequencial in-place.

---

## 5. Sincronização pós-build (só docs derivados)

Ao final de um build completo (todas as tasks concluídas na branch de build), **antes do
PR** e **com checkpoint de aprovação**, roda a fase de sincronização.

### 5.1 O que a fase PODE atualizar (docs derivados)

Somente se existirem no projeto — edição cirúrgica, não reescrita:

- `README.md` (raiz)
- `CLAUDE.md` / `AGENTS.md` (guia de agentes)
- `CHANGELOG.md`
- `status:` das tasks (→ `em revisão` / `concluída`, conforme o fluxo) e o `README.md`
  de tasks da feature

Doc derivado ausente → pula aquele doc e informa o usuário.

### 5.2 O que a fase NUNCA edita (read-only — só sinaliza drift)

`SPEC.md`, `architecture.md`, `DESIGN.md`, `FEATURE-*.md` permanecem **read-only**. Se a
implementação sugerir que algum ficou desatualizado, a fase **sinaliza** (sem editar):

> ⚠ A implementação sugere que `<artefato read-only>` pode estar desatualizado:
> `<o que revisar>`. Não foi editado — revise manualmente.

### 5.3 Checkpoint + commit

A fase apresenta o diff dos docs derivados + a lista de drift sinalizado, **pede aprovação**,
e só então comita a sync na branch de build (entra no PR único).

---

## 6. Como os commands consomem este doc

- `/ksdd:build:feature` — aplica seções 1–5 no build de uma feature. Peak de paralelismo:
  tasks independentes da feature numa mesma onda.
- `/ksdd:build:all` — delega a execução de cada feature ao **mesmo modelo**; default de
  **1 PR por feature** e sync por feature; mantém os checkpoints por fase/feature.

Ambos citam este arquivo em vez de repetir a prosa — a fonte é única.

---

## Anti-patterns

- ❌ Paralelizar tasks com overlap de arquivos. → Overlap ⇒ onda sequencial.
- ❌ Teammate rodando `git` concorrente. → Teammates editam e retornam; o orquestrador comita.
- ❌ Worktree aninhado ou órfão. → Detecte isolamento (passo 0) e remova ao final.
- ❌ Sync tocando SPEC/architecture/DESIGN/FEATURE. → Só docs derivados; o resto é drift sinalizado.
- ❌ N PRs por default. → 1 PR ao final; múltiplos só com `--multi-pr`/pedido explícito.
- ❌ Pular o checkpoint da sync. → A sync pausa para aprovação antes de comitar.
- ❌ Forçar paralelismo onde o sandbox nega worktree. → Fallback sequencial in-place, com aviso.
