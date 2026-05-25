# Feature: Consolidar artefatos KSDD em `.ksdd/`

> Mover todos os artefatos gerados pelos commands KSDD (brainstorm, SPEC, architecture, DESIGN, FEATURE, tasks, BUILD-PLAN) da raiz do projeto e de `docs/` para uma única pasta `.ksdd/` organizada por fase.

**Slug:** ksdd-folder-layout
**Prioridade:** Alta
**Status:** Rascunho
**Data:** 19/05/2026
**Projeto:** KSDD — Kognar Spec-Driven Design & Development

---

## 1. Motivação

### 1.1 Problema / Oportunidade

Hoje os 6 artefatos canônicos do KSDD ficam espalhados em três níveis do projeto-alvo:

- **Raiz:** `brainstorm.md`, `SPEC.md`, `architecture.md`, `DESIGN.md`, `BUILD-PLAN.md`
- **`docs/`:** `FEATURE-[slug].md`
- **`docs/tasks/feature-[slug]/`:** tasks individuais

Isso gera três dores concretas (todas confirmadas por uso interno do mantenedor — ver SPEC seção 1.1 e brainstorm seção 2):

1. **Poluição da raiz do projeto.** Repositórios bem cuidados normalmente isolam artefatos de ferramenta (`.github/`, `.vscode/`, `.claude/`) em pastas dedicadas. KSDD espalha 4-5 arquivos `.md` na raiz que disputam atenção com `README.md`, `CHANGELOG.md`, configs do build, etc. Em um projeto maduro a raiz vira um amontoado.
2. **Inconsistência cognitiva.** Não há regra mental simples sobre "onde acho os artefatos do KSDD?" — usuário precisa lembrar que SPEC fica na raiz, FEATURE em `docs/`, task em `docs/tasks/...`. Em onboarding de novo dev é fricção desnecessária ("isso é doc do projeto ou doc do KSDD?").
3. **Conflito com convenções de outros projetos.** Muitos projetos já têm `docs/` próprio com conteúdo não-KSDD (architecture decisions, guias de contribuição, runbooks). KSDD jogando `docs/FEATURE-*.md` lá mistura artefatos da ferramenta com docs do produto, dificultando `.gitignore` seletivo ou export pra portal de docs.

A oportunidade é alinhar KSDD com a convenção que ele já segue para sua própria instalação (`~/.claude/skills/ksdd/`, `~/.agents/skills/ksdd/`): **pasta dedicada, prefixo claro, separação limpa**. Reforça a mensagem do produto de que KSDD é uma camada externa de processo, não parte da documentação do produto.

### 1.2 Personas Impactadas

- **Marina (Product Designer / PM solo) — SPEC seção 2.1:** ganha um diretório único pra navegar quando entra no repo do projeto pela manhã. Hoje precisa abrir 3-5 arquivos espalhados; com `.ksdd/` faz `ls .ksdd/specs/` e vê tudo.
- **Rafa (Founder técnico solo) — SPEC seção 2.2:** raiz do projeto continua limpa pra ele focar no que é "produto" (código, README, configs). Artefatos KSDD ficam discretos numa pasta hidden — alinhado com a mentalidade de "ferramenta de processo, não código".
- **Lia (Tech lead em agência) — SPEC seção 2.3:** entrega final pro cliente fica mais profissional. Em vez de "vou te mandar SPEC.md, brainstorm.md, e tem mais coisa em docs/", entrega "a pasta `.ksdd/` é tudo do processo de spec-driven; o resto é seu produto".

### 1.3 Métricas de Sucesso

| Métrica | Meta | Prazo |
|---------|------|-------|
| Projetos KSDD novos usando `.ksdd/` como local default | 100% (após v0.6.0) | imediato pós-release |
| Projetos legados (com artefatos na raiz) continuando a funcionar sem migração | 100% | 1 release (compat retroativa) |
| Issues/perguntas sobre "onde fica o SPEC?" no GitHub | reduzir vs baseline | 3 meses pós-release |
| Tempo médio do `/ksdd:setup` em projeto existente | sem degradação (≤ atual) | imediato |

---

## 2. Escopo

### 2.1 O que entra (v1)

