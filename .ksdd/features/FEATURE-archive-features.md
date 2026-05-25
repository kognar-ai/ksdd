# Feature: Arquivar features implementadas com `/ksdd:archive`

> Novo slash command que arquiva features já implementadas (individualmente, em grupo ou via `--all-eligible`) movendo os artefatos brutos para `.ksdd/archive/raw/` e consolidando um resumo cronológico em `.ksdd/archive/ARCHIVE.md`. Inclui caminho reverso (`--restore`).

**Slug:** archive-features
**Prioridade:** Alta
**Status:** Aprovado
**Data:** 25/05/2026
**Projeto:** KSDD — Kognar Spec-Driven Design & Development

---

## 1. Motivação

### 1.1 Problema / Oportunidade

Após algumas iterações em qualquer projeto KSDD, `.ksdd/features/` e `.ksdd/tasks/feature-*/` acumulam dezenas de arquivos referentes a features já entregues. O dogfooding do próprio repo KSDD já mostra o problema (ver `.ksdd/features/FEATURE-ksdd-folder-layout.md` + 10 tasks concluídas em revisão) e os fluxos `/ksdd:build:all` / `/ksdd:build:feature` agravam isso ao gerar `.context/NNN-context.md` por task.

Três dores concretas:

1. **Ruído visual na navegação.** Ao abrir `.ksdd/features/` ou `.ksdd/tasks/` num projeto com 10+ features prontas, o usuário precisa distinguir o que está ativo do que é história. Hoje a única pista é abrir o arquivo e ler o frontmatter — não escala (contraria a promessa da feature `ksdd-folder-layout` de "pasta dedicada, separação limpa", FEATURE-ksdd-folder-layout seção 1.1).
2. **Contexto inflacionado para agentes.** Slash commands (`new:feature`, `build:feature`, `setup`) listam features prévias para evitar duplicação e continuar numeração de tasks (`commands/new:feature.md`). Quanto mais features acumuladas, mais bytes o agente lê só para descobrir que estão todas prontas. Resumo cronológico consultável em um único arquivo (`ARCHIVE.md`) reduz esse custo.
3. **Entrega final / handoff pra cliente fica poluído.** Para a Lia (tech lead em agência, SPEC seção 2.3), entregar o repo significa entregar 30+ arquivos `.ksdd/tasks/*` que cliente nunca vai abrir. Um `ARCHIVE.md` resumido vira changelog de produto navegável; `raw/` fica disponível para auditoria sem ocupar o espaço mental principal.

O `git log` preserva detalhes, mas exige `git checkout` e contexto para inspecionar — não substitui um resumo em texto sempre acessível no working tree.

### 1.2 Personas Impactadas

- **Marina (Product Designer / PM solo) — SPEC seção 2.1:** `.ksdd/features/` mostra só o que está em jogo agora; `.ksdd/archive/ARCHIVE.md` vira o "diário" cronológico do produto que ela consulta quando precisa lembrar "quando entregamos X mesmo?".
- **Rafa (Founder técnico solo) — SPEC seção 2.2:** ao contratar primeiro dev ou agência, ele mostra `ARCHIVE.md` como história resumida do produto, em vez de pedir para o novo dev varrer 50 arquivos. Onboarding mais barato.
- **Lia (Tech lead em agência) — SPEC seção 2.3:** entrega final para cliente fica organizada — features ativas em `.ksdd/features/`, arquivadas resumidas em `.ksdd/archive/ARCHIVE.md`, detalhes em `.ksdd/archive/raw/` se cliente quiser auditar. Reforça o posicionamento de "processo spec-driven entregável, não SaaS".

### 1.3 Métricas de Sucesso

| Métrica | Meta | Prazo |
|---------|------|-------|
| Features arquivadas no próprio repo KSDD (dogfooding) | ≥ 1 (a `ksdd-folder-layout`) | imediato pós-release |
| Tempo de leitura do `.ksdd/features/` por humano para listar features ativas | < 5s | imediato |
| Bytes lidos por `/ksdd:new:feature` ao listar features prévias num projeto com 10+ features | -70% vs baseline (lê só ARCHIVE.md em vez de N arquivos) | imediato |
| Operações `--restore` confirmadas funcionais via QA | 100% (round-trip idempotente: archive → restore → archive resulta no mesmo estado) | imediato |
| Issues abertas sobre "perdi o histórico ao arquivar" no GitHub | 0 (raw/ preserva tudo) | 3 meses pós-release |

---

## 2. Escopo

### 2.1 O que entra (v1)

