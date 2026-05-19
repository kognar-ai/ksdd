---
id: 010
title: QA end-to-end — validar fluxo completo em projeto vazio + projeto legado
status: para implementar
feature: ksdd-folder-layout
area: qa
priority: P0
estimate: M
depends_on: [009]
feature_refs:
  - "docs/FEATURE-ksdd-folder-layout.md#10-criterios-de-aceite"
spec_refs:
  - "SPEC.md#131-onboarding-em-projeto-novo-do-zero"
  - "SPEC.md#132-onboarding-em-projeto-existente-reverse-engineering"
arch_refs: []
---

# 010 — QA end-to-end do novo layout

## Objetivo
Confirmar manualmente que os 22 critérios de aceite da feature são atendidos rodando o fluxo completo em dois cenários: projeto vazio (greenfield) e projeto com artefatos legados.

## Escopo

**Cenário A — Projeto vazio:**
1. Criar diretório temporário `tmp-greenfield/`.
2. `npm install -g .` (instala versão local 0.6.0).
3. Em Claude Code: `/ksdd:start` com ideia fictícia → conferir `.ksdd/specs/brainstorm.md` criado.
4. Aprovar → `/ksdd:spec` → conferir `.ksdd/specs/SPEC.md`.
5. `/ksdd:tech` → `.ksdd/specs/architecture.md`.
6. `/ksdd:design` → `.ksdd/specs/DESIGN.md`.
7. `/ksdd:new:feature exemplo` → `.ksdd/features/FEATURE-exemplo.md` + `.ksdd/tasks/feature-exemplo/`.
8. `/ksdd:build:feature exemplo` → primeira task ganha `.ksdd/tasks/feature-exemplo/.context/001-context.md`.

**Cenário B — Projeto com legado:**
1. Criar `tmp-legacy/` com `SPEC.md` + `brainstorm.md` fictícios na raiz.
2. `/ksdd:new:feature outra` → conferir warning amarelo claro citando paths legado/novo + sugestão de `git mv`.
3. Gerar feature em `.ksdd/features/`.
4. Criar conflito: criar `.ksdd/specs/SPEC.md` diferente do raiz → `/ksdd:spec` → deve abortar com erro bloqueante.

**Cenário C — `/ksdd:setup` em projeto legado:**
1. Em `tmp-legacy/`, rodar `/ksdd:setup` → conferir pergunta de 3 opções (FEATURE seção 4.3).

## Fora de escopo
- Validar comportamento em Codex (smoke test em Claude Code basta para esta feature).
- Testes automatizados (não há suite no projeto — SPEC seção 9; ficaria para outra feature).

## Critérios de aceitação
- [ ] Cenário A: todos os 8 critérios "Em projeto vazio" da FEATURE seção 10 verificados manualmente.
- [ ] Cenário B: 3 critérios de fallback/conflito da FEATURE seção 10 verificados.
- [ ] Cenário C: critério de `/ksdd:setup` em projeto com legados verificado.
- [ ] Critério de "Grep no repo por paths legados" rodado e validado.
- [ ] Screenshot ou log do warning amarelo capturado e anexado ao PR/issue de QA.
- [ ] Nenhum dos 22 critérios fica `[ ]` sem evidência.

## Notas técnicas
- Documentar achados em `.ksdd/tasks/feature-ksdd-folder-layout/.context/010-qa-log.md` (informal).
- Se algum critério falhar, abrir issue de bug e abortar — não merge enquanto não passar.

## Riscos / dependências externas
- Depende de todas as tasks anteriores (especialmente 009 já ter migrado o próprio repo, pra QA refletir a realidade pós-merge).
- Tempo de QA depende do estado do agente (Claude/Codex) no momento — reservar bloco contínuo de 2-3h.
