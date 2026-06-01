---
id: 031
title: architecture.md — ADR-011 + atualizar ADR-010 + diagrama + roadmap Fase 5 + riscos
status: para implementar
feature: antigravity-integration
area: design
priority: P0
estimate: S
depends_on: []
feature_refs:
  - ".ksdd/features/FEATURE-antigravity-integration.md#11-problema--oportunidade"
  - ".ksdd/features/FEATURE-antigravity-integration.md#22-o-que-fica-pra-depois"
spec_refs:
  - ".ksdd/specs/SPEC.md#14-fases-de-entrega"
arch_refs:
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
  - ".ksdd/specs/architecture.md#11-riscos-técnicos"
  - ".ksdd/specs/architecture.md#12-roadmap-de-implementação"
---

# 031 — `architecture.md`: ADR-011 + atualizações

## Objetivo
Registrar a decisão arquitetural da 4ª cópia hardcoded (ADR-011) e o gatilho firme do refator `installTarget` genérico, mantendo `architecture.md` como fonte de verdade das decisões. Atualizar diagrama, roadmap e riscos para refletir Antigravity como quarto target.

## Escopo
- **Adicionar ADR-011** na seção 10: "Quarto target (Google Antigravity) hardcoded — adiamento consciente do refator `installTarget` genérico previsto no ADR-010".
  - Evidência: `installAntigravity()` é cópia adaptada de `installOpencode` (task 028); FEATURE seção 1.1.
  - Decisão: aceitar a 4ª cópia para validar adoção; o refator `installTarget(targetConfig)` vira **feature dedicada**, gatilho firme = **antes do 5º target** (Cursor/Windsurf/Cline).
  - Consequência: ~250 linhas duplicadas a mais; refator agora terá 4 funções a unificar; trade-off aceito explicitamente.
- **Atualizar ADR-010** com nota de continuidade: opencode foi o 3º; Antigravity (4º) reitera o adiamento; o prazo passa de "próximo target" para "feature dedicada antes do 5º target".
- **Seção 1 (diagrama/visão):** incluir Antigravity como quarto target.
- **Seção 11 (riscos):** atualizar a linha de "duplicação installX" pra incluir `installAntigravity`; adicionar risco do prune em `~/.gemini/` compartilhado.
- **Seção 12 (roadmap Fase 5):** marcar Antigravity como entregue (v0.9.0, 01/06/2026); reordenar o item do refator `installTarget` como pré-requisito explícito do 5º target.

## Fora de escopo
- Mudanças em `bin/ksdd.js` (tasks 028/029).
- SPEC.md (task 032); README/INSTALL/CHANGELOG (task 033).

## Critérios de aceitação
- [ ] ADR-011 existe na seção 10 com Evidência/Decisão/Confiança/Consequência (mesmo formato dos ADRs existentes).
- [ ] ADR-010 ganha nota de continuidade referenciando ADR-011 e o novo gatilho.
- [ ] Seção 1 mostra os 4 targets (Claude, Codex, opencode, Antigravity).
- [ ] Seção 11 inclui risco da duplicação de 4 funções e do prune em `~/.gemini/`.
- [ ] Seção 12 (Fase 5) marca Antigravity entregue e o refator `installTarget` como pré-requisito do 5º target.
- [ ] Sem inventar tecnologia fora do que a FEATURE definiu.

## Notas técnicas
- Edição cirúrgica via `str_replace` — não reescrever o arquivo inteiro.
- ADR-010 atual está em `architecture.md` linhas ~358-363; seguir o mesmo estilo conciso.
- Pode ser feita em paralelo a 028 (não depende do código pronto), mas revisar números/paths finais após 028.

## Riscos / dependências externas
- Nenhuma externa. Coordenar com task 028 para citar paths consistentes.