- **Novo slash command `/ksdd:archive`** distribuído em `commands/archive.md`, instalado em `~/.claude/commands/ksdd:archive.md` e `~/.codex/prompts/ksdd-archive.md` via `ksdd install` / `ksdd install --codex`.
- **Modos de invocação:**
  - `/ksdd:archive [slug]` — arquiva uma feature.
  - `/ksdd:archive [slug-a] [slug-b] [...]` — arquiva uma lista explícita.
  - `/ksdd:archive --all-eligible` — arquiva todas as features que passam no critério de elegibilidade.
  - `/ksdd:archive --restore [slug]` — operação reversa (restaura uma feature arquivada).
  - `/ksdd:archive --dry-run` — combinável com qualquer modo; lista o que seria feito sem mover arquivos nem escrever em `ARCHIVE.md`.
- **Critério de elegibilidade:** uma feature é elegível para archive quando **100% das tasks** em `.ksdd/tasks/feature-[slug]/NNN-*.md` (ou path legado `docs/tasks/feature-[slug]/`) têm `status: concluída` ou `status: cancelada` no frontmatter. Se houver qualquer task em outro status (`para implementar`, `em andamento`, `em revisão`, `bloqueada`), aborta com mensagem listando as bloqueadoras.
- **Layout do archive (criado on-demand):**
  ```
  .ksdd/archive/
  ├── ARCHIVE.md                          # índice cronológico acumulativo (gerado/atualizado)
  └── raw/
      └── [slug]/
          ├── FEATURE-[slug].md           # movido de .ksdd/features/
          └── tasks/                      # movido de .ksdd/tasks/feature-[slug]/
              ├── README.md
              ├── NNN-*.md
              └── .context/
                  └── NNN-context.md
  ```
- **Conteúdo de cada seção em `ARCHIVE.md`:** header (slug + título + data de arquivamento + prioridade), objetivo (1 parágrafo extraído da seção 1.1 do FEATURE), lista compacta de tasks (`NNN — Título (área) — status final`), checklist dos critérios de aceite da seção 10 do FEATURE (com `[x]`/`[ ]` preservando o estado), e pointer para o raw (`Conteúdo bruto: .ksdd/archive/raw/[slug]/`). Formato canônico em `references/archive-template.md`.
- **Ordem em `ARCHIVE.md`:** cronológica decrescente — entrada mais recente no topo, para o usuário ver primeiro o que arquivou por último. Cada entrada tem âncora estável `## [slug] — YYYY-MM-DD`.
- **Operação `--restore`:**
  - Move `.ksdd/archive/raw/[slug]/FEATURE-[slug].md` → `.ksdd/features/FEATURE-[slug].md`.
  - Move `.ksdd/archive/raw/[slug]/tasks/*` → `.ksdd/tasks/feature-[slug]/`.
  - Remove a seção `## [slug] — YYYY-MM-DD` de `ARCHIVE.md` (todas as ocorrências, se houve archive→restore→archive prévio com datas diferentes).
  - Remove `.ksdd/archive/raw/[slug]/` (vazio após o move).
  - Aborta se `.ksdd/features/FEATURE-[slug].md` já existe (conflito — pede resolução manual).
- **Atualização dos outros commands** para detectar slugs arquivados:
  - `/ksdd:new:feature [slug]` ao colidir com slug arquivado: oferece 3 caminhos — (a) escolher novo slug, (b) restaurar via `/ksdd:archive --restore [slug]`, (c) abortar.
  - `/ksdd:build:feature [slug]` ao receber slug arquivado: oferece (a) consultar `.ksdd/archive/ARCHIVE.md`, (b) restaurar, (c) abortar. Nunca restaura automaticamente.
  - `/ksdd:build:all` ao calcular features pendentes: ignora slugs presentes em `.ksdd/archive/raw/` (já entregues).
  - `/ksdd:new:feature` ao continuar numeração de tasks: considera IDs em `.ksdd/tasks/`, `docs/tasks/` (legado) **e** `.ksdd/archive/raw/[slug]/tasks/` para evitar colisão.
- **Atomicidade:** archive de múltiplos slugs é transacional por slug — se o slug-B falha, o slug-A já movido permanece arquivado (não rollback automático). Cada slug é uma operação atômica isolada (mover arquivos + append no ARCHIVE.md) com tratamento de erro claro.
- **Warning amarelo** quando detectar legado em `docs/tasks/feature-[slug]/` durante archive: instrui usuário a migrar para `.ksdd/tasks/` antes (alinhado com convenção da FEATURE-ksdd-folder-layout).
- **Template canônico** `references/archive-template.md` distribuído com o pacote (instalado em `~/.claude/skills/ksdd/references/` e `~/.agents/skills/ksdd/references/`).
- **Atualização de docs públicas** — README seção de comandos lista `/ksdd:archive`; INSTALL menciona o novo arquivo; CHANGELOG.md documenta release.
- **Bump de versão** para `0.7.0` (semver minor — funcionalidade nova retrocompatível).
- **Dogfooding** — arquivar a feature `ksdd-folder-layout` no próprio repo como prova de fluxo.

