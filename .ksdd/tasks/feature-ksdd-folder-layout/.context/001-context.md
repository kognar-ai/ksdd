# Context — Task 001: spec-phase commands para `.ksdd/specs/`

**Task:** docs/tasks/feature-ksdd-folder-layout/001-update-spec-phase-commands.md
**FEATURE:** docs/FEATURE-ksdd-folder-layout.md (seções 2.1, 4.1, 4.2, 8.3, 10)
**Branch:** feat/change-docs-location (single-PR strategy)

## Objetivo
Alinhar os 4 commands da fase de spec (`start`, `spec`, `tech`, `design`) ao novo layout `.ksdd/specs/` com leitura backward-compatible.

## Arquivos a editar
- `commands/start.md` — gera `.ksdd/specs/brainstorm.md`
- `commands/spec.md` — lê brainstorm com fallback; gera `.ksdd/specs/SPEC.md`
- `commands/tech.md` — lê SPEC/brainstorm com fallback; gera `.ksdd/specs/architecture.md`
- `commands/design.md` — lê SPEC/architecture com fallback; gera `.ksdd/specs/DESIGN.md`

## Snippet padrão a inserir em cada command

Cada command ganha um bloco "## Paths dos artefatos (v0.6.0+)" perto do topo, com:
1. Tabela de paths default em `.ksdd/specs/`
2. Regra de leitura: novo primeiro, fallback raiz, warning amarelo no fallback
3. Regra de conflito: ambos existem com conteúdos diferentes → abort
4. Regra de escrita: sempre `.ksdd/specs/` com `mkdir -p` prévio

E em todas as menções no fluxo (passo 1, passo 4, etc.) substituir `view brainstorm.md` por `view .ksdd/specs/brainstorm.md` (com nota de fallback) e `create_file brainstorm.md` por `create_file .ksdd/specs/brainstorm.md` (com `mkdir -p`).

## Plano de edição

**start.md:**
- Inserir bloco "Paths" antes do "Fluxo".
- Substituir referências a `brainstorm.md` no passo 1 (verificar contexto) e passo 4 (gerar).
- Atualizar checkpoint final (passo 5) mencionando path novo.

**spec.md:**
- Bloco "Paths" antes do "Fluxo".
- Pré-requisito (`brainstorm.md aprovado`) ganha texto do fallback.
- Passo 1 (ler brainstorm) com fallback explicado.
- Passo 4 (gerar SPEC) escreve em `.ksdd/specs/SPEC.md`.

**tech.md:**
- Bloco "Paths".
- Pré-requisito (`SPEC.md aprovado`) com fallback.
- Passo 1 (ler SPEC + brainstorm) com fallback.
- Passo 4 (gerar architecture) escreve em `.ksdd/specs/architecture.md`.

**design.md:**
- Bloco "Paths".
- Pré-requisito (`SPEC.md aprovado`, `architecture.md opcional`) com fallback.
- Passo 1 (ler SPEC + architecture).
- Passo 5 (gerar DESIGN) escreve em `.ksdd/specs/DESIGN.md`.
- Checkpoint (passo 7) com paths novos nos exemplos de `npx @google/design.md`.

## Quality gates (markdown-only)
- [ ] `grep -n "view SPEC.md\|view brainstorm.md\|create_file SPEC.md\|create_file brainstorm.md" commands/{start,spec,tech,design}.md` só retorna match dentro de blocos de fallback/legado
- [ ] Cada um dos 4 commands tem o bloco "Paths dos artefatos" presente
- [ ] Cada command menciona o padrão de warning amarelo e regra de conflito
- [ ] Leitura crítica pra garantir que o fluxo continua coerente após edição
