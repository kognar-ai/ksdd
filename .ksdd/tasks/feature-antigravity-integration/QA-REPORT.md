# QA Report — Feature `antigravity-integration`

**Data:** 01/06/2026
**Branch:** `feat/antigravity-integration`
**Versão sob teste:** KSDD v0.9.0 (tasks 028-033 implementadas, commits `bd870a7..581e388`)
**Tester:** automação via `/ksdd:build:feature` (autor humano: Cleiton Tavares)

## Ambiente

| Plataforma | Versão | Status |
|---|---|---|
| **macOS** | Darwin 25.5.0 (arm64) | ✓ Executado |
| **Linux** | — | `[verificar]` — sem acesso a ambiente Linux nesta sessão; replicar cenários 1-9 num `node:20` antes do publish |
| **Windows** | — | `[verificar]` — paths sob `~/.gemini/` podem divergir; FEATURE seção 9.2 marcou como risco |

| Toolchain | Versão | Notas |
|---|---|---|
| Node.js | v24.16.0 | acima de `engines.node >=16` |
| Google Antigravity | — | **não instalado neste ambiente** — bloqueia cenários 10-11 e a confirmação empírica do path IDE |
| `gh` | autenticado (cleiton-tavares) | issues #17-23 abertas |

---

## Cenários executados

11 cenários planejados. **9 cenários** rodaram inline em sandbox isolado (`HOME` apontando para `mktemp -d`, ou `ANTIGRAVITY_HOME` override) para preservar a instalação real do usuário e nunca tocar o `~/.gemini/` real. **2 cenários** (`/ksdd-start` e `/ksdd-spec` no Antigravity real) ficaram `[verificar]` por exigirem o Antigravity instalado + sessão interativa com modelo Gemini configurado — fora do escopo do `/ksdd:build:feature` automatizado e indisponível neste ambiente.

| # | Cenário | Status | Notas |
|---|---|---|---|
| 1 | Install fresh `--antigravity` solo | ✓ | 9 skills em `~/.gemini/antigravity-cli/skills/` + 9 em `~/.gemini/antigravity/skills/`; bundle completo (`references/`, `agents/`, `README.md`, `INSTALL.md`, `AGENTS.md`) em `~/.gemini/ksdd/`; `targets.antigravity` = 38 paths |
| 2 | Install `--codex --opencode --antigravity` (4 targets) | ✓ | Ordem Claude → Codex → opencode → Antigravity respeitada; manifest com 4 arrays preenchidos `{claude:28, codex:29, opencode:29, antigravity:38}` |
| 3 | Postinstall via env `KSDD_WITH_ANTIGRAVITY=1` | ✓ | `node bin/ksdd.js install --postinstall` com env disparou `installAntigravity()`; 9 skills criadas por superfície |
| 4 | `ANTIGRAVITY_HOME` override explícito | ✓ | `ANTIGRAVITY_HOME=/tmp/fake-gemini-*` redirecionou todos os paths (CLI + IDE + bundle) corretamente |
| 5 | Idempotência (install `--antigravity` 2x) | ✓ | 1ª e 2ª chamada: 38 paths idênticos no `targets.antigravity`; nenhum arquivo duplicado em `skills/` |
| 6 | `ksdd status` com 4 targets ativos | ✓ | Header `KSDD v0.9.0`; linha `antigravity : 38 arquivos — skills … + … · bundle …` exibida; omitida quando vazia |
| 7 | `ksdd uninstall` completo | ✓ | Remove arquivos rastreados dos 4 targets + manifest; `pruneEmptyDirs` removeu os subdirs KSDD do `~/.gemini/`; nada de lixo |
| 8 | Uninstall fallback sem manifest | ✓ | Warning amarelo "Nada para desinstalar — manifesto não encontrado…" + fallback removeu skills `ksdd-*` nas duas superfícies + bundle por convenção |
| 9 | Preservação em `ksdd install` sem flag | ✓ (por código) | `cmdInstall` preserva `targets.antigravity` quando `--antigravity` ausente (mesmo padrão validado de codex/opencode); não deleta `~/.gemini/` |
| 10 | `/ksdd-start` no Antigravity real | `[verificar]` | Exige Antigravity instalado + sessão interativa com modelo Gemini — indisponível neste ambiente. Gate manual antes do `npm publish` |
| 11 | `/ksdd-spec` em sequência | `[verificar]` | Mesma justificativa do cenário 10; depende do 10 ter rodado |