### 2.2 O que fica pra depois

- **Auto-archive periódico** (`/ksdd:archive --auto` que arquiva tudo que está há > N dias 100% concluído) — engenharia excessiva para v1; usuário roda manualmente quando faz sentido.
- **`/ksdd:archive --export [slug] [path]`** — exportar resumo + raw para fora do repo (ex: portal de docs do cliente). Útil pra Lia mas não bloqueia v1.
- **Compactação de `raw/`** — zipar `.ksdd/archive/raw/[slug]/` em `.ksdd/archive/raw/[slug].zip`. Marginal: git já comprime. Decide-se depois se tamanho do working tree virar problema real.
- **Filtros avançados em `--all-eligible`** (ex: `--older-than 30d`, `--matching pattern`). Adicionar quando houver demanda.
- **Indicador visual em `ksdd status`** de quantas features arquivadas vs ativas no projeto-alvo. Hoje `ksdd status` é centrado na instalação, não no projeto — escopo separado.
- **Comando `/ksdd:archive --list`** dedicado. Pode ser feito com `cat .ksdd/archive/ARCHIVE.md` em v1; viramos comando dedicado se houver atrito.

### 2.3 O que NÃO é essa feature

- **Não deleta nada permanentemente.** Originais sempre vivem em `.ksdd/archive/raw/`; `git history` continua sendo a segunda camada de garantia. Archive ≠ delete.
- **Não muda o formato de nenhum artefato existente.** FEATURE-[slug].md, tasks NNN-*.md, frontmatters — todos permanecem idênticos. Só muda onde vivem após archive.
- **Não toca em `brainstorm.md`, `SPEC.md`, `architecture.md`, `DESIGN.md`, `BUILD-PLAN.md`.** Archive opera só em pares (feature + tasks). Esses artefatos são globais ao projeto, não por-feature.
- **Não introduz banco de dados ou cache para o índice.** `ARCHIVE.md` é Markdown puro, lido por humanos e por agentes.
- **Não muda o critério de "feature pronta".** Continua sendo "todas as tasks concluídas/canceladas" (status já existente no frontmatter — ver `commands/new:feature.md`).
- **Não cria nova chamada de rede.** Mantém o princípio do ADR-003 (architecture.md): tudo offline, filesystem-only.
- **Não adiciona dependências runtime ao CLI.** O command opera 100% via prompt Markdown lido pelo agente (Claude/Codex). `bin/ksdd.js` não cresce.

---

## 3. User Stories

| # | Como... | Quero... | Para... |
|---|---------|----------|---------|
| US-01 | Marina (PM solo) | rodar `/ksdd:archive ksdd-folder-layout` após o release | manter `.ksdd/features/` mostrando só o que está em desenvolvimento ativo |
| US-02 | Rafa (founder técnico) | rodar `/ksdd:archive --all-eligible` ao final de um sprint | limpar de uma vez todas as features que terminei na semana |
| US-03 | Lia (tech lead em agência) | abrir `.ksdd/archive/ARCHIVE.md` no handoff pro cliente | mostrar histórico cronológico do que foi entregue, sem expor tasks individuais |
| US-04 | Qualquer persona | restaurar uma feature arquivada por engano via `/ksdd:archive --restore [slug]` | voltar ao estado anterior sem precisar mexer no git |
| US-05 | Marina (PM solo) | receber erro claro ao tentar arquivar feature com tasks pendentes | não arquivar trabalho em andamento por descuido |
| US-06 | Rafa (founder técnico) | rodar `/ksdd:archive --all-eligible --dry-run` antes de aplicar | saber exatamente o que vai ser mexido antes de comprometer |
| US-07 | Qualquer persona | que `/ksdd:new:feature [slug-arquivado]` me avise da colisão | não sobrescrever uma feature arquivada por acidente ao reusar slug |
| US-08 | Qualquer persona | encontrar uma feature arquivada pelo slug em `ARCHIVE.md` | consultar critérios de aceite ou tasks de uma feature antiga sem `git log` |

---

## 4. Fluxos de Uso

### 4.1 Archive de uma feature pronta (fluxo principal)

**Pré-condição:** Feature existe em `.ksdd/features/FEATURE-[slug].md` e todas as tasks em `.ksdd/tasks/feature-[slug]/` têm `status: concluída` (ou `cancelada`).
**Trigger:** Usuário roda `/ksdd:archive [slug]` no Claude Code (ou `/prompts:ksdd-archive [slug]` no Codex).

