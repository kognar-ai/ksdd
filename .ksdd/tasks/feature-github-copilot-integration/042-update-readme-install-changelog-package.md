---
id: 042
title: Atualizar README + INSTALL + CHANGELOG + bump package.json 0.10.0
status: em revisão
feature: github-copilot-integration
area: design
priority: P0
estimate: M
depends_on: [035, 038, 039]
feature_refs:
  - ".ksdd/features/FEATURE-github-copilot-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-github-copilot-integration.md#10-critérios-de-aceite"
spec_refs:
  - ".ksdd/specs/SPEC.md#71-cli-binksddjs"
arch_refs:
  - ".ksdd/specs/architecture.md#4-apis-e-endpoints"
---

# 042 — README + INSTALL + CHANGELOG + `package.json` 0.10.0

## Objetivo
Documentar o quinto target para o usuário final e bumpar a versão do pacote para 0.10.0 (nova capacidade backwards-compatible).

## Escopo
- **`README.md`:**
  - Tabela/lista principal de agentes suportados passa a incluir "GitHub Copilot" (5 agentes: Claude, Codex, opencode, Antigravity, Copilot).
  - Quick start / instalação seletiva lista `ksdd install --copilot` e `ksdd install --copilot --project`.
  - Exemplo `KSDD_WITH_COPILOT=1 npm install -g @kognar/ksdd`.
  - Tabela de paths por SO do Copilot (macOS/Linux/Windows) para os prompt files.
  - **Nota explícita:** o Copilot CLI ainda não consome comandos custom (link para copilot-cli#618/#1113); os prompt files funcionam no VS Code Copilot Chat.
- **`INSTALL.md`:**
  - Paths do Copilot por SO, explicação do bundle (`<vscode-user>/ksdd/`), do modo `--project` e do placeholder CLI.
  - Como usar `COPILOT_HOME` (Insiders/portátil).
- **`CHANGELOG.md`:**
  - Seção dedicada `0.10.0` com data (07/07/2026), descrição da feature, link para Copilot/prompt files e exemplo de uso.
- **`package.json`:**
  - `version` bump para `0.10.0`.
- Verificar que o texto de `ksdd help` (em `bin/ksdd.js`) já documenta `--copilot`/`--project`/`KSDD_WITH_COPILOT`/`COPILOT_HOME` (implementado nas tasks 035-037) — se não, sinalizar de volta pra essas tasks.

## Fora de escopo
- Código do instalador (tasks 035-038).
- `architecture.md` (task 040) e `SPEC.md` (task 041).
- Dogfood/QA (task 043).

## Critérios de aceitação
- [ ] README lista 5 agentes suportados na seção principal e no quick start.
- [ ] README tem a tabela de paths por SO e a nota sobre CLI vs VS Code Copilot Chat.
- [ ] INSTALL.md documenta paths por SO, bundle, `--project`, placeholder CLI e `COPILOT_HOME`.
- [ ] CHANGELOG tem seção `0.10.0` com data e exemplo.
- [ ] `package.json` em `0.10.0`.
- [ ] Nenhuma referência quebrada (links dos issues copilot-cli válidos).
- [ ] Consistência com o estilo das entradas de Antigravity (v0.9.0) no README/CHANGELOG.

## Notas técnicas
- Espelhar a estrutura de documentação usada quando Antigravity foi adicionado (v0.9.0).
- `depends_on: [035, 038, 039]` — documentar os paths/manifest reais exige que o instalador e o template já existam.

## Riscos / dependências externas
- Paths por SO documentados dependem da confirmação do dogfood (task 043) — se algum divergir, atualizar o README no fechamento da 043.
