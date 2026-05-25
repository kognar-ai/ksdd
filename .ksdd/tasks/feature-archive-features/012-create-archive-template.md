---
id: 012
title: Criar references/archive-template.md (template canônico para seções de ARCHIVE.md)
status: em revisão
feature: archive-features
area: backend
priority: P0
estimate: S
depends_on: []
feature_refs:
  - ".ksdd/features/FEATURE-archive-features.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-archive-features.md#52-superfícies-novas"
  - ".ksdd/features/FEATURE-archive-features.md#61-novas-entidades-artefatos"
spec_refs:
  - ".ksdd/specs/SPEC.md#43-templates-canônicos-references"
arch_refs: []
---

# 012 — Criar `references/archive-template.md`

## Objetivo
Criar o template canônico que define o formato de cada seção de feature dentro de `.ksdd/archive/ARCHIVE.md`, garantindo consistência entre invocações do `/ksdd:archive` e facilitando a leitura humana e por agentes.

## Escopo
- Criar `references/archive-template.md` com:
  - Header global do `ARCHIVE.md` (usado na primeira invocação): título do arquivo, propósito em 2-3 linhas, pointer para `.ksdd/archive/raw/` e para o command `/ksdd:archive --restore [slug]`.
  - Template de seção de feature individual com placeholders: `[SLUG]`, `[TITLE]`, `[ARCHIVED_DATE]` (YYYY-MM-DD), `[PRIORITY]`, `[OBJECTIVE]`, `[TASKS_LIST]`, `[ACCEPTANCE_CRITERIA]`, `[RAW_POINTER]`.
  - Exemplo preenchido (1 seção fictícia) demonstrando o formato esperado.
- Estrutura de cada seção (FEATURE seção 2.1):
  1. Header `## [SLUG] — [ARCHIVED_DATE]` (âncora estável).
  2. Linha de metadata em itálico: `[TITLE] · Prioridade: [PRIORITY] · Arquivado em [ARCHIVED_DATE]`.
  3. Subsubseção "Objetivo" com 1 parágrafo (extraído de `FEATURE seção 1.1`).
  4. Subsubseção "Tasks" com lista markdown `- NNN — Título (área) — status final`.
  5. Subsubseção "Critérios de aceite" com checklist preservando `[x]`/`[ ]` da FEATURE seção 10.
  6. Linha final em itálico: `Conteúdo bruto: .ksdd/archive/raw/[SLUG]/`.
- Documentar (em comentário no topo do arquivo) que o template é lido por `/ksdd:archive` e não deve ser editado pelo usuário do projeto-alvo.

## Fora de escopo
- Lógica de geração (lida em `commands/archive.md`, task 011).
- Distribuição/instalação do template (responsabilidade do `copyDir` em `bin/ksdd.js`, verificada na task 013).
- Outros templates de `references/`.

## Critérios de aceitação
- [ ] `references/archive-template.md` existe e segue convenção dos outros templates em `references/` (sem frontmatter — é template lido pelo command).
- [ ] Header global do `ARCHIVE.md` está definido e é único (não duplica em re-invocações).
- [ ] Template de seção tem âncora estável `## [SLUG] — [ARCHIVED_DATE]` para suportar remoção via regex em `--restore`.
- [ ] Todos os placeholders (`[SLUG]`, `[TITLE]`, `[ARCHIVED_DATE]`, `[PRIORITY]`, `[OBJECTIVE]`, `[TASKS_LIST]`, `[ACCEPTANCE_CRITERIA]`, `[RAW_POINTER]`) estão documentados no template.
- [ ] Exemplo preenchido renderiza markdown válido e ilustra todas as seções.
- [ ] Comentário no topo deixa claro: imutável no projeto-alvo, lido por `/ksdd:archive`.

## Notas técnicas
- Outros templates em `references/` (ex: `references/feature-template.md`) usam placeholders entre colchetes `[Nome do Campo]`. Manter convenção.
- A âncora `## [SLUG] — [ARCHIVED_DATE]` precisa ser específica o suficiente para regex no `--restore` (task 011): pattern sugerido `^## \[?slug-real\]?\s+—\s+\d{4}-\d{2}-\d{2}\s*$`.
- O exemplo preenchido pode usar uma feature fictícia (ex: `example-feature`) para não confundir com features reais do dogfooding.

## Riscos / dependências externas
- Mudar formato do template entre versões quebra `--restore` em entries antigas. Mitigação: documentar versão do template no header global do `ARCHIVE.md` (campo `template-version`).
