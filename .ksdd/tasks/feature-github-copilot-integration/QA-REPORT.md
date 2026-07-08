# QA Report — Feature: Integração com GitHub Copilot

**Task:** 043 — Dogfood + QA smoke test cross-platform
**Data:** 07/07/2026
**Ambiente:** Linux x86_64 · Node v22.22.2 (engines exige ≥ 16)
**Escopo:** validação automatizável do 5º target (`--copilot`). O smoke test real de
`/ksdd-start` no VS Code Copilot Chat e a validação macOS/Windows ficam como **gates
manuais pré-`npm publish`** (sem VS Code + Copilot neste ambiente).

---

## Matriz de cenários

| # | Cenário | Resultado |
|---|---------|-----------|
| 1 | `node -c bin/ksdd.js` (syntax) | ✅ OK |
| 2 | `install --copilot` → 9 `ksdd-*.prompt.md` no perfil VS Code | ✅ PASS |
| 3 | `install --copilot` → `ksdd.chatmode.md` presente | ✅ PASS |
| 4 | `install --copilot` → bundle `<vscode-user>/ksdd/{AGENTS.md,references/,agents/,README,INSTALL}` | ✅ PASS |
| 5 | `install --copilot` → placeholder CLI `~/.copilot/prompts/` (9 arquivos) | ✅ PASS |
| 6 | `install --copilot --project` → `.github/prompts/` (9) + `.github/chatmodes/ksdd.chatmode.md` | ✅ PASS |
| 7 | `KSDD_WITH_COPILOT=1 ... install --postinstall` instala copilot | ✅ PASS |
| 8 | `status` exibe linha `copilot: N arquivos` | ✅ PASS |
| 9 | Idempotência: 2× `install --copilot` isolado → 31→31 arquivos, sem duplicação | ✅ PASS |
| 10 | `COPILOT_HOME=/tmp/... ` override respeitado | ✅ PASS |
| 11 | **Preservação:** `settings.json` (config VS Code) sobrevive ao uninstall | ✅ PASS |
| 12 | **Preservação:** `team.prompt.md` (prompt de terceiro) sobrevive ao uninstall | ✅ PASS |
| 13 | **Preservação:** subdir `snippets/` do usuário sobrevive | ✅ PASS |
| 14 | `uninstall` remove todos os `ksdd-*.prompt.md` + bundle | ✅ PASS |
| 15 | **Prune seguro:** raiz `<vscode-user>/` NÃO é apagada | ✅ PASS |
| 16 | `resolveVscodeUserDir()` — branches por SO (réplica lógica) | ✅ PASS |

**Resolução de path por SO (cenário 16):**
- macOS (`darwin`): `~/Library/Application Support/Code/User` ✅
- Linux: `~/.config/Code/User` ✅ (runtime deste QA)
- Windows (`win32`): `%APPDATA%\Code\User` (fallback `~/AppData/Roaming`) ✅
- Override `COPILOT_HOME` lido em call-time ✅

**Revisão de código independente:** sem findings bloqueantes. Confirmou behavioralmente
a segurança do uninstall (config do VS Code e prompt files não-KSDD preservados; `pruneEmptyDirs`
é bottom-up e nunca sobe além dos subdirs KSDD; `~/.copilot/config.json` irmão preservado) e a
idempotência (manifest sem duplicatas; backward-compat com manifest legado sem `targets.copilot`).

---

## Gates manuais pendentes (antes de `npm publish`)

- [ ] **Smoke real:** instalar `ksdd install --copilot` em máquina com VS Code + extensão Copilot,
  invocar `/ksdd-start` e `/ksdd-spec` no Copilot Chat e confirmar fluxo de perguntas + geração
  de `brainstorm.md` equivalente a Claude/opencode.
- [ ] **Placement da chat mode** `[verificar]`: em modo global a chat mode é gravada em
  `<vscode-user>/prompts/ksdd.chatmode.md`. Confirmar no dogfood que o Copilot a descobre aí
  (a convenção do VS Code para chat modes user-scoped pode diferir; ajustar o path se necessário).
  Sem impacto de correção/segurança — o uninstall trata o nome explicitamente de qualquer forma.
- [ ] **macOS:** confirmar path `~/Library/Application Support/Code/User/prompts/` empiricamente.
- [ ] **Windows** `[verificar]`: validar `%APPDATA%\Code\User\prompts\` e separadores.
- [ ] **VS Code Insiders / perfis nomeados:** validar override via `COPILOT_HOME`.

---

## Observações não-bloqueantes (do review)

- **LOW/NIT** — `pruneEmptyDirs(<vscode-user>/prompts)` pode remover um subdir **vazio** que o
  usuário tenha dentro de `prompts/`. Impacto desprezível (só dirs vazios) e nunca escapa de `prompts/`.
- **NIT** — o fallback de uninstall sem manifest não limpa instalações `--project` (cwd desconhecido).
  Consistente com o design de fallback best-effort existente; o caminho normal (com manifest) limpa
  `.github/` via paths absolutos rastreados.

**Conclusão:** 16/16 cenários automatizáveis verdes. Feature pronta para review/PR; gates manuais
listados acima ficam antes do `npm publish`.