- **Novo layout `.ksdd/`** com subpastas por fase:
  ```
  .ksdd/
  ├── specs/
  │   ├── brainstorm.md
  │   ├── SPEC.md
  │   ├── architecture.md
  │   └── DESIGN.md
  ├── features/
  │   └── FEATURE-[slug].md
  ├── tasks/
  │   └── feature-[slug]/
  │       ├── README.md
  │       ├── NNN-*.md
  │       └── .context/
  │           └── NNN-context.md
  └── build/
      └── BUILD-PLAN.md
  ```
- **Atualização de todos os 8 slash commands** (`start`, `spec`, `tech`, `design`, `new:feature`, `build:feature`, `build:all`, `setup`) para escrever no novo layout.
- **Leitura backward-compatible**: cada command tenta primeiro o path novo (`.ksdd/specs/SPEC.md`); se não existir, faz fallback para o path legado (`SPEC.md` na raiz ou `docs/FEATURE-*.md`). Sem breaking change pra projetos existentes.
- **Atualização de todos os templates canônicos** (`references/feature-template.md`, `references/build-plan-template.md`, `references/spec-template.md`, `references/architecture-template.md`, `references/brainstorm-template.md`, `references/design-md-spec.md`, `references/approval-gates.md`, `references/codex-SKILL.md`) para usar os novos paths em exemplos e referências cruzadas.
- **Atualização dos agents** (`agents/critic.md`, `agents/interviewer.md`, `agents/setup-analyst.md`) que mencionam paths de artefatos.
- **Atualização da documentação pública** (`README.md`, `INSTALL.md`) com o novo layout, incluindo nota de migração.
- **Warning de deprecação** quando comando detecta artefato legado na raiz: mensagem amarela sugerindo migração manual (ou rerun do `/ksdd:setup`).
- **Dogfooding**: migrar os artefatos do próprio repo KSDD (`brainstorm.md`, `SPEC.md`, `architecture.md` na raiz) para `.ksdd/specs/` como prova de fluxo end-to-end.
- **Entrada no CHANGELOG.md** documentando a mudança e estratégia de compat retroativa.

### 2.2 O que fica pra depois

- **Comando `ksdd migrate`** no CLI (`bin/ksdd.js`) para mover artefatos legados automaticamente — fora desta v1 porque o fallback de leitura já cobre o caso de uso sem urgência. Adicionar quando houver demanda de usuários com muitos projetos legados.
- **`ksdd doctor` / `ksdd status` no projeto-alvo** mostrando estado dos artefatos (qual existe, qual está aprovado, qual está em layout legado). Útil mas não bloqueia esta entrega.
- **Remoção do fallback de leitura legado** — fica pra v1.0.0 como breaking change consciente, depois de janela razoável (≥ 6 meses) de compat.
- **Suporte a `.ksdd-config.json`** para sobrescrever paths default (ex: time que quer `docs/ksdd/` em vez de `.ksdd/`). Engenharia excessiva pra v1.

### 2.3 O que NÃO é essa feature

- **Não muda formato de nenhum artefato.** Só muda onde eles ficam no disco. Conteúdo de `SPEC.md`, frontmatter de tasks, structure do FEATURE — todos permanecem idênticos.
- **Não muda paths de instalação do KSDD em si.** `~/.claude/skills/ksdd/`, `~/.codex/prompts/`, `.ksdd-manifest.json` continuam onde estão. Esta feature é sobre os artefatos do **projeto-alvo**, não da instalação.
- **Não muda CLI subcommands.** `ksdd install/uninstall/status/help` não recebem flags novas nesta feature.
- **Não introduz `.gitignore` automático para `.ksdd/`.** A pasta é commitável — é parte do contrato do projeto.

---

## 3. User Stories

| # | Como... | Quero... | Para... |
|---|---------|----------|---------|
| US-01 | Marina (PM solo) | abrir um repo KSDD novo e ver imediatamente onde estão os artefatos do processo | não perder tempo procurando arquivos espalhados |
| US-02 | Rafa (founder) | manter a raiz do meu repo limpa (só README, configs, código) | preservar a primeira impressão profissional do projeto |
| US-03 | Lia (tech lead agência) | entregar `.ksdd/` como pasta isolada pro cliente | separar claramente artefatos de processo dos artefatos de produto |
| US-04 | Qualquer usuário com projeto KSDD legado | continuar usando `/ksdd:spec`, `/ksdd:new:feature`, etc. sem migrar nada | não ser forçado a refactor por upgrade de patch version |
| US-05 | Qualquer usuário que migra | um warning claro quando ainda tenho artefatos legados na raiz | saber que existe um caminho de upgrade e qual é |
| US-06 | Contribuidor do KSDD | ler o próprio repo do KSDD e ver os artefatos no layout final | confirmar que a ferramenta dogfooda seu próprio padrão |

