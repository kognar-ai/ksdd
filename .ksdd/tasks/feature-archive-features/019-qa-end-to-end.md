---
id: 019
title: QA end-to-end — todos os modos do /ksdd:archive + edge cases + integrações
status: para implementar
feature: archive-features
area: qa
priority: P0
estimate: M
depends_on: [018]
feature_refs:
  - ".ksdd/features/FEATURE-archive-features.md#10-critérios-de-aceite"
  - ".ksdd/features/FEATURE-archive-features.md#92-riscos"
spec_refs:
  - ".ksdd/specs/SPEC.md#134-build-completo-do-projeto"
arch_refs: []
---

# 019 — QA end-to-end do `/ksdd:archive`

## Objetivo
Validar manualmente todos os modos de invocação, edge cases e integrações com outros commands, garantindo que o release v0.7.0 entrega o que a FEATURE seção 10 promete.

## Escopo
Executar os cenários abaixo em projetos de teste isolados (`mktemp -d`) e registrar resultado por cenário.

### Cenário A — Archive individual (feliz path)
- Setup: projeto com 1 feature elegível (todas as tasks `concluída`).
- Executar: `/ksdd:archive feature-x`.
- Verificar: move correto, ARCHIVE.md criado, raw preservado, mensagens canônicas conforme FEATURE 8.3.

### Cenário B — Archive de lista
- Setup: 3 features, todas elegíveis.
- Executar: `/ksdd:archive feat-a feat-b feat-c`.
- Verificar: 3 seções em ARCHIVE.md (ordem dos argumentos, último no topo), 3 dirs em raw/.

### Cenário C — Archive `--all-eligible`
- Setup: 4 features, 2 elegíveis e 2 com tasks pendentes.
- Executar: `/ksdd:archive --all-eligible`.
- Verificar: preview lista as 2 elegíveis + 2 não-elegíveis (com razão), arquiva apenas as 2.

### Cenário D — Dry-run
- Setup: feature elegível.
- Executar: `/ksdd:archive feature-x --dry-run`.
- Verificar: banner [dry-run], nenhum arquivo movido, ARCHIVE.md inalterado.

### Cenário E — Restore (round-trip idempotente)
- Setup: feature recém-arquivada (cenário A).
- Executar: `/ksdd:archive --restore feature-x`.
- Verificar: árvore git-clean comparada ao estado pré-archive (ignorando timestamps).
- Re-rodar archive → re-rodar restore → confirmar idempotência completa.

### Cenário F — Elegibilidade bloqueada
- Setup: feature com 1 task `em revisão`, 1 `em andamento`.
- Executar: `/ksdd:archive feature-x`.
- Verificar: aborta com mensagem listando as 2 bloqueadoras + IDs + status.

### Cenário G — Slug inválido / inexistente
- Executar: `/ksdd:archive feature-inexistente` e `/ksdd:archive FEATURE_COM_UNDERSCORE`.
- Verificar: mensagens claras, sugestão de slug existente ou regex de validação.

### Cenário H — Conflito de restore
- Setup: feature arquivada + duplicar `.ksdd/features/FEATURE-feature-x.md` manualmente.
- Executar: `/ksdd:archive --restore feature-x`.
- Verificar: aborta com mensagem de conflito, sem mexer em nada.

### Cenário I — Colisão em `/ksdd:new:feature`
- Setup: feature arquivada `feature-x`.
- Executar: `/ksdd:new:feature feature-x`.
- Verificar: 3-way fork (novo slug / restaurar / abortar) apresentado, sem prosseguir automaticamente.

### Cenário J — Colisão em `/ksdd:build:feature`
- Setup: feature arquivada `feature-x`.
- Executar: `/ksdd:build:feature feature-x`.
- Verificar: 3-way fork (consultar ARCHIVE.md / restaurar / abortar) apresentado.

### Cenário K — `/ksdd:build:all` ignora arquivadas
- Setup: SPEC com 3 features (2 já arquivadas, 1 pendente).
- Executar: `/ksdd:build:all`.
- Verificar: BUILD-PLAN.md inclui apenas a feature pendente; resumo do checkpoint marca as 2 arquivadas como histórico.

### Cenário L — Numeração de IDs considerando archive
- Setup: arquivar feature com tasks 001-005; criar nova feature.
- Executar: `/ksdd:new:feature feature-nova`.
- Verificar: tasks da nova feature começam em 006, não em 001.

### Cenário M — Projeto sem `.ksdd/archive/`
- Setup: projeto novo sem nada arquivado.
- Executar comandos relacionados (`/ksdd:new:feature`, `/ksdd:build:feature`, `/ksdd:build:all`).
- Verificar: nenhum warning indevido sobre archive; commands funcionam como antes.

### Cenário N — Projeto legado (`docs/tasks/`)
- Setup: projeto pré-0.6.0 com feature em `docs/`.
- Executar: `/ksdd:archive feature-legado`.
- Verificar: warning amarelo orientando migração para `.ksdd/`, fluxo aborta ou prossegue conforme documentado em FEATURE 2.1.

### Cenário O — Re-archive de slug já em raw/
- Executar: arquivar feature, depois tentar arquivar de novo.
- Verificar: aborta com mensagem clara.

## Fora de escopo
- Implementação de qualquer task 011-018.
- Testes automatizados (FEATURE 2.2 e architecture.md seção 9 deixam fora da v1).

## Critérios de aceitação
- [ ] Todos os 15 cenários (A-O) executados em projeto temporário isolado.
- [ ] Resultado de cada cenário documentado: ✓ aprovado / ✗ falhou (com nota).
- [ ] Nenhum cenário falha de forma bloqueante (qualquer falha vira issue ou correção em task de bugfix).
- [ ] Relatório final anexado ao PR ou ao issue do release v0.7.0.
- [ ] Round-trip idempotente (cenário E) confirmado com `git diff` limpo.
- [ ] Mensagens canônicas (FEATURE 8.3) verificadas textualmente em cada cenário aplicável.
- [ ] Validar que nenhum dos comandos atualizados (new:feature, build:feature, build:all) quebrou para fluxos sem archive (cenário M).

## Notas técnicas
- Use `mktemp -d` para cada cenário e `git init` no projeto temporário para facilitar inspeção via `git diff`.
- Pode automatizar parcialmente com shell script que dispare cenários em sequência, mas execução final é manual (interação com slash command exige agente).
- Cenário N pode rodar contra um snapshot do próprio repo KSDD num estado pré-0.6.0 (checkout de tag antiga em worktree separada).

## Riscos / dependências externas
- Falhas descobertas aqui podem exigir voltar pra tasks 011-016 (bugfix). Reservar tempo de buffer.
- QA depende do PR de 017 estar em estado merge-ready (dogfooding pressupõe release próximo).
