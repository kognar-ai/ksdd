# Context — Task 028: installAntigravity() + flag + env vars

**Issue:** #17 · **Área:** backend · **P0 · M** · depende de #19 (030, feito)

## Task em uma página
Núcleo da feature: `installAntigravity(tracked, out)` em `bin/ksdd.js`, flag `--antigravity`, env `KSDD_WITH_ANTIGRAVITY`/`ANTIGRAVITY_HOME`. Copia os 9 commands como skills nas duas superfícies globais (CLI/TUI + IDE) e bundla references/agents uma vez em `~/.gemini/ksdd/`.

## Plano de implementação (arquivos)
- `bin/ksdd.js`:
  - Constantes `ANTIGRAVITY_HOME` (default `~/.gemini`), `ANTIGRAVITY_CLI_SKILLS_DIR`, `ANTIGRAVITY_IDE_SKILLS_DIR`, `ANTIGRAVITY_BUNDLE_DIR`.
  - `installAntigravity(tracked, out)` — cópia adaptada de `installOpencode`, loop pelas 2 superfícies + bundle + AGENTS.md.
  - `cmdInstall`: `withAntigravity`, `targetsLabel`, `prevAntigravity`, bloco de install, `manifest.targets.antigravity`, `counts`, `tail`.
  - `cmdHelp`: documenta `--opencode`/`--antigravity` + envs + invocação.

## Quality gates (validados)
- [x] `node -c bin/ksdd.js` (syntax) ok
- [x] sandbox `HOME` install --antigravity: 9 skills CLI + 9 skills IDE + bundle {references,agents,README,INSTALL,AGENTS.md}
- [x] manifest.targets.antigravity preenchido (38 paths); AGENTS.md presente
- [x] reusa `agentPromptBasename()`; não altera installCodex/installOpencode (ADR-011)
- [ ] idempotência / ANTIGRAVITY_HOME override / combo 4 targets → cobertos na QA (task 034)
