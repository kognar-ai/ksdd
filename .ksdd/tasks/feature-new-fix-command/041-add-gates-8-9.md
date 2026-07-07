---
id: 041
title: Adicionar Gate 8 (new:fix) e Gate 9 (build:fix) em references/approval-gates.md
status: para implementar
feature: new-fix-command
area: backend
priority: P1
estimate: S
depends_on: [035, 037]
feature_refs:
  - ".ksdd/features/FEATURE-new-fix-command.md#52-superfícies-novas"
  - ".ksdd/features/FEATURE-new-fix-command.md#4-fluxos-de-uso"
spec_refs:
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs: []
---

# 041 — Gates 8 e 9 nos approval-gates

## Objetivo
Documentar os checkpoints dos novos commands em `references/approval-gates.md`: Gate 8 para `/ksdd:new:fix` (dois checkpoints internos: FIX doc e tasks) e Gate 9 para `/ksdd:build:fix` (checkpoints por task + gate de regressão).

## Escopo
- Adicionar **Gate 8 — Após `/ksdd:new:fix`** após o Gate 7, no formato dos gates existentes (Gate 5 é o modelo mais próximo — dois checkpoints internos):
  1. Checkpoint do FIX doc — após gerar `.ksdd/fixes/FIX-[slug].md`, antes de quebrar em tasks. Aprova root cause + ajuste proposto + blast radius.
  2. Checkpoint das tasks — após gerar `.ksdd/tasks/fix-[slug]/`, com os dois caminhos (inline pequeno / `build:fix`).
  - Pré-condição: `SPEC.md` recomendado; codebase acessível. Caso especial: bug não reproduzível → FIX "investigação incompleta" e parada (não avança para tasks).
- Adicionar **Gate 9 — Durante `/ksdd:build:fix`**, no modelo do Gate 6 (`build:feature`), com o delta:
  - Pre-flight (git limpo, slug arquivado), por-task, quality gates **incluindo o teste de regressão obrigatório (falha-antes/passa-depois)**, validação de critérios de verificação, PR aberto (label bug) sem merge.
- Se houver contagem/menção a "7 gates" ou similar no arquivo, reconciliar para 9.

## Fora de escopo
- Criar os commands (tasks 035, 037).
- SPEC/architecture/README (tasks 042, 043).

## Critérios de aceitação
- [ ] `references/approval-gates.md` tem seção "Gate 8 — Após `/ksdd:new:fix`" com os 2 checkpoints internos.
- [ ] `references/approval-gates.md` tem seção "Gate 9 — Durante `/ksdd:build:fix`" com o gate de regressão explícito.
- [ ] Formato consistente com os Gates 1–7 (pré-condição, como o command verifica, o que não conta como aprovação).
- [ ] Bug não reproduzível tratado como parada explícita no Gate 8.
- [ ] Contagem de gates reconciliada onde citada.

## Notas técnicas
- Gate 5 (`new:feature`) e Gate 6 (`build:feature`) são os modelos diretos — copiar estrutura e adaptar o conteúdo.
- Manter o tom "checkpoints obrigatórios, sem atalho" do arquivo.

## Riscos / dependências externas
- Nenhuma. Documentação de referência.
