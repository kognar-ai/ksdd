---
id: 031
title: Atualizar agent critic + skill discovery (codex-SKILL, opencode-AGENTS)
status: para implementar
feature: figma-integration
area: backend
priority: P1
estimate: S
depends_on: [028]
feature_refs:
  - ".ksdd/features/FEATURE-figma-integration.md#2-escopo"
  - ".ksdd/features/FEATURE-figma-integration.md#10-critérios-de-aceite"
spec_refs:
  - ".ksdd/specs/SPEC.md#8-componentes-globais-reutilizáveis"
  - ".ksdd/specs/SPEC.md#7-estrutura-de-páginas-e-telas"
arch_refs:
  - ".ksdd/specs/architecture.md#1-visão-geral-da-arquitetura"
---

# 031 — Atualizar agent critic + skill discovery

## Objetivo
Ensinar o critic a validar artefatos do export Figma e fazer com que Codex/opencode descubram o novo command via os arquivos canônicos de discovery (`codex-SKILL.md`, `opencode-AGENTS.md`). Também adicionar Gate 8 em `approval-gates.md`.

## Escopo
- **`agents/critic.md`** (ou path equivalente atual):
  - Adicionar checklist específico para artefatos do `/ksdd:figma:export`:
    - `DESIGN.md` aprovado (Status: Aprovado) antes do export?
    - Frontmatter passa sanity check mínimo (`name`, `colors.primary`)?
    - `FILE_KEY` confirmado pelo usuário em batch?
    - Default conservador de não sobrescrever respeitado?
    - Diff foi apresentado antes do apply?
- **`references/codex-SKILL.md`**: adicionar `ksdd-figma-export` à lista de prompts descobríveis com 1 linha de descrição.
- **`references/opencode-AGENTS.md`**: adicionar `ksdd-figma-export` ao discovery com 1 linha.
- **`references/approval-gates.md`**: adicionar **Gate 8 — Export Figma** documentando os dois checkpoints do fluxo:
  - 8a (entrada): confirmação de `FILE_KEY` + nome da coleção + política de overwrite antes de qualquer write.
  - 8b (saída): apresentação do diff final (criados/atualizados/inalterados/pulados/órfãos/erros) antes de encerrar o command.

## Fora de escopo
- Reescrever o critic — só adicionar a seção nova.
- Documentar Gate 8 nos commands (a referência em T-028 ao "Gate 8" já é suficiente).
- Mudanças em SPEC.md/architecture.md (cobertas por T-032).

## Critérios de aceitação
- [ ] `agents/critic.md` tem uma seção "Checklist — `/ksdd:figma:export`" com ≥ 5 itens binários.
- [ ] `references/codex-SKILL.md` lista `ksdd-figma-export` com descrição curta.
- [ ] `references/opencode-AGENTS.md` lista `ksdd-figma-export` com descrição curta.
- [ ] `references/approval-gates.md` tem entrada **Gate 8 — Export Figma** com 8a e 8b documentados.
- [ ] Após `ksdd install --codex --opencode`, todos os arquivos atualizados estão presentes nos respectivos paths instalados.
- [ ] Idioma das adições segue `references/language-policy.md` (consistente com o resto dos arquivos).

## Notas técnicas
- Editar com str_replace direto onde possível — preservar formato das seções vizinhas.
- O critic tradicionalmente tem checklist por tipo de artefato (`.ksdd/specs/SPEC.md` §8) — seguir o mesmo padrão visual.
- Gate 8 é o oitavo gate; renumeração dos demais **não** é necessária (gates seguem ordem cronológica do fluxo, não strict).

## Riscos / dependências externas
- T-028 precisa estar pelo menos com draft do command para o critic conseguir referenciar entradas reais — depende_on garante ordem.
