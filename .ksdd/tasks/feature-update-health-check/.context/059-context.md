# Context — Task 059: docs + CHANGELOG + bump 0.12.0

**Issue:** local-only · **Área:** backend · **P0 · S** · depende de 056, 057, 058

## Task em uma página
Fechar o release: docs voltadas ao usuário + version bump. Sem o bump/publish, o aviso nunca acha "versão nova".

## Idioma por arquivo (language-policy)
- `CHANGELOG.md` → pt-BR (arquivo é pt-BR).
- `README.md` → inglês (arquivo é inglês).
- `INSTALL.md` → pt-BR.
- `bin/ksdd.js` (help) → pt-BR (mensagens do CLI são pt-BR).

## Plano de implementação (arquivos)
- `package.json`: `"version": "0.11.0"` → `"0.12.0"`.
- `.ksdd/specs/SPEC.md` (4.1, linha ~115): exemplo de manifest `"version": "0.11.0"` → `"0.12.0"` (única ref de versão que sobra no SPEC; combinado com a task 058 que não a tocou).
- `CHANGELOG.md`: nova seção `## [0.12.0] - 2026-07-08` (Adicionado / Alterado / Arquitetura / Nota) no topo, antes de `## [0.11.0]`.
- `README.md`: subseção `### Updates` (inglês) antes de `### Manual (Claude Code)` — 1x/sessão, não-bloqueante, não é telemetria, opt-out.
- `INSTALL.md`: label `Checagem de update (v0.12.0):` após o bloco de comandos do CLI.
- `bin/ksdd.js` (`cmdHelp`): linha `KSDD_SKIP_UPDATE_CHECK=1` após `KSDD_SKIP_POSTINSTALL=1` no bloco "Variáveis de ambiente" (texto puro — sem lógica de rede).

## Critérios (task 059)
- [ ] package.json em 0.12.0; CHANGELOG com entrada 0.12.0; README explica checagem+opt-out+não-telemetria; INSTALL menciona a env var; `ksdd help` lista a env var; `node -c bin/ksdd.js` passa.
- [ ] Versão consistente entre package.json, CHANGELOG, SPEC (exemplo de manifest), README.

## Quality gates
- [ ] `node -c bin/ksdd.js` OK.
- [ ] `grep 0.12.0` consistente; `grep KSDD_SKIP_UPDATE_CHECK` em help/README/INSTALL.
- [ ] `HOME=/tmp/... ksdd help` mostra a nova env var; nenhuma chamada de rede adicionada à CLI (só `log()`).
