# QA Report — Feature: new-fix-command (`/ksdd:new:fix` + `/ksdd:build:fix`)

**Data:** 2026-07-08
**Versão-alvo:** 0.11.0
**Base:** rebase sobre `origin/main` (v0.10.0, 5 targets, Copilot=ADR-012)
**Escopo:** task 054 — matriz de cenários A–O + smoke de instalação nos 5 targets.

## Natureza da validação

KSDD é conteúdo distribuído: os commands são **prompts Markdown** executados por um agente
de IA em tempo de uso, não código com runtime testável. Portanto a QA combina três níveis:

- **SMOKE (automatizado):** `bin/ksdd.js` — instalação/distribuição/uninstall real em sandbox `/tmp`.
- **INSPEÇÃO (conteúdo):** o prompt do command instrui explicitamente o comportamento exigido pelo critério.
- **DOGFOOD (real):** o fluxo `/ksdd:new:fix` foi exercido de verdade sobre um bug real do repo (task 053 → `.ksdd/fixes/FIX-spec-command-count.md`).

Não há suite automatizada de runtime (architecture §9) — esperado para este projeto.

## Smoke de instalação (automatizado)

Comando: `HOME=$SB CODEX_HOME=… OPENCODE_HOME=… ANTIGRAVITY_HOME=… COPILOT_HOME=… node bin/ksdd.js install --codex --opencode --antigravity --copilot` (sandbox `/tmp`, `~` real intocado).

| Verificação | Resultado |
|-------------|-----------|
| `node -c bin/ksdd.js` (sintaxe) | ✅ OK |
| `COMMAND_FILES.length` | ✅ 11 |
| Claude recebe `ksdd:new:fix.md` + `ksdd:build:fix.md` | ✅ |
| Codex/opencode/Antigravity recebem `ksdd-new-fix.md` + `ksdd-build-fix.md` | ✅ |
| Copilot recebe `ksdd-new-fix.prompt.md` + `ksdd-build-fix.prompt.md` | ✅ |
| `references/fix-template.md` bundlado nos skills (Antigravity/opencode/Copilot verificados) | ✅ |
| `ksdd status` conta os 5 targets | ✅ (Claude 32 · Codex 33 · opencode 33 · antigr 44 · copilot 45) |
| `ksdd uninstall` remove tudo rastreado (0 resíduos `ksdd*fix*`) | ✅ |
| Idempotência (2× install) | ✅ |

## Matriz de cenários (task 054)

| # | Cenário | Nível | Resultado / evidência |
|---|---------|-------|-----------------------|
| A | new:fix por descrição → FIX doc com root cause + evidência, para no Checkpoint 1 | INSPEÇÃO | ✅ `commands/new:fix.md` §3 (investigação code-aware com `arquivo:linha`) + §6 (Checkpoint 1 obrigatório) |
| B | new:fix por `#issue` (gh best-effort / fallback colado) | INSPEÇÃO | ✅ §2 coleta de bug cobre `#N`/URL via `gh` com fallback |
| C | new:fix por teste que reproduz | INSPEÇÃO | ✅ §2 aceita caminho de teste como âncora |
| D | Checkpoints obrigatórios (não quebra tasks sem aprovar FIX; não implementa sem aprovar tasks) | INSPEÇÃO | ✅ §6 (Checkpoint 1) + §9 (Checkpoint 2); Gate 8 em approval-gates |
| E | Quebra em tasks `.ksdd/tasks/fix-[slug]/` + numeração global + task de regressão | INSPEÇÃO + DOGFOOD | ✅ §7 (fix:/fix_refs, 4-path numbering, regressão sempre); dogfood gerou task 055 (ID global após 054) |
| F | Fix inline aceito (bug pequeno) — patch + regressão em branch, sem commit | INSPEÇÃO | ✅ §10 (opt-in, heurística estrita, sem commit/merge) |
| G | Fix inline recusado (bug cresce) → recomenda build:fix | INSPEÇÃO | ✅ §10 (recusa + recomendação) |
| H | Bug não reproduzível → FIX "investigação incompleta", para | INSPEÇÃO | ✅ seção dedicada + template §3 estado `[investigação incompleta]` |
| I | build:fix repro-first (para se não reproduz) | INSPEÇÃO | ✅ `commands/build:fix.md` Delta 1 |
| J | build:fix gate de regressão (bloqueia PR sem falha-antes/passa-depois; exceção não silencia) | INSPEÇÃO | ✅ Delta 2 + Gate 9 |
| K | build:fix PR label `bug`, corpo com root cause + regressão, sem merge | INSPEÇÃO | ✅ Delta 3 + template de PR |
| L | Instalação 5 targets + status + uninstall + idempotência | SMOKE | ✅ ver tabela acima |
| M | new:feature numera considerando `fix-*`; build:feature redireciona; build:all exclui | INSPEÇÃO | ✅ `new:feature.md` (4 paths), `build:feature.md` (redirect), `build:all.md` (fora da fila) |
| N | Colisão de slug (fix existente / arquivado) + slug inválido | INSPEÇÃO | ✅ `new:fix.md` "Detecção de colisão de slug" (regex + `.ksdd/fixes/` + `.ksdd/archive/raw/`) |
| O | Idioma segue `language-policy.md` (não assume pt-BR) | INSPEÇÃO | ✅ bloco "Idioma (obrigatório)" em ambos os commands |

## Dogfood (real)

`/ksdd:new:fix` foi usado sobre a **inconsistência real de contagem de slash commands** nos
artefatos (8 × 9 × 11; §7.2 do SPEC omitia `archive`). Resultado: `.ksdd/fixes/FIX-spec-command-count.md`
(root cause com evidência, ajuste aplicado inline, task de regressão 055). Critérios de verificação
do FIX doc conferidos: todas as menções em tempo presente = 11; §7.2 lista os 11; menções
históricas (brainstorm §7 v0.5.0; evidência ADR-011/012) preservadas. Primeiro `.ksdd/fixes/*` do repo. ✅

## Pendências / follow-ups (não bloqueiam)

- **Task 055** (`fix-spec-command-count`, P2, `para implementar`): guarda de consistência para
  a contagem de commands não voltar a divergir. Aberta conscientemente.
- **Path IDE do Antigravity** (`~/.gemini/antigravity/skills/`) permanece `[verificar]` — herdado da feature Antigravity, fora do escopo desta.
- **Confirmação empírica** dos comportamentos de prompt (investigação, checkpoints, inline) só
  acontece no uso real com um agente — é a natureza de um command KSDD. O dogfood cobre o caminho principal.

## Conclusão

Nenhum critério bloqueante em aberto. Smoke de instalação verde nos 5 targets; conteúdo dos 2
commands + template + gates + integrações + artefatos revisado contra os critérios de aceite da
FEATURE seção 10; dogfood exercitou o fluxo de verdade. **Recomendado para review/merge** (a
publicação no npm fica a critério do mantenedor pós-merge).
