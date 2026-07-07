---
id: 044
title: Dogfood — usar /ksdd:new:fix num bug real do repo (contagem de commands) e gerar o primeiro FIX doc
status: para implementar
feature: new-fix-command
area: qa
priority: P1
estimate: S
depends_on: [043]
feature_refs:
  - ".ksdd/features/FEATURE-new-fix-command.md#46-dogfooding-bug-real-no-repo-ksdd"
  - ".ksdd/features/FEATURE-new-fix-command.md#13-métricas-de-sucesso"
spec_refs:
  - ".ksdd/specs/SPEC.md#72-slash-commands-claude-code"
arch_refs: []
---

# 044 — Dogfood num bug real

## Objetivo
Validar o fluxo `/ksdd:new:fix` de ponta a ponta sobre um bug real do próprio repo KSDD, gerando o primeiro `.ksdd/fixes/FIX-*.md` como prova de conceito.

## Escopo
- Escolher um bug documental real e verificável do repo. Candidato principal: **contagem inconsistente de commands** — o SPEC diz "8 slash commands" (seções 1.2/7.2) e "9 commands" (seções Antigravity); após a feature são 11. (Se a task 042 já reconciliou o SPEC, escolher outro bug real — ex.: o path IDE do Antigravity marcado `[verificar]`, ou qualquer divergência doc↔código encontrada.)
- Rodar `/ksdd:new:fix` sobre o bug: investigação code-aware (localizar as ocorrências divergentes), gerar `FIX-[slug].md` com root cause + evidência `arquivo:linha` + ajuste proposto.
- Passar pelos dois checkpoints; gerar 1 task de fix (com critério de teste/verificação apropriado ao bug documental).
- Como é bug pequeno e documental, exercitar o caminho **inline** (aplicar o ajuste + verificação) OU handoff para `/ksdd:build:fix` — registrar o caminho no FIX doc.

## Fora de escopo
- QA sistemática de todos os modos (task 045).
- Corrigir bugs não relacionados descobertos no caminho (abrir FIX docs separados se necessário).

## Critérios de aceitação
- [ ] Existe `.ksdd/fixes/FIX-*.md` gerado pelo fluxo, com root cause + evidência concreta.
- [ ] O FIX doc passou pelos dois checkpoints (registro na conversa/PR).
- [ ] Pelo menos 1 task de fix gerada em `.ksdd/tasks/fix-*/` com numeração no espaço global (ID > 45).
- [ ] O bug escolhido é real e o ajuste proposto é verificável.
- [ ] Caminho de implementação (inline vs build:fix) registrado no FIX doc.

## Notas técnicas
- Este é o teste "de verdade" que a `archive-features` fez ao arquivar `ksdd-folder-layout` no próprio repo (task 018 daquela feature).
- Verificar a métrica da FEATURE 1.3: "FIX docs que citam evidência concreta (`arquivo:linha` + repro) = 100%".

## Riscos / dependências externas
- Se a task 042 corrigir a contagem antes, o dogfood precisa de outro bug real — manter uma lista curta de candidatos.
