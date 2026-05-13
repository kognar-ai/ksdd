# Changelog

Todas as mudanças notáveis do projeto KSDD serão documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

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
