# KSDD — Instalação e Uso

## Instalação no Claude Code

### Opção 0: via npm (recomendado)

```bash
npm install -g @kognar/ksdd
```

O `postinstall` copia automaticamente os commands pra `~/.claude/commands/` (renomeados como `ksdd:start.md`, `ksdd:spec.md`, etc.) e os assets de skill pra `~/.claude/skills/ksdd/`.

### Targets suportados

| Agente | Commands default | Bundle default | Env var (postinstall) | Env var (override de path) |
|--------|------------------|----------------|-----------------------|----------------------------|
| Claude Code | `~/.claude/commands/ksdd:*.md` | `~/.claude/skills/ksdd/` | — (sempre instalado) | — |
| OpenAI Codex | `~/.codex/prompts/ksdd-*.md` | `~/.agents/skills/ksdd/` | `KSDD_WITH_CODEX=1` | `CODEX_HOME` (default `~/.codex`) |
| opencode | `~/.config/opencode/commands/ksdd-*.md` | `~/.config/opencode/ksdd/` | `KSDD_WITH_OPENCODE=1` | `OPENCODE_HOME` (default `~/.config/opencode`) |
| Google Antigravity | `~/.gemini/commands/ksdd/*.toml` (TOML nativo) | `~/.gemini/ksdd/` | `KSDD_WITH_ANTIGRAVITY=1` | `ANTIGRAVITY_HOME` (default `~/.gemini`) |

> **Antigravity / Gemini CLI:** os commands são registrados como **TOML nativo** em `~/.gemini/commands/ksdd/` (mesmo diretório lido pela CLI/TUI e pelo IDE do Antigravity, compartilhado com o `gemini-cli`). Cada TOML (`description` + `prompt`) puxa o corpo do command de um bundle (`~/.gemini/ksdd/commands/ksdd-*.md`) via include `@$HOME/...`; `references/`, `agents/` e `AGENTS.md` vão no mesmo bundle. Subdirs aninhados reproduzem a invocação do Claude: `commands/ksdd/new/feature.toml` → `/ksdd:new:feature`. Mesmo modelo do [GSD](https://github.com/open-gsd/gsd-core) (`~/.gemini/commands/gsd/*.toml`).

### Instalação seletiva

```bash
ksdd install                                    # só Claude Code (default)
ksdd install --codex                            # Claude + Codex
ksdd install --opencode                         # Claude + opencode
ksdd install --antigravity                      # Claude + Google Antigravity
ksdd install --codex --opencode --antigravity   # Claude + Codex + opencode + Antigravity (4 targets)
```

Equivalentes via npm postinstall:

```bash
KSDD_WITH_CODEX=1 npm install -g @kognar/ksdd
KSDD_WITH_OPENCODE=1 npm install -g @kognar/ksdd
KSDD_WITH_ANTIGRAVITY=1 npm install -g @kognar/ksdd
KSDD_WITH_CODEX=1 KSDD_WITH_OPENCODE=1 KSDD_WITH_ANTIGRAVITY=1 npm install -g @kognar/ksdd
```

Comandos do CLI:

```bash
ksdd install                      # reinstala / atualiza (só Claude Code)
ksdd install --codex              # Claude + Codex (prompts + skill)
ksdd install --opencode           # Claude + opencode (commands + bundle)
ksdd install --antigravity        # Claude + Antigravity (skills CLI+IDE + bundle)
ksdd status                       # mostra estado da instalação
ksdd uninstall                    # remove arquivos copiados (todos os targets)
```

Para desinstalar tudo:

```bash
npm uninstall -g @kognar/ksdd
```

`ksdd uninstall` itera os 4 targets registrados no manifest (`.ksdd-manifest.json`) e remove tudo que foi instalado. Quando o manifest não existe, faz fallback por convenção e ainda assim limpa os paths default dos 4 agentes. No caso do Antigravity, só o namespace `~/.gemini/commands/ksdd/` e o bundle `~/.gemini/ksdd/` são removidos — nunca `~/.gemini/commands/` (compartilhado com o `gsd` e outros namespaces) nem `~/.gemini/` em si.

### Troubleshooting

- **`~/.config/opencode/` não existe:** sem problema — o `ksdd install --opencode` cria a estrutura idempotentemente. Você pode instalar o opencode depois e os arquivos já estarão prontos pra serem descobertos automaticamente.
- **`~/.gemini/` não existe:** mesma lógica — `ksdd install --antigravity` cria a estrutura idempotentemente; instale o Antigravity depois e as skills já estarão prontas.
- **`~/.codex/` não existe:** mesma lógica — `ksdd install --codex` cria os diretórios necessários.
- **Reverter target específico:** rode `ksdd uninstall` (remove todos) e depois `ksdd install` (ou `ksdd install --codex` / `--opencode` / `--antigravity`) só com os que quer manter.

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

Todos os artefatos KSDD ficam em `.ksdd/` a partir da v0.6.0 (com fallback de leitura para layout legado raiz/`docs/`).

| Comando | Input | Output | Próximo |
|---------|-------|--------|---------|
| `/ksdd:start [ideia]` | Ideia bruta | `.ksdd/specs/brainstorm.md` | `/ksdd:spec` |
| `/ksdd:spec [foco?]` | `.ksdd/specs/brainstorm.md` | `.ksdd/specs/SPEC.md` | `/ksdd:tech` ou `/ksdd:design` |
| `/ksdd:tech [stack?]` | `.ksdd/specs/SPEC.md` | `.ksdd/specs/architecture.md` | `/ksdd:design` |
| `/ksdd:design [direção?]` | `.ksdd/specs/SPEC.md` (+ `.ksdd/specs/architecture.md` opcional) | `.ksdd/specs/DESIGN.md` (Google Stitch format) | — |

## Validando os artefatos

### DESIGN.md
```bash
npx @google/design.md lint .ksdd/specs/DESIGN.md
```

Exportar pra Tailwind:
```bash
npx @google/design.md export --format css-tailwind .ksdd/specs/DESIGN.md > theme.css
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

Os commands estão redigidos em português no repositório, mas **não fixam pt-BR** nos artefatos nem nas perguntas. A regra canônica está em `references/language-policy.md` (referenciada por todos os commands e agents).

Prioridade do idioma dos artefatos gerados:

1. Idioma explícito no `$ARGUMENTS` (`generate in English`, `gera em inglês`)
2. Idioma declarado em artefatos existentes (`**Idioma da interface:**` no brainstorm/SPEC)
3. Idioma da conversa (mensagens do usuário na thread atual)

Perguntas ao usuário e checkpoints usam o **mesmo idioma da conversa**, não o idioma do arquivo do command.

Para projetos bilíngues, prefira artefatos separados (`.ksdd/specs/SPEC-pt.md`, `.ksdd/specs/SPEC-en.md`).
