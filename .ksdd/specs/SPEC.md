# SPEC.md — KSDD (Kognar Spec-Driven Design & Development)

> Slash commands para Claude Code e Codex que estruturam o fluxo brainstorm → spec → arquitetura → design system com checkpoints humanos entre cada fase.

**Versão:** 1.1 (reverse-engineered)
**Última atualização:** 26/05/2026
**Plataforma alvo (MVP):** CLI multiplataforma (Node.js ≥ 16) — sem UI
**Idioma da interface:** N/A (CLI sem UI); artefatos e prompts seguem idioma da conversa — ver `references/language-policy.md`
**Origem:** Reverse-engineered via `/ksdd:setup` em 14/05/2026
**Aviso:** Artefato gerado automaticamente. Revise e corrija antes de usar como contrato.

---

## 1. Visão do Produto

### 1.1 Problema

Trabalhar com agentes de IA (Claude Code, OpenAI Codex) em projetos de produto sem disciplina spec-driven leva a três falhas recorrentes:

1. **Cascateamento de ambiguidade** — brainstorm vago gera SPEC confuso gera design adivinhado gera código que não resolve o problema original. O custo de refazer cresce exponencialmente por fase (5 min para brainstorm, semanas para architecture já implementada).
2. **Ausência de checkpoints reais** — agentes correm direto pra implementação sem validação humana das fundações.
3. **Falta de formato canônico entre ferramentas** — cada agente consome especificações diferentes; sem padrão, não há reuso de contexto entre Claude, Cursor, v0, Lovable, Stitch, Pencil.

### 1.2 Solução

Pacote npm distribuído como `@kognar/ksdd` que:

- Instala 8 slash commands em `~/.claude/commands/` (Claude Code) e/ou `~/.codex/prompts/` (Codex)
- Cada comando lê o artefato anterior, faz **uma rodada de perguntas em batch** (máx 8), gera o artefato no formato canônico e **para no checkpoint de aprovação**
- Os artefatos são acumulativos e versionáveis no repo (Markdown puro)
- O artefato final (`DESIGN.md`) segue o formato Google Stitch — interoperável com v0, Lovable, Pencil, Cursor

### 1.3 Público-Alvo

Três perfis confirmados pelo mantenedor: product designers/PMs solo, fundadores/equipes pequenas (1-5 pessoas), e devs/agências usando Claude Code + Codex. Comum aos três: querem rastreabilidade spec → implementação e disciplina de checkpoints, sem adicionar SaaS na stack.

### 1.4 Referência Principal

**Google Stitch (`design.md` spec)** — formato adotado integralmente para o artefato final `DESIGN.md`. KSDD constrói os 3 estágios anteriores (brainstorm, SPEC, architecture) como pré-condições para gerar um Stitch válido.

---

## 2. Personas

### 2.1 Marina — Product Designer / PM solo

- 31 anos, designer de produto trabalhando em fundação de startup (1ª contratação ou cofundadora não-técnica)
- Hoje usa Claude Code direto para esboçar telas e fluxos, mas perde contexto entre sessões — cada conversa começa do zero
- **Frustração principal:** não consegue manter um "documento mestre" do produto que evolui com decisões; cada rodada de chat é uma ilha
- **O que espera:** artefatos versionáveis no repo do projeto que ela leve para qualquer ferramenta de design (Figma, Stitch) com contexto preservado
- **Uso:** sessões longas no início do projeto, depois consultas curtas para iterar features. Desktop principalmente.

### 2.2 Rafa — Founder técnico solo (full-stack)

- 38 anos, founder de SaaS B2B, programa há 15 anos mas tem aversão a "ficar escrevendo spec quando podia tar codando"
- Conhece o valor de spec mas não tem disciplina sem ferramenta — abandona docs após 2 semanas
- **Frustração principal:** quando precisa contratar primeiro dev ou agência, descobre que não tem documento que explique o produto além do código
- **O que espera:** fluxo que force checkpoints sem ser burocrático; artefatos que substituam onboarding de novo dev
- **Uso:** rodadas rápidas (1-2h) quando vai começar uma feature nova ou contratar alguém. Mix desktop/terminal.

### 2.3 Lia — Líder técnica em agência (Claude Code + Codex)

