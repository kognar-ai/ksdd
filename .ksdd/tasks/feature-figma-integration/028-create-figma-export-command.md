---
id: 028
title: Criar slash command commands/figma:export.md
status: para implementar
feature: figma-integration
area: backend
priority: P0
estimate: M
depends_on: [029]
feature_refs:
  - ".ksdd/features/FEATURE-figma-integration.md#2-escopo"
  - ".ksdd/features/FEATURE-figma-integration.md#4-fluxos-de-uso"
  - ".ksdd/features/FEATURE-figma-integration.md#10-critérios-de-aceite"
spec_refs:
  - ".ksdd/specs/SPEC.md#7-estrutura-de-páginas-e-telas"
  - ".ksdd/specs/SPEC.md#13-fluxos-críticos-user-journeys"
arch_refs:
  - ".ksdd/specs/architecture.md#1-visão-geral-da-arquitetura"
  - ".ksdd/specs/architecture.md#4-apis-e-endpoints"
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
---

# 028 — Criar slash command commands/figma:export.md

## Objetivo
Entregar o slash command `/ksdd:figma:export` que lê `DESIGN.md`, normaliza tokens conforme o mapping canônico (T-029) e instrui o agente a invocar tools do MCP oficial do Figma para criar/atualizar Variables. É a superfície principal da feature.

## Escopo
- Criar `commands/figma:export.md` no mesmo formato dos commands existentes (`start.md`, `spec.md`, `new:feature.md`).
- Frontmatter padrão: `description`, `argument-hint`, `allowed-tools` (incluir tools do MCP do Figma quando conhecidas; usar `*` ou lista ampla se a convenção atual permitir).
- Fluxo interno do command (ver FEATURE §4.1):
  1. Ler `.ksdd/specs/DESIGN.md` com fallback raiz `DESIGN.md`; warning amarelo se legado.
  2. Parse de frontmatter YAML + sanity check (≥ `name`, `colors.primary`).
  3. Detectar disponibilidade das tools do MCP oficial Figma; abortar com mensagem amarela e link se ausente.
  4. Resumir tokens detectados (contagens por categoria) para o usuário.
  5. Pergunta batch única (Gate 8 — entrada): `FILE_KEY` Figma, nome da coleção (default = `design.name`), sobrescrever colidentes (default não).
  6. Normalizar tokens conforme `references/figma-mapping.md` em payload Figma Variables (resolver token references `{path.to.token}` antes do payload).
  7. Invocar tools do MCP oficial Figma — criar coleção se não existe; criar/atualizar Variables por nome.
  8. Reportar diff final com contagens: criados / atualizados / inalterados / pulados / órfãos / erros.
  9. Parar após o report (Gate 8 — saída); não encadear nenhum próximo command.
- Suportar `--dry-run` (apenas mostra o diff que seria aplicado, sem invocar MCP write).
- Idioma da saída do command segue `references/language-policy.md` (idioma da conversa).

## Fora de escopo
- Export de `components:` do Stitch (T-FEATURE §2.2).
- Suporte a modes light/dark.
- Importer Figma → DESIGN.md.
- Deletar Variables órfãos no Figma — apenas marcar como `↻ órfão` no diff.
- Mudanças no `bin/ksdd.js` (nada de runtime novo; `copyDir` recursivo absorve o command automaticamente).

## Critérios de aceitação
- [ ] `commands/figma:export.md` existe e segue convenção dos commands KSDD (frontmatter + corpo Markdown).
- [ ] Após `ksdd install`, o arquivo aparece em `~/.claude/commands/ksdd:figma:export.md`.
- [ ] Após `ksdd install --codex`, aparece como `~/.codex/prompts/ksdd-figma-export.md` (via `codexPromptBasename` existente).
- [ ] Após `ksdd install --opencode`, aparece como `~/.config/opencode/commands/ksdd-figma-export.md`.
- [ ] Command aborta com mensagem amarela clara (sem stack trace) quando: DESIGN.md ausente, frontmatter inválido, MCP do Figma indisponível.
- [ ] Command pergunta `FILE_KEY` e nome da coleção em uma única rodada batch antes de qualquer write.
- [ ] Default de "sobrescrever colidentes" é **não**.
- [ ] `--dry-run` produz o diff esperado sem invocar tools de write do MCP.
- [ ] Diff final reporta as 6 contagens: criados, atualizados, inalterados, pulados, órfãos, erros.
- [ ] Command **para** após o report; não chama outro command nem implementa nada além do export.

## Notas técnicas
- Convenção de nome de arquivo `figma:export.md` reusa a lógica `codexPromptBasename` em `bin/ksdd.js:116` que já trata `new:feature.md` → `ksdd-new-feature.md`.
- Mapping de tokens é responsabilidade do `references/figma-mapping.md` (T-029) — o command não duplica regras; só referencia.
- `allowed-tools` deve incluir as tools necessárias: `view`, `ask_user_input_v0`, e os tool names do MCP oficial Figma (descobrir nomes exatos durante a implementação rodando o MCP localmente).
- Aderência a ADR-001/ADR-003: zero código novo em `bin/ksdd.js`; toda lógica vive no Markdown do command.
- Use `references/approval-gates.md` Gate 8 como referência ao escrever o checkpoint (Gate 8 será adicionado em T-031 ou T-032 — coordenar).

## Riscos / dependências externas
- API/shape de tools do MCP oficial Figma pode ainda estar em alpha — pinar versão do MCP testada no command (citar no Notas técnicas do próprio command).
- Sem MCP do Figma instalado localmente no ambiente do mantenedor, não dá pra validar end-to-end além do `--dry-run` — bloqueia teste real; cobrir em T-034.
