---
id: 033
title: Atualizar README + INSTALL + CHANGELOG + bump package.json para 0.9.0
status: para implementar
feature: antigravity-integration
area: design
priority: P0
estimate: M
depends_on: [028, 029, 030]
feature_refs:
  - ".ksdd/features/FEATURE-antigravity-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-antigravity-integration.md#10-critérios-de-aceite"
spec_refs:
  - ".ksdd/specs/SPEC.md#41-manifest-de-instalação-ksdd-manifestjson"
  - ".ksdd/specs/SPEC.md#71-cli-binksddjs"
arch_refs: []
---

# 033 — Docs do pacote + bump de versão

## Objetivo
Refletir o quarto target na documentação distribuída e bumpar a versão. É o que torna a feature descobrível pelos usuários e fecha o contrato de versão.

## Escopo
- **`README.md`:**
  - Tabela de targets passa a ter 4 colunas/linhas (Claude, Codex, opencode, Antigravity) com paths.
  - Quick start declara "Suporta Claude Code, OpenAI Codex, opencode e Google Antigravity".
  - Seção "Instalação seletiva" lista `--antigravity` e exemplo `KSDD_WITH_ANTIGRAVITY=1 npm install -g @kognar/ksdd`.
  - Link para Antigravity (https://antigravity.google).
- **`INSTALL.md`:** lista paths Antigravity (CLI `~/.gemini/antigravity-cli/skills/`, IDE `~/.gemini/antigravity/skills/`) e explica o bundle `~/.gemini/ksdd/`.
- **`CHANGELOG.md`:** seção dedicada v0.9.0 com data (01/06/2026), descrição da feature, link Antigravity, exemplos de uso.
- **`package.json`:** bump `version` para `0.9.0`.
- Verificar/atualizar a versão hardcoded do manifest em `bin/ksdd.js` (se existir constante de versão) para `0.9.0` — ou confirmar que lê de `package.json`.

## Fora de escopo
- Código de instalação (028/029); ADRs/SPEC (031/032); dogfood/QA (034).

## Critérios de aceitação
- [ ] `README.md` lista 4 agentes na tabela principal e no quick start, com paths corretos.
- [ ] `README.md` documenta `--antigravity` e `KSDD_WITH_ANTIGRAVITY` na seção de instalação seletiva.
- [ ] `INSTALL.md` documenta os paths CLI + IDE + bundle do Antigravity.
- [ ] `CHANGELOG.md` tem entrada v0.9.0 com data, descrição, link e exemplo.
- [ ] `package.json` em `0.9.0`.
- [ ] Versão do manifest gerado bate com `0.9.0` (constante em `bin/ksdd.js` ou lida de package.json).
- [ ] `node bin/ksdd.js status` mostra `0.9.0` após install.

## Notas técnicas
- Usar a entrada de CHANGELOG da v0.8.0 (opencode) como molde de formato/tom.
- Depende de 028/029/030 estarem prontos pra documentar paths/comportamento finais sem retrabalho.
- Confirmar como a versão flui pro manifest (lê de `package.json` vs constante) antes de bumpar — evitar divergência.

## Riscos / dependências externas
- Mantenedor confirmou bump minor (0.9.0) no checkpoint — sem pendência.