- 29 anos, tech lead em agência boutique que entrega produtos para clientes externos
- Usa Claude Code para projetos pessoais, Codex para alguns clientes corporativos. Quer padronizar.
- **Frustração principal:** entrega para cliente sem artefato de spec que o cliente possa manter depois; cliente fica refém da agência
- **O que espera:** fluxo padrão que ela aplica em todos os projetos, e ao final entrega 4 arquivos Markdown + código + PRs ao cliente
- **Uso:** intensivo durante o setup (semana 1 de cada projeto), reativo durante a build (`/ksdd:build:feature` por demanda)

---

## 3. Identidade Visual e Direção de Design

**Nota:** KSDD é uma ferramenta CLI sem interface gráfica. Esta seção descreve apenas o tom da saída CLI e da documentação Markdown.

### 3.1 Personalidade da Marca

Direto, técnico, opinativo. Comunica respeito ao tempo do usuário (perguntas em batch, não uma por uma) e ao próprio processo (recusa atalhos sem aprovação). Sem floreio, sem exclamações desnecessárias.

### 3.2 Paleta de Cores (direção)

CLI usa cores ANSI para semântica funcional:

- Verde (`\x1b[32m`) — sucesso, ação concluída
- Amarelo (`\x1b[33m`) — aviso, estado pendente
- Vermelho (`\x1b[31m`) — erro
- Dim (`\x1b[2m`) — paths, metadados secundários
- Bold (`\x1b[1m`) — comandos invocáveis, nomes próprios (KSDD)

Respeita `NO_COLOR` (env) e `isTTY` para fallback monocromático.

### 3.3 Tipografia (direção)

Não aplicável — saída terminal usa fonte do terminal do usuário.

### 3.4 Iconografia

Mínima e monocromática no CLI: `✓` para sucesso, sem emojis nem ASCII art. Documentação Markdown evita emojis (convenção do projeto, alinhada com `references/`).

### 3.5 Tom Geral

Documentação do pacote (README, INSTALL, commands no repo): português técnico ou inglês, voz ativa. **Artefatos gerados pelos commands** seguem `references/language-policy.md` (idioma da conversa, não fixo em pt-BR). Sem jargão de marketing.

---

## 4. Modelo de Dados

KSDD é "stateless" no sentido de runtime — não há banco de dados. As entidades abaixo são **artefatos em disco** (Markdown e JSON).

### 4.1 Manifest de instalação (`.ksdd-manifest.json`)

Persistido em `~/.claude/skills/ksdd/.ksdd-manifest.json`.

```json
{
  "version": "0.9.0",
  "installedAt": "ISO-8601 timestamp",
  "pkgRoot": "/path/absoluto/do/pacote/npm",
  "targets": {
    "claude": ["array de paths instalados em ~/.claude/"],
    "codex": ["array de paths instalados em ~/.codex/ e ~/.agents/"],
    "opencode": ["array de paths instalados em ~/.config/opencode/"],
    "antigravity": ["array de paths instalados em ~/.gemini/"],
    "copilot": ["array de paths instalados no perfil VS Code + .github/ + ~/.copilot/"]
  }
}
```

### 4.2 Artefatos KSDD (gerados pelos commands no diretório do projeto-alvo)

A partir da v0.6.0, todos os artefatos vivem em `.ksdd/`. Projetos legados (pré-0.6.0) podem manter o layout antigo (raiz + `docs/`) — commands fazem fallback de leitura.

| Artefato | Path default (v0.6.0+) | Path legado (pré-0.6.0) | Gerado por | Tamanho típico |
|----------|------------------------|--------------------------|------------|----------------|
| `brainstorm.md` | `.ksdd/specs/brainstorm.md` | raiz `brainstorm.md` | `/ksdd:start` | 500-1500 palavras |
| `SPEC.md` | `.ksdd/specs/SPEC.md` | raiz `SPEC.md` | `/ksdd:spec` | 3000-8000 palavras |
| `architecture.md` | `.ksdd/specs/architecture.md` | raiz `architecture.md` | `/ksdd:tech` | 2000-5000 palavras |
| `DESIGN.md` | `.ksdd/specs/DESIGN.md` | raiz `DESIGN.md` | `/ksdd:design` | YAML + 1500-3500 palavras |
| `FEATURE-[slug].md` | `.ksdd/features/FEATURE-[slug].md` | `docs/FEATURE-[slug].md` (ou raiz mais legado) | `/ksdd:new:feature` | 1500-4000 palavras (1 por feature) |
| `BUILD-PLAN.md` | `.ksdd/build/BUILD-PLAN.md` | raiz `BUILD-PLAN.md` | `/ksdd:build:all` | mapa de execução completo |
| tasks `NNN-*.md` | `.ksdd/tasks/feature-[slug]/` | `docs/tasks/feature-[slug]/` | `/ksdd:new:feature` | task individual com frontmatter |
| context `NNN-context.md` | `.ksdd/tasks/feature-[slug]/.context/` | `docs/tasks/feature-[slug]/.context/` | `/ksdd:build:feature` | contexto compilado de implementação |

