# Changelog

Todas as mudanças notáveis do projeto KSDD serão documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

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
