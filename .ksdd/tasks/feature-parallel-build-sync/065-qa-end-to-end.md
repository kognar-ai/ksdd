---
id: 065
title: QA end-to-end — paralelo, fallback, PR único vs --multi-pr, sync, drift, read-only, consistência
status: em revisão
feature: parallel-build-sync
area: qa
priority: P0
estimate: M
depends_on: [064]
feature_refs:
  - ".ksdd/features/FEATURE-parallel-build-sync.md#10-critérios-de-aceite"
  - ".ksdd/features/FEATURE-parallel-build-sync.md#92-riscos"
spec_refs:
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs:
  - ".ksdd/specs/architecture.md#11-riscos-técnicos"
---

# 065 — QA end-to-end

## Objetivo
Validar sistematicamente todos os caminhos e edge cases da feature, garantindo que os critérios de aceite do FEATURE spec (§10) e os riscos (§9.2) estão cobertos, e que `build:feature` e `build:all` estão consistentes.

## Escopo
Executar e registrar num `QA-REPORT.md` os cenários:

- **A. Paralelo feliz:** tasks independentes → ondas paralelas + worktrees + 1 PR único + sync.
- **B. Fallback worktree negado:** ambiente sem worktree → sequencial in-place + aviso amarelo; resto do fluxo intacto.
- **C. Overlap de arquivos:** duas tasks tocam o mesmo arquivo → sequencial (sem conflito) mesmo com worktrees disponíveis.
- **D. `--multi-pr`:** build completo → N PRs (1 por task) em vez de 1.
- **E. Task única:** ID isolado → 1 PR daquela task (semântica inalterada).
- **F. Sync com todos os docs:** `README.md`+`CLAUDE.md`+`CHANGELOG` presentes → todos atualizados; status/README de tasks atualizados.
- **G. Sync sem docs derivados:** nenhum presente → pula docs graciosamente, ainda atualiza status/README de tasks.
- **H. Drift read-only:** implementação diverge do SPEC/architecture → **sinaliza** sem editar; confirmar 0 escritas em SPEC/architecture/DESIGN/FEATURE.
- **I. Checkpoint de sync:** confirma que a sync pausa para aprovação antes de comitar.
- **J. `build:all` alinhado:** feature buildada via `build:all` → 1 PR por feature + sync por feature + checkpoints por fase preservados.
- **K. Distribuição:** `references/parallel-build.md` bundlado nos 5 targets (HOME de teste); `bin/ksdd.js` inalterado (`git diff` vazio no arquivo).
- **L. Consistência:** `build:feature` e `build:all` não se contradizem (mesmo modelo, mesma nota read-only, mesma fonte `parallel-build.md`).

## Fora de escopo
- Reexecutar o dogfood (task 064) — aqui é a matriz completa.
- Novas funcionalidades — só validação.

## Critérios de aceitação
- [ ] Cenários A-L executados e registrados em `QA-REPORT.md` com resultado (pass/fail + evidência).
- [ ] 0 escritas automáticas em SPEC/architecture/DESIGN/FEATURE em todos os cenários (H confirma).
- [ ] `git diff` de `bin/ksdd.js` vazio (K confirma) e reference distribuído nos 5 targets.
- [ ] `build:feature` ↔ `build:all` consistentes (L).
- [ ] Todos os critérios de aceite do FEATURE §10 mapeados para ao menos um cenário.
- [ ] Bugs encontrados: corrigidos dentro do escopo ou registrados como follow-up com severidade.

## Notas técnicas
- Usar overrides de HOME por target apontando para `/tmp` (CLAUDE.md) — não tocar o `~` real.
- Cenários B e C são os mais importantes (validam o fallback seguro, que é a decisão de produto central).

## Riscos / dependências externas
- Depende de 064 (dogfood) e de toda a feature.
- Ambiente de QA pode não reproduzir worktrees — cenário A pode virar B; documentar e cobrir A em ambiente que suporte, se possível.
