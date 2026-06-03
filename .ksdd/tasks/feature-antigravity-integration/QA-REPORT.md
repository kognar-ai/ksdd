# QA Report — Feature `antigravity-integration`

**Data:** 01/06/2026 (rev. pós-dogfood 03/06/2026)
**Branch:** `feat/antigravity-integration`
**Versão sob teste:** KSDD v0.9.0
**Tester:** automação via `/ksdd:build:feature` + dogfood do mantenedor (Cleiton Tavares)

## Resumo executivo

A 1ª entrega instalava `.md` planos em `~/.gemini/antigravity-cli/skills/` e `~/.gemini/antigravity/skills/`. **No dogfood real, nenhum command apareceu no Antigravity.** Root cause: essas pastas não são superfícies de registro de slash commands. Usando o **GSD** (que já funciona no Antigravity na máquina do mantenedor) como referência, o modelo correto é **TOML nativo em `~/.gemini/commands/ksdd/*.toml`** + bundle `~/.gemini/ksdd/`. O instalador foi reescrito e revalidado.

## Ambiente

| Item | Valor |
|---|---|
| OS | macOS Darwin 25.5.0 (arm64) |
| Node | v24.16.0 (≥ 16) |
| gemini-cli | 0.45.0 (lê `~/.gemini/commands/*.toml`) |
| Google Antigravity | instalado (Antigravity.app + Antigravity IDE.app) |
| Referência de paths | GSD instalado em `~/.gemini/commands/gsd/*.toml` + `~/.gemini/get-shit-done/` — **funciona no Antigravity** |

## Root cause (modelo errado → modelo correto)

| | 1ª tentativa (errada) | Correção (validada) |
|---|---|---|
| Onde | `~/.gemini/antigravity-cli/skills/ksdd-*.md` + `~/.gemini/antigravity/skills/ksdd-*.md` | `~/.gemini/commands/ksdd/*.toml` |
| Formato | `.md` plano | TOML nativo Gemini (`description` + `prompt`) |
| Corpo | inline no `.md` | bundle `~/.gemini/ksdd/commands/ksdd-*.md`, incluído via `@$HOME/...` |
| Invocação | esperava `/ksdd-start` (não aparecia) | `/ksdd:start`, `/ksdd:new:feature` (subdirs aninhados) |
| Evidência | — | espelha GSD (`commands/gsd/*.toml` → `/gsd:*`), comprovado na máquina |

## Cenários executados (modelo TOML corrigido — sandbox `HOME` isolado)

| # | Cenário | Status | Notas |
|---|---|---|---|
| 1 | `install --antigravity` registra 9 TOMLs | ✓ | `commands/ksdd/{start,spec,tech,design,setup,archive}.toml` + `new/feature.toml`, `build/feature.toml`, `build/all.toml` |
| 2 | TOML bem-formado (`description` + `prompt`) | ✓ | validado por regex de string TOML em todos os 9 |
| 3 | include `@$HOME/.gemini/ksdd/commands/ksdd-*.md` resolve | ✓ | corpo bundlado existe no path do include |
| 4 | nesting → invocação | ✓ | `new/feature.toml` ⇒ `/ksdd:new:feature` (igual ao Claude) |
| 5 | `--codex --opencode --antigravity` (4 targets) | ✓ | manifest com 4 arrays |
| 6 | idempotência (2x) | ✓ | 38 paths idênticos, sem duplicação |
| 7 | `ANTIGRAVITY_HOME` override | ✓ | include passa a usar path absoluto do bundle |
| 8 | `status` | ✓ | `antigravity: N arquivos — commands … · bundle …` |
| 9 | `uninstall` (manifest) | ✓ | remove `commands/ksdd/` + bundle; **preserva `commands/gsd/`, `commands/`, `settings.json`, `~/.gemini/`** |
| 10 | `uninstall` fallback (sem manifest) | ✓ | remove namespace `commands/ksdd/` por convenção, preserva o resto |
| 11 | **Smoke real `/ksdd:start` no Antigravity** | `[verificar]` | **Gate do mantenedor:** limpar a instalação antiga (`ksdd uninstall`) + `ksdd install --antigravity` no formato novo, reiniciar o Antigravity e confirmar que `/ksdd:start` aparece e roda |

### Safety check (o mais importante)

| Check | Status |
|---|---|
| `uninstall` preserva `~/.gemini/commands/gsd/` (namespace de outra ferramenta) | ✓ |
| `uninstall` preserva `~/.gemini/commands/` e `~/.gemini/` | ✓ |
| `uninstall` preserva `~/.gemini/settings.json` (config do gemini-cli) | ✓ |
| prune nunca escala para o pai (`pruneEmptyDirs` opera só dentro do root) | ✓ (código + teste) |

## Pendências antes do `npm publish`

1. **Mantenedor:** limpar os 38 arquivos da 1ª tentativa (ainda no `~/.gemini/antigravity-cli/skills/` e `~/.gemini/antigravity/skills/` — rastreados no manifest v0.9.0, `ksdd uninstall` remove com precisão) e reinstalar no formato TOML. Confirmar cenário 11.
2. **Linux/Windows:** replicar cenários 1-10 (esperar paridade — é tudo `fs` + TOML).

## Conclusão

Modelo de registro **corrigido e revalidado em sandbox**, ancorado numa referência que comprovadamente funciona no Antigravity (GSD). Falta o gate manual do mantenedor (cenário 11) após limpar a instalação antiga e reinstalar.
