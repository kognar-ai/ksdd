# Feature: Integração com Google Antigravity (quarto target após Claude Code, Codex e opencode)

> Suporte ao agente [Google Antigravity](https://antigravity.google) como quarto target de instalação do KSDD — `ksdd install --antigravity` registra os 9 slash commands como **TOML nativo do Gemini** em `~/.gemini/commands/ksdd/*.toml` (mesmo diretório lido pela CLI/TUI e pelo IDE do Antigravity, compartilhado com o `gemini-cli`), com o corpo de cada command num bundle `~/.gemini/ksdd/` puxado via include `@$HOME/...`. Mantém o pacote zero-deps e o manifest unificado. Adicionado como quarta cópia hardcoded (`installAntigravity`), com ADR-011 registrando o adiamento consciente do refator `installTarget` genérico previsto no ADR-010.
>
> **Correção pós-dogfood (01/06/2026) — AUTORITATIVA:** a 1ª implementação mirava skills Markdown planos em `~/.gemini/antigravity-cli/skills/` e `~/.gemini/antigravity/skills/` — superfícies que **não** registram slash commands; nada aparecia no Antigravity. O modelo correto é **TOML nativo em `~/.gemini/commands/ksdd/*.toml`** (subdirs aninhados → `/ksdd:new:feature`) + bundle `~/.gemini/ksdd/` com os corpos puxados via include `@$HOME/...`, ancorado na instalação real do [GSD](https://github.com/open-gsd/gsd-core), que já funciona no Antigravity na máquina do mantenedor. A seção 2.1 (layout) e o `bin/ksdd.js` refletem o modelo corrigido; **onde os fluxos (4.x), riscos (9.x) e critérios (10) abaixo ainda mencionarem `antigravity-cli/skills`/`antigravity/skills`, vale o modelo TOML desta nota.** O target continua sendo um só (`~/.gemini/commands/` é lido pela CLI/TUI e pelo IDE), então a decisão "Ambos" é atendida por uma superfície única — não duas.

**Slug:** antigravity-integration
**Prioridade:** Alta
**Status:** Rascunho
**Data:** 01/06/2026
**Projeto:** KSDD — Kognar Spec-Driven Design & Development

---

## 1. Motivação

### 1.1 Problema / Oportunidade

A Fase 5 do roadmap (SPEC seção 14, architecture seção 12) é "Multi-agent: suporte a mais agentes". A v0.8.0 entregou opencode como terceiro target (26/05/2026). Desde então, o **Google Antigravity** — plataforma agentic-first do Google, com CLI (TUI) e IDE, construída em torno dos modelos Gemini — ganhou tração como ambiente de desenvolvimento orientado a agentes. Antigravity adota o mesmo padrão de slash commands em Markdown que Claude Code, Codex e opencode: um arquivo `.md` em `skills/` vira `/nome` invocável. Hoje quem usa Antigravity tem que copiar manualmente os arquivos do repo KSDD para a pasta certa — o mesmo atrito que motivou Codex (v0.4.0) e opencode (v0.8.0).

Três dores concretas, paralelas às dos targets anteriores:

1. **Pacote KSDD ignora um agente em ascensão.** README diz "Claude Code, Codex e opencode" — usuário de Antigravity não aparece. Adicionar Antigravity com paridade total (mesmos 9 commands, mesmos templates) honra o posicionamento "agente-agnóstico, conteúdo distribuído".
2. **Custo de oportunidade vs. refator.** O ADR-010 promete o refator `installTarget(targetConfig)` genérico antes do quarto target. Porém o mantenedor decidiu (ver ADR-011) entregar Antigravity como **quarta cópia hardcoded** para validar a adoção antes de pagar a dívida — o refator real entra como feature dedicada (Fase 5, antes do 5º target). Trade-off explícito e documentado.
3. **Validação de hipótese multi-agent (continuação).** opencode foi o primeiro teste barato da Fase 5; Antigravity confirma se a estratégia de "uma cópia por agente" atrai usuários de ecossistemas distintos (Google) o suficiente pra justificar o refator genérico. Se Antigravity + opencode trouxerem issues/PRs, o refator do `installTarget` ganha prioridade clara.

O `git log` da v0.8.0 (commits do opencode) mostra que a cópia hardcoded levou ~250 linhas em `bin/ksdd.js` — escopo previsível, sem cirurgia arquitetural. Antigravity adiciona um detalhe a mais: **duas superfícies globais** (CLI + IDE) em vez de uma, o que ~dobra a lógica de cópia de commands mas não a complexidade conceitual.

### 1.2 Personas Impactadas

- **Marina (Product Designer / PM solo) — SPEC seção 2.1:** ganha opcionalidade — se está experimentando o Antigravity (IDE agentic do Google, integrado a Gemini), o fluxo KSDD continua sem manter cópias paralelas dos artefatos. Onboarding em projeto novo (`/ksdd:start` → `/ksdd-start`) idêntico em qualquer agente.
- **Rafa (Founder técnico solo) — SPEC seção 2.2:** o pitch "spec-driven sem SaaS, sem lock-in" passa a cobrir o agente que ele provavelmente vai testar se já está no ecossistema Google Cloud / Gemini. Reduz fricção pra adoção.
- **Lia (Tech lead em agência) — SPEC seção 2.3:** clientes padronizados em Google Cloud / Gemini podem exigir Antigravity. Suporte destrava esses clientes sem mudar o entregável (mesmos 4 artefatos Markdown).

### 1.3 Métricas de Sucesso

| Métrica | Meta | Prazo |
|---------|------|-------|
| `ksdd install --antigravity` instala todos os 9 commands em ambas as superfícies (CLI + IDE) + bundle sem warnings (macOS, Linux, Node ≥ 16) | 100% | imediato pós-release |
| Manifest pós-install contém `targets.antigravity` com paths absolutos corretos de ambas as superfícies | 100% | imediato |
| `ksdd uninstall` remove todos os arquivos rastreados em `~/.gemini/antigravity-cli/` e `~/.gemini/antigravity/` (sem lixo, sem deletar arquivos não-KSDD) | 100% | imediato |
| `ksdd status` exibe linha "antigravity: N arquivos" quando há instalação ativa | 100% | imediato |
| Slash commands invocáveis em Antigravity via `/ksdd-start`, `/ksdd-new-feature`, etc., com saída funcional equivalente a Claude Code | 9/9 commands | imediato |
| README declara "Suporta Claude Code, OpenAI Codex, opencode e Google Antigravity" e tabela de paths atualizada | confirmado | imediato |
| Issues abertas no GitHub sobre "uso de Antigravity" em 3 meses pós-release | ≥ 3 (sinal de adoção) | 3 meses |

---

## 2. Escopo

### 2.1 O que entra (v1)

- **Nova flag `--antigravity`** em `ksdd install`. Combinável com `--codex` e `--opencode` (ex: `ksdd install --codex --opencode --antigravity` instala os 4 targets de uma vez).
- **Nova env var `KSDD_WITH_ANTIGRAVITY=1`** equivalente à flag, lida pelo postinstall (espelha `KSDD_WITH_CODEX` / `KSDD_WITH_OPENCODE`).
- **Nova env var `ANTIGRAVITY_HOME`** para override do diretório base (default `~/.gemini`). Espelha `CODEX_HOME` / `OPENCODE_HOME`.
- **Nova função `installAntigravity(tracked, out)`** em `bin/ksdd.js`, escrita como **cópia adaptada** de `installOpencode` (ADR-011 documenta a decisão de adiar de novo o refator `installTarget` genérico).
- **Registro como TOML nativo do Gemini** (mesmo diretório `~/.gemini/commands/` lido pela CLI/TUI e pelo IDE do Antigravity — cobre a decisão "Ambos" numa só superfície):
  ```
  ~/.gemini/
  ├── commands/
  │   └── ksdd/                      # namespace 'ksdd' (subdirs aninhados → /ksdd:new:feature)
  │       ├── start.toml             # → /ksdd:start
  │       ├── spec.toml · tech.toml · design.toml · setup.toml · archive.toml
  │       ├── new/feature.toml       # → /ksdd:new:feature
  │       └── build/feature.toml · build/all.toml
  └── ksdd/                          # bundle (corpos + references/agents)
      ├── commands/ksdd-*.md         # corpos dos commands (incluídos pelos TOML via @$HOME/...)
      ├── references/                # cópia de references/ do pacote
      ├── agents/                    # cópia de agents/ do pacote
      ├── README.md · INSTALL.md
      └── AGENTS.md                  # NOVO — explica onde achar commands/references/agents
  ```
  Cada `.toml` tem `description` + `prompt`; o `prompt` faz `@$HOME/.gemini/ksdd/commands/ksdd-<nome>.md` para puxar o corpo do command e aponta os templates em `$HOME/.gemini/ksdd/references/`. Modelo comprovado pelo [GSD](https://github.com/open-gsd/gsd-core) (`~/.gemini/commands/gsd/*.toml`).
- **Naming de commands:** subdirs aninhados sob `commands/ksdd/` reproduzem a invocação do Claude (`new/feature.toml` → `/ksdd:new:feature`). O corpo bundlado usa `agentPromptBasename()` (`ksdd-new-feature.md`) só como nome de arquivo do include.
- **`AGENTS.md` no bundle (`~/.gemini/ksdd/AGENTS.md`)** — gerado a partir do template novo `references/antigravity-AGENTS.md`, curto (~30 linhas), que orienta o agente Antigravity sobre:
  - Onde estão os templates canônicos (`./references/`)
  - Onde estão os agents auxiliares (`./agents/`)
  - Que os skills em `~/.gemini/antigravity-cli/skills/ksdd-*.md` e `~/.gemini/antigravity/skills/ksdd-*.md` esperam encontrar esses arquivos via referência relativa ao bundle
  - Convenção de aprovação obrigatória nos checkpoints (espelha `references/opencode-AGENTS.md`, adaptado ao estilo Antigravity)
- **Manifest com `targets.antigravity`:**
  ```json
  {
    "version": "0.9.0",
    "installedAt": "ISO-8601",
    "pkgRoot": "/path/do/pacote",
    "targets": {
      "claude": [...],
      "codex":  [...],
      "opencode": [...],
      "antigravity": [...]   // NOVO — array de paths absolutos (ambas superfícies + bundle)
    }
  }
  ```
  `normalizeManifest()` atualizado para tratar manifest legado sem `targets.antigravity` (cria array vazio).
- **`ksdd uninstall`** estendido: remove tudo em `targets.antigravity`, faz `pruneEmptyDirs()` apenas em `~/.gemini/commands/ksdd/` e `~/.gemini/ksdd/`. Fallback por convenção (sem manifest) remove o namespace `commands/ksdd/` inteiro + bundle. **Nunca toca `~/.gemini/commands/` (compartilhado com `gsd` e outros namespaces) nem `~/.gemini/`** (risco explícito, ver seção 9.2).
- **`ksdd status`** exibe nova linha `antigravity: N arquivos em ~/.gemini/` quando `targets.antigravity` é não-vazio.
- **`ksdd install` sem `--antigravity` preserva instalação Antigravity anterior** — não deleta nada em `~/.gemini/`. Espelha o comportamento de Codex/opencode (SPEC seção 11).
- **README + INSTALL + CHANGELOG atualizados:**
  - Tabela de targets passa a ter 4 colunas (Claude, Codex, opencode, Antigravity) com paths
  - Seção "Instalação seletiva" lista `--antigravity` como flag válida
  - Exemplo de `KSDD_WITH_ANTIGRAVITY=1 npm install -g @kognar/ksdd`
  - CHANGELOG documenta a nova versão (bump minor v0.9.0 — nova capacidade backwards-compatible)
- **`package.json` bump** para `0.9.0`.
- **Dogfood:** após release local, o mantenedor roda `ksdd install --antigravity` num ambiente com Antigravity instalado e valida que pelo menos `/ksdd-start` e `/ksdd-spec` rodam ponta-a-ponta na TUI/IDE.
- **ADR-011 em `architecture.md`:** registra "Quarto target hardcoded; adiamento consciente do refator `installTarget` genérico previsto no ADR-010 — refator vira feature dedicada antes do 5º target". Atualiza ADR-010 com nota de continuidade.

### 2.2 O que fica pra depois

- **Refator `installTarget(targetConfig)` genérico** — vira **feature dedicada** (não mais "embutida no próximo target"). ADR-011 fixa o gatilho: deve acontecer **antes** de adicionar o 5º target (Cursor/Windsurf/Cline). Tentar refatorar dentro desta feature dobraria o escopo.
- **Suporte a workflows project-level (`.agents/workflows/`) do Antigravity** — Antigravity permite workflows escopados por projeto. KSDD por enquanto só instala global (TUI + IDE); uso project-level pode vir como `ksdd install --antigravity --project` em feature futura. Mantém o modelo "instale uma vez, global".
- **`openai.yaml` por skill** (formato de skill rico do Antigravity com `display_name`, `brand_color`, `default_prompt`, `allow_implicit_invocation`) — os 9 commands KSDD funcionam como Markdown puro → `/nome`; metadados ricos por skill são otimização opcional pós-v1.
- **Plugins Antigravity (`~/.gemini/antigravity-cli/plugins/<nome>/`)** — empacotar KSDD como plugin oficial Antigravity (com skills + agents + rules) é caminho futuro; v1 usa o mecanismo mais simples (skills soltas).
- **Frontmatter `agent:`/subagente nativo** que aproveite os agents bundlados (`interviewer`, `consolidator`, `critic`) como subagentes Antigravity — exploratório pós-v1.
- **Suporte a Cursor, Windsurf, Cline** — restante da Fase 5; depende do refator `installTarget`.
- **Detecção se Antigravity está instalado** antes de copiar — v1 cria os diretórios mesmo assim (idempotente, baixo custo).
- **`ksdd doctor`** cross-agent — nice-to-have, fora de escopo.
- **Telemetria de target mais usado** — viola "sem telemetria" (SPEC seção 12). Fora de escopo permanente.

### 2.3 O que NÃO é essa feature

- **Não é o refator do instalador.** Cópia adaptada de `installOpencode` é proposital — duplicação aceita sob ADR-011 com gatilho explícito (refator antes do 5º target).
- **Não é mudança nos commands em si.** Os 9 arquivos em `commands/*.md` permanecem idênticos; só a distribuição muda. Adaptação Antigravity-específica de um command seria task separada (e sinal de acoplamento indevido a Claude).
- **Não é mudança nos templates em `references/`.** Templates são agent-agnósticos; reuso direto. O único arquivo novo em `references/` é `antigravity-AGENTS.md` (contexto pro agente).
- **Não é suporte project-level (`.agents/workflows/`).** Só global (TUI + IDE) na v1.
- **Não é setup automático do Antigravity no sistema.** KSDD não instala Antigravity; assume que o usuário já tem.

---

## 3. User Stories

| # | Como... | Quero... | Para... |
|---|---------|----------|---------|
| US-01 | Marina (PM testando Antigravity) | rodar `npm install -g @kognar/ksdd && ksdd install --antigravity` | ter os 9 commands KSDD disponíveis no Antigravity (TUI e IDE) sem copiar arquivo manualmente |
| US-02 | Rafa (founder no ecossistema Google) | `KSDD_WITH_ANTIGRAVITY=1 npm install -g @kognar/ksdd` no setup do laptop | postinstall já configurar tudo automaticamente sem comando extra |
| US-03 | Lia (tech lead com mix de clientes) | `ksdd install --codex --opencode --antigravity` num único comando | atender clientes em ecossistemas diferentes sem reinstalar |
| US-04 | qualquer mantenedor | `ksdd status` mostrar quais targets estão ativos (incluindo antigravity) | saber o estado da instalação sem inspecionar 4 diretórios |
| US-05 | qualquer usuário | `ksdd uninstall` remover tudo de uma vez | desinstalação completa sem deixar órfãos em `~/.gemini/` |
| US-06 | usuário Antigravity | invocar `/ksdd-start` no Antigravity com a mesma experiência que em Claude/Codex/opencode | não aprender fluxos diferentes por agente |
| US-07 | usuário que já tinha KSDD (Claude+Codex+opencode) | rodar `ksdd install --antigravity` sem outras flags | adicionar Antigravity sem perder os targets anteriores |
| US-08 | contribuidor lendo `bin/ksdd.js` | ver ADR-011 claro no architecture.md sobre a 4ª cópia e o gatilho do refator | entender por que `installAntigravity` é cópia de `installOpencode` e quando o refator finalmente acontece |

---

## 4. Fluxos de Uso

### 4.1 Instalação fresca incluindo Antigravity (cenário primário)

**Pré-condição:** Usuário tem Node ≥ 16 e Antigravity instalado (CLI e/ou IDE).
**Trigger:** `npm install -g @kognar/ksdd` com `KSDD_WITH_ANTIGRAVITY=1`, ou `ksdd install --antigravity` após instalação básica.

1. `parseArgs` detecta `--antigravity` (ou postinstall lê `KSDD_WITH_ANTIGRAVITY=1`)
2. `installClaude(tracked)` roda primeiro (sempre — paridade com fluxo atual)
3. Se `--codex` / `--opencode` também: rodam na ordem `installCodex → installOpencode`
4. `installAntigravity(tracked)` roda:
   - Resolve base: `process.env.ANTIGRAVITY_HOME || path.join(os.homedir(), '.gemini')`
   - `ensureDir(<base>/antigravity-cli/skills/)` e `ensureDir(<base>/antigravity/skills/)`
   - Para cada arquivo em `commands/*.md`: copia para **ambos** os dirs de skills como `ksdd-<basename>.md` (via `agentPromptBasename()`), adicionando os dois paths absolutos ao `tracked`
   - `ensureDir(<base>/ksdd/)` (bundle compartilhado)
   - `copyDir(references/, <base>/ksdd/references/, tracked)` + `copyDir(agents/, <base>/ksdd/agents/, tracked)`
   - `copyFile(README.md / INSTALL.md, <base>/ksdd/, tracked)`
   - Gera `<base>/ksdd/AGENTS.md` a partir de `references/antigravity-AGENTS.md`
5. `saveManifest({ targets: { claude, codex, opencode, antigravity } })`
6. Saída verde: "✓ KSDD instalado em Claude Code, Codex, opencode e Google Antigravity (N arquivos)."

**Sucesso:** Manifest tem 4 arrays preenchidos; `ls ~/.gemini/antigravity-cli/skills/ | grep ksdd` lista 9 arquivos (idem `~/.gemini/antigravity/skills/`).
**Erro / edge case:**
- Se `~/.gemini/` não existe (Antigravity não instalado): cria os diretórios mesmo assim (idempotente).
- Se erro de permissão em `~/.gemini/`: erro vermelho explícito, exit 1.
- Se postinstall: warning amarelo, exit 0 (não trava `npm install`).
- Se a superfície IDE (`~/.gemini/antigravity/skills/`) tiver path divergente do confirmado: dogfood/QA valida e ajusta antes do release (marcado `[verificar]`).

### 4.2 Adicionar Antigravity em instalação existente (Claude+Codex+opencode)

**Pré-condição:** `ksdd status` mostra Claude, Codex e opencode instalados.
**Trigger:** `ksdd install --antigravity` (sem outras flags).

1. `loadManifest()` carrega manifest atual
2. `installClaude()` re-roda (idempotente)
3. `installCodex()` / `installOpencode()` **não rodam** (sem flags) — instalações preservadas
4. `installAntigravity()` roda
5. `saveManifest()` preserva `targets.codex` e `targets.opencode` intocados, atualiza `targets.claude` e adiciona `targets.antigravity`
6. Saída: "✓ KSDD atualizado: Claude (N), Codex (M, preservado), opencode (K, preservado), Antigravity (J, novo)"

**Sucesso:** arquivos de Codex e opencode intactos; `~/.gemini/.../skills/ksdd-*.md` aparecem novos.
**Erro / edge case:** Se manifest aponta targets cujos arquivos foram deletados manualmente, preserva apenas o rastreado — não "ressuscita".

### 4.3 Uninstall completo cross-agent

**Pré-condição:** Manifest com os 4 arrays de targets preenchidos.
**Trigger:** `ksdd uninstall`.

1. `loadManifest()` carrega manifest
2. Para cada path em `targets.claude` + `targets.codex` + `targets.opencode` + `targets.antigravity`: `removePath(p)`
3. `pruneEmptyDirs()` em `~/.gemini/antigravity-cli/skills/`, `~/.gemini/antigravity/skills/`, `~/.gemini/ksdd/` (e os demais dos outros targets) — **nunca acima desses subdirs**
4. Apaga o próprio manifest
5. Saída: "✓ KSDD removido: N em Claude, M em Codex, K em opencode, J em Antigravity."

**Sucesso:** Nenhum arquivo KSDD nos 4 ecossistemas. `~/.gemini/` (compartilhado com gemini-cli) preservado fora dos subdirs KSDD.
**Erro / edge case:** Sem manifest, fallback por convenção remove paths padrão dos 4 targets — warning amarelo "modo fallback".

### 4.4 Status com 4 targets ativos

**Trigger:** `ksdd status`.

Saída esperada:
```
KSDD 0.9.0 — instalado em 2026-06-01T14:32:11Z

claude:      23 arquivos em ~/.claude/
codex:       19 arquivos em ~/.codex/ + ~/.agents/skills/ksdd/
opencode:    21 arquivos em ~/.config/opencode/
antigravity: 29 arquivos em ~/.gemini/ (CLI + IDE + bundle)
```

---

## 5. Impacto em Telas Existentes

**Não aplicável** — KSDD não tem UI (SPEC seção 7). Substitui-se por **Impacto em Superfícies de Interação:**

| Superfície (SPEC seção 7) | O que muda | Onde | Por quê |
|---|---|---|---|
| `ksdd install` (CLI) | nova flag `--antigravity`, combinável com `--codex`/`--opencode` | `bin/ksdd.js` parseArgs + main | quarto target precisa de opt-in explícito (paridade) |
| `ksdd uninstall` (CLI) | passa a iterar `targets.antigravity` | `bin/ksdd.js` uninstall | uninstall completo cross-agent |
| `ksdd status` (CLI) | nova linha "antigravity: N arquivos em ~/.gemini/" | `bin/ksdd.js` status | visibilidade do quarto target |
| `ksdd help` (CLI) | doc do `--antigravity` e `KSDD_WITH_ANTIGRAVITY` | `bin/ksdd.js` help text | descoberta da flag |
| Slash commands Claude/Codex/opencode | **inalterado** | n/a | content-only, agent-agnóstico |
| **NOVO:** Skills Antigravity CLI (`~/.gemini/antigravity-cli/skills/ksdd-*.md`) | nova superfície de invocação (TUI) | global Antigravity CLI | parte central da feature |
| **NOVO:** Skills Antigravity IDE (`~/.gemini/antigravity/skills/ksdd-*.md`) | nova superfície de invocação (IDE) | global Antigravity IDE | decisão "Ambos" — cobrir CLI e IDE |
| **NOVO:** Bundle Antigravity (`~/.gemini/ksdd/`) | references/agents/README/INSTALL/AGENTS bundlados | n/a | dar contexto canônico ao agente Antigravity |

### Telas Novas

Não aplicável (CLI). Equivalente: **arquivo novo `references/antigravity-AGENTS.md`** distribuído com o pacote, copiado para `~/.gemini/ksdd/AGENTS.md` no install. Conteúdo (~30 linhas): orienta o agente Antigravity a usar `./references/` e `./agents/` como contexto canônico e a respeitar os checkpoints obrigatórios (espelha `references/opencode-AGENTS.md`).

---

## 6. Impacto no Modelo de Dados

### 6.1 Novas Entidades

| Entidade | Atributos críticos | Relações |
|----------|--------------------|----------|
| `targets.antigravity` (array de paths em `.ksdd-manifest.json`) | strings — paths absolutos de arquivos instalados em `~/.gemini/` (CLI + IDE + bundle) | irmão de `targets.claude`/`codex`/`opencode` (SPEC seção 4.1, architecture seção 3.1) |
| `references/antigravity-AGENTS.md` (novo arquivo no pacote) | Markdown ~30 linhas, sem frontmatter especial | copiado pra `~/.gemini/ksdd/AGENTS.md` no install |

### 6.2 Alterações em Entidades Existentes

| Entidade (architecture seção 3.1) | Alteração | Migração |
|---|---|---|
| `.ksdd-manifest.json` schema | adiciona `targets.antigravity: string[]` | `normalizeManifest()` cria array vazio se ausente — sem migração manual |
| `references/` (diretório no pacote) | adiciona `antigravity-AGENTS.md` | nenhuma — arquivo novo |

Sem mudança nos artefatos gerados no projeto-alvo. Esta feature mexe **apenas na distribuição do pacote KSDD**.

---

## 7. Impacto na API

Não aplicável (sem servidor HTTP). Equivalente: **superfície CLI do `bin/ksdd.js`** (architecture seção 4).

### 7.1 Novas "rotas" CLI

```
ksdd install --antigravity                          # Claude + Antigravity
ksdd install --codex --opencode --antigravity       # os 4 targets
ksdd install --antigravity --quiet                  # idem, silenciado
```

Env vars novas (architecture seção 4.2):
- `KSDD_WITH_ANTIGRAVITY=1` — equivale a `--antigravity` no postinstall
- `ANTIGRAVITY_HOME` — override de `~/.gemini` (default)

### 7.2 "Endpoints" modificados

| Função interna (architecture seção 4.3) | Alteração |
|---|---|
| `parseArgs(argv)` | reconhece flag `--antigravity` |
| `main()` | dispara `installAntigravity()` quando flag ou env presentes |
| `installClaude()` / `installCodex()` / `installOpencode()` | **inalteradas** |
| **NOVA:** `installAntigravity(tracked, out)` | adaptada de `installOpencode` — copia commands `ksdd-*` para `~/.gemini/antigravity-cli/skills/` E `~/.gemini/antigravity/skills/`, bundla references/agents em `~/.gemini/ksdd/`, gera `AGENTS.md` |
| `agentPromptBasename(file)` | **reuso** (já generalizado na feature opencode) — sem alteração |
| `normalizeManifest(m)` | reconhece manifest sem `targets.antigravity` e cria array vazio |
| `uninstall()` (em `main()`) | itera os 4 arrays de targets |
| `status()` | imprime linha de `targets.antigravity` |
| `pruneEmptyDirs(root)` | **inalterada** — chamadas adicionais pros paths Antigravity |

---

## 8. Impacto no Design

Não aplicável (CLI sem UI). Impacto em **tom da saída CLI** (SPEC seção 3):

- Nova string verde em sucesso: "✓ KSDD instalado em Claude Code, Codex, opencode e Google Antigravity (N arquivos)."
- Nova string em `ksdd status`: linha `antigravity: N arquivos em ~/.gemini/`
- Nova string em `ksdd help`: doc do `--antigravity` e exemplo `KSDD_WITH_ANTIGRAVITY=1 npm install -g @kognar/ksdd`
- Cores ANSI seguem convenção existente (SPEC seção 3.2), respeita `NO_COLOR`.

---

## 9. Dependências e Riscos

### 9.1 Dependências

| Tipo | Dependência | Status | Impacto se bloqueada |
|------|-------------|--------|----------------------|
| Técnica | Convenção de paths Antigravity CLI (`~/.gemini/antigravity-cli/skills/`) | Confirmado via guias da comunidade (docs oficiais antigravity.google são JS-rendered) | Alto — se mudar, retrabalho de paths |
| Técnica | Convenção de path IDE (`~/.gemini/antigravity/skills/`) | `[verificar]` — fontes da comunidade divergem; confirmar no dogfood | Médio — pode ajustar antes do release |
| Técnica | Skill = arquivo `.md` em `skills/` vira `/nome` na TUI/IDE | Confirmado nas docs/guias | Alto — feature inteira assume isso |
| Técnica | Antigravity aceita skills Markdown puros (sem `openai.yaml` obrigatório) | Confirmado — `openai.yaml` é opcional p/ metadados ricos | Médio — se exigir, escopo cresce (gerar yaml por command) |
| Técnica | `ANTIGRAVITY_HOME`/base fixa em `~/.gemini/` | `[verificar]` — assumir `~/.gemini` + criar env de override KSDD-side | Baixo — fallback aceitável |
| Negócio | Mantenedor concorda com bump v0.9.0 e com ADR-011 (adiar refator) | Decidido no checkpoint (escolhas: hardcoded + ambos + minor) | Baixo |
| Feature | Reuso de `agentPromptBasename()` (entregue na feature opencode) | Disponível em `bin/ksdd.js` | Baixo |

### 9.2 Riscos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Path IDE (`~/.gemini/antigravity/skills/`) diferente do assumido | Médio | Média | Marcado `[verificar]`; dogfood/QA confirma e ajusta antes do release; `ANTIGRAVITY_HOME` permite override |
| Antigravity muda convenção de paths antes de release wide (produto recente) | Alto | Média | Documentar versão suportada no README; override via env |
| Commands KSDD assumem comportamentos Claude-específicos (`view`/`create_file`, `ask_user_input_v0`) que Antigravity não tem | Médio | Média | Validar no dogfood (task QA); se algum command precisar adaptação, escopo cresce — risco aceito |
| Duplicação `installOpencode`/`installAntigravity` (4ª cópia) aumenta dívida técnica | Médio | Alta (esperada) | ADR-011 documenta gatilho firme: refator `installTarget` vira feature dedicada antes do 5º target |
| `uninstall` apaga `~/.gemini/commands/` (compartilhado com `gsd`) ou `~/.gemini/` | Alto | Baixa | Remover/prune só o namespace `commands/ksdd/` e o bundle `ksdd/` — nunca `commands/` nem `~/.gemini/`. **Validado em QA: `commands/gsd/` preservado após uninstall.** |
| Duas superfícies (CLI+IDE) dobram a superfície de QA e risco de divergência | Médio | Média | Mesma lógica de cópia pros dois dirs; QA cobre ambos; se IDE divergir, isolar numa sub-função |
| Usuário sem Antigravity roda `--antigravity` e fica confuso | Baixo | Média | Cria diretórios mesmo assim (idempotente); README explica |
| Windows: `~/.gemini/` e subpaths podem divergir | Médio | Média | `[verificar]` no dogfood; `ANTIGRAVITY_HOME` permite override |
| Colisão com skill builtin Antigravity de mesmo nome | Baixo | Baixa | Prefixo `ksdd-` evita colisão (estratégia já validada com Codex/opencode) |
| Bundle duplicado se cada superfície exigir seu próprio (`references` relativo) | Baixo | Média | Default = bundle único em `~/.gemini/ksdd/`; fallback bundle-por-superfície documentado na task |

---

## 10. Critérios de Aceite

- [ ] `ksdd install --antigravity` registra 9 commands TOML em `~/.gemini/commands/ksdd/` (incluindo `new/feature.toml`, `build/feature.toml`, `build/all.toml` aninhados) + bundle em `~/.gemini/ksdd/{commands,references,agents,README.md,INSTALL.md,AGENTS.md}` sem warnings em macOS/Linux (Node ≥ 16); cada `/ksdd:*` aparece e invoca no Antigravity.
- [ ] `ksdd install --codex --opencode --antigravity` instala os 4 targets de uma vez; manifest contém os 4 arrays preenchidos com paths absolutos.
- [ ] `KSDD_WITH_ANTIGRAVITY=1 npm install -g .` (postinstall) instala Claude + Antigravity com warning yellow em caso de falha (não quebra `npm install`).
- [ ] `KSDD_WITH_CODEX=1 KSDD_WITH_OPENCODE=1 KSDD_WITH_ANTIGRAVITY=1 npm install -g .` instala os 4 targets.
- [ ] `ksdd install` (sem flags) **não** modifica `~/.codex/`, `~/.config/opencode/` nem `~/.gemini/` se já estavam instalados (preservação testada).
- [ ] `ksdd uninstall` remove todos os arquivos rastreados nos 4 targets sem deixar lixo em `~/.gemini/`; arquivos não-KSDD em `~/.gemini/` (ex: config do gemini-cli) são preservados.
- [ ] `ksdd uninstall` em modo fallback (sem manifest) remove paths Antigravity por convenção também, com warning amarelo.
- [ ] `ksdd status` imprime linha `antigravity: N arquivos em ~/.gemini/` quando `targets.antigravity` é não-vazio, e omite quando vazio.
- [ ] `ksdd help` documenta `--antigravity`, `KSDD_WITH_ANTIGRAVITY` e `ANTIGRAVITY_HOME`.
- [ ] Reinstalação (`ksdd install --antigravity` 2x seguidas) é idempotente — manifest igual, sem arquivos duplicados.
- [ ] `normalizeManifest()` lê manifest antigo sem `targets.antigravity` e cria array vazio sem erro.
- [ ] `ANTIGRAVITY_HOME=/tmp/fake-gemini ksdd install --antigravity` instala sob `/tmp/fake-gemini/` (override respeitado).
- [ ] Manifest schema versionado com `version: "0.9.0"`.
- [ ] `package.json` bumped para `0.9.0`.
- [ ] `CHANGELOG.md` documenta a nova feature em seção dedicada com data, link pra Antigravity e exemplo de uso.
- [ ] `README.md` lista 4 agentes suportados (Claude, Codex, opencode, Antigravity) na tabela principal e no quick start.
- [ ] `INSTALL.md` (no pacote) lista paths de Antigravity (CLI + IDE) e explica o bundle em `~/.gemini/ksdd/`.
- [ ] `architecture.md` ganha ADR-011 explícito (4ª cópia + gatilho do refator) e atualiza ADR-010 com nota de continuidade.
- [ ] `architecture.md` seção 1 (diagrama), seção 12 (roadmap Fase 5) e seção 11 (riscos) atualizadas pra incluir Antigravity.
- [ ] `SPEC.md` seções 7.1 (comandos CLI) e 13 (fluxos) referenciam `--antigravity` e o fluxo correspondente.
- [ ] `references/antigravity-AGENTS.md` existe no pacote com ~20-40 linhas explicando contexto ao agente Antigravity.
- [ ] Dogfood: mantenedor instala Antigravity local, roda `ksdd install --antigravity`, invoca `/ksdd-start` em projeto-teste (TUI e/ou IDE), e confirma fluxo de perguntas + geração de brainstorm.md com saída equivalente a Claude/opencode (smoke test ≥ 1 command de geração). Path IDE confirmado e ajustado se necessário.
- [ ] QA cross-platform: install/uninstall validados em macOS e Linux. Windows marcado `[verificar]` se não validado.

---

## 11. Fases de Implementação

### Fase 1 — Núcleo do instalador (P0)

- [ ] Adicionar `installAntigravity()` em `bin/ksdd.js` (adaptação de `installOpencode`, copiando pros dois dirs de skills)
- [ ] Adicionar flag `--antigravity` em `parseArgs` e `main()`
- [ ] Adicionar env vars `KSDD_WITH_ANTIGRAVITY` e `ANTIGRAVITY_HOME`
- [ ] Estender `normalizeManifest()`, `uninstall()`, `status()`, `pruneEmptyDirs` para `targets.antigravity`
- [ ] Criar `references/antigravity-AGENTS.md` (template novo)
- [ ] Bundle de references/agents/README/INSTALL pra `~/.gemini/ksdd/`

### Fase 2 — Docs e arquitetura (P0)

- [ ] Atualizar `README.md`, `INSTALL.md`, `CHANGELOG.md`, `package.json` (0.9.0)
- [ ] Adicionar ADR-011 em `architecture.md`, atualizar ADR-010, diagrama, roadmap Fase 5 e riscos
- [ ] Atualizar `SPEC.md` seções 7.1 e 13 (referência a Antigravity)

### Fase 3 — Dogfood + QA (P0)

- [ ] Dogfood + QA smoke test em macOS e Linux; confirmar path IDE; `QA-REPORT.md`

---

**Referências:**
- `.ksdd/specs/SPEC.md` — seções 4.1 (manifest), 7.1 (comandos CLI), 11 (comportamentos), 13 (fluxos), 14 (fases — Fase 5 multi-agent)
- `.ksdd/specs/architecture.md` — seções 1 (visão/diagrama), 3.1 (manifest schema), 4 (CLI), 10 (ADRs — adiciona ADR-011, atualiza ADR-010), 11 (riscos), 12 (roadmap — Fase 5)
- `.ksdd/features/FEATURE-opencode-integration.md` — precedente direto (terceiro target); estrutura de tasks, bump de versão, padrão de `installX`/manifest/AGENTS.md
- `.ksdd/features/FEATURE-archive-features.md` — precedente de feature cross-cutting em `bin/ksdd.js` e templates
- Docs externas: https://antigravity.google/docs/rules-workflows · https://antigravity.google/docs/cli-features (paths e formato de skills/workflows)
