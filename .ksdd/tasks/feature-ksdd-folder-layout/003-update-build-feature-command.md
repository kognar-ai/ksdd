---
id: 003
title: Atualizar commands/build:feature.md para .ksdd/tasks/.context/
status: em revisão
feature: ksdd-folder-layout
area: backend
priority: P0
estimate: S
depends_on: [002]
feature_refs:
  - "docs/FEATURE-ksdd-folder-layout.md#2-escopo"
  - "docs/FEATURE-ksdd-folder-layout.md#6-impacto-no-modelo-de-dados"
spec_refs:
  - "SPEC.md#42-artefatos-ksdd-gerados-pelos-commands-no-diretorio-do-projeto-alvo"
  - "SPEC.md#133-implementacao-de-feature-isolada"
arch_refs: []
---

# 003 — Atualizar `commands/build:feature.md` para novo layout

## Objetivo
Migrar leitura de tasks e gravação de `context.md` de implementação para `.ksdd/tasks/feature-[slug]/.context/`, com fallback para `docs/tasks/` legado.

## Escopo
- Editar `commands/build:feature.md` para:
  - Resolver argumentos (slug, ID, slug parcial, path completo) considerando `.ksdd/tasks/` primeiro, fallback `docs/tasks/`.
  - Resolver `feature_refs` aceitando `.ksdd/features/FEATURE-*.md`, `docs/FEATURE-*.md`, ou `FEATURE-*.md` raiz.
  - Resolver `spec_refs` aceitando `.ksdd/specs/SPEC.md` ou raiz.
  - Resolver `arch_refs` aceitando `.ksdd/specs/architecture.md` ou raiz.
  - Gravar `context.md` em `.ksdd/tasks/feature-[slug]/.context/NNN-context.md` (criar pasta).
  - Atualizar `status` no frontmatter da task no path correto (novo ou legado conforme onde a task vive).
  - Atualizar `README.md` de tasks no path correto.
- Atualizar todos os exemplos de paths nas seções do prompt.

## Fora de escopo
- Mudar fluxo de subagent orquestrado (continua igual).
- Mudar critérios de quality gates.
- Mudar formato do context.md (só path).

## Critérios de aceitação
- [ ] Resolver argumento `[slug]` busca tasks em `.ksdd/tasks/feature-[slug]/` primeiro, depois `docs/tasks/feature-[slug]/`.
- [ ] Resolver argumento `[id]` busca em ambos os paths e desambigua se necessário.
- [ ] `context.md` é gravado em `.ksdd/tasks/feature-[slug]/.context/NNN-context.md` quando a task vive no novo path.
- [ ] `context.md` é gravado em `docs/tasks/feature-[slug]/.context/NNN-context.md` quando a task vive no legado (compat).
- [ ] Atualização do `status: em revisão` da task respeita o path original.
- [ ] Atualização do README.md de tasks respeita o path original.
- [ ] Seção "Artefatos são read-only" continua mencionando todos os artefatos com paths novos como exemplo principal.

## Notas técnicas
- O fallback "task no legado" é importante para projetos meio-migrados (algumas features em .ksdd/, outras em docs/).
- A regra é: o path da task dita onde fica seu context.md e README.

## Riscos / dependências externas
- Depende de task 002 ter definido `.ksdd/tasks/` como path padrão para tasks novas.
