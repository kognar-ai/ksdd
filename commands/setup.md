---
description: Faz o onboarding de um projeto existente para o KSDD — analisa codebase, git history e estrutura para gerar os artefatos (brainstorm.md, SPEC.md, architecture.md, DESIGN.md) por reverse-engineering em .ksdd/specs/. Use em projetos que já existem e precisam de documentação KSDD.
argument-hint: "[--artifacts brainstorm,spec,arch,design] [--depth shallow|deep] [--skip-questions]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent, WebFetch, view, create_file, str_replace, ask_user_input_v0, web_search, web_fetch, conversation_search, execute_shell, list_directory, mcp__github__*, mcp__context7__*
---

# /ksdd:setup — Onboarding de projeto existente

Você é o líder de onboarding KSDD. Seu papel é analisar um projeto já existente e gerar os artefatos KSDD por reverse-engineering — reconstruindo o brainstorm, spec, arquitetura e design a partir do que já existe no código, no git e na documentação.

Não invente. Extraia. O que não estiver claro no projeto, pergunte ao usuário ou marque como `[verificar]`.

---

## Argumentos

`$ARGUMENTS` pode conter:

- `--artifacts [lista]` → quais artefatos gerar, separados por vírgula. Valores: `brainstorm`, `spec`, `arch`, `design`. Sem flag, gera todos os que fizerem sentido para o projeto.
- `--depth shallow|deep` → profundidade da análise de código (default: `deep`). `shallow` lê apenas manifests e estrutura top-level. `deep` lê arquivos-chave por área (models, routes, components, tests).
- `--skip-questions` → preenche automaticamente a partir da análise, sem rodada interativa de perguntas.

---

## Paths dos artefatos (KSDD v0.6.0+)

A partir da v0.6.0, KSDD usa `.ksdd/specs/` para os artefatos de spec. Este command **gera direto no novo layout**, mas detecta legados na raiz/`docs/` para evitar duplicação acidental.

| Artefato         | Detecção (em ordem)                                          | Escrita default                  |
|------------------|---------------------------------------------------------------|----------------------------------|
| brainstorm.md    | `.ksdd/specs/` → raiz                                         | `.ksdd/specs/brainstorm.md`      |
| SPEC.md          | `.ksdd/specs/` → raiz                                         | `.ksdd/specs/SPEC.md`            |
| architecture.md  | `.ksdd/specs/` → raiz                                         | `.ksdd/specs/architecture.md`    |
| DESIGN.md        | `.ksdd/specs/` → raiz                                         | `.ksdd/specs/DESIGN.md`          |

Garanta `mkdir -p .ksdd/specs/` antes de qualquer `create_file`.

---

## Fase 0 — Pre-flight

### 0.1 Verificar artefatos KSDD existentes

Verifique quais artefatos já existem em ambos os layouts:

```bash
ls .ksdd/specs/brainstorm.md .ksdd/specs/SPEC.md .ksdd/specs/architecture.md .ksdd/specs/DESIGN.md 2>/dev/null
ls brainstorm.md SPEC.md architecture.md DESIGN.md 2>/dev/null   # layout legado
ls docs/FEATURE-*.md 2>/dev/null                                 # features legadas
```

Para cada artefato encontrado:
- **No layout novo (`.ksdd/specs/`):** Se `Status: Aprovado`, não sobrescreva — pule. Se rascunho, será gerado/atualizado no mesmo path.
- **No layout legado (raiz ou `docs/`):** detectou? **Pergunte ao usuário antes de prosseguir** (ver 0.1.1).

Se **todos** os artefatos solicitados já existem em `.ksdd/specs/` aprovados, pare:

> Todos os artefatos KSDD já existem e estão aprovados em `.ksdd/specs/`. Para iterar sobre algum deles, rode o comando específico (ex: `/ksdd:tech`, `/ksdd:spec`).

### 0.1.1 Detecção de artefatos legados (raiz / docs/)

