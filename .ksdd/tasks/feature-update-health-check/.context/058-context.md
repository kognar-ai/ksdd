# Context — Task 058: SPEC.md + architecture.md (ADR-014)

**Issue:** local-only · **Área:** backend · **P1 · M** · depende de 056, 057 (em revisão nesta branch)

## Task em uma página
Documentar a feature nos artefatos KSDD do próprio repo. É o escopo definido da task (não é build read-only de outra feature — precedente task 051 da new-fix-command).

## Edições — SPEC.md (`.ksdd/specs/SPEC.md`)
- **7.1** (linha 216): adicionar `KSDD_SKIP_UPDATE_CHECK` à lista de env vars.
- **Seção 11** (após bullet "Approval gates obrigatórios"): novo bullet "Health check de update (uma vez por sessão)".
- **13.5** (após "3. `ksdd status` confirma nova versão"): nota de "descoberta puxada" pelo aviso.
- **Seção 12** (após bullet CONTRIBUTING): novo bullet "não é telemetria".

## Edições — architecture.md (`.ksdd/specs/architecture.md`)
- **4.2** (tabela env vars, antes de `NO_COLOR`): linha `KSDD_SKIP_UPDATE_CHECK`.
- **Seção 5** (linha 262): reconciliar "KSDD não faz chamada de rede" → **CLI** não faz; agente lê registry (ADR-014).
- **Seção 10**: nova **ADR-014** após ADR-013 (agent-driven, CLI offline, sessão-only, sem `install*`; gatilho ADR-012 intocado).
- **Seção 12** (roadmap): nova "Fase 5.6 — Health check de update (v0.12.0)".

## Fora de escopo
- README/INSTALL/CHANGELOG/package.json + `ksdd help` (task 059).
- Exemplo de manifest `"version": "0.11.0"` no SPEC 4.1 → fica com a task 059 (bump), junto das demais refs de versão.
- SPEC seção 14 (fases de entrega) — não listado no escopo da task; arch §12 já rastreia a entrega.

## Critérios (task 058)
- [ ] SPEC 11 descreve o health check; 13.5 menciona descoberta puxada; 7.1 lista a env var; 12 nota "não é telemetria".
- [ ] architecture ADR-014 completa; seção 5 reconciliada; 4.2 lista a env var; roadmap atualizado.
- [ ] Edições cirúrgicas preservando o resto.

## Quality gates
- [ ] `grep` confirma `KSDD_SKIP_UPDATE_CHECK` em SPEC e architecture.
- [ ] `grep` confirma `ADR-014` na architecture.
- [ ] Diff cirúrgico (só adições + 1 reescrita da frase da seção 5).
