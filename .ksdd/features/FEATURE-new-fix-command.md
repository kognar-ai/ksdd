# Feature: Investigar e corrigir bugs com `/ksdd:new:fix` e `/ksdd:build:fix`

> Dois novos slash commands que trazem o fluxo spec-driven do KSDD para a manutenção reativa. `/ksdd:new:fix` investiga um bug apontado (reprodução + root cause code-aware), gera `.ksdd/fixes/FIX-[slug].md` com o ajuste proposto e quebra em tasks; para bugs pequenos, oferece aplicar o fix inline. `/ksdd:build:fix` implementa as tasks ponta-a-ponta, repro-first, com teste de regressão obrigatório.

**Slug:** new-fix-command
**Prioridade:** Alta
**Status:** Rascunho
**Data:** 07/07/2026
**Projeto:** KSDD — Kognar Spec-Driven Design & Development

---

## 1. Motivação

### 1.1 Problema / Oportunidade

O KSDD hoje cobre bem dois momentos do ciclo de vida de um produto: o **greenfield** (`/ksdd:start` → `/ksdd:spec` → `/ksdd:tech` → `/ksdd:design`) e o **desenvolvimento de features** (`/ksdd:new:feature` → `/ksdd:build:feature` / `/ksdd:build:all`), com `/ksdd:archive` fechando o ciclo de entrega. Falta o terceiro momento, que na vida real de qualquer produto consome tanto tempo quanto os outros dois: a **manutenção reativa — o bug apontado**.

Quando um bug é reportado (usuário, cliente, CI vermelho, stack trace em produção), o usuário do KSDD hoje sai do fluxo disciplinado e volta pro chat ad-hoc: descreve o problema, o agente chuta uma correção, aplica, e segue. Isso reintroduz exatamente as três dores que o KSDD nasceu pra resolver (brainstorm seção 2, SPEC seção 1.1):

1. **Correção adivinhada cascateia.** Um fix sem investigação de causa raiz trata o sintoma, não a doença — e frequentemente cria um novo bug adjacente. É o mesmo "documento ruim na fonte cascateia" da tese do KSDD, aplicado a correções: hipótese errada de root cause → patch errado → regressão.
2. **Ausência de checkpoint entre diagnóstico e correção.** O agente corre do "bug reportado" direto pro "arquivo editado" sem que o humano valide **por que** o bug acontece e **qual** é o blast radius do ajuste. Quando o erro de diagnóstico aparece, já está commitado.
3. **Perda de rastreabilidade.** Uma feature nova gera `FEATURE-[slug].md` versionável; um bug corrigido no chat não deixa rastro nenhum além do `git log`. Não há um artefato consultável que diga "esse bug existia, essa era a causa, esse foi o ajuste, esse teste garante que não volta".

`/ksdd:new:fix` fecha essa lacuna trazendo o mesmo par **investigação-antes-de-agir + checkpoint humano** que o `/ksdd:new:feature` traz pra features. `/ksdd:build:fix` dá ao fix o mesmo rigor de implementação que o `/ksdd:build:feature` dá às features (quality gates, PR, evidência), com um gate a mais que é a alma de qualquer correção: **um teste de regressão que falha antes e passa depois**.

### 1.2 Personas Impactadas

- **Rafa (Founder técnico solo) — SPEC seção 2.2:** é quem mais sofre com bug em produção. Recebe um report de usuário, quer resolver rápido mas sem introduzir três bugs novos no processo. `/ksdd:new:fix "checkout trava quando cupom expira"` faz a investigação de root cause, mostra o ajuste proposto pra ele aprovar em 30s, e — se for um one-liner — aplica inline com teste de regressão. Disciplina sem burocracia, exatamente o que ele espera do KSDD (SPEC 2.2).
- **Lia (Tech lead em agência) — SPEC seção 2.3:** cliente reporta bug e cobra explicação. Hoje ela responde no olho; com `.ksdd/fixes/FIX-[slug].md` ela entrega um **documento de investigação** (o que quebrou, por que, qual ajuste, qual teste garante) + um PR rastreável. Vira evidência de diligência e reforça o posicionamento "processo spec-driven entregável, não SaaS".
- **Marina (Product Designer / PM solo) — SPEC seção 2.1:** mexe menos em código, mas o `FIX-[slug].md` vira o "diário de incidentes" do produto — ela consulta "aquele bug do onboarding, o que era mesmo?" sem precisar decifrar `git log`. Complementa o papel de "documento mestre vivo" que ela já valoriza no KSDD.

### 1.3 Métricas de Sucesso

| Métrica | Meta | Prazo |
|---------|------|-------|
| Bugs investigados via `/ksdd:new:fix` no próprio repo KSDD (dogfooding) | ≥ 1 (bug real do repo — ver seção 4.6) | imediato pós-release |
| Fixes entregues via `/ksdd:build:fix` com teste de regressão que falha-antes/passa-depois | 100% (gate obrigatório — seção 2.1) | contínuo |
| Tempo do report do bug até `FIX-[slug].md` com root cause documentado | ≤ 1 sessão de trabalho | imediato |
| FIX docs que citam evidência concreta de root cause (`arquivo:linha` + repro) | 100% | imediato |
| Correções que reintroduzem o mesmo bug (regressão) em projetos que usam o fluxo | 0 (teste de regressão trava o retorno) | 3 meses pós-release |
| Ambiguidade "isso é bug ou feature?": fixes gerados como feature por engano | 0 (namespace `.ksdd/fixes/` separado) | imediato |

---

## 2. Escopo

### 2.1 O que entra (v1)