---

## 4. Fluxos de Uso

### 4.1 Projeto novo — fluxo completo com novo layout

**Pré-condição:** Projeto vazio (sem `.ksdd/` nem artefatos legados).
**Trigger:** Usuário invoca `/ksdd:start`.

1. `/ksdd:start` gera `brainstorm.md` em **`.ksdd/specs/brainstorm.md`** (cria estrutura de diretórios se não existir).
2. Gate 1 → usuário aprova.
3. `/ksdd:spec` lê `.ksdd/specs/brainstorm.md` → gera `.ksdd/specs/SPEC.md`.
4. Gate 2 → usuário aprova.
5. `/ksdd:tech` lê specs anteriores → gera `.ksdd/specs/architecture.md`.
6. `/ksdd:design` → `.ksdd/specs/DESIGN.md`.
7. `/ksdd:new:feature` lê todos os specs → gera `.ksdd/features/FEATURE-[slug].md` + `.ksdd/tasks/feature-[slug]/` com README + tasks.
8. `/ksdd:build:feature` lê tasks → grava `.ksdd/tasks/feature-[slug]/.context/NNN-context.md` antes de implementar.
9. `/ksdd:build:all` gera `.ksdd/build/BUILD-PLAN.md` antes de orquestrar features.

**Sucesso:** Todos os artefatos vivem em `.ksdd/`, raiz do projeto continua limpa.
**Erro / edge case:** Falha ao criar `.ksdd/specs/` (permissão) → erro claro indicando path e sugerindo `mkdir` manual.

### 4.2 Projeto legado — leitura backward-compatible

**Pré-condição:** Projeto tem `SPEC.md` e `brainstorm.md` na raiz (layout pré-v0.6.0).
**Trigger:** Usuário invoca `/ksdd:new:feature minha-feature`.

1. Command tenta ler `.ksdd/specs/SPEC.md` → não existe.
2. Fallback: tenta ler `SPEC.md` na raiz → encontra.
3. Emite warning amarelo:
   > Detectado artefato em layout legado: `SPEC.md` na raiz. A partir da v0.6.0, KSDD usa `.ksdd/specs/SPEC.md`. Esta feature será criada em `.ksdd/features/FEATURE-minha-feature.md`. Considere mover os artefatos legados ao concluir esta feature.
4. Procede normalmente — escreve a feature nova já no layout `.ksdd/features/`.
5. Após geração, lembra de novo: "Você agora tem artefatos em dois locais. Migração manual sugerida: `mkdir -p .ksdd/specs && git mv SPEC.md brainstorm.md .ksdd/specs/`".

**Sucesso:** Comando funciona sem migração obrigatória; usuário sabe o que está acontecendo.
**Erro / edge case:** Se existirem **ambos** os paths (legado E novo) com conteúdos diferentes → erro bloqueante pedindo pra resolver o conflito manualmente (não escolher por heurística — segurança primeiro).

### 4.3 Reverse-engineering com `/ksdd:setup` em projeto existente

**Pré-condição:** Projeto pré-existente sem KSDD; usuário roda `/ksdd:setup`.
**Trigger:** `/ksdd:setup`.

1. Pre-flight detecta que nem `.ksdd/specs/SPEC.md` nem `SPEC.md` legado existem.
2. Procede com discovery + análise normal.
3. Gera todos os artefatos diretamente em `.ksdd/specs/` (default novo).
4. Reporta paths gerados ao usuário no resumo final.

**Sucesso:** Novo projeto KSDD-onboarded já nasce no layout final.
**Erro / edge case:** Se `/ksdd:setup` rodar em projeto que já tem artefatos legados (raros, mas possível), pergunta ao usuário: "Detectei `SPEC.md` na raiz (layout legado). Quer (a) gerar artefatos em `.ksdd/` separadamente, (b) sobrescrever após mover legados pra `.ksdd/`, (c) abortar?"