1. Command lê `.ksdd/features/FEATURE-[slug].md` (com fallback `docs/`/raiz).
2. Command lista tasks em `.ksdd/tasks/feature-[slug]/` (com fallback `docs/tasks/`) e valida frontmatter de cada uma.
3. Se alguma task não está em `concluída`/`cancelada` → aborta com lista das bloqueadoras + sugestão de comando para revisar.
4. Apresenta preview do que será arquivado: caminho da feature, número de tasks, primeira/última task. Pede confirmação.
5. Aprovado → cria `.ksdd/archive/raw/[slug]/` e `.ksdd/archive/raw/[slug]/tasks/`; move arquivos.
6. Lê o template `references/archive-template.md`, preenche com objetivo (FEATURE seção 1.1), tasks (do README.md das tasks), critérios de aceite (FEATURE seção 10) e timestamp.
7. Insere a nova seção no topo de `.ksdd/archive/ARCHIVE.md` (cria o arquivo se não existir, com header de boas-vindas).
8. Imprime sucesso (verde): "Feature [slug] arquivada. Resumo em `.ksdd/archive/ARCHIVE.md`. Raw em `.ksdd/archive/raw/[slug]/`."

**Sucesso:** `.ksdd/features/FEATURE-[slug].md` e `.ksdd/tasks/feature-[slug]/` não existem mais; `ARCHIVE.md` tem nova seção no topo; `raw/[slug]/` preserva o conteúdo bruto.
**Erro / edge case:**
- Tasks pendentes → mensagem listando IDs + status atual.
- Slug não existe em `.ksdd/features/` → mensagem sugerindo `--all-eligible` ou listando features ativas.
- Conflito (já existe `.ksdd/archive/raw/[slug]/`) → aborta, instrui revisar manualmente.

### 4.2 Archive em lote (múltiplos slugs)

**Pré-condição:** Todos os slugs informados existem e cada um é elegível.
**Trigger:** `/ksdd:archive slug-a slug-b slug-c`.

1. Para cada slug, command roda a validação do fluxo 4.1 (sem confirmação individual).
2. Apresenta preview consolidado: tabela com slug, número de tasks, total de tasks, tasks bloqueadoras (se houver).
3. Se algum slug é inelegível → aborta tudo (não arquiva parcial nesta etapa de validação).
4. Aprovado → executa archive de cada slug sequencialmente. Append à `ARCHIVE.md` na ordem dos argumentos (último argumento fica no topo).
5. Imprime resumo final: N features arquivadas, M tasks movidas, link para `ARCHIVE.md`.

**Sucesso:** Todas as features arquivadas, `ARCHIVE.md` com N novas seções.
**Erro:** Se um slug intermediário falhar durante o move (ex: permissão de filesystem), arquiva o que conseguiu e reporta no final qual slug falhou — sem rollback automático (alinhado com seção 2.1 "Atomicidade").

### 4.3 Archive de todas as elegíveis (`--all-eligible`)

**Pré-condição:** Existe pelo menos 1 feature elegível.
**Trigger:** `/ksdd:archive --all-eligible`.

1. Command varre `.ksdd/features/FEATURE-*.md` (com fallback) e identifica candidatos.
2. Para cada candidato, valida elegibilidade (todas as tasks `concluída`/`cancelada`).
3. Apresenta lista: ✓ eligíveis (arquivar) vs ⏭ não-elegíveis (com razão curta — "3 tasks em revisão", "1 task bloqueada").
4. Se zero elegíveis → encerra com mensagem informativa, sem erro.
5. Confirmação explícita do usuário antes de prosseguir.
6. Executa archive de cada elegível conforme fluxo 4.1 (ordem alfabética por slug; última fica no topo de `ARCHIVE.md`).

**Sucesso:** N features arquivadas em uma sessão.
**Erro:** Mesmas regras do 4.2 (atomicidade por slug, sem rollback).

### 4.4 Dry-run

**Pré-condição:** Qualquer modo de invocação combinado com `--dry-run`.
**Trigger:** `/ksdd:archive --all-eligible --dry-run` ou `/ksdd:archive [slug] --dry-run`.

1. Executa toda a validação e prepara o preview como nos fluxos 4.1-4.3.
2. **Não move arquivos**, **não escreve em `ARCHIVE.md`**.
3. Imprime exatamente o que faria + delta esperado: "Moveria X arquivos. Adicionaria N seções no topo de ARCHIVE.md."
4. Imprime aviso azul: "Dry-run — nenhuma alteração aplicada."

**Sucesso:** Usuário sabe exatamente o que aplicar antes de comprometer.

### 4.5 Restore (`--restore`)

**Pré-condição:** Slug existe em `.ksdd/archive/raw/[slug]/` e **não** existe em `.ksdd/features/FEATURE-[slug].md`.
**Trigger:** `/ksdd:archive --restore [slug]`.

