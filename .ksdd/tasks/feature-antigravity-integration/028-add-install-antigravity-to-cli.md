---
id: 028
title: Adicionar installAntigravity() + flag --antigravity + env vars em bin/ksdd.js
status: em revisão
feature: antigravity-integration
area: backend
priority: P0
estimate: M
depends_on: [030]
feature_refs:
  - ".ksdd/features/FEATURE-antigravity-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-antigravity-integration.md#4-fluxos-de-uso"
  - ".ksdd/features/FEATURE-antigravity-integration.md#72-endpoints-modificados"
spec_refs:
  - ".ksdd/specs/SPEC.md#71-cli-binksddjs"
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs:
  - ".ksdd/specs/architecture.md#4-apis-e-endpoints"
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
---

# 028 — Adicionar `installAntigravity()` ao CLI

## Objetivo
Implementar `installAntigravity(tracked, out)` em `bin/ksdd.js` e habilitar a invocação via flag `--antigravity`, env `KSDD_WITH_ANTIGRAVITY=1` e env `ANTIGRAVITY_HOME`. É o núcleo da feature — distribui os 9 commands nas duas superfícies globais do Antigravity (CLI TUI + IDE) e bundla references/agents.

## Escopo
- Adicionar `installAntigravity(tracked, out)` em `bin/ksdd.js`, escrita como **cópia adaptada** de `installOpencode` (decisão registrada em ADR-011, task 031).
- Base path: `process.env.ANTIGRAVITY_HOME || path.join(os.homedir(), '.gemini')`. Nunca usar `~` literal.
- Layout instalado (FEATURE seção 2.1):
  - **Duas superfícies de skills** — para cada arquivo em `commands/*.md`, copia `ksdd-<basename>.md` (via `agentPromptBasename()`) para **ambos**:
    - `<base>/antigravity-cli/skills/` (CLI/TUI)
    - `<base>/antigravity/skills/` (IDE — path marcado `[verificar]`, confirmado na task 034)
  - **Bundle único compartilhado** em `<base>/ksdd/`:
    - `references/` (`copyDir`) + `agents/` (`copyDir`)
    - `README.md` e `INSTALL.md` (`copyFile` do root do pacote)
    - `AGENTS.md` — copiado de `references/antigravity-AGENTS.md` (criado na task 030)
- Estender `parseArgs(argv)` para reconhecer `--antigravity` como flag booleana.
- Estender `main()` para disparar `installAntigravity()` quando `args.antigravity === true` OU postinstall + `process.env.KSDD_WITH_ANTIGRAVITY === '1'`.
- Combinabilidade: `ksdd install --codex --opencode --antigravity` instala os 4 targets na ordem `installClaude → installCodex → installOpencode → installAntigravity`.
- Cada path absoluto copiado (skills CLI + skills IDE + bundle) é adicionado ao array `tracked`.
- Mensagens verde/amarelo/vermelho seguindo helpers ANSI existentes (`green`, `yellow`, `red`, `dim`, `bold`).
- Idempotência: 2x em sequência produz o mesmo estado.

## Fora de escopo
- Estender `normalizeManifest()`, `uninstall()`, `status()`, `pruneEmptyDirs` para `targets.antigravity` (task 029).
- Criar `references/antigravity-AGENTS.md` (task 030).
- Documentação README/INSTALL/CHANGELOG/package.json (task 033).
- Atualizações em `architecture.md` e `SPEC.md` (tasks 031, 032).
- Dogfood + QA + confirmação do path IDE (task 034).
- Detecção se Antigravity está instalado; suporte project-level `.agents/workflows/`; `openai.yaml` por skill (FEATURE seção 2.2).

## Critérios de aceitação
- [ ] Função `installAntigravity(tracked, out)` existe em `bin/ksdd.js` e é chamada por `main()`.
- [ ] `parseArgs` reconhece `--antigravity` como flag booleana sem quebrar parsing existente.
- [ ] `main()` dispara `installAntigravity()` quando `args.antigravity === true` ou postinstall + `KSDD_WITH_ANTIGRAVITY=1`.
- [ ] Após `ksdd install --antigravity`: existem 9 arquivos `ksdd-*.md` em `~/.gemini/antigravity-cli/skills/` E 9 em `~/.gemini/antigravity/skills/` (start, spec, tech, design, new-feature, build-feature, build-all, setup, archive).
- [ ] Após `ksdd install --antigravity`: existe `~/.gemini/ksdd/{references/, agents/, README.md, INSTALL.md, AGENTS.md}` populado.
- [ ] `ksdd install --codex --opencode --antigravity` instala os 4 targets sem erro, na ordem correta.
- [ ] Re-rodar `ksdd install --antigravity` é idempotente — sem arquivo duplicado, sem erro.
- [ ] `ANTIGRAVITY_HOME=/tmp/fake-gemini ksdd install --antigravity` instala sob `/tmp/fake-gemini/{antigravity-cli/skills,antigravity/skills,ksdd}` (override respeitado).
- [ ] Cada path absoluto copiado (ambas superfícies + bundle) é adicionado ao array `tracked`.
- [ ] Saída final em verde lista os targets aplicáveis: "✓ KSDD instalado em Claude Code, ..., e Google Antigravity (N arquivos)."
- [ ] Falha (ex: permission denied em `~/.gemini/`) em postinstall → warning amarelo + exit 0; em modo manual → erro vermelho + exit 1.
- [ ] Validar localmente: `node bin/ksdd.js install --antigravity` funciona neste repo (smoke macOS/Linux delegado à task 034).

## Notas técnicas
- Reusar `agentPromptBasename(file)` já presente em `bin/ksdd.js` (generalizado na feature opencode — faz `:` → `-` e prefixa `ksdd-`). Funciona idêntico pra Antigravity. **Não** renomear nada.
- Bundle único (`<base>/ksdd/`) referenciado pelas duas superfícies via `AGENTS.md`. Se a leitura relativa do Antigravity exigir bundle por superfície, documentar o fallback e ajustar — decisão tática aqui (FEATURE seção 2.1, nota).
- A cópia de `AGENTS.md` depende de `references/antigravity-AGENTS.md` (task 030). Por isso `depends_on: [030]` — mergear 030 antes. Alternativa defensiva: `fs.existsSync` + warning amarelo se ausente (evitar — preferir ordem de merge).
- `installClaude()` continua sendo chamado **sempre** (paridade — Codex/opencode/Antigravity são opt-in adicional).
- Não alterar `installCodex()`/`installOpencode()` — duplicação aceita sob ADR-011.

## Riscos / dependências externas
- Task 030 (`references/antigravity-AGENTS.md`) precisa estar mergeada antes para o `copyFile` não falhar.
- Path IDE (`~/.gemini/antigravity/skills/`) marcado `[verificar]` — confirmado na task 034 (dogfood). Se divergir, ajustar a constante de path.
- Windows: paths sob `~/.gemini/` podem divergir — `[verificar]` no QA (task 034).