- **Novo slash command `/ksdd:new:fix`** distribuído em `commands/new:fix.md`, instalado nos 5 targets via `ksdd install [--codex] [--opencode] [--antigravity] [--copilot]` (`~/.claude/commands/ksdd:new:fix.md`, `~/.codex/prompts/ksdd-new-fix.md`, `~/.config/opencode/commands/ksdd-new-fix.md`, `~/.gemini/**/skills/ksdd-new-fix.md`, e prompt file `ksdd-new-fix.prompt.md` no perfil VS Code do Copilot). Responsável por:
  - **Absorver contexto do projeto** — lê `SPEC.md`, `architecture.md`, `DESIGN.md` (com fallback de path, igual aos demais commands) e as FEATURE/FIX specs relevantes ao bug.
  - **Coletar o bug reportado** a partir de entrada flexível (`$ARGUMENTS` + rodada de perguntas): descrição livre, mensagem de erro / stack trace, nome de um teste que reproduz, referência a issue do GitHub (`#123` ou URL — leitura best-effort via `gh` se disponível), ou referência a artefato KSDD (feature/task/ADR relacionado).
  - **Investigar com consciência de código (code-aware)** — este é o diferencial vs `/ksdd:new:feature`, que fica na altitude de produto. O `new:fix` **lê o codebase** (`Grep`/`Glob`/`Read`) para: reproduzir o bug, localizar a causa raiz com evidência (`arquivo:linha`), mapear componentes afetados e estimar o blast radius do ajuste.
  - **Gerar `.ksdd/fixes/FIX-[slug].md`** — o contrato do fix (formato canônico em `references/fix-template.md`): descrição do bug, passos de reprodução, hipótese de root cause com evidência, componentes afetados / blast radius, ajuste proposto, severidade, critérios de verificação e estratégia de teste de regressão.
  - **Checkpoint 1 (FIX doc)** — apresenta o diagnóstico + ajuste proposto e **para** para aprovação humana antes de quebrar em tasks (Gate 8, seção 5.1).
  - **Quebrar em tasks implementáveis** em `.ksdd/tasks/fix-[slug]/NNN-*.md` (granularidade menor que features — tipicamente 1 a 3 tasks) + `README.md` índice. Uma das tasks/critérios é **sempre** o teste de regressão.
  - **Checkpoint 2 (tasks)** — resumo das tasks e próximos passos.
  - **Fix inline opcional (bugs pequenos)** — após a aprovação das tasks, para bugs de **blast radius pequeno e baixo risco**, o command oferece (opt-in explícito) aplicar o ajuste direto: cria branch, aplica o patch, escreve o teste de regressão, roda a verificação local e reporta o diff — sem passar pelo `/ksdd:build:fix`. Para qualquer coisa não-trivial, recomenda `/ksdd:build:fix`. O caminho escolhido é registrado no `FIX-[slug].md`.
- **Novo slash command `/ksdd:build:fix`** distribuído em `commands/build:fix.md`, instalado nos 5 targets. Implementa tasks de fix ponta-a-ponta, na mesma linha do `/ksdd:build:feature` (pre-flight → issue → branch → context.md → execução via teammates → quality gates → commit → PR), com três adaptações específicas de bug:
  - **Repro-first:** antes de corrigir, reproduz o bug (roda o teste/fluxo que falha) para confirmar o diagnóstico do `FIX-[slug].md`.
  - **Teste de regressão como quality gate obrigatório:** o fix só passa se existir um teste que **falha na base atual** e **passa após o ajuste**. Sem esse teste, o gate bloqueia (não é opcional como em features).
  - **Issue/PR rotulados como bug:** labels `bug`/`fix` (não `feature`); o corpo referencia o `FIX-[slug].md`, o root cause e a evidência de regressão.
  - Aceita `[slug]`, `[task-id]` ou `--all` (mesma resolução de argumento do `build:feature`), lendo `.ksdd/fixes/FIX-[slug].md` + `.ksdd/tasks/fix-[slug]/`.
- **Nova classe de artefato `.ksdd/fixes/`** no projeto-alvo — paralela a `.ksdd/features/`. Cada bug investigado vira `.ksdd/fixes/FIX-[slug].md`. Namespace separado de features (evita a confusão "isso é bug ou feature?").
- **Nova pasta de tasks `.ksdd/tasks/fix-[slug]/`** — paralela a `.ksdd/tasks/feature-[slug]/`, com o mesmo formato de task (frontmatter + seções). Campo `feature:` do frontmatter é substituído por `fix:` (ou reusa `feature:` com o slug de fix — decisão em seção 6.2).
- **Template canônico `references/fix-template.md`** distribuído com o pacote (instalado no bundle de skill de cada target). Análogo ao `references/feature-template.md`, mas orientado a diagnóstico de bug.
- **Numeração de tasks unificada:** fix tasks compartilham a **mesma sequência global de IDs** das feature tasks (IDs únicos por projeto). O `new:fix` calcula o próximo ID varrendo `.ksdd/tasks/feature-*/`, `.ksdd/tasks/fix-*/`, `docs/tasks/*` (legado) e `.ksdd/archive/raw/*/tasks/`. O `new:feature` passa a varrer também `fix-*` (task 039).
- **Gate 8 (`/ksdd:new:fix`) e Gate 9 (`/ksdd:build:fix`)** adicionados em `references/approval-gates.md`.
- **Wiring no instalador:** adicionar `new:fix.md` e `build:fix.md` ao array `COMMAND_FILES` em `bin/ksdd.js` (é hardcoded — ver CHANGELOG 0.7.0 / ADR-001). Sem novas funções `install*` — são commands de conteúdo, não duplicam a superfície de instalação (não incorrem na dívida do ADR-010/011).
- **Coordenação com commands existentes:** `new:feature` (numeração), `build:feature` (redireciona slug de fix para `build:fix`), `build:all` (fix tasks ficam fora da fila de features).
- **Atualização de docs públicas** — README (tabela de comandos + seção "Corrigindo bugs"), INSTALL (contagem/paths), CHANGELOG `[0.11.0]`, bump `package.json` para `0.11.0`.
- **Atualização de artefatos KSDD** — SPEC (seção 7.2 lista os 2 commands novos; 4.2 tabela de artefatos; contagem de commands reconciliada) e architecture (ADR-013 registrando `.ksdd/fixes/` como nova classe de artefato + superfície CLI + roadmap).
- **Dogfooding** — investigar e corrigir um bug real do próprio repo KSDD via o fluxo (ver seção 4.6).
- **Bump de versão** para `0.11.0` (semver minor — 2 commands novos, retrocompatível).

