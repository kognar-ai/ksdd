# KSDD — Kognar Spec-Driven Design & Development

Um sistema de slash commands para o **Claude Code** e **[OpenAI Codex](https://developers.openai.com/codex)** que guia produtos do **brainstorm bruto até um design system implementável**, em quatro etapas com aprovação humana entre cada uma.

## Codex (CLI / IDE)

Após `ksdd install --codex` (ou `KSDD_WITH_CODEX=1` no `npm install`):

| Claude Code | Codex (custom prompts em `~/.codex/prompts/`) |
|-------------|-----------------------------------------------|
| `/ksdd:start` | `/prompts:ksdd-start` |
| `/ksdd:spec` | `/prompts:ksdd-spec` |
| `/ksdd:tech` | `/prompts:ksdd-tech` |
| `/ksdd:design` | `/prompts:ksdd-design` |
| `/ksdd:new:feature` | `/prompts:ksdd-new-feature` |
| `/ksdd:build:feature` | `/prompts:ksdd-build-feature` |
| `/ksdd:build:all` | `/prompts:ksdd-build-all` |

Também é instalada a skill **`ksdd`** em `~/.agents/skills/ksdd/` (referências + agentes + `SKILL.md`) — use `$ksdd` ou mencione a skill no prompt. Os prompts do Codex são o mesmo conteúdo dos ficheiros em `commands/`; [custom prompts](https://developers.openai.com/codex/custom-prompts) estão marcados como *deprecated* em favor de skills, mas continuam a funcionar para invocação explícita `/prompts:…`.

Reinicie o Codex após instalar. `CODEX_HOME` (default `~/.codex`) altera a pasta de prompts se definido.

```
/ksdd:start        →  .ksdd/specs/brainstorm.md     (ideia → conceito refinado)
/ksdd:spec         →  .ksdd/specs/SPEC.md           (conceito → especificação produto+design)
/ksdd:tech         →  .ksdd/specs/architecture.md   (especificação → arquitetura técnica)
/ksdd:design       →  .ksdd/specs/DESIGN.md         (especificação → design system Stitch-compatible)
/ksdd:new:feature    →  .ksdd/features/FEATURE-[slug].md  (nova feature → spec + tasks implementáveis)
/ksdd:build:feature  →  task por task                    (feature → implementação com issue, branch, PR)
/ksdd:build:all      →  .ksdd/build/BUILD-PLAN.md        (SPEC inteiro → features + tasks + implementação completa)
```

> **Migrando da v0.5.x?** A partir da v0.6.0, KSDD usa o layout `.ksdd/` em vez de espalhar artefatos pela raiz/`docs/`. Projetos legados continuam funcionando — cada command lê do path antigo se o novo não existe e mostra como migrar via `git mv`. Veja [CHANGELOG](CHANGELOG.md#060---2026-05-19) para detalhes.

## Filosofia

Inspirado no **SPEC Development model** com checkpoints obrigatórios de aprovação. Cada comando lê o output do anterior, faz perguntas estruturadas pra preencher lacunas, gera o artefato em formato canônico e **para antes de avançar** pro próximo. O humano valida, ajusta, e só então roda o próximo comando.

Os artefatos são acumulativos: `SPEC.md` referencia `brainstorm.md`, `architecture.md` e `DESIGN.md` referenciam ambos. Cada documento é um "contrato" que o próximo respeita.

## Instalação

### npm (recomendado)

```bash
npm install -g @kognar/ksdd
```

Por omissão instala apenas **Claude Code** (`~/.claude/`). Para incluir **Codex**:

```bash
ksdd install --codex
```

Ou numa instalação npm: `KSDD_WITH_CODEX=1 npm install -g @kognar/ksdd`

### Manual (Claude Code)

Coloque a pasta `ksdd/` em `~/.claude/skills/ksdd/` ou na raiz do projeto em `.claude/skills/ksdd/`.

Os commands ficam em `ksdd/commands/`. O Claude Code descobre slash commands com prefixo `/ksdd:*` quando os ficheiros estão em `~/.claude/commands/` com o prefixo `ksdd:`.

## Fluxo de uso típico

```
Você   : /ksdd:start
         "quero fazer um marketplace de retro games com preço coletado de lives"
Claude : [faz 5-8 perguntas estruturadas sobre escopo, público, diferencial]
         [gera brainstorm.md com conceito refinado]
         [PARA — pede aprovação]

Você   : "tá ótimo, ajusta só o público pra incluir lojistas"
Claude : [edita brainstorm.md]
         [PARA novamente]

Você   : /ksdd:spec
Claude : [lê brainstorm.md]
         [faz perguntas sobre personas, fluxos críticos, modelo de negócio]
         [gera SPEC.md completo com produto + design]
         [PARA]

Você   : /ksdd:tech     # opcional, pode pular pra /ksdd:design
Claude : [lê SPEC.md]
         [gera architecture.md com stack, modelo de dados, integrações]
         [PARA]

Você   : /ksdd:design
Claude : [lê SPEC.md (+ architecture.md se existir)]
         [gera DESIGN.md no formato Google Stitch — YAML tokens + 8 seções]
         [PARA]

Você   : /ksdd:new:feature notificações push
Claude : [lê .ksdd/specs/{SPEC,architecture,DESIGN}.md]
         [faz perguntas sobre escopo, personas impactadas, prioridade]
         [gera .ksdd/features/FEATURE-push-notifications.md com impacto em telas, dados, API e design]
         [PARA]

Você   : /ksdd:build:feature push-notifications
Claude : [lê .ksdd/features/FEATURE-push-notifications.md + tasks + todos os artefatos]
         [para cada task: issue → branch → context.md → implementa → quality gates → PR]
         [PARA — checkpoint por feature]

--- OU, para buildar o projeto inteiro: ---

Você   : /ksdd:build:all
Claude : [lê .ksdd/specs/{SPEC,architecture,DESIGN}.md]
         [decompõe fases de entrega em features]
         [quebra cada feature em tasks implementáveis]
         [gera .ksdd/build/BUILD-PLAN.md com plano completo]
         [PARA — pede aprovação do plano]

Você   : "aprovado"
Claude : [implementa feature por feature, task por task]
         [issue → branch → context.md → code → quality gates → PR]
         [PARA — checkpoint por feature e por fase]
         [valida critérios do SPEC ao final]
```

## Estrutura do sistema

```
ksdd/
├── README.md                          ← este arquivo
├── commands/
│   ├── start.md                       ← /ksdd:start
│   ├── spec.md                        ← /ksdd:spec
│   ├── tech.md                        ← /ksdd:tech
│   ├── design.md                      ← /ksdd:design
│   ├── new:feature.md                 ← /ksdd:new:feature
│   ├── build:feature.md               ← /ksdd:build:feature
│   └── build:all.md                   ← /ksdd:build:all
├── references/
│   ├── brainstorm-template.md         ← template do brainstorm.md
│   ├── spec-template.md               ← template do SPEC.md
│   ├── architecture-template.md       ← template do architecture.md
│   ├── feature-template.md            ← template do docs/FEATURE-[slug].md
│   ├── build-plan-template.md         ← formato de task (BUILD / build:all)
│   ├── codex-SKILL.md                 ← corpo da skill Codex (~/.agents/skills/ksdd/SKILL.md)
│   ├── design-md-spec.md             ← especificação Google Stitch DESIGN.md
│   ├── personas-guide.md              ← como construir personas úteis
│   └── approval-gates.md              ← regras dos checkpoints
└── agents/
    ├── interviewer.md                 ← agente que faz perguntas estruturadas
    ├── consolidator.md                ← agente que sintetiza respostas em artefato
    └── critic.md                      ← agente que revisa o artefato antes de entregar
```

## Princípios

1. **Aprovação obrigatória** entre cada etapa. Nunca rodar `/ksdd:spec` sem ter `brainstorm.md` aprovado. Nunca rodar `/ksdd:design` sem ter `SPEC.md` aprovado.
2. **Perguntas em batch**, não uma por uma. Cada comando pergunta tudo que precisa de uma vez (máximo 8 perguntas), de preferência usando `ask_user_input_v0` quando disponível.
3. **Idioma flexível**. Artefatos podem ser gerados em pt-BR, en-US ou outro idioma a critério do usuário. O default segue o idioma da conversa.
4. **Formato canônico**. `DESIGN.md` segue 100% a spec do Google Stitch. `SPEC.md` tem estrutura fixa. `brainstorm.md` é mais livre mas com seções obrigatórias.
5. **Reuso de artefatos**. Se o usuário já tem um `brainstorm.md` ou `SPEC.md` rascunhado, os commands leem e iteram em cima, em vez de começar do zero.

## Skills e tools usados

Os commands aproveitam tools nativos do Claude Code e podem invocar skills auxiliares:

| Tool/Skill | Uso |
|------------|-----|
| `view`, `create_file`, `str_replace` | Leitura e escrita dos artefatos |
| `ask_user_input_v0` | Perguntas estruturadas multi-opção (mobile-friendly) |
| `web_search`, `web_fetch` | Pesquisa de mercado, validação de referências (ex: spec do DESIGN.md) |
| `image_search` | Mood board e referências visuais durante `/ksdd:design` |
| `conversation_search` | Recuperar contexto de conversas anteriores sobre o mesmo projeto |
| `skill-creator` | Empacotar o projeto KSDD em si como uma skill instalável |
| `frontend-design` (Anthropic) | Referência de tokens e padrões durante `/ksdd:design` |

## Output esperado

Após o fluxo completo, o usuário tem a pasta `.ksdd/` na raiz do projeto:

```
projeto/
├── (código do projeto, README, configs, etc. — raiz limpa)
└── .ksdd/
    ├── specs/
    │   ├── brainstorm.md          (~500-1500 palavras)
    │   ├── SPEC.md                (~3000-8000 palavras)
    │   ├── architecture.md        (~2000-5000 palavras, opcional)
    │   └── DESIGN.md              (YAML frontmatter + ~1500-3500 palavras)
    ├── features/
    │   └── FEATURE-[slug].md      (~1500-4000 palavras, uma por feature)
    ├── tasks/
    │   └── feature-[slug]/
    │       ├── README.md          (índice de tasks da feature)
    │       ├── NNN-slug.md        (task individual com frontmatter)
    │       └── .context/
    │           └── NNN-context.md (contexto compilado para implementação)
    └── build/
        └── BUILD-PLAN.md          (plano mestre do build completo)
```

> Projetos legados pré-v0.6.0 podem ter artefatos na raiz (`SPEC.md`, etc.) e em `docs/` (FEATURE/tasks) — os commands continuam lendo de lá com warning de migração, sem quebrar nada.

Pronto pra ser consumido por ferramentas de design (Stitch, v0, Lovable, Pencil) e agentes de código (Claude Code, Cursor) com contexto persistente.

O fluxo completo: `/ksdd:build:all` decompõe o SPEC em features e tasks, gera o `BUILD-PLAN.md` como mapa de execução, e implementa task por task com issues, branches, quality gates e PRs. Para features individuais fora do fluxo completo, use `/ksdd:new:feature` + `/ksdd:build:feature`.

## Licença e contribuição

Este projeto está sob [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0). Para contribuir, veja [CONTRIBUTING.md](CONTRIBUTING.md).
