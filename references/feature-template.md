# Feature: [Nome da Feature]

> [Descrição da feature em uma linha — o que faz, pra quem, por que importa]

**Slug:** [slug-da-feature]
**Prioridade:** [Crítica / Alta / Média / Baixa]
**Status:** Rascunho
**Data:** [DD/MM/AAAA]
**Projeto:** [nome do projeto — extrair do SPEC.md]

---

## 1. Motivação

### 1.1 Problema / Oportunidade

[O problema concreto que essa feature resolve ou a oportunidade que captura.
- Conecte com o problema original do projeto (brainstorm seção 2, SPEC seção 1.1)
- Se baseado em feedback de usuários, cite
- Se baseado em hipótese, marque como "[a validar]"]

### 1.2 Personas Impactadas

[Para cada persona do SPEC.md afetada:
- **[Nome — Papel]:** como essa feature melhora a experiência dela. Referência SPEC seção 2.]

### 1.3 Métricas de Sucesso

| Métrica | Meta | Prazo |
|---------|------|-------|
| [KPI concreto] | [número alvo] | [prazo] |

---

## 2. Escopo

### 2.1 O que entra (v1)

- [Funcionalidade mínima viável 1]
- [Funcionalidade mínima viável 2]
- [...]

### 2.2 O que fica pra depois

- [Funcionalidade desejável 1] — [por que não agora]
- [Funcionalidade desejável 2] — [por que não agora]

### 2.3 O que NÃO é essa feature

- [Delimitação explícita 1 — pra evitar scope creep]
- [Delimitação explícita 2]

---

## 3. User Stories

| # | Como... | Quero... | Para... |
|---|---------|----------|---------|
| US-01 | [persona] | [ação] | [benefício] |
| US-02 | [persona] | [ação] | [benefício] |
| US-03 | [persona] | [ação] | [benefício] |

---

## 4. Fluxos de Uso

### 4.1 [Nome do Fluxo Principal]

**Pré-condição:** [estado necessário]
**Trigger:** [o que inicia o fluxo]

1. [Passo 1 — tela/ação]
2. [Passo 2 — tela/ação]
3. [Passo 3 — tela/ação]
4. ...

**Sucesso:** [estado final esperado]
**Erro / edge case:** [o que acontece se falhar]

### 4.2 [Nome do Fluxo Alternativo]

[mesmo formato]

---

## 5. Impacto em Telas Existentes

### 5.1 Telas Modificadas

| Tela (SPEC seção 7) | O que muda | Onde na tela | Por quê |
|----------------------|------------|--------------|---------|
| [Nome da tela] | [mudança] | [seção/componente] | [justificativa] |

### 5.2 Telas Novas (se aplicável)

#### [Nome da Nova Tela]

**Objetivo:** [uma frase]

**Seções (de cima pra baixo):**
- A. [Seção] — [conteúdo]
- B. [Seção] — [conteúdo]

**Componentes usados:** [referência ao SPEC seção 8 e DESIGN.md]

**Comportamento mobile:** [adaptações]

---

## 6. Impacto no Modelo de Dados

### 6.1 Novas Entidades

| Entidade | Atributos críticos | Relações |
|----------|-------------------|----------|
| [Nome] | [campo: tipo, campo: tipo] | [relação com entidade existente] |

### 6.2 Alterações em Entidades Existentes

| Entidade (SPEC seção 4) | Alteração | Migração |
|--------------------------|-----------|----------|
| [Nome] | [campo novo / campo alterado] | [sim/não — complexidade] |

---

## 7. Impacto na API

[Se architecture.md existir, referenciar endpoints existentes. Se não existir, marcar como "[a confirmar após /ksdd:tech]".]

### 7.1 Novos Endpoints

```
[MÉTODO] /api/[path]    [Descrição]    [Auth: sim/não]
```

### 7.2 Endpoints Modificados

| Endpoint (architecture seção 4) | Alteração |
|----------------------------------|-----------|
| [método + path] | [o que muda] |

---

## 8. Impacto no Design

[Se DESIGN.md existir, referenciar tokens e componentes. Se não existir, marcar como "[a confirmar após /ksdd:design]".]

### 8.1 Componentes Existentes Reutilizados

| Componente (DESIGN.md) | Onde é usado na feature | Variante |
|-------------------------|------------------------|----------|
| [Nome] | [tela/contexto] | [existente / nova variante] |

### 8.2 Componentes Novos Necessários

| Componente | Descrição | Variantes | Estados |
|------------|-----------|-----------|---------|
| [Nome] | [o que faz] | [tipos] | [default, hover, active, disabled, loading, error, empty] |

### 8.3 Tokens / Padrões Visuais

[Novos tokens necessários ou ajustes. Se o DESIGN.md já cobre, referenciar.]

---

## 9. Dependências e Riscos

### 9.1 Dependências

| Tipo | Dependência | Status | Impacto se bloqueada |
|------|-------------|--------|----------------------|
| Técnica | [descrição] | [resolvida / pendente] | [alto / médio / baixo] |
| Negócio | [descrição] | [...] | [...] |
| Feature | [FEATURE-xxx se depende de outra] | [...] | [...] |

### 9.2 Riscos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| [descrição] | Alto / Médio / Baixo | Alta / Média / Baixa | [como mitigar] |

---

## 10. Critérios de Aceite

- [ ] [Critério verificável e binário — ex: "Usuário logado recebe notificação push em < 5s após evento trigger"]
- [ ] [Critério 2]
- [ ] [Critério 3]
- [ ] [Critério 4]
- [ ] [Critério 5]
- [ ] [...]

---

## 11. Fases de Implementação

### Fase 1 — [tema: o essencial]
- [ ] [Bloco de trabalho 1]
- [ ] [Bloco de trabalho 2]

### Fase 2 — [tema: melhorias]
- [ ] [Bloco de trabalho 3]
- [ ] [Bloco de trabalho 4]

---

**Referências:**
- SPEC.md — seções [X, Y, Z]
- architecture.md — seções [X, Y] *(se existir)*
- DESIGN.md — seções [X, Y] *(se existir)*
- FEATURE-[outro].md — *(se depende de outra feature)*