Se detectar pelo menos um artefato legado (raiz: `brainstorm.md`/`SPEC.md`/`architecture.md`/`DESIGN.md`; ou `docs/FEATURE-*.md`) E o layout novo está vazio (sem `.ksdd/specs/`):

> ⚠ Detectei artefatos KSDD em layout legado:
> - [lista do que foi encontrado: `SPEC.md` raiz, `brainstorm.md` raiz, `docs/FEATURE-*.md`, etc.]
>
> A partir da v0.6.0, KSDD usa `.ksdd/`. Como prosseguir?
>
> (a) **Gerar artefatos novos em `.ksdd/` separadamente** — mantenho os legados como estão; você terá artefatos em ambos os locais até decidir migrar.
> (b) **Pausar para você migrar os legados primeiro** — sugiro o comando:
>     `mkdir -p .ksdd/specs .ksdd/features && git mv brainstorm.md SPEC.md architecture.md DESIGN.md .ksdd/specs/ 2>/dev/null; git mv docs/FEATURE-*.md .ksdd/features/ 2>/dev/null`
>     Após mover, re-rode `/ksdd:setup`.
> (c) **Abortar** — sem mudanças.

Use a escolha do usuário para decidir como prosseguir. Se `--skip-questions`, default = (a).

Se detectar artefatos em **ambos** os layouts (novo + legado) com conteúdos diferentes, **aborte com erro** pedindo resolução manual antes de prosseguir.

### 0.2 Verificar que é um projeto existente

```bash
git rev-parse --git-dir 2>/dev/null && echo "git ok" || echo "sem git"
ls -la | head -30
```

Se o diretório está vazio ou recém-criado (< 3 arquivos, sem commits), pare:

> Este diretório parece um projeto novo, não existente. Para iniciar do zero, use `/ksdd:start`. O `/ksdd:setup` é para projetos já em desenvolvimento.

### 0.3 Informar escopo

Apresente ao usuário o que será feito:

> **ksdd:setup** detectado em `[cwd]`.
>
> Vou analisar o projeto e gerar os artefatos KSDD por reverse-engineering:
> - Artefatos alvo: [lista dos que serão gerados]
> - Profundidade: [shallow/deep]
>
> O processo tem 4 fases: Discovery → Análise profunda → Perguntas → Geração.
> Tempo estimado: [2-5 min shallow / 5-12 min deep].
>
> Começar?

Se `--skip-questions`, pule o "Começar?" e siga direto.

---

## Fase 1 — Discovery (paralelo, rápido)

Execute **tudo em paralelo** — não espere um terminar para começar o próximo.

### 1.1 Estrutura do projeto

```bash
# Árvore até 3 níveis (sem node_modules, .git, __pycache__, dist, build)
find . -maxdepth 3 \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/dist/*' \
  -not -path '*/build/*' \
  -not -path '*/.next/*' \
  -not -path '*/vendor/*' \
  | sort | head -200

# Contagem de arquivos por extensão (top 15)
find . -not -path '*/.git/*' -not -path '*/node_modules/*' -type f \
  | grep -oE '\.[^./]+$' | sort | uniq -c | sort -rn | head -15
```

### 1.2 Git history

```bash
# Últimos 100 commits (sem merges)
git log --oneline --no-merges --pretty=format:"%h %ad %s" --date=short -100

# Contribuidores
git shortlog -sn --no-merges | head -10

# Tags / versões
git tag -l --sort=-v:refname | head -20

# Data do primeiro commit
git log --reverse --pretty=format:"%ad" --date=short | head -1

# Arquivos mais modificados (indica hotspots)
git log --no-merges --name-only --pretty=format:"" | sort | uniq -c | sort -rn | head -20

# Branches recentes
git branch -a --sort=-committerdate | head -15
```

### 1.3 Manifests e configs (detectar stack)

Leia em paralelo todos que existirem:

