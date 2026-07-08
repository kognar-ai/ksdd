---
id: 056
title: Criar references/update-check.md (procedimento canônico da checagem de update)
status: para implementar
feature: update-health-check
area: backend
priority: P0
estimate: M
depends_on: []
feature_refs:
  - ".ksdd/features/FEATURE-update-health-check.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-update-health-check.md#4-fluxos-de-uso"
  - ".ksdd/features/FEATURE-update-health-check.md#8-comportamento-e-mensagens-equivalente-ao-impacto-no-design"
spec_refs:
  - ".ksdd/specs/SPEC.md#41-manifest-de-instalação-ksdd-manifestjson"
  - ".ksdd/specs/SPEC.md#12-modelo-de-negócio-impacto-na-interface"
arch_refs:
  - ".ksdd/specs/architecture.md#5-integrações-externas"
---

# 056 — Criar `references/update-check.md`

## Objetivo
Escrever o procedimento canônico único que qualquer agente segue para checar se há versão nova do `@kognar/ksdd`. É o núcleo da feature — os 11 commands só vão referenciá-lo (task 057). Sem esse arquivo, a lógica ficaria duplicada em 11 lugares.

## Escopo
Criar `references/update-check.md` (Markdown lido pelo agente, mesmo estilo dos demais `references/*.md`) descrevendo, passo a passo e sem ambiguidade:

- **Condições de skip antecipado** (checar antes de qualquer rede):
  - Já executou a checagem antes **nesta conversa** → pular em silêncio.
  - `KSDD_SKIP_UPDATE_CHECK` setado (não vazio) → pular em silêncio.
- **Fonte da versão instalada:** ler `~/.claude/skills/ksdd/.ksdd-manifest.json` e extrair o campo `version`. Fallback: `npm ls -g @kognar/ksdd --depth=0`. Se nenhum resolver → pular em silêncio.
- **Fonte da versão remota (mecanismo — decisão da feature):** o **agente** obtém a última publicada. Primário universal: `npm view @kognar/ksdd version` (shell). Fallback: `web_fetch` em `https://registry.npmjs.org/@kognar/ksdd/latest` (campo `version`). Recomendar timeout curto. Se nenhum mecanismo disponível ou falha/timeout → pular em silêncio.
- **Comparação semver:** MAJOR.MINOR.PATCH numérico. Avisar **apenas** se remota > instalada. Igual ou remota < instalada (build local à frente) → silêncio.
- **Mensagem canônica** (FEATURE 8.1), discreta, sem emoji, tom do SPEC seção 3.2:
  ```
  KSDD: versão v{latest} disponível (instalada: v{current}).
  Atualize com: npm install -g @kognar/ksdd@latest
  ```
- **Não-bloqueante:** após avisar (ou pular), o agente **sempre** segue o fluxo do command que estava rodando. A checagem nunca é caminho crítico e nunca exige confirmação para prosseguir.
- **Uma vez por sessão:** deixar explícito que, uma vez executada nesta conversa, não deve repetir.

## Fora de escopo
- Wiring nos commands (task 057).
- Documentar a env var no SPEC/architecture/README/help (tasks 058, 059).
- Qualquer alteração em `bin/ksdd.js` (não há — a CLI permanece offline).
- Persistência de `lastUpdateCheckAt` / throttle diário (FEATURE seção 2.2 — fora da v1).

## Critérios de aceitação
- [ ] `references/update-check.md` existe e é auto-contido (um agente consegue executar só com ele em mãos).
- [ ] Cobre as duas condições de skip antecipado (já-checado-nesta-conversa + `KSDD_SKIP_UPDATE_CHECK`).
- [ ] Define versão instalada (manifest `version` + fallback `npm ls -g`) e remota (`npm view` primário + `web_fetch` fallback) com skip silencioso em qualquer falha.
- [ ] Regra de comparação semver documentada; avisa só quando remota > instalada.
- [ ] Mensagem canônica exatamente como FEATURE 8.1.
- [ ] Deixa claro: não-bloqueante, sem confirmação, 1x por sessão, silêncio em erro/offline/atualizado.

## Notas técnicas
- Este é um **reference de conteúdo** — será distribuído automaticamente aos 5 targets pelo `copyDir(references/...)` já presente em todas as `install*` (`bin/ksdd.js:168,205,235,283,367`). Mesmo padrão do `references/fix-template.md` (ADR-013): zero linha de instalador nova.
- A checagem é feita pelo **agente**, não pela CLI — preserva ADR-001/003 ("KSDD não faz chamada de rede em runtime"). Deixar isso explícito no cabeçalho do reference para não induzir alguém a mover a lógica para `bin/ksdd.js`.
- Tom/idioma seguem `references/language-policy.md`: o reference pode ser redigido em pt-BR (convenção do repo), mas a **mensagem ao usuário** deve sair no idioma da conversa.
- Alvos não-Claude (Codex/opencode/Antigravity/Copilot) leem o mesmo manifest em `~/.claude/skills/ksdd/` (sempre escrito por `installClaude`, que roda em toda instalação).

## Riscos / dependências externas
- Disponibilidade de `web_fetch` varia por agente; por isso `npm view` (shell, universal) é o primário. Cobrir no QA (task 060).
- Precisa ser inequívoco quanto ao "não-bloqueante" para nenhum agente transformar o aviso num gate — validar no dogfood (task 060).
