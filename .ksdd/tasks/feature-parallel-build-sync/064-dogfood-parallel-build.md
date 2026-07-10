---
id: 064
title: Dogfood — rodar o novo build:feature numa feature/task real do repo
status: para implementar
feature: parallel-build-sync
area: qa
priority: P1
estimate: M
depends_on: [063]
feature_refs:
  - ".ksdd/features/FEATURE-parallel-build-sync.md#41-build-completo-paralelo-com-pr-único-fluxo-principal"
  - ".ksdd/features/FEATURE-parallel-build-sync.md#43-fase-de-sincronização-de-docs-pós-build"
  - ".ksdd/features/FEATURE-parallel-build-sync.md#13-métricas-de-sucesso"
spec_refs:
  - ".ksdd/specs/SPEC.md#133-implementação-de-feature-isolada"
arch_refs:
  - ".ksdd/specs/architecture.md#44-superfície-de-slash-commands-distribuída"
---

# 064 — Dogfood do novo fluxo

## Objetivo
Provar o novo `build:feature` ponta-a-ponta num alvo real do próprio repo KSDD (ou num repo de teste controlado): despacho paralelo em worktrees (quando o ambiente permite), integração numa branch de build, PR único, e a fase de sync pós-build atualizando docs derivados sem tocar os read-only.

## Escopo
- Escolher um conjunto pequeno de tasks independentes (reais ou fixtures) e rodar `/ksdd:build:feature [slug]`:
  - Confirmar **ondas paralelas** (múltiplos teammates numa mensagem) quando as tasks são independentes.
  - Confirmar **worktrees** criados/removidos (ou o **fallback sequencial** com aviso amarelo se o ambiente negar).
  - Confirmar **1 PR único** ao final; depois repetir com `--multi-pr` e confirmar N PRs.
  - Confirmar a **fase de sync**: `README.md`/`CLAUDE.md`/`CHANGELOG` atualizados quando existem; `status`/README de tasks atualizados; **drift sinalizado** para SPEC/architecture sem edição.
- Registrar observações num `DOGFOOD.md` (ou seção do QA report): tempo aproximado vs sequencial, nº de PRs, docs tocados, drift sinalizado.

## Fora de escopo
- QA exaustivo de todos os cenários/targets — task 065.
- Corrigir bugs encontrados fora do escopo desta feature (registrar como follow-up).

## Critérios de aceitação
- [ ] Build completo executado com paralelismo real (ou fallback documentado com o motivo).
- [ ] Worktrees criados e removidos (sem worktree órfão) — ou fallback in-place comprovado.
- [ ] 1 PR único no default; N PRs com `--multi-pr`.
- [ ] Sync pós-build atualizou docs derivados existentes e sinalizou drift dos read-only **sem editá-los**.
- [ ] Observações registradas (métrica de tempo, nº PRs, docs tocados, drift).

## Notas técnicas
- Se o sandbox negar `git worktree`, o resultado esperado é o **fallback sequencial** — isso conta como cenário válido, não como falha (documentar).
- Não deixar branches/worktrees de teste residuais no repo.

## Riscos / dependências externas
- Depende de 063 (release cortada) e portanto de todo o conteúdo (056-062).
- Ambiente pode não suportar worktrees — coberto pelo fallback (é um caminho a validar, não um bloqueio).