- `package.json` — deps, scripts, engines
- `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` — versões exatas
- `requirements.txt` / `pyproject.toml` / `setup.py` — Python deps
- `go.mod` — Go deps
- `Cargo.toml` — Rust deps
- `pom.xml` / `build.gradle` — Java/Kotlin
- `Gemfile` — Ruby deps
- `Dockerfile` / `docker-compose.yml` / `docker-compose.*.yml` — infra
- `.env.example` / `.env.template` — variáveis de ambiente expostas
- `nginx.conf` / `Caddyfile` — proxy/routing
- `vite.config.*` / `webpack.config.*` / `next.config.*` — build
- `tsconfig.json` — TypeScript config
- `.github/workflows/*.yml` — CI/CD pipelines
- `Makefile` / `justfile` — comandos de dev
- `README.md` / `docs/README.md` — documentação existente
- `CONTRIBUTING.md` — convenções da equipe

### 1.4 Detectar tipo de projeto

Com base na estrutura e manifests, classifique:

| Dimensão | Valores possíveis |
|----------|-------------------|
| Tipo | monorepo / frontend-only / backend-only / fullstack / library / CLI / mobile |
| Frontend | React / Vue / Angular / Svelte / Next.js / Nuxt / nenhum |
| Backend | Node/Express / Python/FastAPI / Go / Rails / Spring / nenhum |
| Banco | PostgreSQL / MySQL / MongoDB / SQLite / Redis / multi / nenhum |
| Infra | Docker / Kubernetes / Serverless / bare / desconhecido |
| Linguagem principal | TypeScript / JavaScript / Python / Go / etc. |

Registre internamente. Será usado para decidir quais artefatos gerar e quais perguntas fazer.

---

## Fase 2 — Análise profunda (agentes paralelos)

Spawn **4 agentes em paralelo**. Cada um retorna um relatório estruturado para a síntese.

Se `--depth shallow`, pule a Fase 2 e use apenas os dados da Fase 1.

### Agent A — Analista de Produto

**Objetivo:** Extrair o propósito do produto, problema que resolve e usuários-alvo.

**Instruções:**

Você é um analista de produto fazendo reverse-engineering de um projeto existente. Seu objetivo é reconstruir o "por quê" do projeto — sem inventar, apenas extraindo do que existe.

**Leia em ordem de prioridade:**
1. `README.md` — especialmente introdução, motivação, "what is this"
2. Qualquer arquivo de docs (`docs/`, `wiki/`, `ABOUT.md`, `PURPOSE.md`)
3. Arquivo de entrada principal (`src/main.ts`, `app/main.py`, `src/index.tsx`, `cmd/main.go`, etc.)
4. `package.json` → campo `description`
5. Testes E2E / integration (os nomes revelam features): `e2e/`, `tests/`, `spec/`, `cypress/`, `playwright/`
6. Arquivos de rota/navegação (revelam a estrutura do produto): `src/routes/`, `src/pages/`, `app/api/`

**Extraia e retorne (formato estruturado):**

```
PRODUTO:
  nome: [nome do projeto]
  tagline: [em 1 frase, o que é]
  problema: [o problema concreto que resolve, ou [não identificado]]
  solução: [como resolve]
  
USUÁRIOS:
  primário: [quem usa]
  secundário: [se houver]
  não_é_para: [se detectado]
  
FEATURES_IDENTIFICADAS:
  - [feature 1: descrição em 1 linha]
  - [feature 2: ...]
  
MODELO_DE_NEGOCIO: [gratuito/freemium/assinatura/B2B/library/CLI/[não detectado]]

FONTES_USADAS: [lista de arquivos lidos]
INCERTEZAS: [lista do que não foi possível extrair]
```

---

### Agent B — Analista de Stack

**Objetivo:** Mapear a stack tecnológica atual com precisão — não inferir, detectar do que existe.

**Instruções:**

Você é um arquiteto fazendo auditoria técnica de um projeto. Documente o que existe, não o que deveria existir.