---

## 5. Impacto em Telas Existentes

**Não aplicável — KSDD é CLI sem UI.** Substituído por **Impacto em Superfícies (SPEC seção 7)**:

| Superfície (SPEC seção 7) | O que muda | Por quê |
|---------------------------|------------|---------|
| **Slash commands Claude Code** (`~/.claude/commands/ksdd:*.md`) | Cada comando referencia novo path default; mantém leitura fallback do legado. Linguagem dos prompts internos atualizada. | Fonte de verdade do comportamento |
| **Custom prompts Codex** (`~/.codex/prompts/ksdd-*.md`) | Idem (mesmos arquivos `commands/*.md` distribuídos via `bin/ksdd.js`) | Single source of truth garante consistência multi-agent |
| **CLI `bin/ksdd.js`** | Sem mudança de subcomandos. Mensagens do `ksdd help` podem ganhar 1 linha sobre o novo layout. | Esta feature não toca instalação |
| **Skill `~/.agents/skills/ksdd/SKILL.md`** (Codex) | Possivelmente referência a paths nos exemplos. | Templates copiados precisam estar coerentes |
| **README do GitHub + página npm** | Seção "Como funciona" e exemplos de paths atualizados; nota de migração para v0.6.0 | Primeira impressão do produto |
| **INSTALL.md** | Exemplo de "o que esperar" pós-instalação atualizado | Onboarding técnico |

### 5.1 Telas Novas (se aplicável)

Não aplicável.

---

## 6. Impacto no Modelo de Dados

### 6.1 Novas Entidades

Nenhuma entidade nova. Apenas reorganização espacial de artefatos existentes.

### 6.2 Alterações em Entidades Existentes

| Entidade (SPEC seção 4.2) | Alteração | Migração |
|----------------------------|-----------|----------|
| `brainstorm.md` | Path: raiz → `.ksdd/specs/brainstorm.md` | Manual (sugerida via warning); compat de leitura mantida |
| `SPEC.md` | Path: raiz → `.ksdd/specs/SPEC.md` | Idem |
| `architecture.md` | Path: raiz → `.ksdd/specs/architecture.md` | Idem |
| `DESIGN.md` | Path: raiz → `.ksdd/specs/DESIGN.md` | Idem |
| `FEATURE-[slug].md` | Path: `docs/FEATURE-[slug].md` → `.ksdd/features/FEATURE-[slug].md` | Idem; fallback também aceita root-level `FEATURE-*.md` legado |
| `docs/tasks/feature-[slug]/NNN-*.md` | Path: `docs/tasks/feature-[slug]/` → `.ksdd/tasks/feature-[slug]/` | Idem |
| `docs/tasks/feature-[slug]/.context/NNN-context.md` | Path: idem (subpasta dentro de tasks) → `.ksdd/tasks/feature-[slug]/.context/` | Idem |
| `BUILD-PLAN.md` | Path: raiz → `.ksdd/build/BUILD-PLAN.md` | Idem |
| `.ksdd-manifest.json` (instalação) | **Sem mudança** — continua em `~/.claude/skills/ksdd/` | n/a |

Cada artefato continua com seu `Status:` (Rascunho / Aprovado) e formato interno **idênticos**. Só o path no filesystem muda.

---

## 7. Impacto na API

**Não aplicável (sem servidor HTTP).** API equivalente é a superfície CLI do `bin/ksdd.js` (architecture seção 4.1):

### 7.1 Novos Subcomandos CLI

Nenhum nesta v1. Comando `ksdd migrate` fica fora do escopo (seção 2.2).

### 7.2 Subcomandos Modificados

| Subcomando | Alteração |
|------------|-----------|
| `ksdd help` | Adicionar 1 linha no texto explicando layout `.ksdd/` (opcional, baixa prioridade) |
| `ksdd install` / `uninstall` / `status` | Sem mudança comportamental |

### 7.3 Slash commands (impacto interno)

Todos os 8 commands em `commands/*.md` recebem ajustes textuais no prompt:

