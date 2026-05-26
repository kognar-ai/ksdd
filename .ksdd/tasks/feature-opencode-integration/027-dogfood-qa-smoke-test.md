---
id: 027
title: Dogfood + QA smoke test em macOS e Linux (install/uninstall/status + /ksdd-start em opencode)
status: para implementar
feature: opencode-integration
area: qa
priority: P0
estimate: M
depends_on: [020, 021, 022, 023, 024, 025, 026]
feature_refs:
  - ".ksdd/features/FEATURE-opencode-integration.md#13-métricas-de-sucesso"
  - ".ksdd/features/FEATURE-opencode-integration.md#10-critérios-de-aceite"
  - ".ksdd/features/FEATURE-opencode-integration.md#9-dependências-e-riscos"
spec_refs:
  - ".ksdd/specs/SPEC.md#131-onboarding-em-projeto-novo-do-zero"
arch_refs:
  - ".ksdd/specs/architecture.md#9-estratégia-de-testes"
---

# 027 — Dogfood + QA smoke test cross-platform

## Objetivo
Validar manualmente, em pelo menos 2 plataformas (macOS + Linux), que o ciclo completo `install → status → uso de slash command em opencode → uninstall → status` funciona ponta-a-ponta. Também produzir `QA-REPORT.md` similar ao da feature `archive-features` para referência futura.

