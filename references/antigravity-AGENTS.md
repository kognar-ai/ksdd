# KSDD — Kognar Spec-Driven Design & Development (bundle para Google Antigravity / Gemini CLI)

KSDD é um fluxo spec-driven que vai do brainstorm até a implementação por tasks. Este bundle dá contexto canônico ao agente Antigravity (e ao gemini-cli) quando os slash commands `/ksdd:*` são invocados.

## Como os commands são registrados

Antigravity e gemini-cli leem slash commands do mesmo diretório: `~/.gemini/commands/<namespace>/<nome>.toml` (formato TOML nativo, com os campos `description` e `prompt`). O KSDD instala no namespace `ksdd`, com subdirs aninhados reproduzindo a invocação do Claude:

| Arquivo TOML | Invocação |
|---|---|
| `~/.gemini/commands/ksdd/start.toml` | `/ksdd:start` |
| `~/.gemini/commands/ksdd/spec.toml` | `/ksdd:spec` |
| `~/.gemini/commands/ksdd/tech.toml` | `/ksdd:tech` |
| `~/.gemini/commands/ksdd/design.toml` | `/ksdd:design` |
| `~/.gemini/commands/ksdd/new/feature.toml` | `/ksdd:new:feature` |
| `~/.gemini/commands/ksdd/build/feature.toml` | `/ksdd:build:feature` |
| `~/.gemini/commands/ksdd/build/all.toml` | `/ksdd:build:all` |
| `~/.gemini/commands/ksdd/setup.toml` | `/ksdd:setup` |
| `~/.gemini/commands/ksdd/archive.toml` | `/ksdd:archive` |

Cada `prompt` faz um include (`@$HOME/.gemini/ksdd/commands/ksdd-<nome>.md`) do corpo real do command, que vive neste bundle.

## Onde achar o quê

- `./commands/` — corpos dos slash commands (`ksdd-start.md`, `ksdd-new-feature.md`, …), incluídos pelos TOML.
- `./references/` — templates canônicos: `brainstorm-template.md`, `spec-template.md`, `architecture-template.md`, `design-md-spec.md`, `feature-template.md`, `build-plan-template.md`, `archive-template.md`, `language-policy.md`, `approval-gates.md`, `personas-guide.md`.
- `./agents/` — helpers de estilo: `interviewer.md` (perguntas em batch), `consolidator.md` (síntese), `critic.md` (revisão), `setup-analyst.md` (reverse-engineering em projetos existentes).

Quando um command citar um template, leia o arquivo correspondente em `$HOME/.gemini/ksdd/references/` antes de gerar o artefato. Os agentes não rodam como subprocessos — são guias de tom e checklist aplicados pelo próprio agente principal.

## Convenções obrigatórias

- **Approval gates:** `./references/approval-gates.md` lista os 7 gates do fluxo. Nenhum command encadeia para o próximo passo sem aprovação humana explícita — mesmo que o usuário diga "pula", o command pede confirmação.
- **Idioma:** `./references/language-policy.md` é a fonte. Commands seguem o idioma da conversa em curso; não assumir pt-BR por padrão.
- **Perguntas em batch:** máximo 3 perguntas estruturadas por rodada, complementadas com espaço para texto livre. Ver `./agents/interviewer.md`.

## Fluxo padrão

Projetos novos: `/ksdd:start` → `/ksdd:spec` → `/ksdd:tech` → `/ksdd:design`. Depois, por demanda: `/ksdd:new:feature`, `/ksdd:build:feature`, `/ksdd:build:all`. Projetos existentes começam por `/ksdd:setup` (reverse-engineering). Features concluídas são movidas com `/ksdd:archive`.

## Versão e atualização

A versão deste bundle corresponde à do `package.json` do pacote `@kognar/ksdd` que o instalou. Atualizar via `npm install -g @kognar/ksdd@latest` e re-rodar `ksdd install --antigravity` para sobrescrever os arquivos em `~/.gemini/commands/ksdd/` e `~/.gemini/ksdd/`.

_Arquivo gerado a partir de `references/antigravity-AGENTS.md` do pacote @kognar/ksdd. Editar upstream._
