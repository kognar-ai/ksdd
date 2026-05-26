# Changelog

Todas as mudanças notáveis do projeto KSDD serão documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.8.0] - 2026-05-26

### Adicionado

- **Suporte ao [opencode](https://opencode.ai) como terceiro target** — `ksdd install --opencode` instala 9 slash commands em `~/.config/opencode/commands/ksdd-*.md` (basename `ksdd-start`, `ksdd-spec`, …, invocados como `/ksdd-start`, `/ksdd-spec`, etc.) e bundle completo (references, agents, `AGENTS.md`) em `~/.config/opencode/ksdd/`.
- **Flag `--opencode` combinável com `--codex`** — `ksdd install --codex --opencode` instala os 3 targets (Claude Code + Codex + opencode) numa única invocação.
- **Variáveis de ambiente `KSDD_WITH_OPENCODE=1`** (equivale a `--opencode` no postinstall) e `OPENCODE_HOME` (override do diretório base, default `~/.config/opencode`).
- **Campo `targets.opencode`** no manifest `.ksdd-manifest.json` — rastreia arquivos instalados pelo target opencode para uninstall preciso.
- **`references/opencode-AGENTS.md`** — novo template canônico distribuído como bundle em `~/.config/opencode/ksdd/AGENTS.md`. Orienta o agente opencode sobre o contexto KSDD (estrutura, fluxo, convenções) na primeira leitura.

### Alterado

- **Helper interno `codexPromptBasename` renomeado para `agentPromptBasename`** — compartilhado entre Codex e opencode, ambos usam basename `ksdd-*` em vez de `ksdd:*` (`:` não é aceito em filename de command nem pelo Codex nem pelo opencode).
- **`cmdStatus`** agora exibe linha `opencode: N arquivos em …` quando há instalação ativa do target (omitida quando vazia, paridade com Codex).
- **`cmdUninstall`** itera os 3 targets registrados no manifest; fallback (sem manifest) também remove paths opencode por convenção, garantindo limpeza completa.
- **`KSDD_WITH_CODEX` e `KSDD_WITH_OPENCODE`** agora só disparam em modo postinstall (consistente com a doc oficial "Equivale a `--codex`/`--opencode` no postinstall"). O comportamento anterior do `KSDD_WITH_CODEX` (disparar sempre) era inconsistente com a doc e foi corrigido.
- **README / INSTALL** — documentam os 3 targets, flags, env vars e tabela tripla de slash commands (`/ksdd:start` Claude · `/prompts:ksdd-start` Codex · `/ksdd-start` opencode).

### Arquitetura

- **ADR-010 registrado em `architecture.md`** — terceiro target hardcoded (cópia adaptada de `installCodex`) antes do refator `installTarget` genérico. A próxima feature multi-agent (Cursor / Windsurf / Cline) é obrigada a fazer o refator antes de adicionar o quarto target.
- **Fase 5 do roadmap** marcada como "Em andamento" com opencode entregue como primeiro item da fase de integrações multi-agent.

---

## [0.7.0] - 2026-05-25

### Adicionado

- **`/ksdd:archive`** — novo slash command que arquiva features já implementadas, movendo `.ksdd/features/FEATURE-[slug].md` + `.ksdd/tasks/feature-[slug]/` para `.ksdd/archive/raw/[slug]/` e consolidando um resumo cronológico em `.ksdd/archive/ARCHIVE.md`. Cinco modos: individual (`[slug]`), lote (`[slug-a] [slug-b]`), massa (`--all-eligible`), reverso (`--restore [slug]`), preview (`--dry-run` — combinável). Critério de elegibilidade estrito: 100% das tasks com `status: concluída` ou `cancelada`. Operação atômica por slug; sem rollback automático em lote.
- **`references/archive-template.md`** — template canônico do `ARCHIVE.md` com header global + estrutura de seção por feature (objetivo, tasks, critérios de aceite preservados, pointer para `raw/`). Distribuído em `~/.claude/skills/ksdd/references/` e `~/.agents/skills/ksdd/references/` via `ksdd install`.

### Alterado

- **`/ksdd:new:feature`** — detecta colisão de slug com features em `.ksdd/archive/raw/` e apresenta 3-way fork (escolher novo slug / restaurar / abortar). Numeração de IDs passa a considerar três paths: `.ksdd/tasks/`, `docs/tasks/` (legado) e `.ksdd/archive/raw/*/tasks/` — evita colisão pós-restore.
- **`/ksdd:build:feature`** — nova seção 0.5 "Detecção de slug arquivado" no pre-flight com 3-way fork (consultar `ARCHIVE.md` / restaurar / abortar). Nunca restaura automaticamente.
- **`/ksdd:build:all`** — A.1 lista features arquivadas como histórico. A.2 exclui slugs em `.ksdd/archive/raw/` da fila de execução; aparecem como linha informativa no Checkpoint 1, sem entrar no `BUILD-PLAN.md`.
- **`bin/ksdd.js`** — adiciona `archive.md` ao array `COMMAND_FILES` (necessário porque install/uninstall não usam `copyDir` para `commands/`). Sem novas dependências runtime (mantém ADR-001).
- **README** — adiciona `/ksdd:archive` à tabela de comandos e nova seção "Archiving delivered features" com exemplos de uso.

---

## [0.6.1] - 2026-05-19

### Alterado

- **Idioma flexível nos commands** — política canônica em `references/language-policy.md`; todos os 8 commands e 4 agents referenciam regra explícita: artefatos, perguntas e checkpoints seguem o idioma da conversa (ou `$ARGUMENTS` / artefatos existentes), sem assumir pt-BR porque os prompts estão em português.
- **`/ksdd:start`** — pergunta sobre idioma da interface sem default implícito pt-BR.
- **README / INSTALL / codex-SKILL** — documentação alinhada à política de idioma.

---

## [0.6.0] - 2026-05-19

### Alterado

- **Novo layout `.ksdd/` para todos os artefatos KSDD** — `brainstorm.md`, `SPEC.md`, `architecture.md` e `DESIGN.md` passam a ser gerados em `.ksdd/specs/`; `FEATURE-[slug].md` em `.ksdd/features/`; tasks e context.md em `.ksdd/tasks/feature-[slug]/`; `BUILD-PLAN.md` em `.ksdd/build/`. Mantém raiz do projeto limpa e separa artefatos de processo dos artefatos de produto.
- **Leitura backward-compatible** — todos os 8 commands continuam reconhecendo artefatos em paths legados (raiz e `docs/`), emitindo warning amarelo claro quando detectam o layout antigo. Projetos existentes continuam funcionando sem migração obrigatória.
- **Sugestão de migração via `git mv`** — quando detecta legados, o command sugere o comando shell exato para mover via git (preserva histórico). Migração executada manualmente pelo usuário, não automatizada nesta versão.
- **Abort em conflito** — se mesmo artefato existe em path novo E legado com conteúdos diferentes, o command aborta com erro pedindo resolução manual em vez de escolher por heurística.
- **`/ksdd:setup`** — Fase 0.1 detecta legados e pergunta ao usuário antes de prosseguir (3 opções: gerar separado em `.ksdd/`, pausar para migrar manual, abortar).

### Planejado para 1.0.0 (futuro)

- **Remoção do fallback de leitura legado** — janela mínima de 6 meses de compat antes da remoção.
- **Comando `ksdd migrate`** explícito no CLI para mover artefatos legados automaticamente (avaliado conforme demanda).

---

## [0.5.2] - 2026-05-15

### Alterado

- **`/ksdd:new:feature`** — a spec de feature passa a ser gerada como `docs/FEATURE-[slug].md` (criar `docs/` se necessário), alinhado às tasks em `docs/tasks/`. Comandos e documentação (`build:feature`, `build:all`, SPEC, README, gates) atualizados; projetos com `FEATURE-*.md` na raiz são tratados como legado em `--tasks-only` e resume.

### Adicionado

- **Documentação de arquitetura, brainstorm e SPEC do KSDD** — artefatos no repositório do próprio fluxo KSDD.
- **`architecture.md`** — arquitetura do sistema e stack tecnológica do KSDD.
- **`brainstorm.md`** — conceito, problemas, soluções propostas e público-alvo do projeto KSDD.
- **`SPEC.md`** — visão de produto, personas e modelo de dados, com fluxo estruturado do brainstorm ao design system.
- Rascunhos gerados por reverse-engineering, para revisão antes de uso como contratos.

---

## [0.5.0] - 2026-05-14

### Adicionado

- **Comando `/ksdd:setup`** — onboarding de projetos existentes para o fluxo KSDD por reverse-engineering. Analisa codebase, git history, manifests e estrutura para gerar automaticamente `brainstorm.md`, `SPEC.md`, `architecture.md` e `DESIGN.md` (se frontend detectado). Suporta `--artifacts [brainstorm,spec,arch,design]` para geração seletiva, `--depth shallow|deep` para controlar profundidade da análise, e `--skip-questions` para modo não-interativo.
- **Agent `setup-analyst`** — agente especializado em análise de codebases, invocado em 4 variantes paralelas pelo `/ksdd:setup`: Analista de Produto (extrai propósito, problema, usuários), Analista de Stack (mapeia tecnologias a partir de manifests e configs), Analista de Código (extrai modelos de dados, endpoints, padrões de convenção) e Analista de Git (reconstrói história, fases e estado atual do projeto a partir do git history).

---

## [0.4.0] - 2026-05-13

### Adicionado

- **Integração OpenAI Codex** — `ksdd install --codex` copia os mesmos prompts de `commands/` para `~/.codex/prompts/` como `ksdd-start.md`, `ksdd-spec.md`, … (invocação `/prompts:ksdd-start`, etc., conforme [Custom Prompts](https://developers.openai.com/codex/custom-prompts)).
- **Skill Codex** — `references/codex-SKILL.md` é instalado como `~/.agents/skills/ksdd/SKILL.md` com `references/` e `agents/` (escopo [USER skills](https://developers.openai.com/codex/skills)).
- **Manifesto com alvos** — `.ksdd-manifest.json` passa a usar `targets.claude` e `targets.codex`; `ksdd install` sem `--codex` atualiza só Claude e preserva ficheiros Codex já instalados.
- **Variável `KSDD_WITH_CODEX=1`** — no `npm install`, equivale a `install --codex` para quem quer Codex no postinstall.
- **`CODEX_HOME`** — respeitado para localizar `prompts/` (default `~/.codex`).

### Alterado

- **CLI** — `ksdd help`, `ksdd status` e mensagens de `install` documentam Codex.

---

## [0.2.0] - 2026-05-13

### Adicionado

- **Licença AGPL-3.0** — arquivo `LICENSE` com texto completo da GNU Affero General Public License v3 e aviso de copyright do projeto.
- **`CONTRIBUTING.md`** — orientações para contribuições open source (licença, fluxo de PR, expectativas).
- **README** — seção "Licença e contribuição" com links para `LICENSE` e `CONTRIBUTING.md`.
- **Comando `/ksdd:new:feature`** — cria especificação de novas features + quebra em tasks implementáveis. Gera `FEATURE-[slug].md` (spec de produto com escopo, impacto, critérios de aceite) e `docs/tasks/feature-[slug]/NNN-*.md` (tasks individuais com frontmatter estruturado: id, status, area, priority, estimate, depends_on, refs cruzadas). Suporta `--tasks-only` pra gerar tasks de uma feature já especificada.
- **Comando `/ksdd:build:feature`** — implementa tasks ponta-a-ponta com fluxo completo: pre-flight → issue GitHub → branch → context.md de implementação → execução via subagents especializados → quality gates (build, testes, lint, E2E, code review, security audit) → commits atômicos → PR. Suporta task individual por ID/slug ou `--all` pra fluxo contínuo.
- **Template `references/feature-template.md`** — template canônico com 11 seções para feature specs.
- **Template `references/build-plan-template.md`** — formato de task individual com frontmatter YAML (id, status, area, priority, estimate, depends_on, refs) e seções: Objetivo, Escopo, Fora de escopo, Critérios de aceitação, Notas técnicas, Riscos.
- **Checklist do critic para FEATURE-[slug].md** — validação de consistência entre feature spec e artefatos do projeto.
- **Checklist do critic para BUILD/tasks** — validação de tasks contra feature spec e padrões do codebase.
- **Gate 5 no approval-gates** — checkpoint para `/ksdd:new:feature` (spec + tasks).
- **Gate 6 no approval-gates** — checkpoints múltiplos para `/ksdd:build:feature` (pre-flight, por task, quality gates, PR).
- **Comando `/ksdd:build:all`** — orquestra o build completo de um projeto KSDD a partir do SPEC.md. Decompõe as fases de entrega em features, quebra em tasks, gera `BUILD-PLAN.md` como mapa de execução, e implementa tudo task por task com checkpoints por feature e por fase. Suporta `--phase N` (build parcial), `--plan-only` (só planejamento) e `--resume` (retomada de build interrompido).
- **Gate 7 no approval-gates** — checkpoints em cascata para `/ksdd:build:all` (plano mestre, por feature, por fase, validação final contra SPEC).

---

## [0.1.0] - 2025-05-08

### Adicionado

- Comando `/ksdd:start` — brainstorm estruturado, gera `brainstorm.md`
- Comando `/ksdd:spec` — especificação de produto + design, gera `SPEC.md`
- Comando `/ksdd:tech` — arquitetura técnica, gera `architecture.md`
- Comando `/ksdd:design` — design system no formato Google Stitch, gera `DESIGN.md`
- Templates canônicos para cada artefato (`references/`)
- Agents: interviewer, consolidator, critic (`agents/`)
- Referências: approval-gates, personas-guide, design-md-spec
- Instalador CLI (`bin/ksdd.js`) com install/uninstall/status
- README com documentação completa do fluxo
