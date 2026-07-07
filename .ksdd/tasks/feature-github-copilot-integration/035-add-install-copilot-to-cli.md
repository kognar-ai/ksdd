---
id: 035
title: Adicionar installCopilot() + resolveVscodeUserDir() + flag --copilot + env vars em bin/ksdd.js
status: para implementar
feature: github-copilot-integration
area: backend
priority: P0
estimate: L
depends_on: [039]
feature_refs:
  - ".ksdd/features/FEATURE-github-copilot-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-github-copilot-integration.md#4-fluxos-de-uso"
  - ".ksdd/features/FEATURE-github-copilot-integration.md#72-endpoints-modificados"
spec_refs:
  - ".ksdd/specs/SPEC.md#71-cli-binksddjs"
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs:
  - ".ksdd/specs/architecture.md#4-apis-e-endpoints"
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
---

# 035 — Adicionar `installCopilot()` ao CLI (núcleo: prompt files user-profile)

## Objetivo
Implementar `installCopilot(tracked, out)` e `resolveVscodeUserDir()` em `bin/ksdd.js` e habilitar a invocação via flag `--copilot`, env `KSDD_WITH_COPILOT=1` e env `COPILOT_HOME`. É o núcleo da feature — distribui os 9 commands como `ksdd-*.prompt.md` no diretório de perfil global do VS Code (resolvido por SO) e bundla references/agents.

## Escopo
- Adicionar `installCopilot(tracked, out)` em `bin/ksdd.js`, escrita como **cópia adaptada** de `installAntigravity` (decisão registrada em ADR-012, task 040).
- Adicionar helper `resolveVscodeUserDir()`:
  - `process.env.COPILOT_HOME` se definido (aponta para `<...>/Code/User`); senão path OS-específico:
    - macOS: `path.join(os.homedir(), 'Library', 'Application Support', 'Code', 'User')`
    - Linux: `path.join(os.homedir(), '.config', 'Code', 'User')`
    - Windows: `path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Code', 'User')`
  - Nunca usar `~` literal; sempre `os.homedir()`/`path.join`.
- Layout instalado (núcleo — FEATURE seção 2.1):
  - **Prompt files** — para cada arquivo em `commands/*.md`, copia para `<userDir>/prompts/` como `ksdd-<basename>.prompt.md`.
  - **Bundle único** em `<userDir>/ksdd/`:
    - `references/` (`copyDir`) + `agents/` (`copyDir`)
    - `README.md` e `INSTALL.md` (`copyFile` do root do pacote)
    - `AGENTS.md` — copiado de `references/copilot-AGENTS.md` (criado na task 039)
- **Naming**: reusar `agentPromptBasename(file)` (`:` → `-`, prefixo `ksdd-`) e anexar o sufixo `.prompt.md` (helper fino `copilotPromptBasename()` ou adaptação inline — o resultado deve ser `ksdd-start.prompt.md`, `ksdd-new-feature.prompt.md`, etc.).
- Estender `parseArgs(argv)` para reconhecer `--copilot` como flag booleana.
- Estender `main()` para disparar `installCopilot()` quando `args.copilot === true` OU postinstall + `process.env.KSDD_WITH_COPILOT === '1'`.
- Combinabilidade: `ksdd install --codex --opencode --antigravity --copilot` instala os 5 targets na ordem `installClaude → installCodex → installOpencode → installAntigravity → installCopilot`.
- Cada path absoluto copiado (prompt files + bundle) é adicionado ao array `tracked`.
- Mensagens verde/amarelo/vermelho seguindo helpers ANSI existentes (`green`, `yellow`, `red`, `dim`, `bold`); saída final lista os targets aplicáveis incluindo "GitHub Copilot".
- Idempotência: 2x em sequência produz o mesmo estado, sem duplicação.

## Fora de escopo
- Chat mode (`ksdd.chatmode.md`) e placeholder Copilot CLI (task 036).
- Modo project-scoped `--project` (task 037).
- Estender `normalizeManifest()`, `uninstall()`, `status()`, `pruneEmptyDirs` para `targets.copilot` (task 038).
- Criar `references/copilot-AGENTS.md` (task 039).
- Documentação README/INSTALL/CHANGELOG/package.json (task 042).
- Atualizações em `architecture.md` e `SPEC.md` (tasks 040, 041).
- Dogfood + QA cross-platform (task 043).

## Critérios de aceitação
- [ ] `resolveVscodeUserDir()` retorna o path correto por SO e respeita `COPILOT_HOME` (testar via `process.platform` mockado ou por SO real no QA).
- [ ] Função `installCopilot(tracked, out)` existe em `bin/ksdd.js` e é chamada por `main()`.
- [ ] `parseArgs` reconhece `--copilot` como flag booleana sem quebrar parsing existente.
- [ ] `main()` dispara `installCopilot()` quando `args.copilot === true` ou postinstall + `KSDD_WITH_COPILOT=1`.
- [ ] Após `ksdd install --copilot`: existem 9 arquivos `ksdd-*.prompt.md` em `<userDir>/prompts/` (start, spec, tech, design, new-feature, build-feature, build-all, setup, archive).
- [ ] Após `ksdd install --copilot`: existe `<userDir>/ksdd/{references/, agents/, README.md, INSTALL.md, AGENTS.md}` populado.
- [ ] `ksdd install --codex --opencode --antigravity --copilot` instala os 5 targets sem erro, na ordem correta.
- [ ] Re-rodar `ksdd install --copilot` é idempotente — sem arquivo duplicado, sem erro.
- [ ] `COPILOT_HOME=/tmp/fake-vscode ksdd install --copilot` instala sob `/tmp/fake-vscode/{prompts,ksdd}` (override respeitado).
- [ ] Cada path absoluto copiado (prompt files + bundle) é adicionado ao array `tracked`.
- [ ] Saída final em verde lista os targets aplicáveis: "✓ KSDD instalado em Claude Code, ..., e GitHub Copilot (N arquivos)."
- [ ] Falha (ex: permission denied) em postinstall → warning amarelo + exit 0; em modo manual → erro vermelho + exit 1.
- [ ] Validar localmente: `COPILOT_HOME=/tmp/fake node bin/ksdd.js install --copilot` funciona neste repo (smoke por SO delegado à task 043).

## Notas técnicas
- Reusar `agentPromptBasename(file)` já presente em `bin/ksdd.js` (generalizado na feature opencode). Só o sufixo muda: Copilot exige `.prompt.md` (não `.md` puro). Cuidado: `agentPromptBasename` provavelmente já retorna `ksdd-start.md` — trocar `.md` final por `.prompt.md`.
- A cópia de `AGENTS.md` depende de `references/copilot-AGENTS.md` (task 039). Por isso `depends_on: [039]` — mergear 039 antes.
- `installClaude()` continua sendo chamado **sempre** (paridade — os demais targets são opt-in adicional).
- Não alterar `installCodex()`/`installOpencode()`/`installAntigravity()` — duplicação aceita sob ADR-012.
- Path por SO é a **principal novidade** vs targets anteriores (que usavam diretório global fixo). Isolar em `resolveVscodeUserDir()` para testabilidade.

## Riscos / dependências externas
- Task 039 (`references/copilot-AGENTS.md`) precisa estar mergeada antes para o `copyFile` do bundle não falhar.
- Path de perfil por SO (macOS/Windows/Insiders) marcado `[verificar]` — confirmado na task 043 (dogfood). Se divergir, ajustar `resolveVscodeUserDir()`; `COPILOT_HOME` é o override.
- Windows: `%APPDATA%\Code\User` e separadores podem divergir — `[verificar]` no QA (task 043).