Cada artefato tem campo `Status:` (Rascunho / Aprovado) que é o sinal explícito de checkpoint cumprido.

### 4.3 Templates canônicos (`references/`)

Distribuídos com o pacote, copiados para `~/.claude/skills/ksdd/references/` ou `~/.agents/skills/ksdd/references/`. Imutáveis no escopo do consumidor — alteração feita upstream no repo do KSDD.

### 4.4 Relações

```
brainstorm.md  ──referenciado por──▶  SPEC.md
                                       │
                                       ├─referenciado por──▶  architecture.md (opcional)
                                       │
                                       └─referenciado por──▶  DESIGN.md (Google Stitch)
                                                                  │
                                                                  └─ todos consumidos por ──▶  docs/FEATURE-[slug].md
                                                                                                  │
                                                                                                  └─ consumido por ──▶  build:feature / build:all → docs/tasks/
```

---

## 5. Fontes de Dados

- **Entrada do usuário** via chat com o agente (Claude Code ou Codex) — perguntas estruturadas com `ask_user_input_v0` (Claude) ou equivalente Codex
- **Artefatos anteriores** lidos do filesystem do projeto-alvo (`view brainstorm.md`, etc.)
- **Templates canônicos** lidos de `references/` no skill instalado
- **`web_search` / `web_fetch`** (opcional) para validar referências citadas pelo usuário (ex: PriceCharting, Notion) antes de gerar brainstorm/spec
- **Git history + filesystem do projeto-alvo** — usado exclusivamente pelo `/ksdd:setup` para reverse-engineering

---

## 6. Perfis de Usuário e Permissões

Não há sistema de roles — KSDD é executado localmente pelo usuário com permissões do shell. Tabela conceitual:

| Perfil | Pode | Não pode |
|--------|------|----------|
| Usuário do CLI | `ksdd install` / `uninstall` / `status` em `~/.claude/`, `~/.codex/`, `~/.agents/`; invocar slash commands nos agentes | Modificar templates canônicos sem editar o pacote npm; bypassar approval gates (commands param obrigatoriamente) |
| Mantenedor do pacote | Atualizar templates em `references/`, commands em `commands/`, agentes em `agents/`; publicar versão no npm | — |
| Contribuidor externo (via PR) | Propor mudanças por fork + PR conforme `CONTRIBUTING.md` | Push direto na main (assumido — `[verificar]`) |

---

## 7. Estrutura de Páginas e Telas

**Não aplicável — KSDD não tem UI.** Substituído por "Superfícies de Interação":

### 7.1 CLI (`bin/ksdd.js`)

Comandos disponíveis (visíveis em `ksdd help`):

| Comando | O que faz |
|---------|-----------|
| `ksdd install` | Instala apenas Claude Code (`~/.claude/commands/` + `~/.claude/skills/ksdd/`) |
| `ksdd install --codex` | Instala Claude Code + Codex (prompts em `~/.codex/prompts/` + skill em `~/.agents/skills/ksdd/`) |
| `ksdd install --opencode` | Instala Claude Code + opencode (commands em `~/.config/opencode/commands/` + bundle em `~/.config/opencode/ksdd/`) |
| `ksdd install --codex --opencode` | Instala os 3 targets (Claude, Codex, opencode) numa só invocação |
| `ksdd install --antigravity` | Instala Claude Code + Google Antigravity (skills em `~/.gemini/antigravity-cli/skills/` e `~/.gemini/antigravity/skills/` + bundle em `~/.gemini/ksdd/`) |
| `ksdd install --codex --opencode --antigravity` | Instala os 4 targets (Claude, Codex, opencode, Antigravity) numa só invocação |
| `ksdd install --copilot` | Instala Claude Code + GitHub Copilot (prompt files no perfil do VS Code + chat mode + bundle + placeholder CLI) |
| `ksdd install --copilot --project` | Instala prompt files em `.github/prompts/` do repo atual (versionável no projeto) |
| `ksdd install --codex --opencode --antigravity --copilot` | Instala os 5 targets numa só invocação |
| `ksdd uninstall` | Remove tudo o que foi instalado, lendo o manifest |
| `ksdd status` | Mostra versão instalada, timestamp, contagem de arquivos por alvo |
| `ksdd help` (default) | Documentação de uso |

