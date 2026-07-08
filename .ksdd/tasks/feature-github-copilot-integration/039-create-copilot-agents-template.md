---
id: 039
title: Criar references/copilot-AGENTS.md (template + base da chat mode)
status: em revisão
feature: github-copilot-integration
area: data-model
priority: P0
estimate: S
depends_on: []
feature_refs:
  - ".ksdd/features/FEATURE-github-copilot-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-github-copilot-integration.md#telas-novas"
spec_refs:
  - ".ksdd/specs/SPEC.md#76-skill-instalada-claudeskillsksdd-agentsskillsksdd-e-bundle-configopencodeksdd"
arch_refs:
  - ".ksdd/specs/architecture.md#3-modelo-de-dados-schemas"
---

# 039 — Criar `references/copilot-AGENTS.md`

## Objetivo
Criar o template `references/copilot-AGENTS.md` que dá contexto canônico ao GitHub Copilot: serve tanto para o `AGENTS.md` do bundle (`<vscode-user>/ksdd/AGENTS.md`) quanto como base do `ksdd.chatmode.md` (chat mode). Destrava as tasks 035/036 (o instalador copia esse arquivo).

## Escopo
- Criar `references/copilot-AGENTS.md` (~30-40 linhas), espelhando `references/opencode-AGENTS.md` e `references/antigravity-AGENTS.md` em conteúdo/tom, adaptado ao Copilot.
- Frontmatter compatível com chat mode do VS Code Copilot (`description`, e opcionalmente `tools`) — a task 036 deriva o `ksdd.chatmode.md` desse arquivo. Se o mesmo arquivo servir aos dois usos (bundle `AGENTS.md` sem frontmatter + chat mode com frontmatter), documentar como a task 036 transforma um no outro.
- Conteúdo obrigatório:
  - "Onde achar o quê": `./references/` (templates canônicos) e `./agents/` (helpers de estilo), relativos ao bundle `<vscode-user>/ksdd/`.
  - Que os prompt files `ksdd-*.prompt.md` esperam esse contexto canônico.
  - Convenções obrigatórias: approval gates (`./references/approval-gates.md`), idioma (`./references/language-policy.md`), perguntas em batch (máx 3).
  - Fluxo padrão: `ksdd-start` → `ksdd-spec` → `ksdd-tech` → `ksdd-design`; por demanda `ksdd-new-feature`/`ksdd-build-feature`/`ksdd-build-all`; existentes por `ksdd-setup`; arquivar com `ksdd-archive`.
  - Rodapé: "gerado a partir de `references/copilot-AGENTS.md` do pacote @kognar/ksdd. Editar upstream."
- Referência à invocação Copilot: os comandos aparecem como `/ksdd-start`, `/ksdd-spec`, etc. no Copilot Chat.

## Fora de escopo
- Lógica de instalação/cópia (tasks 035/036).
- Geração do `ksdd.chatmode.md` em si — task 036 usa este arquivo como fonte.
- Metadados ricos por prompt file (fora da v1 — FEATURE seção 2.2).

## Critérios de aceitação
- [ ] `references/copilot-AGENTS.md` existe com 30-40 linhas úteis.
- [ ] Menciona `./references/`, `./agents/`, approval gates, language-policy e perguntas em batch.
- [ ] Lista o fluxo padrão dos 9 commands com os nomes `ksdd-*`.
- [ ] Tom e estrutura consistentes com `opencode-AGENTS.md` / `antigravity-AGENTS.md` (verificar lado a lado).
- [ ] Frontmatter válido para uso como chat mode (`description` presente), documentando como a task 036 o consome.
- [ ] Sem hardcode de versão (referencia `package.json` do pacote).

## Notas técnicas
- Copiar `references/antigravity-AGENTS.md` como ponto de partida e adaptar terminologia (Antigravity/skills → Copilot/prompt files, `~/.gemini/` → `<vscode-user>/`).
- É um arquivo estático no pacote; nenhuma lógica. A única sutileza é o frontmatter de chat mode — manter mínimo (`description`) para não acoplar a um formato que pode evoluir.

## Riscos / dependências externas
- Formato exato de frontmatter de chat mode do Copilot pode evoluir — manter mínimo e confirmar no dogfood (task 043).