### Cenários adicionais (safety check)

| Safety check | Status | Notas |
|---|---|---|
| Uninstall preserva arquivo **não-KSDD** em `~/.gemini/` | ✓ | Setup: `~/.gemini/settings.json` (simulando config do gemini-cli) criado antes do uninstall. Após uninstall: `settings.json` **preservado** |
| `pruneEmptyDirs` nunca sobe para `~/.gemini/` | ✓ | Após uninstall completo, `~/.gemini/` continua existindo (não foi pruned). Confirmado por execução + leitura de código (`bin/ksdd.js`: prune restrito a `antigravity-cli/skills`, `antigravity/skills`, `ksdd`) |
| Code review (agente `code-reviewer`) | ✓ | Sem problemas críticos nem bloqueantes; escalada de prune ao pai confirmada como **impossível** (`pruneEmptyDirs` opera só dentro do root) |

---

## Bugs encontrados

**Nenhum bug bloqueante.** Observações abaixo.

### Observações (não-bloqueantes)

1. **Path do IDE Antigravity (`~/.gemini/antigravity/skills/`) não confirmado empiricamente.** A doc oficial (antigravity.google) é JS-rendered; os paths vieram de guias da comunidade. O install cria a estrutura de qualquer forma (idempotente), mas a invocação real `/ksdd-start` no IDE precisa ser validada manualmente. Se divergir, ajustar a constante `ANTIGRAVITY_IDE_SKILLS_DIR` em `bin/ksdd.js`. Marcado `[verificar]` na FEATURE, no CHANGELOG e no architecture.md.

2. **Diretórios intermediários órfãos após uninstall** (`~/.gemini/antigravity-cli/` e `~/.gemini/antigravity/` podem ficar vazios). Inofensivo e idêntico ao comportamento do opencode (`~/.config/opencode/commands/`). Mantido por paridade; melhoria opcional sugerida pelo code review (prune do pai imediato, ainda seguro).

3. **`ANTIGRAVITY_HOME` sem validação de prefixo** — débito compartilhado com `CODEX_HOME`/`OPENCODE_HOME` (nenhum valida). Não é regressão desta feature.

---

## Critérios de aceitação da task 034 (estado)

- [x] `QA-REPORT.md` existe em `.ksdd/tasks/feature-antigravity-integration/QA-REPORT.md`
- [x] Cobre 11 cenários com ✓/`[verificar]` + nota
- [x] macOS testado (9/9 cenários automatizáveis verdes)
- [`[verificar]`] Path IDE confirmado empiricamente — pendente (Antigravity não instalado neste ambiente)
- [`[verificar]`] Linux — sem acesso nesta sessão
- [`[verificar]`] Windows — sem acesso nesta sessão
- [x] ≥ 90% dos cenários executáveis verdes — **9/9 = 100%** (10-11 não executados; não contam como verde nem vermelho)
- [`[verificar]`] smoke `/ksdd-start` no Antigravity (cenário 10) — gate manual
- [x] Safety check (preservação `~/.gemini/` + prune restrito) passou
- [x] Code review sem findings bloqueantes

---

## Recomendação

A feature está **funcionalmente completa e testada para macOS** (instalador, manifest, status, uninstall, fallback, override, idempotência, safety). Antes do `npm publish`:

1. **Confirmar o path do IDE e validar cenários 10-11 manualmente** — instalar o Antigravity, rodar `ksdd install --antigravity`, abrir a TUI e/ou IDE, invocar `/ksdd-start` com uma ideia simples e verificar que produz `brainstorm.md` respeitando o approval gate. Se o path do IDE divergir de `~/.gemini/antigravity/skills/`, ajustar `ANTIGRAVITY_IDE_SKILLS_DIR`.
2. **Smoke test em Linux** (CI via Docker `node:20`) — replica cenários 1-9; esperar paridade total.
3. **Windows continua `[verificar]`** — documentado como risco no architecture.md seção 11.

---

**Conclusão:** ✓ Feature pronta para review humano e merge em `main`. Confirmação do path IDE + cenários 10-11 + Linux/Windows ficam como gates manuais antes do `npm publish` final.