Flags: `--quiet` / `--silent` / `--postinstall` / `--codex` / `--opencode` / `--antigravity` / `--copilot` / `--project`. Env vars: `KSDD_SKIP_POSTINSTALL`, `KSDD_WITH_CODEX`, `KSDD_WITH_OPENCODE`, `KSDD_WITH_ANTIGRAVITY`, `KSDD_WITH_COPILOT`, `CODEX_HOME`, `OPENCODE_HOME`, `ANTIGRAVITY_HOME`, `COPILOT_HOME`, `NO_COLOR`.

### 7.2 Slash commands (Claude Code)

Após `ksdd install`, ficam em `~/.claude/commands/ksdd:[name].md`. Disponíveis:

`ksdd:start`, `ksdd:spec`, `ksdd:tech`, `ksdd:design`, `ksdd:new:feature`, `ksdd:build:feature`, `ksdd:build:all`, `ksdd:setup`.

### 7.3 Custom prompts (Codex)

Após `ksdd install --codex`, ficam em `~/.codex/prompts/ksdd-[name].md` (`:` é renomeado para `-`). Invocação `/prompts:ksdd-start`, `/prompts:ksdd-spec`, etc. Conteúdo é o mesmo dos arquivos em `commands/`.

### 7.4 Slash commands (opencode)

Após `ksdd install --opencode`, ficam em `~/.config/opencode/commands/ksdd-[name].md` (`:` é renomeado para `-`, mesma convenção do Codex). Invocação `/ksdd-start`, `/ksdd-spec`, `/ksdd-new-feature`, etc. Conteúdo é o mesmo dos arquivos em `commands/`.

Bundle adicional em `~/.config/opencode/ksdd/` contém `references/` (templates canônicos), `agents/` (helpers de estilo), `README.md`, `INSTALL.md` e `AGENTS.md` — este último orienta o agente opencode sobre o contexto canônico do KSDD (equivalente funcional ao skill do Claude/Codex, sem o conceito formal de "skill" do opencode).

### 7.5 Skills (Google Antigravity)

Após `ksdd install --antigravity`, os 9 commands ficam disponíveis como **skills Markdown** em duas superfícies globais (`:` é renomeado para `-`, mesma convenção de Codex/opencode):

- **CLI / TUI:** `~/.gemini/antigravity-cli/skills/ksdd-[name].md`
- **IDE:** `~/.gemini/antigravity/skills/ksdd-[name].md` _(path do IDE a confirmar — ver risco em FEATURE seção 9)_

Um arquivo `.md` em `skills/` vira `/ksdd-start`, `/ksdd-spec`, `/ksdd-new-feature`, etc. Conteúdo é o mesmo dos arquivos em `commands/`. Bundle compartilhado em `~/.gemini/ksdd/` contém `references/`, `agents/`, `README.md`, `INSTALL.md` e `AGENTS.md` (derivado de `references/antigravity-AGENTS.md`) — orienta o agente Antigravity sobre o contexto canônico. `ANTIGRAVITY_HOME` faz override de `~/.gemini`.

### 7.6 Skill instalada (`~/.claude/skills/ksdd/`, `~/.agents/skills/ksdd/` e bundle `~/.config/opencode/ksdd/`)

Bundle com `references/` (templates), `agents/` (helpers de estilo), `README.md`, `INSTALL.md`, e (Codex apenas) `SKILL.md` derivado de `references/codex-SKILL.md`.

Em opencode, o bundle em `~/.config/opencode/ksdd/` é o equivalente funcional do skill — contém os mesmos `references/` e `agents/`, mais um `AGENTS.md` (derivado de `references/opencode-AGENTS.md`) que substitui o papel do `SKILL.md`. Convenção opencode não usa o termo "skill", mas o propósito é idêntico: dar ao agente o contexto canônico para invocar os commands corretamente.

Em Antigravity e Copilot, os bundles equivalentes vivem em `~/.gemini/ksdd/` e `<vscode-user>/ksdd/` respectivamente (mesma estrutura `references/` + `agents/` + `AGENTS.md`).