1. Verifica que `.ksdd/archive/raw/[slug]/` existe; aborta com erro claro se não.
2. Verifica que `.ksdd/features/FEATURE-[slug].md` **não** existe; aborta se sim (conflito).
3. Apresenta preview: arquivos a mover de volta, seção de `ARCHIVE.md` a remover, data original do archive.
4. Aprovado → move `FEATURE-[slug].md` e `tasks/` de volta para `.ksdd/features/` e `.ksdd/tasks/feature-[slug]/`.
5. Remove a seção `## [slug] — YYYY-MM-DD` de `ARCHIVE.md` (todas as ocorrências do slug, caso houve múltiplos archive/restore).
6. Remove o diretório `.ksdd/archive/raw/[slug]/` (vazio após o move).
7. Imprime sucesso: "Feature [slug] restaurada. Rode `/ksdd:build:feature [slug]` para continuar."

**Sucesso:** Estado idêntico ao pré-archive; `git diff` mostra basicamente moves invertidos.
**Erro:** Conflito de existência → aborta sem mexer.

### 4.6 Colisão com slug arquivado em `/ksdd:new:feature`

**Trigger:** Usuário roda `/ksdd:new:feature [slug-já-arquivado]`.

1. `new:feature` verifica se `.ksdd/archive/raw/[slug]/` existe.
2. Se existe → apresenta 3 opções: (a) escolher novo slug, (b) restaurar a feature arquivada (`/ksdd:archive --restore [slug]`), (c) abortar.
3. Espera decisão; nunca prossegue automaticamente.

**Sucesso:** Usuário decide com consciência. Sem sobrescrita acidental.

---

## 5. Impacto em Telas Existentes

KSDD é CLI sem UI — substituído por **Impacto em superfícies de interação** (SPEC seção 7):

### 5.1 Superfícies modificadas

| Superfície (`.ksdd/specs/SPEC.md` seção 7) | O que muda | Onde | Por quê |
|---|---|---|---|
| CLI `bin/ksdd.js` — `ksdd status` | Após install, conta `archive.md` distribuído no skill (1 a mais em targets.claude/codex) | função `installClaude`/`installCodex` | Novo command + template inflam contagem |
| Slash command `/ksdd:new:feature` | Adiciona detecção de slug arquivado + 3-way fork (seção 2.1) | bloco de "checagem de duplicação" no início do command | Evita sobrescrita acidental (US-07) |
| Slash command `/ksdd:build:feature` | Adiciona detecção de slug arquivado no pre-flight + 3-way fork | seção de pre-flight | Bloqueia operação em feature arquivada |
| Slash command `/ksdd:build:all` | Ignora slugs presentes em `.ksdd/archive/raw/` ao montar fila de features pendentes | seção de planejamento | Não tenta rebuildar features já entregues |
| Documentação pública: `README.md` | Adiciona `/ksdd:archive` na lista de comandos | seção "Slash commands" | Discovery |
| `CHANGELOG.md` | Nova entrada `## [0.7.0] - 2026-XX-XX` com mudanças | topo | Convenção do projeto |

### 5.2 Superfícies novas

#### Slash command `/ksdd:archive`

**Objetivo:** Operar archive/restore em features prontas com validação de elegibilidade e geração de resumo cronológico.

**Modos de invocação:**
- A. `/ksdd:archive [slug]` — archive individual.
- B. `/ksdd:archive [slug-a] [slug-b] [...]` — archive em lote.
- C. `/ksdd:archive --all-eligible` — archive em massa por critério.
- D. `/ksdd:archive --restore [slug]` — reversão.
- E. `--dry-run` (combinável com A/B/C) — preview sem aplicar.

**Componentes usados:** Helper de cor ANSI (SPEC seção 8) para sucesso (verde) / warning (amarelo) / erro (vermelho); approval gate prompt antes de mover arquivos; agente `critic` valida o conteúdo do `ARCHIVE.md` gerado.

**Comportamento mobile:** N/A (CLI).

#### Diretório `.ksdd/archive/` no projeto-alvo

**Objetivo:** Persistir resumo cronológico (`ARCHIVE.md`) + conteúdo bruto preservado (`raw/[slug]/`) das features arquivadas.

**Conteúdo:**
- `ARCHIVE.md` — índice cronológico decrescente, formato definido em `references/archive-template.md`.
- `raw/[slug]/FEATURE-[slug].md` + `raw/[slug]/tasks/` — preservação exata do estado pré-archive.

#### Template `references/archive-template.md`

**Objetivo:** Formato canônico de uma seção em `ARCHIVE.md`. Lido pelo command para preencher cada entrada de forma consistente.

**Seções (de cima pra baixo):**
- A. Header com slug, título, data, prioridade.
- B. Objetivo (1 parágrafo extraído de FEATURE seção 1.1).
- C. Lista de tasks (`NNN — Título (área) — status final`).
- D. Checklist de critérios de aceite preservados (FEATURE seção 10).
- E. Pointer para `raw/[slug]/`.