### 2.2 O que fica pra depois

- **Arquivar fixes (`/ksdd:archive` para `.ksdd/fixes/`)** — hoje o `archive` opera só sobre features. Estender pra fixes é desejável mas separável; fixes acumulam mais devagar que tasks de feature. Registrar como candidato à próxima iteração do `archive`.
- **`--all` / triagem em lote** no `new:fix` (investigar vários bugs de uma vez, ex: uma lista de issues) — v1 é um bug por invocação.
- **Auto-link do bug à feature/ADR que o introduziu** — `git blame` da linha do root cause → feature responsável. Ótimo pra retrospectiva, mas exige heurística de git; não bloqueia v1.
- **Integração com trackers externos além do GitHub** (Jira, Linear, Sentry) — v1 aceita issue do GitHub (best-effort) + entrada livre; outros trackers entram sob demanda.
- **`/ksdd:build:fix --hotfix`** (branch a partir de tag de produção em vez de default branch) — útil pra correção urgente em release publicado; adicionar quando houver demanda de projetos com processo de release formal.
- **Métrica de "densidade de bugs por feature"** derivada dos FIX docs (quais features geram mais fixes) — analytics futura, fora do escopo local-first atual.

### 2.3 O que NÃO é essa feature

- **Não é um linter / detector proativo de bugs.** O `new:fix` investiga um bug **apontado**; não varre o codebase à procura de problemas. Detecção proativa é outra feature (o `code-reviewer` / `security-auditor` do `build:feature` já cobrem parte disso).
- **Não substitui `/ksdd:build:feature`.** Features continuam no fluxo delas. `new:fix`/`build:fix` são o caminho paralelo pra correções.
- **Não muda o formato de nenhum artefato existente.** `FEATURE-[slug].md`, tasks, frontmatters, `SPEC.md` — inalterados. `FIX-[slug].md` é um artefato **novo**, não uma variação dos existentes.
- **Não introduz banco de dados, cache ou chamada de rede.** Mantém ADR-001 (zero deps runtime) e ADR-003 (filesystem-only, offline). A leitura de issue do GitHub é feita via `gh` CLI do usuário (se disponível), não por SDK embarcado no KSDD.
- **Não adiciona funções `install*` ao `bin/ksdd.js`.** São 2 commands de conteúdo — o instalador só ganha 2 entradas em `COMMAND_FILES`. Não incorre na dívida de duplicação do ADR-010/011.
- **Não faz merge automático.** Como o `build:feature`, o `build:fix` abre PR e aguarda review humano. O fix inline do `new:fix` aplica local e mostra o diff, mas não commita/mergeia sem confirmação.

---

## 3. User Stories

| # | Como... | Quero... | Para... |
|---|---------|----------|---------|
| US-01 | Rafa (founder técnico) | rodar `/ksdd:new:fix "checkout trava quando o cupom expira"` | ter o root cause investigado e um ajuste proposto pra aprovar, sem adivinhar a correção |
| US-02 | Rafa (founder técnico) | que, pra bugs pequenos, o command ofereça aplicar o fix inline com teste de regressão | resolver one-liners rápido sem a cerimônia completa do build |
| US-03 | Lia (tech lead em agência) | gerar um `.ksdd/fixes/FIX-[slug].md` documentando o bug e o ajuste | entregar ao cliente evidência de investigação, não só "consertei" |
| US-04 | Lia (tech lead em agência) | rodar `/ksdd:build:fix [slug]` com PR rotulado como bug e teste de regressão | ter um fix rastreável e revisável, com garantia de não-retorno |
| US-05 | Qualquer persona | passar um número de issue do GitHub para o `/ksdd:new:fix` | investigar a partir do report original sem copiar/colar contexto |
| US-06 | Qualquer persona | passar o nome de um teste que falha para o `/ksdd:new:fix` | ancorar a investigação numa reprodução determinística |
| US-07 | Qualquer persona | que o command **pare** e peça mais dados quando o bug não é reproduzível | não gerar um FIX doc com root cause chutado |
| US-08 | Rafa / Lia | que `/ksdd:build:fix` bloqueie o fix se não houver teste de regressão que falha-antes/passa-depois | garantir que a correção realmente corrige e não volta |
| US-09 | Marina (PM solo) | consultar `.ksdd/fixes/` para lembrar de um bug antigo e como foi resolvido | manter o histórico de incidentes do produto sem decifrar git |
| US-10 | Qualquer persona | que fixes fiquem em `.ksdd/fixes/` separados de `.ksdd/features/` | não confundir manutenção com desenvolvimento de feature |

---

## 4. Fluxos de Uso

### 4.1 Investigação + proposta de ajuste (fluxo principal do `new:fix`)

