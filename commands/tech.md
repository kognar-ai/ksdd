---
description: Transforma SPEC.md aprovado em architecture.md com stack, modelo de dados detalhado, integrações, APIs, infraestrutura e decisões técnicas. Terceiro passo do fluxo KSDD (opcional, pode ir direto pra /ksdd:design).
argument-hint: [opcional: tech preferences ou constraints]
allowed-tools: view, create_file, str_replace, ask_user_input_v0, web_search, web_fetch, conversation_search
---

# /ksdd:tech — Arquitetura técnica

Você é o arquiteto técnico da fase de tech. Pega o `SPEC.md` aprovado e produz `architecture.md`, que cobre **como o produto é construído**: stack, dados, integrações, infraestrutura, decisões técnicas.

## Pré-requisito obrigatório

`SPEC.md` deve existir e estar aprovado. Procure primeiro em `.ksdd/specs/SPEC.md` (default v0.6.0+); fallback para `SPEC.md` na raiz (legado). Aplique regras de fallback/conflito da seção "Paths dos artefatos" abaixo.

Se não existir em nenhum dos paths: pare e instrua o usuário a rodar `/ksdd:spec` primeiro.

## Paths dos artefatos (KSDD v0.6.0+)

A partir da v0.6.0, KSDD grava artefatos em `.ksdd/`. Para esta fase:

| Artefato         | Leitura (com fallback)                              | Escrita default                  |
|------------------|------------------------------------------------------|----------------------------------|
| SPEC.md          | `.ksdd/specs/SPEC.md` → raiz `SPEC.md`              | n/a (input)                      |
| brainstorm.md    | `.ksdd/specs/brainstorm.md` → raiz `brainstorm.md`  | n/a (input)                      |
| architecture.md  | `.ksdd/specs/architecture.md` → raiz `architecture.md` | `.ksdd/specs/architecture.md` |

**Fallback de leitura:** ao detectar artefato legado na raiz, emita warning amarelo:

> ⚠ Detectado `<arquivo>` na raiz (layout legado). A partir da v0.6.0, KSDD usa `.ksdd/specs/<arquivo>`. Considere migrar com:
> `mkdir -p .ksdd/specs && git mv <arquivo> .ksdd/specs/<arquivo>`

**Conflito:** se ambos `.ksdd/specs/X.md` e `X.md` raiz existem **com conteúdos diferentes**, **aborte** com erro pedindo resolução manual.

**Escrita:** `.ksdd/specs/architecture.md`. Garanta `mkdir -p .ksdd/specs/` antes do `create_file`.

## Argumento

`$ARGUMENTS` (opcional) pode indicar:
- Stack preferida ("usa Next.js + Supabase")
- Constraint ("precisa rodar self-hosted")
- Foco ("foca no pipeline de extração")
- Vazio → cobre tudo e recomenda stack

## Fluxo

### 1. Ler SPEC e brainstorm

`view .ksdd/specs/SPEC.md` e `view .ksdd/specs/brainstorm.md` (fallback raiz para cada um se o legado for o que existe). Internalize: o que precisa ser construído, escopo do MVP, restrições.

### 2. Sessão de perguntas (1 rodada, focada)

Faça batch de perguntas sobre decisões técnicas que afetam tudo:

1. **Preferência de stack frontend:** (opções comuns: React+Next.js, Vue+Nuxt, SvelteKit, Astro, outro, sem preferência)
2. **Preferência de backend:** (opções: Node/TS, Python/FastAPI, Go, Rails, serverless-only, BaaS tipo Supabase/Firebase, sem preferência)
3. **Banco de dados:** (PostgreSQL, MySQL, MongoDB, multi-DB, sem preferência)
4. **Hospedagem/cloud:** (AWS, GCP, Vercel/Netlify, Cloudflare, Hetzner, self-hosted, sem preferência)
5. **Constraints conhecidas:** equipe pequena? budget apertado? precisa de compliance específico (LGPD)? real-time é crítico?
6. **Integrações de terceiros já decididas:** Stripe? Auth0? SendGrid? Algum SDK específico do escopo (ex: APIs de plataformas de live)?
7. **Necessidades especiais identificadas no SPEC:** ML/AI? pipeline de dados? search engine? real-time streaming? OCR? speech-to-text?

Se o usuário tem preferências, use. Se diz "sem preferência" ou "você decide", **recomende baseado no SPEC** com justificativa em uma linha.

### 3. Pesquisa de stack atual (opcional, paralela)

Para decisões importantes (especialmente AI/ML ou infraestrutura especializada), faça 1-3 web_search rápidos pra validar opções atuais. Por exemplo:
- "Whisper vs Deepgram pt-BR 2026" se o projeto precisa de transcrição
- "vector databases 2026" se precisa de RAG
- "Cloudflare R2 vs S3 egress" se discute storage

Não exagere. Pesquise só o que afeta decisão estrutural.

### 4. Gerar `.ksdd/specs/architecture.md`

Antes do `create_file`, garanta `mkdir -p .ksdd/specs/`. Use o template em `references/architecture-template.md`. Estrutura obrigatória:

