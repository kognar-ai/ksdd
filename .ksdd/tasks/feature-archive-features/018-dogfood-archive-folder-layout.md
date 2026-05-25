---
id: 018
title: Dogfooding — arquivar feature ksdd-folder-layout no próprio repo
status: em revisão
feature: archive-features
area: backend
priority: P0
estimate: S
depends_on: [017]
feature_refs:
  - ".ksdd/features/FEATURE-archive-features.md#11-fases-de-implementação"
  - ".ksdd/features/FEATURE-archive-features.md#10-critérios-de-aceite"
spec_refs:
  - ".ksdd/specs/SPEC.md#42-artefatos-ksdd-gerados-pelos-commands-no-diretorio-do-projeto-alvo"
arch_refs: []
---

# 018 — Dogfooding: arquivar feature `ksdd-folder-layout` no próprio repo

## Objetivo
Validar end-to-end a feature `archive-features` arquivando a primeira feature já entregue do KSDD (`ksdd-folder-layout`) no próprio repositório, gerando a primeira entrada de `.ksdd/archive/ARCHIVE.md` e movendo os artefatos para `.ksdd/archive/raw/ksdd-folder-layout/`.

## Escopo
- Pré-requisito: todas as 10 tasks da `feature-ksdd-folder-layout` precisam estar com `status: concluída` (algumas estão em `em revisão`). Antes de arquivar, atualizar status onde aplicável **ou** documentar que o dogfooding aguarda merge do PR final dessa feature.
- Rodar `/ksdd:archive ksdd-folder-layout --dry-run` primeiro para preview.
- Aprovado o dry-run → rodar `/ksdd:archive ksdd-folder-layout` real.
- Confirmar artefatos:
  - `.ksdd/features/FEATURE-ksdd-folder-layout.md` não existe mais (movido).
  - `.ksdd/tasks/feature-ksdd-folder-layout/` não existe mais (movido).
  - `.ksdd/archive/raw/ksdd-folder-layout/FEATURE-ksdd-folder-layout.md` existe.
  - `.ksdd/archive/raw/ksdd-folder-layout/tasks/` existe com README.md e as 10 NNN-*.md.
  - `.ksdd/archive/ARCHIVE.md` existe com header global + seção da feature no topo.
- Commit atômico do estado pós-archive: `chore(dogfood): arquiva feature ksdd-folder-layout via /ksdd:archive`.

## Fora de escopo
- Criar a feature ou as tasks (já existem em `.ksdd/`).
- Implementar o `/ksdd:archive` (tasks 011-017).
- QA das demais combinações (task 019 cobre).

## Critérios de aceitação
- [ ] Todas as tasks da feature `ksdd-folder-layout` estão com `status: concluída` antes do archive (ou pré-condição documentada como aguardando merge).
- [ ] `/ksdd:archive ksdd-folder-layout --dry-run` reporta preview correto sem mexer em nada.
- [ ] `/ksdd:archive ksdd-folder-layout` (sem dry-run) executa com sucesso.
- [ ] `.ksdd/features/FEATURE-ksdd-folder-layout.md` foi removido (movido para `raw/`).
- [ ] `.ksdd/tasks/feature-ksdd-folder-layout/` foi removido (movido para `raw/.../tasks/`).
- [ ] `.ksdd/archive/raw/ksdd-folder-layout/FEATURE-ksdd-folder-layout.md` existe e tem conteúdo idêntico ao original.
- [ ] `.ksdd/archive/raw/ksdd-folder-layout/tasks/` tem README.md + as 10 tasks NNN-*.md.
- [ ] `.ksdd/archive/ARCHIVE.md` existe com header global + 1 seção (a da feature).
- [ ] A seção da feature em `ARCHIVE.md` contém: header com âncora, objetivo (extraído da FEATURE 1.1), lista das 10 tasks, checklist dos critérios de aceite (da FEATURE 10), pointer para raw/.
- [ ] Commit atômico realizado com mensagem clara.
- [ ] `git diff HEAD~1` mostra apenas moves + criação de ARCHIVE.md (nenhuma edição de conteúdo dos arquivos movidos).

## Notas técnicas
- O archive desta feature gera ~10 task-files movidos + ARCHIVE.md criado. Diff resultante deve ser limpo: renames + 1 arquivo novo.
- Esta task **depende de 017** porque o pacote precisa estar releaseável (versão bumpada, docs atualizados) para garantir que o dogfooding rode na versão que será publicada.
- Após esta task, a feature `ksdd-folder-layout` deixa de aparecer em `.ksdd/features/` — apenas `archive-features` permanece ativa. Bom sinal visual.

## Riscos / dependências externas
- Se alguma task de `folder-layout` ainda estiver em `em revisão` quando esta task rodar, archive vai abortar com mensagem de bloqueadora. Mitigação: confirmar status antes, ou marcar `--restore` se foi feito por engano.
- Esta task valida o "feliz path" do archive. Casos negativos (slug inexistente, conflito, etc.) ficam em 019.
- Possível decisão de produto: arquivar agora ou esperar QA da folder-layout fechar oficialmente. Documentar a decisão no commit.
