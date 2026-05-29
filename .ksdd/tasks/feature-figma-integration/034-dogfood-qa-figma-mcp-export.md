---
id: 034
title: Dogfood QA — rodar /ksdd:figma:export contra fixture via MCP oficial Figma
status: para implementar
feature: figma-integration
area: qa
priority: P0
estimate: M
depends_on: [028, 029, 030]
feature_refs:
  - ".ksdd/features/FEATURE-figma-integration.md#4-fluxos-de-uso"
  - ".ksdd/features/FEATURE-figma-integration.md#10-critérios-de-aceite"
  - ".ksdd/features/FEATURE-figma-integration.md#13-métricas-de-sucesso"
spec_refs:
  - ".ksdd/specs/SPEC.md#13-fluxos-críticos-user-journeys"
arch_refs:
  - ".ksdd/specs/architecture.md#5-integrações-externas"
  - ".ksdd/specs/architecture.md#9-estratégia-de-testes"
---

# 034 — Dogfood QA do export Figma via MCP

## Objetivo
Validar ponta-a-ponta que `/ksdd:figma:export` materializa a fixture sintética em Figma Variables reais via MCP oficial do Figma. Produzir `QA-REPORT.md` com evidências (logs do diff + screenshot do Figma) para servir de baseline em releases futuras.

## Escopo
- Setup do mantenedor:
  1. Instalar o MCP oficial do Figma localmente (Claude Code primeiro; Codex/opencode opcional para QA paridade).
  2. Autenticar com PAT Figma.
  3. Criar um arquivo Figma sandbox dedicado (não usar arquivo de produção).
  4. Copiar `references/fixtures/example-DESIGN.md` para `/tmp/ksdd-figma-qa/.ksdd/specs/DESIGN.md`.
- Cenários de teste:
  1. **Happy path:** rodar `/ksdd:figma:export` apontando para o sandbox. Verificar que todos os tokens das 4 categorias aparecem na coleção do Figma.
  2. **Dry-run:** rodar `/ksdd:figma:export --dry-run`. Verificar que nenhum Variable é criado no Figma e o diff é apresentado.
  3. **Re-export sem mudanças:** rodar novamente. Diff deve mostrar todos como "inalterados".
  4. **Re-export com edit:** alterar 1 token na fixture local; rodar novamente. Diff deve mostrar 1 atualizado + N inalterados.
  5. **Token removido:** remover 1 token da fixture; rodar. Diff marca como "↻ órfão" e não deleta.
  6. **Sanity check de DESIGN.md inválido:** remover `colors.primary` da fixture; rodar. Deve abortar com mensagem amarela sem stack trace.
  7. **MCP indisponível:** desligar/desconfigurar o MCP do Figma; rodar. Deve abortar com mensagem amarela explicativa e link.
  8. **Sobrescrever colidente (default não):** rodar com Variable de mesmo nome já existente; verificar que command pula (não sobrescreve) sem `--force`/confirmação.
  9. **Codex + opencode paridade:** rodar o mesmo cenário 1 via Codex (`/prompts:ksdd-figma-export`) e opencode (`/ksdd-figma-export`). Resultado deve ser equivalente.
- Produzir `.ksdd/tasks/feature-figma-integration/QA-REPORT.md` documentando:
  - Versão do MCP oficial Figma utilizada.
  - Status de cada cenário (PASS/FAIL com nota).
  - Screenshot do Figma sandbox após cenário 1 (anexar como PNG no repo ou referenciar URL).
  - Bugs encontrados → abrir issues separados, listar no relatório.

## Fora de escopo
- Automatizar a QA (não temos CI; QA é manual conforme `.ksdd/specs/architecture.md` §9).
- Testar em conta Figma de produção/cliente — só sandbox pessoal do mantenedor.
- QA do Windows (mantenedor valida no macOS/Linux; Windows fica como follow-up se houver demanda).

## Critérios de aceitação
- [ ] `QA-REPORT.md` existe em `.ksdd/tasks/feature-figma-integration/` com os 9 cenários listados e status PASS/FAIL.
- [ ] Cenário 1 (happy path) PASSA em pelo menos 1 dos 3 agentes (Claude obrigatório; Codex/opencode reportar status).
- [ ] Cenário 9 (paridade) tem status reportado para Codex e opencode (PASS / FAIL / Skipped com motivo).
- [ ] Screenshot do Figma sandbox anexada/referenciada no QA-REPORT.
- [ ] Bugs FAIL → cada um tem uma issue GitHub aberta linkada no relatório.
- [ ] QA-REPORT registra a versão exata do MCP oficial Figma usada (para futura repro).

## Notas técnicas
- Esta task é gating para T-033 (release notes) — sem QA verde, não bumpamos versão.
- Se o MCP oficial do Figma estiver instável (alpha), aceitar workaround/skip de cenário desde que documentado.
- Reusar formato dos `QA-REPORT.md` existentes (`feature-archive-features/QA-REPORT.md` e `feature-opencode-integration/QA-REPORT.md`).

## Riscos / dependências externas
- Indisponibilidade do MCP do Figma bloqueia totalmente esta task — sem fallback (a feature inteira pressupõe o MCP).
- Mudanças na conta Figma do mantenedor (rotação de PAT, mudança de workspace) podem invalidar QA — manter screenshot como evidência atemporal.
- Bus factor: só o mantenedor tem o sandbox. QA-REPORT deve ser detalhado o bastante para outro contribuidor reproduzir.
