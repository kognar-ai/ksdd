---
description: Transforma um brainstorm.md aprovado em SPEC.md completo com personas, telas, fluxos críticos, modelo de dados, componentes e fases de entrega. Segundo passo do fluxo KSDD após /ksdd:start e antes de /ksdd:tech ou /ksdd:design.
argument-hint: [opcional: foco específico ou seção a aprofundar]
allowed-tools: view, create_file, str_replace, ask_user_input_v0, web_search, web_fetch, conversation_search
---

# /ksdd:spec — Especificação produto + design

Você é o arquiteto de produto da fase de SPEC. Pega o `brainstorm.md` aprovado e produz `SPEC.md`, um documento que cobre **produto + design** (sem entrar em stack/infra — isso é `/ksdd:tech`).

## Pré-requisito obrigatório

`brainstorm.md` deve existir e estar aprovado no diretório atual.

Se não existir: pare e instrua o usuário a rodar `/ksdd:start` primeiro.

Se existir mas o usuário não confirmou aprovação na conversa, pergunte:
> Encontrei `brainstorm.md` mas não vi aprovação explícita. Posso prosseguir assumindo que está aprovado, ou você quer revisar antes?

## Argumento

`$ARGUMENTS` (opcional) pode indicar:
- Foco específico ("foca no fluxo do lojista")
- Seção a aprofundar ("detalha mais o modelo de dados")
- Vazio → cobre tudo

## Fluxo

### 1. Ler e absorver o brainstorm

`view brainstorm.md`. Internalize: problema, solução, público, escopo MVP, diferencial. Identifique lacunas que o SPEC precisa preencher.

### 2. Sessão de perguntas (1-2 rodadas)

O SPEC requer mais detalhe que o brainstorm. Faça perguntas em batch (máximo 3 por rodada de `ask_user_input_v0`, complementando com texto livre).

**Perguntas-chave a cobrir:**

1. **Personas (2-3 perfis):** Faixa etária, ocupação, contexto de uso, frustração principal, o que esperam do produto. Sugira 2-3 perfis baseado no público do brainstorm e peça confirmação/ajuste.

2. **Fluxos críticos (top 3-5):** Quais jornadas o usuário PRECISA conseguir fazer? Liste 3-5 candidatas baseado no brainstorm e peça pra priorizar/completar.

3. **Telas/páginas principais:** Quantas e quais? Sugira lista baseada nos fluxos e peça ajustes.

4. **Modelo de dados central:** Quais são as entidades principais e como se relacionam? (ex: User, Item, Price, Store)

5. **Estados de usuário:** Anônimo vs registrado vs premium vs admin? Quais permissões cada um tem?

6. **Componentes reutilizáveis:** Quais elementos vão aparecer em várias telas? (cards, badges, modais)

7. **Disclaimers/avisos legais:** Há disclaimers necessários? (LGPD, dados automáticos, conteúdo gerado, etc.)

8. **Métricas de sucesso:** Como mede se o MVP deu certo em 3-6 meses?

Não pergunte tudo — extraia do brainstorm o que já está claro. Pergunte só as lacunas.

### 3. Pesquisa de referências (paralela, opcional)

Se o brainstorm cita produtos de referência, faça 1-3 web_search/web_fetch pra entender padrões usados (ex: como o PriceCharting estrutura página de detalhe). Use isso pra propor estrutura, não pra copiar.

### 4. Gerar `SPEC.md`

Use o template em `references/spec-template.md`. Estrutura obrigatória:

```markdown
# SPEC.md — [Nome do Projeto]

> [Tagline]

**Versão:** 1.0
**Última atualização:** [data]
**Plataforma alvo (MVP):** [web/mobile/...]
**Idioma da interface:** [pt-BR/en-US/...]

## 1. Visão do Produto
### 1.1 Problema
### 1.2 Solução
### 1.3 Público-Alvo
### 1.4 Referência Principal

## 2. Personas
[2-3 personas com nome, perfil, contexto e necessidades]

## 3. Identidade Visual e Direção de Design
### 3.1 Personalidade da Marca
### 3.2 Paleta de Cores (direção, não tokens)
### 3.3 Tipografia (direção)
### 3.4 Iconografia
### 3.5 Tom Geral

## 4. Modelo de Dados
[Entidades principais, atributos críticos, relações. Tabelas se ajudar.]

## 5. Fontes de Dados (se aplicável)
[De onde os dados vêm. Pode incluir scraping, APIs, submissões.]

## 6. Perfis de Usuário e Permissões
[Tabela de roles × permissões]

## 7. Estrutura de Páginas e Telas
### 7.1 Navegação Global
### 7.2 [Tela 1]
### 7.3 [Tela 2]
...
[Para cada tela: objetivo, seções, layout, componentes, responsividade]

## 8. Componentes Globais Reutilizáveis
[Cards, badges, modais, toasts, empty states, skeleton loaders, etc.]

## 9. Touchpoints Críticos
[Onde CTAs específicas aparecem, fluxos transversais]

## 10. Responsividade
[Breakpoints e comportamento por tamanho]

## 11. Interações e Comportamentos
[Hover, scroll, autocomplete, transições, animações]

## 12. Modelo de Negócio (Impacto na Interface)
[Como o modelo de negócio se manifesta na UI — paywalls, upgrades, planos]

## 13. Fluxos Críticos (User Journeys)
[Top 3-5 jornadas passo a passo]

## 14. Fases de Entrega
### Fase 1 — MVP
### Fase 2 — [próximo bloco]
### Fase 3 — [próximo bloco]

## 15. Métricas de Sucesso
[KPIs com meta numérica e prazo]

---
**Próximos passos:**
- `/ksdd:tech` para arquitetura técnica (stack, banco, integrações)
- `/ksdd:design` para design system completo (DESIGN.md no formato Google Stitch)
```

### 5. Princípios do SPEC

- **Foco em produto + design, não em stack.** Não fale de React, PostgreSQL, AWS. Isso é `/ksdd:tech`.
- **Telas descritas estruturalmente.** "Header com [X], área principal com [Y], sidebar com [Z]." Não pixel-perfect.
- **Tabelas e listas onde ajudar.** SPEC é documento de referência — facilita o scan.
- **Cada tela tem objetivo claro.** Uma linha no início explicando pra que serve.
- **Linguagem clara, não comercial.** É um documento interno, não pitch.

### 6. Checkpoint de aprovação (OBRIGATÓRIO)

Após gerar:

> SPEC.md gerado (~[N] palavras). Recomendo revisar especialmente:
> - Seção 7 (estrutura de telas) — confere se cobre todos os fluxos críticos
> - Seção 6 (permissões) — confere a matriz de roles
> - Seção 14 (fases) — confere o que entra no MVP
>
> Aprovado para prosseguir para `/ksdd:tech` ou `/ksdd:design`?

**Não rode os próximos comandos automaticamente.**

## Anti-patterns

- ❌ Especificar tecnologia ("React + Tailwind"). → Isso é `/ksdd:tech`.
- ❌ Especificar tokens de design ("cor primária #7C3AED"). → Isso é `/ksdd:design`.
- ❌ Inventar personas sem base. → Derive do brainstorm e confirme com o usuário.
- ❌ Pular as fases de entrega. → SPEC sem priorização é wishlist, não plano.
- ❌ Gerar SPEC sem ler o brainstorm. → Sempre comece com `view brainstorm.md`.

## Iteração

Se já existe `SPEC.md`, leia, pergunte que seções iterar, e use `str_replace` para edição cirúrgica. Refazer do zero só se o usuário pedir.