---

## 6. Impacto no Modelo de Dados

KSDD não tem banco de dados (SPEC seção 4). "Modelo" aqui = artefatos em disco.

### 6.1 Novas Entidades (artefatos)

| Entidade | Atributos críticos | Relações |
|----------|-------------------|----------|
| `ARCHIVE.md` (em `.ksdd/archive/`) | Header global + N seções de feature. Cada seção tem âncora `## [slug] — YYYY-MM-DD` | Resumo derivado de FEATURE + tasks; pointer para `raw/[slug]/` |
| `raw/[slug]/` (em `.ksdd/archive/`) | Diretório que espelha `.ksdd/features/FEATURE-[slug].md` + `.ksdd/tasks/feature-[slug]/` exatamente | Conteúdo bruto preservado; lido por `--restore` |
| `references/archive-template.md` | Markdown template com placeholders `[SLUG]`, `[TITLE]`, `[DATE]`, `[OBJECTIVE]`, `[TASKS_LIST]`, `[ACCEPTANCE_CRITERIA]` | Distribuído com o pacote npm; copiado em `ksdd install` |

### 6.2 Alterações em Entidades Existentes

| Entidade (`.ksdd/specs/SPEC.md` seção 4) | Alteração | Migração |
|---|---|---|
| Tabela de artefatos KSDD (SPEC 4.2) | Adicionar linhas para `archive/ARCHIVE.md` e `archive/raw/[slug]/` | Atualização documental — sem migração de dados |
| Diagrama de relações entre artefatos (SPEC 4.4) | Adicionar nó `archive/ARCHIVE.md` recebendo de `FEATURE-[slug].md` + tasks | Atualização documental |
| Frontmatter de task (architecture.md 3.3) | Sem mudança | n/a — frontmatter atual já tem `status` (concluída/cancelada/...) |
| `.ksdd-manifest.json` | Targets passam a incluir `~/.claude/commands/ksdd:archive.md` e `~/.agents/skills/ksdd/references/archive-template.md` | Migração automática pelo `ksdd install` na atualização |

---

## 7. Impacto na API

KSDD não tem API HTTP (architecture.md seção 4). "API equivalente" = surface CLI.

### 7.1 Novos "endpoints" (CLI / slash command surface)

```
/ksdd:archive [slug]                          # archive individual
/ksdd:archive [slug-a] [slug-b] ...           # archive em lote
/ksdd:archive --all-eligible                  # archive de todos elegíveis
/ksdd:archive --restore [slug]                # restore
/ksdd:archive --dry-run [...args]             # combinável com qualquer modo
```

### 7.2 Endpoints/superfícies modificadas

| Comando (`.ksdd/specs/architecture.md` seção 4) | Alteração |
|---|---|
| `ksdd install` | Passa a copiar `commands/archive.md` + `references/archive-template.md` |
| `ksdd install --codex` | Idem para Codex (`ksdd-archive.md` em `~/.codex/prompts/`) |
| `ksdd uninstall` | Remove `archive.md` e `archive-template.md` via manifest (automático — não exige código novo) |
| `ksdd status` | Conta o novo arquivo na contagem por target |

**ADRs respeitados:** ADR-001 (zero deps), ADR-003 (conteúdo distribuído), ADR-007 (cópia em vez de symlink). Nenhum ADR novo necessário.

---

## 8. Impacto no Design

Não aplicável — KSDD é CLI sem UI (SPEC seção 3, architecture.md seção 2.1). Considerações de **tom de saída CLI**:

### 8.1 Padrões visuais (terminal) reutilizados

| Padrão (`.ksdd/specs/SPEC.md` seção 3.2) | Onde é usado | Variante |
|---|---|---|
| Verde — sucesso | "Feature [slug] arquivada", "Restaurada com sucesso" | `\x1b[32m` |
| Amarelo — warning | Detecção de legado em `docs/tasks/`, dry-run banner | `\x1b[33m` |
| Vermelho — erro | Tasks pendentes bloqueando archive, conflito de restore | `\x1b[31m` |
| Dim — paths/metadata | Listagem de paths arquivados, IDs de tasks | `\x1b[2m` |
| Bold — comando invocável | Sugestões de comando ("Rode `/ksdd:build:feature [slug]`") | `\x1b[1m` |

### 8.2 Novos padrões necessários

Nenhum. Convenções de cor da SPEC seção 3.2 cobrem todos os casos.

### 8.3 Mensagens canônicas (texto)

