---
id: 011
title: Criar commands/archive.md com todos os modos (slug, lista, --all-eligible, --restore, --dry-run)
status: para implementar
feature: archive-features
area: backend
priority: P0
estimate: M
depends_on: []
feature_refs:
  - ".ksdd/features/FEATURE-archive-features.md#2-escopo"
  - ".ksdd/features/FEATURE-archive-features.md#4-fluxos-de-uso"
  - ".ksdd/features/FEATURE-archive-features.md#83-mensagens-canônicas-texto"
spec_refs:
  - ".ksdd/specs/SPEC.md#72-slash-commands-claude-code"
  - ".ksdd/specs/SPEC.md#8-componentes-globais-reutilizáveis"
arch_refs:
  - ".ksdd/specs/architecture.md#1-visão-geral-da-arquitetura"
---

# 011 — Criar `commands/archive.md` (todos os modos)

## Objetivo
Criar o novo slash command `/ksdd:archive` em `commands/archive.md`, escrito como prompt Markdown para Claude/Codex, cobrindo os 5 modos: slug individual, lista de slugs, `--all-eligible`, `--restore [slug]`, e `--dry-run` (combinável).

## Escopo
- Criar `commands/archive.md` seguindo o padrão dos commands existentes (`commands/new:feature.md`, `commands/build:feature.md`): frontmatter (`description`, `argument-hint`, `allowed-tools`), instrução de idioma, paths, fluxo, anti-patterns.
- Implementar as 6 seções de fluxo descritas em FEATURE seção 4 (4.1 individual, 4.2 lote, 4.3 --all-eligible, 4.4 dry-run, 4.5 restore, 4.6 não — esse é em outro command).
- Implementar critério de elegibilidade (FEATURE seção 2.1): todas as tasks com `status: concluída` ou `cancelada`; lista bloqueadoras se houver outras.
- Implementar layout em `.ksdd/archive/raw/[slug]/` (FEATURE seção 2.1 — diagrama).
- Implementar geração/append em `.ksdd/archive/ARCHIVE.md` com ordem cronológica decrescente e âncoras `## [slug] — YYYY-MM-DD`.
- Implementar `--restore` com validações: existência em `raw/`, ausência em `.ksdd/features/`, conflito → abort.
- Implementar `--dry-run` com banner azul/dim e zero side-effects.
- Validação de slug (`[a-z0-9-]+`) antes de qualquer operação.
- Mensagens canônicas (FEATURE seção 8.3) com cores ANSI conforme SPEC seção 3.2.
- Approval gate explícito antes de qualquer move/append.
- Warning amarelo ao detectar legado em `docs/tasks/feature-[slug]/`.

## Fora de escopo
- Atualizações em `commands/new:feature.md`, `commands/build:feature.md`, `commands/build:all.md` (tasks 014, 015, 016).
- Template canônico em `references/archive-template.md` (task 012).
- Atualizações em `bin/ksdd.js`, `README.md`, `CHANGELOG.md`, `package.json` (tasks 013, 017).
- Auto-archive, `--export`, compactação, filtros avançados (FEATURE seção 2.2).

## Critérios de aceitação
- [ ] `commands/archive.md` existe com frontmatter padronizado (description curta, argument-hint, allowed-tools incluindo `view`, `create_file`, `str_replace`, `ask_user_input_v0`, `Bash`).
- [ ] Command instrui criar `.ksdd/archive/` e `.ksdd/archive/raw/[slug]/` com `mkdir -p` antes do primeiro move.
- [ ] Command valida critério de elegibilidade lendo frontmatter de `.ksdd/tasks/feature-[slug]/NNN-*.md` (com fallback `docs/tasks/`).
- [ ] Lista bloqueadoras com formato `NNN (status atual)` quando elegibilidade falha.
- [ ] Move `FEATURE-[slug].md` → `.ksdd/archive/raw/[slug]/FEATURE-[slug].md` (via `git mv` se branch git ativa, senão `mv`).
- [ ] Move `.ksdd/tasks/feature-[slug]/*` → `.ksdd/archive/raw/[slug]/tasks/*`.
- [ ] Apenda seção no topo de `.ksdd/archive/ARCHIVE.md` usando template de `references/archive-template.md`.
- [ ] Header global do `ARCHIVE.md` é criado na primeira invocação (com explicação curta de para que serve a pasta).
- [ ] `--all-eligible` lista elegíveis vs não-elegíveis (com razão), pede confirmação, e arquiva todos os elegíveis em ordem alfabética.
- [ ] `--dry-run` (combinado com qualquer modo) imprime banner "[dry-run] Nenhuma alteração aplicada." e não escreve nada.
- [ ] `--restore [slug]` valida pré-condições, move arquivos de volta, remove seção do `ARCHIVE.md` (regex por âncora `## [slug] — `), remove diretório vazio em `raw/`.
- [ ] Conflito de restore (`.ksdd/features/FEATURE-[slug].md` já existe) aborta com mensagem clara.
- [ ] Re-archive de slug já em `raw/` aborta com mensagem clara.
- [ ] Slug com caractere inválido aborta com mensagem antes de qualquer operação.
- [ ] Approval gate obrigatório antes de qualquer move (sucesso só após confirmação humana explícita).
- [ ] Anti-patterns documentados (não auto-restaurar, não deletar permanentemente, não arquivar parcial sem aviso).

## Notas técnicas
- Commands são prompts Markdown lidos pelo agente — sem código executável. "Implementação" = redação clara de passos para o agente seguir.
- Use `view` para ler tasks (com offset/limit para frontmatter), `str_replace` para append em `ARCHIVE.md`.
- Para detecção de tasks pendentes, instrua o agente a ler frontmatter de cada `NNN-*.md` (status: ...).
- Ordem cronológica decrescente em `ARCHIVE.md`: usar `str_replace` para inserir após o header global, antes da primeira seção existente.
- Convenção de slug: já validada implicitamente pelo `commands/new:feature.md` (kebab-case). Reforçar regex no command de archive.
- Aproveite padrões de prompt já estabelecidos em `commands/new:feature.md` e `commands/build:feature.md` (tom, formato de checkpoint, blocos de "Idioma obrigatório").

## Riscos / dependências externas
- Tom do command precisa ficar inequívoco para o agente seguir corretamente — testar com QA (task 019).
- Append em `ARCHIVE.md` por `str_replace` pode falhar se o header global mudar entre invocações; documentar formato exato do header e usar âncora confiável.
- Regex de remoção de seção em `--restore` precisa ser específica para evitar remover header global. Documentar pattern exato.
