# Architecture — KSDD (Kognar Spec-Driven Design & Development)

**Versão:** 1.0 (reverse-engineered)
**Última atualização:** 26/05/2026
**Status:** Rascunho (gerado por reverse-engineering)
**Origem:** Reverse-engineered via `/ksdd:setup` em 14/05/2026
**Aviso:** Artefato gerado automaticamente. Revise e corrija antes de usar como contrato.

---

## 1. Visão Geral da Arquitetura

KSDD é um pacote npm que distribui **conteúdo Markdown** (commands, references, agents) para diretórios convencionais de agentes de IA, mais um **CLI Node.js sem dependências runtime** que gerencia o ciclo de vida da instalação.

```
                                       ┌──────────────────────────────┐
                                       │  Registry npm (público)      │
                                       │  @kognar/ksdd                │
                                       └────────────┬─────────────────┘
                                                    │ npm install -g
                                                    ▼
              ┌─────────────────────────────────────────────────────────────┐
              │  Pacote local (PKG_ROOT)                                    │
              │  ├── bin/ksdd.js          (CLI Node, sem deps)              │
              │  ├── commands/*.md         (11 slash commands)              │
              │  ├── references/*.md       (templates canônicos)            │
              │  ├── agents/*.md           (helpers: interviewer/critic/...) │
              │  ├── README.md / INSTALL.md / CHANGELOG.md / LICENSE        │
              │  └── package.json                                           │
              └───────────────────────────┬─────────────────────────────────┘
                                          │ ksdd install [--codex] [--opencode] [--antigravity] [--copilot]
                                          ▼
        ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
        │                                                                                                     │
        ▼                                              ▼                                                      ▼
   ┌──────────────────────────────────┐  ┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
   │  Claude Code (target: claude)    │  │  OpenAI Codex (target: codex)        │  │  opencode (target: opencode)         │
   │  ~/.claude/commands/ksdd:*.md    │  │  ~/.codex/prompts/ksdd-*.md          │  │  ~/.config/opencode/commands/        │
   │  ~/.claude/skills/ksdd/          │  │  ~/.agents/skills/ksdd/SKILL.md      │  │       ksdd-*.md                      │
   │    ├── references/               │  │  ~/.agents/skills/ksdd/references/   │  │  ~/.config/opencode/ksdd/            │
   │    ├── agents/                   │  │  ~/.agents/skills/ksdd/agents/       │  │    ├── references/                   │
   │    └── README.md INSTALL.md      │  │  ~/.agents/skills/ksdd/README.md     │  │    ├── agents/                       │
   │    .ksdd-manifest.json           │  │                                      │  │    ├── README.md INSTALL.md          │
   │                                  │  │                                      │  │    └── AGENTS.md                     │
   └──────────────────────────────────┘  └──────────────────────────────────────┘  └──────────────────────────────────────┘
                          │                                  │                                       │
                          └──────────────────────────────────┴───────────────────────────────────────┘
                                                             │
   ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
   │  Google Antigravity (target: antigravity) — quarto target, duas superfícies globais (--antigravity)│
   │    CLI/TUI : ~/.gemini/antigravity-cli/skills/ksdd-*.md                                            │
   │    IDE     : ~/.gemini/antigravity/skills/ksdd-*.md   [path IDE a confirmar — ver ADR-011 / risco] │
   │    bundle  : ~/.gemini/ksdd/{references/, agents/, README.md, INSTALL.md, AGENTS.md}  (compartilhado)│
   └──────────────────────────────────────────────────────────────────────────────────────────────────┘
   ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
   │  GitHub Copilot (target: copilot) — quinto target, path de perfil VS Code por SO (--copilot) — ADR-012│
   │    prompts : <vscode-user>/prompts/ksdd-*.prompt.md   (global, por SO via resolveVscodeUserDir)    │
   │    chatmode: <vscode-user>/prompts/ksdd.chatmode.md                                                │
   │    bundle  : <vscode-user>/ksdd/{references/, agents/, README.md, INSTALL.md, AGENTS.md}           │
   │    project : <cwd>/.github/prompts/ + chatmodes/     (opt-in --project)                            │
   │    CLI      : ~/.copilot/prompts/ksdd-*.prompt.md     (placeholder — copilot-cli#618/#1113)        │
   └──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                             ▼
                       ┌────────────────────────────────────┐
                       │  Diretório do projeto-alvo         │
                       │  .ksdd/specs/{brainstorm,SPEC,     │
                       │       architecture,DESIGN}.md      │
                       │  .ksdd/features/FEATURE-*.md       │
                       │  .ksdd/tasks/feature-*/            │
                       │  .ksdd/build/BUILD-PLAN.md         │
                       │  (legado: raiz/docs/, lido via     │
                       │   fallback com warning)            │
                       └────────────────────────────────────┘
```

