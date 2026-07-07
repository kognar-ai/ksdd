---
id: 043
title: Dogfood + QA smoke test cross-platform + confirmar paths por SO + QA-REPORT.md
status: em revisão
feature: github-copilot-integration
area: qa
priority: P0
estimate: M
depends_on: [035, 036, 037, 038, 039, 040, 041, 042]
feature_refs:
  - ".ksdd/features/FEATURE-github-copilot-integration.md#10-critérios-de-aceite"
  - ".ksdd/features/FEATURE-github-copilot-integration.md#9-dependências-e-riscos"
spec_refs:
  - ".ksdd/specs/SPEC.md#71-cli-binksddjs"
arch_refs:
  - ".ksdd/specs/architecture.md#9-estratégia-de-testes"
---

# 043 — Dogfood + QA cross-platform

## Objetivo
Validar a feature ponta-a-ponta em ambiente real: confirmar os paths de perfil VS Code por SO, rodar install/uninstall/status nos 5 targets, e smoke-testar `/ksdd-start` no Copilot Chat. Produzir `QA-REPORT.md`.

## Escopo
- **Confirmar `resolveVscodeUserDir()` por SO** (macOS, Linux; Windows `[verificar]`): o path resolvido bate com o diretório real do VS Code (`Code/User`). Testar `COPILOT_HOME` override e VS Code Insiders.
- **Cenários automatizáveis** (script ou manual em `tmpdir`/`COPILOT_HOME` fake):
  1. `ksdd install --copilot` → 9 `ksdd-*.prompt.md` + chat mode + bundle presentes.
  2. `ksdd install --copilot --project` → `.github/prompts/` + `.github/chatmodes/` populados; global intocado.
  3. `ksdd install --codex --opencode --antigravity --copilot` → 5 targets no manifest.
  4. `KSDD_WITH_COPILOT=1 npm install -g .` (postinstall) → warning amarelo em falha, exit 0.
  5. `ksdd install` (sem flags) preserva prompt files Copilot existentes.
  6. `ksdd status` mostra a linha `copilot`.
  7. `ksdd uninstall` remove só os `ksdd-*`, preserva prompt files de terceiros e config do VS Code.
  8. `pruneEmptyDirs` não sobe além dos subdirs KSDD (verificar que `<userDir>/` e `.github/` sobrevivem).
  9. Reinstalação idempotente (2x) → manifest igual.
  10. `COPILOT_HOME=/tmp/fake ksdd install --copilot` respeita o override.
  11. `~/.copilot/prompts/` placeholder criado e rastreado.
- **Smoke test real (gate manual):** com VS Code + Copilot instalados, rodar `ksdd install --copilot`, abrir o Copilot Chat, invocar `/ksdd-start` num projeto-teste e confirmar fluxo de perguntas + geração de `brainstorm.md` equivalente a Claude/opencode (≥ 1 command de geração). Idem `/ksdd-spec`.
- **`QA-REPORT.md`** na pasta da feature: matriz de cenários × SO com verde/amarelo/vermelho, gates manuais pendentes antes de `npm publish`, e confirmação (ou ajuste) dos paths por SO.

## Fora de escopo
- Implementação de qualquer código de produto (tasks 035-042) — esta task só valida e reporta; correções voltam pras tasks de origem.
- Ativação do Copilot CLI (upstream não suporta).

## Critérios de aceitação
- [ ] Paths por SO confirmados em macOS e Linux (Windows validado ou marcado `[verificar]` com justificativa).
- [ ] Cenários 1-11 verdes em pelo menos um SO (macOS ou Linux), documentados.
- [ ] Uninstall preserva prompt files não-KSDD e config do VS Code (verificado explicitamente).
- [ ] `/ksdd-start` roda no Copilot Chat real e gera `brainstorm.md` (smoke test) — ou o gate fica registrado como pendente com o motivo.
- [ ] `QA-REPORT.md` criado com a matriz de cenários e os gates manuais pendentes.
- [ ] Qualquer divergência de path por SO reportada e corrigida (na 035) ou documentada como limitação conhecida.

## Notas técnicas
- Espelhar o `QA-REPORT.md` da feature Antigravity (mesma estrutura de matriz).
- O gate real (`/ksdd-start` no Copilot) pode exigir ambiente com licença Copilot — se indisponível no CI, registrar como gate manual pré-publish.

## Riscos / dependências externas
- Requer ambiente com VS Code + Copilot para o smoke test real (pode não estar disponível no CI).
- Windows pode não ser validável no ambiente do mantenedor — marcar `[verificar]` explicitamente se for o caso.
