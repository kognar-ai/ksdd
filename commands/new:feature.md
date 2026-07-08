---
description: Cria a especificação de uma nova feature para um projeto KSDD existente (.ksdd/features/FEATURE-[slug].md) e quebra em tasks implementáveis salvas em .ksdd/tasks/feature-[slug]/. Lê brainstorm.md, SPEC.md, architecture.md e DESIGN.md (de .ksdd/specs/ com fallback raiz) para contexto completo.
argument-hint: "[nome ou descrição da feature] [--tasks-only] (opcional — sem args pergunta)"
allowed-tools: view, create_file, str_replace, ask_user_input_v0, web_search, web_fetch, conversation_search, list_directory, Glob, Grep
---

# /ksdd:new:feature — Especificação + task breakdown de nova feature

Você é o product owner da fase de feature spec. Pega os artefatos existentes do projeto KSDD e produz:

1. **`.ksdd/features/FEATURE-[slug].md`** — especificação completa da feature (produto + impacto + critérios)
2. **`.ksdd/tasks/feature-[slug]/`** — tasks implementáveis individuais com frontmatter estruturado

## Idioma (obrigatório)

Siga `references/language-policy.md` — FEATURE spec, tasks e perguntas no idioma dos artefatos KSDD existentes e da conversa; não assuma pt-BR.

## Argumentos

`$ARGUMENTS` pode conter:
- Nome/descrição da feature ("notificações push", "sistema de badges de conquistas")
- `--tasks-only` → pula a geração do FEATURE spec (procura nesta ordem: `.ksdd/features/FEATURE-[slug].md` → `docs/FEATURE-[slug].md` → `FEATURE-[slug].md` raiz, ambos legados) e gera só as tasks
- Vazio → pergunte qual feature o usuário quer especificar

## Pré-requisito obrigatório

`SPEC.md` deve existir. Procure primeiro em `.ksdd/specs/SPEC.md` (default v0.6.0+); fallback para `SPEC.md` na raiz (legado). É o documento mínimo necessário.

Se não existir em nenhum dos paths: pare e instrua o usuário a rodar `/ksdd:spec` primeiro.

Artefatos complementares (leia se existirem, sempre em `.ksdd/specs/` primeiro, fallback raiz):
- `brainstorm.md` — contexto original do projeto
- `architecture.md` — stack, modelo de dados, APIs existentes
- `DESIGN.md` — design system, tokens, componentes

## Paths dos artefatos (KSDD v0.6.0+)

A partir da v0.6.0, KSDD usa `.ksdd/` para todos os artefatos. Para este command:

| Artefato            | Leitura (em ordem, com fallback)                                              | Escrita default                         |
|---------------------|-------------------------------------------------------------------------------|-----------------------------------------|
| SPEC.md             | `.ksdd/specs/SPEC.md` → raiz `SPEC.md`                                       | n/a (input)                             |
| brainstorm.md       | `.ksdd/specs/brainstorm.md` → raiz `brainstorm.md`                           | n/a (input)                             |
| architecture.md     | `.ksdd/specs/architecture.md` → raiz `architecture.md`                       | n/a (input)                             |
| DESIGN.md           | `.ksdd/specs/DESIGN.md` → raiz `DESIGN.md`                                   | n/a (input)                             |
| FEATURE-[slug].md   | `.ksdd/features/FEATURE-[slug].md` → `docs/FEATURE-[slug].md` → raiz legado  | `.ksdd/features/FEATURE-[slug].md`      |
| tasks               | `.ksdd/tasks/feature-[slug]/` → `docs/tasks/feature-[slug]/`                 | `.ksdd/tasks/feature-[slug]/`           |
| features arquivadas | `.ksdd/archive/raw/[slug]/` (detecção de colisão de slug + leitura de IDs)   | n/a (read-only — só `/ksdd:archive` escreve) |

**Fallback de leitura:** ao detectar artefato em path legado, emita warning amarelo:

> ⚠ Detectado `<arquivo>` em path legado (`<path antigo>`). A partir da v0.6.0, KSDD usa `<path novo>`. Considere migrar com:
> `mkdir -p <novo-dir> && git mv <path antigo> <path novo>`

**Conflito:** se mesmo artefato existe em mais de um path **com conteúdos diferentes**, **aborte** com erro pedindo resolução manual.

**Escrita:** sempre nos paths default `.ksdd/features/` e `.ksdd/tasks/`. Garanta `mkdir -p .ksdd/features/` e `mkdir -p .ksdd/tasks/feature-[slug]/` antes dos `create_file`.

