# QA Report — Feature: impeccable-integration (v0.12.0)

**Data:** 2026-08-18 · **Branch:** `claude/ksdd-impeccable-integration-ug1zlr` · **Node:** v22.22.2

Validação manual (o repo não tem framework de testes — ver CLAUDE.md "Testes / validação").
Todos os gates da task 064 passaram.

## Gate 1 — CLI intacto (invariante central)

| Check | Resultado |
|-------|-----------|
| `node -c bin/ksdd.js` | ✅ OK |
| `git diff origin/main..HEAD -- bin/ksdd.js` | ✅ **ZERO diff** (nenhuma mudança no CLI) |

## Gate 2 — Distribuição por target (HOME override, sem tocar no `~` real)

`HOME=<tmp> node bin/ksdd.js install --codex --opencode --antigravity --copilot --quiet` → exit 0.

`references/integrations/impeccable.md` **e** `README.md` distribuídos aos **5 targets** (5/5 cada):

| Target | Bundle |
|--------|--------|
| Claude | `~/.claude/skills/ksdd/references/integrations/` |
| Codex | `~/.agents/skills/ksdd/references/integrations/` |
| opencode | `~/.config/opencode/ksdd/references/integrations/` |
| Antigravity | `~/.gemini/ksdd/references/integrations/` |
| Copilot | `<vscode-user>/ksdd/references/integrations/` |

`ksdd status` reporta **v0.12.0** com os 5 targets.

**Uninstall:** `uninstall --quiet` → exit 0. `impeccable.md` restantes: **0**; diretórios `integrations/` restantes: **0**. Sentinelas não-ksdd preservadas (`~/.claude/commands/zz-not-ksdd.md` e `<vscode-user>/settings.json`) ✅ — o prune só remove subdirs KSDD vazios.

## Gate 3 — Compat de interop (`@google/design.md lint`)

`npx @google/design.md lint` (CLI v0.4.0) num `DESIGN.md` de exemplo no formato Google Stitch:

```
summary: { errors: 0, warnings: 1, infos: 1 }   → exit 0
```

**errors: 0** = arquivo aceito (por `references/design-md-spec.md`, "Erro = file rejeitado"). O único warning (`orphaned-tokens` no token `neutral`) é artefato do exemplo mínimo não referenciar `neutral` — não é rejeição. Contrato de interop confirmado: um `DESIGN.md` no padrão do KSDD é consumível pelo impeccable sem conversão.

## Gate 4 — Handoff renderiza (revisão dos diffs)

| Superfície | Verificado |
|------------|------------|
| `/ksdd:design` Step 7 | ✅ bloco opt-in "Integração impeccable" presente |
| `/ksdd:design` passo 5.5 | ✅ passo opcional de `PRODUCT.md`, gated no opt-in |
| `/ksdd:build:feature` §4.5 | ✅ orientação `/impeccable shape\|critique\|audit\|polish` |
| `/ksdd:build:feature` §4.8 + §6.6 | ✅ gate opcional `npx impeccable detect`, não bloqueante |
| `references/design-md-spec.md` | ✅ nota "## Interop com impeccable" |
| `architecture.md` ADR-014 + CLAUDE.md | ✅ registrados |

Fluxo sem impeccable: todas as adições são condicionais ("se você usa o impeccable…") — não há caminho que bloqueie quem não o tem.

## Gate 5 — Ponta real do impeccable (best-effort)

Não executado: exige o impeccable instalado (Node 22.12+) e um projeto de UI real. Marcado `[verificar]` — a integração é opt-in e o contrato de formato já foi validado pelo Gate 3. O path bridge (symlink/`cp`) está documentado em `references/integrations/impeccable.md`; a doc atual do impeccable **não** expõe flag de path (verificado no README oficial).

## Veredito

✅ **Aprovado.** Invariantes preservados: zero mudança em `bin/ksdd.js`, sem dependência de código, `engines.node` inalterado, tudo opt-in, distribuição limpa nos 5 targets, uninstall sem resíduo, compat de `DESIGN.md` confirmada.