**Pré-condição:** Projeto-alvo tem ao menos `SPEC.md` (fallback raiz). Idealmente `architecture.md` para localizar componentes. O codebase está acessível.
**Trigger:** `/ksdd:new:fix [descrição do bug | #issue | teste]` no Claude Code (ou equivalente Codex/opencode/Antigravity).

1. Command lê os artefatos KSDD relevantes (SPEC/arch/DESIGN + FEATURE/FIX specs correlatos).
2. Coleta o bug: parseia `$ARGUMENTS`; se vago, faz 1 rodada de perguntas (o que acontece, o que deveria acontecer, como reproduzir, ambiente).
3. **Investiga (code-aware):** reproduz o bug (roda teste/fluxo se possível), localiza a causa raiz com `Grep`/`Read`, coleta evidência (`arquivo:linha`), mapeia componentes afetados e blast radius.
4. Deriva o slug do bug (kebab-case curto, ex: `checkout-cupom-expirado`). Checa colisão com fixes existentes em `.ksdd/fixes/` e slugs arquivados.
5. Gera `.ksdd/fixes/FIX-[slug].md` a partir de `references/fix-template.md`, preenchido com a investigação.
6. **Checkpoint 1:** apresenta root cause + ajuste proposto + blast radius e pede aprovação. **Não quebra em tasks sem aprovação.**
7. Aprovado → quebra em tasks em `.ksdd/tasks/fix-[slug]/NNN-*.md` (continua a numeração global) + `README.md`. Inclui sempre a task/critério de teste de regressão.
8. **Checkpoint 2:** resumo das tasks; oferece os dois caminhos de implementação (inline p/ pequeno, `/ksdd:build:fix` p/ o resto).

**Sucesso:** `.ksdd/fixes/FIX-[slug].md` + `.ksdd/tasks/fix-[slug]/` gerados; usuário tem diagnóstico aprovado e tasks prontas.
**Erro / edge case:** bug não reproduzível → seção 4.5. Slug colide com fix existente → pede novo slug ou iteração.

### 4.2 Fix inline opcional (bug pequeno)

**Pré-condição:** Fluxo 4.1 concluído; ajuste com blast radius pequeno e baixo risco (uma função, um arquivo, sem migração/contrato público).
**Trigger:** No Checkpoint 2, usuário opta explicitamente pelo caminho inline.

1. Command confirma que o bug qualifica como pequeno (heurística: 1 arquivo, sem mudança de schema/API, sem auth/PII). Se não qualifica, recusa e recomenda `/ksdd:build:fix`.
2. Cria branch (`fix/[slug]`), aplica o patch mínimo do ajuste proposto.
3. **Escreve o teste de regressão** que falha na base e passa com o patch — obrigatório mesmo inline.
4. Roda a verificação local (teste + lint/build relevantes). Mostra o diff resumido.
5. **Não commita/mergeia sem confirmação.** Registra no `FIX-[slug].md` que o caminho foi inline.

**Sucesso:** ajuste aplicado localmente + teste de regressão verde, aguardando revisão do usuário.
**Erro:** teste de regressão não fica verde, ou o ajuste cresce além de "pequeno" → aborta o inline, deixa a branch inspecionável e recomenda `/ksdd:build:fix`.

### 4.3 Implementação completa via `/ksdd:build:fix`

**Pré-condição:** `.ksdd/fixes/FIX-[slug].md` aprovado + tasks em `.ksdd/tasks/fix-[slug]/`. Git limpo.
**Trigger:** `/ksdd:build:fix [slug|task-id|--all]`.

1. Pre-flight (git limpo, `gh` disponível?, Docker se aplicável) — falha rápida.
2. Detecção de slug arquivado (mesmo bloqueio dos demais commands).
3. Resolve e valida a task (status `para implementar`, dependências concluídas).
4. **Repro-first:** roda o teste/fluxo que reproduz o bug para confirmar o diagnóstico.
5. Cria issue (label `bug`) + branch + `context.md` compilando `FIX-[slug].md` + trechos de SPEC/arch.
6. Implementa via teammates; escreve o teste de regressão.
7. **Quality gates**, com o **teste de regressão como gate obrigatório** (falha-antes/passa-depois demonstrado) + build/lint/testes/code-review (security-auditor se toca auth/PII).
8. Valida critérios de verificação do `FIX-[slug].md`; abre PR (label `bug`/`fix`, corpo com root cause + evidência de regressão). **Não faz merge.**

**Sucesso:** PR de fix aberto, teste de regressão verde, root cause documentado.
**Erro:** repro não confirma o bug → para e sinaliza que o `FIX-[slug].md` pode estar errado (não corrige às cegas). Gate de regressão falha → não abre PR.

### 4.4 Entrada via issue do GitHub

**Trigger:** `/ksdd:new:fix #142` ou `/ksdd:new:fix https://github.com/org/repo/issues/142`.

1. Se `gh` disponível, lê o corpo + comentários da issue (best-effort) como contexto do bug.
2. Segue o fluxo 4.1 a partir do report da issue.
3. O `FIX-[slug].md` referencia a issue; o `build:fix` pode fechá-la via `Closes #142` no PR.
4. Se `gh` indisponível, pede ao usuário colar o conteúdo do report e segue normalmente.

**Sucesso:** investigação ancorada no report original, sem cópia manual.

### 4.5 Bug não reproduzível (edge case importante)

**Trigger:** Fluxo 4.1, passo 3 — o command não consegue reproduzir nem localizar causa raiz com confiança.

