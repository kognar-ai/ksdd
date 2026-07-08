---
id: 044
title: Criar commands/new:fix.md (investigação code-aware, FIX doc, tasks, fix inline opcional)
status: em revisão
feature: new-fix-command
area: backend
priority: P0
estimate: L
depends_on: []
feature_refs:
  - ".ksdd/features/FEATURE-new-fix-command.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-new-fix-command.md#4-fluxos-de-uso"
  - ".ksdd/features/FEATURE-new-fix-command.md#83-mensagens-canônicas-texto"
spec_refs:
  - ".ksdd/specs/SPEC.md#72-slash-commands-claude-code"
  - ".ksdd/specs/SPEC.md#8-componentes-globais-reutilizáveis"
arch_refs:
  - ".ksdd/specs/architecture.md#1-visão-geral-da-arquitetura"
  - ".ksdd/specs/architecture.md#3-modelo-de-dados-schemas"
---

# 044 — Criar `commands/new:fix.md`

## Objetivo
Criar o novo slash command `/ksdd:new:fix` em `commands/new:fix.md`, escrito como prompt Markdown para Claude/Codex/opencode/Antigravity, que investiga um bug apontado (code-aware), gera `.ksdd/fixes/FIX-[slug].md`, quebra em tasks em `.ksdd/tasks/fix-[slug]/`, e oferece fix inline opcional para bugs pequenos. É o núcleo da feature.

## Escopo
- Criar `commands/new:fix.md` seguindo o padrão dos commands existentes (`commands/new:feature.md`, `commands/build:feature.md`): frontmatter (`description`, `argument-hint`, `allowed-tools` incluindo `Read`, `Grep`, `Glob`, `view`, `create_file`, `str_replace`, `ask_user_input_v0`, `Bash`, `web_search`), bloco "Idioma (obrigatório)" referenciando `references/language-policy.md`, paths com fallback, fluxo, princípios, anti-patterns.
- **Coleta de bug** flexível (FEATURE 4.1/4.4): descrição livre, mensagem/stack trace, teste que reproduz, issue do GitHub (`#N`/URL, leitura best-effort via `gh`), referência a artefato KSDD.
- **Investigação code-aware** (diferencial vs `new:feature`): instruir o agente a reproduzir o bug, localizar root cause com `Grep`/`Read` e citar evidência `arquivo:linha`, mapear componentes afetados e blast radius.
- **Derivação de slug** kebab-case + checagem de colisão com `.ksdd/fixes/FIX-*.md` e slugs arquivados em `.ksdd/archive/raw/`.
- **Geração de `.ksdd/fixes/FIX-[slug].md`** a partir de `references/fix-template.md` (`mkdir -p .ksdd/fixes/` antes do `create_file`).
- **Checkpoint 1 (FIX doc)** obrigatório antes de quebrar em tasks; **Checkpoint 2 (tasks)** antes de qualquer implementação (Gate 8 — task 050).
- **Quebra em tasks** em `.ksdd/tasks/fix-[slug]/NNN-*.md` + `README.md`, com frontmatter usando `fix: [slug]` e `fix_refs`; numeração no espaço global de IDs (varre `.ksdd/tasks/feature-*/`, `.ksdd/tasks/fix-*/`, `docs/tasks/*`, `.ksdd/archive/raw/*/tasks/` — maior ID + 1). Sempre incluir uma task/critério de **teste de regressão**.
- **Fix inline opcional** (FEATURE 4.2): opt-in explícito no Checkpoint 2, só para bug pequeno (heurística: 1 arquivo, sem schema/API/auth/PII); cria branch, aplica patch, escreve teste de regressão, roda verificação local, mostra diff — sem commit/merge automático; recusa e recomenda `/ksdd:build:fix` se cresce.
- **Bug não reproduzível** (FEATURE 4.5): gerar FIX em modo "investigação incompleta" e parar pedindo dados faltantes — nunca propor ajuste sobre diagnóstico chutado.
- **`--tasks-only`**: pula a geração do FIX doc (usa `.ksdd/fixes/FIX-[slug].md` existente) e gera só as tasks.
- Mensagens canônicas (FEATURE 8.3) com cores ANSI conforme SPEC seção 3.2.

## Fora de escopo
- `commands/build:fix.md` (task 046).
- Template `references/fix-template.md` (task 045).
- Wiring em `bin/ksdd.js` (task 047).
- Atualizações em `new:feature`/`build:feature`/`build:all` (tasks 048, 049).
- Gates, SPEC, architecture, docs, bump (tasks 050, 051, 052).
- Arquivamento de fixes, `--all`/triagem em lote, auto-link à feature que introduziu o bug (FEATURE seção 2.2).

## Critérios de aceitação
- [ ] `commands/new:fix.md` existe com frontmatter padronizado e `allowed-tools` incluindo ferramentas de leitura de código (`Read`, `Grep`, `Glob`).
- [ ] Command coleta o bug de descrição/erro/teste/issue/artefato e faz no máx 1 rodada de perguntas quando `$ARGUMENTS` é vago.
- [ ] Command instrui investigação code-aware com reprodução + evidência `arquivo:linha` + blast radius.
- [ ] Command cria `.ksdd/fixes/` (`mkdir -p`) e gera `FIX-[slug].md` a partir de `references/fix-template.md`.
- [ ] Checkpoint 1 (FIX doc) e Checkpoint 2 (tasks) são explícitos e bloqueiam avanço sem aprovação.
- [ ] Numeração de task varre os 4 paths (feature-*, fix-*, docs/tasks, archive) e usa maior ID + 1.
- [ ] Tasks geradas têm `fix: [slug]` no frontmatter e sempre incluem teste de regressão.
- [ ] Fix inline só é oferecido para bug pequeno, aplica patch + teste em branch sem commit/merge, e recusa+recomenda `build:fix` se cresce.
- [ ] Bug não reproduzível → FIX "investigação incompleta" + parada pedindo dados; sem ajuste sobre diagnóstico incerto.
- [ ] `--tasks-only` gera só as tasks a partir de FIX doc existente.
- [ ] Detecção de colisão de slug com `.ksdd/fixes/` e `.ksdd/archive/raw/`.
- [ ] Anti-patterns documentados (não chutar root cause, não inline em bug grande, não confundir bug com feature).

## Notas técnicas
- Commands são prompts Markdown lidos pelo agente — "implementação" = redação clara dos passos.
- Reusar tom, formato de checkpoint e blocos de idioma de `commands/new:feature.md` e `commands/build:feature.md`.
- O basename para Codex/opencode/Antigravity vira `ksdd-new-fix.md` via `agentPromptBasename()` (`:` → `-`) — nada a fazer no command, só ciente disso.
- Agentes auxiliares reusados: `interviewer` (coleta), `consolidator` (redação), `critic` (validação do FIX doc) — SPEC seção 8.
- Diferença central vs `new:feature`: `new:fix` **lê o codebase**; garantir que o prompt orienta busca por evidência, não só descrição de produto.

## Riscos / dependências externas
- Tom precisa ser inequívoco para o agente não pular a reprodução — cobrir no QA (task 054).
- Depende conceitualmente do template (045) e será validado pelo dogfood (053); mas o arquivo do command pode ser escrito sem eles (referencia por path).
- Heurística de "bug pequeno" para inline precisa ser objetiva o suficiente para o agente aplicar com consistência.
