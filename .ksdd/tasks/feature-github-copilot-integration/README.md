# Tasks — Feature: Integração com GitHub Copilot

**Feature:** [.ksdd/features/FEATURE-github-copilot-integration.md](../../features/FEATURE-github-copilot-integration.md)
**Total:** 9 tasks
**Prioridade:** P0: 7 · P1: 2 · P2: 0
**Estimativa total:** ~11-13 dias (L=1, M=5, S=3)

| ID  | Título                                                                             | Área       | Prioridade | Estimativa | Status           | Depende de              |
|-----|------------------------------------------------------------------------------------|------------|------------|------------|------------------|-------------------------|
| 035 | `installCopilot()` + `resolveVscodeUserDir()` + flag `--copilot` + env vars         | backend    | P0         | L          | para implementar | 039                     |
| 036 | Chat mode global (`ksdd.chatmode.md`) + placeholder Copilot CLI                     | backend    | P1         | S          | para implementar | 035, 039                |
| 037 | Modo project-scoped `--project` (`.github/prompts` + `.github/chatmodes`)           | backend    | P1         | M          | para implementar | 035                     |
| 038 | Estender `normalizeManifest`/`uninstall`/`status`/`pruneEmptyDirs` p/ `copilot`     | backend    | P0         | M          | para implementar | 035                     |
| 039 | Criar `references/copilot-AGENTS.md` (template + base da chat mode)                 | data-model | P0         | S          | para implementar | —                       |
| 040 | `architecture.md` — ADR-012 + atualizar ADR-011 + diagrama + roadmap + riscos       | design     | P0         | S          | para implementar | —                       |
| 041 | `SPEC.md` — seções 4.1, 7, 7.1, 11 e 13 com Copilot                                 | design     | P0         | M          | para implementar | —                       |
| 042 | Atualizar README + INSTALL + CHANGELOG + bump `package.json` 0.10.0                 | design     | P0         | M          | para implementar | 035, 038, 039           |
| 043 | Dogfood + QA cross-platform + confirmar paths por SO + `QA-REPORT.md`               | qa         | P0         | M          | para implementar | 035–042                 |

---

## Ordem sugerida de execução

**Onda 1 — sem dependências (paralelizáveis):**
- 039 (template `copilot-AGENTS.md` — destrava 035/036)
- 040 (architecture.md — ADR-012)
- 041 (SPEC.md — superfícies/fluxos)

**Onda 2 — núcleo do instalador:**
- 035 (`installCopilot` + `resolveVscodeUserDir` + flag/env) — depois de 039
- 038 (manifest + uninstall + status + prune) — depois de 035

**Onda 3 — superfícies P1 (paralelizáveis após 035):**
- 036 (chat mode + placeholder CLI)
- 037 (modo `--project`)

**Onda 4 — docs do pacote:**
- 042 (README/INSTALL/CHANGELOG + bump 0.10.0) — depois de 035/038/039

**Onda 5 — só após tudo acima:**
- 043 (dogfood + QA end-to-end + confirma paths por SO)

---

**Notas:**
- Quinta cópia hardcoded (`installCopilot` ← `installAntigravity`), sob **ADR-012** (task 040). O refator `installTarget(targetConfig)` genérico continua feature dedicada, agora **inescapável antes do 6º target** (Cursor/Windsurf/Cline).
- **Novidade técnica** ausente nos 4 targets anteriores: resolução de path do perfil VS Code **por SO** (`resolveVscodeUserDir()`), com override `COPILOT_HOME`. É o principal ponto de atenção (tasks 035 e 043).
- **4 superfícies em v1:** prompt files user-profile (P0, núcleo), chat mode + placeholder CLI (P1), `.github/prompts` via `--project` (P1). O placeholder CLI é inócuo até o upstream suportar comandos custom (copilot-cli#618/#1113).
- **Cuidado crítico de uninstall (task 038):** `pruneEmptyDirs` nunca sobe além dos subdirs KSDD — `<vscode-user>/` é compartilhado com toda a config do VS Code.

---
**Próximo passo:** `/ksdd:build:feature github-copilot-integration` para implementar task por task.
