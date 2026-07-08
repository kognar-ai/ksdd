---
id: 059
title: Atualizar README/INSTALL/CHANGELOG + ksdd help + bump package.json para 0.12.0
status: para implementar
feature: update-health-check
area: backend
priority: P0
estimate: S
depends_on: [056, 057, 058]
feature_refs:
  - ".ksdd/features/FEATURE-update-health-check.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-update-health-check.md#10-critérios-de-aceite"
spec_refs:
  - ".ksdd/specs/SPEC.md#71-cli-binksddjs"
arch_refs:
  - ".ksdd/specs/architecture.md#42-variáveis-de-ambiente"
---

# 059 — Docs + CHANGELOG + bump de versão

## Objetivo
Fechar o release: documentar a feature nos arquivos voltados ao usuário e subir a versão. Sem isso, o aviso nunca acha "versão nova" (o registry precisa de um publish em 0.12.0) e o usuário não tem onde ler sobre o comportamento.

## Escopo
- **`package.json`**: bump `version` de `0.11.0` para `0.12.0` (minor — feature nova, retrocompatível).
- **`CHANGELOG.md`**: entrada `0.12.0` descrevendo o health check de update (agent-driven, 1x/sessão, não-bloqueante, opt-out `KSDD_SKIP_UPDATE_CHECK`, CLI segue offline).
- **`README.md`**: seção/nota curta sobre a checagem de update na primeira invocação + como desligar (`KSDD_SKIP_UPDATE_CHECK=1`). Deixar explícito que **não** é telemetria.
- **`INSTALL.md`**: mencionar o opt-out onde as demais env vars são listadas.
- **`ksdd help`** (`bin/ksdd.js`, `cmdHelp`): adicionar `KSDD_SKIP_UPDATE_CHECK=1` no bloco "Variáveis de ambiente" (linha só de texto/`log()` — **não** é lógica de rede; a CLI continua sem checar nada).

## Fora de escopo
- Lógica da checagem (tasks 056, 057).
- SPEC/architecture (task 058).
- Publicar no npm (fora do escopo do KSDD — decisão do mantenedor).

## Critérios de aceitação
- [ ] `package.json` em `0.12.0`.
- [ ] `CHANGELOG.md` tem entrada `0.12.0` cobrindo a feature e o opt-out.
- [ ] `README.md` explica a checagem + opt-out + "não é telemetria".
- [ ] `INSTALL.md` menciona `KSDD_SKIP_UPDATE_CHECK`.
- [ ] `ksdd help` lista `KSDD_SKIP_UPDATE_CHECK=1`; `node -c bin/ksdd.js` passa.
- [ ] Contagem de versão consistente entre `package.json`, CHANGELOG, SPEC (manifest exemplo) e README.

## Notas técnicas
- Precedente: task 052 (new-fix-command) e 042 (copilot) fizeram o mesmo pacote "docs + bump" como último passo antes do QA.
- A única mudança em `bin/ksdd.js` nesta feature é a **linha de texto** no `cmdHelp` — nenhuma lógica. Confirmar que não se introduziu chamada de rede na CLI (ADR-014).
- Conferir se o exemplo de manifest no SPEC seção 4.1 (`"version": "0.11.0"`) deve ir para `0.12.0` — alinhar com task 058 para não duplicar a edição.

## Riscos / dependências externas
- Publish no npm é externo; até publicar 0.12.0, a checagem em máquinas atualizadas não acha versão nova (esperado). Documentar no CHANGELOG que a feature entra em vigor a partir do publish.
