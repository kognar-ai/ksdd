---
description: Cria a especificação de uma nova feature para um projeto KSDD existente e quebra em tasks implementáveis salvas em docs/tasks/feature-[slug]/. Lê brainstorm.md, SPEC.md, architecture.md e DESIGN.md para contexto completo.
argument-hint: "[nome ou descrição da feature] [--tasks-only] (opcional — sem args pergunta)"
allowed-tools: view, create_file, str_replace, ask_user_input_v0, web_search, web_fetch, conversation_search, list_directory, Glob, Grep
---

# /ksdd:new:feature — Especificação + task breakdown de nova feature

Você é o product owner da fase de feature spec. Pega os artefatos existentes do projeto KSDD e produz:

1. **`FEATURE-[slug].md`** — especificação completa da feature (produto + impacto + critérios)
2. **`docs/tasks/feature-[slug]/`** — tasks implementáveis individuais com frontmatter estruturado

## Argumentos

`$ARGUMENTS` pode conter:
- Nome/descrição da feature ("notificações push", "sistema de badges de conquistas")
- `--tasks-only` → pula a geração do FEATURE spec (assume que já existe) e gera só as tasks
- Vazio → pergunte qual feature o usuário quer especificar

## Pré-requisito obrigatório

`SPEC.md` deve existir no diretório atual. É o documento mínimo necessário.

Se não existir: pare e instrua o usuário a rodar `/ksdd:spec` primeiro.

Artefatos complementares (leia se existirem):
- `brainstorm.md` — contexto original do projeto
- `architecture.md` — stack, modelo de dados, APIs existentes
- `DESIGN.md` — design system, tokens, componentes

## Fluxo

### 1. Ler e absorver o contexto do projeto

Leia **todos** os artefatos KSDD existentes:

1. `view SPEC.md` (obrigatório)
2. `view brainstorm.md` (se existir)
3. `view architecture.md` (se existir)
4. `view DESIGN.md` (se existir)

Se existem `FEATURE-*.md` prévios, liste-os e leia os títulos pra evitar duplicação.
Se existem tasks prévias em `docs/tasks/`, verifique o maior ID existente pra continuar a numeração.

### 2. Sessão de perguntas (1-2 rodadas)

Faça perguntas em batch (máximo 3 por rodada de `ask_user_input_v0`, complementando com texto livre).

**Perguntas-chave a cobrir:**

1. **Descrição da feature:** Se `$ARGUMENTS` é vago, peça uma descrição em 2-3 frases. Se já é claro, confirme o entendimento.

2. **Motivação / problema:** Por que essa feature agora? É uma necessidade de usuários, oportunidade de negócio, dívida técnica, ou outra coisa? (opções derivadas do contexto + texto livre)

3. **Personas impactadas:** Quais das personas do SPEC.md são afetadas? (multi-select com as personas existentes + "nova persona")

4. **Prioridade:** Crítica (bloqueia uso), Alta (melhora significativa), Média (nice-to-have pro próximo ciclo), Baixa (backlog)

5. **Escopo:** Mínimo viável da feature — o que entra na v1 da feature e o que fica pra depois?

6. **Telas envolvidas:** Quais telas do SPEC.md são afetadas? Precisa de telas novas? (multi-select com telas existentes + "nova tela")

7. **Modelo de dados:** A feature exige novas entidades ou altera as existentes? (se architecture.md existe, referencie)

8. **Dependências:** Depende de outra feature, serviço externo, ou decisão pendente?

Não pergunte tudo — extraia do `$ARGUMENTS` e dos artefatos o que já está claro. Pergunte só as lacunas.

### 3. Pesquisa de referências (opcional, paralela)

Se a feature envolve padrões conhecidos (ex: "gamification", "real-time notifications", "social login"), faça 1-2 web_search rápidos pra trazer boas práticas atuais. Não exagere.

### 4. Gerar slug da feature

Derive um slug curto do nome da feature:
- "notificações push" → `push-notifications`
- "sistema de badges" → `badges`
- "painel admin" → `admin-panel`

### 5. Gerar `FEATURE-[slug].md`

Use o template em `references/feature-template.md`. O FEATURE spec é o **contrato de produto** — descreve o quê e por quê, não o como.

### 6. Checkpoint do FEATURE spec (OBRIGATÓRIO)

Após gerar:

> FEATURE-[slug].md gerado (~[N] palavras). Recomendo revisar especialmente:
> - Seção 2 (escopo) — confere se o corte v1/depois faz sentido
> - Seção 5 (impacto em telas) — confere se cobre todas as telas afetadas
> - Seção 10 (critérios de aceite) — confere se são verificáveis e completos
>
> Aprovado para gerar as tasks implementáveis?

**Não gere tasks sem aprovação do FEATURE spec.**

### 7. Quebrar feature em tasks implementáveis

Após aprovação do FEATURE spec (ou se `--tasks-only` com FEATURE existente):

**a) Planeje em memória:**

- Lista de tasks derivada do escopo v1 (FEATURE seção 2.1) + impactos (seções 5-8)
- Granularidade alvo: **1 a 3 dias de trabalho**. Se algo é maior, quebre. Se é menor que algumas horas, agrupe com tasks próximas.
- Identifique dependências (uma task só pode depender de tasks com ID menor).
- Distribua tasks em áreas: `backend`, `frontend`, `infra`, `data-model`, `auth`, `billing`, `observability`, `qa`, `design` (ou outras conforme o projeto).

**b) Gere os arquivos** em `docs/tasks/feature-[slug]/` com nomenclatura `NNN-slug-curto.md` (ID com 3 dígitos zero-padded, slug em kebab-case sem acentos).

Se já existem tasks no projeto, continue a numeração a partir do maior ID existente.

