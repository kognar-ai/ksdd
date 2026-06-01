# Tasks — Feature: Integração com Google Antigravity

**Feature:** [.ksdd/features/FEATURE-antigravity-integration.md](../../features/FEATURE-antigravity-integration.md)
**Total:** 7 tasks
**Prioridade:** P0: 7 · P1: 0 · P2: 0
**Estimativa total:** ~9-11 dias (S=4, M=3)

| ID  | Título                                                                            | Área       | Prioridade | Estimativa | Status           | Depende de        |
|-----|-----------------------------------------------------------------------------------|------------|------------|------------|------------------|-------------------|
| 028 | Adicionar `installAntigravity()` + flag `--antigravity` + env vars em `bin/ksdd.js` | backend    | P0         | M          | em revisão       | 030 · #17         |
| 029 | Estender `normalizeManifest`/`uninstall`/`status`/`pruneEmptyDirs` p/ antigravity | backend    | P0         | S          | em revisão       | 028 · #18         |
| 030 | Criar `references/antigravity-AGENTS.md` (template bundlado)                       | data-model | P0         | S          | em revisão       | — · #19           |
| 031 | `architecture.md` — ADR-011 + atualizar ADR-010 + diagrama + roadmap + riscos     | design     | P0         | S          | em revisão       | — · #20           |
| 032 | `SPEC.md` — seções 7.1 (CLI) e 13 (fluxos) com Antigravity                         | design     | P0         | S          | em revisão       | — · #21           |
| 033 | Atualizar README + INSTALL + CHANGELOG + bump `package.json` 0.9.0                 | design     | P0         | M          | em revisão       | 028, 029, 030 · #22 |
| 034 | Dogfood + QA smoke test cross-platform + confirmar path IDE + `QA-REPORT.md`       | qa         | P0         | M          | em revisão       | 028–033 · #23     |

---

## Ordem sugerida de execução

**Onda 1 — sem dependências (paralelizáveis):**
- 030 (template AGENTS.md — destrava 028)
- 031 (architecture.md — ADR-011)
- 032 (SPEC.md — fluxos/CLI)

**Onda 2 — núcleo do instalador:**
- 028 (installAntigravity + flag + env vars) — depois de 030
- 029 (manifest + uninstall + status) — depois de 028

**Onda 3 — docs do pacote:**
- 033 (README/INSTALL/CHANGELOG + bump 0.9.0) — depois de 028/029/030

**Onda 4 — só após tudo acima:**
- 034 (dogfood + QA end-to-end + confirma path IDE)

---

**Notas:**
- Quarta cópia hardcoded (`installAntigravity` ← `installOpencode`), sob **ADR-011** (task 031). O refator `installTarget(targetConfig)` genérico vira feature dedicada, obrigatória **antes do 5º target**.
- Escopo "Ambos": duas superfícies globais — CLI TUI (`~/.gemini/antigravity-cli/skills/`) + IDE (`~/.gemini/antigravity/skills/`), bundle único em `~/.gemini/ksdd/`. Project-level `.agents/workflows/` fica fora da v1.
- Path do IDE marcado `[verificar]` — confirmado empiricamente na task 034.

**Status:** 7/7 tasks implementadas em `feat/antigravity-integration` (commits `bd870a7..`). Aguardando review do PR e merge em `main`.

**QA:** ver [QA-REPORT.md](./QA-REPORT.md) — 9/9 cenários automatizáveis verdes em macOS; cenários 10-11 (`/ksdd-start` no Antigravity real), confirmação do path IDE e validação Linux/Windows ficam como gates manuais antes de `npm publish`.