**Decisão arquitetural central:** o produto é **conteúdo distribuído**, não runtime. A "lógica" vive nos commands Markdown lidos pelos agentes; o CLI Node existe apenas para orquestrar cópia de arquivos e gerenciar manifest.

---

## 2. Stack Tecnológica

### 2.1 Frontend

Não aplicável. KSDD não tem UI.

### 2.2 Backend / CLI

- **Linguagem/runtime:** Node.js ≥ 16 (declarado em `package.json` engines)
- **Module system:** CommonJS (`"type": "commonjs"` em package.json)
- **Dependências runtime:** **zero** — usa apenas built-ins (`fs`, `path`, `os`)
- **DevDependencies:** **zero** declaradas
- **Entry point:** `bin/ksdd.js` (shebang `#!/usr/bin/env node`)
- **Tamanho:** ~340 linhas

### 2.3 Dados

- **Persistência:** filesystem local. Sem banco de dados.
- **Manifest:** JSON em `~/.claude/skills/ksdd/.ksdd-manifest.json`
- **Formato dos artefatos:** Markdown puro (commands, templates, agents, artefatos gerados)
- **Caches:** nenhum
- **Vector DB / Search:** não aplicável

### 2.4 Infraestrutura

- **Distribuição:** npm registry público (`@kognar/ksdd`, `"access": "public"`)
- **CI/CD:** **`[verificar]`** — não há `.github/workflows/` no repo. Publicação no npm é manual via `npm publish` `[verificar]`
- **Hosting de docs:** README no GitHub + npm package page (`https://github.com/kognar-ai/ksdd#readme`)
- **Issue tracker:** GitHub Issues (`https://github.com/kognar-ai/ksdd/issues`)
- **Observability:** nenhuma — sem telemetria, sem analytics
- **CDN:** não aplicável (download via npm)

---

## 3. Modelo de Dados (Schemas)

### 3.1 Manifest de instalação (`.ksdd-manifest.json`)

Schema atual:

```json
{
  "version": "string (semver, ex: '0.8.0')",
  "installedAt": "string (ISO-8601 timestamp)",
  "pkgRoot": "string (path absoluto do pacote npm)",
  "targets": {
    "claude":      ["string (path absoluto de arquivo instalado)", ...],
    "codex":       ["string (path absoluto de arquivo instalado)", ...],
    "opencode":    ["string (path absoluto de arquivo instalado)", ...],
    "antigravity": ["string (path absoluto de arquivo instalado)", ...],
    "copilot":     ["string (path absoluto de arquivo instalado)", ...]
  }
}
```

**Schema legado normalizado** (`bin/ksdd.js:73-91`):

- Formato antigo: `{ ..., files: ["path", ...] }` → migrado em runtime para `{ targets: { claude: files, codex: [] } }`
- Formato sem `files` nem `targets`: criado como `{ targets: { claude: [], codex: [] } }`
- Manifest sem `targets.copilot` (pré-0.10.0): `normalizeManifest()` cria array vazio para `copilot` ao ler

### 3.2 Frontmatter de slash command (commands/*.md)

Padrão observado em `commands/start.md`, `commands/spec.md` (analisado), `commands/setup.md` (analisado):

```yaml
---
description: "string — descrição curta usada pelo agente para discovery"
argument-hint: "string — hint do argumento opcional"
allowed-tools: "lista de tools, ex: view, create_file, str_replace, ask_user_input_v0, web_search"
---
```

### 3.3 Frontmatter de task (docs/tasks/feature-[slug]/NNN-*.md)

Schema declarado em `references/build-plan-template.md` `[verificar conteúdo completo]`:

- `id` — slug único da task
- `status` — pendente / em-andamento / concluída
- `area` — frontend / backend / infra / etc.
- `priority` — alta / média / baixa
- `estimate` — estimativa de horas/pontos
- `depends_on` — array de IDs de tasks pré-requisito
- `refs` — referências cruzadas para SPEC, FEATURE, etc.
- `feature` / `fix` — contexto da task, mutuamente exclusivos: `feature: [slug]` para tasks em `.ksdd/tasks/feature-[slug]/`; `fix: [slug]` para tasks em `.ksdd/tasks/fix-[slug]/` (novo em v0.11.0, feature new-fix-command). Retrocompatível — feature tasks inalteradas.
- `fix_refs` — em tasks de fix, referencia o `.ksdd/fixes/FIX-[slug].md` de origem (equivalente a `feature_refs` para features). Demais campos idênticos aos das feature tasks — o `build:fix` reusa o parser de frontmatter do `build:feature`.

### 3.4 Frontmatter de SKILL (Codex)

`~/.agents/skills/ksdd/SKILL.md` (copiado de `references/codex-SKILL.md`):

```yaml
---
name: ksdd
description: "string com triggers de uso"
---
```

---

## 4. APIs e Endpoints

Não aplicável (sem servidor HTTP). API equivalente é a **superfície CLI** do `bin/ksdd.js`:

### 4.1 Subcomandos CLI