**c) Formato obrigatório de cada task:**

```markdown
---
id: NNN
title: Título curto e imperativo da task
status: para implementar
feature: [slug]
area: backend | frontend | infra | data-model | auth | billing | observability | qa | design
priority: P0 | P1 | P2
estimate: S | M | L
depends_on: [NNN, NNN]
feature_refs:
  - "FEATURE-[slug].md#<seção>"
spec_refs:
  - "SPEC.md#<seção>"
arch_refs:
  - "architecture.md#<seção>"
---

# NNN — Título da task

## Objetivo
Uma a duas frases dizendo o que essa task entrega de valor e por quê.

## Escopo
Lista pontual do que está incluído. Concreto e verificável.
- Item 1
- Item 2

## Fora de escopo
O que explicitamente NÃO é parte desta task (evita scope creep).
- Item X

## Critérios de aceitação
Checklist de validação. Cada item deve ser objetivamente testável.
- [ ] Critério 1
- [ ] Critério 2
- [ ] Cobertura de testes onde aplicável

## Notas técnicas
Decisões já tomadas, libs específicas, gotchas, links para seções relevantes
de spec/architecture/FEATURE. Cite ADRs quando aplicável.

## Riscos / dependências externas
Coisas que podem travar a task (acesso a API, decisão pendente, etc).
Vazio se não houver.
```

**d) Regras de conteúdo das tasks:**

- **Status inicial é sempre `para implementar`.** Outros estados válidos: `em andamento`, `em revisão`, `bloqueada`, `concluída`, `cancelada`.
- **Priorize de P0 a P2:**
  - **P0** — crítico para a feature funcionar minimamente.
  - **P1** — importante mas a feature entrega valor sem ela.
  - **P2** — nice-to-have ou preparação para v2.
- **Estimate:** S = até 1 dia, M = 1-2 dias, L = 2-3 dias.
- **Respeite os artefatos.** Não invente tecnologia fora do que `architecture.md` decidiu. Se uma necessidade não tem ADR, cite em "Riscos / dependências externas".
- **Não duplique informação** dos artefatos — referencie via `feature_refs`/`spec_refs`/`arch_refs`. A task descreve o **trabalho a fazer**, não o produto.
- **Tasks de teste fazem parte das tasks de feature**, não tasks separadas, salvo infra de teste.

### 8. Gerar `docs/tasks/feature-[slug]/README.md`

Índice de tasks da feature:

```markdown
# Tasks — Feature: [Nome]

**Feature:** FEATURE-[slug].md
**Total:** [N] tasks
**Prioridade:** P0: [N] · P1: [N] · P2: [N]
**Estimativa total:** ~[N] dias

| ID | Título | Área | Prioridade | Estimativa | Status | Depende de |
|----|--------|------|------------|------------|--------|------------|
| NNN | [...] | [...] | P0/P1/P2 | S/M/L | para implementar | [...] |

---
**Próximo passo:** `/ksdd:build:feature [slug]` para implementar task por task.
```

### 9. Checkpoint final (OBRIGATÓRIO)

> [N] tasks geradas em `docs/tasks/feature-[slug]/`:
> - P0: [N] tasks (~[N] dias)
> - P1: [N] tasks (~[N] dias)
> - P2: [N] tasks (~[N] dias)
>
> Recomendo começar pelas P0 em ordem de dependência.
> Primeiro task sugerida: `NNN — [título]`
>
> Aprovado? Quer ajustar escopo ou granularidade de alguma task?
> Para implementar: `/ksdd:build:feature [slug]`

## Princípios

- **Feature spec = contrato de produto.** Foca em "o quê" e "por quê". Tasks focam em "como".
- **Encaixa no projeto.** Toda feature referencia personas, telas, dados e APIs existentes.
- **Impacto > funcionalidade.** Não basta dizer o que faz — diga o que muda no que já existe.
- **Tasks concretas e verificáveis.** Cada task tem critérios de aceitação binários.
- **Granularidade 1-3 dias.** Menor que isso = agrupe. Maior que isso = quebre.
- **Referências cruzadas obrigatórias.** Cite seções específicas dos artefatos.

## Anti-patterns

- ❌ Gerar feature spec sem ler os artefatos. → Sempre absorva o contexto completo.
- ❌ Feature isolada do contexto. → Toda feature referencia o que já existe.
- ❌ Critérios vagos. → "Funciona bem" não é critério. "Retorna 200 em < 500ms" sim.
- ❌ Inventar personas ou fluxos sem confirmar. → Pergunte se a feature exige novidades.
- ❌ Tasks genéricas ("implementar backend"). → Específico: "Criar endpoint POST /api/notifications com schema X".
- ❌ Tasks gigantes (> 3 dias). → Quebre em subtasks.
- ❌ Duplicar info dos artefatos nas tasks. → Referencie, não copie.
- ❌ Inventar tecnologia fora do architecture.md. → Se precisa de algo novo, marque como risco.

## Iteração

Se já existe `FEATURE-[slug].md`, leia, pergunte que seções iterar, e use `str_replace` pra edição cirúrgica.

Se já existem tasks em `docs/tasks/feature-[slug]/`, não sobrescreva. Continue a numeração e pule áreas já cobertas (a menos que o usuário peça regeneração explícita).

## Quando os artefatos são parciais

Se o projeto só tem SPEC.md (sem architecture.md ou DESIGN.md):
- Seções 7 e 8 do FEATURE spec (API e Design) são geradas como sugestões, marcadas com `[a confirmar após /ksdd:tech]` ou `[a confirmar após /ksdd:design]`.
- Tasks de backend/infra omitem `arch_refs` e marcam "Decisão arquitetural pendente" em Riscos.
- Tasks de frontend/design omitem referências ao DESIGN.md.
