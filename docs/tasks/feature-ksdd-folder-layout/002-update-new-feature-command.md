---
id: 002
title: Atualizar commands/new:feature.md para .ksdd/features/ + .ksdd/tasks/
status: em revisão
feature: ksdd-folder-layout
area: backend
priority: P0
estimate: M
depends_on: []
feature_refs:
  - "docs/FEATURE-ksdd-folder-layout.md#2-escopo"
  - "docs/FEATURE-ksdd-folder-layout.md#6-impacto-no-modelo-de-dados"
spec_refs:
  - "SPEC.md#42-artefatos-ksdd-gerados-pelos-commands-no-diretorio-do-projeto-alvo"
  - "SPEC.md#133-implementacao-de-feature-isolada"
arch_refs: []
---

# 002 — Atualizar `commands/new:feature.md` para novo layout

## Objetivo
Migrar geração de feature spec e quebra de tasks para `.ksdd/features/` e `.ksdd/tasks/` com leitura backward-compatible das specs em `.ksdd/specs/` (e fallback raiz).

## Escopo
- Editar `commands/new:feature.md` para:
  - Ler `SPEC.md`, `brainstorm.md`, `architecture.md`, `DESIGN.md` de `.ksdd/specs/` com fallback raiz.
  - Detectar `docs/FEATURE-*.md` legado (e `FEATURE-*.md` raiz mais legado) para evitar duplicação.
  - Gerar feature spec em `.ksdd/features/FEATURE-[slug].md` (criar pasta).
  - Gerar tasks em `.ksdd/tasks/feature-[slug]/NNN-*.md` (criar pasta).
  - Gerar `.ksdd/tasks/feature-[slug]/README.md` index.
- Atualizar todos os exemplos de path no prompt do command.
- Atualizar referências `feature_refs`/`spec_refs`/`arch_refs` no template de frontmatter de task para apontar paths novos (`.ksdd/specs/SPEC.md`, `.ksdd/features/FEATURE-...`).
- Adicionar bloco de warning padronizado quando detectar FEATURE legado em `docs/`.
- Adicionar suporte ao argumento `--tasks-only` lendo FEATURE de qualquer dos 3 paths (novo / docs / raiz legados).

## Fora de escopo
- Mudar formato do FEATURE template (continua usando `references/feature-template.md` — task 006 atualiza o template).
- Modificar `build:feature.md` (task 003).
- Geração automática de migrate (FEATURE 2.2).

## Critérios de aceitação
- [ ] `commands/new:feature.md` lê specs primeiro de `.ksdd/specs/` e faz fallback para raiz.
- [ ] Escreve FEATURE em `.ksdd/features/FEATURE-[slug].md` com `mkdir -p .ksdd/features/` prévio.
- [ ] Escreve tasks em `.ksdd/tasks/feature-[slug]/` com `mkdir -p` prévio.
- [ ] Numeração de tasks considera IDs existentes em `.ksdd/tasks/` E em `docs/tasks/` (legado) — não colidir.
- [ ] Frontmatter de task gerado contém `feature_refs: ["docs/FEATURE-... ou .ksdd/features/FEATURE-..."]` conforme o path usado.
- [ ] Bloco de warning padronizado (formato FEATURE seção 8.3) presente quando detectar FEATURE em `docs/` legado.
- [ ] README.md de tasks (índice) gerado em `.ksdd/tasks/feature-[slug]/README.md` com refs aos paths novos.
- [ ] Mensagem final do command sugere `/ksdd:build:feature [slug]` com paths atualizados.

## Notas técnicas
- Atenção ao "anti-pattern não sobrescrever" da seção "Iteração" — manter o comportamento atual de continuar numeração.
- Cuidado com a linha "Se já existem tasks em `docs/tasks/`": precisa cobrir tanto novo path quanto legado.

## Riscos / dependências externas
- Se task 003 (build:feature) ler de path diferente do que esta task escreve, fluxo quebra. Coordenar via critério de aceitação compartilhado: ambos usam `.ksdd/tasks/feature-[slug]/`.
