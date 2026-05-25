<!--
  Template canônico para .ksdd/archive/ARCHIVE.md
  
  Imutável no escopo do projeto-alvo. Lido pelo command /ksdd:archive em
  ~/.claude/skills/ksdd/references/archive-template.md ou
  ~/.agents/skills/ksdd/references/archive-template.md.
  
  Versão: 1
  
  Estrutura:
   1. Header global (usado apenas na primeira invocação do /ksdd:archive
      em um projeto). Contém propósito, pointer para raw/, instrução de
      uso de --restore e o marker <!-- new entries appear below --> que
      é a âncora de inserção para novas seções.
   2. Template de seção de feature (placeholders entre colchetes).
   3. Exemplo preenchido (apenas para referência humana — não copiar).
  
  Convenção de placeholders:
    [SLUG]              kebab-case da feature
    [TITLE]             título extraído da linha "# Feature: ..." do FEATURE.md
    [ARCHIVED_DATE]     data de arquivamento no formato YYYY-MM-DD
    [PRIORITY]          prioridade da feature (Crítica/Alta/Média/Baixa)
    [OBJECTIVE]         primeiro parágrafo da seção "## 1. Motivação > ### 1.1"
    [TASKS_LIST]        lista markdown de tasks: "- NNN — Título (área) — status"
    [ACCEPTANCE_CRITERIA] checklist preservando [x]/[ ] da seção "## 10. Critérios de Aceite"
    [RAW_POINTER]       sempre ".ksdd/archive/raw/[SLUG]/"
-->

<!-- =============================== -->
<!-- HEADER GLOBAL (primeira inserção apenas) -->
<!-- =============================== -->

# ARCHIVE — Features KSDD arquivadas

> Índice cronológico decrescente das features deste projeto que já foram entregues e arquivadas via `/ksdd:archive`. Cada seção resume uma feature; o conteúdo bruto (FEATURE-[slug].md + tasks) vive em `.ksdd/archive/raw/[slug]/`.

**Como usar:**
- Para consultar o resumo de uma feature, role até a seção `## [slug] — YYYY-MM-DD`.
- Para reabrir uma feature arquivada: `/ksdd:archive --restore [slug]` (move `raw/[slug]/` de volta para `.ksdd/features/` e `.ksdd/tasks/`).
- Para arquivar mais features: `/ksdd:archive [slug]` ou `/ksdd:archive --all-eligible`.

**Template-version:** 1

<!-- new entries appear below -->


<!-- =============================== -->
<!-- TEMPLATE DE SEÇÃO DE FEATURE -->
<!-- (uma instância por feature arquivada, inserida logo após o marker acima) -->
<!-- =============================== -->

## [SLUG] — [ARCHIVED_DATE]

*[TITLE] · Prioridade: [PRIORITY] · Arquivado em [ARCHIVED_DATE]*

### Objetivo

[OBJECTIVE]

### Tasks

[TASKS_LIST]

### Critérios de aceite

[ACCEPTANCE_CRITERIA]

*Conteúdo bruto: [RAW_POINTER]*


<!-- =============================== -->
<!-- EXEMPLO PREENCHIDO (referência humana — NÃO copiar para ARCHIVE.md real) -->
<!-- =============================== -->

<!--

## example-feature — 2026-05-25

*Sistema de exemplo · Prioridade: Alta · Arquivado em 2026-05-25*

### Objetivo

Demonstrar como uma feature arquivada aparece no índice cronológico. Esta seção é puramente ilustrativa e não corresponde a uma feature real do projeto.

### Tasks

- 001 — Setup inicial do módulo (backend) — concluída
- 002 — Criar endpoint POST /api/example (backend) — concluída
- 003 — Tela de listagem (frontend) — concluída
- 004 — Testes E2E (qa) — concluída
- 005 — Documentação (backend) — cancelada

### Critérios de aceite

- [x] Endpoint retorna 201 em criação válida
- [x] Tela lista no máximo 50 items por página
- [x] Cobertura de testes ≥ 80%
- [x] Documentação publicada (cancelado — virou tarefa de v2)

*Conteúdo bruto: .ksdd/archive/raw/example-feature/*

-->