- Substituir paths absolutos (`view SPEC.md`, `create_file brainstorm.md`, `view docs/FEATURE-[slug].md`) pelos novos paths `.ksdd/...`.
- Adicionar instrução de fallback de leitura: "Se `.ksdd/specs/SPEC.md` não existir, tente `SPEC.md` na raiz. Se encontrar, emita warning de deprecação."
- Adicionar instrução de `mkdir -p .ksdd/[subdir]/` antes de criar artefatos novos.

---

## 8. Impacto no Design

**Não aplicável — KSDD não tem UI.** Considerações equivalentes para output CLI / documentação:

### 8.1 Componentes Existentes Reutilizados

- **Helper de cor ANSI (`yellow`)** — usado nas mensagens de warning de deprecação (consistente com SPEC seção 11 sobre `uninstall sem manifest` e outros warnings).
- **Linguagem dos approval gates** (`references/approval-gates.md`) — texto dos gates 1-7 atualizado pra mencionar paths novos sem mudar a estrutura.

### 8.2 Componentes Novos Necessários

Nenhum.

### 8.3 Tokens / Padrões Visuais

- **Padrão de mensagem de deprecação**: amarelo (yellow), texto em 2-3 linhas, sempre cita (a) o que detectou, (b) qual é o novo path esperado, (c) sugestão de migração manual via `git mv`.

---

## 9. Dependências e Riscos

### 9.1 Dependências

| Tipo | Dependência | Status | Impacto se bloqueada |
|------|-------------|--------|----------------------|
| Técnica | Nenhuma dependência externa nova | Resolvida | n/a |
| Técnica | ADR-001 (zero deps runtime) — feature precisa ser implementada com built-ins apenas | Resolvida (não muda) | n/a |
| Conteúdo | Atualização coordenada dos 8 commands + 8 references + 3 agents — single PR ou se separar pode gerar dessincronia | Pendente (controlado pela ordem de tasks) | Médio se desincronizar |
| Decisão | Fase 5 do roadmap (multi-agent: Cursor, Windsurf, Cline) pode entrar no meio — preferível concluir esta feature antes pra não ter que refator de path em N agentes | Confirmado: Fase 5 não começou ainda | Alto se sobrepor |

### 9.2 Riscos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Usuário com projeto legado roda comando, não vê warning, fica confuso quando vê dois conjuntos de artefatos | Médio | Média | Warning amarelo claro + mensagem ao final do comando lembrando da migração sugerida + entrada destacada no CHANGELOG |
| Conflito entre artefato legado e novo (ambos presentes com conteúdos diferentes) | Alto | Baixa | Detectar caso e abortar com erro bloqueante pedindo resolução manual; não escolher heurística |
| Templates em `references/` ficarem desatualizados (mencionando paths antigos) | Médio | Média | Checklist no PR cobrindo TODOS os arquivos identificados (grep automatizado na task de QA) |
| Migração dogfood do próprio repo quebra links em commits anteriores (PRs, docs externas que apontam pra `SPEC.md` raiz) | Baixo | Média | Aceitar — git history preserva versões; README atualizado com link novo. Tag `v0.6.0` no momento da migração |
| Hidden folder `.ksdd/` ser invisível em editores que filtram dotfiles (alguns Finder views, GUIs antigas) | Baixo | Baixa | Documentar no README; usuários técnicos sabem lidar com hidden folders |
| Suporte futuro a Cursor/Windsurf/Cline (Fase 5) ter convenções incompatíveis com `.ksdd/` | Baixo | Baixa | `.ksdd/` é dentro do projeto-alvo (não da instalação do agente) — agnóstico ao CLI consumidor |
| Quebrar reverse-engineering em projeto que já tinha artefatos KSDD antigos | Alto | Baixa | Pre-flight do `/ksdd:setup` perguntar explicitamente (fluxo 4.3) ao detectar legados |

---

## 10. Critérios de Aceite

