---
id: 046
title: Guarda de consistência da contagem de slash commands (evitar recorrência)
status: para implementar
fix: spec-command-count
area: qa
priority: P2
estimate: S
depends_on: []
fix_refs:
  - ".ksdd/fixes/FIX-spec-command-count.md#7-estratégia-de-teste-de-regressão"
spec_refs:
  - ".ksdd/specs/SPEC.md#72-slash-commands-claude-code"
arch_refs:
  - ".ksdd/specs/architecture.md#9-estratégia-de-testes"
---

# 046 — Guarda de consistência da contagem de commands

## Objetivo
Evitar que a contagem de slash commands volte a divergir entre `bin/ksdd.js` (fonte de verdade) e a prosa dos artefatos. É a guarda de regressão do `FIX-spec-command-count`.

## Escopo
- Adicionar uma checagem que compara `COMMAND_FILES.length` (em `bin/ksdd.js`) com a contagem declarada em tempo presente nos artefatos-chave (`README.md`, `INSTALL.md`, `.ksdd/specs/SPEC.md` §1.2/§7.2, `CLAUDE.md`). Opções (escolher a mais leve que caiba no projeto — sem quebrar ADR-001 no runtime):
  - um script Node standalone em `scripts/` (fora do `bin/` de runtime) rodado manualmente / em CI futura; **ou**
  - um item explícito no checklist "adicionar um novo command" em `CLAUDE.md` (mínimo viável imediato).
- A checagem deve **falhar** (exit ≠ 0 ou aviso claro) quando os números divergirem, apontando os arquivos fora de sincronia.
- Documentar no `CLAUDE.md` que adicionar/remover um command exige atualizar a contagem nos pontos de tempo presente.

## Fora de escopo
- A reconciliação em si (já aplicada na v0.11.0 — tasks 042/043 + brainstorm §3 via o próprio fix).
- CI/CD (não há workflow no repo hoje — architecture §9). Se/quando existir, plugar a checagem lá.
- Alterar `bin/ksdd.js` de runtime para ler prosa (proibido — `COMMAND_FILES` é a fonte de verdade).

## Critérios de aceitação
- [ ] Existe uma guarda (script ou checklist documentado) que detecta divergência entre `COMMAND_FILES.length` e a contagem na prosa.
- [ ] A guarda falha/avisa de forma clara ao introduzir uma divergência de teste (falha-antes) e passa com os artefatos reconciliados (passa-depois).
- [ ] `CLAUDE.md` documenta o passo "atualizar a contagem de commands" ao adicionar um command.
- [ ] Nenhuma dependência runtime nova (ADR-001); nada em `bin/` de runtime lê prosa.

## Notas técnicas
- Fonte de verdade: `COMMAND_FILES` em `bin/ksdd.js` (hoje 11). A prosa deve espelhá-la.
- Menções **históricas** (brainstorm §7 "v0.5.0: 8"; evidência ADR-011/012) NÃO entram na checagem — só as de tempo presente.
- Estado atual dos testes: sem framework automatizado (architecture §9); a guarda mínima aceitável é o checklist em `CLAUDE.md`.

## Riscos / dependências externas
- Baixa prioridade (P2): o bug imediato já está corrigido; esta task previne recorrência.