```
ksdd install              # Claude apenas
ksdd install --codex      # Claude + Codex
ksdd install --opencode             # Claude apenas + opencode
ksdd install --codex --opencode     # Claude + Codex + opencode
ksdd install --antigravity          # Claude apenas + Google Antigravity
ksdd install --codex --opencode --antigravity  # os 4 targets
ksdd install --copilot              # Claude apenas + GitHub Copilot (perfil VS Code)
ksdd install --copilot --project    # Claude + Copilot em .github/ do repo-alvo
ksdd install --codex --opencode --antigravity --copilot  # os 5 targets
ksdd install --postinstall  # invocado pelo npm postinstall hook
ksdd install --quiet      # silencia stdout
ksdd uninstall            # remove tudo rastreado no manifest
ksdd uninstall --quiet
ksdd remove               # alias de uninstall
ksdd status               # mostra versão + paths + contagem
ksdd help                 # default; também --help, -h
```

### 4.2 Variáveis de ambiente

| Variável | Efeito | Default |
|----------|--------|---------|
| `CODEX_HOME` | Override do diretório base do Codex | `~/.codex` |
| `KSDD_WITH_CODEX=1` | Equivale a `--codex` no postinstall | unset |
| `OPENCODE_HOME` | Override do diretório base do opencode | `~/.config/opencode` |
| `KSDD_WITH_OPENCODE=1` | Equivale a `--opencode` no postinstall | unset |
| `ANTIGRAVITY_HOME` | Override do diretório base do Antigravity | `~/.gemini` |
| `KSDD_WITH_ANTIGRAVITY=1` | Equivale a `--antigravity` no postinstall | unset |
| `COPILOT_HOME` | Override do diretório `Code/User` do VS Code (Copilot) | OS-específico (ver `resolveVscodeUserDir`) |
| `KSDD_WITH_COPILOT=1` | Equivale a `--copilot` no postinstall | unset |
| `KSDD_SKIP_POSTINSTALL=1` | Pula a etapa de postinstall (útil em CI) | unset |
| `NO_COLOR` | Desabilita ANSI escapes na saída | unset |

### 4.3 Funções internas (não exportadas — uso interno do CLI)

| Função | Responsabilidade | Linha |
|--------|------------------|-------|
| `parseArgs(argv)` | Parser de args/flags simples | 31 |
| `ensureDir(p)` | mkdir recursivo idempotente | 40 |
| `copyFile(src, dst)` | Cópia + ensureDir do parent | 44 |
| `copyDir(src, dst, tracked)` | Cópia recursiva tracking de paths | 49 |
| `loadManifest()` | Lê + parse do manifest JSON | 63 |
| `normalizeManifest(m)` | Migração de schema legado | 73 |
| `saveManifest(m)` | Escreve manifest pretty-printed | 93 |
| `removePath(p)` | rm recursivo idempotente | 98 |
| `pruneEmptyDirs(root)` | Remove diretórios vazios após uninstall | 104 |
| `agentPromptBasename(file)` | Conversão `start.md` → `ksdd-start.md`, `new:feature.md` → `ksdd-new-feature.md` (compartilhado Codex/opencode/Antigravity) | 121 |
| `installClaude(tracked, out)` | Instala em `~/.claude/` | 126 |
| `installCodex(tracked, out)` | Instala em `~/.codex/` + `~/.agents/skills/ksdd/` | 155 |
| `installOpencode(tracked, out)` | Instala em `~/.config/opencode/` + `~/.config/opencode/ksdd/` | 192 |
| `installAntigravity(tracked, out)` | Instala em `~/.gemini/antigravity-cli/skills/` + `~/.gemini/antigravity/skills/` + bundle `~/.gemini/ksdd/` (cópia adaptada de `installOpencode` — ADR-011) | `[verificar]` |
| `installCopilot(tracked, out, opts)` | Instala prompt files no perfil VS Code por SO + chat mode + bundle `<vscode-user>/ksdd/` + placeholder CLI `~/.copilot/` + modo `--project` (`.github/`) (cópia adaptada de `installAntigravity` — ADR-012) | `[verificar]` |
| `resolveVscodeUserDir()` | Resolve o `Code/User` por SO (macOS/Linux/Windows) com override `COPILOT_HOME` | `[verificar]` |

### 4.4 Superfície de slash commands distribuída

Os arquivos em `commands/*.md` são copiados para cada target (Claude: `ksdd:*.md`; Codex/opencode/Antigravity/Copilot: `ksdd-*.md` via `agentPromptBasename`). São **11 slash commands** (v0.11.0):

`start`, `spec`, `tech`, `design`, `new:feature`, `new:fix`, `build:feature`, `build:fix`, `build:all`, `setup`, `archive`.

`new:fix` e `build:fix` (feature new-fix-command, v0.11.0) entram como **commands de conteúdo** — 2 entradas em `COMMAND_FILES`, distribuídas pelo loop de cópia existente, **sem** função `install*` nova (ver ADR-013). O template `references/fix-template.md` acompanha no bundle de skill de cada target.

