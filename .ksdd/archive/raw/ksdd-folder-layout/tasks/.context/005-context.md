# Context — Task 005: setup command para novo layout + detecção de legados

**Task:** docs/tasks/feature-ksdd-folder-layout/005-update-setup-command.md
**Depende de:** 001 ✓, 002 ✓

## Plano
- Atualizar description com .ksdd/specs/ default.
- Inserir bloco "Paths dos artefatos (v0.6.0+)" curto antes da Fase 0.
- Atualizar Fase 0.1 (verificar artefatos KSDD existentes) para checar `.ksdd/specs/`, raiz e `docs/` legado. Quando detectar legados E projeto vazio em `.ksdd/`, perguntar 3 opções (FEATURE 4.3):
  (a) gerar em `.ksdd/` separadamente; (b) mover legados manualmente e re-rodar; (c) abortar.
- Atualizar Fase 4 (geração) para criar pastas e escrever em `.ksdd/specs/`.
- Atualizar Fase 5 (checkpoint final) com paths novos.
- Atualizar 4.1 / 4.2 / 4.3 / 4.4 mencionando paths novos.

## Quality gates
- [ ] Fase 0.1 detecta legados (raiz + docs/).
- [ ] Fase 4 gera tudo em .ksdd/specs/.
- [ ] Fase 5 mostra paths novos.