1. **Não gera um root cause chutado.** Gera um `FIX-[slug].md` em modo "investigação incompleta": documenta o que foi tentado, hipóteses candidatas, e **o que falta** para reproduzir (logs, versão, passos, ambiente).
2. **Para** e pede ao usuário os dados faltantes — não quebra em tasks nem oferece inline.
3. Quando o usuário fornece os dados, o command retoma a investigação.

**Sucesso:** usuário sabe exatamente o que falta; nenhum ajuste é proposto sobre diagnóstico incerto (anti-pattern central da feature).

### 4.6 Dogfooding — bug real no repo KSDD

**Trigger:** Após o release, rodar `/ksdd:new:fix` sobre um bug documental real do próprio repo — candidato: a **contagem inconsistente de commands** (SPEC seção 1.2/7.2 diz "8 slash commands", enquanto as seções de Antigravity dizem "9 commands"; após esta feature são 11). O command investiga onde a contagem diverge, propõe o ajuste e gera o FIX doc + task como prova de fluxo.

**Sucesso:** primeiro `.ksdd/fixes/FIX-*.md` no próprio repo, validando o command sobre um bug de verdade.

---

## 5. Impacto em Telas Existentes

KSDD é CLI sem UI — substituído por **Impacto em superfícies de interação** (SPEC seção 7):

### 5.1 Superfícies modificadas

| Superfície (`.ksdd/specs/SPEC.md` seção 7) | O que muda | Onde | Por quê |
|---|---|---|---|
| CLI `bin/ksdd.js` — `COMMAND_FILES` | Adiciona `new:fix.md` e `build:fix.md` ao array (hardcoded) | `bin/ksdd.js:29` | Sem isso os commands não são distribuídos a nenhum target |
| CLI `bin/ksdd.js` — `ksdd status` | Contagem por target sobe em 2 arquivos por target | funções `install*` (via `COMMAND_FILES`) | 2 commands novos |
| Slash command `/ksdd:new:feature` | Numeração de IDs passa a varrer `.ksdd/tasks/fix-*/` | bloco de numeração de tasks | Evitar colisão de ID entre features e fixes |
| Slash command `/ksdd:build:feature` | Detecta slug de fix e redireciona para `/ksdd:build:fix` | pré-flight / resolução de argumento | Fix tasks têm fluxo próprio (repro-first, gate de regressão) |
| Slash command `/ksdd:build:all` | Fix tasks (`.ksdd/tasks/fix-*/`) ficam fora da fila de features | seção de planejamento | `build:all` decompõe fases do SPEC em features, não corrige bugs |
| `references/approval-gates.md` | Adiciona Gate 8 (`new:fix`) e Gate 9 (`build:fix`) | após Gate 7 | Documentar os checkpoints dos novos commands |
| Documentação: `README.md` / `INSTALL.md` | Lista os 2 commands + nova seção "Corrigindo bugs" | seção de comandos | Discovery |
| `.ksdd/specs/SPEC.md` | Seção 7.2 lista os commands; 4.2 lista `.ksdd/fixes/`; contagem reconciliada (11 commands) | seções 4.2, 7.2, 14 | Manter o SPEC como contrato fiel |
| `.ksdd/specs/architecture.md` | ADR-013 (`.ksdd/fixes/`); tabela de artefatos; roadmap | seções 3, 10, 12 | Registrar a nova classe de artefato e a decisão |
| `CHANGELOG.md` / `package.json` | Entrada `[0.11.0]` + bump | topo / `version` | Convenção do projeto |

### 5.2 Superfícies novas

#### Slash command `/ksdd:new:fix`

**Objetivo:** Investigar um bug apontado (code-aware), gerar `.ksdd/fixes/FIX-[slug].md` com root cause + ajuste proposto, quebrar em tasks, e opcionalmente aplicar o fix inline para bugs pequenos.

**Modos de invocação:**
- A. `/ksdd:new:fix [descrição]` — a partir de descrição livre.
- B. `/ksdd:new:fix #issue` ou URL — a partir de issue do GitHub.
- C. `/ksdd:new:fix [caminho-de-teste]` — a partir de um teste que reproduz.
- D. `--tasks-only` — pula a geração do FIX doc (usa `.ksdd/fixes/FIX-[slug].md` existente) e gera só as tasks (paridade com `new:feature`).

**Componentes usados:** Helper de cor ANSI (SPEC 3.2); agente `interviewer` (coleta do bug), `consolidator` (redação do FIX doc), `critic` (valida o FIX doc antes de entregar); approval gate prompt (Checkpoints 1 e 2).

**Comportamento mobile:** N/A (CLI).

#### Slash command `/ksdd:build:fix`

**Objetivo:** Implementar tasks de fix ponta-a-ponta, repro-first, com teste de regressão como gate obrigatório, abrindo PR rotulado como bug.

**Modos:** `[slug]`, `[task-id]`, `--all` (mesma resolução do `build:feature`).

**Componentes usados:** todo o pipeline do `build:feature` (issue, branch, context.md, teammates, quality gates, PR), com o gate extra de regressão.

#### Diretório `.ksdd/fixes/` no projeto-alvo

**Objetivo:** Persistir os artefatos de investigação de bug (`FIX-[slug].md`), separados de `.ksdd/features/`.

#### Diretório `.ksdd/tasks/fix-[slug]/` no projeto-alvo

**Objetivo:** Tasks implementáveis de um fix, com o mesmo formato das feature tasks; numeração no mesmo espaço global de IDs.

#### Template `references/fix-template.md`

**Objetivo:** Formato canônico do `FIX-[slug].md`. Lido pelo `new:fix` para preencher cada investigação de forma consistente.

