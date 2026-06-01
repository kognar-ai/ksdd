---
id: 034
title: Dogfood + QA smoke test cross-platform + confirmar path IDE + QA-REPORT.md
status: para implementar
feature: antigravity-integration
area: qa
priority: P0
estimate: M
depends_on: [028, 029, 030, 031, 032, 033]
feature_refs:
  - ".ksdd/features/FEATURE-antigravity-integration.md#10-critérios-de-aceite"
  - ".ksdd/features/FEATURE-antigravity-integration.md#9-dependências-e-riscos"
spec_refs:
  - ".ksdd/specs/SPEC.md#10-responsividade"
arch_refs:
  - ".ksdd/specs/architecture.md#11-riscos-técnicos"
---

# 034 — Dogfood + QA smoke test cross-platform

## Objetivo
Validar a feature ponta-a-ponta num ambiente real com Antigravity instalado, **confirmar o path do IDE** (`[verificar]` no spec) e registrar evidência em `QA-REPORT.md`. É o gate de qualidade antes do PR/merge.

## Escopo
- **Confirmar path IDE:** verificar empiricamente onde o Antigravity IDE lê skills globais (`~/.gemini/antigravity/skills/` é a hipótese). Se divergir, abrir deviation e ajustar a constante de path na task 028 antes de fechar.
- **Matriz de cenários** (espelha o QA-REPORT do opencode), em macOS e Linux (Node ≥ 16):
  1. `ksdd install --antigravity` fresco → 9 skills CLI + 9 skills IDE + bundle.
  2. `ksdd install --codex --opencode --antigravity` → 4 targets, manifest com 4 arrays.
  3. `KSDD_WITH_ANTIGRAVITY=1 npm install -g .` (postinstall) → instala + warning yellow em falha.
  4. `ksdd install` sem flag → não toca `~/.gemini/`.
  5. `ksdd install --antigravity` 2x → idempotente.
  6. `ANTIGRAVITY_HOME=/tmp/fake-gemini ksdd install --antigravity` → override respeitado.
  7. `ksdd status` → linha `antigravity: N arquivos em ~/.gemini/`.
  8. `ksdd uninstall` → remove tudo dos 4 targets, sem lixo, `~/.gemini/` preservado fora dos subdirs.
  9. `ksdd uninstall` fallback sem manifest → remove por convenção + warning.
  10. **Smoke real:** invocar `/ksdd-start` no Antigravity (TUI e/ou IDE) e confirmar rodada de perguntas + geração de `brainstorm.md` com saída equivalente a Claude/opencode.
  11. (Opcional) `/ksdd-spec` em projeto-teste.
- **`QA-REPORT.md`** na pasta da feature com resultado por cenário e SO.
- Windows: rodar se possível; senão marcar `[verificar]` explicitamente no report.

## Fora de escopo
- Implementação (028/029); docs (033). QA não corrige bug fora de path trivial — abre deviation/issue.

## Critérios de aceitação
- [ ] Path IDE confirmado empiricamente (ou ajustado + documentado se divergiu da hipótese).
- [ ] Cenários 1-9 verdes em macOS e Linux (ou documentado o que ficou pendente).
- [ ] Cenário 10 (smoke `/ksdd-start` no Antigravity) executado com saída funcional equivalente; evidência no report.
- [ ] `QA-REPORT.md` criado com tabela cenário × SO × resultado.
- [ ] Nenhum arquivo não-KSDD em `~/.gemini/` afetado pelo uninstall.
- [ ] Windows marcado verde ou `[verificar]` explicitamente.

## Notas técnicas
- Usar `.ksdd/tasks/feature-opencode-integration/QA-REPORT.md` como molde de formato.
- O smoke real (cenário 10) é o gate manual mais importante — confirma que os commands Claude-orientados funcionam no runtime do Antigravity (risco da FEATURE seção 9.2).
- Para cenários de filesystem, preferir `ANTIGRAVITY_HOME` apontando pra tmp, evitando sujar o `~/.gemini/` real.

## Riscos / dependências externas
- Requer Antigravity instalado (CLI e/ou IDE) no ambiente de QA.
- Path IDE incerto até este task — é justamente onde se resolve o `[verificar]`.
- Commands podem assumir tools Claude-específicas (`ask_user_input_v0`, `view`, `create_file`) sem equivalente direto no Antigravity — se quebrar, abre issue (escopo de adaptação seria feature separada, FEATURE seção 2.3).
