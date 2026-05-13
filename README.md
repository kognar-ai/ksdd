# KSDD — Kognar Spec-Driven Design & Development

Um sistema de slash commands para o Claude Code que guia produtos do **brainstorm bruto até um design system implementável**, em quatro etapas com aprovação humana entre cada uma.

```
/ksdd:start        →  brainstorm.md         (ideia → conceito refinado)
/ksdd:spec         →  SPEC.md               (conceito → especificação produto+design)
/ksdd:tech         →  architecture.md       (especificação → arquitetura técnica)
/ksdd:design       →  DESIGN.md             (especificação → design system Stitch-compatible)
/ksdd:new:feature    →  FEATURE-[slug].md     (nova feature → spec com impacto nos artefatos existentes)
/ksdd:build:feature  →  BUILD-[slug].md       (feature spec → implementação fase a fase com checkpoints)
```

## Filosofia

Inspirado no **SPEC Development model** com checkpoints obrigatórios de aprovação. Cada comando lê o output do anterior, faz perguntas estruturadas pra preencher lacunas, gera o artefato em formato canônico e **para antes de avançar** pro próximo. O humano valida, ajusta, e só então roda o próximo comando.

Os artefatos são acumulativos: `SPEC.md` referencia `brainstorm.md`, `architecture.md` e `DESIGN.md` referenciam ambos. Cada documento é um "contrato" que o próximo respeita.

## Instalação

Coloque a pasta `ksdd/` em `~/.claude/skills/ksdd/` ou na raiz do projeto em `.claude/skills/ksdd/`.

Os commands ficam em `ksdd/commands/`. O Claude Code descobre slash commands com prefixo `/ksdd:*` automaticamente a partir dos arquivos `start.md`, `spec.md`, `tech.md` e `design.md`.

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
Claude : [lê SPEC.md, architecture.md, DESIGN.md]
         [faz perguntas sobre escopo, personas impactadas, prioridade]
         [gera FEATURE-push-notifications.md com impacto em telas, dados, API e design]
         [PARA]

Você   : /ksdd:build:feature push-notifications
Claude : [lê FEATURE-push-notifications.md + todos os artefatos]
         [analisa codebase existente]
         [gera BUILD-push-notifications.md com plano de implementação]
         [PARA — pede aprovação do plano]

Você   : "aprovado, pode começar"
Claude : [implementa Fase 1 — modelo de dados + API]
         [PARA — checkpoint da fase]

Você   : "ok, próxima fase"
Claude : [implementa Fase 2 — componentes + UI]
         [PARA — checkpoint da fase]
         [valida critérios de aceite]
         [PARA — build completo]
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
│   └── build:feature.md               ← /ksdd:build:feature
├── references/
│   ├── brainstorm-template.md         ← template do brainstorm.md
│   ├── spec-template.md               ← template do SPEC.md
│   ├── architecture-template.md       ← template do architecture.md
│   ├── feature-template.md            ← template do FEATURE-[slug].md
│   ├── build-plan-template.md         ← template do BUILD-[slug].md
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

Após o fluxo completo, o usuário tem 4+ arquivos no diretório do projeto:

```
projeto/
├── brainstorm.md              (~500-1500 palavras)
├── SPEC.md                    (~3000-8000 palavras)
├── architecture.md            (~2000-5000 palavras, opcional)
├── DESIGN.md                  (YAML frontmatter + ~1500-3500 palavras)
├── FEATURE-[slug].md          (~1500-4000 palavras, uma por feature)
└── BUILD-[slug].md            (plano de build + tracking, um por feature)
```

Pronto pra ser consumido por ferramentas de design (Stitch, v0, Lovable, Pencil) e agentes de código (Claude Code, Cursor) com contexto persistente.

As feature specs (`FEATURE-*.md`) podem ser criadas a qualquer momento após o SPEC.md, e os builds (`BUILD-*.md`) executam a implementação fase a fase com checkpoints de aprovação.

## Licença e contribuição

Este projeto está sob [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0). Para contribuir, veja [CONTRIBUTING.md](CONTRIBUTING.md).
