# Context — Task 029: manifest/uninstall/status/prune para targets.antigravity

**Issue:** #18 · **Área:** backend · **P0 · S** · depende de #17 (028, feito)

## Task em uma página
Fazer manifest, uninstall, status e prune reconhecerem o 4º target. `normalizeManifest` cria `targets.antigravity` vazio se ausente; `uninstall` itera os 4 arrays + prune restrito aos subdirs KSDD do `~/.gemini/`; fallback sem manifest remove `ksdd-*` por convenção; `status` imprime linha antigravity só quando não-vazio.

## Arquivos modificados
- `bin/ksdd.js`: `normalizeManifest`, `cmdUninstall` (fallback + manifest), `cmdStatus`.

## Quality gates (validados — sandbox HOME)
- [x] `node -c` syntax ok
- [x] install 4 targets → manifest com 4 arrays (claude 28, codex 29, opencode 29, antigravity 38)
- [x] status mostra linha `antigravity  :`
- [x] idempotência (38==38, sem duplicados)
- [x] uninstall remove skills+bundle; **`~/.gemini/settings.json` (não-KSDD) preservado; `~/.gemini/` não pruned**
- [x] fallback sem manifest: warning + remove `ksdd-*`
- [x] `ANTIGRAVITY_HOME` override respeitado
