# Context — Task 009: dogfooding migration

## Plano
1. `mkdir -p .ksdd/specs .ksdd/features .ksdd/tasks`
2. `git mv brainstorm.md .ksdd/specs/brainstorm.md`
3. `git mv SPEC.md .ksdd/specs/SPEC.md`
4. `git mv architecture.md .ksdd/specs/architecture.md`
5. `git mv docs/FEATURE-ksdd-folder-layout.md .ksdd/features/FEATURE-ksdd-folder-layout.md`
6. `git mv docs/tasks/feature-ksdd-folder-layout .ksdd/tasks/feature-ksdd-folder-layout`
7. Atualizar seção 4.2 do SPEC (que vira `.ksdd/specs/SPEC.md`) para refletir paths novos como default + nota de legado.
8. Atualizar seção 1 do architecture (diagrama) com paths novos.
9. Remover diretório `docs/` se vazio.
10. Commit atômico.

## Quality gates
- [ ] git status limpo após.
- [ ] ls .ksdd/ mostra specs/, features/, tasks/.
- [ ] git log --follow .ksdd/specs/SPEC.md mostra histórico preservado.
- [ ] Refs cruzadas em SPEC seção 4.2 atualizadas.