**Numeração de tasks:** ao calcular o próximo ID, considere IDs existentes em **quatro** lugares:
1. `.ksdd/tasks/feature-*/NNN-*.md` (layout atual)
2. `.ksdd/tasks/fix-*/NNN-*.md` (tasks de fixes geradas por `/ksdd:new:fix` — mesmo espaço global de IDs)
3. `docs/tasks/feature-*/NNN-*.md` (layout legado pré-0.6.0)
4. `.ksdd/archive/raw/*/tasks/NNN-*.md` (features arquivadas via `/ksdd:archive`)

Use o **maior ID encontrado nos quatro paths combinados** + 1 como próximo ID. Isso evita colisão entre features, fixes e features arquivadas restauradas.

> **Fronteira de namespaces:** features vivem em `.ksdd/features/` + `.ksdd/tasks/feature-*/`; fixes (bugs) vivem em `.ksdd/fixes/` + `.ksdd/tasks/fix-*/` (via `/ksdd:new:fix`). Bug ≠ feature — mas os IDs de task são de um único espaço global compartilhado.

## Detecção de slug arquivado

Antes de gerar `FEATURE-[slug].md`, **verifique** se o slug derivado colide com uma feature arquivada:

1. Após derivar o slug (passo 4 do fluxo abaixo), verifique se existe `.ksdd/archive/raw/[slug]/FEATURE-[slug].md`.
2. Se existir, **pare** e apresente 3 opções via `ask_user_input_v0`:
   - **(a) Escolher outro slug** — usuário sugere um slug novo; volte ao passo 4.
   - **(b) Restaurar a feature arquivada** — instrua o usuário a rodar `/ksdd:archive --restore [slug]` antes de continuar; encerre este comando.
   - **(c) Abortar** — encerra sem fazer nada.
3. **Nunca** sobrescreva uma feature arquivada automaticamente — exija decisão explícita.

Em projetos sem `.ksdd/archive/` (ausente é o caso normal em projetos novos), pule esta checagem silenciosamente.

## Fluxo

### 1. Ler e absorver o contexto do projeto

Leia **todos** os artefatos KSDD existentes (aplicando fallback definido em "Paths dos artefatos"):

1. `view .ksdd/specs/SPEC.md` (obrigatório; fallback `view SPEC.md` raiz)
2. `view .ksdd/specs/brainstorm.md` (se existir; fallback raiz)
3. `view .ksdd/specs/architecture.md` (se existir; fallback raiz)
4. `view .ksdd/specs/DESIGN.md` (se existir; fallback raiz)

Se existem features prévias (em `.ksdd/features/FEATURE-*.md`, `docs/FEATURE-*.md` legado, ou `FEATURE-*.md` raiz mais legado), liste-as e leia os títulos pra evitar duplicação. Liste também features arquivadas em `.ksdd/archive/raw/*/FEATURE-*.md` para detectar colisão de slug (ver seção "Detecção de slug arquivado" acima).
Se existem tasks prévias (em `.ksdd/tasks/feature-*/`, `.ksdd/tasks/fix-*/`, `docs/tasks/` legado, ou `.ksdd/archive/raw/*/tasks/`), verifique o maior ID existente **nos quatro paths combinados** pra continuar a numeração sem colisão.

### 2. Sessão de perguntas (1-2 rodadas)

Faça perguntas em batch (máximo 3 por rodada de `ask_user_input_v0`, complementando com texto livre).

**Perguntas-chave a cobrir:**

1. **Descrição da feature:** Se `$ARGUMENTS` é vago, peça uma descrição em 2-3 frases. Se já é claro, confirme o entendimento.

2. **Motivação / problema:** Por que essa feature agora? É uma necessidade de usuários, oportunidade de negócio, dívida técnica, ou outra coisa? (opções derivadas do contexto + texto livre)

3. **Personas impactadas:** Quais das personas do SPEC (de `.ksdd/specs/SPEC.md` ou raiz legado) são afetadas? (multi-select com as personas existentes + "nova persona")

4. **Prioridade:** Crítica (bloqueia uso), Alta (melhora significativa), Média (nice-to-have pro próximo ciclo), Baixa (backlog)

5. **Escopo:** Mínimo viável da feature — o que entra na v1 da feature e o que fica pra depois?

6. **Telas envolvidas:** Quais telas do SPEC são afetadas? Precisa de telas novas? (multi-select com telas existentes + "nova tela")

