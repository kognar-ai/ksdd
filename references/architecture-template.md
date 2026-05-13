# Architecture — [Nome do Projeto]

**Versão:** 1.0
**Última atualização:** [DD/MM/AAAA]
**Status:** Rascunho

---

## 1. Visão Geral da Arquitetura

[Diagrama em texto ou mermaid mostrando os blocos principais e como conversam. Exemplo:]

```
[Browser] → [CDN] → [Frontend (Next.js)] → [API Layer] → [PostgreSQL]
                                                       → [Redis Cache]
                                                       → [Background Workers]
                                                            ↓
                                                       [External APIs]
```

---

## 2. Stack Tecnológica

### 2.1 Frontend
- **Framework:** [escolha] — [justificativa]
- **Linguagem:** [TS / JS / outro]
- **Styling:** [Tailwind / CSS-in-JS / outro]
- **State management:** [se relevante]
- **Build/dev:** [Vite / Webpack / Turbopack]

### 2.2 Backend
- **Linguagem/runtime:** [Node / Python / Go]
- **Framework:** [Next.js API / FastAPI / Express]
- **Auth:** [Auth.js / Clerk / Auth0 / custom]
- **API style:** [REST / GraphQL / tRPC]

### 2.3 Dados
- **Banco principal:** [PostgreSQL / MySQL / MongoDB]
- **Cache:** [Redis / Memcached]
- **Search:** [Postgres FTS / Meilisearch / Algolia / Typesense]
- **Storage:** [S3 / R2 / Backblaze]
- **Time-series (se aplicável):** [TimescaleDB / InfluxDB]
- **Vector DB (se aplicável):** [pgvector / Pinecone / Weaviate]

### 2.4 Infraestrutura
- **Hosting:** [Vercel / AWS / GCP / Hetzner]
- **CDN:** [Cloudflare / Fastly]
- **CI/CD:** [GitHub Actions / GitLab CI]
- **Observability:** [Sentry / Datadog / OpenTelemetry]

---

## 3. Modelo de Dados (Schemas)

[Para cada entidade do SPEC seção 4, detalhe schema, índices e relações. Exemplos não exaustivos.]

### 3.1 [Entidade]
```sql
CREATE TABLE [nome] (
  id UUID PRIMARY KEY,
  [campo] [tipo] [constraints],
  ...
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_[entidade]_[campo] ON [nome]([campo]);
```

---

## 4. APIs e Endpoints

[Endpoints principais agrupados por recurso. Crítico, não exaustivo.]

```
GET    /api/[recurso]            Lista
GET    /api/[recurso]/:id        Detalhe
POST   /api/[recurso]            Criar (auth)
PATCH  /api/[recurso]/:id        Atualizar (auth)
DELETE /api/[recurso]/:id        Remover (auth)
```

---

## 5. Integrações Externas

| Serviço | Propósito | Auth | Rate limit | Custo estimado |
|---------|-----------|------|------------|----------------|
| [Nome] | [...] | [API key / OAuth] | [...] | [...] |

---

## 6. Pipelines / Jobs Assíncronos (se aplicável)

[Workers, cron jobs, filas, eventos. Comum em produtos com coleta de dados, processamento pesado, notificações.]

### 6.1 [Nome do Pipeline]
- **Trigger:** [evento / cron / manual]
- **Input:** [...]
- **Output:** [...]
- **Frequência:** [...]
- **Fila:** [SQS / BullMQ / Inngest]

---

## 7. Segurança

- **Auth strategy:** [session-based / JWT / magic links]
- **Authorization:** [RBAC / ABAC / custom]
- **Dados sensíveis (LGPD):** [criptografia em repouso, em trânsito, anonimização]
- **Rate limiting:** [por IP, por usuário, por endpoint]
- **Uploads:** [validação, scan, storage isolado]
- **Secrets management:** [Vault / SSM / .env]

---

## 8. Observabilidade

- **Logging:** [estrutura, agregação, retenção]
- **Métricas:** [o que medir, onde visualizar]
- **Alertas críticos:** [lista do que deve disparar pager]
- **Error tracking:** [Sentry / Rollbar]

---

## 9. Estratégia de Testes

- **Unit:** [framework, alvo de cobertura, escopo]
- **Integration:** [...]
- **E2E:** [Playwright / Cypress, cenários críticos]
- **Load testing (se relevante):** [k6 / Artillery, métricas alvo]

---

## 10. Decisões Arquiteturais Significativas (ADRs)

### ADR-001: [Título]
**Contexto:** [situação que exigiu decisão]
**Decisão:** [o que foi escolhido]
**Consequência:** [trade-offs aceitos]

### ADR-002: [Título]
[mesmo formato]

---

## 11. Riscos Técnicos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| [...] | Alto / Médio / Baixo | Alta / Média / Baixa | [...] |

---

## 12. Roadmap de Implementação

### Fase 1 — MVP
- [ ] Setup do repo, CI/CD básico
- [ ] [Stack base + auth]
- [ ] [Funcionalidades do MVP do SPEC]

### Fase 2 — [tema]
- [ ] [...]

### Fase 3 — [tema]
- [ ] [...]

---

**Próximo passo:** `/ksdd:design` para gerar o design system completo (se ainda não rodou).
