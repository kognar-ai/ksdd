# Context — Task 002: new:feature command para `.ksdd/features/` + `.ksdd/tasks/`

**Task:** docs/tasks/feature-ksdd-folder-layout/002-update-new-feature-command.md
**FEATURE:** docs/FEATURE-ksdd-folder-layout.md (seções 2, 4, 6)

## Plano de edição em commands/new:feature.md
- Atualizar description do frontmatter para mencionar `.ksdd/`.
- Atualizar `--tasks-only` na seção "Argumentos" (já cobre legado; adicionar `.ksdd/features/`).
- Inserir bloco "Paths dos artefatos (v0.6.0+)" cobrindo:
  - Leitura: specs em `.ksdd/specs/` → raiz; features em `.ksdd/features/` → `docs/` → raiz; tasks em `.ksdd/tasks/` → `docs/tasks/`.
  - Escrita: feature em `.ksdd/features/FEATURE-[slug].md`; tasks em `.ksdd/tasks/feature-[slug]/`.
  - Warning amarelo padronizado em qualquer fallback.
  - Numeração de tasks considera IDs em ambos os paths para evitar colisão.
- Atualizar passo 1 (ler artefatos) com fallback.
- Atualizar passo 5 (gerar FEATURE) para escrever em `.ksdd/features/`.
- Atualizar passo 6 (checkpoint do FEATURE) com path novo.
- Atualizar passo 7c (formato da task): frontmatter `feature_refs/spec_refs/arch_refs` aponta para paths novos por default.
- Atualizar passo 8 (README de tasks) com paths novos.
- Atualizar passo 9 (checkpoint final) com paths novos.
- Atualizar seção "Iteração" para reconhecer os 3 paths possíveis de FEATURE.

## Quality gates
- [ ] grep não encontra `docs/FEATURE-` ou `docs/tasks/` fora de blocos de fallback/legado.
- [ ] Bloco "Paths dos artefatos" presente.
- [ ] Frontmatter template das tasks usa `.ksdd/specs/SPEC.md` etc.
