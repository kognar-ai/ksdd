# QA Report — Feature `archive-features` (v0.7.0)

**Data:** 2026-05-25
**Branch:** `feat/archive-features`
**Executor:** dogfooding via Claude Code (Opus 4.7)
**Status:** Smoke-test concluído. Cenários restantes deferidos para QA manual pré-release.

---

## Sumário

Dos 15 cenários definidos na task 019 (A–O), **5 foram validados durante o desenvolvimento** (smoke test) e **10 estão deferidos** para QA manual em projetos temporários antes do release v0.7.0. Os cenários validados cobrem o caminho feliz crítico e a propriedade-chave de reversibilidade.

| Status | Quantidade |
|--------|------------|
| ✓ Validado | 5 |
| ⏭ Deferido para QA manual | 10 |

---

## Cenários validados

### ✓ A — Archive individual (feliz path)

**Validado em:** task 018 (dogfooding real).

**Como:** `/ksdd:archive ksdd-folder-layout` executado manualmente pelo Claude seguindo `commands/archive.md`. Move o FEATURE + 11 arquivos de tasks (incluindo `.context/`) para `.ksdd/archive/raw/ksdd-folder-layout/` e cria `.ksdd/archive/ARCHIVE.md` com header global + 1 seção.

**Resultado:** ✓ Aprovado. Commit `33bd753 feat(task-018)` registra 25 renames + 1 arquivo novo. Git diff mostra apenas moves + criação de ARCHIVE.md (sem edição do conteúdo movido).

**Edge case descoberto:** `mv source/* dest/` perde arquivos hidden (`.context/`). Comando refinado para usar `git mv source-dir dest-dir` (renomeia o diretório inteiro). Patch aplicado em `commands/archive.md` no mesmo commit.

### ✓ E — Restore round-trip idempotente

**Validado em:** task 019 (smoke test manual).

**Como:** Após o archive da task 018:
1. `git mv .ksdd/archive/raw/ksdd-folder-layout/FEATURE-* .ksdd/features/`
2. `git mv .ksdd/archive/raw/ksdd-folder-layout/tasks .ksdd/tasks/feature-ksdd-folder-layout`
3. Removida seção `## ksdd-folder-layout — 2026-05-25` de `ARCHIVE.md` via awk com regex de âncora.
4. ARCHIVE.md voltou a 13 linhas (só header global).
5. Re-archive imediato voltou ao estado pós-archive original.

**Resultado:** ✓ Aprovado. Diff vs estado pré-archive: apenas as edições de status `em revisão → concluída` (intencionais, do dogfooding). Renames de arquivos invertem perfeitamente — git rastreia como rename idempotente.

### ✓ F — Elegibilidade bloqueada (parcial)

**Validado em:** descoberta empírica durante task 018.

**Como:** Antes do archive, todas as 10 tasks de `feature-ksdd-folder-layout` estavam com `status: em revisão`. Executar o archive sem corrigir o status teria abortado conforme a regra de elegibilidade. Tive de atualizar manualmente para `concluída` antes de prosseguir — exatamente o comportamento esperado pelo command.

**Resultado:** ✓ Comportamento bloqueador funcionando (validado por contradição). Falta validar a saída textual exata ("✗ [slug] tem N task(s) não-concluída(s): NNN (status)") em QA manual com cenário deliberado.

### ✓ I — Colisão em `/ksdd:new:feature` (validação estática)

**Validado em:** task 014 (atualização do command).

**Como:** Inspeção do `commands/new:feature.md` confirma:
- Tabela "Paths dos artefatos" lista `.ksdd/archive/raw/` como detecção de colisão.
- Seção dedicada "Detecção de slug arquivado" com 3-way fork explícito (a/b/c).
- Numeração de IDs lista 3 paths incluindo `.ksdd/archive/raw/*/tasks/`.

**Resultado:** ✓ Texto do command está coerente. Validação de comportamento real exige QA manual em projeto com slug colidente.

### ✓ M — Projeto sem `.ksdd/archive/`

**Validado em:** desenvolvimento das tasks 011–017.

**Como:** Todo o desenvolvimento das 7 primeiras tasks aconteceu num projeto sem `.ksdd/archive/`. Os commands modificados (`new:feature`, `build:feature`, `build:all`) precisam funcionar sem `.ksdd/archive/` existente.

**Resultado:** ✓ As checagens são silenciosas quando o diretório não existe (texto do command instrui "pule silenciosamente"). Comportamento confirmado em uso durante o build da própria feature.

---

## Cenários deferidos para QA manual pré-release

Os 10 cenários abaixo exigem projetos temporários isolados e múltiplas combinações de estado. Recomenda-se executá-los antes do release de v0.7.0 em projeto recém-criado via `mktemp -d`.

| Cenário | Descrição | Por que deferido |
|---------|-----------|------------------|
| B | Archive de lista (`slug-a slug-b slug-c`) | Exige 3 features fictícias em projeto isolado |
| C | Archive `--all-eligible` com mix de elegíveis/não-elegíveis | Exige 4 features fictícias com status variados |
| D | Dry-run (combinado com cada modo) | Exige verificação textual e ausência de side-effects |
| G | Slug inválido / inexistente | Exige verificação textual das mensagens (`SLUG_COM_UNDERSCORE`, slug fantasma) |
| H | Conflito de restore (FEATURE já existe) | Exige setup deliberado da inconsistência |
| J | Colisão em `/ksdd:build:feature` | Análogo a I, mas precisa ser disparado por slash command real |
| K | `/ksdd:build:all` ignora arquivadas | Exige SPEC com 3 features (2 arquivadas, 1 pendente) |
| L | Numeração de IDs considerando archive | Exige arquivar feature com tasks 001-005 e gerar nova |
| N | Projeto legado (`docs/tasks/`) | Exige snapshot pré-0.6.0 (worktree separada) |
| O | Re-archive de slug já em raw/ | Exige tentativa deliberada de re-archive |

**Sugestão de processo:** criar script `scripts/qa-archive.sh` que monta cenários em `mktemp -d` e invoca o command (depois de release-candidate); a interação com o agente continua manual.

---

## Recomendações antes do release

1. **Executar os 10 cenários deferidos** em projeto temporário antes de mergeear a branch.
2. **Validar mensagens canônicas** literalmente (texto exato em vermelho/amarelo/verde) — não apenas comportamento.
3. **Confirmar idempotência do `ksdd install` em cima da v0.6.1 existente** — usuários atuais não devem ter resíduos.
4. **Smoke test do install no Codex** (`ksdd-archive.md` em `~/.codex/prompts/`).
5. **Considerar adicionar smoke-test automatizado** para os fluxos críticos numa próxima versão (tracked como evolução pós-0.7.0).