## Escopo
- **Pré-setup:** instalar opencode oficial (https://opencode.ai) em macOS e Linux. Validar `opencode --version` em ambos. Se não houver acesso a Linux, marcar como `[verificar]` e documentar limitação no relatório (alinhado com architecture seção 9).
- **Cenários a executar (em cada plataforma):**
  1. **Install fresh com opencode-only:** `npm install -g .` (do repo local após bump) + `ksdd install --opencode`. Verificar: 9 arquivos em `~/.config/opencode/commands/ksdd-*.md`, bundle em `~/.config/opencode/ksdd/`, manifest com `targets.opencode` populado.
  2. **Install com os 3 targets:** `ksdd uninstall && ksdd install --codex --opencode`. Verificar: arquivos em `~/.claude/`, `~/.codex/`, `~/.agents/skills/ksdd/`, `~/.config/opencode/`. Manifest com 3 arrays.
  3. **Postinstall via env:** `ksdd uninstall && KSDD_WITH_OPENCODE=1 npm install -g .`. Verificar mesmo estado do cenário 1.
  4. **OPENCODE_HOME override:** `ksdd uninstall && OPENCODE_HOME=/tmp/fake-opencode ksdd install --opencode`. Verificar arquivos em `/tmp/fake-opencode/commands/` e `/tmp/fake-opencode/ksdd/`.
  5. **Preservação Codex em re-install:** `ksdd install --codex` → confirmar Codex; `ksdd install --opencode` (sem `--codex`) → confirmar Codex preservado, opencode novo.
  6. **`ksdd status`:** com os 3 targets ativos, conferir saída tem 3 linhas (claude, codex, opencode); com 1 target ativo, conferir omissão das outras linhas.
  7. **`ksdd uninstall` completo:** com 3 targets ativos, rodar uninstall. Verificar: zero arquivos KSDD em todos os 4 diretórios; manifest deletado; outros arquivos não-KSDD preservados.
  8. **Uninstall fallback (sem manifest):** instalar, deletar manifest manualmente (`rm ~/.claude/skills/ksdd/.ksdd-manifest.json`), rodar uninstall. Verificar warning amarelo "modo fallback" + remoção dos 3 targets por convenção.
  9. **Idempotência:** rodar `ksdd install --opencode` 2x seguidas. Verificar manifest idêntico, zero arquivos duplicados.
  10. **Slash command em opencode:** abrir opencode num projeto-teste vazio, invocar `/ksdd-start` com input simples, validar que o fluxo de perguntas roda e produz `brainstorm.md` (não precisa ser perfeito — só não crashar e respeitar approval gate).
  11. **`/ksdd-spec` em sequência:** após `/ksdd-start` aprovado, invocar `/ksdd-spec`, validar que lê `brainstorm.md` e produz `SPEC.md`. Para se em approval gate.
- **`pruneEmptyDirs` safety check:** após uninstall, verificar que `~/.config/opencode/` (diretório pai) **não** foi removido se não estava vazio antes.
- **Cross-check com docs:** abrir README atualizado, executar os exemplos do quick start exatamente como documentado. Reportar qualquer divergência.
- **Produzir `QA-REPORT.md`** em `.ksdd/tasks/feature-opencode-integration/QA-REPORT.md` com:
  - Plataforma testada + versão Node + versão opencode
  - Tabela com os 11 cenários: ✓ / ✗ / `[verificar]` + nota
  - Bugs encontrados (se houver) com referência ao task que deveria corrigir
  - Items `[verificar]` que ficam abertos pra próximo release (ex: Windows)

## Fora de escopo
- Testes automatizados (suite `node:test` ou outro) — fora do roadmap atual (architecture seção 9 deixa explícito).
- Validação em Windows (a menos que mantenedor tenha acesso). Se sem acesso, marcar `[verificar]` no relatório.
- Validação em opencode com modelo local-only (LLM offline) — fora de escopo; smoke test usa qualquer modelo configurado.
- Performance benchmarking — feature não tem requisito de perf além de "não trava `npm install`".
- Validação dos commands KSDD em opencode *além* de start e spec — se start+spec funcionam, os outros provavelmente também (mesmo estilo). Bugs em commands específicos viram issues futuras.

## Critérios de aceitação
- [ ] `QA-REPORT.md` existe em `.ksdd/tasks/feature-opencode-integration/QA-REPORT.md`.
- [ ] Relatório cobre os 11 cenários listados no Escopo, cada um com status ✓/✗/`[verificar]` + nota curta.
- [ ] Mínimo macOS testado completamente (11/11 cenários executados).
- [ ] Linux testado ou explicitamente marcado como `[verificar]` com razão.
- [ ] Windows marcado como `[verificar]` se não testado (explícito que fica pra release futuro).
- [ ] Pelo menos 9 dos 11 cenários terminam com ✓ (90% green) — falhas são bugs reais que precisam de fix antes de release.
- [ ] Slash commands `/ksdd-start` e `/ksdd-spec` rodaram em opencode sem crash e produziram `brainstorm.md` e `SPEC.md` no projeto-teste.
- [ ] `pruneEmptyDirs` não removeu diretórios pai não-vazios (safety check passou).
- [ ] Quick start do README executado conforme documentado funciona sem ajustes.
- [ ] Qualquer bug encontrado tem linha "Bug: <descrição>. Owner: task NNN (já existente ou nova)" no relatório.
- [ ] Mantenedor revisa e aprova o relatório antes de fazer `npm publish`.

## Notas técnicas
- Para evitar contaminar a instalação pessoal, fazer os testes destrutivos em `tmpfs` ou container Docker quando possível: `docker run -it --rm -v $(pwd):/repo node:20 bash` é suficiente pra Linux.
- `OPENCODE_HOME=/tmp/fake-opencode` permite testes isolados sem precisar opencode instalado.
- Cenário 10/11 (slash commands reais em opencode) exige opencode com API key configurada. Se ambiente CI não tem, marcar esses 2 cenários como `[verificar]` e completar em desktop.
- O relatório segue o estilo de `.ksdd/tasks/feature-archive-features/QA-REPORT.md` (precedente recente — abrir como referência).

## Riscos / dependências externas
- Depende de **todas** as tasks anteriores (020-026) — não tem como QA antes da implementação completa.
- Risco médio: ambiente de teste não ter opencode instalado em uma das plataformas → cenários 10/11 ficam `[verificar]`. Mitigação: documentar e marcar como pendente, não bloquear release se outros 9 cenários passam.
- Risco baixo: bugs descobertos exigem novo ciclo de task → resolver → re-QA. Se bug é crítico (ex: uninstall apaga arquivos errados), feature não pode releaseear.