---

## 5. Integrações Externas

| Serviço | Propósito | Auth | Rate limit | Custo |
|---------|-----------|------|------------|-------|
| **npm registry** | Distribuição do pacote | npm token (mantenedor) | padrão npm | gratuito (público) |
| **Claude Code** (Anthropic CLI) | Consumidor primário dos commands | n/a (KSDD não fala com Anthropic) | n/a | usuário paga sua conta |
| **OpenAI Codex** (CLI/IDE) | Consumidor secundário via custom prompts + skills | n/a | n/a | usuário paga sua conta |
| **opencode** (open-source CLI) | Consumidor terciário via custom commands + bundle | n/a | n/a | usuário paga sua conta |
| **Google Antigravity** (CLI/TUI + IDE) | Consumidor quaternário via skills Markdown (`~/.gemini/`) + bundle | n/a | n/a | usuário paga sua conta |
| **GitHub** | Repo + issues + (futuro) Releases | conta do mantenedor | padrão GH | gratuito (repo público) |

**Importante:** KSDD não faz nenhuma chamada de rede em runtime. Não há SDK Anthropic, OpenAI, GitHub embarcado. Toda interação com agentes acontece via filesystem (commands lidos pelo agente do usuário).

---

## 6. Pipelines / Jobs Assíncronos

**Não aplicável.** Não há filas, cron, workers, ou processamento assíncrono. Tudo é síncrono no `bin/ksdd.js`.

A única "assincronia" lógica é o postinstall do npm:

```json
{
  "scripts": {
    "postinstall": "node bin/ksdd.js install --postinstall",
    "preuninstall": "node bin/ksdd.js uninstall --quiet || true"
  }
}
```

- `postinstall` falha de forma graciosa (mensagem warning em yellow, exit code 0) para não bloquear o `npm install`
- `preuninstall` usa `|| true` para tolerar falha sem bloquear `npm uninstall`

---

## 7. Segurança

- **Auth strategy:** não aplicável (sem auth)
- **Authorization:** não aplicável
- **Dados sensíveis (LGPD):** nenhum dado pessoal coletado. KSDD opera 100% local.
- **Rate limiting:** não aplicável
- **Uploads:** não aplicável
- **Secrets management:** não aplicável
- **Riscos de supply chain:** baixos por design — **zero dependências runtime** elimina superfície de ataque típica npm
- **Execução de postinstall:** o `postinstall` roda automaticamente em `npm install -g`. Risco aceito: usuário confia no pacote ao instalar globalmente. Mitigação: `KSDD_SKIP_POSTINSTALL=1` permite skip.
- **Escrita em filesystem fora do projeto:** `bin/ksdd.js` escreve em `~/.claude/`, `~/.codex/`, `~/.agents/`. Manifest rastreia para uninstall limpo.
- **Licença AGPL-3.0:** copyleft forte — derivados expostos via rede devem disponibilizar fonte. Impede uso comercial fechado de forks.

---

## 8. Observabilidade

- **Logging:** stdout/stderr direto, sem framework. Codificado em cores ANSI quando TTY+cor habilitada.
- **Métricas:** nenhuma (sem telemetria por design)
- **Alertas críticos:** nenhum runtime — falhas reportadas como exit codes não-zero
- **Error tracking:** stack traces lançados em `stderr` quando não-postinstall; warnings amarelos quando postinstall (para não quebrar npm install)
- **Comandos de diagnóstico:** `ksdd status` mostra estado da instalação (versão, paths, contagem de arquivos por alvo)

---

## 9. Estratégia de Testes

**`[verificar]` — estado atual:** não há suite de testes detectada no repo. Sem `tests/`, sem `*.test.js`, sem framework declarado em `package.json`.

Validação atual é manual:

- Instalar localmente (`npm install -g .` ou `npm link`)
- Verificar saída de `ksdd status`
- Confirmar arquivos em `~/.claude/commands/`, `~/.codex/prompts/`, `~/.agents/skills/ksdd/`
- `ksdd uninstall` e verificar limpeza

**Recomendação para roadmap:**

| Tipo | Sugestão |
|------|----------|
| Unit | Funções `parseArgs`, `normalizeManifest`, `codexPromptBasename` — fáceis de testar isoladamente |
| Integration | Install→Status→Uninstall em diretório temporário (`tmpdir`) |
| E2E | Smoke test em CI rodando os 4 comandos principais com `--quiet` |

Stack sugerida (zero deps fica difícil; aceitável adicionar `node:test` nativo a partir de Node 18, mas engines é `>=16`). `[verificar]` se há intenção de subir engines mínimo para 18.

---

## 10. Decisões Arquiteturais Significativas (ADRs)

### ADR-001: Zero dependências runtime