- Sucesso (archive): `✓ Feature [slug] arquivada. Resumo: .ksdd/archive/ARCHIVE.md · Raw: .ksdd/archive/raw/[slug]/`
- Sucesso (restore): `✓ Feature [slug] restaurada. Próximo: /ksdd:build:feature [slug]`
- Warning (legado): `⚠ Detectado [slug] em .docs/tasks/ (path legado). Migre para .ksdd/tasks/ antes de arquivar.`
- Erro (elegibilidade): `✗ [slug] tem N task(s) não-concluída(s): NNN (em revisão), NNN (em andamento). Resolva antes de arquivar.`
- Erro (conflito de restore): `✗ Não posso restaurar [slug]: .ksdd/features/FEATURE-[slug].md já existe. Resolva manualmente.`
- Dry-run banner: `[dry-run] Nenhuma alteração será aplicada.`

---

## 9. Dependências e Riscos

### 9.1 Dependências

| Tipo | Dependência | Status | Impacto se bloqueada |
|------|-------------|--------|----------------------|
| Feature | `FEATURE-ksdd-folder-layout` (v0.6.0) — paths `.ksdd/archive/` assumem layout consolidado | resolvida (release em curso) | Alto — sem `.ksdd/`, o archive ficaria espalhado |
| Técnica | Convenção de status no frontmatter de task (`concluída`/`cancelada`/...) | resolvida — definida em `commands/new:feature.md` | Médio — critério de elegibilidade depende disso |
| Técnica | Approval gate prompt (SPEC seção 8) usado antes de mover arquivos | resolvida | Médio — necessário para evitar archive acidental |
| Negócio | Aprovação do mantenedor sobre semver bump (0.7.0) | pendente — confirmar com mantenedor antes do release | Baixo — só afeta release, não código |
| Externa | Nenhuma (sem chamada de rede, sem SDK) | n/a | n/a |

### 9.2 Riscos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Move parcial em lote deixa estado inconsistente (slug-A movido, slug-B falhou no meio) | Médio | Baixa | Atomicidade por slug + relatório final claro do que falhou; documentar comportamento em "Edge cases" do command |
| Usuário roda `--restore` esperando estado idêntico mas FEATURE foi mexido manualmente no raw | Alto | Baixa | `--restore` é dump-and-move 1:1; documentar no command que edições em `raw/` são restauradas literalmente |
| `ARCHIVE.md` cresce indefinidamente em projetos longevos | Médio | Média (longo prazo) | Aceito para v1 — Markdown comprime bem no git; se virar dor real, criar `--rotate` em release futura (registrar em 2.2) |
| Slug com caractere especial quebra path `.ksdd/archive/raw/[slug]/` | Baixo | Baixa | Slugs já são kebab-case por convenção (`commands/new:feature.md`); validar `[a-z0-9-]+` no command |
| Dois usuários arquivando em paralelo geram conflito em `ARCHIVE.md` | Baixo | Muito baixa | KSDD é local-only (sem multi-user em runtime); resolução via `git merge` como qualquer arquivo |
| Re-archive de slug já arquivado | Baixo | Baixa | Aborta com erro claro se `.ksdd/archive/raw/[slug]/` já existe |
| Outros commands não detectam slug arquivado e tentam operar | Médio | Média | Tasks 008/009 (new:feature, build:feature) atualizam todos os pontos relevantes; QA cobre o cenário |
| Quebra de QA do `ksdd-folder-layout` (10/10 em revisão) por interação inesperada | Alto | Baixa | Esta feature só adiciona; não altera paths `.ksdd/` existentes. Rodar QA folder-layout antes |

---

## 10. Critérios de Aceite

