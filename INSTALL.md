# KSDD — Instalação e Uso

## Instalação no Claude Code

### Opção 0: via npm (recomendado)

```bash
npm install -g @kognar/ksdd
```

O `postinstall` copia automaticamente os commands pra `~/.claude/commands/` (renomeados como `ksdd:start.md`, `ksdd:spec.md`, etc.) e os assets de skill pra `~/.claude/skills/ksdd/`.

Comandos do CLI:

```bash
ksdd install     # reinstala / atualiza
ksdd status      # mostra estado da instalação
ksdd uninstall   # remove arquivos copiados
```

Para desinstalar tudo:

```bash
npm uninstall -g @kognar/ksdd
```

### Opção 1: Slash commands globais (recomendado)

Os arquivos em `commands/` viram slash commands automaticamente quando colocados em `~/.claude/commands/`.

```bash
mkdir -p ~/.claude/commands
cp commands/start.md ~/.claude/commands/ksdd:start.md
cp commands/spec.md ~/.claude/commands/ksdd:spec.md
cp commands/tech.md ~/.claude/commands/ksdd:tech.md
cp commands/design.md ~/.claude/commands/ksdd:design.md
```

As references e agents ficam em `~/.claude/skills/ksdd/`:

```bash
mkdir -p ~/.claude/skills/ksdd
cp -r references/ ~/.claude/skills/ksdd/
cp -r agents/ ~/.claude/skills/ksdd/
cp README.md ~/.claude/skills/ksdd/
```

Os commands referenciam essas paths quando precisam de templates/specs.

### Opção 2: Slash commands por projeto

Em projetos específicos, instale localmente em `.claude/commands/` na raiz do repo:

```bash
mkdir -p .claude/commands .claude/skills/ksdd
cp commands/*.md .claude/commands/
# renomeie pra ksdd:start.md, etc se necessário
cp -r references agents README.md .claude/skills/ksdd/
```

Vantagem: o projeto carrega o KSDD junto com o repo. Útil pra times.

### Opção 3: Skill (forma alternativa)

Empacote toda a pasta `ksdd/` como uma skill. O Claude descobre via `available_skills` e os commands viram parte do fluxo da skill.

Crie um arquivo `SKILL.md` na raiz do ksdd com frontmatter apropriado e use o skill-creator pra empacotar como `.skill`.

## Uso

### Fluxo completo (do zero)

```
/ksdd:start
[ideia em uma frase ou parágrafo]
```

Claude faz perguntas, gera `brainstorm.md`, pede aprovação.

```
[você revisa, aprova]
/ksdd:spec
```

Claude lê o brainstorm, faz mais perguntas, gera `SPEC.md`, pede aprovação.

```
[você revisa, aprova]
/ksdd:tech       # opcional
/ksdd:design
```

Cada comando gera o artefato correspondente e para em checkpoint.

### Pulando etapas

`/ksdd:tech` é opcional. Você pode ir direto de `/ksdd:spec` pra `/ksdd:design` se não precisa de architecture.md ainda.

`/ksdd:start` é obrigatório como ponto de entrada de projetos novos. Mas se você já tem um brainstorm em qualquer formato, pode pular direto pra `/ksdd:spec` — Claude lê o arquivo existente.

### Iterando

Todos os commands detectam artefatos existentes e perguntam se quer iterar ou recomeçar. Edição usa `str_replace` cirúrgico em vez de regenerar do zero.

### Comandos suportados

| Comando | Input | Output | Próximo |
|---------|-------|--------|---------|
| `/ksdd:start [ideia]` | Ideia bruta | `brainstorm.md` | `/ksdd:spec` |
| `/ksdd:spec [foco?]` | `brainstorm.md` | `SPEC.md` | `/ksdd:tech` ou `/ksdd:design` |
| `/ksdd:tech [stack?]` | `SPEC.md` | `architecture.md` | `/ksdd:design` |
| `/ksdd:design [direção?]` | `SPEC.md` (+ `architecture.md` opcional) | `DESIGN.md` (Google Stitch format) | — |

## Validando os artefatos

### DESIGN.md
```bash
npx @google/design.md lint DESIGN.md
```

Exportar pra Tailwind:
```bash
npx @google/design.md export --format css-tailwind DESIGN.md > theme.css
```

### brainstorm.md, SPEC.md, architecture.md
Não há lint formal. A revisão é humana + o agente `critic` durante a geração.

## Ferramentas que consomem os artefatos

- **`brainstorm.md`:** Leitura interna. Documento de alinhamento.
- **`SPEC.md`:** Briefing pra designers (Pencil, Figma), input pra `/ksdd:design`, base pra documentação de produto.
- **`architecture.md`:** Briefing pra engenheiros, base pra documentação técnica e ADRs.
- **`DESIGN.md`:** Importável em **Google Stitch**, **Cursor**, **Claude Code**, **v0**, **Lovable**, **Pencil**, qualquer agente que entenda o formato. Exportável pra Tailwind v3/v4, W3C Design Tokens.

## Customizando

Edite os templates em `references/`:
- `brainstorm-template.md`
- `spec-template.md`
- `architecture-template.md`

Os commands usam esses templates como estrutura base. Mudanças propagam pros próximos artefatos gerados.

A spec do DESIGN.md (`references/design-md-spec.md`) **não deve ser editada** — é o formato oficial Google Stitch.

## Suporte multi-idioma

Os commands aceitam respostas em qualquer idioma. O artefato gerado segue:
1. Idioma explícito no `$ARGUMENTS` ("gera em inglês")
2. Idioma do brainstorm/SPEC se já existir
3. Idioma da conversa

Para projetos bilíngues, gere artefatos separados (`SPEC-pt.md`, `SPEC-en.md`).
