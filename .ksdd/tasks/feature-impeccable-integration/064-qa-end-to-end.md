---
id: 064
title: QA end-to-end — CLI intacto + distribuição 5 targets + @google/design.md lint + dry-runs
status: em revisão
feature: impeccable-integration
area: qa
priority: P0
estimate: M
depends_on: [062]
feature_refs:
  - ".ksdd/features/FEATURE-impeccable-integration.md#10-critérios-de-aceite"
  - ".ksdd/features/FEATURE-impeccable-integration.md#7-impacto-na-api-superfície-cli"
  - ".ksdd/features/FEATURE-impeccable-integration.md#81-contrato-de-interoperabilidade"
spec_refs:
  - ".ksdd/specs/SPEC.md#71-cli-binksddjs"
arch_refs:
  - ".ksdd/specs/architecture.md#9-estratégia-de-testes"
---

# 064 — QA end-to-end da integração

## Objetivo
Validar os invariantes da feature: zero mudança no CLI, distribuição correta nos 5 targets, contrato de compat do `DESIGN.md`, e handoffs renderizando como opt-in.

## Escopo
1. **Syntax/CLI intacto:** `node -c bin/ksdd.js` passa e `git diff` de `bin/ksdd.js` está **vazio** (zero CLI change).
2. **Distribuição por target** (HOME override, sem tocar no `~` real):
   ```bash
   COPILOT_HOME=/tmp/t node bin/ksdd.js install --copilot --quiet
   ls /tmp/t/**/ksdd/references/integrations/impeccable.md   # deve existir
   # análogos: CODEX_HOME, OPENCODE_HOME, ANTIGRAVITY_HOME; Claude via HOME=/tmp/t
   COPILOT_HOME=/tmp/t node bin/ksdd.js uninstall --quiet    # preserva arquivos não-ksdd
   ```
   - Confirmar `references/integrations/README.md` **e** `impeccable.md` presentes no bundle de cada target (Claude, Codex, opencode, Antigravity, Copilot).
   - Confirmar que `uninstall` remove os novos arquivos (via manifest/`tracked`) sem resíduo e sem apagar arquivos não-ksdd.
   - `ksdd status` reflete a contagem maior por target.
3. **Compat garantida (contrato de interop):** gerar um `DESIGN.md` de exemplo e rodar `npx @google/design.md lint .ksdd/specs/DESIGN.md` — deve passar.
4. **Handoff renderiza (dry-run mental):**
   - `/ksdd:design` — Step 7 mostra o bloco impeccable; passo `PRODUCT.md` (5.5) fica opcional/gated.
   - `/ksdd:build:feature` — §4.5 (craft) + gate opcional (§4.8/§6) aparecem, opt-in.
   - Fluxo completo **sem** impeccable instalado não é bloqueado em nenhum ponto.
5. **(Se impeccable instalado, best-effort)** validar a ponta real: `/impeccable audit` / `npx impeccable detect` sobre um sample, confirmando que consome `DESIGN.md`/`PRODUCT.md` via path bridge.
6. Registrar resultado em `QA-REPORT.md` na pasta da feature (padrão das features anteriores).

## Fora de escopo
- Corrigir bugs de conteúdo encontrados — abrir follow-up nas tasks de origem (056–063) se necessário.
- Publicar no npm.

## Critérios de aceitação
- [ ] `node -c bin/ksdd.js` passa; `git diff bin/ksdd.js` vazio.
- [ ] `references/integrations/README.md` e `impeccable.md` presentes no bundle dos 5 targets após install.
- [ ] `uninstall` remove os novos arquivos sem resíduo e preserva arquivos não-ksdd.
- [ ] `npx @google/design.md lint` passa num `DESIGN.md` de exemplo.
- [ ] Dry-runs de `/ksdd:design` e `/ksdd:build:feature` mostram os blocos impeccable como opt-in; fluxo sem impeccable não bloqueia.
- [ ] `QA-REPORT.md` gerado com o resultado dos cenários.

## Notas técnicas
- Padrão de validação manual do repo (não há framework): overrides `HOME`/`CODEX_HOME`/`OPENCODE_HOME`/`ANTIGRAVITY_HOME`/`COPILOT_HOME` apontando para `/tmp` (CLAUDE.md, "Testes / validação").
- `npx @google/design.md lint` exige rede/npx — se indisponível no ambiente de QA, registrar como `[verificar]` e validar o formato manualmente contra `references/design-md-spec.md`.
- A task 063 (critic) é opcional/P2 — não bloqueia este QA se ausente.

## Riscos / dependências externas
- **Externa:** `npx @google/design.md lint` depende de acesso à rede/registry. Mitigação: fallback de validação manual + marcar `[verificar]`.
- **Externa:** validação da ponta real do impeccable depende de tê-lo instalado (Node 22.12+) — best-effort, não bloqueante.