**Evidência:** `package.json` não declara `dependencies` nem `devDependencies`. `bin/ksdd.js` usa apenas `fs`, `path`, `os`.
**Decisão:** Não adicionar dependências para o CLI.
**Confiança:** alta (estado do código é definitivo).
**Consequência:** Instalação rápida, superfície de supply chain mínima, sem risco de breaking changes upstream. Custo: helpers utilitários precisam ser escritos à mão (color ANSI, parser de args). Aceitável dado o tamanho (~340 linhas).

### ADR-002: CommonJS em vez de ESM

**Evidência:** `"type": "commonjs"` em package.json; `require()` em todos os arquivos do bin.
**Decisão:** Manter CommonJS.
**Confiança:** média — não há ADR explícito. Inferência: Node 16 ESM tem caveats com top-level await e interop CJS.
**Consequência:** Compatibilidade ampla com Node 16+ sem flags. Custo futuro: migração para ESM exigiria refactor se a comunidade Node abandonar CJS.

### ADR-003: Conteúdo distribuído via filesystem, não via API

**Evidência:** O design inteiro é cópia de arquivos para diretórios convencionais. Não há servidor, sem RPC.
**Decisão:** KSDD é distribuição estática — agentes consomem Markdown direto do disco.
**Confiança:** alta.
**Consequência:** Funciona offline após instalação; atualizações exigem `npm install -g @kognar/ksdd@latest`. Sem sincronização em tempo real entre máquinas.

### ADR-004: Manifest rastreia paths absolutos para uninstall limpo

**Evidência:** `bin/ksdd.js:215-223` — manifest com `targets.claude` e `targets.codex` como arrays de paths.
**Decisão:** Salvar paths em vez de inferir por convenção no uninstall.
**Confiança:** alta.
**Consequência:** Uninstall preciso mesmo se a convenção mudar entre versões. Custo: manifest precisa ser preservado entre instalações; código tem fallback para uninstall por convenção quando manifest sumiu (`bin/ksdd.js:238-249`).

### ADR-005: Postinstall silencioso em falha

**Evidência:** `bin/ksdd.js:327-332` — try/catch no `main()` que emite warning amarelo em vez de erro fatal quando flag `postinstall` está presente.
**Decisão:** Não quebrar `npm install -g` se o postinstall falhar.
**Confiança:** alta.
**Consequência:** Usuário não fica preso no install; pode rodar `ksdd install` manualmente. Trade-off: bugs no postinstall podem passar despercebidos.

### ADR-006: Manifest com migração de schema legado em runtime

**Evidência:** `bin/ksdd.js:73-91` — `normalizeManifest` converte `{ files: [] }` (formato pré-0.4.0) em `{ targets: { claude, codex } }` ao ler.
**Decisão:** Não exigir migração manual após upgrade de versão.
**Confiança:** alta.
**Consequência:** Upgrade transparente. Custo: código de normalização precisa ser mantido enquanto houver instalações antigas em uso.

### ADR-007: Cópia em vez de symlink

**Evidência:** `bin/ksdd.js:44-47` — `fs.copyFileSync` em vez de `fs.symlinkSync`.
**Decisão:** Copiar arquivos para `~/.claude/`, `~/.codex/`, `~/.agents/`.
**Confiança:** alta (estado do código).
**Consequência:** Funciona em Windows (symlinks exigem privilégio). Custo: atualização exige reinstalar, não basta refresh do source. Aceitável dado o tamanho dos arquivos.

### ADR-008: Adotar formato Google Stitch para DESIGN.md

**Evidência:** `references/design-md-spec.md` + citações no README ("YAML tokens + 8 seções markdown canônicas", "formato oficial Google Stitch open-source").
**Decisão:** DESIGN.md gerado é 100% Stitch-compatível.
**Confiança:** alta.
**Consequência:** Interoperabilidade com v0, Lovable, Pencil, Cursor que entendem o formato. Custo: KSDD precisa acompanhar evolução do Stitch upstream.

### ADR-009: Slash commands com prefixo `ksdd:` (Claude) e `ksdd-` (Codex)

**Evidência:** `bin/ksdd.js:126` (`ksdd:${file}`) e `bin/ksdd.js:116-119` (`codexPromptBasename` substitui `:` por `-`).
**Decisão:** Manter prefixo `ksdd` em ambos, adaptando ao separador suportado por cada agente.
**Confiança:** alta.
**Consequência:** Evita colisão de namespace com outros skills/commands. Codex não suporta `:` em nomes de prompt — exige conversão.

### ADR-010: Terceiro target (opencode) hardcoded antes do refator `installTarget` genérico

