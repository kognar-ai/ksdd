# Feature: Integração com opencode (terceiro target após Claude Code e Codex)

> Suporte ao agente open-source [opencode](https://opencode.ai) como terceiro target de instalação do KSDD — `ksdd install --opencode` distribui os 9 slash commands em `~/.config/opencode/commands/ksdd-*.md` e o bundle de references/agents em `~/.config/opencode/ksdd/`, mantendo o pacote zero-deps e o manifest unificado.

**Slug:** opencode-integration
**Prioridade:** Alta
**Status:** Rascunho
**Data:** 26/05/2026
**Projeto:** KSDD — Kognar Spec-Driven Design & Development

---

## 1. Motivação

### 1.1 Problema / Oportunidade

A Fase 5 do roadmap (SPEC seção 14, architecture seção 12) é "Multi-agent: suporte a Cursor, Windsurf, Cline". Entre o lançamento da v0.4.0 (Codex, 13/05/2026) e hoje, o agente [opencode](https://opencode.ai) cresceu como alternativa open-source a Claude Code/Codex — mesmo formato de slash commands em Markdown, paths convencionais (`~/.config/opencode/commands/` global, `.opencode/commands/` por projeto), e adoção crescente em quem não quer ficar preso a Anthropic/OpenAI. Hoje quem usa opencode tem que copiar manualmente os arquivos do repo KSDD para a pasta certa — atrito real que invalida a promessa de "instale uma vez, use em qualquer agente".

Três dores concretas, paralelas às que motivaram o suporte a Codex em v0.4.0:

1. **Pacote KSDD é multi-agent só na narrativa.** README diz "Claude Code e Codex" — usuário de opencode não aparece. Adicionar opencode com paridade total (mesmos 9 commands, mesmos templates) honra o posicionamento do projeto de "agente-agnóstico, conteúdo distribuído".
2. **Custo de manutenção do refator vs custo de oportunidade.** O roadmap promete um `installTarget(targetConfig)` genérico antes dos 3 próximos (Cursor/Windsurf/Cline), mas refatorar agora trava o release de opencode em semanas. Tratar opencode como **terceira cópia hardcoded** (mesma abordagem do Codex) entrega valor já e força a próxima feature multi-agent a fazer o refator (ADR explícito documenta esta decisão).
3. **Validação de hipótese de adoção multi-agent.** Antes de investir em Cursor/Windsurf/Cline (3 targets de uma vez), opencode é um teste barato: se o suporte a um terceiro agente atrai issues/PRs/usuários, justifica o refator genérico; se não, evita gold-plating prematuro.

O `git log` de v0.4.0 (commit do Codex) mostra que a cópia hardcoded levou ~250 linhas em `bin/ksdd.js` — escopo previsível, sem cirurgia arquitetural.

### 1.2 Personas Impactadas

- **Marina (Product Designer / PM solo) — SPEC seção 2.1:** ganha opcionalidade — se está testando opencode como alternativa a Claude Code (custo, privacidade, modelo local), o fluxo KSDD continua funcionando sem precisar manter cópias paralelas dos artefatos. Onboarding em projeto novo (`/ksdd:start`) idêntico em qualquer agente.
- **Rafa (Founder técnico solo) — SPEC seção 2.2:** o pitch "spec-driven sem SaaS, sem lock-in" agora cobre o agente que ele provavelmente vai escolher se quiser self-host completo. Reduz fricção pra adoção em founders avessos a Anthropic/OpenAI.
- **Lia (Tech lead em agência) — SPEC seção 2.3:** clientes que exigem stack open-source (governo, saúde, jurídico) frequentemente vetam Claude Code/Codex por questão de compliance ou contrato. Suporte a opencode destrava esses clientes sem mudar o entregável (mesmos 4 artefatos Markdown).

### 1.3 Métricas de Sucesso

| Métrica | Meta | Prazo |
|---------|------|-------|
| `ksdd install --opencode` instala todos os 9 commands + bundle sem warnings (em macOS, Linux, Windows com Node ≥ 16) | 100% | imediato pós-release |
| Manifest pós-install contém `targets.opencode` com paths absolutos corretos | 100% | imediato |
| `ksdd uninstall` remove todos os arquivos rastreados em `~/.config/opencode/` e `~/.config/opencode/ksdd/` (sem deixar lixo, sem deletar arquivos não-KSDD) | 100% | imediato |
| `ksdd status` exibe linha "opencode: N arquivos" quando há instalação ativa | 100% | imediato |
| Slash commands invocáveis em opencode via `/ksdd-start`, `/ksdd-new-feature`, etc., com mesma saída funcional que em Claude Code | 9/9 commands | imediato |
| README declara "Suporta Claude Code, OpenAI Codex e opencode" e tabela de paths está atualizada | confirmado | imediato |
| Issues abertas no GitHub sobre "uso de opencode" em 3 meses pós-release | ≥ 3 (sinal de adoção) | 3 meses |

---

## 2. Escopo

### 2.1 O que entra (v1)

- **Nova flag `--opencode`** em `ksdd install`. Combinável com `--codex` (ex: `ksdd install --codex --opencode` instala os 3 targets de uma vez).
- **Nova env var `KSDD_WITH_OPENCODE=1`** equivalente à flag, lida pelo postinstall (espelha `KSDD_WITH_CODEX`).
- **Nova env var `OPENCODE_HOME`** para override do diretório base (default `~/.config/opencode`). Espelha `CODEX_HOME`.
- **Nova função `installOpencode(tracked, out)`** em `bin/ksdd.js`, escrita como cópia adaptada de `installCodex` (ADR-010 documenta a decisão de não refatorar para `installTarget` genérico nesta entrega).
- **Layout de instalação opencode:**
  ```
  ~/.config/opencode/
  ├── commands/
  │   ├── ksdd-start.md
  │   ├── ksdd-spec.md
  │   ├── ksdd-tech.md
  │   ├── ksdd-design.md
  │   ├── ksdd-new-feature.md
  │   ├── ksdd-build-feature.md
  │   ├── ksdd-build-all.md
  │   ├── ksdd-setup.md
  │   └── ksdd-archive.md
  └── ksdd/                          # bundle auxiliar (não-padrão opencode, convencional)
      ├── references/                # cópia de references/ do pacote
      ├── agents/                    # cópia de agents/ do pacote
      ├── README.md                  # do pacote
      ├── INSTALL.md                 # do pacote
      └── AGENTS.md                  # NOVO — explica ao agente onde achar references/agents
  ```
- **Naming de commands:** reusa o helper `codexPromptBasename()` existente em `bin/ksdd.js` (renomeia `:` → `-`) — generalizado e renomeado para `agentPromptBasename()` ou mantido como está com comentário (decisão tática na task). Comandos ficam invocáveis como `/ksdd-start`, `/ksdd-new-feature`, etc.
- **`AGENTS.md` no bundle (`~/.config/opencode/ksdd/AGENTS.md`)** — arquivo novo, curto (~30 linhas), que orienta o agente opencode sobre:
  - Onde estão os templates canônicos (`./references/`)
  - Onde estão os agents auxiliares (`./agents/`)
  - Que os commands em `~/.config/opencode/commands/ksdd-*.md` esperam encontrar esses arquivos via include `@-relativo` ou referência textual
  - Convenção de aprovação obrigatória nos checkpoints (espelha `codex-SKILL.md` mas adaptado para o estilo de opencode)
- **Manifest com `targets.opencode`:**
  ```json
  {
    "version": "0.8.0",
    "installedAt": "ISO-8601",
    "pkgRoot": "/path/do/pacote",
    "targets": {
      "claude": [...],
      "codex":  [...],
      "opencode": [...]   // NOVO — array de paths absolutos
    }
  }
  ```
  `normalizeManifest()` atualizado para tratar manifest legado sem `targets.opencode` (cria array vazio).
- **`ksdd uninstall`** estendido: remove tudo em `targets.opencode`, faz `pruneEmptyDirs()` em `~/.config/opencode/commands/` e `~/.config/opencode/ksdd/`. Fallback por convenção (sem manifest) tenta remover paths conhecidos.
- **`ksdd status`** exibe nova linha `opencode: N arquivos em ~/.config/opencode/` quando `targets.opencode` é não-vazio.
- **`ksdd install` sem `--opencode` preserva instalação opencode anterior** — não deleta `~/.config/opencode/commands/ksdd-*` nem `~/.config/opencode/ksdd/`. Só atualiza Claude (ou Claude+Codex se `--codex`). Espelha o comportamento já documentado em SPEC seção 11 para Codex.
- **README + INSTALL + CHANGELOG atualizados:**
  - Tabela de targets passa a ter 3 colunas (Claude, Codex, opencode) com paths
  - Seção "Instalação seletiva" lista `--opencode` como flag válida
  - Exemplo de `KSDD_WITH_OPENCODE=1 npm install -g @kognar/ksdd`
  - CHANGELOG documenta nova versão (suficiente bumpar pra v0.8.0 — bump minor por nova capacidade backwards-compatible)
- **`package.json` bump** para `0.8.0`.
- **Dogfood:** após release local, o próprio mantenedor roda `ksdd install --opencode` num projeto-teste com opencode instalado e valida que pelo menos `/ksdd-start` e `/ksdd-spec` rodam ponta-a-ponta.
- **ADR-010 em `architecture.md`:** registra "Terceiro target hardcoded; última cópia-cola antes do refator `installTarget` genérico previsto na Fase 5 multi-agent (Cursor/Windsurf/Cline)".

### 2.2 O que fica pra depois

- **Refator `installTarget(targetConfig)` genérico** — fica para a próxima feature multi-agent (quando entrarem 2+ targets de uma vez: Cursor, Windsurf, Cline). Tentar refatorar agora dobra escopo desta feature sem ganho proporcional. ADR-010 explicita esta dívida.
- **Suporte a `.opencode/commands/` project-level** — opencode permite commands escopados por projeto. KSDD por enquanto só instala global; uso project-level pode vir como `ksdd install --opencode --project` em feature futura.
- **Frontmatter de command com `agent:` direcionado** (recurso opencode-específico que permite rotear um comando para subagente específico) — os 9 commands KSDD funcionam sem isso; otimização opcional para o futuro.
- **`agent:` por command que aproveita os agents bundlados** (`interviewer`, `consolidator`, `critic`) como subagentes nativos opencode — feature exploratória pós-v1, depende de validar o ergonomic dos subagentes opencode.
- **Suporte a Cursor, Windsurf, Cline** — Fase 5 do roadmap original; opencode é o primeiro entregável dessa fase, os outros 3 ficam para entregas separadas com refator genérico.
- **Validador automático que verifica se opencode está instalado antes de copiar** — opencode pode não estar instalado no sistema; v1 cria os diretórios mesmo assim (idempotente, baixo custo). Detecção pode vir depois.
- **`ksdd doctor`** que valida instalação cross-agent — nice-to-have, fora de escopo.
- **Telemetria de qual target é mais usado** — viola "sem telemetria" do SPEC seção 12. Fora de escopo permanente.

### 2.3 O que NÃO é essa feature

- **Não é refator do instalador.** Cópia adaptada de `installCodex` é proposital — código duplicado é aceito sob ADR-010 com prazo de "próxima feature multi-agent".
- **Não é mudança nos commands em si.** Os 9 arquivos em `commands/*.md` permanecem idênticos; só a distribuição muda. Se um command precisa adaptação opencode-específica, é tarefa separada (e provavelmente sinal que o command está acoplado demais a Claude).
- **Não é mudança nos templates em `references/`.** Templates são agent-agnósticos; reuso direto.
- **Não é suporte para opencode local-only (sem `~/.config/opencode/`).** Se o usuário tem opencode configurado com paths customizados além de `OPENCODE_HOME`, é responsabilidade dele apontar `OPENCODE_HOME`.
- **Não é setup automático do opencode no sistema.** KSDD não instala opencode; assume que o usuário já tem.

---

## 3. User Stories

| # | Como... | Quero... | Para... |
|---|---------|----------|---------|
| US-01 | Marina (PM solo testando opencode) | rodar `npm install -g @kognar/ksdd && ksdd install --opencode` | ter os 9 commands KSDD disponíveis em opencode sem copiar arquivo manualmente |
| US-02 | Rafa (founder valorizando self-host) | `KSDD_WITH_OPENCODE=1 npm install -g @kognar/ksdd` no setup do laptop | postinstall já configurar tudo automaticamente sem comando extra |
| US-03 | Lia (tech lead com mix de clientes) | `ksdd install --codex --opencode` num único comando | atender clientes que usam Codex e outros que exigem opencode sem reinstalar |
| US-04 | qualquer mantenedor | `ksdd status` mostrar quais targets estão ativos | saber rapidamente o estado da instalação sem inspecionar 3 diretórios |
| US-05 | qualquer usuário | `ksdd uninstall` remover tudo de uma vez | desinstalação completa sem deixar arquivos órfãos em `~/.config/opencode/` |
| US-06 | usuário opencode | invocar `/ksdd-start` no opencode com a mesma experiência que em Claude (`/ksdd:start`) ou Codex (`/prompts:ksdd-start`) | não ter que aprender fluxos diferentes por agente |
| US-07 | usuário que já tinha KSDD (Claude+Codex) instalado | rodar `ksdd install --opencode` sem flag `--codex` | adicionar opencode sem perder Codex instalado anteriormente |
| US-08 | contribuidor lendo `bin/ksdd.js` | ver ADR-010 claro no architecture.md sobre a duplicação intencional | entender por que `installOpencode` é cópia de `installCodex` e quando refatorar |

---

## 4. Fluxos de Uso

### 4.1 Instalação fresca incluindo opencode (cenário primário)

**Pré-condição:** Usuário tem Node ≥ 16 e opencode instalado (`opencode --version` retorna versão).
**Trigger:** `npm install -g @kognar/ksdd` com `KSDD_WITH_OPENCODE=1` definido, ou `ksdd install --opencode` após instalação básica.

1. `parseArgs` detecta `--opencode` (ou postinstall lê `KSDD_WITH_OPENCODE=1`)
2. `installClaude(tracked)` roda primeiro (sempre — paridade com fluxo atual)
3. Se `--codex` também: `installCodex(tracked)` roda
4. `installOpencode(tracked)` roda:
   - `ensureDir(~/.config/opencode/commands/)`
   - Para cada arquivo em `commands/*.md`: copia para `~/.config/opencode/commands/ksdd-<basename>.md` (via `agentPromptBasename()`), adiciona path absoluto ao `tracked`
   - `ensureDir(~/.config/opencode/ksdd/)`
   - `copyDir(references/, ~/.config/opencode/ksdd/references/, tracked)`
   - `copyDir(agents/, ~/.config/opencode/ksdd/agents/, tracked)`
   - `copyFile(README.md, ~/.config/opencode/ksdd/README.md, tracked)`
   - `copyFile(INSTALL.md, ~/.config/opencode/ksdd/INSTALL.md, tracked)`
   - Gera `~/.config/opencode/ksdd/AGENTS.md` a partir de `references/opencode-AGENTS.md` (template novo)
5. `saveManifest({ targets: { claude, codex, opencode } })`
6. Saída em verde: "✓ KSDD instalado em Claude Code, Codex e opencode (N+M+K arquivos)."

**Sucesso:** Manifest tem 3 arrays preenchidos; `ls ~/.config/opencode/commands/ | grep ksdd` lista 9 arquivos.
**Erro / edge case:**
- Se `~/.config/opencode/` não existe (opencode não instalado): cria os diretórios mesmo assim (idempotente; commands ficam disponíveis quando opencode for instalado).
- Se erro de permissão em `~/.config/`: erro vermelho explícito, exit 1.
- Se postinstall: warning amarelo, exit 0 (não trava `npm install`).

### 4.2 Adicionar opencode em instalação existente (Claude+Codex)

**Pré-condição:** `ksdd status` mostra Claude e Codex instalados (manifest tem `targets.claude` e `targets.codex` preenchidos).
**Trigger:** Usuário roda `ksdd install --opencode` (sem `--codex`).

1. `loadManifest()` carrega manifest atual
2. `installClaude()` re-roda (idempotente — remove arquivos antigos via manifest, reinstala)
3. `installCodex()` **não roda** (sem flag `--codex`)
4. `installOpencode()` roda
5. `saveManifest()` preserva `targets.codex` intocado, atualiza `targets.claude` e adiciona `targets.opencode`
6. Saída: "✓ KSDD atualizado: Claude (N), Codex (M, preservado), opencode (K, novo)"

**Sucesso:** `~/.codex/prompts/ksdd-*.md` continuam intactos; `~/.config/opencode/commands/ksdd-*.md` aparecem novos.
**Erro / edge case:** Se manifest tem `targets.codex` mas os arquivos não existem mais (alguém deletou manualmente), preserva apenas o que está rastreado — não tenta "ressuscitar".

### 4.3 Uninstall completo cross-agent

**Pré-condição:** Manifest existe com `targets.claude`, `targets.codex`, `targets.opencode` preenchidos.
**Trigger:** `ksdd uninstall`.

1. `loadManifest()` carrega manifest
2. Para cada path em `targets.claude` + `targets.codex` + `targets.opencode`: `removePath(p)`
3. `pruneEmptyDirs(~/.claude/skills/ksdd/)`, `pruneEmptyDirs(~/.agents/skills/ksdd/)`, `pruneEmptyDirs(~/.config/opencode/ksdd/)`
4. Apaga o próprio manifest (`~/.claude/skills/ksdd/.ksdd-manifest.json`)
5. Saída: "✓ KSDD removido: N arquivos em Claude, M em Codex, K em opencode."

**Sucesso:** Nenhum arquivo KSDD em ~/.claude, ~/.codex, ~/.agents, ~/.config/opencode. Outros arquivos preservados.
**Erro / edge case:** Se manifest não existe, fallback por convenção tenta remover paths padrão de todos os 3 targets — warning amarelo "modo fallback".

### 4.4 Status com 3 targets ativos

**Trigger:** `ksdd status`.

Saída esperada:
```
KSDD 0.8.0 — instalado em 2026-05-26T14:32:11Z

claude:   23 arquivos em ~/.claude/
codex:    19 arquivos em ~/.codex/ + ~/.agents/skills/ksdd/
opencode: 21 arquivos em ~/.config/opencode/
```

---

## 5. Impacto em Telas Existentes

**Não aplicável** — KSDD não tem UI (SPEC seção 7). Substitui-se por **Impacto em Superfícies de Interação:**

| Superfície (SPEC seção 7) | O que muda | Onde | Por quê |
|---|---|---|---|
| `ksdd install` (CLI) | nova flag `--opencode`, combinável com `--codex` | `bin/ksdd.js` parseArgs + main | terceiro target precisa de opt-in explícito (paridade com Codex) |
| `ksdd uninstall` (CLI) | passa a iterar `targets.opencode` também | `bin/ksdd.js` uninstall | uninstall completo cross-agent |
| `ksdd status` (CLI) | nova linha "opencode: N arquivos em ..." | `bin/ksdd.js` status | visibilidade do terceiro target |
| `ksdd help` (CLI) | doc do `--opencode` e `KSDD_WITH_OPENCODE` | `bin/ksdd.js` help text | descoberta da flag |
| Slash commands Claude (`~/.claude/commands/ksdd:*.md`) | **inalterado** | n/a | content-only, agent-agnóstico |
| Custom prompts Codex (`~/.codex/prompts/ksdd-*.md`) | **inalterado** | n/a | mesma justificativa |
| **NOVO:** Slash commands opencode (`~/.config/opencode/commands/ksdd-*.md`) | nova superfície de invocação | global do opencode | feature inteira gira em torno disso |
| **NOVO:** Bundle opencode (`~/.config/opencode/ksdd/`) | references/agents/README/INSTALL/AGENTS bundlados | n/a | dar ao agente opencode contexto canônico |

### Telas Novas

Não aplicável (CLI). Equivalente: **arquivo novo `references/opencode-AGENTS.md`** distribuído com o pacote, copiado para `~/.config/opencode/ksdd/AGENTS.md` no install. Conteúdo (~30 linhas): orienta o agente opencode a usar `./references/` e `./agents/` como contexto canônico, e que os checkpoints obrigatórios devem ser respeitados (espelha `references/codex-SKILL.md`).

---

## 6. Impacto no Modelo de Dados

### 6.1 Novas Entidades

| Entidade | Atributos críticos | Relações |
|----------|--------------------|----------|
| `targets.opencode` (array de paths em `.ksdd-manifest.json`) | strings — paths absolutos de arquivos instalados em `~/.config/opencode/` | irmão de `targets.claude` e `targets.codex` (SPEC seção 4.1, architecture seção 3.1) |
| `references/opencode-AGENTS.md` (novo arquivo no pacote) | Markdown ~30 linhas, sem frontmatter especial | copiado pra `~/.config/opencode/ksdd/AGENTS.md` no install |

### 6.2 Alterações em Entidades Existentes

| Entidade (architecture seção 3.1) | Alteração | Migração |
|---|---|---|
| `.ksdd-manifest.json` schema | adiciona `targets.opencode: string[]` | `normalizeManifest()` cria array vazio se ausente — sem migração manual exigida |
| `references/` (diretório no pacote) | adiciona `opencode-AGENTS.md` | nenhuma — arquivo novo |

Sem mudança nos artefatos gerados no projeto-alvo (`brainstorm.md`, `SPEC.md`, etc.). Esta feature mexe **apenas na distribuição do pacote KSDD**, não no que o usuário gera com KSDD.

---

## 7. Impacto na API

Não aplicável (sem servidor HTTP). Equivalente: **superfície CLI do `bin/ksdd.js`** (architecture seção 4).

### 7.1 Novas "rotas" CLI

```
ksdd install --opencode                 # Claude + opencode
ksdd install --codex --opencode         # Claude + Codex + opencode
ksdd install --opencode --quiet         # idem, silenciado
```

Env vars novas (architecture seção 4.2):
- `KSDD_WITH_OPENCODE=1` — equivale a `--opencode` no postinstall
- `OPENCODE_HOME` — override de `~/.config/opencode` (default)

### 7.2 "Endpoints" modificados

| Função interna (architecture seção 4.3) | Alteração |
|---|---|
| `parseArgs(argv)` | reconhece flag `--opencode` |
| `main()` | dispara `installOpencode()` quando flag ou env presentes |
| `installClaude()` | **inalterada** |
| `installCodex()` | **inalterada** |
| **NOVA:** `installOpencode(tracked, out)` | adaptada de `installCodex` — copia commands com basename `ksdd-*`, bundla references/agents em `~/.config/opencode/ksdd/`, gera `AGENTS.md` |
| `codexPromptBasename(file)` | considerar renomear para `agentPromptBasename()` (compartilhado entre Codex e opencode) ou manter e duplicar — decisão tática na task |
| `normalizeManifest(m)` | reconhece manifest sem `targets.opencode` e cria array vazio |
| `uninstall()` (em `main()`) | itera os 3 arrays de targets |
| `status()` | imprime linha de `targets.opencode` |
| `pruneEmptyDirs(root)` | **inalterada** — chamada adicional pro path opencode |

---

## 8. Impacto no Design

Não aplicável (CLI sem UI). Impacto em **tom da saída CLI** (SPEC seção 3):

- Nova string verde em sucesso: "✓ KSDD instalado em Claude Code, Codex e opencode (N+M+K arquivos)."
- Nova string em `ksdd status`: linha `opencode: N arquivos em ~/.config/opencode/`
- Nova string em `ksdd help`: doc do `--opencode` e exemplo `KSDD_WITH_OPENCODE=1 npm install -g @kognar/ksdd`
- Cores ANSI seguem convenção existente (SPEC seção 3.2) — verde para sucesso, amarelo para warning (postinstall sem opencode instalado pode emitir warning informativo), respeita `NO_COLOR`.

---

## 9. Dependências e Riscos

### 9.1 Dependências

| Tipo | Dependência | Status | Impacto se bloqueada |
|------|-------------|--------|----------------------|
| Técnica | Convenção de paths opencode (`~/.config/opencode/commands/` global) | Confirmado via docs oficiais (https://opencode.ai/docs/commands/) | Alto — se mudar antes do release, retrabalho de paths |
| Técnica | Naming de command sem `:` (filename `kebab-case` → `/kebab-case`) | Confirmado nas docs | Alto — feature inteira assume isso |
| Técnica | opencode aceita commands Markdown puros (sem frontmatter mandatório) | Confirmado — frontmatter opcional (`description`, `agent`, `model`, `subtask`) | Médio — KSDD commands já usam frontmatter compatível |
| Técnica | `OPENCODE_HOME` env var existe ou path é fixo em `~/.config/opencode/` | `[verificar]` — nas docs não foi explícito, assumir fixo + criar nossa env var de override KSDD-side | Baixo — fallback aceitável |
| Negócio | Mantenedor concorda com bump pra v0.8.0 (vs v0.7.1 patch) | Pendente — decidir no checkpoint | Baixo — patch também funciona |
| Feature | Nenhuma feature KSDD pré-requisito | n/a | n/a |

### 9.2 Riscos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| opencode muda convenção de paths antes de release wide | Alto | Baixa | Documentar versão suportada em README; `OPENCODE_HOME` permite override |
| Commands KSDD assumem comportamentos Claude-específicos (ex: `view`/`create_file` como tools, `ask_user_input_v0`) que opencode não tem | Médio | Média | Validar no dogfood (task QA); se algum command precisar adaptação, escopo cresce — fica como risco aceito |
| `agent:` no frontmatter (sintaxe opencode) entra em conflito com convenções KSDD futuras | Baixo | Baixa | KSDD não usa `agent:` em frontmatter dos commands atualmente — campo livre |
| Duplicação `installCodex`/`installOpencode` aumenta dívida técnica | Médio | Alta (esperada) | ADR-010 documenta a dívida com prazo (próxima feature multi-agent obrigatoriamente refatora) |
| Usuário que não tem opencode instalado roda `--opencode` e fica confuso | Baixo | Média | Criar diretórios mesmo assim (idempotente); README explica que arquivos viram úteis ao instalar opencode depois |
| `pruneEmptyDirs` em `~/.config/opencode/` pode apagar diretório pai compartilhado com outros tools | Médio | Baixa | Restringir pruning a `~/.config/opencode/ksdd/` e `~/.config/opencode/commands/` — nunca subir além |
| Windows: `~/.config/opencode/` não é a convenção (AppData) | Médio | Média | `[verificar]` — confirmar no dogfood; possível mitigação: detectar Windows e usar `%APPDATA%\opencode\` se a opencode windows fizer isso |
| Conflito com algum command opencode-builtin com mesmo nome (ex: `/start`) | Baixo | Baixa | Prefixo `ksdd-` evita colisão (mesma estratégia já validada com Codex) |
| Refator `agentPromptBasename` (renomear de `codexPromptBasename`) quebra alguma referência | Baixo | Baixa | Grep em todo o repo antes; preferir manter o nome antigo + alias se houver dúvida |

---

## 10. Critérios de Aceite

- [ ] `ksdd install --opencode` instala 9 commands em `~/.config/opencode/commands/ksdd-*.md` + bundle em `~/.config/opencode/ksdd/{references,agents,README.md,INSTALL.md,AGENTS.md}` sem warnings em macOS, Linux (Node ≥ 16).
- [ ] `ksdd install --codex --opencode` instala os 3 targets de uma vez (Claude + Codex + opencode); manifest contém os 3 arrays preenchidos com paths absolutos.
- [ ] `KSDD_WITH_OPENCODE=1 npm install -g .` (postinstall) instala Claude + opencode com warning yellow em caso de falha (não quebra `npm install`).
- [ ] `KSDD_WITH_CODEX=1 KSDD_WITH_OPENCODE=1 npm install -g .` instala os 3 targets.
- [ ] `ksdd install` (sem flags) **não** modifica `~/.codex/` nem `~/.config/opencode/` se já estavam instalados antes (preservação testada).
- [ ] `ksdd uninstall` remove todos os arquivos rastreados nos 3 targets sem deixar lixo em `~/.config/opencode/`; outros arquivos não-KSDD no diretório `commands/` (se houver) são preservados.
- [ ] `ksdd uninstall` em modo fallback (sem manifest) remove paths opencode por convenção também, com warning amarelo.
- [ ] `ksdd status` imprime linha `opencode: N arquivos em ~/.config/opencode/` quando `targets.opencode` é não-vazio, e omite a linha quando vazio.
- [ ] `ksdd help` documenta `--opencode`, `KSDD_WITH_OPENCODE`, e `OPENCODE_HOME`.
- [ ] Reinstalação (`ksdd install --opencode` rodado 2x seguidas) é idempotente — manifest tem mesmo conteúdo, nenhum arquivo duplicado.
- [ ] `normalizeManifest()` lê manifest antigo sem `targets.opencode` e cria array vazio sem erro.
- [ ] Manifest schema versionado com `version: "0.8.0"`.
- [ ] `package.json` bumped para `0.8.0`.
- [ ] `CHANGELOG.md` documenta a nova feature em seção dedicada com data, link pra docs de opencode, e exemplo de uso.
- [ ] `README.md` lista 3 agentes suportados (Claude, Codex, opencode) na tabela principal e no quick start.
- [ ] `INSTALL.md` (no pacote) lista paths de opencode e explica o bundle em `~/.config/opencode/ksdd/`.
- [ ] `architecture.md` ganha ADR-010 explícito sobre cópia hardcoded vs refator `installTarget`.
- [ ] `architecture.md` seção 1 (diagrama) e seção 2 atualizadas pra mostrar opencode como terceiro target.
- [ ] `SPEC.md` seções 7.1 (comandos CLI) e 13 (fluxos) referenciam `--opencode` e o fluxo correspondente.
- [ ] `references/opencode-AGENTS.md` existe no pacote e tem ~20-40 linhas explicando contexto a agente opencode.
- [ ] Dogfood: mantenedor instala opencode local, roda `ksdd install --opencode`, invoca `/ksdd-start` em projeto-teste, e confirma que o fluxo de perguntas + geração de brainstorm.md funciona com saída funcional equivalente a Claude/Codex (smoke test ≥ 1 command de geração).
- [ ] QA cross-platform: install/uninstall validados em macOS e Linux. Windows marcado como `[verificar]` se não validado.

---

## 11. Fases de Implementação

### Fase 1 — Núcleo do instalador (P0)

- [ ] Adicionar `installOpencode()` em `bin/ksdd.js` (adaptação de `installCodex`)
- [ ] Adicionar flag `--opencode` em `parseArgs` e `main()`
- [ ] Adicionar env vars `KSDD_WITH_OPENCODE` e `OPENCODE_HOME`
- [ ] Estender `normalizeManifest()` para `targets.opencode`
- [ ] Estender uninstall e status para `targets.opencode`
- [ ] Criar `references/opencode-AGENTS.md` (template novo)
- [ ] Bundle de references/agents/README/INSTALL pra `~/.config/opencode/ksdd/`

### Fase 2 — Docs e dogfood (P0)

- [ ] Atualizar `README.md`, `INSTALL.md`, `CHANGELOG.md`, `package.json`
- [ ] Adicionar ADR-010 em `architecture.md` e atualizar diagrama
- [ ] Atualizar SPEC.md seções 7.1 e 13 (referência a opencode)
- [ ] Dogfood + QA smoke test em macOS e Linux

### Fase 3 — Polish (P1, opcional pré-release)

- [ ] Renomear `codexPromptBasename` → `agentPromptBasename` (refator pequeno)
- [ ] Validar comportamento em Windows (ou marcar como `[verificar]`)

---

**Referências:**
- `.ksdd/specs/SPEC.md` — seções 4.1 (manifest), 7.1 (comandos CLI), 13 (fluxos), 14 (fases — esta feature inicia a Fase 5 multi-agent)
- `.ksdd/specs/architecture.md` — seções 1 (visão), 2.2 (stack CLI), 3.1 (manifest schema), 4 (CLI), 10 (ADRs — adiciona ADR-010), 11 (riscos), 12 (roadmap — Fase 5)
- `.ksdd/features/FEATURE-archive-features.md` — precedente recente de feature que mexeu em `bin/ksdd.js` e templates; estrutura de tasks e bump de versão
- `.ksdd/archive/raw/ksdd-folder-layout/FEATURE-ksdd-folder-layout.md` — precedente de feature anterior (já arquivada) com escopo cross-cutting
- Docs externas: https://opencode.ai/docs/commands/ (paths e formato), https://opencode.ai/docs/agents/ (agents)
