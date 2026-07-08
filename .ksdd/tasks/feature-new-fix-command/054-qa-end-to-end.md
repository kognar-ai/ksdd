---
id: 054
title: QA end-to-end — matriz de cenários (new:fix, build:fix, 5 targets, edge cases)
status: em revisão
feature: new-fix-command
area: qa
priority: P0
estimate: M
depends_on: [053]
feature_refs:
  - ".ksdd/features/FEATURE-new-fix-command.md#10-critérios-de-aceite"
  - ".ksdd/features/FEATURE-new-fix-command.md#4-fluxos-de-uso"
  - ".ksdd/features/FEATURE-new-fix-command.md#92-riscos"
spec_refs:
  - ".ksdd/specs/SPEC.md#71-cli-binksddjs"
arch_refs:
  - ".ksdd/specs/architecture.md#9-estratégia-de-testes"
---

# 054 — QA end-to-end

## Objetivo
Validar toda a feature (2 commands + template + wiring + integrações) contra os critérios de aceite, cobrindo modos, edge cases e instalação nos 5 targets. Produzir um QA-REPORT.md como os das features anteriores.

## Escopo — matriz de cenários
- **A. new:fix por descrição** — investiga, gera FIX doc com root cause + evidência, para no Checkpoint 1.
- **B. new:fix por `#issue`** — lê issue via `gh` (se disponível) / fallback colado.
- **C. new:fix por teste** — ancora a investigação num teste que reproduz.
- **D. Checkpoints** — não quebra em tasks sem aprovar o FIX doc; não implementa sem aprovar tasks.
- **E. Quebra em tasks** — `.ksdd/tasks/fix-[slug]/` + README; numeração no espaço global (não colide com feature tasks); task de regressão presente.
- **F. Fix inline aceito** — bug pequeno: patch + teste de regressão em branch, sem commit/merge, diff mostrado.
- **G. Fix inline recusado** — bug que cresce além de "pequeno": recusa e recomenda `build:fix`.
- **H. Bug não reproduzível** — FIX "investigação incompleta", parada pedindo dados; sem ajuste chutado.
- **I. build:fix repro-first** — reproduz antes de corrigir; para se não reproduz.
- **J. build:fix gate de regressão** — bloqueia PR sem teste falha-antes/passa-depois; exceção documentada não silencia o gate.
- **K. build:fix PR** — label `bug`/`fix`, corpo com root cause + evidência; sem merge.
- **L. Instalação 5 targets** — `install`/`install --codex --opencode --antigravity --copilot` copiam `ksdd:new:fix`/`ksdd:build:fix` (e basenames `ksdd-*`) + `fix-template.md`; `status` conta; `uninstall` limpa; idempotência.
- **M. Integrações** — `new:feature` numera considerando `fix-*`; `build:feature` redireciona slug de fix; `build:all` não enfileira fix tasks.
- **N. Edge/colisão** — slug de fix colidindo com fix existente e com slug arquivado; slug inválido.
- **O. Idioma** — FIX doc e mensagens seguem `references/language-policy.md` (não assume pt-BR).

## Fora de escopo
- Correção de bugs de produto encontrados fora do escopo — abrir FIX docs próprios.
- Publicação no npm (`npm publish`) — decisão do mantenedor pós-QA.

## Critérios de aceitação
- [ ] Todos os cenários A–O executados com resultado registrado (pass/fail + evidência).
- [ ] Todos os itens da FEATURE seção 10 (Critérios de Aceite) verificados.
- [ ] Smoke de install/uninstall nos 5 targets com tmpdir (`*_HOME` override) sem sujar o home real.
- [ ] `QA-REPORT.md` criado em `.ksdd/tasks/feature-new-fix-command/` com o resumo (modelo das features `archive-features`/`antigravity-integration`).
- [ ] Nenhum critério bloqueante em aberto antes de recomendar release.

## Notas técnicas
- Modelo: `QA-REPORT.md` das features `archive-features` e `antigravity-integration`.
- Para os cenários de `build:fix`, usar um projeto-alvo de teste com um bug plantado + um teste que o reproduz (fixture), para exercitar o gate de regressão de verdade.
- Validar a estratégia de testes do repo (architecture seção 9 — hoje sem suite automatizada; o QA é majoritariamente manual/smoke).

## Riscos / dependências externas
- `gh` pode não estar disponível no ambiente de QA — cobrir o fallback (cenário B) explicitamente.
- Última task da feature; depende do dogfood (053) e de todo o resto mergeado.