### 7.7 Prompt files (GitHub Copilot)

Após `ksdd install --copilot`, os 9 commands ficam como **prompt files** `ksdd-[name].prompt.md` no diretório de perfil do usuário do VS Code (`:` é renomeado para `-`, mesma convenção de Codex/opencode/Antigravity; o sufixo `.prompt.md` é exigido pelo Copilot). O path é **OS-específico**: `~/Library/Application Support/Code/User/prompts/` no macOS, `~/.config/Code/User/prompts/` no Linux, `%APPDATA%\Code\User\prompts\` no Windows. `COPILOT_HOME` faz override do diretório `Code/User` (cobre VS Code Insiders, instalações portáteis e paths não-padrão).

Um arquivo `.prompt.md` vira `/ksdd-start`, `/ksdd-spec`, `/ksdd-new-feature`, etc., invocáveis no Copilot Chat do VS Code. Conteúdo é o mesmo dos arquivos em `commands/`. Uma **chat mode** `ksdd.chatmode.md` (contexto canônico, derivada de `references/copilot-AGENTS.md`) acompanha no mesmo diretório de perfil.

O modo `--project` (só válido junto de `--copilot`) grava em `.github/prompts/` e `.github/chatmodes/` do repo-alvo (diretório de trabalho atual) em vez do perfil global — habilita o modelo project-scoped nativo do Copilot, versionável no projeto.

Um placeholder é instalado no Copilot CLI (`~/.copilot/prompts/ksdd-*.prompt.md`) — o CLI ainda **não** consome comandos custom ([copilot-cli#618](https://github.com/github/copilot-cli/issues/618), [#1113](https://github.com/github/copilot-cli/issues/1113)), mas a superfície fica pronta para quando o suporte upstream existir.

Bundle compartilhado em `<vscode-user>/ksdd/` contém `references/`, `agents/`, `README.md`, `INSTALL.md` e `AGENTS.md` (derivado de `references/copilot-AGENTS.md`) — orienta o agente Copilot sobre o contexto canônico. A novidade técnica vs os outros targets é a **resolução de path por SO** (`resolveVscodeUserDir()`), que não existia nos diretórios globais fixos de Codex/opencode/Antigravity.

---

## 8. Componentes Globais Reutilizáveis

Equivalentes lógicos no CLI / commands:

| "Componente" | Onde aparece | Variantes |
|--------------|--------------|-----------|
| Helper de cor ANSI (`green`, `yellow`, `red`, `dim`, `bold`) | `bin/ksdd.js` saídas | TTY com cor, fallback monocromático (NO_COLOR ou não-TTY) |
| Manifest writer/reader | install, uninstall, status | Formato atual com `targets.claude`/`targets.codex`/`targets.opencode`; normaliza manifest legado (`files` array) e preenche `targets.opencode` vazio quando ausente |
| Copy de árvore (`copyDir`) | install Claude e install Codex | Recursivo, preserva estrutura, atualiza `tracked[]` |
| Approval gate prompt | Final de cada slash command | 7 gates documentados em `references/approval-gates.md` |
| Pergunta em batch (`ask_user_input_v0`) | Todos os commands de geração | Máximo 3 questions structured + texto livre |
| Agente `interviewer` | `start`, `spec`, `new:feature` | Faz perguntas estruturadas em batch |
| Agente `consolidator` | Todos os commands de geração | Sintetiza respostas em artefato canônico |
| Agente `critic` | Antes da entrega de qualquer artefato | Checklist de qualidade por tipo de artefato |
| Agente `setup-analyst` | `/ksdd:setup` apenas | 4 variantes: produto, stack, código, git |

---

## 9. Touchpoints Críticos

- **Onde o usuário descobre o produto:** README do GitHub + página npm `@kognar/ksdd`. CTAs principais: `npm install -g @kognar/ksdd` e `ksdd install --codex`.
- **Onde o usuário invoca pela primeira vez:** `/ksdd:start` no Claude Code (ou `/prompts:ksdd-start` no Codex) — primeira impressão da rodada de perguntas.
- **Onde o checkpoint mais importante acontece:** após `/ksdd:spec` (Gate 2) — é o documento mais longo e mais consequente; aprovação ruim aqui contamina design e build.
- **Onde o usuário se compromete com escopo:** `/ksdd:build:all` Checkpoint 1 (plano mestre) — após aprovar, toda a fila de features fica plotada.

---

## 10. Responsividade

Não aplicável (CLI). Considerações equivalentes:

| Ambiente | Comportamento |
|----------|---------------|
| Terminal TTY com cor | Saída colorida (ANSI), bold em destaques |
| Terminal sem TTY (CI, pipe) | Saída plain (sem códigos ANSI) — respeita `NO_COLOR` |
| Editor com terminal embutido (VS Code, JetBrains) | Funciona normalmente; cores ANSI suportadas pela maioria |
| Windows PowerShell / cmd | `[verificar]` — Node ≥16 suporta ANSI em Windows 10+ mas precisa de teste explícito |

---

## 11. Interações e Comportamentos

- **Sem barra de progresso animada** — saída linha-a-linha conforme cada arquivo é copiado durante install
- **Sem prompts interativos no CLI `ksdd.js`** — todas as escolhas via flags + env vars. Interatividade acontece nos slash commands (via o agente)
- **Falha silenciosa do postinstall** — `KSDD_SKIP_POSTINSTALL=1` ou erro durante npm install emite warning, não trava o `npm install`. Usuário pode rodar `ksdd install` manualmente depois.
- **Idempotência do install** — re-rodar `ksdd install` lê o manifest anterior, remove arquivos rastreados, e reinstala. Sem duplicação.
- **`install` sem `--codex` preserva instalação Codex anterior** — não deleta `~/.codex/prompts/ksdd-*` nem `~/.agents/skills/ksdd/` se existirem. Só atualiza Claude.
- **`install` sem `--opencode` preserva instalação opencode anterior** — não deleta `~/.config/opencode/commands/ksdd-*` nem `~/.config/opencode/ksdd/` se existirem. Só atualiza Claude (ou Claude+Codex se `--codex`).
- **`install` sem `--copilot` preserva instalação Copilot anterior** — não deleta prompt files KSDD já instalados no perfil do VS Code. Espelha Codex/opencode/Antigravity.
- **`--project` grava em `.github/` do repo só com flag explícita** — o modo project-scoped (`.github/prompts/` + `.github/chatmodes/`) do diretório de trabalho atual só é ativado com `--copilot --project`; o default nunca escreve fora de `~/`.
- **`uninstall` sem manifest** — modo fallback: tenta remover paths conhecidos por convenção. Mensagem amarela avisando.
- **Approval gates obrigatórios** — slash commands param após gerar artefato; nunca encadeiam automaticamente. Mesmo se usuário disser "pula", o comando pede confirmação explícita (`references/approval-gates.md`).

---

## 12. Modelo de Negócio (Impacto na Interface)

**Modelo:** open source gratuito sob AGPL-3.0. Confirmado com mantenedor.

Implicações práticas:

- Sem paywall, sem feature gating, sem telemetria
- Sem CTA de upgrade em lugar nenhum
- README documenta limitações de uso (AGPL) na seção "Licença e contribuição"
- CONTRIBUTING.md exige que contribuições sejam relicenciadas como AGPL-3.0 também (copyleft forte)

---

## 13. Fluxos Críticos (User Journeys)

### 13.1 Onboarding em projeto novo (do zero)

1. Usuário roda `npm install -g @kognar/ksdd` (ou com `KSDD_WITH_CODEX=1` para Claude + Codex, `KSDD_WITH_OPENCODE=1` para Claude + opencode, `KSDD_WITH_ANTIGRAVITY=1` para Claude + Google Antigravity, `KSDD_WITH_COPILOT=1` para Claude + GitHub Copilot)
2. Postinstall copia commands e skills para `~/.claude/` (e `~/.codex/` / `~/.config/opencode/` / `~/.gemini/` / perfil VS Code se opt-in)
3. Reinicia o agente (Claude Code, Codex CLI/IDE, opencode, Antigravity ou VS Code Copilot)
4. No diretório do projeto, invoca `/ksdd:start` (Claude), `/prompts:ksdd-start` (Codex), `/ksdd-start` (opencode, Antigravity ou Copilot Chat) com ideia bruta
5. Agente faz 5-8 perguntas em batch → gera `brainstorm.md` → para em Gate 1
6. Usuário aprova → invoca `/ksdd:spec` → gera `SPEC.md` → Gate 2
7. Opcional: `/ksdd:tech` → `architecture.md` → Gate 3
8. `/ksdd:design` → `DESIGN.md` (Google Stitch) → Gate 4 (fim do setup)

### 13.2 Onboarding em projeto existente (reverse-engineering)

1. Usuário com projeto já em desenvolvimento roda `/ksdd:setup` no diretório
2. Fase 0: pre-flight verifica artefatos KSDD existentes (não sobrescreve aprovados) + confirma que é projeto não-vazio
3. Fase 1: discovery em paralelo (estrutura, git history, manifests)
4. Fase 2 (se `--depth deep`): 4 agentes `setup-analyst` em paralelo (produto, stack, código, git)
5. Fase 3: síntese + rodada de perguntas focada em gaps (máx 6)
6. Fase 4: geração de `brainstorm.md` + `SPEC.md` + `architecture.md` (+ `DESIGN.md` se frontend detectado), todos com cabeçalho de "Reverse-engineered"
7. Fase 5: checkpoint final com instruções de revisão por prioridade

### 13.3 Implementação de feature isolada

1. Usuário com SPEC aprovado roda `/ksdd:new:feature [slug]`
2. Lê SPEC + architecture + DESIGN para análise de impacto
3. Gera `docs/FEATURE-[slug].md` → Gate 5a (checkpoint do spec da feature)
4. Aprovado → quebra em tasks em `docs/tasks/feature-[slug]/NNN-*.md` → Gate 5b (checkpoint das tasks)
5. Aprovado → `/ksdd:build:feature [slug]` com `--all` ou task por task
6. Para cada task: pre-flight → issue GitHub → branch → context.md → implementação via subagents → quality gates (build, testes, lint, E2E, code review, security audit) → commits atômicos → PR aberto (sem merge)

### 13.4 Build completo do projeto

1. `/ksdd:build:all` com SPEC.md aprovado
2. Decompõe fases de entrega do SPEC em features
3. Quebra cada feature em tasks
4. Gera `BUILD-PLAN.md` como mapa mestre → Gate 7 Checkpoint 1
5. Aprovado → executa feature por feature em ordem de dependência (Checkpoint 7.2 por feature)
6. Cada feature segue fluxo do 13.3 (`build:feature` interno)
7. Pós-fase: resumo consolidado, recomendação de teste manual
8. Final: validação agregada contra critérios do SPEC

### 13.5 Atualização da própria instalação

1. `npm install -g @kognar/ksdd@latest`
2. Postinstall detecta manifest anterior, remove arquivos rastreados, reinstala
3. `ksdd status` confirma nova versão

### 13.6 Adicionar opencode em instalação existente

1. Usuário com KSDD já instalado (Claude + opcionalmente Codex) roda `ksdd install --opencode` (sem `--codex`)
2. Instalador re-roda `installClaude()` (idempotente — remove arquivos rastreados via manifest e reinstala); não modifica nada do Codex
3. `installOpencode()` roda e popula `~/.config/opencode/commands/ksdd-*.md` + bundle em `~/.config/opencode/ksdd/`
4. Manifest passa a ter `targets.opencode` preenchido; `targets.codex` (se existia) é preservado intocado
5. `ksdd status` confirma os 3 targets ativos (Claude, Codex, opencode) com contagens individuais

### 13.7 Adicionar Google Antigravity em instalação existente

1. Usuário com KSDD já instalado (Claude + opcionalmente Codex/opencode) roda `ksdd install --antigravity` (sem outras flags)
2. Instalador re-roda `installClaude()` (idempotente); não modifica Codex nem opencode
3. `installAntigravity()` roda e popula `~/.gemini/antigravity-cli/skills/ksdd-*.md` + `~/.gemini/antigravity/skills/ksdd-*.md` + bundle em `~/.gemini/ksdd/`
4. Manifest passa a ter `targets.antigravity` preenchido; `targets.codex`/`targets.opencode` (se existiam) são preservados intocados
5. `ksdd status` confirma os 4 targets ativos (Claude, Codex, opencode, Antigravity) com contagens individuais

### 13.8 Adicionar GitHub Copilot em instalação existente

1. Usuário com KSDD já instalado (Claude + opcionalmente Codex/opencode/Antigravity) roda `ksdd install --copilot` (sem outras flags)
2. Instalador re-roda `installClaude()` (idempotente); não modifica Codex, opencode nem Antigravity
3. `installCopilot()` roda e popula `<vscode-user>/prompts/ksdd-*.prompt.md` + `ksdd.chatmode.md` + bundle em `<vscode-user>/ksdd/` (path resolvido por SO ou `COPILOT_HOME`)
4. Manifest passa a ter `targets.copilot` preenchido; `targets.codex`/`targets.opencode`/`targets.antigravity` (se existiam) são preservados intocados
5. `ksdd status` confirma os 5 targets ativos (Claude, Codex, opencode, Antigravity, Copilot) com contagens individuais

---

## 14. Fases de Entrega

### Fase 1 — Fundação (v0.1.0, 08/05/2025) — **Entregue**

- Commands: `start`, `spec`, `tech`, `design`
- Templates canônicos: brainstorm, SPEC, architecture, design-md-spec, personas-guide, approval-gates
- Agents: interviewer, consolidator, critic
- Instalador CLI `bin/ksdd.js` com install/uninstall/status
- README + INSTALL completo

### Fase 2 — Licenciamento + Features (v0.2.0, 13/05/2026) — **Entregue**

- Licença AGPL-3.0 + CONTRIBUTING.md
- Commands: `new:feature`, `build:feature`, `build:all`
- Templates: feature-template, build-plan-template
- Gates 5, 6, 7 documentados em approval-gates

### Fase 3 — Multi-CLI: Codex (v0.4.0, 13/05/2026) — **Entregue**

- Integração OpenAI Codex: `ksdd install --codex`
- Custom prompts em `~/.codex/prompts/`
- Skill `~/.agents/skills/ksdd/SKILL.md` com `codex-SKILL.md` como conteúdo
- Manifest com `targets.claude` / `targets.codex`
- Env vars: `KSDD_WITH_CODEX`, `CODEX_HOME`

### Fase 4 — Onboarding de projetos existentes (v0.5.0, 14/05/2026) — **Entregue**

- Command `/ksdd:setup` com reverse-engineering
- Agent `setup-analyst` em 4 variantes paralelas (produto, stack, código, git)
- Flags: `--artifacts`, `--depth`, `--skip-questions`

### Fase 5 — Mais agents (confirmado no roadmap) — **Em andamento (v0.10.0)**

- Suporte a opencode (entregue v0.8.0, 26/05/2026)
- Suporte a Google Antigravity (entregue v0.9.0, 01/06/2026) — 4º target, CLI/TUI + IDE
- Suporte a GitHub Copilot (entregue v0.10.0, 07/07/2026) — 5º target, prompt files VS Code + chat mode + project + CLI placeholder
- Suporte a Cursor (`~/.cursor/` `[verificar paths]`)
- Suporte a Windsurf
- Suporte a Cline
- Refatoração do instalador para `installTarget(targetConfig)` genérico — feature dedicada, obrigatória antes do 5º target (ver ADR-011 em `architecture.md`)

### Fase 6 — Integração com design tools (confirmado no roadmap) — **Próximo**

- Exportador para Figma (de `DESIGN.md` Google Stitch)
- Exportador/importador para Pencil
- Integração com Google Stitch (já compatível no formato, validar export bidirecional)

### Fase 7 — `[verificar]` — Não confirmado

- Lint/validador automático de SPEC.md (mantenedor não confirmou no roadmap)
- Versão 1.0.0 (critério não documentado)

---

## 15. Métricas de Sucesso

`[verificar]` — métricas não documentadas no projeto. Hipóteses iniciais a confirmar com mantenedor:

| Métrica | Meta sugerida (3-6 meses pós-1.0) |
|---------|-----------------------------------|
| Instalações npm (`@kognar/ksdd`) por mês | `[a definir]` |
| Stars no GitHub (`kognar-ai/ksdd`) | `[a definir]` |
| Issues abertas + resolvidas/mês | `[a definir]` |
| PRs externos aceitos (sinal de comunidade) | `[a definir]` |
| Número de projetos com `ksdd:setup` documentados publicamente | `[a definir]` |
| Cobertura de agents suportados | 5 hoje (Claude, Codex, opencode, Antigravity, Copilot) → +3 no roadmap (Cursor, Windsurf, Cline) |

---

**Próximos passos:**
- `/ksdd:tech` — `architecture.md` já gerado neste fluxo `/ksdd:setup`. Revisar.
- `/ksdd:design` — **não aplicável** (projeto sem UI gráfica).
- Após revisão de `brainstorm.md`, `SPEC.md` e `architecture.md`, mude `Status:` de cada um para `Aprovado` antes de usar como contrato.