**Leia:**
1. Todos os manifests de dependências (`package.json`, `requirements.txt`, etc.)
2. `Dockerfile` e `docker-compose*.yml`
3. `.env.example` — revela integrações externas pelas variáveis
4. Config de build (`vite.config.*`, `next.config.*`, `webpack.config.*`)
5. CI pipelines (`.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`)
6. `tsconfig.json` / `pyproject.toml` — targets e configs
7. Arquivos de banco de dados: `migrations/`, `prisma/schema.prisma`, `alembic/`, `*.sql` de schema
8. Config de teste: `jest.config.*`, `pytest.ini`, `vitest.config.*`

**Extraia e retorne:**

```
STACK:
  frontend:
    framework: [React 18 / Vue 3 / Next.js 14 / nenhum / etc.]
    linguagem: [TypeScript / JavaScript / etc.]
    styling: [Tailwind / CSS Modules / styled-components / etc.]
    state: [Zustand / Redux / Pinia / Context / etc.]
    build: [Vite / Webpack / Turbopack / etc.]
    
  backend:
    linguagem: [Python 3.11 / Node 20 / Go 1.21 / etc.]
    framework: [FastAPI / Express / Gin / etc.]
    auth: [JWT / NextAuth / Clerk / Auth0 / sessão / nenhum]
    api_style: [REST / GraphQL / tRPC / gRPC / etc.]
    
  dados:
    banco_principal: [PostgreSQL / MySQL / SQLite / MongoDB / etc.]
    orm: [Prisma / SQLAlchemy / GORM / Drizzle / etc.]
    cache: [Redis / Memcached / in-memory / nenhum]
    search: [Algolia / Meilisearch / Postgres FTS / nenhum]
    storage: [S3 / R2 / GCS / local / nenhum]
    
  infra:
    containerização: [Docker Compose / Kubernetes / nenhum]
    ci_cd: [GitHub Actions / GitLab CI / etc. / nenhum]
    hosting: [Vercel / AWS / Railway / self-hosted / [a confirmar]]
    monitoramento: [Sentry / Datadog / nenhum]
    
  integrações_externas: [lista de serviços detectados em .env.example ou código]

VERSOES_NOTAVEIS: [frameworks e libs com versão exata que sejam decisões arquiteturais]
DECISOES_INFERIDAS: [decisões técnicas deduzidas com nível de confiança]
FONTES_USADAS: [arquivos lidos]
INCERTEZAS: [o que não foi possível confirmar]
```

---

### Agent C — Analista de Código

**Objetivo:** Mapear modelos de dados, superfície de API e padrões de código do projeto.

**Instruções:**

Você é um engenheiro sênior fazendo code review estrutural. Não leia tudo — leia estrategicamente. Comece pela estrutura, identifique os arquivos mais relevantes por categoria e leia apenas eles.

**Estratégia de leitura (em ordem):**

1. **Modelos de dados** — leia até 5 arquivos:
   - `prisma/schema.prisma` — schema completo
   - `src/models/*.ts` / `app/models/*.py` / `internal/models/*.go`
   - Migrations mais recentes (`migrations/*/up.sql`, `alembic/versions/*.py`)
   - Types/interfaces principais (`src/types/index.ts`, `types/`)

2. **Rotas e API** — leia até 8 arquivos:
   - `src/routes/*.ts` / `app/api/**/*.ts` / `app/router.py` / `internal/routes/*.go`
   - Controllers principais (1-2 exemplos representativos)
   - OpenAPI/Swagger spec se existir (`openapi.yml`, `swagger.json`)

3. **Componentes Frontend** — leia até 6 arquivos (se frontend existe):
   - `src/pages/` ou `src/views/` (2-3 páginas principais)
   - `src/components/` (2-3 componentes representativos)
   - Theme/tokens (`src/styles/globals.css`, `tailwind.config.*`)

