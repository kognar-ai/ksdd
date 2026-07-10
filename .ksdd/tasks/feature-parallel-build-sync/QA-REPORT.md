# QA Report — feature parallel-build-sync (task 065)

**Data:** 2026-07-10
**Escopo:** validar os critérios de aceite do FEATURE spec (§10) e os riscos (§9.2), e a consistência `build:feature`↔`build:all`.
**Natureza da feature:** mudança de **conteúdo** (commands + reference Markdown), sem código (`bin/ksdd.js` intocado). A validação combina: (i) revisão de coerência dos diffs, (ii) smoke test do instalador, (iii) o dogfood desta sessão (DOGFOOD.md), (iv) garantia-por-prosa para caminhos que só um projeto consumidor real exercita.

Legenda de status: **✅ validado** (executado nesta sessão) · **🧪 smoke** (script com HOME de teste) · **📐 design-guaranteed** (garantido pela prosa do command/reference; ponteiro citado) · **🔜 campo** (requer run em projeto consumidor).

## Matriz de cenários

| # | Cenário | Status | Evidência / ponteiro |
|---|---------|--------|----------------------|
| A | Paralelo feliz — tasks independentes ⇒ ondas paralelas | ✅ | Wave B (2 teammates), Wave C (3 teammates) rodaram concorrentes (DOGFOOD.md); commits atômicos 056–065 |
| B | Fallback worktree negado ⇒ sequencial in-place + aviso | 📐 | `build:feature.md` §5.5 + `parallel-build.md` §4; mensagem amarela canônica presente. Neste sandbox os teammates rodaram in-place (partição por arquivo), o caminho seguro |
| C | Overlap de arquivos ⇒ sequencial mesmo com worktrees | 📐 | `parallel-build.md` §1.1 (definição de "independente" exige "sem overlap") + §4; anti-pattern documentado |
| D | `--multi-pr` ⇒ N PRs (1 por task) | 📐 | `build:feature.md` §9.2 + frontmatter `argument-hint`; `build:all.md` B.4/Argumentos |
| E | Task única ⇒ 1 PR daquela task | 📐 | `build:feature.md` §9.3 (semântica inalterada) |
| F | Sync com todos os docs derivados presentes | ✅ (parcial) | README/CHANGELOG/CLAUDE.md atualizados nesta feature; `build:feature.md` §8.5.1 |
| G | Sync sem docs derivados ⇒ pula com aviso | 📐 | `build:feature.md` §8.5.1 (mensagem "…não encontrado — pulando…") |
| H | Drift read-only ⇒ sinaliza sem editar; 0 escritas em SPEC/arch/DESIGN/FEATURE pela sync | ✅ | Sync final tocou só CLAUDE.md + tasks; SPEC/arch editados só via tasks 061/062 (deliberadas), DESIGN/FEATURE intocados; `build:feature.md` §8.5.2 + nota read-only |
| I | Checkpoint de sync pausa antes de comitar | 📐 | `build:feature.md` §8.5.3 ("checkpoint humano obrigatório") + `approval-gates.md` Gate 6 item 5 |
| J | `build:all` alinhado — 1 PR/feature + sync/feature + checkpoints por fase | ✅ (revisão) | `build:all.md` B.4/B.5/B.7 + §Paralelismo entre features; A.6/B.3/B.6/C.2 preservados (report do teammate 059) |
| K | Distribuição: `parallel-build.md` nos 5 targets; `bin/ksdd.js` diff vazio | 🧪 | Smoke test: 5/5 bundles; `git diff HEAD -- bin/ksdd.js` vazio; uninstall remove tudo e preserva arquivo não-ksdd |
| L | Consistência `build:feature`↔`build:all` (mesmo modelo, mesma nota read-only, mesma fonte) | ✅ (revisão) | Ambos referenciam `references/parallel-build.md`; terminologia idêntica (branch de build, ondas, teammate, worktree, sync pós-build, `--multi-pr`) |

## Mapeamento dos critérios de aceite (FEATURE §10)

- Despacho paralelo por onda → **A** ✅ · Worktree por teammate → **B/C** 📐 · Fallback seguro → **B/C** 📐 · Gates por task mantidos → `build:feature.md` §5.3/§6 📐
- 1 PR default / `--multi-pr` / task única → **D/E** 📐 · Fase de sync (docs derivados + drift + checkpoint) → **F/G/H/I** ✅/📐
- Nota read-only ajustada → **H** ✅ · `build:all` alinhado → **J** ✅ · Fonte única referenciada → **L** ✅
- Zero `bin/ksdd.js` / reference auto-bundlado → **K** 🧪 · Gates 6/7 → `approval-gates.md` 📐 · SPEC/architecture → 061/062 ✅ · README/CHANGELOG/0.12.0 → 063 🧪

## Riscos (FEATURE §9.2) — cobertura
- Conflito de merge entre teammates → mitigado (só paraleliza sem overlap + orquestrador comita sequencial): **C** 📐, exercido em A ✅.
- Worktree órfão → `parallel-build.md` §2.3 obriga `git worktree remove`: 📐.
- Sync editar demais → regra dura "só docs derivados" + checkpoint: **H/I** ✅/📐; 0 escritas indevidas nesta sessão.
- Divergência build:feature↔build:all → fonte única: **L** ✅.
- PR único grande → commits atômicos + `--multi-pr`: **D** 📐.

## Resultado
- **Sem bloqueadores.** Todos os critérios de aceite estão implementados no conteúdo e cobertos por ✅/🧪/📐.
- **Follow-up de campo (🔜):** um run real de `/ksdd:build:feature` num projeto consumidor com (a) worktrees literais disputando arquivos e (b) `gh`/PR real fecharia os cenários B e D com evidência de execução, além da garantia-por-prosa atual. Registrado como validação em campo, não como bug.
