---
description: 'KSDD — fluxo spec-driven (brainstorm → SPEC → arquitetura → design → build por tasks). Contexto canônico para os comandos /ksdd-* no GitHub Copilot.'
---

# KSDD — Kognar Spec-Driven Design & Development (bundle para GitHub Copilot)

KSDD é um fluxo spec-driven que vai do brainstorm até a implementação por tasks. Este bundle existe para dar contexto canônico ao GitHub Copilot quando os prompt files `ksdd-*.prompt.md` (instalados no perfil do VS Code, em `.github/prompts/` do projeto com `--project`, ou em `~/.copilot/prompts/`) são invocados como `/ksdd-start`, `/ksdd-spec`, etc. — os comandos referenciam templates e agentes deste diretório como fonte da verdade para tom, estrutura e checklists.

Este mesmo arquivo é distribuído como `ksdd.chatmode.md` (chat mode do Copilot) e como `AGENTS.md` do bundle `ksdd/`.

## Onde achar o quê

- `./references/` — templates canônicos: `brainstorm-template.md`, `spec-template.md`, `architecture-template.md`, `design-md-spec.md`, `feature-template.md`, `build-plan-template.md`, `archive-template.md`, `language-policy.md`, `approval-gates.md`, `personas-guide.md`.
- `./agents/` — helpers de estilo: `interviewer.md` (perguntas em batch), `consolidator.md` (síntese), `critic.md` (revisão), `setup-analyst.md` (reverse-engineering em projetos existentes).

Quando um comando citar um template, leia o arquivo correspondente antes de gerar o artefato. Os agentes não rodam como subprocessos — são guias de tom e checklist aplicados pelo próprio Copilot.

## Convenções obrigatórias

- **Approval gates:** `./references/approval-gates.md` lista os 7 gates do fluxo. Nenhum comando encadeia para o próximo passo sem aprovação humana explícita.
- **Idioma:** `./references/language-policy.md` é a fonte. Comandos seguem o idioma da conversa em curso; não assumir pt-BR por padrão.
- **Perguntas em batch:** máximo 3 perguntas estruturadas por rodada, complementadas com espaço para texto livre. Ver `./agents/interviewer.md`.

## Fluxo padrão

Projetos novos: `ksdd-start` → `ksdd-spec` → `ksdd-tech` → `ksdd-design`. Depois, por demanda: `ksdd-new-feature`, `ksdd-build-feature`, `ksdd-build-all`. Projetos existentes começam por `ksdd-setup` (reverse-engineering). Features concluídas são movidas com `ksdd-archive`.

## Versão e atualização

A versão deste bundle corresponde à do `package.json` do pacote `@kognar/ksdd` que o instalou (preferir essa referência a hardcode). Atualizar via `npm install -g @kognar/ksdd@latest` e re-rodar `ksdd install --copilot` para sobrescrever os arquivos.

_Arquivo gerado a partir de `references/copilot-AGENTS.md` do pacote @kognar/ksdd. Editar upstream._