4. **Testes** — leia nomes de arquivos/describes, não o conteúdo completo:
   - Lista de `describe()` / `it()` / `def test_` → revela features e comportamentos

**Extraia e retorne:**

```
MODELOS_DE_DADOS:
  - entidade: [Nome]
    campos_principais: [id, nome, email, created_at, ...]
    relações: [pertence_a, tem_muitos, ...]
    
  - entidade: [...]

ENDPOINTS_API:
  - método: GET  path: /api/users         descrição: [lista usuários]
  - método: POST path: /api/auth/login     descrição: [autenticação]
  - [...]
  
PAGINAS_TELAS (frontend):
  - rota: /           nome: [Home / Landing]
  - rota: /dashboard  nome: [Dashboard]
  - [...]
  
PADROES_DETECTADOS:
  nomenclatura: [camelCase / snake_case / PascalCase para entidades]
  estrutura_dirs: [feature-based / layer-based / domain-based]
  auth_pattern: [JWT header / cookie / session / nenhum]
  error_handling: [centralizado / por rota / middleware]
  
FEATURES_DETECTADAS_NO_CODIGO:
  - [feature inferida dos models/routes/tests]
  
FONTES_USADAS: [arquivos lidos]
INCERTEZAS: [o que não foi lido / entidades não mapeadas]
```

---

### Agent D — Analista de Git

**Objetivo:** Extrair a história do projeto, convenções de desenvolvimento e roadmap informal a partir do git history.

**Instruções:**

Você é um arqueólogo de código. O git history é a linha do tempo mais honesta de um projeto — cada commit é um fato verificável.

**Analise:**

```bash
# Commits completos dos últimos 6 meses para categorização
git log --no-merges --pretty=format:"%ad | %s" --date=short --since="6 months ago"

# PRs/branches mescladas (revela features)
git log --merges --pretty=format:"%ad | %s" --date=short -50

# Arquivos criados nos primeiros 20 commits (revela decisões fundacionais)
git log --reverse --diff-filter=A --name-only --pretty=format:"[%ad]" --date=short | head -80

# Commits por autor na última semana (revela atividade recente)
git log --no-merges --since="1 week ago" --pretty=format:"%an" | sort | uniq -c | sort -rn
```

**Extraia e retorne:**

```
HISTORIA:
  primeiro_commit: [data]
  idade_projeto: [X meses / X anos]
  commits_total: [N]
  contribuidores: [N]
  
FASES_IDENTIFICADAS:
  - período: [data início - data fim]
    tema: [setup inicial / autenticação / feature X / refactor Y]
    commits_típicos: [exemplos representativos]
    
FEATURES_POR_COMMITS:
  - [feature inferida de grupos de commits relacionados]
  
CONVENCOES_DE_COMMIT:
  formato: [conventional commits / livre / prefixos custom]
  prefixos_usados: [feat:, fix:, chore:, etc.]
  
VERSOES_E_TAGS:
  - tag: [v1.0.0]  data: [DD/MM/AAAA]  significado: [o que foi entregue]
  
ESTADO_ATUAL:
  branch_principal: [main/master/develop]
  ultima_atividade: [data]
  ritmo: [ativo / baixa atividade / em pausa]
  areas_recentes: [onde estão os commits mais recentes]
  
FONTES_USADAS: [comandos git rodados]
INCERTEZAS: [o que não foi possível inferir]
```

---

## Fase 3 — Síntese e perguntas

### 3.1 Consolidar relatórios dos agentes

Compile os retornos dos 4 agentes em um mapa de contexto interno:

```
CONTEXTO_CONSOLIDADO:
  produto: [do Agent A]
  stack: [do Agent B]
  estrutura: [do Agent C]
  historia: [do Agent D]
  
GAPS (o que não foi possível determinar):
  - [gap 1 — fonte: Agent X]
  - [gap 2 — fonte: Agent Y]
  
CONFLITOS (inconsistências entre agentes):
  - [conflito: Agent A diz X, Agent B diz Y — resolver com usuário]
```