**Seções (de cima pra baixo):** Header (slug, título, severidade, status, data) · Bug (o que acontece × o que deveria) · Reprodução (passos determinísticos) · Root cause (hipótese + evidência `arquivo:linha`) · Componentes afetados / blast radius · Ajuste proposto · Critérios de verificação · Estratégia de teste de regressão · Riscos do ajuste · Referências.

---

## 6. Impacto no Modelo de Dados

KSDD não tem banco de dados (SPEC seção 4). "Modelo" = artefatos em disco.

### 6.1 Novas Entidades (artefatos)

| Entidade | Atributos críticos | Relações |
|----------|-------------------|----------|
| `FIX-[slug].md` (em `.ksdd/fixes/`) | Header (slug, título, severidade, status, data), bug, reprodução, root cause + evidência, blast radius, ajuste proposto, critérios de verificação, estratégia de regressão | Referencia SPEC/architecture/FEATURE afetados; consumido por `/ksdd:build:fix` |
| `.ksdd/tasks/fix-[slug]/NNN-*.md` | Mesmo frontmatter das feature tasks, com `fix: [slug]` no lugar de `feature:` | Aponta pro FIX doc via `fix_refs`; numeração no espaço global de IDs |
| `.ksdd/tasks/fix-[slug]/README.md` | Índice de tasks do fix (tabela + ordem de execução) | Espelha o README de feature tasks |
| `references/fix-template.md` | Template Markdown com placeholders (`[SLUG]`, `[TITLE]`, `[SEVERITY]`, `[REPRO]`, `[ROOT_CAUSE]`, `[BLAST_RADIUS]`, `[PROPOSED_FIX]`, `[VERIFICATION]`, `[REGRESSION_TEST]`) | Distribuído com o pacote; copiado em `ksdd install` |

### 6.2 Alterações em Entidades Existentes

| Entidade (`.ksdd/specs/SPEC.md` seção 4) | Alteração | Migração |
|---|---|---|
| Tabela de artefatos KSDD (SPEC 4.2) | Adicionar linhas `FIX-[slug].md` (`.ksdd/fixes/`) e tasks `.ksdd/tasks/fix-[slug]/` | Atualização documental — sem migração de dados |
| Diagrama de relações (SPEC 4.4) | Adicionar nó `.ksdd/fixes/FIX-[slug].md` consumido por `build:fix` | Atualização documental |
| Frontmatter de task (architecture.md 3.3) | Novo valor de contexto: `fix: [slug]` como alternativa a `feature: [slug]`; novo ref `fix_refs` | Retrocompatível — feature tasks inalteradas |
| Numeração global de IDs de task | Passa a considerar `.ksdd/tasks/fix-*/` além de `feature-*` e archive | `new:fix` e `new:feature` (task 039) varrem ambos |
| `.ksdd-manifest.json` | `targets.*` passam a incluir `ksdd:new:fix.md`, `ksdd:build:fix.md` (e variantes por target) + `references/fix-template.md` | Migração automática pelo `ksdd install` |

**Decisão (6.2):** fix tasks usam `fix: [slug]` no frontmatter (namespace explícito) e mantêm todos os demais campos (`id`, `title`, `status`, `area`, `priority`, `estimate`, `depends_on`, `*_refs`) idênticos aos das feature tasks — o `build:fix` reusa o parser de frontmatter do `build:feature`.

---

## 7. Impacto na API

KSDD não tem API HTTP (architecture.md seção 4). "API equivalente" = superfície CLI + slash commands.

### 7.1 Novos "endpoints" (slash command surface)

```
/ksdd:new:fix [descrição do bug]              # investigação a partir de descrição
/ksdd:new:fix #issue | <url-da-issue>         # a partir de issue do GitHub
/ksdd:new:fix <caminho-de-teste>              # a partir de um teste que reproduz
/ksdd:new:fix [slug] --tasks-only             # só as tasks (FIX doc já existe)
/ksdd:build:fix [slug]                        # implementa a próxima task do fix
/ksdd:build:fix [task-id]                     # implementa task específica
/ksdd:build:fix [slug] --all                  # todas as tasks do fix
```

### 7.2 Endpoints/superfícies modificadas

| Comando (`.ksdd/specs/architecture.md` seção 4) | Alteração |
|---|---|
| `ksdd install` | Passa a copiar `commands/new:fix.md`, `commands/build:fix.md`, `references/fix-template.md` |
| `ksdd install --codex/--opencode/--antigravity` | Idem, com basename `ksdd-new-fix.md` / `ksdd-build-fix.md` (via `agentPromptBasename`) |
| `ksdd uninstall` | Remove os novos arquivos via manifest (automático — sem código novo) |
| `ksdd status` | Conta os 2 novos commands por target |

**ADRs respeitados:** ADR-001 (zero deps), ADR-003 (offline/filesystem), ADR-007 (cópia), ADR-009 (prefixo `ksdd:`/`ksdd-`). **Novo:** ADR-013 registra `.ksdd/fixes/` como classe de artefato (paralela a `.ksdd/features/`). **Não** dispara o refator do ADR-010/011 (nenhuma função `install*` nova).

---

## 8. Impacto no Design

Não aplicável — KSDD é CLI sem UI (SPEC seção 3, architecture 2.1). Considerações de **tom de saída CLI**:

### 8.1 Padrões visuais (terminal) reutilizados

