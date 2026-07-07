# CLAUDE.md — Guia para agentes neste repositório

KSDD (Kognar Spec-Driven Design & Development) é um pacote npm (`@kognar/ksdd`) que
distribui **conteúdo Markdown** (slash commands, templates, agentes) para os diretórios
convencionais de agentes de IA, mais um **CLI Node.js sem dependências** que gerencia
a instalação. O produto é conteúdo distribuído, **não runtime** — a lógica vive nos
commands lidos pelos agentes; o CLI só copia arquivos e mantém o manifest.

## Estrutura do repositório

```
bin/ksdd.js          CLI (install/uninstall/status/help). ~640 linhas, zero deps.
commands/*.md        Os 9 slash commands (start, spec, tech, design, new:feature,
                     build:feature, build:all, setup, archive). Fonte única — todos
                     os targets copiam daqui.
references/*.md       Templates canônicos + AGENTS/SKILL por target (codex-SKILL.md,
                     opencode-AGENTS.md, antigravity-AGENTS.md, copilot-AGENTS.md).
agents/*.md          Helpers de estilo (interviewer, consolidator, critic, setup-analyst).
.ksdd/specs/         SPEC.md, architecture.md, brainstorm.md (artefatos do próprio KSDD).
.ksdd/features/      FEATURE-*.md (specs de feature).
.ksdd/tasks/         feature-<slug>/NNN-*.md (tasks) + .context/ + README.md por feature.
.ksdd/archive/       Features arquivadas (raw/ + ARCHIVE.md). Read-only fora de /ksdd:archive.
README.md INSTALL.md CHANGELOG.md package.json
```

## Como o instalador funciona

`ksdd install [--codex] [--opencode] [--antigravity] [--copilot] [--project]`.
Claude Code é sempre instalado; os demais são opt-in (flag ou `KSDD_WITH_*=1` no postinstall).
Cada target tem uma função `installX(tracked, out)` que copia os commands (renomeando
`:` → `-` via `agentPromptBasename`, com sufixos por agente) + bundla `references/`+`agents/`.
Todos os paths absolutos copiados vão para `tracked` e são salvos em
`~/.claude/skills/ksdd/.ksdd-manifest.json` sob `targets.<agente>`. `uninstall` itera
o manifest e remove só o rastreado; `pruneEmptyDirs` só remove diretórios **vazios**.

Targets atuais (5): `claude`, `codex`, `opencode`, `antigravity`, `copilot`.

- **Copilot** (5º, v0.10.0): prompt files `ksdd-*.prompt.md` no perfil VS Code (path por
  SO via `resolveVscodeUserDir()`, override `COPILOT_HOME`), chat mode `ksdd.chatmode.md`,
  bundle `<vscode-user>/ksdd/`, placeholder CLI `~/.copilot/prompts/`, e modo `--project`
  (`.github/prompts|chatmodes/`). O Copilot CLI ainda não consome comandos custom
  (copilot-cli#618/#1113) — o placeholder fica pronto.

### ADR importante antes de adicionar o 6º target

`installClaude/Codex/Opencode/Antigravity/Copilot` são **5 cópias hardcoded** intencionais
(ADR-010/011/012 em `.ksdd/specs/architecture.md`). O refator para `installTarget(targetConfig)`
genérico é **obrigatório antes do 6º target** (Cursor/Windsurf/Cline). Não adicione um 6º
target hardcoded — faça o refator primeiro.

## Convenções (não quebre)

- **Zero dependências runtime.** Só built-ins (`fs`, `path`, `os`). CommonJS.
- **Node ≥ 16.** Sem `node:test`/APIs de 18+ no código de produção sem bumpar engines.
- **Cores ANSI** via helpers `green/yellow/red/dim/bold`; respeitam `NO_COLOR` e `isTTY`.
- **Prefixo `ksdd`** em todos os commands para evitar colisão de namespace.
- **Prune seguro:** nunca chame `pruneEmptyDirs` na raiz de um diretório compartilhado
  (`~/.gemini/`, `<vscode-user>/`, `~/.copilot/`) — só nos subdirs KSDD, e ele só apaga se vazio.
- **Postinstall falha graciosamente** (warning amarelo, exit 0) para não travar `npm install`.
- **Idioma:** os artefatos gerados pelos commands seguem `references/language-policy.md`
  (idioma da conversa, não fixo em pt-BR). A documentação do repo é pt-BR técnico.

## Testes / validação (não há framework)

Não existe suite automatizada. Valide manualmente com override de HOME por target
apontando para `/tmp`, sem tocar no `~` real:

```bash
node -c bin/ksdd.js                                   # syntax check
COPILOT_HOME=/tmp/t node bin/ksdd.js install --copilot --quiet
COPILOT_HOME=/tmp/t node bin/ksdd.js status
COPILOT_HOME=/tmp/t node bin/ksdd.js uninstall --quiet   # deve preservar arquivos não-ksdd
```
Análogos: `CODEX_HOME`, `OPENCODE_HOME`, `ANTIGRAVITY_HOME`.

## Fluxo KSDD (os commands, para contexto)

`start → spec → tech → design` (setup do projeto), depois `new:feature → build:feature`
ou `build:all`; `setup` faz reverse-engineering de projeto existente; `archive` move
features concluídas. Cada command para num **approval gate** — nunca encadeia sem
aprovação humana (`references/approval-gates.md`).
