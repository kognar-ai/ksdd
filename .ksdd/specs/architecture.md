# Architecture — KSDD (Kognar Spec-Driven Design & Development)

**Versão:** 1.0 (reverse-engineered)
**Última atualização:** 14/05/2026
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
              │  ├── commands/*.md         (8 slash commands)               │
              │  ├── references/*.md       (templates canônicos)            │
              │  ├── agents/*.md           (helpers: interviewer/critic/...) │
              │  ├── README.md / INSTALL.md / CHANGELOG.md / LICENSE        │
              │  └── package.json                                           │
              └───────────────────────────┬─────────────────────────────────┘
                                          │ ksdd install [--codex]
                                          ▼
        ┌───────────────────────────────────────────────────────────────┐
        │                                                               │
        ▼                                                               ▼
   ┌──────────────────────────────────┐         ┌──────────────────────────────────────┐
   │  Claude Code (target: claude)    │         │  OpenAI Codex (target: codex)        │
   │  ~/.claude/commands/ksdd:*.md    │         │  ~/.codex/prompts/ksdd-*.md          │
   │  ~/.claude/skills/ksdd/          │         │  ~/.agents/skills/ksdd/SKILL.md      │
   │    ├── references/               │         │  ~/.agents/skills/ksdd/references/   │
   │    ├── agents/                   │         │  ~/.agents/skills/ksdd/agents/       │
   │    └── README.md INSTALL.md      │         │  ~/.agents/skills/ksdd/README.md     │
   │    .ksdd-manifest.json           │         │                                      │
   └──────────────────────────────────┘         └──────────────────────────────────────┘
                          │                                       │
                          └───────────────┬───────────────────────┘
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
  "version": "string (semver, ex: '0.5.0')",
  "installedAt": "string (ISO-8601 timestamp)",
  "pkgRoot": "string (path absoluto do pacote npm)",
  "targets": {
    "claude": ["string (path absoluto de arquivo instalado)", ...],
    "codex":  ["string (path absoluto de arquivo instalado)", ...]
  }
}
```

**Schema legado normalizado** (`bin/ksdd.js:73-91`):

- Formato antigo: `{ ..., files: ["path", ...] }` → migrado em runtime para `{ targets: { claude: files, codex: [] } }`
- Formato sem `files` nem `targets`: criado como `{ targets: { claude: [], codex: [] } }`

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
| `codexPromptBasename(file)` | Conversão `start.md` → `ksdd-start.md`, `new:feature.md` → `ksdd-new-feature.md` | 116 |
| `installClaude(tracked, out)` | Instala em `~/.claude/` | 121 |
| `installCodex(tracked, out)` | Instala em `~/.codex/` + `~/.agents/skills/ksdd/` | 150 |

---

## 5. Integrações Externas

| Serviço | Propósito | Auth | Rate limit | Custo |
|---------|-----------|------|------------|-------|
| **npm registry** | Distribuição do pacote | npm token (mantenedor) | padrão npm | gratuito (público) |
| **Claude Code** (Anthropic CLI) | Consumidor primário dos commands | n/a (KSDD não fala com Anthropic) | n/a | usuário paga sua conta |
| **OpenAI Codex** (CLI/IDE) | Consumidor secundário via custom prompts + skills | n/a | n/a | usuário paga sua conta |
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

### Fase 5 — Multi-agent (próximo) — **Roadmap confirmado**
- [ ] Refator de `install*` para `installTarget(targetConfig)` genérico
- [ ] Suporte a Cursor (`[verificar paths]`: `~/.cursor/` ou `.cursorrules` ou outro?)
- [ ] Suporte a Windsurf
- [ ] Suporte a Cline
- [ ] Manifest com `targets.cursor`, `targets.windsurf`, `targets.cline`

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
