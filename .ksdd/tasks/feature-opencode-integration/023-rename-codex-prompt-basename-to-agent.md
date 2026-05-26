---
id: 023
title: Renomear codexPromptBasename → agentPromptBasename (refator pequeno compartilhado)
status: em revisão
feature: opencode-integration
area: backend
priority: P1
estimate: S
depends_on: [020]
feature_refs:
  - ".ksdd/features/FEATURE-opencode-integration.md#72-endpoints-modificados"
  - ".ksdd/features/FEATURE-opencode-integration.md#9-dependências-e-riscos"
spec_refs:
  - ".ksdd/specs/SPEC.md#73-custom-prompts-codex"
arch_refs:
  - ".ksdd/specs/architecture.md#43-funções-internas-não-exportadas--uso-interno-do-cli"
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
---

# 023 — Renomear `codexPromptBasename` → `agentPromptBasename`

## Objetivo
Renomear o helper `codexPromptBasename(file)` em `bin/ksdd.js:116` para `agentPromptBasename(file)`, refletindo que ele agora é compartilhado entre Codex e opencode (ambos exigem `ksdd-*` em vez de `ksdd:*` no filename). Refator pequeno, baixo risco, melhora legibilidade.

## Escopo
- Renomear a declaração da função em `bin/ksdd.js` linha ~116.
- Renomear todos os call sites no arquivo (`installCodex` e `installOpencode` da task 020).
- `grep -rn "codexPromptBasename"` no repo inteiro para garantir zero referências órfãs (deve estar contido em `bin/ksdd.js`; templates/commands/docs não usam).
- Comportamento da função permanece **idêntico** — só o nome muda. Mesmo input → mesmo output.
- Atualizar comentário curto acima da função, se existir, dizendo "Converte `commands/foo:bar.md` em `ksdd-foo-bar.md` — usado por Codex e opencode (ambos não aceitam `:` em filename de command)."

## Fora de escopo
- Qualquer outra refatoração em `bin/ksdd.js`.
- Refator do `installCodex` / `installOpencode` para padrão `installTarget` genérico — explicitamente fora (ADR-010 documenta a dívida; refator fica para próxima feature multi-agent).
- Renomear outros helpers (`copyDir`, `loadManifest`, etc.) — sem necessidade.

## Critérios de aceitação
- [ ] Função renomeada para `agentPromptBasename` em `bin/ksdd.js`.
- [ ] Todos os call sites em `bin/ksdd.js` chamam `agentPromptBasename`.
- [ ] `grep -rn "codexPromptBasename" .` retorna **zero** linhas (exceto possivelmente CHANGELOG histórico).
- [ ] `ksdd install --codex` continua gerando os mesmos `ksdd-*.md` files que antes (regressão zero — validar manualmente).
- [ ] `ksdd install --opencode` (após task 020) gera os mesmos basenames esperados.
- [ ] Comentário curto acima da função menciona Codex E opencode como consumidores.

## Notas técnicas
- Tarefa de cinco minutos se feita após 020 estar mergeada. Se feita em paralelo com 020, gera conflito de merge trivial — resolver mantendo o nome novo.
- Não há testes automatizados no repo (architecture seção 9), então validação é grep + smoke manual.
- P1 (não-bloqueante): se prazo apertar, pode ficar para o próximo release sem prejudicar a feature — função funciona perfeitamente com o nome antigo.

## Riscos / dependências externas
- Risco mínimo: se algum arquivo de templates/docs referenciar `codexPromptBasename` (por alguma razão histórica), o rename quebra a referência. Mitigação: `grep` global antes de mergear.
- Sem dependências externas. Depende de 020 só para evitar conflito de merge (não pra correção funcional).