7. **Modelo de dados:** A feature exige novas entidades ou altera as existentes? (se architecture existe — em `.ksdd/specs/architecture.md` ou raiz legado — referencie)

8. **Dependências:** Depende de outra feature, serviço externo, ou decisão pendente?

Não pergunte tudo — extraia do `$ARGUMENTS` e dos artefatos o que já está claro. Pergunte só as lacunas.

### 3. Pesquisa de referências (opcional, paralela)

Se a feature envolve padrões conhecidos (ex: "gamification", "real-time notifications", "social login"), faça 1-2 web_search rápidos pra trazer boas práticas atuais. Não exagere.

### 4. Gerar slug da feature

Derive um slug curto do nome da feature:
- "notificações push" → `push-notifications`
- "sistema de badges" → `badges`
- "painel admin" → `admin-panel`

### 5. Gerar `.ksdd/features/FEATURE-[slug].md`

Antes do `create_file`, garanta `mkdir -p .ksdd/features/`. Use o template em `references/feature-template.md`. O FEATURE spec é o **contrato de produto** — descreve o quê e por quê, não o como.

### 6. Checkpoint do FEATURE spec (OBRIGATÓRIO)

Após gerar:

> `.ksdd/features/FEATURE-[slug].md` gerado (~[N] palavras). Recomendo revisar especialmente:
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

**b) Gere os arquivos** em `.ksdd/tasks/feature-[slug]/` com nomenclatura `NNN-slug-curto.md` (ID com 3 dígitos zero-padded, slug em kebab-case sem acentos). Antes do primeiro `create_file`, garanta `mkdir -p .ksdd/tasks/feature-[slug]/`.

Se já existem tasks no projeto (em `.ksdd/tasks/feature-*/`, `.ksdd/tasks/fix-*/` ou `docs/tasks/` legado), continue a numeração a partir do **maior ID encontrado** (regra dos quatro paths acima) — não colida.

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
  - ".ksdd/features/FEATURE-[slug].md#<seção>"
spec_refs:
  - ".ksdd/specs/SPEC.md#<seção>"
arch_refs:
  - ".ksdd/specs/architecture.md#<seção>"
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
- **Respeite os artefatos.** Não invente tecnologia fora do que `architecture.md` (em `.ksdd/specs/` ou raiz legado) decidiu. Se uma necessidade não tem ADR, cite em "Riscos / dependências externas".
- **Não duplique informação** dos artefatos — referencie via `feature_refs`/`spec_refs`/`arch_refs` com paths atuais (`.ksdd/...`). A task descreve o **trabalho a fazer**, não o produto.

**Nota sobre refs em projetos legados:** Se a feature está sendo gerada num projeto que ainda tem artefatos na raiz/`docs/`, os `*_refs` da task podem apontar para os paths legados onde o artefato realmente vive — o `/ksdd:build:feature` resolve qualquer um dos paths.
- **Tasks de teste fazem parte das tasks de feature**, não tasks separadas, salvo infra de teste.

### 8. Gerar `.ksdd/tasks/feature-[slug]/README.md`

Índice de tasks da feature:

```markdown
# Tasks — Feature: [Nome]

**Feature:** .ksdd/features/FEATURE-[slug].md
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

> [N] tasks geradas em `.ksdd/tasks/feature-[slug]/`:
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

Se já existe FEATURE (em `.ksdd/features/FEATURE-[slug].md`, ou `docs/FEATURE-[slug].md` ou `FEATURE-[slug].md` raiz por legado), leia, pergunte que seções iterar, e use `str_replace` pra edição cirúrgica **no path onde ela vive** (não mova). Se está em path legado, sugira (mas não execute) `mkdir -p .ksdd/features && git mv <path antigo> .ksdd/features/`.

Se já existem tasks (em `.ksdd/tasks/feature-[slug]/` ou `docs/tasks/feature-[slug]/` legado), não sobrescreva. Continue a numeração considerando IDs de ambos os paths, e pule áreas já cobertas (a menos que o usuário peça regeneração explícita).

## Quando os artefatos são parciais

Se o projeto só tem SPEC.md (sem architecture.md ou DESIGN.md, em qualquer dos paths):
- Seções 7 e 8 do FEATURE spec (API e Design) são geradas como sugestões, marcadas com `[a confirmar após /ksdd:tech]` ou `[a confirmar após /ksdd:design]`.
- Tasks de backend/infra omitem `arch_refs` e marcam "Decisão arquitetural pendente" em Riscos.
- Tasks de frontend/design omitem referências ao DESIGN.md.