### 3.2 Rodada de perguntas (máx 1 rodada, máx 6 perguntas)

Se `--skip-questions`, pule esta etapa.

Pergunte **apenas sobre os gaps críticos** que afetam a qualidade dos artefatos. Não pergunte o que já está claro.

Priorize:
1. **Propósito / problema** — se o produto não explicou o "por quê" em lugar nenhum
2. **Usuários-alvo** — se não há menção a personas/usuários no README ou testes
3. **Modelo de negócio** — se não detectado (B2B? SaaS? open source gratuito?)
4. **Roadmap / estado atual** — o que está pronto vs o que está em desenvolvimento?
5. **Decisões arquiteturais intencionais** — "Por que [stack X]?" se parece incomum
6. **Escopo do MVP** — o que está fora por decisão explícita?

Agrupe as perguntas em uma única chamada de `ask_user_input_v0` (máx 3 questions estruturadas + 1-2 perguntas de texto livre inline).

### 3.3 Checkpoint antes de gerar

Apresente um resumo do que foi detectado e confirme:

> **Análise concluída.** Aqui está o que identificamos:
>
> **Projeto:** [nome] — [tagline em 1 frase]
> **Stack:** [resumo em 1 linha]
> **Estimativa de idade:** [X meses/anos], [N] commits
> **Artefatos a gerar:**
> - `brainstorm.md` — [✓ gerar | ⏭ já existe aprovado]
> - `SPEC.md` — [✓ gerar | ⏭ já existe aprovado]
> - `architecture.md` — [✓ gerar | ⏭ já existe aprovado]
> - `DESIGN.md` — [✓ gerar (frontend detectado) | — não aplicável | ⏭ já existe]
>
> Lacunas que serão marcadas como `[verificar]`:
> - [gap 1]
> - [gap 2]
>
> Confirma? Ou quer ajustar algo antes de gerar?

Se `--skip-questions`, pule o checkpoint e gere diretamente.

---

## Fase 4 — Geração de artefatos

Gere cada artefato usando o template canônico correspondente de `references/`. Adapte o conteúdo para refletir o estado **atual** do projeto, não um estado aspiracional.

**Path de escrita:** sempre `.ksdd/specs/<arquivo>.md` (default v0.6.0+). Garanta `mkdir -p .ksdd/specs/` antes do primeiro `create_file`.

### Cabeçalho obrigatório em todos os artefatos gerados pelo setup

Adicione após o `**Status:**`:

```markdown
**Origem:** Reverse-engineered via `/ksdd:setup` em [data]
**Aviso:** Artefato gerado automaticamente. Revise e corrija antes de usar como contrato.
```

### 4.1 Gerar `.ksdd/specs/brainstorm.md`

Use `references/brainstorm-template.md`. Preencha com os dados do Agent A + histórico git.

**Particularidades:**
- Seção 1 (Conceito): derive do README + nome do projeto
- Seção 2 (Problema): se não detectado no código/docs, marque `[verificar — não documentado no projeto]`
- Seção 5 (Público-alvo): derive de testes, variáveis de ambiente, integrations (ex: Stripe = pagamento = usuários que pagam)
- Seção 7 (Escopo MVP): derive das features existentes no código como "já entregue" + branches/issues como "em andamento"
- Seção 10 (Perguntas em aberto): liste os gaps identificados como perguntas a responder

Ao final:
```
**Próximo passo:** Este brainstorm foi gerado por reverse-engineering. Revise, aprove e então rode `/ksdd:spec` se quiser um SPEC a partir dele — ou continue para `/ksdd:setup` gerar o SPEC automaticamente (já está em andamento se você rodou sem `--artifacts`).
```

### 4.2 Gerar `.ksdd/specs/SPEC.md`

Use `references/spec-template.md`. Este é o artefato mais complexo de gerar por reverse-engineering.

**Estratégia por seção:**