- [ ] Em projeto vazio, `/ksdd:start` cria `.ksdd/specs/brainstorm.md` (e não `brainstorm.md` na raiz).
- [ ] Em projeto vazio, `/ksdd:spec` lê `.ksdd/specs/brainstorm.md` e gera `.ksdd/specs/SPEC.md`.
- [ ] Em projeto vazio, `/ksdd:tech` gera `.ksdd/specs/architecture.md`.
- [ ] Em projeto vazio, `/ksdd:design` gera `.ksdd/specs/DESIGN.md`.
- [ ] Em projeto vazio, `/ksdd:new:feature [slug]` gera `.ksdd/features/FEATURE-[slug].md` + `.ksdd/tasks/feature-[slug]/README.md` + tasks.
- [ ] Em projeto vazio, `/ksdd:build:feature [slug]` grava `.ksdd/tasks/feature-[slug]/.context/NNN-context.md` antes de implementar.
- [ ] Em projeto vazio, `/ksdd:build:all` gera `.ksdd/build/BUILD-PLAN.md`.
- [ ] Em projeto com `SPEC.md` na raiz (legado), `/ksdd:new:feature` lê o legado, emite warning amarelo claro citando path antigo + path novo + sugestão de `git mv`, e prossegue.
- [ ] Em projeto com `SPEC.md` na raiz E `.ksdd/specs/SPEC.md` com conteúdos diferentes, comando aborta com erro bloqueante pedindo resolução manual.
- [ ] Em projeto com `SPEC.md` na raiz E `.ksdd/specs/SPEC.md` idênticos, comando usa o novo e emite warning sugerindo remover o legado.
- [ ] `/ksdd:setup` em projeto sem artefatos KSDD gera tudo em `.ksdd/` direto.
- [ ] `/ksdd:setup` em projeto com artefatos KSDD legados pergunta explicitamente o que fazer (manter, mover, abortar).
- [ ] Todos os 8 arquivos em `commands/` mencionam `.ksdd/...` como path default e descrevem o fallback de leitura.
- [ ] Todos os 8 arquivos em `references/` (templates + approval-gates + codex-SKILL) usam `.ksdd/...` em exemplos.
- [ ] Os 3 agents (`critic`, `interviewer`, `setup-analyst`) atualizados pra referenciar novos paths quando aplicável.
- [ ] `README.md` documenta o novo layout em uma seção dedicada + nota de migração para v0.6.0.
- [ ] `INSTALL.md` atualizado com exemplos de paths.
- [ ] `CHANGELOG.md` tem entrada `## [0.6.0]` descrevendo: (a) novo layout `.ksdd/`, (b) compat retroativa de leitura, (c) sugestão de migração manual, (d) lista de breaking changes não-imediatos planejados para 1.0.
- [ ] Próprio repo KSDD migrado: `brainstorm.md`, `SPEC.md`, `architecture.md` movidos via `git mv` para `.ksdd/specs/`; raiz limpa.
- [ ] `package.json` bumped para `0.6.0`.
- [ ] Após `npm install -g @kognar/ksdd@0.6.0`, projeto pré-existente continua funcionando sem mudança.
- [ ] Grep no repo por `^[^.]*FEATURE-\|^SPEC\.md\|^brainstorm\.md\|^architecture\.md\|^DESIGN\.md\|^BUILD-PLAN\.md` (paths legados) só retorna match em: CHANGELOG, comentários explícitos de compat, ou texto de warning de deprecação.

---

## 11. Fases de Implementação

### Fase 1 — Layout e compat (essencial)

- [ ] Atualizar 8 commands para escrever em `.ksdd/` e ler com fallback do legado.
- [ ] Atualizar templates em `references/` com novos paths nos exemplos.
- [ ] Atualizar agents (`critic`, `interviewer`, `setup-analyst`) com novos paths.
- [ ] Atualizar README + INSTALL + CHANGELOG.
- [ ] Bump de versão para 0.6.0.

### Fase 2 — Dogfooding e validação

- [ ] Migrar artefatos do próprio repo KSDD via `git mv` para `.ksdd/specs/`.
- [ ] Atualizar refs internas do próprio SPEC/architecture (seções de "modelo de dados") para refletir o novo padrão.
- [ ] QA manual: rodar fluxo completo em projeto vazio (`/ksdd:start → spec → tech → design → new:feature → build:feature`) confirmando todos os critérios de aceite.

---

**Referências:**
- SPEC.md — seções 1.2 (solução), 4.2 (modelo de dados / artefatos), 7 (superfícies), 11 (comportamentos), 14 (fases de entrega)
- architecture.md — seções 1 (visão geral), 4 (CLI surface), 10 (ADRs), 12 (roadmap)
- brainstorm.md — seções 2 (problema), 3 (solução), 7 (escopo MVP), 9 (restrições)
