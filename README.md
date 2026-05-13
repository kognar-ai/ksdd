# KSDD — Kognar Spec-Driven Design & Development

Um sistema de slash commands para o Claude Code que guia produtos do **brainstorm bruto até um design system implementável**, em quatro etapas com aprovação humana entre cada uma.

```
/ksdd:start    →  brainstorm.md     (ideia → conceito refinado)
/ksdd:spec     →  SPEC.md           (conceito → especificação produto+design)
/ksdd:tech     →  architecture.md   (especificação → arquitetura técnica)
/ksdd:design   →  DESIGN.md         (especificação → design system Stitch-compatible)
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
```

## Estrutura do sistema

```
ksdd/
├── README.md                          ← este arquivo
├── commands/
│   ├── start.md                       ← /ksdd:start
│   ├── spec.md                        ← /ksdd:spec
│   ├── tech.md                        ← /ksdd:tech
│   └── design.md                      ← /ksdd:design
├── references/
│   ├── brainstorm-template.md         ← template do brainstorm.md
│   ├── spec-template.md               ← template do SPEC.md
│   ├── architecture-template.md       ← template do architecture.md
│   ├── design-md-spec.md              ← especificação Google Stitch DESIGN.md
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

Após o fluxo completo, o usuário tem 4 arquivos no diretório do projeto:

```
projeto/
├── brainstorm.md         (~500-1500 palavras)
├── SPEC.md               (~3000-8000 palavras)
├── architecture.md       (~2000-5000 palavras, opcional)
└── DESIGN.md             (YAML frontmatter + ~1500-3500 palavras)
```

Pronto pra ser consumido por ferramentas de design (Stitch, v0, Lovable, Pencil) e agentes de código (Claude Code, Cursor) com contexto persistente.