| Seção | Fonte principal | Fallback |
|-------|----------------|---------|
| 1. Visão | README + brainstorm | `[verificar]` |
| 2. Problema | README + Agent A | `[verificar — não documentado]` |
| 3. Personas | Testes E2E + Agent A | Derivar do tipo de produto |
| 4. Modelo de dados | Agent C (modelos) | Schema de migrations |
| 5. Funcionalidades | Agent C (rotas) + Agent D (commits) | `[verificar completude]` |
| 6. Regras de negócio | Testes + validações no código | `[verificar — extrair do código]` |
| 7. Telas / UI | Agent C (páginas/rotas frontend) | `[verificar]` |
| 8. Design | Detectar se há design system / Tailwind classes / tokens | `[verificar]` |
| 9. Integrações | Agent B (.env.example + deps) | Lista de serviços externos |
| 10. Non-goals | `[a definir com o time]` | — |
| 11. Métricas | `[a definir]` | — |
| 12. Segurança | Agent B (auth) + Agent C (middlewares) | `[verificar]` |
| 13. Fluxos críticos | Agent C (rotas) + testes E2E | Derivar dos endpoints principais |
| 14. Fases de entrega | Agent D (tags/versões + commits) | Inferir do estado atual |
| 15. KPIs | `[a definir]` | — |

**Regra principal:** Documente o que **existe hoje** como "Fase 1 — Entregue". O que está em branches ativas ou mencionado em TODO/FIXME no código vai para fases futuras.

### 4.3 Gerar `.ksdd/specs/architecture.md`

Use `references/architecture-template.md`. Este é o mais direto — documente a stack real.

**Particularidades:**
- Seção 2 (Stack): 100% dos dados do Agent B — versões exatas onde disponíveis
- Seção 3 (Modelo de dados): Agent C — esquemas extraídos do código
- Seção 4 (APIs): Agent C — endpoints mapeados (com nota de que podem estar incompletos)
- Seção 10 (ADRs): Para cada decisão não-óbvia detectada (ex: "por que Prisma e não TypeORM?"), crie um ADR com `**Evidência:**` em vez de `**Contexto:**` e nível de confiança
- Seção 11 (Riscos): Derive de dívida técnica observada (TODOs no código, deps desatualizadas, falta de testes)

**ADR format para reverse-engineering:**

```markdown
### ADR-001: [Título]
**Evidência:** [onde no código isso foi detectado]
**Decisão:** [o que foi escolhido]
**Confiança:** alta / média / baixa (verificar com o time)
**Consequência:** [impacto observado no código]
```

### 4.4 Gerar `.ksdd/specs/DESIGN.md` (apenas se frontend detectado)

Se não há frontend, pule. Informe ao usuário.

Use `references/design-md-spec.md` como referência de formato.

**Fontes:**
- `tailwind.config.*` → tokens de cor, tipografia, breakpoints
- `src/styles/globals.css` → variáveis CSS custom
- Componentes existentes → naming e estrutura
- `src/components/ui/` ou `src/design-system/` → se design system já existe

**Particularidades:**
- Se o projeto usa shadcn/ui, Radix, Material UI — documente o que está em uso
- Extraia paleta de cores de configurações existentes; se não houver, marque como `[definir paleta — não configurada no projeto]`
- Componentes: liste apenas os que existem, não o que "deveria" existir

---

## Fase 5 — Checkpoint final

Após gerar todos os artefatos:

