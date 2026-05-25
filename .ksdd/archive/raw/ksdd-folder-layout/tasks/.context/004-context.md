# Context — Task 004: build:all command para `.ksdd/build/`

**Task:** docs/tasks/feature-ksdd-folder-layout/004-update-build-all-command.md

## Plano
- Atualizar description.
- Inserir bloco "Paths dos artefatos (v0.6.0+)".
- Atualizar A.1 (absorver contexto) com fallback para todos os artefatos.
- Atualizar A.4 (gerar features e tasks) escrevendo em `.ksdd/features/` e `.ksdd/tasks/`.
- Atualizar A.5 (gerar BUILD-PLAN) escrevendo em `.ksdd/build/BUILD-PLAN.md`.
- Atualizar A.6 (checkpoint) com paths novos.
- Atualizar B.7 (atualizar BUILD-PLAN.md) com path novo.
- Atualizar seção "--resume" (ler BUILD-PLAN e READMEs em path correto).
- Atualizar seção "Artefatos read-only" cobrindo paths novos.
- Adicionar regra de conflito/warning.

## Quality gates
- [ ] grep paths legados só em fallback/legado.
- [ ] Bloco "Paths" presente.
- [ ] BUILD-PLAN escrito em .ksdd/build/.