- [ ] `commands/archive.md` distribuído como parte do pacote e instalado como `~/.claude/commands/ksdd:archive.md` em `ksdd install`.
- [ ] `commands/archive.md` distribuído como `~/.codex/prompts/ksdd-archive.md` em `ksdd install --codex` (substituição de `:` por `-`).
- [ ] `references/archive-template.md` distribuído em `~/.claude/skills/ksdd/references/` e `~/.agents/skills/ksdd/references/`.
- [ ] `/ksdd:archive [slug]` move corretamente `FEATURE-[slug].md` para `.ksdd/archive/raw/[slug]/` e tasks para `.ksdd/archive/raw/[slug]/tasks/`.
- [ ] `/ksdd:archive [slug]` adiciona seção no topo de `.ksdd/archive/ARCHIVE.md` com header + objetivo + tasks + critérios de aceite + pointer para raw.
- [ ] `/ksdd:archive [slug]` aborta com mensagem clara se alguma task tem status diferente de `concluída`/`cancelada`, listando IDs e status atuais.
- [ ] `/ksdd:archive [slug-a] [slug-b]` arquiva múltiplos slugs em ordem, com preview consolidado e confirmação única.
- [ ] `/ksdd:archive --all-eligible` lista elegíveis vs não-elegíveis, pede confirmação, e arquiva todos os elegíveis.
- [ ] `/ksdd:archive --dry-run` (combinado com qualquer modo) executa toda a validação mas não move arquivos nem escreve em ARCHIVE.md; banner azul "[dry-run]".
- [ ] `/ksdd:archive --restore [slug]` move `raw/[slug]/` de volta para `.ksdd/features/` e `.ksdd/tasks/`, remove seção do ARCHIVE.md e o diretório raw.
- [ ] `/ksdd:archive --restore [slug]` aborta com erro claro se `.ksdd/features/FEATURE-[slug].md` já existe.
- [ ] Round-trip idempotente: `archive [slug] → restore [slug]` resulta em árvore git-clean comparada ao estado anterior (exceto possíveis diferenças de timestamp na ARCHIVE.md já removida).
- [ ] `/ksdd:new:feature [slug-arquivado]` detecta colisão e apresenta 3 opções (novo slug / restaurar / abortar), sem prosseguir automaticamente.
- [ ] `/ksdd:build:feature [slug-arquivado]` detecta archive e apresenta 3 opções (consultar / restaurar / abortar).
- [ ] `/ksdd:build:all` ignora slugs presentes em `.ksdd/archive/raw/` ao montar fila de features pendentes.
- [ ] `/ksdd:new:feature` ao numerar nova task considera IDs em `.ksdd/tasks/`, `docs/tasks/` legado, **e** `.ksdd/archive/raw/[slug]/tasks/` para evitar colisão.
- [ ] `ksdd install` em projeto previamente instalado sobrescreve manifest preservando paths anteriores e adicionando os novos (`archive.md` + `archive-template.md`).
- [ ] `ksdd uninstall` remove ambos os novos arquivos via manifest, sem deixar resíduos.
- [ ] `README.md` lista `/ksdd:archive` na seção de slash commands, com exemplos de uso para os 4 modos.
- [ ] `CHANGELOG.md` tem entrada `## [0.7.0]` documentando archive + restore + impacto nos outros commands.
- [ ] `package.json` bumpa para `0.7.0`.
- [ ] Dogfooding: feature `ksdd-folder-layout` arquivada no próprio repo (`.ksdd/archive/ARCHIVE.md` com primeira entrada).
- [ ] QA cobre: fluxo individual, lote, all-eligible, dry-run, restore, colisão em new:feature, colisão em build:feature, projeto vazio, projeto sem `.ksdd/archive/`, slug inválido, slug não-existente.

---

## 11. Fases de Implementação

### Fase 1 — Command + template canônico
- [ ] Criar `commands/archive.md` com todos os modos (slug / lista / --all-eligible / --restore / --dry-run).
- [ ] Criar `references/archive-template.md` com placeholders + exemplo preenchido.
- [ ] Atualizar `bin/ksdd.js` (apenas se a lista de arquivos copiados em `installClaude`/`installCodex` for hardcoded; verificar — provavelmente é `copyDir` recursivo e não exige mudança).

### Fase 2 — Integração com commands existentes
- [ ] Atualizar `commands/new:feature.md` com detecção de slug arquivado (3-way fork) + checagem de numeração de IDs.
- [ ] Atualizar `commands/build:feature.md` com detecção de slug arquivado (3-way fork).
- [ ] Atualizar `commands/build:all.md` para ignorar slugs em `.ksdd/archive/raw/`.

### Fase 3 — Docs + release
- [ ] Atualizar `README.md` com `/ksdd:archive`.
- [ ] Atualizar `INSTALL.md` se necessário.
- [ ] Atualizar `CHANGELOG.md` com entrada `[0.7.0]`.
- [ ] Bump `package.json` para `0.7.0`.

### Fase 4 — Dogfood + QA
- [ ] Rodar `/ksdd:archive ksdd-folder-layout` no próprio repo após QA da feature-folder-layout fechar.
- [ ] QA end-to-end cobrindo todos os modos + edge cases (ver Critérios de Aceite).

---

**Referências:**
- `.ksdd/specs/SPEC.md` — seções 2 (personas), 3.2 (cores ANSI), 4.2 (artefatos), 7.2 (slash commands), 8 (componentes globais), 13.3 (fluxo de feature)
- `.ksdd/specs/architecture.md` — seções 1 (visão), 3 (schemas), 4 (CLI surface), 10 (ADRs 001/003/007)
- `.ksdd/features/FEATURE-ksdd-folder-layout.md` — paths `.ksdd/*`, convenções de fallback e warning, dogfooding como prática
- `commands/new:feature.md` — convenção de slug, numeração de tasks, status de task no frontmatter
- `commands/build:feature.md` — convenção de pre-flight de feature
- `references/feature-template.md` — base deste documento
