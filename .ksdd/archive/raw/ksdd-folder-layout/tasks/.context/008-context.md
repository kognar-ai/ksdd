# Context — Task 008: docs públicas + bump 0.6.0

## Plano
- **package.json**: 0.5.2 → 0.6.0.
- **CHANGELOG.md**: nova entrada `## [0.6.0] - 2026-05-19` no topo, com 4 sub-bullets (layout, compat, migração, 1.0 futuro).
- **README.md**:
  - Atualizar diagrama "fluxo" mostrando paths .ksdd/.
  - Atualizar bloco de "Output esperado" com nova árvore.
  - Adicionar nota de migração v0.6.0.
- **INSTALL.md**:
  - Atualizar Comandos suportados table com paths novos.
  - Atualizar comandos `npx @google/design.md` com `.ksdd/specs/DESIGN.md`.
  - Adicionar nota breve sobre layout.

## Quality gates
- [ ] package.json válido.
- [ ] CHANGELOG entry no topo.
- [ ] README "Output esperado" mostra .ksdd/ árvore.
- [ ] INSTALL menciona path novo nos comandos npx.