| Padrão (`.ksdd/specs/SPEC.md` seção 3.2) | Onde é usado | Variante |
|---|---|---|
| Verde — sucesso | "FIX-[slug] gerado", "teste de regressão verde", "PR de fix aberto" | `\x1b[32m` |
| Amarelo — warning | "bug não reproduzível — faltam dados", detecção de legado | `\x1b[33m` |
| Vermelho — erro | "gate de regressão falhou", "não corrijo sobre diagnóstico incerto" | `\x1b[31m` |
| Dim — paths/metadata | paths de `.ksdd/fixes/`, IDs de task, `arquivo:linha` da evidência | `\x1b[2m` |
| Bold — comando invocável | "Rode `/ksdd:build:fix [slug]`" | `\x1b[1m` |

### 8.2 Novos padrões necessários

Nenhum. Convenções de cor da SPEC 3.2 cobrem todos os casos.

### 8.3 Mensagens canônicas (texto)

- Sucesso (FIX doc): `✓ FIX-[slug] gerado em .ksdd/fixes/. Root cause: <arquivo:linha>. Aprove para gerar as tasks.`
- Sucesso (inline): `✓ Fix inline aplicado em fix/[slug]. Teste de regressão verde. Revise o diff antes de commitar.`
- Sucesso (build): `✓ Fix [slug] implementado. Teste de regressão: falha-antes/passa-depois demonstrado. PR aberto (label: bug).`
- Warning (não reproduzível): `⚠ Não consegui reproduzir [slug]. FIX doc em modo investigação incompleta — faltam: <lista>.`
- Erro (gate de regressão): `✗ Sem teste de regressão que falha-antes/passa-depois. Não abro PR de fix sem essa garantia.`
- Erro (diagnóstico incerto): `✗ Root cause não confiável. Não proponho ajuste sobre diagnóstico chutado — preciso de <dados>.`

---

## 9. Dependências e Riscos

### 9.1 Dependências

| Tipo | Dependência | Status | Impacto se bloqueada |
|------|-------------|--------|----------------------|
| Feature | `FEATURE-ksdd-folder-layout` (v0.6.0) — paths `.ksdd/*` | resolvida (arquivada) | Alto — `.ksdd/fixes/` assume o layout consolidado |
| Técnica | Formato de task + parser de frontmatter (`commands/build:feature.md`) | resolvida | Médio — `build:fix` reusa o parser |
| Técnica | Convenção de slug kebab-case (`commands/new:feature.md`) | resolvida | Baixo — mesma validação |
| Técnica | `COMMAND_FILES` hardcoded em `bin/ksdd.js` | resolvida (conhecida) | Alto — sem edição, commands não são distribuídos |
| Externa | `gh` CLI para leitura de issue (best-effort) | opcional | Baixo — fluxo funciona com entrada livre se ausente |
| Negócio | Aprovação do mantenedor sobre o par de commands + bump 0.11.0 | pendente — confirmar no checkpoint | Baixo — afeta release, não código |

### 9.2 Riscos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Investigação chuta root cause sem reproduzir → FIX doc com diagnóstico errado | Alto | Média | Command exige reprodução + evidência `arquivo:linha`; sem repro, gera FIX em "investigação incompleta" e para (fluxo 4.5). `critic` valida antes de entregar |
| Fix inline aplicado a bug que não era tão pequeno → bypass de quality gates | Alto | Média | Opt-in explícito + heurística estrita (1 arquivo, sem schema/API/auth) + teste de regressão obrigatório mesmo inline + recusa e recomenda `build:fix` se cresce (fluxo 4.2) |
| Ambiguidade "bug ou feature?" leva a usar o command errado | Médio | Média | Namespace `.ksdd/fixes/` separado; `new:feature` e `new:fix` documentam a fronteira; `build:feature` redireciona slug de fix |
| Colisão de ID entre feature tasks e fix tasks | Médio | Média | Espaço global único de IDs; `new:fix` e `new:feature` varrem ambas as árvores (tasks 035, 039) |
| Dois commands novos incham o `COMMAND_FILES` e a superfície de 5 targets | Baixo | Alta (esperada) | São commands de conteúdo — 2 entradas em `COMMAND_FILES`, distribuídas pelo loop existente. **Não** criam função `install*` (não tocam a dívida ADR-010/011) |
| `build:fix` diverge de `build:feature` e vira código duplicado a manter | Médio | Média | `build:fix` referencia o fluxo do `build:feature` e documenta só os deltas (repro-first, gate de regressão, labels); evitar reescrever o pipeline inteiro |
| Gate de regressão trava fixes legítimos onde o teste é difícil (ex: bug de concorrência) | Médio | Baixa | Documentar exceção explícita: se um teste automatizado é inviável, exigir evidência manual reproduzível + aprovação consciente do usuário (não silenciar o gate) |
| Leitura de issue do GitHub falha/varia entre ambientes | Baixo | Média | Best-effort via `gh`; fallback pede o conteúdo colado. Sem SDK embarcado (ADR-003) |

---

## 10. Critérios de Aceite