**Evidência:** feature opencode-integration (v0.8.0) adiciona `installOpencode()` como cópia adaptada de `installCodex` em `bin/ksdd.js`, em vez de refatorar para `installTarget(targetConfig)`. Decisão e trade-off documentados em `.ksdd/features/FEATURE-opencode-integration.md` seção 1.1.
**Decisão:** aceitar duplicação intencional `installCodex` ↔ `installOpencode` com prazo explícito — a próxima feature multi-agent (Cursor, Windsurf ou Cline) **deve** introduzir `installTarget(targetConfig)` genérico antes de adicionar o quarto target.
**Confiança:** alta — decisão deliberada após análise de trade-off documentada em FEATURE seção 1.1.
**Consequência:** release de opencode 2-3x mais rápido vs refator imediato; aumenta dívida técnica em ~250 linhas duplicadas (`installCodex` + `installOpencode`); o refator dobrará de tamanho quando finalmente acontecer (3 funções para refatorar em vez de 2). Trade-off aceito explicitamente.
**Continuação (ver ADR-011):** o quarto target (Google Antigravity, v0.9.0) reiterou o adiamento em vez de disparar o refator. O prazo deixa de ser "próxima feature multi-agent" e passa a ser **uma feature dedicada de refator, obrigatória antes do 5º target**. ADR-011 substitui o gatilho deste ADR.

### ADR-011: Quarto target (Google Antigravity) hardcoded — refator `installTarget` vira feature dedicada

**Evidência:** feature antigravity-integration (v0.9.0) adiciona `installAntigravity()` como cópia adaptada de `installOpencode` em `bin/ksdd.js`, instalando os 9 commands em duas superfícies globais (`~/.gemini/antigravity-cli/skills/` e `~/.gemini/antigravity/skills/`) + bundle compartilhado `~/.gemini/ksdd/`. Decisão e trade-off em `.ksdd/features/FEATURE-antigravity-integration.md` seção 1.1.
**Decisão:** aceitar a **quarta cópia hardcoded** para validar adoção (ecossistema Google) antes de pagar a dívida do refator. O refator `installTarget(targetConfig)` genérico deixa de ser embutido "no próximo target" e vira **feature dedicada própria**, com gatilho firme: **deve ser concluída antes de adicionar o 5º target** (Cursor/Windsurf/Cline).
**Confiança:** alta — decisão explícita do mantenedor no checkpoint da feature (hardcoded + cobrir CLI e IDE + bump minor 0.9.0).
**Consequência:** entrega de Antigravity rápida e sem cirurgia arquitetural; a dívida sobe para **4 funções `install*` duplicadas** (~250 linhas a mais), e o refator agora unificará 4 funções em vez de 3. Risco extra específico: o pruning no uninstall opera sob `~/.gemini/` (compartilhado com `gemini-cli` e outros tools Google) — mitigado restringindo o prune estritamente aos subdirs KSDD. Trade-off aceito explicitamente.
**Continuação (ver ADR-012):** o quinto target (GitHub Copilot, v0.10.0) não honrou o gatilho "feature dedicada de refator antes do 5º target" — o adiamento foi conscientemente repetido mais uma vez para capturar o maior público. ADR-012 substitui o gatilho deste ADR por um mais firme: o refator `installTarget` genérico vira **inescapável antes do 6º target**.

### ADR-012: Quinto target (GitHub Copilot) hardcoded — refator `installTarget` vira pré-requisito inescapável antes do 6º target

**Evidência:** feature github-copilot-integration (v0.10.0) adiciona `installCopilot()` como cópia adaptada de `installAntigravity` em `bin/ksdd.js`, distribuindo os 9 commands como prompt files (`ksdd-*.prompt.md`) no diretório de perfil do usuário do VS Code, resolvido por SO (via `resolveVscodeUserDir()`), mais chat mode (`ksdd.chatmode.md`), modo project-scoped em `.github/` (opt-in `--project`) e um placeholder do Copilot CLI em `~/.copilot/`. Decisão e trade-off em `.ksdd/features/FEATURE-github-copilot-integration.md` seção 1.1.
**Decisão:** aceitar a **quinta cópia hardcoded** para capturar o maior público (GitHub Copilot) antes de pagar a dívida do refator. O gatilho do ADR-011 ("feature dedicada de refator antes do 5º target") foi conscientemente **não** honrado; ADR-012 o substitui por um gatilho mais firme: o refator `installTarget(targetConfig)` genérico é agora **inescapável antes do 6º target** (Cursor/Windsurf/Cline).
**Confiança:** alta — decisão explícita do mantenedor no checkpoint da feature (hardcoded + 4 superfícies + prioridade Alta / bump minor 0.10.0).
**Consequência:** entrega rápida do target de maior alcance; a dívida sobe para **5 funções `install*` duplicadas** (~250 linhas a mais), e o refator agora unificará 5 funções. Riscos novos específicos deste target: resolução de path por SO (`resolveVscodeUserDir()`) e pruning sob o diretório `User/` compartilhado do VS Code (nunca prunar o próprio `User/`). Trade-off aceito explicitamente.

### ADR-013: `.ksdd/fixes/` como nova classe de artefato (paralela a `.ksdd/features/`) — commands de conteúdo, sem novo target

