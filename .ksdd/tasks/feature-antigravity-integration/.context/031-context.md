# Context — Task 031: architecture.md ADR-011 + atualizações

**Issue:** #20 · **Área:** design · **P0 · S**

## Task em uma página
Registrar ADR-011 (4ª cópia hardcoded + gatilho do refator `installTarget`), atualizar ADR-010 com nota de continuidade, e refletir Antigravity como 4º target no diagrama (seção 1), schema do manifest (3.1), CLI (4.1/4.2), funções (4.3), integrações (5), riscos (11) e roadmap Fase 5 (12).

## Decisão-âncora (FEATURE seção 1.1)
Quarta cópia hardcoded para validar adoção; refator vira feature dedicada com gatilho firme = antes do 5º target. Risco específico: prune em `~/.gemini/` compartilhado.

## Arquivos modificados
- `.ksdd/specs/architecture.md` (str_replace cirúrgico nas seções 1, 3.1, 4.1, 4.2, 4.3, 5, 10, 11, 12)

## Quality gates
- [x] ADR-011 na seção 10 com Evidência/Decisão/Confiança/Consequência
- [x] ADR-010 com nota de continuidade referenciando ADR-011
- [x] Seção 1 mostra 4 targets; 4.3 tem linha `installAntigravity` (+ corrige `codexPromptBasename`→`agentPromptBasename`)
- [x] Seção 11 riscos: 4 duplicações, path IDE, prune ~/.gemini; Seção 12 Fase 5 Antigravity entregue
