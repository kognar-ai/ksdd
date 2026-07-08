# QA Report — Feature: update-health-check (task 060)

**Data:** 2026-07-08 · **Branch:** `claude/feature-health-check-updates-ek5kf1`
**Ambiente:** node 22, npm 10.9.7. `npm view @kognar/ksdd version` → `0.11.0` (published real). Local dev = `0.12.0`.
**Método:** sem framework de teste (architecture §9). (1) harness que reproduz fielmente a decisão de `references/update-check.md` com `npm view`/curl reais; (2) distribuição via HOME override por target; (3) inspeção para o que é comportamento do agente.

---

## 1. Mecanismo da decisão (harness reproduzindo `update-check.md`, rede real)

| Cenário | Setup | Esperado | Resultado |
|---------|-------|----------|-----------|
| **C1** update disponível | manifest `0.10.0` < publicada `0.11.0` | NOTIFY | ✅ `NOTIFY :: KSDD: versão v0.11.0 disponível (instalada: v0.10.0).` |
| **C3** já atualizado | manifest `0.11.0` == publicada | SILENT | ✅ `SILENT :: instalada v0.11.0 >= publicada v0.11.0` |
| **edge** local à frente | manifest `0.12.0` > publicada `0.11.0` | SILENT | ✅ `SILENT :: instalada v0.12.0 >= publicada v0.11.0` |
| **C4** offline | registry inalcançável (`127.0.0.1:9`), `npm view` + curl falham | SKIP silencioso | ✅ `SKIP :: offline / registry inacessivel (nao-bloqueante)` |
| **C5** opt-out | `KSDD_SKIP_UPDATE_CHECK=1` | SKIP antes de rede | ✅ `SKIP :: opt-out ... (sem rede)` |
| **C6** manifest ausente | path inexistente | SKIP | ✅ `SKIP :: sem versao instalada` |
| **C6b** manifest ilegível | JSON quebrado | SKIP | ✅ `SKIP :: sem versao instalada` |

- Mensagem de C1 bate **exatamente** com FEATURE 8.1 / `references/update-check.md`.
- Comparação semver por núcleo numérico `MAJOR.MINOR.PATCH` (ex.: `0.10.0 < 0.11.0` numérico, não lexicográfico).
- Fallback `npm view` → `web_fetch` (curl) confirmado alcançável em separado (`registry.npmjs.org/@kognar/ksdd/latest` → `0.11.0`).

## 2. Distribuição aos 5 targets (HOME override em `/tmp`, sem tocar `~` real)

- `install --codex --opencode --antigravity --copilot --quiet` → exit 0.
- `references/update-check.md` presente nos **5** bundles: `~/.claude/skills/ksdd/`, `~/.agents/skills/ksdd/`, `~/.config/opencode/ksdd/`, `~/.gemini/ksdd/`, `<vscode-user>/ksdd/`. ✅
- Rastreado no manifest **5×** (uma por bundle) → uninstall preciso. ✅
- `ksdd status` → **`KSDD v0.12.0`**; contagens por target (Claude 33, Codex 34, opencode 34, antigravity 45, copilot 46). ✅
- **Zero linha de instalador nova** — o novo reference entra pelo `copyDir(references/…)` existente (confirma ADR-014 / premissa da task 056).

## 3. Uninstall + preservação de não-ksdd

- Sentinelas não-ksdd plantadas em `~/.config/opencode/commands/` e `<vscode-user>/prompts/`.
- `uninstall --quiet` → exit 0.
- **0 resquícios** de `ksdd*`/`update-check.md` (88 arquivos instalados → 0 após uninstall, dir neutro). ✅
- Manifest removido. ✅
- Ambas as sentinelas não-ksdd **preservadas** (prune só de subdirs KSDD vazios). ✅

## 4. Comportamento do agente (inspeção — não shell-testável)

| Cenário | Verificação |
|---------|-------------|
| **C2** 1x por sessão | `references/update-check.md` instrui explicitamente "não repita se já checou nesta conversa" (skip antecipado). Sem estado persistido — baseia-se no histórico da conversa. |
| **C7** os 11 commands disparam | Bloco de pré-flight presente em **11/11** commands (confirmado na task 057: `grep` = 11) e `allowed-tools` com `Bash` em 11/11. |
| Não-bloqueante / sem regressão offline | Diff dos commands é **puramente aditivo** (49 add / 5 del = 5 swaps de `allowed-tools`); o corpo do fluxo não muda. Combinado com C4 (skip silencioso), os commands rodam idênticos ao comportamento pré-feature quando offline. |

## 5. node -c

- `node -c bin/ksdd.js` → OK (única mudança na CLI é a linha de `log` da env var no `help`; nenhuma chamada de rede adicionada).

---

## Veredito

**Todos os critérios da task 060 atendidos.** C1–C7 validados (mecanismo por shell real; comportamento por inspeção), distribuição aos 5 targets confirmada, uninstall limpo preservando não-ksdd, sem regressão offline, `node -c` verde. A CLI permanece offline (ADR-014).

**Observação de release:** a feature só "acha versão nova" após o **publish da 0.12.0** no npm — hoje, com published=0.11.0 e local=0.12.0, uma instalação atualizada fica em silêncio (comportamento correto; ver Nota no CHANGELOG).