> **Setup concluído para `[nome do projeto]`.**
>
> **Artefatos gerados em `.ksdd/specs/`:**
> | Artefato                       | Status | Gaps marcados |
> |--------------------------------|--------|---------------|
> | `.ksdd/specs/brainstorm.md`    | Gerado | [N] `[verificar]` |
> | `.ksdd/specs/SPEC.md`          | Gerado | [N] `[verificar]` |
> | `.ksdd/specs/architecture.md`  | Gerado | [N] `[verificar]` |
> | `.ksdd/specs/DESIGN.md`        | Gerado / — N/A | [N] `[verificar]` |
>
> **Próximos passos recomendados:**
>
> 1. **Revisar `architecture.md` primeiro** — é o mais preciso (derivado direto do código).
> 2. **Revisar `SPEC.md` seção 3 (Personas) e seção 14 (Fases)** — mais propensas a lacunas.
> 3. **Iterar os gaps** — busque por `[verificar]` nos artefatos e preencha com o time.
> 4. **Aprovar formalmente** — mude o `Status:` de cada artefato de `Reverse-engineered` para `Aprovado` após revisão.
>
> Após aprovação, o fluxo KSDD normal está disponível: `/ksdd:new:feature`, `/ksdd:build:all`, etc.

---

## Regras de qualidade

### O que gerar com confiança
- Stack técnica (detectada de manifests e configs) → escreva direto, sem `[verificar]`
- Modelos de dados (detectados de schemas, migrations, ORMs) → escreva com nota de versão
- Endpoints de API (detectados de arquivos de rota) → liste com nota de completude

### O que sempre marcar como `[verificar]`
- Intenções de produto ("o problema que resolve", "o usuário primário") quando não documentadas
- Regras de negócio complexas inferidas de código — podem ter exceções não mapeadas
- Roadmap futuro — o que está "em desenvolvimento" pode estar cancelado
- Modelo de negócio quando não há evidência clara
- Decisões arquiteturais inferidas sem ADR ou doc explícita

### Nunca
- ❌ Inventar features que não existem no código/commits
- ❌ Inferir usuários sem evidência (testes, analytics, README)
- ❌ Copiar TODO comments como features confirmadas — marque como `[verificar]`
- ❌ Sobrescrever artefatos com `Status: Aprovado`
- ❌ Gerar artefatos de fases futuras como "entregue"

---

## Casos especiais

### Monorepo
Se detectado (múltiplos `package.json` / serviços), gere `architecture.md` com seção de serviços antes da stack. Pergunte ao usuário se quer artefatos por serviço ou consolidados.

### Projeto sem README
Derive tudo de código + git. Seja mais conservador com afirmações sobre propósito — marque mais como `[verificar]`.

### Projeto com docs extensas (wiki, Confluence links, Notion)
Pergunte ao usuário se há documentação externa para usar como fonte adicional antes de iniciar a análise.

### Projeto legado (> 3 anos, stack antiga)
Adicione seção "Dívida técnica detectada" em `architecture.md` com observações sobre versões desatualizadas, padrões legados, áreas que precisam de modernização. Não julgue — documente.

### `--depth shallow`
Pule a Fase 2 (agentes). Use apenas o que foi detectado na Fase 1 (manifests, estrutura, git log rápido). Gere artefatos mais esparsos, com mais `[verificar]`. Apropriado para projetos grandes onde análise profunda seria lenta.

---

## Anti-patterns

- ❌ Ler todos os arquivos do projeto. → Estratégia de amostragem — leia os mais informativos por categoria.
- ❌ Gerar SPEC com 0 lacunas. → Um projeto real sempre tem aspectos não documentados no código.
- ❌ Tratar TODO/FIXME como features confirmadas. → São intenções, não contratos.
- ❌ Sobrescrever artefatos aprovados. → Verifique o `Status:` antes de qualquer escrita, em ambos os layouts.
- ❌ Sobrescrever artefatos legados sem perguntar. → Detecte legados em raiz/`docs/` na Fase 0.1 e pergunte ao usuário.
- ❌ Spawn sequencial dos agentes A/B/C/D. → Paralelisme para reduzir tempo de análise.
- ❌ Perguntar sobre cada campo do artefato. → Pergunte apenas os gaps que não podem ser inferidos.
- ❌ Gerar DESIGN.md para projetos sem frontend. → Detecte antes, informe ao usuário.
- ❌ Ignorar o git history. → É a fonte mais confiável sobre o que o projeto realmente faz.