```markdown
# Architecture — [Nome do Projeto]

**Versão:** 1.0
**Última atualização:** [data]
**Status:** Rascunho / Aprovado

## 1. Visão Geral da Arquitetura
[Diagrama em texto/mermaid mostrando os blocos principais e como conversam]

## 2. Stack Tecnológica

### 2.1 Frontend
- **Framework:** [escolha] — [justificativa em 1 linha]
- **Linguagem:** [TS/JS/...]
- **Styling:** [Tailwind/CSS-in-JS/...]
- **State management:** [se relevante]
- **Build/dev:** [Vite/Webpack/...]

### 2.2 Backend
- **Linguagem/runtime:** [Node/Python/...]
- **Framework:** [Next.js API/FastAPI/...]
- **Auth:** [Auth.js/Clerk/Auth0/...]
- **API style:** REST/GraphQL/tRPC/...

### 2.3 Dados
- **Banco principal:** [PostgreSQL/...]
- **Cache:** [Redis/...]
- **Search:** [Postgres FTS/Meilisearch/Algolia/...]
- **Storage:** [S3/R2/...]
- **Time-series (se aplicável):** [TimescaleDB/InfluxDB/...]

### 2.4 Infraestrutura
- **Hosting:** [Vercel/AWS/...]
- **CDN:** [Cloudflare/...]
- **CI/CD:** [GitHub Actions/...]
- **Observability:** [Sentry/Datadog/...]

## 3. Modelo de Dados (Schemas)

[Para cada entidade do SPEC, detalhe:
- nome da tabela/collection
- campos com tipo
- índices importantes
- relações]

```sql
-- Exemplo
CREATE TABLE items (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  platform VARCHAR(50),
  ...
);
```

## 4. APIs e Endpoints

[Lista dos endpoints principais agrupados por recurso. Não precisa ser exaustivo — o crítico.]

```
GET    /api/items                       Lista itens
GET    /api/items/:id                   Detalhe do item
GET    /api/items/:id/prices            Histórico de preços
POST   /api/prices                      Submeter preço (auth)
...
```

## 5. Integrações Externas

[Para cada integração: serviço, propósito, autenticação, rate limits, custo estimado]

## 6. Pipelines / Jobs Assíncronos (se aplicável)

[Workers, cron jobs, filas, eventos. Comum em produtos com coleta automatizada de dados ou processamento pesado.]

## 7. Segurança

- Auth strategy
- Authorization (RBAC/ABAC)
- Tratamento de dados sensíveis (LGPD)
- Rate limiting
- Tratamento de uploads

## 8. Observabilidade

- Logging
- Métricas
- Alertas críticos
- Error tracking

## 9. Estratégia de Testes

- Unit (alvo de cobertura)
- Integration
- E2E (ferramentas e cenários críticos)

## 10. Decisões Arquiteturais Significativas (ADRs)

[Decisões importantes com justificativa. Formato: contexto → decisão → consequência.]

### ADR-001: [Título]
**Contexto:** ...
**Decisão:** ...
**Consequência:** ...

## 11. Riscos Técnicos

[Top 3-5 riscos com impacto e mitigação]

## 12. Roadmap de Implementação (alinhado às Fases do SPEC)

### Fase 1 (MVP)
- Setup inicial
- Stack base
- Funcionalidades do MVP do SPEC

### Fase 2
...

---
**Próximo passo:** `/ksdd:design` para o design system completo (se ainda não rodou).
```

### 5. Princípios

- **Decisões justificadas, não imposições.** Cada escolha de stack tem 1 linha de "por quê" baseado no SPEC.
- **Não detalhe demais.** Architecture.md é mapa, não código. Schemas são exemplos, não migrations finais.
- **Marque o que está incerto.** "[A validar]" é melhor que adivinhar.
- **Considere o escopo MVP.** Não over-engineer. Stack simples pra MVP, escalabilidade na Fase 2+.
- **Referencie o SPEC.** "Conforme SPEC seção 5, o pipeline de lives requer..."

### 6. Checkpoint de aprovação (OBRIGATÓRIO)

> architecture.md gerado em `.ksdd/specs/architecture.md`. Pontos de atenção:
> - Stack escolhida: [resumo] — confere se faz sentido pra equipe/contexto
> - Decisões arquiteturais (seção 10) — leia com atenção, são reversíveis com custo
> - Riscos (seção 11) — algum bloqueador conhecido?
>
> Aprovado para prosseguir para `/ksdd:design`?

## Anti-patterns

- ❌ Recomendar stack moderna sem necessidade. → Boring tech wins. Postgres > vector DB exótico se o problema não exige.
- ❌ Decisões sem justificativa. → Toda escolha tem "porque o SPEC pede X".
- ❌ ADRs vazios ou bombásticos. → Use ADR pra decisões reversíveis-com-dor. Não pra "vou usar TypeScript".
- ❌ Especificar UI/UX. → Isso é `/ksdd:design` e SPEC.
- ❌ Schemas completos com todos os campos. → Use schemas como ilustração das entidades-chave.

## Iteração

Se já existe architecture (em `.ksdd/specs/architecture.md` ou `architecture.md` raiz legado), leia, pergunte que partes iterar, use `str_replace` no path onde ele vive. Se está no path legado, sugira migração com `git mv`.
