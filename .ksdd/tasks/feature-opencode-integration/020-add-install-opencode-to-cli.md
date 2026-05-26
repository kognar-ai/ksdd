---
id: 020
title: Adicionar installOpencode() + flag --opencode + env vars em bin/ksdd.js
status: para implementar
feature: opencode-integration
area: backend
priority: P0
estimate: M
depends_on: []
feature_refs:
  - ".ksdd/features/FEATURE-opencode-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-opencode-integration.md#4-fluxos-de-uso"
  - ".ksdd/features/FEATURE-opencode-integration.md#72-endpoints-modificados"
spec_refs:
  - ".ksdd/specs/SPEC.md#71-cli-binksddjs"
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs:
  - ".ksdd/specs/architecture.md#4-apis-e-endpoints"
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
---

# 020 — Adicionar `installOpencode()` ao CLI

## Objetivo
Implementar a função `installOpencode(tracked, out)` em `bin/ksdd.js` e habilitar a invocação via flag `--opencode`, env `KSDD_WITH_OPENCODE=1` e env `OPENCODE_HOME`. É o núcleo da feature — sem isso o resto não tem sentido.

## Escopo
- Adicionar a função `installOpencode(tracked, out)` em `bin/ksdd.js`, escrita como **cópia adaptada** de `installCodex` (decisão registrada em ADR-010, task 024).
- Layout instalado (FEATURE seção 2.1):
  - `~/.config/opencode/commands/ksdd-<basename>.md` para cada arquivo em `commands/*.md` (usa `codexPromptBasename()` existente — renomeação pra `agentPromptBasename()` é tratada na task 023).
  - `~/.config/opencode/ksdd/references/` — `copyDir` de `references/`.
  - `~/.config/opencode/ksdd/agents/` — `copyDir` de `agents/`.
  - `~/.config/opencode/ksdd/README.md` e `~/.config/opencode/ksdd/INSTALL.md` — `copyFile` do root do pacote.
  - `~/.config/opencode/ksdd/AGENTS.md` — copiado de `references/opencode-AGENTS.md` (criado na task 022; até lá, deixar a chamada e marcar TODO se necessário).
- Estender `parseArgs(argv)` para reconhecer `--opencode` como flag booleana.
- Estender `main()` para disparar `installOpencode()` quando `args.opencode === true` OU quando `process.env.KSDD_WITH_OPENCODE === '1'` durante `--postinstall`.
- Respeitar `process.env.OPENCODE_HOME` como override do base path (default `path.join(os.homedir(), '.config', 'opencode')`); espelha exatamente o tratamento de `CODEX_HOME`.
- Combinabilidade com `--codex`: `ksdd install --codex --opencode` instala Claude + Codex + opencode na ordem `installClaude → installCodex → installOpencode`.
- Cada path absoluto copiado é adicionado ao array `tracked` (consumido pelo `saveManifest` no callsite — manifest schema é estendido na task 021).
- Mensagens de sucesso/falha em verde/amarelo/vermelho seguindo convenção ANSI existente (`bin/ksdd.js` helpers `green`, `yellow`, `red`, `dim`, `bold`).
- Idempotência: `installOpencode()` chamado 2x em sequência produz o mesmo estado (cópia sobrescreve, tracked é regerado a cada install).

## Fora de escopo
- Estender `normalizeManifest()`, `uninstall()`, `status()` para `targets.opencode` (task 021).
- Criar `references/opencode-AGENTS.md` (task 022).
- Renomear `codexPromptBasename` → `agentPromptBasename` (task 023).
- Documentação: README, INSTALL, CHANGELOG, package.json (task 026).
- Atualizações em `architecture.md` e `SPEC.md` (tasks 024, 025).
- Dogfood + QA (task 027).
- Detecção se opencode está instalado no sistema (out of scope v1 — FEATURE seção 2.2).
- Suporte a `.opencode/commands/` project-level (FEATURE seção 2.2).

## Critérios de aceitação
- [ ] Função `installOpencode(tracked, out)` existe em `bin/ksdd.js` e é exportada/usada por `main()`.
- [ ] `parseArgs` reconhece `--opencode` como flag booleana sem quebrar parsing existente.
- [ ] `main()` dispara `installOpencode()` quando `args.opencode === true` ou postinstall + `KSDD_WITH_OPENCODE=1`.
- [ ] Após `ksdd install --opencode`: existem 9 arquivos `~/.config/opencode/commands/ksdd-*.md` (start, spec, tech, design, new-feature, build-feature, build-all, setup, archive).
- [ ] Após `ksdd install --opencode`: existem `~/.config/opencode/ksdd/{references/, agents/, README.md, INSTALL.md}` populados via `copyDir`/`copyFile`.
- [ ] `ksdd install --codex --opencode` instala os 3 targets na ordem Claude → Codex → opencode sem erro.
- [ ] Re-rodar `ksdd install --opencode` é idempotente — nenhum arquivo duplicado, nenhum erro.
- [ ] `OPENCODE_HOME=/tmp/fake-opencode ksdd install --opencode` instala em `/tmp/fake-opencode/commands/` e `/tmp/fake-opencode/ksdd/` (override respeitado).
- [ ] Cada path absoluto copiado é adicionado ao array `tracked` recebido como parâmetro.
- [ ] Saída final em verde lista os 3 targets quando aplicável: "✓ KSDD instalado em Claude Code, Codex e opencode (N+M+K arquivos)."
- [ ] Falhas (ex: permission denied em `~/.config/`) em modo postinstall emitem warning amarelo e exit 0; em modo manual emitem erro vermelho + exit 1.
- [ ] Cobertura: smoke test manual em macOS + Linux (delegado pra task 027); validar localmente que `node bin/ksdd.js install --opencode` funciona neste repo.

## Notas técnicas
- Base do path opencode: `process.env.OPENCODE_HOME || path.join(os.homedir(), '.config', 'opencode')`. Não usar `~` literal (não expandido pelo Node).
- Reusar `codexPromptBasename(file)` definido em `bin/ksdd.js:116`. Ele já faz `:` → `-` e prefixa `ksdd-`. Funciona idêntico pra opencode (mesma restrição de naming). Renomeação semântica fica pra task 023.
- A chamada `copyFile(path.join(PKG_ROOT, 'references', 'opencode-AGENTS.md'), path.join(opencodeBase, 'ksdd', 'AGENTS.md'), tracked)` depende do arquivo criado em task 022. Solução: implementar a chamada e ordenar merge de PRs (021 e 022 antes de mergear 020), OU usar `fs.existsSync` defensivo e logar warning amarelo se ausente. Preferir o primeiro (PR ordenado) pra evitar código defensivo permanente.
- `installClaude()` continua sendo chamado **sempre** (paridade com fluxo atual — Codex/opencode são opt-in adicional).
- Não alterar `installCodex()` neste task — duplicação aceita sob ADR-010.

## Riscos / dependências externas
- Task 022 precisa estar mergeada antes de 020 pra evitar `installOpencode` chamando `copyFile` em arquivo inexistente. Mitigação: mergear 022 primeiro, ou implementar 020 com fallback `existsSync` e abrir issue de cleanup.
- Convenção `~/.config/opencode/` confirmada nas docs oficiais (https://opencode.ai/docs/commands/) mas Windows segue convenção própria — comportamento Windows fica `[verificar]` no QA (task 027).
