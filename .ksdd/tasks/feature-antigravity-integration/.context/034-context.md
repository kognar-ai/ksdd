# Context — Task 034: dogfood + QA + QA-REPORT.md

**Issue:** #23 · **Área:** qa · **P0 · M** · depende de #17-#22

## Task em uma página
Validar a feature ponta-a-ponta, confirmar o path do IDE e registrar `QA-REPORT.md`. Antigravity NÃO está instalado neste ambiente → cenários 10-11 e confirmação do path IDE ficam como gates manuais `[verificar]` (mesma posição do QA do opencode).

## Quality gates (validados — sandbox HOME / ANTIGRAVITY_HOME)
- [x] Cenários 1-9 verdes em macOS (install solo, 4 targets, postinstall env, override, idempotência, status, uninstall, fallback, preservação)
- [x] Safety: `~/.gemini/settings.json` não-KSDD preservado; `~/.gemini/` não pruned
- [x] Code review (agente code-reviewer) sem findings críticos/bloqueantes
- [x] `QA-REPORT.md` criado com matriz cenário × status
- [ ] cenários 10-11 (`/ksdd-start` real) + path IDE + Linux/Windows → gates manuais antes do publish