**Evidência:** feature new-fix-command (v0.11.0) adiciona os slash commands `/ksdd:new:fix` e `/ksdd:build:fix` como **2 entradas em `COMMAND_FILES`** (`bin/ksdd.js`), mais o template `references/fix-template.md`. São **commands de conteúdo** — distribuídos a todos os targets (Claude/Codex/opencode/Antigravity/Copilot) pelo loop de cópia existente, com basename `ksdd-new-fix.md` / `ksdd-build-fix.md` via `agentPromptBasename`. **Não** criam nenhuma função `install*`. Decisão e trade-off em `.ksdd/features/FEATURE-new-fix-command.md` seções 2, 6 e 7.
**Decisão:** tratar bug investigado como **classe de artefato própria** — `.ksdd/fixes/FIX-[slug].md` + tasks em `.ksdd/tasks/fix-[slug]/` — paralela a `.ksdd/features/`, com namespace separado (evita a ambiguidade "isso é bug ou feature?"). Como os dois commands são de conteúdo (não superfícies de instalação), **não** incorrem na dívida do ADR-010/011 e **não** disparam o refator `installTarget(targetConfig)`; o gatilho do ADR-012 (refator inescapável antes do 6º target) permanece intocado. Duas decisões de produto ficam registradas: (a) **fix inline opcional** para bugs pequenos (1 arquivo, sem schema/API/auth) — opt-in explícito, com teste de regressão obrigatório mesmo inline; (b) **gate de regressão obrigatório** no `build:fix` — o PR só abre se existir um teste que falha-antes/passa-depois (ao contrário de features, onde o teste não é gate bloqueante).
**Confiança:** alta — decisão explícita do mantenedor no checkpoint da feature (par de commands + namespace `.ksdd/fixes/` + bump minor 0.11.0).
**Consequência:** o KSDD passa a cobrir o terceiro momento do ciclo de vida (manutenção reativa) sem tocar a arquitetura de instalação — a superfície de slash commands sobe de 9 para 11, mas a contagem de funções `install*` permanece em 5. A rastreabilidade de bug vira artefato versionável (`FIX-[slug].md`). Custo: `new:feature` e `new:fix` passam a varrer `.ksdd/tasks/fix-*/` além de `feature-*` para manter o espaço global de IDs; arquivar fixes via `/ksdd:archive` fica como item futuro (hoje o archive cobre só features).

---

## 11. Riscos Técnicos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Convenções de path de Claude Code mudam (`~/.claude/commands/` → outro) | Alto | Baixa | Atualizar `bin/ksdd.js` e relançar. Manifest permite uninstall mesmo se path antigo |
| OpenAI deprecia custom prompts (já marcado como deprecated em favor de skills) | Médio | Média | README já cita; migração para skill `~/.agents/skills/ksdd/` já está feita em paralelo |
| Google Stitch evolui o formato `DESIGN.md` quebrantemente | Alto | Baixa-Média | Versionar `references/design-md-spec.md` por release; documentar versão suportada |
| Crescimento do projeto exige adicionar dependências (rompe ADR-001) | Médio | Média | Avaliar caso a caso; preferir built-ins ou helpers inline |
| Ausência de testes automáticos | Alto | Alta (estado atual) | Adicionar suite mínima usando `node:test` (Node 18+) — exige bumpar engines |
| Mantenedor único (bus factor) | Alto | Média | Documentar processo de release em CONTRIBUTING; abrir contribuições a coautores |
| AGPL-3.0 desencoraja adoção comercial | Médio | Média | Avaliar dual-license (AGPL + commercial) se houver demanda — confirmado fora do roadmap atual |
| Suporte multi-agent (Cursor, Windsurf, Cline) exige n-cópias do conteúdo | Médio | Alta (no roadmap) | Refatorar `installClaude`/`installCodex` em função genérica `installTarget(targetConfig)` |
| Conteúdo de commands desincroniza entre Claude e Codex | Alto | Baixa | Já mitigado: ambos copiam de `commands/*.md` (fonte única) |
| Convenções de path opencode em Windows divergem de `~/.config/opencode/` | Médio | Média | Validar no QA (task 027); usar `OPENCODE_HOME` override quando necessário |
| Duplicação `installCodex`/`installOpencode`/`installAntigravity` (4 cópias) aumenta dívida técnica | Médio | Alta (esperada) | ADR-011 fixa gatilho: refator `installTarget` vira feature dedicada antes do 5º target |
| Path do IDE Antigravity (`~/.gemini/antigravity/skills/`) divergir do assumido | Médio | Média | Marcado `[verificar]`; confirmar no dogfood (task 034); `ANTIGRAVITY_HOME` permite override |
| `pruneEmptyDirs` em `~/.gemini/` apagar diretório compartilhado com `gemini-cli`/outros tools Google | Alto | Média | Restringir prune estritamente aos subdirs KSDD (`antigravity-cli/skills`, `antigravity/skills`, `ksdd`) — nunca subir para `~/.gemini/` |
| Path de perfil do VS Code por SO divergir do assumido (macOS/Windows/Insiders) | Alto | Média | `resolveVscodeUserDir()` resolve por SO + `COPILOT_HOME` override; confirmar cada SO no dogfood antes do release |
| `pruneEmptyDirs` sob `<vscode-user>/` apagar config do VS Code (diretório `User/` compartilhado) | Alto | Média | Prune restrito aos subdirs `prompts/`/`ksdd/` (e `.github/prompts\|chatmodes/`, `~/.copilot/prompts/`) e só se vazios — nunca prunar o próprio `User/` |
| Quinta cópia hardcoded (`installAntigravity`→`installCopilot`) aumenta dívida técnica (5 cópias `install*`) | Médio | Alta (esperada) | ADR-012 fixa gatilho firme: refator `installTarget` inescapável antes do 6º target |

