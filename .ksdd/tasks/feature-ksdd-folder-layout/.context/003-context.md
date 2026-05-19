# Context — Task 003: build:feature command para `.ksdd/tasks/.context/`

**Task:** docs/tasks/feature-ksdd-folder-layout/003-update-build-feature-command.md
**Depende de:** 002 (concluída em commit 8209f84)

## Plano de edição em commands/build:feature.md
- Atualizar `description` frontmatter.
- Atualizar seção "Argumentos" para refletir resolução de paths em `.ksdd/tasks/` antes do legado.
- Inserir bloco "Paths dos artefatos (v0.6.0+)" descrevendo a regra: o path onde a task vive dita onde fica seu context.md e o README a ser atualizado.
- Atualizar seção 1 (resolver task) listando os paths de busca.
- Atualizar seção 1.4 (ler artefatos referenciados) com nomes de path novos.
- Atualizar seção 4 (gerar context.md) para usar `.ksdd/tasks/feature-[slug]/.context/` (ou path legado se task vive lá).
- Atualizar seção 8 (atualizar status) com path correto.
- Atualizar seção 9 (PR body) com link pro FEATURE no path correto.
- Atualizar seção "Artefatos read-only" cobrindo paths novos.

## Quality gates
- [ ] grep `docs/FEATURE-\|docs/tasks/` só em blocos de fallback/legado.
- [ ] Bloco "Paths dos artefatos" presente.
- [ ] Resolver argumento procura `.ksdd/` primeiro.