- [ ] `commands/new:fix.md` distribuído e instalado como `~/.claude/commands/ksdd:new:fix.md` (e `ksdd-new-fix.md` nos targets Codex/opencode/Antigravity).
- [ ] `commands/build:fix.md` distribuído e instalado como `~/.claude/commands/ksdd:build:fix.md` (e `ksdd-build-fix.md` nos demais targets).
- [ ] `references/fix-template.md` distribuído no bundle de skill de cada target.
- [ ] `bin/ksdd.js` inclui `new:fix.md` e `build:fix.md` em `COMMAND_FILES`; `ksdd install`/`uninstall`/`status` refletem os 2 arquivos por target.
- [ ] `/ksdd:new:fix [descrição]` lê o codebase, reproduz (ou tenta) o bug, e gera `.ksdd/fixes/FIX-[slug].md` com root cause + evidência `arquivo:linha` + ajuste proposto.
- [ ] `/ksdd:new:fix` **para** no Checkpoint 1 (FIX doc) antes de quebrar em tasks; **para** no Checkpoint 2 antes de qualquer implementação.
- [ ] `/ksdd:new:fix` gera tasks em `.ksdd/tasks/fix-[slug]/NNN-*.md` continuando a numeração global (varre `feature-*`, `fix-*`, `docs/tasks/*`, archive) e um `README.md` índice.
- [ ] Toda quebra de fix inclui uma task/critério de **teste de regressão**.
- [ ] `/ksdd:new:fix` com bug não reproduzível gera FIX em modo "investigação incompleta" e para pedindo os dados faltantes — **não** propõe ajuste sobre diagnóstico incerto.
- [ ] Fix inline (opt-in) só é oferecido para bugs pequenos (1 arquivo, sem schema/API/auth); aplica patch + teste de regressão em branch e mostra o diff sem commitar/mergeiar; recusa e recomenda `build:fix` se o ajuste cresce.
- [ ] `/ksdd:new:fix #issue` lê a issue via `gh` (se disponível) e ancora a investigação nela; fallback pede conteúdo colado.
- [ ] `/ksdd:build:fix [slug]` faz repro-first, implementa, e **bloqueia o PR** se não houver teste de regressão que falha-antes/passa-depois.
- [ ] `/ksdd:build:fix` abre PR com label `bug`/`fix`, corpo referenciando `FIX-[slug].md` + root cause + evidência de regressão; **não** faz merge.
- [ ] `/ksdd:build:feature` detecta slug de fix e redireciona para `/ksdd:build:fix`.
- [ ] `/ksdd:new:feature` ao numerar nova task considera IDs em `.ksdd/tasks/fix-*/`.
- [ ] `/ksdd:build:all` não inclui `.ksdd/tasks/fix-*/` na fila de features.
- [ ] Gate 8 (`new:fix`) e Gate 9 (`build:fix`) documentados em `references/approval-gates.md`.
- [ ] `.ksdd/specs/SPEC.md` lista os 2 commands (7.2), a classe `.ksdd/fixes/` (4.2), e reconcilia a contagem de commands (11).
- [ ] `.ksdd/specs/architecture.md` registra ADR-013 (`.ksdd/fixes/`), atualiza tabela de artefatos e roadmap.
- [ ] `README.md` lista os 2 commands e tem seção "Corrigindo bugs" com exemplos; `INSTALL.md` atualizado.
- [ ] `CHANGELOG.md` tem entrada `## [0.11.0]`; `package.json` bumpado para `0.11.0`.
- [ ] Dogfooding: um bug real do repo investigado via `/ksdd:new:fix`, gerando o primeiro `.ksdd/fixes/FIX-*.md`.
- [ ] QA cobre: entrada por descrição/issue/teste, checkpoints, bug não reproduzível, fix inline (aceito e recusado), `build:fix` (repro-first + gate de regressão + PR), instalação nos 5 targets, colisão de ID, redirecionamento de slug de fix.

---

## 11. Fases de Implementação

### Fase 1 — Commands + template canônico
- [ ] Criar `commands/new:fix.md` (investigação code-aware → FIX doc → tasks → fix inline opcional).
- [ ] Criar `references/fix-template.md` com placeholders + exemplo preenchido.
- [ ] Criar `commands/build:fix.md` (repro-first + gate de regressão + PR rotulado).

### Fase 2 — Instalador + integração com commands existentes
- [ ] Adicionar `new:fix.md` e `build:fix.md` a `COMMAND_FILES` em `bin/ksdd.js` + verificar distribuição/uninstall nos 5 targets.
- [ ] Atualizar `commands/new:feature.md` (numeração considera `fix-*`).
- [ ] Atualizar `commands/build:feature.md` e `commands/build:all.md` (redirecionar/excluir fix tasks).

### Fase 3 — Gates + artefatos KSDD + docs + release
- [ ] Adicionar Gate 8 e Gate 9 em `references/approval-gates.md`.
- [ ] Atualizar `SPEC.md` + `architecture.md` (ADR-013, artefatos, superfícies, roadmap, contagem).
- [ ] Atualizar `README.md` / `INSTALL.md` / `CHANGELOG.md` + bump `package.json` para `0.11.0`.

### Fase 4 — Dogfood + QA
- [ ] Rodar `/ksdd:new:fix` sobre um bug real do repo (contagem de commands) — primeiro FIX doc.
- [ ] QA end-to-end cobrindo todos os modos + edge cases (ver Critérios de Aceite).

---

**Referências:**
- `.ksdd/specs/SPEC.md` — seções 2 (personas), 3.2 (cores ANSI), 4.2 (artefatos), 7.2 (slash commands), 8 (componentes globais / agentes), 13.3 (fluxo de feature isolada)
- `.ksdd/specs/architecture.md` — seções 1 (visão), 3 (schemas / frontmatter de task), 4 (CLI surface), 10 (ADRs 001/003/007/009/010/011), 12 (roadmap)
- `.ksdd/features/FEATURE-archive-features.md` — precedente de "adicionar um slash command" (estrutura, wiring de `COMMAND_FILES`, dogfooding, QA)
- `commands/new:feature.md` — convenção de slug, numeração de tasks, checkpoints, formato de task
- `commands/build:feature.md` — pipeline de build (pre-flight, issue, branch, context.md, quality gates, PR) que o `build:fix` adapta
- `references/feature-template.md` — base do `references/fix-template.md`
- `references/approval-gates.md` — Gates 1–7 existentes; base dos Gates 8–9