---

## 12. Roadmap de Implementação

### Fase 1 — Fundação (v0.1.0) — **Concluído (08/05/2025)**
- [x] Commands `start`, `spec`, `tech`, `design`
- [x] Templates canônicos em `references/`
- [x] Agents `interviewer`, `consolidator`, `critic`
- [x] CLI `bin/ksdd.js` com install/uninstall/status
- [x] README + INSTALL

### Fase 2 — Licenciamento + features (v0.2.0) — **Concluído (13/05/2026)**
- [x] AGPL-3.0 + CONTRIBUTING.md
- [x] Commands `new:feature`, `build:feature`, `build:all`
- [x] Templates feature/build-plan
- [x] Gates 5, 6, 7

### Fase 3 — Codex (v0.4.0) — **Concluído (13/05/2026)**
- [x] `ksdd install --codex`
- [x] Custom prompts + skill SKILL.md
- [x] Manifest com `targets.claude`/`targets.codex`
- [x] Env vars `KSDD_WITH_CODEX`, `CODEX_HOME`

### Fase 4 — Onboarding existente (v0.5.0) — **Concluído (14/05/2026)**
- [x] Command `/ksdd:setup`
- [x] Agent `setup-analyst`
- [x] Flags `--artifacts`, `--depth`, `--skip-questions`

### Fase 5 — Multi-agent — **Em andamento**
- [x] Suporte a opencode (v0.8.0, 26/05/2026)
- [x] Suporte a Google Antigravity (v0.9.0, 01/06/2026) — 4º target, CLI/TUI + IDE (ADR-011)
- [x] Suporte a GitHub Copilot (v0.10.0, 07/07/2026) — 5º target, prompt files VS Code + chat mode + project + CLI placeholder (ADR-012)
- [ ] **Refator dedicado** de `install*` para `installTarget(targetConfig)` genérico — feature própria, **obrigatória antes do 6º target** (ADR-012)
- [ ] Suporte a Cursor (`[verificar paths]`: `~/.cursor/` ou `.cursorrules` ou outro?)
- [ ] Suporte a Windsurf
- [ ] Suporte a Cline
- [ ] Manifest com `targets.cursor`, `targets.windsurf`, `targets.cline`

### Fase 5.5 — Manutenção reativa: comandos de fix — **Concluído (08/07/2026)**
- [x] Commands `new:fix`, `build:fix` — 2 entradas em `COMMAND_FILES`, sem função `install*` nova (ADR-013)
- [x] Nova classe de artefato `.ksdd/fixes/FIX-[slug].md` + tasks `.ksdd/tasks/fix-[slug]/` (frontmatter `fix:` / `fix_refs`)
- [x] Template `references/fix-template.md`; Gates 8 e 9 em `references/approval-gates.md`
- [x] Fix inline opcional (bugs pequenos) + teste de regressão como gate obrigatório no `build:fix`
- [x] Superfície de slash commands 9 → 11; bump minor v0.11.0
- [ ] **Futuro:** arquivar fixes via `/ksdd:archive` (hoje o archive cobre só `.ksdd/features/`)

### Fase 6 — Integração design tools — **Roadmap confirmado**
- [ ] Exportador `DESIGN.md` → Figma (via plugin ou JSON intermediário)
- [ ] Exportador/importador Pencil
- [ ] Validar export bidirecional com Google Stitch

### Fase 7 — Qualidade — **`[verificar]` priorização**
- [ ] Suite de testes automatizada (`node:test` ou framework leve)
- [ ] CI/CD com GitHub Actions (build, test, publish)
- [ ] Lint/validador de SPEC.md (`[verificar]` se está no roadmap)
- [ ] Versão 1.0.0 quando: `[critério a definir]`

---

**Próximo passo:** `/ksdd:design` **não se aplica** a este projeto (sem UI). Revise `brainstorm.md`, `SPEC.md` e `architecture.md`, corrija os pontos marcados como `[verificar]`, e mude `Status:` para `Aprovado` antes de usar como contrato.
