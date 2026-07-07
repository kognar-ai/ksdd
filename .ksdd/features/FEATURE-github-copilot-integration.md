# Feature: Integração com GitHub Copilot (quinto target após Claude Code, Codex, opencode e Antigravity)

> Suporte ao [GitHub Copilot](https://github.com/features/copilot) como quinto target de instalação do KSDD — `ksdd install --copilot` distribui os 9 slash commands como **prompt files** (`ksdd-*.prompt.md`) no diretório de perfil global do usuário do VS Code, mais uma **chat mode** (`ksdd.chatmode.md`) de contexto canônico, com opção `--project` para instalar em `.github/prompts/` do repo-alvo e um placeholder para o Copilot CLI (`~/.copilot/`). Mantém o pacote zero-deps e o manifest unificado. Adicionado como **quinta cópia hardcoded** (`installCopilot`), com ADR-012 registrando o adiamento consciente — outra vez — do refator `installTarget` genérico previsto no ADR-010/ADR-011.

**Slug:** github-copilot-integration
**Prioridade:** Alta
**Status:** Rascunho
**Data:** 07/07/2026
**Projeto:** KSDD — Kognar Spec-Driven Design & Development

---

## 1. Motivação

### 1.1 Problema / Oportunidade

A Fase 5 do roadmap (SPEC seção 14, architecture seção 12) é "Multi-agent: suporte a mais agentes". Já entregamos Codex (v0.4.0), opencode (v0.8.0) e Google Antigravity (v0.9.0). O **GitHub Copilot** é, de longe, o assistente de código com maior base instalada — e desde 2025 ganhou o mecanismo que faltava para o KSDD: **prompt files** (`*.prompt.md`), o análogo direto dos slash commands. Um prompt file no VS Code vira um comando `/nome` invocável no Copilot Chat, exatamente o mesmo modelo de Claude Code, Codex, opencode e Antigravity. Hoje quem usa Copilot precisa copiar manualmente os arquivos do repo KSDD para a pasta certa — o mesmo atrito que motivou os quatro targets anteriores, agravado pelo tamanho do público.

Três dores concretas, paralelas às dos targets anteriores:

1. **Pacote KSDD ignora o maior agente do mercado.** README diz "Claude Code, Codex, opencode e Antigravity" — o usuário de Copilot, que é o maior contingente, não aparece. Adicionar Copilot com paridade (mesmos 9 commands, mesmos templates) honra o posicionamento "agente-agnóstico, conteúdo distribuído" e é o target de maior alcance potencial.
2. **Custo de oportunidade vs. refator (de novo).** O ADR-010 prometeu o refator `installTarget(targetConfig)` genérico antes do 4º target; o ADR-011 reiterou o adiamento e fixou o gatilho "feature dedicada antes do 5º target". Copilot **é** o 5º target — então, por regra, o refator deveria vir antes. Porém o mantenedor decidiu (ver ADR-012) entregar Copilot como **quinta cópia hardcoded** para capturar o alcance do maior público antes de pagar a dívida. Trade-off explícito e documentado; o refator continua sendo feature dedicada, agora com gatilho reforçado (ver seção 2.2 e ADR-012).
3. **Mecanismo novo, não idêntico aos anteriores.** Diferente de Codex/opencode/Antigravity — que usam um único diretório global fixo (`~/.codex/`, `~/.config/opencode/`, `~/.gemini/`) — o Copilot distribui slash commands por **prompt files** cujo diretório de perfil do usuário do VS Code é **OS-específico** (`~/Library/Application Support/Code/User/prompts/` no macOS, `~/.config/Code/User/prompts/` no Linux, `%APPDATA%\Code\User\prompts\` no Windows) e sincronizável via Settings Sync. Além disso, o Copilot CLI **ainda não** suporta comandos custom ([copilot-cli#618](https://github.com/github/copilot-cli/issues/618), [#1113](https://github.com/github/copilot-cli/issues/1113)). Isso introduz uma nova exigência técnica — resolução de path por SO — que não existia nos targets anteriores e é o principal ponto de atenção da feature.

O `git log` da v0.9.0 (commits do Antigravity) mostra que a cópia hardcoded ficou em ~250 linhas em `bin/ksdd.js`. Copilot adiciona a resolução de path por SO e até quatro superfícies (prompt files user-profile, chat mode, `.github/prompts` project-scoped, CLI placeholder), o que aumenta a lógica de cópia mas não a complexidade conceitual — o núcleo continua "copiar N arquivos Markdown para diretórios convencionais e rastrear no manifest".

### 1.2 Personas Impactadas

- **Marina (Product Designer / PM solo) — SPEC seção 2.1:** provavelmente já usa VS Code + Copilot no dia a dia. Passa a ter o fluxo KSDD (`/ksdd-start` → `/ksdd-spec` → ...) dentro do agente que ela já tem aberto, sem trocar de ferramenta nem manter cópias paralelas dos artefatos.
- **Rafa (Founder técnico solo) — SPEC seção 2.2:** Copilot é o assistente default de grande parte dos devs solo. O pitch "spec-driven sem SaaS, sem lock-in" passa a cobrir o agente que ele mais provavelmente já paga. Reduz drasticamente a fricção de adoção.
- **Lia (Tech lead em agência) — SPEC seção 2.3:** a maioria dos clientes corporativos padroniza em GitHub Copilot (compliance, GitHub Enterprise). Suporte destrava esses clientes sem mudar o entregável (mesmos 4 artefatos Markdown) e sem forçar o cliente a adotar um agente menos comum.

### 1.3 Métricas de Sucesso

| Métrica | Meta | Prazo |
|---------|------|-------|
| `ksdd install --copilot` instala os 9 commands como `ksdd-*.prompt.md` no diretório de perfil do VS Code correto por SO (macOS/Linux/Windows, Node ≥ 16) sem warnings | 100% | imediato pós-release |
| Manifest pós-install contém `targets.copilot` com paths absolutos corretos (prompt files + chat mode + bundle) | 100% | imediato |
| `ksdd uninstall` remove todos os arquivos rastreados de `targets.copilot` sem deletar prompt files não-KSDD nem outros arquivos do diretório `User/` do VS Code | 100% | imediato |
| `ksdd status` exibe linha "copilot: N arquivos" quando há instalação ativa | 100% | imediato |
| Slash commands invocáveis no Copilot Chat via `/ksdd-start`, `/ksdd-new-feature`, etc., com saída funcional equivalente a Claude Code | 9/9 commands | imediato |
| README declara "Suporta Claude Code, OpenAI Codex, opencode, Google Antigravity e GitHub Copilot" e tabela de paths atualizada | confirmado | imediato |
| Issues abertas no GitHub sobre "uso com Copilot" em 3 meses pós-release | ≥ 5 (maior público → meta mais alta que os targets anteriores) | 3 meses |

---

## 2. Escopo

### 2.1 O que entra (v1)

- **Nova flag `--copilot`** em `ksdd install`. Combinável com `--codex`, `--opencode` e `--antigravity` (ex: `ksdd install --codex --opencode --antigravity --copilot` instala os 5 targets de uma vez).
- **Nova env var `KSDD_WITH_COPILOT=1`** equivalente à flag, lida pelo postinstall (espelha `KSDD_WITH_CODEX` / `KSDD_WITH_OPENCODE` / `KSDD_WITH_ANTIGRAVITY`).
- **Nova env var `COPILOT_HOME`** para override do diretório base de perfil do VS Code (default OS-específico, ver abaixo). Espelha `CODEX_HOME` / `OPENCODE_HOME` / `ANTIGRAVITY_HOME`. Cobre VS Code Insiders, instalações portáteis e paths não-padrão.
- **Nova sub-flag `--project`** (só válida junto de `--copilot`): instala os prompt files/chat mode em `.github/prompts/` e `.github/chatmodes/` do **diretório de trabalho atual** (repo-alvo) em vez do perfil global. Habilita o modelo project-scoped nativo do Copilot sem abandonar o default global.
- **Nova função `installCopilot(tracked, out)`** em `bin/ksdd.js`, escrita como **cópia adaptada** de `installAntigravity` (ADR-012 documenta a decisão de adiar de novo o refator `installTarget` genérico).
- **Resolução de path por SO (novidade técnica desta feature)** — helper `resolveVscodeUserDir()`:
  ```
  base (VS Code stable User dir):
    macOS   : ~/Library/Application Support/Code/User/
    Linux   : ~/.config/Code/User/
    Windows : %APPDATA%\Code\User\
  override: COPILOT_HOME aponta para o <...>/Code/User (KSDD anexa prompts/, ksdd/)
  ```
  `[verificar no dogfood]` os paths exatos por SO e o comportamento com VS Code Insiders (`Code - Insiders`). `COPILOT_HOME` é o escape hatch.
- **Quatro superfícies, instaladas por `--copilot`** (todas em v1; a de perfil global é o núcleo P0, as demais são P1 — ver seção 11):
  ```
  <vscode-user>/                     # resolvido por SO (ou COPILOT_HOME)
  ├── prompts/                       # PROMPT FILES (global, núcleo P0)
  │   ├── ksdd-start.prompt.md       # vira /ksdd-start no Copilot Chat
  │   ├── ksdd-spec.prompt.md
  │   ├── ksdd-tech.prompt.md
  │   ├── ksdd-design.prompt.md
  │   ├── ksdd-new-feature.prompt.md
  │   ├── ksdd-build-feature.prompt.md
  │   ├── ksdd-build-all.prompt.md
  │   ├── ksdd-setup.prompt.md
  │   ├── ksdd-archive.prompt.md
  │   └── ksdd.chatmode.md           # CHAT MODE de contexto canônico (P1)
  └── ksdd/                          # bundle auxiliar compartilhado (uma cópia)
      ├── references/                # cópia de references/ do pacote
      ├── agents/                    # cópia de agents/ do pacote
      ├── README.md                  # do pacote
      ├── INSTALL.md                 # do pacote
      └── AGENTS.md                  # NOVO — gerado de references/copilot-AGENTS.md

  ~/.copilot/                        # COPILOT CLI (placeholder P1)
  └── prompts/
      └── ksdd-*.prompt.md (9)       # antecipando copilot-cli#618/#1113; inócuo hoje

  <cwd>/.github/                     # PROJECT-SCOPED (opt-in --project, P1)
  ├── prompts/
  │   └── ksdd-*.prompt.md (9)
  └── chatmodes/
      └── ksdd.chatmode.md
  ```
  > **Nota tática (resolver na task de instalador):** o bundle (`references/agents/README/INSTALL/AGENTS.md`) é copiado **uma vez** para `<vscode-user>/ksdd/` e referenciado pelos prompt files/chat mode. No modo `--project`, o contexto canônico vive na chat mode + `.github/` do próprio repo; não duplicar o bundle inteiro no projeto (decisão na task, com fallback documentado).
- **Naming de commands:** reusa `agentPromptBasename()` (`:` → `-`, prefixo `ksdd-`) e **anexa o sufixo `.prompt.md`** exigido pelo Copilot (helper fino `copilotPromptBasename()` ou adaptação inline — decisão na task). Comandos ficam invocáveis como `/ksdd-start`, `/ksdd-new-feature`, etc. A chat mode usa o sufixo `.chatmode.md` (arquivo único `ksdd.chatmode.md`).
- **`ksdd.chatmode.md` (chat mode de contexto canônico)** — gerado a partir do template novo `references/copilot-AGENTS.md`, curto (~30-40 linhas com frontmatter de chat mode), que orienta o Copilot sobre:
  - Onde estão os templates canônicos (`./references/` no bundle) e os agents auxiliares (`./agents/`)
  - Que os prompt files `ksdd-*.prompt.md` esperam esse contexto
  - Convenção de aprovação obrigatória nos checkpoints (espelha `references/opencode-AGENTS.md` / `antigravity-AGENTS.md`, adaptado ao formato de chat mode do Copilot)
- **`AGENTS.md` no bundle (`<vscode-user>/ksdd/AGENTS.md`)** — gerado do mesmo `references/copilot-AGENTS.md`, papel idêntico ao dos outros bundles.
- **Manifest com `targets.copilot`:**
  ```json
  {
    "version": "0.10.0",
    "installedAt": "ISO-8601",
    "pkgRoot": "/path/do/pacote",
    "targets": {
      "claude": [...],
      "codex":  [...],
      "opencode": [...],
      "antigravity": [...],
      "copilot": [...]   // NOVO — array de paths absolutos (todas superfícies instaladas + bundle)
    }
  }
  ```
  `normalizeManifest()` atualizado para tratar manifest legado sem `targets.copilot` (cria array vazio).
- **`ksdd uninstall`** estendido: remove tudo em `targets.copilot`, faz `pruneEmptyDirs()` **apenas** em `<vscode-user>/prompts/` (se vazio), `<vscode-user>/ksdd/`, `~/.copilot/prompts/` e `<cwd>/.github/prompts|chatmodes/` (project). **Pruning nunca sobe além desses subdirs** — `<vscode-user>/` é compartilhado com toda a config do VS Code (risco explícito, ver seção 9.2).
- **`ksdd status`** exibe nova linha `copilot: N arquivos em <vscode-user>/prompts/ (+ CLI/project se presentes)` quando `targets.copilot` é não-vazio.
- **`ksdd install` sem `--copilot` preserva instalação Copilot anterior** — não deleta prompt files KSDD já instalados. Espelha o comportamento dos outros targets (SPEC seção 11).
- **README + INSTALL + CHANGELOG atualizados:**
  - Tabela de targets passa a ter 5 linhas/colunas (Claude, Codex, opencode, Antigravity, Copilot) com paths por SO
  - Seção "Instalação seletiva" lista `--copilot` e `--copilot --project`
  - Exemplo de `KSDD_WITH_COPILOT=1 npm install -g @kognar/ksdd`
  - Nota explícita: Copilot CLI ainda não consome comandos custom (link para copilot-cli#618/#1113); prompt files funcionam no VS Code Copilot Chat
  - CHANGELOG documenta a nova versão (bump minor v0.10.0 — nova capacidade backwards-compatible)
- **`package.json` bump** para `0.10.0`.
- **Dogfood:** após release local, o mantenedor roda `ksdd install --copilot` num ambiente com VS Code + Copilot e valida que pelo menos `/ksdd-start` e `/ksdd-spec` rodam ponta-a-ponta no Copilot Chat, confirmando o path de perfil por SO.
- **ADR-012 em `architecture.md`:** registra "Quinto target hardcoded; adiamento consciente (outra vez) do refator `installTarget` genérico previsto no ADR-010/ADR-011". Atualiza ADR-011 com nota de continuidade e reforça o gatilho do refator.

### 2.2 O que fica pra depois

- **Refator `installTarget(targetConfig)` genérico** — continua **feature dedicada**. ADR-012 reforça o gatilho: agora com **5 funções `install*` duplicadas**, o refator vira pré-requisito **inescapável** antes do 6º target (Cursor/Windsurf/Cline). Tentar refatorar dentro desta feature dobraria o escopo e atrasaria a captura do maior público.
- **Copilot CLI com comandos custom de verdade** — hoje o CLI ignora prompt files ([copilot-cli#618](https://github.com/github/copilot-cli/issues/618), [#1113](https://github.com/github/copilot-cli/issues/1113)). A v1 só deixa o placeholder pronto em `~/.copilot/prompts/`; quando o CLI passar a suportar, a superfície já estará populada. Ativar/validar de fato fica pra follow-up.
- **`.github/copilot-instructions.md` gerenciado pelo KSDD** — a chat mode já cobre o contexto canônico; instructions de repositório inteiro são otimização opcional pós-v1 (e são project-scoped, mais invasivas).
- **Metadados ricos por prompt file** (`mode:`, `tools:`, `model:` no frontmatter de cada `.prompt.md`) — os 9 commands funcionam como Markdown puro → `/nome`; frontmatter avançado por command é otimização pós-v1.
- **Detecção de VS Code Insiders / múltiplos perfis** automática — v1 assume o perfil default (`Code/User`); Insiders e perfis nomeados via `COPILOT_HOME` override. Auto-detecção fica pra depois.
- **Suporte a Cursor, Windsurf, Cline** — restante da Fase 5; depende do refator `installTarget` (agora obrigatório antes do 6º target).
- **`ksdd doctor`** cross-agent — nice-to-have, fora de escopo.
- **Telemetria de target mais usado** — viola "sem telemetria" (SPEC seção 12). Fora de escopo permanente.

### 2.3 O que NÃO é essa feature

- **Não é o refator do instalador.** Cópia adaptada de `installAntigravity` é proposital — duplicação aceita sob ADR-012 com gatilho reforçado (refator inescapável antes do 6º target).
- **Não é mudança nos commands em si.** Os 9 arquivos em `commands/*.md` permanecem idênticos; só a distribuição muda (rename para `.prompt.md`). Adaptação Copilot-específica de um command seria task separada (e sinal de acoplamento indevido a Claude).
- **Não é mudança nos templates em `references/`.** Templates são agent-agnósticos; reuso direto. O único arquivo novo em `references/` é `copilot-AGENTS.md` (contexto/chat mode pro agente).
- **Não é setup automático do VS Code nem do Copilot.** KSDD não instala VS Code nem a extensão Copilot; assume que o usuário já tem.
- **Não é ativação do Copilot CLI.** A superfície CLI é um placeholder inócuo até o suporte upstream existir.

---

## 3. User Stories

| # | Como... | Quero... | Para... |
|---|---------|----------|---------|
| US-01 | Marina (PM usando VS Code + Copilot) | rodar `npm install -g @kognar/ksdd && ksdd install --copilot` | ter os 9 commands KSDD como `/ksdd-*` no Copilot Chat sem copiar arquivo manualmente |
| US-02 | Rafa (founder no VS Code) | `KSDD_WITH_COPILOT=1 npm install -g @kognar/ksdd` no setup do laptop | postinstall já configurar tudo automaticamente sem comando extra |
| US-03 | Lia (tech lead com clientes em Copilot Enterprise) | `ksdd install --copilot --project` num repo de cliente | entregar os prompt files versionados em `.github/prompts/` do próprio repo |
| US-04 | Lia | `ksdd install --codex --opencode --antigravity --copilot` num único comando | atender clientes em ecossistemas diferentes sem reinstalar |
| US-05 | qualquer mantenedor | `ksdd status` mostrar quais targets estão ativos (incluindo copilot) | saber o estado da instalação sem inspecionar 5 diretórios |
| US-06 | qualquer usuário | `ksdd uninstall` remover tudo de uma vez | desinstalação completa sem deixar órfãos no `User/` do VS Code |
| US-07 | usuário Copilot | invocar `/ksdd-start` no Copilot Chat com a mesma experiência que em Claude/Codex/opencode/Antigravity | não aprender fluxos diferentes por agente |
| US-08 | usuário que já tinha KSDD (Claude+Codex+opencode+Antigravity) | rodar `ksdd install --copilot` sem outras flags | adicionar Copilot sem perder os targets anteriores |
| US-09 | usuário de macOS/Windows | que o instalador resolva o path de perfil do VS Code do meu SO | não ter que descobrir onde o VS Code guarda prompt files |
| US-10 | contribuidor lendo `bin/ksdd.js` | ver ADR-012 claro no architecture.md sobre a 5ª cópia e o gatilho reforçado do refator | entender por que `installCopilot` é cópia de `installAntigravity` e quando o refator finalmente acontece |

---

## 4. Fluxos de Uso

### 4.1 Instalação fresca incluindo Copilot (cenário primário)

**Pré-condição:** Usuário tem Node ≥ 16 e VS Code + extensão Copilot instalados.
**Trigger:** `npm install -g @kognar/ksdd` com `KSDD_WITH_COPILOT=1`, ou `ksdd install --copilot` após instalação básica.

1. `parseArgs` detecta `--copilot` (ou postinstall lê `KSDD_WITH_COPILOT=1`)
2. `installClaude(tracked)` roda primeiro (sempre — paridade com fluxo atual)
3. Se `--codex` / `--opencode` / `--antigravity` também: rodam na ordem `installCodex → installOpencode → installAntigravity`
4. `installCopilot(tracked)` roda:
   - Resolve base via `resolveVscodeUserDir()` (`COPILOT_HOME` override → senão path OS-específico)
   - `ensureDir(<base>/prompts/)`
   - Para cada arquivo em `commands/*.md`: copia para `<base>/prompts/` como `ksdd-<basename>.prompt.md`, adicionando o path absoluto ao `tracked`
   - Gera `<base>/prompts/ksdd.chatmode.md` a partir de `references/copilot-AGENTS.md` (P1)
   - `ensureDir(<base>/ksdd/)` (bundle): `copyDir(references/)`, `copyDir(agents/)`, `copyFile(README.md/INSTALL.md)`, gera `AGENTS.md`
   - Placeholder CLI (P1): `ensureDir(~/.copilot/prompts/)` + copia os 9 `ksdd-*.prompt.md`
5. `saveManifest({ targets: { claude, codex, opencode, antigravity, copilot } })`
6. Saída verde: "✓ KSDD instalado em Claude Code, ..., e GitHub Copilot (N arquivos)."

**Sucesso:** Manifest tem 5 arrays preenchidos; `ls <vscode-user>/prompts/ | grep ksdd` lista 9 `.prompt.md` + a chat mode.
**Erro / edge case:**
- Se `<vscode-user>/` não existe (VS Code não instalado): cria os diretórios mesmo assim (idempotente) — warning amarelo sugerindo `COPILOT_HOME` se o path parecer errado.
- Se erro de permissão: erro vermelho explícito, exit 1.
- Se postinstall: warning amarelo, exit 0 (não trava `npm install`).
- Se o path de perfil por SO divergir do assumido: dogfood/QA valida e ajusta; `COPILOT_HOME` é o override.

### 4.2 Instalação project-scoped (`--project`)

**Pré-condição:** Usuário no diretório de um repo Git com Copilot habilitado.
**Trigger:** `ksdd install --copilot --project`.

1. `installClaude()` roda (paridade)
2. `installCopilot()` detecta `args.project === true`
3. Em vez do perfil global, resolve base = `<cwd>/.github/`
4. `ensureDir(<cwd>/.github/prompts/)` + copia os 9 `ksdd-*.prompt.md`
5. `ensureDir(<cwd>/.github/chatmodes/)` + gera `ksdd.chatmode.md`
6. `saveManifest()` com esses paths em `targets.copilot`
7. Saída verde: "✓ KSDD instalado em .github/ do projeto (N arquivos)."

**Sucesso:** `.github/prompts/ksdd-*.prompt.md` versionáveis no repo; comandos disponíveis pra qualquer colaborador que abrir o repo no VS Code.
**Erro / edge case:** cwd não é repo Git → instala mesmo assim (warning informativo); o usuário decide versionar ou não.

### 4.3 Adicionar Copilot em instalação existente

**Pré-condição:** `ksdd status` mostra outros targets instalados.
**Trigger:** `ksdd install --copilot` (sem outras flags).

1. `loadManifest()` carrega manifest atual
2. `installClaude()` re-roda (idempotente)
3. `installCodex()` / `installOpencode()` / `installAntigravity()` **não rodam** — instalações preservadas
4. `installCopilot()` roda
5. `saveManifest()` preserva os outros targets intocados, atualiza `targets.claude` e adiciona `targets.copilot`
6. Saída: "✓ KSDD atualizado: Claude (N), ..., Copilot (J, novo)"

**Sucesso:** arquivos dos outros targets intactos; prompt files Copilot novos.
**Erro / edge case:** manifest aponta arquivos deletados manualmente → preserva só o rastreado, não "ressuscita".

### 4.4 Uninstall completo cross-agent

**Pré-condição:** Manifest com os 5 arrays de targets preenchidos.
**Trigger:** `ksdd uninstall`.

1. `loadManifest()` carrega manifest
2. Para cada path nos 5 arrays de targets: `removePath(p)`
3. `pruneEmptyDirs()` **apenas** em `<vscode-user>/prompts/` (se ficou vazio de KSDD e vazio no geral), `<vscode-user>/ksdd/`, `~/.copilot/prompts/`, `<cwd>/.github/prompts|chatmodes/` — **nunca acima**
4. Apaga o próprio manifest
5. Saída: "✓ KSDD removido: ... , J em Copilot."

**Sucesso:** Nenhum arquivo KSDD nos 5 ecossistemas; prompt files não-KSDD e config do VS Code preservados.
**Erro / edge case:** Sem manifest, fallback por convenção remove paths padrão dos 5 targets (incluindo resolução de path por SO do Copilot) — warning amarelo "modo fallback".

### 4.5 Status com 5 targets ativos

**Trigger:** `ksdd status`.

Saída esperada:
```
KSDD 0.10.0 — instalado em 2026-07-07T14:32:11Z

claude:      23 arquivos em ~/.claude/
codex:       19 arquivos em ~/.codex/ + ~/.agents/skills/ksdd/
opencode:    21 arquivos em ~/.config/opencode/
antigravity: 29 arquivos em ~/.gemini/ (CLI + IDE + bundle)
copilot:     20 arquivos em ~/Library/.../Code/User/ (prompts + chat mode + bundle)
```

---

## 5. Impacto em Telas Existentes

**Não aplicável** — KSDD não tem UI (SPEC seção 7). Substitui-se por **Impacto em Superfícies de Interação:**

| Superfície (SPEC seção 7) | O que muda | Onde | Por quê |
|---|---|---|---|
| `ksdd install` (CLI) | novas flags `--copilot` e `--project`, combináveis com os outros targets | `bin/ksdd.js` parseArgs + main | quinto target precisa de opt-in explícito (paridade) |
| `ksdd uninstall` (CLI) | passa a iterar `targets.copilot` | `bin/ksdd.js` uninstall | uninstall completo cross-agent |
| `ksdd status` (CLI) | nova linha "copilot: N arquivos em <vscode-user>/" | `bin/ksdd.js` status | visibilidade do quinto target |
| `ksdd help` (CLI) | doc de `--copilot`, `--project`, `KSDD_WITH_COPILOT`, `COPILOT_HOME` | `bin/ksdd.js` help text | descoberta das flags |
| Slash commands Claude/Codex/opencode/Antigravity | **inalterado** | n/a | content-only, agent-agnóstico |
| **NOVO:** Prompt files Copilot user-profile (`<vscode-user>/prompts/ksdd-*.prompt.md`) | nova superfície de invocação (VS Code Copilot Chat) | global VS Code User dir | núcleo da feature (P0) |
| **NOVO:** Chat mode Copilot (`<vscode-user>/prompts/ksdd.chatmode.md`) | contexto canônico como chat mode | global VS Code | dá contexto ao Copilot (P1) |
| **NOVO:** Prompt files project-scoped (`.github/prompts/ksdd-*.prompt.md`) | nova superfície versionável no repo (opt-in `--project`) | repo-alvo | modelo project nativo do Copilot (P1) |
| **NOVO:** Placeholder Copilot CLI (`~/.copilot/prompts/`) | superfície pronta pra quando o CLI suportar | global `~/.copilot/` | antecipar copilot-cli#618/#1113 (P1) |
| **NOVO:** Bundle Copilot (`<vscode-user>/ksdd/`) | references/agents/README/INSTALL/AGENTS bundlados | n/a | contexto canônico ao agente Copilot |

### Telas Novas

Não aplicável (CLI). Equivalente: **arquivo novo `references/copilot-AGENTS.md`** distribuído com o pacote, copiado para `<vscode-user>/ksdd/AGENTS.md` e usado como base do `ksdd.chatmode.md`. Conteúdo (~30-40 linhas): orienta o Copilot a usar `./references/` e `./agents/` como contexto canônico e a respeitar os checkpoints obrigatórios (espelha `references/opencode-AGENTS.md` / `antigravity-AGENTS.md`, adaptado ao frontmatter de chat mode do Copilot).

---

## 6. Impacto no Modelo de Dados

### 6.1 Novas Entidades

| Entidade | Atributos críticos | Relações |
|----------|--------------------|----------|
| `targets.copilot` (array de paths em `.ksdd-manifest.json`) | strings — paths absolutos de arquivos instalados (prompt files + chat mode + bundle + CLI/project quando presentes) | irmão de `targets.claude`/`codex`/`opencode`/`antigravity` (SPEC seção 4.1, architecture seção 3.1) |
| `references/copilot-AGENTS.md` (novo arquivo no pacote) | Markdown ~30-40 linhas, com frontmatter de chat mode do Copilot | copiado pra `<vscode-user>/ksdd/AGENTS.md` e base do `ksdd.chatmode.md` |

### 6.2 Alterações em Entidades Existentes

| Entidade (architecture seção 3.1) | Alteração | Migração |
|---|---|---|
| `.ksdd-manifest.json` schema | adiciona `targets.copilot: string[]` | `normalizeManifest()` cria array vazio se ausente — sem migração manual |
| `references/` (diretório no pacote) | adiciona `copilot-AGENTS.md` | nenhuma — arquivo novo |

Sem mudança nos artefatos gerados no projeto-alvo. Esta feature mexe **apenas na distribuição do pacote KSDD**.

---

## 7. Impacto na API

Não aplicável (sem servidor HTTP). Equivalente: **superfície CLI do `bin/ksdd.js`** (architecture seção 4).

### 7.1 Novas "rotas" CLI

```
ksdd install --copilot                                   # Claude + Copilot (perfil global)
ksdd install --copilot --project                         # Claude + Copilot em .github/ do repo
ksdd install --codex --opencode --antigravity --copilot  # os 5 targets
ksdd install --copilot --quiet                           # idem, silenciado
```

Env vars novas (architecture seção 4.2):
- `KSDD_WITH_COPILOT=1` — equivale a `--copilot` no postinstall
- `COPILOT_HOME` — override do diretório `Code/User` do VS Code (default OS-específico)

### 7.2 "Endpoints" modificados

| Função interna (architecture seção 4.3) | Alteração |
|---|---|
| `parseArgs(argv)` | reconhece flags `--copilot` e `--project` |
| `main()` | dispara `installCopilot()` quando flag ou env presentes |
| `installClaude()` / `installCodex()` / `installOpencode()` / `installAntigravity()` | **inalteradas** |
| **NOVA:** `installCopilot(tracked, out)` | adaptada de `installAntigravity` — resolve path por SO, copia `ksdd-*.prompt.md`, gera chat mode, bundla references/agents, placeholder CLI, modo `--project` |
| **NOVA:** `resolveVscodeUserDir()` | resolve o `Code/User` por SO com override `COPILOT_HOME` |
| `agentPromptBasename(file)` | **reuso** — só muda o sufixo (`.prompt.md`) via adaptação fina |
| `normalizeManifest(m)` | reconhece manifest sem `targets.copilot` e cria array vazio |
| `uninstall()` (em `main()`) | itera os 5 arrays de targets |
| `status()` | imprime linha de `targets.copilot` |
| `pruneEmptyDirs(root)` | **inalterada** — chamadas adicionais pros paths Copilot (nunca acima de `prompts/`/`ksdd/`) |

---

## 8. Impacto no Design

Não aplicável (CLI sem UI). Impacto em **tom da saída CLI** (SPEC seção 3):

- Nova string verde em sucesso: "✓ KSDD instalado em Claude Code, ..., e GitHub Copilot (N arquivos)."
- Nova string em `ksdd status`: linha `copilot: N arquivos em <vscode-user>/`
- Nova string em `ksdd help`: doc de `--copilot`, `--project`, `KSDD_WITH_COPILOT`, `COPILOT_HOME` + nota sobre o CLI ainda não consumir comandos custom
- Cores ANSI seguem convenção existente (SPEC seção 3.2), respeita `NO_COLOR`.

---

## 9. Dependências e Riscos

### 9.1 Dependências

| Tipo | Dependência | Status | Impacto se bloqueada |
|------|-------------|--------|----------------------|
| Técnica | Prompt file (`*.prompt.md`) no `User/prompts/` do VS Code vira `/nome` no Copilot Chat | Confirmado (docs VS Code / GitHub Docs) | Alto — feature inteira assume isso |
| Técnica | Path de perfil por SO (`Code/User/prompts/`) | Confirmado por docs; exato por SO `[verificar no dogfood]` | Alto — se divergir, retrabalho de path |
| Técnica | VS Code sincroniza user prompt files via Settings Sync | Confirmado | Baixo — benefício, não bloqueio |
| Técnica | Chat mode (`*.chatmode.md`) suportado pelo Copilot | Confirmado (docs VS Code) | Médio — se mudar, chat mode vira P2 |
| Técnica | Copilot CLI **não** consome comandos custom hoje | Confirmado (copilot-cli#618/#1113) | Baixo — superfície CLI é placeholder inócuo |
| Técnica | `COPILOT_HOME` override cobre Insiders/portátil | Decisão KSDD-side | Baixo — escape hatch |
| Negócio | Mantenedor concorda com bump v0.10.0 e com ADR-012 (adiar refator de novo) | Decidido no checkpoint (hardcoded + 4 superfícies + Alta/minor) | Baixo |
| Feature | Reuso de `agentPromptBasename()` (entregue na feature opencode) | Disponível em `bin/ksdd.js` | Baixo |

### 9.2 Riscos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Path de perfil por SO diferente do assumido (macOS/Windows/Insiders) | Alto | Média | `resolveVscodeUserDir()` por SO + `COPILOT_HOME` override; dogfood/QA confirma cada SO antes do release |
| `pruneEmptyDirs` apagar `<vscode-user>/` compartilhado com toda a config do VS Code | Alto | Média | Restringir pruning estritamente a `<vscode-user>/prompts/` (só se vazio), `<vscode-user>/ksdd/`, `~/.copilot/prompts/`, `.github/prompts|chatmodes/` — nunca subir |
| Deletar prompt files não-KSDD do usuário no uninstall | Alto | Baixa | Uninstall só remove paths rastreados no manifest; nunca `rm` do diretório inteiro `prompts/` |
| Quinta cópia hardcoded (`installAntigravity`→`installCopilot`) aumenta dívida técnica | Médio | Alta (esperada) | ADR-012 reforça gatilho firme: refator `installTarget` inescapável antes do 6º target |
| Commands KSDD assumem comportamentos Claude-específicos (`view`/`create_file`, `ask_user_input_v0`) que o Copilot não tem | Médio | Média | Validar no dogfood; se algum command precisar adaptação, escopo cresce — risco aceito (igual aos targets anteriores) |
| Copilot muda convenção de prompt files / diretório antes do release wide | Médio | Baixa-Média | Documentar versão suportada no README; `COPILOT_HOME` override |
| Quatro superfícies dobram a superfície de QA e risco de divergência | Médio | Média | Núcleo P0 (prompt files global) valida a feature; chat mode/CLI/project são P1 com QA incremental |
| Modo `--project` grava em repo do usuário (efeito colateral fora de `~/`) | Médio | Média | Só com flag explícita `--project`; mensagem clara sobre onde gravou; nunca no default |
| Placeholder CLI cria arquivos que o CLI ignora e confundem o usuário | Baixo | Média | Documentar como "pronto pra quando o CLI suportar" (link para issues); P1, removível se atrapalhar |
| Windows: `%APPDATA%\Code\User` e separadores divergem | Médio | Média | Usar `path.join`/`os` sempre; `[verificar]` no QA; `COPILOT_HOME` override |
| Colisão de nome com prompt file builtin/existente | Baixo | Baixa | Prefixo `ksdd-` evita colisão (estratégia validada nos 4 targets anteriores) |

---

## 10. Critérios de Aceite

- [ ] `ksdd install --copilot` instala 9 arquivos `ksdd-*.prompt.md` em `<vscode-user>/prompts/` (path resolvido por SO) + `ksdd.chatmode.md` + bundle em `<vscode-user>/ksdd/{references,agents,README.md,INSTALL.md,AGENTS.md}` sem warnings em macOS/Linux (Node ≥ 16).
- [ ] `resolveVscodeUserDir()` retorna o path correto por SO (macOS `~/Library/Application Support/Code/User`, Linux `~/.config/Code/User`, Windows `%APPDATA%\Code\User`) e respeita `COPILOT_HOME`.
- [ ] `ksdd install --copilot --project` instala em `<cwd>/.github/prompts/` (9 arquivos) + `<cwd>/.github/chatmodes/ksdd.chatmode.md`, sem tocar o perfil global.
- [ ] `ksdd install --codex --opencode --antigravity --copilot` instala os 5 targets de uma vez; manifest contém os 5 arrays preenchidos com paths absolutos.
- [ ] `KSDD_WITH_COPILOT=1 npm install -g .` (postinstall) instala Claude + Copilot com warning yellow em caso de falha (não quebra `npm install`).
- [ ] `ksdd install` (sem flags) **não** modifica prompt files KSDD do Copilot se já estavam instalados (preservação testada).
- [ ] `ksdd uninstall` remove todos os arquivos rastreados de `targets.copilot` sem deletar prompt files não-KSDD nem qualquer outra config do `User/` do VS Code.
- [ ] `ksdd uninstall` em modo fallback (sem manifest) remove paths Copilot por convenção (com resolução por SO), com warning amarelo.
- [ ] `ksdd status` imprime linha `copilot: N arquivos em <vscode-user>/` quando `targets.copilot` é não-vazio, e omite quando vazio.
- [ ] `ksdd help` documenta `--copilot`, `--project`, `KSDD_WITH_COPILOT` e `COPILOT_HOME`, incluindo a nota sobre o Copilot CLI ainda não consumir comandos custom.
- [ ] Reinstalação (`ksdd install --copilot` 2x seguidas) é idempotente — manifest igual, sem arquivos duplicados.
- [ ] `normalizeManifest()` lê manifest antigo sem `targets.copilot` e cria array vazio sem erro.
- [ ] `COPILOT_HOME=/tmp/fake-vscode ksdd install --copilot` instala sob `/tmp/fake-vscode/{prompts,ksdd}` (override respeitado).
- [ ] Placeholder CLI: `~/.copilot/prompts/ksdd-*.prompt.md` (9) criados e rastreados; documentados como inertes até suporte upstream.
- [ ] Manifest schema versionado com `version: "0.10.0"`.
- [ ] `package.json` bumped para `0.10.0`.
- [ ] `CHANGELOG.md` documenta a nova feature em seção dedicada com data, link pro Copilot/prompt files e exemplo de uso.
- [ ] `README.md` lista 5 agentes suportados (Claude, Codex, opencode, Antigravity, Copilot) na tabela principal e no quick start, com nota sobre CLI vs VS Code.
- [ ] `INSTALL.md` (no pacote) lista os paths de Copilot por SO e explica o bundle, o modo `--project` e o placeholder CLI.
- [ ] `architecture.md` ganha ADR-012 explícito (5ª cópia + gatilho reforçado do refator) e atualiza ADR-011 com nota de continuidade.
- [ ] `architecture.md` seção 1 (diagrama), seção 12 (roadmap Fase 5) e seção 11 (riscos) atualizadas pra incluir Copilot.
- [ ] `SPEC.md` seções 4.1 (manifest), 7 (nova subseção de superfície Copilot), 7.1 (comandos CLI), 11 (comportamentos) e 13 (fluxos) referenciam `--copilot`/`--project` e o fluxo correspondente.
- [ ] `references/copilot-AGENTS.md` existe no pacote com ~30-40 linhas + frontmatter de chat mode, explicando contexto ao Copilot.
- [ ] Dogfood: mantenedor instala `ksdd install --copilot` em ambiente com VS Code + Copilot, invoca `/ksdd-start` no Copilot Chat em projeto-teste, e confirma fluxo de perguntas + geração de `brainstorm.md` com saída equivalente a Claude/opencode (smoke test ≥ 1 command de geração). Path de perfil por SO confirmado.
- [ ] QA cross-platform: install/uninstall validados em macOS e Linux. Windows marcado `[verificar]` se não validado.

---

## 11. Fases de Implementação

### Fase 1 — Núcleo do instalador (P0)

- [ ] Criar `references/copilot-AGENTS.md` (template + base da chat mode) — destrava o núcleo
- [ ] Adicionar `installCopilot()` + `resolveVscodeUserDir()` em `bin/ksdd.js` (adaptação de `installAntigravity`, com sufixo `.prompt.md` e resolução de path por SO) — prompt files user-profile + bundle
- [ ] Adicionar flag `--copilot` e env vars `KSDD_WITH_COPILOT` / `COPILOT_HOME` em `parseArgs`/`main()`
- [ ] Estender `normalizeManifest()`, `uninstall()`, `status()`, `pruneEmptyDirs` para `targets.copilot`

### Fase 2 — Superfícies adicionais (P1)

- [ ] Chat mode global (`ksdd.chatmode.md`) + placeholder Copilot CLI (`~/.copilot/prompts/`)
- [ ] Modo project-scoped `--project` (`.github/prompts/` + `.github/chatmodes/`)

### Fase 3 — Docs e arquitetura (P0)

- [ ] Atualizar `README.md`, `INSTALL.md`, `CHANGELOG.md`, `package.json` (0.10.0)
- [ ] Adicionar ADR-012 em `architecture.md`, atualizar ADR-011, diagrama, roadmap Fase 5 e riscos
- [ ] Atualizar `SPEC.md` seções 4.1, 7, 7.1, 11 e 13 (referência a Copilot)

### Fase 4 — Dogfood + QA (P0)

- [ ] Dogfood + QA smoke test em macOS e Linux; confirmar path de perfil por SO; `/ksdd-start` no Copilot Chat; `QA-REPORT.md`

---

**Referências:**
- `.ksdd/specs/SPEC.md` — seções 4.1 (manifest), 7 / 7.1 (superfícies + comandos CLI), 11 (comportamentos), 13 (fluxos), 14 (fases — Fase 5 multi-agent)
- `.ksdd/specs/architecture.md` — seções 1 (visão/diagrama), 3.1 (manifest schema), 4 (CLI), 10 (ADRs — adiciona ADR-012, atualiza ADR-011), 11 (riscos), 12 (roadmap — Fase 5)
- `.ksdd/features/FEATURE-antigravity-integration.md` — precedente direto (quarto target); estrutura de tasks, bump de versão, padrão de `installX`/manifest/AGENTS.md
- `.ksdd/features/FEATURE-opencode-integration.md` — precedente (terceiro target); origem de `agentPromptBasename()`
- Docs externas: https://code.visualstudio.com/docs/agent-customization/prompt-files · https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files · https://github.com/github/copilot-cli/issues/618 · https://github.com/github/copilot-cli/issues/1113
